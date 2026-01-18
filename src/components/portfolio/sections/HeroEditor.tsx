import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../ThemeContext';
import { typography, borderRadius, transitions } from '../../../design-system';
import type { HeroContent } from '../../../types/portfolio';

interface HeroEditorProps {
  content: HeroContent;
  onChange: (content: HeroContent) => void;
}

export const HeroEditor: React.FC<HeroEditorProps> = ({ content, onChange }) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState<HeroContent>(content);

  useEffect(() => {
    setFormData(content);
  }, [content]);

  const handleChange = (field: keyof HeroContent, value: string) => {
    const updated = { ...formData, [field]: value };
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
      minHeight: '100px',
      fontFamily: typography.fontFamily.sans,
    },
    hint: {
      fontSize: typography.fontSize.xs,
      color: theme.text.secondary,
      fontStyle: 'italic',
    },
    photoSection: {
      display: 'flex',
      gap: '1rem',
      alignItems: 'flex-start',
    },
    photoPreview: {
      width: '120px',
      height: '120px',
      borderRadius: borderRadius.xl,
      backgroundColor: theme.bg.secondary,
      border: `2px dashed ${theme.border.default}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '3rem',
      flexShrink: 0,
    },
    photoInfo: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.5rem',
    },
    uploadButton: {
      padding: '0.5rem 1rem',
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: theme.accent.primary,
      backgroundColor: theme.accent.muted,
      border: 'none',
      borderRadius: borderRadius.md,
      cursor: 'pointer',
      transition: transitions.fast,
      alignSelf: 'flex-start',
    },
  };

  return (
    <div style={styles.container}>
      {/* Photo */}
      <div style={styles.field}>
        <label style={styles.label}>Photo de profil</label>
        <div style={styles.photoSection}>
          <div style={styles.photoPreview}>
            {formData.photo ? '🖼️' : '👤'}
          </div>
          <div style={styles.photoInfo}>
            <button
              style={styles.uploadButton}
              onClick={() => alert('Upload de photo à implémenter')}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = theme.accent.secondary;
                e.currentTarget.style.color = '#FFFFFF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme.accent.muted;
                e.currentTarget.style.color = theme.accent.primary;
              }}
            >
              📤 Télécharger une photo
            </button>
            <span style={styles.hint}>
              Format recommandé : 400x400px, JPG/PNG
            </span>
          </div>
        </div>
      </div>

      {/* Nom */}
      <div style={styles.field}>
        <label style={styles.label}>Nom complet</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Ex: Marie Dupont"
          style={styles.input}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = theme.accent.primary;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = theme.border.default;
          }}
        />
      </div>

      {/* Titre professionnel */}
      <div style={styles.field}>
        <label style={styles.label}>Titre professionnel</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Ex: Directrice Marketing Digital"
          style={styles.input}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = theme.accent.primary;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = theme.border.default;
          }}
        />
        <span style={styles.hint}>
          Votre poste actuel ou fonction principale
        </span>
      </div>

      {/* Tagline */}
      <div style={styles.field}>
        <label style={styles.label}>Accroche</label>
        <textarea
          value={formData.tagline}
          onChange={(e) => handleChange('tagline', e.target.value)}
          placeholder="Ex: Experte en transformation digitale avec 10+ ans d'expérience"
          style={styles.textarea}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = theme.accent.primary;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = theme.border.default;
          }}
        />
        <span style={styles.hint}>
          Une phrase qui résume votre proposition de valeur
        </span>
      </div>

      {/* Localisation */}
      <div style={styles.field}>
        <label style={styles.label}>Localisation</label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => handleChange('location', e.target.value)}
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

      {/* Disponibilité */}
      <div style={styles.field}>
        <label style={styles.label}>Disponibilité</label>
        <input
          type="text"
          value={formData.availability}
          onChange={(e) => handleChange('availability', e.target.value)}
          placeholder="Ex: Disponible immédiatement"
          style={styles.input}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = theme.accent.primary;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = theme.border.default;
          }}
        />
      </div>
    </div>
  );
};
