export type Theme = {
  background: string;
  surface: string;
  surfaceSecondary: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  borderLight: string;
  tint: string;
  success: string;
  successLight: string;
  successDark: string;
  warning: string;
  warningLight: string;
  warningDark: string;
  error: string;
  errorLight: string;
  errorDark: string;
  info: string;
  infoLight: string;
  infoDark: string;
  card: string;
  cardShadow: string;
  statusBar: 'dark' | 'light';
};

export const lightTheme: Theme = {
  background: '#F8F9FB',
  surface: '#FFFFFF',
  surfaceSecondary: '#F1F3F5',
  text: '#1A1D23',
  textSecondary: '#5F6B7A',
  textTertiary: '#9AA5B4',
  border: '#E2E6EB',
  borderLight: '#F1F3F5',
  tint: '#2563EB',
  success: '#059669',
  successLight: '#ECFDF5',
  successDark: '#047857',
  warning: '#D97706',
  warningLight: '#FFFBEB',
  warningDark: '#B45309',
  error: '#DC2626',
  errorLight: '#FEF2F2',
  errorDark: '#991B1B',
  info: '#2563EB',
  infoLight: '#EFF6FF',
  infoDark: '#1D4ED8',
  card: '#FFFFFF',
  cardShadow: 'rgba(0, 0, 0, 0.06)',
  statusBar: 'dark',
};

export const darkTheme: Theme = {
  background: '#0B0E14',
  surface: '#141820',
  surfaceSecondary: '#1C2230',
  text: '#E8ECF1',
  textSecondary: '#8B95A5',
  textTertiary: '#555F70',
  border: '#1E2636',
  borderLight: '#232B3A',
  tint: '#3B82F6',
  success: '#10B981',
  successLight: '#0D2E23',
  successDark: '#34D399',
  warning: '#F59E0B',
  warningLight: '#2E2108',
  warningDark: '#FCD34D',
  error: '#EF4444',
  errorLight: '#2E0D0D',
  errorDark: '#FCA5A5',
  info: '#3B82F6',
  infoLight: '#0D1B3E',
  infoDark: '#93C5FD',
  card: '#141820',
  cardShadow: 'rgba(0, 0, 0, 0.4)',
  statusBar: 'light',
};
