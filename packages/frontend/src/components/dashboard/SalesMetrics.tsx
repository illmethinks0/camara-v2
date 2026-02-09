import React from 'react';
import styles from './SalesMetrics.module.css';

interface SalesMetricsProps {
  totalFiles: number;
  monthlyGrowth: number;
  todayCount: number;
  yesterdayCount: number;
}

const SalesMetrics: React.FC<SalesMetricsProps> = ({
  totalFiles,
  monthlyGrowth,
  todayCount,
  yesterdayCount
}) => {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toLocaleString();
  };

  const getTrendIndicator = (growth: number) => {
    if (growth > 0) {
      return { symbol: '↗', className: 'metric-change-positive' };
    } else if (growth < 0) {
      return { symbol: '↘', className: 'metric-change-negative' };
    }
    return { symbol: '→', className: 'metric-change-neutral' };
  };

  const trend = getTrendIndicator(monthlyGrowth);

  return (
    <div className={`card ${styles.salesMetrics}`}>
      <div className={styles.header}>
        <h3 className="metric-label">Archivos Procesados</h3>
      </div>
      
      <div className={styles.mainMetric}>
        <div className="metric-value">{formatNumber(totalFiles)}</div>
        <div className={`metric-change ${trend.className}`}>
          <span className={styles.trendIcon}>{trend.symbol}</span>
          {Math.abs(monthlyGrowth)}% vs mes anterior
        </div>
      </div>

      <div className={styles.dailyStats}>
        <div className={styles.statItem}>
          <div className={styles.statValue}>{formatNumber(todayCount)}</div>
          <div className={styles.statLabel}>Hoy</div>
        </div>
        <div className={styles.divider}></div>
        <div className={styles.statItem}>
          <div className={styles.statValue}>{formatNumber(yesterdayCount)}</div>
          <div className={styles.statLabel}>Ayer</div>
        </div>
      </div>
    </div>
  );
};

export default SalesMetrics;