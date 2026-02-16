ROLE: Builder

(a) Read order confirmation (strict)
	1.	Spec: CAMARA TOOL PRD.md
	2.	Scenarios: DEMO_GUIDE.md (treat as visible scenarios)
	3.	Repo docs: TECH_SPEC.md (constraints/targets; conceptual if stack conflicts)
	4.	Code: only after (1–3), and only where aligned

(b) Scenario → contracts/invariants → touchpoints map

Visible Scenario S1: Happy-path demo (admin creates participant, assigns course, phase progression, annex generation, signature, dashboards reflect status)
	•	Contracts
	•	Auth: POST /auth/login, POST /auth/refresh, POST /auth/logout, GET /auth/me
	•	Courses: GET /courses
	•	Participants: POST /participants, GET /participants, GET /participants/:id, PATCH /participants/:id
	•	Phases: GET /participants/:id/phase, POST /participants/:id/phase/progress
	•	Annexes: POST /participants/:id/annexes/generate (type 2|3|5), GET /participants/:id/annexes, GET /annexes/:id, GET /annexes/:id/download
	•	Signatures: POST /annexes/:id/signatures, GET /annexes/:id/signatures
	•	Dashboards: GET /dashboards/admin, GET /dashboards/instructor, GET /dashboards/participant
	•	Attendance: POST /participants/:id/attendance, GET /participants/:id/attendance
	•	Infra: GET /health, GET /docs (OpenAPI)
	•	Invariants
	•	RBAC: administrator sees all; instructor sees only assigned participants; participant sees only self
	•	Phase transitions: diagnostic → training → completion (no skips unless admin override)
	•	Annex status derived from generation + required signature(s) for that phase
	•	Signature immutability: timestamped, linked to annex + participant + phase snapshot
	•	Touchpoints
	•	Backend: Fastify routes + RBAC middleware + Zod validation + Prisma models + PDF generator service
	•	Frontend: routes /login, /registro, /admin, /instructor, /participante; API client; auth state; status badges; annex preview/download; signature capture
	•	DB: Prisma schema + migrations + seed (demo accounts + course + sample participants)

Visible Scenario S2: Data isolation enforcement (attempt cross-tenant access)
	•	Contracts
	•	Any GET /participants/:id, /annexes/:id, /dashboards/* must enforce scope
	•	Invariants
	•	403 for valid auth but unauthorized scope; 401 for missing/invalid auth
	•	No “list leakage” in dashboard aggregates (counts must be scoped)
	•	Touchpoints
	•	Backend RBAC guard + query scoping (Prisma where clauses)
	•	Integration tests (RBAC matrix)

Visible Scenario S3: Drift cleanup proof (no task-manager runtime)
	•	Contracts
	•	Frontend default route must not be /tasks
	•	Backend must not expose /api/v1/tasks in active router
	•	Invariants
	•	Ripgrep checks clean on active runtime paths
	•	Build + typecheck passes after removal/archive
	•	Touchpoints
	•	Remove/archive listed files + any referenced imports/routes
	•	Router config (frontend + backend)

Visible Scenario S4: Annex realism + deterministic PDFs
	•	Contracts
	•	Annex templates (2/3/5) generated server-side, deterministic output for same inputs
	•	Preview/download works; batch export produces downloadable archive
	•	Invariants
	•	Template versioning (at least internal constant) to avoid accidental drift
	•	PDFs contain required Spanish copy and demo-realistic fields
	•	Touchpoints
	•	Backend PDF templates + storage pathing + download endpoints
	•	Frontend preview UI (iframe/object) + download actions

(c) Assumptions
SAFE DEFAULT
	•	“Demo accounts” include 1 admin, 1 instructor, 1–2 participants seeded with known emails/passwords for DEMO_GUIDE repeatability.
	•	Deterministic PDFs means same inputs → byte-stable PDF where feasible; at minimum field-stable with fixed ordering and fixed timestamps unless explicitly required to embed generation time.
	•	“Batch export” default format is a single ZIP containing selected PDFs (annexes), named predictably.

MUST CONFIRM (only if the docs don’t already specify; otherwise defer to PRD/DEMO_GUIDE)
	•	Which annexes require signatures (all vs. specific ones), and whether instructor/admin signature is needed in addition to participant.
	•	Attendance granularity: per session date vs. per phase milestone (default to per session/date).
	•	Whether “Participant” is a distinct entity from “User” (default: Participant links 1:1 to User for login; but PRD might allow participant record without login).

(d) Spec Questions (only if blocked)
None at Gate 0. Proceeding requires reading the three docs to eliminate the MUST CONFIRM items; if they’re specified there, no questions needed.