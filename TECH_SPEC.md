# Technical Specification - Cámara Tool

**Version:** 1.0
**Last Updated:** 2025-02-06
**Project:** Cámara de Comercio Menorca Training Platform

---

## 1. Technology Stack

### Frontend
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **PDF Viewer:** react-pdf or @react-pdf/renderer
- **Signature Capture:** react-signature-canvas
- **State Management:** React Context API (sufficient for MVP)

**Rationale:** Next.js provides fast development, built-in API routes (no separate backend), excellent Vercel deployment, and SSR for polished initial loads.

### Backend
- **API:** Next.js API Routes (serverless functions)
- **Language:** TypeScript
- **ORM:** Prisma
- **Validation:** Zod
- **PDF Generation:** Puppeteer or @react-pdf/renderer

**Rationale:** Single codebase reduces complexity for 8-day timeline. Prisma provides type-safe database access.

### Database
- **Provider:** Supabase (PostgreSQL)
- **Version:** PostgreSQL 15+
- **Features Used:** Database, Auth, Storage

**Rationale:** Free tier sufficient (500MB DB, 1GB storage), built-in auth, file storage for PDFs, simple setup.

### Authentication
- **Library:** Supabase Auth or NextAuth.js
- **Method:** Email/password (simple for demo)
- **Session:** JWT tokens (24-hour expiration)
- **Password:** Bcrypt hashing

### File Storage
- **Provider:** Supabase Storage
- **Structure:**
  ```
  /annexes/
    /{participant_id}/
      /annex-2-{timestamp}.pdf
      /annex-3-{timestamp}.pdf
      /annex-5-{timestamp}.pdf
  /signatures/
    /{signature_id}.png
  ```

### Hosting
- **Frontend + API:** Vercel
- **Database:** Supabase Cloud
- **Domain:** TBD (camara-menorca-demo.vercel.app or custom)

---

## 2. Architecture Overview

### System Architecture
```
┌─────────────┐
│   Browser   │
│  (Spanish)  │
└──────┬──────┘
       │ HTTPS
       ▼
┌─────────────────────────────┐
│   Next.js (Vercel)          │
│                             │
│  ┌─────────────────────┐   │
│  │  App Router Pages   │   │
│  │  - /login           │   │
│  │  - /admin           │   │
│  │  - /instructor      │   │
│  │  - /participant     │   │
│  └─────────────────────┘   │
│                             │
│  ┌─────────────────────┐   │
│  │   API Routes        │   │
│  │  - /api/auth/*      │   │
│  │  - /api/participants│   │
│  │  - /api/annexes     │   │
│  │  - /api/signatures  │   │
│  └─────────────────────┘   │
└──────────┬──────────────────┘
           │
           ▼
┌───────────────────────────────┐
│   Supabase                    │
│  ┌────────────────────────┐  │
│  │  PostgreSQL Database   │  │
│  │  (users, participants, │  │
│  │   phases, annexes)     │  │
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │
│  │  Storage               │  │
│  │  (PDF files, images)   │  │
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │
│  │  Auth                  │  │
│  │  (JWT, sessions)       │  │
│  └────────────────────────┘  │
└───────────────────────────────┘
```

### Request Flow Examples

**Example 1: Participant Login**
```
1. User enters email/password → POST /api/auth/login
2. Next.js validates credentials via Supabase Auth
3. Supabase returns JWT token
4. Next.js sets secure HTTP-only cookie
5. Redirect to role-specific dashboard (/participant)
```

**Example 2: Generate Annex**
```
1. Admin clicks "Generate Annex 2" → POST /api/annexes/generate
2. API verifies admin role from JWT
3. API fetches participant data from Supabase
4. API generates PDF using Puppeteer/react-pdf
5. API uploads PDF to Supabase Storage
6. API creates annex record in database with storage URL
7. API returns PDF URL to frontend
8. Frontend displays PDF preview modal
```

