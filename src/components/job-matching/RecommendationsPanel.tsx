import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../ThemeContext';
import { type MatchingResult } from '../../services/jobMatchingService';

interface RecommendationsPanelProps {
  result: MatchingResult;
  onClose: () => void;
  onNewAnalysis: () => void;
}

export const RecommendationsPanel: React.FC<RecommendationsPanelProps> = ({
  result,
  onClose,
  onNewAnalysis
}) => {
  const { theme, mode } = useTheme();

  return (
    <div style={{
      padding: '2rem',
      maxWidth: '900px',
      margin: '0 auto'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <h1 style={{
            fontSize: '2rem',
            fontWeight: 700,
            color: theme.text.primary
          }}>
            Recommandations
          </h1>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: theme.text.secondary,
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.5rem'
            }}
          >
            ×
          </button>
        </div>

        {/* For This Offer */}
        {result.recommendations.length > 0 && (
          <div style={{
            background: mode === 'dark'
              ? 'rgba(30, 41, 59, 0.6)'
              : 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            border: `1px solid ${theme.border.light}`,
            padding: '2rem',
            marginBottom: '2rem'
          }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: theme.text.primary,
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              🎯 Pour cette offre spécifiquement
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {result.recommendations.map((recommendation, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  style={{
                    display: 'flex',
                    gap: '1rem'
                  }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: theme.accent.primary,
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    flexShrink: 0
                  }}>
                    {index + 1}
                  </div>
                  <p style={{
                    flex: 1,
                    fontSize: '1rem',
                    color: theme.text.secondary,
                    lineHeight: 1.6
                  }}>
                    {recommendation}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* CV Optimizations */}
        {result.optimizations.length > 0 && (
          <div style={{
            background: mode === 'dark'
              ? 'rgba(30, 41, 59, 0.6)'
              : 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            border: `1px solid ${theme.border.light}`,
            padding: '2rem',
            marginBottom: '2rem'
          }}>
            <h2 style={{
              fontSize: '1.25rem',
              fontWeight: 600,
              color: theme.text.primary,
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              📝 Optimisations de votre CV
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {result.optimizations.map((optimization, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (result.recommendations.length + index) * 0.1 }}
                  style={{
                    padding: '1rem',
                    background: mode === 'dark'
                      ? 'rgba(30, 41, 59, 0.4)'
                      : 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    color: theme.text.secondary,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem'
                  }}
                >
                  <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>•</span>
                  <span style={{ flex: 1 }}>{optimization}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '1rem 2rem',
              background: theme.accent.primary,
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Retour aux résultats
          </button>
          <button
            onClick={onNewAnalysis}
            style={{
              padding: '1rem 2rem',
              background: theme.bg.secondary,
              color: theme.text.primary,
              border: `1px solid ${theme.border.default}`,
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = theme.border.strong;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = theme.border.default;
            }}
          >
            Nouvelle analyse
          </button>
        </div>
      </motion.div>
    </div>
  );
};
