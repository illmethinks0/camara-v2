import React from 'react';
import { Button } from '../Button/Button';
import styles from './Hero.module.css';

interface HeroProps {
  eyebrow?: string;
  title: string;
  bullets: string[];
  primaryCTA: { text: string; href?: string; onClick?: () => void };
  secondaryCTA?: { text: string; href?: string; onClick?: () => void };
  image: { src: string; alt: string };
  backgroundColor?: 'sand' | 'sky' | 'lilac';
}

export const Hero: React.FC<HeroProps> = ({
  eyebrow,
  title,
  bullets,
  primaryCTA,
  secondaryCTA,
  image,
  backgroundColor = 'sand',
}) => {
  const bgColors = {
    sand: 'var(--color-surface-sand)',
    sky: 'var(--color-surface-sky)',
    lilac: 'var(--color-surface-lilac)',
  };

  return (
    <section 
      className={styles.hero} 
      style={{ backgroundColor: bgColors[backgroundColor] }}
      id="main"
    >
      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.left}>
            {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
            <h1 className={styles.title}>{title}</h1>
            <ul className={styles.bullets}>
              {bullets.map((bullet, index) => (
                <li key={index}>{bullet}</li>
              ))}
            </ul>
            <div className={styles.ctaGroup}>
              {primaryCTA.onClick ? (
                <Button variant="primary" onClick={primaryCTA.onClick}>
                  {primaryCTA.text}
                </Button>
              ) : (
                <a href={primaryCTA.href}>
                  <Button variant="primary">{primaryCTA.text}</Button>
                </a>
              )}
              {secondaryCTA && (
                secondaryCTA.onClick ? (
                  <Button variant="secondary" onClick={secondaryCTA.onClick}>
                    {secondaryCTA.text}
                  </Button>
                ) : (
                  <a href={secondaryCTA.href}>
                    <Button variant="secondary">{secondaryCTA.text}</Button>
                  </a>
                )
              )}
            </div>
          </div>
          <div className={styles.right}>
            <img src={image.src} alt={image.alt} loading="eager" />
          </div>
        </div>
      </div>
    </section>
  );
};