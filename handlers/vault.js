/**
 * Vault Handlers
 * Gestion du coffre-fort sécurisé (chiffrement AES-256)
 */

const crypto = require('crypto');
const fs = require('fs');
const { dialog } = require('electron');
const { v4: uuidv4 } = require('uuid');

// Clé de chiffrement (devrait être dans .env en production)
const ENCRYPTION_KEY = 'ma_cle_super_secrete_2026_32chars_exactly!!!';
const ALGORITHM = 'aes-256-cbc';

// ============================================================
// ENCRYPTION/DECRYPTION
// ============================================================

function encryptContent(buffer) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  return Buffer.concat([iv, encrypted]).toString('base64');
}

function decryptContent(encryptedData) {
  const buffer = Buffer.from(encryptedData, 'base64');
  const iv = buffer.slice(0, 16);
  const encrypted = buffer.slice(16);
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted;
}

// ============================================================
// REGISTER HANDLERS
// ============================================================

function registerVaultHandlers(ipcMain, dbManager) {
  // Constantes limites Free
  const FREE_MAX_DOCUMENTS = 20;
  const FREE_MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB
  const FREE_MAX_TOTAL_STORAGE = 500 * 1024 * 1024; // 500 MB

  // Récupérer tous les documents
  ipcMain.handle('vault-get-documents', async (event, filters) => {
    try {
      const documents = dbManager.vault_getDocuments(filters || {});
      return { success: true, documents };
    } catch (error) {
      console.error('[VAULT] Erreur récupération documents:', error);
      return { success: false, error: error.message };
    }
  });

  // Ajouter un document
  ipcMain.handle('vault-add-document', async (event, { file, metadata }) => {
    try {
      // Vérifier la limite de documents
      const count = dbManager.vault_countDocuments();
      if (count >= FREE_MAX_DOCUMENTS) {
        return {
          success: false,
          error: 'LIMIT_REACHED',
          message: `Vous avez atteint la limite de ${FREE_MAX_DOCUMENTS} documents en version gratuite.`
        };
      }

      // Vérifier la taille du fichier
      if (file.size > FREE_MAX_FILE_SIZE) {
        return {
          success: false,
          error: 'FILE_TOO_LARGE',
          message: 'Fichier trop volumineux. Taille maximale : 25 MB en version gratuite.'
        };
      }

      // Vérifier le stockage total
      const totalStorage = dbManager.vault_getTotalStorage();
      if (totalStorage + file.size > FREE_MAX_TOTAL_STORAGE) {
        return {
          success: false,
          error: 'STORAGE_LIMIT_REACHED',
          message: 'Espace de stockage insuffisant. Limite : 500 MB en version gratuite.'
        };
      }

      // Chiffrer le contenu
      const fileBuffer = Buffer.from(file.buffer);
      const encryptedContent = encryptContent(fileBuffer);

      const document = {
        id: uuidv4(),
        name: metadata.name,
        category: metadata.category,
        file_type: metadata.file_type,
        file_size: file.size,
        encrypted_content: encryptedContent,
        thumbnail: metadata.thumbnail || null,
        tags: metadata.tags || [],
        notes: metadata.notes || '',
        document_date: metadata.document_date || null,
        is_favorite: 0
      };

      const result = dbManager.vault_addDocument(document);

      if (result.success) {
        return {
          success: true,
          document: {
            id: document.id,
            name: document.name,
            category: document.category,
            file_type: document.file_type,
            file_size: document.file_size,
            tags: document.tags,
            notes: document.notes,
            is_favorite: false,
            created_at: new Date().toISOString()
          }
        };
      }

      return result;
    } catch (error) {
      console.error('[VAULT] Erreur ajout document:', error);
      return { success: false, error: error.message };
    }
  });

  // Récupérer un document par ID
  ipcMain.handle('vault-get-document', async (event, id) => {
    try {
      const doc = dbManager.vault_getDocumentById(id);
      if (!doc) {
        return { success: false, error: 'Document non trouvé' };
      }
      return { success: true, document: doc };
    } catch (error) {
      console.error('[VAULT] Erreur récupération document:', error);
      return { success: false, error: error.message };
    }
  });

  // Mettre à jour un document
  ipcMain.handle('vault-update-document', async (event, { id, updates }) => {
    try {
      const result = dbManager.vault_updateDocument(id, updates);
      return result;
    } catch (error) {
      console.error('[VAULT] Erreur mise à jour document:', error);
      return { success: false, error: error.message };
    }
  });

  // Supprimer un document
  ipcMain.handle('vault-delete-document', async (event, id) => {
    try {
      const result = dbManager.vault_deleteDocument(id);
      return result;
    } catch (error) {
      console.error('[VAULT] Erreur suppression document:', error);
      return { success: false, error: error.message };
    }
  });

  // Télécharger un document (déchiffrer et retourner)
  ipcMain.handle('vault-download-document', async (event, id) => {
    try {
      const doc = dbManager.vault_getDocumentById(id);
      if (!doc) {
        return { success: false, error: 'Document non trouvé' };
      }

      // Déchiffrer le contenu
      const decryptedBuffer = decryptContent(doc.encrypted_content);

      // Dialogue de sauvegarde
      const { canceled, filePath } = await dialog.showSaveDialog({
        title: "Télécharger le document",
        defaultPath: doc.name,
        filters: [{ name: 'All Files', extensions: ['*'] }]
      });

      if (canceled || !filePath) {
        return { success: false, error: 'Annulé par l\'utilisateur' };
      }

      // Sauvegarder le fichier déchiffré
      fs.writeFileSync(filePath, decryptedBuffer);

      return { success: true, path: filePath };
    } catch (error) {
      console.error('[VAULT] Erreur téléchargement document:', error);
      return { success: false, error: error.message };
    }
  });

  // Compter les documents
  ipcMain.handle('vault-count-documents', async () => {
    try {
      const count = dbManager.vault_countDocuments();
      return { success: true, count };
    } catch (error) {
      console.error('[VAULT] Erreur comptage documents:', error);
      return { success: false, error: error.message, count: 0 };
    }
  });

  // Calculer le stockage total
  ipcMain.handle('vault-get-total-storage', async () => {
    try {
      const totalBytes = dbManager.vault_getTotalStorage();
      return { success: true, totalBytes };
    } catch (error) {
      console.error('[VAULT] Erreur calcul stockage:', error);
      return { success: false, error: error.message, totalBytes: 0 };
    }
  });

  // Obtenir les années disponibles
  ipcMain.handle('vault-get-available-years', async () => {
    try {
      const years = dbManager.vault_getAvailableYears();
      return { success: true, years };
    } catch (error) {
      console.error('[VAULT] Erreur récupération années:', error);
      return { success: false, error: error.message, years: [] };
    }
  });

  // Obtenir les mois disponibles
  ipcMain.handle('vault-get-available-months', async (event, year) => {
    try {
      const months = dbManager.vault_getAvailableMonths(year);
      return { success: true, months };
    } catch (error) {
      console.error('[VAULT] Erreur récupération mois:', error);
      return { success: false, error: error.message, months: [] };
    }
  });

  // Obtenir les catégories utilisées
  ipcMain.handle('vault-get-used-categories', async () => {
    try {
      const categories = dbManager.vault_getUsedCategories();
      return { success: true, categories };
    } catch (error) {
      console.error('[VAULT] Erreur récupération catégories utilisées:', error);
      return { success: false, error: error.message, categories: [] };
    }
  });

  // Ajouter une catégorie personnalisée
  ipcMain.handle('vault-add-category', async (event, category) => {
    try {
      const result = dbManager.vault_addCategory(category);
      return result;
    } catch (error) {
      console.error('[VAULT] Erreur ajout catégorie:', error);
      return { success: false, error: error.message };
    }
  });

  // Récupérer les catégories personnalisées
  ipcMain.handle('vault-get-categories', async () => {
    try {
      const categories = dbManager.vault_getCategories();
      return { success: true, categories };
    } catch (error) {
      console.error('[VAULT] Erreur récupération catégories:', error);
      return { success: false, error: error.message, categories: [] };
    }
  });

  // Compter les catégories personnalisées
  ipcMain.handle('vault-count-categories', async () => {
    try {
      const count = dbManager.vault_countCategories();
      return { success: true, count };
    } catch (error) {
      console.error('[VAULT] Erreur comptage catégories:', error);
      return { success: false, error: error.message, count: 0 };
    }
  });

  // Supprimer une catégorie personnalisée
  ipcMain.handle('vault-delete-category', async (event, id) => {
    try {
      const result = dbManager.vault_deleteCategory(id);
      return result;
    } catch (error) {
      console.error('[VAULT] Erreur suppression catégorie:', error);
      return { success: false, error: error.message };
    }
  });

  console.log('[Vault Handlers] ✅ 15 handlers registered');
}

module.exports = { registerVaultHandlers };
