import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type {
  Annex,
  Course,
  Participant,
  ParticipantPhase,
  PhaseDefinition,
  PhaseId,
  PhaseStatus,
  RegistrationPayload,
} from '../types/training';
import type { AnnexDTO, ParticipantDTO } from '../types/camara';
import {
  batchExportAnnexes as apiBatchExportAnnexes,
  createParticipant as apiCreateParticipant,
  downloadAnnex as apiDownloadAnnex,
  generateAnnex as apiGenerateAnnex,
  getCourses as apiGetCourses,
  getParticipants as apiGetParticipants,
  isAuthenticated as hasStoredAuth,
  markAttendance as apiMarkAttendance,
  progressPhase as apiProgressPhase,
  signAnnex as apiSignAnnex,
} from '../services/camaraApi';
import { useAuth } from './AuthContext';

const PHASES: Array<PhaseDefinition & { annexType: AnnexDTO['annexType']; annexNumber: 2 | 3 | 5 }> = [
  { id: 'diagnostic', label: 'Fase Diagnostico', annexName: 'Anexo 2', annexType: 'annex_2', annexNumber: 2 },
  { id: 'training', label: 'Fase Formacion', annexName: 'Anexo 3', annexType: 'annex_3', annexNumber: 3 },
  { id: 'completion', label: 'Fase Finalizacion', annexName: 'Anexo 5', annexType: 'annex_5', annexNumber: 5 },
];

const DEFAULT_TOTAL_SESSIONS = 6;
const PHASE_TO_ANNEX_NUMBER: Record<PhaseId, 2 | 3 | 5> = {
  diagnostic: 2,
  training: 3,
  completion: 5,
};
const PHASE_ORDER: PhaseId[] = ['diagnostic', 'training', 'completion'];

function triggerBrowserDownload(blob: Blob, fileName: string): void {
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}

function mapPhaseStatus(
  phaseStatus: 'not_started' | 'in_progress' | 'completed',
  annexStatus?: 'generated' | 'signed'
): PhaseStatus {
  if (phaseStatus === 'completed') {
    return 'completed';
  }

  if (annexStatus === 'signed') {
    return 'signed';
  }

  if (annexStatus === 'generated') {
    return 'annex_generated';
  }

  return phaseStatus;
}

function mapAnnexToView(annex: AnnexDTO): Annex {
  return {
    id: annex.id,
    participantId: annex.participantId,
    phaseId: annex.phaseType,
    title: annex.title,
    status: annex.status,
    generatedAt: annex.generatedAt,
  };
}

