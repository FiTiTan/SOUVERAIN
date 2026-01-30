import React from 'react';
import { useTheme } from '../../ThemeContext';

interface ModernLoaderProps {
  message?: string;
  size?: 'small' | 'medium' | 'large';
}

export const ModernLoader: React.FC<ModernLoaderProps> = ({ 
  message = 'Chargement...', 
  size = 'medium' 
}) => {
  const { theme } = useTheme();

  const sizeMap = {
    small: 40,
    medium: 60,
    large: 80
  };

  const loaderSize = sizeMap[size];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '2rem'
    }}>
      {/* Morphing Shape */}
      <div style={{
        width: `${loaderSize}px`,
        height: `${loaderSize}px`,
        background: `linear-gradient(45deg, ${theme.accent.primary}, ${theme.accent.secondary})`,
        animation: 'morph 2s ease-in-out infinite',
        boxShadow: `0 0 30px ${theme.accent.primary}40`
      }} />

      {/* Message */}
      {message && (
        <p style={{
          color: theme.text.secondary,
          fontSize: '1rem',
          fontWeight: 500,
          margin: 0,
          animation: 'pulse-text 1.5s ease-in-out infinite'
        }}>
          {message}
        </p>
      )}

      {/* CSS Animations */}
      <style>{`
        @keyframes morph {
          0%, 100% {
            border-radius: 10%;
            transform: rotate(0deg);
          }
          25% {
            border-radius: 50%;
          }
          50% {
            border-radius: 10%;
            transform: rotate(180deg);
          }
          75% {
            border-radius: 50%;
          }
        }
        
        @keyframes pulse-text {
          0%, 100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};
