/**
 * SOUVERAIN - Portfolio Wizard V2
 * Orchestrateur du parcours en 6 étapes (expertise retirée - services générés auto par DeepSeek)
 */

import React, { useState } from 'react';
import { useTheme } from '../../../ThemeContext';
import { typography, borderRadius, transitions } from '../../../design-system';
import type { PortfolioFormDataV2, WizardState } from '../types';
import { detectContext } from '../../../config/portfolioLabels';

// Import des steps
import { WizardStepAbout } from './WizardStepAbout';
import { WizardStepRealisations } from './WizardStepRealisations';
import { WizardStepTemplate } from './WizardStepTemplate';
import { WizardStepGeneration } from './WizardStepGeneration';
import { WizardStepPreview } from './WizardStepPreview';
import { WizardStepExport } from './WizardStepExport';

const TOTAL_STEPS = 6;

const INITIAL_FORM_DATA: PortfolioFormDataV2 = {
  profileType: 'person',
  profileContext: 'tech',
  name: 'Jean Dupont',
  title: 'Développeur Full-Stack',
  tagline: 'Passionné par la création d\'expériences web modernes et performantes',
  importSources: [],
  socialLinks: [
    { platform: 'LinkedIn', url: 'https://linkedin.com/in/jean-dupont' },
    { platform: 'GitHub', url: 'https://github.com/jeandupont' },
  ],
  // Positionnement (guide DeepSeek pour générer Hero, About, Services)
  valueProp: '',
  expertises: ['', '', ''],
  realisations: [],
  templateId: '',
  imageAssignments: {},
};

interface PortfolioWizardV2Props {
  onComplete?: (data: PortfolioFormDataV2) => void;
  onCancel?: () => void;
}

export const PortfolioWizardV2: React.FC<PortfolioWizardV2Props> = ({
  onComplete,
  onCancel,
}) => {
  const { theme } = useTheme();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PortfolioFormDataV2>(INITIAL_FORM_DATA);

  const handleUpdate = (updates: Partial<PortfolioFormDataV2>) => {
    setFormData(prev => {
      const updated = { ...prev, ...updates };
      
      // Auto-détecter le contexte si profileType change
      if (updates.profileType) {
        // Le contexte sera affiné par DeepSeek lors de la génération
        updated.profileContext = 'tech'; // Default, sera override par l'IA
      }
      
      return updated;
    });
  };

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(prev => prev + 1);
    } else if (onComplete) {
      onComplete(formData);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    } else if (onCancel) {
      onCancel();
    }
  };

  const handleStepClick = (step: number) => {
    setCurrentStep(step);
  };

  const renderStep = () => {
    const stepProps = {
      formData,
      onUpdate: handleUpdate,
      onNext: handleNext,
      onBack: handleBack,
    };

    switch (currentStep) {
      case 1:
        return <WizardStepAbout {...stepProps} />;
      case 2:
        return <WizardStepRealisations {...stepProps} />;
      case 3:
        return <WizardStepTemplate {...stepProps} />;
      case 4:
        return <WizardStepGeneration {...stepProps} />;
      case 5:
        return <WizardStepPreview {...stepProps} />;
      case 6:
        return <WizardStepExport {...stepProps} />;
      default:
        return null;
    }
  };

  // Styles
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: theme.bg.primary,
  };

  const progressBarContainerStyle: React.CSSProperties = {
    position: 'sticky',
    top: 0,
    padding: '0.75rem 2rem',
    backgroundColor: theme.bg.primary,
    borderBottom: `1px solid ${theme.border.light}`,
    zIndex: 100,
  };

  const stepsWrapperStyle: React.CSSProperties = {
    maxWidth: '600px',
    margin: '0 auto',
    position: 'relative',
  };

  const progressTrackStyle: React.CSSProperties = {
    position: 'absolute',
    top: '10px',
    left: '30px',
    right: '30px',
    height: '3px',
    backgroundColor: theme.bg.tertiary,
    zIndex: 0,
  };

  const progressFillStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    backgroundColor: '#3A3A3A',
    width: `${((currentStep - 1) / (TOTAL_STEPS - 1)) * 100}%`,
    transition: transitions.normal,
  };

  const stepsContainerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    zIndex: 1,
  };

  const stepItemStyle = (step: number): React.CSSProperties => {
    const active = currentStep === step;
    const completed = currentStep > step;
    
    return {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      flex: 'none',
      cursor: 'pointer',
    };
  };

  const stepDotStyle = (step: number): React.CSSProperties => {
    const active = currentStep === step;
    const completed = currentStep > step;
    
    return {
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      backgroundColor: completed || active ? '#3A3A3A' : theme.bg.tertiary,
      border: `3px solid ${theme.bg.primary}`,
      marginBottom: '0.5rem',
      transition: transitions.fast,
      zIndex: 1,
    };
  };

  const stepLabelStyle = (step: number): React.CSSProperties => {
    const active = currentStep === step;
    const completed = currentStep > step;
    
    return {
      fontSize: typography.fontSize.xs,
      color: active ? theme.text.primary : completed ? theme.text.secondary : theme.text.tertiary,
      fontWeight: active ? typography.fontWeight.semibold : typography.fontWeight.normal,
      textAlign: 'center',
      transition: transitions.fast,
      whiteSpace: 'nowrap',
    };
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    overflow: 'auto',
  };

  return (
    <div style={containerStyle}>
      {/* Progress bar */}
      <div style={progressBarContainerStyle}>
        <div style={stepsWrapperStyle}>
          <div style={progressTrackStyle}>
            <div style={progressFillStyle} />
          </div>
          <div style={stepsContainerStyle}>
            {[
              'À propos',
              'Réalisations',
              'Template',
              'Génération',
              'Preview',
              'Export'
            ].map((label, index) => {
              const step = index + 1;
              return (
                <div 
                  key={step} 
                  style={stepItemStyle(step)}
                  onClick={() => handleStepClick(step)}
                >
                  <div style={stepDotStyle(step)} />
                  <span style={stepLabelStyle(step)}>{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={contentStyle}>
        {renderStep()}
      </div>
    </div>
  );
};