function mapParticipantToView(dto: ParticipantDTO): Participant {
  const latestAnnexByPhase = new Map<PhaseId, AnnexDTO>();
  const annexesByDate = [...dto.annexes].sort((a, b) => a.generatedAt.localeCompare(b.generatedAt));

  for (const annex of annexesByDate) {
    latestAnnexByPhase.set(annex.phaseType, annex);
  }

  const phases: ParticipantPhase[] = PHASES.map((phaseDefinition) => {
    const phaseRecord = dto.phases.find((phase) => phase.phaseType === phaseDefinition.id);
    const annexRecord = latestAnnexByPhase.get(phaseDefinition.id);

    return {
      phaseId: phaseDefinition.id,
      status: mapPhaseStatus(phaseRecord?.status ?? 'not_started', annexRecord?.status),
      annexId: annexRecord?.id,
      annexType: annexRecord?.annexType,
    };
  });

  const sessionsCompleted = dto.attendance.length;
  const hoursCompleted = dto.attendance.reduce((sum, record) => sum + record.hours, 0);

  return {
    id: dto.id,
    firstName: dto.firstName,
    lastName: dto.lastName,
    idNumber: dto.idNumber,
    email: dto.email,
    phone: dto.phone,
    courseId: dto.courseId,
    phases,
    attendance: {
      sessionsCompleted,
      totalSessions: Math.max(DEFAULT_TOTAL_SESSIONS, sessionsCompleted),
      hoursCompleted,
    },
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

function mergeParticipantAnnexes(participants: ParticipantDTO[]): Annex[] {
  const annexesById = new Map<string, Annex>();

  for (const participant of participants) {
    for (const annex of participant.annexes) {
      annexesById.set(annex.id, mapAnnexToView(annex));
    }
  }

  return [...annexesById.values()].sort((a, b) => b.generatedAt.localeCompare(a.generatedAt));
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Operacion no disponible en este momento';
}

interface DemoDataContextValue {
  phases: PhaseDefinition[];
  courses: Course[];
  participants: Participant[];
  annexes: Annex[];
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  registerParticipant: (payload: RegistrationPayload) => Promise<Participant>;
  generateAnnex: (participantId: string, phaseId: PhaseId) => Promise<Annex | null>;
  signAnnex: (annexId: string) => Promise<void>;
  advancePhase: (participantId: string) => Promise<void>;
  markAttendance: (participantId: string) => Promise<void>;
  downloadAnnex: (annexId: string) => Promise<void>;
  exportSignedAnnexesZip: (participantIds?: string[]) => Promise<void>;
  getParticipantPhase: (participant: Participant, phaseId: PhaseId) => ParticipantPhase | undefined;
  getCurrentPhase: (participant: Participant) => ParticipantPhase | undefined;
  getCourseName: (courseId: string) => string;
  getPhaseLabel: (phaseId: PhaseId) => string;
  getAnnexById: (annexId?: string) => Annex | undefined;
}

const DemoDataContext = createContext<DemoDataContextValue | undefined>(undefined);

export const DemoDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [annexes, setAnnexes] = useState<Annex[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getCourseName = (courseId: string) => courses.find((course) => course.id === courseId)?.name || 'Curso';

  const getPhaseLabel = (phaseId: PhaseId) => PHASES.find((phase) => phase.id === phaseId)?.label || 'Fase';

  const getParticipantPhase = (participant: Participant, phaseId: PhaseId) =>
    participant.phases.find((phase) => phase.phaseId === phaseId);

  const getCurrentPhase = (participant: Participant) => {
    const phasesByOrder = [...participant.phases].sort(
      (a, b) => PHASE_ORDER.indexOf(a.phaseId) - PHASE_ORDER.indexOf(b.phaseId)
    );

    return phasesByOrder.find((phase) => !['signed', 'completed'].includes(phase.status));
  };

  const getAnnexById = (annexId?: string) => annexes.find((annex) => annex.id === annexId);

  const applyParticipantData = useCallback((items: ParticipantDTO[]) => {
    setParticipants(items.map((participant) => mapParticipantToView(participant)));
    setAnnexes(mergeParticipantAnnexes(items));
  }, []);

  const refreshCourses = useCallback(async () => {
    const result = await apiGetCourses();
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || 'No se pudieron cargar los cursos');
    }

    setCourses(result.data.courses.map((course) => ({ id: course.id, name: course.name })));
  }, []);

  const refreshParticipants = useCallback(async () => {
    if (!hasStoredAuth()) {
      setParticipants([]);
      setAnnexes([]);
      return;
    }

    const result = await apiGetParticipants();
    if (!result.success || !result.data) {
      throw new Error(result.error?.message || 'No se pudieron cargar los participantes');
    }

    applyParticipantData(result.data.participants);
  }, [applyParticipantData]);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      await refreshCourses();
      await refreshParticipants();
    } catch (loadError) {
      setError(toErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, [refreshCourses, refreshParticipants]);

  useEffect(() => {
    void refreshData();
  }, [refreshData, user?.id, user?.userId]);

  const registerParticipant = async (payload: RegistrationPayload) => {
    setError(null);

    const result = await apiCreateParticipant(payload);
    if (!result.success || !result.data?.participant) {
      const message = result.error?.message || 'No se pudo registrar el participante';
      setError(message);
      throw new Error(message);
    }

    await refreshParticipants();
    return mapParticipantToView(result.data.participant);
  };

  const generateAnnex = async (participantId: string, phaseId: PhaseId) => {
    setError(null);

    const annexTypeNumber = PHASE_TO_ANNEX_NUMBER[phaseId];
    const result = await apiGenerateAnnex(participantId, annexTypeNumber);
    if (!result.success || !result.data?.annex) {
      const message = result.error?.message || 'No se pudo generar el anexo';
      setError(message);
      throw new Error(message);
    }

    await refreshParticipants();
    return mapAnnexToView(result.data.annex);
  };

  const signAnnex = async (annexId: string) => {
    setError(null);

    const typedName = user?.name || 'Firma digital';
    const result = await apiSignAnnex(annexId, typedName);
    if (!result.success) {
      const message = result.error?.message || 'No se pudo firmar el anexo';
      setError(message);
      throw new Error(message);
    }

    await refreshParticipants();
  };

  const advancePhase = async (participantId: string) => {
    setError(null);

    const override = user?.role === 'administrator';
    const result = await apiProgressPhase(participantId, override);
    if (!result.success) {
      const message = result.error?.message || 'No se pudo avanzar la fase';
      setError(message);
      throw new Error(message);
    }

    await refreshParticipants();
  };

  const markAttendance = async (participantId: string) => {
    setError(null);

    const result = await apiMarkAttendance(participantId, {
      sessionDate: new Date().toISOString().slice(0, 10),
      hours: 4,
      notes: 'Asistencia registrada desde panel de instructor.',
    });

    if (!result.success) {
      const message = result.error?.message || 'No se pudo registrar la asistencia';
      setError(message);
      throw new Error(message);
    }

    await refreshParticipants();
  };

  const downloadAnnex = async (annexId: string) => {
    setError(null);

    const result = await apiDownloadAnnex(annexId);
    if (!result.success || !result.data) {
      const message = result.error?.message || 'No se pudo descargar el anexo';
      setError(message);
      throw new Error(message);
    }

    triggerBrowserDownload(result.data.blob, result.data.fileName);
  };

  const exportSignedAnnexesZip = async (participantIds?: string[]) => {
    setError(null);

    const result = await apiBatchExportAnnexes({
      participantIds,
      signedOnly: true,
    });

    if (!result.success || !result.data) {
      const message = result.error?.message || 'No se pudo exportar el ZIP';
      setError(message);
      throw new Error(message);
    }

    triggerBrowserDownload(result.data.blob, result.data.fileName);
  };

  const value = useMemo(
    () => ({
      phases: PHASES,
      courses,
      participants,
      annexes,
      isLoading,
      error,
      refreshData,
      registerParticipant,
      generateAnnex,
      signAnnex,
      advancePhase,
      markAttendance,
      downloadAnnex,
      exportSignedAnnexesZip,
      getParticipantPhase,
      getCurrentPhase,
      getCourseName,
      getPhaseLabel,
      getAnnexById,
    }),
    [annexes, courses, error, isLoading, participants, refreshData]
  );

  return <DemoDataContext.Provider value={value}>{children}</DemoDataContext.Provider>;
};

export const useDemoData = () => {
  const context = useContext(DemoDataContext);
  if (!context) {
    throw new Error('useDemoData must be used within DemoDataProvider');
  }

  return context;
};
