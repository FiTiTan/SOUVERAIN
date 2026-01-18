/**
 * SOUVERAIN V17 - Main Process
 * 100% Cloud via Groq - Analyse CV Premium
 */

require('dotenv').config();

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { PDFExtract } = require('pdf.js-extract');
const dbManager = require('./database.cjs');
const { AnonymizerGroq } = require('./anonymizer.cjs');
const { GroqClient } = require('./groq-client.cjs');

const pdfExtract = new PDFExtract();
let groqClient = null;

// ============================================================
// CONFIGURATION
// ============================================================

const GROQ_API_KEY = process.env.GROQ_API_KEY;

// Validation de la clé API
if (!GROQ_API_KEY) {
  console.error('[SOUVERAIN] ERREUR CRITIQUE: GROQ_API_KEY non trouvée dans le fichier .env');
  console.error('[SOUVERAIN] Veuillez créer un fichier .env avec : GROQ_API_KEY=votre_clé');
  process.exit(1);
}

// ============================================================
// WINDOW CREATION
// ============================================================

function createWindow() {
  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    backgroundColor: '#0A0A0B',
    title: "SOUVERAIN",
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false
    }
  });

  if (app.isPackaged) {
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));
  } else {
    win.loadURL('http://localhost:5173');
  }

  return win;
}

// ============================================================
// IPC HANDLERS
// ============================================================

// Récupérer le status système
ipcMain.handle('get-system-status', async () => {
  const groqStatus = groqClient ? await groqClient.testConnection() : { valid: false };

  return {
    groq: groqStatus,
    ready: groqStatus.valid
  };
});

// Ouvrir un lien externe dans le navigateur par défaut
ipcMain.handle('open-external', async (event, url) => {
  const { shell } = require('electron');
  try {
    await shell.openExternal(url);
    return { success: true };
  } catch (error) {
    console.error('[SOUVERAIN] Erreur ouverture lien externe:', error);
    return { success: false, error: error.message };
  }
});

// ============================================================
// ANALYSE CV - WORKFLOW PRINCIPAL
// ============================================================

ipcMain.handle('analyze-cv', async (event, { cvText, filename }) => {
  const startTime = Date.now();

  if (!groqClient) {
    return {
      success: false,
      error: 'Client Groq non initialisé'
    };
  }

  console.log('[SOUVERAIN] Analyse démarrée...');

  try {
    // 1. Anonymisation via Groq LLM
    const axiosClient = axios.create({
      baseURL: 'https://api.groq.com/openai/v1',
      headers: { 
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });
    
    const anonymizer = new AnonymizerGroq({ client: axiosClient });
    
    const { anonymized, stats } = await anonymizer.anonymize(cvText);
    
    console.log(`[SOUVERAIN] Anonymisation: ${stats.totalMasked} éléments masqués`);
    console.log(`[SOUVERAIN] Données protégées:`, anonymizer.getMappings());
    
    // 2. Analyse Coach CV via Groq
    const groqResult = await groqClient.analyzeCV(anonymized);
    
    if (!groqResult.success) {
      throw new Error(groqResult.error);
    }

    // 3. Réincrémentation
    const finalResult = anonymizer.deanonymize(groqResult.result);

    const totalLatency = Date.now() - startTime;
    console.log(`[SOUVERAIN] Analyse terminée en ${totalLatency}ms`);

    return {
      success: true,
      result: finalResult,
      latency: totalLatency,
      anonymizationStats: stats,
      protectedData: anonymizer.getMappings(),
      anonymizedPreview: anonymized.substring(0, 500),
      tokens: groqResult.tokens
    };

  } catch (error) {
    console.error('[SOUVERAIN] Erreur:', error.message);
    return {
      success: false,
      error: error.message,
      latency: Date.now() - startTime
    };
  }
});

// Import CV
ipcMain.handle('import-cv', async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: "Charger un CV",
    filters: [{ name: 'Documents', extensions: ['pdf', 'txt'] }],
    properties: ['openFile']
  });

  if (canceled || !filePaths.length) return null;

  const filePath = filePaths[0];
  const ext = path.extname(filePath).toLowerCase();

  try {
    let text;
    if (ext === '.pdf') {
      const data = await pdfExtract.extract(filePath);
      text = data.pages
        .map(p => p.content.map(i => i.str).join(' '))
        .join('\n')
        .replace(/\s+/g, ' ')
        .trim();
    } else {
      text = fs.readFileSync(filePath, 'utf-8');
    }

    return { text, filename: path.basename(filePath), charCount: text.length };
  } catch (err) {
    return { error: `Erreur lecture: ${err.message}` };
  }
});

