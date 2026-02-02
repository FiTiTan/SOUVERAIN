/**
 * Détail des composantes du score
 */

import React from 'react';
import { useTheme } from '../../ThemeContext';
import { typography, borderRadius } from '../../design-system';
import type { ReputationScore } from '../../types/reputation';
import { ShareIcon, MessageCircleIcon } from '../icons/FeatherIcons';
import { ClipboardIcon, RefreshCwIcon } from '../icons/MoreFeatherIcons';

interface ScoreBreakdownProps {
  breakdown: ReputationScore['breakdown'];
}

export const ScoreBreakdown: React.FC<ScoreBreakdownProps> = ({ breakdown }) => {
  const { theme } = useTheme();

  const getScoreColor = (value: number) => {
    if (value >= 80) return theme.semantic.success;
    if (value >= 60) return theme.semantic.warning;
    return theme.semantic.error;
  };

  const items = [
    { key: 'profileCompleteness', label: 'Complétude du profil', icon: ClipboardIcon, value: breakdown.profileCompleteness },
    { key: 'socialPresence', label: 'Présence sociale', icon: ShareIcon, value: breakdown.socialPresence },
    { key: 'contentFreshness', label: 'Fraîcheur du contenu', icon: RefreshCwIcon, value: breakdown.contentFreshness },
    { key: 'engagement', label: 'Engagement', icon: MessageCircleIcon, value: breakdown.engagement },
  ];

  return (
    <div style={{
      padding: '1.5rem',
      backgroundColor: theme.bg.secondary,
      border: `1px solid ${theme.border.default}`,
      borderRadius: borderRadius.lg,
    }}>
      <h3 style={{
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        color: theme.text.primary,
        marginBottom: '1.5rem',
      }}>
        Détail du score
      </h3>

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}>
        {items.map(item => {
          const IconComponent = item.icon;
          const scoreColor = getScoreColor(item.value);
          
          return (
            <div key={item.key}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '0.5rem',
              }}>
                <IconComponent size={18} color={theme.text.secondary} />
                <span style={{
                  flex: 1,
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  color: theme.text.primary,
                }}>
                  {item.label}
                </span>
                <span style={{
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.semibold,
                  color: scoreColor,
                }}>
                  {item.value}
                </span>
              </div>

              {/* Progress bar */}
              <div style={{
                height: '6px',
                backgroundColor: theme.bg.tertiary,
                borderRadius: '3px',
                overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: `${item.value}%`,
                  backgroundColor: scoreColor,
                  transition: 'width 0.5s ease-in-out',
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
