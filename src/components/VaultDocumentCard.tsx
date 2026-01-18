/**
 * SOUVERAIN - Vault Document Card
 * Carte d'affichage pour un document du coffre-fort
 */

import React, { useState } from 'react';
import { useTheme } from '../ThemeContext';
import { typography, borderRadius, transitions } from '../design-system';
import type { VaultDocument, VaultCategory } from './VaultModule';

// ============================================================
// ICONS
// ============================================================

const Icons = {
  PDF: () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <text x="7" y="17" fontSize="6" fontWeight="500" fill="currentColor">PDF</text>
    </svg>
  ),
  Word: () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <text x="6" y="17" fontSize="5" fontWeight="500" fill="currentColor">DOC</text>
    </svg>
  ),
  Image: () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
  File: () => (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  Star: ({ filled }: { filled: boolean }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  MoreVertical: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  ),
  Download: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  Edit: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  Trash: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
};

// ============================================================
// HELPERS
// ============================================================

const getFileIcon = (fileType: string) => {
  const type = fileType.toLowerCase();
  if (type === 'pdf') return Icons.PDF;
  if (['doc', 'docx'].includes(type)) return Icons.Word;
  if (['png', 'jpg', 'jpeg'].includes(type)) return Icons.Image;
  return Icons.File;
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getCategoryLabel = (category: VaultCategory): string => {
  const labels: Record<VaultCategory, string> = {
    cv: 'CV',
    cover_letter: 'Lettre',
    portfolio: 'Portfolio',
    certificate: 'Certif',
    reference: 'Reco',
    contract: 'Contrat',
    payslip: 'Paie',
    other: 'Autre',
  };
  return labels[category];
};

const getCategoryColor = (category: VaultCategory, isDark: boolean) => {
  const colors: Record<VaultCategory, { light: string; dark: string }> = {
    cv: { light: '#9333EA', dark: '#C084FC' },
    cover_letter: { light: '#2563EB', dark: '#60A5FA' },
    portfolio: { light: '#0891B2', dark: '#22D3EE' },
    certificate: { light: '#16A34A', dark: '#4ADE80' },
    reference: { light: '#EA580C', dark: '#FB923C' },
    contract: { light: '#DC2626', dark: '#EF4444' },
    payslip: { light: '#CA8A04', dark: '#FACC15' },
    other: { light: '#6B7280', dark: '#9CA3AF' },
  };
  return isDark ? colors[category].dark : colors[category].light;
};

// ============================================================
// COMPONENT
// ============================================================

interface VaultDocumentCardProps {
  document: VaultDocument;
  onPreview: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  onDownload: () => void;
  onUpdate: (updates: Partial<VaultDocument>) => void;
}

export const VaultDocumentCard: React.FC<VaultDocumentCardProps> = ({
  document,
  onPreview,
  onDelete,
  onToggleFavorite,
  onDownload,
  onUpdate,
}) => {
  const { theme, mode } = useTheme();
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(document.name);

  const FileIcon = getFileIcon(document.file_type);
  const categoryColor = getCategoryColor(document.category, mode === 'dark');

  const handleSaveEdit = () => {
    if (editedName.trim() && editedName !== document.name) {
      onUpdate({ name: editedName.trim() });
    }
    setIsEditing(false);
  };

  const styles = {
    card: {
      backgroundColor: theme.bg.secondary,
      border: `1px solid ${theme.border.light}`,
      borderRadius: borderRadius.xl,
      padding: '1.25rem',
      cursor: 'pointer',
      transition: transitions.normal,
      position: 'relative' as const,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1rem',
    },
    iconContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '80px',
      color: theme.text.tertiary,
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: '0.5rem',
    },
    nameContainer: {
      flex: 1,
      minWidth: 0,
    },
    name: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: theme.text.primary,
      wordBreak: 'break-word' as const,
      lineHeight: typography.lineHeight.tight,
    },
    nameInput: {
      width: '100%',
      padding: '0.25rem 0.5rem',
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      backgroundColor: theme.bg.tertiary,
      border: `1px solid ${theme.accent.primary}`,
      borderRadius: borderRadius.md,
      color: theme.text.primary,
      outline: 'none',
    },
    actions: {
      display: 'flex',
      gap: '0.25rem',
    },
    iconButton: (color?: string) => ({
      width: '28px',
      height: '28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: borderRadius.md,
      cursor: 'pointer',
      color: color || theme.text.secondary,
      transition: transitions.fast,
    }),
    footer: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.75rem',
    },
    meta: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: typography.fontSize.xs,
      color: theme.text.tertiary,
    },
    badge: {
      padding: '0.25rem 0.5rem',
      borderRadius: borderRadius.md,
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.medium,
      backgroundColor: `${categoryColor}15`,
      color: categoryColor,
      whiteSpace: 'nowrap' as const,
    },
    menu: {
      position: 'absolute' as const,
      top: '3rem',
      right: '1rem',
      backgroundColor: theme.bg.elevated,
      border: `1px solid ${theme.border.default}`,
      borderRadius: borderRadius.lg,
      boxShadow: theme.shadow.lg,
      padding: '0.5rem',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.25rem',
      zIndex: 10,
      minWidth: '160px',
    },
    menuItem: {
      padding: '0.625rem 0.875rem',
      fontSize: typography.fontSize.sm,
      color: theme.text.primary,
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: borderRadius.md,
      cursor: 'pointer',
      textAlign: 'left' as const,
      display: 'flex',
      alignItems: 'center',
      gap: '0.625rem',
      transition: transitions.fast,
    },
    menuItemDanger: {
      color: theme.semantic.error,
    },
  };

  return (
    <div
      style={styles.card}
      onClick={(e) => {
        if (!showMenu && !isEditing && e.target === e.currentTarget) {
          onPreview();
        }
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = theme.border.default;
        e.currentTarget.style.boxShadow = theme.shadow.md;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = theme.border.light;
        e.currentTarget.style.boxShadow = 'none';
        setShowMenu(false);
      }}
    >
      {/* Icon */}
      <div style={styles.iconContainer} onClick={onPreview}>
        <FileIcon />
      </div>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.nameContainer}>
          {isEditing ? (
            <input
              type="text"
              style={styles.nameInput}
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onBlur={handleSaveEdit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveEdit();
                if (e.key === 'Escape') {
                  setEditedName(document.name);
                  setIsEditing(false);
                }
              }}
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <div style={styles.name} onClick={onPreview}>
              {document.name}
            </div>
          )}
        </div>

        <div style={styles.actions}>
          {/* Favorite */}
          <button
            style={styles.iconButton(document.is_favorite ? '#FACC15' : undefined)}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            title={document.is_favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.bg.tertiary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Icons.Star filled={document.is_favorite} />
          </button>

          {/* Menu */}
          <button
            style={styles.iconButton()}
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            title="Options"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.bg.tertiary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Icons.MoreVertical />
          </button>
        </div>
      </div>

      {/* Tags */}
      {document.tags && document.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginTop: '-0.5rem' }}>
          {document.tags.slice(0, 1).map((tag, idx) => (
            <span
              key={idx}
              style={{
                fontSize: typography.fontSize.xs,
                padding: '0.125rem 0.5rem',
                backgroundColor: theme.bg.tertiary,
                color: theme.text.secondary,
                borderRadius: borderRadius.md,
                border: `1px solid ${theme.border.light}`,
              }}
            >
              {tag}
            </span>
          ))}
          {document.tags.length > 1 && (
            <span
              style={{
                fontSize: typography.fontSize.xs,
                padding: '0.125rem 0.5rem',
                backgroundColor: theme.bg.tertiary,
                color: theme.text.tertiary,
                borderRadius: borderRadius.md,
                border: `1px solid ${theme.border.light}`,
              }}
            >
              +{document.tags.length - 1}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={styles.footer}>
        <div style={styles.meta}>
          <span style={styles.badge}>{getCategoryLabel(document.category)}</span>
          <span>{formatFileSize(document.file_size)}</span>
        </div>
      </div>

      {/* Dropdown Menu */}
      {showMenu && (
        <div style={styles.menu} onClick={(e) => e.stopPropagation()}>
          <button
            style={styles.menuItem}
            onClick={() => {
              onDownload();
              setShowMenu(false);
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.bg.tertiary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Icons.Download />
            Télécharger
          </button>
          <button
            style={styles.menuItem}
            onClick={() => {
              setIsEditing(true);
              setShowMenu(false);
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.bg.tertiary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Icons.Edit />
            Renommer
          </button>
          <button
            style={{ ...styles.menuItem, ...styles.menuItemDanger }}
            onClick={() => {
              setShowMenu(false);
              onDelete();
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.semantic.errorBg;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <Icons.Trash />
            Supprimer
          </button>
        </div>
      )}
    </div>
  );
};
