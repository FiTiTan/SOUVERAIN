/**
 * SOUVERAIN V17 - Preload Bridge
 * API exposée au renderer (React) via contextBridge
 */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  // ============================================================
  // IPC GÉNÉRIQUE (pour handlers non spécifiés)
  // ============================================================

  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
  on: (channel, callback) => ipcRenderer.on(channel, (event, ...args) => callback(...args)),
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel),

  // ============================================================
  // SYSTÈME
  // ============================================================

  getSystemStatus: () => ipcRenderer.invoke('get-system-status'),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  openFile: (filePath) => ipcRenderer.invoke('open-file', filePath),
  readFileAsBase64: (filePath) => ipcRenderer.invoke('read-file-base64', filePath),

  // ============================================================
  // ANALYSE CV
  // ============================================================

  analyzeCV: (params) => ipcRenderer.invoke('analyze-cv', params),

  // ============================================================
  // DOCUMENT MANAGEMENT
  // ============================================================

  importCV: () => ipcRenderer.invoke('import-cv'),
  importLinkedIn: (url) => ipcRenderer.invoke('import-linkedin', { url }),
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
    getAvailableMonths: (year) => ipcRenderer.invoke('vault-get-available-months', year),
    getUsedCategories: () => ipcRenderer.invoke('vault-get-used-categories'),

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

    // Anonymisation pour export (tokens comme CV Coach)
    anonymizeForExport: (projectId) => ipcRenderer.invoke('portfolio-anonymize-for-export', { projectId }),

    // Count (pour limite Free)
    countAllProjects: () => ipcRenderer.invoke('portfolio-project-count-all')
  },

  // ============================================================
  // PORTFOLIO V2 (Refonte Universel)
  // ============================================================

  portfolioV2: {
    // Portfolios
    create: (data) => ipcRenderer.invoke('portfolio-v2-create', data),
    getAll: (userId) => ipcRenderer.invoke('portfolio-v2-get-all', userId),
    getById: (id) => ipcRenderer.invoke('portfolio-v2-get-by-id', id),
    update: (id, updates) => ipcRenderer.invoke('portfolio-v2-update', { id, updates }),
    delete: (id) => ipcRenderer.invoke('portfolio-v2-delete', id),
    count: (userId) => ipcRenderer.invoke('portfolio-v2-count', userId),
    saveFile: (portfolioId, fileName, buffer) => ipcRenderer.invoke('portfolio-v2-save-file', { portfolioId, fileName, buffer }),
    generateThumbnail: (filePath, maxWidth, maxHeight) => ipcRenderer.invoke('portfolio-v2-generate-thumbnail', { filePath, maxWidth, maxHeight }),

    // Profils Indépendants
    independant: {
      create: (data) => ipcRenderer.invoke('independant-profile-create', data),
      get: (portfolioId) => ipcRenderer.invoke('independant-profile-get', portfolioId),
      update: (portfolioId, updates) => ipcRenderer.invoke('independant-profile-update', { portfolioId, updates }),
    },

    // Profils Commerce
    commerce: {
      create: (data) => ipcRenderer.invoke('commerce-profile-create', data),
      get: (portfolioId) => ipcRenderer.invoke('commerce-profile-get', portfolioId),
      update: (portfolioId, updates) => ipcRenderer.invoke('commerce-profile-update', { portfolioId, updates }),
    },

    // Assets
    assets: {
      create: (data) => ipcRenderer.invoke('portfolio-asset-create', data),
      getByPortfolio: (portfolioId) => ipcRenderer.invoke('portfolio-asset-get-by-portfolio', portfolioId),
      delete: (id) => ipcRenderer.invoke('portfolio-asset-delete', id),
    },

    // Elements
    elements: {
      create: (data) => ipcRenderer.invoke('portfolio-element-create', data),
      getByPortfolio: (portfolioId) => ipcRenderer.invoke('portfolio-element-get-by-portfolio', portfolioId),
      updateClassification: (id, classification) => ipcRenderer.invoke('portfolio-element-update-classification', { id, classification }),
      delete: (id) => ipcRenderer.invoke('portfolio-element-delete', id),
    },

    // Projects V2
    projects: {
      create: (data) => ipcRenderer.invoke('portfolio-project-v2-create', data),
      getByPortfolio: (portfolioId) => ipcRenderer.invoke('portfolio-project-v2-get-by-portfolio', portfolioId),
      getById: (id) => ipcRenderer.invoke('portfolio-project-v2-get-by-id', id),
      update: (id, updates) => ipcRenderer.invoke('portfolio-project-v2-update', { id, updates }),
      delete: (id) => ipcRenderer.invoke('portfolio-project-v2-delete', id),

      // Project Elements (Liaison)
      addElement: (data) => ipcRenderer.invoke('portfolio-project-element-create', data),
      getElements: (projectId) => ipcRenderer.invoke('portfolio-project-element-get-by-project', projectId),
      updateElement: (projectId, elementId, updates) => ipcRenderer.invoke('portfolio-project-element-update', { projectId, elementId, updates }),
      removeElement: (projectId, elementId) => ipcRenderer.invoke('portfolio-project-element-delete', { projectId, elementId }),
      updateElementsOrder: (projectId, elements) => ipcRenderer.invoke('portfolio-project-element-update-order', { projectId, elements }),
    },

    // External Accounts
    externalAccount: {
      getAll: (portfolioId) => ipcRenderer.invoke('external-accounts-get', portfolioId),
      add: (data) => ipcRenderer.invoke('external-accounts-add', data),
      delete: (id) => ipcRenderer.invoke('external-accounts-delete', id),
    }
  },

  // ============================================================
  // EXTRACTORS (Portfolio V2)
  // ============================================================

  extractors: {
    extractImage: (filePath, options) => ipcRenderer.invoke('extractor-extract-image', { filePath, options }),
    extractPdf: (filePath, options) => ipcRenderer.invoke('extractor-extract-pdf', { filePath, options }),
    extractVideo: (filePath, options) => ipcRenderer.invoke('extractor-extract-video', { filePath, options }),
    extractFile: (filePath, options) => ipcRenderer.invoke('extractor-extract-file', { filePath, options }),
    generateThumbnail: (filePath, outputPath, options) => ipcRenderer.invoke('extractor-generate-thumbnail', { filePath, outputPath, options }),
  },

  // ============================================================
  // OLLAMA (Classification IA Locale)
  // ============================================================

  // ============================================================
  // TEMPLATES (Portfolio Maître V2)
  // ============================================================

  templates: {
    getAll: () => ipcRenderer.invoke('db-templates-get-all'),
    getFree: () => ipcRenderer.invoke('db-templates-get-free'),
    getOwned: () => ipcRenderer.invoke('db-templates-get-owned'),
    getBoutique: () => ipcRenderer.invoke('db-templates-get-boutique'),
    getById: (id) => ipcRenderer.invoke('db-templates-get-by-id', id),
    getHTML: (id) => ipcRenderer.invoke('template-get-html', id),
    purchase: (templateId, amountPaid, isPremiumDiscount) => ipcRenderer.invoke('template-purchase', { templateId, amountPaid, isPremiumDiscount }),
  },

  // ============================================================
  // PORTFOLIO SAVE V2
  // ============================================================

  portfolioSaveV2: (data) => ipcRenderer.invoke('db-save-portfolio-v2', data),

  // ============================================================
  // MEDIATHEQUE (Legacy/Hybrid)
  // ============================================================

  mediatheque: {
    add: (data) => ipcRenderer.invoke('mediatheque-add', data),
    importFiles: (portfolioId) => ipcRenderer.invoke('mediatheque-import-files', portfolioId),
    getAll: (portfolioId) => ipcRenderer.invoke('mediatheque-get-all', portfolioId),
    delete: (id) => ipcRenderer.invoke('mediatheque-delete', id),
  },

  ollama: {
    checkAvailability: () => ipcRenderer.invoke('ollama-check-availability'),
    classifyElement: (request) => ipcRenderer.invoke('ollama-classify-element', request),
  }
});
