/**
 * SOUVERAIN - Vault Import Modal
 * Modal pour importer un document dans le coffre-fort
 */

import React, { useState, useRef } from 'react';
import { useTheme } from '../ThemeContext';
import { typography, borderRadius, transitions } from '../design-system';
import type { VaultCategory } from './VaultModule';
import { VaultUpgradeModal } from './VaultUpgradeModal';

// ============================================================
// ICONS
// ============================================================

const Icons = {
  Upload: () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  X: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  AlertCircle: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
};

// ============================================================
// CONSTANTS
// ============================================================

const ACCEPTED_FORMATS = {
  images: ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml'],
  documents: ['application/pdf', 'text/plain', 'text/markdown', 'text/csv'],
  office: [
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ],
};

const ACCEPTED_TYPES = [
  ...ACCEPTED_FORMATS.images,
  ...ACCEPTED_FORMATS.documents,
  ...ACCEPTED_FORMATS.office,
];

const ACCEPTED_EXTENSIONS = [
  'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg',
  'pdf', 'txt', 'md', 'csv',
  'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx',
];

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB
const FREE_LIMIT = 20;

const CATEGORIES: { value: VaultCategory; label: string }[] = [
  { value: 'cv', label: 'CV et résumés' },
  { value: 'cover_letter', label: 'Lettres de motivation' },
  { value: 'portfolio', label: 'Éléments de portfolio' },
  { value: 'certificate', label: 'Diplômes et certifications' },
  { value: 'reference', label: 'Lettres de recommandation' },
  { value: 'contract', label: 'Contrats de travail' },
  { value: 'payslip', label: 'Bulletins de paie' },
  { value: 'other', label: 'Autres documents' },
];

// ============================================================
// COMPONENT
// ============================================================

interface VaultImportModalProps {
  currentCount: number;
  onClose: () => void;
  onSuccess: () => void;
}

