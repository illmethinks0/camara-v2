import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '../components/Button/Button';
import { StatusBadge } from '../components/status/StatusBadge';
import { useDemoData } from '../contexts/DemoDataContext';
import styles from './Dashboard.module.css';

export const ParticipantDashboard: React.FC = () => {
  const { participants, annexes, getCurrentPhase, getPhaseLabel, signAnnex, getCourseName } = useDemoData();
  const [selectedParticipantId, setSelectedParticipantId] = useState('');

  useEffect(() => {
    if (!selectedParticipantId && participants[0]) {
      setSelectedParticipantId(participants[0].id);
    }
  }, [participants, selectedParticipantId]);

  const participant = useMemo(
    () => participants.find((item) => item.id === selectedParticipantId),
    [participants, selectedParticipantId]
  );

  if (!participant) {
    return (
      <section className={styles.page}>
        <p className={styles.empty}>No hay participantes disponibles.</p>
      </section>
    );
  }

  const participantAnnexes = annexes.filter((annex) => annex.participantId === participant.id);
  const currentPhase = getCurrentPhase(participant);

  return (
    <section className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Panel Participante</h1>
          <p className={styles.subtitle}>Consulta de datos, anexos y estado de firma.</p>
        </div>
      </div>

      <div className={styles.card}>
        <label htmlFor="participant-selector" className={styles.fieldLabel}>
          Participante demo
        </label>
        <select
          id="participant-selector"
          value={selectedParticipantId}
          onChange={(event) => setSelectedParticipantId(event.target.value)}
        >
          {participants.map((item) => (
            <option key={item.id} value={item.id}>
              {item.firstName} {item.lastName}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.card}>
        <h2 className={styles.title}>Datos personales</h2>
        <div className={styles.grid}>
          <div>
            <p className={styles.fieldLabel}>Nombre</p>
            <p className={styles.fieldValue}>
              {participant.firstName} {participant.lastName}
            </p>
          </div>
          <div>
            <p className={styles.fieldLabel}>DNI/NIE</p>
            <p className={styles.fieldValue}>{participant.idNumber}</p>
          </div>
          <div>
            <p className={styles.fieldLabel}>Email</p>
            <p className={styles.fieldValue}>{participant.email}</p>
          </div>
          <div>
            <p className={styles.fieldLabel}>Telefono</p>
            <p className={styles.fieldValue}>{participant.phone}</p>
          </div>
          <div>
            <p className={styles.fieldLabel}>Curso</p>
            <p className={styles.fieldValue}>{getCourseName(participant.courseId)}</p>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.title}>Progreso por fases</h2>
        <div className={styles.phaseList}>
          {participant.phases.map((phase) => (
            <span key={phase.phaseId} className={styles.phaseItem}>
              {getPhaseLabel(phase.phaseId)} <StatusBadge status={phase.status} />
            </span>
          ))}
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.title}>Anexos</h2>
        {participantAnnexes.length === 0 ? (
          <p className={styles.empty}>Todavia no hay anexos generados.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Anexo</th>
                  <th>Fase</th>
                  <th>Estado</th>
                  <th>Accion</th>
                </tr>
              </thead>
              <tbody>
                {participantAnnexes.map((annex) => (
                  <tr key={annex.id}>
                    <td>{annex.title}</td>
                    <td>{getPhaseLabel(annex.phaseId)}</td>
                    <td>{annex.status === 'signed' ? 'Firmado' : 'Pendiente de firma'}</td>
                    <td>
                      <Button
                        size="small"
                        onClick={() => signAnnex(annex.id)}
                        disabled={annex.status === 'signed'}
                      >
                        Firmar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {currentPhase?.annexId && currentPhase.status === 'annex_generated' ? (
        <div className={styles.card}>
          <h2 className={styles.title}>Firma pendiente</h2>
          <p className={styles.subtitle}>
            Tienes un anexo pendiente en la fase {getPhaseLabel(currentPhase.phaseId)}.
          </p>
          <div className={styles.actions}>
            <Button onClick={() => signAnnex(currentPhase.annexId!)}>Firmar ahora</Button>
          </div>
        </div>
      ) : null}
    </section>
  );
};
