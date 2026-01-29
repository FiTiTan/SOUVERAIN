/**
 * SOUVERAIN - Image Extractor
 * Extraction des métadonnées EXIF et compression des images
 * Formats supportés : JPG, JPEG, PNG, WebP, GIF
 */

import type { SupportedFormat } from '../../types/formats';
import type { Extractor, ExtractionResult, ExtractorOptions, ExtractedElement } from './index';
import { getCompressionConfig, calculateResizedDimensions, needsCompression } from '../../config/formats';

// ============================================================
// TYPES SPÉCIFIQUES
// ============================================================

export interface ImageMetadata {
  width: number;
  height: number;
  format: string;
  // EXIF data
  dateTaken?: string;
  camera?: string;
  lens?: string;
  focalLength?: string;
  aperture?: string;
  shutterSpeed?: string;
  iso?: number;
  gpsLatitude?: number;
  gpsLongitude?: number;
  // Other
  orientation?: number;
  colorSpace?: string;
  hasAlpha?: boolean;
}

export interface ImageExtractionResult extends ExtractionResult {
  originalPath: string;
  compressedPath?: string;
  metadata: ImageMetadata;
}

// ============================================================
// IMAGE EXTRACTOR CLASS
// ============================================================

export class ImageExtractor implements Extractor {
  private supportedFormats: SupportedFormat[] = ['jpg', 'jpeg', 'png', 'webp', 'gif'];

  getSupportedFormats(): SupportedFormat[] {
    return this.supportedFormats;
  }

  async extract(filePath: string, options: ExtractorOptions): Promise<ExtractionResult> {
    try {
      // Cette méthode sera appelée côté main process
      // Elle utilise sharp et exif-parser

      const result = await this.extractViaIPC(filePath, options);
      return result;

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur d\'extraction image',
        elements: [],
      };
    }
  }

  /**
   * Extraction via IPC (appel au main process)
   */
  private async extractViaIPC(
    filePath: string,
    options: ExtractorOptions
  ): Promise<ExtractionResult> {
    // Appel IPC vers le main process
    if (typeof window !== 'undefined' && window.electron?.extractors) {
      return await window.electron.extractors.extractImage(filePath, options);
    }

    // Fallback pour environnement non-Electron (dev)
    return this.mockExtraction(filePath, options);
  }

  /**
   * Mock extraction pour développement/tests
   */
  private mockExtraction(filePath: string, options: ExtractorOptions): ExtractionResult {
    const fileName = filePath.split(/[/\\]/).pop() || 'image';
    const extension = filePath.split('.').pop()?.toLowerCase() || 'jpg';

    const element: ExtractedElement = {
      type: 'image',
      index: 0,
      contentPath: filePath,
      width: 1920,
      height: 1080,
      metadata: {
        format: extension,
        dateTaken: new Date().toISOString(),
      },
    };

    return {
      success: true,
      elements: [element],
      thumbnailPath: filePath,
      metadata: {
        width: 1920,
        height: 1080,
        format: extension,
      },
    };
  }
}

// ============================================================
// MAIN PROCESS IMPLEMENTATION
// ============================================================

/**
 * Implémentation côté main process (CommonJS)
 * À placer dans un fichier .cjs séparé pour le main process
 */
export const imageExtractorMainProcess = `
const sharp = require('sharp');
const ExifParser = require('exif-parser');
const fs = require('fs');
const path = require('path');

async function extractImage(filePath, options) {
  try {
    // Lire le fichier
    const buffer = fs.readFileSync(filePath);

    // Extraire les métadonnées avec sharp
    const image = sharp(buffer);
    const metadata = await image.metadata();

    // Extraire EXIF si disponible (JPEG)
    let exifData = {};
    if (metadata.format === 'jpeg') {
      try {
        const parser = ExifParser.create(buffer);
        const result = parser.parse();
        exifData = result.tags || {};
      } catch (e) {
        // EXIF non disponible
      }
    }

    // Préparer les métadonnées
    const imageMetadata = {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      hasAlpha: metadata.hasAlpha,
      orientation: metadata.orientation,
      dateTaken: exifData.DateTimeOriginal
        ? new Date(exifData.DateTimeOriginal * 1000).toISOString()
        : undefined,
      camera: exifData.Make && exifData.Model
        ? \`\${exifData.Make} \${exifData.Model}\`.trim()
        : undefined,
      focalLength: exifData.FocalLength ? \`\${exifData.FocalLength}mm\` : undefined,
      aperture: exifData.FNumber ? \`f/\${exifData.FNumber}\` : undefined,
      iso: exifData.ISO,
      gpsLatitude: exifData.GPSLatitude,
      gpsLongitude: exifData.GPSLongitude,
    };

    // Générer thumbnail si demandé
    let thumbnailPath = undefined;
    if (options.generateThumbnail) {
      const thumbWidth = options.thumbnailWidth || 400;
      const thumbFileName = path.basename(filePath, path.extname(filePath)) + '_thumb.jpg';
      thumbnailPath = path.join(options.outputDir, thumbFileName);

      await sharp(buffer)
        .resize(thumbWidth, null, { withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);
    }

    // Compresser si nécessaire
    let compressedPath = undefined;
    const ext = path.extname(filePath).toLowerCase().replace('.', '');
    const needsCompress = metadata.width > 2400 || metadata.height > 2400 || buffer.length > 1024 * 1024;

    if (needsCompress) {
      const compFileName = path.basename(filePath, path.extname(filePath)) + '_compressed.jpg';
      compressedPath = path.join(options.outputDir, compFileName);

      await sharp(buffer)
        .resize(2400, 2400, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toFile(compressedPath);
    }

    // Retourner le résultat
    return {
      success: true,
      elements: [{
        type: 'image',
        index: 0,
        contentPath: compressedPath || filePath,
        width: imageMetadata.width,
        height: imageMetadata.height,
        metadata: imageMetadata,
      }],
      thumbnailPath,
      metadata: imageMetadata,
    };

  } catch (error) {
    return {
      success: false,
      error: error.message,
      elements: [],
    };
  }
}

module.exports = { extractImage };
`;

// ============================================================
// SINGLETON EXPORT
// ============================================================

export const imageExtractor = new ImageExtractor();
