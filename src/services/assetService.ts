/**
 * SOUVERAIN - Asset Service
 * Service pour la gestion des assets (images, PDFs, vidéos) dans les portfolios
 */

export interface AssetMetadata {
  uploadedAt: string;
  width?: number;
  height?: number;
  duration?: number;
  [key: string]: any;
}

export interface Asset {
  id: string;
  portfolioId: string;
  sourceType: 'local' | 'url' | 'github';
  sourcePath: string;
  localPath: string;
  format: string;
  originalFilename?: string;
  fileSize?: number;
  metadata?: AssetMetadata;
  thumbnailPath?: string;
  createdAt?: string;
}

/**
 * Récupérer tous les assets d'un portfolio
 */
export async function getAssetsByPortfolioId(portfolioId: string): Promise<Asset[]> {
  try {
    const assets = await window.electron.portfolioV2.assets.getByPortfolio(portfolioId);
    return assets || [];
  } catch (error) {
    console.error('[AssetService] Erreur récupération assets:', error);
    return [];
  }
}

/**
 * Importer un fichier (copie + enregistrement DB)
 */
export async function importAsset(
  portfolioId: string,
  file: File
): Promise<{ success: boolean; asset?: Asset; error?: string }> {
  try {
    console.log('[AssetService] 🔵 Import asset:', file.name);

    // 1. Lire le fichier comme ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // 2. Sauvegarder le fichier sur le disque
    const saveResult = await window.electron.portfolioV2.saveFile(
      portfolioId,
      file.name,
      arrayBuffer
    );

    if (!saveResult.success) {
      throw new Error(saveResult.error || 'Erreur sauvegarde fichier');
    }

    console.log('[AssetService] ✅ Fichier sauvegardé:', saveResult.path);

    // 3. Générer une miniature si c'est une image
    let thumbnailPath: string | undefined;
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension);

    if (isImage && saveResult.path) {
      try {
        const thumbResult = await window.electron.portfolioV2.generateThumbnail(
          saveResult.path,
          300,
          300
        );
        if (thumbResult.success) {
          thumbnailPath = thumbResult.thumbnailPath;
          console.log('[AssetService] ✅ Miniature créée:', thumbnailPath);
        }
      } catch (thumbError) {
        console.warn('[AssetService] ⚠️ Erreur génération miniature:', thumbError);
        // Continuer sans miniature
      }
    }

    // 4. Créer l'enregistrement dans la DB
    const assetId = `asset_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const assetData = {
      id: assetId,
      portfolioId,
      sourceType: 'local',
      sourcePath: saveResult.relativePath || file.name,
      localPath: saveResult.path || '',
      format: extension,
      originalFilename: file.name,
      fileSize: file.size,
      thumbnailPath,
      metadata: {
        uploadedAt: new Date().toISOString(),
      },
    };

    const createResult = await window.electron.portfolioV2.assets.create(assetData);

    if (!createResult.success) {
      throw new Error(createResult.error || 'Erreur création asset');
    }

    console.log('[AssetService] ✅ Asset créé:', assetId);

    return {
      success: true,
      asset: {
        ...assetData,
        createdAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('[AssetService] ❌ Erreur import asset:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

/**
 * Supprimer un asset (fichier + DB)
 */
export async function deleteAsset(assetId: string): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('[AssetService] 🔵 Suppression asset:', assetId);

    // TODO: Supprimer le fichier physique également
    // const deleteFileResult = await window.electron.portfolioV2.deleteFile(assetPath);

    // Supprimer l'enregistrement DB
    const result = await window.electron.portfolioV2.assets.delete(assetId);

    if (result.success) {
      console.log('[AssetService] ✅ Asset supprimé:', assetId);
    }

    return result;
  } catch (error) {
    console.error('[AssetService] ❌ Erreur suppression asset:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

/**
 * Obtenir l'icône selon le format
 */
export function getAssetIcon(format: string): string {
  const formatLower = format.toLowerCase();

  // Images
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(formatLower)) {
    return '🖼️';
  }

  // Documents
  if (formatLower === 'pdf') {
    return '📄';
  }

  // Vidéos
  if (['mp4', 'mov', 'webm', 'avi'].includes(formatLower)) {
    return '🎥';
  }

  // Défaut
  return '📎';
}

/**
 * Obtenir la catégorie selon le format
 */
export function getAssetCategory(format: string): 'image' | 'document' | 'video' | 'other' {
  const formatLower = format.toLowerCase();

  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(formatLower)) {
    return 'image';
  }

  if (['pdf', 'doc', 'docx'].includes(formatLower)) {
    return 'document';
  }

  if (['mp4', 'mov', 'webm', 'avi'].includes(formatLower)) {
    return 'video';
  }

  return 'other';
}

/**
 * Formater la taille du fichier
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}
