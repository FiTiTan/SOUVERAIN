/**
 * SOUVERAIN V17 - Main Process
 * 100% Cloud via Groq - Analyse CV Premium
 */

require('dotenv').config();

const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { PDFExtract } = require('pdf.js-extract');
const dbManager = require('./database.cjs');
const { Anonymizer, AnonymizerGroq } = require('./anonymizer.cjs');
const { GroqClient } = require('./groq-client.cjs');
const { LinkedInScraper } = require('./linkedin-scraper.cjs');
const sharp = require('sharp');
const os = require('os');

// Handler modules
const { registerVaultHandlers } = require('./handlers/vault.cjs');
const { registerPortfolioHandlers } = require('./handlers/portfolio.cjs');
const { registerCVHandlers } = require('./handlers/cv.cjs');

const pdfExtract = new PDFExtract();
let groqClient = null;
let linkedInScraper = null;

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
      backgroundThrottling: false,
      webSecurity: false // Autoriser le chargement de fichiers locaux (file://)
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

// FIX BUG 2: Ouvrir un fichier local avec l'application par défaut
ipcMain.handle('open-file', async (event, filePath) => {
  const { shell } = require('electron');
  try {
    console.log('[SOUVERAIN] 🔵 Ouverture fichier:', filePath);
    const result = await shell.openPath(filePath);
    if (result) {
      // shell.openPath retourne une string vide si succès, un message d'erreur sinon
      console.error('[SOUVERAIN] ❌ Erreur ouverture fichier:', result);
      return { success: false, error: result };
    }
    console.log('[SOUVERAIN] ✅ Fichier ouvert avec succès');
    return { success: true };
  } catch (error) {
    console.error('[SOUVERAIN] ❌ Exception ouverture fichier:', error);
    return { success: false, error: error.message };
  }
});

// File dialog handler pour sélection de fichiers
ipcMain.handle('file-open-dialog', async (event, options) => {
  try {
    const result = await dialog.showOpenDialog(mainWindow, options);
    return result;
  } catch (error) {
    console.error('[SOUVERAIN] ❌ Erreur file dialog:', error);
    return { canceled: true, filePaths: [] };
  }
});

// ============================================================
// IMAGE PROCESSING - PORTFOLIO WIZARD
// ============================================================

// Image specs for portfolio (selon BRIEF-MPF-FORMULAIRE-V2.md)
const IMAGE_SPECS = {
  hero: { maxWidth: 2560, maxHeight: 1440, quality: 85, maxSizeMB: 5 },
  about: { maxWidth: 800, maxHeight: 800, quality: 85, maxSizeMB: 2 },
  project: { maxWidth: 1600, maxHeight: 1200, quality: 80, maxSizeMB: 3 },
  general: { maxWidth: 1920, maxHeight: 1080, quality: 80, maxSizeMB: 3 },
};

