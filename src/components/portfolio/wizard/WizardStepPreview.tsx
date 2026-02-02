/**
 * SOUVERAIN - Wizard Step 6: Preview Éditable
 * Preview avec drag & drop d'images
 */

import React from 'react';
import { useTheme } from '../../../ThemeContext';
import { typography, borderRadius, transitions } from '../../../design-system';
import type { WizardStepProps } from '../types';
// Import du composant EditablePreviewScreen existant
// import { EditablePreviewScreen } from '../EditablePreviewScreen';

export const WizardStepPreview: React.FC<WizardStepProps> = ({
  formData,
  onUpdate,
  onNext,
  onBack,
}) => {
  const { theme } = useTheme();

  // TODO: Intégrer EditablePreviewScreen ici
  // Pour l'instant, version simplifiée

  // Styles
  const containerStyle: React.CSSProperties = {
    padding: '2rem',
    maxWidth: '1400px',
    margin: '0 auto',
  };

  const headerStyle: React.CSSProperties = {
    marginBottom: '2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: theme.text.primary,
  };

  const mainStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '240px 1fr',
    gap: '2rem',
    minHeight: '600px',
  };

  const sidebarStyle: React.CSSProperties = {
    padding: '1.5rem',
    backgroundColor: theme.bg.secondary,
    borderRadius: borderRadius.lg,
    border: `1px solid ${theme.border.default}`,
  };

  const previewStyle: React.CSSProperties = {
    padding: '2rem',
    backgroundColor: theme.bg.secondary,
    borderRadius: borderRadius.lg,
    border: `1px solid ${theme.border.default}`,
    minHeight: '600px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.text.tertiary,
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

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>ÉTAPE 6 : PERSONNALISEZ</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={onBack} style={buttonStyle('secondary')}>
            ← Retour
          </button>
          <button onClick={onNext} style={buttonStyle('primary')}>
            Exporter →
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={mainStyle}>
        {/* Sidebar - Bibliothèque d'images */}
        <div style={sidebarStyle}>
          <h3 style={{ 
            fontSize: typography.fontSize.base, 
            fontWeight: typography.fontWeight.semibold, 
            marginBottom: '1rem' 
          }}>
            Bibliothèque d'images
          </h3>
          <button style={{ ...buttonStyle('secondary'), width: '100%', marginBottom: '1rem' }}>
            + Importer
          </button>
          <p style={{ fontSize: typography.fontSize.sm, color: theme.text.tertiary }}>
            Glissez vos images vers le preview →
          </p>
        </div>

        {/* Preview */}
        <div style={previewStyle}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ marginBottom: '1rem' }}>Preview du portfolio généré</p>
            <p style={{ fontSize: typography.fontSize.sm }}>
              TODO: Intégrer EditablePreviewScreen
            </p>
            <p style={{ fontSize: typography.fontSize.sm, marginTop: '0.5rem' }}>
              (Drag & drop d'images sur les zones)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
