/**
 * SOUVERAIN - Vault Preview Modal
 * Modal de prévisualisation pour les documents du coffre-fort
 */

import React, { useState, useEffect } from 'react';
import { useTheme } from '../ThemeContext';
import { typography, borderRadius, transitions } from '../design-system';
import type { VaultDocument } from './VaultModule';

// ============================================================
// ICONS
// ============================================================

const Icons = {
  X: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Download: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  FileText: () => (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
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

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

// ============================================================
// COMPONENT
// ============================================================

interface VaultPreviewModalProps {
  documentId: string;
  onClose: () => void;
}

export const VaultPreviewModal: React.FC<VaultPreviewModalProps> = ({
  documentId,
  onClose,
}) => {
  const { theme } = useTheme();
  const [document, setDocument] = useState<VaultDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null);

  useEffect(() => {
    loadDocument();
  }, [documentId]);

  const loadDocument = async () => {
    setLoading(true);
    setError(null);
    setPreviewUrl(null);
    setTextContent(null);

    try {
      const result = await window.electron.vault.getDocument(documentId);
      if (result.success && result.document) {
        setDocument(result.document);

        const doc = result.document;
        const fileType = doc.file_type.toLowerCase();

        // Images
        const isImage = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(fileType);
        // PDF
        const isPDF = fileType === 'pdf';
        // Fichiers texte
        const isText = ['txt', 'md', 'csv', 'json', 'xml', 'log'].includes(fileType);

        if (doc.encrypted_content) {
          const buffer = new Uint8Array(doc.encrypted_content);

          if (isImage) {
            const mimeType = `image/${fileType === 'svg' ? 'svg+xml' : fileType}`;
            const blob = new Blob([buffer], { type: mimeType });
            const url = URL.createObjectURL(blob);
            setPreviewUrl(url);
          } else if (isPDF) {
            const blob = new Blob([buffer], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setPreviewUrl(url);
          } else if (isText) {
            // Décoder le buffer en texte UTF-8
            const decoder = new TextDecoder('utf-8');
            const text = decoder.decode(buffer);
            setTextContent(text);
          }
        }
      } else {
        setError(result.error || 'Document non trouvé');
      }
    } catch (err: any) {
      console.error('Erreur chargement document:', err);
      setError(err.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  // Nettoyer l'URL blob au démontage
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleDownload = async () => {
    try {
      const result = await window.electron.vault.downloadDocument(documentId);
      if (!result.success) {
        alert(result.error || 'Erreur téléchargement');
      } else {
        // Le fichier a été sauvegardé avec succès
        onClose();
      }
    } catch (error) {
      console.error('Erreur téléchargement:', error);
    }
  };

  const styles = {
    overlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
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
      maxWidth: '800px',
      maxHeight: '90vh',
      display: 'flex',
      flexDirection: 'column' as const,
      boxShadow: theme.shadow.xl,
    },
    header: {
      padding: '1.5rem 2rem',
      borderBottom: `1px solid ${theme.border.light}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexShrink: 0,
    },
    headerLeft: {
      flex: 1,
      minWidth: 0,
    },
    title: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text.primary,
      marginBottom: '0.25rem',
      wordBreak: 'break-word' as const,
    },
    subtitle: {
      fontSize: typography.fontSize.sm,
      color: theme.text.tertiary,
    },
    headerRight: {
      display: 'flex',
      gap: '0.5rem',
      alignItems: 'center',
    },
    iconButton: {
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
    downloadButton: {
      padding: '0.625rem 1rem',
      backgroundColor: theme.accent.primary,
      color: '#FFFFFF',
      border: 'none',
      borderRadius: borderRadius.lg,
      cursor: 'pointer',
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      transition: transitions.fast,
    },
    body: {
      flex: 1,
      overflow: 'auto',
      padding: '2rem',
    },
    preview: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem',
      backgroundColor: theme.bg.tertiary,
      borderRadius: borderRadius.xl,
      border: `1px solid ${theme.border.light}`,
      minHeight: '400px',
    },
    previewIcon: {
      color: theme.text.tertiary,
      marginBottom: '1.5rem',
    },
    previewText: {
      fontSize: typography.fontSize.base,
      color: theme.text.secondary,
      textAlign: 'center' as const,
    },
    previewHint: {
      fontSize: typography.fontSize.sm,
      color: theme.text.tertiary,
      marginTop: '0.5rem',
      textAlign: 'center' as const,
    },
    metadata: {
      marginTop: '2rem',
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '1rem',
    },
    metaItem: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.25rem',
    },
    metaLabel: {
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.medium,
      color: theme.text.tertiary,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
    },
    metaValue: {
      fontSize: typography.fontSize.sm,
      color: theme.text.primary,
    },
    tags: {
      display: 'flex',
      gap: '0.5rem',
      flexWrap: 'wrap' as const,
    },
    tag: {
      padding: '0.25rem 0.75rem',
      backgroundColor: theme.accent.muted,
      color: theme.accent.primary,
      borderRadius: borderRadius.md,
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.medium,
    },
    notes: {
      gridColumn: '1 / -1',
    },
    notesText: {
      padding: '1rem',
      backgroundColor: theme.bg.secondary,
      border: `1px solid ${theme.border.light}`,
      borderRadius: borderRadius.lg,
      fontSize: typography.fontSize.sm,
      color: theme.text.primary,
      lineHeight: typography.lineHeight.relaxed,
      whiteSpace: 'pre-wrap' as const,
    },
    loading: {
      textAlign: 'center' as const,
      padding: '3rem',
      color: theme.text.tertiary,
    },
    error: {
      textAlign: 'center' as const,
      padding: '3rem',
      color: theme.semantic.error,
    },
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        {!loading && document && (
          <div style={styles.header}>
            <div style={styles.headerLeft}>
              <h2 style={styles.title}>{document.name}</h2>
              <div style={styles.subtitle}>
                {document.file_type.toUpperCase()} • {formatFileSize(document.file_size)}
              </div>
            </div>
            <div style={styles.headerRight}>
              <button
                style={styles.downloadButton}
                onClick={handleDownload}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.accent.secondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.accent.primary;
                }}
              >
                <Icons.Download />
                Télécharger
              </button>
              <button
                style={styles.iconButton}
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
          </div>
        )}

        {/* Body */}
        <div style={styles.body}>
          {loading ? (
            <div style={styles.loading}>Chargement...</div>
          ) : error ? (
            <div style={styles.error}>{error}</div>
          ) : document ? (
            <>
              {/* Preview */}
              <div style={styles.preview}>
                {textContent ? (
                  // Fichiers texte
                  <pre
                    style={{
                      width: '100%',
                      maxHeight: '500px',
                      overflow: 'auto',
                      backgroundColor: theme.bg.secondary,
                      padding: '1.5rem',
                      borderRadius: borderRadius.lg,
                      fontSize: typography.fontSize.sm,
                      color: theme.text.primary,
                      lineHeight: typography.lineHeight.relaxed,
                      whiteSpace: 'pre-wrap',
                      wordWrap: 'break-word',
                      fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                      margin: 0,
                    }}
                  >
                    {textContent}
                  </pre>
                ) : previewUrl && document ? (
                  ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'].includes(document.file_type.toLowerCase()) ? (
                    <img
                      src={previewUrl}
                      alt={document.name}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '500px',
                        objectFit: 'contain',
                        borderRadius: borderRadius.lg,
                      }}
                    />
                  ) : document.file_type.toLowerCase() === 'pdf' ? (
                    <iframe
                      src={previewUrl}
                      style={{
                        width: '100%',
                        height: '600px',
                        border: 'none',
                        borderRadius: borderRadius.lg,
                      }}
                      title={document.name}
                    />
                  ) : (
                    <>
                      <div style={styles.previewIcon}>
                        <Icons.FileText />
                      </div>
                      <div style={styles.previewText}>
                        Prévisualisation non disponible pour ce type de fichier
                      </div>
                      <div style={styles.previewHint}>
                        Le contenu est chiffré pour votre sécurité.<br />
                        Téléchargez le fichier pour le consulter.
                      </div>
                    </>
                  )
                ) : (
                  <>
                    <div style={styles.previewIcon}>
                      <Icons.FileText />
                    </div>
                    <div style={styles.previewText}>
                      Prévisualisation non disponible pour ce type de fichier
                    </div>
                    <div style={styles.previewHint}>
                      Le contenu est chiffré pour votre sécurité.<br />
                      Téléchargez le fichier pour le consulter.
                    </div>
                  </>
                )}
              </div>

              {/* Metadata */}
              <div style={styles.metadata}>
                <div style={styles.metaItem}>
                  <div style={styles.metaLabel}>Catégorie</div>
                  <div style={styles.metaValue}>{document.category}</div>
                </div>
                <div style={styles.metaItem}>
                  <div style={styles.metaLabel}>Ajouté le</div>
                  <div style={styles.metaValue}>{formatDate(document.created_at)}</div>
                </div>
                {document.tags && document.tags.length > 0 && (
                  <div style={styles.metaItem}>
                    <div style={styles.metaLabel}>Tags</div>
                    <div style={styles.tags}>
                      {document.tags.map((tag, i) => (
                        <span key={i} style={styles.tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {document.notes && (
                  <div style={{ ...styles.metaItem, ...styles.notes }}>
                    <div style={styles.metaLabel}>Notes</div>
                    <div style={styles.notesText}>{document.notes}</div>
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
