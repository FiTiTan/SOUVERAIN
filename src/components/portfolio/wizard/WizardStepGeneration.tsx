/**
 * SOUVERAIN - Wizard Step 5: Génération
 * Écran de génération avec progress
 */

import React, { useEffect, useState } from 'react';
import { useTheme } from '../../../ThemeContext';
import { typography, borderRadius } from '../../../design-system';
import type { WizardStepProps } from '../types';

export const WizardStepGeneration: React.FC<WizardStepProps> = ({
  formData,
  onUpdate,
  onNext,
  onBack,
}) => {
  const { theme } = useTheme();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('Initialisation...');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    generatePortfolio();
  }, []);

  const generatePortfolio = async () => {
    try {
      // Import dynamique du service
      const { generatePortfolioFromWizardV2 } = await import('../../../services/portfolioGeneratorV2Service');
      
      // Appel du service de génération avec callback de progression
      const result = await generatePortfolioFromWizardV2(formData, (step, progressValue) => {
        setCurrentStep(step);
        setProgress(progressValue);
      });

      if (!result.success) {
        throw new Error(result.error || 'Échec de la génération');
      }

      // Stocker le HTML généré dans formData pour le Step 6
      onUpdate({ 
        // @ts-ignore - On ajoute temporairement le HTML généré
        _generatedHTML: result.html 
      });

      setIsComplete(true);

      // Auto-avancer après 1s
      setTimeout(() => {
        onNext();
      }, 1000);
    } catch (error: any) {
      console.error('[Generation] Error:', error);
      setCurrentStep(`Erreur: ${error.message}`);
      setProgress(0);
    }
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Styles
  const containerStyle: React.CSSProperties = {
    padding: '2rem',
    maxWidth: '600px',
    margin: '0 auto',
    minHeight: '60vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  };

  const headerStyle: React.CSSProperties = {
    marginBottom: '3rem',
    textAlign: 'center',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: theme.text.primary,
    marginBottom: '0.5rem',
  };

  const spinnerStyle: React.CSSProperties = {
    fontSize: '4rem',
    textAlign: 'center',
    marginBottom: '2rem',
    animation: 'spin 2s linear infinite',
  };

  const progressBarContainerStyle: React.CSSProperties = {
    width: '100%',
    height: '12px',
    backgroundColor: theme.bg.tertiary,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: '1.5rem',
  };

  const progressBarStyle: React.CSSProperties = {
    height: '100%',
    backgroundColor: theme.accent.primary,
    borderRadius: borderRadius.full,
    width: `${progress}%`,
    transition: 'width 0.3s ease',
  };

  const progressTextStyle: React.CSSProperties = {
    textAlign: 'center',
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium,
    color: theme.text.primary,
    marginBottom: '1rem',
  };

  const statusTextStyle: React.CSSProperties = {
    textAlign: 'center',
    fontSize: typography.fontSize.base,
    color: theme.text.secondary,
    marginBottom: '2rem',
  };

  const stepsListStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginTop: '2rem',
  };

  const stepItemStyle = (done: boolean, active: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '0.75rem 1rem',
    backgroundColor: active ? theme.accent.muted : 'transparent',
    borderRadius: borderRadius.md,
    color: done ? theme.semantic.success : active ? theme.text.primary : theme.text.tertiary,
  });

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>STEP 5 : GÉNÉRATION</h1>
      </div>

      {/* Spinner */}
      {!isComplete && (
        <div style={spinnerStyle}>
          ⏳
        </div>
      )}

      {isComplete && (
        <div style={{ ...spinnerStyle, animation: 'none' }}>
          ✅
        </div>
      )}

      {/* Progress bar */}
      <div style={progressBarContainerStyle}>
        <div style={progressBarStyle} />
      </div>

      {/* Progress text */}
      <div style={progressTextStyle}>
        {progress}%
      </div>

      {/* Status */}
      <div style={statusTextStyle}>
        {currentStep}
      </div>

      {/* Steps checklist */}
      <div style={stepsListStyle}>
        <div style={stepItemStyle(progress >= 25, progress >= 0 && progress < 50)}>
          <span>{progress >= 25 ? '✅' : '○'}</span>
          <span>Données analysées</span>
        </div>
        <div style={stepItemStyle(progress >= 50, progress >= 25 && progress < 75)}>
          <span>{progress >= 50 ? '✅' : '○'}</span>
          <span>Contenu enrichi</span>
        </div>
        <div style={stepItemStyle(progress >= 75, progress >= 50 && progress < 100)}>
          <span>{progress >= 75 ? '✅' : '○'}</span>
          <span>Mise en page en cours</span>
        </div>
        <div style={stepItemStyle(progress >= 100, false)}>
          <span>{progress >= 100 ? '✅' : '○'}</span>
          <span>Finalisation</span>
        </div>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
