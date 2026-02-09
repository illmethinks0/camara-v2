/**
 * Application configuration and content constants
 */

import type { NavItem, UtilityLink, HeroContent, FeatureCard } from '../types';

export const NAVIGATION_ITEMS: NavItem[] = [
  { label: 'Inicio', href: '/' },
  { label: 'Programas', href: '/programas' },
  { label: 'Servicios', href: '/servicios' },
  { label: 'KPIs', href: '/kpis' },
  { label: 'Contacto', href: '/contacto' },
];

export const UTILITY_LINKS: UtilityLink[] = [
  { label: 'Portal Empleo', href: '/empleo' },
  { label: 'Área Cliente', href: '/area-cliente' },
];

export const HERO_CONTENT: HeroContent = {
  eyebrow: 'Programa Oficial',
  title: 'Talento 45+ - Generador de Documentos',
  bullets: [
    'Formación especializada en competencias digitales',
    'Dirigido a personas mayores de 45 años en desempleo',
    'Certificación oficial de la Cámara de Comercio',
    'Seguimiento personalizado y apoyo continuo'
  ],
  primaryCTA: { 
    text: 'Generar Documentos',
    onClick: () => {
      const element = document.getElementById('form-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  },
  secondaryCTA: { text: 'Más información', href: '/programas/talento-45' },
  image: { src: '/hero-formacion-digital.jpg', alt: 'Persona en formación digital trabajando con laptop' },
  backgroundColor: 'sand' as const,
};

export const FEATURE_CARDS: FeatureCard[] = [
  {
    title: 'Formación Digital',
    summary: 'Competencias tecnológicas esenciales para el mercado laboral actual',
    ctaText: 'Más detalles',
    ctaHref: '/formacion-digital',
    meta: { category: 'Competencias' },
  },
  {
    title: 'Orientación Laboral',
    summary: 'Asesoramiento personalizado para mejorar la empleabilidad',
    ctaText: 'Consultar',
    ctaHref: '/orientacion',
    meta: { category: 'Apoyo' },
  },
  {
    title: 'Seguimiento Continuo',
    summary: 'Acompañamiento durante todo el proceso formativo',
    ctaText: 'Conocer más',
    ctaHref: '/seguimiento',
    meta: { category: 'Soporte' },
  },
];

export const CTA_SECTION_CONTENT = {
  title: '¿Necesita más información?',
  description: 'Contacte con nuestro equipo especializado para resolver dudas sobre el programa Talento 45+ y conocer todas las oportunidades disponibles.',
  ctaText: 'Contactar ahora',
  ctaHref: '/contacto',
};

export const LOGO_CONFIG = {
  src: '/Screenshot 2025-10-05 at 16.27.51.png',
  alt: 'Cámara de Comercio de Menorca',
  height: '48px',
};