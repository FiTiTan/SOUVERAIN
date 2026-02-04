/**
 * SOUVERAIN - Wizard Step 1: Informations de base
 * 
 * Ordre des champs :
 * 1. Type (person/place) avec icônes SVG + checkmark
 * 2. Nom
 * 3. Métier / Type de lieu
 * 4. Email (requis)
 * 5. Téléphone (optionnel)
 * 6. Adresse + Horaires (si lieu uniquement)
 * 7. Réseaux sociaux
 * 
 * Note: Expertises, slogan et détection de contexte déplacés en Step 2
 */

import React from 'react';
import { useTheme } from '../../../ThemeContext';
import { typography, borderRadius, transitions } from '../../../design-system';
import type { WizardStepProps, ProfileType } from '../types';
import { SocialLinksGrid } from './SocialLinksGrid';

export const WizardStepAbout: React.FC<WizardStepProps> = ({
  formData,
  onUpdate,
  onNext,
  onBack,
}) => {
  const { theme } = useTheme();

  const handleProfileTypeChange = (type: ProfileType) => {
    onUpdate({ profileType: type });
  };

  const canProceed = 
    formData.name.trim().length > 0 && 
    formData.title.trim().length > 0 &&
    (formData.email || '').trim().length > 0;

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
    fontSize: typography.fontSize.sm,
    color: theme.text.secondary,
  };

  const formGroupStyle: React.CSSProperties = {
    marginBottom: '1.5rem',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: theme.text.primary,
    marginBottom: '0.5rem',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    fontSize: typography.fontSize.base,
    color: theme.text.primary,
    background: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: borderRadius.md,
    outline: 'none',
    transition: transitions.default,
  };

  const typeCardStyle = (selected: boolean): React.CSSProperties => ({
    padding: '1.5rem',
    background: selected ? theme.primary + '10' : theme.surface,
    border: `2px solid ${selected ? theme.primary : theme.border}`,
    borderRadius: borderRadius.lg,
    cursor: 'pointer',
    transition: transitions.default,
    textAlign: 'center',
    position: 'relative',
  });

  const buttonContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '1rem',
    marginTop: '2rem',
  };

  const buttonStyle = (variant: 'primary' | 'secondary'): React.CSSProperties => ({
    flex: 1,
    padding: '0.75rem 1.5rem',
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: variant === 'primary' ? '#fff' : theme.text.primary,
    background: variant === 'primary' ? theme.primary : theme.surface,
    border: `1px solid ${variant === 'primary' ? theme.primary : theme.border}`,
    borderRadius: borderRadius.md,
    cursor: 'pointer',
    transition: transitions.default,
  });

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h2 style={titleStyle}>Informations de base</h2>
        <p style={subtitleStyle}>Commencez par nous dire qui vous êtes</p>
      </div>

      {/* Type de profil */}
      <div style={formGroupStyle}>
        <label style={labelStyle}>Vous êtes... *</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div
            onClick={() => handleProfileTypeChange('person')}
            style={typeCardStyle(formData.profileType === 'person')}
          >
            {/* Checkmark si sélectionné */}
            {formData.profileType === 'person' && (
              <div style={{
                position: 'absolute',
                top: '0.5rem',
                right: '0.5rem',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: theme.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            )}
            {/* Icon User SVG */}
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ margin: '0 auto 0.5rem' }}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <div style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, color: theme.text.primary }}>
              Une personne
            </div>
            <div style={{ fontSize: typography.fontSize.xs, color: theme.text.secondary, marginTop: '0.25rem' }}>
              Freelance, salarié, artisan...
            </div>
          </div>
          <div
            onClick={() => handleProfileTypeChange('place')}
            style={typeCardStyle(formData.profileType === 'place')}
          >
            {/* Checkmark si sélectionné */}
            {formData.profileType === 'place' && (
              <div style={{
                position: 'absolute',
                top: '0.5rem',
                right: '0.5rem',
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: theme.primary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
            )}
            {/* Icon MapPin SVG */}
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ margin: '0 auto 0.5rem' }}>
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <div style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, color: theme.text.primary }}>
              Un lieu / Une entreprise
            </div>
            <div style={{ fontSize: typography.fontSize.xs, color: theme.text.secondary, marginTop: '0.25rem' }}>
              Restaurant, boutique, cabinet...
            </div>
          </div>
        </div>
      </div>

      {/* Nom */}
      <div style={formGroupStyle}>
        <label style={labelStyle}>
          Nom complet ou nom du lieu *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => onUpdate({ name: e.target.value })}
          placeholder=""
          style={inputStyle}
        />
      </div>

      {/* Type de lieu / Métier */}
      <div style={formGroupStyle}>
        <label style={labelStyle}>
          {formData.profileType === 'place' ? 'Type de lieu' : 'Métier'} *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder=""
          style={inputStyle}
        />
      </div>

      {/* Email */}
      <div style={formGroupStyle}>
        <label style={labelStyle}>Email *</label>
        <input
          type="email"
          value={formData.email || ''}
          onChange={(e) => onUpdate({ email: e.target.value })}
          placeholder=""
          style={inputStyle}
        />
      </div>

      {/* Téléphone */}
      <div style={formGroupStyle}>
        <label style={labelStyle}>Téléphone (optionnel)</label>
        <input
          type="tel"
          value={formData.phone || ''}
          onChange={(e) => onUpdate({ phone: e.target.value })}
          placeholder=""
          style={inputStyle}
        />
      </div>

      {/* Champs spécifiques aux lieux */}
      {formData.profileType === 'place' && (
        <>
          <div style={formGroupStyle}>
            <label style={labelStyle}>Adresse</label>
            <input
              type="text"
              value={formData.address || ''}
              onChange={(e) => onUpdate({ address: e.target.value })}
              placeholder=""
              style={inputStyle}
            />
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Horaires d'ouverture (optionnel)</label>
            <input
              type="text"
              value={formData.openingHours || ''}
              onChange={(e) => onUpdate({ openingHours: e.target.value })}
              placeholder=""
              style={inputStyle}
            />
          </div>
        </>
      )}

      {/* Réseaux sociaux */}
      <div style={formGroupStyle}>
        <label style={labelStyle}>Réseaux sociaux à afficher sur le portfolio</label>
        <SocialLinksGrid
          selectedLinks={formData.socialLinks || []}
          onUpdate={(links) => onUpdate({ socialLinks: links })}
        />
      </div>

      {/* Boutons navigation */}
      <div style={buttonContainerStyle}>
        <button onClick={onBack} style={buttonStyle('secondary')}>
          Retour
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
          Suivant
        </button>
      </div>
    </div>
  );
};
