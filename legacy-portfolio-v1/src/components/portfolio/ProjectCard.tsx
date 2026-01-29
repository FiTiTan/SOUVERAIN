/**
 * SOUVERAIN - ProjectCard
 * Carte individuelle pour afficher un projet de portfolio
 */

import React from 'react';
import { useTheme } from '../../ThemeContext';
import { typography, borderRadius, transitions, spacing } from '../../design-system';

export interface Project {
  id: string;
  portfolioId: string;
  title: string;
  description?: string;
  displayOrder: number;
  isFeatured: boolean;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  _elementCount?: number; // Nombre d'éléments/assets dans le projet
}

interface ProjectCardProps {
  project: Project;
  onClick?: (project: Project) => void;
  onEdit?: (project: Project) => void;
  onDelete?: (projectId: string) => void;
  onAssetDrop?: (projectId: string, assetId: string) => void; // Callback pour l'assignation d'asset
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onClick,
  onEdit,
  onDelete,
  onAssetDrop,
}) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = React.useState(false);
  const [isDropTarget, setIsDropTarget] = React.useState(false); // Indiquer si on survole pour drop

  // Gestion du drag & drop
  const handleDragOver = (e: React.DragEvent) => {
    if (!onAssetDrop) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDropTarget(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!onAssetDrop) return;
    // Vérifier qu'on sort vraiment de la card (pas juste d'un enfant)
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    if (
      e.clientX < rect.left ||
      e.clientX >= rect.right ||
      e.clientY < rect.top ||
      e.clientY >= rect.bottom
    ) {
      setIsDropTarget(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!onAssetDrop) return;
    e.preventDefault();
    setIsDropTarget(false);

    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data.assetId) {
        onAssetDrop(project.id, data.assetId);
      }
    } catch (error) {
      console.error('[ProjectCard] Erreur parsing drop data:', error);
    }
  };

  const styles = {
    card: {
      position: 'relative' as const,
      backgroundColor: isDropTarget ? theme.accent.muted : theme.bg.secondary,
      border: `2px solid ${isDropTarget ? theme.accent.primary : (isHovered ? theme.accent.primary : theme.border.default)}`,
      borderRadius: borderRadius.lg,
      padding: spacing[4],
      cursor: onClick ? 'pointer' : 'default',
      transition: transitions.normal,
      boxShadow: isHovered || isDropTarget ? theme.shadow.md : 'none',
    },
    dropIndicator: {
      position: 'absolute' as const,
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: theme.accent.primary,
      opacity: isDropTarget ? 1 : 0,
      transition: transitions.fast,
      pointerEvents: 'none' as const,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      padding: spacing[4],
      borderRadius: borderRadius.lg,
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing[3],
    },
    titleContainer: {
      flex: 1,
    },
    title: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text.primary,
      marginBottom: spacing[1],
      display: 'flex',
      alignItems: 'center',
      gap: spacing[2],
    },
    featuredBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      padding: `${spacing[1]} ${spacing[2]}`,
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.semibold,
      backgroundColor: theme.accent.muted,
      color: theme.accent.primary,
      borderRadius: borderRadius.sm,
    },
    description: {
      fontSize: typography.fontSize.sm,
      color: theme.text.secondary,
      lineHeight: '1.5',
      marginBottom: spacing[3],
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical' as const,
      overflow: 'hidden',
    },
    footer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    meta: {
      display: 'flex',
      gap: spacing[3],
      fontSize: typography.fontSize.xs,
      color: theme.text.tertiary,
    },
    metaItem: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[1],
    },
    actions: {
      display: 'flex',
      gap: spacing[2],
      opacity: isHovered ? 1 : 0,
      transition: transitions.fast,
    },
    actionButton: {
      width: '32px',
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.bg.tertiary,
      border: `1px solid ${theme.border.default}`,
      borderRadius: borderRadius.md,
      cursor: 'pointer',
      fontSize: typography.fontSize.sm,
      transition: transitions.fast,
    },
    tags: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: spacing[2],
      marginTop: spacing[2],
    },
    tag: {
      display: 'inline-block',
      padding: `${spacing[1]} ${spacing[2]}`,
      fontSize: typography.fontSize.xs,
      backgroundColor: theme.bg.tertiary,
      color: theme.text.secondary,
      borderRadius: borderRadius.sm,
    },
  };

  return (
    <div
      style={styles.card}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick?.(project)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Indicateur de drop */}
      <div style={styles.dropIndicator}>
        📂 Ajouter ici
      </div>
      <div style={styles.header}>
        <div style={styles.titleContainer}>
          <div style={styles.title}>
            {project.title}
            {project.isFeatured && (
              <span style={styles.featuredBadge}>⭐ Mis en avant</span>
            )}
          </div>
        </div>

        {(onEdit || onDelete) && (
          <div style={styles.actions}>
            {onEdit && (
              <button
                style={styles.actionButton}
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(project);
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor =
                    theme.accent.muted;
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor =
                    theme.bg.tertiary;
                }}
                title="Éditer"
              >
                ✏️
              </button>
            )}
            {onDelete && (
              <button
                style={styles.actionButton}
                onClick={(e) => {
                  e.stopPropagation();
                  if (
                    confirm(
                      `Supprimer le projet "${project.title}" ?\n\nCette action ne supprimera pas les fichiers, seulement le regroupement en projet.`
                    )
                  ) {
                    onDelete(project.id);
                  }
                }}
                onMouseEnter={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor =
                    theme.semantic.errorBg;
                  (e.target as HTMLButtonElement).style.borderColor =
                    theme.semantic.error;
                }}
                onMouseLeave={(e) => {
                  (e.target as HTMLButtonElement).style.backgroundColor =
                    theme.bg.tertiary;
                  (e.target as HTMLButtonElement).style.borderColor =
                    theme.border.default;
                }}
                title="Supprimer"
              >
                🗑️
              </button>
            )}
          </div>
        )}
      </div>

      {project.description && (
        <p style={styles.description}>{project.description}</p>
      )}

      {project.tags && project.tags.length > 0 && (
        <div style={styles.tags}>
          {project.tags.map((tag, index) => (
            <span key={index} style={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
      )}

      <div style={styles.footer}>
        <div style={styles.meta}>
          <div style={styles.metaItem}>
            <span>📁</span>
            <span>{project._elementCount || 0} élément(s)</span>
          </div>
          {project.createdAt && (
            <div style={styles.metaItem}>
              <span>📅</span>
              <span>{new Date(project.createdAt).toLocaleDateString('fr-FR')}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
