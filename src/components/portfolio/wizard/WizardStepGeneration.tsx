/**
 * SOUVERAIN - Wizard Step 5: Génération
 * Écran de génération avec progress et mise en avant de l'anonymisation
 */

import React, { useEffect, useState } from 'react';
import { useTheme } from '../../../ThemeContext';
import { typography, borderRadius, transitions } from '../../../design-system';
import type { WizardStepProps } from '../types';
import {
  LoaderIcon,
  CheckCircleIcon,
  CircleIcon,
  ShieldIcon,
  SparklesIcon,
  LayoutIcon,
} from '../../icons/FeatherIcons';

interface StepInfo {
  id: string;
  label: string;
  icon: typeof ShieldIcon;
  description: string;
}

const GENERATION_STEPS: StepInfo[] = [
  {
    id: 'anonymize',
    label: 'Anonymisation des données',
    icon: ShieldIcon,
    description: '🔒 Vos données sensibles sont protégées avant envoi à l\'IA',
  },
  {
    id: 'enrich',
    label: 'Enrichissement par IA',
    icon: SparklesIcon,
    description: 'Génération de contenu professionnel et percutant',
  },
  {
    id: 'layout',
    label: 'Mise en page',
    icon: LayoutIcon,
    description: 'Application du template et injection des données',
  },
  {
    id: 'finalize',
    label: 'Finalisation',
    icon: CheckCircleIcon,
    description: 'Portfolio prêt pour la personnalisation',
  },
];

