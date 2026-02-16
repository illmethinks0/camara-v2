import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import { AnnexType, AuthenticatedUser, ErrorCodes, PhaseType, Role } from '../core/domain.js';
import { AnnexKind, TEMPLATE_VERSION, buildAnnexPdf } from './pdf.js';
import { createDeterministicZip } from './zip.js';

type PhaseStatus = 'not_started' | 'in_progress' | 'completed';
type AnnexStatus = 'generated' | 'signed';

type UserRecord = {
  id: string;
  email: string;
  name: string;
  role: Role;
  passwordHash: string;
  createdAt: string;
};

type CourseRecord = {
  id: string;
  name: string;
  description: string;
  durationHours: number;
  startDate: string;
  endDate: string;
};

type ParticipantRecord = {
  id: string;
  userId: string;
  courseId: string;
  firstName: string;
  lastName: string;
  idNumber: string;
  email: string;
  phone: string;
  currentPhase: PhaseType;
  createdAt: string;
  updatedAt: string;
};

type InstructorAssignmentRecord = {
  id: string;
  instructorId: string;
  participantId: string;
  createdAt: string;
};

type PhaseRecord = {
  id: string;
  participantId: string;
  phaseType: PhaseType;
  status: PhaseStatus;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
};

type AnnexRecord = {
  id: string;
  participantId: string;
  phaseId: string;
  annexType: AnnexType;
  status: AnnexStatus;
  templateVersion: string;
  fileName: string;
  storagePath: string;
  contentHash: string;
  generatedAt: string;
  updatedAt: string;
  pdfBuffer: Buffer;
};

type SignatureRecord = {
  id: string;
  annexId: string;
  participantId: string;
  signerUserId: string;
  actorRole: Role;
  typedName?: string;
  signatureDataUrl?: string;
  signedAt: string;
  phaseSnapshot: PhaseType;
};

type AttendanceRecord = {
  id: string;
  participantId: string;
  instructorId: string;
  sessionDate: string;
  hours: number;
  notes?: string;
  createdAt: string;
};

type AuditLogRecord = {
  id: string;
  actorUserId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  context?: Record<string, unknown>;
  createdAt: string;
};

type StoreState = {
  users: UserRecord[];
  courses: CourseRecord[];
  participants: ParticipantRecord[];
  assignments: InstructorAssignmentRecord[];
  phases: PhaseRecord[];
  annexes: AnnexRecord[];
  signatures: SignatureRecord[];
  attendance: AttendanceRecord[];
  auditLogs: AuditLogRecord[];
};

