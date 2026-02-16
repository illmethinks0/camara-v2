# Spec Validation Report

Date: 2026-02-16
Scope: Stage 0 validation against `CAMARA TOOL PRD.md`, `TECH_SPEC.md`, and `DEMO_GUIDE.md`.

## Requirement Checklist

| Requirement | Status | Evidence | Gap / Risk |
|---|---|---|---|
| Roles: `administrator`, `instructor`, `participant` | partial | Frontend dashboards exist in `packages/frontend/src/pages/AdminDashboard.tsx`, `packages/frontend/src/pages/InstructorDashboard.tsx`, `packages/frontend/src/pages/ParticipantDashboard.tsx` | Backend auth/domain still centered on `user/admin`; no end-to-end role enforcement for the three PRD roles |
| Registration fields (nombre, apellidos, documento, email, telefono, curso) | partial | Form implemented in `packages/frontend/src/pages/Registration.tsx` with required fields | Not persisted to backend/database yet |
| Phase lifecycle `diagnostic -> training -> completion` | partial | Demo lifecycle modeled in `packages/frontend/src/contexts/DemoDataContext.tsx` | Not enforced by backend API/database rules |
| Annex generation (2/3/5) | partial | Annex state generation simulated in `DemoDataContext.tsx` | No backend deterministic PDF generation, storage, or API-driven generation |
| Annex preview/download | missing | No active UI/API preview/download flow tied to backend annex files | Demo-critical gap |
| Batch generate/export ZIP | missing | No backend endpoints or frontend UX for ZIP export | Demo-critical gap |
| Signature flow (typed/drawn, timestamped, linked to annex/phase) | partial | Signature status + timestamp simulation in `DemoDataContext.tsx` | No typed/drawn signature capture persisted with annex+phase linkage |
| Dashboards role-specific with status badges | partial | Role views + badges in dashboard pages and `StatusBadge.tsx` | Filters, aggregates, and backend-driven data isolation not complete |
| Instructor attendance tracking | partial | Local attendance counters in `DemoDataContext.tsx` and action in instructor dashboard | No persisted attendance records API or DB model in runtime package |
| Strict RBAC data isolation | missing | Current UI uses shared in-memory demo data | Backend scoping and 401/403 matrix not implemented to PRD level |
| Spanish UI copy | partial | Most new CAMARA pages are Spanish | Legacy auth pages and technical errors still in English |
| Runtime routes required (`/`, `/login`, `/registro`, `/admin`, `/instructor`, `/participante`) | partial | `/`, `/registro`, `/admin`, `/instructor`, `/participante` wired in `App.tsx` | `/login` not currently wired in active router |
| Infra endpoints (`/health`, docs/OpenAPI) | done | Implemented in backend `packages/backend/src/index.ts` and swagger plugin | OpenAPI content still legacy/task-manager oriented |

## Current Implementation Summary

- Done: baseline frontend role pages, local phase/annex simulation, health/docs endpoint.
- Partial: registration workflow, lifecycle and signature behavior, Spanish localization, role-specific UX.
- Missing: production backend domain for participants/courses/phases/annexes/signatures/attendance, deterministic PDF pipeline, ZIP export, strict RBAC API scope enforcement.

## Gaps and Risks

1. Active backend runtime is still task-manager oriented (`/api/v1/tasks`), conflicting with PRD runtime.
2. Frontend still contains legacy task/auth surfaces that can leak non-PRD behavior.
3. No end-to-end persistence for participant lifecycle; current flow is in-memory and non-durable.
4. No deterministic PDF contract yet; annex realism requirement is not met.
5. Existing tests are drifted to task entities and database assumptions, reducing signal for PRD behavior.

## Keep / Archive / Remove Inventory

### Keep
- `packages/frontend/src/pages/AdminDashboard.tsx`
- `packages/frontend/src/pages/InstructorDashboard.tsx`
- `packages/frontend/src/pages/ParticipantDashboard.tsx`
- `packages/frontend/src/pages/Registration.tsx`
- `packages/frontend/src/contexts/DemoDataContext.tsx`
- `packages/frontend/src/components/status/StatusBadge.tsx`
- `packages/backend/src/routes/auth.ts`
- `packages/backend/src/middleware/auth.ts`
- `packages/backend/src/plugins/swagger.ts` (metadata/content to be retargeted)

### Archive or Remove
- `packages/backend/src/routes/tasks.ts`
- `packages/backend/src/services/task.ts`
- `packages/frontend/src/pages/TaskList.tsx`
- `packages/frontend/src/pages/TaskForm.tsx`
- task-centric tests/docs/type artifacts that assert `/api/v1/tasks` runtime

### Retarget
- `packages/frontend/src/pages/Login.tsx` and `packages/frontend/src/pages/Register.tsx` (legacy `/tasks` redirects)
- `packages/frontend/src/services/camaraApi.ts` (task endpoints and dev-token behavior)
- backend swagger description and tests to CAMARA domain

## Decision

**GO**

Rationale: No external blockers prevent implementation. Codebase is partially aligned and can proceed to Stage 1 cleanup, then feature slices. Major work remains, but drift removal and route alignment can start immediately.
