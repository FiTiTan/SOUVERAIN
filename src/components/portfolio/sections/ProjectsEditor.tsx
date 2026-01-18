import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../ThemeContext';
import { typography, borderRadius, transitions } from '../../../design-system';
import type { ProjectsContent } from '../../../types/portfolio';

interface ProjectsEditorProps {
  content: ProjectsContent;
  onChange: (content: ProjectsContent) => void;
  portfolioId: string;
}

export const ProjectsEditor: React.FC<ProjectsEditorProps> = ({ content, onChange, portfolioId }) => {
  const { theme } = useTheme();
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, [portfolioId]);

  const loadProjects = async () => {
    setIsLoading(true);
    try {
      const result = await window.electron.portfolio.getProjects(portfolioId);
      if (result.success) {
        setProjects(result.projects || []);
      }
    } catch (error) {
      console.error('[ProjectsEditor] Erreur chargement projets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Supprimer ce projet ?')) return;

    try {
      const result = await window.electron.portfolio.deleteProject(projectId);
      if (result.success) {
        await loadProjects();
        // Mettre à jour les entrées de la section
        const entries = content.entries.filter((id) => id !== projectId);
        onChange({ entries });
      }
    } catch (error) {
      console.error('[ProjectsEditor] Erreur suppression projet:', error);
    }
  };

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1rem',
    },
    addButton: {
      padding: '0.75rem 1.5rem',
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: theme.accent.primary,
      backgroundColor: theme.accent.muted,
      border: `1px solid ${theme.accent.primary}`,
      borderRadius: borderRadius.md,
      cursor: 'pointer',
      transition: transitions.fast,
      alignSelf: 'flex-start',
    },
    projectsList: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
      gap: '1rem',
    },
    projectCard: {
      padding: '1rem',
      backgroundColor: theme.bg.secondary,
      border: `1px solid ${theme.border.light}`,
      borderRadius: borderRadius.lg,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.75rem',
      position: 'relative' as const,
    },
    projectThumbnail: {
      width: '100%',
      height: '140px',
      backgroundColor: theme.bg.tertiary,
      borderRadius: borderRadius.md,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '3rem',
      border: `1px solid ${theme.border.light}`,
    },
    projectTitle: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text.primary,
      margin: 0,
    },
    projectDescription: {
      fontSize: typography.fontSize.sm,
      color: theme.text.secondary,
      lineHeight: typography.lineHeight.normal,
      display: '-webkit-box',
      WebkitLineClamp: 2,
      WebkitBoxOrient: 'vertical' as const,
      overflow: 'hidden',
    },
    projectTags: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '0.25rem',
      marginTop: '0.5rem',
    },
    tag: {
      padding: '0.25rem 0.5rem',
      fontSize: typography.fontSize.xs,
      color: theme.accent.primary,
      backgroundColor: theme.accent.muted,
      borderRadius: borderRadius.sm,
    },
    projectActions: {
      display: 'flex',
      gap: '0.5rem',
      marginTop: '0.5rem',
    },
    iconButton: {
      flex: 1,
      padding: '0.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      border: `1px solid ${theme.border.default}`,
      borderRadius: borderRadius.md,
      cursor: 'pointer',
      fontSize: typography.fontSize.sm,
      transition: transitions.fast,
    },
    emptyState: {
      padding: '3rem 2rem',
      textAlign: 'center' as const,
      color: theme.text.secondary,
      fontSize: typography.fontSize.sm,
      backgroundColor: theme.bg.secondary,
      borderRadius: borderRadius.lg,
      border: `1px dashed ${theme.border.default}`,
    },
    emptyIcon: {
      fontSize: '3rem',
      marginBottom: '1rem',
    },
    placeholder: {
      padding: '2rem',
      textAlign: 'center' as const,
      color: theme.text.secondary,
      fontSize: typography.fontSize.sm,
      fontStyle: 'italic',
      backgroundColor: theme.accent.muted,
      borderRadius: borderRadius.lg,
      border: `1px solid ${theme.accent.primary}`,
    },
  };

  if (isLoading) {
    return (
      <div style={styles.placeholder}>
        Chargement des projets...
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.placeholder}>
        📦 Gestion complète des projets à venir dans une prochaine mise à jour.
        <br />
        <br />
        En attendant, vous pouvez pré-remplir cette section avec les données de votre CV lors de la création du portfolio.
      </div>

      {projects.length > 0 && (
        <div style={styles.projectsList}>
          {projects.map((project) => (
            <div key={project.id} style={styles.projectCard}>
              <div style={styles.projectThumbnail}>
                {project.thumbnail ? '🖼️' : '📁'}
              </div>
              <h3 style={styles.projectTitle}>{project.title || 'Projet sans titre'}</h3>
              {project.description && (
                <p style={styles.projectDescription}>{project.description}</p>
              )}
              {project.tags && project.tags.length > 0 && (
                <div style={styles.projectTags}>
                  {(typeof project.tags === 'string' ? JSON.parse(project.tags) : project.tags)
                    .slice(0, 3)
                    .map((tag: string, idx: number) => (
                      <span key={idx} style={styles.tag}>
                        {tag}
                      </span>
                    ))}
                </div>
              )}
              <div style={styles.projectActions}>
                <button
                  style={styles.iconButton}
                  onClick={() => handleDeleteProject(project.id)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.semantic.errorBg;
                    e.currentTarget.style.borderColor = theme.semantic.error;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = theme.border.default;
                  }}
                  title="Supprimer"
                >
                  🗑️ Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {projects.length === 0 && (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📂</div>
          <div>Aucun projet ajouté.</div>
          <div style={{ marginTop: '0.5rem', fontSize: typography.fontSize.xs }}>
            La gestion des projets sera disponible prochainement.
          </div>
        </div>
      )}
    </div>
  );
};
