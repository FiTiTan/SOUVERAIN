/**
 * SOUVERAIN - Wizard Step 4: Template
 * Sélection du style visuel
 */

import React from 'react';
import { useTheme } from '../../../ThemeContext';
import { typography, borderRadius, transitions } from '../../../design-system';
import type { WizardStepProps } from '../types';

const TEMPLATES = [
  {
    id: 'bento-grid',
    name: 'Bento Grid',
    description: 'Moderne, Apple-inspired',
    preview: '░░░░░░░░░░░',
  },
  {
    id: 'organic-anti-grid',
    name: 'Organic',
    description: 'Naturel, formes organiques',
    preview: '◆◆◆◆◆◆◆',
  },
  {
    id: 'scroll-storytelling',
    name: 'Storytelling',
    description: 'Narrative, immersif',
    preview: '═══════',
  },
  {
    id: 'tactile-maximalism',
    name: 'Bold',
    description: 'Couleurs vives, énergique',
    preview: '▓▓▓▓▓▓▓',
  },
  {
    id: 'glassmorphism',
    name: 'Glass',
    description: 'Effet verre, élégant',
    preview: '▢▢▢▢▢▢▢',
  },
];

export const WizardStepTemplate: React.FC<WizardStepProps> = ({
  formData,
  onUpdate,
  onNext,
  onBack,
}) => {
  const { theme } = useTheme();

  const handleSelectTemplate = (templateId: string) => {
    onUpdate({ templateId });
  };

  const canProceed = !!formData.templateId;

  // Styles
  const containerStyle: React.CSSProperties = {
    padding: '2rem',
    maxWidth: '1000px',
    margin: '0 auto',
  };

  const headerStyle: React.CSSProperties = {
    marginBottom: '2rem',
    textAlign: 'center',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: theme.text.primary,
    marginBottom: '0.5rem',
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: typography.fontSize.base,
    color: theme.text.secondary,
  };

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.5rem',
    marginBottom: '3rem',
  };

  const templateCardStyle = (selected: boolean): React.CSSProperties => ({
    padding: '2rem',
    border: `2px solid ${selected ? theme.accent.primary : theme.border.default}`,
    borderRadius: borderRadius.lg,
    backgroundColor: selected ? theme.accent.muted : theme.bg.secondary,
    cursor: 'pointer',
    transition: transitions.fast,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  });

  const previewStyle: React.CSSProperties = {
    fontSize: '2rem',
    height: '100px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.bg.tertiary,
    borderRadius: borderRadius.md,
  };

  const buttonStyle = (variant: 'primary' | 'secondary'): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      padding: '0.75rem 1.5rem',
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      border: 'none',
      borderRadius: borderRadius.lg,
      cursor: 'pointer',
      transition: transitions.fast,
    };

    if (variant === 'primary') {
      return {
        ...baseStyle,
        backgroundColor: theme.accent.primary,
        color: '#FFFFFF',
      };
    } else {
      return {
        ...baseStyle,
        backgroundColor: 'transparent',
        color: theme.text.secondary,
        border: `1px solid ${theme.border.default}`,
      };
    }
  };

  const footerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    paddingTop: '2rem',
    borderTop: `1px solid ${theme.border.light}`,
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>STEP 4 : CHOISISSEZ VOTRE STYLE</h1>
        <p style={subtitleStyle}>Quel design correspond à votre image ?</p>
      </div>

      {/* Grid de templates */}
      <div style={gridStyle}>
        {TEMPLATES.map((template) => {
          const selected = formData.templateId === template.id;
          return (
            <div
              key={template.id}
              style={templateCardStyle(selected)}
              onClick={() => handleSelectTemplate(template.id)}
            >
              <div style={previewStyle}>{template.preview}</div>
              <div>
                <div style={{ fontWeight: typography.fontWeight.semibold, marginBottom: '0.25rem' }}>
                  {template.name}
                </div>
                <div style={{ fontSize: typography.fontSize.sm, color: theme.text.tertiary }}>
                  {template.description}
                </div>
              </div>
              <div style={{ fontSize: '1.5rem' }}>
                {selected ? '●' : '○'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer avec navigation */}
      <div style={footerStyle}>
        <button onClick={onBack} style={buttonStyle('secondary')}>
          ← Retour
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          style={{
            ...buttonStyle('primary'),
            opacity: canProceed ? 1 : 0.5,
            cursor: canProceed ? 'pointer' : 'not-allowed',
          }}
        >
          Générer →
        </button>
      </div>
    </div>
  );
};
