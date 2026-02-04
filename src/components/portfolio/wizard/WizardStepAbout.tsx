/**
 * SOUVERAIN - Wizard Step 1: À Propos
 * 
 * V2 avec :
 * - Détection automatique du profileContext par IA
 * - Ordre : Activité → Expertises → Slogan → Ce qui vous différencie
 * - Labels dynamiques selon profileContext
 * - Boutons IA ✨ pour suggestions
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../../ThemeContext';
import { typography, borderRadius, transitions } from '../../../design-system';
import type { WizardStepProps, ProfileType, ImportSource } from '../types';
import { SocialLinksGrid } from './SocialLinksGrid';
import { AIEnhanceButtonInline } from './AIEnhanceButtonInline';
import { AIGeneratorButton } from './AIGeneratorButton';
import { 
  detectProfileContext, 
  getContextLabels,
  type ProfileContext,
  type ProfileContextResult 
} from '../../../services/profileContextDetector';

// Debounce helper
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export const WizardStepAbout: React.FC<WizardStepProps> = ({
  formData,
  onUpdate,
  onNext,
  onBack,
}) => {
  const { theme } = useTheme();
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [isEnhancingTagline, setIsEnhancingTagline] = useState(false);
  const [isDetectingContext, setIsDetectingContext] = useState(false);
  const [contextLabels, setContextLabels] = useState(getContextLabels('service', false));

  // Debounce l'activité pour la détection auto
  const debouncedActivity = useDebounce(formData.title || '', 500);

  // Détection automatique du profileContext quand l'activité change
  useEffect(() => {
    if (!debouncedActivity || debouncedActivity.length < 3) return;

    const detectContext = async () => {
      setIsDetectingContext(true);
      try {
        const result = await detectProfileContext(debouncedActivity);
        console.log('[WizardStepAbout] Detected context:', result);
        
        // Mettre à jour le formData avec le contexte détecté
        onUpdate({ 
          profileContext: result.context,
          profileType: result.isPlace ? 'place' : 'person',
        });
        
        // Mettre à jour les labels
        setContextLabels(getContextLabels(result.context, result.isPlace));
      } catch (error) {
        console.error('[WizardStepAbout] Context detection error:', error);
      } finally {
        setIsDetectingContext(false);
      }
    };

    detectContext();
  }, [debouncedActivity]);

  // Mettre à jour les labels quand profileContext change
  useEffect(() => {
    if (formData.profileContext) {
      setContextLabels(getContextLabels(
        formData.profileContext as ProfileContext, 
        formData.profileType === 'place'
      ));
    }
  }, [formData.profileContext, formData.profileType]);

  const handleProfileTypeChange = (type: ProfileType) => {
    onUpdate({ profileType: type });
  };

  const handleImportSuccess = async (source: ImportSource) => {
    setIsImporting(true);
    setImportError(null);

    try {
      const updatedSources = [...formData.importSources, source];
      
      if (source.extractedData) {
        const extracted = source.extractedData;
        onUpdate({
          importSources: updatedSources,
          name: extracted.name || formData.name,
          title: extracted.title || formData.title,
          tagline: extracted.tagline || formData.tagline,
          email: extracted.email || formData.email,
          phone: extracted.phone || formData.phone,
          address: extracted.address || formData.address,
          socialLinks: extracted.socialLinks || formData.socialLinks,
        });
      } else {
        onUpdate({ importSources: updatedSources });
      }
    } catch (error: any) {
      setImportError(error.message);
    } finally {
      setIsImporting(false);
    }
  };

  const handleEnhanceTagline = async () => {
    if (!formData.tagline || formData.tagline.trim().length === 0) {
      return;
    }

    setIsEnhancingTagline(true);
    try {
      const { enhanceText } = await import('../../../services/aiTextEnhancer');
      const enhanced = await enhanceText(formData.tagline, {
        type: 'tagline',
        context: {
          name: formData.name,
          activity: formData.title,
          profileType: formData.profileType,
        },
      });
      onUpdate({ tagline: enhanced });
    } catch (error: any) {
      console.error('Erreur amélioration IA:', error);
      alert(error.message || 'Erreur lors de l\'amélioration IA');
    } finally {
      setIsEnhancingTagline(false);
    }
  };

  // Expertises (avec valeurs par défaut)
  const expertises = formData.expertises || ['', '', ''];
  const hasExpertises = expertises.filter(e => e.trim() !== '').length > 0;
  const hasSlogan = formData.tagline && formData.tagline.trim() !== '';

  const handleExpertiseChange = (index: number, value: string) => {
    const updated = [...expertises];
    updated[index] = value;
    onUpdate({ expertises: updated });
  };

  const canProceed = formData.name.trim().length > 0 && formData.tagline.trim().length > 0;

  // ============================================
  // STYLES
  // ============================================

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

  const profileTypeContainerStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
    marginBottom: '1.5rem',
  };

  const profileTypeCardStyle = (selected: boolean): React.CSSProperties => ({
    padding: '2rem',
    border: `2px solid ${selected ? theme.accent.primary : theme.border.default}`,
    borderRadius: borderRadius.lg,
    backgroundColor: selected ? theme.accent.muted : theme.bg.secondary,
    cursor: 'pointer',
    transition: transitions.fast,
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  });

  const formGroupStyle: React.CSSProperties = {
    marginBottom: '1.5rem',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: theme.text.secondary,
    marginBottom: '0.5rem',
  };

  const helperStyle: React.CSSProperties = {
    fontSize: typography.fontSize.xs,
    color: theme.text.tertiary,
    fontWeight: typography.fontWeight.normal,
    marginLeft: '0.5rem',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    fontSize: typography.fontSize.base,
    border: `1px solid ${theme.border.default}`,
    borderRadius: borderRadius.md,
    backgroundColor: theme.bg.secondary,
    color: theme.text.primary,
    transition: transitions.fast,
  };

  const expertisesGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '0.75rem',
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
        return { ...baseStyle, backgroundColor: theme.accent.primary, color: '#FFFFFF' };
      case 'secondary':
        return { ...baseStyle, backgroundColor: 'transparent', color: theme.text.secondary, border: `1px solid ${theme.border.default}` };
      case 'danger':
        return { ...baseStyle, backgroundColor: theme.semantic.error, color: '#FFFFFF' };
    }
  };

  const footerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '3rem',
    paddingTop: '2rem',
    borderTop: `1px solid ${theme.border.light}`,
  };

  const inputWithButtonStyle: React.CSSProperties = {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'flex-start',
  };

  // ============================================
  // RENDER
  // ============================================

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>ÉTAPE 1 : À PROPOS</h1>
        <p style={subtitleStyle}>Qui êtes-vous ou que représentez-vous ?</p>
      </div>

      {/* Choix Personne / Lieu */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Ce portfolio représente :</h2>
        <div style={profileTypeContainerStyle}>
          <div
            style={profileTypeCardStyle(formData.profileType === 'person')}
            onClick={() => handleProfileTypeChange('person')}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <div>
              <div style={{ fontWeight: typography.fontWeight.semibold, marginBottom: '0.5rem' }}>
                Une personne
              </div>
              <div style={{ fontSize: typography.fontSize.sm, color: theme.text.tertiary }}>
                Freelance, salarié, artisan...
              </div>
            </div>
          </div>

          <div
            style={profileTypeCardStyle(formData.profileType === 'place')}
            onClick={() => handleProfileTypeChange('place')}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <div>
              <div style={{ fontWeight: typography.fontWeight.semibold, marginBottom: '0.5rem' }}>
                Un lieu / Une entreprise
              </div>
              <div style={{ fontSize: typography.fontSize.sm, color: theme.text.tertiary }}>
                Restaurant, boutique, cabinet...
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Informations de base */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Informations :</h2>

        {/* Nom */}
        <div style={formGroupStyle}>
          <label style={labelStyle}>Nom *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            placeholder="Jean Dupont"
            style={inputStyle}
          />
        </div>

        {/* Activité / Métier (avec détection auto) */}
        <div style={formGroupStyle}>
          <label style={labelStyle}>
            {contextLabels.activityLabel}
            {isDetectingContext && (
              <span style={{ marginLeft: '0.5rem', fontSize: typography.fontSize.xs, color: theme.text.tertiary }}>
                🔄 Détection...
              </span>
            )}
          </label>
          <input
            type="text"
            value={formData.title || ''}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder={contextLabels.activityPlaceholder}
            style={inputStyle}
          />
          {formData.profileContext && (
            <div style={{ 
              marginTop: '0.5rem', 
              fontSize: typography.fontSize.xs, 
              color: theme.accent.primary,
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
            }}>
              ✓ Catégorie détectée : {formData.profileContext}
            </div>
          )}
        </div>

        {/* Expertises / Spécialités */}
        <div style={formGroupStyle}>
          <label style={labelStyle}>
            {contextLabels.expertisesLabel}
            <span style={helperStyle}>{contextLabels.expertisesHelper}</span>
          </label>
          <div style={expertisesGridStyle}>
            {[0, 1, 2].map((index) => (
              <input
                key={index}
                type="text"
                value={expertises[index] || ''}
                onChange={(e) => handleExpertiseChange(index, e.target.value)}
                placeholder={contextLabels.expertisesPlaceholders[index]}
                style={inputStyle}
              />
            ))}
          </div>
        </div>

        {/* Slogan */}
        <div style={formGroupStyle}>
          <label style={labelStyle}>
            Votre slogan *
            <span style={helperStyle}>Votre promesse en une phrase.</span>
          </label>
          <div style={inputWithButtonStyle}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => onUpdate({ tagline: e.target.value })}
                placeholder="Ex: Des apps qui convertissent"
                style={{ ...inputStyle, paddingRight: '45px' }}
              />
              <AIEnhanceButtonInline
                onEnhance={handleEnhanceTagline}
                isLoading={isEnhancingTagline}
              />
            </div>
            <AIGeneratorButton
              type="slogan"
              activity={formData.title || ''}
              expertises={expertises}
              onSelect={(value) => onUpdate({ tagline: value })}
            />
          </div>
        </div>

        {/* Ce qui vous différencie */}
        <div style={formGroupStyle}>
          <label style={labelStyle}>
            Ce qui vous différencie
            <span style={helperStyle}>Pourquoi vous plutôt qu'un autre ?</span>
          </label>
          <div style={inputWithButtonStyle}>
            <input
              type="text"
              value={formData.valueProp || ''}
              onChange={(e) => onUpdate({ valueProp: e.target.value })}
              placeholder="Ex: Spécialiste e-commerce, +50 boutiques livrées"
              style={{ ...inputStyle, flex: 1 }}
            />
            <AIGeneratorButton
              type="difference"
              activity={formData.title || ''}
              expertises={expertises}
              slogan={formData.tagline || ''}
              onSelect={(value) => onUpdate({ valueProp: value })}
            />
          </div>
        </div>

        {/* Champs spécifiques aux lieux */}
        {formData.profileType === 'place' && (
          <>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => onUpdate({ email: e.target.value })}
                placeholder="contact@example.com"
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Téléphone</label>
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => onUpdate({ phone: e.target.value })}
                placeholder="01 42 XX XX XX"
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Adresse</label>
              <input
                type="text"
                value={formData.address || ''}
                onChange={(e) => onUpdate({ address: e.target.value })}
                placeholder="25 rue de la Paix, 75002 Paris"
                style={inputStyle}
              />
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Horaires d'ouverture</label>
              <input
                type="text"
                value={formData.openingHours || ''}
                onChange={(e) => onUpdate({ openingHours: e.target.value })}
                placeholder="Lun-Ven 9h-18h"
                style={inputStyle}
              />
            </div>
          </>
        )}
      </div>

      {/* Réseaux sociaux */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Réseaux sociaux :</h2>
        <SocialLinksGrid
          selectedLinks={formData.socialLinks}
          onUpdate={(links) => onUpdate({ socialLinks: links })}
        />
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
