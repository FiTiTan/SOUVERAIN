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
    padding: '1rem 2rem',
    backgroundColor: theme.bg.secondary,
    borderBottom: `1px solid ${theme.border.light}`,
  };

  const progressBarStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  };

  const stepIndicatorStyle = (step: number, active: boolean, completed: boolean): React.CSSProperties => ({
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    backgroundColor: completed
      ? theme.semantic.success
      : active
      ? theme.accent.primary
      : theme.bg.tertiary,
    color: active || completed ? '#FFFFFF' : theme.text.tertiary,
  });

  const stepLabelStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: typography.fontSize.xs,
    color: theme.text.tertiary,
  };

  const contentStyle: React.CSSProperties = {
    flex: 1,
    overflow: 'auto',
  };

  return (
    <div style={containerStyle}>
      {/* Progress bar */}
      <div style={progressBarContainerStyle}>
        <div style={progressBarStyle}>
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((step) => (
            <div
              key={step}
              style={stepIndicatorStyle(
                step,
                currentStep === step,
                currentStep > step
              )}
            >
              {currentStep > step ? '✓' : step}
            </div>
          ))}
        </div>
        <div style={stepLabelStyle}>
          <span>À propos</span>
          <span>Expertise</span>
          <span>Réalisations</span>
          <span>Template</span>
          <span>Génération</span>
          <span>Preview</span>
          <span>Export</span>
        </div>
      </div>

      {/* Content */}
      <div style={contentStyle}>
        {renderStep()}
      </div>
    </div>
  );
};
