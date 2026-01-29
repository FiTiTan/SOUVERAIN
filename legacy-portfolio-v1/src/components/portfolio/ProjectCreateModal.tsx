/**
 * SOUVERAIN - ProjectCreateModal
 * Modal de création/édition de projet
 */

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../ThemeContext';
import { useToast } from '../ui/NotificationToast';
import { typography, borderRadius, transitions, spacing } from '../../design-system';
import type { Project } from './ProjectCard';

interface ProjectCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectData: ProjectFormData) => Promise<void>;
  editProject?: Project | null;
  portfolioId: string;
}

export interface ProjectFormData {
  title: string;
  description: string;
  tags: string[];
  isFeatured: boolean;
}

export const ProjectCreateModal: React.FC<ProjectCreateModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editProject,
  portfolioId,
}) => {
  console.log('[ProjectCreateModal] 🔵 RENDU - isOpen:', isOpen, 'portfolioId:', portfolioId, 'editProject:', editProject?.id);
  const { theme } = useTheme();
  const toast = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialiser avec les données du projet si en mode édition
  useEffect(() => {
    if (editProject) {
      setTitle(editProject.title);
      setDescription(editProject.description || '');
      setTags(editProject.tags || []);
      setIsFeatured(editProject.isFeatured);
    } else {
      // Reset
      setTitle('');
      setDescription('');
      setTags([]);
      setIsFeatured(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on mount to avoid resetting form while typing if parent re-renders

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('Titre requis', 'Le projet doit avoir un titre');
      return;
    }

    setIsSaving(true);
    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        tags,
        isFeatured,
      });

      toast.success(
        editProject ? 'Projet modifié' : 'Projet créé',
        editProject
          ? `Le projet "${title}" a été modifié`
          : `Le projet "${title}" a été créé`
      );

      onClose();
    } catch (error) {
      console.error('[ProjectCreateModal] Erreur:', error);
      toast.error('Erreur', 'Impossible de sauvegarder le projet');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const styles = {
    overlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: spacing[4],
    },
    modal: {
      backgroundColor: theme.bg.primary,
      borderRadius: borderRadius.xl,
      padding: spacing[6],
      maxWidth: '600px',
      width: '100%',
      maxHeight: '90vh',
      overflow: 'auto',
      boxShadow: theme.shadow.lg,
    },
    header: {
      marginBottom: spacing[5],
    },
    title: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: theme.text.primary,
      marginBottom: spacing[2],
    },
    subtitle: {
      fontSize: typography.fontSize.sm,
      color: theme.text.secondary,
    },
    form: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: spacing[4],
    },
    field: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: spacing[2],
    },
    label: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: theme.text.primary,
    },
    required: {
      color: theme.semantic.error,
    },
    input: {
      padding: spacing[3],
      fontSize: typography.fontSize.base,
      backgroundColor: theme.bg.secondary,
      border: `1px solid ${theme.border.default}`,
      borderRadius: borderRadius.md,
      color: theme.text.primary,
      outline: 'none',
      transition: transitions.fast,
    },
    textarea: {
      padding: spacing[3],
      fontSize: typography.fontSize.base,
      backgroundColor: theme.bg.secondary,
      border: `1px solid ${theme.border.default}`,
      borderRadius: borderRadius.md,
      color: theme.text.primary,
      outline: 'none',
      minHeight: '100px',
      resize: 'vertical' as const,
      fontFamily: 'inherit',
      transition: transitions.fast,
    },
    tagContainer: {
      display: 'flex',
      gap: spacing[2],
    },
    tagInput: {
      flex: 1,
      padding: spacing[3],
      fontSize: typography.fontSize.base,
      backgroundColor: theme.bg.secondary,
      border: `1px solid ${theme.border.default}`,
      borderRadius: borderRadius.md,
      color: theme.text.primary,
      outline: 'none',
    },
    addTagButton: {
      padding: `${spacing[3]} ${spacing[4]}`,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      backgroundColor: theme.bg.tertiary,
      border: `1px solid ${theme.border.default}`,
      borderRadius: borderRadius.md,
      color: theme.text.primary,
      cursor: 'pointer',
      transition: transitions.fast,
    },
    tags: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: spacing[2],
      marginTop: spacing[2],
    },
    tag: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[2],
      padding: `${spacing[1]} ${spacing[3]}`,
      fontSize: typography.fontSize.sm,
      backgroundColor: theme.accent.muted,
      color: theme.accent.primary,
      borderRadius: borderRadius.full,
    },
    tagRemove: {
      cursor: 'pointer',
      fontSize: typography.fontSize.xs,
      opacity: 0.7,
    },
    checkbox: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[2],
    },
    checkboxInput: {
      width: '20px',
      height: '20px',
      cursor: 'pointer',
    },
    checkboxLabel: {
      fontSize: typography.fontSize.sm,
      color: theme.text.primary,
      cursor: 'pointer',
    },
    actions: {
      display: 'flex',
      gap: spacing[3],
      marginTop: spacing[5],
      justifyContent: 'flex-end',
    },
    cancelButton: {
      padding: `${spacing[3]} ${spacing[5]}`,
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium,
      backgroundColor: theme.bg.secondary,
      border: `1px solid ${theme.border.default}`,
      borderRadius: borderRadius.lg,
      color: theme.text.primary,
      cursor: 'pointer',
      transition: transitions.fast,
    },
    saveButton: {
      padding: `${spacing[3]} ${spacing[5]}`,
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      backgroundColor: theme.accent.primary,
      border: 'none',
      borderRadius: borderRadius.lg,
      color: '#FFFFFF',
      cursor: isSaving ? 'wait' : 'pointer',
      opacity: isSaving ? 0.6 : 1,
      transition: transitions.fast,
    },
  };

  return (
    <div
      style={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div style={styles.modal}>
        <div style={styles.header}>
          <h2 style={styles.title}>
            {editProject ? 'Modifier le projet' : 'Créer un nouveau projet'}
          </h2>
          <p style={styles.subtitle}>
            {editProject
              ? 'Modifiez les informations du projet'
              : 'Regroupez vos réalisations en projets cohérents'}
          </p>
        </div>

        <form style={styles.form} onSubmit={handleSubmit}>
          {/* Titre */}
          <div style={styles.field}>
            <label style={styles.label}>
              Titre <span style={styles.required}>*</span>
            </label>
            <input
              type="text"
              style={styles.input}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Rénovation appartement Haussmannien"
              maxLength={100}
              required
              onFocus={(e) => {
                e.target.style.borderColor = theme.accent.primary;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = theme.border.default;
              }}
            />
          </div>

          {/* Description */}
          <div style={styles.field}>
            <label style={styles.label}>Description</label>
            <textarea
              style={styles.textarea}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez brièvement ce projet..."
              maxLength={500}
              onFocus={(e) => {
                e.target.style.borderColor = theme.accent.primary;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = theme.border.default;
              }}
            />
          </div>

          {/* Tags */}
          <div style={styles.field}>
            <label style={styles.label}>Tags</label>
            <div style={styles.tagContainer}>
              <input
                type="text"
                style={styles.tagInput}
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                placeholder="Ajouter un tag..."
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
              />
              <button
                type="button"
                style={styles.addTagButton}
                onClick={handleAddTag}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.bg.secondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.bg.tertiary;
                }}
              >
                Ajouter
              </button>
            </div>
            {tags.length > 0 && (
              <div style={styles.tags}>
                {tags.map((tag) => (
                  <div key={tag} style={styles.tag}>
                    {tag}
                    <span
                      style={styles.tagRemove}
                      onClick={() => handleRemoveTag(tag)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = '1';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = '0.7';
                      }}
                    >
                      ✕
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Mettre en avant */}
          <div style={styles.checkbox}>
            <input
              type="checkbox"
              id="isFeatured"
              style={styles.checkboxInput}
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
            />
            <label htmlFor="isFeatured" style={styles.checkboxLabel}>
              ⭐ Mettre en avant ce projet
            </label>
          </div>

          {/* Actions */}
          <div style={styles.actions}>
            <button
              type="button"
              style={styles.cancelButton}
              onClick={onClose}
              disabled={isSaving}
              onMouseEnter={(e) => {
                if (!isSaving) {
                  e.currentTarget.style.backgroundColor = theme.bg.tertiary;
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme.bg.secondary;
              }}
            >
              Annuler
            </button>
            <button
              type="submit"
              style={styles.saveButton}
              disabled={isSaving}
              onMouseEnter={(e) => {
                if (!isSaving) {
                  e.currentTarget.style.opacity = '0.9';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSaving) {
                  e.currentTarget.style.opacity = '1';
                }
              }}
            >
              {isSaving
                ? 'Sauvegarde...'
                : editProject
                ? 'Modifier'
                : 'Créer le projet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectCreateModal;
