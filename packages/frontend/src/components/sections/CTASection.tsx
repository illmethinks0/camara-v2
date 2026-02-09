/**
 * Call-to-action section component
 */

import React from 'react';
import { Button } from '../Button/Button';

interface CTASectionProps {
  title: string;
  description: string;
  ctaText: string;
  ctaHref: string;
  backgroundColor?: string;
}

export const CTASection: React.FC<CTASectionProps> = ({
  title,
  description,
  ctaText,
  ctaHref,
  backgroundColor = 'var(--color-accent-yellow)',
}) => {
  return (
    <section className="section-band" style={{ background: backgroundColor }}>
      <div className="container text-center">
        <h2>{title}</h2>
        <p style={{ 
          fontSize: 'var(--font-size-body)', 
          marginBottom: 'var(--spacing-lg)',
          maxWidth: '600px',
          margin: '0 auto var(--spacing-lg)'
        }}>
          {description}
        </p>
        <a href={ctaHref}>
          <Button variant="primary" size="large">{ctaText}</Button>
        </a>
      </div>
    </section>
  );
};