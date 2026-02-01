/**
 * SOUVERAIN - Wizard Step 1: À Propos
 * Choix personne/lieu + imports + informations de base
 */

import React, { useState } from 'react';
import { useTheme } from '../../../ThemeContext';
import { typography, borderRadius, transitions } from '../../../design-system';
import type { WizardStepProps, ProfileType, ImportSource } from '../types';
import { SourceImporter } from './SourceImporter';

export const WizardStepAbout: React.FC<WizardStepProps> = ({
  formData,
  onUpdate,
  onNext,
  onBack,
}) => {
  const { theme } = useTheme();
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

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

  const handleSocialLinkChange = (index: number, field: 'platform' | 'url', value: string) => {
    const updated = [...formData.socialLinks];
    updated[index] = { ...updated[index], [field]: value };
    onUpdate({ socialLinks: updated });
  };

  const handleAddSocialLink = () => {
    onUpdate({
      socialLinks: [...formData.socialLinks, { platform: '', url: '' }],
    });
  };

  const handleRemoveSocialLink = (index: number) => {
    const updated = formData.socialLinks.filter((_, i) => i !== index);
    onUpdate({ socialLinks: updated });
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

  const socialLinkRowStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '150px 1fr auto',
    gap: '0.75rem',
    alignItems: 'end',
    marginBottom: '0.75rem',
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
        <h1 style={titleStyle}>STEP 1 : À PROPOS</h1>
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
            <div style={iconStyle}>👤</div>
            <div>
              <div style={{ fontWeight: typography.fontWeight.semibold, marginBottom: '0.25rem' }}>
                Une personne
              </div>
              <div style={{ fontSize: typography.fontSize.sm, color: theme.text.tertiary }}>
                Freelance, salarié, chercheur...
              </div>
            </div>
            <div style={{ fontSize: '1.5rem' }}>
              {formData.profileType === 'person' ? '●' : '○'}
            </div>
          </div>

          <div
            style={profileTypeCardStyle(formData.profileType === 'place')}
            onClick={() => handleProfileTypeChange('place')}
          >
            <div style={iconStyle}>📍</div>
            <div>
              <div style={{ fontWeight: typography.fontWeight.semibold, marginBottom: '0.25rem' }}>
                Un lieu / Une entreprise
              </div>
              <div style={{ fontSize: typography.fontSize.sm, color: theme.text.tertiary }}>
                Restaurant, boutique, cabinet...
              </div>
            </div>
            <div style={{ fontSize: '1.5rem' }}>
              {formData.profileType === 'place' ? '●' : '○'}
            </div>
          </div>
        </div>
      </div>

      {/* Import de données */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Importez vos informations :</h2>
        <SourceImporter
          profileType={formData.profileType}
          onImport={handleImportSuccess}
        />
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
          <label style={labelStyle}>Titre / Métier</label>
          <input
            type="text"
            value={formData.title || ''}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Développeur Full-Stack"
            style={inputStyle}
          />
        </div>

        <div style={formGroupStyle}>
          <label style={labelStyle}>Tagline *</label>
          <input
            type="text"
            value={formData.tagline}
            onChange={(e) => onUpdate({ tagline: e.target.value })}
            placeholder="Passionné par les solutions innovantes"
            style={inputStyle}
          />
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
        {formData.socialLinks.map((link, index) => (
          <div key={index} style={socialLinkRowStyle}>
            <input
              type="text"
              value={link.platform}
              onChange={(e) => handleSocialLinkChange(index, 'platform', e.target.value)}
              placeholder="LinkedIn"
              style={inputStyle}
            />
            <input
              type="url"
              value={link.url}
              onChange={(e) => handleSocialLinkChange(index, 'url', e.target.value)}
              placeholder="https://linkedin.com/in/..."
              style={inputStyle}
            />
            <button
              onClick={() => handleRemoveSocialLink(index)}
              style={{ ...buttonStyle('danger'), padding: '0.75rem' }}
            >
              🗑️
            </button>
          </div>
        ))}
        <button onClick={handleAddSocialLink} style={buttonStyle('secondary')}>
          + Ajouter un réseau social
        </button>
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
