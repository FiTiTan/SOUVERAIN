import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../ThemeContext';
import { typography, borderRadius, transitions } from '../../../design-system';
import type { ContactContent } from '../../../types/portfolio';
import { generateId } from '../../../utils/portfolio';

interface ContactEditorProps {
  content: ContactContent;
  onChange: (content: ContactContent) => void;
}

export const ContactEditor: React.FC<ContactEditorProps> = ({ content, onChange }) => {
  const { theme } = useTheme();
  const [formData, setFormData] = useState<ContactContent>(content);
  const [newLinkLabel, setNewLinkLabel] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');

  useEffect(() => {
    setFormData(content);
  }, [content]);

  const handleChange = (field: keyof ContactContent, value: any) => {
    const updated = { ...formData, [field]: value };
    setFormData(updated);
    onChange(updated);
  };

  const handleAddCustomLink = () => {
    if (!newLinkLabel.trim() || !newLinkUrl.trim()) return;
    const updated = {
      ...formData,
      customLinks: [...formData.customLinks, { label: newLinkLabel.trim(), url: newLinkUrl.trim() }],
    };
    setFormData(updated);
    onChange(updated);
    setNewLinkLabel('');
    setNewLinkUrl('');
  };

  const handleRemoveCustomLink = (index: number) => {
    const updated = {
      ...formData,
      customLinks: formData.customLinks.filter((_, i) => i !== index),
    };
    setFormData(updated);
    onChange(updated);
  };

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1.5rem',
    },
    section: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1rem',
      padding: '1rem',
      backgroundColor: theme.bg.secondary,
      borderRadius: borderRadius.lg,
      border: `1px solid ${theme.border.light}`,
    },
    sectionTitle: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.bold,
      color: theme.text.primary,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
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
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
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
    hint: {
      fontSize: typography.fontSize.xs,
      color: theme.text.secondary,
      fontStyle: 'italic',
    },
    customLinksList: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.5rem',
    },
    customLinkItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.75rem',
      backgroundColor: theme.bg.primary,
      borderRadius: borderRadius.md,
      border: `1px solid ${theme.border.light}`,
    },
    linkInfo: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.25rem',
    },
    linkLabel: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text.primary,
    },
    linkUrl: {
      fontSize: typography.fontSize.xs,
      color: theme.text.secondary,
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
    addLinkSection: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.5rem',
    },
    addLinkRow: {
      display: 'flex',
      gap: '0.5rem',
    },
    addButton: {
      padding: '0.625rem 1.25rem',
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: '#FFFFFF',
      backgroundColor: theme.accent.primary,
      border: 'none',
      borderRadius: borderRadius.md,
      cursor: 'pointer',
      transition: transitions.fast,
      alignSelf: 'flex-start',
    },
  };

  return (
    <div style={styles.container}>
      {/* Informations principales */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Informations principales</div>

        <div style={styles.field}>
          <label style={styles.label}>
            <span>📧</span>
            <span>Email</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="Ex: contact@example.com"
            style={styles.input}
            onFocus={(e) => (e.currentTarget.style.borderColor = theme.accent.primary)}
            onBlur={(e) => (e.currentTarget.style.borderColor = theme.border.default)}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>
            <span>📱</span>
            <span>Téléphone</span>
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="Ex: +33 6 12 34 56 78"
            style={styles.input}
            onFocus={(e) => (e.currentTarget.style.borderColor = theme.accent.primary)}
            onBlur={(e) => (e.currentTarget.style.borderColor = theme.border.default)}
          />
        </div>
      </div>

      {/* Réseaux sociaux */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Réseaux sociaux</div>

        <div style={styles.field}>
          <label style={styles.label}>
            <span>💼</span>
            <span>LinkedIn</span>
          </label>
          <input
            type="url"
            value={formData.linkedin}
            onChange={(e) => handleChange('linkedin', e.target.value)}
            placeholder="Ex: https://linkedin.com/in/votre-profil"
            style={styles.input}
            onFocus={(e) => (e.currentTarget.style.borderColor = theme.accent.primary)}
            onBlur={(e) => (e.currentTarget.style.borderColor = theme.border.default)}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>
            <span>🐙</span>
            <span>GitHub</span>
          </label>
          <input
            type="url"
            value={formData.github}
            onChange={(e) => handleChange('github', e.target.value)}
            placeholder="Ex: https://github.com/votre-pseudo"
            style={styles.input}
            onFocus={(e) => (e.currentTarget.style.borderColor = theme.accent.primary)}
            onBlur={(e) => (e.currentTarget.style.borderColor = theme.border.default)}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>
            <span>🐦</span>
            <span>Twitter</span>
          </label>
          <input
            type="url"
            value={formData.twitter}
            onChange={(e) => handleChange('twitter', e.target.value)}
            placeholder="Ex: https://twitter.com/votre-pseudo"
            style={styles.input}
            onFocus={(e) => (e.currentTarget.style.borderColor = theme.accent.primary)}
            onBlur={(e) => (e.currentTarget.style.borderColor = theme.border.default)}
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>
            <span>🌐</span>
            <span>Site web</span>
          </label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => handleChange('website', e.target.value)}
            placeholder="Ex: https://votre-site.com"
            style={styles.input}
            onFocus={(e) => (e.currentTarget.style.borderColor = theme.accent.primary)}
            onBlur={(e) => (e.currentTarget.style.borderColor = theme.border.default)}
          />
        </div>
      </div>

      {/* Liens personnalisés */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Liens personnalisés ({formData.customLinks.length})</div>

        {formData.customLinks.length > 0 && (
          <div style={styles.customLinksList}>
            {formData.customLinks.map((link, index) => (
              <div key={index} style={styles.customLinkItem}>
                <div style={styles.linkInfo}>
                  <div style={styles.linkLabel}>🔗 {link.label}</div>
                  <div style={styles.linkUrl}>{link.url}</div>
                </div>
                <button
                  style={styles.removeButton}
                  onClick={() => handleRemoveCustomLink(index)}
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

        <div style={styles.addLinkSection}>
          <div style={styles.addLinkRow}>
            <input
              type="text"
              value={newLinkLabel}
              onChange={(e) => setNewLinkLabel(e.target.value)}
              placeholder="Label (ex: Portfolio)"
              style={{ ...styles.input, flex: 1 }}
              onFocus={(e) => (e.currentTarget.style.borderColor = theme.accent.primary)}
              onBlur={(e) => (e.currentTarget.style.borderColor = theme.border.default)}
            />
            <input
              type="url"
              value={newLinkUrl}
              onChange={(e) => setNewLinkUrl(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustomLink();
                }
              }}
              placeholder="URL (ex: https://...)"
              style={{ ...styles.input, flex: 1 }}
              onFocus={(e) => (e.currentTarget.style.borderColor = theme.accent.primary)}
              onBlur={(e) => (e.currentTarget.style.borderColor = theme.border.default)}
            />
          </div>
          <button
            style={styles.addButton}
            onClick={handleAddCustomLink}
            disabled={!newLinkLabel.trim() || !newLinkUrl.trim()}
            onMouseEnter={(e) => {
              if (newLinkLabel.trim() && newLinkUrl.trim()) {
                e.currentTarget.style.backgroundColor = theme.accent.secondary;
              }
            }}
            onMouseLeave={(e) => {
              if (newLinkLabel.trim() && newLinkUrl.trim()) {
                e.currentTarget.style.backgroundColor = theme.accent.primary;
              }
            }}
          >
            + Ajouter un lien
          </button>
        </div>
        <span style={styles.hint}>
          Calendly, Malt, blog personnel, etc.
        </span>
      </div>
    </div>
  );
};
