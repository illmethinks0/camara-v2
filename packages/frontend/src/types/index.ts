/**
 * Core types and interfaces for the Talento 45+ application
 */

export interface NotificationState {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export interface PDFFormData {
  nombre: string;
  dni: string;
  telefono: string;
  email: string;
  direccion: string;
  fecha_nacimiento: string;
  nacionalidad: string;
  nivel_estudios: string;
  situacion_laboral: string;
  observaciones: string;
}

export interface GeneratedPDF {
  filename: string;
  downloadUrl: string;
  type: string;
}

export interface APIResponse {
  success: boolean;
  files?: GeneratedPDF[];
  message?: string;
  error?: string;
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export interface UtilityLink {
  label: string;
  href: string;
}

export interface HeroContent {
  eyebrow: string;
  title: string;
  bullets: string[];
  primaryCTA: {
    text: string;
    href?: string;
    onClick?: () => void;
  };
  secondaryCTA?: {
    text: string;
    href?: string;
    onClick?: () => void;
  };
  image: {
    src: string;
    alt: string;
  };
  backgroundColor?: 'sand' | 'sky' | 'lilac';
}

export interface FeatureCard {
  title: string;
  summary: string;
  ctaText: string;
  ctaHref: string;
  meta?: {
    category?: string;
    date?: string;
  };
}

// CAMARA v2 API Types
export * from './camara';