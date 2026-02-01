/**
 * SOUVERAIN - Image Placeholder
 * Zone droppable avec placeholder SVG stylé
 */

import React, { useState, useRef } from 'react';
import { useTheme } from '../../ThemeContext';
import { typography, borderRadius, transitions } from '../../design-system';

// ============================================================
// TYPES
// ============================================================

interface ImagePlaceholderProps {
  type: 'hero' | 'about' | 'project';
  label?: string;
  currentImage?: string;
  onImageDrop: (dataUrl: string) => void;
  onImageRemove?: () => void;
}

// ============================================================
// COMPONENT
// ============================================================

export const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({
  type,
  label,
  currentImage,
  onImageDrop,
  onImageRemove,
}) => {
  const { theme } = useTheme();
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ============================================================
  // DRAG & DROP HANDLERS
  // ============================================================

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    // Vérifier si c'est une image de la bibliothèque (dataUrl)
    const imageDataUrl = e.dataTransfer.getData('imageDataUrl');
    if (imageDataUrl) {
      onImageDrop(imageDataUrl);
      return;
    }

    // Sinon, c'est un fichier droppé directement
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        onImageDrop(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClick = () => {
    if (!currentImage) {
      fileInputRef.current?.click();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file?.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        onImageDrop(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // ============================================================
  // DIMENSIONS SELON TYPE
  // ============================================================

  const getDimensions = () => {
    switch (type) {
      case 'hero':
        return { width: '100%', height: '300px' };
      case 'about':
        return { width: '200px', height: '200px', borderRadius: '50%' };
      case 'project':
        return { width: '100%', height: '180px' };
    }
  };

  const dimensions = getDimensions();

  // ============================================================
  // STYLES
  // ============================================================

  const placeholderStyle: React.CSSProperties = {
    ...dimensions,
    border: `2px dashed ${isDragOver ? theme.accent.primary : theme.border.default}`,
    borderRadius: type === 'about' ? '50%' : borderRadius.lg,
    backgroundColor: isDragOver ? theme.accent.muted : theme.bg.tertiary,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    cursor: 'pointer',
    transition: transitions.fast,
    transform: isDragOver ? 'scale(1.02)' : 'scale(1)',
    position: 'relative',
  };

  const imageContainerStyle: React.CSSProperties = {
    ...dimensions,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: type === 'about' ? '50%' : borderRadius.lg,
  };

  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  };

  const overlayStyle: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    opacity: 0,
    transition: transitions.fast,
  };

  const buttonStyle: React.CSSProperties = {
    padding: '0.5rem 1rem',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    borderRadius: borderRadius.lg,
    border: 'none',
    cursor: 'pointer',
    transition: transitions.fast,
  };

  const changeButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: '#FFFFFF',
    color: theme.text.primary,
  };

  const removeButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    backgroundColor: theme.semantic.error,
    color: '#FFFFFF',
  };

  // ============================================================
  // RENDER - Image assignée
  // ============================================================

  if (currentImage) {
    return (
      <div style={imageContainerStyle} className="image-placeholder-with-image">
        <img src={currentImage} alt={label || 'Image'} style={imageStyle} />

        {/* Overlay au hover */}
        <div
          style={overlayStyle}
          className="image-placeholder-overlay"
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0';
          }}
        >
          <button
            onClick={() => fileInputRef.current?.click()}
            style={changeButtonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            Changer
          </button>

          {onImageRemove && (
            <button
              onClick={onImageRemove}
              style={removeButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              Supprimer
            </button>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>
    );
  }

  // ============================================================
  // RENDER - Placeholder vide
  // ============================================================

  const iconSize = type === 'about' ? 48 : 64;
  const iconColor = isDragOver ? theme.accent.primary : theme.border.default;

  return (
    <div
      style={placeholderStyle}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
    >
      {/* Icône SVG */}
      <svg
        viewBox="0 0 48 48"
        style={{ width: iconSize, height: iconSize, color: iconColor, transition: transitions.fast }}
      >
        <rect
          x="4"
          y="4"
          width="40"
          height="40"
          rx="4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="4,4"
        />
        <circle cx="16" cy="16" r="4" fill="currentColor" opacity="0.5" />
        <path d="M8 36 L18 24 L26 32 L34 22 L40 30 L40 36 Z" fill="currentColor" opacity="0.5" />
        <path d="M24 18 L24 30 M18 24 L30 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>

      {/* Label */}
      <span
        style={{
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.medium,
          color: isDragOver ? theme.accent.primary : theme.text.secondary,
          transition: transitions.fast,
        }}
      >
        {isDragOver ? 'Déposez ici' : label || 'Glissez une image'}
      </span>

      <span
        style={{
          fontSize: typography.fontSize.xs,
          color: theme.text.tertiary,
        }}
      >
        ou cliquez pour parcourir
      </span>

      {/* Input file caché */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
    </div>
  );
};
