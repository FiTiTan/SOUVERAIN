/**
 * SOUVERAIN - Types des formats de fichiers supportés
 * Définit les formats d'import et leurs extracteurs
 */

// ============================================================
// FORMATS SUPPORTÉS
// ============================================================

export type FormatPriority = 'priority1' | 'priority2';

export type SupportedFormat =
  | 'jpg'
  | 'jpeg'
  | 'png'
  | 'webp'
  | 'gif'
  | 'pdf'
  | 'mp4'
  | 'mov'
  | 'avi'
  | 'pptx'
  | 'docx';

export type FormatCategory = 'image' | 'document' | 'video' | 'presentation';

export interface FormatConfig {
  extension: SupportedFormat;
  category: FormatCategory;
  mimeTypes: string[];
  priority: FormatPriority;
  label: string;
  icon: string;
  maxSize: number;           // Taille max en octets
  thumbnailSize: number;     // Taille thumbnail en pixels (largeur)
  extractorFeatures: string[];
}

// ============================================================
// PRIORITY 1 - MVP
// ============================================================

export const FORMATS_PRIORITY1: FormatConfig[] = [
  // IMAGES
  {
    extension: 'jpg',
    category: 'image',
    mimeTypes: ['image/jpeg'],
    priority: 'priority1',
    label: 'JPEG',
    icon: '🖼️',
    maxSize: 20 * 1024 * 1024,      // 20 Mo
    thumbnailSize: 400,
    extractorFeatures: ['exif', 'compression', 'thumbnail'],
  },
  {
    extension: 'jpeg',
    category: 'image',
    mimeTypes: ['image/jpeg'],
    priority: 'priority1',
    label: 'JPEG',
    icon: '🖼️',
    maxSize: 20 * 1024 * 1024,
    thumbnailSize: 400,
    extractorFeatures: ['exif', 'compression', 'thumbnail'],
  },
  {
    extension: 'png',
    category: 'image',
    mimeTypes: ['image/png'],
    priority: 'priority1',
    label: 'PNG',
    icon: '🖼️',
    maxSize: 20 * 1024 * 1024,
    thumbnailSize: 400,
    extractorFeatures: ['compression', 'thumbnail'],
  },
  {
    extension: 'webp',
    category: 'image',
    mimeTypes: ['image/webp'],
    priority: 'priority1',
    label: 'WebP',
    icon: '🖼️',
    maxSize: 20 * 1024 * 1024,
    thumbnailSize: 400,
    extractorFeatures: ['compression', 'thumbnail'],
  },
  // PDF
  {
    extension: 'pdf',
    category: 'document',
    mimeTypes: ['application/pdf'],
    priority: 'priority1',
    label: 'PDF',
    icon: '📄',
    maxSize: 50 * 1024 * 1024,      // 50 Mo
    thumbnailSize: 400,
    extractorFeatures: ['text', 'images', 'pages', 'thumbnail'],
  },
  // VIDÉO
  {
    extension: 'mp4',
    category: 'video',
    mimeTypes: ['video/mp4'],
    priority: 'priority1',
    label: 'MP4',
    icon: '🎬',
    maxSize: 500 * 1024 * 1024,     // 500 Mo
    thumbnailSize: 400,
    extractorFeatures: ['thumbnail', 'duration', 'metadata'],
  },
  {
    extension: 'mov',
    category: 'video',
    mimeTypes: ['video/quicktime'],
    priority: 'priority1',
    label: 'MOV',
    icon: '🎬',
    maxSize: 500 * 1024 * 1024,
    thumbnailSize: 400,
    extractorFeatures: ['thumbnail', 'duration', 'metadata'],
  },
];

// ============================================================
// PRIORITY 2 - V2
// ============================================================

export const FORMATS_PRIORITY2: FormatConfig[] = [
  {
    extension: 'gif',
    category: 'image',
    mimeTypes: ['image/gif'],
    priority: 'priority2',
    label: 'GIF',
    icon: '🖼️',
    maxSize: 10 * 1024 * 1024,
    thumbnailSize: 400,
    extractorFeatures: ['thumbnail'],
  },
  {
    extension: 'pptx',
    category: 'presentation',
    mimeTypes: ['application/vnd.openxmlformats-officedocument.presentationml.presentation'],
    priority: 'priority2',
    label: 'PowerPoint',
    icon: '📊',
    maxSize: 100 * 1024 * 1024,
    thumbnailSize: 400,
    extractorFeatures: ['slides', 'text', 'images'],
  },
  {
    extension: 'docx',
    category: 'document',
    mimeTypes: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    priority: 'priority2',
    label: 'Word',
    icon: '📝',
    maxSize: 50 * 1024 * 1024,
    thumbnailSize: 400,
    extractorFeatures: ['text', 'images'],
  },
  {
    extension: 'avi',
    category: 'video',
    mimeTypes: ['video/x-msvideo'],
    priority: 'priority2',
    label: 'AVI',
    icon: '🎬',
    maxSize: 500 * 1024 * 1024,
    thumbnailSize: 400,
    extractorFeatures: ['thumbnail', 'duration', 'metadata'],
  },
];

