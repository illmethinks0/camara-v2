/**
 * Hero section component for the Talento 45+ application
 */

import React from 'react';
import { Hero } from '../Hero/Hero';
import type { HeroContent } from '../../types';

interface HeroSectionProps {
  content: HeroContent;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ content }) => {
  return (
    <Hero
      eyebrow={content.eyebrow}
      title={content.title}
      bullets={content.bullets}
      primaryCTA={content.primaryCTA}
      secondaryCTA={content.secondaryCTA}
      image={content.image}
      backgroundColor={content.backgroundColor}
    />
  );
};