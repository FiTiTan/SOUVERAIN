// src/main/preload.ts (ou src/preload.ts)
import { contextBridge, ipcRenderer } from 'electron';

// On ajoute un log pour confirmer le chargement dans la console (F12 dans l'app)
console.log("Pont Electron : Initialisation...");

contextBridge.exposeInMainWorld('electronAPI', {
  saveCasEcole: (data: any) => ipcRenderer.invoke('save-cas-ecole', data),
});