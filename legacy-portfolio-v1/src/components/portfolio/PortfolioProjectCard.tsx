import React, { useState } from 'react';
import { useTheme } from '../../ThemeContext';
import { typography, borderRadius, transitions } from '../../design-system';

interface PortfolioProjectCardProps {
  project: any;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const PortfolioProjectCard: React.FC<PortfolioProjectCardProps> = ({
  project,
  onView,
  onEdit,
  onDelete,
}) => {
  const { theme } = useTheme();
  const [showMenu, setShowMenu] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const getSourceIcon = (sourceType: string | null) => {
    switch (sourceType) {
      case 'github':
        return '🐙';
      case 'local':
        return '📁';
      case 'dribbble':
        return '🎨';
      case 'behance':
        return '🅱️';
      default:
        return '✏️';
    }
  };

  const getSourceLabel = (sourceType: string | null) => {
    switch (sourceType) {
      case 'github':
        return 'GitHub';
      case 'local':
        return 'Local';
      case 'dribbble':
        return 'Dribbble';
      case 'behance':
        return 'Behance';
      default:
        return 'Manuel';
    }
  };

  const getTechnologies = () => {
    try {
      if (project.stack) {
        const stack = typeof project.stack === 'string' ? JSON.parse(project.stack) : project.stack;
        return Array.isArray(stack) ? stack.slice(0, 3) : [];
      }
      return [];
    } catch {
      return [];
    }
  };

  const technologies = getTechnologies();

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
    sourceIcon: {
      fontSize: typography.fontSize.xl,
      flexShrink: 0,
    },
    titleSection: {
      flex: 1,
      minWidth: 0,
    },
    title: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text.primary,
      margin: 0,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap' as const,
    },
    sourceLabel: {
      fontSize: typography.fontSize.xs,
      color: theme.text.secondary,
      marginTop: '0.25rem',
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
      flexShrink: 0,
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
    pitch: {
      fontSize: typography.fontSize.sm,
      color: theme.text.secondary,
      lineHeight: '1.5',
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical' as const,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    techStack: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '0.5rem',
    },
    techBadge: {
      padding: '0.25rem 0.625rem',
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.medium,
      backgroundColor: theme.bg.secondary,
      color: theme.text.primary,
      borderRadius: borderRadius.full,
      border: `1px solid ${theme.border.light}`,
    },
    badges: {
      display: 'flex',
      gap: '0.5rem',
      flexWrap: 'wrap' as const,
    },
    ghostBadge: {
      padding: '0.25rem 0.625rem',
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.medium,
      backgroundColor: 'rgba(168, 85, 247, 0.1)',
      color: '#A855F7',
      borderRadius: borderRadius.full,
      border: '1px solid rgba(168, 85, 247, 0.3)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
    },
    footer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '0.5rem',
      paddingTop: '1rem',
      borderTop: `1px solid ${theme.border.light}`,
    },
    viewButton: {
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
      onClick={onView}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowMenu(false);
      }}
    >
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.titleRow}>
          <span style={styles.sourceIcon}>{getSourceIcon(project.source_type)}</span>
          <div style={styles.titleSection}>
            <h3 style={styles.title}>{project.title}</h3>
            <div style={styles.sourceLabel}>{getSourceLabel(project.source_type)}</div>
          </div>
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
              onView();
              setShowMenu(false);
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.bg.secondary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            👁️ Voir
          </button>
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
              if (confirm(`Supprimer le projet "${project.title}" ?`)) {
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

      {/* Pitch */}
      {project.pitch && <div style={styles.pitch}>{project.pitch}</div>}

      {/* Technologies */}
      {technologies.length > 0 && (
        <div style={styles.techStack}>
          {technologies.map((tech: string, index: number) => (
            <span key={index} style={styles.techBadge}>
              {tech}
            </span>
          ))}
          {technologies.length < getTechnologies().length && (
            <span style={styles.techBadge}>+{getTechnologies().length - technologies.length}</span>
          )}
        </div>
      )}

      {/* Badges */}
      {project.is_ghost_mode === 1 && (
        <div style={styles.badges}>
          <span style={styles.ghostBadge}>
            <span>🕶️</span>
            <span>Ghost Mode</span>
          </span>
        </div>
      )}

      {/* Footer */}
      <div style={styles.footer}>
        <button
          style={styles.viewButton}
          onClick={(e) => {
            e.stopPropagation();
            onView();
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
          Voir le projet
        </button>
      </div>
    </div>
  );
};
