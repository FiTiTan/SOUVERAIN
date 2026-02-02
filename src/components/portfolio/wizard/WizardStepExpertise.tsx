/**
 * SOUVERAIN - Wizard Step 2: Expertise
 * Services + proposition de valeur avec IA
 */

import React, { useState } from 'react';
import { useTheme } from '../../../ThemeContext';
import { typography, borderRadius, transitions } from '../../../design-system';
import type { WizardStepProps, Service } from '../types';
import { AIEnhanceButtonInline } from './AIEnhanceButtonInline';

export const WizardStepExpertise: React.FC<WizardStepProps> = ({
  formData,
  onUpdate,
  onNext,
  onBack,
}) => {
  const { theme } = useTheme();
  const [isEnhancingValueProp, setIsEnhancingValueProp] = useState(false);

  const handleServiceChange = (index: number, field: 'title' | 'description', value: string) => {
    const updated = [...formData.services];
    updated[index] = { ...updated[index], [field]: value };
    onUpdate({ services: updated });
  };

  const handleAddService = () => {
    onUpdate({
      services: [...formData.services, { title: '', description: '', suggested: false }],
    });
  };

  const handleRemoveService = (index: number) => {
    const updated = formData.services.filter((_, i) => i !== index);
    onUpdate({ services: updated });
  };

  const handleEnhanceValueProp = async () => {
    if (!formData.valueProp || formData.valueProp.trim().length === 0) {
      return;
    }

    setIsEnhancingValueProp(true);
    try {
      const { enhanceText } = await import('../../../services/aiTextEnhancer');
      const enhanced = await enhanceText(formData.valueProp, {
        type: 'valueProp',
        context: {
          name: formData.name,
          activity: formData.title,
          profileType: formData.profileType,
        },
      });
      onUpdate({ valueProp: enhanced });
    } catch (error: any) {
      console.error('Erreur amélioration IA:', error);
      alert(error.message || 'Erreur lors de l\'amélioration IA');
    } finally {
      setIsEnhancingValueProp(false);
    }
  };

  // Initialiser avec au moins 1 service vide
  if (formData.services.length === 0) {
    onUpdate({
      services: [{ title: '', description: '', suggested: false }],
    });
  }

  const canProceed = formData.services.some(s => s.title.trim().length > 0) && 
                     formData.valueProp.trim().length > 0;

  // Styles
  const containerStyle: React.CSSProperties = {
    padding: '2rem',
    maxWidth: '800px',
    margin: '0 auto',
  };

  const headerStyle: React.CSSProperties = {
    marginBottom: '2rem',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: theme.text.primary,
    marginBottom: '0.5rem',
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: typography.fontSize.base,
    color: theme.text.secondary,
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: '2rem',
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: theme.text.primary,
    marginBottom: '1rem',
  };

  const serviceCardStyle: React.CSSProperties = {
    padding: '1.5rem',
    border: `1px solid ${theme.border.default}`,
    borderRadius: borderRadius.lg,
    backgroundColor: theme.bg.secondary,
    marginBottom: '1rem',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    fontSize: typography.fontSize.base,
    border: `1px solid ${theme.border.default}`,
    borderRadius: borderRadius.md,
    backgroundColor: theme.bg.primary,
    color: theme.text.primary,
    transition: transitions.fast,
  };

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: '80px',
    resize: 'vertical' as const,
    fontFamily: 'inherit',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: theme.text.secondary,
    marginBottom: '0.5rem',
  };

  const buttonStyle = (variant: 'primary' | 'secondary' | 'danger'): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      padding: '0.75rem 1.5rem',
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      border: 'none',
      borderRadius: borderRadius.lg,
      cursor: 'pointer',
      transition: transitions.fast,
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyle,
          backgroundColor: theme.accent.primary,
          color: '#FFFFFF',
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          color: theme.text.secondary,
          border: `1px solid ${theme.border.default}`,
        };
      case 'danger':
        return {
          ...baseStyle,
          backgroundColor: theme.semantic.error,
          color: '#FFFFFF',
        };
    }
  };

  const footerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '3rem',
    paddingTop: '2rem',
    borderTop: `1px solid ${theme.border.light}`,
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>ÉTAPE 2 : EXPERTISE</h1>
        <p style={subtitleStyle}>Que faites-vous ? Quels services proposez-vous ?</p>
      </div>

      {/* Services */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Vos services :</h2>
        {formData.services.map((service, index) => (
          <div key={index} style={serviceCardStyle}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={labelStyle}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }}>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <line x1="9" y1="9" x2="15" y2="9"/>
                  <line x1="9" y1="15" x2="15" y2="15"/>
                </svg>
                Titre du service
              </label>
              <input
                type="text"
                value={service.title}
                onChange={(e) => handleServiceChange(index, 'title', e.target.value)}
                placeholder="Ex: Développement web"
                style={inputStyle}
              />
            </div>
            <div style={{ marginBottom: formData.services.length > 1 ? '1rem' : 0 }}>
              <label style={labelStyle}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
                Description
              </label>
              <textarea
                value={service.description}
                onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                placeholder="Ex: Création d'applications web modernes et performantes"
                style={textareaStyle}
              />
            </div>
            {formData.services.length > 1 && (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => handleRemoveService(index)}
                  style={{
                    ...buttonStyle('secondary'),
                    color: theme.semantic.error,
                    borderColor: theme.semantic.error,
                    padding: '0.5rem 1rem',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }}>
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                  Retirer
                </button>
              </div>
            )}
          </div>
        ))}
        <button onClick={handleAddService} style={buttonStyle('secondary')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }}>
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Ajouter un service
        </button>
      </div>

      {/* Proposition de valeur */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Proposition de valeur :</h2>
        <p style={{ fontSize: typography.fontSize.sm, color: theme.text.tertiary, marginBottom: '1rem' }}>
          En une phrase, qu'est-ce qui vous différencie ?
        </p>
        <div style={{ position: 'relative' }}>
          <textarea
            value={formData.valueProp}
            onChange={(e) => onUpdate({ valueProp: e.target.value })}
            placeholder="Ex: Je transforme vos idées en applications web performantes et élégantes"
            style={{ ...textareaStyle, paddingRight: '45px' }}
          />
          <AIEnhanceButtonInline
            onEnhance={handleEnhanceValueProp}
            isLoading={isEnhancingValueProp}
          />
        </div>
      </div>

      {/* Footer avec navigation */}
      <div style={footerStyle}>
        <button onClick={onBack} style={buttonStyle('secondary')}>
          ← Retour
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          style={{
            ...buttonStyle('primary'),
            opacity: canProceed ? 1 : 0.5,
            cursor: canProceed ? 'pointer' : 'not-allowed',
          }}
        >
          Suivant →
        </button>
      </div>
    </div>
  );
};
