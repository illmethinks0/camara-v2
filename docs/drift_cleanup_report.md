# Drift Cleanup Report

Date: 2026-02-16
Scope: Stage 1 cleanup from `docs/prompts/build-camara-app.md`.

## Keep List

- `packages/frontend/src/App.tsx`
  - Active CAMARA router (home, login, registro, admin, instructor, participante).
- `packages/frontend/src/pages/Home.tsx`
- `packages/frontend/src/pages/Registration.tsx`
- `packages/frontend/src/pages/AdminDashboard.tsx`
- `packages/frontend/src/pages/InstructorDashboard.tsx`
- `packages/frontend/src/pages/ParticipantDashboard.tsx`
- `packages/frontend/src/contexts/DemoDataContext.tsx`
- `packages/backend/src/routes/auth.ts`
- `packages/backend/src/middleware/auth.ts`
- `packages/backend/src/index.ts`

## Remove / Archive List

- Removed `packages/backend/src/routes/tasks.ts`
  - Rationale: task-manager runtime endpoint conflicts with CAMARA PRD domain.
- Removed `packages/backend/src/services/task.ts`
  - Rationale: service only supported removed task-manager runtime.
- Removed `packages/backend/src/services/task.test.ts`
  - Rationale: stale tests for removed task service.
- Removed `packages/frontend/src/pages/TaskList.tsx`
  - Rationale: legacy task-manager UI, not part of PRD demo routes.
- Removed `packages/frontend/src/pages/TaskForm.tsx`
  - Rationale: legacy task-manager UI, not part of PRD demo routes.
- Removed `packages/frontend/src/pages/TaskList.module.css`
  - Rationale: orphaned after TaskList removal.
- Removed `packages/frontend/src/pages/TaskForm.module.css`
  - Rationale: orphaned after TaskForm removal.

## Additional Retargeting

- Updated `packages/backend/src/index.ts` to stop registering `/api/v1/tasks`.
- Updated `packages/backend/src/plugins/swagger.ts` description from task-manager wording to CAMARA context.
- Updated `packages/backend/src/routes/auth.ts` with `GET /api/v1/auth/me` and logout payload flexibility.
- Updated frontend auth/navigation files to remove stale `/tasks` redirects.
- Replaced frontend API client/tests with auth-focused CAMARA client (no task endpoints).
- Added missing `packages/frontend/src/pages/Registration.module.css` to restore frontend build.

## Verification Commands

1. Drift grep check:
   - Command: `rg -n "/api/v1/tasks|TaskList|TaskForm|task management" packages/frontend/src packages/backend/src`
   - Result: no matches.

2. Backend runtime route check:
   - Command: `rg -n "taskRoutes|/api/v1/tasks" packages/backend/src`
   - Result: no matches.

3. Frontend stale route check:
   - Command: `rg -n "'/tasks|\"/tasks|/tasks/|navigate\('/tasks|navigate\(\"/tasks" packages/frontend/src`
   - Result: no matches.

4. Required frontend routes check (source scan):
   - Command: `rg -n "path=\"/(|login|registro|admin|instructor|participante)\"" packages/frontend/src/App.tsx`
   - Result: all required routes present.

## Cleanup Gate Status

Stage 1 cleanup: **PASS**