// ============================================================
// TOUS LES FORMATS
// ============================================================

export const ALL_FORMATS: FormatConfig[] = [...FORMATS_PRIORITY1, ...FORMATS_PRIORITY2];

// ============================================================
// SOURCES D'IMPORT
// ============================================================

export type ImportSourceType = 'local' | 'google_drive' | 'icloud' | 'github' | 'dribbble' | 'url';

export interface ImportSourceConfig {
  id: ImportSourceType;
  label: string;
  icon: string;
  description: string;
  requiresAuth: boolean;
  priority: FormatPriority;
}

export const IMPORT_SOURCES: ImportSourceConfig[] = [
  {
    id: 'local',
    label: 'Dossier local',
    icon: '📁',
    description: 'Importez depuis votre ordinateur',
    requiresAuth: false,
    priority: 'priority1',
  },
  {
    id: 'google_drive',
    label: 'Google Drive',
    icon: '☁️',
    description: 'Connectez votre Google Drive',
    requiresAuth: true,
    priority: 'priority2',
  },
  {
    id: 'icloud',
    label: 'iCloud',
    icon: '🍎',
    description: 'Connectez votre iCloud',
    requiresAuth: true,
    priority: 'priority2',
  },
  {
    id: 'github',
    label: 'GitHub',
    icon: '🐙',
    description: 'Importez vos projets GitHub',
    requiresAuth: true,
    priority: 'priority1',
  },
  {
    id: 'dribbble',
    label: 'Dribbble',
    icon: '🏀',
    description: 'Importez vos shots Dribbble',
    requiresAuth: true,
    priority: 'priority2',
  },
];

// ============================================================
// HELPERS
// ============================================================

/**
 * Récupère la config d'un format par son extension
 */
export function getFormatByExtension(extension: string): FormatConfig | undefined {
  const ext = extension.toLowerCase().replace('.', '') as SupportedFormat;
  return ALL_FORMATS.find((f) => f.extension === ext);
}

/**
 * Récupère la config d'un format par son mime type
 */
export function getFormatByMimeType(mimeType: string): FormatConfig | undefined {
  return ALL_FORMATS.find((f) => f.mimeTypes.includes(mimeType));
}

/**
 * Vérifie si un format est supporté
 */
export function isFormatSupported(extension: string): boolean {
  return getFormatByExtension(extension) !== undefined;
}

/**
 * Vérifie si un format est disponible (Priority 1 = MVP)
 */
export function isFormatAvailable(extension: string): boolean {
  const format = getFormatByExtension(extension);
  return format?.priority === 'priority1';
}

/**
 * Récupère les formats par catégorie
 */
export function getFormatsByCategory(category: FormatCategory): FormatConfig[] {
  return ALL_FORMATS.filter((f) => f.category === category);
}

/**
 * Récupère les extensions supportées pour un file input
 */
export function getAcceptedExtensions(priority?: FormatPriority): string {
  const formats = priority
    ? ALL_FORMATS.filter((f) => f.priority === priority)
    : ALL_FORMATS;
  return formats.map((f) => `.${f.extension}`).join(',');
}

/**
 * Récupère les mime types supportés
 */
export function getAcceptedMimeTypes(priority?: FormatPriority): string[] {
  const formats = priority
    ? ALL_FORMATS.filter((f) => f.priority === priority)
    : ALL_FORMATS;
  return formats.flatMap((f) => f.mimeTypes);
}

/**
 * Formate une taille de fichier en chaîne lisible
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 o';
  const k = 1024;
  const sizes = ['o', 'Ko', 'Mo', 'Go'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Vérifie si un fichier respecte la taille maximale
 */
export function isFileSizeValid(extension: string, sizeInBytes: number): boolean {
  const format = getFormatByExtension(extension);
  if (!format) return false;
  return sizeInBytes <= format.maxSize;
}

/**
 * Récupère la liste de toutes les extensions supportées
 */
export function getSupportedFormats(priority?: FormatPriority): string[] {
  const formats = priority
    ? ALL_FORMATS.filter((f) => f.priority === priority)
    : ALL_FORMATS;
  return [...new Set(formats.map((f) => f.extension))];
}

/**
 * Récupère la catégorie d'un format par son extension
 */
export function getFormatCategory(extension: string): FormatCategory {
  const format = getFormatByExtension(extension);
  return format?.category || 'document';
}

/**
 * Récupère l'icône d'un format par son extension
 */
export function getFormatIcon(extension: string): string {
  const format = getFormatByExtension(extension);
  return format?.icon || '📄';
}