export const VaultImportModal: React.FC<VaultImportModalProps> = ({
  currentCount,
  onClose,
  onSuccess,
}) => {
  console.log('[VaultImportModal] Modal rendered, currentCount:', currentCount);
  const { theme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState<VaultCategory>('cv');
  const [tags, setTags] = useState('');
  const [notes, setNotes] = useState('');
  const [documentDate, setDocumentDate] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<'documents' | 'fileSize' | 'storage' | 'categories'>('documents');

  // Vérifier la limite Free
  const isLimitReached = currentCount >= FREE_LIMIT;

  // Fonction pour générer une vignette d'image
  const generateThumbnail = async (file: File): Promise<ArrayBuffer | null> => {
    return new Promise((resolve) => {
      // Vérifier si c'est une image
      if (!ACCEPTED_FORMATS.images.includes(file.type)) {
        resolve(null);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Créer un canvas pour la miniature (max 200x200px)
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(null);
            return;
          }

          const maxSize = 200;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxSize) {
              height = height * (maxSize / width);
              width = maxSize;
            }
          } else {
            if (height > maxSize) {
              width = width * (maxSize / height);
              height = maxSize;
            }
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          // Convertir en blob puis en ArrayBuffer
          canvas.toBlob((blob) => {
            if (blob) {
              blob.arrayBuffer().then(resolve);
            } else {
              resolve(null);
            }
          }, 'image/jpeg', 0.7);
        };
        img.onerror = () => resolve(null);
        img.src = e.target?.result as string;
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = (file: File) => {
    setError(null);

    // Vérifier le type
    if (!ACCEPTED_TYPES.includes(file.type) && !ACCEPTED_EXTENSIONS.includes(file.name.split('.').pop()?.toLowerCase() || '')) {
      setError('Format de fichier non supporté. Formats acceptés : Images (PNG, JPG, GIF, WEBP, SVG), Documents (PDF, TXT, MD, CSV), Office (DOCX, XLSX, PPTX)');
      return;
    }

    // Vérifier la taille
    if (file.size > MAX_FILE_SIZE) {
      setError('Fichier trop volumineux. Taille maximale : 25 MB');
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleImport = async () => {
    if (!selectedFile || isLimitReached) return;

    setUploading(true);
    setError(null);

    try {
      // Lire le fichier en ArrayBuffer
      const arrayBuffer = await selectedFile.arrayBuffer();
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase() || 'bin';

      // Générer une vignette si c'est une image
      const thumbnail = await generateThumbnail(selectedFile);

      // Préparer les métadonnées
      const metadata = {
        name: selectedFile.name,
        category,
        file_type: fileExtension,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        notes: notes.trim(),
        document_date: documentDate || null,
        thumbnail: thumbnail ? Array.from(new Uint8Array(thumbnail)) : null,
      };

      // Envoyer au backend
      const result = await window.electron.vault.addDocument(
        {
          buffer: arrayBuffer,
          size: selectedFile.size,
        },
        metadata
      );

      if (result.success) {
        onSuccess();
      } else if (result.error === 'LIMIT_REACHED') {
        setUpgradeReason('documents');
        setShowUpgradeModal(true);
      } else if (result.error === 'FILE_TOO_LARGE') {
        setUpgradeReason('fileSize');
        setShowUpgradeModal(true);
      } else if (result.error === 'STORAGE_LIMIT_REACHED') {
        setUpgradeReason('storage');
        setShowUpgradeModal(true);
      } else {
        setError(result.error || 'Erreur lors de l\'import');
      }
    } catch (err: any) {
      console.error('Erreur import:', err);
      setError(err.message || 'Erreur lors de l\'import');
    } finally {
      setUploading(false);
    }
  };

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
      maxWidth: '600px',
      maxHeight: '90vh',
      overflow: 'auto',
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
    },
    dropzone: (active: boolean) => ({
      border: `2px dashed ${active ? theme.accent.primary : theme.border.default}`,
      borderRadius: borderRadius.xl,
      padding: '3rem 2rem',
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      gap: '1rem',
      backgroundColor: active ? theme.accent.muted : theme.bg.tertiary,
      cursor: 'pointer',
      transition: transitions.normal,
    }),
    dropzoneIcon: {
      color: isDragging ? theme.accent.primary : theme.text.tertiary,
    },
    dropzoneText: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium,
      color: theme.text.primary,
      textAlign: 'center' as const,
    },
    dropzoneHint: {
      fontSize: typography.fontSize.sm,
      color: theme.text.tertiary,
      textAlign: 'center' as const,
    },
    selectedFile: {
      padding: '1rem',
      backgroundColor: theme.bg.tertiary,
      borderRadius: borderRadius.lg,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    fileName: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: theme.text.primary,
    },
    removeButton: {
      padding: '0.5rem',
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: borderRadius.md,
      cursor: 'pointer',
      color: theme.text.secondary,
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.5rem',
    },
    label: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: theme.text.secondary,
    },
    required: {
      color: theme.semantic.error,
    },
    select: {
      padding: '0.75rem 1rem',
      backgroundColor: theme.bg.secondary,
      border: `1px solid ${theme.border.light}`,
      borderRadius: borderRadius.lg,
      color: theme.text.primary,
      fontSize: typography.fontSize.sm,
      cursor: 'pointer',
      outline: 'none',
    },
    input: {
      padding: '0.75rem 1rem',
      backgroundColor: theme.bg.secondary,
      border: `1px solid ${theme.border.light}`,
      borderRadius: borderRadius.lg,
      color: theme.text.primary,
      fontSize: typography.fontSize.sm,
      outline: 'none',
    },
    textarea: {
      padding: '0.75rem 1rem',
      backgroundColor: theme.bg.secondary,
      border: `1px solid ${theme.border.light}`,
      borderRadius: borderRadius.lg,
      color: theme.text.primary,
      fontSize: typography.fontSize.sm,
      outline: 'none',
      resize: 'vertical' as const,
      minHeight: '80px',
      fontFamily: typography.fontFamily.sans,
    },
    error: {
      padding: '1rem',
      backgroundColor: theme.semantic.errorBg,
      border: `1px solid ${theme.semantic.error}`,
      borderRadius: borderRadius.lg,
      color: theme.semantic.error,
      fontSize: typography.fontSize.sm,
      display: 'flex',
      gap: '0.75rem',
      alignItems: 'flex-start',
    },
    limitWarning: {
      padding: '1rem',
      backgroundColor: theme.semantic.warningBg,
      border: `1px solid ${theme.semantic.warning}`,
      borderRadius: borderRadius.lg,
      color: theme.semantic.warning,
      fontSize: typography.fontSize.sm,
      display: 'flex',
      gap: '0.75rem',
      alignItems: 'flex-start',
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
          <h2 style={styles.title}>Ajouter un document</h2>
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
          {/* Limite atteinte */}
          {isLimitReached && (
            <div style={styles.limitWarning}>
              <Icons.AlertCircle />
              <div>
                Vous avez atteint la limite de {FREE_LIMIT} documents en version gratuite.
                Supprimez un document existant pour en ajouter un nouveau.
              </div>
            </div>
          )}

          {/* Dropzone */}
          {!selectedFile && !isLimitReached && (
            <div
              style={styles.dropzone(isDragging)}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => {
                console.log('[VaultImportModal] Dropzone clicked');
                console.log('[VaultImportModal] fileInputRef.current:', fileInputRef.current);
                fileInputRef.current?.click();
              }}
            >
              <div style={styles.dropzoneIcon}>
                <Icons.Upload />
              </div>
              <div style={styles.dropzoneText}>
                Glissez votre fichier ici<br />
                ou cliquez pour sélectionner
              </div>
              <div style={styles.dropzoneHint}>
                Images, PDF, Office, TXT, MD, CSV — Max 25 MB
              </div>
            </div>
          )}

          {/* Selected file */}
          {selectedFile && (
            <div style={styles.selectedFile}>
              <div>
                <div style={styles.fileName}>{selectedFile.name}</div>
                <div style={{ fontSize: typography.fontSize.xs, color: theme.text.tertiary }}>
                  {(selectedFile.size / 1024).toFixed(1)} KB
                </div>
              </div>
              <button
                style={styles.removeButton}
                onClick={() => setSelectedFile(null)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.bg.elevated;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Icons.X />
              </button>
            </div>
          )}

          {/* Category */}
          {selectedFile && (
            <>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Catégorie <span style={styles.required}>*</span>
                </label>
                <select
                  style={styles.select}
                  value={category}
                  onChange={(e) => setCategory(e.target.value as VaultCategory)}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date du document */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Date du document (optionnel)</label>
                <input
                  type="date"
                  style={styles.input}
                  value={documentDate}
                  onChange={(e) => setDocumentDate(e.target.value)}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = theme.accent.primary;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = theme.border.light;
                  }}
                />
                <div style={{ fontSize: typography.fontSize.xs, color: theme.text.tertiary }}>
                  Date du document (distincte de la date d'ajout)
                </div>
              </div>

              {/* Tags */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Tags (optionnel)</label>
                <input
                  type="text"
                  style={styles.input}
                  placeholder="Exemple: 2024, tech, google"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = theme.accent.primary;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = theme.border.light;
                  }}
                />
                <div style={{ fontSize: typography.fontSize.xs, color: theme.text.tertiary }}>
                  Séparez les tags par des virgules
                </div>
              </div>

              {/* Notes */}
              <div style={styles.formGroup}>
                <label style={styles.label}>Notes (optionnel)</label>
                <textarea
                  style={styles.textarea}
                  placeholder="Notes personnelles sur ce document..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = theme.accent.primary;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = theme.border.light;
                  }}
                />
              </div>
            </>
          )}

          {/* Error */}
          {error && (
            <div style={styles.error}>
              <Icons.AlertCircle />
              <div>{error}</div>
            </div>
          )}
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
            Annuler
          </button>
          <button
            style={{ ...styles.button, ...styles.buttonPrimary }}
            onClick={handleImport}
            disabled={!selectedFile || uploading || isLimitReached}
            onMouseEnter={(e) => {
              if (!selectedFile || uploading || isLimitReached) return;
              e.currentTarget.style.backgroundColor = theme.accent.secondary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.accent.primary;
            }}
          >
            {uploading ? 'Import en cours...' : 'Ajouter au coffre'}
          </button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS.map(ext => `.${ext}`).join(',')}
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFileSelect(file);
          }}
        />
      </div>

      {/* Upgrade Modal */}
      {showUpgradeModal && (
        <VaultUpgradeModal
          reason={upgradeReason}
          onClose={() => setShowUpgradeModal(false)}
          onUpgrade={() => {
            setShowUpgradeModal(false);
            // TODO: Rediriger vers la page Premium/Boutique
            alert('Redirection vers Premium (à implémenter)');
          }}
        />
      )}
    </div>
  );
};
