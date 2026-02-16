-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
CREATE TYPE "Role" AS ENUM ('administrator', 'instructor', 'participant');
CREATE TYPE "PhaseType" AS ENUM ('diagnostic', 'training', 'completion');
CREATE TYPE "PhaseStatus" AS ENUM ('not_started', 'in_progress', 'completed');
CREATE TYPE "AnnexType" AS ENUM ('annex_2', 'annex_3', 'annex_5');
CREATE TYPE "AnnexStatus" AS ENUM ('generated', 'signed');
CREATE TYPE "SignatureActorRole" AS ENUM ('administrator', 'instructor', 'participant');

-- Users
CREATE TABLE "users" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" TEXT NOT NULL UNIQUE,
  "password_hash" TEXT NOT NULL,
  "role" "Role" NOT NULL,
  "name" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "users_role_idx" ON "users" ("role");

-- Refresh tokens
CREATE TABLE "refresh_tokens" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL,
  "token_hash" TEXT NOT NULL UNIQUE,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "revoked_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "refresh_tokens_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens" ("user_id");
CREATE INDEX "refresh_tokens_expires_at_idx" ON "refresh_tokens" ("expires_at");

-- Courses
CREATE TABLE "courses" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "description" TEXT,
  "duration_hours" INTEGER NOT NULL,
  "start_date" DATE NOT NULL,
  "end_date" DATE NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "courses_name_idx" ON "courses" ("name");

-- Participants
CREATE TABLE "participants" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID UNIQUE,
  "course_id" UUID NOT NULL,
  "first_name" TEXT NOT NULL,
  "last_name" TEXT NOT NULL,
  "id_number" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "current_phase" "PhaseType" NOT NULL DEFAULT 'diagnostic',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "participants_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "participants_course_id_fkey"
    FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "participants_course_id_idx" ON "participants" ("course_id");
CREATE INDEX "participants_current_phase_idx" ON "participants" ("current_phase");
CREATE INDEX "participants_id_number_idx" ON "participants" ("id_number");

-- Instructor assignments
CREATE TABLE "instructor_assignments" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "instructor_id" UUID NOT NULL,
  "participant_id" UUID NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "instructor_assignments_instructor_id_fkey"
    FOREIGN KEY ("instructor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "instructor_assignments_participant_id_fkey"
    FOREIGN KEY ("participant_id") REFERENCES "participants"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "instructor_assignments_instructor_id_participant_id_key"
    UNIQUE ("instructor_id", "participant_id")
);

CREATE INDEX "instructor_assignments_participant_id_idx" ON "instructor_assignments" ("participant_id");

-- Phases
CREATE TABLE "phases" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "participant_id" UUID NOT NULL,
  "phase_type" "PhaseType" NOT NULL,
  "status" "PhaseStatus" NOT NULL DEFAULT 'not_started',
  "started_at" TIMESTAMP(3),
  "completed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "phases_participant_id_fkey"
    FOREIGN KEY ("participant_id") REFERENCES "participants"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "phases_participant_id_phase_type_key"
    UNIQUE ("participant_id", "phase_type")
);

CREATE INDEX "phases_status_idx" ON "phases" ("status");

-- Annexes
CREATE TABLE "annexes" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "participant_id" UUID NOT NULL,
  "phase_id" UUID NOT NULL,
  "annex_type" "AnnexType" NOT NULL,
  "status" "AnnexStatus" NOT NULL DEFAULT 'generated',
  "template_version" TEXT NOT NULL,
  "file_name" TEXT NOT NULL,
  "storage_path" TEXT NOT NULL,
  "content_hash" TEXT NOT NULL,
  "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "annexes_participant_id_fkey"
    FOREIGN KEY ("participant_id") REFERENCES "participants"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "annexes_phase_id_fkey"
    FOREIGN KEY ("phase_id") REFERENCES "phases"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "annexes_participant_id_idx" ON "annexes" ("participant_id");
CREATE INDEX "annexes_phase_id_idx" ON "annexes" ("phase_id");
CREATE INDEX "annexes_status_idx" ON "annexes" ("status");

-- Signatures
CREATE TABLE "signatures" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "annex_id" UUID NOT NULL,
  "participant_id" UUID,
  "signer_user_id" UUID,
  "actor_role" "SignatureActorRole" NOT NULL,
  "typed_name" TEXT,
  "signature_data_url" TEXT,
  "signed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "phase_snapshot" "PhaseType" NOT NULL,
  CONSTRAINT "signatures_annex_id_fkey"
    FOREIGN KEY ("annex_id") REFERENCES "annexes"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "signatures_participant_id_fkey"
    FOREIGN KEY ("participant_id") REFERENCES "participants"("id") ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT "signatures_signer_user_id_fkey"
    FOREIGN KEY ("signer_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "signatures_annex_id_idx" ON "signatures" ("annex_id");
CREATE INDEX "signatures_participant_id_idx" ON "signatures" ("participant_id");
CREATE INDEX "signatures_signer_user_id_idx" ON "signatures" ("signer_user_id");

-- Attendance records
CREATE TABLE "attendance_records" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "participant_id" UUID NOT NULL,
  "instructor_id" UUID NOT NULL,
  "session_date" DATE NOT NULL,
  "hours" DECIMAL(4,1) NOT NULL,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "attendance_records_participant_id_fkey"
    FOREIGN KEY ("participant_id") REFERENCES "participants"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "attendance_records_instructor_id_fkey"
    FOREIGN KEY ("instructor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "attendance_records_participant_id_idx" ON "attendance_records" ("participant_id");
CREATE INDEX "attendance_records_instructor_id_idx" ON "attendance_records" ("instructor_id");
CREATE INDEX "attendance_records_session_date_idx" ON "attendance_records" ("session_date");

-- Audit logs
CREATE TABLE "audit_logs" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "actor_user_id" UUID,
  "action" TEXT NOT NULL,
  "resource_type" TEXT NOT NULL,
  "resource_id" TEXT,
  "context" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "audit_logs_actor_user_id_fkey"
    FOREIGN KEY ("actor_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "audit_logs_actor_user_id_idx" ON "audit_logs" ("actor_user_id");
CREATE INDEX "audit_logs_resource_type_idx" ON "audit_logs" ("resource_type");
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs" ("created_at");
