export type PhaseId = 'diagnostico' | 'formacion' | 'finalizacion';

export type PhaseStatus =
  | 'not_started'
  | 'in_progress'
  | 'annex_generated'
  | 'signed'
  | 'completed';

export interface Course {
  id: string;
  name: string;
}

export interface PhaseDefinition {
  id: PhaseId;
  label: string;
  annexName: string;
}

export interface ParticipantPhase {
  phaseId: PhaseId;
  status: PhaseStatus;
  annexId?: string;
  signedAt?: string;
}

export interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  idNumber: string;
  email: string;
  phone: string;
  courseId: string;
  phases: ParticipantPhase[];
  attendance: {
    sessionsCompleted: number;
    totalSessions: number;
  };
  createdAt: string;
}

export interface Annex {
  id: string;
  participantId: string;
  phaseId: PhaseId;
  title: string;
  status: 'generated' | 'signed';
  generatedAt: string;
  signedAt?: string;
}

export interface RegistrationPayload {
  firstName: string;
  lastName: string;
  idNumber: string;
  email: string;
  phone: string;
  courseId: string;
}
