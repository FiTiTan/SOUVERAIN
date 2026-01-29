import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path'; // Renamed to nodepath for clarity
import * as nodepath from 'path';
import fs from 'fs/promises';
import { mediathequeService } from './services/mediathequeService'; // Import mediathequeService
import { generateThumbnail } from './utils/thumbnailGenerator'; // Import generateThumbnail

// Define the base directory for mediatheque files
const mediathequeBaseDir = nodepath.join(app.getPath('userData'), 'mediatheque_files');

// Ensure the directory exists
async function ensureMediathequeDir() {
  try {
    await fs.mkdir(mediathequeBaseDir, { recursive: true });
    console.log(`Mediatheque directory ensured at: ${mediathequeBaseDir}`);
  } catch (error) {
    console.error('Failed to ensure mediatheque directory:', error);
  }
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false, // On ne l'affiche que quand elle est prête (évite le flash blanc)
    // Dans src/main/main.ts, modifie l'objet webPreferences :
// Dans src/main/main.ts
webPreferences: {
  // On essaie de pointer vers le dossier 'out' ou 'dist' où Vite compile tes fichiers
  preload: nodepath.join(__dirname, '../preload/index.js'), 
  contextIsolation: true,
  nodeIntegration: false,
},
  });

  // Optimisation de l'affichage
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Gestion de l'URL de développement (Vite) ou de production
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(nodepath.join(__dirname, '../dist/index.html'));
  }
}

// --- ÉCOUTEURS D'ÉVÉNEMENTS (IPC) ---

/**
 * Canal de sauvegarde locale
 * Correspond à l'appel 'saveCaseEcole' dans ton Preload
 */
ipcMain.handle('saveCaseEcole', async (_event, data) => {
  console.log("-----------------------------------------");
  console.log("SIGNAL REÇU DANS LE MAIN PROCESS");
  console.log("Données à sauvegarder :", data);
  console.log("-----------------------------------------");

  // Simulation d'écriture en base de données
  // La Phase 1 (SQLite) viendra se brancher ici
  return { 
    success: true, 
    message: "Le pont fonctionne ! Données reçues par le système local." 
  };
});

// Mediatheque IPC handlers
ipcMain.handle('mediatheque-create-item', async (_event, item) => {
  return mediathequeService.createMediathequeItem(item);
});

ipcMain.handle('mediatheque-get-item-by-id', async (_event, id) => {
  return mediathequeService.getMediathequeItemById(id);
});

ipcMain.handle('mediatheque-get-all-items-by-portfolio-id', async (_event, portfolioId) => {
  return mediathequeService.getAllMediathequeItemsByPortfolioId(portfolioId);
});

ipcMain.handle('mediatheque-update-item', async (_event, id, updates) => {
  return mediathequeService.updateMediathequeItem(id, updates);
});

ipcMain.handle('mediatheque-delete-item', async (_event, id) => {
  return mediathequeService.deleteMediathequeItem(id);
});

// File System IPC handlers for Mediatheque files
ipcMain.handle('file-system-save-mediatheque-file', async (_event, portfolioId: string, fileName: string, fileBuffer: ArrayBuffer, fileType: string) => {
  try {
    const portfolioDir = nodepath.join(mediathequeBaseDir, portfolioId);
    await fs.mkdir(portfolioDir, { recursive: true }); // Ensure portfolio-specific directory exists
    
    const filePath = nodepath.join(portfolioDir, fileName);
    await fs.writeFile(filePath, Buffer.from(fileBuffer)); // Write ArrayBuffer to file

    let thumbnailPath: string | null = null;
    try {
        thumbnailPath = await generateThumbnail(filePath, portfolioDir, fileType);
    } catch (thumbError) {
        console.warn(`Could not generate thumbnail for ${fileName}:`, thumbError);
    }
    
    return { success: true, filePath: filePath, thumbnailPath: thumbnailPath };
  } catch (error: any) {
    console.error('Failed to save mediatheque file:', error);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('file-system-delete-mediatheque-file', async (_event, filePath: string) => {
  try {
    // Basic security check: ensure the file is within the mediatheque directory
    // This is important to prevent arbitrary file deletion
    if (!filePath.startsWith(mediathequeBaseDir)) {
      throw new Error('Attempted to delete file outside mediatheque directory.');
    }
    
    await fs.unlink(filePath);
    return { success: true };
  } catch (error: any) {
    console.error('Failed to delete mediatheque file:', error);
    return { success: false, error: error.message };
  }
});


// --- CYCLE DE VIE DE L'APP ---

app.whenReady().then(() => {
  ensureMediathequeDir(); // Ensure mediatheque directory exists when app is ready
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});