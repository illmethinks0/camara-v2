# ADR-0003: Result/Railway Pattern Policy

**Status**: PROPOSED  
**Date**: 2026-02-08  
**Deciders**: Agent  

---

## Context

Need a consistent error handling strategy that:
- Prevents exceptions from crossing module boundaries
- Makes error handling explicit and type-safe
- Enables retries for transient failures
- Provides context for debugging

---

## Decision

### Mandatory Railway Pattern

All functions that cross boundaries MUST return a Result type:

```typescript
type Result<T, E = Error> = 
  | { ok: true; data: T }
  | { ok: false; error: E; recoverability: 'retryable' | 'terminal' };
```

### Boundary Definition

A "boundary" is any crossing between:
- HTTP layer ↔ Business logic
- Business logic ↔ Database
- Business logic ↔ External APIs
- Business logic ↔ Job queue
- Any module ↔ Any other module

### Implementation Rules

1. **Never throw across boundaries**
   ```typescript
   // ❌ WRONG
   function getUser(id: string): Promise<User> {
     if (!id) throw new Error('Invalid ID');
     return db.user.findUnique({ where: { id } });
   }

   // ✅ CORRECT
   function getUser(id: string): Promise<Result<User, ValidationError>> {
     if (!id) {
       return err({ code: 'INVALID_ID', message: 'ID is required' }, 'terminal');
     }
     // ... database call wrapped in try/catch returning Result
   }
   ```

2. **Always handle both cases**
   ```typescript
   const result = await getUser('123');
   
   if (isOk(result)) {
     // Use result.data
   } else {
     // Handle result.error
     // Check result.recoverability for retry logic
   }
   ```

3. **Use recoverability for retry decisions**
   - `'retryable'`: Network errors, timeouts, 5xx responses
   - `'terminal'`: Validation errors, 4xx responses, business logic errors

4. **Include context in errors**
   ```typescript
   return err({
     code: 'DB_CONNECTION_FAILED',
     message: 'Could not connect to database',
     context: { host: dbHost, retryCount: 3 }
   }, 'retryable');
   ```

### Error Type Structure

```typescript
interface Error {
  code: string;                    // Machine-readable error code
  message: string;                 // Human-readable message
  context?: Record<string, unknown>; // Additional debugging info
}
```

### Error Code Convention

Format: `{LAYER}_{REASON}`

Examples:
- `DB_CONNECTION_FAILED`
- `DB_RECORD_NOT_FOUND`
- `API_VALIDATION_ERROR`
- `API_UNAUTHORIZED`
- `EXTERNAL_TIMEOUT`
- `BUSINESS_RULE_VIOLATION`

### Adapter Pattern

Framework-specific code MUST be wrapped in adapters:

```typescript
// packages/backend/src/adapters/http.ts
export async function handleRequest<T>(
  handler: () => Promise<T>
): Promise<Result<T, HttpError>> {
  try {
    const data = await handler();
    return ok(data);
  } catch (e) {
    if (e instanceof ValidationError) {
      return err({ code: 'VALIDATION_ERROR', message: e.message }, 'terminal');
    }
    return err({ code: 'INTERNAL_ERROR', message: 'Internal server error' }, 'retryable');
  }
}
```

---

## Consequences

### Positive
- Explicit error handling
- Type-safe error propagation
- No hidden exceptions
- Retry logic is data-driven
- Easy to test error paths

### Negative
- More verbose code
- Learning curve for team
- Must wrap all external libraries

---

## Enforcement

1. **Static Analysis**: ESLint rule to ban throwing across boundaries
2. **Code Review**: Check all new functions return Result
3. **Tests**: Must include error case tests
4. **Gates**: Contract tests verify error responses match spec

---

## Compliance

This decision affects:
- `docs/spec_v1.md` - Railway Reference Implementation
- All adapter code in `packages/backend/src/adapters/`
- All service/business logic code
- Error handling in `packages/frontend/`

---

*PROPOSED: Awaiting approval to proceed*
