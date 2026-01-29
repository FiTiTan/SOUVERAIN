/**
 * SOUVERAIN - Vault Upgrade Modal
 * Modal pour encourager l'upgrade vers Premium
 */

import React from 'react';
import { useTheme } from '../ThemeContext';
import { typography, borderRadius, transitions } from '../design-system';

// ============================================================
// ICONS
// ============================================================

const Icons = {
  Lock: () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  Check: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  X: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
};

// ============================================================
// COMPONENT
// ============================================================

interface VaultUpgradeModalProps {
  reason: 'documents' | 'fileSize' | 'storage' | 'categories';
  onClose: () => void;
  onUpgrade: () => void;
}

export const VaultUpgradeModal: React.FC<VaultUpgradeModalProps> = ({
  reason,
  onClose,
  onUpgrade,
}) => {
  const { theme } = useTheme();

  const messages = {
    documents: {
      title: 'Limite de documents atteinte',
      description: 'Vous avez atteint la limite de 20 documents du plan gratuit.',
    },
    fileSize: {
      title: 'Fichier trop volumineux',
      description: 'Ce fichier dépasse la limite de 25 MB du plan gratuit.',
    },
    storage: {
      title: 'Espace de stockage insuffisant',
      description: 'Vous avez atteint la limite de 500 MB du plan gratuit.',
    },
    categories: {
      title: 'Limite de catégories atteinte',
      description: 'Vous avez atteint la limite de 3 catégories personnalisées du plan gratuit.',
    },
  };

  const message = messages[reason];

  const styles = {
    overlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '2rem',
    },
    modal: {
      backgroundColor: theme.bg.elevated,
      borderRadius: borderRadius.xl,
      width: '100%',
      maxWidth: '500px',
      boxShadow: theme.shadow.xl,
    },
    header: {
      padding: '1.5rem 2rem',
      borderBottom: `1px solid ${theme.border.light}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text.primary,
    },
    closeButton: {
      width: '36px',
      height: '36px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: borderRadius.md,
      cursor: 'pointer',
      color: theme.text.secondary,
      transition: transitions.fast,
    },
    body: {
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1.5rem',
      alignItems: 'center',
    },
    icon: {
      color: theme.accent.primary,
    },
    description: {
      fontSize: typography.fontSize.base,
      color: theme.text.secondary,
      textAlign: 'center' as const,
    },
    benefits: {
      width: '100%',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.75rem',
    },
    benefit: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.75rem',
      fontSize: typography.fontSize.sm,
      color: theme.text.primary,
    },
    checkIcon: {
      color: theme.accent.primary,
      flexShrink: 0,
      marginTop: '0.125rem',
    },
    footer: {
      padding: '1.5rem 2rem',
      borderTop: `1px solid ${theme.border.light}`,
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '0.75rem',
    },
    button: {
      padding: '0.75rem 1.5rem',
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      borderRadius: borderRadius.lg,
      cursor: 'pointer',
      transition: transitions.fast,
      border: 'none',
    },
    buttonSecondary: {
      backgroundColor: theme.bg.tertiary,
      color: theme.text.primary,
      border: `1px solid ${theme.border.light}`,
    },
    buttonPrimary: {
      backgroundColor: theme.accent.primary,
      color: '#FFFFFF',
    },
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <h2 style={styles.title}>{message.title}</h2>
          <button
            style={styles.closeButton}
            onClick={onClose}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.bg.tertiary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Icons.X />
          </button>
        </div>

        {/* Body */}
        <div style={styles.body}>
          <div style={styles.icon}>
            <Icons.Lock />
          </div>

          <p style={styles.description}>{message.description}</p>

          <div style={styles.benefits}>
            <div style={styles.benefit}>
              <div style={styles.checkIcon}>
                <Icons.Check />
              </div>
              <div>Documents illimités</div>
            </div>
            <div style={styles.benefit}>
              <div style={styles.checkIcon}>
                <Icons.Check />
              </div>
              <div>100 MB par fichier</div>
            </div>
            <div style={styles.benefit}>
              <div style={styles.checkIcon}>
                <Icons.Check />
              </div>
              <div>5 GB de stockage total</div>
            </div>
            <div style={styles.benefit}>
              <div style={styles.checkIcon}>
                <Icons.Check />
              </div>
              <div>Catégories personnalisées illimitées</div>
            </div>
            <div style={styles.benefit}>
              <div style={styles.checkIcon}>
                <Icons.Check />
              </div>
              <div>Protection par mot de passe</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button
            style={{ ...styles.button, ...styles.buttonSecondary }}
            onClick={onClose}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.bg.elevated;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.bg.tertiary;
            }}
          >
            Plus tard
          </button>
          <button
            style={{ ...styles.button, ...styles.buttonPrimary }}
            onClick={onUpgrade}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.accent.secondary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.accent.primary;
            }}
          >
            Découvrir Premium
          </button>
        </div>
      </div>
    </div>
  );
};
