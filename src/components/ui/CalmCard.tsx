import React, { useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../ThemeContext';

interface CalmCardProps {
  onClick?: () => void;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  themeColor?: 'blue' | 'teal' | 'purple' | 'pink' | 'orange';
  recommended?: boolean;
  disabled?: boolean;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

// Color Definitions matching CALM-UI.md - moved outside component
const COLORS = {
  blue: {
    shadow: 'rgba(59, 130, 246, 0.4)',
    bg: 'rgba(59, 130, 246, 0.1)'
  },
  teal: {
    shadow: 'rgba(20, 184, 166, 0.4)',
    bg: 'rgba(20, 184, 166, 0.1)'
  },
  purple: {
    shadow: 'rgba(139, 92, 246, 0.4)',
    bg: 'rgba(139, 92, 246, 0.1)'
  },
  pink: {
    shadow: 'rgba(236, 72, 153, 0.4)',
    bg: 'rgba(236, 72, 153, 0.1)'
  },
  orange: {
    shadow: 'rgba(245, 158, 11, 0.4)',
    bg: 'rgba(245, 158, 11, 0.1)'
  }
} as const;

export const CalmCard: React.FC<CalmCardProps> = memo(({
  onClick,
  title,
  description,
  icon,
  themeColor = 'blue',
  recommended = false,
  disabled = false,
  style,
  children
}) => {
  const { theme, mode } = useTheme();

  const currentColor = useMemo(() => COLORS[themeColor] || COLORS.blue, [themeColor]);

  const cardStyle = useMemo(() => ({
    flex: 1,
    minWidth: '280px',
    maxWidth: '320px',
    minHeight: '360px',
    background: mode === 'dark'
      ? 'rgba(30, 30, 35, 0.6)'
      : 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(20px)',
    borderRadius: '32px',
    padding: '2.5rem 2rem',
    border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)'}`,
    boxShadow: `0 20px 40px -10px ${mode === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(200, 210, 230, 0.4)'}`,
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    textAlign: 'center' as const,
    position: 'relative' as const,
    overflow: 'visible' as const,
    transform: 'translate3d(0,0,0)',
    ...style
  }), [mode, disabled, style]);

  const motionVariants = useMemo(() => ({
    hover: {
      y: -8,
      scale: 1.02,
      boxShadow: `
        0 20px 40px -10px ${mode === 'dark' ? 'rgba(0,0,0,0.5)' : 'rgba(200, 210, 230, 0.4)'},
        0 20px 60px -20px ${currentColor.shadow}
      `
    },
    tap: { scale: 0.98 }
  }), [mode, currentColor]);

  const badgeStyle = useMemo(() => ({
    position: 'absolute' as const,
    top: '1.5rem',
    right: '1.5rem',
    backgroundColor: theme.accent.primary,
    color: '#ffffff',
    fontSize: '0.75rem',
    fontWeight: 700,
    padding: '0.25rem 0.75rem',
    borderRadius: '999px',
    letterSpacing: '0.05em',
    boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
  }), [theme]);

  const iconContainerStyle = useMemo(() => ({
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${currentColor.bg}, rgba(255,255,255,0))`,
    border: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)'}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '2rem',
    color: theme.text.primary,
    marginBottom: '2rem',
    boxShadow: 'inset 0 0 20px 0 rgba(255,255,255,0.1)'
  }), [currentColor, mode, theme]);

  const titleStyle = useMemo(() => ({
    fontSize: '1.5rem',
    fontWeight: 600,
    color: theme.text.primary,
    marginBottom: '1rem',
    letterSpacing: '-0.02em'
  }), [theme]);

  const descriptionStyle = useMemo(() => ({
    fontSize: '1rem',
    color: theme.text.secondary,
    lineHeight: 1.6,
    flex: 1
  }), [theme]);

  return (
    <motion.div
      onClick={!disabled ? onClick : undefined}
      whileHover={!disabled ? "hover" : undefined}
      whileTap={!disabled ? "tap" : undefined}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: disabled ? 0.7 : 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={cardStyle}
      variants={motionVariants}
    >
      {/* Recommended Badge */}
      {recommended && (
        <div style={badgeStyle}>
          RECOMMENDED
        </div>
      )}

      {/* Icon Area */}
      {icon && (
        <div style={iconContainerStyle}>
          {icon}
        </div>
      )}

      {/* Content */}
      <h3 style={titleStyle}>
        {title}
      </h3>

      {description && (
        <p style={descriptionStyle}>
          {description}
        </p>
      )}

      {children}
    </motion.div>
  );
});
