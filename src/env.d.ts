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

  // CV Analysis
  analyzeCV: (params: { cvText: string; filename: string }) => Promise<any>;
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
}

declare global {
  interface Window {
    electron: IElectronAPI;
  }
}

export {};
