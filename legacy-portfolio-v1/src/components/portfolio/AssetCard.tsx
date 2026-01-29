/**
 * SOUVERAIN - AssetCard
 * Carte individuelle pour afficher un asset (image, PDF, vidéo)
 */

import React from 'react';
import { useTheme } from '../../ThemeContext';
import { typography, borderRadius, transitions, spacing } from '../../design-system';
import { getAssetIcon, getAssetCategory, formatFileSize, type Asset } from '../../services/assetService';
import type { PortfolioElement } from '../../types/portfolio';

interface AssetCardProps {
  asset: Asset;
  element?: PortfolioElement; // Classification IA et autres détails de l'élément
  onDelete?: (assetId: string) => void;
  onClick?: (asset: Asset) => void;
  draggable?: boolean;
}

export const AssetCard: React.FC<AssetCardProps> = ({ asset, element, onDelete, onClick, draggable = false }) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = React.useState(false);
  const [isDragging, setIsDragging] = React.useState(false);

  const category = getAssetCategory(asset.format);
  const icon = getAssetIcon(asset.format);

  const imagePath = asset.thumbnailPath || asset.localPath;
  const normalizedPath = imagePath
    ? `file:///${imagePath.replace(/\\/g, '/')}`
    : '';

  const handleDragStart = (e: React.DragEvent) => {
    if (!draggable) return;
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('application/json', JSON.stringify({
      assetId: asset.id,
      assetName: asset.originalFilename || 'Sans nom',
    }));
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const styles = {
    card: {
      position: 'relative' as const,
      backgroundColor: theme.bg.secondary,
      border: `1px solid ${isHovered ? theme.accent.primary : theme.border.default}`,
      borderRadius: borderRadius.lg,
      overflow: 'hidden',
      cursor: draggable ? 'grab' : (onClick ? 'pointer' : 'default'),
      transition: transitions.normal,
      boxShadow: isHovered ? theme.shadow.md : 'none',
      opacity: isDragging ? 0.5 : 1,
    },
    thumbnail: {
      width: '100%',
      height: '150px', // Reducido para dar espacio a los tags
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.bg.tertiary,
      fontSize: '3.5rem',
      position: 'relative' as const,
    },
    image: {
      width: '100%',
      height: '100%',
      objectFit: 'cover' as const,
    },
    content: {
      padding: spacing[3],
    },
    filename: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: theme.text.primary,
      whiteSpace: 'nowrap' as const,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      marginBottom: spacing[1],
    },
    meta: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[2],
      fontSize: typography.fontSize.xs,
      color: theme.text.tertiary,
    },
    badge: {
      display: 'inline-block',
      padding: `${spacing[1]} ${spacing[2]}`,
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.semibold,
      backgroundColor: theme.accent.muted,
      color: theme.accent.primary,
      borderRadius: borderRadius.sm,
      textTransform: 'uppercase' as const,
    },
    aiTagsContainer: {
        marginTop: spacing[2],
        display: 'flex',
        flexWrap: 'wrap' as const,
        gap: spacing[1],
    },
    aiTag: {
        display: 'inline-block',
        padding: `2px ${spacing[2]}`,
        fontSize: typography.fontSize.xs,
        fontWeight: typography.fontWeight.medium,
        backgroundColor: theme.bg.tertiary,
        color: theme.text.secondary,
        borderRadius: borderRadius.md,
    },
    deleteButton: {
      position: 'absolute' as const,
      top: spacing[2],
      right: spacing[2],
      width: '28px',
      height: '28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      color: '#FFFFFF',
      border: 'none',
      borderRadius: borderRadius.full,
      cursor: 'pointer',
      fontSize: typography.fontSize.md,
      opacity: isHovered ? 1 : 0,
      transition: transitions.fast,
    },
  };

  return (
    <div
      style={styles.card}
      draggable={draggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        style={styles.thumbnail}
        onClick={(e) => {
            if (isDragging) return;
            e.stopPropagation();
            onClick?.(asset);
        }}
      >
        {category === 'image' && normalizedPath ? (
          <img
            src={normalizedPath}
            alt={asset.originalFilename || 'Asset'}
            style={styles.image}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).parentElement!.innerHTML = icon;
            }}
          />
        ) : (
          <span>{icon}</span>
        )}

        {onDelete && (
          <button
            style={styles.deleteButton}
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Supprimer "${asset.originalFilename || 'cet asset'}" ?`)) {
                onDelete(asset.id);
              }
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = theme.semantic.error;
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
            }}
          >
            ✕
          </button>
        )}
      </div>

      <div 
        style={styles.content}
        onClick={(e) => {
            if (isDragging) return;
            e.stopPropagation();
            onClick?.(asset);
        }}
      >
        <div style={styles.filename} title={asset.originalFilename || 'Sans nom'}>
          {asset.originalFilename || 'Sans nom'}
        </div>
        <div style={styles.meta}>
          <span style={styles.badge}>{asset.format.toUpperCase()}</span>
          {asset.fileSize && <span>{formatFileSize(asset.fileSize)}</span>}
        </div>
        {element?.aiTags && element.aiTags.length > 0 && (
            <div style={styles.aiTagsContainer}>
                {element.aiTags.map((tag, index) => (
                    <span key={index} style={styles.aiTag}>{tag}</span>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default AssetCard;
