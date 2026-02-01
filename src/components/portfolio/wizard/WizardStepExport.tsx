/**
 * SOUVERAIN - Wizard Step 7: Export
 * Export final HTML + assets
 */

import React, { useState } from 'react';
import { useTheme } from '../../../ThemeContext';
import { typography, borderRadius, transitions } from '../../../design-system';
import type { WizardStepProps } from '../types';

export const WizardStepExport: React.FC<WizardStepProps> = ({
  formData,
  onUpdate,
  onNext,
  onBack,
}) => {
  const { theme } = useTheme();
  const [isExporting, setIsExporting] = useState(false);
  const [exportPath, setExportPath] = useState<string | null>(null);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      // Import dynamique du service
      const { exportPortfolioZip } = await import('../../../services/portfolioGeneratorV2Service');
      
      // @ts-ignore - Récupérer le HTML généré
      const html = formData._generatedHTML;
      
      if (!html) {
        throw new Error('HTML non généré. Revenez à l\'étape précédente.');
      }
      
      // Appel du service d'export
      const result = await exportPortfolioZip(formData, html);
      
      if (!result.success) {
        throw new Error(result.error || 'Échec de l\'export');
      }
      
      setExportPath(result.path || 'Portfolio exporté');
    } catch (error: any) {
      console.error('[Export] Error:', error);
      alert(`Erreur d'export: ${error.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Styles
  const containerStyle: React.CSSProperties = {
    padding: '2rem',
    maxWidth: '600px',
    margin: '0 auto',
    minHeight: '60vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    textAlign: 'center',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: theme.text.primary,
    marginBottom: '0.5rem',
  };

  const iconStyle: React.CSSProperties = {
    fontSize: '5rem',
    marginBottom: '2rem',
  };

  const messageStyle: React.CSSProperties = {
    fontSize: typography.fontSize.lg,
    color: theme.text.primary,
    marginBottom: '2rem',
  };

  const fileCardStyle: React.CSSProperties = {
    padding: '2rem',
    backgroundColor: theme.bg.secondary,
    border: `1px solid ${theme.border.default}`,
    borderRadius: borderRadius.lg,
    marginBottom: '2rem',
  };

  const buttonStyle = (variant: 'primary' | 'secondary'): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      padding: '0.75rem 1.5rem',
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium,
      border: 'none',
      borderRadius: borderRadius.lg,
      cursor: 'pointer',
      transition: transitions.fast,
      margin: '0.5rem',
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

  const actionsStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: '1rem',
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <h1 style={titleStyle}>STEP 7 : EXPORT</h1>

      {/* Icon */}
      <div style={iconStyle}>
        ✅
      </div>

      {/* Message */}
      <div style={messageStyle}>
        Votre portfolio est prêt !
      </div>

      {/* File info */}
      <div style={fileCardStyle}>
        <div style={{ fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold, marginBottom: '0.5rem' }}>
          📄 {formData.name.replace(/\s+/g, '_')}.html
        </div>
        <div style={{ fontSize: typography.fontSize.sm, color: theme.text.tertiary, marginBottom: '1rem' }}>
          + /assets (images)
        </div>

        {!exportPath ? (
          <button
            onClick={handleExport}
            disabled={isExporting}
            style={{
              ...buttonStyle('primary'),
              opacity: isExporting ? 0.5 : 1,
              cursor: isExporting ? 'not-allowed' : 'pointer',
            }}
          >
            {isExporting ? '⏳ Export en cours...' : 'Télécharger ZIP'}
          </button>
        ) : (
          <div style={{ color: theme.semantic.success }}>
            ✅ Exporté : {exportPath}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={actionsStyle}>
        <button onClick={onBack} style={buttonStyle('secondary')}>
          ← Modifier
        </button>
        <button
          onClick={() => {
            // TODO: Ouvrir le portfolio dans le navigateur
            alert('Ouvrir le portfolio dans le navigateur');
          }}
          style={buttonStyle('secondary')}
        >
          👁️ Voir en ligne
        </button>
      </div>

      {/* Info */}
      <p style={{ fontSize: typography.fontSize.sm, color: theme.text.tertiary, marginTop: '2rem' }}>
        Votre portfolio est 100% autonome : ouvrez index.html dans n'importe quel navigateur.
      </p>
    </div>
  );
};
