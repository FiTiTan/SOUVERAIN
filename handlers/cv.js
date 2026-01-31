/**
 * CV Handlers
 * Analyse de CV, import, LinkedIn, etc.
 */

const fs = require('fs');
const path = require('path');
const { dialog } = require('electron');

function registerCVHandlers(ipcMain, dbManager, pdfExtract, groqClient, linkedInScraper, Anonymizer) {
  
  // ============================================================
  // ANALYSE CV
  // ============================================================

  ipcMain.handle('analyze-cv', async (event, { cvText, filename, skipAnonymization }) => {
    const startTime = Date.now();

    if (!groqClient) {
      return {
        success: false,
        error: 'Client Groq non initialisé'
      };
    }

    console.log(`[SOUVERAIN] Analyse démarrée... (Mode: ${skipAnonymization ? 'WebLLM/Front' : 'BERT/Local'})`);

    try {
      let anonymized = cvText;
      let anonymizer = null;
      let stats = { totalMasked: 0 };
      let protectedData = {};

      // 1. Anonymisation Locale (Souveraine - BERT local) SAUF si déjà fait par WebLLM
      if (!skipAnonymization) {
          console.log('[SOUVERAIN] Anonymisation locale en cours (BERT)...');
          anonymizer = new Anonymizer();
          await anonymizer.init();
          
          // Fallback regex auto si NER échoue
          const result = await anonymizer.anonymize(cvText);
          anonymized = result.anonymized;
          stats = result.stats;
          protectedData = anonymizer.getMappings();
          
          console.log(`[SOUVERAIN] Anonymisation (Backend): ${stats.totalMasked} éléments masqués`);
      } else {
          console.log('[SOUVERAIN] Anonymisation Backend ignorée (WebLLM actif)');
      }
      
      // 2. Analyse Coach CV via Groq
      const groqResult = await groqClient.analyzeCV(anonymized);
      
      if (!groqResult.success) {
        throw new Error(groqResult.error);
      }

      // 3. Réincrémentation (seulement si anonymisé par Backend)
      let finalResult = groqResult.result;
      
      if (!skipAnonymization && anonymizer) {
          finalResult = anonymizer.deanonymize(groqResult.result);
      }

      const totalLatency = Date.now() - startTime;
      console.log(`[SOUVERAIN] Analyse terminée en ${totalLatency}ms`);

      return {
        success: true,
        result: finalResult,
        rawResult: groqResult.result,
        latency: totalLatency,
        anonymizationStats: stats,
        protectedData: protectedData,
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

  // ============================================================
  // IMPORT CV
  // ============================================================

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

  // ============================================================
  // EXTRACT ASSET CONTENT
  // ============================================================

  ipcMain.handle('get-asset-content', async (event, filePath) => {
    try {
      const ext = path.extname(filePath).toLowerCase();
      
      if (ext === '.pdf') {
        const data = await pdfExtract.extract(filePath);
        const text = data.pages
          .map(p => p.content.map(i => i.str).join(' '))
          .join('\n')
          .replace(/\s+/g, ' ')
          .trim();
        return { success: true, content: text, type: 'pdf' };
      } 
      
      if (['.txt', '.md', '.json', '.csv'].includes(ext)) {
        const text = fs.readFileSync(filePath, 'utf-8');
        return { success: true, content: text, type: 'text' };
      }

      // Pour les images ou autres formats non textuels
      return { success: false, error: 'Format non supporté pour l\'extraction textuelle' };

    } catch (error) {
      console.error('[MAIN] Erreur extraction contenu:', error);
      return { success: false, error: error.message }; 
    }
  });

  // ============================================================
  // LINKEDIN IMPORT
  // ============================================================

  ipcMain.handle('import-linkedin', async (event, { url }) => {
    try {
      console.log('[SOUVERAIN] Import LinkedIn démarré:', url);

      if (!linkedInScraper) {
        return {
          success: false,
          error: 'LinkedIn scraper non initialisé'
        };
      }

      const result = await linkedInScraper.scrapeProfile(url);

      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Erreur lors de l\'import du profil LinkedIn'
        };
      }

      console.log('[SOUVERAIN] Profil LinkedIn importé avec succès');

      return {
        success: true,
        data: result.data
      };

    } catch (error) {
      console.error('[SOUVERAIN] Erreur import LinkedIn:', error);
      return {
        success: false,
        error: error.message || 'Erreur inattendue lors de l\'import'
      };
    }
  });

  // ============================================================
  // VAULT & HISTORY
  // ============================================================

  ipcMain.handle('save-to-vault', async (e, data) => {
    try {
      return dbManager.saveFullAnalysis(data.filename, data.raw, data.result);
    } catch (err) {
      return { error: err.message };
    }
  });

  ipcMain.handle('load-history', async () => {
    try {
      return dbManager.getHistory();
    } catch {
      return [];
    }
  });

  ipcMain.handle('get-analysis-by-id', async (event, id) => {
    try {
      return dbManager.getAnalysisById(id);
    } catch (error) {
      console.error('[MAIN] Erreur récupération analyse:', error);
      return null;
    }
  });

  ipcMain.handle('save-pdf', async (e, buffer) => {
    try {
      const { canceled, filePath } = await dialog.showSaveDialog({
        title: "Sauvegarder le CV",
        defaultPath: 'cv_analyse.pdf',
        filters: [{ name: 'PDF', extensions: ['pdf'] }]
      });

      if (canceled || !filePath) return { success: false, error: 'Annulé' };

      fs.writeFileSync(filePath, buffer);
      return { success: true, path: filePath };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  console.log('[CV Handlers] ✅ 7 handlers registered');
}

module.exports = { registerCVHandlers };