**Example 3: Digital Signature**
```
1. Participant draws signature → POST /api/signatures/create
2. API receives base64 signature image
3. API uploads signature image to Supabase Storage
4. API creates signature record in database
5. API updates annex.signed_at timestamp
6. API triggers phase progression check
7. Frontend updates dashboard status badges
```

---

## 3. Database Schema

### ER Diagram
```
users (1) ──< (N) participants
participants (1) ──< (N) phases
participants (1) ──< (N) annexes
phases (1) ──< (N) annexes
annexes (1) ──< (N) signatures
users (1) ──< (N) instructor_assignments
participants (1) ──< (N) instructor_assignments
```

### Tables

#### `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('administrator', 'instructor', 'participant')),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

#### `courses`
```sql
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration_hours INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### `participants`
```sql
CREATE TABLE participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES courses(id) ON DELETE RESTRICT,
  id_number VARCHAR(50) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  current_phase VARCHAR(50) NOT NULL DEFAULT 'diagnostic'
    CHECK (current_phase IN ('diagnostic', 'training', 'completion')),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_participants_user_id ON participants(user_id);
CREATE INDEX idx_participants_course_id ON participants(course_id);
CREATE INDEX idx_participants_current_phase ON participants(current_phase);
```

#### `instructor_assignments`
```sql
CREATE TABLE instructor_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  instructor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(instructor_id, participant_id)
);

CREATE INDEX idx_instructor_assignments_instructor_id ON instructor_assignments(instructor_id);
CREATE INDEX idx_instructor_assignments_participant_id ON instructor_assignments(participant_id);
```

#### `phases`
```sql
CREATE TABLE phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  phase_type VARCHAR(50) NOT NULL
    CHECK (phase_type IN ('diagnostic', 'training', 'completion')),
  status VARCHAR(50) NOT NULL DEFAULT 'not_started'
    CHECK (status IN ('not_started', 'in_progress', 'completed')),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(participant_id, phase_type)
);

CREATE INDEX idx_phases_participant_id ON phases(participant_id);
CREATE INDEX idx_phases_status ON phases(status);
```

#### `annexes`
```sql
CREATE TABLE annexes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  phase_id UUID NOT NULL REFERENCES phases(id) ON DELETE CASCADE,
  annex_type VARCHAR(50) NOT NULL
    CHECK (annex_type IN ('annex_2', 'annex_3', 'annex_5')),
  pdf_url TEXT NOT NULL,
  signed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_annexes_participant_id ON annexes(participant_id);
