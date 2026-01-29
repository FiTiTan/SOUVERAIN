import type { MediathequeItem, ImportSourceType } from '../types/portfolio'; // Assuming MediathequeItem is defined here

// Extend the Window interface to include the electron API
declare global {
  interface Window {
    electron: {
      mediatheque: {
        createItem: (item: Omit<MediathequeItem, 'id' | 'createdAt'>) => Promise<{ success: boolean; id?: string; error?: string }>;
        getItemById: (id: string) => Promise<MediathequeItem | undefined>;
        getAllItemsByPortfolioId: (portfolioId: string) => Promise<MediathequeItem[]>;
        updateItem: (id: string, updates: Partial<Omit<MediathequeItem, 'id' | 'createdAt'>>) => Promise<{ success: boolean; error?: string }>;
        deleteItem: (id: string) => Promise<{ success: boolean; error?: string }>;
      };
      fileSystem: {
        saveMediathequeFile: (portfolioId: string, fileName: string, fileBuffer: ArrayBuffer, fileType: string) => Promise<{ success: boolean; filePath?: string; thumbnailPath?: string; error?: string }>;
        deleteMediathequeFile: (filePath: string) => Promise<{ success: boolean; error?: string }>;
      };
    };
  }
}

/**
 * Service API pour interagir avec le module Mediatheque du processus principal.
 * Encapsule les appels IPC pour la gestion des éléments de la médiathèque.
 */

// Function to import a file into the Mediatheque
export const importFileIntoMediatheque = async (
  portfolioId: string,
  file: File,
  sourceType: ImportSourceType,
  sourcePath: string // Original path of the file
): Promise<{ success: boolean; item?: MediathequeItem; error?: string }> => {
  try {
    // 1. Read the file content as an ArrayBuffer
    const fileBuffer = await file.arrayBuffer();

    // 2. Save the file to local storage via IPC
    const saveResult = await window.electron.fileSystem.saveMediathequeFile(
      portfolioId,
      file.name,
      fileBuffer,
      file.type || 'application/octet-stream' // Pass file.type
    );

    if (!saveResult.success || !saveResult.filePath) {
      return { success: false, error: saveResult.error || 'Failed to save file to disk.' };
    }

    // 3. Create the mediatheque item entry in the database
    const newItem: Omit<MediathequeItem, 'id' | 'createdAt'> = {
      portfolioId,
      file_path: saveResult.filePath,
      file_type: file.type || 'application/octet-stream',
      original_filename: file.name,
      file_size: file.size,
      thumbnail_path: saveResult.thumbnailPath || '', // Use generated thumbnail path
      tags: [],
      metadata: {},
      sourceType,
      sourcePath,
    };

    const result = await window.electron.mediatheque.createItem(newItem);

    if (result.success && result.id) {
      return { success: true, item: { ...newItem, id: result.id, createdAt: new Date().toISOString() } as MediathequeItem };
    } else {
      // If DB creation fails, attempt to delete the saved file
      await window.electron.fileSystem.deleteMediathequeFile(saveResult.filePath);
      return { success: false, error: result.error || 'Failed to create mediatheque item in DB.' };
    }
  } catch (error: any) {
    console.error('Error importing file into mediatheque:', error);
    return { success: false, error: error.message };
  }
};

export const getMediathequeItem = async (id: string): Promise<MediathequeItem | undefined> => {
  return window.electron.mediatheque.getItemById(id);
};

export const getAllMediathequeItems = async (portfolioId: string): Promise<MediathequeItem[]> => {
  return window.electron.mediatheque.getAllItemsByPortfolioId(portfolioId);
};

export const updateMediathequeItem = async (id: string, updates: Partial<Omit<MediathequeItem, 'id' | 'createdAt'>>): Promise<{ success: boolean; error?: string }> => {
  return window.electron.mediatheque.updateItem(id, updates);
};

export const deleteMediathequeItem = async (id: string): Promise<{ success: boolean; error?: string }> => {
  const itemToDelete = await getMediathequeItem(id);
  if (!itemToDelete) {
    return { success: false, error: 'Mediatheque item not found.' };
  }
  
  // 1. Delete file from disk
  if (itemToDelete.file_path) {
    const deleteFileResult = await window.electron.fileSystem.deleteMediathequeFile(itemToDelete.file_path);
    if (!deleteFileResult.success) {
      console.warn('Failed to delete file from disk:', itemToDelete.file_path, deleteFileResult.error);
      // Continue to delete DB entry even if file deletion fails, or return error?
      // For now, let's proceed with DB deletion but log warning.
    }
  }

  // 2. Delete item from DB
  return window.electron.mediatheque.deleteItem(id);
};
