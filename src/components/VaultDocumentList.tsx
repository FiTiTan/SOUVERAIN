/**
 * SOUVERAIN - Vault Document List
 * Vue tableau pour les documents du coffre-fort
 */

import React from 'react';
import { useTheme } from '../ThemeContext';
import { typography, borderRadius, transitions } from '../design-system';
import type { VaultDocument, VaultCategory } from './VaultModule';

// ============================================================
// ICONS
// ============================================================

const Icons = {
  Star: ({ filled }: { filled: boolean }) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  Download: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  Trash: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  Eye: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
};

// ============================================================
// HELPERS
// ============================================================

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getCategoryLabel = (category: VaultCategory): string => {
  const labels: Record<VaultCategory, string> = {
    cv: 'CV',
    cover_letter: 'Lettre de motivation',
    portfolio: 'Portfolio',
    certificate: 'Diplôme/Certif',
    reference: 'Recommandation',
    contract: 'Contrat',
    payslip: 'Fiche de paie',
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

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

// ============================================================
// COMPONENT
// ============================================================

interface VaultDocumentListProps {
  documents: VaultDocument[];
  onPreview: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
  onDownload: (id: string) => void;
  onUpdate: (id: string, updates: Partial<VaultDocument>) => void;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  onSort?: (column: string) => void;
}

export const VaultDocumentList: React.FC<VaultDocumentListProps> = ({
  documents,
  onPreview,
  onDelete,
  onToggleFavorite,
  onDownload,
  sortBy,
  sortOrder,
  onSort,
}) => {
  const { theme, mode } = useTheme();

  const styles = {
    container: {
      backgroundColor: theme.bg.secondary,
      border: `1px solid ${theme.border.light}`,
      borderRadius: borderRadius.xl,
      overflow: 'hidden',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse' as const,
    },
    thead: {
      backgroundColor: theme.bg.tertiary,
      borderBottom: `1px solid ${theme.border.light}`,
    },
    th: {
      padding: '1rem 1.25rem',
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text.secondary,
      textAlign: 'left' as const,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
    },
    thClickable: {
      cursor: 'pointer',
      userSelect: 'none' as const,
      transition: transitions.fast,
    },
    thContent: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.375rem',
    },
    tbody: {},
    tr: {
      borderBottom: `1px solid ${theme.border.light}`,
      cursor: 'pointer',
      transition: transitions.fast,
    },
    td: {
      padding: '1rem 1.25rem',
      fontSize: typography.fontSize.sm,
      color: theme.text.primary,
    },
    name: {
      fontWeight: typography.fontWeight.medium,
      color: theme.text.primary,
    },
    badge: (categoryColor: string) => ({
      padding: '0.25rem 0.625rem',
      borderRadius: borderRadius.md,
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.medium,
      backgroundColor: `${categoryColor}15`,
      color: categoryColor,
      whiteSpace: 'nowrap' as const,
      display: 'inline-block',
    }),
    actions: {
      display: 'flex',
      gap: '0.5rem',
      alignItems: 'center',
    },
    iconButton: (color?: string) => ({
      width: '32px',
      height: '32px',
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
    tags: {
      display: 'flex',
      gap: '0.375rem',
      flexWrap: 'wrap' as const,
    },
    tag: {
      padding: '0.125rem 0.5rem',
      backgroundColor: theme.bg.tertiary,
      color: theme.text.secondary,
      borderRadius: borderRadius.sm,
      fontSize: typography.fontSize.xs,
      border: `1px solid ${theme.border.light}`,
    },
    tagCount: {
      padding: '0.125rem 0.5rem',
      backgroundColor: theme.bg.tertiary,
      color: theme.text.tertiary,
      borderRadius: borderRadius.sm,
      fontSize: typography.fontSize.xs,
      border: `1px solid ${theme.border.light}`,
    },
  };

  const renderSortIcon = (column: string) => {
    if (sortBy !== column) return null;
    return sortOrder === 'ASC' ? ' ↑' : ' ↓';
  };

  const handleHeaderClick = (column: string) => {
    if (onSort) {
      onSort(column);
    }
  };

  return (
    <div style={styles.container}>
      <table style={styles.table}>
        <thead style={styles.thead}>
          <tr>
            <th style={{ ...styles.th, width: '40px' }}></th>
            <th
              style={{ ...styles.th, ...styles.thClickable }}
              onClick={() => handleHeaderClick('name')}
            >
              Nom{renderSortIcon('name')}
            </th>
            <th
              style={{ ...styles.th, ...styles.thClickable }}
              onClick={() => handleHeaderClick('category')}
            >
              Catégorie{renderSortIcon('category')}
            </th>
            <th
              style={{ ...styles.th, ...styles.thClickable }}
              onClick={() => handleHeaderClick('file_type')}
            >
              Type{renderSortIcon('file_type')}
            </th>
            <th
              style={{ ...styles.th, ...styles.thClickable }}
              onClick={() => handleHeaderClick('file_size')}
            >
              Taille{renderSortIcon('file_size')}
            </th>
            <th style={styles.th}>Tags</th>
            <th
              style={{ ...styles.th, ...styles.thClickable }}
              onClick={() => handleHeaderClick('created_at')}
            >
              Date{renderSortIcon('created_at')}
            </th>
            <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody style={styles.tbody}>
          {documents.map((doc, index) => {
            const categoryColor = getCategoryColor(doc.category, mode === 'dark');

            // Utiliser document_date si défini, sinon created_at
            const displayDate = doc.document_date || doc.created_at;

            // Extraire l'année du document
            const docYear = new Date(displayDate).getFullYear().toString();
            const prevDisplayDate = index > 0 ? (documents[index - 1].document_date || documents[index - 1].created_at) : null;
            const prevDocYear = prevDisplayDate ? new Date(prevDisplayDate).getFullYear().toString() : null;

            // Afficher ligne intercalaire si on trie par date et l'année change
            const showYearDivider = sortBy === 'created_at' && docYear !== prevDocYear;

            return (
              <React.Fragment key={doc.id}>
                {showYearDivider && (
                  <tr
                    style={{
                      backgroundColor: theme.bg.tertiary,
                      fontWeight: typography.fontWeight.semibold,
                      fontSize: typography.fontSize.sm,
                      color: theme.text.secondary,
                    }}
                  >
                    <td
                      colSpan={9}
                      style={{
                        padding: '0.5rem 1rem',
                        textAlign: 'center',
                        letterSpacing: '0.1em',
                      }}
                    >
                      ─────── {docYear} ───────
                    </td>
                  </tr>
                )}
                <tr
                  style={styles.tr}
                  onClick={() => onPreview(doc.id)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.bg.tertiary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                {/* Favorite */}
                <td style={styles.td}>
                  <button
                    style={styles.iconButton(doc.is_favorite ? '#FACC15' : undefined)}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(doc.id, doc.is_favorite);
                    }}
                    title={doc.is_favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme.bg.elevated;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <Icons.Star filled={doc.is_favorite} />
                  </button>
                </td>

                {/* Name */}
                <td style={styles.td}>
                  <div style={styles.name}>{doc.name}</div>
                </td>

                {/* Category */}
                <td style={styles.td}>
                  <span style={styles.badge(categoryColor)}>
                    {getCategoryLabel(doc.category)}
                  </span>
                </td>

                {/* File Type */}
                <td style={styles.td}>
                  <span style={{ textTransform: 'uppercase' }}>{doc.file_type}</span>
                </td>

                {/* File Size */}
                <td style={styles.td}>{formatFileSize(doc.file_size)}</td>

                {/* Tags */}
                <td style={styles.td}>
                  {doc.tags && doc.tags.length > 0 ? (
                    <div style={styles.tags}>
                      {doc.tags.slice(0, 2).map((tag, idx) => (
                        <span key={idx} style={styles.tag}>{tag}</span>
                      ))}
                      {doc.tags.length > 2 && (
                        <span style={styles.tagCount}>+{doc.tags.length - 2}</span>
                      )}
                    </div>
                  ) : (
                    <span style={{ color: theme.text.tertiary }}>—</span>
                  )}
                </td>

                {/* Date */}
                <td style={styles.td}>
                  <span style={{ color: theme.text.tertiary }}>
                    {formatDate(displayDate)}
                  </span>
                </td>

                {/* Actions */}
                <td style={{ ...styles.td, textAlign: 'right' }}>
                  <div style={styles.actions}>
                    <button
                      style={styles.iconButton()}
                      onClick={(e) => {
                        e.stopPropagation();
                        onPreview(doc.id);
                      }}
                      title="Prévisualiser"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = theme.bg.elevated;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <Icons.Eye />
                    </button>
                    <button
                      style={styles.iconButton()}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDownload(doc.id);
                      }}
                      title="Télécharger"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = theme.bg.elevated;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <Icons.Download />
                    </button>
                    <button
                      style={styles.iconButton(theme.semantic.error)}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(doc.id);
                      }}
                      title="Supprimer"
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = theme.semantic.errorBg;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <Icons.Trash />
                    </button>
                  </div>
                </td>
              </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
