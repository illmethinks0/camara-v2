# Inputs Pack

**Status**: APPROVED  
**Created**: 2026-02-08  
**Risk Tier**: prototype  
**Approval Mode**: interactive  

---

## App Summary

**Project**: CAMARA v2 - Production-ready full-stack application development framework  
**Target Users**: AI coding agents, software developers, DevOps engineers  
**Purpose**: A turnkey specification + execution framework enabling deterministic, high-quality application development with automated verification and Railway pattern architecture.

---

## Risk Tier

**Selected**: `prototype`

Tier implications:
- **Diff Limit**: 800 LOC maximum per change
- **LKGC Streak**: 1 consecutive green gate run required
- **Gate Suites**: format, lint, typecheck, unit tests, build, smoke test
- **Approval Requirements**: Lockfile/schema changes require approval

---

## Approval Mode

**Selected**: `interactive`

The agent MUST PAUSE and wait for explicit "APPROVED" command before:
1. Writing any application code
2. Making schema changes
3. Adding dependencies
4. Performing destructive operations

---

## Open Questions

### Blockers (Must resolve before implementation)

| ID | Question | Resolution | Status |
|----|----------|------------|--------|
| B1 | What is the primary programming language/stack? | TypeScript/Node.js/Fastify - See ADR-0001 | ✅ RESOLVED |
| B2 | What database should be used? | PostgreSQL via Prisma - See ADR-0001 | ✅ RESOLVED |
| B3 | Frontend framework preference? | React with Next.js - See ADR-0001 | ✅ RESOLVED |

### Important (Should resolve soon)

| ID | Question | Priority |
|----|----------|----------|
| I1 | Authentication requirements? | High |
| I2 | Deployment target platform? | High |
| I3 | Real-time features needed? | Medium |

### Nice-to-have (Can defer)

| ID | Question | Priority |
|----|----------|----------|
| N1 | Mobile app requirements? | Low |
| N2 | Third-party integrations? | Low |

---

## Assumptions

| ID | Assumption | Risk Level | Rollback/Escape Hatch |
|----|-----------|------------|----------------------|
| A1 | Project uses npm/yarn package manager | Low | Can migrate to pnpm |
| A2 | Git repository already initialized | Low | Initialize if needed |
| A3 | Node.js 18+ available | Low | Update .nvmrc |
| A4 | PostgreSQL available locally for dev | Medium | Use SQLite fallback for prototype |
| A5 | bd CLI not available (using fallback mode) | Medium | Use docs/task_graph.jsonl |

---

## Stack Constraints

### Required
- TypeScript 5.0+
- Railway pattern (Result<T,E> everywhere)
- Contract-first API design
- Automated verification via gates.sh

### Forbidden
- Throwing exceptions across boundaries
- Ad-hoc error shapes (must use Result)
- Schema changes without migration + approval
- Dependencies without approval

### Preferred
- Zod for runtime validation
- Prisma for database access
- Vitest for testing
- OpenAPI for API contracts

---

## Non-negotiables

1. **Spec-first**: No code until spec passes Ambiguity Gate
2. **Eval-first**: Every behavior has tests before implementation
3. **Railway boundaries**: All boundaries return Result, never throw
4. **Ratchet quality**: LKGC never regresses
5. **Approval required**: Dependencies, schema changes, destructive ops

---

## Tier Defaults

| Metric | Prototype | Production | Regulated |
|--------|-----------|------------|-----------|
| Diff Limit | 800 LOC | 400 LOC | 200 LOC |
| LKGC Streak | 1 | 2 | 3 |
| Required Gates | format, lint, type, unit, build | +integration | +e2e, security |
| Migration Verify | basic | rollback test | irreversible ADR |
| Approval | interactive | interactive | dual approval |

**Override Policy**: Changes to defaults require waiver in docs/waivers/

---

## Next Steps

1. Resolve Blocker B1-B3 (stack selection)
2. Create docs/spec_v1.md with Railway implementation
3. Initialize task graph (fallback mode)
4. Create M0/M1 task frontier
5. **PAUSE**: Wait for APPROVED before implementation

---

## Approval Record

| Date | Approver | Decision | Notes |
|------|----------|----------|-------|
| 2026-02-08 | User | APPROVED | Proceed with implementation per ADRs |

---

## Next Steps

1. ✅ Resolve Blocker B1-B3 (stack selection)
2. ✅ Create docs/spec_v1.md with Railway implementation
3. ✅ Initialize task graph (bd active)
4. ✅ Create M0/M1 task frontier
5. ✅ **APPROVED**: Begin M1 implementation (core domain)

---

*This file is authoritative. Updates require version bump and changelog entry.*
