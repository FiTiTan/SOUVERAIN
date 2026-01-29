/// <reference types="vite/client" />

// ============================================================
// VAULT TYPES
// ============================================================

export type VaultCategory =
  | 'cv'
  | 'cover_letter'
  | 'portfolio'
  | 'certificate'
  | 'reference'
  | 'contract'
  | 'payslip'
  | 'other';

export interface VaultDocument {
  id: string;
  name: string;
  category: VaultCategory;
  file_type: string;
  file_size: number;
  tags: string[];
  notes: string;
  created_at: string;
  updated_at: string;
  is_favorite: boolean;
}

export interface VaultFilters {
  category?: VaultCategory;
  search?: string;
  sortBy?: 'created_at' | 'name' | 'category' | 'file_size';
  sortOrder?: 'ASC' | 'DESC';
  is_favorite?: boolean;
}

// ============================================================
// ELECTRON API TYPES
// ============================================================

export interface IElectronAPI {
  // System
  getSystemStatus: () => Promise<{ groq: any; ready: boolean }>;
  openExternal: (url: string) => Promise<{ success: boolean; error?: string }>;
  readFileAsBase64: (filePath: string) => Promise<string | null>; // Added

  // CV Analysis
  analyzeCV: (params: { cvText: string; filename: string; skipAnonymization?: boolean }) => Promise<any>;
  importCV: () => Promise<{ text: string; filename: string; charCount: number } | null>;
  saveToVault: (data: { filename: string; raw: string; result: string }) => Promise<any>;
  loadHistory: () => Promise<any[]>;
  savePDF: (buffer: ArrayBuffer) => Promise<{ success: boolean; path?: string; error?: string }>;

  // Vault (Coffre-Fort)
  vault: {
    getDocuments: (
      filters?: VaultFilters
    ) => Promise<{ success: boolean; documents: VaultDocument[]; error?: string }>;
    getDocument: (
      id: string
    ) => Promise<{ success: boolean; document?: VaultDocument; error?: string }>;
    addDocument: (
      file: { buffer: ArrayBuffer; size: number },
      metadata: {
        name: string;
        category: VaultCategory;
        file_type: string;
        tags?: string[];
        notes?: string;
      }
    ) => Promise<{
      success: boolean;
      document?: VaultDocument;
      error?: string;
      message?: string;
    }>;
    updateDocument: (
      id: string,
      updates: Partial<{
        name: string;
        category: VaultCategory;
        tags: string[];
        notes: string;
        is_favorite: boolean;
      }>
    ) => Promise<{ success: boolean; error?: string }>;
    deleteDocument: (id: string) => Promise<{ success: boolean; error?: string }>;
    downloadDocument: (id: string) => Promise<{ success: boolean; path?: string; error?: string }>;
    countDocuments: () => Promise<{ success: boolean; count: number; error?: string }>;
  };

  // Portfolio V2 (Refonte Universel)
  portfolioV2: {
    // Portfolios
    create: (data: any) => Promise<{ success: boolean; id?: string; error?: string }>;
    getAll: (userId?: string) => Promise<any[]>;
    getById: (id: string) => Promise<any | null>;
    update: (id: string, updates: any) => Promise<{ success: boolean; error?: string }>;
    delete: (id: string) => Promise<{ success: boolean; error?: string }>;
    count: (userId?: string) => Promise<number>;
    saveFile: (portfolioId: string, fileName: string, buffer: ArrayBuffer) => Promise<{ success: boolean; path?: string; relativePath?: string; error?: string }>;

    // Profils
    independant: {
      create: (data: any) => Promise<{ success: boolean; id?: string; error?: string }>;
      get: (portfolioId: string) => Promise<any | null>;
      update: (portfolioId: string, updates: any) => Promise<{ success: boolean; error?: string }>;
    };
    commerce: {
      create: (data: any) => Promise<{ success: boolean; id?: string; error?: string }>;
      get: (portfolioId: string) => Promise<any | null>;
      update: (portfolioId: string, updates: any) => Promise<{ success: boolean; error?: string }>;
    };

    // Assets
    assets: {
      create: (data: any) => Promise<{ success: boolean; id?: string; error?: string }>;
      getByPortfolio: (portfolioId: string) => Promise<any[]>;
      delete: (id: string) => Promise<{ success: boolean; error?: string }>;
    };

    // Elements
    elements: {
      create: (data: any) => Promise<{ success: boolean; id?: string; error?: string }>;
      getByPortfolio: (portfolioId: string) => Promise<any[]>;
      updateClassification: (id: string, classification: any) => Promise<{ success: boolean; error?: string }>;
      delete: (id: string) => Promise<{ success: boolean; error?: string }>;
    };

    // Projects V2
    projects: {
      create: (data: any) => Promise<{ success: boolean; id?: string; error?: string }>;
      getByPortfolio: (portfolioId: string) => Promise<any[]>;
      getById: (id: string) => Promise<any | null>;
      update: (id: string, updates: any) => Promise<{ success: boolean; error?: string }>;
      delete: (id: string) => Promise<{ success: boolean; error?: string }>;
      addElement: (data: any) => Promise<{ success: boolean; id?: string; error?: string }>;
      getElements: (projectId: string) => Promise<any[]>;
      removeElement: (projectId: string, elementId: string) => Promise<{ success: boolean; error?: string }>;
    };
  };

  // Extractors
  extractors: {
    extractImage: (filePath: string, options?: any) => Promise<any>;
    extractPdf: (filePath: string, options?: any) => Promise<any>;
    extractVideo: (filePath: string, options?: any) => Promise<any>;
    extractFile: (filePath: string, options?: any) => Promise<any>;
    generateThumbnail: (filePath: string, outputPath: string, options?: any) => Promise<any>;
  };

  // Ollama (Classification IA Locale)
  ollama: {
    checkAvailability: () => Promise<{ available: boolean; model?: string; error?: string; modelsAvailable?: string[] }>;
    classifyElement: (request: any) => Promise<{ success: boolean; classification?: any; processingTime?: number; error?: string }>;
  };
}

declare global {
  interface Window {
    electron: IElectronAPI;
  }
}

export {};
