/**
 * SOUVERAIN - Extractors Service
 * Services d'extraction pour images, PDF, vidéos
 * Supporte le Portfolio V2 universel
 */

const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Note: Les dépendances natives (sharp, exif-parser, ffmpeg) devront être installées
// Pour l'instant on crée les wrappers qui seront implémentés progressivement

// ============================================================
// IMAGE EXTRACTOR
// ============================================================

class ImageExtractor {
  /**
   * Extrait les métadonnées et compresse une image
   */
  async extract(filePath, options = {}) {
    try {
      const { portfolioId, thumbnailWidth = 400, maxWidth = 2400 } = options;

      // TODO: Implémenter extraction EXIF avec exif-parser
      // TODO: Implémenter compression avec sharp

      const stats = await fs.stat(filePath);
      const extension = path.extname(filePath).toLowerCase().replace('.', '');
      const filename = path.basename(filePath);

      // Pour l'instant, retourner les infos basiques
      const metadata = {
        width: 1920, // Mock - à remplacer par vraies dimensions
        height: 1080,
        format: extension,
        fileSize: stats.size,
        dateTaken: stats.birthtime.toISOString(),
      };

      const element = {
        id: uuidv4(),
        type: 'image',
        index: 0,
        contentPath: filePath,
        width: metadata.width,
        height: metadata.height,
        metadata,
      };

      return {
        success: true,
        elements: [element],
        originalPath: filePath,
        metadata,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        elements: [],
      };
    }
  }

  /**
   * Génère un thumbnail
   */
  async generateThumbnail(filePath, outputPath, width = 400) {
    try {
      // TODO: Implémenter avec sharp
      // await sharp(filePath).resize(width).toFile(outputPath);

      // Pour l'instant, copier le fichier original
      await fs.copyFile(filePath, outputPath);

      return { success: true, path: outputPath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Extrait les données EXIF
   */
  async extractExif(filePath) {
    try {
      // TODO: Implémenter avec exif-parser
      // const buffer = await fs.readFile(filePath);
      // const parser = require('exif-parser').create(buffer);
      // const result = parser.parse();

      return {
        success: true,
        exif: {},
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// ============================================================
// PDF EXTRACTOR
// ============================================================

class PdfExtractor {
  constructor() {
    // Réutiliser l'instance existante de pdf.js-extract
    const { PDFExtract } = require('pdf.js-extract');
    this.pdfExtract = new PDFExtract();
  }

  /**
   * Extrait le texte et les images d'un PDF
   */
  async extract(filePath, options = {}) {
    try {
      const { maxPages = 50 } = options;

      const data = await this.pdfExtract.extract(filePath, {});

      const elements = [];

      // Extraire le texte par page
      for (let i = 0; i < Math.min(data.pages.length, maxPages); i++) {
        const page = data.pages[i];
        const pageText = page.content.map(c => c.str).join(' ');

        if (pageText.trim().length > 0) {
          elements.push({
            id: uuidv4(),
            type: 'text',
            index: i,
            contentText: pageText,
            metadata: {
              pageNumber: i + 1,
              width: page.width,
              height: page.height,
            },
          });
        }
      }

      return {
        success: true,
        elements,
        metadata: {
          numPages: data.pages.length,
          pdfInfo: data.pdfInfo,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        elements: [],
      };
    }
  }

  /**
   * Génère un thumbnail de la première page
   */
  async generateThumbnail(filePath, outputPath) {
    try {
      // TODO: Implémenter génération thumbnail PDF
      // Nécessite pdf-lib ou pdf-to-png

      return { success: true, path: outputPath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// ============================================================
// VIDEO EXTRACTOR
// ============================================================

class VideoExtractor {
  /**
   * Extrait les métadonnées d'une vidéo
   */
  async extract(filePath, options = {}) {
    try {
      const stats = await fs.stat(filePath);
      const extension = path.extname(filePath).toLowerCase().replace('.', '');

      // TODO: Implémenter extraction métadonnées avec ffprobe
      // const ffprobe = require('ffprobe-static');

      const metadata = {
        format: extension,
        fileSize: stats.size,
        duration: 0, // Mock - à remplacer par vraie durée
        width: 1920,
        height: 1080,
        fps: 30,
      };

      const element = {
        id: uuidv4(),
        type: 'video_thumbnail',
        index: 0,
        contentPath: filePath,
        metadata,
      };

      return {
        success: true,
        elements: [element],
        metadata,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        elements: [],
      };
    }
  }

  /**
   * Génère un thumbnail vidéo
   */
  async generateThumbnail(filePath, outputPath, time = 1) {
    try {
      // TODO: Implémenter avec ffmpeg
      // const ffmpeg = require('fluent-ffmpeg');
      // ffmpeg(filePath).screenshots({
      //   timestamps: [time],
      //   filename: path.basename(outputPath),
      //   folder: path.dirname(outputPath),
      //   size: '400x?'
      // });

      return { success: true, path: outputPath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Extrait les métadonnées détaillées
   */
  async getMetadata(filePath) {
    try {
      // TODO: Implémenter avec ffprobe-static
      return {
        success: true,
        metadata: {},
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

// ============================================================
// FACTORY
// ============================================================

class ExtractorFactory {
  constructor() {
    this.imageExtractor = new ImageExtractor();
    this.pdfExtractor = new PdfExtractor();
    this.videoExtractor = new VideoExtractor();
  }

  /**
   * Récupère l'extracteur approprié pour un format
   */
  getExtractor(extension) {
    const ext = extension.toLowerCase().replace('.', '');

    const imageFormats = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
    const videoFormats = ['mp4', 'mov', 'avi'];

    if (imageFormats.includes(ext)) {
      return this.imageExtractor;
    }

    if (ext === 'pdf') {
      return this.pdfExtractor;
    }

    if (videoFormats.includes(ext)) {
      return this.videoExtractor;
    }

    return null;
  }

  /**
   * Extrait un fichier
   */
  async extract(filePath, options = {}) {
    const extension = path.extname(filePath);
    const extractor = this.getExtractor(extension);

    if (!extractor) {
      return {
        success: false,
        error: `Format non supporté: ${extension}`,
        elements: [],
      };
    }

    return await extractor.extract(filePath, options);
  }

  /**
   * Génère un thumbnail
   */
  async generateThumbnail(filePath, outputPath, options = {}) {
    const extension = path.extname(filePath);
    const extractor = this.getExtractor(extension);

    if (!extractor || !extractor.generateThumbnail) {
      return {
        success: false,
        error: `Génération thumbnail non supportée pour: ${extension}`,
      };
    }

    return await extractor.generateThumbnail(filePath, outputPath, options.width || options.time);
  }
}

// ============================================================
// EXPORTS
// ============================================================

module.exports = {
  ImageExtractor,
  PdfExtractor,
  VideoExtractor,
  ExtractorFactory,
};
