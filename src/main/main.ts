import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false, // On ne l'affiche que quand elle est prête (évite le flash blanc)
    // Dans src/main/main.ts, modifie l'objet webPreferences :
// Dans src/main/main.ts
webPreferences: {
  // On essaie de pointer vers le dossier 'out' ou 'dist' où Vite compile tes fichiers
  preload: path.join(__dirname, '../preload/index.js'), 
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
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
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

// --- CYCLE DE VIE DE L'APP ---

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});