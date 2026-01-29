import React, { useState } from 'react';
import { useTheme } from '../../ThemeContext';
import { typography, borderRadius, transitions } from '../../design-system';
import type { Portfolio } from '../../types/portfolio';

interface PortfolioCardProps {
  portfolio: Portfolio;
  onEdit: () => void;
  onDelete: () => void;
}

export const PortfolioCard: React.FC<PortfolioCardProps> = ({ portfolio, onEdit, onDelete }) => {
  const { theme } = useTheme();
  const [showMenu, setShowMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;
    if (diffDays < 365) return `Il y a ${Math.floor(diffDays / 30)} mois`;
    return date.toLocaleDateString('fr-FR');
  };

  const styles = {
    card: {
      backgroundColor: theme.bg.elevated,
      border: `1px solid ${isHovered ? theme.border.default : theme.border.light}`,
      borderRadius: borderRadius.xl,
      padding: '1.5rem',
      cursor: 'pointer',
      transition: transitions.normal,
      boxShadow: isHovered ? theme.shadow.md : 'none',
      position: 'relative' as const,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1rem',
    },
    preview: {
      width: '100%',
      height: '160px',
      backgroundColor: theme.bg.secondary,
      borderRadius: borderRadius.lg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '3rem',
      marginBottom: '0.5rem',
      border: `1px solid ${theme.border.light}`,
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: '1rem',
    },
    titleRow: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      flex: 1,
    },
    title: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text.primary,
      margin: 0,
    },
    badge: {
      padding: '0.25rem 0.5rem',
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.medium,
      backgroundColor: theme.accent.muted,
      color: theme.accent.primary,
      borderRadius: borderRadius.md,
    },
    menuButton: {
      width: '32px',
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: borderRadius.md,
      cursor: 'pointer',
      fontSize: typography.fontSize.lg,
      color: theme.text.secondary,
      transition: transitions.fast,
    },
    menu: {
      position: 'absolute' as const,
      top: '3.5rem',
      right: '1.5rem',
      backgroundColor: theme.bg.elevated,
      border: `1px solid ${theme.border.default}`,
      borderRadius: borderRadius.lg,
      boxShadow: theme.shadow.lg,
      padding: '0.5rem',
      zIndex: 10,
      minWidth: '150px',
    },
    menuItem: {
      width: '100%',
      padding: '0.625rem 0.875rem',
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: theme.text.primary,
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: borderRadius.md,
      cursor: 'pointer',
      textAlign: 'left' as const,
      transition: transitions.fast,
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    menuItemDelete: {
      color: theme.semantic.error,
    },
    metadata: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.25rem',
    },
    metaRow: {
      fontSize: typography.fontSize.sm,
      color: theme.text.secondary,
    },
    footer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '0.5rem',
      paddingTop: '1rem',
      borderTop: `1px solid ${theme.border.light}`,
    },
    editButton: {
      padding: '0.5rem 1rem',
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: theme.accent.primary,
      backgroundColor: theme.accent.muted,
      border: 'none',
      borderRadius: borderRadius.md,
      cursor: 'pointer',
      transition: transitions.fast,
    },
  };

  return (
    <div
      style={styles.card}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowMenu(false);
      }}
    >
      {/* Preview miniature */}
      <div style={styles.preview}>🎨</div>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.titleRow}>
          <h3 style={styles.title}>{portfolio.name}</h3>
        </div>
        <button
          style={styles.menuButton}
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.bg.secondary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          •••
        </button>
      </div>

      {/* Menu contextuel */}
      {showMenu && (
        <div style={styles.menu}>
          <button
            style={styles.menuItem}
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
              setShowMenu(false);
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.bg.secondary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            ✏️ Éditer
          </button>
          <button
            style={{ ...styles.menuItem, ...styles.menuItemDelete }}
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Supprimer le portfolio "${portfolio.name}" ?`)) {
                onDelete();
              }
              setShowMenu(false);
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.semantic.errorBg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            🗑 Supprimer
          </button>
        </div>
      )}

      {/* Metadata */}
      <div style={styles.metadata}>
        <div style={styles.metaRow}>Modifié {formatDate(portfolio.updated_at)}</div>
        <div style={styles.metaRow}>Template: {portfolio.template === 'modern' ? 'Modern' : portfolio.template}</div>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <button
          style={styles.editButton}
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.accent.secondary;
            e.currentTarget.style.color = '#FFFFFF';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = theme.accent.muted;
            e.currentTarget.style.color = theme.accent.primary;
          }}
        >
          Éditer
        </button>
      </div>
    </div>
  );
};
