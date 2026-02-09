import React from 'react';
import styles from './LocationStats.module.css';

interface LocationData {
  city: string;
  state: string;
  count: number;
  trend?: number;
}

interface LocationStatsProps {
  locationData: LocationData[];
}

const LocationStats: React.FC<LocationStatsProps> = ({ locationData }) => {
  const formatNumber = (num: number): string => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toLocaleString();
  };

  const getTrendIcon = (trend?: number) => {
    if (!trend) return null;
    if (trend > 0) return <span className={styles.trendUp}>↗</span>;
    if (trend < 0) return <span className={styles.trendDown}>↘</span>;
    return <span className={styles.trendFlat}>→</span>;
  };

  const sortedLocations = [...locationData]
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  return (
    <div className={`card ${styles.locationStats}`}>
      <div className={styles.header}>
        <h3 className="metric-label">Top Ubicaciones (últimos 7 días)</h3>
      </div>
      
      <div className={styles.locationsList}>
        {sortedLocations.map((location, index) => (
          <div key={`${location.city}-${location.state}`} className={styles.locationItem}>
            <div className={styles.locationInfo}>
              <div className={styles.rank}>{index + 1}</div>
              <div className={styles.locationName}>
                <div className={styles.city}>{location.city}</div>
                <div className={styles.state}>{location.state}</div>
              </div>
            </div>
            <div className={styles.locationMetrics}>
              <div className={styles.count}>{formatNumber(location.count)}</div>
              {getTrendIcon(location.trend)}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.summary}>
        <div className={styles.totalLocations}>
          <span className={styles.summaryNumber}>{locationData.length}</span>
          <span className={styles.summaryLabel}>ubicaciones activas</span>
        </div>
      </div>
    </div>
  );
};

export default LocationStats;