import React, { createContext, useContext, useMemo, useState } from 'react';
import type {
  Annex,
  Course,
  Participant,
  ParticipantPhase,
  PhaseDefinition,
  PhaseId,
  RegistrationPayload,
} from '../types/training';

const PHASES: PhaseDefinition[] = [
  { id: 'diagnostico', label: 'Fase Diagnostico', annexName: 'Anexo 2' },
  { id: 'formacion', label: 'Fase Formacion', annexName: 'Anexo 3' },
  { id: 'finalizacion', label: 'Fase Finalizacion', annexName: 'Anexo 5' },
];

const COURSES: Course[] = [
  { id: 'curso-digital', name: 'Talento 45+ - Marketing Digital' },
  { id: 'curso-data', name: 'Talento 45+ - Analitica de Datos' },
];

const createInitialPhases = (): ParticipantPhase[] =>
  PHASES.map((phase, index) => ({
    phaseId: phase.id,
    status: index === 0 ? 'in_progress' : 'not_started',
  }));

const createParticipant = (payload: RegistrationPayload): Participant => {
  const timestamp = new Date().toISOString();
  return {
    id: `p-${Math.random().toString(36).slice(2, 8)}`,
    firstName: payload.firstName,
    lastName: payload.lastName,
    idNumber: payload.idNumber,
    email: payload.email,
    phone: payload.phone,
    courseId: payload.courseId,
    phases: createInitialPhases(),
    attendance: { sessionsCompleted: 0, totalSessions: 6 },
    createdAt: timestamp,
  };
};

const initialParticipants: Participant[] = [
  createParticipant({
    firstName: 'Marta',
    lastName: 'Gomez',
    idNumber: '12345678A',
    email: 'marta.gomez@example.com',
    phone: '+34 600 123 456',
    courseId: 'curso-digital',
  }),
  createParticipant({
    firstName: 'Luis',
    lastName: 'Herrera',
    idNumber: '87654321B',
    email: 'luis.herrera@example.com',
    phone: '+34 600 987 654',
    courseId: 'curso-data',
  }),
];

const initialAnnexes: Annex[] = [];

interface DemoDataContextValue {
  phases: PhaseDefinition[];
  courses: Course[];
  participants: Participant[];
  annexes: Annex[];
  registerParticipant: (payload: RegistrationPayload) => Participant;
  generateAnnex: (participantId: string, phaseId: PhaseId) => Annex | null;
  signAnnex: (annexId: string) => void;
  advancePhase: (participantId: string) => void;
  markAttendance: (participantId: string) => void;
  getParticipantPhase: (participant: Participant, phaseId: PhaseId) => ParticipantPhase | undefined;
  getCurrentPhase: (participant: Participant) => ParticipantPhase | undefined;
  getCourseName: (courseId: string) => string;
  getPhaseLabel: (phaseId: PhaseId) => string;
  getAnnexById: (annexId?: string) => Annex | undefined;
}

const DemoDataContext = createContext<DemoDataContextValue | undefined>(undefined);

export const DemoDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [participants, setParticipants] = useState<Participant[]>(initialParticipants);
  const [annexes, setAnnexes] = useState<Annex[]>(initialAnnexes);

  const getCourseName = (courseId: string) => COURSES.find((c) => c.id === courseId)?.name || 'Curso';

  const getPhaseLabel = (phaseId: PhaseId) => PHASES.find((p) => p.id === phaseId)?.label || 'Fase';

  const getParticipantPhase = (participant: Participant, phaseId: PhaseId) =>
    participant.phases.find((phase) => phase.phaseId === phaseId);

  const getCurrentPhase = (participant: Participant) =>
    participant.phases.find((phase) => !['signed', 'completed'].includes(phase.status));

  const getAnnexById = (annexId?: string) => annexes.find((annex) => annex.id === annexId);

  const registerParticipant = (payload: RegistrationPayload) => {
    const participant = createParticipant(payload);
    setParticipants((prev) => [participant, ...prev]);
    return participant;
  };

  const generateAnnex = (participantId: string, phaseId: PhaseId) => {
    const phaseDefinition = PHASES.find((phase) => phase.id === phaseId);
    if (!phaseDefinition) return null;

    const annex: Annex = {
      id: `a-${Math.random().toString(36).slice(2, 8)}`,
      participantId,
      phaseId,
      title: `${phaseDefinition.annexName} - ${phaseDefinition.label}`,
      status: 'generated',
      generatedAt: new Date().toISOString(),
    };

    setAnnexes((prev) => [annex, ...prev]);
    setParticipants((prev) =>
      prev.map((participant) => {
        if (participant.id !== participantId) return participant;
        return {
          ...participant,
          phases: participant.phases.map((phase) =>
            phase.phaseId === phaseId
              ? { ...phase, status: 'annex_generated', annexId: annex.id }
              : phase
          ),
        };
      })
    );

    return annex;
  };

  const signAnnex = (annexId: string) => {
    const signedAt = new Date().toISOString();

    setAnnexes((prev) =>
      prev.map((annex) => (annex.id === annexId ? { ...annex, status: 'signed', signedAt } : annex))
    );

    setParticipants((prev) =>
      prev.map((participant) => {
        const phase = participant.phases.find((p) => p.annexId === annexId);
        if (!phase) return participant;

        const updatedPhases = participant.phases.map((p) =>
          p.annexId === annexId ? { ...p, status: 'signed' as const, signedAt } : p
        );

        const currentIndex = updatedPhases.findIndex((p) => p.annexId === annexId);
        const nextPhase = updatedPhases[currentIndex + 1];
        if (nextPhase && nextPhase.status === 'not_started') {
          nextPhase.status = 'in_progress';
        }

        return { ...participant, phases: updatedPhases };
      })
    );
  };

  const advancePhase = (participantId: string) => {
    setParticipants((prev) =>
      prev.map((participant) => {
        if (participant.id !== participantId) return participant;
        const updatedPhases = participant.phases.map((phase) => ({ ...phase }));
        const currentIndex = updatedPhases.findIndex((phase) => !['signed', 'completed'].includes(phase.status));
        if (currentIndex === -1) return participant;

        updatedPhases[currentIndex].status = 'completed';
        if (updatedPhases[currentIndex + 1]) {
          updatedPhases[currentIndex + 1].status = 'in_progress';
        }

        return { ...participant, phases: updatedPhases };
      })
    );
  };

  const markAttendance = (participantId: string) => {
    setParticipants((prev) =>
      prev.map((participant) => {
        if (participant.id !== participantId) return participant;
        const { sessionsCompleted, totalSessions } = participant.attendance;
        return {
          ...participant,
          attendance: {
            sessionsCompleted: Math.min(sessionsCompleted + 1, totalSessions),
            totalSessions,
          },
        };
      })
    );
  };

  const value = useMemo(
    () => ({
      phases: PHASES,
      courses: COURSES,
      participants,
      annexes,
      registerParticipant,
      generateAnnex,
      signAnnex,
      advancePhase,
      markAttendance,
      getParticipantPhase,
      getCurrentPhase,
      getCourseName,
      getPhaseLabel,
      getAnnexById,
    }),
    [participants, annexes]
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
