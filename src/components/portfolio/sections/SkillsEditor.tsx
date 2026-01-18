import React, { useState } from 'react';
import { useTheme } from '../../../ThemeContext';
import { typography, borderRadius, transitions } from '../../../design-system';
import type { SkillsContent, SkillCategory, Skill } from '../../../types/portfolio';
import { generateId } from '../../../utils/portfolio';

interface SkillsEditorProps {
  content: SkillsContent;
  onChange: (content: SkillsContent) => void;
}

export const SkillsEditor: React.FC<SkillsEditorProps> = ({ content, onChange }) => {
  const { theme } = useTheme();
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<SkillCategory | null>(null);
  const [editingCategoryIndex, setEditingCategoryIndex] = useState<number | null>(null);

  const handleAddCategory = () => {
    setEditingCategory({
      id: generateId(),
      name: '',
      skills: [],
    });
    setEditingCategoryIndex(null);
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category: SkillCategory, index: number) => {
    setEditingCategory({ ...category, skills: [...category.skills] });
    setEditingCategoryIndex(index);
    setShowCategoryModal(true);
  };

  const handleSaveCategory = () => {
    if (!editingCategory || !editingCategory.name.trim()) return;

    const categories = [...content.categories];
    if (editingCategoryIndex !== null) {
      categories[editingCategoryIndex] = editingCategory;
    } else {
      categories.push(editingCategory);
    }

    onChange({ categories });
    setShowCategoryModal(false);
    setEditingCategory(null);
    setEditingCategoryIndex(null);
  };

  const handleDeleteCategory = (index: number) => {
    const categories = content.categories.filter((_, i) => i !== index);
    onChange({ categories });
  };

  const handleAddSkill = () => {
    if (!editingCategory) return;
    setEditingCategory({
      ...editingCategory,
      skills: [
        ...editingCategory.skills,
        { name: '', level: 'intermediate', yearsOfExperience: null },
      ],
    });
  };

  const handleUpdateSkill = (index: number, updates: Partial<Skill>) => {
    if (!editingCategory) return;
    const skills = [...editingCategory.skills];
    skills[index] = { ...skills[index], ...updates };
    setEditingCategory({ ...editingCategory, skills });
  };

  const handleRemoveSkill = (index: number) => {
    if (!editingCategory) return;
    setEditingCategory({
      ...editingCategory,
      skills: editingCategory.skills.filter((_, i) => i !== index),
    });
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return '#94a3b8';
      case 'intermediate':
        return '#60a5fa';
      case 'advanced':
        return '#34d399';
      case 'expert':
        return '#a78bfa';
      default:
        return theme.text.secondary;
    }
  };

  const getLevelLabel = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'Débutant';
      case 'intermediate':
        return 'Intermédiaire';
      case 'advanced':
        return 'Avancé';
      case 'expert':
        return 'Expert';
      default:
        return level;
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
    categoriesList: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1rem',
    },
    categoryCard: {
      padding: '1.5rem',
      backgroundColor: theme.bg.secondary,
      border: `1px solid ${theme.border.light}`,
      borderRadius: borderRadius.lg,
    },
    categoryHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1rem',
    },
    categoryName: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text.primary,
    },
    categoryActions: {
      display: 'flex',
      gap: '0.5rem',
    },
    skillsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '0.75rem',
    },
    skillChip: (level: string) => ({
      padding: '0.5rem 0.75rem',
      backgroundColor: theme.bg.primary,
      border: `1px solid ${getLevelColor(level)}`,
      borderRadius: borderRadius.md,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.25rem',
    }),
    skillName: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: theme.text.primary,
    },
    skillLevel: (level: string) => ({
      fontSize: typography.fontSize.xs,
      color: getLevelColor(level),
    }),
    iconButton: {
      width: '32px',
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: borderRadius.md,
      cursor: 'pointer',
      fontSize: typography.fontSize.base,
      transition: transitions.fast,
    },
    emptyState: {
      padding: '2rem',
      textAlign: 'center' as const,
      color: theme.text.secondary,
      fontSize: typography.fontSize.sm,
    },
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
      backdropFilter: 'blur(4px)',
    },
    modal: {
      backgroundColor: theme.bg.elevated,
      borderRadius: borderRadius.xl,
      boxShadow: theme.shadow.xl,
      width: '90%',
      maxWidth: '700px',
      maxHeight: '90vh',
      overflow: 'auto',
      border: `1px solid ${theme.border.default}`,
    },
    modalHeader: {
      padding: '1.5rem',
      borderBottom: `1px solid ${theme.border.light}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    modalTitle: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      color: theme.text.primary,
      margin: 0,
    },
    modalBody: {
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1.5rem',
    },
    field: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.5rem',
    },
    label: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text.primary,
    },
    input: {
      padding: '0.75rem',
      fontSize: typography.fontSize.base,
      color: theme.text.primary,
      backgroundColor: theme.bg.primary,
      border: `1px solid ${theme.border.default}`,
      borderRadius: borderRadius.md,
      outline: 'none',
      transition: transitions.fast,
    },
    select: {
      padding: '0.75rem',
      fontSize: typography.fontSize.base,
      color: theme.text.primary,
      backgroundColor: theme.bg.primary,
      border: `1px solid ${theme.border.default}`,
      borderRadius: borderRadius.md,
      outline: 'none',
      cursor: 'pointer',
      transition: transitions.fast,
    },
    skillsList: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.75rem',
      marginTop: '0.5rem',
    },
    skillRow: {
      display: 'grid',
      gridTemplateColumns: '2fr 1.5fr 1fr auto',
      gap: '0.5rem',
      alignItems: 'center',
      padding: '0.75rem',
      backgroundColor: theme.bg.secondary,
      borderRadius: borderRadius.md,
    },
    skillEmptyState: {
      padding: '1rem',
      textAlign: 'center' as const,
      color: theme.text.secondary,
      fontSize: typography.fontSize.sm,
      fontStyle: 'italic',
      backgroundColor: theme.bg.secondary,
      borderRadius: borderRadius.md,
    },
    modalFooter: {
      padding: '1.5rem',
      borderTop: `1px solid ${theme.border.light}`,
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '0.75rem',
    },
    button: {
      padding: '0.625rem 1.5rem',
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      border: 'none',
      borderRadius: borderRadius.md,
      cursor: 'pointer',
      transition: transitions.fast,
    },
    cancelButton: {
      color: theme.text.secondary,
      backgroundColor: theme.bg.secondary,
    },
    saveButton: (disabled: boolean) => ({
      color: '#FFFFFF',
      backgroundColor: disabled ? theme.text.muted : theme.accent.primary,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.6 : 1,
    }),
  };

  return (
    <div style={styles.container}>
      <button
        style={styles.addButton}
        onClick={handleAddCategory}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = theme.accent.secondary;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = theme.accent.muted;
        }}
      >
        + Ajouter une catégorie
      </button>

      <div style={styles.categoriesList}>
        {content.categories.length === 0 ? (
          <div style={styles.emptyState}>
            Aucune catégorie ajoutée. Organisez vos compétences par domaine (Technique, Langues, Outils...).
          </div>
        ) : (
          content.categories.map((category, index) => (
            <div key={category.id} style={styles.categoryCard}>
              <div style={styles.categoryHeader}>
                <div style={styles.categoryName}>{category.name}</div>
                <div style={styles.categoryActions}>
                  <button
                    style={styles.iconButton}
                    onClick={() => handleEditCategory(category, index)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme.bg.tertiary;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    title="Éditer"
                  >
                    ✏️
                  </button>
                  <button
                    style={styles.iconButton}
                    onClick={() => handleDeleteCategory(index)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme.semantic.errorBg;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    title="Supprimer"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div style={styles.skillsGrid}>
                {category.skills.map((skill, idx) => (
                  <div key={idx} style={styles.skillChip(skill.level)}>
                    <div style={styles.skillName}>{skill.name}</div>
                    <div style={styles.skillLevel(skill.level)}>{getLevelLabel(skill.level)}</div>
                  </div>
                ))}
                {category.skills.length === 0 && (
                  <div style={{ ...styles.emptyState, padding: '1rem' }}>
                    Aucune compétence
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal d'édition catégorie */}
      {showCategoryModal && editingCategory && (
        <div style={styles.overlay} onClick={() => setShowCategoryModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editingCategoryIndex !== null ? 'Modifier la catégorie' : 'Ajouter une catégorie'}
              </h2>
              <button
                style={styles.iconButton}
                onClick={() => setShowCategoryModal(false)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.bg.secondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                ✕
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.field}>
                <label style={styles.label}>Nom de la catégorie</label>
                <input
                  type="text"
                  value={editingCategory.name}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  placeholder="Ex: Langages de programmation, Outils, Langues..."
                  style={styles.input}
                  autoFocus
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = theme.accent.primary;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = theme.border.default;
                  }}
                />
              </div>

              <div style={styles.field}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={styles.label}>Compétences</label>
                  <button
                    style={styles.addButton}
                    onClick={handleAddSkill}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme.accent.secondary;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = theme.accent.muted;
                    }}
                  >
                    + Ajouter
                  </button>
                </div>

                <div style={styles.skillsList}>
                  {editingCategory.skills.length === 0 ? (
                    <div style={styles.skillEmptyState}>
                      Aucune compétence ajoutée. Cliquez sur "+ Ajouter" ci-dessus.
                    </div>
                  ) : (
                    editingCategory.skills.map((skill, idx) => (
                      <div key={idx} style={styles.skillRow}>
                        <input
                          type="text"
                          value={skill.name}
                          onChange={(e) => handleUpdateSkill(idx, { name: e.target.value })}
                          placeholder="Nom de la compétence"
                          style={styles.input}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = theme.accent.primary;
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = theme.border.default;
                          }}
                        />
                        <select
                          value={skill.level}
                          onChange={(e) =>
                            handleUpdateSkill(idx, { level: e.target.value as Skill['level'] })
                          }
                          style={styles.select}
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = theme.accent.primary;
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = theme.border.default;
                          }}
                        >
                          <option value="beginner">Débutant</option>
                          <option value="intermediate">Intermédiaire</option>
                          <option value="advanced">Avancé</option>
                          <option value="expert">Expert</option>
                        </select>
                        <input
                          type="number"
                          value={skill.yearsOfExperience || ''}
                          onChange={(e) =>
                            handleUpdateSkill(idx, {
                              yearsOfExperience: e.target.value ? parseInt(e.target.value) : null,
                            })
                          }
                          placeholder="Années"
                          style={{ ...styles.input, textAlign: 'center' }}
                          min="0"
                          max="50"
                          onFocus={(e) => {
                            e.currentTarget.style.borderColor = theme.accent.primary;
                          }}
                          onBlur={(e) => {
                            e.currentTarget.style.borderColor = theme.border.default;
                          }}
                        />
                        <button
                          style={styles.iconButton}
                          onClick={() => handleRemoveSkill(idx)}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = theme.semantic.errorBg;
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                          title="Supprimer"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button
                style={{ ...styles.button, ...styles.cancelButton }}
                onClick={() => setShowCategoryModal(false)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.bg.tertiary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.bg.secondary;
                }}
              >
                Annuler
              </button>
              <button
                style={{ ...styles.button, ...styles.saveButton(!editingCategory.name.trim()) }}
                onClick={handleSaveCategory}
                disabled={!editingCategory.name.trim()}
                onMouseEnter={(e) => {
                  if (editingCategory.name.trim()) {
                    e.currentTarget.style.backgroundColor = theme.accent.secondary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (editingCategory.name.trim()) {
                    e.currentTarget.style.backgroundColor = theme.accent.primary;
                  }
                }}
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
