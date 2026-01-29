/**
 * SOUVERAIN - Vault Empty State
 * État vide du coffre-fort
 */

import React from 'react';
import { useTheme } from '../ThemeContext';
import { typography, borderRadius, transitions } from '../design-system';

// ============================================================
// ICONS
// ============================================================

const Icons = {
  Lock: () => (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  Plus: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  ),
  Shield: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Database: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  ),
};

// ============================================================
// COMPONENT
// ============================================================

interface VaultEmptyStateProps {
  onAddDocument: () => void;
}

export const VaultEmptyState: React.FC<VaultEmptyStateProps> = ({ onAddDocument }) => {
  const { theme } = useTheme();

  console.log('[VaultEmptyState] Rendu avec onAddDocument:', typeof onAddDocument);

  const handleClick = () => {
    console.log('[VaultEmptyState] Bouton cliqué !');
    if (onAddDocument) {
      console.log('[VaultEmptyState] Appel de onAddDocument...');
      onAddDocument();
    } else {
      console.error('[VaultEmptyState] onAddDocument est undefined !');
    }
  };

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem 2rem',
      minHeight: '600px',
    },
    icon: {
      color: theme.text.tertiary,
      marginBottom: '2rem',
    },
    title: {
      fontSize: typography.fontSize['3xl'],
      fontWeight: typography.fontWeight.bold,
      color: theme.text.primary,
      marginBottom: '1rem',
      textAlign: 'center' as const,
    },
    description: {
      fontSize: typography.fontSize.base,
      color: theme.text.secondary,
      textAlign: 'center' as const,
      maxWidth: '500px',
      marginBottom: '2.5rem',
      lineHeight: typography.lineHeight.relaxed,
    },
    button: {
      padding: '1rem 2rem',
      backgroundColor: theme.accent.primary,
      color: '#FFFFFF',
      border: 'none',
      borderRadius: borderRadius.xl,
      cursor: 'pointer',
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      transition: transitions.normal,
      boxShadow: theme.shadow.md,
    },
    features: {
      marginTop: '4rem',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '2rem',
      maxWidth: '800px',
      width: '100%',
    },
    feature: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      textAlign: 'center' as const,
      padding: '1.5rem',
      backgroundColor: theme.bg.secondary,
      border: `1px solid ${theme.border.light}`,
      borderRadius: borderRadius.xl,
    },
    featureIcon: {
      color: theme.accent.primary,
      marginBottom: '1rem',
    },
    featureTitle: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text.primary,
      marginBottom: '0.5rem',
    },
    featureText: {
      fontSize: typography.fontSize.xs,
      color: theme.text.tertiary,
      lineHeight: typography.lineHeight.relaxed,
    },
  };

  return (
    <div style={styles.container}>
      {/* Icon */}
      <div style={styles.icon}>
        <Icons.Lock />
      </div>

      {/* Title */}
      <h1 style={styles.title}>Votre coffre-fort est vide</h1>

      {/* Description */}
      <p style={styles.description}>
        Stockez vos documents professionnels en toute sécurité avec un chiffrement AES-256.
        CV, lettres de motivation, diplômes, contrats... tout est protégé localement.
      </p>

      {/* CTA Button */}
      <button
        style={styles.button}
        onClick={handleClick}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = theme.accent.secondary;
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = theme.shadow.lg;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = theme.accent.primary;
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = theme.shadow.md;
        }}
      >
        <Icons.Plus />
        Ajouter votre premier document
      </button>

      {/* Features */}
      <div style={styles.features}>
        <div style={styles.feature}>
          <div style={styles.featureIcon}>
            <Icons.Shield />
          </div>
          <div style={styles.featureTitle}>Chiffrement AES-256</div>
          <div style={styles.featureText}>
            Vos documents sont chiffrés localement avant stockage
          </div>
        </div>

        <div style={styles.feature}>
          <div style={styles.featureIcon}>
            <Icons.Database />
          </div>
          <div style={styles.featureTitle}>Stockage local</div>
          <div style={styles.featureText}>
            Aucune donnée dans le cloud, tout reste sur votre machine
          </div>
        </div>

        <div style={styles.feature}>
          <div style={styles.featureIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <div style={styles.featureTitle}>Formats supportés</div>
          <div style={styles.featureText}>
            PDF, DOCX, TXT, PNG, JPG jusqu'à 10 MB
          </div>
        </div>
      </div>
    </div>
  );
};
