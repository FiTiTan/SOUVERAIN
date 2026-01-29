import React from 'react';
import { useTheme } from '../../ThemeContext';
import { typography, borderRadius, transitions } from '../../design-system';

interface PortfolioEmptyStateProps {
  onCreateClick: () => void;
}

export const PortfolioEmptyState: React.FC<PortfolioEmptyStateProps> = ({ onCreateClick }) => {
  const { theme } = useTheme();

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      padding: '3rem',
      textAlign: 'center' as const,
    },
    icon: {
      fontSize: '5rem',
      marginBottom: '1.5rem',
      opacity: 0.8,
    },
    title: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: theme.text.primary,
      marginBottom: '0.75rem',
    },
    description: {
      fontSize: typography.fontSize.lg,
      color: theme.text.secondary,
      marginBottom: '2rem',
      maxWidth: '500px',
      lineHeight: typography.lineHeight.relaxed,
    },
    button: {
      padding: '0.875rem 2rem',
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: '#FFFFFF',
      backgroundColor: theme.accent.primary,
      border: 'none',
      borderRadius: borderRadius.lg,
      cursor: 'pointer',
      transition: transitions.normal,
      boxShadow: theme.shadow.sm,
    },
    features: {
      marginTop: '3rem',
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '2rem',
      maxWidth: '900px',
    },
    feature: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      gap: '0.5rem',
    },
    featureIcon: {
      fontSize: '2rem',
    },
    featureLabel: {
      fontSize: typography.fontSize.sm,
      color: theme.text.secondary,
      fontWeight: typography.fontWeight.medium,
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.icon}>🎨</div>
      <h2 style={styles.title}>Créez votre premier portfolio</h2>
      <p style={styles.description}>
        Présentez vos réalisations et démarquez-vous auprès des recruteurs avec un portfolio professionnel.
      </p>
      <button
        style={styles.button}
        onClick={onCreateClick}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = theme.accent.secondary;
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = theme.shadow.md;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = theme.accent.primary;
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = theme.shadow.sm;
        }}
      >
        + Créer mon portfolio
      </button>

      <div style={styles.features}>
        <div style={styles.feature}>
          <div style={styles.featureIcon}>📝</div>
          <span style={styles.featureLabel}>7 sections personnalisables</span>
        </div>
        <div style={styles.feature}>
          <div style={styles.featureIcon}>🚀</div>
          <span style={styles.featureLabel}>Projets et réalisations</span>
        </div>
        <div style={styles.feature}>
          <div style={styles.featureIcon}>📄</div>
          <span style={styles.featureLabel}>Export PDF professionnel</span>
        </div>
      </div>
    </div>
  );
};
