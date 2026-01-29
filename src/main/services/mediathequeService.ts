import db from '../database';
import type { MediathequeItem } from '../../types/portfolio'; // Assuming MediathequeItem is defined here

export const mediathequeService = {
  /**
   * Crée un nouvel élément dans la médiathèque.
   * @param item Les données de l'élément à créer.
   * @returns L'ID du nouvel élément.
   */
  createMediathequeItem: (item: Omit<MediathequeItem, 'id' | 'createdAt' | 'tags_json' | 'metadata_json'>): { success: boolean; id?: string; error?: string } => {
    try {
      const { portfolioId, file_path, file_type, original_filename, file_size, thumbnail_path, tags, metadata, sourceType, sourcePath } = item;
      const tagsJson = tags ? JSON.stringify(tags) : null;
      const metadataJson = metadata ? JSON.stringify(metadata) : null;
      const stmt = db.prepare(
        `INSERT INTO mediatheque_items (portfolio_id, file_path, file_type, original_filename, file_size, thumbnail_path, tags_json, metadata_json, source_type, source_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      );
      const result = stmt.run(portfolioId, file_path, file_type, original_filename, file_size, thumbnail_path, tagsJson, metadataJson, sourceType, sourcePath);
      return { success: true, id: result.lastInsertRowid.toString() };
    } catch (error: any) {
      console.error('Erreur création MediathequeItem:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Récupère un élément de la médiathèque par son ID.
   * @param id L'ID de l'élément.
   * @returns L'élément de la médiathèque ou undefined.
   */
  getMediathequeItemById: (id: string): MediathequeItem | undefined => {
    try {
      const stmt = db.prepare(`SELECT * FROM mediatheque_items WHERE id = ?`);
      const rawItem = stmt.get(id) as any;
      if (!rawItem) return undefined;

      const item: MediathequeItem = {
        id: rawItem.id.toString(),
        portfolioId: rawItem.portfolio_id.toString(),
        file_path: rawItem.file_path,
        file_type: rawItem.file_type,
        original_filename: rawItem.original_filename,
        file_size: rawItem.file_size,
        thumbnail_path: rawItem.thumbnail_path,
        createdAt: rawItem.created_at,
        sourceType: rawItem.source_type,
        sourcePath: rawItem.source_path,
      };

      if (rawItem.tags_json) item.tags = JSON.parse(rawItem.tags_json);
      if (rawItem.metadata_json) item.metadata = JSON.parse(rawItem.metadata_json);
      
      return item;
    } catch (error) {
      console.error('Erreur récupération MediathequeItem par ID:', error);
      return undefined;
    }
  },

  /**
   * Récupère tous les éléments de la médiathèque pour un portfolio donné.
   * @param portfolioId L'ID du portfolio.
   * @returns Une liste d'éléments de la médiathèque.
   */
  getAllMediathequeItemsByPortfolioId: (portfolioId: string): MediathequeItem[] => {
    try {
      const stmt = db.prepare(`SELECT * FROM mediatheque_items WHERE portfolio_id = ? ORDER BY created_at DESC`);
      const rawItems = stmt.all(portfolioId) as any[];
      return rawItems.map(rawItem => {
        const item: MediathequeItem = {
          id: rawItem.id.toString(),
          portfolioId: rawItem.portfolio_id.toString(),
          file_path: rawItem.file_path,
          file_type: rawItem.file_type,
          original_filename: rawItem.original_filename,
          file_size: rawItem.file_size,
          thumbnail_path: rawItem.thumbnail_path,
          createdAt: rawItem.created_at,
          sourceType: rawItem.source_type,
          sourcePath: rawItem.source_path,
        };
        if (rawItem.tags_json) item.tags = JSON.parse(rawItem.tags_json);
        if (rawItem.metadata_json) item.metadata = JSON.parse(rawItem.metadata_json);
        return item;
      });
    } catch (error) {
      console.error('Erreur récupération MediathequeItems par portfolioId:', error);
      return [];
    }
  },

  /**
   * Met à jour un élément existant de la médiathèque.
   * @param id L'ID de l'élément à mettre à jour.
   * @param updates Les champs à mettre à jour.
   * @returns Succès de l'opération.
   */
  updateMediathequeItem: (id: string, updates: Partial<Omit<MediathequeItem, 'id' | 'createdAt'>>): { success: boolean; error?: string } => {
    try {
      const setClauses: string[] = [];
      const params: any[] = [];

      for (const key in updates) {
        if (Object.prototype.hasOwnProperty.call(updates, key)) {
          const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase(); // camelCase to snake_case
          if (key === 'tags') {
            setClauses.push('tags_json = ?');
            params.push(updates.tags ? JSON.stringify(updates.tags) : null);
          } else if (key === 'metadata') {
            setClauses.push('metadata_json = ?');
            params.push(updates.metadata ? JSON.stringify(updates.metadata) : null);
          } else if (key === 'sourceType') { 
            setClauses.push('source_type = ?');
            params.push((updates as any)[key]);
          } else if (key === 'sourcePath') { 
            setClauses.push('source_path = ?');
            params.push((updates as any)[key]);
          } else if (dbKey !== 'id' && dbKey !== 'created_at' && dbKey !== 'portfolio_id') {
            setClauses.push(`${dbKey} = ?`);
            params.push((updates as any)[key]);
          }
        }
      }

      if (setClauses.length === 0) {
        return { success: true }; // Nothing to update
      }

      params.push(id);
      const stmt = db.prepare(`UPDATE mediatheque_items SET ${setClauses.join(', ')} WHERE id = ?`);
      stmt.run(...params);
      return { success: true };
    } catch (error: any) {
      console.error('Erreur mise à jour MediathequeItem:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Supprime un élément de la médiathèque par son ID.
   * @param id L'ID de l'élément à supprimer.
   * @returns Succès de l'opération.
   */
  deleteMediathequeItem: (id: string): { success: boolean; error?: string } => {
    try {
      const stmt = db.prepare(`DELETE FROM mediatheque_items WHERE id = ?`);
      stmt.run(id);
      return { success: true };
    } catch (error: any) {
      console.error('Erreur suppression MediathequeItem:', error);
      return { success: false, error: error.message };
    }
  },
};
