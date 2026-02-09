import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import styles from './RecentActivity.module.css';

interface Activity {
  id: number;
  formType: string;
  status: 'success' | 'error' | 'warning' | 'info';
  timestamp: string;
  userInfo?: string;
}

interface RecentActivityProps {
  activities: Activity[];
}

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return '✓';
      case 'error':
        return '✗';
      case 'warning':
        return '⚠';
      case 'info':
        return 'ℹ';
      default:
        return '•';
    }
  };

  const formatRelativeTime = (timestamp: string): string => {
    try {
      const date = new Date(timestamp);
      return formatDistanceToNow(date, { 
        addSuffix: true, 
        locale: es 
      });
    } catch {
      return 'Hace un momento';
    }
  };

  const recentActivities = activities.slice(0, 4);

  return (
    <div className={`card ${styles.recentActivity}`}>
      <div className={styles.header}>
        <h3 className="metric-label">Completados Recientes</h3>
        <div className={styles.count}>
          {activities.length} total
        </div>
      </div>
      
      <div className={styles.activitiesList}>
        {recentActivities.length > 0 ? (
          recentActivities.map((activity) => (
            <div key={activity.id} className={styles.activityItem}>
              <div className={styles.activityContent}>
                <div className={styles.statusIcon}>
                  <span className={`status-indicator status-${activity.status}`}></span>
                  <span className={styles.icon}>{getStatusIcon(activity.status)}</span>
                </div>
                
                <div className={styles.activityInfo}>
                  <div className={styles.formType}>{activity.formType}</div>
                  {activity.userInfo && (
                    <div className={styles.userInfo}>{activity.userInfo}</div>
                  )}
                </div>
                
                <div className={styles.timestamp}>
                  {formatRelativeTime(activity.timestamp)}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📄</div>
            <div className={styles.emptyText}>No hay actividad reciente</div>
          </div>
        )}
      </div>

      <div className={styles.footer}>
        <button className={styles.viewAllButton}>
          Ver toda la actividad →
        </button>
      </div>
    </div>
  );
};

export default RecentActivity;