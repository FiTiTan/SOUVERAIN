/**
 * SOUVERAIN - ModeSelector
 * Sélection du mode de portfolio : Indépendant ou Commerce
 */

import React, { useState } from 'react';
import { useTheme } from '../../ThemeContext';
import { typography, borderRadius, transitions, spacing } from '../../design-system';
import { PORTFOLIO_MODES, type PortfolioMode, type PortfolioModeConfig } from '../../types/sectors';

interface ModeSelectorProps {
  selectedMode: PortfolioMode | null;
  onSelect: (mode: PortfolioMode) => void;
  disabled?: boolean;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  selectedMode,
  onSelect,
  disabled = false,
}) => {
  const { theme } = useTheme();
  const [hoveredMode, setHoveredMode] = useState<PortfolioMode | null>(null);

  const modes = Object.values(PORTFOLIO_MODES);

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: spacing[6],
      width: '100%',
      maxWidth: '800px',
      margin: '0 auto',
    },
    header: {
      textAlign: 'center' as const,
    },
    title: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: theme.text.primary,
      marginBottom: spacing[2],
    },
    subtitle: {
      fontSize: typography.fontSize.base,
      color: theme.text.secondary,
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: spacing[4],
    },
    card: {
      position: 'relative' as const,
      display: 'flex',
      flexDirection: 'column' as const,
      padding: spacing[6],
      backgroundColor: theme.bg.secondary,
      border: `2px solid ${theme.border.light}`,
      borderRadius: borderRadius.xl,
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: transitions.normal,
      opacity: disabled ? 0.5 : 1,
    },
    cardHovered: {
      borderColor: theme.accent.primary,
      boxShadow: theme.shadow.lg,
      transform: 'translateY(-4px)',
    },
    cardSelected: {
      borderColor: theme.accent.primary,
      backgroundColor: theme.accent.muted,
    },
    iconContainer: {
      width: '64px',
      height: '64px',
      borderRadius: borderRadius.xl,
      backgroundColor: theme.bg.tertiary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '2rem',
      marginBottom: spacing[4],
    },
    cardTitle: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text.primary,
      marginBottom: spacing[2],
    },
    cardDescription: {
      fontSize: typography.fontSize.sm,
      color: theme.text.secondary,
      marginBottom: spacing[4],
      lineHeight: typography.lineHeight.relaxed,
    },
    featuresList: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: spacing[2],
    },
    featureItem: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[2],
      fontSize: typography.fontSize.sm,
      color: theme.text.secondary,
    },
    featureIcon: {
      color: theme.accent.primary,
      fontSize: typography.fontSize.base,
    },
    checkmark: {
      position: 'absolute' as const,
      top: spacing[4],
      right: spacing[4],
      width: '28px',
      height: '28px',
      borderRadius: borderRadius.full,
      backgroundColor: theme.accent.primary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#FFFFFF',
      fontSize: typography.fontSize.base,
    },
  };

  const getCardStyle = (mode: PortfolioModeConfig) => {
    const isSelected = selectedMode === mode.id;
    const isHovered = hoveredMode === mode.id;

    return {
      ...styles.card,
      ...(isHovered && !disabled ? styles.cardHovered : {}),
      ...(isSelected ? styles.cardSelected : {}),
    };
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Quel type de portfolio souhaitez-vous créer ?</h2>
        <p style={styles.subtitle}>
          Choisissez le mode adapté à votre activité pour bénéficier des fonctionnalités les plus pertinentes.
        </p>
      </div>

      <div style={styles.grid}>
        {modes.map((mode) => (
          <div
            key={mode.id}
            style={getCardStyle(mode)}
            onClick={() => !disabled && onSelect(mode.id)}
            onMouseEnter={() => setHoveredMode(mode.id)}
            onMouseLeave={() => setHoveredMode(null)}
            role="button"
            tabIndex={disabled ? -1 : 0}
            onKeyDown={(e) => {
              if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
                e.preventDefault();
                onSelect(mode.id);
              }
            }}
            aria-selected={selectedMode === mode.id}
            aria-disabled={disabled}
          >
            {/* Checkmark si sélectionné */}
            {selectedMode === mode.id && (
              <div style={styles.checkmark}>✓</div>
            )}

            {/* Icône */}
            <div style={styles.iconContainer}>
              {mode.icon}
            </div>

            {/* Titre */}
            <h3 style={styles.cardTitle}>{mode.label}</h3>

            {/* Description */}
            <p style={styles.cardDescription}>{mode.description}</p>

            {/* Features */}
            <div style={styles.featuresList}>
              {mode.features.map((feature, index) => (
                <div key={index} style={styles.featureItem}>
                  <span style={styles.featureIcon}>✓</span>
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ModeSelector;
