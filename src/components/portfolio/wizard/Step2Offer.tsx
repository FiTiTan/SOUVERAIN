import React from 'react';
import { motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import { useTheme } from '../../../ThemeContext';
import { GlassInput, GlassTextArea } from '../../ui/GlassForms';
import { getServiceLabel, getServicePlaceholder } from './types';
import type { PortfolioFormData } from './types';

interface Step2OfferProps {
  data: PortfolioFormData;
  onChange: (updates: Partial<PortfolioFormData>) => void;
}

export const Step2Offer: React.FC<Step2OfferProps> = ({ data, onChange }) => {
  const { theme, mode } = useTheme();

  const serviceLabel = getServiceLabel(data.profileType);

  const handleServiceChange = (index: number, value: string) => {
    const newServices = [...data.services];
    newServices[index] = value;
    onChange({ services: newServices });
  };

  const handleAddService = () => {
    if (data.services.length < 3) {
      onChange({ services: [...data.services, ''] });
    }
  };

  const handleRemoveService = (index: number) => {
    if (data.services.length > 1) {
      const newServices = data.services.filter((_, i) => i !== index);
      onChange({ services: newServices });
    }
  };

  const handleValuePropChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 300) {
      onChange({ valueProp: value });
    }
  };

  const filledServicesCount = data.services.filter(s => s.trim().length > 0).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        maxWidth: '700px',
        margin: '0 auto',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <h2
          style={{
            fontSize: '2rem',
            fontWeight: 300,
            color: theme.text.primary,
            marginBottom: '0.5rem',
          }}
        >
          Que proposez-vous ?
        </h2>
        <p style={{ color: theme.text.secondary, fontSize: '0.95rem' }}>
          Présentez vos services ou compétences principales
        </p>
      </div>

      {/* Services */}
      <div>
        <label
          style={{
            display: 'block',
            marginBottom: '1rem',
            color: theme.text.primary,
            fontSize: '0.95rem',
            fontWeight: 500,
          }}
        >
          {serviceLabel} (3 max) <span style={{ color: theme.semantic.error }}>*</span>
        </label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {data.services.map((service, index) => (
            <div key={index} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: theme.text.secondary, fontSize: '0.9rem', fontWeight: 600, minWidth: '24px' }}>
                  {index + 1}.
                </span>
                <GlassInput
                  value={service}
                  onChange={(e) => handleServiceChange(index, e.target.value)}
                  placeholder={getServicePlaceholder(data.profileType, index)}
                  style={{ flex: 1 }}
                />
              </div>
              {data.services.length > 1 && (
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleRemoveService(index)}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: 'none',
                    background: 'transparent',
                    color: theme.text.secondary,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: 0.6,
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                    e.currentTarget.style.color = theme.semantic.error;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '0.6';
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = theme.text.secondary;
                  }}
                >
                  <X size={16} />
                </motion.button>
              )}
            </div>
          ))}
        </div>

        {data.services.length < 3 && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddService}
            style={{
              marginTop: '0.75rem',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: `1px dashed ${theme.border.default}`,
              background: 'transparent',
              color: theme.accent.primary,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: 500,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = mode === 'dark'
                ? 'rgba(99, 102, 241, 0.1)'
                : 'rgba(99, 102, 241, 0.05)';
              e.currentTarget.style.borderColor = theme.accent.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = theme.border.default;
            }}
          >
            <Plus size={16} />
            Ajouter un service
          </motion.button>
        )}

        {filledServicesCount === 0 && (
          <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: theme.semantic.warning }}>
            Au moins un service est requis
          </div>
        )}
      </div>

      {/* Value Proposition */}
      <div>
        <label
          style={{
            display: 'block',
            marginBottom: '0.5rem',
            color: theme.text.primary,
            fontSize: '0.95rem',
            fontWeight: 500,
          }}
        >
          Ce qui vous différencie
        </label>
        <GlassTextArea
          value={data.valueProp}
          onChange={handleValuePropChange}
          placeholder="J'accompagne mes clients de l'idée au produit fini, avec une approche centrée utilisateur."
          rows={4}
          style={{ width: '100%' }}
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '0.5rem',
          }}
        >
          <div style={{ fontSize: '0.85rem', color: theme.accent.primary, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>💡</span>
            <span>Qu'est-ce qui vous rend unique ?</span>
          </div>
          <div
            style={{
              fontSize: '0.85rem',
              color: data.valueProp.length > 280 ? theme.semantic.warning : theme.text.secondary,
            }}
          >
            {data.valueProp.length} / 300
          </div>
        </div>
      </div>
    </motion.div>
  );
};
