import React, { useState, useCallback } from 'react';
import { useTheme } from '../../../ThemeContext';

export interface MediaFile {
  id: string;
  file: File;
  preview: string;
  type: 'image' | 'video' | 'pdf' | 'text' | 'document';
}

interface MediaImportProps {
  onComplete: (files: MediaFile[]) => void;
  onBack: () => void;
  onSkip?: () => void; // Optional skip button
  initialFiles?: MediaFile[]; // For edit mode from recap
}

const ACCEPTED_TYPES = {
  'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  'video/*': ['.mp4', '.webm', '.mov'],
  'application/pdf': ['.pdf'],
  'text/plain': ['.txt'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-powerpoint': ['.ppt'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx']
};

const getFileType = (file: File): MediaFile['type'] => {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type === 'application/pdf') return 'pdf';
  if (file.type === 'text/plain' || file.name.endsWith('.txt')) return 'text';
  return 'document';
};

const getFileIcon = (type: MediaFile['type']): string => {
  switch (type) {
    case 'image': return '🖼️';
    case 'video': return '🎬';
    case 'pdf': return '📄';
    case 'text': return '📝';
    case 'document': return '📋';
    default: return '📎';
  }
};

export const MediaImport: React.FC<MediaImportProps> = ({ onComplete, onBack, initialFiles }) => {
  const { theme } = useTheme();
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>(initialFiles || []);
  const [isDragging, setIsDragging] = useState(false);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const processFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const newMediaFiles: MediaFile[] = [];

    for (const file of fileArray) {
      const type = getFileType(file);
      let preview = '';

      if (type === 'image' || type === 'video' || type === 'pdf' || type === 'text') {
        preview = URL.createObjectURL(file);
      }

      newMediaFiles.push({
        id: `${Date.now()}-${Math.random()}`,
        file,
        preview,
        type
      });
    }

    setMediaFiles(prev => [...prev, ...newMediaFiles]);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await processFiles(files);
    }
  }, [processFiles]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFiles(files);
    }
  }, [processFiles]);

  const removeFile = (id: string) => {
    const file = mediaFiles.find(f => f.id === id);
    if (file && file.preview) {
      URL.revokeObjectURL(file.preview);
    }
    setMediaFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleContinue = () => {
    onComplete(mediaFiles);
  };

  // Lock body scroll when preview is open
  React.useEffect(() => {
    if (previewIndex !== null) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [previewIndex]);

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: theme.bg.primary,
      padding: '2rem'
    }}>
      {/* Header with AI prompt */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            backgroundColor: `${theme.accent.primary}22`,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            🤖
          </div>
          <div style={{
            backgroundColor: theme.bg.secondary,
            borderRadius: '16px',
            borderTopLeftRadius: '4px',
            padding: '1rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            border: `1px solid ${theme.border.light}`,
            maxWidth: '600px'
          }}>
            <p style={{
              fontWeight: 600,
              color: theme.text.primary,
              marginBottom: '0.25rem',
              fontSize: '1rem'
            }}>
              Ajoutez vos médias au portfolio
            </p>
            <p style={{
              fontSize: '0.9rem',
              color: theme.text.secondary,
              margin: 0
            }}>
              Glissez-déposez vos images, vidéos, PDFs ou documents, ou cliquez pour sélectionner.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', marginBottom: '2rem' }}>
        {/* ... (existing content) ... */}
        {/* Drop zone and file list code remains same, handled by diff */}
        {/* Drop zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('media-file-input')?.click()}
          style={{
            border: `2px dashed ${isDragging ? theme.accent.primary : theme.border.default}`,
            borderRadius: '12px',
            padding: '3rem 2rem',
            textAlign: 'center',
            cursor: 'pointer',
            backgroundColor: isDragging ? `${theme.accent.primary}11` : theme.bg.secondary,
            transition: 'all 0.2s',
            marginBottom: '2rem'
          }}
        >
          <input
            id="media-file-input"
            type="file"
            multiple
            accept={Object.keys(ACCEPTED_TYPES).join(',')}
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <span style={{ fontSize: '4rem', display: 'block', marginBottom: '1rem' }}>
            {isDragging ? '🎯' : '📤'}
          </span>
          <p style={{
            margin: 0,
            fontWeight: 600,
            color: theme.text.primary,
            fontSize: '1.1rem',
            marginBottom: '0.5rem'
          }}>
            {isDragging ? 'Déposez vos fichiers ici' : 'Glissez-déposez vos fichiers'}
          </p>
          <p style={{
            margin: 0,
            fontSize: '0.9rem',
            color: theme.text.secondary
          }}>
            ou cliquez pour sélectionner
          </p>
          <p style={{
            marginTop: '1rem',
            fontSize: '0.85rem',
            color: theme.text.tertiary
          }}>
            Images, vidéos, PDFs, documents acceptés
          </p>
        </div>

        {/* File list */}
        {mediaFiles.length > 0 && (
          <div>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: theme.text.primary,
              marginBottom: '1rem'
            }}>
              Fichiers sélectionnés ({mediaFiles.length})
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              {mediaFiles.map(media => (
                <div
                  key={media.id}
                  style={{
                    position: 'relative',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    backgroundColor: theme.bg.secondary,
                    border: `1px solid ${theme.border.default}`,
                    transition: 'all 0.2s'
                  }}
                >
                  {/* Preview */}
                  <div 
                    onClick={() => setPreviewIndex(mediaFiles.findIndex(m => m.id === media.id))}
                    style={{
                      width: '100%',
                      height: '150px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: theme.bg.tertiary || theme.bg.secondary,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => {
                      const overlay = e.currentTarget.querySelector('.preview-overlay') as HTMLElement;
                      if (overlay) overlay.style.opacity = '1';
                    }}
                    onMouseLeave={(e) => {
                      const overlay = e.currentTarget.querySelector('.preview-overlay') as HTMLElement;
                      if (overlay) overlay.style.opacity = '0';
                    }}
                  >
                    {media.type === 'image' && (
                      <img
                        src={media.preview}
                        alt={media.file.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    )}
                    {media.type === 'video' && (
                      <video
                        src={media.preview}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    )}
                    {(media.type === 'pdf' || media.type === 'document') && (
                      <span style={{ fontSize: '4rem' }}>
                        {getFileIcon(media.type)}
                      </span>
                    )}
                    {/* Hover overlay */}
                    <div 
                      className="preview-overlay"
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transition: 'opacity 0.2s',
                        pointerEvents: 'none'
                      }}
                    >
                      <span style={{ 
                        fontSize: '2rem',
                        color: '#FFFFFF'
                      }}>
                        🔍
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div style={{ padding: '0.75rem' }}>
                    <p style={{
                      margin: 0,
                      fontSize: '0.85rem',
                      fontWeight: 500,
                      color: theme.text.primary,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {media.file.name}
                    </p>
                    <p style={{
                      margin: '0.25rem 0 0 0',
                      fontSize: '0.75rem',
                      color: theme.text.tertiary
                    }}>
                      {(media.file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>

                  {/* Remove button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(media.id);
                    }}
                    style={{
                      position: 'absolute',
                      top: '0.5rem',
                      right: '0.5rem',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      border: 'none',
                      backgroundColor: 'rgba(0, 0, 0, 0.6)',
                      color: '#FFFFFF',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      transition: 'all 0.2s',
                      outline: 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#EF4444';
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {mediaFiles.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            color: theme.text.tertiary
          }}>
            <p style={{ margin: 0, fontSize: '0.95rem' }}>
              Aucun fichier sélectionné pour le moment
            </p>
          </div>
        )}

        {/* DATA PROTECTION NOTICE */}
        <div style={{
          marginTop: '2rem',
          padding: '1rem 1.5rem',
          backgroundColor: 'rgba(16, 185, 129, 0.1)', // Green background
          border: '1px solid rgba(16, 185, 129, 0.3)', // Green border
          borderRadius: '12px',
          display: 'flex',
          gap: '1rem',
          alignItems: 'flex-start'
        }}>
          <div style={{
            fontSize: '1.5rem',
            lineHeight: 1
          }}>
            🔒
          </div>
          <div>
            <h4 style={{
              margin: '0 0 0.25rem 0',
              fontSize: '1rem',
              fontWeight: 600,
              color: '#059669' // Green text
            }}>
              Protection des données
            </h4>
            <p style={{
              margin: 0,
              fontSize: '0.9rem',
              color: theme.text.secondary, // Or a slightly darker green if preferred
              lineHeight: '1.4'
            }}>
              Vos données seront anonymisées localement avant traitement par l'IA. Aucune donnée n'est envoyée vers le cloud.
            </p>
          </div>
        </div>

      </div>

      {/* Navigation buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        paddingTop: '1rem',
        borderTop: `1px solid ${theme.border.light}`
      }}>
        <button
          onClick={onBack}
          style={{
            padding: '0.875rem 1.75rem',
            borderRadius: '12px',
            border: `1px solid ${theme.border.default}`,
            backgroundColor: theme.bg.secondary,
            color: theme.text.primary,
            fontSize: '0.95rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s',
            outline: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.bg.tertiary || theme.bg.secondary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = theme.bg.secondary;
          }}
        >
          ← Retour
        </button>

        <button
          onClick={handleContinue}
          style={{
            padding: '0.875rem 1.75rem',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: theme.accent.primary,
            color: '#FFFFFF',
            fontSize: '0.95rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            outline: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          Terminer →
        </button>
      </div>

      {/* Fullscreen Preview Modal - Material 3 Template */}
      {previewIndex !== null && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            zIndex: 2000
          }}
        >
          {/* TOP BAR */}
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '56px',
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            zIndex: 10
          }}>
            {/* Left: Icon + Filename */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: '#FFFFFF'
            }}>
              <span style={{ fontSize: '1.25rem', opacity: 0.7 }}>
                {getFileIcon(mediaFiles[previewIndex].type)}
              </span>
              <span style={{
                fontWeight: 500,
                fontSize: '14px',
                maxWidth: '300px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {mediaFiles[previewIndex].file.name}
              </span>
            </div>

            {/* Right: Close button */}
            <button
              onClick={() => setPreviewIndex(null)}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                border: 'none',
                backgroundColor: 'transparent',
                color: '#FFFFFF',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                transition: 'background 0.2s',
                outline: 'none'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              aria-label="Fermer"
            >
              ×
            </button>
          </div>

          {/* MEDIA ZONE */}
          <div
            onClick={() => setPreviewIndex(null)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setPreviewIndex(null);
              if (e.key === 'ArrowLeft' && previewIndex > 0) setPreviewIndex(previewIndex - 1);
              if (e.key === 'ArrowRight' && previewIndex < mediaFiles.length - 1) setPreviewIndex(previewIndex + 1);
              if (e.key === 'Home') setPreviewIndex(0);
              if (e.key === 'End') setPreviewIndex(mediaFiles.length - 1);
            }}
            tabIndex={0}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '32px 24px', // Reduced padding for more space
              paddingTop: '80px', // Space for top bar
              paddingBottom: '80px' // Space for bottom bar
            }}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {/* Image */}
              {mediaFiles[previewIndex].type === 'image' && (
                <img
                  src={mediaFiles[previewIndex].preview}
                  alt={mediaFiles[previewIndex].file.name}
                  draggable={false}
                  style={{
                    width: 'auto',
                    height: 'auto',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                  }}
                />
              )}

              {/* Video */}
              {mediaFiles[previewIndex].type === 'video' && (
                <video
                  key={mediaFiles[previewIndex].id}
                  src={mediaFiles[previewIndex].preview}
                  controls
                  style={{
                    width: 'auto',
                    height: 'auto',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    borderRadius: '8px',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                  }}
                >
                  Votre navigateur ne supporte pas la lecture vidéo.
                </video>
              )}

              {/* PDF Preview */}
              {mediaFiles[previewIndex].type === 'pdf' && (
                <iframe
                  src={mediaFiles[previewIndex].preview}
                  title={mediaFiles[previewIndex].file.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    borderRadius: '8px',
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                  }}
                />
              )}

              {/* Text File Preview */}
              {mediaFiles[previewIndex].type === 'text' && (
                <iframe
                  src={mediaFiles[previewIndex].preview}
                  title={mediaFiles[previewIndex].file.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    borderRadius: '8px',
                    backgroundColor: '#FFFFFF',
                    color: '#000000',
                    padding: '1rem',
                    fontFamily: 'monospace',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                  }}
                />
              )}

              {/* Document (Word, PowerPoint, etc.) - Not previewable */}
              {mediaFiles[previewIndex].type === 'document' && (
                <div style={{
                  backgroundColor: '#18181B',
                  borderRadius: '16px',
                  padding: '3rem',
                  textAlign: 'center',
                  maxWidth: '400px'
                }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    backgroundColor: '#27272A',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem auto'
                  }}>
                    <span style={{ fontSize: '2rem' }}>
                      {getFileIcon(mediaFiles[previewIndex].type)}
                    </span>
                  </div>
                  <p style={{
                    margin: 0,
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: '#FFFFFF',
                    marginBottom: '0.5rem'
                  }}>
                    {mediaFiles[previewIndex].file.name}
                  </p>
                  <p style={{
                    margin: 0,
                    fontSize: '0.875rem',
                    color: '#71717A',
                    marginBottom: '1rem'
                  }}>
                    {(mediaFiles[previewIndex].file.size / 1024).toFixed(2)} KB
                  </p>
                  <p style={{
                    margin: 0,
                    fontSize: '0.875rem',
                    color: '#A1A1AA',
                    marginBottom: '1.5rem'
                  }}
                >
                  Prévisualisation non disponible pour Word, PowerPoint et autres documents
                </p>
                  <button
                    onClick={async () => {
                      // @ts-ignore
                      const filePath = mediaFiles[previewIndex].file.path;
                      if (filePath) {
                        // @ts-ignore
                        await window.electron.invoke('open-file-external', filePath);
                      } else {
                        alert('Impossible d\'ouvrir le fichier. Chemin non disponible.');
                      }
                    }}
                    style={{
                      padding: '0.75rem 1.5rem',
                      backgroundColor: theme.accent.primary,
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      outline: 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    📂 Ouvrir dans l'application par défaut
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* BOTTOM BAR */}
          {mediaFiles.length > 1 && (
            <div style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              height: '64px',
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '32px',
              zIndex: 10
            }}>
              {/* Previous button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewIndex(previewIndex - 1);
                }}
                disabled={previewIndex === 0}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#FFFFFF',
                  cursor: previewIndex === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  transition: 'background 0.2s',
                  opacity: previewIndex === 0 ? 0.3 : 1,
                  outline: 'none'
                }}
                onMouseEnter={(e) => {
                  if (previewIndex > 0) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                }}
                aria-label="Précédent"
              >
                ←
              </button>

              {/* Counter */}
              <span style={{
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 500,
                minWidth: '60px',
                textAlign: 'center'
              }}>
                {previewIndex + 1} / {mediaFiles.length}
              </span>

              {/* Next button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewIndex(previewIndex + 1);
                }}
                disabled={previewIndex === mediaFiles.length - 1}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  color: '#FFFFFF',
                  cursor: previewIndex === mediaFiles.length - 1 ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.5rem',
                  transition: 'background 0.2s',
                  opacity: previewIndex === mediaFiles.length - 1 ? 0.3 : 1,
                  outline: 'none'
                }}
                onMouseEnter={(e) => {
                  if (previewIndex < mediaFiles.length - 1) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                }}
                aria-label="Suivant"
              >
                →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
