import React from 'react';
import styles from './Card.module.css';

interface CardProps {
  image?: { src: string; alt: string };
  title: string;
  summary: string;
  meta?: {
    date?: string;
    category?: string;
  };
  ctaText: string;
  ctaHref: string;
  variant?: 'vertical' | 'horizontal';
}

export const Card: React.FC<CardProps> = ({
  image,
  title,
  summary,
  meta,
  ctaText,
  ctaHref,
  variant = 'vertical',
}) => {
  return (
    <article className={`${styles.card} ${styles[variant]}`}>
      {image && (
        <div className={styles.imageWrapper}>
          <img src={image.src} alt={image.alt} loading="lazy" />
        </div>
      )}
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.summary}>{summary}</p>
        {meta && (
          <div className={styles.meta}>
            {meta.date && <span className={styles.date}>{meta.date}</span>}
            {meta.category && <span className={styles.category}>{meta.category}</span>}
          </div>
        )}
        <a href={ctaHref} className={styles.cta}>
          {ctaText} →
        </a>
      </div>
    </article>
  );
};