// Handler: Save file temporarily in temp directory
ipcMain.handle('file-save-temp', async (event, { fileName, buffer }) => {
  try {
    const tempDir = os.tmpdir();
    const tempPath = path.join(tempDir, 'souverain-uploads');

    // Create temp directory if doesn't exist
    if (!fs.existsSync(tempPath)) {
      fs.mkdirSync(tempPath, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const ext = path.extname(fileName);
    const baseName = path.basename(fileName, ext);
    const uniqueFileName = `${baseName}_${timestamp}${ext}`;
    const filePath = path.join(tempPath, uniqueFileName);

    // Write buffer to file
    fs.writeFileSync(filePath, Buffer.from(buffer));

    console.log('[SOUVERAIN] ✅ Fichier temporaire créé:', filePath);
    return { success: true, path: filePath };
  } catch (error) {
    console.error('[SOUVERAIN] ❌ Erreur sauvegarde temporaire:', error);
    return { success: false, error: error.message };
  }
});

// Handler: Process image (resize, compress, optimize)
ipcMain.handle('process-image', async (event, { filePath, type = 'general' }) => {
  try {
    console.log('[SOUVERAIN] 🖼️  Traitement image:', filePath, 'Type:', type);

    const spec = IMAGE_SPECS[type] || IMAGE_SPECS.general;
    const stats = fs.statSync(filePath);
    const originalSizeMB = stats.size / (1024 * 1024);

    let image = sharp(filePath);
    const metadata = await image.metadata();

    const result = {
      original: {
        width: metadata.width,
        height: metadata.height,
        sizeMB: originalSizeMB.toFixed(2),
        format: metadata.format,
      },
      processed: null,
      wasProcessed: false,
      warnings: [],
    };

    const needsResize = metadata.width > spec.maxWidth || metadata.height > spec.maxHeight;
    const needsCompress = originalSizeMB > spec.maxSizeMB;

    if (needsResize || needsCompress) {
      result.wasProcessed = true;

      // Resize if needed
      if (needsResize) {
        image = image.resize(spec.maxWidth, spec.maxHeight, {
          fit: 'inside',
          withoutEnlargement: true,
        });
        result.warnings.push(
          `Redimensionnée (${metadata.width}×${metadata.height} → max ${spec.maxWidth}×${spec.maxHeight})`
        );
      }

      // Generate output path
      const ext = path.extname(filePath);
      const outputPath = filePath.replace(ext, '_optimized.webp');

      // Convert to WebP and compress
      await image.webp({ quality: spec.quality }).toFile(outputPath);

      const newStats = fs.statSync(outputPath);
      const newMetadata = await sharp(outputPath).metadata();

      result.processed = {
        path: outputPath,
        width: newMetadata.width,
        height: newMetadata.height,
        sizeMB: (newStats.size / (1024 * 1024)).toFixed(2),
        format: 'webp',
      };

      if (needsCompress) {
        result.warnings.push(
          `Compressée (${originalSizeMB.toFixed(1)}MB → ${result.processed.sizeMB}MB)`
        );
      }

      console.log('[SOUVERAIN] ✅ Image optimisée:', outputPath);
    } else {
      // No processing needed
      result.processed = {
        path: filePath,
        width: metadata.width,
        height: metadata.height,
        sizeMB: originalSizeMB.toFixed(2),
        format: metadata.format,
      };
      console.log('[SOUVERAIN] ℹ️  Image OK, aucune modification nécessaire');
    }

    return result;
  } catch (error) {
    console.error('[SOUVERAIN] ❌ Erreur traitement image:', error);
    throw error;
  }
});

// ============================================================
// HANDLERS LEGACY - DISABLED (now in modular handlers/)
// ============================================================
// These handlers are now in handlers/cv.js, handlers/vault.js, handlers/portfolio.js
// They are loaded via registerXXXHandlers() in app.whenReady()
// Keeping them here commented for reference during testing phase
// TODO: Delete after successful testing

// ============================================================
// ANALYSE CV - DISABLED (now in handlers/cv.js)
// ============================================================


// ============================================================
// VAULT HANDLERS - DISABLED (now in handlers/vault.js)
// ============================================================


// ============================================================
// PORTFOLIO HANDLERS (HUB V2) - DISABLED (now in handlers/portfolio.js)
// ============================================================


// ============================================================
// PORTFOLIO SOURCES (ACTIVE - not yet modularized)
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

// --- GROQ PORTFOLIO AI ---

ipcMain.handle('init-groq-client', async (event, apiKey) => {
  try {
    groqClient = new GroqClient(apiKey);
    const test = await groqClient.testConnection();
    return { success: test.valid, error: test.error };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Compilation Vision (MPF-4)
ipcMain.handle('groq-compile-vision', async (event, { analysisData, portfolioId }) => {
  if (!groqClient) {
    // Tentative de récupération depuis ENV si non init manuellement
    if (process.env.GROQ_API_KEY) {
      groqClient = new GroqClient(process.env.GROQ_API_KEY);
    } else {
      return { success: false, error: 'Groq client non initialisé. Configurez votre clé API.' };
    }
  }

  console.log('[GROQ] Compiling Portfolio Vision...');
  // Utilise analyzePortfolioStyle qui correspond à la logique "Vision" (Style + Sector + Analysis)
  return groqClient.analyzePortfolioStyle(analysisData);
});

// Génération Contenu (MPF-5)
// OBSOLETE V1 - Remplacé par groqEnrichmentService.ts (V2)
// ipcMain.handle('groq-generate-portfolio-content', async (event, { visionContext, style, anonymizedText, projectsCount }) => {
//   if (!groqClient) {
//     if (process.env.GROQ_API_KEY) {
//       groqClient = new GroqClient(process.env.GROQ_API_KEY);
//     } else {
//       return { success: false, error: 'Groq client non initialisé.' };
//     }
//   }
//   console.log('[GROQ] Generating Portfolio Content...');
//   return groqClient.generatePortfolioContent({
//     visionContext,
//     style,
//     anonymizedText,
//     structure: visionContext.suggestedSections || ['hero', 'about', 'services', 'contact']
//   });
// });



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

// OBSOLETE V1 - Plus utilisé avec le nouveau système de génération V2
// ipcMain.handle('portfolio-regenerate-section', async (event, { projectId, section }) => {
//   try {
//     const project = dbManager.portfolio_project_getById(projectId);
//     if (!project) {
//       return { success: false, error: 'Projet introuvable' };
//     }
//     const ProjectAnalyzer = require('./services/project-analyzer.cjs');
//     const analyzer = new ProjectAnalyzer(GROQ_API_KEY);
//     const result = await analyzer.regenerateSection(project, section);
//     return result;
//   } catch (err) {
//     console.error('[IPC] portfolio-regenerate-section error:', err.message);
//     return { success: false, error: err.message };
//   }
// });

// ============================================================
// PORTFOLIO GHOST MODE
// ============================================================
// IPC HANDLERS - PORTFOLIO IDENTITY & SOCIALS (Sprint)
// ============================================================

// Update Identity (Bio, Name, Tagline)
ipcMain.handle('portfolio-update-identity', async (event, { id, authorName, authorBio, tagline }) => {
  try {
    const stmt = dbManager.db.prepare(`
      UPDATE portfolios 
      SET author_name = ?, author_bio = ?, tagline = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
    const res = stmt.run(authorName, authorBio, tagline, id);
    return { success: res.changes > 0 };
  } catch (err) {
    console.error('[Identity] Update Error:', err);
    return { success: false, error: err.message };
  }
});

// Update Style
ipcMain.handle('portfolio-update-style', async (event, { id, styleId }) => {
  try {
    const stmt = dbManager.db.prepare('UPDATE portfolios SET selected_style = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    const res = stmt.run(styleId, id);
    return { success: res.changes > 0 };
  } catch (err) {
    console.error('[Style] Update Error:', err);
    return { success: false, error: err.message };
  }
});

// Get Socials
ipcMain.handle('external-accounts-get', async (event, portfolioId) => {
  try {
    const rows = dbManager.db.prepare(`
      SELECT * FROM external_accounts 
      WHERE portfolio_id = ? 
      ORDER BY display_order ASC
    `).all(portfolioId);
    
    // Map to TS interface
    return rows.map(r => ({
      id: r.id,
      portfolioId: r.portfolio_id,
      platform: r.platform_type,
      url: r.account_url,
      username: r.account_username,
      isPrimary: Boolean(r.is_primary),
      displayOrder: r.display_order
    }));
  } catch (err) {
    console.error('[Socials] Get Error:', err);
    return [];
  }
});

// Add Social
ipcMain.handle('external-accounts-add', async (event, account) => {
  try {
    const crypto = require('crypto');
    const newId = crypto.randomUUID();
    
    // Get max order
    const maxOrder = dbManager.db.prepare('SELECT MAX(display_order) as maxVal FROM external_accounts WHERE portfolio_id = ?').get(account.portfolioId);
    const order = (maxOrder.maxVal || 0) + 1;

    dbManager.db.prepare(`
      INSERT INTO external_accounts (id, portfolio_id, platform_type, account_url, account_username, is_primary, display_order)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(newId, account.portfolioId, account.platform, account.url, account.username, account.isPrimary ? 1 : 0, order);

    return { success: true, id: newId };
  } catch (err) {
    console.error('[Socials] Add Error:', err);
    return { success: false, error: err.message };
  }
});

// Delete Social
ipcMain.handle('external-accounts-delete', async (event, id) => {
  try {
    dbManager.db.prepare('DELETE FROM external_accounts WHERE id = ?').run(id);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

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

// Anonymiser pour export (avec tokens comme CV Coach)
ipcMain.handle('portfolio-anonymize-for-export', async (event, { projectId }) => {
  try {
    const project = dbManager.portfolio_project_getById(projectId);
    if (!project) {
      return { success: false, error: 'Projet introuvable' };
    }

    // Concaténer tous les textes du projet
    const sections = {
      pitch: project.pitch || '',
      challenge: project.challenge || '',
      solution: project.solution || ''
    };

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

    // Anonymiser chaque section
    const anonymizedSections = {};
    for (const [key, text] of Object.entries(sections)) {
      const result = await anonymizer.anonymize(text);
      if (result.success) {
        anonymizedSections[key] = result.anonymizedText;
      } else {
        anonymizedSections[key] = text; // Fallback au texte original
      }
    }

    return {
      success: true,
      anonymizedSections
    };
  } catch (err) {
    console.error('[IPC] portfolio-anonymize-for-export error:', err.message);
    return { success: false, error: err.message };
  }
});

// ============================================================
// PORTFOLIO V2 - LOCAL ANONYMIZATION (Restored)
// ============================================================

// Anonymisation Locale (BERT) pour Portfolio (Vitesse + Privacy)
ipcMain.handle('anonymize-text-local', async (event, { text, portfolioId }) => {
  try {
     const { Anonymizer } = require('./anonymizer.cjs');
     const anonymizer = new Anonymizer();
     await anonymizer.init(); // Charger le modèle BERT

     const result = await anonymizer.anonymize(text);
     
     // Adapter le format de réponse pour le frontend
     const entitiesDetected = {
        people: result.entities.filter(e => e.type === 'person').map(e => e.text),
        companies: result.entities.filter(e => e.type === 'organization').map(e => e.text),
        emails: result.entities.filter(e => e.type === 'email').map(e => e.text),
        phones: result.entities.filter(e => e.type === 'phone').map(e => e.text),
        locations: result.entities.filter(e => e.type === 'location').map(e => e.text),
        amounts: [],
        addresses: [],
     };

     return {
        originalText: text,
        anonymizedText: result.anonymized,
        mappings: Object.entries(result.mappings).map(([original, token]) => ({ original, replacement: token })),
        entitiesDetected
     };

  } catch (err) {
    console.error('[IPC] anonymize-text-local error:', err.message);
    return { 
        originalText: text, 
        anonymizedText: text, 
        mappings: [], 
        entitiesDetected: { people:[], companies:[], emails:[], phones:[], amounts:[], addresses:[], locations:[] } 
    };
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
// PORTFOLIO V2 - HANDLERS
// ============================================================

// Portfolios
// [REMOVED] Legacy portfolio-v2-create handler

// [REMOVED] Legacy/Duplicate portfolio-v2 handlers referencing non-existent methods (fixed startup crash)


// --- PROJECTS (Hub V2 / Wizard) ---

ipcMain.handle('project-create', async (event, data) => {
  try {
      if (!data.id) data.id = require('crypto').randomUUID();
      return dbManager.project_create(data);
  } catch (err) {
      return { success: false, error: err.message };
  }
});

ipcMain.handle('project-get-all', async (event, portfolioId) => {
  try {
      const projects = dbManager.project_getAll(portfolioId);
      return { success: true, projects };
  } catch (error) {
       console.error(error);
      return { success: false, error: error.message, projects: [] };
  }
});

ipcMain.handle('project-update', async (event, { id, updates }) => {
  try {
      return dbManager.project_update(id, updates);
  } catch (err) {
      return { success: false, error: err.message };
  }
});

ipcMain.handle('project-delete', async (event, id) => {
  try {
      return dbManager.project_delete(id);
  } catch (err) {
      return { success: false, error: err.message };
  }
});

// Profils Indépendants
ipcMain.handle('independant-profile-create', async (event, data) => {
  try {
    return dbManager.independantProfile_create(data);
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('independant-profile-get', async (event, portfolioId) => {
  try {
    return dbManager.independantProfile_getByPortfolioId(portfolioId);
  } catch (err) {
    return null;
  }
});

ipcMain.handle('independant-profile-update', async (event, { portfolioId, updates }) => {
  try {
    return dbManager.independantProfile_update(portfolioId, updates);
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Profils Commerce
ipcMain.handle('commerce-profile-create', async (event, data) => {
  try {
    return dbManager.commerceProfile_create(data);
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('commerce-profile-get', async (event, portfolioId) => {
  try {
    return dbManager.commerceProfile_getByPortfolioId(portfolioId);
  } catch (err) {
    return null;
  }
});

ipcMain.handle('commerce-profile-update', async (event, { portfolioId, updates }) => {
  try {
    return dbManager.commerceProfile_update(portfolioId, updates);
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Assets
ipcMain.handle('portfolio-asset-create', async (event, data) => {
  try {
    return dbManager.portfolioAsset_create(data);
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('portfolio-asset-get-by-portfolio', async (event, portfolioId) => {
  try {
    return dbManager.portfolioAsset_getByPortfolioId(portfolioId);
  } catch (err) {
    return [];
  }
});

ipcMain.handle('portfolio-asset-delete', async (event, id) => {
  try {
    return dbManager.portfolioAsset_delete(id);
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// --- MEDIATHEQUE (Old handlers removed - replaced by Phase 2 block) ---

// Elements
ipcMain.handle('portfolio-element-create', async (event, data) => {
  try {
    return dbManager.portfolioElement_create(data);
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('portfolio-element-get-by-portfolio', async (event, portfolioId) => {
  try {
    return dbManager.portfolioElement_getByPortfolioId(portfolioId);
  } catch (err) {
    return [];
  }
});

ipcMain.handle('portfolio-element-update-classification', async (event, { id, classification }) => {
  try {
    return dbManager.portfolioElement_updateClassification(id, classification);
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('portfolio-element-delete', async (event, id) => {
  try {
    return dbManager.portfolioElement_delete(id);
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Projects V2
ipcMain.handle('portfolio-project-v2-create', async (event, data) => {
  try {
    return dbManager.portfolioProjectV2_create(data);
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('portfolio-project-v2-get-by-portfolio', async (event, portfolioId) => {
  try {
    return dbManager.portfolioProjectV2_getByPortfolioId(portfolioId);
  } catch (err) {
    return [];
  }
});

ipcMain.handle('portfolio-project-v2-get-by-id', async (event, id) => {
  try {
    return dbManager.portfolioProjectV2_getById(id);
  } catch (err) {
    return null;
  }
});

ipcMain.handle('portfolio-project-v2-update', async (event, { id, updates }) => {
  try {
    return dbManager.portfolioProjectV2_update(id, updates);
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('portfolio-project-v2-delete', async (event, id) => {
  try {
    return dbManager.portfolioProjectV2_delete(id);
  } catch (err) {
    return { success: false, error: err.message };
  }
});

// Project Elements (Liaison)
ipcMain.handle('portfolio-project-element-create', async (event, data) => {
  try {
    return dbManager.portfolioProjectElement_create(data);
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('portfolio-project-element-update', async (event, { projectId, elementId, updates }) => {
  try {
    return dbManager.portfolioProjectElement_update(projectId, elementId, updates);
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('portfolio-project-element-delete', async (event, { projectId, elementId }) => {
  try {
    // Note: elementId here is the LINK ID, so we need to ensure db delete uses correct where
    // We haven't updated delete signature in db yet if it differs!
    // Let's assume we fixed DB delete or will fix it.
    // For now, let's implement the handler calling the DB function.
    return dbManager.portfolioProjectElement_delete(projectId, elementId);
  } catch (err) {
    return { success: false, error: err.message };
  }
});


ipcMain.handle('portfolio-project-element-get-by-project', async (event, projectId) => {
  try {
    return dbManager.projectMedia_getByProject(projectId);
  } catch (err) {
    console.error('[Main] Error fetching project media:', err);
    return [];
  }
});



// Duplicate handlers removed


// Réorganiser les éléments d'un projet
ipcMain.handle('portfolio-project-element-update-order', async (event, { projectId, elements }) => {
  try {
    return dbManager.portfolioProjectElement_updateOrder(projectId, elements);
  } catch (err) {
    console.error('[PORTFOLIO] Erreur réorganisation éléments projet:', err.message);
    return { success: false, error: err.message };
  }
});

// Lire un fichier en base64
ipcMain.handle('read-file-base64', async (event, filePath) => {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    const buffer = fs.readFileSync(filePath);
    return buffer.toString('base64');
  } catch (err) {
    console.error('[Main] Erreur lecture fichier base64:', err);
    return null;
  }
});

// ============================================================
// MEDIATHEQUE HANDLERS (Phase 2)
// ============================================================

// Helper: Process and Save File
const processAndSaveFile = async (filePath, portfolioId) => {
    const fs = require('fs');
    const path = require('path');
    const crypto = require('crypto');
    const { nativeImage } = require('electron');

    // 1. Prepare directories
    const portfolioDir = path.join(app.getPath('userData'), 'portfolios', portfolioId);
    const originalsDir = path.join(portfolioDir, 'mediatheque', 'originals');
    const thumbnailsDir = path.join(portfolioDir, 'mediatheque', 'thumbnails');
    
    if (!fs.existsSync(originalsDir)) fs.mkdirSync(originalsDir, { recursive: true });
    if (!fs.existsSync(thumbnailsDir)) fs.mkdirSync(thumbnailsDir, { recursive: true });

    // 2. Copy properties
    const stats = fs.statSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const originalName = path.basename(filePath);
    const id = crypto.randomUUID();
    const newFileName = `${id}${ext}`;
    const newPath = path.join(originalsDir, newFileName);

    // 3. Copy file
    fs.copyFileSync(filePath, newPath);

    // 4. Determine Type
    let type = 'document';
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'].includes(ext)) type = 'image';
    if (['.mp4', '.mov', '.webm', '.avi'].includes(ext)) type = 'video';
    if (ext === '.pdf') type = 'pdf';

    // 5. Generate Thumbnail (if image)
    let thumbnailPath = null;
    if (type === 'image') {
        try {
           const image = nativeImage.createFromPath(newPath);
           const thumb = image.resize({ width: 300, quality: 'good' });
           const thumbName = `${id}_thumb.jpg`;
           const thumbFullPath = path.join(thumbnailsDir, thumbName);
           fs.writeFileSync(thumbFullPath, thumb.toJPEG(80));
           thumbnailPath = thumbFullPath;
        } catch (e) {
            console.error('Thumbnail generation failed:', e);
        }
    }

    // 6. DB Insert
    const item = {
        id,
        portfolio_id: portfolioId,
        file_path: newPath,
        file_type: type,
        original_filename: originalName,
        file_size: stats.size,
        thumbnail_path: thumbnailPath,
        tags_json: '[]',
        metadata_json: JSON.stringify({ created: stats.birthtime }),
        created_at: new Date().toISOString()
    };
    
    dbManager.db.prepare(`
        INSERT INTO mediatheque_items 
        (id, portfolio_id, file_path, file_type, original_filename, file_size, thumbnail_path, tags_json, metadata_json, created_at)
        VALUES (@id, @portfolio_id, @file_path, @file_type, @original_filename, @file_size, @thumbnail_path, @tags_json, @metadata_json, @created_at)
    `).run(item);

    return item;
};

ipcMain.handle('mediatheque-import-files', async (event, portfolioId) => {
  try {
    const { filePaths } = await dialog.showOpenDialog({
        properties: ['openFile', 'multiSelections'],
        filters: [
            { name: 'Media', extensions: ['jpg', 'png', 'gif', 'webp', 'pdf', 'mp4', 'mov'] },
            { name: 'All Files', extensions: ['*'] }
        ]
    });

    if (filePaths.length === 0) return { cancelled: true };

    const items = [];
    for (const filePath of filePaths) {
        try {
            const item = await processAndSaveFile(filePath, portfolioId);
            items.push(item);
        } catch (e) {
            console.error(`Failed to import ${filePath}:`, e);
        }
    }

    return { success: true, items };

  } catch (err) {
    return { success: false, error: err.message };
  }
});

// File Storage (Existing)
ipcMain.handle('portfolio-v2-save-file', async (event, { portfolioId, fileName, buffer }) => {
  try {
    const fs = require('fs');
    const path = require('path');

    // Créer le dossier portfolio s'il n'existe pas
    const portfolioDir = path.join(app.getPath('userData'), 'portfolios', portfolioId);
    const assetsDir = path.join(portfolioDir, 'assets');
    if (!fs.existsSync(assetsDir)) {
      fs.mkdirSync(assetsDir, { recursive: true });
    }

    // Générer un nom de fichier unique
    const timestamp = Date.now();
    const extension = path.extname(fileName);
    const baseName = path.basename(fileName, extension);
    const uniqueFileName = `${baseName}_${timestamp}${extension}`;
    const filePath = path.join(assetsDir, uniqueFileName);

    // Écrire le fichier
    fs.writeFileSync(filePath, Buffer.from(buffer));

    return {
      success: true,
      path: filePath,
      relativePath: path.join('portfolios', portfolioId, 'assets', uniqueFileName)
    };
  } catch (err) {
    console.error('[Main] Erreur sauvegarde fichier:', err);
    return { success: false, error: err.message };
  }
});

// Generate Thumbnail for Images
ipcMain.handle('portfolio-v2-generate-thumbnail', async (event, { filePath, maxWidth = 300, maxHeight = 300 }) => {
  try {
    const fs = require('fs');
    const path = require('path');
    const { nativeImage } = require('electron');

    // Vérifier que le fichier existe
    if (!fs.existsSync(filePath)) {
      throw new Error('Fichier non trouvé');
    }

    // Charger l'image
    const image = nativeImage.createFromPath(filePath);
    if (image.isEmpty()) {
      throw new Error('Image invalide');
    }

    // Redimensionner (aspect ratio préservé)
    const size = image.getSize();
    let width = size.width;
    let height = size.height;

    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = Math.round(width * ratio);
      height = Math.round(height * ratio);
    }

    const thumbnail = image.resize({ width, height, quality: 'good' });

    // Sauvegarder la miniature
    const dir = path.dirname(filePath);
    const thumbnailsDir = path.join(dir, '..', 'thumbnails');
    if (!fs.existsSync(thumbnailsDir)) {
      fs.mkdirSync(thumbnailsDir, { recursive: true });
    }

    const fileName = path.basename(filePath, path.extname(filePath));
    const thumbnailPath = path.join(thumbnailsDir, `${fileName}_thumb.jpg`);

    // Sauvegarder en JPEG
    fs.writeFileSync(thumbnailPath, thumbnail.toJPEG(80));

    return {
      success: true,
      thumbnailPath,
      width,
      height,
    };
  } catch (err) {
    console.error('[Main] Erreur génération miniature:', err);
    return { success: false, error: err.message };
  }
});

// ============================================================
// APP LIFECYCLE
// ============================================================

// ============================================================
// PORTFOLIO V2 - EXTRACTORS
// ============================================================

const { ExtractorFactory } = require('./extractors.cjs');
const extractorFactory = new ExtractorFactory();

// Extraire fichier image
ipcMain.handle('extractor-extract-image', async (event, { filePath, options }) => {
  try {
    const result = await extractorFactory.imageExtractor.extract(filePath, options);
    return result;
  } catch (error) {
    return { success: false, error: error.message, elements: [] };
  }
});

// Extraire fichier PDF
ipcMain.handle('extractor-extract-pdf', async (event, { filePath, options }) => {
  try {
    const result = await extractorFactory.pdfExtractor.extract(filePath, options);
    return result;
  } catch (error) {
    return { success: false, error: error.message, elements: [] };
  }
});

// Extraire fichier vidéo
ipcMain.handle('extractor-extract-video', async (event, { filePath, options }) => {
  try {
    const result = await extractorFactory.videoExtractor.extract(filePath, options);
    return result;
  } catch (error) {
    return { success: false, error: error.message, elements: [] };
  }
});

// Générer thumbnail
ipcMain.handle('extractor-generate-thumbnail', async (event, { filePath, outputPath, options }) => {
  try {
    const result = await extractorFactory.generateThumbnail(filePath, outputPath, options);
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Extraction générique (détecte le type automatiquement)
ipcMain.handle('extractor-extract-file', async (event, { filePath, options }) => {
  try {
    const result = await extractorFactory.extract(filePath, options);
    return result;
  } catch (error) {
    return { success: false, error: error.message, elements: [] };
  }
});

// ============================================================
// OLLAMA - CLASSIFICATION IA LOCALE
// ============================================================

const OLLAMA_API_URL = 'http://localhost:11434';
const OLLAMA_MODEL = 'llama3.2:3b'; // Modèle léger pour classification

// Vérifier la disponibilité d'Ollama
ipcMain.handle('ollama-check-availability', async () => {
  try {
    const response = await fetch(`${OLLAMA_API_URL}/api/tags`);
    if (!response.ok) {
      return { available: false, error: 'Ollama API not responding' };
    }
    const data = await response.json();
    const hasModel = data.models?.some(m => m.name.includes('llama3.2'));
    return {
      available: true,
      model: OLLAMA_MODEL,
      modelsAvailable: data.models?.map(m => m.name) || [],
    };
  } catch (error) {
    return { available: false, error: error.message };
  }
});

// Classifier un élément avec Ollama
ipcMain.handle('ollama-classify-element', async (event, request) => {
  const startTime = Date.now();

  try {
    // Générer le prompt de classification
    const prompt = `Tu es un assistant IA spécialisé dans la classification de contenus de portfolio professionnel.

Analyse l'élément suivant et fournis une classification structurée :

**Titre :** ${request.title}
**Format :** ${request.format}
${request.description ? `**Description :** ${request.description}` : ''}
${request.extractedText ? `**Contenu extrait :** ${request.extractedText.substring(0, 500)}...` : ''}

Fournis une classification au format JSON strict suivant :
{
  "category": "<catégorie principale>",
  "tags": ["<tag1>", "<tag2>", "<tag3>"],
  "suggestedProject": "<nom de projet suggéré>",
  "confidence": <nombre entre 0 et 1>,
  "reasoning": "<explication courte de la classification>"
}

**Catégories possibles :**
- Design (UI/UX, graphisme, branding)
- Développement (web, mobile, logiciel)
- Marketing (contenu, campagnes, réseaux sociaux)
- Vidéo (montage, motion design, production)
- Photo (photographie, retouche)
- Rédaction (articles, copywriting, documentation)
- Autre

**Consignes :**
- Maximum 5 tags pertinents
- Suggère un nom de projet cohérent si possible
- Le confidence doit refléter ta certitude (0.7+ = bon, 0.5-0.7 = moyen, <0.5 = incertain)
- Réponds UNIQUEMENT avec le JSON, sans texte avant ou après`;

    // Appeler Ollama API
    const response = await fetch(`${OLLAMA_API_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
        options: {
          temperature: 0.3, // Faible pour plus de cohérence
          top_p: 0.9,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.statusText}`);
    }

    const data = await response.json();
    const responseText = data.response;

    // Parser la réponse JSON
    let classification;
    try {
      // Extraire le JSON de la réponse (peut être entouré de texte)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      classification = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('[Ollama] Erreur parsing JSON:', parseError);
      throw new Error('Failed to parse classification response');
    }

    const processingTime = Date.now() - startTime;

    return {
      success: true,
      classification,
      processingTime,
    };
  } catch (error) {
    console.error('[Ollama] Erreur classification:', error);
    return {
      success: false,
      error: error.message,
    };
  }
});

// Générer du contenu de projet (Expert)
ipcMain.handle('ollama-generate-project-field', async (event, { field, context, currentText }) => {
  try {
    const fieldPrompts = {
      brief: "Rédige un brief projet percutant (Contexte, Objectifs) pour un portfolio professionnel.",
      challenge: "Décris les défis techniques et créatifs majeurs rencontrés sur ce projet.",
      solution: "Explique la solution apportée (Technologie, Design, Stratégie) et sa valeur ajoutée.",
      result: "Présente les résultats concrets (Métriques, Impact client, Changement) obtenus."
    };

    const prompt = `Tu es un expert en communication portfolio (Style 'Excellence').
    
${fieldPrompts[field] || "Améliore le texte suivant."}

Contexte du projet :
${context}

${currentText ? `Texte actuel à améliorer : \n${currentText}` : ''}

Consignes :
- Ton : Professionnel, Concis, Impactant.
- Langue : Français.
- Pas de bla-bla inutile, va droit au but.
- Si le contexte est maigre, invente des détails plausibles mais génériques qui font "pro".`;

    const response = await fetch(`${OLLAMA_API_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
        options: { temperature: 0.7 }
      }),
    });

    const data = await response.json();
    return { success: true, text: data.response.trim() };

  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Chat avec Ollama (Wizard Context)
ipcMain.handle('ollama-chat', async (event, { messages, model }) => {
  try {
    const response = await fetch(`${OLLAMA_API_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model || OLLAMA_MODEL,
        messages,
        stream: false,
        options: {
          temperature: 0.7, 
        },
      }),
    });

    if (!response.ok) {
        throw new Error(`Ollama Error: ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, message: data.message };
  } catch (error) {
    console.error('[Ollama] Chat error:', error);
    return { success: false, error: error.message };
  }
});

// Ouvrir un fichier dans l'application par défaut
ipcMain.handle('open-file-external', async (event, filePath) => {
  try {
    const result = await shell.openPath(filePath);
    if (result) {
      console.error('[FILE] Error opening file:', result);
      return { success: false, error: result };
    }
    return { success: true };
  } catch (error) {
    console.error('[FILE] Open error:', error);
    return { success: false, error: error.message };
  }
});

// Vérifier la disponibilité d'Ollama
ipcMain.handle('check-ollama-status', async () => {
  try {
    const response = await fetch('http://localhost:11434/api/tags');
    return { available: response.ok };
  } catch {
    return { available: false };
  }
});

// Anonymisation en lots (Bulk Anonymization)
ipcMain.handle('ollama-batch-anonymize', async (event, project) => {
  try {
    // 1. Extraire tout le texte
    const fullText = [
      project.title,
      project.brief_text,
      project.challenge_text,
      project.solution_text,
      project.result_text
    ].join('\n\n---SECTION---\n\n');

    // 2. Détecter les entités (PII)
    const prompt = `Analyse le texte suivant et identifie TOUTES les entités nommées sensibles (Noms de personnes, Entreprises, Clients, E-mails, Téléphones, Villes précises).
    
Texte :
${fullText}

Réponds UNIQUEMENT avec un JSON de cette forme :
{
  "people": ["Nom 1", "Nom 2"],
  "companies": ["Entreprise A", "Client B"],
  "emails": ["email@test.com"],
  "phones": ["0612345678"]
}`;

    const response = await fetch(`${OLLAMA_API_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: OLLAMA_MODEL,
          prompt,
          stream: false,
          format: "json", // Force JSON mode if supported or parsed manually
          options: { temperature: 0.1 }
        }),
    });

    const data = await response.json();
    
    // Parse JSON
    let entities = { people: [], companies: [], emails: [], phones: [] };
    try {
        const jsonMatch = data.response.match(/\{[\s\S]*\}/);
        if (jsonMatch) entities = JSON.parse(jsonMatch[0]);
    } catch (e) {
        console.warn("[Anonymize] Failed to parse entities JSON used fallback regex?");
    }

    // 3. Charger la map d'anonymisation existante depuis la DB
    const existingMap = dbManager.db.prepare('SELECT * FROM anonymization_maps WHERE portfolio_id = ?').all(project.portfolio_id);
    const replacements = new Map();
    
    // Charger l'existant
    existingMap.forEach(row => {
        replacements.set(row.original_value.toLowerCase(), row.anonymized_token);
    });

    // Compteurs pour nouveaux tokens (basé sur l'existant pour ne pas recommencer à A)
    const getNextIndex = (prefix) => {
        const count = existingMap.filter(row => row.anonymized_token.startsWith(`[${prefix}`)).length;
        return count;
    };

    let counters = {
        'CLIENT': getNextIndex('CLIENT'),
        'CONTACT': getNextIndex('CONTACT'),
        'EMAIL': getNextIndex('EMAIL'),
        'TEL': getNextIndex('TEL')
    };

    const getNewToken = (prefix) => {
        const token = `[${prefix}_${String.fromCharCode(65 + (counters[prefix] % 26))}${Math.floor(counters[prefix] / 26) || ''}]`;
        counters[prefix]++;
        return token;
    };

    const sanitize = (list, prefix, type) => {
        list.forEach(originalPrice => {
            const originalV = originalPrice.trim();
            const key = originalV.toLowerCase();
            
            if (!replacements.has(key)) {
                // Créer nouveau token
                const token = getNewToken(prefix);
                replacements.set(key, token);

                // Sauvegarder en DB
                try {
                    dbManager.db.prepare(`
                        INSERT INTO anonymization_maps (id, portfolio_id, original_value, anonymized_token, value_type)
                        VALUES (?, ?, ?, ?, ?)
                    `).run(crypto.randomUUID(), project.portfolio_id, originalV, token, type);
                } catch (e) {
                    console.error("Failed to save anonymization mapping", e);
                }
            }
        });
    };

    const crypto = require('crypto');
    sanitize(entities.companies || [], 'CLIENT', 'company');
    sanitize(entities.people || [], 'CONTACT', 'person');
    sanitize(entities.emails || [], 'EMAIL', 'email');
    sanitize(entities.phones || [], 'TEL', 'phone');

    // 4. Appliquer les remplacements
    const safeProject = JSON.parse(JSON.stringify(project)); // Deep clone
    
    const apply = (text) => {
        if (!text) return text;
        let safeText = text;
        // Tri par longueur décroissante pour éviter de remplacer des sous-chaînes partielles mal
        const sortedKeys = Array.from(replacements.keys()).sort((a, b) => b.length - a.length);
        
        sortedKeys.forEach(key => {
            const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
            safeText = safeText.replace(regex, replacements.get(key));
        });
        return safeText;
    };

    safeProject.title = apply(safeProject.title);
    safeProject.brief_text = apply(safeProject.brief_text);
    safeProject.challenge_text = apply(safeProject.challenge_text);
    safeProject.solution_text = apply(safeProject.solution_text);
    safeProject.result_text = apply(safeProject.result_text);

    return { success: true, project: safeProject };

  } catch (error) {
    console.error("Anonymization error:", error);
    return { success: false, error: error.message };
  }
});

// Export
ipcMain.handle('export-static-site', async (event, { portfolio, projects }) => {
  const { dialog } = require('electron');
  const fs = require('fs');
  const path = require('path');
  
  try {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      title: 'Choisir le dossier d\'export',
      properties: ['openDirectory', 'createDirectory']
    });

    if (canceled || filePaths.length === 0) return { cancelled: true };
    const outputDir = path.join(filePaths[0], `Portfolio_${portfolio.name || 'Souverain'}`);
    
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    
    const assetsDir = path.join(outputDir, 'assets');
    if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir);

    // Process Projects & Assets
    const processedProjects = [];
    
    for (const proj of projects) {
      const projClone = { ...proj, elements: [] };
      
      // Fetch elements
      // Note: dbManager functions are synchronous usually in this setup (better-sqlite3)
      let dbElements = [];
      try {
          dbElements = dbManager.projectMedia_getByProject(proj.id) || [];
      } catch (e) {
          console.warn(`Failed to fetch elements for project ${proj.id}`, e);
      }
      
      const processedElements = [];
      for (const el of dbElements) {
         // Resolve file path
         let finalPath = null;
         if (el.file_path && fs.existsSync(el.file_path)) {
             const ext = path.extname(el.file_path);
             const safeName = `${proj.id.substring(0,4)}_${el.original_filename || 'asset'}`.replace(/[^a-z0-9.]/gi, '_'); // sanitize
             const destPath = path.join(assetsDir, safeName);
             fs.copyFileSync(el.file_path, destPath);
             finalPath = `assets/${safeName}`;
         }
         
         processedElements.push({
             ...el,
             localPath: finalPath, // Generic access for frontend
             url: finalPath
         });
      }
      projClone.elements = processedElements;
      processedProjects.push(projClone);
    }

    // Generate HTML
    const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${portfolio.title || 'Portfolio'}</title>
    <style>
        :root {
            --bg-primary: #ffffff;
            --text-primary: #1a1a1a;
            --accent: #2563eb;
        }
        @media (prefers-color-scheme: dark) {
            :root {
                --bg-primary: #111111;
                --text-primary: #ffffff;
            }
        }
        body { margin: 0; font-family: 'Inter', system-ui, sans-serif; background: var(--bg-primary); color: var(--text-primary); }
        .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .project { margin-bottom: 4rem; border-bottom: 1px solid #eee; padding-bottom: 2rem; }
        .gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; margin-top: 1rem; }
        img, video { max-width: 100%; border-radius: 8px; }
    </style>
</head>
<body>
    <div id="root"></div>
    <script>
        window.PORTFOLIO_DATA = {
            info: ${JSON.stringify(portfolio)},
            projects: ${JSON.stringify(processedProjects)}
        };
    </script>
    <script>
        // Minimal Renderer
        const app = document.getElementById('root');
        const { info, projects } = window.PORTFOLIO_DATA;
        
        const header = document.createElement('header');
        header.className = 'container';
        header.innerHTML = \`
            <h1>\${info.title || 'Mon Portfolio'}</h1>
            <p>\${info.tagline || ''}</p>
        \`;
        app.appendChild(header);

        const main = document.createElement('main');
        main.className = 'container';
        
        projects.forEach(p => {
            const section = document.createElement('section');
            section.className = 'project';
            section.innerHTML = \`
                <h2>\${p.title}</h2>
                <p>\${p.brief_text || ''}</p>
                <div class="gallery">
                    \${p.elements.map(el => {
                        if(el.file_type === 'video') return \`<video src="\${el.url}" controls></video>\`;
                        return \`<img src="\${el.url}" loading="lazy" />\`;
                    }).join('')}
                </div>
            \`;
            main.appendChild(section);
        });
        app.appendChild(main);
    </script>
</body>
</html>
    `;

    fs.writeFileSync(path.join(outputDir, 'index.html'), htmlContent);
    
    // Open folder
    const { shell } = require('electron');
    shell.openPath(outputDir);

    return { success: true, path: outputDir };

  } catch (err) {
    console.error('Export Error:', err);
    return { success: false, error: err.message };
  }
});

// ============================================================
// APP LIFECYCLE
// ============================================================
// Export PDF Global (Universal Engine)
ipcMain.handle('export-pdf-global', async (event, { html, slug }) => {
  const { dialog, BrowserWindow, app, shell } = require('electron');
  const fs = require('fs');
  const path = require('path');
  try {
    const defaultName = slug ? `${slug}.pdf` : 'portfolio.pdf';
    const { filePath } = await dialog.showSaveDialog({
      title: 'Exporter le portfolio PDF',
      defaultPath: path.join(app.getPath('documents'), defaultName),
      filters: [{ name: 'Fichier PDF', extensions: ['pdf'] }]
    });

    if (!filePath) return { success: false, error: 'Annulé par l\'utilisateur' };

    // Create a hidden window to render the HTML
    const printWindow = new BrowserWindow({ 
        show: false, 
        width: 1200, // Width mainly affects layout
        webPreferences: {
            offscreen: true, // Optimizes for headless rendering
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    // Load HTML via Data URI (simplest for avoiding file I/O issues)
    // NOTE: For very large site, writing to temp file might be safer, but Data URI works for MVP
    const dataUri = `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
    
    await printWindow.loadURL(dataUri);

    // Wait for content to confirm ready (though loadURL awaits somewhat)
    // We can inject a script to check if images are loaded if needed, but for now simple wait is okay
    
    // Generate PDF
    const data = await printWindow.webContents.printToPDF({
        printBackground: true,
        pageSize: 'A4',
        landscape: false, // Portrait by default for portfolios usually? Or maybe landscape for slides? Addendum says "A4 or US Letter"
        margins: { top: 0, bottom: 0, left: 0, right: 0 } // Assume CSS handles padding/margins
    });

    // Save File
    fs.writeFileSync(filePath, data);
    
    // Cleanup
    printWindow.close();
    
    // Open Folder
    shell.showItemInFolder(filePath);

    return { success: true, filePath };
  } catch (err) {
    console.error('Export PDF Error:', err);
    return { success: false, error: err.message };
  }
});

// ============================================================
// ANONYMISATION DATABASE HANDLERS (Correction 1.2)
// ============================================================

ipcMain.handle('db-insert-anonymization-map', async (event, data) => {
  try {
    const stmt = dbManager.db.prepare(`
      INSERT INTO anonymization_maps (id, portfolio_id, project_id, original_value, anonymized_token, value_type, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(data.id, data.portfolio_id, data.project_id, data.original_value, data.anonymized_token, data.value_type, data.created_at);
    return { success: true };
  } catch (error) {
    console.error('[DB] Insert anonymization map error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db-get-anonymization-by-value', async (event, { portfolioId, originalValue }) => {
  try {
    const stmt = dbManager.db.prepare(`
      SELECT * FROM anonymization_maps
      WHERE portfolio_id = ? AND original_value = ?
      LIMIT 1
    `);
    const result = stmt.get(portfolioId, originalValue);
    return result || null;
  } catch (error) {
    console.error('[DB] Get anonymization by value error:', error);
    return null;
  }
});

ipcMain.handle('db-get-token-count', async (event, { portfolioId, valueType }) => {
  try {
    const stmt = dbManager.db.prepare(`
      SELECT COUNT(*) as count FROM anonymization_maps
      WHERE portfolio_id = ? AND value_type = ?
    `);
    const result = stmt.get(portfolioId, valueType);
    return result.count || 0;
  } catch (error) {
    console.error('[DB] Get token count error:', error);
    return 0;
  }
});

ipcMain.handle('db-get-anonymization-by-portfolio', async (event, portfolioId) => {
  try {
    const stmt = dbManager.db.prepare(`
      SELECT * FROM anonymization_maps WHERE portfolio_id = ?
    `);
    const results = stmt.all(portfolioId);
    return results || [];
  } catch (error) {
    console.error('[DB] Get anonymization by portfolio error:', error);
    return [];
  }
});

// ============================================================
// EXPORT HTML HANDLER (Correction 2.3)
// ============================================================

ipcMain.handle('export-html-content', async (event, { portfolioId, html, slug }) => {
  try {
    const { dialog } = require('electron');

    // Open save dialog
    const result = await dialog.showSaveDialog({
      title: 'Enregistrer le portfolio HTML',
      defaultPath: `${slug || 'portfolio'}.html`,
      filters: [
        { name: 'HTML', extensions: ['html'] }
      ]
    });

    if (result.canceled) {
      return { success: false, cancelled: true };
    }

    // Write HTML file
    fs.writeFileSync(result.filePath, html, 'utf8');

    // Open folder
    const { shell } = require('electron');
    shell.showItemInFolder(result.filePath);

    return { success: true, filePath: result.filePath };
  } catch (error) {
    console.error('[Export] HTML export error:', error);
    return { success: false, error: error.message };
  }
});

// ============================================================
// PORTFOLIO INTENTION HANDLERS (Correction 2.1)
// ============================================================

ipcMain.handle('db-update-portfolio-intention', async (event, { portfolioId, intentionFormJson }) => {
  try {
    const stmt = dbManager.db.prepare(`
      UPDATE portfolios
      SET intention_form_json = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    stmt.run(intentionFormJson, portfolioId);
    return { success: true };
  } catch (error) {
    console.error('[DB] Update portfolio intention error:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db-get-portfolio-intention', async (event, portfolioId) => {
  try {
    const stmt = dbManager.db.prepare(`
      SELECT intention_form_json FROM portfolios WHERE id = ?
    `);
    const result = stmt.get(portfolioId);
    return result || null;
  } catch (error) {
    console.error('[DB] Get portfolio intention error:', error);
    return null;
  }
});

// ============================================================
// MPF-1: Portfolio Selection Handlers
// ============================================================

// Récupérer tous les portfolios
ipcMain.handle('db-get-all-portfolios', async () => {
  try {
    return dbManager.portfolios_getAll();
  } catch (error) {
    console.error('[DB] Get all portfolios error:', error);
    return [];
  }
});

// Créer un nouveau portfolio
ipcMain.handle('db-create-portfolio', async (event, args) => {
  try {
    const { name } = args;
    console.log('[IPC] Creating portfolio:', name);
    const crypto = require('crypto');
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const result = dbManager.portfolios_insert({ id, name, created_at: now });
    console.log('[IPC] Portfolio created:', result);
    return result;
  } catch (error) {
    console.error('[DB] Create portfolio error:', error);
    return { success: false, error: error.message };
  }
});

// Sauvegarder les intentions du portfolio
ipcMain.handle('db-save-portfolio-intentions', async (event, { portfolioId, intentions }) => {
  try {
    return dbManager.portfolios_updateIntentions(portfolioId, JSON.stringify(intentions));
  } catch (error) {
    console.error('[DB] Save portfolio intentions error:', error);
    return { success: false, error: error.message };
  }
});

// Vérifier statut premium
ipcMain.handle('get-premium-status', async () => {
  // Pour l'instant, retourner false
  // À implémenter avec la logique de licence
  return { isPremium: false };
});

// Récupérer tous les projets (pour MPF-2)
ipcMain.handle('db-get-all-projects', async () => {
  try {
    const projects = dbManager.db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all();
    return projects;
  } catch (error) {
    console.error('[DB] Get all projects error:', error);
    return [];
  }
});

// Récupérer les projets d'un portfolio
ipcMain.handle('db-get-projects', async (event, portfolioId) => {
  try {
    return dbManager.project_getAll(portfolioId);
  } catch (error) {
    console.error('[DB] Get projects error:', error);
    return [];
  }
});

// Sauvegarder un fichier temporaire (pour imports médias MPF-2)
ipcMain.handle('save-temp-file', async (event, { name, buffer }) => {
  try {
    const crypto = require('crypto');
    const fs = require('fs');
    const path = require('path');
    const { app } = require('electron');
    
    const tempDir = path.join(app.getPath('userData'), 'temp-imports');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Générer un nom unique pour éviter les conflits
    const uniqueName = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}-${name}`;
    const filePath = path.join(tempDir, uniqueName);
    fs.writeFileSync(filePath, Buffer.from(buffer));
    
    return filePath;
  } catch (error) {
    console.error('[Temp File] Save error:', error);
    throw error;
  }
});

// Duplicate handlers removed (consolidated at end of file)


// MPF-6 : Get Portfolio by ID (for editing)
ipcMain.handle('db-get-portfolio', async (event, portfolioId) => {
  console.log('[IPC] Getting portfolio:', portfolioId);

  try {
    const stmt = dbManager.db.prepare(`
      SELECT * FROM portfolios WHERE id = ?
    `);
    const row = stmt.get(portfolioId);

    if (!row) {
      return null;
    }

    // Parse JSON fields
    return {
      id: row.id,
      name: row.name || 'Portfolio sans nom',
      style: row.style || 'moderne',
      sections: row.generated_sections ? JSON.parse(row.generated_sections) : [],
      projects: row.projects ? JSON.parse(row.projects) : [],
      practicalData: row.practical_data ? JSON.parse(row.practical_data) : {},
      seo: row.seo ? JSON.parse(row.seo) : {
        title: 'Portfolio',
        description: 'Mon portfolio professionnel',
        keywords: []
      },
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  } catch (error) {
    console.error('[IPC] Get portfolio error:', error);
    throw error;
  }
});

// MPF-6 : Update Portfolio (for editing)
ipcMain.handle('db-update-portfolio', async (event, portfolio) => {
  console.log('[IPC] Updating portfolio:', portfolio.id);

  try {
    const stmt = dbManager.db.prepare(`
      UPDATE portfolios
      SET name = ?,
          style = ?,
          generated_sections = ?,
          projects = ?,
          practical_data = ?,
          seo = ?,
          updated_at = ?
      WHERE id = ?
    `);

    stmt.run(
      portfolio.name,
      portfolio.style,
      JSON.stringify(portfolio.sections),
      JSON.stringify(portfolio.projects),
      JSON.stringify(portfolio.practicalData || {}),
      JSON.stringify(portfolio.seo),
      new Date().toISOString(),
      portfolio.id
    );

    console.log('[IPC] Portfolio updated successfully');
    return { success: true };
  } catch (error) {
    console.error('[IPC] Update portfolio error:', error);
    throw error;
  }
});

// Sauvegarder les imports du portfolio (MPF-2)
ipcMain.handle('db-save-portfolio-imports', async (event, { portfolioId, imports }) => {
  try {
    // Sauvegarder dans le champ JSON intention_form_json pour l'instant
    // TODO: Créer une colonne dédiée si nécessaire
    const stmt = dbManager.db.prepare(`
      UPDATE portfolios 
      SET intention_form_json = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
    stmt.run(JSON.stringify(imports), portfolioId);
    return { success: true };
  } catch (error) {
    console.error('[DB] Save portfolio imports error:', error);
    return { success: false, error: error.message };
  }
});

// Sauvegarder le contenu généré (MPF-5)
ipcMain.handle('db-save-portfolio-content', async (event, { portfolioId, sections }) => {
  try {
    return dbManager.portfolios_updateContent(portfolioId, JSON.stringify(sections));
  } catch (error) {
    console.error('[DB] Save portfolio content error:', error);
    return { success: false, error: error.message };
  }
});

// Supprimer un portfolio
ipcMain.handle('db-delete-portfolio', async (event, portfolioId) => {
  try {
    return dbManager.portfolios_delete(portfolioId);
  } catch (error) {
    console.error('[DB] Delete portfolio error:', error);
    return { success: false, error: error.message };
  }
});

// ==================== PORTFOLIO V2 HANDLERS (New Wizard System) ====================

// Save Portfolio V2 (with generated HTML content)
ipcMain.handle('db-save-portfolio-v2', async (event, { id, name, content, templateId, metadata }) => {
  try {
    console.log('[IPC] Saving portfolio V2:', id);

    // Check if portfolio exists
    const existing = dbManager.db.prepare('SELECT id FROM portfolios WHERE id = ?').get(id);

    if (existing) {
      // Update existing portfolio
      const stmt = dbManager.db.prepare(`
        UPDATE portfolios
        SET name = ?,
            generated_content = ?,
            template_id = ?,
            metadata = ?,
            updated_at = ?
        WHERE id = ?
      `);

      stmt.run(
        name,
        content,
        templateId,
        JSON.stringify(metadata),
        new Date().toISOString(),
        id
      );
    } else {
      // Insert new portfolio
      const stmt = dbManager.db.prepare(`
        INSERT INTO portfolios (
          id, name, generated_content, template_id, metadata, created_at, updated_at, is_primary
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const now = new Date().toISOString();
      stmt.run(id, name, content, templateId, JSON.stringify(metadata), now, now, 1);
    }

    return { success: true };
  } catch (error) {
    console.error('[DB] Save portfolio V2 error:', error);
    return { success: false, error: error.message };
  }
});

// Get Portfolio V2 by ID (returns generated HTML)
ipcMain.handle('portfolio-v2-get-by-id', async (event, portfolioId) => {
  try {
    console.log('[IPC] Getting portfolio V2:', portfolioId);

    const stmt = dbManager.db.prepare(`
      SELECT id, name, generated_content as content, template_id, metadata, created_at, updated_at
      FROM portfolios
      WHERE id = ?
    `);

    const row = stmt.get(portfolioId);

    if (!row) {
      return null;
    }

    // Parse metadata if present
    if (row.metadata) {
      try {
        row.metadata = JSON.parse(row.metadata);
      } catch (e) {
        row.metadata = {};
      }
    }

    return row;
  } catch (error) {
    console.error('[DB] Get portfolio V2 error:', error);
    return null;
  }
});

// ==================== MPF-3 HANDLERS: STYLE SUGGESTION & GENERATION ====================

// MPF-3: Anonymize portfolio data (Real Local BERT Implementation)
ipcMain.handle('anonymize-portfolio-data', async (event, { text, portfolioId }) => {
  try {
    console.log(`[MPF-3] Anonymisation locale du portfolio (BERT) pour ${portfolioId}...`);
    const anonymizer = new Anonymizer();
    await anonymizer.init();
    
    // Anonymiser le texte
    const result = await anonymizer.anonymize(text);
    
    // Sauvegarder les mappings en base pour la dé-anonymisation future
    if (portfolioId && result.mappings) {
        const crypto = require('crypto');
        for (const [token, original] of Object.entries(result.mappings)) {
            // Déterminer le type (ex: [PERSON_1] -> person)
            const typeMatch = token.match(/^\[([A-Z]+)_/);
            const type = typeMatch ? typeMatch[1].toLowerCase() : 'unknown';
            
            dbManager.anonymizationMap_insert({
                id: crypto.randomUUID(),
                portfolio_id: portfolioId,
                project_id: null,
                original_value: original, // TypeScript cast implicite
                anonymized_token: token,
                value_type: type,
                created_at: new Date().toISOString()
            });
        }
    }

    return { 
        success: true, 
        anonymized: result.anonymized,
        mappings: result.mappings,
        stats: result.stats
    };
  } catch (error) {
    console.error('[MPF-3] Anonymization error:', error);
    // Fallback: retourner le texte non modifié en cas d'erreur critique
    return { success: false, error: error.message, anonymized: text };
  }
});

// [REMOVED DUPLICATE] Handlers already defined at lines 2309+

// MPF-3: Analyze portfolio content (Stub for V1, IA analysis planned for V2)
ipcMain.handle('analyze-portfolio-content', async (event, data) => {
  try {
    // V1: Basic validation
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('[MPF-3] Content analysis simulated (stub)');
    return { success: true };
  } catch (error) {
    console.error('[MPF-3] Analysis error:', error);
    return { success: false, error: error.message };
  }
});

// MPF-3: Apply portfolio style (Stub for V1, full theme generation planned for V2)
ipcMain.handle('apply-portfolio-style', async (event, data) => {
  try {
    // V1: Prepare design tokens (placeholder)
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('[MPF-3] Style application simulated (stub)');
    return { success: true };
  } catch (error) {
    console.error('[MPF-3] Style application error:', error);
    return { success: false, error: error.message };
  }
});

// MPF-3: Generate final portfolio
ipcMain.handle('generate-portfolio-final', async (event, data) => {
  try {
    const crypto = require('crypto');
    const portfolioId = crypto.randomUUID();
    const now = new Date().toISOString();
    
    console.log('[MPF-3] Generating final portfolio with data:', {
      portfolioId,
      style: data.style,
      intentionsCount: Object.keys(data.intentions || {}).length
    });
    
    // Create portfolio with all collected data
    const result = dbManager.portfolio_create({
      id: portfolioId,
      title: 'Mon Portfolio',
      intentionForm: data.intentions,
      selectedStyle: data.style,
      userId: 'default',
      mode: 'independant',
      isPrimary: true
    });
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to create portfolio');
    }
    
    // TODO V2: Save project associations and media links
    // For now, the portfolio is created with intention data
    
    console.log('[MPF-3] Portfolio created successfully:', portfolioId);
    return { success: true, portfolioId };
    
  } catch (error) {
    console.error('[MPF-3] Portfolio generation error:', error);
    return { success: false, error: error.message };
  }
});

// ==================== END MPF-3 HANDLERS ====================

// ==================== JOB MATCHING HANDLERS ====================

// Get all CVs for job matching
ipcMain.handle('db-get-all-cvs', async () => {
  try {
    // TODO: Implement CV storage in database
    // For now, return empty array
    console.log('[IPC] Get all CVs');
    return [];
  } catch (error) {
    console.error('[IPC] Get all CVs error:', error);
    return [];
  }
});

// Save job offer
ipcMain.handle('db-save-job-offer', async (event, offer) => {
  try {
    // TODO: Implement job offer storage in database
    console.log('[IPC] Save job offer:', offer.title);
    return { success: true, id: offer.id };
  } catch (error) {
    console.error('[IPC] Save job offer error:', error);
    return { success: false, error: error.message };
  }
});

// Get matching history
ipcMain.handle('db-get-matching-history', async () => {
  try {
    // TODO: Implement matching history retrieval from database
    console.log('[IPC] Get matching history');
    return [];
  } catch (error) {
    console.error('[IPC] Get matching history error:', error);
    return [];
  }
});

// Save matching result
ipcMain.handle('db-save-matching-result', async (event, result) => {
  try {
    // TODO: Implement matching result storage in database
    console.log('[IPC] Save matching result:', result.id, 'Score:', result.score);
    return { success: true, id: result.id };
  } catch (error) {
    console.error('[IPC] Save matching result error:', error);
    return { success: false, error: error.message };
  }
});

// ==================== END JOB MATCHING HANDLERS ====================

// ==================== LINKEDIN COACH HANDLERS ====================

// Save LinkedIn profile
ipcMain.handle('db-save-linkedin-profile', async (event, profile) => {
  try {
    // TODO: Implement LinkedIn profile storage in database
    console.log('[IPC] Save LinkedIn profile:', profile.id);
    return { success: true, id: profile.id };
  } catch (error) {
    console.error('[IPC] Save LinkedIn profile error:', error);
    return { success: false, error: error.message };
  }
});

// Get LinkedIn analyses history
ipcMain.handle('db-get-linkedin-analyses', async () => {
  try {
    // TODO: Implement LinkedIn analyses retrieval from database
    console.log('[IPC] Get LinkedIn analyses');
    return [];
  } catch (error) {
    console.error('[IPC] Get LinkedIn analyses error:', error);
    return [];
  }
});

// Save LinkedIn analysis
ipcMain.handle('db-save-linkedin-analysis', async (event, analysis) => {
  try {
    // TODO: Implement LinkedIn analysis storage in database
    console.log('[IPC] Save LinkedIn analysis:', analysis.id, 'Score:', analysis.globalScore);
    return { success: true, id: analysis.id };
  } catch (error) {
    console.error('[IPC] Save LinkedIn analysis error:', error);
    return { success: false, error: error.message };
  }
});

// ==================== END LINKEDIN COACH HANDLERS ====================


// ==================== PORTFOLIO GENERATION HANDLERS ====================

// Sauvegarde du portfolio généré
ipcMain.handle('save-generated-portfolio', async (event, data) => {
  try {
    const id = data.id || require('crypto').randomUUID();
    console.log('[IPC] Saving generated portfolio:', id);
    
    // On utilise la méthode de mise à jour existante ou création si nécessaire
    // Ici on suppose qu'on met à jour un portfolio existant avec du contenu
    await dbManager.portfolioV2_update(data.portfolioId || data.id, {
      content: data.generatedHTML, // On sauvegarde le HTML généré
      status: 'generated',
      updated_at: new Date().toISOString()
    });

    return { success: true, id };
  } catch (err) {
    console.error('[IPC] save-generated-portfolio error:', err);
    return { success: false, error: err.message };
  }
});

// Render HTML (Simple Template Engine pour V1)
ipcMain.handle('render-portfolio-html', async (event, data) => {
  try {
    const { content, style } = data; // content = résutat JSON de Groq
    console.log('[IPC] Rendering HTML for style:', style);

    // Basic HTML Skeleton
    let html = `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${content.summary || 'Mon Portfolio'}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      /* Style Base: ${style} */
      body { font-family: sans-serif; }
      .hero { padding: 4rem 2rem; text-align: center; }
      .section { padding: 2rem; max-width: 800px; margin: 0 auto; }
      .project-card { border: 1px solid #eee; padding: 1rem; margin-bottom: 1rem; border-radius: 8px; }
    </style>
</head>
<body class="bg-gray-50 text-gray-900">
`;

    // HEADER / HERO
    // Note: On adapte selon la structure retournée par Groq (Blueprints)
    // Ici on fait un rendu générique basé sur les sections suggérées
    
    if (content.suggestedSections) {
        // Hero
        html += `<header class="hero bg-white shadow-sm mb-8">
            <h1 class="text-4xl font-bold mb-4">${content.contentHints?.hero || 'Mon Portfolio'}</h1>
            <p class="text-xl text-gray-600">${content.summary}</p>
        </header>`;

        // About
        html += `<section class="section bg-white rounded-lg shadow-sm mb-8">
            <h2 class="text-2xl font-bold mb-4">À propos</h2>
            <p>${content.contentHints?.about || 'Bio...'}</p>
            <div class="mt-4 flex gap-2 flex-wrap">
                ${(content.keyStrengths || []).map(s => `<span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">${s}</span>`).join('')}
            </div>
        </section>`;

        // Projects (Placeholder car structure complexe)
        html += `<section class="section">
            <h2 class="text-2xl font-bold mb-4">Projets Récents</h2>
            <div class="grid gap-6">
                <!-- Les projets seraient injectés ici -->
                <div class="project-card bg-white shadow-sm">
                    <h3 class="font-bold">Projet Exemple</h3>
                    <p>Description du projet...</p>
                </div>
            </div>
        </section>`;
        
        // Contact
        html += `<section class="section text-center">
            <h2 class="text-2xl font-bold mb-4">Contact</h2>
            <p>Me contacter pour en savoir plus.</p>
        </section>`;
    }

    html += `
<footer class="text-center py-8 text-gray-500 text-sm">
    Généré par Souverain
</footer>
</body>
</html>`;

    return html;
  } catch (err) {
    console.error('[IPC] render-portfolio-html error:', err);
    return "<h1>Erreur de rendu</h1><p>" + err.message + "</p>";
  }
});

// Export HTML
ipcMain.handle('export-portfolio-html', async (event, { html, filename }) => {
  try {
    const { dialog } = require('electron');
    const fs = require('fs');
    const path = require('path');
    
    const { filePath } = await dialog.showSaveDialog({
      title: 'Exporter le portfolio',
      defaultPath: filename || 'portfolio.html',
      filters: [{ name: 'HTML', extensions: ['html'] }]
    });

    if (filePath) {
      fs.writeFileSync(filePath, html, 'utf-8');
      return { success: true, filePath };
    }
    return { success: false, cancelled: true };
  } catch (err) {
    console.error('[IPC] export-portfolio-html error:', err);
    throw err;
  }
});

// ==================== END PORTFOLIO GENERATION HANDLERS ====================

// ==================== TEMPLATE HANDLERS (Phase 2) ====================

// Get all templates
ipcMain.handle('db-templates-get-all', async () => {
  try {
    const templates = dbManager.templates_getAll();
    return { success: true, templates };
  } catch (error) {
    console.error('[IPC] db-templates-get-all error:', error);
    return { success: false, error: error.message, templates: [] };
  }
});

// Get free templates
ipcMain.handle('db-templates-get-free', async () => {
  try {
    const templates = dbManager.templates_getFree();
    return { success: true, templates };
  } catch (error) {
    console.error('[IPC] db-templates-get-free error:', error);
    return { success: false, error: error.message, templates: [] };
  }
});

// Get owned templates (free + purchased)
ipcMain.handle('db-templates-get-owned', async () => {
  try {
    const templates = dbManager.templates_getOwned();
    return { success: true, templates };
  } catch (error) {
    console.error('[IPC] db-templates-get-owned error:', error);
    return { success: false, error: error.message, templates: [] };
  }
});

// Get boutique templates (premium not owned)
ipcMain.handle('db-templates-get-boutique', async () => {
  try {
    const templates = dbManager.templates_getBoutique();
    return { success: true, templates };
  } catch (error) {
    console.error('[IPC] db-templates-get-boutique error:', error);
    return { success: false, error: error.message, templates: [] };
  }
});

// Get template by ID
ipcMain.handle('db-templates-get-by-id', async (event, id) => {
  try {
    const template = dbManager.templates_getById(id);
    return { success: true, template };
  } catch (error) {
    console.error('[IPC] db-templates-get-by-id error:', error);
    return { success: false, error: error.message, template: null };
  }
});

// Get template HTML content
ipcMain.handle('template-get-html', async (event, id) => {
  try {
    console.log('[IPC] Loading template:', id);
    const template = dbManager.templates_getById(id);
    if (!template || !template.html_path) {
      console.error('[IPC] Template not found in DB:', id);
      return { success: false, error: 'Template not found' };
    }

    console.log('[IPC] Template DB path:', template.html_path);
    console.log('[IPC] __dirname:', __dirname);
    const fullPath = path.join(__dirname, template.html_path);
    console.log('[IPC] Full path:', fullPath);
    console.log('[IPC] File exists:', fs.existsSync(fullPath));

    if (!fs.existsSync(fullPath)) {
      console.error('[IPC] Template HTML file not found at:', fullPath);
      return { success: false, error: `Template HTML file not found at: ${fullPath}` };
    }

    const html = fs.readFileSync(fullPath, 'utf-8');
    console.log('[IPC] Template loaded successfully, length:', html.length);
    return { success: true, html };
  } catch (error) {
    console.error('[IPC] template-get-html error:', error);
    return { success: false, error: error.message };
  }
});

// Get template thumbnail
ipcMain.handle('template-get-thumbnail', async (event, id) => {
  try {
    console.log('[IPC] template-get-thumbnail called for:', id);
    const template = dbManager.templates_getById(id);
    
    if (!template || !template.thumbnail_path) {
      console.error('[IPC] template-get-thumbnail: template not found or missing thumbnail_path', { id, template });
      return { success: false, error: 'Template ou thumbnail introuvable' };
    }

    // Fix path: thumbnail_path should be relative to project root (e.g. 'templates/thumbnails/xxx.svg')
    // In dev mode, __dirname points to project root
    // In production (packaged), we might need app.getAppPath()
    const appPath = app.isPackaged ? app.getAppPath() : __dirname;
    const thumbnailPath = path.join(appPath, template.thumbnail_path);
    
    console.log('[IPC] template-get-thumbnail: looking for file at:', thumbnailPath);
    
    if (!fs.existsSync(thumbnailPath)) {
      console.error('[IPC] Thumbnail file not found:', thumbnailPath);
      console.error('[IPC] Template data:', { id, thumbnail_path: template.thumbnail_path, appPath, __dirname });
      return { success: false, error: 'Fichier thumbnail introuvable' };
    }

    const svgContent = fs.readFileSync(thumbnailPath, 'utf-8');
    console.log('[IPC] template-get-thumbnail: success, SVG length:', svgContent.length);
    return { success: true, svg: svgContent };
  } catch (error) {
    console.error('[IPC] template-get-thumbnail error:', error);
    return { success: false, error: error.message };
  }
});

// Purchase template
ipcMain.handle('template-purchase', async (event, { templateId, amountPaid, isPremiumDiscount }) => {
  try {
    const result = dbManager.templates_purchase(templateId, amountPaid, isPremiumDiscount);
    return result;
  } catch (error) {
    console.error('[IPC] template-purchase error:', error);
    return { success: false, error: error.message };
  }
});

// Get GROQ API Key (secure)
ipcMain.handle('get-groq-api-key', async () => {
  try {
    if (!GROQ_API_KEY) {
      console.error('[IPC] GROQ API key not configured');
      return { success: false, error: 'API key not configured' };
    }
    return { success: true, key: GROQ_API_KEY };
  } catch (error) {
    console.error('[IPC] get-groq-api-key error:', error);
    return { success: false, error: error.message };
  }
});

// ==================== EXTRACTION HANDLERS (V3) ====================

// Extract PDF text
ipcMain.handle('extract-pdf-text', async (event, filePath) => {
  try {
    const { PDFParse: pdfParse } = require('pdf-parse');
    const buffer = fs.readFileSync(filePath);
    const data = await pdfParse(buffer);
    return { success: true, text: data.text, pages: data.numpages };
  } catch (error) {
    console.error('[IPC] extract-pdf-text error:', error);
    return { success: false, error: error.message };
  }
});

// Extract image metadata
ipcMain.handle('extract-image-metadata', async (event, filePath) => {
  try {
    const sharp = require('sharp');
    const metadata = await sharp(filePath).metadata();
    const stats = fs.statSync(filePath);
    
    return {
      success: true,
      filename: path.basename(filePath),
      metadata: {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: stats.size,
      },
    };
  } catch (error) {
    console.error('[IPC] extract-image-metadata error:', error);
    return { success: false, error: error.message };
  }
});

// Read text file
ipcMain.handle('read-text-file', async (event, filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return { success: true, content };
  } catch (error) {
    console.error('[IPC] read-text-file error:', error);
    return { success: false, error: error.message };
  }
});

// ==================== END TEMPLATE HANDLERS ====================

// APP LIFECYCLE
app.whenReady().then(async () => {
  // Initialiser Groq
  groqClient = new GroqClient(GROQ_API_KEY);
  console.log('[SOUVERAIN] Groq Cloud initialisé');

  // Initialiser LinkedIn Scraper
  linkedInScraper = new LinkedInScraper();

  // Register all IPC handlers (modular architecture)
  console.log('[SOUVERAIN] Registering IPC handlers...');
  registerVaultHandlers(ipcMain, dbManager);
  registerPortfolioHandlers(ipcMain, dbManager);
  registerCVHandlers(ipcMain, dbManager, pdfExtract, groqClient, linkedInScraper, Anonymizer);
  console.log('[SOUVERAIN] ✅ All modular handlers registered');

  // Créer la fenêtre
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Generate template screenshot (thumbnail)
ipcMain.handle('template-generate-screenshot', async (event, { templateId }) => {
  try {
    
    
    console.log('[IPC] Generating screenshot for template:', templateId);
    
    // 1. Load template HTML
    const template = dbManager.templates_getById(templateId);
    if (!template || !template.html_path) {
      throw new Error('Template not found');
    }
    
    const templatePath = path.join(__dirname, template.html_path);
    let html = fs.readFileSync(templatePath, 'utf-8');
    
    // 2. Inject mock data
    const mockData = {
      HERO_TITLE: 'Jean Dupont',
      HERO_SUBTITLE: 'Développeur Full-Stack & Designer UI/UX',
      HERO_EYEBROW: 'Portfolio',
      HERO_CTA_TEXT: 'Voir mes projets',
      ABOUT_TEXT: 'Créateur d\'expériences numériques élégantes',
      ABOUT_IMAGE: 'https://ui-avatars.com/api/?name=Jean+Dupont&size=200&background=667eea&color=fff',
      VALUE_PROP: 'Des solutions digitales qui transforment vos idées en réalité',
      CONTACT_EMAIL: 'jean.dupont@example.com',
      CONTACT_PHONE: '+33 6 12 34 56 78',
      CONTACT_ADDRESS: '42 rue de la Tech, 75001 Paris',
      CURRENT_YEAR: new Date().getFullYear().toString(),
      OPENING_HOURS: 'Lun-Ven : 9h-18h'
    };
    
    // Replace placeholders
    for (const [key, value] of Object.entries(mockData)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, value);
    }
    
    // 3. Handle repeated sections (simplified for screenshot)
    const serviceHTML = `
      <div class="service-card">
        <span class="service-icon">💻</span>
        <h3>Développement Web</h3>
        <p>Applications modernes React & Node.js</p>
      </div>`;
    html = html.replace(/<!-- REPEAT: services -->[\s\S]*?<!-- END REPEAT: services -->/g, serviceHTML);
    
    const projectHTML = `
      <article class="project-card">
        <div class="project-image">
          <img src="https://placehold.co/600x400/667eea/ffffff?text=Projet" alt="Projet">
        </div>
        <div class="project-content">
          <span class="project-category">Web</span>
          <h3>Plateforme E-commerce</h3>
          <p>Solution complète de vente en ligne</p>
        </div>
      </article>`;
    html = html.replace(/<!-- REPEAT: projects -->[\s\S]*?<!-- END REPEAT: projects -->/g, projectHTML);
    
    const socialHTML = `<a href="#" class="social-link">LinkedIn</a>`;
    html = html.replace(/<!-- REPEAT: socialLinks -->[\s\S]*?<!-- END REPEAT: socialLinks -->/g, socialHTML);
    
    // Remove empty sections
    html = html.replace(/<!-- REPEAT: testimonials -->[\s\S]*?<!-- END REPEAT: testimonials -->/g, '');
    
    // Handle conditionals
    html = html.replace(/<!-- IF: showProjects -->[\s\S]*?<!-- ENDIF: showProjects -->/gs, (match) => {
      return match.replace(/<!-- IF: showProjects -->|<!-- ENDIF: showProjects -->/g, '');
    });
    html = html.replace(/<!-- IF: showTestimonials -->[\s\S]*?<!-- ENDIF: showTestimonials -->/gs, '');
    html = html.replace(/<!-- IF: showSocialShowcase -->[\s\S]*?<!-- ENDIF: showSocialShowcase -->/gs, '');
    html = html.replace(/<!-- IF: showPracticalInfo -->[\s\S]*?<!-- ENDIF: showPracticalInfo -->/gs, '');
    html = html.replace(/<!-- IF: hasAboutImage -->[\s\S]*?<!-- ENDIF: hasAboutImage -->/gs, (match) => {
      return match.replace(/<!-- IF: hasAboutImage -->|<!-- ENDIF: hasAboutImage -->/g, '');
    });
    html = html.replace(/<!-- IF: hasValueProp -->[\s\S]*?<!-- ENDIF: hasValueProp -->/gs, (match) => {
      return match.replace(/<!-- IF: hasValueProp -->|<!-- ENDIF: hasValueProp -->/g, '');
    });
    
    // 4. Create invisible window
    const screenshotWindow = new BrowserWindow({
      width: 1200,
      height: 900,
      show: false,
      webPreferences: {
        offscreen: true,
      },
    });
    
    // 5. Load HTML and capture
    await screenshotWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
    
    // Wait for page to fully render
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Capture screenshot
    const image = await screenshotWindow.webContents.capturePage();
    
    // Close window
    screenshotWindow.close();
    
    // 6. Resize to thumbnail size (400x300)
    const resizedBuffer = await sharp(image.toPNG())
      .resize(400, 300, {
        fit: 'cover',
        position: 'top'
      })
      .png({ quality: 90 })
      .toBuffer();
    
    // 7. Save to thumbnails directory
    const thumbnailDir = path.join(__dirname, 'templates', 'thumbnails');
    if (!fs.existsSync(thumbnailDir)) {
      fs.mkdirSync(thumbnailDir, { recursive: true });
    }
    
    const thumbnailPath = path.join(thumbnailDir, `${templateId}.png`);
    fs.writeFileSync(thumbnailPath, resizedBuffer);
    
    console.log('[IPC] Screenshot saved:', thumbnailPath);
    
    return { success: true, path: `templates/thumbnails/${templateId}.png` };
    
  } catch (error) {
    console.error('[IPC] template-generate-screenshot error:', error);
    return { success: false, error: error.message };
  }
});
