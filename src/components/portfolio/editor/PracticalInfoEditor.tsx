/**
 * SOUVERAIN - Practical Info Editor (MPF-6)
 * Modal pour éditer les informations pratiques du portfolio
 * CALM-UI: CalmModal + GlassForms
 */

import React, { useState, useEffect } from 'react';
import { CalmModal } from '../../ui/CalmModal';
import { GlassInput, GlassTextArea } from '../../ui/GlassForms';
import { useTheme } from '../../../ThemeContext';
import { typography, borderRadius } from '../../../design-system';

// ============================================================
// TYPES
// ============================================================

interface PracticalData {
  location?: string;
  hours?: string;
  availability?: string;
  pricing?: string;
  delivery?: string;
  notes?: string;
}

interface PracticalInfoEditorProps {
  isOpen: boolean;
  onClose: () => void;
  data: PracticalData;
  onSave: (data: PracticalData) => void;
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export const PracticalInfoEditor: React.FC<PracticalInfoEditorProps> = ({
  isOpen,
  onClose,
  data,
  onSave,
}) => {
  const { theme } = useTheme();

  const [formData, setFormData] = useState<PracticalData>(data);
  const [hasChanges, setHasChanges] = useState(false);

  // Reset form when data changes
  useEffect(() => {
    setFormData(data);
    setHasChanges(false);
  }, [data]);

  // Track changes
  useEffect(() => {
    const changed = JSON.stringify(formData) !== JSON.stringify(data);
    setHasChanges(changed);
  }, [formData, data]);

  const handleChange = (field: keyof PracticalData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const handleCancel = () => {
    if (hasChanges) {
      if (!confirm('Abandonner les modifications ?')) return;
    }
    setFormData(data);
    setHasChanges(false);
    onClose();
  };

  const styles = {
    form: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1.5rem',
    },
    infoBox: {
      padding: '1rem',
      background: theme.semantic.infoBg,
      borderRadius: borderRadius.lg,
      border: `1px solid ${theme.semantic.info}`,
      fontSize: typography.fontSize.sm,
      color: theme.semantic.info,
      lineHeight: typography.lineHeight.relaxed,
      marginBottom: '0.5rem',
    },
    fieldsGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1.5rem',
    },
    fullWidth: {
      gridColumn: '1 / -1',
    },
    helpText: {
      fontSize: typography.fontSize.xs,
      color: theme.text.tertiary,
      marginTop: '-0.5rem',
    },
    footer: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '1rem',
      marginTop: '1rem',
    },
    button: (variant: 'secondary' | 'primary') => ({
      padding: '0.75rem 1.5rem',
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      borderRadius: borderRadius.lg,
      border: variant === 'secondary' ? `1px solid ${theme.border.default}` : 'none',
      background: variant === 'secondary' ? 'transparent' : theme.accent.primary,
      color: variant === 'secondary' ? theme.text.primary : '#FFFFFF',
      cursor: 'pointer',
      transition: 'all 150ms ease',
    }),
  };

  return (
    <CalmModal
      isOpen={isOpen}
      onClose={handleCancel}
      title="Informations pratiques"
      width="700px"
    >
      <div style={styles.form}>
        {/* Info Box */}
        <div style={styles.infoBox}>
          💡 Ces informations seront affichées dans la section "Informations pratiques" de votre portfolio.
          Remplissez uniquement les champs pertinents pour votre activité.
        </div>

        {/* Fields Grid */}
        <div style={styles.fieldsGrid}>
          {/* Location */}
          <div>
            <GlassInput
              label="Localisation"
              placeholder="Ex: Paris, France"
              value={formData.location || ''}
              onChange={(e) => handleChange('location', e.target.value)}
            />
            <p style={styles.helpText}>
              Ville, région ou mention "Télétravail", "Remote"
            </p>
          </div>

          {/* Hours */}
          <div>
            <GlassInput
              label="Horaires"
              placeholder="Ex: Lun-Ven 9h-18h"
              value={formData.hours || ''}
              onChange={(e) => handleChange('hours', e.target.value)}
            />
            <p style={styles.helpText}>
              Horaires d'ouverture ou de disponibilité
            </p>
          </div>

          {/* Availability */}
          <div>
            <GlassInput
              label="Disponibilité"
              placeholder="Ex: Disponible dès maintenant"
              value={formData.availability || ''}
              onChange={(e) => handleChange('availability', e.target.value)}
            />
            <p style={styles.helpText}>
              Délai de disponibilité pour nouveaux projets
            </p>
          </div>

          {/* Pricing */}
          <div>
            <GlassInput
              label="Tarifs"
              placeholder="Ex: À partir de 500€/jour"
              value={formData.pricing || ''}
              onChange={(e) => handleChange('pricing', e.target.value)}
            />
            <p style={styles.helpText}>
              Indication tarifaire (TJM, forfaits, etc.)
            </p>
          </div>

          {/* Delivery */}
          <div style={styles.fullWidth}>
            <GlassInput
              label="Modalités de livraison"
              placeholder="Ex: Délai moyen 2-4 semaines"
              value={formData.delivery || ''}
              onChange={(e) => handleChange('delivery', e.target.value)}
            />
            <p style={styles.helpText}>
              Délais, modes de livraison, process
            </p>
          </div>

          {/* Notes */}
          <div style={styles.fullWidth}>
            <GlassTextArea
              label="Notes complémentaires"
              placeholder="Autres informations utiles pour vos visiteurs..."
              value={formData.notes || ''}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={4}
            />
            <p style={styles.helpText}>
              Informations additionnelles (conditions, certifications, etc.)
            </p>
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button
            style={styles.button('secondary')}
            onClick={handleCancel}
            onMouseEnter={(e) => e.currentTarget.style.background = theme.bg.secondary}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            Annuler
          </button>
          <button
            style={styles.button('primary')}
            onClick={handleSave}
            disabled={!hasChanges}
            onMouseEnter={(e) => {
              if (!e.currentTarget.disabled) {
                e.currentTarget.style.opacity = '0.9';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1';
            }}
          >
            {hasChanges ? 'Enregistrer les modifications' : 'Aucune modification'}
          </button>
        </div>
      </div>
    </CalmModal>
  );
};
