import React, { useState } from 'react';
import { useTheme } from '../../../ThemeContext';
import { typography, borderRadius, transitions } from '../../../design-system';
import type { EducationContent, EducationEntry } from '../../../types/portfolio';
import { generateId } from '../../../utils/portfolio';

interface EducationEditorProps {
  content: EducationContent;
  onChange: (content: EducationContent) => void;
}

export const EducationEditor: React.FC<EducationEditorProps> = ({ content, onChange }) => {
  const { theme } = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<EducationEntry | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const handleAddEntry = () => {
    setEditingEntry({
      id: generateId(),
      school: '',
      degree: '',
      field: '',
      location: '',
      startDate: '',
      endDate: '',
      isCurrent: false,
      description: '',
      achievements: [],
    });
    setEditingIndex(null);
    setShowModal(true);
  };

  const handleEditEntry = (entry: EducationEntry, index: number) => {
    setEditingEntry({ ...entry });
    setEditingIndex(index);
    setShowModal(true);
  };

  const handleSaveEntry = () => {
    if (!editingEntry) return;

    const entries = [...content.entries];
    if (editingIndex !== null) {
      entries[editingIndex] = editingEntry;
    } else {
      entries.push(editingEntry);
    }

    onChange({ entries });
    setShowModal(false);
    setEditingEntry(null);
    setEditingIndex(null);
  };

  const handleDeleteEntry = (index: number) => {
    const entries = content.entries.filter((_, i) => i !== index);
    onChange({ entries });
  };

  const handleAchievementAdd = (achievement: string) => {
    if (!editingEntry || !achievement.trim()) return;
    setEditingEntry({
      ...editingEntry,
      achievements: [...editingEntry.achievements, achievement.trim()],
    });
  };

  const handleAchievementRemove = (index: number) => {
    if (!editingEntry) return;
    setEditingEntry({
      ...editingEntry,
      achievements: editingEntry.achievements.filter((_, i) => i !== index),
    });
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
    entriesList: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.75rem',
    },
    entryCard: {
      padding: '1rem',
      backgroundColor: theme.bg.secondary,
      border: `1px solid ${theme.border.light}`,
      borderRadius: borderRadius.lg,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: '1rem',
    },
    entryInfo: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.25rem',
    },
    entryDegree: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text.primary,
    },
    entrySchool: {
      fontSize: typography.fontSize.sm,
      color: theme.accent.primary,
    },
    entryMeta: {
      fontSize: typography.fontSize.xs,
      color: theme.text.secondary,
    },
    entryActions: {
      display: 'flex',
      gap: '0.5rem',
    },
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
      maxWidth: '600px',
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
    textarea: {
      padding: '0.75rem',
      fontSize: typography.fontSize.base,
      color: theme.text.primary,
      backgroundColor: theme.bg.primary,
      border: `1px solid ${theme.border.default}`,
      borderRadius: borderRadius.md,
      outline: 'none',
      resize: 'vertical' as const,
      minHeight: '100px',
      fontFamily: 'inherit',
      transition: transitions.fast,
    },
    dateRow: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem',
    },
    checkbox: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      cursor: 'pointer',
    },
    achievementsList: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.5rem',
    },
    achievementItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem',
      backgroundColor: theme.bg.secondary,
      borderRadius: borderRadius.md,
      fontSize: typography.fontSize.sm,
      color: theme.text.primary,
    },
    achievementInput: {
      display: 'flex',
      gap: '0.5rem',
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
    saveButton: {
      color: '#FFFFFF',
      backgroundColor: theme.accent.primary,
    },
  };

  return (
    <div style={styles.container}>
      <button
        style={styles.addButton}
        onClick={handleAddEntry}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = theme.accent.secondary;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = theme.accent.muted;
        }}
      >
        + Ajouter une formation
      </button>

      <div style={styles.entriesList}>
        {content.entries.length === 0 ? (
          <div style={styles.emptyState}>
            Aucune formation ajoutée. Cliquez sur "Ajouter une formation" pour commencer.
          </div>
        ) : (
          content.entries.map((entry, index) => (
            <div key={entry.id} style={styles.entryCard}>
              <div style={styles.entryInfo}>
                <div style={styles.entryDegree}>
                  {entry.degree || 'Diplôme non renseigné'}{entry.field && ` - ${entry.field}`}
                </div>
                <div style={styles.entrySchool}>{entry.school || 'École non renseignée'}</div>
                <div style={styles.entryMeta}>
                  {entry.startDate || '?'} - {entry.isCurrent ? 'Présent' : entry.endDate || '?'}
                  {entry.location && ` • ${entry.location}`}
                </div>
              </div>
              <div style={styles.entryActions}>
                <button
                  style={styles.iconButton}
                  onClick={() => handleEditEntry(entry, index)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.bg.secondary;
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
                  onClick={() => handleDeleteEntry(index)}
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
          ))
        )}
      </div>

      {/* Modal d'édition */}
      {showModal && editingEntry && (
        <div style={styles.overlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editingIndex !== null ? 'Modifier la formation' : 'Ajouter une formation'}
              </h2>
              <button
                style={styles.iconButton}
                onClick={() => setShowModal(false)}
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
                <label style={styles.label}>Diplôme</label>
                <input
                  type="text"
                  value={editingEntry.degree}
                  onChange={(e) => setEditingEntry({ ...editingEntry, degree: e.target.value })}
                  placeholder="Ex: Master, Licence, BTS..."
                  style={styles.input}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = theme.accent.primary;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = theme.border.default;
                  }}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Domaine d'étude</label>
                <input
                  type="text"
                  value={editingEntry.field}
                  onChange={(e) => setEditingEntry({ ...editingEntry, field: e.target.value })}
                  placeholder="Ex: Informatique, Commerce, Droit..."
                  style={styles.input}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = theme.accent.primary;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = theme.border.default;
                  }}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>École / Université</label>
                <input
                  type="text"
                  value={editingEntry.school}
                  onChange={(e) => setEditingEntry({ ...editingEntry, school: e.target.value })}
                  placeholder="Ex: Université Paris-Sorbonne"
                  style={styles.input}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = theme.accent.primary;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = theme.border.default;
                  }}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Localisation</label>
                <input
                  type="text"
                  value={editingEntry.location}
                  onChange={(e) => setEditingEntry({ ...editingEntry, location: e.target.value })}
                  placeholder="Ex: Paris, France"
                  style={styles.input}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = theme.accent.primary;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = theme.border.default;
                  }}
                />
              </div>

              <div style={styles.dateRow}>
                <div style={styles.field}>
                  <label style={styles.label}>Date de début</label>
                  <input
                    type="month"
                    value={editingEntry.startDate}
                    onChange={(e) => setEditingEntry({ ...editingEntry, startDate: e.target.value })}
                    style={styles.input}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = theme.accent.primary;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = theme.border.default;
                    }}
                  />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Date de fin</label>
                  <input
                    type="month"
                    value={editingEntry.endDate || ''}
                    onChange={(e) => setEditingEntry({ ...editingEntry, endDate: e.target.value })}
                    style={styles.input}
                    disabled={editingEntry.isCurrent}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = theme.accent.primary;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = theme.border.default;
                    }}
                  />
                </div>
              </div>

              <label style={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={editingEntry.isCurrent}
                  onChange={(e) =>
                    setEditingEntry({
                      ...editingEntry,
                      isCurrent: e.target.checked,
                      endDate: e.target.checked ? '' : editingEntry.endDate,
                    })
                  }
                  style={{ cursor: 'pointer' }}
                />
                <span style={styles.label}>Formation en cours</span>
              </label>

              <div style={styles.field}>
                <label style={styles.label}>Description</label>
                <textarea
                  value={editingEntry.description}
                  onChange={(e) => setEditingEntry({ ...editingEntry, description: e.target.value })}
                  placeholder="Décrivez votre parcours et vos spécialisations..."
                  style={styles.textarea}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = theme.accent.primary;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = theme.border.default;
                  }}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Distinctions / Mentions</label>
                <div style={styles.achievementsList}>
                  {editingEntry.achievements.map((achievement, idx) => (
                    <div key={idx} style={styles.achievementItem}>
                      <span style={{ flex: 1 }}>• {achievement}</span>
                      <button
                        style={{
                          ...styles.iconButton,
                          width: '24px',
                          height: '24px',
                          fontSize: typography.fontSize.sm,
                        }}
                        onClick={() => handleAchievementRemove(idx)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = theme.semantic.errorBg;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <div style={styles.achievementInput}>
                  <input
                    type="text"
                    placeholder="Ajouter une distinction..."
                    style={{ ...styles.input, flex: 1 }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAchievementAdd(e.currentTarget.value);
                        e.currentTarget.value = '';
                      }
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = theme.accent.primary;
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = theme.border.default;
                    }}
                  />
                </div>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button
                style={{ ...styles.button, ...styles.cancelButton }}
                onClick={() => setShowModal(false)}
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
                style={{ ...styles.button, ...styles.saveButton }}
                onClick={handleSaveEntry}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.accent.secondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.accent.primary;
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
