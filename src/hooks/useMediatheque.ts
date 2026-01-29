import { useState, useEffect, useCallback } from 'react';
import type { MediathequeItem } from '../types/portfolio';

export type { MediathequeItem };

export const useMediatheque = (portfolioId: string | undefined) => {
    const [items, setItems] = useState<MediathequeItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchItems = useCallback(async () => {
        if (!portfolioId) return;
        setLoading(true);
        try {
            // @ts-ignore
            const result = await window.electron.mediatheque.getAll(portfolioId);
            if (result.success) {
                setItems(result.items);
            } else {
                setError(result.error);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [portfolioId]);

    const importFiles = async () => {
        if (!portfolioId) return { success: false, error: 'No portfolio ID' };
        try {
            // @ts-ignore
            const result = await window.electron.mediatheque.importFiles(portfolioId);
            if (result.success) {
                fetchItems();
                return { success: true, count: result.items?.length };
            } else if (result.cancelled) {
                 return { success: false, cancelled: true };
            } else {
                return { success: false, error: result.error };
            }
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    };
    
    // Legacy single add kept for compatibility if needed, but importedFiles preferred
    const addItem = async (file: File) => {
       console.warn("addItem via File object blocked by Electron security. Use importFiles instead.");
       return { success: false, error: "Use system dialog import" };
    };

    const deleteItem = async (id: string) => {
        try {
            // @ts-ignore
            const result = await window.electron.mediatheque.delete(id);
            if (result.success) {
                setItems(prev => prev.filter(i => i.id !== id));
                return { success: true };
            } else {
                return { success: false, error: result.error };
            }
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    };

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const addDroppedFiles = async (files: File[]) => {
        if (!portfolioId) return { success: false, error: 'No portfolio ID' };
        let count = 0;
        let errors = [];

        for (const file of files) {
             try {
                // @ts-ignore
                const filePath = file.path; 
                if (!filePath) {
                    errors.push(`Path missing for ${file.name}`);
                    continue;
                }

                const id = crypto.randomUUID();
                
                let type = 'document';
                if (file.type.startsWith('image/')) type = 'image';
                if (file.type.startsWith('video/')) type = 'video';
                if (file.type === 'application/pdf') type = 'pdf';

                const itemData = {
                    id,
                    portfolioId,
                    filePath,
                    fileType: type,
                    originalFilename: file.name,
                    fileSize: file.size,
                    thumbnailPath: null,
                    tags: [],
                    metadata: {}
                };

                // @ts-ignore
                const result = await window.electron.mediatheque.add(itemData);
                if (result.success) count++;
                else errors.push(`${file.name}: ${result.error}`);

            } catch (err: any) {
                errors.push(`${file.name}: ${err.message}`);
            }
        }

        fetchItems();
        return { success: errors.length === 0, count, errors };
    };

    return {
        items,
        loading,
        error,
        fetchItems,
        addItem,
        importFiles,
        addDroppedFiles,
        deleteItem
    };
};
