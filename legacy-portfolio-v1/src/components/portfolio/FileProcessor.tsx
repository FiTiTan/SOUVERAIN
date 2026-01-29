/**
 * SOUVERAIN - FileProcessor
 * Traitement des fichiers importés : extraction, compression, préparation pour classification
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../ThemeContext';
import { typography, borderRadius, transitions, spacing } from '../../design-system';
import { formatFileSize } from '../../types/formats';
import type { ExtractionResult, ExtractedElement } from '../../services/extractors';

// ============================================================
// TYPES
// ============================================================

export interface ProcessedFile {
  id: string;
  originalName: string;
  originalPath: string;
  originalSize: number;
  type: 'image' | 'pdf' | 'video' | 'document';
  status: 'queued' | 'extracting' | 'compressing' | 'ready' | 'error';
  progress: number;
  error?: string;
  // Résultat du traitement
  thumbnail?: string;           // Base64 ou chemin
  extractedElements: ExtractedElement[];
  compressedPath?: string;
  compressedSize?: number;
  metadata?: FileMetadata;
}

export interface FileMetadata {
  width?: number;
  height?: number;
  duration?: number;            // Pour vidéos (secondes)
  pageCount?: number;           // Pour PDF
  dateCreated?: string;
  dateModified?: string;
  camera?: string;              // EXIF
  location?: {
    lat: number;
    lng: number;
  };
}

interface FileProcessorProps {
  files: Array<{
    id: string;
    name: string;
    path: string;
    size: number;
    type: string;
    extension: string;
    preview?: string;
  }>;
  portfolioId: string;
  onProcessingComplete: (processedFiles: ProcessedFile[]) => void;
  onCancel?: () => void;
}

// ============================================================
// COMPONENT
// ============================================================

export const FileProcessor: React.FC<FileProcessorProps> = ({
  files,
  portfolioId,
  onProcessingComplete,
  onCancel,
}) => {
  const { theme } = useTheme();

  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [overallProgress, setOverallProgress] = useState(0);

  // Styles
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: spacing[6],
      maxWidth: '900px',
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
    progressSection: {
      backgroundColor: theme.bg.secondary,
      borderRadius: borderRadius.xl,
      padding: spacing[6],
    },
    progressHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing[4],
    },
    progressTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text.primary,
    },
    progressPercent: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: theme.accent.primary,
    },
    progressBarContainer: {
      height: '8px',
      backgroundColor: theme.border.light,
      borderRadius: borderRadius.full,
      overflow: 'hidden' as const,
      marginBottom: spacing[4],
    },
    progressBar: {
      height: '100%',
      backgroundColor: theme.accent.primary,
      borderRadius: borderRadius.full,
      transition: 'width 0.3s ease',
    },
    progressStats: {
      display: 'flex',
      justifyContent: 'space-between',
      fontSize: typography.fontSize.sm,
      color: theme.text.tertiary,
    },
    fileGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: spacing[4],
      maxHeight: '400px',
      overflowY: 'auto' as const,
      padding: spacing[2],
    },
    fileCard: {
      backgroundColor: theme.bg.secondary,
      borderRadius: borderRadius.lg,
      overflow: 'hidden' as const,
      border: `1px solid ${theme.border.light}`,
      transition: transitions.normal,
    },
    fileCardProcessing: {
      borderColor: theme.accent.primary,
      boxShadow: `0 0 0 2px ${theme.accent.muted}`,
    },
    fileCardReady: {
      borderColor: theme.semantic.success,
    },
    fileCardError: {
      borderColor: theme.semantic.error,
    },
    filePreview: {
      position: 'relative' as const,
      width: '100%',
      height: '120px',
      backgroundColor: theme.bg.tertiary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden' as const,
    },
    filePreviewImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover' as const,
    },
    filePreviewIcon: {
      fontSize: '3rem',
    },
    fileProgressOverlay: {
      position: 'absolute' as const,
      bottom: 0,
      left: 0,
      right: 0,
      height: '4px',
      backgroundColor: theme.border.light,
    },
    fileProgressBar: {
      height: '100%',
      backgroundColor: theme.accent.primary,
      transition: 'width 0.3s ease',
    },
    fileInfo: {
      padding: spacing[3],
    },
    fileName: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: theme.text.primary,
      whiteSpace: 'nowrap' as const,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      marginBottom: spacing[1],
    },
    fileDetails: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    fileSize: {
      fontSize: typography.fontSize.xs,
      color: theme.text.tertiary,
    },
    fileStatus: {
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.medium,
      padding: `2px ${spacing[2]}`,
      borderRadius: borderRadius.sm,
    },
    statusQueued: {
      backgroundColor: theme.border.light,
      color: theme.text.secondary,
    },
    statusProcessing: {
      backgroundColor: theme.semantic.infoBg,
      color: theme.semantic.info,
    },
    statusReady: {
      backgroundColor: theme.semantic.successBg,
      color: theme.semantic.success,
    },
    statusError: {
      backgroundColor: theme.semantic.errorBg,
      color: theme.semantic.error,
    },
    summarySection: {
      backgroundColor: theme.bg.secondary,
      borderRadius: borderRadius.xl,
      padding: spacing[5],
    },
    summaryGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: spacing[4],
    },
    summaryCard: {
      textAlign: 'center' as const,
    },
    summaryValue: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: theme.accent.primary,
      marginBottom: spacing[1],
    },
    summaryLabel: {
      fontSize: typography.fontSize.sm,
      color: theme.text.tertiary,
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
  };

  // Initialiser les fichiers à traiter
  useEffect(() => {
    const initialFiles: ProcessedFile[] = files.map((file) => ({
      id: file.id,
      originalName: file.name,
      originalPath: file.path,
      originalSize: file.size,
      type: getFileType(file.extension),
      status: 'queued',
      progress: 0,
      extractedElements: [],
      thumbnail: file.preview,
    }));
    setProcessedFiles(initialFiles);
  }, [files]);

  // Démarrer le traitement automatiquement
  useEffect(() => {
    if (processedFiles.length > 0 && !isProcessing && currentIndex === 0) {
      startProcessing();
    }
  }, [processedFiles]);

  const getFileType = (extension: string): ProcessedFile['type'] => {
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff'];
    const videoExts = ['mp4', 'mov', 'avi', 'mkv', 'webm'];
    const pdfExts = ['pdf'];

    if (imageExts.includes(extension.toLowerCase())) return 'image';
    if (videoExts.includes(extension.toLowerCase())) return 'video';
    if (pdfExts.includes(extension.toLowerCase())) return 'pdf';
    return 'document';
  };

  const startProcessing = useCallback(async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    for (let i = 0; i < processedFiles.length; i++) {
      setCurrentIndex(i);
      await processFile(i);
      setOverallProgress(Math.round(((i + 1) / processedFiles.length) * 100));
    }

    setIsProcessing(false);
  }, [processedFiles, isProcessing]);

  const processFile = async (index: number): Promise<void> => {
    const file = processedFiles[index];
    if (!file) return;

    // Mettre à jour le statut
    updateFileStatus(index, 'extracting', 0);

    try {
      // Simuler l'extraction (en production, appel IPC vers main process)
      await simulateExtraction(index);

      // Simuler la compression
      updateFileStatus(index, 'compressing', 50);
      await simulateCompression(index);

      // Marquer comme prêt
      updateFileStatus(index, 'ready', 100);
    } catch (error) {
      updateFileStatus(index, 'error', 0, error instanceof Error ? error.message : 'Erreur inconnue');
    }
  };

  const simulateExtraction = async (index: number): Promise<void> => {
    // Simulation de l'extraction avec progression
    const steps = 5;
    for (let step = 0; step < steps; step++) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      updateFileProgress(index, (step / steps) * 50);
    }

    // En production, on appellerait :
    // const result = await window.electron.invoke('portfolio-extract-file', {
    //   filePath: processedFiles[index].originalPath,
    //   portfolioId,
    // });

    // Simuler des métadonnées extraites
    setProcessedFiles((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = {
          ...updated[index],
          metadata: generateMockMetadata(updated[index].type),
          extractedElements: generateMockElements(updated[index].type),
        };
      }
      return updated;
    });
  };

  const simulateCompression = async (index: number): Promise<void> => {
    // Simulation de la compression avec progression
    const steps = 5;
    for (let step = 0; step < steps; step++) {
      await new Promise((resolve) => setTimeout(resolve, 100));
      updateFileProgress(index, 50 + (step / steps) * 50);
    }

    // Simuler la taille compressée (60-80% de l'original)
    const compressionRatio = 0.6 + Math.random() * 0.2;
    setProcessedFiles((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = {
          ...updated[index],
          compressedSize: Math.round(updated[index].originalSize * compressionRatio),
          compressedPath: `compressed_${updated[index].originalName}`,
        };
      }
      return updated;
    });
  };

  const generateMockMetadata = (type: ProcessedFile['type']): FileMetadata => {
    const base: FileMetadata = {
      dateCreated: new Date().toISOString(),
      dateModified: new Date().toISOString(),
    };

    switch (type) {
      case 'image':
        return {
          ...base,
          width: 1920 + Math.floor(Math.random() * 2000),
          height: 1080 + Math.floor(Math.random() * 1500),
          camera: ['iPhone 15 Pro', 'Canon EOS R5', 'Sony A7IV', 'Nikon Z8'][Math.floor(Math.random() * 4)],
        };
      case 'video':
        return {
          ...base,
          width: 1920,
          height: 1080,
          duration: 30 + Math.floor(Math.random() * 300),
        };
      case 'pdf':
        return {
          ...base,
          pageCount: 1 + Math.floor(Math.random() * 20),
        };
      default:
        return base;
    }
  };

  const generateMockElements = (type: ProcessedFile['type']): ExtractedElement[] => {
    switch (type) {
      case 'image':
        return [{
          type: 'image',
          index: 0,
          width: 1920,
          height: 1080,
        }];
      case 'video':
        return [{
          type: 'video_thumbnail',
          index: 0,
          width: 1920,
          height: 1080,
        }];
      case 'pdf':
        const pageCount = 1 + Math.floor(Math.random() * 5);
        return Array.from({ length: pageCount }, (_, i) => ({
          type: 'image' as const,
          index: i,
          width: 595,
          height: 842,
        }));
      default:
        return [];
    }
  };

  const updateFileStatus = (
    index: number,
    status: ProcessedFile['status'],
    progress: number,
    error?: string
  ) => {
    setProcessedFiles((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = {
          ...updated[index],
          status,
          progress,
          error,
        };
      }
      return updated;
    });
  };

  const updateFileProgress = (index: number, progress: number) => {
    setProcessedFiles((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = {
          ...updated[index],
          progress,
        };
      }
      return updated;
    });
  };

  const handleContinue = () => {
    const readyFiles = processedFiles.filter((f) => f.status === 'ready');
    onProcessingComplete(readyFiles);
  };

  const getFileCardStyle = (status: ProcessedFile['status']) => {
    switch (status) {
      case 'extracting':
      case 'compressing':
        return styles.fileCardProcessing;
      case 'ready':
        return styles.fileCardReady;
      case 'error':
        return styles.fileCardError;
      default:
        return {};
    }
  };

  const getStatusStyle = (status: ProcessedFile['status']) => {
    switch (status) {
      case 'extracting':
      case 'compressing':
        return styles.statusProcessing;
      case 'ready':
        return styles.statusReady;
      case 'error':
        return styles.statusError;
      default:
        return styles.statusQueued;
    }
  };

  const getStatusLabel = (status: ProcessedFile['status']) => {
    switch (status) {
      case 'queued':
        return 'En attente';
      case 'extracting':
        return 'Extraction...';
      case 'compressing':
        return 'Compression...';
      case 'ready':
        return 'Prêt';
      case 'error':
        return 'Erreur';
    }
  };

  const getFileIcon = (type: ProcessedFile['type']): string => {
    switch (type) {
      case 'image':
        return '🖼️';
      case 'video':
        return '🎬';
      case 'pdf':
        return '📄';
      default:
        return '📎';
    }
  };

  // Statistiques
  const stats = {
    total: processedFiles.length,
    ready: processedFiles.filter((f) => f.status === 'ready').length,
    errors: processedFiles.filter((f) => f.status === 'error').length,
    originalSize: processedFiles.reduce((acc, f) => acc + f.originalSize, 0),
    compressedSize: processedFiles.reduce((acc, f) => acc + (f.compressedSize || f.originalSize), 0),
  };

  const allDone = processedFiles.every((f) => f.status === 'ready' || f.status === 'error');

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>Traitement des fichiers</h2>
        <p style={styles.subtitle}>
          Extraction des métadonnées et optimisation pour votre portfolio.
        </p>
      </div>

      {/* Progress section */}
      <div style={styles.progressSection}>
        <div style={styles.progressHeader}>
          <span style={styles.progressTitle}>
            {isProcessing ? 'Traitement en cours...' : allDone ? 'Traitement terminé' : 'Prêt'}
          </span>
          <span style={styles.progressPercent}>{overallProgress}%</span>
        </div>
        <div style={styles.progressBarContainer}>
          <div
            style={{
              ...styles.progressBar,
              width: `${overallProgress}%`,
            }}
          />
        </div>
        <div style={styles.progressStats}>
          <span>{stats.ready} / {stats.total} fichiers traités</span>
          {stats.errors > 0 && (
            <span style={{ color: theme.semantic.error }}>
              {stats.errors} erreur{stats.errors > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* File grid */}
      <div style={styles.fileGrid}>
        {processedFiles.map((file, index) => (
          <div
            key={file.id}
            style={{
              ...styles.fileCard,
              ...getFileCardStyle(file.status),
            }}
          >
            <div style={styles.filePreview}>
              {file.thumbnail ? (
                <img
                  src={file.thumbnail}
                  alt={file.originalName}
                  style={styles.filePreviewImage}
                />
              ) : (
                <span style={styles.filePreviewIcon}>{getFileIcon(file.type)}</span>
              )}
              {(file.status === 'extracting' || file.status === 'compressing') && (
                <div style={styles.fileProgressOverlay}>
                  <div
                    style={{
                      ...styles.fileProgressBar,
                      width: `${file.progress}%`,
                    }}
                  />
                </div>
              )}
            </div>
            <div style={styles.fileInfo}>
              <div style={styles.fileName} title={file.originalName}>
                {file.originalName}
              </div>
              <div style={styles.fileDetails}>
                <span style={styles.fileSize}>
                  {file.compressedSize
                    ? `${formatFileSize(file.compressedSize)} (${Math.round((1 - file.compressedSize / file.originalSize) * 100)}% économisé)`
                    : formatFileSize(file.originalSize)}
                </span>
                <span style={{ ...styles.fileStatus, ...getStatusStyle(file.status) }}>
                  {getStatusLabel(file.status)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary section */}
      {allDone && (
        <div style={styles.summarySection}>
          <div style={styles.summaryGrid}>
            <div style={styles.summaryCard}>
              <div style={styles.summaryValue}>{stats.ready}</div>
              <div style={styles.summaryLabel}>Fichiers prêts</div>
            </div>
            <div style={styles.summaryCard}>
              <div style={styles.summaryValue}>
                {processedFiles.reduce((acc, f) => acc + f.extractedElements.length, 0)}
              </div>
              <div style={styles.summaryLabel}>Éléments extraits</div>
            </div>
            <div style={styles.summaryCard}>
              <div style={styles.summaryValue}>{formatFileSize(stats.originalSize)}</div>
              <div style={styles.summaryLabel}>Taille originale</div>
            </div>
            <div style={styles.summaryCard}>
              <div style={{
                ...styles.summaryValue,
                color: theme.semantic.success,
              }}>
                {Math.round((1 - stats.compressedSize / stats.originalSize) * 100)}%
              </div>
              <div style={styles.summaryLabel}>Espace économisé</div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={styles.footer}>
        <span style={styles.footerInfo}>
          {isProcessing
            ? `Traitement de ${processedFiles[currentIndex]?.originalName || ''}...`
            : allDone
            ? `${stats.ready} fichier${stats.ready > 1 ? 's' : ''} prêt${stats.ready > 1 ? 's' : ''} pour la classification`
            : 'En attente du traitement'}
        </span>
        <div style={styles.footerButtons}>
          {onCancel && (
            <button
              type="button"
              style={{ ...styles.button, ...styles.buttonSecondary }}
              onClick={onCancel}
            >
              Annuler
            </button>
          )}
          <button
            type="button"
            style={{
              ...styles.button,
              ...(allDone && stats.ready > 0 ? styles.buttonPrimary : styles.buttonPrimaryDisabled),
            }}
            onClick={handleContinue}
            disabled={!allDone || stats.ready === 0}
          >
            Continuer vers la classification
          </button>
        </div>
      </div>
    </div>
  );
};

export default FileProcessor;
