import React from 'react';
import { useTheme } from '../../../ThemeContext';
import type { ChatMessage } from '../../hooks/useAIChat';

interface UserMessageProps {
  message: ChatMessage;
}

export const UserMessage: React.FC<UserMessageProps> = ({ message }) => {
  const { theme } = useTheme();

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'flex-end',
      marginBottom: '1rem',
      animation: 'fadeIn 0.3s ease'
    }}>
      <div style={{
        maxWidth: '70%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end'
      }}>
        {/* Message */}
        <div style={{
          backgroundColor: theme.accent.primary,
          borderRadius: '12px',
          padding: '0.875rem 1rem',
          color: '#fff',
          fontSize: '0.95rem',
          lineHeight: '1.5',
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
        }}>
          {message.content}
        </div>
        
        {/* Timestamp */}
        <div style={{
          fontSize: '0.75rem',
          color: theme.text.tertiary,
          marginTop: '0.25rem',
          marginRight: '0.5rem'
        }}>
          {message.timestamp.toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </div>
      </div>
    </div>
  );
};
