/**
 * SOUVERAIN - Privacy Badge
 * Badge RGPD permanent dans la sidebar
 */

import React, { useState } from 'react';
import { useTheme } from '../ThemeContext';
import { typography, borderRadius, transitions } from '../design-system';

interface PrivacyBadgeProps {
  collapsed: boolean;
  onClick?: () => void;
}

// Icône Shield
const ShieldIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

export const PrivacyBadge: React.FC<PrivacyBadgeProps> = ({ collapsed, onClick }) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  const styles = {
    container: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: collapsed ? '0.75rem' : '0.75rem 1rem',
      backgroundColor: isHovered ? theme.semantic.successBg : theme.bg.tertiary,
      border: `1px solid ${theme.border.light}`,
      borderRadius: borderRadius.lg,
      color: theme.semantic.success,
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.medium,
      cursor: onClick ? 'pointer' : 'default',
      transition: transitions.normal,
      justifyContent: collapsed ? 'center' : 'flex-start',
    },
    text: {
      whiteSpace: 'nowrap' as const,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  };

  return (
    <div
      style={styles.container}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      title={collapsed ? "Données protégées" : undefined}
    >
      <ShieldIcon />
      {!collapsed && <span style={styles.text}>Données protégées</span>}
    </div>
  );
};

/**
 * Modal d'information RGPD (pour futur usage)
 */

// Icône Shield plus grande pour la modal
const ShieldIconLarge: React.FC = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

export const PrivacyModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { theme } = useTheme();

  const styles = {
    backdrop: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },
    modal: {
      backgroundColor: theme.bg.elevated,
      borderRadius: borderRadius.xl,
      padding: '2rem',
      maxWidth: '500px',
      width: '90%',
      boxShadow: theme.shadow.xl,
      border: `1px solid ${theme.border.default}`,
    },
    title: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: theme.text.primary,
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    content: {
      fontSize: typography.fontSize.sm,
      color: theme.text.secondary,
      lineHeight: typography.lineHeight.relaxed,
      marginBottom: '1.5rem',
    },
    list: {
      listStyle: 'none',
      padding: 0,
      margin: '1rem 0',
    },
    listItem: {
      padding: '0.5rem 0',
      paddingLeft: '1.5rem',
      position: 'relative' as const,
      color: theme.text.secondary,
      fontSize: typography.fontSize.sm,
    },
    button: {
      padding: '0.75rem 1.5rem',
      backgroundColor: theme.accent.primary,
      color: '#FFFFFF',
      border: 'none',
      borderRadius: borderRadius.lg,
      cursor: 'pointer',
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      width: '100%',
    },
  };

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.title}>
          <ShieldIconLarge />
          Protection de vos données
        </h2>
        <div style={styles.content}>
          <p>
            SOUVERAIN respecte votre vie privée. Vos données professionnelles sont traitées
            avec le plus haut niveau de sécurité.
          </p>
          <ul style={styles.list}>
            <li style={styles.listItem}>✓ Anonymisation avant envoi au cloud</li>
            <li style={styles.listItem}>✓ Stockage local chiffré AES-256</li>
            <li style={styles.listItem}>✓ Aucune donnée vendue ou partagée</li>
            <li style={styles.listItem}>✓ Conformité RGPD</li>
          </ul>
          <p style={{ marginTop: '1rem' }}>
            Votre CV reste sur votre machine. Seule une version anonymisée est analysée par
            notre IA, et les données personnelles sont automatiquement restaurées après traitement.
          </p>
        </div>
        <button style={styles.button} onClick={onClose}>
          Compris
        </button>
      </div>
    </div>
  );
};
