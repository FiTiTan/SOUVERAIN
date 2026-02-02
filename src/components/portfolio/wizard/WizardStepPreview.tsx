/**
 * SOUVERAIN - Wizard Step 6: Preview Éditable
 * Preview avec drag & drop d'images
 */

import React from 'react';
import { useTheme } from '../../../ThemeContext';
import { typography, borderRadius, transitions } from '../../../design-system';
import type { WizardStepProps } from '../types';
import { EditablePreviewScreen } from '../EditablePreviewScreen';
import type { PortfolioPreviewData } from '../types';

export const WizardStepPreview: React.FC<WizardStepProps> = ({
  formData,
  onUpdate,
  onNext,
  onBack,
}) => {
  const { theme } = useTheme();

  // @ts-ignore - HTML généré temporairement stocké dans formData
  const generatedHTML = formData._generatedHTML as string | undefined;

  if (!generatedHTML) {
    // Pas de HTML généré, afficher message d'erreur
    return (
      <div style={{
        padding: '2rem',
        maxWidth: '600px',
        margin: '0 auto',
        textAlign: 'center',
      }}>
        <div style={{
          padding: '3rem',
          backgroundColor: theme.semantic.error + '20',
          borderRadius: borderRadius.lg,
          marginBottom: '2rem',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{
            fontSize: typography.fontSize.xl,
            fontWeight: typography.fontWeight.semibold,
            color: theme.text.primary,
            marginBottom: '1rem',
          }}>
            Aucun portfolio généré
          </h2>
          <p style={{
            fontSize: typography.fontSize.base,
            color: theme.text.secondary,
            marginBottom: '2rem',
          }}>
            L'étape de génération a échoué ou a été sautée. Veuillez retourner à l'étape précédente et réessayer.
          </p>
          <button
            onClick={onBack}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              backgroundColor: theme.accent.primary,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: borderRadius.lg,
              cursor: 'pointer',
            }}
          >
            ← Retour à la génération
          </button>
        </div>
      </div>
    );
  }

  // Construire portfolioData depuis formData
  const portfolioData: PortfolioPreviewData = {
    portfolioId: 'wizard-' + Date.now(),
    authorName: formData.name,
    authorTitle: formData.title || '',
    intentions: [],
    style: formData.templateId || 'bento-grid',
    projects: formData.realisations.map((r, i) => ({
      title: r.title,
      description: r.description || '',
      category: r.category || '',
    })),
  };

  const handleExportClick = (html: string) => {
    // Stocker le HTML final dans formData avant de passer à l'étape suivante
    // @ts-ignore
    onUpdate({ _finalHTML: html });
    onNext();
  };

  return (
    <EditablePreviewScreen
      portfolioData={portfolioData}
      initialHtml={generatedHTML}
      onBack={onBack}
      onExport={handleExportClick}
    />
  );
};
