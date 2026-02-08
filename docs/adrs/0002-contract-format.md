# ADR-0002: Contract Format & Type Generation Policy

**Status**: PROPOSED  
**Date**: 2026-02-08  
**Deciders**: Agent  

---

## Context

Need to define how API contracts are specified and how types are generated from them. This ensures consistency between backend and frontend.

---

## Decision

### Contract Format: OpenAPI 3.1

**Rationale**:
- Industry standard
- Tooling ecosystem (Swagger UI, code generators)
- Human-readable YAML
- Version control friendly

### Type Generation: openapi-typescript

**Rationale**:
- Generates TypeScript from OpenAPI
- Maintains type safety
- CI-integrated
- No runtime overhead

### Contract Location

```
packages/contracts/
├── api/
│   ├── openapi.yaml          # Root spec
│   ├── paths/
│   │   ├── users.yaml
│   │   └── tasks.yaml
│   └── schemas/
│       ├── user.yaml
│       └── task.yaml
├── src/
│   ├── types.ts              # Generated types
│   ├── schemas.ts            # Zod schemas
│   └── result.ts             # Railway Result type
└── test/
    └── contract.test.ts      # Contract verification
```

### Type Generation Workflow

1. Edit OpenAPI YAML files
2. Run `npm run generate:types`
3. Types generated in `packages/contracts/src/types.ts`
4. Commit both YAML and generated types

### Runtime Validation: Zod

While OpenAPI defines the contract, Zod provides runtime validation:

```typescript
// packages/contracts/src/schemas.ts
import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(['user', 'admin']),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type User = z.infer<typeof UserSchema>;
```

### Contract Drift Prevention

Gates will fail if:
1. OpenAPI files change without corresponding type regeneration
2. TypeScript types don't match OpenAPI spec
3. Zod schemas don't match OpenAPI spec
4. No corresponding contract tests

---

## Consequences

### Positive
- Single source of truth (OpenAPI)
- Type safety across stack
- Automatic API documentation
- Easy client generation

### Negative
- Build step required for type generation
- Must maintain sync between YAML and Zod
- Learning curve for OpenAPI syntax

---

## Alternatives Considered

| Alternative | Rejected Because |
|-------------|------------------|
| GraphQL | Out of scope (non_goals.md) |
| tRPC | Less language agnostic |
| Protobuf | Overkill for REST API |
| Hand-written types | Prone to drift |

---

## Compliance

This decision affects:
- `packages/contracts/` structure
- `docs/evals.md` - contract tests
- CI pipeline - type generation step

---

*PROPOSED: Awaiting approval to proceed*
