import React from 'react';
import type { PhaseStatus } from '../../types/training';
import styles from './StatusBadge.module.css';

const statusLabels: Record<PhaseStatus, string> = {
  not_started: 'No iniciado',
  in_progress: 'En progreso',
  annex_generated: 'Anexo generado',
  signed: 'Firmado',
  completed: 'Completado',
};

export const StatusBadge: React.FC<{ status: PhaseStatus }> = ({ status }) => {
  return <span className={`${styles.badge} ${styles[status]}`}>{statusLabels[status]}</span>;
};
