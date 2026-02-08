# Evaluation Plan

**Status**: DRAFT  
**Version**: 1.0.0  

---

## Static Checks

### Format
```bash
npm run format:check
```
Enforces consistent code style using Prettier.

### Lint
```bash
npm run lint
```
Enforces code quality rules using ESLint.

### Type Check
```bash
npm run typecheck
```
Verifies TypeScript types across all packages.

---

## Test Suites

### Unit Tests
```bash
npm run test:unit
```
- Runs Vitest on all `*.test.ts` files
- Coverage threshold: 80%
- Must pass before integration

### Integration Tests
```bash
npm run test:integration
```
- Tests database layer with test database
- Tests API endpoints with supertest
- Tests job queue operations

### Contract Tests
```bash
npm run test:contracts
```
**Critical**: Verifies server satisfies contracts and client compatibility.

```typescript
// Example contract test
import { userApi } from '../src/api';
import { expect } from 'vitest';

test('GET /users/:id satisfies contract', async () => {
  const response = await request(app).get('/users/123');
  const validation = userApi.getById.response.validate(response.body);
  expect(validation.success).toBe(true);
});
```

### E2E Smoke Tests
```bash
npm run test:e2e
```
Tier-dependent:
- **Prototype**: Health check endpoint only
- **Production**: Critical user flows
- **Regulated**: Full regression suite

---

## Safety Checks

### Secrets Scan
```bash
npm run security:secrets
```
Uses `detect-secrets` or `truffleHog` to prevent credential leaks.

### Dependency Audit
```bash
npm audit
```
Fails on critical vulnerabilities.

---

## Migration Verification

### Clean DB Test
```bash
npm run db:migrate:fresh
npm run test:integration
```
Verifies migrations work on clean database.

### Seeded DB Test
```bash
npm run db:seed
npm run test:integration
```
Verifies migrations work with seeded data.

### Rollback Test (Production+)
```bash
npm run db:migrate:rollback
npm run test:integration
npm run db:migrate
```
Verifies rollback strategy works.

---

## Observability Verification

### Required Log Fields
All log entries MUST include:
- `timestamp`: ISO 8601
- `level`: error, warn, info, debug
- `service`: service name
- `traceId`: correlation ID
- `message`: human-readable

### Error Capture Stub
```typescript
// packages/backend/src/observability/errorCapture.ts
export const errorCapture = {
  capture(error: Error, context?: Record<string, unknown>) {
    logger.error({
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack,
      },
      context,
      timestamp: new Date().toISOString(),
    });
  }
};
```

Verify with:
```bash
npm run test:observability
```

---

## Drift Rules

Gates MUST FAIL if:

1. **Contract Drift**: Contracts changed without matching tests + spec/changelog updates
2. **Spec Drift**: Implementation doesn't match spec_v1.md
3. **Approval Missing**: Lockfile or schema changed without approvals.md entry
4. **Diff Size**: Changed LOC exceeds tier threshold (prototype: 800, production: 400, regulated: 200)
5. **LKGC Regression**: Tests fail after previously passing

---

## Evidence Collection

Each gate run writes to `evidence/iteration-XXXX/`:

```
evidence/
  iteration-0001/
    timestamp: 2026-02-08T12:00:00Z
    commit: abc123
    gates.json
    failures.log
    coverage/
    diff-size.txt
    lkgc-eligible: true
    green-streak: 3
```

---

## Tier-Specific Requirements

### Prototype
- Format, lint, typecheck, unit tests
- Health check smoke test
- 800 LOC diff limit

### Production
- All prototype requirements
- Integration tests
- Contract tests
- Rollback verification
- 400 LOC diff limit
- 2 consecutive green runs for LKGC

### Regulated
- All production requirements
- E2E regression suite
- Security audit
- Dual approval for schema changes
- 200 LOC diff limit
- 3 consecutive green runs for LKGC
- Immutable audit logs

---

## Commands Reference

| Check | Command | Tier |
|-------|---------|------|
| Format | `npm run format:check` | All |
| Lint | `npm run lint` | All |
| Type Check | `npm run typecheck` | All |
| Unit Tests | `npm run test:unit` | All |
| Integration | `npm run test:integration` | Prod+ |
| Contracts | `npm run test:contracts` | Prod+ |
| E2E | `npm run test:e2e` | Regulated |
| Security | `npm run security:secrets` | Prod+ |
| Audit | `npm audit` | Prod+ |
| Migrations | `npm run db:migrate:fresh && npm run test:integration` | All |

---

*This evaluation plan is mandatory. All gates must pass before LKGC can be updated.*
