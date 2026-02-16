# CAMARA v2 Build Prompt (PRD-Validated, App-Heavy, Light-Beads)

You are building inside `/Volumes/dev/Projects/camarav2`.

## Mission
Deliver the intended **Cámara de Comercio Menorca training platform** to production-ready quality.
Do not continue task-manager drift. The app is the heavy work; beads is only for high-level tracking.

## Source Of Truth (Strict Priority)
1. `CAMARA TOOL PRD.md` (business intent and required demo workflow)
2. `TECH_SPEC.md` (technical targets and constraints)
3. `DEMO_GUIDE.md` (demo-critical flow and polish)
4. Existing code only when it aligns with the three docs above

If sources conflict:
- Follow PRD behavior first.
- Use existing repo architecture for implementation speed.
- Treat `TECH_SPEC.md` Next.js references as conceptual if they conflict with this repo’s actual stack.

## Required Product Behavior (Non-Negotiable)
- Roles: `administrator`, `instructor`, `participant`
- Registration fields: first name, last name, ID number, email, phone, assigned course
- Phase lifecycle: `diagnostic -> training -> completion`
- Annex flow: generate Annex 2/3/5, preview, download, batch export
- Signature flow: typed/drawn signature, timestamp, linked to participant + phase/annex
- Dashboards: role-specific views with clear status badges
- Instructor attendance tracking
- Strict role-based data isolation
- UI copy in Spanish (Spain)

## Technical Direction (Use Existing Repo)
- Frontend: React + Vite + TypeScript (`packages/frontend`)
- Backend: Fastify + TypeScript + Prisma (`packages/backend`)
- DB: PostgreSQL
- Validation: Zod
- Auth: JWT + refresh flow
- PDF generation: backend deterministic templates

Do not spend cycles on stack rewrites unless explicitly requested.

## Stage 0 - Spec Validation Gate (Mandatory, Before Build)
Create `docs/spec_validation_report.md` containing:
- Requirement-by-requirement PRD checklist
- Current implementation status per requirement (`done`, `partial`, `missing`)
- Gaps and risks
- Keep/archive/remove inventory
- Explicit `GO` or `NO-GO`

If `NO-GO`: stop and report blockers only.
If `GO`: proceed to cleanup gate.

## Stage 1 - Drift Cleanup Gate (Mandatory, Before Feature Slice 1)
Create `docs/drift_cleanup_report.md` containing:
- Keep list
- Remove/archive list
- Rationale per item
- Verification commands and outputs summary

At minimum, remove/archive conflicting task-manager artifacts:
- `packages/backend/src/routes/tasks.ts`
- `packages/backend/src/services/task.ts`
- `packages/frontend/src/pages/TaskList.tsx`
- `packages/frontend/src/pages/TaskForm.tsx`
- stale task-centric tests/docs/routes/types that conflict with PRD

Runtime routing requirements:
- Must not default to `/tasks`
- Must expose: `/`, `/login`, `/registro`, `/admin`, `/instructor`, `/participante`

Drift grep checks (must be clean in active runtime paths):
- `rg -n "/api/v1/tasks|TaskList|TaskForm|task management" packages/frontend/src packages/backend/src`

If cleanup fails, stop feature work and fix cleanup first.

## Stage 2 - Build Slices (App-Heavy Execution)
Implement in vertical slices:
1. Prisma schema + migrations + seed data (including demo accounts)
2. Auth + RBAC middleware + protected route handling
3. Registration persistence and participant lifecycle base
4. Annex generation (Annex 2/3/5), storage, preview, download
5. Signature capture + signature persistence + phase progression rules
6. Admin dashboard (global visibility, filters, batch actions)
7. Instructor dashboard (assigned participants only, attendance, progression actions)
8. Participant dashboard (own data only, annexes, signing flow)
9. Batch export + audit logging + polish + hardening

Each slice must ship end-to-end (DB -> API -> UI -> tests) before moving on.

## Data Model Requirements (Prisma)
Must include at least:
- `User`
- `Course`
- `Participant`
- `InstructorAssignment` (unique instructor+participant)
- `Phase`
- `Annex`
- `Signature`
- `AttendanceRecord`
- `AuditLog`

Add indexes for foreign keys and common dashboard filters.

## API Surface Requirements
- Auth: `register`, `login`, `refresh`, `logout`, `me`
- Courses: list
- Participants: create/list/get/update
- Phases: get/progress with controlled transitions and admin override
- Annexes: generate/list/get/download/batch-export
- Signatures: create/list by annex
- Attendance: create/list
- Dashboards: admin/instructor/participant aggregates
- Infra: health + API docs

All protected endpoints require auth + role authorization and data scoping checks.

## Frontend Requirements
Required routes:
- `/`
- `/login`
- `/registro`
- `/admin`
- `/instructor`
- `/participante`

UI expectations:
- Spanish labels/messages/errors
- clear status badges (phase, annex, signature)
- polished but simple institutional visual style
- mobile-responsive for participant/instructor use

## Annex/Signature Detail Requirements
Annex content must look realistic and complete for demo:
- Annex 2 (diagnostic context)
- Annex 3 (training progress + attendance)
- Annex 5 (completion certificate)

Signatures:
- typed or drawn
- timestamped
- visible on annex
- update annex/dashboard status immediately

## Quality Gates (Must Pass Before Claiming Ready)
- `npm run typecheck`
- `npm run build`
- backend test suite
- frontend test suite
- integration tests for RBAC + phase + annex/signature flows
- contract/openapi checks
- smoke test of full happy path

If a gate script is broken, fix the gate first.

## Beads Usage (Mandatory But Lightweight)
Use beads only after Stage 0 `GO`.
Use beads for coarse slice tracking, not micro-task churn.

Workflow:
1. `bd ready`
2. Claim one slice issue: `bd update <id> --status in_progress`
3. Build/test that slice
4. Close it: `bd close <id>`
5. Create new bead only for major newly discovered scope or blocker

Keep total active beads small and focused.

## Remote Cleanup And Delivery (Mandatory)
This project already has remote commits and requires cleanup on remote.

Do this safely:
1. Land cleanup/build changes in clear commits
2. `git pull --rebase`
3. `bd sync`
4. `git push`
5. Verify branch is up to date with origin
6. Prune stale remote branches only if merged and safe

Do not force-push or rewrite shared history unless explicitly approved.

## Definition Of Done
Done means all are true:
- PRD behaviors implemented and demonstrable end-to-end
- Task-manager drift removed from active runtime
- tests/build/typecheck passing
- docs updated (`spec_validation_report`, `drift_cleanup_report`, release notes if needed)
- beads statuses accurate
- commits pushed to remote and branch synced

## Required Iteration Report Format
- Slice / bead ID
- What changed (files + behavior)
- Verification commands and pass/fail
- Remaining blockers/risks
- Next slice
