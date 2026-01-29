/**
 * SOUVERAIN - AccessEditor
 * Éditeur d'accessibilité et commodités pour les commerces
 */

import React, { useState } from 'react';
import { useTheme } from '../../../ThemeContext';
import { typography, borderRadius, transitions, spacing } from '../../../design-system';
import type {
  AccessInfo,
  AccessibilityFeature,
  AmenityFeature,
} from '../../../types/commerce';
import {
  ACCESSIBILITY_LABELS,
  AMENITY_LABELS,
} from '../../../types/commerce';

// ============================================================
// TYPES
// ============================================================

interface AccessEditorProps {
  value?: AccessInfo;
  amenities?: AmenityFeature[];
  onChange: (accessInfo: AccessInfo, amenities: AmenityFeature[]) => void;
}

// ============================================================
// COMPONENT
// ============================================================

export const AccessEditor: React.FC<AccessEditorProps> = ({
  value = { features: [] },
  amenities = [],
  onChange,
}) => {
  const { theme } = useTheme();

  const [localAccessInfo, setLocalAccessInfo] = useState<AccessInfo>(value);
  const [localAmenities, setLocalAmenities] = useState<AmenityFeature[]>(amenities);

  // Handlers
  const handleToggleAccessFeature = (feature: AccessibilityFeature) => {
    const newFeatures = localAccessInfo.features.includes(feature)
      ? localAccessInfo.features.filter((f) => f !== feature)
      : [...localAccessInfo.features, feature];

    const newAccessInfo = { ...localAccessInfo, features: newFeatures };
    setLocalAccessInfo(newAccessInfo);
    onChange(newAccessInfo, localAmenities);
  };

  const handleToggleAmenity = (amenity: AmenityFeature) => {
    const newAmenities = localAmenities.includes(amenity)
      ? localAmenities.filter((a) => a !== amenity)
      : [...localAmenities, amenity];

    setLocalAmenities(newAmenities);
    onChange(localAccessInfo, newAmenities);
  };

  const handleFieldChange = (field: keyof AccessInfo, value: string) => {
    const newAccessInfo = { ...localAccessInfo, [field]: value };
    setLocalAccessInfo(newAccessInfo);
    onChange(newAccessInfo, localAmenities);
  };

  // Styles
  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: spacing[5],
    },
    section: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: spacing[3],
    },
    sectionTitle: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text.primary,
      marginBottom: spacing[1],
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: spacing[3],
    },
    checkboxCard: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[2],
      padding: spacing[3],
      backgroundColor: theme.bg.primary,
      border: `1px solid ${theme.border.default}`,
      borderRadius: borderRadius.md,
      cursor: 'pointer',
      transition: transitions.fast,
      userSelect: 'none' as const,
    },
    checkboxCardSelected: {
      borderColor: theme.accent.primary,
      backgroundColor: theme.accent.muted,
    },
    checkbox: {
      width: '18px',
      height: '18px',
      borderRadius: borderRadius.sm,
      border: `2px solid ${theme.border.default}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      transition: transitions.fast,
    },
    checkboxChecked: {
      backgroundColor: theme.accent.primary,
      borderColor: theme.accent.primary,
    },
    checkmark: {
      color: '#FFFFFF',
      fontSize: '12px',
      fontWeight: typography.fontWeight.bold,
    },
    icon: {
      fontSize: typography.fontSize.lg,
      flexShrink: 0,
    },
    labelText: {
      fontSize: typography.fontSize.sm,
      color: theme.text.primary,
      fontWeight: typography.fontWeight.medium,
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
      fontSize: typography.fontSize.sm,
      color: theme.text.primary,
      backgroundColor: theme.bg.primary,
      border: `1px solid ${theme.border.default}`,
      borderRadius: borderRadius.md,
      outline: 'none',
      resize: 'vertical' as const,
      minHeight: '80px',
      fontFamily: 'inherit',
    },
  };

  // Render checkbox card
  const renderCheckboxCard = (
    id: string,
    label: string,
    icon: string,
    isSelected: boolean,
    onToggle: () => void
  ) => (
    <div
      key={id}
      style={{
        ...styles.checkboxCard,
        ...(isSelected ? styles.checkboxCardSelected : {}),
      }}
      onClick={onToggle}
      role="checkbox"
      aria-checked={isSelected}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onToggle();
        }
      }}
    >
      <div
        style={{
          ...styles.checkbox,
          ...(isSelected ? styles.checkboxChecked : {}),
        }}
      >
        {isSelected && <span style={styles.checkmark}>✓</span>}
      </div>
      <span style={styles.icon}>{icon}</span>
      <span style={styles.labelText}>{label}</span>
    </div>
  );

  return (
    <div style={styles.container}>
      {/* Accessibilité */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>♿ Accessibilité</h3>
        <div style={styles.grid}>
          {(Object.entries(ACCESSIBILITY_LABELS) as [AccessibilityFeature, typeof ACCESSIBILITY_LABELS[AccessibilityFeature]][]).map(
            ([key, { label, icon }]) =>
              renderCheckboxCard(
                key,
                label,
                icon,
                localAccessInfo.features.includes(key),
                () => handleToggleAccessFeature(key)
              )
          )}
        </div>
      </div>

      {/* Transports en commun */}
      {localAccessInfo.features.includes('public_transport') && (
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Transports en commun
            <span style={styles.labelOptional}>(optionnel)</span>
          </label>
          <input
            type="text"
            style={styles.input}
            placeholder="Ex: Métro Bastille ligne 1, Bus 20, 65, 76"
            value={localAccessInfo.publicTransport || ''}
            onChange={(e) => handleFieldChange('publicTransport', e.target.value)}
          />
        </div>
      )}

      {/* Info parking */}
      {(localAccessInfo.features.includes('parking') ||
        localAccessInfo.features.includes('parking_disabled')) && (
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Informations parking
            <span style={styles.labelOptional}>(optionnel)</span>
          </label>
          <input
            type="text"
            style={styles.input}
            placeholder="Ex: Parking souterrain à 50m, Parking gratuit devant l'établissement"
            value={localAccessInfo.parkingInfo || ''}
            onChange={(e) => handleFieldChange('parkingInfo', e.target.value)}
          />
        </div>
      )}

      {/* Instructions personnalisées */}
      <div style={styles.formGroup}>
        <label style={styles.label}>
          Instructions d'accès
          <span style={styles.labelOptional}>(optionnel)</span>
        </label>
        <textarea
          style={styles.textarea}
          placeholder="Ex: Entrée par la cour intérieure, sonner au digicode 12A..."
          value={localAccessInfo.customInstructions || ''}
          onChange={(e) => handleFieldChange('customInstructions', e.target.value)}
        />
      </div>

      {/* Commodités */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>✨ Commodités</h3>
        <div style={styles.grid}>
          {(Object.entries(AMENITY_LABELS) as [AmenityFeature, typeof AMENITY_LABELS[AmenityFeature]][]).map(
            ([key, { label, icon }]) =>
              renderCheckboxCard(
                key,
                label,
                icon,
                localAmenities.includes(key),
                () => handleToggleAmenity(key)
              )
          )}
        </div>
      </div>
    </div>
  );
};

export default AccessEditor;
