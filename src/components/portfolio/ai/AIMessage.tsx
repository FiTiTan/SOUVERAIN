import React from 'react';
import { useTheme } from '../../../ThemeContext';
import type { ChatMessage } from '../../hooks/useAIChat';

interface AIMessageProps {
  message: ChatMessage;
}

export const AIMessage: React.FC<AIMessageProps> = ({ message }) => {
  const { theme } = useTheme();

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'flex-start',
      marginBottom: '1rem',
      animation: 'fadeIn 0.3s ease'
    }}>
      <div style={{
        maxWidth: '70%',
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'flex-start'
      }}>
        {/* Avatar IA */}
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${theme.accent.primary}, ${theme.accent.secondary})`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          fontSize: '1rem'
        }}>
          ✨
        </div>

        {/* Message */}
        <div>
          <div style={{
            backgroundColor: theme.bg.secondary,
            border: `1px solid ${theme.border.light}`,
            borderRadius: '12px',
            padding: '0.875rem 1rem',
            color: theme.text.primary,
            fontSize: '0.95rem',
            lineHeight: '1.5',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            {message.content}
          </div>
          
          {/* Timestamp */}
          <div style={{
            fontSize: '0.75rem',
            color: theme.text.tertiary,
            marginTop: '0.25rem',
            marginLeft: '0.5rem'
          }}>
            {message.timestamp.toLocaleTimeString('fr-FR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
