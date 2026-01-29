/**
 * SOUVERAIN - PDF Extractor
 * Extraction de texte et images depuis les fichiers PDF
 * Utilise pdf-parse pour le texte et pdf-lib pour les images
 */

import type { SupportedFormat } from '../../types/formats';
import type { Extractor, ExtractionResult, ExtractorOptions, ExtractedElement } from './index';
import { PDF_CONFIG } from '../../config/formats';

// ============================================================
// TYPES SPÉCIFIQUES
// ============================================================

export interface PdfMetadata {
  pageCount: number;
  title?: string;
  author?: string;
  subject?: string;
  keywords?: string[];
  creator?: string;
  producer?: string;
  creationDate?: string;
  modificationDate?: string;
}

export interface PdfPage {
  pageNumber: number;
  text: string;
  images: string[];      // Chemins vers les images extraites
  width: number;
  height: number;
}

// ============================================================
// PDF EXTRACTOR CLASS
// ============================================================

export class PdfExtractor implements Extractor {
  private supportedFormats: SupportedFormat[] = ['pdf'];

  getSupportedFormats(): SupportedFormat[] {
    return this.supportedFormats;
  }

  async extract(filePath: string, options: ExtractorOptions): Promise<ExtractionResult> {
    try {
      const result = await this.extractViaIPC(filePath, options);
      return result;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur d\'extraction PDF',
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
    if (typeof window !== 'undefined' && window.electron?.extractors) {
      return await window.electron.extractors.extractPdf(filePath, options);
    }

    // Fallback mock
    return this.mockExtraction(filePath, options);
  }

  /**
   * Mock extraction pour développement/tests
   */
  private mockExtraction(filePath: string, options: ExtractorOptions): ExtractionResult {
    const elements: ExtractedElement[] = [
      {
        type: 'text',
        index: 0,
        contentText: 'Contenu du PDF (mock)',
        metadata: {
          pageNumber: 1,
        },
      },
    ];

    return {
      success: true,
      elements,
      thumbnailPath: undefined,
      metadata: {
        pageCount: 1,
        title: 'Document PDF',
      },
    };
  }
}

// ============================================================
// MAIN PROCESS IMPLEMENTATION
// ============================================================

export const pdfExtractorMainProcess = `
const pdfParse = require('pdf-parse');
const { PDFDocument } = require('pdf-lib');
const sharp = require('sharp');
const fs = require('fs/promises');
const path = require('path');
const { createCanvas } = require('canvas');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

async function generateThumbnail(dataBuffer, outputDir, scale = 0.5) {
  const thumbnailPath = path.join(outputDir, 'thumbnail.png');
  try {
    const loadingTask = pdfjsLib.getDocument({ data: dataBuffer });
    const pdfDocument = await loadingTask.promise;
    if (pdfDocument.numPages === 0) return null;

    const page = await pdfDocument.getPage(1);
    const viewport = page.getViewport({ scale });
    
    const canvas = createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext('2d');

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };
    await page.render(renderContext).promise;

    const imageBuffer = canvas.toBuffer('image/png');
    await fs.writeFile(thumbnailPath, imageBuffer);

    // Clean up memory
    pdfDocument.cleanup();
    
    return thumbnailPath;
  } catch (thumbError) {
    console.error('Error generating PDF thumbnail:', thumbError.message);
    return null;
  }
}

async function extractPdf(filePath, options) {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const elements = [];
    let imageIndex = 0;
    const outputDir = options.outputDir || path.dirname(filePath);
    await fs.mkdir(outputDir, { recursive: true });

    // --- 1. Extraction de texte et métadonnées avec pdf-parse ---
    const pdfData = await pdfParse(dataBuffer);
    const metadata = {
      pageCount: pdfData.numpages,
      title: pdfData.info?.Title,
      author: pdfData.info?.Author,
      subject: pdfData.info?.Subject,
      creator: pdfData.info?.Creator,
      producer: pdfData.info?.Producer,
      creationDate: pdfData.info?.CreationDate,
      modificationDate: pdfData.info?.ModDate,
    };

    if (pdfData.text && pdfData.text.trim().length > 0) {
      elements.push({
        type: 'text',
        index: 0,
        contentText: pdfData.text,
        metadata: { pageCount: pdfData.numpages },
      });
    }

    // --- 2. Extraction des images avec pdf-lib ---
    try {
      const pdfDoc = await PDFDocument.load(dataBuffer, {
        ignoreEncryption: true,
      });

      for (const page of pdfDoc.getPages()) {
        const xObjects = page.getXObjects();
        for (const [name, xObject] of xObjects.entries()) {
          if (xObject.tag === 'PDFImage') {
            const image = xObject;
            try {
              // Tenter de reconstruire l'image avec Sharp pour la normaliser
              const imageBytes = await image.embed();
              const { width, height } = image.size();
              
              const outputFilename = `pdf-image-${imageIndex}.png`;
              const outputPath = path.join(outputDir, outputFilename);

              await sharp(imageBytes).png().toFile(outputPath);

              elements.push({
                type: 'image',
                index: imageIndex,
                contentPath: outputPath,
                metadata: {
                  source: 'pdf-extraction',
                  width,
                  height,
                  page: page.ref.objectNumber,
                },
              });
              imageIndex++;

            } catch (embedError) {
              // console.warn('Could not embed or process image:', embedError.message);
            }
          }
        }
      }
    } catch (pdfLibError) {
      console.warn('PDF-Lib image extraction failed:', pdfLibError.message);
    }


    // --- 3. Génération de la miniature ---
    let thumbnailPath = undefined;
    if (options.generateThumbnail) {
      thumbnailPath = await generateThumbnail(dataBuffer, outputDir);
    }

    return {
      success: true,
      elements,
      thumbnailPath,
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

module.exports = { extractPdf };
`;

// ============================================================
// SINGLETON EXPORT
// ============================================================

export const pdfExtractor = new PdfExtractor();
