import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../ThemeContext';
import { typography, borderRadius, transitions } from '../../../design-system';
import type { PortfolioFormData } from './types';
import { ImageIcon, LightbulbIcon } from './icons';

interface Step6MediaProps {
  data: PortfolioFormData;
  onChange: (updates: Partial<PortfolioFormData>) => void;
}

// Media Preview Card
const MediaPreviewCard: React.FC<{
  file: File;
  onRemove: () => void;
}> = ({ file, onRemove }) => {
  const { theme } = useTheme();
  const [preview, setPreview] = useState<string | null>(null);

  const isImage = file.type.startsWith('image/');
  const isVideo = file.type.startsWith('video/');

  // Generate preview
  useEffect(() => {
    if (isImage || isVideo) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [file, isImage, isVideo]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      style={{
        background: theme.bg.secondary,
        border: `1px solid ${theme.border.light}`,
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
        position: 'relative',
        aspectRatio: '16/9',
      }}
    >
      {/* Preview */}
      {preview && isImage && (
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundImage: `url(${preview})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
      )}
      {preview && isVideo && (
        <video
          src={preview}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      )}

      {/* Overlay with info */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
          padding: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}
      >
        <div>
          <div
            style={{
              fontSize: typography.fontSize.xs,
              color: '#fff',
              fontWeight: typography.fontWeight.medium,
              marginBottom: '0.25rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {file.name}
          </div>
          <div style={{ fontSize: typography.fontSize.xs, color: 'rgba(255,255,255,0.7)' }}>
            {formatFileSize(file.size)} • {isImage ? 'Image' : 'Vidéo'}
          </div>
        </div>

        {/* Remove Button */}
        <button
          onClick={onRemove}
          style={{
            padding: '0.5rem',
            borderRadius: borderRadius.md,
            border: 'none',
            background: 'rgba(239, 68, 68, 0.9)',
            color: '#fff',
            cursor: 'pointer',
            transition: transitions.fast,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.9)';
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export const Step6Media: React.FC<Step6MediaProps> = ({ data, onChange }) => {
  const { theme, mode } = useTheme();
  const [isDragging, setIsDragging] = useState(false);

  // Convert Media[] to File[] for display (simplified for now)
  const mediaFiles: File[] = []; // TODO: Store actual File objects in state

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      // TODO: Convert to Media[] format and update data.media
      console.log('New media files:', newFiles);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files);
      console.log('Dropped files:', newFiles);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <h2
          style={{
            fontSize: '2rem',
            fontWeight: 300,
            color: theme.text.primary,
            marginBottom: '0.5rem',
          }}
        >
          Photos & Vidéos
        </h2>
        <p style={{ color: theme.text.secondary, fontSize: '0.95rem' }}>
          Images et vidéos pour votre portfolio (optionnel)
        </p>
      </div>

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        style={{
          border: `2px dashed ${isDragging ? theme.accent.primary : theme.border.default}`,
          borderRadius: borderRadius.xl,
          padding: '3rem',
          textAlign: 'center',
          background: isDragging
            ? mode === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)'
            : mode === 'dark' ? 'rgba(30, 41, 59, 0.3)' : 'rgba(241, 245, 249, 0.5)',
          transition: transitions.normal,
          cursor: 'pointer',
        }}
      >
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          style={{ display: 'none' }}
          id="media-upload"
          accept="image/*,video/*"
        />
        <label htmlFor="media-upload" style={{ cursor: 'pointer', display: 'block' }}>
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
            <ImageIcon size={64} color={theme.text.tertiary} />
          </div>
          <div
            style={{
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.bold,
              color: theme.text.primary,
              marginBottom: '0.5rem',
            }}
          >
            Glissez vos médias ici
          </div>
          <div style={{ fontSize: typography.fontSize.sm, color: theme.text.tertiary }}>
            JPG, PNG, GIF, MP4, WebM acceptés
          </div>
        </label>
      </div>

      {/* Media Grid - Placeholder for now */}
      {mediaFiles.length > 0 && (
        <div>
          <h4
            style={{
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.bold,
              color: theme.text.secondary,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '1rem',
            }}
          >
            Médias ({mediaFiles.length})
          </h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '1rem',
            }}
          >
            {mediaFiles.map((file, index) => (
              <MediaPreviewCard
                key={`${file.name}-${index}`}
                file={file}
                onRemove={() => console.log('Remove', index)}
              />
            ))}
          </div>
        </div>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          padding: '1rem',
          background: theme.bg.tertiary,
          borderRadius: borderRadius.lg,
          fontSize: typography.fontSize.sm,
          color: theme.text.tertiary,
        }}
      >
        <LightbulbIcon size={18} color={theme.text.tertiary} />
        <span>Les médias seront automatiquement optimisés pour le web</span>
      </div>
    </motion.div>
  );
};
