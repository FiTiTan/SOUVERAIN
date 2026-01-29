import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../ThemeContext';
import { GlassInput, GlassTextArea } from '../../ui/GlassForms';
import { PROFILE_TYPES } from './types';
import type { PortfolioFormData, ProfileType } from './types';

interface Step1IdentityProps {
  data: PortfolioFormData;
  onChange: (updates: Partial<PortfolioFormData>) => void;
}

export const Step1Identity: React.FC<Step1IdentityProps> = ({ data, onChange }) => {
  const { theme, mode } = useTheme();

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ name: e.target.value });
  };

  const handleProfileTypeSelect = (type: ProfileType) => {
    onChange({ profileType: type });
  };

  const handleTaglineChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 150) {
      onChange({ tagline: value });
    }
  };

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
          Qui êtes-vous ?
        </h2>
        <p style={{ color: theme.text.secondary, fontSize: '0.95rem' }}>
          Commençons par votre identité professionnelle
        </p>
      </div>

      {/* Name Input */}
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
          Votre nom ou nom d'activité <span style={{ color: theme.semantic.error }}>*</span>
        </label>
        <GlassInput
          value={data.name}
          onChange={handleNameChange}
          placeholder="Jean Dupont"
          style={{ width: '100%' }}
        />
      </div>

      {/* Profile Type Selection */}
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
          Vous êtes : <span style={{ color: theme.semantic.error }}>*</span>
        </label>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
          }}
        >
          {PROFILE_TYPES.map((type) => (
            <motion.div
              key={type.id}
              onClick={() => handleProfileTypeSelect(type.id)}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              style={{
                background:
                  data.profileType === type.id
                    ? mode === 'dark'
                      ? 'rgba(99, 102, 241, 0.2)'
                      : 'rgba(99, 102, 241, 0.1)'
                    : mode === 'dark'
                    ? 'rgba(30, 41, 59, 0.6)'
                    : 'rgba(255, 255, 255, 0.7)',
                backdropFilter: 'blur(20px)',
                border: `2px solid ${
                  data.profileType === type.id ? theme.accent.primary : theme.border.light
                }`,
                borderRadius: '16px',
                padding: '1.5rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'center',
                transform: 'translate3d(0, 0, 0)',
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>{type.icon}</div>
              <div
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: theme.text.primary,
                  marginBottom: '0.25rem',
                }}
              >
                {type.label}
              </div>
              <div
                style={{
                  fontSize: '0.8rem',
                  color: theme.text.secondary,
                  lineHeight: '1.4',
                }}
              >
                {type.hint}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tagline */}
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
          Décrivez votre activité en une phrase <span style={{ color: theme.semantic.error }}>*</span>
        </label>
        <GlassTextArea
          value={data.tagline}
          onChange={handleTaglineChange}
          placeholder="J'aide les startups à créer des produits digitaux qui cartonnent"
          rows={3}
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
            <span>Cette phrase sera votre accroche principale</span>
          </div>
          <div
            style={{
              fontSize: '0.85rem',
              color: data.tagline.length > 140 ? theme.semantic.warning : theme.text.secondary,
            }}
          >
            {data.tagline.length} / 150
          </div>
        </div>
      </div>
    </motion.div>
  );
};
