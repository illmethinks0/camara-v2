/**
 * CAMARA v2 API Types
 */

export type UserRole = 'administrator' | 'instructor' | 'participant';

export interface User {
  userId?: string;
  id?: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface APIError {
  code: string;
  message: string;
  recoverability: 'retryable' | 'terminal';
}

export interface APIResult<T> {
  success: boolean;
  data?: T;
  error?: APIError;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: UserRole;
}

export interface RegisterResponse {
  user: User;
  tokens: AuthTokens;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface CourseDTO {
  id: string;
  name: string;
  description?: string;
  durationHours: number;
  startDate: string;
  endDate: string;
}

export interface PhaseDTO {
  id: string;
  phaseType: 'diagnostic' | 'training' | 'completion';
  status: 'not_started' | 'in_progress' | 'completed';
  startedAt?: string;
  completedAt?: string;
}

export interface AnnexDTO {
  id: string;
  participantId: string;
  annexType: 'annex_2' | 'annex_3' | 'annex_5';
  title: string;
  phaseType: 'diagnostic' | 'training' | 'completion';
  status: 'generated' | 'signed';
  generatedAt: string;
  fileName: string;
}

export interface AttendanceDTO {
  id: string;
  sessionDate: string;
  hours: number;
  notes?: string;
  instructorName?: string;
}

export interface ParticipantDTO {
  id: string;
  userId?: string;
  firstName: string;
  lastName: string;
  fullName: string;
  idNumber: string;
  email: string;
  phone: string;
  courseId: string;
  courseName: string;
  currentPhase: 'diagnostic' | 'training' | 'completion';
  phases: PhaseDTO[];
  annexes: AnnexDTO[];
  attendance: AttendanceDTO[];
  assignedInstructorIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SignatureDTO {
  id: string;
  annexId: string;
  actorRole: UserRole;
  typedName?: string;
  signedAt: string;
  phaseSnapshot: 'diagnostic' | 'training' | 'completion';
}

export interface CreateParticipantRequest {
  firstName: string;
  lastName: string;
  idNumber: string;
  email: string;
  phone: string;
  courseId: string;
}

export interface MarkAttendanceRequest {
  sessionDate: string;
  hours: number;
  notes?: string;
}

export interface BatchExportRequest {
  participantIds?: string[];
  annexIds?: string[];
  signedOnly?: boolean;
}

export interface FileDownload {
  fileName: string;
  blob: Blob;
}
