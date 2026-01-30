import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useTheme } from '../../../ThemeContext';
import { useToast } from '../../ui/NotificationToast';
import { WizardProgress } from './WizardProgress';
import { Step1Identity } from './Step1Identity';
import { Step2Offer } from './Step2Offer';
import { Step3Contact } from './Step3Contact';
import { Step4Documents } from './Step4Documents';
import { Step5Social } from './Step5Social';
import { Step6Media } from './Step6Media';
import { Step7Template } from './Step7Template';
import {
  initialFormData,
  validateStep1,
  validateStep2,
  validateStep3,
  validateStep4,
  validateStep5,
  validateStep6,
  validateStep7,
  DEV_MODE,
} from './types';
import type { PortfolioFormData } from './types';

interface PortfolioWizardProps {
  onComplete: (data: PortfolioFormData) => void;
  onCancel?: () => void;
  existingData?: Partial<PortfolioFormData>;
}

export const PortfolioWizard: React.FC<PortfolioWizardProps> = ({
  onComplete,
  onCancel,
  existingData,
}) => {
  const { theme, mode } = useTheme();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<PortfolioFormData>({
    ...initialFormData,
    ...existingData,
  });

  const totalSteps = 7;

  const handleDataChange = (updates: Partial<PortfolioFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const canContinue = (): boolean => {
    switch (step) {
      case 1:
        return validateStep1(formData);
      case 2:
        return validateStep2(formData);
      case 3:
        return validateStep3(formData);
      case 4:
        return validateStep4(formData);
      case 5:
        return validateStep5(formData);
      case 6:
        return validateStep6(formData);
      case 7:
        return validateStep7(formData);
      default:
        return false;
    }
  };

  const getValidationMessage = (): string => {
    switch (step) {
      case 1:
        if (!formData.name.trim()) return 'Veuillez entrer votre nom';
        if (!formData.profileType) return 'Veuillez sélectionner votre type de profil';
        if (!formData.tagline.trim()) return 'Veuillez entrer une description';
        if (formData.tagline.length > 150) return 'La description est trop longue (max 150 caractères)';
        return '';
      case 2:
        const filledServices = formData.services.filter(s => s.trim().length > 0).length;
        if (filledServices === 0) return 'Veuillez entrer au moins un service';
        return '';
      case 3:
        if (!formData.email.trim()) return 'Veuillez entrer votre email';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) return 'Email invalide';
        return '';
      case 4:
        return ''; // Documents optionnels
      case 5:
        return ''; // Réseaux sociaux optionnels
      case 6:
        return ''; // Médias optionnels
      case 7:
        if (!formData.selectedTemplateId) return 'Veuillez sélectionner un template';
        return '';
      default:
        return '';
    }
  };

  const handleContinue = () => {
    if (!canContinue()) {
      const message = getValidationMessage();
      if (message) {
        toast.warning('Validation', message);
      }
      return;
    }

    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Final step - complete the wizard
      onComplete(formData);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1Identity data={formData} onChange={handleDataChange} />;
      case 2:
        return <Step2Offer data={formData} onChange={handleDataChange} />;
      case 3:
        return <Step3Contact data={formData} onChange={handleDataChange} />;
      case 4:
        return <Step4Documents data={formData} onChange={handleDataChange} />;
      case 5:
        return <Step5Social data={formData} onChange={handleDataChange} />;
      case 6:
        return <Step6Media data={formData} onChange={handleDataChange} />;
      case 7:
        return (
          <Step7Template
            selectedTemplateId={formData.selectedTemplateId}
            onSelectTemplate={(templateId) => handleDataChange({ selectedTemplateId: templateId })}
            isPremiumUser={false}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: mode === 'dark'
          ? 'linear-gradient(135deg, #0a0a0f 0%, #12121a 100%)'
          : 'linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)',
        overflow: 'hidden',
      }}
    >
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        maxWidth: '1000px',
        width: '100%',
        margin: '0 auto',
        padding: '2rem 2rem 0',
        overflow: 'hidden',
      }}>
        {/* Progress */}
        <div style={{ flexShrink: 0, marginBottom: '1.5rem' }}>
          <WizardProgress currentStep={step} totalSteps={totalSteps} />
          {DEV_MODE && (
            <div
              style={{
                padding: '0.5rem 1rem',
                background: 'rgba(251, 191, 36, 0.2)',
                border: '1px solid rgba(251, 191, 36, 0.5)',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#fbbf24',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginTop: '1rem',
              }}
            >
              ⚡ DEV MODE - Autofill activé
            </div>
          )}
        </div>

        {/* Step Content - Scrollable */}
        <motion.div
          style={{
            flex: 1,
            background: mode === 'dark' ? 'rgba(18, 18, 26, 0.8)' : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${theme.border.light}`,
            borderRadius: '24px',
            padding: '3rem',
            transform: 'translate3d(0, 0, 0)',
            boxShadow: mode === 'dark'
              ? '0 20px 60px rgba(0, 0, 0, 0.4)'
              : '0 20px 60px rgba(0, 0, 0, 0.1)',
            overflow: 'auto',
            marginBottom: '1.5rem',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Navigation - Fixed at Bottom */}
        <div
          style={{
            flexShrink: 0,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingBottom: '2rem',
          }}
        >
          {/* Back Button */}
          {step > 1 ? (
            <motion.button
              whileHover={{ scale: 1.02, x: -4 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBack}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                border: `1px solid ${theme.border.light}`,
                background: mode === 'dark' ? 'rgba(30, 41, 59, 0.3)' : 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(20px)',
                color: theme.text.secondary,
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: 400,
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.2s ease',
              }}
            >
              <ArrowLeft size={18} />
              Retour
            </motion.button>
          ) : (
            <div />
          )}

          {/* Cancel Button (optional) */}
          {onCancel && step === 1 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onCancel}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                border: `1px solid ${theme.border.light}`,
                background: mode === 'dark' ? 'rgba(30, 41, 59, 0.3)' : 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(20px)',
                color: theme.text.tertiary,
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: 400,
                transition: 'all 0.2s ease',
              }}
            >
              Annuler
            </motion.button>
          )}

          {/* Continue/Finish Button */}
          <motion.button
            whileHover={{ scale: canContinue() ? 1.02 : 1, x: canContinue() ? 4 : 0 }}
            whileTap={{ scale: canContinue() ? 0.98 : 1 }}
            onClick={handleContinue}
            disabled={!canContinue()}
            style={{
              padding: '0.75rem 2rem',
              borderRadius: '12px',
              border: `1px solid ${canContinue() ? theme.border.default : theme.border.light}`,
              background: canContinue()
                ? mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)'
                : mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
              backdropFilter: 'blur(20px)',
              color: canContinue() ? theme.text.primary : theme.text.muted,
              cursor: canContinue() ? 'pointer' : 'not-allowed',
              fontSize: '0.95rem',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s ease',
              opacity: canContinue() ? 1 : 0.5,
            }}
          >
            {step === totalSteps ? 'Générer mon portfolio' : 'Continuer'}
            {step < totalSteps && <ArrowRight size={18} />}
          </motion.button>
        </div>

        {/* Validation Hint */}
        {!canContinue() && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              flexShrink: 0,
              marginTop: '0.5rem',
              textAlign: 'right',
              color: theme.semantic.warning,
              fontSize: '0.85rem',
              fontStyle: 'italic',
              paddingBottom: '0.5rem',
            }}
          >
            {getValidationMessage()}
          </motion.div>
        )}
      </div>
    </div>
  );
};
