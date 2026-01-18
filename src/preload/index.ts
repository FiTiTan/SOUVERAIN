// src/preload/index.ts
import { contextBridge, ipcRenderer } from 'electron'

// On expose les fonctions au monde "Renderer" (React)
contextBridge.exposeInMainWorld('electron', {
  saveCaseEcole: (data: any) => ipcRenderer.invoke('saveCaseEcole', data),
})