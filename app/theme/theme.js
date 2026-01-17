import { DefaultTheme, DarkTheme } from 'react-native-paper';

// Modern color palette
export const colors = {
  // Primary colors
  primary: '#6366F1', // Indigo
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  
  // Secondary colors
  secondary: '#EC4899', // Pink
  secondaryLight: '#F472B6',
  secondaryDark: '#DB2777',
  
  // Accent colors
  accent: '#14B8A6', // Teal
  accentLight: '#2DD4BF',
  accentDark: '#0D9488',
  
  // Sleep phase colors
  sleepPhases: {
    awake: '#EF4444', // Red
    light: '#3B82F6', // Blue
    deep: '#8B5CF6', // Purple
    rem: '#F59E0B', // Amber
  },
  
  // Semantic colors
  success: '#10B981', // Green
  warning: '#F59E0B', // Amber
  error: '#EF4444', // Red
  info: '#3B82F6', // Blue
  
  // Neutral colors - Light mode
  light: {
    background: '#F9FAFB',
    surface: '#FFFFFF',
    surfaceVariant: '#F3F4F6',
    text: '#111827',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    border: '#E5E7EB',
    disabled: '#D1D5DB',
    placeholder: '#9CA3AF',
    backdrop: 'rgba(0, 0, 0, 0.5)',
  },
  
  // Neutral colors - Dark mode
  dark: {
    background: '#111827',
    surface: '#1F2937',
    surfaceVariant: '#374151',
    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textTertiary: '#9CA3AF',
    border: '#374151',
    disabled: '#4B5563',
    placeholder: '#6B7280',
    backdrop: 'rgba(0, 0, 0, 0.7)',
  },
};

// Typography
export const typography = {
  // Font families
  fonts: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    light: 'System',
  },
  
  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },
  
  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
  
  // Font weights
  fontWeight: {
    light: '300',
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
};

// Spacing system (4px base)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
  '4xl': 64,
};

// Border radius
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

// Shadows
export const shadows = {
  none: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};

// Animation durations
export const animation = {
  fast: 200,
  normal: 300,
  slow: 500,
};

// Light theme
export const lightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    accent: colors.accent,
    background: colors.light.background,
    surface: colors.light.surface,
    text: colors.light.text,
    error: colors.error,
    disabled: colors.light.disabled,
    placeholder: colors.light.placeholder,
    backdrop: colors.light.backdrop,
    notification: colors.primary,
    
    // Custom colors
    primaryLight: colors.primaryLight,
    primaryDark: colors.primaryDark,
    secondary: colors.secondary,
    success: colors.success,
    warning: colors.warning,
    info: colors.info,
    textSecondary: colors.light.textSecondary,
    textTertiary: colors.light.textTertiary,
    border: colors.light.border,
    surfaceVariant: colors.light.surfaceVariant,
  },
  roundness: borderRadius.md,
  animation,
};

// Dark theme
export const darkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primaryLight,
    accent: colors.accentLight,
    background: colors.dark.background,
    surface: colors.dark.surface,
    text: colors.dark.text,
    error: colors.error,
    disabled: colors.dark.disabled,
    placeholder: colors.dark.placeholder,
    backdrop: colors.dark.backdrop,
    notification: colors.primaryLight,
    
    // Custom colors
    primaryLight: colors.primaryLight,
    primaryDark: colors.primaryDark,
    secondary: colors.secondaryLight,
    success: colors.success,
    warning: colors.warning,
    info: colors.info,
    textSecondary: colors.dark.textSecondary,
    textTertiary: colors.dark.textTertiary,
    border: colors.dark.border,
    surfaceVariant: colors.dark.surfaceVariant,
  },
  roundness: borderRadius.md,
  animation,
};

// Helper functions
export const getTheme = (isDark) => isDark ? darkTheme : lightTheme;

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animation,
  lightTheme,
  darkTheme,
  getTheme,
};
