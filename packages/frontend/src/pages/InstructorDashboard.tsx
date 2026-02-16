import React, { useState } from 'react';
import { Button } from '../components/Button/Button';
import { StatusBadge } from '../components/status/StatusBadge';
import { useDemoData } from '../contexts/DemoDataContext';
import styles from './Dashboard.module.css';

export const InstructorDashboard: React.FC = () => {
  const {
    participants,
    getCurrentPhase,
    getCourseName,
    getPhaseLabel,
    markAttendance,
    generateAnnex,
    downloadAnnex,
    isLoading,
    error: contextError,
  } = useDemoData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

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

  const activeError = localError || contextError;

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Panel Instructor</h1>
          <p className={styles.subtitle}>
            Gestion de participantes asignados, asistencia y seguimiento de fases.
          </p>
        </div>
      </div>

      {activeError ? <p className={styles.error}>{activeError}</p> : null}
      {isLoading ? <p className={styles.subtitle}>Cargando datos del panel...</p> : null}

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Participante</th>
              <th>Curso</th>
              <th>Asistencia</th>
              <th>Fase actual</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {participants.map((participant) => {
              const currentPhase = getCurrentPhase(participant);

              return (
                <tr key={participant.id}>
                  <td>
                    <strong>
                      {participant.firstName} {participant.lastName}
                    </strong>
                    <br />
                    {participant.email}
                  </td>
                  <td>{getCourseName(participant.courseId)}</td>
                  <td>
                    {participant.attendance.sessionsCompleted}/{participant.attendance.totalSessions} sesiones
                    <br />
                    {participant.attendance.hoursCompleted.toFixed(1)} h
                  </td>
                  <td>{currentPhase ? getPhaseLabel(currentPhase.phaseId) : 'Programa completado'}</td>
                  <td>{currentPhase ? <StatusBadge status={currentPhase.status} /> : '-'}</td>
                  <td>
                    <div className={styles.actions}>
                      <Button
                        size="small"
                        variant="outline"
                        onClick={() =>
                          void runAction(async () => {
                            await markAttendance(participant.id);
                          })
                        }
                        disabled={isSubmitting}
                      >
                        Marcar asistencia
                      </Button>
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={() =>
                          void runAction(async () => {
                            if (currentPhase) {
                              await generateAnnex(participant.id, currentPhase.phaseId);
                            }
                          })
                        }
                        disabled={
                          isSubmitting ||
                          !currentPhase ||
                          ['annex_generated', 'signed', 'completed'].includes(currentPhase.status)
                        }
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
