/**
 * SOUVERAIN - Premium Badge
 * Badge Premium pour indiquer les features bloquées
 */

import React from 'react';
import { useTheme } from '../ThemeContext';
import { typography, borderRadius } from '../design-system';

const CrownIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

interface PremiumBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  style?: React.CSSProperties;
}

export const PremiumBadge: React.FC<PremiumBadgeProps> = ({
  size = 'sm',
  showText = true,
  style,
}) => {
  const { theme } = useTheme();

  const sizes = {
    sm: {
      padding: '0.125rem 0.375rem',
      fontSize: typography.fontSize.xs,
      iconSize: '10px',
      gap: '0.25rem',
    },
    md: {
      padding: '0.25rem 0.5rem',
      fontSize: typography.fontSize.sm,
      iconSize: '12px',
      gap: '0.375rem',
    },
    lg: {
      padding: '0.375rem 0.75rem',
      fontSize: typography.fontSize.base,
      iconSize: '14px',
      gap: '0.5rem',
    },
  };

  const sizeStyle = sizes[size];

  const badgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: sizeStyle.gap,
    padding: sizeStyle.padding,
    backgroundColor: `${theme.accent.primary}15`,
    color: theme.accent.primary,
    borderRadius: borderRadius.md,
    fontSize: sizeStyle.fontSize,
    fontWeight: typography.fontWeight.semibold,
    lineHeight: 1,
    whiteSpace: 'nowrap',
    ...style,
  };

  return (
    <span style={badgeStyle}>
      <CrownIcon />
      {showText && <span>Premium</span>}
    </span>
  );
};
