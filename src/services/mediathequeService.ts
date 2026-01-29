import { MediathequeItem } from '../hooks/useMediatheque';

// Service pour la gestion de la médiathèque (Phase 2 Master Plan)
export const mediathequeService = {
    // Import de fichiers via dialogue système
    importFiles: async (portfolioId: string): Promise<{ success: boolean; count?: number; error?: string; cancelled?: boolean }> => {
        try {
            // @ts-ignore
            const result = await window.electron.mediatheque.importFiles(portfolioId);
            return result;
        } catch (e: any) {
            return { success: false, error: e.message };
        }
    },

    // Récupérer tous les items
    getAll: async (portfolioId: string): Promise<{ success: boolean; items: MediathequeItem[]; error?: string }> => {
        try {
            // @ts-ignore
            const result = await window.electron.mediatheque.getAll(portfolioId);
            return result;
        } catch (e: any) {
            return { success: false, items: [], error: e.message };
        }
    },

    // Supprimer un item
    deleteItem: async (id: string): Promise<{ success: boolean; error?: string }> => {
        try {
            // @ts-ignore
            const result = await window.electron.mediatheque.delete(id);
            return result;
        } catch (e: any) {
            return { success: false, error: e.message };
        }
    },

    // Ajouter manuellement (Drag & Drop)
    add: async (data: any): Promise<{ success: boolean; error?: string }> => {
        try {
            // @ts-ignore
            const result = await window.electron.mediatheque.add(data);
            return result;
        } catch (e: any) {
            return { success: false, error: e.message };
        }
    }
};
