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
  const { theme, mode } = useTheme();

  const sizeMap = {
    small: { dot: 8, spacing: 12 },
    medium: { dot: 12, spacing: 18 },
    large: { dot: 16, spacing: 24 }
  };

  const { dot, spacing } = sizeMap[size];

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '2rem'
    }}>
      {/* Spinning dots */}
      <div style={{
        position: 'relative',
        width: `${spacing * 6}px`,
        height: `${spacing * 6}px`,
        animation: 'spin 2s linear infinite'
      }}>
        {[...Array(8)].map((_, i) => {
          const angle = (i * 45) * (Math.PI / 180);
          const x = Math.cos(angle) * spacing * 2;
          const y = Math.sin(angle) * spacing * 2;
          
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: `${dot}px`,
                height: `${dot}px`,
                borderRadius: '50%',
                backgroundColor: theme.accent.primary,
                transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
                animation: `pulse-dot ${1.2}s ease-in-out ${i * 0.15}s infinite`
              }}
            />
          );
        })}
      </div>

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
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes pulse-dot {
          0%, 100% {
            opacity: 0.2;
          }
          50% {
            opacity: 1;
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
