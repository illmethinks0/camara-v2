export const colors = {
  primary: {
    red: '#C31632',
    redDark: '#A5122B',
  },
  surface: {
    sand: '#FAF8F5',
    sky: '#F5F8FA',
    lilac: '#F8F5FA',
    white: '#FFFFFF',
    lightGray: '#FAFAFA',
  },
  accent: {
    yellow: '#FFC845',
  },
  text: {
    primary: '#333333',
    secondary: '#666666',
    inverse: '#FFFFFF',
  },
  border: {
    muted: '#E5E5E5',
    light: '#F0F0F0',
  },
} as const;

export const spacing = {
  xs: '8px',
  sm: '16px',
  md: '24px',
  lg: '32px',
  xl: '48px',
  section: {
    sm: '48px',
    md: '64px',
    lg: '80px',
  },
} as const;

export const breakpoints = {
  mobile: '480px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1440px',
} as const;

export const typography = {
  fonts: {
    heading: "'Open Sans', 'Helvetica Neue', Arial, sans-serif",
    body: "'Open Sans', 'Helvetica Neue', Arial, sans-serif",
  },
  sizes: {
    h1: '40px',
    h2: '32px',
    h3: '24px',
    h4: '20px',
    body: '17.6px',
    small: '14px',
  },
  weights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
} as const;

export const motion = {
  duration: {
    fast: '200ms',
    normal: '300ms',
    slow: '500ms',
  },
  easing: {
    standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  },
} as const;