/**
 * SOUVERAIN - ProjectGrouper
 * Permet de créer des projets et d'y regrouper des éléments
 * Interface drag & drop avec IA suggestive
 */

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../ThemeContext';
import { useToast } from '../ui/NotificationToast';
import { typography, borderRadius, transitions, spacing } from '../../design-system';
import { getFormatIcon } from '../../types/formats';
import type { PortfolioElement } from './ElementClassificationView';

// ============================================================
// TYPES
// ============================================================

export interface Project {
  id: string;
  portfolioId: string;
  title: string;
  description: string;
  tags: string[];
  elements: PortfolioElement[];
  createdAt: string;
}

interface ProjectGrouperProps {
  portfolioId: string;
  elements: PortfolioElement[];
  onComplete: (projects: Project[]) => void;
  onBack?: () => void;
}

// ============================================================
// COMPONENT
// ============================================================

export const ProjectGrouper: React.FC<ProjectGrouperProps> = ({
  portfolioId,
  elements,
  onComplete,
  onBack,
}) => {
  const { theme } = useTheme();
  const toast = useToast();

  // State
  const [projects, setProjects] = useState<Project[]>([]);
  const [unassignedElements, setUnassignedElements] = useState<PortfolioElement[]>(elements);
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [draggedElement, setDraggedElement] = useState<string | null>(null);

  // Auto-suggest projects based on classification
  useEffect(() => {
    suggestProjects();
  }, []);

  const suggestProjects = () => {
    // Grouper les éléments par projet suggéré
    const projectGroups = new Map<string, PortfolioElement[]>();

    elements.forEach((element) => {
      if (element.classification?.suggestedProject) {
        const projectName = element.classification.suggestedProject;
        if (!projectGroups.has(projectName)) {
          projectGroups.set(projectName, []);
        }
        projectGroups.get(projectName)!.push(element);
      }
    });

    // Créer des projets suggérés pour les groupes de 2+ éléments
    const suggestedProjects: Project[] = [];
    projectGroups.forEach((projectElements, projectName) => {
      if (projectElements.length >= 2) {
        const allTags = new Set<string>();
        projectElements.forEach((el) => {
          el.classification?.tags.forEach((tag) => allTags.add(tag));
        });

        suggestedProjects.push({
          id: `project_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          portfolioId,
          title: projectName,
          description: '',
          tags: Array.from(allTags),
          elements: projectElements,
          createdAt: new Date().toISOString(),
        });
      }
    });

    if (suggestedProjects.length > 0) {
      setProjects(suggestedProjects);

      // Retirer les éléments assignés de la liste non assignée
      const assignedElementIds = new Set(
        suggestedProjects.flatMap((p) => p.elements.map((e) => e.id))
      );
      setUnassignedElements(elements.filter((e) => !assignedElementIds.has(e.id)));
    }
  };

  // Create new project
  const createProject = () => {
    if (!newProjectTitle.trim()) {
      toast.warning('Titre manquant', 'Veuillez saisir un titre de projet.');
      return;
    }

    const newProject: Project = {
      id: `project_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      portfolioId,
      title: newProjectTitle.trim(),
      description: '',
      tags: [],
      elements: [],
      createdAt: new Date().toISOString(),
    };

    setProjects((prev) => [...prev, newProject]);
    setNewProjectTitle('');
  };

  // Delete project
  const deleteProject = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    // Remettre les éléments dans la liste non assignée
    setUnassignedElements((prev) => [...prev, ...project.elements]);
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
  };

  // Drag & drop handlers
  const handleDragStart = (elementId: string) => {
    setDraggedElement(elementId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDropOnProject = (projectId: string) => {
    if (!draggedElement) return;

    const element = unassignedElements.find((e) => e.id === draggedElement);
    if (!element) return;

    // Ajouter l'élément au projet
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId ? { ...p, elements: [...p.elements, element] } : p
      )
    );

    // Retirer de la liste non assignée
    setUnassignedElements((prev) => prev.filter((e) => e.id !== draggedElement));
    setDraggedElement(null);
  };

  const handleDropOnUnassigned = () => {
    if (!draggedElement) return;

    // Trouver le projet qui contient l'élément
    const project = projects.find((p) => p.elements.some((e) => e.id === draggedElement));
    if (!project) return;

    const element = project.elements.find((e) => e.id === draggedElement);
    if (!element) return;

    // Retirer l'élément du projet
    setProjects((prev) =>
      prev.map((p) =>
        p.id === project.id
          ? { ...p, elements: p.elements.filter((e) => e.id !== draggedElement) }
          : p
      )
    );

    // Ajouter à la liste non assignée
    setUnassignedElements((prev) => [...prev, element]);
    setDraggedElement(null);
  };

  // Save and continue
  const saveAndContinue = async () => {
    try {
      // Sauvegarder chaque projet en BDD
      for (const project of projects) {
        const projectResult = await window.electron.portfolioV2.projects.create({
          id: project.id,
          portfolioId: project.portfolioId,
          title: project.title,
          description: project.description,
          tags: JSON.stringify(project.tags),
          metadata: JSON.stringify({ createdAt: project.createdAt }),
        });

        if (projectResult.success) {
          // Associer les éléments au projet
          for (const element of project.elements) {
            await window.electron.portfolioV2.projects.addElement({
              projectId: project.id,
              elementId: element.id,
              displayOrder: project.elements.indexOf(element),
            });
          }
        }
      }

      onComplete(projects);
    } catch (error) {
      console.error('[ProjectGrouper] Erreur sauvegarde projets:', error);
      toast.error('Erreur sauvegarde', 'Impossible de sauvegarder les projets.');
    }
  };

  // Skip and continue
  const skipAndContinue = () => {
    onComplete([]);
  };

  // Styles
  const styles = {
    container: {
      padding: spacing[6],
      height: '100%',
      display: 'flex',
      flexDirection: 'column' as const,
    },
    header: {
      marginBottom: spacing[6],
      textAlign: 'center' as const,
    },
    title: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: theme.text.primary,
      marginBottom: spacing[2],
    },
    subtitle: {
      fontSize: typography.fontSize.base,
      color: theme.text.secondary,
    },
    content: {
      flex: 1,
      display: 'grid',
      gridTemplateColumns: '1fr 2fr',
      gap: spacing[4],
      overflow: 'hidden',
    },
    panel: {
      border: `1px solid ${theme.border.default}`,
      borderRadius: borderRadius.lg,
      padding: spacing[4],
      overflow: 'auto',
      display: 'flex',
      flexDirection: 'column' as const,
    },
    panelTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text.primary,
      marginBottom: spacing[4],
    },
    createProjectForm: {
      display: 'flex',
      gap: spacing[2],
      marginBottom: spacing[4],
    },
    input: {
      flex: 1,
      padding: spacing[2],
      fontSize: typography.fontSize.sm,
      border: `1px solid ${theme.border.default}`,
      borderRadius: borderRadius.md,
      backgroundColor: theme.bg.secondary,
      color: theme.text.primary,
    },
    button: {
      padding: `${spacing[2]} ${spacing[4]}`,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      borderRadius: borderRadius.md,
      cursor: 'pointer',
      transition: transitions.fast,
      border: 'none',
    },
    buttonPrimary: {
      backgroundColor: theme.accent.primary,
      color: '#FFFFFF',
    },
    buttonSecondary: {
      backgroundColor: 'transparent',
      color: theme.text.secondary,
      border: `1px solid ${theme.border.default}`,
    },
    buttonDanger: {
      backgroundColor: theme.semantic.error,
      color: '#FFFFFF',
    },
    projectsList: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: spacing[3],
    },
    projectCard: {
      border: `1px solid ${theme.border.default}`,
      borderRadius: borderRadius.md,
      padding: spacing[3],
      backgroundColor: theme.bg.secondary,
    },
    projectHeader: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing[2],
    },
    projectTitle: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium,
      color: theme.text.primary,
    },
    projectElements: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: spacing[2],
      minHeight: '40px',
      padding: spacing[2],
      backgroundColor: theme.bg.tertiary,
      borderRadius: borderRadius.sm,
      border: `2px dashed ${theme.border.light}`,
    },
    projectDropzone: {
      backgroundColor: theme.accent.muted,
      borderColor: theme.accent.primary,
    },
    elementChip: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: spacing[1],
      padding: `${spacing[1]} ${spacing[2]}`,
      fontSize: typography.fontSize.xs,
      backgroundColor: theme.accent.primary,
      color: '#FFFFFF',
      borderRadius: borderRadius.sm,
      cursor: 'grab',
    },
    unassignedGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
      gap: spacing[2],
    },
    unassignedCard: {
      border: `1px solid ${theme.border.light}`,
      borderRadius: borderRadius.md,
      padding: spacing[2],
      cursor: 'grab',
      transition: transitions.fast,
      textAlign: 'center' as const,
    },
    unassignedIcon: {
      fontSize: '2rem',
      marginBottom: spacing[1],
    },
    unassignedTitle: {
      fontSize: typography.fontSize.xs,
      color: theme.text.primary,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap' as const,
    },
    footer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: spacing[6],
      paddingTop: spacing[4],
      borderTop: `1px solid ${theme.border.light}`,
    },
    stats: {
      fontSize: typography.fontSize.sm,
      color: theme.text.tertiary,
    },
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>Organisez vos éléments en projets</h2>
        <p style={styles.subtitle}>
          Créez des projets et glissez-déposez vos éléments pour les organiser
        </p>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {/* Left panel: Unassigned elements */}
        <div
          style={styles.panel}
          onDragOver={handleDragOver}
          onDrop={handleDropOnUnassigned}
        >
          <h3 style={styles.panelTitle}>
            Éléments non assignés ({unassignedElements.length})
          </h3>
          <div style={styles.unassignedGrid}>
            {unassignedElements.map((element) => (
              <div
                key={element.id}
                style={styles.unassignedCard}
                draggable
                onDragStart={() => handleDragStart(element.id)}
              >
                <div style={styles.unassignedIcon}>
                  {getFormatIcon(element.format)}
                </div>
                <div style={styles.unassignedTitle}>{element.title}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel: Projects */}
        <div style={styles.panel}>
          <h3 style={styles.panelTitle}>Projets ({projects.length})</h3>

          {/* Create project form */}
          <div style={styles.createProjectForm}>
            <input
              type="text"
              style={styles.input}
              placeholder="Nom du nouveau projet..."
              value={newProjectTitle}
              onChange={(e) => setNewProjectTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createProject()}
            />
            <button
              type="button"
              style={{ ...styles.button, ...styles.buttonPrimary }}
              onClick={createProject}
            >
              + Créer
            </button>
          </div>

          {/* Projects list */}
          <div style={styles.projectsList}>
            {projects.map((project) => (
              <div key={project.id} style={styles.projectCard}>
                <div style={styles.projectHeader}>
                  <span style={styles.projectTitle}>{project.title}</span>
                  <button
                    type="button"
                    style={{ ...styles.button, ...styles.buttonSecondary, padding: spacing[1] }}
                    onClick={() => deleteProject(project.id)}
                  >
                    ✕
                  </button>
                </div>
                <div
                  style={{
                    ...styles.projectElements,
                    ...(draggedElement ? styles.projectDropzone : {}),
                  }}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDropOnProject(project.id)}
                >
                  {project.elements.length === 0 ? (
                    <span style={{ color: theme.text.tertiary, fontSize: typography.fontSize.xs }}>
                      Glissez des éléments ici
                    </span>
                  ) : (
                    project.elements.map((element) => (
                      <div
                        key={element.id}
                        style={styles.elementChip}
                        draggable
                        onDragStart={() => handleDragStart(element.id)}
                      >
                        {getFormatIcon(element.format)} {element.title}
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <div style={styles.stats}>
          {projects.length} projet{projects.length > 1 ? 's' : ''} •{' '}
          {projects.reduce((sum, p) => sum + p.elements.length, 0)} élément
          {projects.reduce((sum, p) => sum + p.elements.length, 0) > 1 ? 's' : ''} assigné
          {projects.reduce((sum, p) => sum + p.elements.length, 0) > 1 ? 's' : ''}
        </div>
        <div style={{ display: 'flex', gap: spacing[3] }}>
          <button
            type="button"
            style={{ ...styles.button, ...styles.buttonSecondary }}
            onClick={skipAndContinue}
          >
            Passer cette étape
          </button>
          <button
            type="button"
            style={{ ...styles.button, ...styles.buttonPrimary }}
            onClick={saveAndContinue}
          >
            Continuer →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectGrouper;
