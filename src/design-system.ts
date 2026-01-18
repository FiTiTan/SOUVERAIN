/**
 * SOUVERAIN V17 - Design System
 * Style: Google meets Palantir
 * Monochrome + Accent color + Dark mode
 */

// ============================================================
// THEME CONFIGURATION
// ============================================================

export const theme = {
  light: {
    name: 'light',
    // Backgrounds
    bg: {
      primary: '#FAFAFA',      // Blanc cassé principal
      secondary: '#FFFFFF',    // Cards, surfaces
      tertiary: '#F5F5F5',     // Bento boxes, sections
      elevated: '#FFFFFF',     // Modals, dropdowns
      document: '#FFFFFF',     // A4 document preview
    },
    // Text
    text: {
      primary: '#1A1A1A',      // Titres, texte principal
      secondary: '#4A4A4A',    // Sous-titres, labels
      tertiary: '#717171',     // Hints, placeholders
      muted: '#9E9E9E',        // Désactivé
      inverse: '#FFFFFF',      // Sur fond sombre
    },
    // Borders & Dividers
    border: {
      light: '#E8E8E8',
      default: '#D4D4D4',
      strong: '#BDBDBD',
    },
    // Accent - Couleur signature (bleu professionnel)
    accent: {
      primary: '#2563EB',      // Bleu principal
      secondary: '#3B82F6',    // Hover
      tertiary: '#60A5FA',     // Light
      muted: '#DBEAFE',        // Background accent
    },
    // Semantic colors
    semantic: {
      success: '#16A34A',
      successBg: '#DCFCE7',
      warning: '#CA8A04',
      warningBg: '#FEF9C3',
      error: '#DC2626',
      errorBg: '#FEE2E2',
      info: '#2563EB',
      infoBg: '#DBEAFE',
    },
    // Scoring colors (gradient)
    score: {
      excellent: '#16A34A',    // 9-10
      good: '#22C55E',         // 7-8
      average: '#EAB308',      // 5-6
      poor: '#F97316',         // 3-4
      critical: '#DC2626',     // 1-2
    },
    // Shadows
    shadow: {
      sm: '0 1px 2px rgba(0,0,0,0.05)',
      md: '0 4px 6px rgba(0,0,0,0.05)',
      lg: '0 10px 15px rgba(0,0,0,0.05)',
      xl: '0 20px 25px rgba(0,0,0,0.08)',
    }
  },
  dark: {
    name: 'dark',
    // Backgrounds
    bg: {
      primary: '#0F0F0F',      // Fond principal
      secondary: '#171717',    // Cards, surfaces
      tertiary: '#1F1F1F',     // Bento boxes
      elevated: '#262626',     // Modals
      document: '#1A1A1A',     // A4 document (légèrement plus clair)
    },
    // Text
    text: {
      primary: '#F5F5F5',
      secondary: '#A3A3A3',
      tertiary: '#737373',
      muted: '#525252',
      inverse: '#0F0F0F',
    },
    // Borders
    border: {
      light: '#262626',
      default: '#333333',
      strong: '#404040',
    },
    // Accent
    accent: {
      primary: '#3B82F6',
      secondary: '#60A5FA',
      tertiary: '#93C5FD',
      muted: '#1E3A5F',
    },
    // Semantic
    semantic: {
      success: '#22C55E',
      successBg: '#14532D',
      warning: '#EAB308',
      warningBg: '#422006',
      error: '#EF4444',
      errorBg: '#450A0A',
      info: '#3B82F6',
      infoBg: '#1E3A5F',
    },
    // Scoring
    score: {
      excellent: '#22C55E',
      good: '#4ADE80',
      average: '#FACC15',
      poor: '#FB923C',
      critical: '#EF4444',
    },
    // Shadows (plus subtils en dark mode)
    shadow: {
      sm: '0 1px 2px rgba(0,0,0,0.3)',
      md: '0 4px 6px rgba(0,0,0,0.3)',
      lg: '0 10px 15px rgba(0,0,0,0.3)',
      xl: '0 20px 25px rgba(0,0,0,0.4)',
    }
  }
};

// ============================================================
// TYPOGRAPHY
// ============================================================

export const typography = {
  fontFamily: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
    document: "'Georgia', 'Times New Roman', serif", // Pour les previews A4
  },
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem',  // 36px
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

// ============================================================
// SPACING & LAYOUT
// ============================================================

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
};

export const borderRadius = {
  none: '0',
  sm: '0.25rem',   // 4px
  md: '0.5rem',    // 8px
  lg: '0.75rem',   // 12px
  xl: '1rem',      // 16px
  '2xl': '1.5rem', // 24px
  full: '9999px',
};

// ============================================================
// BENTO BOX GRID
// ============================================================

export const bentoGrid = {
  // Configurations de grilles pour différentes sections
  dashboard: {
    columns: 'repeat(4, 1fr)',
    gap: '1rem',
    areas: `
      "score score experience experience"
      "ats ats structure structure"
      "actions actions actions actions"
    `
  },
  compact: {
    columns: 'repeat(3, 1fr)',
    gap: '0.75rem',
  },
  wide: {
    columns: 'repeat(6, 1fr)',
    gap: '1rem',
  }
};

// ============================================================
// A4 DOCUMENT DIMENSIONS
// ============================================================

export const documentA4 = {
  width: '210mm',
  height: '297mm',
  padding: '20mm',
  // Pour l'écran (aspect ratio préservé)
  screenWidth: '595px',  // 210mm @ 72dpi
  screenHeight: '842px', // 297mm @ 72dpi
  scaleFactor: 0.7,      // Scale pour preview
};

// ============================================================
// ANIMATIONS
// ============================================================

export const transitions = {
  fast: '150ms ease',
  normal: '250ms ease',
  slow: '350ms ease',
  spring: '500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
};

// ============================================================
// Z-INDEX LAYERS
// ============================================================

export const zIndex = {
  base: 0,
  dropdown: 100,
  sticky: 200,
  modal: 300,
  tooltip: 400,
  toast: 500,
};

// ============================================================
// HELPER: Get score color
// ============================================================

export const getScoreColor = (score: number, isDark: boolean = false) => {
  const colors = isDark ? theme.dark.score : theme.light.score;
  if (score >= 9) return colors.excellent;
  if (score >= 7) return colors.good;
  if (score >= 5) return colors.average;
  if (score >= 3) return colors.poor;
  return colors.critical;
};

// ============================================================
// HELPER: Get score label
// ============================================================

export const getScoreLabel = (score: number) => {
  if (score >= 9) return 'Excellent';
  if (score >= 7) return 'Bon';
  if (score >= 5) return 'Moyen';
  if (score >= 3) return 'À améliorer';
  return 'Critique';
};
