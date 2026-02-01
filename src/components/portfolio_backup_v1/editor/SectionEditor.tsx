/**
 * SOUVERAIN - Section Editor (MPF-6)
 * Modal d'édition de section de portfolio
 * CALM-UI: CalmModal + GlassForms
 */

import React, { useState, useEffect } from 'react';
import { CalmModal } from '../../ui/CalmModal';
import { GlassInput, GlassTextArea } from '../../ui/GlassForms';
import { useTheme } from '../../../ThemeContext';
import { typography, borderRadius } from '../../../design-system';

// ============================================================
// TYPES
// ============================================================

interface Section {
  id: string;
  type: 'hero' | 'about' | 'services' | 'projects' | 'testimonials' | 'practical' | 'contact' | 'custom';
  title: string;
  content: string;
  metadata?: Record<string, any>;
  order: number;
}

interface SectionEditorProps {
  section: Section;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: Partial<Section>) => void;
}

// ============================================================
// SECTION TYPE LABELS
// ============================================================

const SECTION_TYPE_LABELS: Record<Section['type'], string> = {
  hero: 'Hero / Titre principal',
  about: 'À propos',
  services: 'Services',
  projects: 'Projets',
  testimonials: 'Témoignages',
  practical: 'Informations pratiques',
  contact: 'Contact',
  custom: 'Section personnalisée',
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export const SectionEditor: React.FC<SectionEditorProps> = ({
  section,
  isOpen,
  onClose,
  onSave,
}) => {
  const { theme } = useTheme();

  const [title, setTitle] = useState(section.title);
  const [content, setContent] = useState(section.content);
  const [hasChanges, setHasChanges] = useState(false);

  // Reset form when section changes
  useEffect(() => {
    setTitle(section.title);
    setContent(section.content);
    setHasChanges(false);
  }, [section]);

  // Track changes
  useEffect(() => {
    const changed = title !== section.title || content !== section.content;
    setHasChanges(changed);
  }, [title, content, section]);

  const handleSave = () => {
    onSave({ title, content });
    onClose();
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (!confirm('Abandonner les modifications ?')) return;
    }
    setTitle(section.title);
    setContent(section.content);
    setHasChanges(false);
    onClose();
  };

  const styles = {
    form: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1.5rem',
    },
    typeInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.75rem 1rem',
      background: theme.accent.muted,
      borderRadius: borderRadius.lg,
      border: `1px solid ${theme.accent.primary}40`,
    },
    typeLabel: {
      fontSize: typography.fontSize.sm,
      color: theme.text.secondary,
    },
    typeName: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: theme.accent.primary,
    },
    helpText: {
      fontSize: typography.fontSize.xs,
      color: theme.text.tertiary,
      lineHeight: typography.lineHeight.relaxed,
      marginTop: '-0.5rem',
    },
    footer: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '1rem',
      marginTop: '1rem',
    },
    button: (variant: 'secondary' | 'primary') => ({
      padding: '0.75rem 1.5rem',
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      borderRadius: borderRadius.lg,
      border: variant === 'secondary' ? `1px solid ${theme.border.default}` : 'none',
      background: variant === 'secondary' ? 'transparent' : theme.accent.primary,
      color: variant === 'secondary' ? theme.text.primary : '#FFFFFF',
      cursor: 'pointer',
      transition: 'all 150ms ease',
    }),
  };

  return (
    <CalmModal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Éditer la section"
      width="600px"
    >
      <div style={styles.form}>
        {/* Type Info */}
        <div style={styles.typeInfo}>
          <span style={styles.typeLabel}>Type de section :</span>
          <span style={styles.typeName}>{SECTION_TYPE_LABELS[section.type]}</span>
        </div>

        {/* Title */}
        <div>
          <GlassInput
            label="Titre de la section"
            placeholder="Ex: À propos de moi"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            required
          />
          <p style={styles.helpText}>
            Ce titre apparaîtra dans la navigation et comme en-tête de section.
          </p>
        </div>

        {/* Content */}
        <div>
          <GlassTextArea
            label="Contenu"
            placeholder="Rédigez le contenu de cette section..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            required
          />
          <p style={styles.helpText}>
            {section.type === 'hero'
              ? 'Phrase d\'accroche courte et percutante (1-2 lignes).'
              : section.type === 'about'
              ? 'Présentez-vous en 2-3 paragraphes. Parlez de votre parcours et expertise.'
              : section.type === 'projects'
              ? 'Introduction à vos réalisations (le détail des projets est géré séparément).'
              : 'Rédigez le contenu que vous souhaitez afficher dans cette section.'}
          </p>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button
            style={styles.button('secondary')}
            onClick={handleCancel}
            onMouseEnter={(e) => e.currentTarget.style.background = theme.bg.secondary}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            Annuler
          </button>
          <button
            style={styles.button('primary')}
            onClick={handleSave}
            disabled={!hasChanges || !title.trim() || !content.trim()}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.opacity = '0.9';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            {hasChanges ? 'Enregistrer les modifications' : 'Aucune modification'}
          </button>
        </div>
      </div>
    </CalmModal>
  );
};
