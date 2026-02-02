/**
 * SOUVERAIN - Wizard Step 1: À Propos
 * Choix personne/lieu + imports + informations de base
 */

import React, { useState } from 'react';
import { useTheme } from '../../../ThemeContext';
import { typography, borderRadius, transitions } from '../../../design-system';
import type { WizardStepProps, ProfileType, ImportSource } from '../types';
import { SourceImporter } from './SourceImporter';
import { SocialLinksGrid } from './SocialLinksGrid';
import { AIEnhanceButtonInline } from './AIEnhanceButtonInline';

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

  const handleProfileTypeChange = (type: ProfileType) => {
    onUpdate({ profileType: type });
  };

  const handleImportSuccess = async (source: ImportSource) => {
    setIsImporting(true);
    setImportError(null);

    try {
      // Ajouter la source aux sources importées
      const updatedSources = [...formData.importSources, source];
      
      // Si des données ont été extraites, les pré-remplir
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
      const { enhanceText } = await import('../../../services/groqTextEnhancer');
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

  const canProceed = formData.name.trim().length > 0 && formData.tagline.trim().length > 0;

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

  const iconStyle: React.CSSProperties = {
    fontSize: '3rem',
  };

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
              <div style={{ fontSize: typography.fontSize.sm, color: theme.text.tertiary, marginBottom: '1rem' }}>
                Freelance, salarié, chercheur...
              </div>
              <div style={{ fontSize: typography.fontSize.xs, color: theme.text.secondary, lineHeight: '1.4' }}>
                Mettez en valeur votre parcours professionnel, vos compétences et vos réalisations pour décrocher de nouvelles opportunités.
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
              <div style={{ fontSize: typography.fontSize.sm, color: theme.text.tertiary, marginBottom: '1rem' }}>
                Restaurant, boutique, cabinet...
              </div>
              <div style={{ fontSize: typography.fontSize.xs, color: theme.text.secondary, lineHeight: '1.4' }}>
                Présentez votre établissement, vos services et attirez de nouveaux clients avec un portfolio professionnel.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Réseaux sociaux */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Réseaux sociaux :</h2>
        <SocialLinksGrid
          selectedLinks={formData.socialLinks}
          onUpdate={(links) => onUpdate({ socialLinks: links })}
        />
      </div>

      {/* Import de site web */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ ...sectionTitleStyle, marginBottom: 0 }}>
            Import depuis un site web
            <span style={{ position: 'relative' }}>
              <span
                onMouseEnter={(e) => {
                  const tooltip = e.currentTarget.querySelector('.tooltip-content') as HTMLElement;
                  if (tooltip) tooltip.style.display = 'block';
                }}
                onMouseLeave={(e) => {
                  const tooltip = e.currentTarget.querySelector('.tooltip-content') as HTMLElement;
                  if (tooltip) tooltip.style.display = 'none';
                }}
                style={{
                  marginLeft: '0.5rem',
                  cursor: 'help',
                  color: theme.text.tertiary,
                  fontSize: typography.fontSize.xs,
                  border: `1px solid ${theme.border.default}`,
                  borderRadius: '50%',
                  width: '18px',
                  height: '18px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  verticalAlign: 'middle',
                }}
              >
                ?
                <div
                  className="tooltip-content"
                  style={{
                    display: 'none',
                    position: 'absolute',
                    top: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    marginTop: '0.5rem',
                    padding: '0.75rem 1rem',
                    backgroundColor: 'rgba(187, 247, 208, 0.95)',
                    color: '#065F46',
                    fontSize: typography.fontSize.sm,
                    borderRadius: borderRadius.lg,
                    border: '2px dashed rgba(6, 95, 70, 0.3)',
                    minWidth: '250px',
                    maxWidth: '300px',
                    zIndex: 1000,
                    boxShadow: '0 4px 12px rgba(134, 239, 172, 0.4)',
                    animation: 'bounce 0.3s ease-out',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: typography.fontWeight.semibold, marginBottom: '0.25rem' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6"/>
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M12 2.83V6M12 18v3.17M3.17 12H6M18 12h3.17M5.64 5.64l2.83 2.83M15.54 15.54l2.83 2.83M5.64 18.36l2.83-2.83M15.54 8.46l2.83-2.83"/>
                    </svg>
                    Sources recommandées
                  </div>
                  <div style={{ fontSize: typography.fontSize.xs, lineHeight: '1.4' }}>
                    Google Business • TripAdvisor • LinkedIn • Site web personnel
                  </div>
                </div>
              </span>
            </span>
          </h2>
        </div>
        {(formData.importSources || []).filter(s => s.type === 'website').map((source, index) => (
          <div key={index} style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <input
              type="url"
              value={source.url || ''}
              readOnly
              style={{
                ...inputStyle,
                flex: 1,
                opacity: 0.7,
              }}
            />
            <button
              onClick={() => {
                const updated = formData.importSources.filter((_, i) => i !== index);
                onUpdate({ importSources: updated });
              }}
              style={{
                ...buttonStyle('secondary'),
                color: theme.semantic.error,
                borderColor: theme.semantic.error,
                whiteSpace: 'nowrap',
              }}
            >
              Retirer
            </button>
          </div>
        ))}
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <input
            type="url"
            placeholder="https://..."
            id="website-import-input"
            style={{
              ...inputStyle,
              flex: 1,
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                const input = document.getElementById('website-import-input') as HTMLInputElement;
                if (input && input.value.trim()) {
                  const newSource: ImportSource = {
                    type: 'website',
                    url: input.value.trim(),
                  };
                  onUpdate({
                    importSources: [...(formData.importSources || []), newSource],
                  });
                  input.value = '';
                }
              }
            }}
          />
          <button
            onClick={() => {
              const input = document.getElementById('website-import-input') as HTMLInputElement;
              if (input && input.value.trim()) {
                const newSource: ImportSource = {
                  type: 'website',
                  url: input.value.trim(),
                };
                onUpdate({
                  importSources: [...(formData.importSources || []), newSource],
                });
                input.value = '';
              }
            }}
            style={{
              ...buttonStyle('primary'),
              whiteSpace: 'nowrap',
            }}
          >
            Importer
          </button>
        </div>
      </div>

      {/* Import PDF / Texte */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Import depuis fichier :</h2>
        <div style={{
          border: `2px dashed ${theme.border.default}`,
          borderRadius: borderRadius.lg,
          padding: '1.5rem',
          backgroundColor: theme.bg.secondary,
          textAlign: 'center',
        }}>
          <p style={{
            fontSize: typography.fontSize.sm,
            color: theme.text.secondary,
            marginBottom: '1rem',
          }}>
            Importez un CV, une bio, ou tout autre document
          </p>
          <button
            style={{
              ...buttonStyle('secondary'),
            }}
          >
            📄 Choisir un fichier (PDF, TXT)
          </button>
        </div>
        {importError && (
          <div style={{ color: theme.semantic.error, marginTop: '0.5rem', fontSize: typography.fontSize.sm }}>
            ⚠️ {importError}
          </div>
        )}
      </div>

      {/* Informations extraites / Édition */}
      <div style={sectionStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={sectionTitleStyle}>Informations :</h2>
          {formData.importSources.length > 0 && (
            <span style={{ fontSize: typography.fontSize.sm, color: theme.text.tertiary }}>
              ✓ {formData.importSources.length} source(s) importée(s)
            </span>
          )}
        </div>

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

        <div style={formGroupStyle}>
          <label style={labelStyle}>Activité</label>
          <input
            type="text"
            value={formData.title || ''}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Développeur Full-Stack"
            style={inputStyle}
          />
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle}>
            Tagline *
            <span
              title="Une phrase courte et percutante qui résume votre identité ou votre proposition de valeur (ex: 'Créateur d'expériences digitales mémorables')"
              style={{
                marginLeft: '0.5rem',
                cursor: 'help',
                color: theme.text.tertiary,
                fontSize: typography.fontSize.xs,
                border: `1px solid ${theme.border.default}`,
                borderRadius: '50%',
                width: '16px',
                height: '16px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ?
            </span>
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => onUpdate({ tagline: e.target.value })}
              placeholder="Passionné par les solutions innovantes"
              style={{ ...inputStyle, paddingRight: '45px' }}
            />
            <AIEnhanceButtonInline
              onEnhance={handleEnhanceTagline}
              isLoading={isEnhancingTagline}
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