// Sauvegarder dans le Vault
ipcMain.handle('save-to-vault', async (e, data) => {
  try {
    return dbManager.saveFullAnalysis(data.filename, data.raw, data.result);
  } catch (err) {
    return { error: err.message };
  }
});

// Charger l'historique
ipcMain.handle('load-history', async () => {
  try {
    return dbManager.getHistory();
  } catch {
    return [];
  }
});

// Récupérer une analyse par ID
ipcMain.handle('get-analysis-by-id', async (event, id) => {
  try {
    return dbManager.getAnalysisById(id);
  } catch (error) {
    console.error('[MAIN] Erreur récupération analyse:', error);
    return null;
  }
});

// Sauvegarder PDF
ipcMain.handle('save-pdf', async (e, buffer) => {
  const { canceled, filePath } = await dialog.showSaveDialog({
    title: "Exporter le rapport",
    defaultPath: `SOUVERAIN_Rapport_${Date.now()}.pdf`,
    filters: [{ name: 'PDF', extensions: ['pdf'] }]
  });

  if (canceled || !filePath) return { success: false };

  try {
    fs.writeFileSync(filePath, Buffer.from(buffer));
    return { success: true, path: filePath };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// ============================================================
// VAULT HANDLERS
// ============================================================

const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

// Fonction de chiffrement AES-256
function encryptContent(buffer) {
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(GROQ_API_KEY, 'salt', 32); // Dériver une clé de 32 bytes
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);

  // Retourner IV + données chiffrées
  return Buffer.concat([iv, encrypted]);
}

// Fonction de déchiffrement AES-256
function decryptContent(encryptedBuffer) {
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(GROQ_API_KEY, 'salt', 32);

  const iv = encryptedBuffer.slice(0, 16);
  const encrypted = encryptedBuffer.slice(16);

  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

  return decrypted;
}

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
    // Constantes limites Free
    const FREE_MAX_DOCUMENTS = 20;
    const FREE_MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB
    const FREE_MAX_TOTAL_STORAGE = 500 * 1024 * 1024; // 500 MB

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

// ============================================================
// PORTFOLIO HANDLERS
// ============================================================

// Récupérer tous les portfolios
ipcMain.handle('portfolio-get-all', async () => {
  try {
    const portfolios = dbManager.portfolio_getAll();
    return { success: true, portfolios };
  } catch (error) {
    console.error('[PORTFOLIO] Erreur récupération portfolios:', error);
    return { success: false, error: error.message, portfolios: [] };
  }
});

// Récupérer un portfolio par ID avec ses sections
ipcMain.handle('portfolio-get-by-id', async (event, id) => {
  try {
    const portfolio = dbManager.portfolio_getById(id);
    if (!portfolio) {
      return { success: false, error: 'Portfolio introuvable' };
    }
    return { success: true, portfolio };
  } catch (error) {
    console.error('[PORTFOLIO] Erreur récupération portfolio:', error);
    return { success: false, error: error.message };
  }
});

// Créer un portfolio avec ses 7 sections par défaut
ipcMain.handle('portfolio-create', async (event, data) => {
  try {
    // Vérifier la limite Free (1 portfolio max)
    const count = dbManager.portfolio_count();
    const FREE_MAX_PORTFOLIOS = 1;

    if (count >= FREE_MAX_PORTFOLIOS) {
      return {
        success: false,
        error: 'LIMIT_REACHED',
        message: 'Limite de portfolios atteinte en version gratuite (1 portfolio max).'
      };
    }

    // Créer le portfolio
    const result = dbManager.portfolio_create(data);

    return result;
  } catch (error) {
    console.error('[PORTFOLIO] Erreur création portfolio:', error);
    return { success: false, error: error.message };
  }
});

// Mettre à jour un portfolio
ipcMain.handle('portfolio-update', async (event, { id, updates }) => {
  try {
    const result = dbManager.portfolio_update(id, updates);
    return result;
  } catch (error) {
    console.error('[PORTFOLIO] Erreur mise à jour portfolio:', error);
    return { success: false, error: error.message };
  }
});

// Supprimer un portfolio
ipcMain.handle('portfolio-delete', async (event, id) => {
  try {
    const result = dbManager.portfolio_delete(id);
    return result;
  } catch (error) {
    console.error('[PORTFOLIO] Erreur suppression portfolio:', error);
    return { success: false, error: error.message };
  }
});

// Compter les portfolios
ipcMain.handle('portfolio-count', async () => {
  try {
    const count = dbManager.portfolio_count();
    return { success: true, count };
  } catch (error) {
    console.error('[PORTFOLIO] Erreur comptage portfolios:', error);
    return { success: false, error: error.message, count: 0 };
  }
});

// Mettre à jour une section
ipcMain.handle('portfolio-section-update', async (event, { id, content }) => {
  try {
    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    const result = dbManager.portfolio_section_update(id, contentStr);
    return result;
  } catch (error) {
    console.error('[PORTFOLIO] Erreur mise à jour section:', error);
    return { success: false, error: error.message };
  }
});

// Toggle visibilité d'une section
ipcMain.handle('portfolio-section-toggle-visibility', async (event, { id, isVisible }) => {
  try {
    const result = dbManager.portfolio_section_toggleVisibility(id, isVisible);
    return result;
  } catch (error) {
    console.error('[PORTFOLIO] Erreur toggle visibilité section:', error);
    return { success: false, error: error.message };
  }
});

// Réorganiser les sections
ipcMain.handle('portfolio-section-reorder', async (event, { portfolioId, orders }) => {
  try {
    const result = dbManager.portfolio_section_reorder(portfolioId, orders);
    return result;
  } catch (error) {
    console.error('[PORTFOLIO] Erreur réorganisation sections:', error);
    return { success: false, error: error.message };
  }
});

// Créer un projet
ipcMain.handle('portfolio-project-create', async (event, project) => {
  try {
    const result = dbManager.portfolio_project_create(project);
    return result;
  } catch (error) {
    console.error('[PORTFOLIO] Erreur création projet:', error);
    return { success: false, error: error.message };
  }
});

// Récupérer tous les projets d'un portfolio
ipcMain.handle('portfolio-project-get-all', async (event, portfolioId) => {
  try {
    const projects = dbManager.portfolio_project_getAll(portfolioId);
    return { success: true, projects };
  } catch (error) {
    console.error('[PORTFOLIO] Erreur récupération projets:', error);
    return { success: false, error: error.message, projects: [] };
  }
});

// Récupérer un projet par ID
ipcMain.handle('portfolio-project-get-by-id', async (event, id) => {
  try {
    const project = dbManager.portfolio_project_getById(id);
    if (!project) {
      return { success: false, error: 'Projet introuvable' };
    }
    return { success: true, project };
  } catch (error) {
    console.error('[PORTFOLIO] Erreur récupération projet:', error);
    return { success: false, error: error.message };
  }
});

// Mettre à jour un projet
ipcMain.handle('portfolio-project-update', async (event, { id, updates }) => {
  try {
    const result = dbManager.portfolio_project_update(id, updates);
    return result;
  } catch (error) {
    console.error('[PORTFOLIO] Erreur mise à jour projet:', error);
    return { success: false, error: error.message };
  }
});

// Supprimer un projet
ipcMain.handle('portfolio-project-delete', async (event, id) => {
  try {
    const result = dbManager.portfolio_project_delete(id);
    return result;
  } catch (error) {
    console.error('[PORTFOLIO] Erreur suppression projet:', error);
    return { success: false, error: error.message };
  }
});

// Réorganiser les projets
ipcMain.handle('portfolio-project-reorder', async (event, { portfolioId, orders }) => {
  try {
    const result = dbManager.portfolio_project_reorder(portfolioId, orders);
    return result;
  } catch (error) {
    console.error('[PORTFOLIO] Erreur réorganisation projets:', error);
    return { success: false, error: error.message };
  }
});

// ============================================================
// PORTFOLIO SOURCES
// ============================================================

ipcMain.handle('portfolio-source-connect', async (event, { type, credentials }) => {
  try {
    const { v4: uuidv4 } = require('uuid');
    const sourceId = uuidv4();

    if (type === 'github') {
      // Tester connexion GitHub
      const GitHubScraper = require('./scrapers/github-scraper.cjs');
      const scraper = new GitHubScraper(credentials.accessToken);
      const test = await scraper.testConnection();

      if (!test.success) {
        return { success: false, error: 'Token GitHub invalide' };
      }

      // Sauvegarder source
      const result = dbManager.portfolio_source_create({
        id: sourceId,
        type: 'github',
        username: test.username,
        access_token: credentials.accessToken
      });

      if (result.success) {
        return { success: true, sourceId, username: test.username };
      }
      return result;
    }

    return { success: false, error: 'Type de source non supporté' };
  } catch (err) {
    console.error('[IPC] portfolio-source-connect error:', err.message);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('portfolio-source-disconnect', async (event, sourceId) => {
  try {
    return dbManager.portfolio_source_delete(sourceId);
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('portfolio-source-get-all', async () => {
  try {
    const sources = dbManager.portfolio_source_getAll();
    // Ne pas exposer les tokens au renderer
    return sources.map(s => ({
      id: s.id,
      type: s.type,
      username: s.username,
      connected_at: s.connected_at,
      last_synced: s.last_synced
    }));
  } catch (err) {
    return [];
  }
});

// ============================================================
// PORTFOLIO IMPORT
// ============================================================

ipcMain.handle('portfolio-fetch-github-repos', async (event, sourceId) => {
  try {
    const source = dbManager.portfolio_source_getById(sourceId);
    if (!source || source.type !== 'github') {
      return { success: false, error: 'Source GitHub introuvable' };
    }

    const GitHubScraper = require('./scrapers/github-scraper.cjs');
    const scraper = new GitHubScraper(source.access_token);
    const repos = await scraper.fetchRepos(source.username);

    return { success: true, repos };
  } catch (err) {
    console.error('[IPC] portfolio-fetch-github-repos error:', err.message);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('portfolio-import-local', async () => {
  try {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: 'Sélectionner un dossier de projet',
      properties: ['openDirectory']
    });

    if (canceled || !filePaths.length) return { success: false, canceled: true };

    const LocalScraper = require('./scrapers/local-scraper.cjs');
    const scraper = new LocalScraper();
    const projectData = await scraper.scanFolder(filePaths[0]);

    return { success: true, project: projectData };
  } catch (err) {
    console.error('[IPC] portfolio-import-local error:', err.message);
    return { success: false, error: err.message };
  }
});

// ============================================================
// PORTFOLIO PROJECT ANALYSIS
// ============================================================

ipcMain.handle('portfolio-analyze-project', async (event, { sourceData, sourceType }) => {
  try {
    const ProjectAnalyzer = require('./services/project-analyzer.cjs');
    const analyzer = new ProjectAnalyzer(GROQ_API_KEY);

    // Si GitHub, enrichir avec détails
    if (sourceType === 'github' && sourceData.full_name) {
      const [owner, repo] = sourceData.full_name.split('/');
      const source = dbManager.portfolio_source_getAll().find(s => s.type === 'github');

      if (source) {
        const GitHubScraper = require('./scrapers/github-scraper.cjs');
        const scraper = new GitHubScraper(source.access_token);
        const details = await scraper.fetchRepoDetails(owner, repo);

        sourceData.readme = details.readme;
        sourceData.languages = details.languages;
      }
    }

    const result = await analyzer.analyzeProject(sourceData, sourceType);
    return result;
  } catch (err) {
    console.error('[IPC] portfolio-analyze-project error:', err.message);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('portfolio-regenerate-section', async (event, { projectId, section }) => {
  try {
    const project = dbManager.portfolio_project_getById(projectId);
    if (!project) {
      return { success: false, error: 'Projet introuvable' };
    }

    const ProjectAnalyzer = require('./services/project-analyzer.cjs');
    const analyzer = new ProjectAnalyzer(GROQ_API_KEY);

    const result = await analyzer.regenerateSection(project, section);
    return result;
  } catch (err) {
    console.error('[IPC] portfolio-regenerate-section error:', err.message);
    return { success: false, error: err.message };
  }
});

// ============================================================
// PORTFOLIO GHOST MODE
// ============================================================

ipcMain.handle('portfolio-detect-sensitive-entities', async (event, { projectId }) => {
  try {
    const project = dbManager.portfolio_project_getById(projectId);
    if (!project) {
      return { success: false, error: 'Projet introuvable' };
    }

    // Concaténer tous les textes du projet
    const textToAnalyze = [
      project.pitch || '',
      project.challenge || '',
      project.solution || ''
    ].join('\n\n');

    // Utiliser AnonymizerGroq pour détecter les entités
    const { AnonymizerGroq } = require('./anonymizer.cjs');
    const axiosClient = axios.create({
      baseURL: 'https://api.groq.com/openai/v1',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });

    const anonymizer = new AnonymizerGroq({ client: axiosClient });

    const result = await anonymizer.anonymize(textToAnalyze);

    if (result.success) {
      // Extraire les mappings détectés
      const mappings = [];
      for (const [original, replacement] of Object.entries(result.mappings || {})) {
        mappings.push({ original, replacement });
      }

      return {
        success: true,
        mappings,
        anonymizedText: result.anonymizedText
      };
    }

    return { success: false, error: 'Erreur détection entités' };
  } catch (err) {
    console.error('[IPC] portfolio-detect-sensitive-entities error:', err.message);
    return { success: false, error: err.message };
  }
});

ipcMain.handle('portfolio-apply-ghost-mode', async (event, { projectId, mappings, enabled }) => {
  try {
    const project = dbManager.portfolio_project_getById(projectId);
    if (!project) {
      return { success: false, error: 'Projet introuvable' };
    }

    // Appliquer les remplacements sur chaque section
    let pitch = project.pitch || '';
    let challenge = project.challenge || '';
    let solution = project.solution || '';

    if (enabled) {
      // Appliquer les remplacements
      mappings.forEach(({ original, replacement }) => {
        const regex = new RegExp(original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
        pitch = pitch.replace(regex, replacement);
        challenge = challenge.replace(regex, replacement);
        solution = solution.replace(regex, replacement);
      });
    }

    // Sauvegarder les modifications
    const result = dbManager.portfolio_project_update(projectId, {
      pitch,
      challenge,
      solution,
      is_ghost_mode: enabled ? 1 : 0,
      ghost_replacements: JSON.stringify(mappings)
    });

    return result;
  } catch (err) {
    console.error('[IPC] portfolio-apply-ghost-mode error:', err.message);
    return { success: false, error: err.message };
  }
});

// ============================================================
// PORTFOLIO PROJECT COUNT (pour limite Free)
// ============================================================

ipcMain.handle('portfolio-project-count-all', async () => {
  try {
    // Compter tous les projets de tous les portfolios
    const allPortfolios = dbManager.portfolio_getAll();
    let totalCount = 0;

    for (const portfolio of allPortfolios) {
      const projects = dbManager.portfolio_project_getAll(portfolio.id);
      totalCount += projects.length;
    }

    return totalCount;
  } catch (err) {
    console.error('[IPC] portfolio-project-count-all error:', err.message);
    return 0;
  }
});

// ============================================================
// APP LIFECYCLE
// ============================================================

app.whenReady().then(async () => {
  // Initialiser Groq
  groqClient = new GroqClient(GROQ_API_KEY);
  console.log('[SOUVERAIN] Groq Cloud initialisé');

  // Créer la fenêtre
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
