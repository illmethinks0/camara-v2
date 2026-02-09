/**
 * Features section component displaying program characteristics
 */

import React from 'react';
import { Card } from '../Card/Card';
import type { FeatureCard } from '../../types';

interface FeaturesSectionProps {
  title: string;
  cards: FeatureCard[];
  backgroundColor?: string;
}

export const FeaturesSection: React.FC<FeaturesSectionProps> = ({ 
  title, 
  cards, 
  backgroundColor = 'var(--color-surface-sky)' 
}) => {
  return (
    <section className="section-band" style={{ background: backgroundColor }}>
      <div className="container">
        <h2 className="text-center">{title}</h2>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: 'var(--spacing-lg)',
          marginTop: 'var(--spacing-xl)'
        }}>
          {cards.map((card, index) => (
            <Card
              key={index}
              title={card.title}
              summary={card.summary}
              ctaText={card.ctaText}
              ctaHref={card.ctaHref}
              meta={card.meta}
            />
          ))}
        </div>
      </div>
    </section>
  );
};