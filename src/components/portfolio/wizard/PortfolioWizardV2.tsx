/**
 * SOUVERAIN - Portfolio Wizard V2
 * Orchestrateur du parcours en 7 étapes
 */

import React, { useState } from 'react';
import { useTheme } from '../../../ThemeContext';
import { typography, borderRadius } from '../../../design-system';
import type { PortfolioFormDataV2, WizardState } from '../types';
import { detectContext } from '../../../config/portfolioLabels';

// Import des steps
import { WizardStepAbout } from './WizardStepAbout';
import { WizardStepExpertise } from './WizardStepExpertise';
import { WizardStepRealisations } from './WizardStepRealisations';
import { WizardStepTemplate } from './WizardStepTemplate';
import { WizardStepGeneration } from './WizardStepGeneration';
import { WizardStepPreview } from './WizardStepPreview';
import { WizardStepExport } from './WizardStepExport';

const TOTAL_STEPS = 7;

const INITIAL_FORM_DATA: PortfolioFormDataV2 = {
  profileType: 'person',
  profileContext: 'default',
  name: '',
  tagline: '',
  importSources: [],
  socialLinks: [],
  services: [],
  valueProp: '',
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
      
      // Auto-détecter le contexte si profileType ou services changent
      if (updates.profileType || updates.services) {
        updated.profileContext = detectContext(
          updated.profileType,
          updated.services.map(s => s.title)
        );
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
        return <WizardStepExpertise {...stepProps} />;
      case 3:
        return <WizardStepRealisations {...stepProps} />;
      case 4:
        return <WizardStepTemplate {...stepProps} />;
      case 5:
        return <WizardStepGeneration {...stepProps} />;
      case 6:
        return <WizardStepPreview {...stepProps} />;
      case 7:
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
    padding: '1.5rem 2rem',
    backgroundColor: theme.bg.secondary,
    borderBottom: `1px solid ${theme.border.light}`,
  };

  const progressTrackStyle: React.CSSProperties = {
    position: 'relative',
    height: '4px',
    backgroundColor: theme.bg.tertiary,
    borderRadius: '999px',
    marginBottom: '1.5rem',
    overflow: 'visible',
  };

  const progressFillStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    backgroundColor: theme.accent.primary,
    borderRadius: '999px',
    width: `${((currentStep - 1) / (TOTAL_STEPS - 1)) * 100}%`,
    transition: transitions.normal,
  };

  const stepsContainerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
  };

  const stepItemStyle = (step: number): React.CSSProperties => {
    const active = currentStep === step;
    const completed = currentStep > step;
    
    return {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      flex: 1,
      position: 'relative',
    };
  };

  const stepDotStyle = (step: number): React.CSSProperties => {
    const active = currentStep === step;
    const completed = currentStep > step;
    
    return {
      width: '12px',
      height: '12px',
      borderRadius: '50%',
      backgroundColor: completed || active ? theme.accent.primary : theme.bg.tertiary,
      border: `3px solid ${theme.bg.secondary}`,
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
        <div style={stepsContainerStyle}>
          {[
            'À propos',
            'Expertise',
            'Réalisations',
            'Template',
            'Génération',
            'Preview',
            'Export'
          ].map((label, index) => {
            const step = index + 1;
            return (
              <div key={step} style={stepItemStyle(step)}>
                <div style={stepDotStyle(step)} />
                <span style={stepLabelStyle(step)}>{label}</span>
              </div>
            );
          })}
        </div>
        <div style={progressTrackStyle}>
          <div style={progressFillStyle} />
        </div>
      </div>

      {/* Content */}
      <div style={contentStyle}>
        {renderStep()}
      </div>
    </div>
  );
};
