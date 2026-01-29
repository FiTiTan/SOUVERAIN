/**
 * SOUVERAIN - AssetGrid
 * Grille d'affichage des assets d'un portfolio
 */

import React from 'react';
import { useTheme } from '../../ThemeContext';
import { typography, borderRadius, spacing } from '../../design-system';
import { AssetCard } from './AssetCard';
import type { Asset } from '../../services/assetService';
import type { DisplayableAsset } from './PortfolioModule';

interface AssetGridProps {
  displayableAssets: DisplayableAsset[];
  onDeleteAsset?: (assetId: string) => void;
  onClickAsset?: (asset: Asset) => void;
  emptyMessage?: string;
  enableDragToProjects?: boolean;
}

export const AssetGrid: React.FC<AssetGridProps> = ({
  displayableAssets,
  onDeleteAsset,
  onClickAsset,
  emptyMessage = 'Aucun fichier importé pour le moment.',
  enableDragToProjects = false,
}) => {
  const { theme } = useTheme();

  const styles = {
    container: {
      width: '100%',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
      gap: spacing[4],
    },
    emptyState: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      padding: '3rem 2rem',
      backgroundColor: theme.bg.secondary,
      borderRadius: borderRadius.lg,
      border: `2px dashed ${theme.border.light}`,
      textAlign: 'center' as const,
    },
    emptyIcon: {
      fontSize: '3rem',
      marginBottom: spacing[3],
      opacity: 0.5,
    },
    emptyText: {
      fontSize: typography.fontSize.base,
      color: theme.text.secondary,
    },
  };

  if (displayableAssets.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📁</div>
          <p style={styles.emptyText}>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.grid}>
        {displayableAssets.map((item) => (
          <AssetCard
            key={item.element.id}
            asset={item.asset}
            element={item.element}
            onDelete={onDeleteAsset}
            onClick={() => onClickAsset?.(item.asset)}
            draggable={enableDragToProjects}
          />
        ))}
      </div>
    </div>
  );
};

export default AssetGrid;
