/**
 * SOUVERAIN - Configuration des formats de fichiers
 * Paramètres d'extraction et de compression par format
 */

import type { FormatCategory, SupportedFormat } from '../types/formats';

// ============================================================
// CONFIGURATION DE COMPRESSION
// ============================================================

export interface CompressionConfig {
  format: SupportedFormat;
  enabled: boolean;
  quality: number;              // 0-100
  maxWidth: number;             // Largeur max en pixels
  maxHeight: number;            // Hauteur max en pixels
  thumbnailWidth: number;       // Largeur thumbnail
  outputFormat: 'jpeg' | 'webp' | 'png';
}

export const IMAGE_COMPRESSION: Record<string, CompressionConfig> = {
  jpg: {
    format: 'jpg',
    enabled: true,
    quality: 85,
    maxWidth: 2400,
    maxHeight: 2400,
    thumbnailWidth: 400,
    outputFormat: 'jpeg',
  },
  jpeg: {
    format: 'jpeg',
    enabled: true,
    quality: 85,
    maxWidth: 2400,
    maxHeight: 2400,
    thumbnailWidth: 400,
    outputFormat: 'jpeg',
  },
  png: {
    format: 'png',
    enabled: true,
    quality: 90,
    maxWidth: 2400,
    maxHeight: 2400,
    thumbnailWidth: 400,
    outputFormat: 'png',
  },
  webp: {
    format: 'webp',
    enabled: true,
    quality: 85,
    maxWidth: 2400,
    maxHeight: 2400,
    thumbnailWidth: 400,
    outputFormat: 'webp',
  },
  gif: {
    format: 'gif',
    enabled: false,             // GIF : pas de compression pour préserver l'animation
    quality: 100,
    maxWidth: 1200,
    maxHeight: 1200,
    thumbnailWidth: 400,
    outputFormat: 'png',        // Thumbnail en PNG
  },
};

// ============================================================
// CONFIGURATION VIDÉO
// ============================================================

export interface VideoConfig {
  format: SupportedFormat;
  thumbnailTime: number;        // Temps en secondes pour le thumbnail
  thumbnailWidth: number;
  thumbnailFormat: 'jpg' | 'png';
  maxDuration: number;          // Durée max en secondes
}

export const VIDEO_CONFIG: Record<string, VideoConfig> = {
  mp4: {
    format: 'mp4',
    thumbnailTime: 1,           // 1 seconde
    thumbnailWidth: 400,
    thumbnailFormat: 'jpg',
    maxDuration: 300,           // 5 minutes
  },
  mov: {
    format: 'mov',
    thumbnailTime: 1,
    thumbnailWidth: 400,
    thumbnailFormat: 'jpg',
    maxDuration: 300,
  },
  avi: {
    format: 'avi',
    thumbnailTime: 1,
    thumbnailWidth: 400,
    thumbnailFormat: 'jpg',
    maxDuration: 300,
  },
};

// ============================================================
// CONFIGURATION PDF
// ============================================================

export interface PdfConfig {
  extractText: boolean;
  extractImages: boolean;
  maxPages: number;
  thumbnailPage: number;        // Page pour le thumbnail (0 = première)
  thumbnailWidth: number;
  thumbnailDpi: number;
}

export const PDF_CONFIG: PdfConfig = {
  extractText: true,
  extractImages: true,
  maxPages: 50,
  thumbnailPage: 0,
  thumbnailWidth: 400,
  thumbnailDpi: 150,
};

// ============================================================
// CONFIGURATION PPTX
// ============================================================

export interface PptxConfig {
  extractText: boolean;
  extractImages: boolean;
  extractSlides: boolean;
  maxSlides: number;
  slideWidth: number;
}

export const PPTX_CONFIG: PptxConfig = {
  extractText: true,
  extractImages: true,
  extractSlides: true,
  maxSlides: 100,
  slideWidth: 800,
};

// ============================================================
// CONFIGURATION DOCX
// ============================================================

export interface DocxConfig {
  extractText: boolean;
  extractImages: boolean;
  preserveFormatting: boolean;
}

export const DOCX_CONFIG: DocxConfig = {
  extractText: true,
  extractImages: true,
  preserveFormatting: true,
};

// ============================================================
// TAILLES DE STOCKAGE
// ============================================================

export const STORAGE_LIMITS = {
  // Limites par fichier
  maxFileSize: {
    image: 20 * 1024 * 1024,    // 20 Mo
    document: 50 * 1024 * 1024,  // 50 Mo
    video: 500 * 1024 * 1024,    // 500 Mo
    presentation: 100 * 1024 * 1024, // 100 Mo
  },

  // Limites par portfolio
  maxTotalStorage: 2 * 1024 * 1024 * 1024, // 2 Go

  // Nombre max d'assets
  maxAssets: 500,

  // Taille max thumbnail
  maxThumbnailSize: 500 * 1024, // 500 Ko
};

// ============================================================
// HELPERS
// ============================================================

/**
 * Récupère la config de compression pour un format
 */
export function getCompressionConfig(extension: string): CompressionConfig | undefined {
  const ext = extension.toLowerCase().replace('.', '');
  return IMAGE_COMPRESSION[ext];
}

/**
 * Récupère la config vidéo pour un format
 */
export function getVideoConfig(extension: string): VideoConfig | undefined {
  const ext = extension.toLowerCase().replace('.', '');
  return VIDEO_CONFIG[ext];
}

/**
 * Vérifie si un fichier dépasse la limite de taille
 */
export function isFileSizeAllowed(category: FormatCategory, sizeInBytes: number): boolean {
  const limit = STORAGE_LIMITS.maxFileSize[category];
  return sizeInBytes <= limit;
}

/**
 * Calcule les dimensions après compression
 */
export function calculateResizedDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  let width = originalWidth;
  let height = originalHeight;

  if (width > maxWidth) {
    height = Math.round((height * maxWidth) / width);
    width = maxWidth;
  }

  if (height > maxHeight) {
    width = Math.round((width * maxHeight) / height);
    height = maxHeight;
  }

  return { width, height };
}

/**
 * Détermine si une image nécessite une compression
 */
export function needsCompression(
  extension: string,
  width: number,
  height: number,
  sizeInBytes: number
): boolean {
  const config = getCompressionConfig(extension);
  if (!config || !config.enabled) return false;

  // Compresse si l'image est trop grande en dimensions
  if (width > config.maxWidth || height > config.maxHeight) return true;

  // Compresse si l'image est trop lourde (> 1 Mo)
  if (sizeInBytes > 1024 * 1024) return true;

  return false;
}