CREATE INDEX idx_annexes_phase_id ON annexes(phase_id);
CREATE INDEX idx_annexes_signed_at ON annexes(signed_at);
```

#### `signatures`
```sql
CREATE TABLE signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  annex_id UUID NOT NULL REFERENCES annexes(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES participants(id) ON DELETE CASCADE,
  instructor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  signature_image_url TEXT NOT NULL,
  ip_address VARCHAR(50),
  timestamp TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_signatures_annex_id ON signatures(annex_id);
CREATE INDEX idx_signatures_participant_id ON signatures(participant_id);
```

#### `attendance_records` (Optional for Demo)
```sql
CREATE TABLE attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_id UUID NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
  instructor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  hours DECIMAL(4,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_attendance_participant_id ON attendance_records(participant_id);
CREATE INDEX idx_attendance_session_date ON attendance_records(session_date);
```

### Prisma Schema (schema.prisma)
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String   @id @default(uuid())
  email         String   @unique
  passwordHash  String   @map("password_hash")
  role          Role
  name          String
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  participants  Participant[]
  instructorAssignments InstructorAssignment[]
  signatures    Signature[]

  @@map("users")
}

enum Role {
  administrator
  instructor
  participant
}

model Course {
  id            String   @id @default(uuid())
  name          String
  description   String?
  durationHours Int      @map("duration_hours")
  startDate     DateTime @map("start_date") @db.Date
  endDate       DateTime @map("end_date") @db.Date
  createdAt     DateTime @default(now()) @map("created_at")

  participants  Participant[]

  @@map("courses")
}

model Participant {
  id           String      @id @default(uuid())
  userId       String      @map("user_id")
  courseId     String      @map("course_id")
  idNumber     String      @map("id_number")
  phone        String
  currentPhase PhaseType   @default(diagnostic) @map("current_phase")
  createdAt    DateTime    @default(now()) @map("created_at")

  user         User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  course       Course      @relation(fields: [courseId], references: [id])
  phases       Phase[]
  annexes      Annex[]
  instructorAssignments InstructorAssignment[]
  signatures   Signature[]

  @@map("participants")
}

enum PhaseType {
  diagnostic
  training
  completion
}

model InstructorAssignment {
  id            String   @id @default(uuid())
  instructorId  String   @map("instructor_id")
  participantId String   @map("participant_id")
  createdAt     DateTime @default(now()) @map("created_at")

  instructor    User        @relation(fields: [instructorId], references: [id], onDelete: Cascade)
  participant   Participant @relation(fields: [participantId], references: [id], onDelete: Cascade)

  @@unique([instructorId, participantId])
  @@map("instructor_assignments")
}

model Phase {
  id            String      @id @default(uuid())
  participantId String      @map("participant_id")
  phaseType     PhaseType   @map("phase_type")
  status        PhaseStatus @default(not_started)
  startedAt     DateTime?   @map("started_at")
  completedAt   DateTime?   @map("completed_at")
  createdAt     DateTime    @default(now()) @map("created_at")

  participant   Participant @relation(fields: [participantId], references: [id], onDelete: Cascade)
  annexes       Annex[]

  @@unique([participantId, phaseType])
  @@map("phases")
}

enum PhaseStatus {
  not_started
  in_progress
  completed
}

model Annex {
  id            String    @id @default(uuid())
  participantId String    @map("participant_id")
  phaseId       String    @map("phase_id")
  annexType     AnnexType @map("annex_type")
  pdfUrl        String    @map("pdf_url")
  signedAt      DateTime? @map("signed_at")
  createdAt     DateTime  @default(now()) @map("created_at")

  participant   Participant @relation(fields: [participantId], references: [id], onDelete: Cascade)
  phase         Phase       @relation(fields: [phaseId], references: [id], onDelete: Cascade)
  signatures    Signature[]

  @@map("annexes")
}

enum AnnexType {
  annex_2
  annex_3
  annex_5
}

model Signature {
  id                String    @id @default(uuid())
  annexId           String    @map("annex_id")
  participantId     String?   @map("participant_id")
  instructorId      String?   @map("instructor_id")
  signatureImageUrl String    @map("signature_image_url")
  ipAddress         String?   @map("ip_address")
  timestamp         DateTime  @default(now())

  annex         Annex        @relation(fields: [annexId], references: [id], onDelete: Cascade)
  participant   Participant? @relation(fields: [participantId], references: [id], onDelete: Cascade)
  instructor    User?        @relation(fields: [instructorId], references: [id])

  @@map("signatures")
}
```

---

## 4. Authentication & Authorization

### Authentication Flow

**Login:**
```typescript
// /api/auth/login
async function login(email: string, password: string) {
  // 1. Find user by email
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("Invalid credentials");

  // 2. Verify password
  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) throw new Error("Invalid credentials");

  // 3. Generate JWT token
  const token = jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );

  // 4. Return token + user data
  return { token, user: { id: user.id, name: user.name, role: user.role } };
}
```

**Session Management:**
- JWT stored in HTTP-only cookie (secure, sameSite: strict)
- Token includes: userId, role, expiration
- Middleware validates token on every API request

### Authorization Rules

**API Route Protection:**
```typescript
// middleware.ts
export function withAuth(allowedRoles: Role[]) {
  return async (req: NextRequest) => {
    const token = req.cookies.get('auth-token');
    if (!token) return NextResponse.redirect('/login');

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!allowedRoles.includes(decoded.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.next();
  };
}

// Usage:
// /api/admin/* → withAuth(['administrator'])
// /api/instructor/* → withAuth(['administrator', 'instructor'])
// /api/participant/* → withAuth(['administrator', 'instructor', 'participant'])
```

**Data Access Rules:**
| Role | Access |
|------|--------|
| Administrator | All participants, all courses, all annexes, all actions |
| Instructor | Only assigned participants, read-only except attendance/phase progression |
| Participant | Only own data, read-only except signatures |

**Database-Level Security (Supabase RLS):**
```sql
-- Enable RLS on participants table
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;

-- Administrator sees all
CREATE POLICY admin_all ON participants
  FOR ALL USING (
    auth.jwt() ->> 'role' = 'administrator'
  );

-- Instructor sees only assigned participants
CREATE POLICY instructor_assigned ON participants
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'instructor' AND
    id IN (
      SELECT participant_id FROM instructor_assignments
      WHERE instructor_id = (auth.jwt() ->> 'userId')::uuid
    )
  );

-- Participant sees only own data
CREATE POLICY participant_own ON participants
  FOR SELECT USING (
    auth.jwt() ->> 'role' = 'participant' AND
    user_id = (auth.jwt() ->> 'userId')::uuid
  );
```

### Demo Accounts

All passwords: **CamaraMenorca2025**

```typescript
// seed.ts - Create demo accounts
const demoAccounts = [
  { email: 'admin@camara-menorca.es', role: 'administrator', name: 'Ana García Ruiz' },
  { email: 'instructor1@camara-menorca.es', role: 'instructor', name: 'Carlos Martínez López' },
  { email: 'instructor2@camara-menorca.es', role: 'instructor', name: 'Isabel Fernández Torres' },
  { email: 'participant1@camara-menorca.es', role: 'participant', name: 'Miguel Sánchez Vega' },
  { email: 'participant2@camara-menorca.es', role: 'participant', name: 'Laura Rodríguez Mora' },
  { email: 'participant3@camara-menorca.es', role: 'participant', name: 'David Hernández Cruz' },
  { email: 'participant4@camara-menorca.es', role: 'participant', name: 'Sofia López Navarro' },
  { email: 'participant5@camara-menorca.es', role: 'participant', name: 'Javier Morales Ruiz' },
];
```

---

## 5. API Endpoints

### Authentication
```
POST   /api/auth/login         - Login user
POST   /api/auth/logout        - Logout user
GET    /api/auth/me            - Get current user
```

### Participants
```
GET    /api/participants       - List participants (filtered by role)
GET    /api/participants/:id   - Get participant details
POST   /api/participants       - Create participant (admin only)
PATCH  /api/participants/:id   - Update participant (admin only)
DELETE /api/participants/:id   - Delete participant (admin only)
```

### Phases
```
GET    /api/phases/:participantId     - Get participant phases
POST   /api/phases/:participantId/progress - Advance phase (admin/instructor)
```

### Annexes
```
GET    /api/annexes/:participantId    - List participant annexes
POST   /api/annexes/generate          - Generate annex (admin/instructor)
POST   /api/annexes/batch-generate    - Generate multiple annexes (admin)
GET    /api/annexes/:id/download      - Download PDF
POST   /api/annexes/batch-export      - Export ZIP (admin)
```

### Signatures
```
POST   /api/signatures/:annexId       - Sign annex
GET    /api/signatures/:annexId       - Get annex signatures
```

### Instructor
```
GET    /api/instructor/participants   - Get assigned participants
POST   /api/instructor/attendance     - Mark attendance
```

---

## 6. Annex Templates

### Annex 2 - Diagnostic Phase

**File:** `templates/annex-2.tsx` (React PDF component)

**Layout:**
```
┌────────────────────────────────────────────┐
│  [LOGO]    ANEXO 2 - DIAGNÓSTICO    [DATE] │
├────────────────────────────────────────────┤
│                                            │
│  DATOS DEL PARTICIPANTE                    │
│  Nombre: {participant.name}                │
│  DNI: {participant.idNumber}               │
│  Teléfono: {participant.phone}             │
│  Email: {participant.email}                │
│                                            │
│  DATOS DEL PROGRAMA                        │
│  Programa: {course.name}                   │
│  Fecha de inicio: {course.startDate}       │
│  Instructor: {instructor.name}             │
│                                            │
│  OBJETIVOS DEL PARTICIPANTE                │
│  [Text area - 200 words]                   │
│                                            │
│  FIRMAS                                    │
│  ┌─────────────────┐  ┌─────────────────┐ │
│  │  Participante   │  │   Instructor    │ │
│  │                 │  │                 │ │
│  └─────────────────┘  └─────────────────┘ │
│                                            │
│  Fecha: {signatureDate}                    │
├────────────────────────────────────────────┤
│  Cámara de Comercio de Menorca            │
│  Página 1 de 1                             │
└────────────────────────────────────────────┘
```

### Annex 3 - Training Phase

**Layout:**
```
┌────────────────────────────────────────────┐
│  [LOGO]  ANEXO 3 - PROGRESO FORMATIVO      │
├────────────────────────────────────────────┤
│  Participante: {participant.name}          │
│  Programa: {course.name}                   │
│                                            │
│  ASISTENCIA                                │
│  ┌────────────┬─────────┬─────────────┐   │
│  │   Fecha    │  Horas  │   Tema      │   │
│  ├────────────┼─────────┼─────────────┤   │
│  │ 15/01/2025 │   4.0   │ Módulo 1    │   │
│  │ 18/01/2025 │   4.0   │ Módulo 2    │   │
│  └────────────┴─────────┴─────────────┘   │
│                                            │
│  Total horas completadas: {totalHours}     │
│                                            │
│  OBSERVACIONES DEL INSTRUCTOR              │
│  [Instructor notes]                        │
│                                            │
│  FIRMA DEL INSTRUCTOR                      │
│  ┌─────────────────┐                       │
│  │                 │                       │
│  └─────────────────┘                       │
│  Fecha: {signatureDate}                    │
└────────────────────────────────────────────┘
```

### Annex 5 - Completion Certificate

**Layout:**
```
┌────────────────────────────────────────────┐
│  [LOGO]  CERTIFICADO DE FINALIZACIÓN       │
├────────────────────────────────────────────┤
│                                            │
│         CERTIFICADO DE PARTICIPACIÓN       │
│                                            │
│  La Cámara de Comercio de Menorca certifica│
│  que:                                       │
│                                            │
│            {PARTICIPANT.NAME}              │
│                                            │
│  Ha completado satisfactoriamente el       │
│  programa:                                  │
│                                            │
│        {COURSE.NAME}                       │
│                                            │
│  Duración: {course.durationHours} horas    │
│  Fechas: {startDate} - {endDate}           │
│  Calificación: APTO                        │
│                                            │
│  FIRMAS                                    │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │Participante│ Instructor│   Director│  │
│  │          │ │          │ │          │  │
│  └──────────┘ └──────────┘ └──────────┘  │
│                                            │
│  Menorca, {completionDate}                 │
│                                            │
│  [Legal disclaimer text]                   │
└────────────────────────────────────────────┘
```

### Implementation Notes

**Action Items:**
1. **Day 1:** Coordinate with FAR HUB to obtain official Cámara de Comercio Menorca logo (high-res PNG/SVG)
2. **Day 1:** Confirm branding colors (navy blue #1e3a8a recommended)
3. **Day 2:** Review annex layouts with client for approval
4. **Day 2:** Confirm legal disclaimer text for Annex 5

**For mock demo data (if real content unavailable):**
- Participant goals: "Desarrollar habilidades en marketing digital y gestión de redes sociales para mi emprendimiento."
- Instructor notes: "El participante ha demostrado excelente progreso y dedicación durante las sesiones formativas."
- Legal disclaimer: "Este documento certifica la participación del alumno/a en el programa formativo gestionado por la Cámara de Comercio de Menorca. La información contenida es confidencial y de uso exclusivo para fines administrativos y de seguimiento académico."

---

## 7. Environment Variables

### Required Variables

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# Authentication
JWT_SECRET="your-secret-key-min-32-chars"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="https://camara-menorca-demo.vercel.app"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGc..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGc..."

# File Storage
STORAGE_BUCKET="annexes"

# Optional - Analytics
VERCEL_ANALYTICS_ID="xxx"
```

### Setup Instructions

```bash
# 1. Copy .env.example to .env.local
cp .env.example .env.local

# 2. Generate secrets
openssl rand -base64 32  # JWT_SECRET
openssl rand -base64 32  # NEXTAUTH_SECRET

# 3. Create Supabase project and copy credentials
# Visit: https://supabase.com/dashboard

# 4. Update .env.local with actual values
```

---

## 8. Development Setup

### Prerequisites
- Node.js 18+ and npm/pnpm
- PostgreSQL 15+ (or Supabase account)
- Git

### Quick Start

```bash
# 1. Clone repository
git clone [repo-url]
cd camarav2

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# 4. Initialize database
npx prisma generate
npx prisma db push

# 5. Seed demo data
npm run seed

# 6. Run development server
npm run dev

# 7. Open browser
# http://localhost:3000
```

### Database Migrations

```bash
# Create new migration
npx prisma migrate dev --name migration_name

# Apply migrations (production)
npx prisma migrate deploy

# Reset database (DEV ONLY - destroys data)
npx prisma migrate reset

# Seed demo data
npm run seed
```

---

## 9. Deployment

See `DEMO_GUIDE.md` Section 4 for full deployment instructions.

**Quick Deploy to Vercel:**
```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel --prod

# 4. Set environment variables in Vercel dashboard
# https://vercel.com/[project]/settings/environment-variables
```

---

## 10. Performance Targets

| Operation | Target | Acceptance |
|-----------|--------|------------|
| Page Load (Dashboard) | < 2s | < 3s |
| PDF Generation | < 5s | < 8s |
| Signature Submission | < 3s | < 5s |
| Batch Generation (3 participants) | < 10s | < 15s |
| ZIP Export (5 PDFs) | < 5s | < 8s |
| Database Query | < 500ms | < 1s |

---

## 11. Security Considerations

### Implemented
- ✅ Password hashing (bcrypt, cost factor 10)
- ✅ JWT with expiration (24 hours)
- ✅ HTTP-only cookies (prevents XSS)
- ✅ Role-based access control on all routes
- ✅ Input validation (Zod schemas)
- ✅ SQL injection prevention (Prisma ORM)
- ✅ Supabase Row Level Security (RLS)
- ✅ Signed URLs for file access (time-limited)

### Future Considerations (Post-Demo)
- Rate limiting on API endpoints
- CSRF tokens
- Content Security Policy headers
- Audit logging for sensitive actions
- Two-factor authentication
- Password complexity requirements
- Session invalidation on password change

---

## 12. Monitoring & Debugging

### Vercel Logs
```bash
# View real-time logs
vercel logs --follow

# View logs for specific deployment
vercel logs [deployment-url]
```

### Error Tracking (Optional)
- Sentry integration for production errors
- Console logging in development
- Vercel Analytics for performance metrics

### Health Check Endpoint
```typescript
// /api/health
export async function GET() {
  return Response.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: await checkDatabaseConnection(),
  });
}
```

---

## Questions for FAR HUB / Client

**Critical (Day 1-2):**
- [ ] Official Cámara de Comercio Menorca logo (high-res PNG/SVG)?
- [ ] Branding guidelines (colors, fonts)?
- [ ] Annex legal disclaimer text (especially for Annex 5)?
- [ ] Custom domain preference or use Vercel default?
- [ ] Spanish-only or include English toggle?

**Important (Day 3-4):**
- [ ] Realistic demo participant data preferences?
- [ ] Specific course names to use in demo?
- [ ] Instructor notes examples?
- [ ] Any existing annex templates to match?
- [ ] Demo environment access (will client test before pitch)?

**Nice-to-Have:**
- [ ] Post-pitch roadmap priorities?
- [ ] Integration requirements with existing Cámara systems?
- [ ] Compliance requirements (GDPR, data retention)?
