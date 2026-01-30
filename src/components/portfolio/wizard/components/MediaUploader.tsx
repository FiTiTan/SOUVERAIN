import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Check, AlertCircle } from 'lucide-react';
import { useTheme } from '../../../../ThemeContext';
import type { Media } from '../types';
import { ImageIcon } from '../icons';

interface MediaUploaderProps {
  media: Media[];
  onChange: (media: Media[]) => void;
}

interface UploadingFile {
  name: string;
  status: 'processing' | 'success' | 'error';
  originalSize?: string;
  optimizedSize?: string;
  message?: string;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({ media, onChange }) => {
  const { theme, mode } = useTheme();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith('image/')
    );

    await processFiles(files);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      await processFiles(files);
      e.target.value = '';
    }
  };

  const processFiles = async (files: File[]) => {
    const initialUploadingFiles: UploadingFile[] = files.map(f => ({
      name: f.name,
      status: 'processing',
    }));
    setUploadingFiles(initialUploadingFiles);

    const newMedia: Media[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        // Process image via IPC
        const result = await window.electron.invoke('process-image', {
          filePath: await saveFileTemporarily(file),
          type: 'general',
        });

        newMedia.push({
          url: result.processed.path,
          optimized: result.wasProcessed,
          originalSize: parseFloat(result.original.sizeMB),
          optimizedSize: parseFloat(result.processed.sizeMB),
        });

        // Update uploading status
        setUploadingFiles(prev =>
          prev.map((uf, idx) =>
            idx === i
              ? {
                  ...uf,
                  status: 'success',
                  originalSize: result.original.sizeMB + ' MB',
                  optimizedSize: result.processed.sizeMB + ' MB',
                  message: result.wasProcessed
                    ? result.warnings.join(', ')
                    : 'Aucune modification nécessaire',
                }
              : uf
          )
        );
      } catch (error) {
        console.error('Error processing image:', error);
        setUploadingFiles(prev =>
          prev.map((uf, idx) =>
            idx === i
              ? {
                  ...uf,
                  status: 'error',
                  message: 'Erreur lors du traitement',
                }
              : uf
          )
        );
      }
    }

    onChange([...media, ...newMedia]);

    // Clear uploading files after 3 seconds
    setTimeout(() => {
      setUploadingFiles([]);
    }, 3000);
  };

  const saveFileTemporarily = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    // Fix: Convert ArrayBuffer to Array<number> without using Node Buffer
    const buffer = Array.from(new Uint8Array(arrayBuffer));
    const result = await window.electron.invoke('file-save-temp', {
      fileName: file.name,
      buffer: buffer,
    });
    return result.path;
  };

  const handleRemove = (index: number) => {
    onChange(media.filter((_, i) => i !== index));
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      {/* Drop Zone */}
      <motion.div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        whileHover={{ scale: 1.01 }}
        style={{
          borderRadius: '16px',
          border: `2px dashed ${isDragging ? theme.accent.primary : theme.border.default}`,
          background: isDragging
            ? mode === 'dark'
              ? 'rgba(99, 102, 241, 0.1)'
              : 'rgba(99, 102, 241, 0.05)'
            : mode === 'dark'
            ? 'rgba(30, 41, 59, 0.4)'
            : 'rgba(255, 255, 255, 0.5)',
          backdropFilter: 'blur(10px)',
          padding: '3rem 2rem',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          transform: 'translate3d(0, 0, 0)',
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        <Upload size={48} color={theme.text.secondary} style={{ marginBottom: '1rem' }} />
        <div style={{ color: theme.text.primary, fontSize: '1rem', fontWeight: 500, marginBottom: '0.5rem' }}>
          Glissez vos images ici ou cliquez pour parcourir
        </div>
        <div style={{ color: theme.text.secondary, fontSize: '0.85rem', marginBottom: '1rem' }}>
          Formats : JPG, PNG, WebP • Taille max recommandée : 1920×1080
        </div>
        <div
          style={{
            background: mode === 'dark' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
            border: `1px solid ${theme.accent.primary}`,
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            display: 'inline-block',
            color: theme.accent.primary,
            fontSize: '0.85rem',
          }}
        >
          ℹ️ Les images trop grandes seront automatiquement redimensionnées et compressées
        </div>
      </motion.div>

      {/* Uploading Files Status */}
      <AnimatePresence>
        {uploadingFiles.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
          >
            {uploadingFiles.map((file, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                style={{
                  background: mode === 'dark' ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${theme.border.light}`,
                  borderRadius: '12px',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                }}
              >
                {file.status === 'processing' && (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        border: `3px solid ${theme.border.default}`,
                        borderTopColor: theme.accent.primary,
                        borderRadius: '50%',
                      }}
                    />
                  </motion.div>
                )}
                {file.status === 'success' && <Check size={24} color={theme.semantic.success} />}
                {file.status === 'error' && <AlertCircle size={24} color={theme.semantic.error} />}
                <div style={{ flex: 1 }}>
                  <div style={{ color: theme.text.primary, fontSize: '0.9rem', fontWeight: 500 }}>
                    {file.name}
                  </div>
                  {file.originalSize && file.optimizedSize && (
                    <div style={{ color: theme.text.secondary, fontSize: '0.85rem', marginTop: '0.25rem' }}>
                      Original: {file.originalSize} → Optimisé: {file.optimizedSize}
                    </div>
                  )}
                  {file.message && (
                    <div style={{ color: theme.text.secondary, fontSize: '0.8rem', marginTop: '0.25rem' }}>
                      {file.message}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Uploaded Media List */}
      {media.length > 0 && (
        <div style={{ marginTop: '1.5rem' }}>
          <div style={{ color: theme.text.primary, fontSize: '0.95rem', fontWeight: 500, marginBottom: '1rem' }}>
            Images importées : {media.length}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {media.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: mode === 'dark' ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${theme.border.light}`,
                  borderRadius: '12px',
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ImageIcon size={32} color={theme.text.tertiary} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: theme.text.primary, fontSize: '0.9rem', fontWeight: 500 }}>
                      {item.url.split(/[\\/]/).pop()}
                    </div>
                    {item.optimized && item.originalSize && item.optimizedSize && (
                      <div style={{ color: theme.text.secondary, fontSize: '0.85rem', marginTop: '0.25rem' }}>
                        Optimisée: {item.originalSize.toFixed(1)}MB → {item.optimizedSize.toFixed(1)}MB
                      </div>
                    )}
                    {!item.optimized && (
                      <div style={{ color: theme.text.secondary, fontSize: '0.85rem', marginTop: '0.25rem' }}>
                        Aucune modification nécessaire
                      </div>
                    )}
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleRemove(index)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: 'none',
                    background: 'transparent',
                    color: theme.text.secondary,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                    e.currentTarget.style.color = theme.semantic.error;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = theme.text.secondary;
                  }}
                >
                  <X size={16} />
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
