import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../ThemeContext';
import { GlassInput } from '../../ui/GlassForms';
import { SOCIAL_PLATFORMS } from './types';
import type { PortfolioFormData, SocialLink, SocialPlatform } from './types';

interface Step3ContactProps {
  data: PortfolioFormData;
  onChange: (updates: Partial<PortfolioFormData>) => void;
}

export const Step3Contact: React.FC<Step3ContactProps> = ({ data, onChange }) => {
  const { theme, mode } = useTheme();

  const handleSocialChange = (platform: SocialPlatform, value: string, checked: boolean) => {
    const existing = data.socialLinks.find(s => s.platform === platform);

    if (!checked && existing) {
      // Remove social link
      onChange({
        socialLinks: data.socialLinks.filter(s => s.platform !== platform),
      });
    } else if (checked) {
      if (existing) {
        // Update existing
        onChange({
          socialLinks: data.socialLinks.map(s =>
            s.platform === platform ? { ...s, url: value } : s
          ),
        });
      } else {
        // Add new
        onChange({
          socialLinks: [...data.socialLinks, { platform, url: value }],
        });
      }
    }
  };

  const getSocialValue = (platform: SocialPlatform): string => {
    return data.socialLinks.find(s => s.platform === platform)?.url || '';
  };

  const isSocialEnabled = (platform: SocialPlatform): boolean => {
    return data.socialLinks.some(s => s.platform === platform);
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
          Comment vous contacter ?
        </h2>
        <p style={{ color: theme.text.secondary, fontSize: '0.95rem' }}>
          Vos coordonnées et présence en ligne
        </p>
      </div>

      {/* Email & Phone */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
            Email <span style={{ color: theme.semantic.error }}>*</span>
          </label>
          <GlassInput
            type="email"
            value={data.email}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder="contact@exemple.com"
            style={{ width: '100%' }}
          />
        </div>
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
            Téléphone
          </label>
          <GlassInput
            type="tel"
            value={data.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="06 12 34 56 78"
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* Location (Optional) */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem',
            paddingBottom: '0.5rem',
            borderBottom: `1px solid ${theme.border.light}`,
          }}
        >
          <span style={{ color: theme.text.secondary, fontSize: '0.9rem', fontWeight: 500 }}>
            Lieu (optionnel)
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
              Adresse
            </label>
            <GlassInput
              value={data.address}
              onChange={(e) => onChange({ address: e.target.value })}
              placeholder="12 rue des Lilas, 75011 Paris"
              style={{ width: '100%' }}
            />
          </div>
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
              Horaires d'ouverture
            </label>
            <GlassInput
              value={data.openingHours}
              onChange={(e) => onChange({ openingHours: e.target.value })}
              placeholder="Lun-Ven : 9h-18h"
              style={{ width: '100%' }}
            />
          </div>
        </div>
      </div>

      {/* Social Networks */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem',
            paddingBottom: '0.5rem',
            borderBottom: `1px solid ${theme.border.light}`,
          }}
        >
          <span style={{ color: theme.text.secondary, fontSize: '0.9rem', fontWeight: 500 }}>
            Réseaux sociaux
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {SOCIAL_PLATFORMS.map((platform) => {
            const enabled = isSocialEnabled(platform.id);
            const value = getSocialValue(platform.id);

            return (
              <div key={platform.id} style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: '0.75rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', paddingTop: '0.875rem', paddingBottom: '0.875rem' }}>
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => handleSocialChange(platform.id, value, e.target.checked)}
                    style={{
                      width: '18px',
                      height: '18px',
                      marginRight: '0.5rem',
                      cursor: 'pointer',
                      accentColor: theme.accent.primary,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ color: theme.text.primary, fontSize: '0.9rem' }}>
                    {platform.label}
                  </span>
                </label>
                <GlassInput
                  value={value}
                  onChange={(e) => handleSocialChange(platform.id, e.target.value, true)}
                  placeholder={platform.placeholder}
                  disabled={!enabled}
                  style={{
                    width: '100%',
                    opacity: enabled ? 1 : 0.5,
                    marginBottom: 0,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Social Showcase Toggle */}
      <motion.div
        style={{
          background: mode === 'dark' ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${theme.border.light}`,
          borderRadius: '12px',
          padding: '1.5rem',
          transform: 'translate3d(0, 0, 0)',
        }}
      >
        <div style={{ marginBottom: '1rem', color: theme.text.primary, fontSize: '0.95rem', fontWeight: 500 }}>
          Mon travail est principalement visible sur mes réseaux
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="radio"
              name="socialIsMain"
              checked={data.socialIsMain === true}
              onChange={() => onChange({ socialIsMain: true })}
              style={{
                width: '18px',
                height: '18px',
                marginRight: '0.75rem',
                cursor: 'pointer',
                accentColor: theme.accent.primary,
              }}
            />
            <span style={{ color: theme.text.primary, fontSize: '0.9rem' }}>
              Oui, mettre mes réseaux en avant
            </span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="radio"
              name="socialIsMain"
              checked={data.socialIsMain === false}
              onChange={() => onChange({ socialIsMain: false })}
              style={{
                width: '18px',
                height: '18px',
                marginRight: '0.75rem',
                cursor: 'pointer',
                accentColor: theme.accent.primary,
              }}
            />
            <span style={{ color: theme.text.primary, fontSize: '0.9rem' }}>
              Non, mon portfolio est ma vitrine principale
            </span>
          </label>
        </div>
      </motion.div>
    </motion.div>
  );
};
