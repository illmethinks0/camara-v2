import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import styles from './SatisfactionGauge.module.css';

interface SatisfactionGaugeProps {
  score: number;
  maxScore: number;
}

const SatisfactionGauge: React.FC<SatisfactionGaugeProps> = ({ score, maxScore }) => {
  const percentage = Math.round((score / maxScore) * 100);
  
  const data = [
    {
      name: 'Satisfaction',
      value: percentage,
      fill: getColorByScore(percentage)
    }
  ];

  function getColorByScore(score: number): string {
    if (score >= 80) return 'var(--accent-positive)';
    if (score >= 60) return 'var(--accent-warning)';
    return 'var(--accent-negative)';
  }

  function getScoreLabel(score: number): string {
    if (score >= 90) return 'Excelente';
    if (score >= 80) return 'Muy Bueno';
    if (score >= 70) return 'Bueno';
    if (score >= 60) return 'Regular';
    return 'Necesita Mejora';
  }

  return (
    <div className={`card ${styles.satisfactionGauge}`}>
      <div className={styles.header}>
        <h3 className="metric-label">Satisfacción del Usuario (últimos 30 días)</h3>
      </div>
      
      <div className={styles.gaugeContainer}>
        <div className={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height={200}>
            <RadialBarChart
              cx="50%"
              cy="80%"
              innerRadius="60%"
              outerRadius="90%"
              startAngle={180}
              endAngle={0}
              data={data}
            >
              <RadialBar
                dataKey="value"
                cornerRadius={10}
                fill={data[0].fill}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          
          <div className={styles.scoreDisplay}>
            <div className={styles.scoreValue}>{percentage}%</div>
            <div className={styles.scoreLabel}>{getScoreLabel(percentage)}</div>
          </div>
        </div>

        <div className={styles.metrics}>
          <div className={styles.metricItem}>
            <div className={styles.metricValue}>{score}</div>
            <div className={styles.metricLabel}>Puntuación Actual</div>
          </div>
          <div className={styles.divider}></div>
          <div className={styles.metricItem}>
            <div className={styles.metricValue}>{maxScore}</div>
            <div className={styles.metricLabel}>Puntuación Máxima</div>
          </div>
        </div>

        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <div className={`${styles.legendColor} ${styles.excellent}`}></div>
            <span>90-100% Excelente</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendColor} ${styles.good}`}></div>
            <span>70-89% Bueno</span>
          </div>
          <div className={styles.legendItem}>
            <div className={`${styles.legendColor} ${styles.poor}`}></div>
            <span>0-69% Mejorable</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SatisfactionGauge;