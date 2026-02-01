import { useState, useCallback } from 'react';

export interface LibraryImage {
  id: string;
  filename: string;
  dataUrl: string;
}

interface ImageAssignments {
  [key: string]: string | undefined;
}

export const useImageLibrary = (initialAssignments: ImageAssignments = {}) => {
  const [libraryImages, setLibraryImages] = useState<LibraryImage[]>([]);
  const [assignments, setAssignments] = useState<ImageAssignments>(initialAssignments);

  const addImages = useCallback(async (files: FileList) => {
    const newImages: LibraryImage[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!file.type.startsWith('image/')) {
        console.warn(`Fichier ${file.name} ignoré (type non supporté)`);
        continue;
      }
      
      try {
        const dataUrl = await fileToDataUrl(file);
        newImages.push({
          id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${i}`,
          filename: file.name,
          dataUrl,
        });
      } catch (error) {
        console.error(`Erreur lecture ${file.name}:`, error);
      }
    }
    
    setLibraryImages(prev => [...prev, ...newImages]);
  }, []);

  const removeImage = useCallback((id: string) => {
    setLibraryImages(prev => prev.filter(img => img.id !== id));
  }, []);

  const assignImage = useCallback((zone: string, dataUrl: string) => {
    setAssignments(prev => ({ ...prev, [zone]: dataUrl }));
  }, []);

  const removeAssignment = useCallback((zone: string) => {
    setAssignments(prev => {
      const newAssignments = { ...prev };
      delete newAssignments[zone];
      return newAssignments;
    });
  }, []);

  const clearAll = useCallback(() => {
    setLibraryImages([]);
    setAssignments({});
  }, []);

  return {
    libraryImages,
    assignments,
    addImages,
    removeImage,
    assignImage,
    removeAssignment,
    clearAll,
  };
};

// Utilitaire
const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error(`Erreur lecture fichier ${file.name}`));
    reader.readAsDataURL(file);
  });
};
