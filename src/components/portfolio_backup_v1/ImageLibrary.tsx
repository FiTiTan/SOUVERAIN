/**
 * SOUVERAIN - Image Library
 * Bibliothèque d'images draggable
 */

import React, { useRef } from 'react';
import { useTheme } from '../../ThemeContext';
import { typography, borderRadius, transitions } from '../../design-system';
import type { LibraryImage } from './types';

interface ImageLibraryProps {
  images: LibraryImage[];
  onAddImages: (files: FileList) => void;
  onRemoveImage: (id: string) => void;
}

// ============================================================
// COMPONENT
// ============================================================

export const ImageLibrary: React.FC<ImageLibraryProps> = ({ images, onAddImages, onRemoveImage }) => {
  const { theme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragStart = (e: React.DragEvent, image: LibraryImage) => {
    e.dataTransfer.setData('imageId', image.id);
    e.dataTransfer.setData('imageDataUrl', image.dataUrl);
    e.dataTransfer.effectAllowed = 'copy';
  };

  // ============================================================
  // STYLES
  // ============================================================

  const containerStyle: React.CSSProperties = {
    backgroundColor: theme.bg.secondary,
    borderTop: `1px solid ${theme.border.light}`,
    padding: '1.5rem 2rem',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1rem',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: theme.text.primary,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  };

  const countStyle: React.CSSProperties = {
    color: theme.text.tertiary,
    fontWeight: typography.fontWeight.normal,
  };

  const importButtonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.625rem 1rem',
    backgroundColor: theme.accent.primary,
    color: '#FFFFFF',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    borderRadius: borderRadius.lg,
    border: 'none',
    cursor: 'pointer',
    transition: transitions.fast,
  };

  const emptyStateStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '2rem 0',
    color: theme.text.tertiary,
  };

  const gridStyle: React.CSSProperties = {
    display: 'flex',
    gap: '0.75rem',
    overflowX: 'auto',
    paddingBottom: '0.5rem',
  };

  const imageCardStyle: React.CSSProperties = {
    position: 'relative',
    flexShrink: 0,
    width: '96px',
    height: '96px',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    cursor: 'grab',
    border: `2px solid ${theme.border.light}`,
    transition: transitions.fast,
  };

  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  };

  const gripIndicatorStyle: React.CSSProperties = {
    position: 'absolute',
    top: '4px',
    left: '4px',
    padding: '4px',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: borderRadius.md,
    opacity: 0,
    transition: transitions.fast,
  };

  const removeButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '4px',
    right: '4px',
    padding: '4px',
    backgroundColor: theme.semantic.error,
    borderRadius: borderRadius.full,
    border: 'none',
    cursor: 'pointer',
    opacity: 0,
    transition: transitions.fast,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const filenameStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: '0.25rem',
    fontSize: '10px',
    color: '#FFFFFF',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const hintStyle: React.CSSProperties = {
    fontSize: typography.fontSize.xs,
    color: theme.text.tertiary,
    marginTop: '0.75rem',
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h3 style={titleStyle}>
          <span>📁</span>
          Bibliothèque d'images
          <span style={countStyle}>({images.length})</span>
        </h3>

        <button
          onClick={() => fileInputRef.current?.click()}
          style={importButtonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.boxShadow = theme.shadow.md;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Importer
        </button>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => e.target.files && onAddImages(e.target.files)}
          style={{ display: 'none' }}
        />
      </div>

      {/* Content */}
      {images.length === 0 ? (
        <div style={emptyStateStyle}>
          <p style={{ fontSize: typography.fontSize.sm, marginBottom: '0.5rem' }}>
            Importez des images pour personnaliser votre portfolio
          </p>
          <p style={{ fontSize: typography.fontSize.xs }}>
            Glissez-les ensuite sur les zones du portfolio
          </p>
        </div>
      ) : (
        <>
          <div style={gridStyle}>
            {images.map((image) => (
              <div
                key={image.id}
                draggable
                onDragStart={(e) => handleDragStart(e, image)}
                style={imageCardStyle}
                className="library-image-card"
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = theme.accent.primary;
                  const grip = e.currentTarget.querySelector('.grip-indicator') as HTMLElement;
                  const remove = e.currentTarget.querySelector('.remove-button') as HTMLElement;
                  if (grip) grip.style.opacity = '1';
                  if (remove) remove.style.opacity = '1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = theme.border.light;
                  const grip = e.currentTarget.querySelector('.grip-indicator') as HTMLElement;
                  const remove = e.currentTarget.querySelector('.remove-button') as HTMLElement;
                  if (grip) grip.style.opacity = '0';
                  if (remove) remove.style.opacity = '0';
                }}
                onDragEnd={(e) => {
                  e.currentTarget.style.cursor = 'grab';
                }}
              >
                <img src={image.dataUrl} alt={image.filename} style={imageStyle} />

                {/* Grip indicator */}
                <div style={gripIndicatorStyle} className="grip-indicator">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2">
                    <circle cx="9" cy="5" r="1" fill="#FFFFFF" />
                    <circle cx="9" cy="12" r="1" fill="#FFFFFF" />
                    <circle cx="9" cy="19" r="1" fill="#FFFFFF" />
                    <circle cx="15" cy="5" r="1" fill="#FFFFFF" />
                    <circle cx="15" cy="12" r="1" fill="#FFFFFF" />
                    <circle cx="15" cy="19" r="1" fill="#FFFFFF" />
                  </svg>
                </div>

                {/* Remove button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveImage(image.id);
                  }}
                  style={removeButtonStyle}
                  className="remove-button"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#DC2626'; // darker red
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme.semantic.error;
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>

                {/* Filename */}
                <div style={filenameStyle}>{image.filename}</div>
              </div>
            ))}
          </div>

          <p style={hintStyle}>
            💡 Astuce : Glissez les images vers les zones en pointillés du portfolio
          </p>
        </>
      )}
    </div>
  );
};
