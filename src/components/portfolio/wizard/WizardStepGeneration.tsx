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

// Phrases aléatoires pour storytelling dynamique
const ANONYMIZATION_PHRASES = [
  "Vos données passent en mode masqué",
  "Protection de votre vie privée en cours",
  "Anonymisation de vos informations sensibles",
  "Vos données deviennent invisibles",
  "Mode confidentialité activé",
  "Sécurisation de votre identité",
  "Masquage des données personnelles",
  "Chiffrement de vos informations",
  "Activation du bouclier de confidentialité",
  "Vos données sont protégées localement",
];

const AI_BOOST_PHRASES = [
  "Votre portfolio est boosté par l'IA",
  "L'IA transforme votre contenu",
  "Génération de contenu professionnel en cours",
  "L'intelligence artificielle optimise votre portfolio",
  "Enrichissement par IA nouvelle génération",
  "L'IA crée votre storytelling unique",
  "Boost IA : transformation en cours",
  "Génération intelligente de contenu",
  "L'IA affine votre message professionnel",
  "Création de contenu percutant par IA",
];

// Sélection aléatoire au montage du composant
const getRandomPhrase = (phrases: string[]) => 
  phrases[Math.floor(Math.random() * phrases.length)];

// Icônes SVG animées
const MaskIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <g className="mask-anim">
      <path
        d="M24 8C16 8 10 14 10 22V32C10 36 13 40 17 40H31C35 40 38 36 38 32V22C38 14 32 8 24 8Z"
        fill="currentColor"
        opacity="0.2"
      />
      <circle cx="18" cy="22" r="3" fill="currentColor">
        <animate
          attributeName="opacity"
          values="0.3;1;0.3"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
      <circle cx="30" cy="22" r="3" fill="currentColor">
        <animate
          attributeName="opacity"
          values="0.3;1;0.3"
          dur="2s"
          begin="0.5s"
          repeatCount="indefinite"
        />
      </circle>
      <path
        d="M16 30C16 30 20 34 24 34C28 34 32 30 32 30"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.6"
      />
    </g>
  </svg>
);

const SparklingAIIcon = () => (
  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
    <g className="sparkle-anim">
      {/* Centre (cerveau stylisé) */}
      <circle cx="24" cy="24" r="8" fill="currentColor" opacity="0.3">
        <animate
          attributeName="r"
          values="8;9;8"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
      
      {/* Sparkles qui apparaissent */}
      <g>
        <path d="M12 12L14 14L12 16L10 14Z" fill="currentColor">
          <animate
            attributeName="opacity"
            values="0;1;0"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </path>
        <path d="M36 10L38 12L36 14L34 12Z" fill="currentColor">
          <animate
            attributeName="opacity"
            values="0;1;0"
            dur="1.5s"
            begin="0.3s"
            repeatCount="indefinite"
          />
        </path>
        <path d="M38 34L40 36L38 38L36 36Z" fill="currentColor">
          <animate
            attributeName="opacity"
            values="0;1;0"
            dur="1.5s"
            begin="0.6s"
            repeatCount="indefinite"
          />
        </path>
        <path d="M10 36L12 38L10 40L8 38Z" fill="currentColor">
          <animate
            attributeName="opacity"
            values="0;1;0"
            dur="1.5s"
            begin="0.9s"
            repeatCount="indefinite"
          />
        </path>
      </g>
      
      {/* Ondes qui se propagent */}
      <circle cx="24" cy="24" r="12" stroke="currentColor" strokeWidth="1" fill="none" opacity="0">
        <animate
          attributeName="r"
          values="12;16;20"
          dur="2s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="opacity"
          values="0.6;0.3;0"
          dur="2s"
          repeatCount="indefinite"
        />
      </circle>
    </g>
  </svg>
);

// Fonction pour créer les étapes avec phrases aléatoires
const createGenerationSteps = (): StepInfo[] => [
  {
    id: 'anonymize',
    label: getRandomPhrase(ANONYMIZATION_PHRASES),
    icon: MaskIcon as any,
    description: 'Protection de votre identité avant traitement IA',
  },
  {
    id: 'enrich',
    label: getRandomPhrase(AI_BOOST_PHRASES),
    icon: SparklingAIIcon as any,
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
  
  // Générer les étapes avec phrases aléatoires (une seule fois)
  const generationSteps = React.useMemo(() => createGenerationSteps(), []);

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
        // Phase 1 : Anonymisation (0-40%) - Plus visible
        if (progressValue < 40) {
          setCurrentStepIndex(0); // 🎭 Mode masqué
        } 
        // Phase 2 : IA Boost (40-80%) - Phase principale
        else if (progressValue < 80) {
          setCurrentStepIndex(1); // ✨ Boost IA
        } 
        // Phase 3 : Mise en page (80-95%)
        else if (progressValue < 95) {
          setCurrentStepIndex(2); // Layout
        } 
        // Phase 4 : Finalisation (95-100%)
        else {
          setCurrentStepIndex(3); // Finalization
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
        <h1 style={titleStyle}>
          {!isComplete ? 'Génération en cours...' : '✨ Portfolio généré !'}
        </h1>
        <p style={subtitleStyle}>
          {!isComplete 
            ? 'La puissance de l\'IA, la sécurité des données en plus'
            : 'Votre portfolio professionnel est prêt à être personnalisé'
          }
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

      {/* Progress bar avec gradient vert */}
      <div style={progressBarContainerStyle}>
        <div style={{
          height: '100%',
          background: 'linear-gradient(to right, #10b981, #34d399, #6ee7b7)',
          borderRadius: borderRadius.full,
          width: `${progress}%`,
          transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        }} />
      </div>
      <div style={{
        textAlign: 'right',
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.semibold,
        color: '#10b981',
        marginBottom: '2rem',
      }}>
        {progress}%
      </div>

      {/* Une seule card qui grandit avec les étapes */}
      <div style={{
        backgroundColor: theme.semantic.successBg,
        border: `2px solid ${theme.semantic.success}`,
        borderRadius: borderRadius.lg,
        padding: '1.5rem',
        minHeight: `${Math.max(200, currentStepIndex * 80 + 120)}px`,
        transition: 'min-height 0.5s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s ease',
        background: `linear-gradient(180deg, 
          ${theme.semantic.successBg} 0%, 
          rgba(16, 185, 129, 0.05) ${progress}%, 
          transparent ${progress}%
        )`,
      }}>
        {generationSteps.slice(0, currentStepIndex + 1).map((step, index) => {
          const status = index < currentStepIndex ? 'done' : 'active';
          const StepIcon = step.icon;
          
          return (
            <div key={step.id} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '1rem',
              padding: '0.75rem 0',
              opacity: index <= currentStepIndex ? 1 : 0,
              transform: index <= currentStepIndex ? 'translateY(0)' : 'translateY(-10px)',
              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                backgroundColor: status === 'done' ? theme.semantic.success : '#10b981',
                color: '#FFFFFF',
              }}>
                {status === 'done' ? (
                  <CheckCircleIcon size={20} color="#FFFFFF" strokeWidth={2.5} />
                ) : (
                  <StepIcon size={20} color="#FFFFFF" strokeWidth={2} />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.semibold,
                  color: theme.text.primary,
                  marginBottom: '0.25rem',
                }}>
                  {step.label}
                </div>
                <div style={{
                  fontSize: typography.fontSize.sm,
                  color: theme.text.secondary,
                  lineHeight: 1.5,
                }}>
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
