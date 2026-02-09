import React from 'react';
import styles from './ProcessingSpeed.module.css';

interface ProcessingSpeedProps {
  averageTime: string;
  fastestTime: string;
  weeklyChange: number;
}

const ProcessingSpeed: React.FC<ProcessingSpeedProps> = ({
  averageTime,
  fastestTime,
  weeklyChange
}) => {
  const getTrendIndicator = (change: number) => {
    // For processing speed, negative change is positive (faster is better)
    if (change < 0) {
      return { symbol: '↗', className: 'metric-change-positive', text: 'más rápido' };
    } else if (change > 0) {
      return { symbol: '↘', className: 'metric-change-negative', text: 'más lento' };
    }
    return { symbol: '→', className: 'metric-change-neutral', text: 'sin cambios' };
  };

  const trend = getTrendIndicator(weeklyChange);

  return (
    <div className={`card ${styles.processingSpeed}`}>
      <div className={styles.header}>
        <h3 className="metric-label">Velocidad de Procesamiento</h3>
      </div>
      
      <div className={styles.metrics}>
        <div className={styles.mainMetric}>
          <div className={styles.metricValue}>{averageTime}</div>
          <div className={styles.metricLabel}>Tiempo Promedio</div>
        </div>

        <div className={styles.secondaryMetric}>
          <div className={styles.fastestTime}>
            <span className={styles.fastestLabel}>Más Rápido:</span>
            <span className={styles.fastestValue}>{fastestTime}</span>
          </div>
        </div>

        <div className={styles.trendIndicator}>
          <div className={`metric-change ${trend.className}`}>
            <span className={styles.trendIcon}>{trend.symbol}</span>
            {Math.abs(weeklyChange)}% {trend.text} que la semana pasada
          </div>
        </div>
      </div>

      <div className={styles.speedGauge}>
        <div className={styles.gaugeContainer}>
          <div className={styles.gaugeBar}>
            <div 
              className={styles.gaugeProgress}
              style={{ 
                transform: `rotate(${Math.min(parseFloat(averageTime) * 36, 180)}deg)` 
              }}
            ></div>
          </div>
          <div className={styles.gaugeLabel}>Rendimiento</div>
        </div>
      </div>
    </div>
  );
};

export default ProcessingSpeed;