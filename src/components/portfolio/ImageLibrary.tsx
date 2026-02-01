import React, { useRef, useCallback } from 'react';
import { X, Plus, GripVertical } from 'lucide-react';
import { useTheme } from '../../ThemeContext';

export interface LibraryImage {
  id: string;
  filename: string;
  dataUrl: string;
}

interface ImageLibraryProps {
  images: LibraryImage[];
  onAddImages: (files: FileList) => void;
  onRemoveImage: (id: string) => void;
}

export const ImageLibrary = React.memo<ImageLibraryProps>(({
  images,
  onAddImages,
  onRemoveImage,
}) => {
  const theme = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragStart = useCallback((e: React.DragEvent, image: LibraryImage) => {
    e.dataTransfer.setData('imageId', image.id);
    e.dataTransfer.setData('imageDataUrl', image.dataUrl);
    e.dataTransfer.effectAllowed = 'copy';
    
    // Créer une image de prévisualisation pour le drag
    const dragImage = new Image();
    dragImage.src = image.dataUrl;
    dragImage.width = 100;
    dragImage.height = 100;
    e.dataTransfer.setDragImage(dragImage, 50, 50);
  }, []);

  const handleImportClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onAddImages(files);
      // Reset input pour permettre de re-sélectionner les mêmes fichiers
      e.target.value = '';
    }
  }, [onAddImages]);

  return (
    <div 
      className="border-t p-4"
      style={{
        backgroundColor: theme.background.primary,
        borderColor: theme.border.default,
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 
          className="text-sm font-semibold flex items-center gap-2"
          style={{ color: theme.text.primary }}
        >
          <span aria-hidden="true">📁</span>
          <span>Bibliothèque d'images</span>
          <span 
            className="font-normal"
            style={{ color: theme.text.secondary }}
          >
            ({images.length})
          </span>
        </h3>
        
        <button
          onClick={handleImportClick}
          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors"
          style={{
            backgroundColor: theme.accent.primary,
            color: '#FFFFFF',
          }}
          aria-label="Importer des images"
        >
          <Plus size={16} aria-hidden="true" />
          <span>Importer</span>
        </button>
        
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          aria-label="Sélectionner des images à importer"
        />
      </div>

      {images.length === 0 ? (
        <div 
          className="text-center py-8"
          style={{ color: theme.text.secondary }}
        >
          <p className="text-sm">Importez des images pour personnaliser votre portfolio</p>
          <p className="text-xs mt-1" style={{ opacity: 0.7 }}>
            Glissez-les ensuite sur les zones du portfolio
          </p>
        </div>
      ) : (
        <div 
          className="flex gap-3 overflow-x-auto pb-2"
          role="list"
          aria-label="Liste des images importées"
        >
          {images.map((image) => (
            <LibraryImageCard
              key={image.id}
              image={image}
              onDragStart={(e) => handleDragStart(e, image)}
              onRemove={() => onRemoveImage(image.id)}
            />
          ))}
        </div>
      )}
      
      <p 
        className="text-xs mt-2"
        style={{ color: theme.text.secondary, opacity: 0.7 }}
      >
        💡 Astuce : Glissez les images vers les zones en pointillés du portfolio
      </p>
    </div>
  );
});

ImageLibrary.displayName = 'ImageLibrary';

// Sous-composant pour éviter re-renders de toute la liste
interface LibraryImageCardProps {
  image: LibraryImage;
  onDragStart: (e: React.DragEvent) => void;
  onRemove: () => void;
}

const LibraryImageCard = React.memo<LibraryImageCardProps>(({
  image,
  onDragStart,
  onRemove,
}) => {
  const theme = useTheme();

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden cursor-grab active:cursor-grabbing group border-2 transition-colors"
      style={{
        borderColor: theme.border.default,
      }}
      role="listitem"
      tabIndex={0}
      aria-label={`Image ${image.filename}, glissez pour placer dans le portfolio`}
      onKeyDown={(e) => {
        if (e.key === 'Delete' || e.key === 'Backspace') {
          e.preventDefault();
          onRemove();
        }
      }}
    >
      <img
        src={image.dataUrl}
        alt={image.filename}
        className="w-full h-full object-cover"
        loading="lazy"
      />
      
      {/* Indicateur drag */}
      <div 
        className="absolute top-1 left-1 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: `${theme.background.primary}80` }}
        aria-hidden="true"
      >
        <GripVertical size={12} style={{ color: theme.text.inverse }} />
      </div>
      
      {/* Bouton supprimer */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-1 right-1 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        style={{
          backgroundColor: '#DC2626',
        }}
        aria-label={`Supprimer ${image.filename}`}
      >
        <X size={12} style={{ color: '#FFFFFF' }} />
      </button>
      
      {/* Nom du fichier */}
      <div 
        className="absolute bottom-0 left-0 right-0 px-1 py-0.5"
        style={{ backgroundColor: `${theme.background.primary}99` }}
      >
        <p 
          className="text-[10px] truncate"
          style={{ color: theme.text.primary }}
          title={image.filename}
        >
          {image.filename}
        </p>
      </div>
    </div>
  );
});

LibraryImageCard.displayName = 'LibraryImageCard';
