import React from 'react';
import { Button } from '../components/Button/Button';
import { StatusBadge } from '../components/status/StatusBadge';
import { useDemoData } from '../contexts/DemoDataContext';
import styles from './Dashboard.module.css';

export const InstructorDashboard: React.FC = () => {
  const { participants, getCurrentPhase, getCourseName, getPhaseLabel, markAttendance, generateAnnex } =
    useDemoData();

  // Demo assignment rule: instructor sees participants from the first course.
  const assignedParticipants = participants.filter((participant) => participant.courseId === 'curso-digital');

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
            {assignedParticipants.map((participant) => {
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
                  </td>
                  <td>{currentPhase ? getPhaseLabel(currentPhase.phaseId) : 'Programa completado'}</td>
                  <td>{currentPhase ? <StatusBadge status={currentPhase.status} /> : '-'}</td>
                  <td>
                    <div className={styles.actions}>
                      <Button size="small" variant="outline" onClick={() => markAttendance(participant.id)}>
                        Marcar asistencia
                      </Button>
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={() => currentPhase && generateAnnex(participant.id, currentPhase.phaseId)}
                        disabled={!currentPhase || ['annex_generated', 'signed', 'completed'].includes(currentPhase.status)}
                      >
                        Generar anexo
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
