/**
 * Portfolio Handlers
 * Gestion des portfolios, projects, mediatheque, social links
 */

function registerPortfolioHandlers(ipcMain, dbManager) {
  
  // ============================================================
  // PORTFOLIOS
  // ============================================================

  ipcMain.handle('portfolio-get-all', async () => {
    try {
      const portfolios = dbManager.portfolio_getAll();
      return { success: true, portfolios };
    } catch (error) {
      console.error('[PORTFOLIO] Erreur récupération portfolios:', error);
      return { success: false, error: error.message, portfolios: [] };
    }
  });

  ipcMain.handle('portfolio-create', async (event, data) => {
    try {
      const result = dbManager.portfolio_create(data);
      return result;
    } catch (error) {
      console.error('[PORTFOLIO] Erreur création portfolio:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('portfolio-update', async (event, { id, updates }) => {
    try {
      const result = dbManager.portfolio_update(id, updates);
      return result;
    } catch (error) {
      console.error('[PORTFOLIO] Erreur mise à jour portfolio:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('portfolio-delete', async (event, id) => {
    try {
      const result = dbManager.portfolio_delete(id);
      return result;
    } catch (error) {
      console.error('[PORTFOLIO] Erreur suppression portfolio:', error);
      return { success: false, error: error.message };
    }
  });

  // ============================================================
  // PROJECTS
  // ============================================================

  ipcMain.handle('portfolio-project-create', async (event, data) => {
    console.log('[PROJECT] Create request:', data.title);
    try {
      const result = dbManager.project_create(data);
      console.log('[PROJECT] Create success:', result);
      return result;
    } catch (error) {
      console.error('[PROJECT] Erreur création projet:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('portfolio-project-get-all', async (event, portfolioId) => {
    console.log('[PROJECT] Get All for:', portfolioId);
    try {
      const projects = dbManager.project_getAll(portfolioId);
      console.log('[PROJECT] Found:', projects?.length);
      return { success: true, projects };
    } catch (error) {
      console.error('[PROJECT] Erreur récupération projets:', error);
      return { success: false, error: error.message, projects: [] };
    }
  });

  ipcMain.handle('portfolio-project-update', async (event, { id, updates }) => {
    try {
      const result = dbManager.project_update(id, updates);
      return result;
    } catch (error) {
      console.error('[PROJECT] Erreur mise à jour projet:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('portfolio-project-delete', async (event, id) => {
    try {
      const result = dbManager.project_delete(id);
      return result;
    } catch (error) {
      console.error('[PROJECT] Erreur suppression projet:', error);
      return { success: false, error: error.message };
    }
  });

  // ============================================================
  // MEDIATHEQUE
  // ============================================================

  ipcMain.handle('mediatheque-add', async (event, data) => {
    try {
      const result = dbManager.mediatheque_add(data);
      return result;
    } catch (error) {
      console.error('[MEDIATHEQUE] Error adding item:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('mediatheque-get-all', async (event, portfolioId) => {
    try {
      const items = dbManager.mediatheque_getAll(portfolioId);
      return items;
    } catch (error) {
      console.error('[MEDIATHEQUE] Error getting items:', error);
      return [];
    }
  });

  ipcMain.handle('mediatheque-delete', async (event, id) => {
    try {
      dbManager.mediatheque_delete(id);
      return { success: true };
    } catch (error) {
      console.error('[MEDIATHEQUE] Error deleting item:', error);
      return { success: false, error: error.message };
    }
  });

  // ============================================================
  // EXTERNAL ACCOUNTS
  // ============================================================

  ipcMain.handle('external-account-add', async (event, data) => {
    try {
      const result = dbManager.externalAccount_add(data);
      return result;
    } catch (error) {
      console.error('[EXTERNAL ACCOUNT] Error adding:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('external-account-get-all', async (event, portfolioId) => {
    try {
      const accounts = dbManager.externalAccount_getAll(portfolioId);
      return accounts;
    } catch (error) {
      console.error('[EXTERNAL ACCOUNT] Error getting:', error);
      return [];
    }
  });

  ipcMain.handle('external-account-update', async (event, { id, updates }) => {
    try {
      const result = dbManager.externalAccount_update(id, updates);
      return result;
    } catch (error) {
      console.error('[EXTERNAL ACCOUNT] Error updating:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('external-account-delete', async (event, id) => {
    try {
      const result = dbManager.externalAccount_delete(id);
      return result;
    } catch (error) {
      console.error('[EXTERNAL ACCOUNT] Error deleting:', error);
      return { success: false, error: error.message };
    }
  });

  console.log('[Portfolio Handlers] ✅ ~52 handlers registered');
}

module.exports = { registerPortfolioHandlers };
