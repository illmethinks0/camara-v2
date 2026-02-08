# Glossary

**Status**: ACTIVE  
**Version**: 1.0.0  

---

## Core Terms

### Boundary
A module or service boundary where data/control crosses between components. All boundaries in this project MUST use the Railway pattern (return Result<T,E>, never throw).

**Example**: HTTP handler boundary, database repository boundary, external API client boundary.

---

### Contract
A formal specification of interfaces between components. Contracts include:
- API schemas (OpenAPI)
- Data types (TypeScript)
- Validation rules (Zod)

**Location**: `packages/contracts/`

**Rule**: Contracts are immutable once published. Changes require versioning.

---

### Result / Railway
The error-handling pattern used throughout the project. All functions that cross boundaries return a Result type:

```typescript
type Result<T, E> = 
  | { ok: true; data: T }
  | { ok: false; error: E; recoverability: 'retryable' | 'terminal' };
```

**Railway metaphor**: Success path and error path are separate tracks that never merge.

---

### Bead Task
A unit of work tracked in the bd (beads) system. Each task has:
- Unique hash ID (e.g., `camarav2-a3f2dd`)
- Status: pending, in_progress, done, blocked
- Dependencies (blockers)
- Metadata: deliverables, evals, lane, risk, diff_estimate

---

### Gate
A checkpoint in the development pipeline that must pass before proceeding. Gates include:
- Static checks (format, lint, typecheck)
- Tests (unit, integration, contract, e2e)
- Safety checks (secrets, audit)
- Contract drift detection

**Entry point**: `scripts/gates.sh`

---

### LKGC (Last-Known-Green Commit)
The most recent commit where all gates passed consecutively. LKGC serves as a safe rollback point.

**Rules**:
- Never regresses (ratchet principle)
- Updated only after N consecutive green runs (tier-dependent)
- Tracked in `docs/status.md`

---

### Waiver
A documented exception to standard rules. Waivers are required for:
- Exceeding diff size limits
- Skipping certain gates
- Using unapproved dependencies

**Format**: `docs/waivers/WVR-XXXX.md`

---

### Approval
Formal authorization for restricted operations. Required for:
- New dependencies
- Schema changes
- Destructive operations

**Location**: `docs/approvals.md`

---

### Ready Frontier
The set of tasks that have no open blockers and are ready to be worked on.

**Command**: `bd ready` (or `docs/task_graph.jsonl` in fallback mode)

---

### Idempotency
The property of an operation that produces the same result whether executed once or multiple times.

**Required for**: All mutations, migrations, job handlers.

---

### Blast Radius
The scope of impact when a change causes failures. Minimizing blast radius is a design goal.

**Techniques**: Feature flags, canary deployments, database transactions.

---

### Vertical Slice
A complete feature that spans all layers of the stack (frontend, backend, database).

**Preferred over**: Horizontal layers (frontend team, backend team working separately).

---

## Process Terms

### Ambiguity Gate
The hard pause before implementation where the spec must be unambiguous. All checks A-E must pass before APPROVED.

**Location**: Section 1 of `docs/prompts/elite-software-architect.md`

---

### M0/M1/M2/M3
Milestone phases:
- **M0**: Foundation (spec, tooling, structure)
- **M1**: Core Domain (entities, basic CRUD)
- **M2**: Feature Complete
- **M3**: Polish (optimization, docs, release)

---

### ADR (Architecture Decision Record)
A document capturing significant architectural decisions, their context, and consequences.

**Location**: `docs/adrs/`

---

### Evidence Pack
The output of a gates.sh run, including test results, coverage, diff size, and LKGC eligibility.

**Location**: `evidence/iteration-XXXX/`

---

## Abbreviations

| Abbrev | Full | Usage |
|--------|------|-------|
| LKGC | Last-Known-Green Commit | Safe rollback point |
| ADR | Architecture Decision Record | Decision documentation |
| LOC | Lines of Code | Diff size measurement |
| CRUD | Create, Read, Update, Delete | Basic operations |
| API | Application Programming Interface | External contracts |
| DB | Database | PostgreSQL via Prisma |
| PII | Personally Identifiable Information | Data classification |
| GDPR | General Data Protection Regulation | Compliance |
| JWT | JSON Web Token | Authentication |
| E2E | End-to-End | Integration testing |

---

*This glossary is normative. Terms used in other documents refer to these definitions.*
