# Specification v1.0

**Status**: DRAFT  
**Version**: 1.0.0  
**Last Updated**: 2026-02-08  

---

## Domain Model

### Core Entities

```
User
  ├── id: UUID (PK)
  ├── email: String (unique)
  ├── name: String
  ├── role: Enum [user, admin]
  ├── createdAt: DateTime
  └── updatedAt: DateTime

Task
  ├── id: UUID (PK)
  ├── title: String
  ├── description: String
  ├── status: Enum [pending, in_progress, done, blocked]
  ├── priority: Int [0-3]
  ├── assigneeId: UUID (FK)
  ├── parentId: UUID (FK, self-reference)
  ├── tags: String[]
  ├── deliverables: String[]
  ├── evals: String[]
  ├── lane: Enum [frontend, backend, data, auth, qa, devops]
  ├── risk: Enum [low, med, high]
  ├── diffEstimate: Enum [very_small, small, medium, large]
  ├── createdAt: DateTime
  └── updatedAt: DateTime
```

### Data Classification

| Entity | Classification | Retention | Notes |
|--------|---------------|-----------|-------|
| User | PII | 7 years | GDPR compliant |
| Task | Internal | 3 years | Soft delete |
| Audit Log | Security | 1 year | Immutable |

---

## Railway Reference Implementation

### Result Type Definition

```typescript
// packages/contracts/src/result.ts

export type Result<T, E = Error> = 
  | { ok: true; data: T }
  | { ok: false; error: E; recoverability: 'retryable' | 'terminal' };

export interface Error {
  code: string;
  message: string;
  context?: Record<string, unknown>;
}

// Helper functions
export const ok = <T>(data: T): Result<T> => ({ ok: true, data });
export const err = <E>(error: E, recoverability: 'retryable' | 'terminal' = 'terminal'): Result<never, E> => 
  ({ ok: false, error, recoverability });

// Type guards
export const isOk = <T, E>(result: Result<T, E>): result is { ok: true; data: T } => result.ok;
export const isErr = <T, E>(result: Result<T, E>): result is { ok: false; error: E; recoverability: string } => !result.ok;
```

### Usage Pattern

```typescript
// All functions that cross boundaries MUST return Result

async function fetchUser(id: string): Promise<Result<User, DatabaseError>> {
  try {
    const user = await db.user.findUnique({ where: { id } });
    if (!user) {
      return err({ code: 'USER_NOT_FOUND', message: `User ${id} not found` }, 'terminal');
    }
    return ok(user);
  } catch (e) {
    return err({ code: 'DB_ERROR', message: 'Database connection failed', context: { original: e } }, 'retryable');
  }
}

// Callers must handle both cases
const result = await fetchUser('123');
if (isOk(result)) {
  console.log(result.data.name);
} else {
  if (result.recoverability === 'retryable') {
    // Retry logic
  } else {
    // Terminal error - propagate or handle
  }
}
```

---

## Boundary Inventory

### HTTP/API Boundary

**Adapter**: `packages/backend/src/adapters/http.ts`

All HTTP handlers wrap framework exceptions and map to Result:

```typescript
export const httpBoundary = {
  async handle<T>(handler: () => Promise<T>): Promise<Result<T, HttpError>> {
    try {
      const data = await handler();
      return ok(data);
    } catch (e) {
      if (e instanceof ValidationError) {
        return err({ code: 'VALIDATION_ERROR', message: e.message }, 'terminal');
      }
      if (e instanceof AuthenticationError) {
        return err({ code: 'AUTH_ERROR', message: 'Unauthorized' }, 'terminal');
      }
      return err({ code: 'INTERNAL_ERROR', message: 'Internal server error' }, 'retryable');
    }
  }
};
```

### Database Boundary

**Adapter**: `packages/backend/src/adapters/db.ts`

All database operations return Result:

```typescript
export const dbBoundary = {
  async query<T>(operation: () => Promise<T>): Promise<Result<T, DatabaseError>> {
    try {
      const data = await operation();
      return ok(data);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        return err({ code: e.code, message: e.message }, 'retryable');
      }
      return err({ code: 'DB_UNKNOWN', message: 'Unknown database error' }, 'retryable');
    }
  }
};
```

### Job Queue Boundary

**Adapter**: `packages/backend/src/adapters/jobs.ts`

All job operations return Result:

```typescript
export const jobsBoundary = {
  async enqueue<T>(job: Job<T>): Promise<Result<JobId, JobError>> {
    try {
      const id = await queue.add(job);
      return ok(id);
    } catch (e) {
      return err({ code: 'JOB_ENQUEUE_FAILED', message: 'Failed to enqueue job' }, 'retryable');
    }
  }
};
```

### External API Boundary

**Adapter**: `packages/backend/src/adapters/external.ts`

All external API calls return Result:

```typescript
export const externalBoundary = {
  async call<T>(request: () => Promise<T>): Promise<Result<T, ExternalError>> {
    try {
      const data = await request();
      return ok(data);
    } catch (e) {
      if (axios.isAxiosError(e) && e.response) {
        return err({ 
          code: `EXTERNAL_${e.response.status}`, 
          message: e.response.statusText 
        }, e.response.status >= 500 ? 'retryable' : 'terminal');
      }
      return err({ code: 'EXTERNAL_NETWORK', message: 'Network error' }, 'retryable');
    }
  }
};
```

---

## Prohibited Patterns

### ❌ Never Do This

```typescript
// Throwing across boundaries
async function getUser(id: string): Promise<User> {
  const user = await db.user.findUnique({ where: { id } });
  if (!user) throw new Error('Not found'); // ❌ Never throw
  return user;
}

// Ad-hoc error shapes
return { error: 'something went wrong' }; // ❌ Must use Result type

// Swallowing errors
try {
  await riskyOperation();
} catch (e) {
  // ❌ Never swallow without logging or returning error
}
```

### ✅ Always Do This

```typescript
// Return Result for all boundary crossings
async function getUser(id: string): Promise<Result<User, NotFoundError>> {
  const user = await db.user.findUnique({ where: { id } });
  if (!user) {
    return err({ code: 'NOT_FOUND', message: 'User not found' }, 'terminal');
  }
  return ok(user);
}

// Use consistent Result shape
return err({ code: 'VALIDATION_FAILED', message: 'Invalid input' }, 'terminal');

// Handle all error cases
const result = await riskyOperation();
if (isErr(result)) {
  logger.error({ error: result.error }, 'Operation failed');
  return result; // Propagate
}
```

---

## API Surface

All API endpoints are defined in contracts:

- **OpenAPI Spec**: `packages/contracts/api/openapi.yaml`
- **TypeScript Types**: `packages/contracts/src/types.ts`
- **Validation Schemas**: `packages/contracts/src/schemas.ts`

Changes to any contract file MUST be accompanied by:
1. Updated contract tests
2. Updated spec_v1.md API surface section
3. Changelog entry

---

## Contract References

| Contract | Location | Tests |
|----------|----------|-------|
| User API | `packages/contracts/api/user.yaml` | `packages/contracts/test/user.test.ts` |
| Task API | `packages/contracts/api/task.yaml` | `packages/contracts/test/task.test.ts` |
| Result Type | `packages/contracts/src/result.ts` | `packages/contracts/test/result.test.ts` |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2026-02-08 | Initial specification | Agent |

---

*This document is authoritative. All implementation must conform to this specification.*
