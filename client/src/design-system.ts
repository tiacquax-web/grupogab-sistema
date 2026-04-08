// 🎨 Design System - Grupo GAB
// Tokens de design para consistência visual em todo o sistema

export const colors = {
  // Brand
  brand: {
    primary: '#0F172A',      // Azul escuro profissional
    secondary: '#3B82F6',    // Azul vibrante
    accent: '#10B981',       // Verde para sucesso
    warning: '#F59E0B',      // Laranja para alertas
    danger: '#EF4444',       // Vermelho para erros
  },
  
  // Neutrals
  neutral: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
  
  // Semantic
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // Financial
  financial: {
    positive: '#10B981',    // Verde para receitas/ganhos
    negative: '#EF4444',    // Vermelho para despesas/perdas
    pending: '#F59E0B',     // Laranja para pendente
    neutral: '#64748B',     // Cinza para neutro
  },
  
  // Status
  status: {
    active: '#10B981',
    inactive: '#94A3B8',
    suspended: '#F59E0B',
    archived: '#64748B',
  }
};

export const typography = {
  fontFamily: {
    sans: 'Inter, system-ui, -apple-system, sans-serif',
    mono: 'JetBrains Mono, Consolas, monospace',
  },
  
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
  },
  
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  }
};

export const spacing = {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
};

export const borderRadius = {
  none: '0',
  sm: '0.25rem',   // 4px
  base: '0.5rem',  // 8px
  md: '0.75rem',   // 12px
  lg: '1rem',      // 16px
  xl: '1.5rem',    // 24px
  full: '9999px',
};

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
};

export const animations = {
  transition: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
  },
  
  keyframes: {
    fadeIn: {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
    slideInFromRight: {
      from: { transform: 'translateX(100%)' },
      to: { transform: 'translateX(0)' },
    },
    slideInFromBottom: {
      from: { transform: 'translateY(20px)', opacity: 0 },
      to: { transform: 'translateY(0)', opacity: 1 },
    },
  }
};

// Componentes base
export const components = {
  button: {
    primary: {
      bg: colors.brand.secondary,
      hoverBg: '#2563EB',
      text: 'white',
      shadow: shadows.sm,
    },
    secondary: {
      bg: colors.neutral[100],
      hoverBg: colors.neutral[200],
      text: colors.neutral[900],
      shadow: shadows.sm,
    },
    success: {
      bg: colors.success,
      hoverBg: '#059669',
      text: 'white',
      shadow: shadows.sm,
    },
    danger: {
      bg: colors.danger,
      hoverBg: '#DC2626',
      text: 'white',
      shadow: shadows.sm,
    },
  },
  
  card: {
    bg: 'white',
    border: colors.neutral[200],
    shadow: shadows.sm,
    radius: borderRadius.lg,
    padding: spacing[6],
  },
  
  input: {
    bg: 'white',
    border: colors.neutral[300],
    focusBorder: colors.brand.secondary,
    radius: borderRadius.base,
    padding: `${spacing[2]} ${spacing[4]}`,
  },
};

// Layouts
export const layouts = {
  sidebar: {
    width: '16rem',        // 256px
    collapsedWidth: '4rem', // 64px
    bg: colors.neutral[900],
    textColor: colors.neutral[300],
    activeColor: colors.brand.secondary,
  },
  
  header: {
    height: '4rem',        // 64px
    bg: 'white',
    borderBottom: colors.neutral[200],
    shadow: shadows.sm,
  },
  
  container: {
    maxWidth: '1280px',
    padding: spacing[6],
  },
  
  section: {
    spacing: spacing[8],
  }
};

// Grid system
export const grid = {
  columns: 12,
  gap: spacing[6],
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  }
};

// Dashboard específico
export const dashboard = {
  card: {
    minHeight: '120px',
    padding: spacing[6],
    radius: borderRadius.lg,
    shadow: shadows.md,
    transition: animations.transition.base,
    hoverShadow: shadows.lg,
  },
  
  metric: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[900],
  },
  
  label: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[600],
  },
  
  trend: {
    positive: {
      color: colors.financial.positive,
      icon: '↗',
    },
    negative: {
      color: colors.financial.negative,
      icon: '↘',
    },
  }
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  animations,
  components,
  layouts,
  grid,
  dashboard,
};
