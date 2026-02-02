/**
 * Liste des plateformes sociales avec statut
 */

import React from 'react';
import { useTheme } from '../../ThemeContext';
import { typography, borderRadius } from '../../design-system';
import type { SocialPlatformStatus } from '../../types/reputation';
import { GlobeIcon, BriefcaseIcon, GithubIcon, TwitterIcon, InstagramIcon, UsersIcon } from '../icons/MoreFeatherIcons';

interface SocialPlatformsProps {
  platforms: SocialPlatformStatus[];
}

export const SocialPlatforms: React.FC<SocialPlatformsProps> = ({ platforms }) => {
  const { theme } = useTheme();

  const getPlatformIcon = (platform: SocialPlatformStatus['platform']) => {
    const iconProps = { size: 24, color: theme.text.primary };
    switch (platform) {
      case 'linkedin': return <BriefcaseIcon {...iconProps} />;
      case 'github': return <GithubIcon {...iconProps} />;
      case 'twitter': return <TwitterIcon {...iconProps} />;
      case 'instagram': return <InstagramIcon {...iconProps} />;
      case 'facebook': return <UsersIcon {...iconProps} />;
    }
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      <h2 style={{
        fontSize: typography.fontSize.xl,
        fontWeight: typography.fontWeight.semibold,
        color: theme.text.primary,
        marginBottom: '1rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}>
        <GlobeIcon size={20} color={theme.accent.primary} strokeWidth={2} />
        Réseaux sociaux
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
              <div>
                {getPlatformIcon(platform.platform)}
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
                backgroundColor: platform.connected ? theme.semantic.success : theme.semantic.error,
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
                    color: theme.semantic.warning,
                  }}>
                    {platform.issues.join(', ')}
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
                  backgroundColor: theme.accent.primary,
                  color: theme.text.inverse,
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
