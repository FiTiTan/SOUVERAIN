/**
 * SOUVERAIN - Video Extractor
 * Extraction de thumbnails et métadonnées depuis les fichiers vidéo
 * Utilise ffmpeg via fluent-ffmpeg
 */

import type { SupportedFormat } from '../../types/formats';
import type { Extractor, ExtractionResult, ExtractorOptions, ExtractedElement } from './index';
import { VIDEO_CONFIG } from '../../config/formats';

// ============================================================
// TYPES SPÉCIFIQUES
// ============================================================

export interface VideoMetadata {
  duration: number;           // Durée en secondes
  width: number;
  height: number;
  codec: string;
  bitrate: number;
  fps: number;
  audioCodec?: string;
  audioChannels?: number;
  creationTime?: string;
}

// ============================================================
// VIDEO EXTRACTOR CLASS
// ============================================================

export class VideoExtractor implements Extractor {
  private supportedFormats: SupportedFormat[] = ['mp4', 'mov', 'avi'];

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
        error: error instanceof Error ? error.message : 'Erreur d\'extraction vidéo',
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
      return await window.electron.extractors.extractVideo(filePath, options);
    }

    // Fallback mock
    return this.mockExtraction(filePath, options);
  }

  /**
   * Mock extraction pour développement/tests
   */
  private mockExtraction(filePath: string, options: ExtractorOptions): ExtractionResult {
    const element: ExtractedElement = {
      type: 'video_thumbnail',
      index: 0,
      contentPath: undefined, // Pas de thumbnail en mock
      width: 1920,
      height: 1080,
      metadata: {
        duration: 120,
        codec: 'h264',
        fps: 30,
      },
    };

    return {
      success: true,
      elements: [element],
      thumbnailPath: undefined,
      metadata: {
        duration: 120,
        width: 1920,
        height: 1080,
        codec: 'h264',
        bitrate: 5000000,
        fps: 30,
      },
    };
  }
}

// ============================================================
// MAIN PROCESS IMPLEMENTATION
// ============================================================

export const videoExtractorMainProcess = `
const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const ffprobeStatic = require('ffprobe-static');
const fs = require('fs');
const path = require('path');

// Configurer les chemins ffmpeg
ffmpeg.setFfmpegPath(ffmpegStatic);
ffmpeg.setFfprobePath(ffprobeStatic.path);

function getVideoMetadata(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(err);
        return;
      }

      const videoStream = metadata.streams.find(s => s.codec_type === 'video');
      const audioStream = metadata.streams.find(s => s.codec_type === 'audio');

      resolve({
        duration: metadata.format.duration,
        width: videoStream?.width,
        height: videoStream?.height,
        codec: videoStream?.codec_name,
        bitrate: metadata.format.bit_rate,
        fps: videoStream?.r_frame_rate
          ? eval(videoStream.r_frame_rate)
          : undefined,
        audioCodec: audioStream?.codec_name,
        audioChannels: audioStream?.channels,
        creationTime: metadata.format.tags?.creation_time,
      });
    });
  });
}

function generateThumbnail(filePath, outputPath, time, width) {
  return new Promise((resolve, reject) => {
    ffmpeg(filePath)
      .screenshots({
        timestamps: [time],
        filename: path.basename(outputPath),
        folder: path.dirname(outputPath),
        size: width + 'x?',
      })
      .on('end', () => resolve(outputPath))
      .on('error', reject);
  });
}

async function extractVideo(filePath, options) {
  try {
    // Récupérer les métadonnées
    const metadata = await getVideoMetadata(filePath);

    // Vérifier la durée maximale
    const config = {
      mp4: { thumbnailTime: 1, thumbnailWidth: 400, maxDuration: 300 },
      mov: { thumbnailTime: 1, thumbnailWidth: 400, maxDuration: 300 },
      avi: { thumbnailTime: 1, thumbnailWidth: 400, maxDuration: 300 },
    };
    const ext = path.extname(filePath).toLowerCase().replace('.', '');
    const formatConfig = config[ext] || config.mp4;

    if (metadata.duration > formatConfig.maxDuration) {
      return {
        success: false,
        error: \`Vidéo trop longue (max \${formatConfig.maxDuration / 60} minutes)\`,
        elements: [],
      };
    }

    // Générer thumbnail
    let thumbnailPath = undefined;
    if (options.generateThumbnail) {
      const thumbWidth = options.thumbnailWidth || formatConfig.thumbnailWidth;
      const thumbFileName = path.basename(filePath, path.extname(filePath)) + '_thumb.jpg';
      thumbnailPath = path.join(options.outputDir, thumbFileName);

      // Capturer à 1 seconde ou au milieu si vidéo courte
      const captureTime = Math.min(formatConfig.thumbnailTime, metadata.duration / 2);

      await generateThumbnail(filePath, thumbnailPath, captureTime, thumbWidth);
    }

    // Créer l'élément
    const element = {
      type: 'video_thumbnail',
      index: 0,
      contentPath: thumbnailPath,
      width: metadata.width,
      height: metadata.height,
      metadata: {
        duration: metadata.duration,
        codec: metadata.codec,
        fps: metadata.fps,
        bitrate: metadata.bitrate,
      },
    };

    return {
      success: true,
      elements: [element],
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

module.exports = { extractVideo, getVideoMetadata };
`;

// ============================================================
// HELPER: Format duration
// ============================================================

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// ============================================================
// SINGLETON EXPORT
// ============================================================

export const videoExtractor = new VideoExtractor();
