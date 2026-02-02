/**
 * Card pour une action recommandée
 */

import React from 'react';
import { useTheme } from '../../ThemeContext';
import { typography, borderRadius, transitions } from '../../design-system';
import type { ReputationAction } from '../../types/reputation';
import { UserIcon, ShareIcon, FileTextIcon, MessageCircleIcon, CheckIcon } from '../icons/FeatherIcons';

interface ActionCardProps {
  action: ReputationAction;
  onComplete?: (actionId: string) => void;
}

export const ActionCard: React.FC<ActionCardProps> = ({ action, onComplete }) => {
  const { theme } = useTheme();

  const handleClick = () => {
    if (action.actionType === 'internal' && action.route) {
      // TODO: Implémenter navigation interne (via Shell state)
      console.log('[ActionCard] Navigate to:', action.route);
    } else if (action.actionType === 'external' && action.link) {
      // @ts-ignore
      window.electron?.shell?.openExternal(action.link);
    }
  };

  const getPriorityColor = () => {
    switch (action.priority) {
      case 'high': return theme.semantic.error;
      case 'medium': return theme.semantic.warning;
      case 'low': return theme.text.tertiary;
    }
  };

  const getCategoryIcon = (category: ReputationAction['category']) => {
    const iconProps = { size: 24, color: theme.text.secondary };
    switch (category) {
      case 'profile': return <UserIcon {...iconProps} />;
      case 'social': return <ShareIcon {...iconProps} />;
      case 'content': return <FileTextIcon {...iconProps} />;
      case 'engagement': return <MessageCircleIcon {...iconProps} />;
    }
  };

  return (
    <div
      onClick={handleClick}
      style={{
        padding: '1.25rem',
        backgroundColor: theme.bg.secondary,
        border: `1px solid ${theme.border.default}`,
        borderRadius: borderRadius.lg,
        cursor: 'pointer',
        transition: transitions.fast,
        opacity: action.completed ? 0.5 : 1,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = theme.accent.primary;
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = theme.border.default;
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
        {/* Icon */}
        <div style={{
          flexShrink: 0,
          paddingTop: '0.125rem',
        }}>
          {getCategoryIcon(action.category)}
        </div>

        {/* Content */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <h3 style={{
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.semibold,
              color: theme.text.primary,
            }}>
              {action.title}
            </h3>
            
            {/* Priority badge */}
            <span style={{
              fontSize: typography.fontSize.xs,
              fontWeight: typography.fontWeight.medium,
              color: getPriorityColor(),
              textTransform: 'uppercase',
            }}>
              {action.priority === 'high' ? 'Urgent' : action.priority === 'medium' ? 'Important' : 'Plus tard'}
            </span>
          </div>

          <p style={{
            fontSize: typography.fontSize.sm,
            color: theme.text.secondary,
            marginBottom: '0.75rem',
          }}>
            {action.description}
          </p>

          {/* Impact */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            padding: '0.25rem 0.5rem',
            backgroundColor: theme.accent.primary + '20',
            borderRadius: borderRadius.sm,
            fontSize: typography.fontSize.xs,
            fontWeight: typography.fontWeight.medium,
            color: theme.accent.primary,
          }}>
            +{action.impact} points
          </div>
        </div>

        {/* Completed check */}
        {action.completed && (
          <div style={{
            flexShrink: 0,
          }}>
            <CheckIcon size={24} color={theme.semantic.success} strokeWidth={2.5} />
          </div>
        )}
      </div>
    </div>
  );
};
