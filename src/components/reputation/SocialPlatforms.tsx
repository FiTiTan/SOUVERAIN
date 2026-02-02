/**
 * Liste des plateformes sociales avec statut
 */

import React from 'react';
import { useTheme } from '../../ThemeContext';
import { typography, borderRadius } from '../../design-system';
import type { SocialPlatformStatus } from '../../types/reputation';

interface SocialPlatformsProps {
  platforms: SocialPlatformStatus[];
}

export const SocialPlatforms: React.FC<SocialPlatformsProps> = ({ platforms }) => {
  const { theme } = useTheme();

  const platformIcons: Record<SocialPlatformStatus['platform'], string> = {
    linkedin: '💼',
    github: '🐙',
    twitter: '🐦',
    instagram: '📷',
    facebook: '👥',
  };

  const platformColors: Record<SocialPlatformStatus['platform'], string> = {
    linkedin: '#0A66C2',
    github: '#181717',
    twitter: '#1DA1F2',
    instagram: '#E4405F',
    facebook: '#1877F2',
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h2 style={{
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.semibold,
        color: theme.text.primary,
        marginBottom: '1rem',
      }}>
        🌐 Réseaux sociaux
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
        gap: '1rem',
      }}>
        {platforms.map(platform => (
          <div
            key={platform.platform}
            style={{
              padding: '1.25rem',
              backgroundColor: theme.bg.secondary,
              border: `1px solid ${theme.border.default}`,
              borderRadius: borderRadius.lg,
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              marginBottom: '0.75rem',
            }}>
              <div style={{
                fontSize: '1.75rem',
              }}>
                {platformIcons[platform.platform]}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.semibold,
                  color: theme.text.primary,
                  textTransform: 'capitalize',
                }}>
                  {platform.platform}
                </h3>
              </div>
              <div style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: platform.connected ? '#10B981' : '#EF4444',
              }} />
            </div>

            {platform.connected ? (
              <>
                <div style={{
                  fontSize: typography.fontSize.sm,
                  color: theme.text.secondary,
                  marginBottom: '0.5rem',
                }}>
                  Score: <span style={{
                    fontWeight: typography.fontWeight.semibold,
                    color: theme.text.primary,
                  }}>
                    {platform.score}/100
                  </span>
                </div>
                
                {platform.issues.length > 0 && (
                  <div style={{
                    fontSize: typography.fontSize.xs,
                    color: '#F59E0B',
                  }}>
                    ⚠️ {platform.issues.join(', ')}
                  </div>
                )}
              </>
            ) : (
              <button
                onClick={() => {
                  // TODO: Ouvrir modal de connexion
                  console.log('Connect', platform.platform);
                }}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  backgroundColor: platformColors[platform.platform],
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: borderRadius.md,
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  cursor: 'pointer',
                }}
              >
                Connecter
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
