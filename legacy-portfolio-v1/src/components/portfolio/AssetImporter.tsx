/**
 * SOUVERAIN - AssetImporter
 * Bouton et logique d'import de fichiers pour un portfolio
 */

import React, { useRef, useState } from 'react';
import { useTheme } from '../../ThemeContext';
import { useToast } from '../ui/NotificationToast';
import { typography, borderRadius, transitions, spacing } from '../../design-system';
interface AssetImporterProps {
  portfolioId: string;
  onAssetsImported?: (assets: Asset[]) => void;
  maxFiles?: number;
  maxSizePerFile?: number; // en octets
  buttonStyle?: React.CSSProperties;
}
import { importAsset, type Asset } from '../../services/assetService';

const SUPPORTED_FORMATS = [
  // Images
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  // Documents
  '.pdf',
  // Vidéos
  '.mp4',
  '.mov',
  '.webm',
];

export const AssetImporter: React.FC<AssetImporterProps> = ({
  portfolioId,
  onAssetsImported,
  maxFiles = 50,
  maxSizePerFile = 100 * 1024 * 1024, // 100 Mo
  buttonStyle
}) => {
  const { theme } = useTheme();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImporting, setIsImporting] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }

    const selectedFiles = Array.from(e.target.files);

    if (selectedFiles.length > maxFiles) {
      toast.warning(
        'Limite de fichiers atteinte',
        `Vous ne pouvez pas importer plus de ${maxFiles} fichiers à la fois.`
      );
      return;
    }

    setIsImporting(true);

    let importedCount = 0;
    let errorCount = 0;
    const importedAssets: Asset[] = [];

    for (const file of selectedFiles) {
      // Vérifier la taille
      if (file.size > maxSizePerFile) {
        const maxSizeMB = Math.round(maxSizePerFile / (1024 * 1024));
        toast.warning(
          'Fichier trop volumineux',
          `${file.name} dépasse la limite de ${maxSizeMB}Mo`
        );
        errorCount++;
        continue;
      }

      // Vérifier le format
      const extension = '.' + (file.name.split('.').pop()?.toLowerCase() || '');
      if (!SUPPORTED_FORMATS.includes(extension)) {
        toast.warning('Format non supporté', `${file.name} (${extension})`);
        errorCount++;
        continue;
      }

      // Importer le fichier
      const result = await importAsset(portfolioId, file);

      if (result.success && result.asset) {
        importedCount++;
        importedAssets.push(result.asset);
      } else {
        errorCount++;
        toast.error('Erreur import', `${file.name}: ${result.error}`);
      }
    }

    setIsImporting(false);

    // Notification de résultat
    if (importedCount > 0) {
      toast.success(
        `${importedCount} fichier(s) importé(s)`,
        errorCount > 0 ? `${errorCount} erreur(s)` : undefined
      );

      // Callback
      onAssetsImported?.(importedAssets);
    } else if (errorCount > 0) {
      toast.error('Aucun fichier importé', `${errorCount} erreur(s) rencontrées`);
    }

    // Réinitialiser l'input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const styles = {
    button: {
      padding: `${spacing[3]} ${spacing[5]}`,
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      backgroundColor: theme.accent.primary,
      color: '#FFFFFF',
      border: 'none',
      borderRadius: borderRadius.lg,
      cursor: isImporting ? 'wait' : 'pointer',
      transition: transitions.fast,
      display: 'flex',
      alignItems: 'center',
      gap: spacing[2],
      opacity: isImporting ? 0.6 : 1,
    },
    icon: {
      fontSize: typography.fontSize.lg,
    },
  };

  return (
    <>
      <button
        style={{...styles.button, ...buttonStyle}}
        onClick={() => fileInputRef.current?.click()}
        disabled={isImporting}
        onMouseEnter={(e) => {
          if (!isImporting) {
            e.currentTarget.style.opacity = '0.9';
          }
        }}
        onMouseLeave={(e) => {
          if (!isImporting) {
            e.currentTarget.style.opacity = '1';
          }
        }}
      >
        <span style={styles.icon}>{isImporting ? '⏳' : '📁'}</span>
        {isImporting ? 'Import en cours...' : 'Importer des fichiers'}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={SUPPORTED_FORMATS.join(',')}
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
    </>
  );
};

export default AssetImporter;
