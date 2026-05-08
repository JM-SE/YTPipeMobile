export const colors = {
  background: '#0B1020',
  surface: '#121A30',
  textPrimary: '#E6ECFF',
  textSecondary: '#9AA7CC',
  accent: '#4F7CFF',
  border: '#223056',
  danger: '#EF6B73',
  success: '#4CC38A',
  warning: '#F2C66D',
  successSurface: 'rgba(76, 195, 138, 0.12)',
  dangerSurface: 'rgba(239, 107, 115, 0.12)',
  warningSurface: '#2A2418',
  successBadgeSurface: '#1B3A2C',
  warningBadgeSurface: '#4A3B1A',
  mutedSurface: 'rgba(154, 167, 204, 0.12)',
  backdrop: 'rgba(0, 0, 0, 0.65)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const typography = {
  title: 24,
  subtitle: 18,
  body: 16,
  caption: 13,
} as const;
