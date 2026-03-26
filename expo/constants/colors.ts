export const lightTheme = {
  background: '#F9FAFB',
  surface: '#FFFFFF',
  surfaceSecondary: '#F3F4F6',
  text: '#111827',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  tint: '#3B82F6',
  success: '#10B981',
  successLight: '#DCFCE7',
  successDark: '#059669',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  warningDark: '#D97706',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  errorDark: '#991B1B',
  info: '#3B82F6',
  infoLight: '#EFF6FF',
  infoDark: '#1E40AF',
  card: '#FFFFFF',
  cardShadow: 'rgba(0, 0, 0, 0.05)',
};

export const darkTheme = {
  background: '#0F172A',
  surface: '#1E293B',
  surfaceSecondary: '#334155',
  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  textTertiary: '#64748B',
  border: '#334155',
  borderLight: '#475569',
  tint: '#60A5FA',
  success: '#34D399',
  successLight: '#064E3B',
  successDark: '#6EE7B7',
  warning: '#FBBF24',
  warningLight: '#78350F',
  warningDark: '#FCD34D',
  error: '#F87171',
  errorLight: '#7F1D1D',
  errorDark: '#FCA5A5',
  info: '#60A5FA',
  infoLight: '#1E3A8A',
  infoDark: '#93C5FD',
  card: '#1E293B',
  cardShadow: 'rgba(0, 0, 0, 0.3)',
};

export type Theme = typeof lightTheme;

const tintColorLight = '#3B82F6';

export default {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#ccc',
    tabIconSelected: tintColorLight,
  },
};
