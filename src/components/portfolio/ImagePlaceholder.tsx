import React, { useState, useRef, useCallback } from 'react';
import { useTheme } from '../../ThemeContext';

interface ImagePlaceholderProps {
  type: 'hero' | 'about' | 'project';
  label?: string;
  currentImage?: string;
  onImageDrop: (dataUrl: string) => void;
  onImageRemove?: () => void;
  disabled?: boolean;
}

export const ImagePlaceholder = React.memo<ImagePlaceholderProps>(({
  type,
  label,
  currentImage,
  onImageDrop,
  onImageRemove,
  disabled = false,
}) => {
  const theme = useTheme();
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    if (disabled) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const processImageFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      console.warn('Fichier non supporté:', file.type);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onImageDrop(reader.result as string);
    };
    reader.onerror = () => {
      console.error('Erreur lecture fichier');
    };
    reader.readAsDataURL(file);
  }, [onImageDrop]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    if (disabled) return;
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
    if (file) {
      processImageFile(file);
    }
  }, [disabled, onImageDrop, processImageFile]);

  const handleClick = useCallback(() => {
    if (disabled) return;
    fileInputRef.current?.click();
  }, [disabled]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  }, [processImageFile]);

  // Styles selon le type
  const sizeClasses = {
    hero: 'w-full h-[300px] md:h-[400px]',
    about: 'w-[200px] h-[200px] rounded-full',
    project: 'w-full h-[180px]',
  };

  // Si une image est assignée, l'afficher
  if (currentImage) {
    return (
      <div 
        className={`relative ${sizeClasses[type]} overflow-hidden group`}
        role="img"
        aria-label={label || 'Image'}
      >
        <img 
          src={currentImage} 
          alt={label || 'Image'} 
          className="w-full h-full object-cover"
          loading="lazy"
        />
        
        {/* Overlay au hover pour changer/supprimer */}
        {!disabled && (
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2"
            style={{ backgroundColor: `${theme.background.primary}CC` }}
          >
            <button
              onClick={handleClick}
              className="px-3 py-1 rounded-full text-sm font-medium transition-colors"
              style={{
                backgroundColor: theme.background.tertiary,
                color: theme.text.primary,
              }}
              aria-label="Changer l'image"
            >
              Changer
            </button>
            {onImageRemove && (
              <button
                onClick={onImageRemove}
                className="px-3 py-1 rounded-full text-sm font-medium transition-colors"
                style={{
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                }}
                aria-label="Supprimer l'image"
              >
                Supprimer
              </button>
            )}
          </div>
        )}
        
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          aria-label="Sélectionner un fichier image"
        />
      </div>
    );
  }

  // Placeholder vide
  return (
    <div
      className={`
        ${sizeClasses[type]}
        border-2 border-dashed
        flex flex-col items-center justify-center gap-3
        ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
        transition-all
      `}
      style={{
        borderColor: isDragOver ? theme.accent.primary : theme.border.default,
        backgroundColor: isDragOver ? `${theme.accent.primary}10` : theme.background.secondary,
        borderRadius: theme.borderRadius.lg,
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      role="button"
      tabIndex={disabled ? -1 : 0}
      aria-label={`Zone de dépôt pour ${label || 'image'}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Icône SVG */}
      <svg 
        viewBox="0 0 48 48" 
        style={{ 
          width: type === 'about' ? '48px' : '64px', 
          height: type === 'about' ? '48px' : '64px',
          color: isDragOver ? theme.accent.primary : theme.text.secondary,
        }}
        className="transition-colors"
        aria-hidden="true"
      >
        <rect 
          x="4" y="4" width="40" height="40" rx="4" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeDasharray="4,4"
        />
        <circle cx="16" cy="16" r="4" fill="currentColor" opacity="0.5"/>
        <path 
          d="M8 36 L18 24 L26 32 L34 22 L40 30 L40 36 Z" 
          fill="currentColor" 
          opacity="0.5"
        />
        <path 
          d="M24 18 L24 30 M18 24 L30 24" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round"
        />
      </svg>

      {/* Label */}
      <span 
        className="text-sm font-medium"
        style={{ color: isDragOver ? theme.accent.primary : theme.text.secondary }}
      >
        {isDragOver ? 'Déposez ici' : label || 'Glissez une image'}
      </span>
      <span 
        className="text-xs"
        style={{ color: theme.text.secondary, opacity: 0.7 }}
      >
        ou cliquez pour parcourir
      </span>

      {/* Input file caché */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Sélectionner une image"
      />
    </div>
  );
});

ImagePlaceholder.displayName = 'ImagePlaceholder';