export const WizardStepGeneration: React.FC<WizardStepProps> = ({
  formData,
  onUpdate,
  onNext,
  onBack,
}) => {
  const { theme } = useTheme();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('Initialisation...');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    generatePortfolio();
  }, []);

  const generatePortfolio = async () => {
    try {
      // Import dynamique du service
      const { generatePortfolioFromWizardV2 } = await import('../../../services/portfolioGeneratorV2Service');
      
      // DEBUG LOG - À SUPPRIMER APRÈS FIX
      console.log('[Generation] formData.realisations:', formData.realisations.map(r => ({
        id: r.id,
        title: r.title,
        hasExtractedContent: !!r.extractedContent,
        extractedContentLength: r.extractedContent?.length || 0,
        extractedContentPreview: r.extractedContent?.substring(0, 200)
      })));
      
      // Appel du service de génération avec callback de progression
      const result = await generatePortfolioFromWizardV2(formData, (step, progressValue) => {
        setCurrentStep(step);
        setProgress(progressValue);
        
        // Déterminer l'étape actuelle selon la progression
        if (progressValue < 25) {
          setCurrentStepIndex(0); // Anonymisation
        } else if (progressValue < 75) {
          setCurrentStepIndex(1); // Enrichissement IA
        } else if (progressValue < 95) {
          setCurrentStepIndex(2); // Mise en page
        } else {
          setCurrentStepIndex(3); // Finalisation
        }
      });

      if (!result.success) {
        throw new Error(result.error || 'Échec de la génération');
      }

      // Stocker le HTML généré dans formData pour le Step 6
      onUpdate({ 
        // @ts-ignore - On ajoute temporairement le HTML généré
        _generatedHTML: result.html 
      });

      setCurrentStepIndex(3);
      setIsComplete(true);
    } catch (error: any) {
      console.error('[Generation] Error:', error);
      setCurrentStep(`Erreur: ${error.message}`);
      setProgress(0);
    }
  };

  // Styles
  const containerStyle: React.CSSProperties = {
    padding: '3rem 2rem',
    maxWidth: '700px',
    margin: '0 auto',
    minHeight: '70vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  };

  const headerStyle: React.CSSProperties = {
    marginBottom: '3rem',
    textAlign: 'center',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.bold,
    color: theme.text.primary,
    marginBottom: '0.75rem',
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: typography.fontSize.base,
    color: theme.text.secondary,
    lineHeight: 1.6,
  };

  const spinnerContainerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '2rem',
    minHeight: '80px',
  };

  const progressBarContainerStyle: React.CSSProperties = {
    width: '100%',
    height: '8px',
    backgroundColor: theme.bg.tertiary,
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    marginBottom: '0.5rem',
  };

  const progressBarStyle: React.CSSProperties = {
    height: '100%',
    backgroundColor: theme.accent.primary,
    borderRadius: borderRadius.full,
    width: `${progress}%`,
    transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const progressTextStyle: React.CSSProperties = {
    textAlign: 'right',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: theme.accent.primary,
    marginBottom: '2rem',
  };

  const statusTextStyle: React.CSSProperties = {
    textAlign: 'center',
    fontSize: typography.fontSize.base,
    color: theme.text.secondary,
    marginBottom: '3rem',
  };

  const stepsListStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    marginBottom: '2rem',
  };

  const getStepStatus = (index: number): 'done' | 'active' | 'pending' => {
    if (index < currentStepIndex) return 'done';
    if (index === currentStepIndex) return 'active';
    return 'pending';
  };

  const stepItemStyle = (status: 'done' | 'active' | 'pending'): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    padding: '1.25rem 1.5rem',
    backgroundColor: status === 'active' 
      ? theme.accent.muted 
      : status === 'done' 
        ? theme.semantic.successBg 
        : 'transparent',
    border: `1px solid ${
      status === 'active' 
        ? theme.accent.primary 
        : status === 'done' 
          ? theme.semantic.success 
          : theme.border.default
    }`,
    borderRadius: borderRadius.lg,
    transition: transitions.normal,
  });

  const iconWrapperStyle = (status: 'done' | 'active' | 'pending'): React.CSSProperties => ({
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: status === 'done' 
      ? theme.semantic.success 
      : status === 'active' 
        ? theme.accent.primary 
        : theme.bg.tertiary,
    color: status === 'done' || status === 'active' ? '#FFFFFF' : theme.text.tertiary,
  });

  const stepContentStyle: React.CSSProperties = {
    flex: 1,
  };

  const stepLabelStyle = (status: 'done' | 'active' | 'pending'): React.CSSProperties => ({
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: status === 'pending' ? theme.text.tertiary : theme.text.primary,
    marginBottom: '0.25rem',
  });

  const stepDescStyle = (status: 'done' | 'active' | 'pending'): React.CSSProperties => ({
    fontSize: typography.fontSize.sm,
    color: status === 'pending' ? theme.text.tertiary : theme.text.secondary,
    lineHeight: 1.5,
  });

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>ÉTAPE 5 : GÉNÉRATION</h1>
        <p style={subtitleStyle}>
          Création de votre portfolio avec anonymisation des données sensibles
        </p>
      </div>

      {/* Spinner ou Success icon */}
      <div style={spinnerContainerStyle}>
        {!isComplete ? (
          <div style={{ 
            animation: 'spin 1.5s linear infinite',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <LoaderIcon size={64} color={theme.accent.primary} strokeWidth={2} />
          </div>
        ) : (
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <CheckCircleIcon size={64} color={theme.semantic.success} strokeWidth={2.5} />
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div style={progressBarContainerStyle}>
        <div style={progressBarStyle} />
      </div>
      <div style={progressTextStyle}>
        {progress}%
      </div>

      {/* Status */}
      <div style={statusTextStyle}>
        {currentStep}
      </div>

      {/* Steps checklist */}
      <div style={stepsListStyle}>
        {GENERATION_STEPS.map((step, index) => {
          const status = getStepStatus(index);
          const StepIcon = step.icon;
          
          return (
            <div key={step.id} style={stepItemStyle(status)}>
              <div style={iconWrapperStyle(status)}>
                {status === 'done' ? (
                  <CheckCircleIcon size={20} color="#FFFFFF" strokeWidth={2.5} />
                ) : status === 'active' ? (
                  <StepIcon size={20} color="#FFFFFF" strokeWidth={2} />
                ) : (
                  <CircleIcon size={20} color={theme.text.tertiary} strokeWidth={2} />
                )}
              </div>
              <div style={stepContentStyle}>
                <div style={stepLabelStyle(status)}>
                  {step.label}
                </div>
                <div style={stepDescStyle(status)}>
                  {step.description}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Security Badge */}
      {!isComplete && currentStepIndex === 0 && (
        <div style={{
          padding: '1rem 1.5rem',
          backgroundColor: theme.semantic.infoBg,
          border: `1px solid ${theme.semantic.info}`,
          borderRadius: borderRadius.md,
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '2rem',
        }}>
          <ShieldIcon size={24} color={theme.semantic.info} strokeWidth={2} />
          <div style={{
            fontSize: typography.fontSize.sm,
            color: theme.text.secondary,
            lineHeight: 1.5,
          }}>
            <strong>Sécurité :</strong> Vos données personnelles (emails, téléphones, noms) sont 
            automatiquement anonymisées avant l'enrichissement par IA, puis restaurées après.
          </div>
        </div>
      )}

      {/* Bouton Continuer */}
      {isComplete && (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button
            onClick={onNext}
            style={{
              padding: '1rem 2.5rem',
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.semibold,
              backgroundColor: theme.accent.primary,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: borderRadius.lg,
              cursor: 'pointer',
              transition: transitions.fast,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Continuer vers la personnalisation →
          </button>
        </div>
      )}

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
