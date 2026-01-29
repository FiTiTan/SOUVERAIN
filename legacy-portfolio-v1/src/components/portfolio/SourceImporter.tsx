/**
 * SOUVERAIN - SourceImporter
 * Import de fichiers depuis différentes sources (local, Google Drive, etc.)
 */

import React, { useState, useCallback, useRef } from 'react';
import { useTheme } from '../../ThemeContext';
import { typography, borderRadius, transitions, spacing } from '../../design-system';
import { IMPORT_SOURCES, getAcceptedExtensions, formatFileSize, type ImportSourceType } from '../../types/formats';

// ============================================================
// TYPES
// ============================================================

interface ImportedFile {
  id: string;
  name: string;
  path: string;
  size: number;
  type: string;
  extension: string;
  preview?: string;       // Base64 pour images
  status: 'pending' | 'processing' | 'done' | 'error';
  error?: string;
}

interface SourceImporterProps {
  portfolioId: string;
  onFilesImported: (files: ImportedFile[]) => void;
  onCancel?: () => void;
  maxFiles?: number;
}

// ============================================================
// COMPONENT
// ============================================================

export const SourceImporter: React.FC<SourceImporterProps> = ({
  portfolioId,
  onFilesImported,
  onCancel,
  maxFiles = 50,
}) => {
  const { theme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedSource, setSelectedSource] = useState<ImportSourceType>('local');
  const [files, setFiles] = useState<ImportedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Sources disponibles (Priority 1 pour MVP)
  const availableSources = IMPORT_SOURCES.filter((s) => s.priority === 'priority1');

  // Styles
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: spacing[6],
      maxWidth: '800px',
      margin: '0 auto',
    },
    header: {
      textAlign: 'center' as const,
    },
    title: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: theme.text.primary,
      marginBottom: spacing[2],
    },
    subtitle: {
      fontSize: typography.fontSize.base,
      color: theme.text.secondary,
    },
    sourceTabs: {
      display: 'flex',
      gap: spacing[2],
      justifyContent: 'center',
      flexWrap: 'wrap' as const,
    },
    sourceTab: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[2],
      padding: `${spacing[3]} ${spacing[4]}`,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: theme.text.secondary,
      backgroundColor: theme.bg.secondary,
      border: `2px solid ${theme.border.light}`,
      borderRadius: borderRadius.lg,
      cursor: 'pointer',
      transition: transitions.fast,
    },
    sourceTabActive: {
      color: theme.accent.primary,
      borderColor: theme.accent.primary,
      backgroundColor: theme.accent.muted,
    },
    sourceTabDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
    sourceIcon: {
      fontSize: typography.fontSize.xl,
    },
    dropzone: {
      border: `2px dashed ${theme.border.default}`,
      borderRadius: borderRadius.xl,
      padding: spacing[8],
      textAlign: 'center' as const,
      cursor: 'pointer',
      transition: transitions.normal,
      backgroundColor: theme.bg.secondary,
    },
    dropzoneDragging: {
      borderColor: theme.accent.primary,
      backgroundColor: theme.accent.muted,
    },
    dropzoneIcon: {
      fontSize: '4rem',
      marginBottom: spacing[4],
    },
    dropzoneText: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.medium,
      color: theme.text.primary,
      marginBottom: spacing[2],
    },
    dropzoneHint: {
      fontSize: typography.fontSize.sm,
      color: theme.text.tertiary,
    },
    browseButton: {
      marginTop: spacing[4],
      padding: `${spacing[3]} ${spacing[5]}`,
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium,
      color: '#FFFFFF',
      backgroundColor: theme.accent.primary,
      border: 'none',
      borderRadius: borderRadius.lg,
      cursor: 'pointer',
      transition: transitions.fast,
    },
    fileList: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: spacing[2],
      maxHeight: '300px',
      overflowY: 'auto' as const,
    },
    fileItem: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[3],
      padding: spacing[3],
      backgroundColor: theme.bg.secondary,
      borderRadius: borderRadius.md,
      border: `1px solid ${theme.border.light}`,
    },
    filePreview: {
      width: '48px',
      height: '48px',
      borderRadius: borderRadius.md,
      backgroundColor: theme.bg.tertiary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      flexShrink: 0,
    },
    filePreviewImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover' as const,
    },
    fileInfo: {
      flex: 1,
      minWidth: 0,
    },
    fileName: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: theme.text.primary,
      whiteSpace: 'nowrap' as const,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    fileSize: {
      fontSize: typography.fontSize.xs,
      color: theme.text.tertiary,
    },
    fileStatus: {
      fontSize: typography.fontSize.xs,
      padding: `${spacing[1]} ${spacing[2]}`,
      borderRadius: borderRadius.sm,
    },
    fileStatusPending: {
      backgroundColor: theme.border.light,
      color: theme.text.secondary,
    },
    fileStatusProcessing: {
      backgroundColor: theme.semantic.infoBg,
      color: theme.semantic.info,
    },
    fileStatusDone: {
      backgroundColor: theme.semantic.successBg,
      color: theme.semantic.success,
    },
    fileStatusError: {
      backgroundColor: theme.semantic.errorBg,
      color: theme.semantic.error,
    },
    fileRemove: {
      padding: spacing[1],
      backgroundColor: 'transparent',
      border: 'none',
      color: theme.text.tertiary,
      cursor: 'pointer',
      fontSize: typography.fontSize.lg,
    },
    footer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingTop: spacing[4],
      borderTop: `1px solid ${theme.border.light}`,
    },
    footerInfo: {
      fontSize: typography.fontSize.sm,
      color: theme.text.tertiary,
    },
    footerButtons: {
      display: 'flex',
      gap: spacing[3],
    },
    button: {
      padding: `${spacing[3]} ${spacing[5]}`,
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium,
      borderRadius: borderRadius.lg,
      cursor: 'pointer',
      transition: transitions.fast,
      border: 'none',
    },
    buttonPrimary: {
      backgroundColor: theme.accent.primary,
      color: '#FFFFFF',
    },
    buttonPrimaryDisabled: {
      backgroundColor: theme.border.default,
      color: theme.text.muted,
      cursor: 'not-allowed',
    },
    buttonSecondary: {
      backgroundColor: 'transparent',
      color: theme.text.secondary,
      border: `1px solid ${theme.border.default}`,
    },
    comingSoon: {
      textAlign: 'center' as const,
      padding: spacing[8],
      color: theme.text.tertiary,
    },
    comingSoonIcon: {
      fontSize: '3rem',
      marginBottom: spacing[3],
    },
  };

  // Handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    processFiles(droppedFiles);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    processFiles(selectedFiles);
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const processFiles = async (fileList: File[]) => {
    const newFiles: ImportedFile[] = [];

    for (const file of fileList) {
      if (files.length + newFiles.length >= maxFiles) break;

      const extension = file.name.split('.').pop()?.toLowerCase() || '';
      const id = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Créer preview pour les images
      let preview: string | undefined;
      if (file.type.startsWith('image/')) {
        preview = await createImagePreview(file);
      }

      newFiles.push({
        id,
        name: file.name,
        path: (file as any).path || file.name, // path disponible dans Electron
        size: file.size,
        type: file.type,
        extension,
        preview,
        status: 'pending',
      });
    }

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const createImagePreview = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        resolve('');
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const handleImport = async () => {
    if (files.length === 0) return;

    setIsProcessing(true);

    // Marquer tous les fichiers comme en traitement
    setFiles((prev) => prev.map((f) => ({ ...f, status: 'processing' as const })));

    // Simuler le traitement (en production, appel IPC)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Marquer comme terminé
    const processedFiles = files.map((f) => ({ ...f, status: 'done' as const }));
    setFiles(processedFiles);

    setIsProcessing(false);
    onFilesImported(processedFiles);
  };

  const getFileIcon = (extension: string): string => {
    const icons: Record<string, string> = {
      jpg: '🖼️',
      jpeg: '🖼️',
      png: '🖼️',
      webp: '🖼️',
      gif: '🖼️',
      pdf: '📄',
      mp4: '🎬',
      mov: '🎬',
      avi: '🎬',
      pptx: '📊',
      docx: '📝',
    };
    return icons[extension] || '📎';
  };

  const getStatusStyle = (status: ImportedFile['status']) => {
    switch (status) {
      case 'processing':
        return styles.fileStatusProcessing;
      case 'done':
        return styles.fileStatusDone;
      case 'error':
        return styles.fileStatusError;
      default:
        return styles.fileStatusPending;
    }
  };

  const getStatusLabel = (status: ImportedFile['status']) => {
    switch (status) {
      case 'processing':
        return 'Traitement...';
      case 'done':
        return 'Prêt';
      case 'error':
        return 'Erreur';
      default:
        return 'En attente';
    }
  };

  // Render source content
  const renderSourceContent = () => {
    if (selectedSource === 'local') {
      return (
        <>
          {/* Dropzone */}
          <div
            style={{
              ...styles.dropzone,
              ...(isDragging ? styles.dropzoneDragging : {}),
            }}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div style={styles.dropzoneIcon}>📁</div>
            <p style={styles.dropzoneText}>
              Glissez-déposez vos fichiers ici
            </p>
            <p style={styles.dropzoneHint}>
              ou cliquez pour parcourir
            </p>
            <p style={styles.dropzoneHint}>
              Formats acceptés : JPG, PNG, PDF, MP4, MOV
            </p>
            <button
              type="button"
              style={styles.browseButton}
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
            >
              Parcourir
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={getAcceptedExtensions('priority1')}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />

          {/* File list */}
          {files.length > 0 && (
            <div style={styles.fileList}>
              {files.map((file) => (
                <div key={file.id} style={styles.fileItem}>
                  <div style={styles.filePreview}>
                    {file.preview ? (
                      <img
                        src={file.preview}
                        alt={file.name}
                        style={styles.filePreviewImage}
                      />
                    ) : (
                      <span>{getFileIcon(file.extension)}</span>
                    )}
                  </div>
                  <div style={styles.fileInfo}>
                    <div style={styles.fileName}>{file.name}</div>
                    <div style={styles.fileSize}>{formatFileSize(file.size)}</div>
                  </div>
                  <span style={{ ...styles.fileStatus, ...getStatusStyle(file.status) }}>
                    {getStatusLabel(file.status)}
                  </span>
                  {file.status === 'pending' && (
                    <button
                      type="button"
                      style={styles.fileRemove}
                      onClick={() => handleRemoveFile(file.id)}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      );
    }

    if (selectedSource === 'github') {
      return (
        <div style={styles.comingSoon}>
          <div style={styles.comingSoonIcon}>🐙</div>
          <p>Import GitHub disponible prochainement</p>
          <p style={{ fontSize: typography.fontSize.sm, marginTop: spacing[2] }}>
            Importez vos repos et projets directement depuis GitHub
          </p>
        </div>
      );
    }

    return (
      <div style={styles.comingSoon}>
        <div style={styles.comingSoonIcon}>☁️</div>
        <p>Cette source sera disponible prochainement</p>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>Importer vos fichiers</h2>
        <p style={styles.subtitle}>
          Sélectionnez la source et importez vos photos, documents et vidéos.
        </p>
      </div>

      {/* Source tabs */}
      <div style={styles.sourceTabs}>
        {availableSources.map((source) => (
          <button
            key={source.id}
            type="button"
            style={{
              ...styles.sourceTab,
              ...(selectedSource === source.id ? styles.sourceTabActive : {}),
              ...(source.requiresAuth && source.id !== 'local' ? styles.sourceTabDisabled : {}),
            }}
            onClick={() => setSelectedSource(source.id)}
            disabled={source.requiresAuth && source.id !== 'local'}
          >
            <span style={styles.sourceIcon}>{source.icon}</span>
            <span>{source.label}</span>
          </button>
        ))}
      </div>

      {/* Source content */}
      {renderSourceContent()}

      {/* Footer */}
      <div style={styles.footer}>
        <span style={styles.footerInfo}>
          {files.length} fichier{files.length > 1 ? 's' : ''} sélectionné{files.length > 1 ? 's' : ''}
          {files.length > 0 && ` (${formatFileSize(files.reduce((acc, f) => acc + f.size, 0))})`}
        </span>
        <div style={styles.footerButtons}>
          {onCancel && (
            <button
              type="button"
              style={{ ...styles.button, ...styles.buttonSecondary }}
              onClick={onCancel}
              disabled={isProcessing}
            >
              Annuler
            </button>
          )}
          <button
            type="button"
            style={{
              ...styles.button,
              ...(files.length > 0 && !isProcessing ? styles.buttonPrimary : styles.buttonPrimaryDisabled),
            }}
            onClick={handleImport}
            disabled={files.length === 0 || isProcessing}
          >
            {isProcessing ? 'Importation...' : 'Importer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SourceImporter;
