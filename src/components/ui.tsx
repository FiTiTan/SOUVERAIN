/**
 * SOUVERAIN - UI Components
 * Composants réutilisables style Google/Palantir
 */

import React, { ReactNode } from 'react';
import { useTheme } from '../ThemeContext';
import { getScoreColor, getScoreLabel, typography, borderRadius, transitions } from '../design-system';

// ============================================================
// BENTO BOX - Container avec grid
// ============================================================

interface BentoBoxProps {
  children: ReactNode;
  columns?: number;
  gap?: string;
  className?: string;
}

export const BentoBox: React.FC<BentoBoxProps> = ({ 
  children, 
  columns = 2, 
  gap = '1rem',
  className = '' 
}) => {
  const { theme } = useTheme();
  
  return (
    <div 
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap,
      }}
    >
      {children}
    </div>
  );
};

// ============================================================
// BENTO CARD - Carte individuelle
// ============================================================

interface BentoCardProps {
  children: ReactNode;
  span?: number;
  rowSpan?: number;
  padding?: string;
  className?: string;
  onClick?: () => void;
}

export const BentoCard: React.FC<BentoCardProps> = ({ 
  children, 
  span = 1,
  rowSpan = 1,
  padding = '1.5rem',
  className = '',
  onClick
}) => {
  const { theme } = useTheme();
  
  return (
    <div 
      className={className}
      onClick={onClick}
      style={{
        gridColumn: `span ${span}`,
        gridRow: `span ${rowSpan}`,
        backgroundColor: theme.bg.secondary,
        borderRadius: borderRadius.xl,
        padding,
        border: `1px solid ${theme.border.light}`,
        boxShadow: theme.shadow.sm,
        transition: transitions.normal,
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      {children}
    </div>
  );
};

// ============================================================
// SCORE CIRCLE - Score circulaire
// ============================================================

interface ScoreCircleProps {
  score: number;
  maxScore?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  label?: string;
}

export const ScoreCircle: React.FC<ScoreCircleProps> = ({ 
  score, 
  maxScore = 10,
  size = 'md',
  showLabel = true,
  label
}) => {
  const { theme, mode } = useTheme();
  const color = getScoreColor(score, mode === 'dark');
  const percentage = (score / maxScore) * 100;
  
  const sizes = {
    sm: { width: 60, stroke: 4, fontSize: '1rem' },
    md: { width: 80, stroke: 5, fontSize: '1.25rem' },
    lg: { width: 100, stroke: 6, fontSize: '1.5rem' },
    xl: { width: 140, stroke: 8, fontSize: '2rem' },
  };
  
  const { width, stroke, fontSize } = sizes[size];
  const radius = (width - stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
      <div style={{ position: 'relative', width, height: width }}>
        <svg width={width} height={width} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background circle */}
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            fill="none"
            stroke={theme.border.light}
            strokeWidth={stroke}
          />
          {/* Progress circle */}
          <circle
            cx={width / 2}
            cy={width / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        {/* Score text */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize,
          fontWeight: typography.fontWeight.bold,
          color: theme.text.primary,
        }}>
          {score.toFixed(1)}
        </div>
      </div>
      {showLabel && (
        <span style={{ 
          fontSize: typography.fontSize.sm, 
          color: theme.text.secondary,
          fontWeight: typography.fontWeight.medium,
        }}>
          {label || getScoreLabel(score)}
        </span>
      )}
    </div>
  );
};

// ============================================================
// SCORE BAR - Barre de progression
// ============================================================

interface ScoreBarProps {
  score: number;
  maxScore?: number;
  label: string;
  description?: string;
}

export const ScoreBar: React.FC<ScoreBarProps> = ({ 
  score, 
  maxScore = 10,
  label,
  description
}) => {
  const { theme, mode } = useTheme();
  const color = getScoreColor(score, mode === 'dark');
  const percentage = (score / maxScore) * 100;
  
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'baseline',
        marginBottom: '0.5rem' 
      }}>
        <span style={{ 
          fontSize: typography.fontSize.sm, 
          fontWeight: typography.fontWeight.medium,
          color: theme.text.primary 
        }}>
          {label}
        </span>
        <span style={{ 
          fontSize: typography.fontSize.sm, 
          fontWeight: typography.fontWeight.bold,
          color 
        }}>
          {score}/{maxScore}
        </span>
      </div>
      <div style={{
        height: '8px',
        backgroundColor: theme.border.light,
        borderRadius: borderRadius.full,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${percentage}%`,
          backgroundColor: color,
          borderRadius: borderRadius.full,
          transition: 'width 0.5s ease',
        }} />
      </div>
      {description && (
        <p style={{ 
          fontSize: typography.fontSize.xs, 
          color: theme.text.tertiary,
          marginTop: '0.25rem',
        }}>
          {description}
        </p>
      )}
    </div>
  );
};

// ============================================================
// SECTION HEADER - Titre de section
// ============================================================

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title, 
  subtitle,
  icon,
  action 
}) => {
  const { theme } = useTheme();
  
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'flex-start',
      marginBottom: '1.25rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {icon && (
          <div style={{ 
            color: theme.accent.primary,
            display: 'flex',
            alignItems: 'center',
          }}>
            {icon}
          </div>
        )}
        <div>
          <h2 style={{ 
            fontSize: typography.fontSize.lg, 
            fontWeight: typography.fontWeight.semibold,
            color: theme.text.primary,
            margin: 0,
          }}>
            {title}
          </h2>
          {subtitle && (
            <p style={{ 
              fontSize: typography.fontSize.sm, 
              color: theme.text.tertiary,
              margin: '0.25rem 0 0 0',
            }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
};

// ============================================================
// TAG / BADGE
// ============================================================

interface TagProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'accent';
  size?: 'sm' | 'md';
}

export const Tag: React.FC<TagProps> = ({ 
  children, 
  variant = 'default',
  size = 'sm' 
}) => {
  const { theme } = useTheme();
  
  const variants = {
    default: { bg: theme.border.light, color: theme.text.secondary },
    success: { bg: theme.semantic.successBg, color: theme.semantic.success },
    warning: { bg: theme.semantic.warningBg, color: theme.semantic.warning },
    error: { bg: theme.semantic.errorBg, color: theme.semantic.error },
    info: { bg: theme.semantic.infoBg, color: theme.semantic.info },
    accent: { bg: theme.accent.muted, color: theme.accent.primary },
  };
  
  const { bg, color } = variants[variant];
  
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: size === 'sm' ? '0.25rem 0.5rem' : '0.375rem 0.75rem',
      fontSize: size === 'sm' ? typography.fontSize.xs : typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      backgroundColor: bg,
      color,
      borderRadius: borderRadius.md,
    }}>
      {children}
    </span>
  );
};

// ============================================================
// BUTTON
// ============================================================

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  icon?: ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  icon
}) => {
  const { theme } = useTheme();
  
  const variants = {
    primary: { 
      bg: theme.accent.primary, 
      color: '#FFFFFF',
      border: 'none',
      hoverBg: theme.accent.secondary,
    },
    secondary: { 
      bg: 'transparent', 
      color: theme.text.primary,
      border: `1px solid ${theme.border.default}`,
      hoverBg: theme.bg.tertiary,
    },
    ghost: { 
      bg: 'transparent', 
      color: theme.text.secondary,
      border: 'none',
      hoverBg: theme.bg.tertiary,
    },
  };
  
  const sizes = {
    sm: { padding: '0.5rem 0.875rem', fontSize: typography.fontSize.sm },
    md: { padding: '0.625rem 1.125rem', fontSize: typography.fontSize.sm },
    lg: { padding: '0.75rem 1.5rem', fontSize: typography.fontSize.base },
  };
  
  const { bg, color, border } = variants[variant];
  const { padding, fontSize } = sizes[size];
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        padding,
        fontSize,
        fontWeight: typography.fontWeight.medium,
        backgroundColor: bg,
        color,
        border,
        borderRadius: borderRadius.lg,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: transitions.fast,
        fontFamily: typography.fontFamily.sans,
      }}
    >
      {icon}
      {children}
    </button>
  );
};

// ============================================================
// TOGGLE SWITCH (pour dark mode)
// ============================================================

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ 
  checked, 
  onChange,
  label 
}) => {
  const { theme } = useTheme();
  
  return (
    <label style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '0.75rem',
      cursor: 'pointer',
    }}>
      <div style={{
        position: 'relative',
        width: '44px',
        height: '24px',
        backgroundColor: checked ? theme.accent.primary : theme.border.default,
        borderRadius: borderRadius.full,
        transition: transitions.fast,
      }}>
        <div style={{
          position: 'absolute',
          top: '2px',
          left: checked ? '22px' : '2px',
          width: '20px',
          height: '20px',
          backgroundColor: '#FFFFFF',
          borderRadius: borderRadius.full,
          transition: transitions.fast,
          boxShadow: theme.shadow.sm,
        }} />
      </div>
      <input 
        type="checkbox" 
        checked={checked} 
        onChange={(e) => onChange(e.target.checked)}
        style={{ display: 'none' }}
      />
      {label && (
        <span style={{ 
          fontSize: typography.fontSize.sm, 
          color: theme.text.secondary 
        }}>
          {label}
        </span>
      )}
    </label>
  );
};

// ============================================================
// DIVIDER
// ============================================================

interface DividerProps {
  margin?: string;
}

export const Divider: React.FC<DividerProps> = ({ margin = '1.5rem 0' }) => {
  const { theme } = useTheme();
  
  return (
    <hr style={{
      border: 'none',
      borderTop: `1px solid ${theme.border.light}`,
      margin,
    }} />
  );
};

// ============================================================
// A4 DOCUMENT PREVIEW
// ============================================================

interface DocumentPreviewProps {
  children: ReactNode;
  scale?: number;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({ 
  children,
  scale = 0.7 
}) => {
  const { theme } = useTheme();
  
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      padding: '2rem',
      backgroundColor: theme.bg.tertiary,
      borderRadius: borderRadius.xl,
      overflow: 'auto',
    }}>
      <div style={{
        width: `${595 * scale}px`,
        minHeight: `${842 * scale}px`,
        backgroundColor: '#FFFFFF',
        boxShadow: theme.shadow.xl,
        padding: `${20 * scale}mm`,
        fontFamily: typography.fontFamily.document,
        fontSize: `${scale * 100}%`,
        color: '#1A1A1A',
      }}>
        {children}
      </div>
    </div>
  );
};
