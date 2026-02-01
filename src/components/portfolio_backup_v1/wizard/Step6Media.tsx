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
  onClick: () => void;
}> = ({ file, onRemove, onClick }) => {
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
      onClick={onClick}
      style={{
        background: theme.bg.secondary,
        border: `1px solid ${theme.border.light}`,
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
        position: 'relative',
        aspectRatio: '1/1',
        cursor: 'pointer',
        transition: transitions.fast,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
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
          onClick={(e) => {
            e.stopPropagation(); // Empêcher le onClick du parent
            onRemove();
          }}
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
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      onChange({ media: [...data.media, ...newFiles] });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files);
      onChange({ media: [...data.media, ...newFiles] });
    }
  };

  const handleRemove = (index: number) => {
    onChange({ media: data.media.filter((_, i) => i !== index) });
  };

  const handlePreview = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
      setPreviewFile(file);
    };
    reader.readAsDataURL(file);
  };

  const closePreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setPreviewFile(null);
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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <ImageIcon size={64} color={theme.text.tertiary} />
          </div>
          <div
            style={{
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.bold,
              color: theme.text.primary,
            }}
          >
            Glissez vos médias ici ou cliquez
          </div>
          <div style={{ fontSize: typography.fontSize.sm, color: theme.text.tertiary }}>
            JPG, PNG, GIF, MP4, WebM acceptés
          </div>
          <label
            htmlFor="media-upload"
            style={{
              padding: '0.75rem 2rem',
              borderRadius: borderRadius.lg,
              border: `2px solid ${theme.border.default}`,
              background: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
              backdropFilter: 'blur(20px)',
              color: theme.text.primary,
              cursor: 'pointer',
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.semibold,
              transition: transitions.fast,
              display: 'inline-block',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)';
              e.currentTarget.style.borderColor = theme.accent.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)';
              e.currentTarget.style.borderColor = theme.border.default;
            }}
          >
            Choisir des fichiers
          </label>
        </div>
      </div>

      {/* Media Grid */}
      {data.media.length > 0 && (
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
            Médias ({data.media.length})
          </h4>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '1rem',
            }}
          >
            {data.media.map((file, index) => (
              <MediaPreviewCard
                key={`${file.name}-${index}`}
                file={file}
                onRemove={() => handleRemove(index)}
                onClick={() => handlePreview(file)}
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

      {/* Preview Modal */}
      {previewFile && previewUrl && (
        <div
          onClick={closePreview}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.9)',
            backdropFilter: 'blur(10px)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            padding: '2rem',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
            }}
          >
            <div style={{ color: '#fff', fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold }}>
              {previewFile.name}
            </div>
            <button
              onClick={closePreview}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: borderRadius.md,
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                fontSize: typography.fontSize.sm,
                cursor: 'pointer',
              }}
            >
              Fermer ✕
            </button>
          </div>

          {/* Preview Content */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {previewFile.type.startsWith('image/') ? (
              <img
                src={previewUrl}
                alt={previewFile.name}
                loading="lazy"
                decoding="async"
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                }}
              />
            ) : (
              <video
                src={previewUrl}
                controls
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                }}
              />
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};
