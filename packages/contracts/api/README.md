# Placeholder for API contracts

## Structure

```
packages/contracts/api/
├── openapi.yaml        # Root OpenAPI spec
├── paths/
│   ├── users.yaml      # User endpoints
│   ├── tasks.yaml      # Task endpoints
│   └── auth.yaml       # Auth endpoints
└── schemas/
    ├── user.yaml       # User schemas
    ├── task.yaml       # Task schemas
    └── common.yaml     # Shared schemas
```

## Usage

1. Define contracts in YAML files
2. Run `npm run generate:types` to create TypeScript types
3. Import types from `packages/contracts/src/types.ts`
4. Implement validation using Zod schemas

## Contract Drift Prevention

Gates will fail if:
- OpenAPI files change without type regeneration
- Zod schemas don't match OpenAPI
- No corresponding tests

See `docs/adrs/0002-contract-format.md` for details.
