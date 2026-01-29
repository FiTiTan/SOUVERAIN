/**
 * SOUVERAIN - ProjectList
 * Liste/grille des projets d'un portfolio
 */

import React from 'react';
import { useTheme } from '../../ThemeContext';
import { typography, borderRadius, spacing } from '../../design-system';
import { ProjectCard, type Project } from './ProjectCard';

interface ProjectListProps {
  projects: Project[];
  onProjectClick?: (project: Project) => void;
  onProjectEdit?: (project: Project) => void;
  onProjectDelete?: (projectId: string) => void;
  onAssetDrop?: (projectId: string, assetId: string) => void; // Assignation d'asset
  emptyMessage?: string;
  viewMode?: 'grid' | 'list';
}

export const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  onProjectClick,
  onProjectEdit,
  onProjectDelete,
  onAssetDrop,
  emptyMessage = 'Aucun projet créé pour le moment.',
  viewMode = 'grid',
}) => {
  const { theme } = useTheme();

  const styles = {
    container: {
      width: '100%',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns:
        viewMode === 'grid'
          ? 'repeat(auto-fill, minmax(320px, 1fr))'
          : '1fr',
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
      maxWidth: '400px',
    },
  };

  if (projects.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📁</div>
          <p style={styles.emptyText}>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  // Trier les projets: featured d'abord, puis par displayOrder
  const sortedProjects = [...projects].sort((a, b) => {
    if (a.isFeatured && !b.isFeatured) return -1;
    if (!a.isFeatured && b.isFeatured) return 1;
    return a.displayOrder - b.displayOrder;
  });

  return (
    <div style={styles.container}>
      <div style={styles.grid}>
        {sortedProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onClick={onProjectClick}
            onEdit={onProjectEdit}
            onDelete={onProjectDelete}
            onAssetDrop={onAssetDrop}
          />
        ))}
      </div>
    </div>
  );
};

export default ProjectList;
