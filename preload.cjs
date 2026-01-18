/**
 * SOUVERAIN V17 - Preload Bridge
 * API exposée au renderer (React) via contextBridge
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  // ============================================================
  // SYSTÈME
  // ============================================================

  getSystemStatus: () => ipcRenderer.invoke('get-system-status'),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),

  // ============================================================
  // ANALYSE CV
  // ============================================================

  analyzeCV: (params) => ipcRenderer.invoke('analyze-cv', params),

  // ============================================================
  // DOCUMENT MANAGEMENT
  // ============================================================

  importCV: () => ipcRenderer.invoke('import-cv'),
  saveToVault: (data) => ipcRenderer.invoke('save-to-vault', data),
  loadHistory: () => ipcRenderer.invoke('load-history'),
  getAnalysisById: (id) => ipcRenderer.invoke('get-analysis-by-id', id),
  savePDF: (buffer) => ipcRenderer.invoke('save-pdf', buffer),

  // ============================================================
  // VAULT (Coffre-Fort)
  // ============================================================

  vault: {
    getDocuments: (filters) => ipcRenderer.invoke('vault-get-documents', filters),
    getDocument: (id) => ipcRenderer.invoke('vault-get-document', id),
    addDocument: (file, metadata) => ipcRenderer.invoke('vault-add-document', { file, metadata }),
    updateDocument: (id, updates) => ipcRenderer.invoke('vault-update-document', { id, updates }),
    deleteDocument: (id) => ipcRenderer.invoke('vault-delete-document', id),
    downloadDocument: (id) => ipcRenderer.invoke('vault-download-document', id),
    countDocuments: () => ipcRenderer.invoke('vault-count-documents'),
    getTotalStorage: () => ipcRenderer.invoke('vault-get-total-storage'),
    getAvailableYears: () => ipcRenderer.invoke('vault-get-available-years'),

    // Catégories personnalisées
    addCategory: (category) => ipcRenderer.invoke('vault-add-category', category),
    getCategories: () => ipcRenderer.invoke('vault-get-categories'),
    countCategories: () => ipcRenderer.invoke('vault-count-categories'),
    deleteCategory: (id) => ipcRenderer.invoke('vault-delete-category', id)
  },

  // ============================================================
  // PORTFOLIO
  // ============================================================

  portfolio: {
    // Portfolios
    getAll: () => ipcRenderer.invoke('portfolio-get-all'),
    getById: (id) => ipcRenderer.invoke('portfolio-get-by-id', id),
    create: (data) => ipcRenderer.invoke('portfolio-create', data),
    update: (id, updates) => ipcRenderer.invoke('portfolio-update', { id, updates }),
    delete: (id) => ipcRenderer.invoke('portfolio-delete', id),
    count: () => ipcRenderer.invoke('portfolio-count'),

    // Sections
    updateSection: (id, content) => ipcRenderer.invoke('portfolio-section-update', { id, content }),
    toggleSectionVisibility: (id, isVisible) => ipcRenderer.invoke('portfolio-section-toggle-visibility', { id, isVisible }),
    reorderSections: (portfolioId, orders) => ipcRenderer.invoke('portfolio-section-reorder', { portfolioId, orders }),

    // Projets
    createProject: (project) => ipcRenderer.invoke('portfolio-project-create', project),
    getAllProjects: (portfolioId) => ipcRenderer.invoke('portfolio-project-get-all', portfolioId),
    getProjectById: (id) => ipcRenderer.invoke('portfolio-project-get-by-id', id),
    updateProject: (id, updates) => ipcRenderer.invoke('portfolio-project-update', { id, updates }),
    deleteProject: (id) => ipcRenderer.invoke('portfolio-project-delete', id),
    reorderProjects: (portfolioId, orders) => ipcRenderer.invoke('portfolio-project-reorder', { portfolioId, orders }),

    // Sources (GitHub, Dribbble, etc.)
    connectSource: (type, credentials) => ipcRenderer.invoke('portfolio-source-connect', { type, credentials }),
    disconnectSource: (sourceId) => ipcRenderer.invoke('portfolio-source-disconnect', sourceId),
    getSources: () => ipcRenderer.invoke('portfolio-source-get-all'),

    // Import
    fetchGitHubRepos: (sourceId) => ipcRenderer.invoke('portfolio-fetch-github-repos', sourceId),
    importFromLocal: () => ipcRenderer.invoke('portfolio-import-local'),

    // Analysis
    analyzeProject: (sourceData, sourceType) => ipcRenderer.invoke('portfolio-analyze-project', { sourceData, sourceType }),
    regenerateSection: (projectId, section) => ipcRenderer.invoke('portfolio-regenerate-section', { projectId, section }),

    // Ghost Mode
    detectSensitiveEntities: (projectId) => ipcRenderer.invoke('portfolio-detect-sensitive-entities', { projectId }),
    applyGhostMode: (projectId, mappings, enabled) => ipcRenderer.invoke('portfolio-apply-ghost-mode', { projectId, mappings, enabled }),

    // Count (pour limite Free)
    countAllProjects: () => ipcRenderer.invoke('portfolio-project-count-all')
  }
});
