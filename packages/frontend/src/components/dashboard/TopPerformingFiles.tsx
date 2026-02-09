import React from 'react';
import styles from './TopPerformingFiles.module.css';

interface FileData {
  id: number;
  formName: string;
  count: number;
}

interface TopPerformingFilesProps {
  filesData: FileData[];
}

const TopPerformingFiles: React.FC<TopPerformingFilesProps> = ({ filesData }) => {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toLocaleString();
  };

  const sortedFiles = [...filesData].sort((a, b) => b.count - a.count).slice(0, 8);
  const maxCount = sortedFiles[0]?.count || 1;

  return (
    <div className={`card ${styles.topPerformingFiles}`}>
      <div className={styles.header}>
        <h3 className="metric-label">Formularios Más Procesados Este Mes</h3>
      </div>
      
      <div className={styles.filesList}>
        {sortedFiles.map((file, index) => {
          const percentage = (file.count / maxCount) * 100;
          
          return (
            <div key={file.id} className={styles.fileItem}>
              <div className={styles.fileInfo}>
                <div className={styles.rank}>{index + 1}</div>
                <div className={styles.fileName}>{file.formName}</div>
                <div className={styles.fileCount}>{formatNumber(file.count)}</div>
              </div>
              <div className={styles.progressBar}>
                <div 
                  className={styles.progress}
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopPerformingFiles;