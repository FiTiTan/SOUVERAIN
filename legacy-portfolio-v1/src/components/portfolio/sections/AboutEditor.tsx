import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../ThemeContext';
import { typography, borderRadius, transitions } from '../../../design-system';
import type { AboutContent } from '../../../types/portfolio';

interface AboutEditorProps {
  content: AboutContent;
  onChange: (content: AboutContent) => void;
}

export const AboutEditor: React.FC<AboutEditorProps> = ({ content, onChange }) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState<AboutContent>(content);
  const [newHighlight, setNewHighlight] = useState('');

  useEffect(() => {
    setFormData(content);
  }, [content]);

  const handleChange = (field: keyof AboutContent, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onChange(updated);
  };

  const handleAddHighlight = () => {
    if (!newHighlight.trim()) return;
    const updated = { ...formData, highlights: [...formData.highlights, newHighlight.trim()] };
    setFormData(updated);
    onChange(updated);
    setNewHighlight('');
  };

  const handleRemoveHighlight = (index: number) => {
    const updated = { ...formData, highlights: formData.highlights.filter((_, i) => i !== index) };
    setFormData(updated);
    onChange(updated);
  };

  const styles = {
    container: {
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
      minHeight: '150px',
      fontFamily: typography.fontFamily.sans,
      lineHeight: typography.lineHeight.relaxed,
    },
    hint: {
      fontSize: typography.fontSize.xs,
      color: theme.text.secondary,
      fontStyle: 'italic',
    },
    highlightsList: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.5rem',
    },
    highlightItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.75rem',
      backgroundColor: theme.bg.secondary,
      borderRadius: borderRadius.md,
      border: `1px solid ${theme.border.light}`,
    },
    highlightText: {
      flex: 1,
      fontSize: typography.fontSize.sm,
      color: theme.text.primary,
    },
    removeButton: {
      width: '28px',
      height: '28px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: borderRadius.md,
      cursor: 'pointer',
      fontSize: typography.fontSize.lg,
      color: theme.text.secondary,
      transition: transitions.fast,
    },
    addSection: {
      display: 'flex',
      gap: '0.5rem',
    },
    addButton: {
      padding: '0.75rem 1.25rem',
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: '#FFFFFF',
      backgroundColor: theme.accent.primary,
      border: 'none',
      borderRadius: borderRadius.md,
      cursor: 'pointer',
      transition: transitions.fast,
      whiteSpace: 'nowrap' as const,
    },
  };

  return (
    <div style={styles.container}>
      {/* Headline */}
      <div style={styles.field}>
        <label style={styles.label}>Titre court</label>
        <input
          type="text"
          value={formData.headline}
          onChange={(e) => handleChange('headline', e.target.value)}
          placeholder="Ex: Expert en transformation digitale"
          style={styles.input}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = theme.accent.primary;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = theme.border.default;
          }}
        />
        <span style={styles.hint}>
          Un titre accrocheur pour la section À propos
        </span>
      </div>

      {/* Bio */}
      <div style={styles.field}>
        <label style={styles.label}>Biographie</label>
        <textarea
          value={formData.bio}
          onChange={(e) => handleChange('bio', e.target.value)}
          placeholder="Parlez de votre parcours, vos passions, votre vision professionnelle..."
          style={styles.textarea}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = theme.accent.primary;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = theme.border.default;
          }}
        />
        <span style={styles.hint}>
          2-3 paragraphes qui racontent votre histoire professionnelle
        </span>
      </div>

      {/* Highlights */}
      <div style={styles.field}>
        <label style={styles.label}>Points clés ({formData.highlights.length})</label>

        {formData.highlights.length > 0 && (
          <div style={styles.highlightsList}>
            {formData.highlights.map((highlight, index) => (
              <div key={index} style={styles.highlightItem}>
                <span style={styles.highlightText}>✓ {highlight}</span>
                <button
                  style={styles.removeButton}
                  onClick={() => handleRemoveHighlight(index)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.semantic.errorBg;
                    e.currentTarget.style.color = theme.semantic.error;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = theme.text.secondary;
                  }}
                  title="Supprimer"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={styles.addSection}>
          <input
            type="text"
            value={newHighlight}
            onChange={(e) => setNewHighlight(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddHighlight();
              }
            }}
            placeholder="Ex: 15+ ans d'expérience en marketing"
            style={{ ...styles.input, flex: 1 }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = theme.accent.primary;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = theme.border.default;
            }}
          />
          <button
            style={styles.addButton}
            onClick={handleAddHighlight}
            disabled={!newHighlight.trim()}
            onMouseEnter={(e) => {
              if (newHighlight.trim()) {
                e.currentTarget.style.backgroundColor = theme.accent.secondary;
              }
            }}
            onMouseLeave={(e) => {
              if (newHighlight.trim()) {
                e.currentTarget.style.backgroundColor = theme.accent.primary;
              }
            }}
          >
            + Ajouter
          </button>
        </div>
        <span style={styles.hint}>
          Vos réalisations clés, chiffres marquants, certifications...
        </span>
      </div>
    </div>
  );
};
