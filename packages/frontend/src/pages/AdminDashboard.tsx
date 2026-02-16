import React, { useMemo, useState } from 'react';
import { Button } from '../components/Button/Button';
import { StatusBadge } from '../components/status/StatusBadge';
import { useDemoData } from '../contexts/DemoDataContext';
import type { Participant } from '../types/training';
import styles from './Dashboard.module.css';

const countSignedParticipants = (participants: Participant[]) =>
  participants.filter((participant) =>
    participant.phases.every((phase) => ['signed', 'completed'].includes(phase.status))
  ).length;

export const AdminDashboard: React.FC = () => {
  const {
    participants,
    annexes,
    generateAnnex,
    signAnnex,
    advancePhase,
    downloadAnnex,
    exportSignedAnnexesZip,
    getCurrentPhase,
    getCourseName,
    getPhaseLabel,
    isLoading,
    error: contextError,
  } = useDemoData();
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const actionableParticipantIds = useMemo(
    () => new Set(participants.map((participant) => participant.id)),
    [participants]
  );
  const normalizedSelection = useMemo(
    () => selectedParticipantIds.filter((participantId) => actionableParticipantIds.has(participantId)),
    [actionableParticipantIds, selectedParticipantIds]
  );

  const toggleSelection = (participantId: string) => {
    setSelectedParticipantIds((current) =>
      current.includes(participantId)
        ? current.filter((id) => id !== participantId)
        : [...current, participantId]
    );
  };

  const runAction = async (action: () => Promise<void>) => {
    setLocalError(null);
    setIsSubmitting(true);
    try {
      await action();
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'Operacion no disponible');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGenerateAnnex = async (participantId: string) => {
    const participant = participants.find((item) => item.id === participantId);
    const currentPhase = participant ? getCurrentPhase(participant) : undefined;

    if (currentPhase) {
      await runAction(async () => {
        await generateAnnex(participantId, currentPhase.phaseId);
      });
    }
  };

  const handleExport = async () => {
    await runAction(async () => {
      await exportSignedAnnexesZip(normalizedSelection.length > 0 ? normalizedSelection : undefined);
    });
  };

  const activeError = localError || contextError;

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Panel Administrador</h1>
          <p className={styles.subtitle}>
            Vista completa de participantes, fases, anexos y firma digital.
          </p>
        </div>
        <div className={styles.actions}>
          <Button
            variant="secondary"
            onClick={() => void handleExport()}
            disabled={isSubmitting || participants.length === 0}
          >
            Exportar ZIP firmados
          </Button>
        </div>
      </div>

      {activeError ? <p className={styles.error}>{activeError}</p> : null}
      {isLoading ? <p className={styles.subtitle}>Cargando datos del panel...</p> : null}

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Participantes</p>
          <p className={styles.statValue}>{participants.length}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Anexos generados</p>
          <p className={styles.statValue}>{annexes.length}</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statLabel}>Participantes completados</p>
          <p className={styles.statValue}>{countSignedParticipants(participants)}</p>
        </div>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Sel</th>
              <th>Participante</th>
              <th>Curso</th>
              <th>Fases</th>
              <th>Fase actual</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((participant) => {
              const currentPhase = getCurrentPhase(participant);

              return (
                <tr key={participant.id}>
                  <td>
                    <input
                      type="checkbox"
                      checked={normalizedSelection.includes(participant.id)}
                      onChange={() => toggleSelection(participant.id)}
                    />
                  </td>
                  <td>
                    <strong>
                      {participant.firstName} {participant.lastName}
                    </strong>
                    <br />
                    {participant.idNumber}
                  </td>
                  <td>{getCourseName(participant.courseId)}</td>
                  <td>
                    <div className={styles.phaseList}>
                      {participant.phases.map((phase) => (
                        <span key={`${participant.id}-${phase.phaseId}`} className={styles.phaseItem}>
                          {getPhaseLabel(phase.phaseId)} <StatusBadge status={phase.status} />
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>{currentPhase ? getPhaseLabel(currentPhase.phaseId) : 'Programa completado'}</td>
                  <td>
                    <div className={styles.actions}>
                      <Button
                        size="small"
                        variant="outline"
                        onClick={() => void handleGenerateAnnex(participant.id)}
                        disabled={(
                          isSubmitting ||
                          !currentPhase ||
                          ['annex_generated', 'signed', 'completed'].includes(currentPhase.status)
                        )}
                      >
                        Generar anexo
                      </Button>
                      <Button
                        size="small"
                        variant="outline"
                        onClick={() =>
                          void runAction(async () => {
                            if (currentPhase?.annexId) {
                              await downloadAnnex(currentPhase.annexId);
                            }
                          })
                        }
                        disabled={isSubmitting || !currentPhase?.annexId}
                      >
                        Descargar
                      </Button>
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={() =>
                          void runAction(async () => {
                            if (currentPhase?.annexId) {
                              await signAnnex(currentPhase.annexId);
                            }
                          })
                        }
                        disabled={isSubmitting || !currentPhase?.annexId || currentPhase.status !== 'annex_generated'}
                      >
                        Firmar (simular)
                      </Button>
                      <Button
                        size="small"
                        onClick={() =>
                          void runAction(async () => {
                            await advancePhase(participant.id);
                          })
                        }
                        disabled={isSubmitting}
                      >
                        Avanzar fase
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
};
