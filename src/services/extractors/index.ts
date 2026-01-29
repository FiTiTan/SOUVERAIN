/**
 * SOUVERAIN - Extractors Factory
 * Factory pour créer l'extracteur approprié selon le format de fichier
 */

import type { FormatCategory, SupportedFormat } from '../../types/formats';
import { getFormatByExtension, getFormatByMimeType } from '../../types/formats';

// ============================================================
// TYPES
// ============================================================

export interface ExtractionResult {
  success: boolean;
  error?: string;
  elements: ExtractedElement[];
  metadata?: Record<string, unknown>;
  thumbnailPath?: string;
}

export interface ExtractedElement {
  type: 'image' | 'text' | 'video_thumbnail' | 'slide';
  index: number;
  contentPath?: string;         // Chemin vers le fichier extrait
  contentText?: string;         // Texte extrait
  width?: number;
  height?: number;
  metadata?: Record<string, unknown>;
}

export interface ExtractorOptions {
  outputDir: string;            // Dossier de sortie pour les fichiers extraits
  generateThumbnail?: boolean;
  thumbnailWidth?: number;
  maxPages?: number;            // Pour PDF
  maxSlides?: number;           // Pour PPTX
}

export interface Extractor {
  extract(filePath: string, options: ExtractorOptions): Promise<ExtractionResult>;
  getSupportedFormats(): SupportedFormat[];
}

// ============================================================
// EXTRACTORS REGISTRY
// ============================================================

// Les extracteurs seront enregistrés ici
const extractors: Map<FormatCategory, Extractor> = new Map();

/**
 * Enregistre un extracteur pour une catégorie de format
 */
export function registerExtractor(category: FormatCategory, extractor: Extractor): void {
  extractors.set(category, extractor);
}

/**
 * Récupère l'extracteur approprié pour un fichier
 */
export function getExtractor(filePathOrExtension: string): Extractor | undefined {
  const extension = filePathOrExtension.includes('.')
    ? filePathOrExtension.split('.').pop()?.toLowerCase() || ''
    : filePathOrExtension.toLowerCase();

  const format = getFormatByExtension(extension);
  if (!format) return undefined;

  return extractors.get(format.category);
}

/**
 * Récupère l'extracteur par mime type
 */
export function getExtractorByMimeType(mimeType: string): Extractor | undefined {
  const format = getFormatByMimeType(mimeType);
  if (!format) return undefined;

  return extractors.get(format.category);
}

/**
 * Extrait les éléments d'un fichier
 */
export async function extractFile(
  filePath: string,
  options: ExtractorOptions
): Promise<ExtractionResult> {
  const extractor = getExtractor(filePath);

  if (!extractor) {
    const extension = filePath.split('.').pop()?.toLowerCase() || 'inconnu';
    return {
      success: false,
      error: `Format non supporté: ${extension}`,
      elements: [],
    };
  }

  try {
    return await extractor.extract(filePath, options);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur d\'extraction',
      elements: [],
    };
  }
}

/**
 * Vérifie si un format est extractible
 */
export function canExtract(filePathOrExtension: string): boolean {
  return getExtractor(filePathOrExtension) !== undefined;
}

// ============================================================
// HELPERS
// ============================================================

/**
 * Génère un nom de fichier unique pour les éléments extraits
 */
export function generateExtractedFileName(
  originalName: string,
  elementIndex: number,
  extension: string
): string {
  const baseName = originalName.replace(/\.[^/.]+$/, '');
  const sanitized = baseName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const timestamp = Date.now();
  return `${sanitized}_${timestamp}_${elementIndex}.${extension}`;
}

/**
 * Crée le dossier de sortie si nécessaire
 */
export async function ensureOutputDir(outputDir: string): Promise<void> {
  // Cette fonction sera appelée côté main process via IPC
  // Placeholder pour l'instant
}
