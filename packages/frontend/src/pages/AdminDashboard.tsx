import React from 'react';
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
    getCurrentPhase,
    getCourseName,
    getPhaseLabel,
  } = useDemoData();

  const handleGenerateAnnex = (participantId: string) => {
    const participant = participants.find((item) => item.id === participantId);
    const currentPhase = participant ? getCurrentPhase(participant) : undefined;

    if (currentPhase) {
      generateAnnex(participantId, currentPhase.phaseId);
    }
  };

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Panel Administrador</h1>
          <p className={styles.subtitle}>
            Vista completa de participantes, fases, anexos y firma digital.
          </p>
        </div>
      </div>

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
                        onClick={() => handleGenerateAnnex(participant.id)}
                        disabled={!currentPhase || ['annex_generated', 'signed', 'completed'].includes(currentPhase.status)}
                      >
                        Generar anexo
                      </Button>
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={() => currentPhase?.annexId && signAnnex(currentPhase.annexId)}
                        disabled={!currentPhase?.annexId || currentPhase.status !== 'annex_generated'}
                      >
                        Firmar (simular)
                      </Button>
                      <Button size="small" onClick={() => advancePhase(participant.id)}>
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
