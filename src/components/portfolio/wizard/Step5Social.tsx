import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../ThemeContext';
import { typography, borderRadius, transitions } from '../../../design-system';
import { SOCIAL_PLATFORMS } from './types';
import type { PortfolioFormData, SocialPlatform } from './types';

interface Step5SocialProps {
  data: PortfolioFormData;
  onChange: (updates: Partial<PortfolioFormData>) => void;
}

export const Step5Social: React.FC<Step5SocialProps> = ({ data, onChange }) => {
  const { theme, mode } = useTheme();

  // TODO: Auto-fill from settings on mount
  // useEffect(() => {
  //   const userSettings = getUserSettings(); // From context or API
  //   if (userSettings.socialLinks && data.socialLinks.length === 0) {
  //     onChange({ socialLinks: userSettings.socialLinks });
  //   }
  // }, []);

  const handleToggleLink = (platform: SocialPlatform) => {
    const exists = data.socialLinks.find(link => link.platform === platform);
    if (exists) {
      // Remove
      onChange({
        socialLinks: data.socialLinks.filter(link => link.platform !== platform)
      });
    } else {
      // Add
      onChange({
        socialLinks: [...data.socialLinks, { platform, url: '', label: platform === 'other' ? '' : undefined }]
      });
    }
  };

  const handleUpdateLink = (index: number, url: string, label?: string) => {
    const updated = [...data.socialLinks];
    updated[index] = { ...updated[index], url, label };
    onChange({ socialLinks: updated });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '700px', margin: '0 auto' }}
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
          Réseaux sociaux
        </h2>
        <p style={{ color: theme.text.secondary, fontSize: '0.95rem' }}>
          Ajoutez vos profils sociaux (optionnel)
        </p>
      </div>

      {/* Platform Selector */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.semibold,
            color: theme.text.primary,
            marginBottom: '1rem',
          }}
        >
          Ajouter un réseau social
        </label>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: '0.75rem',
          }}
        >
          {SOCIAL_PLATFORMS.map((platform) => {
            const isActive = data.socialLinks.some(link => link.platform === platform.id);
            return (
              <button
                key={platform.id}
                onClick={() => handleToggleLink(platform.id)}
                style={{
                  padding: '0.75rem',
                  borderRadius: borderRadius.md,
                  border: `1px solid ${isActive ? theme.border.default : theme.border.light}`,
                  background: isActive 
                    ? mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)'
                    : 'transparent',
                  color: isActive ? theme.text.primary : theme.text.secondary,
                  fontSize: typography.fontSize.xs,
                  fontWeight: isActive ? typography.fontWeight.semibold : typography.fontWeight.medium,
                  cursor: 'pointer',
                  transition: transitions.fast,
                }}
              >
                {platform.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Links */}
      {data.socialLinks.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h4
            style={{
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.bold,
              color: theme.text.secondary,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Vos réseaux ({data.socialLinks.length})
          </h4>
          {data.socialLinks.map((link, index) => {
            const platformInfo = SOCIAL_PLATFORMS.find(p => p.id === link.platform);
            return (
              <div
                key={index}
                style={{
                  background: theme.bg.secondary,
                  border: `1px solid ${theme.border.light}`,
                  borderRadius: borderRadius.lg,
                  padding: '1rem',
                }}
              >
                <div style={{ marginBottom: '0.75rem' }}>
                  <div style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: theme.text.primary }}>
                    {platformInfo?.label || link.platform}
                  </div>
                </div>
                {link.platform === 'other' && (
                  <input
                    type="text"
                    value={link.label || ''}
                    onChange={(e) => handleUpdateLink(index, link.url, e.target.value)}
                    placeholder="Nom du réseau"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      marginBottom: '0.5rem',
                      fontSize: typography.fontSize.sm,
                      color: theme.text.primary,
                      backgroundColor: theme.bg.primary,
                      border: `1px solid ${theme.border.default}`,
                      borderRadius: borderRadius.md,
                      outline: 'none',
                    }}
                  />
                )}
                <input
                  type="text"
                  value={link.url}
                  onChange={(e) => handleUpdateLink(index, e.target.value, link.label)}
                  placeholder={platformInfo?.placeholder || 'URL'}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    fontSize: typography.fontSize.sm,
                    color: theme.text.primary,
                    backgroundColor: theme.bg.primary,
                    border: `1px solid ${theme.border.default}`,
                    borderRadius: borderRadius.md,
                    outline: 'none',
                  }}
                />
              </div>
            );
          })}
        </div>
      )}

      {/* Social as Main Contact */}
      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '1rem',
          background: theme.bg.secondary,
          borderRadius: borderRadius.lg,
          cursor: 'pointer',
        }}
      >
        <input
          type="checkbox"
          checked={data.socialIsMain}
          onChange={(e) => onChange({ socialIsMain: e.target.checked })}
          style={{ width: '18px', height: '18px', cursor: 'pointer' }}
        />
        <div>
          <div style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: theme.text.primary }}>
            Les réseaux sociaux sont mon contact principal
          </div>
          <div style={{ fontSize: typography.fontSize.xs, color: theme.text.tertiary }}>
            Affichera les réseaux sociaux en priorité sur le portfolio
          </div>
        </div>
      </label>
    </motion.div>
  );
};