export class StoreError extends Error {
  statusCode: number;
  code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

const DEMO_PASSWORD = 'CamaraMenorca2025';
const PASSWORD_HASH = bcrypt.hashSync(DEMO_PASSWORD, 10);

const REQUIRED_SIGNATURES: Record<AnnexType, Role[]> = {
  annex_2: ['participant', 'instructor'],
  annex_3: ['instructor'],
  annex_5: ['participant', 'instructor', 'administrator'],
};

const PHASE_ORDER: PhaseType[] = ['diagnostic', 'training', 'completion'];

function nowIso(): string {
  return new Date().toISOString();
}

function formatDate(value: string): string {
  return new Date(value).toISOString().slice(0, 10);
}

function normalizeName(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function randomId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

function phaseToAnnexType(phaseType: PhaseType): AnnexType {
  if (phaseType === 'diagnostic') return 'annex_2';
  if (phaseType === 'training') return 'annex_3';
  return 'annex_5';
}

function annexTypeToPhase(annexType: AnnexType): PhaseType {
  if (annexType === 'annex_2') return 'diagnostic';
  if (annexType === 'annex_3') return 'training';
  return 'completion';
}

function phaseLabel(phase: PhaseType): string {
  if (phase === 'diagnostic') return 'Diagnostico';
  if (phase === 'training') return 'Formacion';
  return 'Finalizacion';
}

function annexTitle(annexType: AnnexType): string {
  if (annexType === 'annex_2') return 'Anexo 2';
  if (annexType === 'annex_3') return 'Anexo 3';
  return 'Anexo 5';
}

function createEmptyState(): StoreState {
  return {
    users: [],
    courses: [],
    participants: [],
    assignments: [],
    phases: [],
    annexes: [],
    signatures: [],
    attendance: [],
    auditLogs: [],
  };
}

let store: StoreState = createEmptyState();

function createInitialState(): StoreState {
  const state = createEmptyState();
  store = state;

  const createdAt = '2025-02-06T10:00:00.000Z';
  const courseId = 'course-programa-emprendimiento-2025';

  state.courses.push(
    {
      id: courseId,
      name: 'Programa de Emprendimiento Digital 2025',
      description: 'Programa demo para el pitch de Madrid.',
      durationHours: 120,
      startDate: '2025-01-15',
      endDate: '2025-04-30',
    },
    {
      id: 'course-talento-45-marketing',
      name: 'Talento 45+ - Marketing Digital',
      description: 'Curso de apoyo complementario',
      durationHours: 80,
      startDate: '2025-02-01',
      endDate: '2025-05-15',
    }
  );

  const users: UserRecord[] = [
    {
      id: 'user-admin-ana',
      email: 'admin@camara-menorca.es',
      name: 'Ana Garcia Ruiz',
      role: 'administrator',
      passwordHash: PASSWORD_HASH,
      createdAt,
    },
    {
      id: 'user-admin-godmode',
      email: 'godmode@camara-menorca.es',
      name: 'God Mode Admin',
      role: 'administrator',
      passwordHash: PASSWORD_HASH,
      createdAt,
    },
    {
      id: 'user-instructor-carlos',
      email: 'instructor1@camara-menorca.es',
      name: 'Carlos Martinez Lopez',
      role: 'instructor',
      passwordHash: PASSWORD_HASH,
      createdAt,
    },
    {
      id: 'user-instructor-isabel',
      email: 'instructor2@camara-menorca.es',
      name: 'Isabel Fernandez Torres',
      role: 'instructor',
      passwordHash: PASSWORD_HASH,
      createdAt,
    },
    {
      id: 'user-participant-miguel',
      email: 'participant1@camara-menorca.es',
      name: 'Miguel Sanchez Vega',
      role: 'participant',
      passwordHash: PASSWORD_HASH,
      createdAt,
    },
    {
      id: 'user-participant-laura',
      email: 'participant2@camara-menorca.es',
      name: 'Laura Rodriguez Mora',
      role: 'participant',
      passwordHash: PASSWORD_HASH,
      createdAt,
    },
    {
      id: 'user-participant-david',
      email: 'participant3@camara-menorca.es',
      name: 'David Hernandez Cruz',
      role: 'participant',
      passwordHash: PASSWORD_HASH,
      createdAt,
    },
    {
      id: 'user-participant-sofia',
      email: 'participant4@camara-menorca.es',
      name: 'Sofia Lopez Navarro',
      role: 'participant',
      passwordHash: PASSWORD_HASH,
      createdAt,
    },
    {
      id: 'user-participant-javier',
      email: 'participant5@camara-menorca.es',
      name: 'Javier Morales Ruiz',
      role: 'participant',
      passwordHash: PASSWORD_HASH,
      createdAt,
    },
  ];

  state.users.push(...users);

  const participants: ParticipantRecord[] = [
    {
      id: 'participant-miguel',
      userId: 'user-participant-miguel',
      courseId,
      firstName: 'Miguel',
      lastName: 'Sanchez Vega',
      idNumber: '43256789X',
      email: 'participant1@camara-menorca.es',
      phone: '+34 611 111 111',
      currentPhase: 'diagnostic',
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: 'participant-laura',
      userId: 'user-participant-laura',
      courseId,
      firstName: 'Laura',
      lastName: 'Rodriguez Mora',
      idNumber: '54123456W',
      email: 'participant2@camara-menorca.es',
      phone: '+34 622 222 222',
      currentPhase: 'training',
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: 'participant-david',
      userId: 'user-participant-david',
      courseId,
      firstName: 'David',
      lastName: 'Hernandez Cruz',
      idNumber: '55111222J',
      email: 'participant3@camara-menorca.es',
      phone: '+34 633 333 333',
      currentPhase: 'diagnostic',
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: 'participant-sofia',
      userId: 'user-participant-sofia',
      courseId,
      firstName: 'Sofia',
      lastName: 'Lopez Navarro',
      idNumber: '66777888K',
      email: 'participant4@camara-menorca.es',
      phone: '+34 644 444 444',
      currentPhase: 'completion',
      createdAt,
      updatedAt: createdAt,
    },
    {
      id: 'participant-javier',
      userId: 'user-participant-javier',
      courseId,
      firstName: 'Javier',
      lastName: 'Morales Ruiz',
      idNumber: '77888999L',
      email: 'participant5@camara-menorca.es',
      phone: '+34 655 555 555',
      currentPhase: 'training',
      createdAt,
      updatedAt: createdAt,
    },
  ];

  state.participants.push(...participants);

  state.assignments.push(
    {
      id: 'assignment-carlos-miguel',
      instructorId: 'user-instructor-carlos',
      participantId: 'participant-miguel',
      createdAt,
    },
    {
      id: 'assignment-carlos-laura',
      instructorId: 'user-instructor-carlos',
      participantId: 'participant-laura',
      createdAt,
    },
    {
      id: 'assignment-carlos-sofia',
      instructorId: 'user-instructor-carlos',
      participantId: 'participant-sofia',
      createdAt,
    },
    {
      id: 'assignment-isabel-david',
      instructorId: 'user-instructor-isabel',
      participantId: 'participant-david',
      createdAt,
    },
    {
      id: 'assignment-isabel-javier',
      instructorId: 'user-instructor-isabel',
      participantId: 'participant-javier',
      createdAt,
    }
  );

  for (const participant of participants) {
    const defaultStatuses: Record<PhaseType, PhaseStatus> = {
      diagnostic: 'not_started',
      training: 'not_started',
      completion: 'not_started',
    };

    if (participant.id === 'participant-miguel') {
      defaultStatuses.diagnostic = 'in_progress';
    }

    if (participant.id === 'participant-laura') {
      defaultStatuses.diagnostic = 'completed';
      defaultStatuses.training = 'in_progress';
    }

    if (participant.id === 'participant-sofia') {
      defaultStatuses.diagnostic = 'completed';
      defaultStatuses.training = 'completed';
      defaultStatuses.completion = 'completed';
    }

    if (participant.id === 'participant-javier') {
      defaultStatuses.diagnostic = 'completed';
      defaultStatuses.training = 'in_progress';
    }

    for (const phaseType of PHASE_ORDER) {
      state.phases.push({
        id: `phase-${participant.id}-${phaseType}`,
        participantId: participant.id,
        phaseType,
        status: defaultStatuses[phaseType],
        startedAt: defaultStatuses[phaseType] === 'not_started' ? undefined : createdAt,
        completedAt: defaultStatuses[phaseType] === 'completed' ? createdAt : undefined,
        createdAt,
        updatedAt: createdAt,
      });
    }
  }

  // Seed demo annexes/signatures for script consistency.
  const miguelAnnex = generateOrRefreshAnnex(state, 'participant-miguel', 'annex_2', createdAt);
  const lauraAnnex = generateOrRefreshAnnex(state, 'participant-laura', 'annex_2', createdAt);
  addSignatureToAnnex(state, lauraAnnex.id, {
    signerUserId: 'user-participant-laura',
    actorRole: 'participant',
    typedName: 'Laura Rodriguez Mora',
    signedAt: createdAt,
  });
  addSignatureToAnnex(state, lauraAnnex.id, {
    signerUserId: 'user-instructor-carlos',
    actorRole: 'instructor',
    typedName: 'Carlos Martinez Lopez',
    signedAt: createdAt,
  });

  const sofiaAnnex2 = generateOrRefreshAnnex(state, 'participant-sofia', 'annex_2', createdAt);
  const sofiaAnnex3 = generateOrRefreshAnnex(state, 'participant-sofia', 'annex_3', createdAt);
  const sofiaAnnex5 = generateOrRefreshAnnex(state, 'participant-sofia', 'annex_5', createdAt);

  addSignatureToAnnex(state, sofiaAnnex2.id, {
    signerUserId: 'user-participant-sofia',
    actorRole: 'participant',
    typedName: 'Sofia Lopez Navarro',
    signedAt: createdAt,
  });
  addSignatureToAnnex(state, sofiaAnnex2.id, {
    signerUserId: 'user-instructor-carlos',
    actorRole: 'instructor',
    typedName: 'Carlos Martinez Lopez',
    signedAt: createdAt,
  });

  addSignatureToAnnex(state, sofiaAnnex3.id, {
    signerUserId: 'user-instructor-carlos',
    actorRole: 'instructor',
    typedName: 'Carlos Martinez Lopez',
    signedAt: createdAt,
  });

  addSignatureToAnnex(state, sofiaAnnex5.id, {
    signerUserId: 'user-participant-sofia',
    actorRole: 'participant',
    typedName: 'Sofia Lopez Navarro',
    signedAt: createdAt,
  });
  addSignatureToAnnex(state, sofiaAnnex5.id, {
    signerUserId: 'user-instructor-carlos',
    actorRole: 'instructor',
    typedName: 'Carlos Martinez Lopez',
    signedAt: createdAt,
  });
  addSignatureToAnnex(state, sofiaAnnex5.id, {
    signerUserId: 'user-admin-ana',
    actorRole: 'administrator',
    typedName: 'Ana Garcia Ruiz',
    signedAt: createdAt,
  });

  state.attendance.push(
    {
      id: 'attendance-laura-1',
      participantId: 'participant-laura',
      instructorId: 'user-instructor-carlos',
      sessionDate: '2025-01-22',
      hours: 4,
      notes: 'Excelente participacion en la sesion de hoy.',
      createdAt,
    },
    {
      id: 'attendance-laura-2',
      participantId: 'participant-laura',
      instructorId: 'user-instructor-carlos',
      sessionDate: '2025-01-29',
      hours: 4,
      notes: 'Avance constante en modulo practico.',
      createdAt,
    }
  );

  // Ensure Miguel annex remains pending signature.
  miguelAnnex.status = 'generated';

  return state;
}

store = createInitialState();

function fail(statusCode: number, code: string, message: string): never {
  throw new StoreError(statusCode, code, message);
}

function findUserOrThrow(userId: string): UserRecord {
  const user = store.users.find((entry) => entry.id === userId);
  if (!user) {
    fail(404, ErrorCodes.DB_RECORD_NOT_FOUND, 'Usuario no encontrado');
  }
  return user;
}

function findCourseOrThrow(courseId: string): CourseRecord {
  const course = store.courses.find((entry) => entry.id === courseId);
  if (!course) {
    fail(404, ErrorCodes.DB_RECORD_NOT_FOUND, 'Curso no encontrado');
  }
  return course;
}

function findParticipantOrThrow(participantId: string): ParticipantRecord {
  const participant = store.participants.find((entry) => entry.id === participantId);
  if (!participant) {
    fail(404, ErrorCodes.DB_RECORD_NOT_FOUND, 'Participante no encontrado');
  }
  return participant;
}

function findPhaseByTypeOrThrow(participantId: string, phaseType: PhaseType): PhaseRecord {
  const phase = store.phases.find(
    (entry) => entry.participantId === participantId && entry.phaseType === phaseType
  );

  if (!phase) {
    fail(404, ErrorCodes.DB_RECORD_NOT_FOUND, 'Fase no encontrada');
  }

  return phase;
}

function findAnnexOrThrow(annexId: string): AnnexRecord {
  const annex = store.annexes.find((entry) => entry.id === annexId);
  if (!annex) {
    fail(404, ErrorCodes.DB_RECORD_NOT_FOUND, 'Anexo no encontrado');
  }
  return annex;
}

function participantIdsForInstructor(instructorId: string): Set<string> {
  return new Set(
    store.assignments
      .filter((assignment) => assignment.instructorId === instructorId)
      .map((assignment) => assignment.participantId)
  );
}

function canAccessParticipant(user: AuthenticatedUser, participantId: string): boolean {
  if (user.role === 'administrator') {
    return true;
  }

  if (user.role === 'instructor') {
    return participantIdsForInstructor(user.userId).has(participantId);
  }

  const participant = store.participants.find((entry) => entry.id === participantId);
  return Boolean(participant && participant.userId === user.userId);
}

function assertParticipantAccess(user: AuthenticatedUser, participantId: string): void {
  if (!canAccessParticipant(user, participantId)) {
    fail(403, ErrorCodes.FORBIDDEN, 'No tienes acceso a este participante');
  }
}

function getPhaseRecords(participantId: string): PhaseRecord[] {
  return PHASE_ORDER.map((phaseType) => findPhaseByTypeOrThrow(participantId, phaseType));
}

function currentPhaseRecord(participantId: string): PhaseRecord {
  const participant = findParticipantOrThrow(participantId);
  return findPhaseByTypeOrThrow(participantId, participant.currentPhase);
}

function signaturesForAnnex(annexId: string): SignatureRecord[] {
  return store.signatures
    .filter((signature) => signature.annexId === annexId)
    .sort((a, b) => a.signedAt.localeCompare(b.signedAt));
}

function isAnnexFullySigned(annex: AnnexRecord): boolean {
  const requiredRoles = REQUIRED_SIGNATURES[annex.annexType];
  const signatureRoles = new Set(signaturesForAnnex(annex.id).map((entry) => entry.actorRole));
  return requiredRoles.every((role) => signatureRoles.has(role));
}

function phaseSummaryStatus(participantId: string, phaseType: PhaseType): PhaseStatus {
  return findPhaseByTypeOrThrow(participantId, phaseType).status;
}

function attendanceSummaryForParticipant(participantId: string): string {
  const records = store.attendance.filter((entry) => entry.participantId === participantId);
  if (records.length === 0) {
    return 'Sin sesiones registradas';
  }

  const totalHours = records.reduce((sum, record) => sum + record.hours, 0);
  return `${records.length} sesiones - ${totalHours.toFixed(1)} horas`;
}

function latestInstructorNote(participantId: string): string | undefined {
  const records = store.attendance
    .filter((entry) => entry.participantId === participantId && entry.notes)
    .sort((a, b) => b.sessionDate.localeCompare(a.sessionDate));

  return records[0]?.notes;
}

function renderAnnexPdf(state: StoreState, annex: AnnexRecord): { buffer: Buffer; contentHash: string } {
  const participant = state.participants.find((entry) => entry.id === annex.participantId);
  if (!participant) {
    fail(404, ErrorCodes.DB_RECORD_NOT_FOUND, 'Participante no encontrado');
  }

  const course = state.courses.find((entry) => entry.id === participant.courseId);
  if (!course) {
    fail(404, ErrorCodes.DB_RECORD_NOT_FOUND, 'Curso no encontrado');
  }

  const signatures = state.signatures
    .filter((entry) => entry.annexId === annex.id)
    .sort((a, b) => a.signedAt.localeCompare(b.signedAt))
    .map((entry) => ({
      role: entry.actorRole,
      name: entry.typedName || findUserOrThrow(entry.signerUserId).name,
      signedAt: formatDate(entry.signedAt),
    }));

  const pdfInput = {
    annexType: annex.annexType as AnnexKind,
    participant: {
      fullName: `${participant.firstName} ${participant.lastName}`,
      idNumber: participant.idNumber,
      email: participant.email,
      phone: participant.phone,
    },
    course: {
      name: course.name,
      durationHours: course.durationHours,
      startDate: course.startDate,
      endDate: course.endDate,
    },
    phaseLabel: phaseLabel(annexTypeToPhase(annex.annexType)),
    generatedAt: formatDate(annex.generatedAt),
    attendanceSummary: attendanceSummaryForParticipant(participant.id),
    instructorNotes: latestInstructorNote(participant.id),
    signatures,
  };

  return buildAnnexPdf(pdfInput);
}

function generateOrRefreshAnnex(
  state: StoreState,
  participantId: string,
  annexType: AnnexType,
  forcedTimestamp?: string
): AnnexRecord {
  const phase = findPhaseByTypeOrThrow(participantId, annexTypeToPhase(annexType));
  const participant = findParticipantOrThrow(participantId);

  const existing = state.annexes.find(
    (entry) => entry.participantId === participantId && entry.phaseId === phase.id && entry.annexType === annexType
  );

  const generatedAt = forcedTimestamp ?? nowIso();

  const annex = existing ?? {
    id: randomId('annex'),
    participantId,
    phaseId: phase.id,
    annexType,
    status: 'generated' as AnnexStatus,
    templateVersion: TEMPLATE_VERSION,
    fileName: `${annexTitle(annexType).replace(/\s+/g, '-')}-${normalizeName(
      `${participant.firstName}-${participant.lastName}`
    )}.pdf`,
    storagePath: `annexes/${participantId}/${annexType}.pdf`,
    contentHash: '',
    generatedAt,
    updatedAt: generatedAt,
    pdfBuffer: Buffer.alloc(0),
  };

  annex.generatedAt = generatedAt;
  annex.updatedAt = generatedAt;

  if (!existing) {
    state.annexes.push(annex);
  }

  const pdf = renderAnnexPdf(state, annex);
  annex.pdfBuffer = pdf.buffer;
  annex.contentHash = pdf.contentHash;

  if (phase.status === 'not_started') {
    phase.status = 'in_progress';
    phase.startedAt = generatedAt;
    phase.updatedAt = generatedAt;
  }

  return annex;
}

function syncAnnexStatus(state: StoreState, annexId: string): void {
  const annex = findAnnexOrThrow(annexId);
  annex.status = isAnnexFullySigned(annex) ? 'signed' : 'generated';
  annex.updatedAt = nowIso();
}

function syncPhaseProgressAfterSignature(participantId: string, phaseType: PhaseType, at: string): void {
  const participant = findParticipantOrThrow(participantId);
  const phase = findPhaseByTypeOrThrow(participantId, phaseType);

  const annexesForPhase = store.annexes.filter(
    (entry) => entry.participantId === participantId && annexTypeToPhase(entry.annexType) === phaseType
  );

  if (annexesForPhase.length === 0 || annexesForPhase.some((entry) => entry.status !== 'signed')) {
    return;
  }

  phase.status = 'completed';
  phase.completedAt = at;
  phase.updatedAt = at;

  const phaseIndex = PHASE_ORDER.indexOf(phaseType);
  const nextPhaseType = PHASE_ORDER[phaseIndex + 1];

  if (!nextPhaseType) {
    participant.currentPhase = 'completion';
    participant.updatedAt = at;
    return;
  }

  const nextPhase = findPhaseByTypeOrThrow(participantId, nextPhaseType);
  if (nextPhase.status === 'not_started') {
    nextPhase.status = 'in_progress';
    nextPhase.startedAt = at;
    nextPhase.updatedAt = at;
  }

  participant.currentPhase = nextPhaseType;
  participant.updatedAt = at;
}

function addSignatureToAnnex(
  state: StoreState,
  annexId: string,
  data: {
    signerUserId: string;
    actorRole: Role;
    typedName?: string;
    signatureDataUrl?: string;
    signedAt?: string;
  }
): SignatureRecord {
  const annex = findAnnexOrThrow(annexId);
  const participant = findParticipantOrThrow(annex.participantId);

  const requiredRoles = REQUIRED_SIGNATURES[annex.annexType];
  if (!requiredRoles.includes(data.actorRole)) {
    fail(422, ErrorCodes.BUSINESS_RULE_VIOLATION, 'La firma no es requerida para este anexo');
  }

  const existingForRole = state.signatures.find(
    (entry) => entry.annexId === annex.id && entry.actorRole === data.actorRole
  );

  if (existingForRole) {
    fail(409, ErrorCodes.BUSINESS_RULE_VIOLATION, 'La firma para este rol ya existe y es inmutable');
  }

  const signedAt = data.signedAt ?? nowIso();

  const signature: SignatureRecord = {
    id: randomId('signature'),
    annexId,
    participantId: participant.id,
    signerUserId: data.signerUserId,
    actorRole: data.actorRole,
    typedName: data.typedName,
    signatureDataUrl: data.signatureDataUrl,
    signedAt,
    phaseSnapshot: annexTypeToPhase(annex.annexType),
  };

  state.signatures.push(signature);
  syncAnnexStatus(state, annex.id);

  const updatedAnnex = findAnnexOrThrow(annex.id);
  const rendered = renderAnnexPdf(state, updatedAnnex);
  updatedAnnex.pdfBuffer = rendered.buffer;
  updatedAnnex.contentHash = rendered.contentHash;
  updatedAnnex.updatedAt = signedAt;

  syncPhaseProgressAfterSignature(participant.id, annexTypeToPhase(annex.annexType), signedAt);

  return signature;
}

function toAuthUser(user: UserRecord): AuthenticatedUser {
  return {
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
  };
}

function participantView(participant: ParticipantRecord, user?: AuthenticatedUser) {
  const phases = getPhaseRecords(participant.id).map((phase) => ({
    id: phase.id,
    phaseType: phase.phaseType,
    status: phase.status,
    startedAt: phase.startedAt,
    completedAt: phase.completedAt,
  }));

  const annexes = store.annexes
    .filter((annex) => annex.participantId === participant.id)
    .map((annex) => ({
      id: annex.id,
      annexType: annex.annexType,
      title: annexTitle(annex.annexType),
      phaseType: annexTypeToPhase(annex.annexType),
      status: annex.status,
      templateVersion: annex.templateVersion,
      generatedAt: annex.generatedAt,
      fileName: annex.fileName,
    }));

  const attendance = store.attendance
    .filter((entry) => entry.participantId === participant.id)
    .map((entry) => ({
      id: entry.id,
      sessionDate: entry.sessionDate,
      hours: entry.hours,
      notes: entry.notes,
      instructorName: findUserOrThrow(entry.instructorId).name,
    }));

  const assignedInstructorIds = store.assignments
    .filter((assignment) => assignment.participantId === participant.id)
    .map((assignment) => assignment.instructorId);

  return {
    id: participant.id,
    userId: participant.userId,
    firstName: participant.firstName,
    lastName: participant.lastName,
    fullName: `${participant.firstName} ${participant.lastName}`,
    idNumber: participant.idNumber,
    email: participant.email,
    phone: participant.phone,
    courseId: participant.courseId,
    courseName: findCourseOrThrow(participant.courseId).name,
    currentPhase: participant.currentPhase,
    phases,
    annexes,
    attendance,
    assignedInstructorIds,
    createdAt: participant.createdAt,
    updatedAt: participant.updatedAt,
    canEdit: user?.role === 'administrator',
  };
}

function appendAuditLog(entry: Omit<AuditLogRecord, 'id' | 'createdAt'>): void {
  store.auditLogs.push({
    id: randomId('audit'),
    createdAt: nowIso(),
    ...entry,
  });
}

export const camaraStore = {
  resetForTests(): void {
    store = createInitialState();
  },

  getUserByEmail(email: string): UserRecord | undefined {
    return store.users.find((user) => user.email.toLowerCase() === email.trim().toLowerCase());
  },

  getUserById(userId: string): UserRecord | undefined {
    return store.users.find((user) => user.id === userId);
  },

  verifyPassword(user: UserRecord, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  },

  listCourses() {
    return store.courses.map((course) => ({
      ...course,
    }));
  },

  createAuthUser(input: {
    email: string;
    name: string;
    passwordHash: string;
    role?: Role;
  }): AuthenticatedUser {
    if (store.users.some((entry) => entry.email.toLowerCase() === input.email.toLowerCase())) {
      fail(409, ErrorCodes.DB_UNIQUE_VIOLATION, 'El email ya esta registrado');
    }

    const user: UserRecord = {
      id: randomId('user'),
      email: input.email,
      name: input.name,
      role: input.role ?? 'participant',
      passwordHash: input.passwordHash,
      createdAt: nowIso(),
    };

    store.users.push(user);

    appendAuditLog({
      actorUserId: user.id,
      action: 'user_registered',
      resourceType: 'user',
      resourceId: user.id,
      context: { role: user.role },
    });

    return toAuthUser(user);
  },

  listParticipants(user: AuthenticatedUser) {
    const participants =
      user.role === 'administrator'
        ? store.participants
        : user.role === 'instructor'
          ? store.participants.filter((participant) => canAccessParticipant(user, participant.id))
          : store.participants.filter((participant) => participant.userId === user.userId);

    return participants.map((participant) => participantView(participant, user));
  },

  getParticipant(user: AuthenticatedUser, participantId: string) {
    assertParticipantAccess(user, participantId);
    const participant = findParticipantOrThrow(participantId);
    return participantView(participant, user);
  },

  createParticipant(
    user: AuthenticatedUser,
    input: {
      firstName: string;
      lastName: string;
      idNumber: string;
      email: string;
      phone: string;
      courseId: string;
      createLogin?: boolean;
    }
  ) {
    if (user.role !== 'administrator') {
      fail(403, ErrorCodes.FORBIDDEN, 'Solo administracion puede crear participantes');
    }

    findCourseOrThrow(input.courseId);

    const timestamp = nowIso();
    const participantId = randomId('participant');

    let participantUserId = '';
    if (input.createLogin !== false) {
      const existingUser = store.users.find((entry) => entry.email.toLowerCase() === input.email.toLowerCase());
      if (existingUser) {
        participantUserId = existingUser.id;
      } else {
        const newUser: UserRecord = {
          id: randomId('user'),
          email: input.email,
          name: `${input.firstName} ${input.lastName}`,
          role: 'participant',
          passwordHash: PASSWORD_HASH,
          createdAt: timestamp,
        };
        store.users.push(newUser);
        participantUserId = newUser.id;
      }
    }

    const participant: ParticipantRecord = {
      id: participantId,
      userId: participantUserId,
      courseId: input.courseId,
      firstName: input.firstName,
      lastName: input.lastName,
      idNumber: input.idNumber,
      email: input.email,
      phone: input.phone,
      currentPhase: 'diagnostic',
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    store.participants.push(participant);

    for (const phaseType of PHASE_ORDER) {
      store.phases.push({
        id: randomId('phase'),
        participantId,
        phaseType,
        status: phaseType === 'diagnostic' ? 'in_progress' : 'not_started',
        startedAt: phaseType === 'diagnostic' ? timestamp : undefined,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    }

    appendAuditLog({
      actorUserId: user.userId,
      action: 'participant_created',
      resourceType: 'participant',
      resourceId: participantId,
      context: { courseId: input.courseId },
    });

    return participantView(participant, user);
  },

  updateParticipant(
    user: AuthenticatedUser,
    participantId: string,
    input: Partial<{
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      courseId: string;
      currentPhase: PhaseType;
    }>
  ) {
    if (user.role !== 'administrator') {
      fail(403, ErrorCodes.FORBIDDEN, 'Solo administracion puede actualizar participantes');
    }

    const participant = findParticipantOrThrow(participantId);

    if (input.courseId) {
      findCourseOrThrow(input.courseId);
      participant.courseId = input.courseId;
    }

    if (input.firstName) participant.firstName = input.firstName;
    if (input.lastName) participant.lastName = input.lastName;
    if (input.email) participant.email = input.email;
    if (input.phone) participant.phone = input.phone;
    if (input.currentPhase) participant.currentPhase = input.currentPhase;
    participant.updatedAt = nowIso();

    appendAuditLog({
      actorUserId: user.userId,
      action: 'participant_updated',
      resourceType: 'participant',
      resourceId: participant.id,
      context: { fields: Object.keys(input) },
    });

    return participantView(participant, user);
  },

  getParticipantPhase(user: AuthenticatedUser, participantId: string) {
    assertParticipantAccess(user, participantId);

    return getPhaseRecords(participantId).map((phase) => ({
      id: phase.id,
      phaseType: phase.phaseType,
      status: phase.status,
      startedAt: phase.startedAt,
      completedAt: phase.completedAt,
    }));
  },

  progressPhase(user: AuthenticatedUser, participantId: string, override = false) {
    assertParticipantAccess(user, participantId);

    if (user.role === 'participant') {
      fail(403, ErrorCodes.FORBIDDEN, 'Participante no puede avanzar fases manualmente');
    }

    const participant = findParticipantOrThrow(participantId);
    const activePhase = currentPhaseRecord(participantId);

    if (activePhase.status === 'completed') {
      fail(422, ErrorCodes.BUSINESS_RULE_VIOLATION, 'La fase actual ya esta completada');
    }

    const annexType = phaseToAnnexType(activePhase.phaseType);
    const annex = store.annexes.find(
      (entry) => entry.participantId === participantId && entry.annexType === annexType
    );

    if (!override && (!annex || annex.status !== 'signed')) {
      fail(
        422,
        ErrorCodes.BUSINESS_RULE_VIOLATION,
        'No se puede avanzar fase sin anexo firmado (usa override admin si procede)'
      );
    }

    const at = nowIso();
    activePhase.status = 'completed';
    activePhase.completedAt = at;
    activePhase.updatedAt = at;

    const currentIndex = PHASE_ORDER.indexOf(activePhase.phaseType);
    const nextPhaseType = PHASE_ORDER[currentIndex + 1];

    if (nextPhaseType) {
      const nextPhase = findPhaseByTypeOrThrow(participantId, nextPhaseType);
      if (nextPhase.status === 'not_started') {
        nextPhase.status = 'in_progress';
        nextPhase.startedAt = at;
        nextPhase.updatedAt = at;
      }
      participant.currentPhase = nextPhaseType;
    }

    participant.updatedAt = at;

    appendAuditLog({
      actorUserId: user.userId,
      action: 'phase_progressed',
      resourceType: 'phase',
      resourceId: activePhase.id,
      context: { override, from: activePhase.phaseType, to: nextPhaseType ?? 'none' },
    });

    return {
      participantId,
      currentPhase: participant.currentPhase,
      phases: this.getParticipantPhase(user, participantId),
    };
  },

  generateAnnex(
    user: AuthenticatedUser,
    participantId: string,
    annexTypeInput?: AnnexType,
    override = false
  ) {
    assertParticipantAccess(user, participantId);

    if (!['administrator', 'instructor'].includes(user.role)) {
      fail(403, ErrorCodes.FORBIDDEN, 'Solo administracion e instructores generan anexos');
    }

    const participant = findParticipantOrThrow(participantId);

    const annexType = annexTypeInput ?? phaseToAnnexType(participant.currentPhase);
    const targetPhase = annexTypeToPhase(annexType);

    if (!override && targetPhase !== participant.currentPhase) {
      fail(422, ErrorCodes.BUSINESS_RULE_VIOLATION, 'No se pueden generar anexos fuera de la fase actual');
    }

    const annex = generateOrRefreshAnnex(store, participantId, annexType);

    appendAuditLog({
      actorUserId: user.userId,
      action: 'annex_generated',
      resourceType: 'annex',
      resourceId: annex.id,
      context: { annexType },
    });

    return {
      id: annex.id,
      participantId: annex.participantId,
      phaseId: annex.phaseId,
      annexType: annex.annexType,
      status: annex.status,
      templateVersion: annex.templateVersion,
      generatedAt: annex.generatedAt,
      fileName: annex.fileName,
      contentHash: annex.contentHash,
    };
  },

  listParticipantAnnexes(user: AuthenticatedUser, participantId: string) {
    assertParticipantAccess(user, participantId);

    return store.annexes
      .filter((annex) => annex.participantId === participantId)
      .sort((a, b) => a.generatedAt.localeCompare(b.generatedAt))
      .map((annex) => ({
        id: annex.id,
        participantId: annex.participantId,
        phaseId: annex.phaseId,
        phaseType: annexTypeToPhase(annex.annexType),
        annexType: annex.annexType,
        title: annexTitle(annex.annexType),
        status: annex.status,
        templateVersion: annex.templateVersion,
        generatedAt: annex.generatedAt,
        fileName: annex.fileName,
        contentHash: annex.contentHash,
      }));
  },

  getAnnex(user: AuthenticatedUser, annexId: string) {
    const annex = findAnnexOrThrow(annexId);
    assertParticipantAccess(user, annex.participantId);

    return {
      id: annex.id,
      participantId: annex.participantId,
      phaseId: annex.phaseId,
      phaseType: annexTypeToPhase(annex.annexType),
      annexType: annex.annexType,
      title: annexTitle(annex.annexType),
      status: annex.status,
      templateVersion: annex.templateVersion,
      generatedAt: annex.generatedAt,
      fileName: annex.fileName,
      contentHash: annex.contentHash,
      downloadPath: `/api/v1/annexes/${annex.id}/download`,
    };
  },

  getAnnexDownload(user: AuthenticatedUser, annexId: string) {
    const annex = findAnnexOrThrow(annexId);
    assertParticipantAccess(user, annex.participantId);

    return {
      fileName: annex.fileName,
      buffer: annex.pdfBuffer,
      contentHash: annex.contentHash,
    };
  },

  addSignature(
    user: AuthenticatedUser,
    annexId: string,
    input: { typedName?: string; signatureDataUrl?: string }
  ) {
    const annex = findAnnexOrThrow(annexId);
    assertParticipantAccess(user, annex.participantId);

    if (user.role === 'participant') {
      const participant = findParticipantOrThrow(annex.participantId);
      if (participant.userId !== user.userId) {
        fail(403, ErrorCodes.FORBIDDEN, 'Participante solo puede firmar sus documentos');
      }
    }

    const signature = addSignatureToAnnex(store, annexId, {
      signerUserId: user.userId,
      actorRole: user.role,
      typedName: input.typedName || user.name,
      signatureDataUrl: input.signatureDataUrl,
    });

    appendAuditLog({
      actorUserId: user.userId,
      action: 'annex_signed',
      resourceType: 'signature',
      resourceId: signature.id,
      context: { annexId },
    });

    return {
      id: signature.id,
      annexId: signature.annexId,
      participantId: signature.participantId,
      signerUserId: signature.signerUserId,
      actorRole: signature.actorRole,
      typedName: signature.typedName,
      signedAt: signature.signedAt,
      phaseSnapshot: signature.phaseSnapshot,
    };
  },

  listSignatures(user: AuthenticatedUser, annexId: string) {
    const annex = findAnnexOrThrow(annexId);
    assertParticipantAccess(user, annex.participantId);

    return signaturesForAnnex(annexId).map((signature) => ({
      id: signature.id,
      annexId: signature.annexId,
      participantId: signature.participantId,
      signerUserId: signature.signerUserId,
      actorRole: signature.actorRole,
      typedName: signature.typedName,
      signedAt: signature.signedAt,
      phaseSnapshot: signature.phaseSnapshot,
    }));
  },

  markAttendance(
    user: AuthenticatedUser,
    participantId: string,
    input: { sessionDate: string; hours: number; notes?: string }
  ) {
    assertParticipantAccess(user, participantId);

    if (!['administrator', 'instructor'].includes(user.role)) {
      fail(403, ErrorCodes.FORBIDDEN, 'Solo administracion e instructores registran asistencia');
    }

    const participant = findParticipantOrThrow(participantId);

    const record: AttendanceRecord = {
      id: randomId('attendance'),
      participantId,
      instructorId: user.userId,
      sessionDate: input.sessionDate,
      hours: Number(input.hours.toFixed(1)),
      notes: input.notes,
      createdAt: nowIso(),
    };

    store.attendance.push(record);

    appendAuditLog({
      actorUserId: user.userId,
      action: 'attendance_marked',
      resourceType: 'attendance',
      resourceId: record.id,
      context: { participantId, hours: record.hours },
    });

    participant.updatedAt = nowIso();

    return {
      id: record.id,
      participantId: record.participantId,
      instructorId: record.instructorId,
      instructorName: findUserOrThrow(record.instructorId).name,
      sessionDate: record.sessionDate,
      hours: record.hours,
      notes: record.notes,
      createdAt: record.createdAt,
    };
  },

  listAttendance(user: AuthenticatedUser, participantId: string) {
    assertParticipantAccess(user, participantId);

    return store.attendance
      .filter((entry) => entry.participantId === participantId)
      .sort((a, b) => a.sessionDate.localeCompare(b.sessionDate))
      .map((entry) => ({
        id: entry.id,
        participantId: entry.participantId,
        instructorId: entry.instructorId,
        instructorName: findUserOrThrow(entry.instructorId).name,
        sessionDate: entry.sessionDate,
        hours: entry.hours,
        notes: entry.notes,
        createdAt: entry.createdAt,
      }));
  },

  getAdminDashboard(user: AuthenticatedUser) {
    if (user.role !== 'administrator') {
      fail(403, ErrorCodes.FORBIDDEN, 'Solo administracion puede acceder al dashboard global');
    }

    const participants = store.participants.map((participant) => participantView(participant, user));
    const annexesGenerated = store.annexes.length;
    const annexesSigned = store.annexes.filter((annex) => annex.status === 'signed').length;

    return {
      totals: {
        participants: participants.length,
        annexesGenerated,
        annexesSigned,
        pendingSignatures: annexesGenerated - annexesSigned,
      },
      phases: {
        diagnostic: store.participants.filter((participant) => participant.currentPhase === 'diagnostic').length,
        training: store.participants.filter((participant) => participant.currentPhase === 'training').length,
        completion: store.participants.filter((participant) => participant.currentPhase === 'completion').length,
      },
      participants,
      recentAttendance: [...store.attendance]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 10)
        .map((entry) => ({
          id: entry.id,
          participantId: entry.participantId,
          participantName: participantView(findParticipantOrThrow(entry.participantId)).fullName,
          sessionDate: entry.sessionDate,
          hours: entry.hours,
        })),
    };
  },

  getInstructorDashboard(user: AuthenticatedUser) {
    if (user.role !== 'instructor') {
      fail(403, ErrorCodes.FORBIDDEN, 'Solo instructores acceden a este dashboard');
    }

    const assignedIds = participantIdsForInstructor(user.userId);
    const participants = store.participants
      .filter((participant) => assignedIds.has(participant.id))
      .map((participant) => participantView(participant, user));

    return {
      instructor: {
        id: user.userId,
        name: user.name,
      },
      totals: {
        participants: participants.length,
        attendanceRecords: store.attendance.filter((entry) => assignedIds.has(entry.participantId)).length,
        pendingSignatures: store.annexes.filter(
          (annex) => assignedIds.has(annex.participantId) && annex.status !== 'signed'
        ).length,
      },
      participants,
    };
  },

  getParticipantDashboard(user: AuthenticatedUser) {
    if (user.role !== 'participant') {
      fail(403, ErrorCodes.FORBIDDEN, 'Solo participantes acceden a este dashboard');
    }

    const participant = store.participants.find((entry) => entry.userId === user.userId);
    if (!participant) {
      fail(404, ErrorCodes.DB_RECORD_NOT_FOUND, 'No existe perfil de participante para este usuario');
    }

    const profile = participantView(participant, user);

    return {
      participant: profile,
      pendingAnnexes: profile.annexes.filter((annex) => annex.status !== 'signed').length,
      signedAnnexes: profile.annexes.filter((annex) => annex.status === 'signed').length,
    };
  },

  batchExportAnnexes(
    user: AuthenticatedUser,
    input: {
      participantIds?: string[];
      annexIds?: string[];
      signedOnly?: boolean;
    }
  ) {
    const allowedParticipantIds =
      user.role === 'administrator'
        ? new Set(store.participants.map((participant) => participant.id))
        : user.role === 'instructor'
          ? participantIdsForInstructor(user.userId)
          : new Set(
              store.participants
                .filter((participant) => participant.userId === user.userId)
                .map((participant) => participant.id)
            );

    let annexes = store.annexes.filter((annex) => allowedParticipantIds.has(annex.participantId));

    if (input.participantIds && input.participantIds.length > 0) {
      const participantSet = new Set(input.participantIds);
      annexes = annexes.filter((annex) => participantSet.has(annex.participantId));
    }

    if (input.annexIds && input.annexIds.length > 0) {
      const annexSet = new Set(input.annexIds);
      annexes = annexes.filter((annex) => annexSet.has(annex.id));
    }

    const signedOnly = input.signedOnly ?? false;
    if (signedOnly) {
      annexes = annexes.filter((annex) => annex.status === 'signed');
    }

    if (annexes.length === 0) {
      fail(404, ErrorCodes.DB_RECORD_NOT_FOUND, 'No se encontraron anexos para exportar');
    }

    const entries = annexes.map((annex) => {
      const participant = findParticipantOrThrow(annex.participantId);
      const fileName = `${annexTitle(annex.annexType).replace(/\s+/g, '-')}-${normalizeName(
        `${participant.firstName}-${participant.lastName}`
      )}.pdf`;
      return {
        name: fileName,
        data: annex.pdfBuffer,
      };
    });

    const zipBuffer = createDeterministicZip(entries);

    appendAuditLog({
      actorUserId: user.userId,
      action: 'annexes_batch_exported',
      resourceType: 'annex',
      context: {
        count: entries.length,
        signedOnly,
      },
    });

    return {
      fileName: `anexos-export-${formatDate(nowIso())}.zip`,
      buffer: zipBuffer,
      count: entries.length,
    };
  },

  toAuthUser,
};
