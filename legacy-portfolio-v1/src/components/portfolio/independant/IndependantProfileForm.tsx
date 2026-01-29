/**
 * SOUVERAIN - IndependantProfileForm
 * Formulaire de profil pour les professionnels indépendants
 */

import React, { useState } from 'react';
import { useTheme } from '../../../ThemeContext';
import { typography, borderRadius, transitions, spacing } from '../../../design-system';
import type { IndependantProfile } from '../../../types/portfolio';

// ============================================================
// TYPES
// ============================================================

interface IndependantProfileFormProps {
  initialData?: Partial<IndependantProfile>;
  sectorId: string;
  onSave: (data: Partial<IndependantProfile>) => void;
  onCancel?: () => void;
}

// ============================================================
// COMPONENT
// ============================================================

export const IndependantProfileForm: React.FC<IndependantProfileFormProps> = ({
  initialData = {},
  sectorId,
  onSave,
  onCancel,
}) => {
  const { theme } = useTheme();

  const [formData, setFormData] = useState({
    displayName: initialData.displayName || '',
    bio: initialData.bio || '',
    yearsExperience: initialData.yearsExperience || undefined,
    locationCity: initialData.locationCity || '',
    locationRegion: initialData.locationRegion || '',
    phone: initialData.phone || '',
    email: initialData.email || '',
    website: initialData.website || '',
    socialMedia: initialData.socialMedia || {
      linkedin: '',
      instagram: '',
      twitter: '',
      facebook: '',
      youtube: '',
      tiktok: '',
    },
    certifications: initialData.certifications || [],
    specialties: initialData.specialties || [],
  });

  const [newCertification, setNewCertification] = useState('');
  const [newSpecialty, setNewSpecialty] = useState('');

  // Styles
  const styles = {
    form: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: spacing[6],
    },
    section: {
      backgroundColor: theme.bg.secondary,
      borderRadius: borderRadius.lg,
      padding: spacing[5],
    },
    sectionTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text.primary,
      marginBottom: spacing[4],
      display: 'flex',
      alignItems: 'center',
      gap: spacing[2],
    },
    sectionIcon: {
      fontSize: typography.fontSize.xl,
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: spacing[4],
    },
    gridFull: {
      gridColumn: '1 / -1',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: spacing[2],
    },
    label: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: theme.text.primary,
    },
    labelOptional: {
      fontSize: typography.fontSize.xs,
      color: theme.text.tertiary,
      fontWeight: typography.fontWeight.normal,
      marginLeft: spacing[1],
    },
    input: {
      padding: spacing[3],
      fontSize: typography.fontSize.base,
      color: theme.text.primary,
      backgroundColor: theme.bg.primary,
      border: `1px solid ${theme.border.default}`,
      borderRadius: borderRadius.md,
      outline: 'none',
      transition: transitions.fast,
    },
    textarea: {
      padding: spacing[3],
      fontSize: typography.fontSize.base,
      color: theme.text.primary,
      backgroundColor: theme.bg.primary,
      border: `1px solid ${theme.border.default}`,
      borderRadius: borderRadius.md,
      outline: 'none',
      resize: 'vertical' as const,
      minHeight: '120px',
      fontFamily: 'inherit',
    },
    hint: {
      fontSize: typography.fontSize.xs,
      color: theme.text.tertiary,
    },
    tagsList: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: spacing[2],
      marginTop: spacing[2],
    },
    tag: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: spacing[1],
      padding: `${spacing[1]} ${spacing[3]}`,
      fontSize: typography.fontSize.sm,
      color: theme.accent.primary,
      backgroundColor: theme.accent.muted,
      borderRadius: borderRadius.full,
    },
    tagRemove: {
      background: 'none',
      border: 'none',
      color: theme.accent.primary,
      cursor: 'pointer',
      padding: 0,
      fontSize: typography.fontSize.base,
      lineHeight: 1,
    },
    addTagContainer: {
      display: 'flex',
      gap: spacing[2],
      marginTop: spacing[2],
    },
    addTagInput: {
      flex: 1,
      padding: spacing[2],
      fontSize: typography.fontSize.sm,
      color: theme.text.primary,
      backgroundColor: theme.bg.primary,
      border: `1px solid ${theme.border.default}`,
      borderRadius: borderRadius.md,
      outline: 'none',
    },
    addTagButton: {
      padding: `${spacing[2]} ${spacing[3]}`,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: theme.accent.primary,
      backgroundColor: 'transparent',
      border: `1px solid ${theme.accent.primary}`,
      borderRadius: borderRadius.md,
      cursor: 'pointer',
      transition: transitions.fast,
    },
    footer: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: spacing[3],
      paddingTop: spacing[4],
      borderTop: `1px solid ${theme.border.light}`,
    },
    button: {
      padding: `${spacing[3]} ${spacing[5]}`,
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium,
      borderRadius: borderRadius.lg,
      cursor: 'pointer',
      transition: transitions.fast,
      border: 'none',
    },
    buttonPrimary: {
      backgroundColor: theme.accent.primary,
      color: '#FFFFFF',
    },
    buttonSecondary: {
      backgroundColor: 'transparent',
      color: theme.text.secondary,
      border: `1px solid ${theme.border.default}`,
    },
  };

  // Handlers
  const handleChange = (field: string, value: string | number | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSocialChange = (platform: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      socialMedia: { ...prev.socialMedia, [platform]: value },
    }));
  };

  const handleAddCertification = () => {
    if (newCertification.trim()) {
      setFormData((prev) => ({
        ...prev,
        certifications: [...prev.certifications, newCertification.trim()],
      }));
      setNewCertification('');
    }
  };

  const handleRemoveCertification = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index),
    }));
  };

  const handleAddSpecialty = () => {
    if (newSpecialty.trim()) {
      setFormData((prev) => ({
        ...prev,
        specialties: [...prev.specialties, newSpecialty.trim()],
      }));
      setNewSpecialty('');
    }
  };

  const handleRemoveSpecialty = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      specialties: prev.specialties.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      {/* Section Identité */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>
          <span style={styles.sectionIcon}>👤</span>
          Identité professionnelle
        </h3>
        <div style={styles.grid}>
          <div style={{ ...styles.formGroup, ...styles.gridFull }}>
            <label style={styles.label}>
              Nom affiché *
            </label>
            <input
              type="text"
              value={formData.displayName}
              onChange={(e) => handleChange('displayName', e.target.value)}
              placeholder="Jean Dupont ou Cabinet Dupont"
              style={styles.input}
              required
            />
          </div>

          <div style={{ ...styles.formGroup, ...styles.gridFull }}>
            <label style={styles.label}>
              Biographie
              <span style={styles.labelOptional}>(optionnel)</span>
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => handleChange('bio', e.target.value)}
              placeholder="Présentez-vous en quelques lignes. Votre parcours, votre expertise, ce qui vous distingue..."
              style={styles.textarea}
            />
            <span style={styles.hint}>
              2-3 paragraphes recommandés pour un profil complet
            </span>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Années d'expérience
              <span style={styles.labelOptional}>(optionnel)</span>
            </label>
            <input
              type="number"
              value={formData.yearsExperience || ''}
              onChange={(e) => handleChange('yearsExperience', e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="Ex: 15"
              min={0}
              max={60}
              style={styles.input}
            />
          </div>
        </div>
      </div>

      {/* Section Localisation */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>
          <span style={styles.sectionIcon}>📍</span>
          Localisation
        </h3>
        <div style={styles.grid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Ville</label>
            <input
              type="text"
              value={formData.locationCity}
              onChange={(e) => handleChange('locationCity', e.target.value)}
              placeholder="Ex: Paris"
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Région / Département</label>
            <input
              type="text"
              value={formData.locationRegion}
              onChange={(e) => handleChange('locationRegion', e.target.value)}
              placeholder="Ex: Île-de-France"
              style={styles.input}
            />
          </div>
        </div>
      </div>

      {/* Section Contact */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>
          <span style={styles.sectionIcon}>📞</span>
          Contact
        </h3>
        <div style={styles.grid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Téléphone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="Ex: 06 12 34 56 78"
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="contact@example.com"
              style={styles.input}
            />
          </div>
          <div style={{ ...styles.formGroup, ...styles.gridFull }}>
            <label style={styles.label}>Site web</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => handleChange('website', e.target.value)}
              placeholder="https://www.example.com"
              style={styles.input}
            />
          </div>
        </div>
      </div>

      {/* Section Réseaux sociaux */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>
          <span style={styles.sectionIcon}>🔗</span>
          Réseaux sociaux
        </h3>
        <div style={styles.grid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>LinkedIn</label>
            <input
              type="url"
              value={formData.socialMedia.linkedin}
              onChange={(e) => handleSocialChange('linkedin', e.target.value)}
              placeholder="https://linkedin.com/in/..."
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Instagram</label>
            <input
              type="url"
              value={formData.socialMedia.instagram}
              onChange={(e) => handleSocialChange('instagram', e.target.value)}
              placeholder="https://instagram.com/..."
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Facebook</label>
            <input
              type="url"
              value={formData.socialMedia.facebook}
              onChange={(e) => handleSocialChange('facebook', e.target.value)}
              placeholder="https://facebook.com/..."
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>YouTube</label>
            <input
              type="url"
              value={formData.socialMedia.youtube}
              onChange={(e) => handleSocialChange('youtube', e.target.value)}
              placeholder="https://youtube.com/..."
              style={styles.input}
            />
          </div>
        </div>
      </div>

      {/* Section Certifications */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>
          <span style={styles.sectionIcon}>🏆</span>
          Certifications & Diplômes
        </h3>
        <div style={styles.tagsList}>
          {formData.certifications.map((cert, index) => (
            <span key={index} style={styles.tag}>
              {cert}
              <button
                type="button"
                style={styles.tagRemove}
                onClick={() => handleRemoveCertification(index)}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div style={styles.addTagContainer}>
          <input
            type="text"
            value={newCertification}
            onChange={(e) => setNewCertification(e.target.value)}
            placeholder="Ex: CAP Menuisier, Qualibat RGE..."
            style={styles.addTagInput}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddCertification();
              }
            }}
          />
          <button
            type="button"
            style={styles.addTagButton}
            onClick={handleAddCertification}
          >
            Ajouter
          </button>
        </div>
      </div>

      {/* Section Spécialités */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>
          <span style={styles.sectionIcon}>⭐</span>
          Spécialités
        </h3>
        <div style={styles.tagsList}>
          {formData.specialties.map((spec, index) => (
            <span key={index} style={styles.tag}>
              {spec}
              <button
                type="button"
                style={styles.tagRemove}
                onClick={() => handleRemoveSpecialty(index)}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div style={styles.addTagContainer}>
          <input
            type="text"
            value={newSpecialty}
            onChange={(e) => setNewSpecialty(e.target.value)}
            placeholder="Ex: Rénovation énergétique, Domotique..."
            style={styles.addTagInput}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddSpecialty();
              }
            }}
          />
          <button
            type="button"
            style={styles.addTagButton}
            onClick={handleAddSpecialty}
          >
            Ajouter
          </button>
        </div>
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        {onCancel && (
          <button
            type="button"
            style={{ ...styles.button, ...styles.buttonSecondary }}
            onClick={onCancel}
          >
            Annuler
          </button>
        )}
        <button
          type="submit"
          style={{ ...styles.button, ...styles.buttonPrimary }}
        >
          Enregistrer
        </button>
      </div>
    </form>
  );
};

export default IndependantProfileForm;
