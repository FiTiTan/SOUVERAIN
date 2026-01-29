/**
 * SOUVERAIN - FileUploader
 * Composant d'upload de fichiers pour Portfolio V2
 * Supporte drag & drop multi-fichiers
 */

import React, { useState, useCallback, useRef } from 'react';
import { useTheme } from '../../ThemeContext';
import { useToast } from '../ui/NotificationToast';
import { typography, borderRadius, transitions, spacing } from '../../design-system';
import { getSupportedFormats, getFormatCategory, getFormatIcon } from '../../types/formats';

// ============================================================
// TYPES
// ============================================================

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  format: string;
  category: string;
  path?: string;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  error?: string;
}

interface FileUploaderProps {
  portfolioId: string;
  onFilesUploaded: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxSizePerFile?: number; // en octets
  allowedFormats?: string[];
}

// ============================================================
// COMPONENT
// ============================================================

export const FileUploader: React.FC<FileUploaderProps> = ({
  portfolioId,
  onFilesUploaded,
  maxFiles = 50,
  maxSizePerFile = 100 * 1024 * 1024, // 100 Mo par défaut
  allowedFormats,
}) => {
  const { theme } = useTheme();
  const toast = useToast();
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Formats supportés
  const supportedFormats = allowedFormats || getSupportedFormats();

  // Handlers drag & drop
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

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const droppedFiles = Array.from(e.dataTransfer.files);
      processFiles(droppedFiles);
    },
    [files, maxFiles]
  );

  // Handler click pour sélection fichier
  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const selectedFiles = Array.from(e.target.files);
        processFiles(selectedFiles);
      }
    },
    [files, maxFiles]
  );

  // Traiter les fichiers
  const processFiles = useCallback(
    async (newFiles: File[]) => {
      // Vérifier le nombre max
      if (files.length + newFiles.length > maxFiles) {
        toast.warning(
          'Limite de fichiers atteinte',
          `Vous ne pouvez pas uploader plus de ${maxFiles} fichiers.`
        );
        return;
      }

      // Créer les objets UploadedFile
      const uploadedFiles: UploadedFile[] = newFiles.map((file) => {
        const extension = file.name.split('.').pop()?.toLowerCase() || '';
        const format = extension;
        const category = getFormatCategory(format);

        return {
          id: `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          name: file.name,
          size: file.size,
          type: file.type,
          format,
          category,
          status: 'pending' as const,
          progress: 0,
        };
      });

      // Valider les fichiers
      const validFiles: UploadedFile[] = [];
      const invalidFiles: string[] = [];

      for (let i = 0; i < uploadedFiles.length; i++) {
        const uploadedFile = uploadedFiles[i];
        const actualFile = newFiles[i];

        // Vérifier format
        if (!supportedFormats.includes(uploadedFile.format)) {
          invalidFiles.push(`${uploadedFile.name} (format non supporté: .${uploadedFile.format})`);
          continue;
        }

        // Vérifier taille
        if (uploadedFile.size > maxSizePerFile) {
          const maxSizeMB = Math.round(maxSizePerFile / (1024 * 1024));
          invalidFiles.push(`${uploadedFile.name} (trop volumineux, max ${maxSizeMB}Mo)`);
          continue;
        }

        validFiles.push(uploadedFile);
      }

      // Afficher les erreurs
      if (invalidFiles.length > 0) {
        toast.warning(
          `${invalidFiles.length} fichier(s) ignoré(s)`,
          invalidFiles.slice(0, 3).join(', ') + (invalidFiles.length > 3 ? '...' : '')
        );
      }

      // Ajouter les fichiers valides
      if (validFiles.length > 0) {
        setFiles((prev) => [...prev, ...validFiles]);

        // Upload les fichiers
        uploadFiles(validFiles, newFiles.filter((_, i) =>
          validFiles.some(vf => vf.name === newFiles[i].name)
        ));
      }
    },
    [files, maxFiles, maxSizePerFile, supportedFormats]
  );

  // Upload des fichiers
  const uploadFiles = async (uploadedFiles: UploadedFile[], actualFiles: File[]) => {
    console.log('[FileUploader] 🔵 Upload fichiers:', {
      count: uploadedFiles.length,
      portfolioId,
    });

    for (let i = 0; i < uploadedFiles.length; i++) {
      const uploadedFile = uploadedFiles[i];
      const actualFile = actualFiles[i];

      try {
        console.log(`[FileUploader] Upload ${i + 1}/${uploadedFiles.length}:`, actualFile.name);

        // Mettre à jour le statut
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadedFile.id ? { ...f, status: 'uploading' as const } : f
          )
        );

        // Lire le fichier comme ArrayBuffer
        const arrayBuffer = await actualFile.arrayBuffer();

        // Sauvegarder le fichier sur le disque
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadedFile.id ? { ...f, progress: 50 } : f
          )
        );

        console.log('[FileUploader] Sauvegarde fichier sur disque...');
        const saveResult = await window.electron.portfolioV2.saveFile(
          portfolioId,
          actualFile.name,
          arrayBuffer
        );
        console.log('[FileUploader] Résultat sauvegarde:', saveResult);

        if (!saveResult.success) {
          throw new Error(saveResult.error || 'Erreur sauvegarde fichier');
        }

        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadedFile.id ? { ...f, progress: 75 } : f
          )
        );

        // Créer l'asset en BDD
        const assetResult = await window.electron.portfolioV2.assets.create({
          id: `asset_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          portfolioId,
          sourceType: 'local',
          sourcePath: saveResult.relativePath || actualFile.name,
          localPath: saveResult.path || '',
          format: uploadedFile.format,
          originalFilename: uploadedFile.name,
          fileSize: uploadedFile.size,
          metadata: {
            uploadedAt: new Date().toISOString(),
          },
        });

        if (assetResult.success) {
          // Extraire avec le bon extractor
          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadedFile.id ? { ...f, status: 'processing' as const } : f
            )
          );

          // TODO: Appeler l'extractor selon le type
          // const extractResult = await window.electron.extractors.extractFile(...)

          // Marquer comme complété
          setFiles((prev) =>
            prev.map((f) =>
              f.id === uploadedFile.id
                ? { ...f, status: 'completed' as const, progress: 100 }
                : f
            )
          );
        } else {
          throw new Error(assetResult.error || 'Erreur création asset');
        }
      } catch (error) {
        console.error('[FileUploader] Erreur upload:', error);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === uploadedFile.id
              ? {
                  ...f,
                  status: 'error' as const,
                  error: error instanceof Error ? error.message : 'Erreur inconnue',
                }
              : f
          )
        );
      }
    }

    // Notifier les fichiers uploadés
    const completedFiles = files.filter((f) => f.status === 'completed');
    if (completedFiles.length > 0) {
      onFilesUploaded(completedFiles);
    }
  };

  // Supprimer un fichier
  const handleRemoveFile = (fileId: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  // Styles
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: spacing[4],
    },
    dropzone: {
      border: `2px dashed ${isDragging ? theme.accent.primary : theme.border.default}`,
      borderRadius: borderRadius.lg,
      padding: spacing[8],
      textAlign: 'center' as const,
      backgroundColor: isDragging ? theme.accent.muted : theme.bg.secondary,
      transition: transitions.fast,
      cursor: 'pointer',
    },
    dropzoneIcon: {
      fontSize: '3rem',
      marginBottom: spacing[3],
      opacity: 0.5,
    },
    dropzoneTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text.primary,
      marginBottom: spacing[2],
    },
    dropzoneText: {
      fontSize: typography.fontSize.sm,
      color: theme.text.secondary,
      marginBottom: spacing[3],
    },
    dropzoneButton: {
      padding: `${spacing[2]} ${spacing[4]}`,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: '#FFFFFF',
      backgroundColor: theme.accent.primary,
      border: 'none',
      borderRadius: borderRadius.md,
      cursor: 'pointer',
      transition: transitions.fast,
    },
    fileList: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: spacing[2],
    },
    fileItem: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[3],
      padding: spacing[3],
      backgroundColor: theme.bg.secondary,
      border: `1px solid ${theme.border.default}`,
      borderRadius: borderRadius.md,
    },
    fileIcon: {
      fontSize: typography.fontSize['2xl'],
      flexShrink: 0,
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
    fileMeta: {
      fontSize: typography.fontSize.xs,
      color: theme.text.tertiary,
      marginTop: spacing[1],
    },
    fileStatus: {
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.medium,
      padding: `${spacing[1]} ${spacing[2]}`,
      borderRadius: borderRadius.sm,
    },
    statusPending: {
      backgroundColor: theme.border.light,
      color: theme.text.secondary,
    },
    statusUploading: {
      backgroundColor: theme.semantic.infoMuted,
      color: theme.semantic.info,
    },
    statusProcessing: {
      backgroundColor: theme.semantic.warningMuted,
      color: theme.semantic.warning,
    },
    statusCompleted: {
      backgroundColor: theme.semantic.successMuted,
      color: theme.semantic.success,
    },
    statusError: {
      backgroundColor: theme.semantic.errorMuted,
      color: theme.semantic.error,
    },
    progressBar: {
      width: '100px',
      height: '4px',
      backgroundColor: theme.border.light,
      borderRadius: borderRadius.full,
      overflow: 'hidden',
      flexShrink: 0,
    },
    progressFill: {
      height: '100%',
      backgroundColor: theme.accent.primary,
      transition: transitions.normal,
    },
    removeButton: {
      padding: spacing[2],
      fontSize: typography.fontSize.sm,
      color: theme.text.tertiary,
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: borderRadius.sm,
      cursor: 'pointer',
      transition: transitions.fast,
    },
  };

  const getStatusStyle = (status: UploadedFile['status']) => {
    switch (status) {
      case 'pending':
        return styles.statusPending;
      case 'uploading':
        return styles.statusUploading;
      case 'processing':
        return styles.statusProcessing;
      case 'completed':
        return styles.statusCompleted;
      case 'error':
        return styles.statusError;
      default:
        return styles.statusPending;
    }
  };

  const getStatusLabel = (status: UploadedFile['status']) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'uploading':
        return 'Upload...';
      case 'processing':
        return 'Traitement...';
      case 'completed':
        return 'Terminé';
      case 'error':
        return 'Erreur';
      default:
        return status;
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  };

  return (
    <div style={styles.container}>
      {/* Dropzone */}
      <div
        style={styles.dropzone}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div style={styles.dropzoneIcon}>📁</div>
        <h3 style={styles.dropzoneTitle}>
          Glissez-déposez vos fichiers ici
        </h3>
        <p style={styles.dropzoneText}>
          ou cliquez pour sélectionner
        </p>
        <button
          type="button"
          style={styles.dropzoneButton}
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
        >
          Parcourir les fichiers
        </button>
        <p style={{ ...styles.dropzoneText, marginTop: spacing[3] }}>
          Formats supportés : {supportedFormats.join(', ')}
        </p>
      </div>

      {/* Input caché */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={supportedFormats.map((f) => `.${f}`).join(',')}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* Liste des fichiers */}
      {files.length > 0 && (
        <div style={styles.fileList}>
          {files.map((file) => (
            <div key={file.id} style={styles.fileItem}>
              <span style={styles.fileIcon}>{getFormatIcon(file.format)}</span>

              <div style={styles.fileInfo}>
                <div style={styles.fileName}>{file.name}</div>
                <div style={styles.fileMeta}>
                  {formatFileSize(file.size)} • {file.format.toUpperCase()}
                  {file.error && ` • ${file.error}`}
                </div>
              </div>

              {/* Statut */}
              <span style={{ ...styles.fileStatus, ...getStatusStyle(file.status) }}>
                {getStatusLabel(file.status)}
              </span>

              {/* Barre de progression */}
              {(file.status === 'uploading' || file.status === 'processing') && (
                <div style={styles.progressBar}>
                  <div
                    style={{
                      ...styles.progressFill,
                      width: `${file.progress}%`,
                    }}
                  />
                </div>
              )}

              {/* Bouton supprimer */}
              {(file.status === 'pending' || file.status === 'error') && (
                <button
                  type="button"
                  style={styles.removeButton}
                  onClick={() => handleRemoveFile(file.id)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = theme.semantic.error;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = theme.text.tertiary;
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      {files.length > 0 && (
        <div
          style={{
            fontSize: typography.fontSize.xs,
            color: theme.text.tertiary,
            textAlign: 'center' as const,
          }}
        >
          {files.length} fichier{files.length > 1 ? 's' : ''} •{' '}
          {files.filter((f) => f.status === 'completed').length} terminé
          {files.filter((f) => f.status === 'completed').length > 1 ? 's' : ''} •{' '}
          {files.filter((f) => f.status === 'error').length} erreur
          {files.filter((f) => f.status === 'error').length > 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
};

export default FileUploader;
