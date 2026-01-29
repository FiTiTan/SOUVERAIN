/**
 * SOUVERAIN - CommerceProfileForm
 * Formulaire de profil pour les commerces et établissements
 */

import React, { useState } from 'react';
import { useTheme } from '../../../ThemeContext';
import { typography, borderRadius, transitions, spacing } from '../../../design-system';
import type { CommerceProfile, CommerceAddress, OpeningHours, PaymentMethod, AmenityFeature } from '../../../types/commerce';
import {
  createDefaultOpeningHours,
  DAY_ORDER,
  DAY_LABELS,
  PAYMENT_LABELS,
  AMENITY_LABELS,
  ACCESSIBILITY_LABELS,
  type DayOfWeek,
  type AccessibilityFeature,
} from '../../../types/commerce';
import { OpeningHoursEditor } from './OpeningHoursEditor';

// ============================================================
// TYPES
// ============================================================

interface CommerceProfileFormProps {
  initialData?: Partial<CommerceProfile>;
  sectorId: string;
  onSave: (data: Partial<CommerceProfile>) => void;
  onCancel?: () => void;
}

// ============================================================
// COMPONENT
// ============================================================

export const CommerceProfileForm: React.FC<CommerceProfileFormProps> = ({
  initialData = {},
  sectorId,
  onSave,
  onCancel,
}) => {
  const { theme } = useTheme();

  const [formData, setFormData] = useState({
    name: initialData.name || '',
    commerceType: initialData.commerceType || sectorId,
    tagline: initialData.tagline || '',
    address: initialData.address || {
      street: '',
      streetComplement: '',
      postalCode: '',
      city: '',
      country: 'France',
    },
    openingHours: initialData.openingHours || createDefaultOpeningHours(),
    phone: initialData.phone || '',
    email: initialData.email || '',
    website: initialData.website || '',
    bookingUrl: initialData.bookingUrl || '',
    acceptsWalkIns: initialData.acceptsWalkIns ?? true,
    about: initialData.about || '',
    paymentMethods: initialData.paymentMethods || ['cash', 'card'] as PaymentMethod[],
    amenities: initialData.amenities || [] as AmenityFeature[],
    priceRange: initialData.priceRange || 2,
    socialMedia: initialData.socialMedia || {
      instagram: '',
      facebook: '',
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
      minHeight: '100px',
      fontFamily: 'inherit',
    },
    hint: {
      fontSize: typography.fontSize.xs,
      color: theme.text.tertiary,
    },
    checkboxGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
      gap: spacing[3],
    },
    checkboxItem: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[2],
      padding: spacing[3],
      backgroundColor: theme.bg.primary,
      borderRadius: borderRadius.md,
      cursor: 'pointer',
      border: `1px solid ${theme.border.light}`,
      transition: transitions.fast,
    },
    checkboxItemChecked: {
      borderColor: theme.accent.primary,
      backgroundColor: theme.accent.muted,
    },
    checkboxIcon: {
      fontSize: typography.fontSize.lg,
    },
    checkboxLabel: {
      fontSize: typography.fontSize.sm,
      color: theme.text.primary,
    },
    priceRangeContainer: {
      display: 'flex',
      gap: spacing[2],
    },
    priceRangeButton: {
      flex: 1,
      padding: spacing[3],
      fontSize: typography.fontSize.base,
      color: theme.text.secondary,
      backgroundColor: theme.bg.primary,
      border: `1px solid ${theme.border.default}`,
      borderRadius: borderRadius.md,
      cursor: 'pointer',
      transition: transitions.fast,
    },
    priceRangeButtonActive: {
      color: theme.accent.primary,
      borderColor: theme.accent.primary,
      backgroundColor: theme.accent.muted,
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
  const handleChange = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (field: keyof CommerceAddress, value: string) => {
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }));
  };

  const handleSocialChange = (platform: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      socialMedia: { ...prev.socialMedia, [platform]: value },
    }));
  };

  const handlePaymentToggle = (method: PaymentMethod) => {
    setFormData((prev) => ({
      ...prev,
      paymentMethods: prev.paymentMethods.includes(method)
        ? prev.paymentMethods.filter((m) => m !== method)
        : [...prev.paymentMethods, method],
    }));
  };

  const handleAmenityToggle = (amenity: AmenityFeature) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
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

  const paymentMethods: PaymentMethod[] = ['cash', 'card', 'contactless', 'check', 'apple_pay', 'google_pay', 'ticket_restaurant'];
  const amenities: AmenityFeature[] = ['wifi', 'terrace', 'air_conditioning', 'toilets', 'baby_changing', 'pets_allowed', 'private_room', 'group_events'];

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      {/* Section Identité */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>
          <span style={styles.sectionIcon}>🏪</span>
          Identité de l'établissement
        </h3>
        <div style={styles.grid}>
          <div style={{ ...styles.formGroup, ...styles.gridFull }}>
            <label style={styles.label}>Nom de l'établissement *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Ex: Salon de coiffure L'Atelier"
              style={styles.input}
              required
            />
          </div>
          <div style={{ ...styles.formGroup, ...styles.gridFull }}>
            <label style={styles.label}>
              Slogan / Tagline
              <span style={styles.labelOptional}>(optionnel)</span>
            </label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => handleChange('tagline', e.target.value)}
              placeholder="Ex: Votre beauté, notre passion"
              style={styles.input}
            />
          </div>
          <div style={{ ...styles.formGroup, ...styles.gridFull }}>
            <label style={styles.label}>Description</label>
            <textarea
              value={formData.about}
              onChange={(e) => handleChange('about', e.target.value)}
              placeholder="Présentez votre établissement, son histoire, son ambiance..."
              style={styles.textarea}
            />
          </div>
        </div>
      </div>

      {/* Section Adresse */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>
          <span style={styles.sectionIcon}>📍</span>
          Adresse
        </h3>
        <div style={styles.grid}>
          <div style={{ ...styles.formGroup, ...styles.gridFull }}>
            <label style={styles.label}>Adresse *</label>
            <input
              type="text"
              value={formData.address.street}
              onChange={(e) => handleAddressChange('street', e.target.value)}
              placeholder="12 rue de la Paix"
              style={styles.input}
              required
            />
          </div>
          <div style={{ ...styles.formGroup, ...styles.gridFull }}>
            <label style={styles.label}>
              Complément d'adresse
              <span style={styles.labelOptional}>(optionnel)</span>
            </label>
            <input
              type="text"
              value={formData.address.streetComplement}
              onChange={(e) => handleAddressChange('streetComplement', e.target.value)}
              placeholder="Bâtiment B, 2ème étage..."
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Code postal *</label>
            <input
              type="text"
              value={formData.address.postalCode}
              onChange={(e) => handleAddressChange('postalCode', e.target.value)}
              placeholder="75001"
              style={styles.input}
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Ville *</label>
            <input
              type="text"
              value={formData.address.city}
              onChange={(e) => handleAddressChange('city', e.target.value)}
              placeholder="Paris"
              style={styles.input}
              required
            />
          </div>
        </div>
      </div>

      {/* Section Horaires */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>
          <span style={styles.sectionIcon}>🕐</span>
          Horaires d'ouverture
        </h3>
        <OpeningHoursEditor
          value={formData.openingHours}
          onChange={(hours) => handleChange('openingHours', hours)}
        />
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
              placeholder="01 23 45 67 89"
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
          <div style={styles.formGroup}>
            <label style={styles.label}>Site web</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => handleChange('website', e.target.value)}
              placeholder="https://www.example.com"
              style={styles.input}
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Lien de réservation</label>
            <input
              type="url"
              value={formData.bookingUrl}
              onChange={(e) => handleChange('bookingUrl', e.target.value)}
              placeholder="https://www.planity.com/..."
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
            <label style={styles.label}>TikTok</label>
            <input
              type="url"
              value={formData.socialMedia.tiktok}
              onChange={(e) => handleSocialChange('tiktok', e.target.value)}
              placeholder="https://tiktok.com/@..."
              style={styles.input}
            />
          </div>
        </div>
      </div>

      {/* Section Moyens de paiement */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>
          <span style={styles.sectionIcon}>💳</span>
          Moyens de paiement acceptés
        </h3>
        <div style={styles.checkboxGrid}>
          {paymentMethods.map((method) => (
            <div
              key={method}
              style={{
                ...styles.checkboxItem,
                ...(formData.paymentMethods.includes(method) ? styles.checkboxItemChecked : {}),
              }}
              onClick={() => handlePaymentToggle(method)}
            >
              <span style={styles.checkboxIcon}>{PAYMENT_LABELS[method].icon}</span>
              <span style={styles.checkboxLabel}>{PAYMENT_LABELS[method].label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Section Gamme de prix */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>
          <span style={styles.sectionIcon}>💰</span>
          Gamme de prix
        </h3>
        <div style={styles.priceRangeContainer}>
          {[1, 2, 3, 4].map((level) => (
            <button
              key={level}
              type="button"
              style={{
                ...styles.priceRangeButton,
                ...(formData.priceRange === level ? styles.priceRangeButtonActive : {}),
              }}
              onClick={() => handleChange('priceRange', level)}
            >
              {'€'.repeat(level)}
            </button>
          ))}
        </div>
        <span style={styles.hint}>
          De € (économique) à €€€€ (premium)
        </span>
      </div>

      {/* Section Commodités */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>
          <span style={styles.sectionIcon}>✨</span>
          Commodités
        </h3>
        <div style={styles.checkboxGrid}>
          {amenities.map((amenity) => (
            <div
              key={amenity}
              style={{
                ...styles.checkboxItem,
                ...(formData.amenities.includes(amenity) ? styles.checkboxItemChecked : {}),
              }}
              onClick={() => handleAmenityToggle(amenity)}
            >
              <span style={styles.checkboxIcon}>{AMENITY_LABELS[amenity].icon}</span>
              <span style={styles.checkboxLabel}>{AMENITY_LABELS[amenity].label}</span>
            </div>
          ))}
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
            placeholder="Ex: Coupe homme, Coloration végétale..."
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

export default CommerceProfileForm;
