// src/preload/index.ts
import { contextBridge, ipcRenderer } from 'electron'

// On expose les fonctions au monde "Renderer" (React)
contextBridge.exposeInMainWorld('electron', {
  saveCaseEcole: (data: any) => ipcRenderer.invoke('saveCaseEcole', data),
  mediatheque: {
    createItem: (item) => ipcRenderer.invoke('mediatheque-create-item', item),
    getItemById: (id) => ipcRenderer.invoke('mediatheque-get-item-by-id', id),
    getAllItemsByPortfolioId: (portfolioId) => ipcRenderer.invoke('mediatheque-get-all-items-by-portfolio-id', portfolioId),
    updateItem: (id, updates) => ipcRenderer.invoke('mediatheque-update-item', id, updates),
    deleteItem: (id) => ipcRenderer.invoke('mediatheque-delete-item', id),
  },
  fileSystem: {
    saveMediathequeFile: (portfolioId, fileName, fileBuffer, fileType) => ipcRenderer.invoke('file-system-save-mediatheque-file', portfolioId, fileName, fileBuffer, fileType),
    deleteMediathequeFile: (filePath) => ipcRenderer.invoke('file-system-delete-mediatheque-file', filePath),
  },
})