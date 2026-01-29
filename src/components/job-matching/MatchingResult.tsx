import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../ThemeContext';
import { type MatchingResult as MatchingResultType } from '../../services/jobMatchingService';
import { RecommendationsPanel } from './RecommendationsPanel';

interface MatchingResultProps {
  result: MatchingResultType;
  jobTitle: string;
  onNewAnalysis: () => void;
  onBack: () => void;
}

export const MatchingResult: React.FC<MatchingResultProps> = ({
  result,
  jobTitle,
  onNewAnalysis,
  onBack
}) => {
  const { theme, mode } = useTheme();
  const [showRecommendations, setShowRecommendations] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 85) return theme.semantic.success;
    if (score >= 70) return '#f59e0b'; // Orange
    if (score >= 50) return theme.semantic.warning;
    return theme.semantic.error;
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'excellent': return 'Excellente compatibilité !';
      case 'good': return 'Bonne compatibilité';
      case 'average': return 'Compatibilité moyenne';
      case 'poor': return 'Compatibilité faible';
      default: return '';
    }
  };

  if (showRecommendations) {
    return (
      <RecommendationsPanel
        result={result}
        onClose={() => setShowRecommendations(false)}
        onNewAnalysis={onNewAnalysis}
      />
    );
  }

  return (
    <div style={{
      padding: '2rem',
      maxWidth: '1000px',
      margin: '0 auto'
    }}>
      {/* Back Button */}
      <button
        onClick={onBack}
        style={{
          background: 'transparent',
          border: 'none',
          color: theme.text.secondary,
          fontSize: '1rem',
          cursor: 'pointer',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
      >
        ← Retour
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 700,
          color: theme.text.primary,
          marginBottom: '0.5rem'
        }}>
          Résultat du matching
        </h1>
        <p style={{
          fontSize: '1.125rem',
          color: theme.text.secondary,
          marginBottom: '3rem'
        }}>
          {jobTitle}
        </p>

        {/* Score Circle */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '4rem'
        }}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            style={{
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: `conic-gradient(${getScoreColor(result.score)} ${result.score}%, ${theme.bg.tertiary} 0)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              marginRight: '3rem'
            }}
          >
            <div style={{
              width: '160px',
              height: '160px',
              borderRadius: '50%',
              background: mode === 'dark'
                ? 'rgba(30, 41, 59, 0.95)'
                : 'rgba(255, 255, 255, 0.95)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                fontSize: '3rem',
                fontWeight: 700,
                color: getScoreColor(result.score)
              }}>
                {result.score}%
              </div>
            </div>
          </motion.div>

          <div>
            <p style={{
              fontSize: '1.5rem',
              fontWeight: 600,
              color: theme.text.primary,
              marginBottom: '0.5rem'
            }}>
              {getCategoryLabel(result.category)}
            </p>
            <p style={{
              fontSize: '1rem',
              color: theme.text.tertiary
            }}>
              Score calculé sur {result.matchedSkills.length + result.missingSkills.length} critères
            </p>
          </div>
        </div>

        {/* Strengths & Weaknesses */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2rem',
          marginBottom: '2rem'
        }}>
          {/* Strengths */}
          <div style={{
            background: mode === 'dark'
              ? 'rgba(34, 197, 94, 0.1)'
              : 'rgba(34, 197, 94, 0.05)',
            borderRadius: '16px',
            border: `1px solid ${theme.semantic.success}40`,
            padding: '1.5rem'
          }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: 600,
              color: theme.text.primary,
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              ✓ Points forts ({result.strengths.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {result.strengths.map((strength, index) => (
                <div
                  key={index}
                  style={{
                    padding: '0.75rem',
                    background: mode === 'dark'
                      ? 'rgba(30, 41, 59, 0.4)'
                      : 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    color: theme.text.secondary
                  }}
                >
                  {strength}
                </div>
              ))}
            </div>
          </div>

          {/* Weaknesses */}
          <div style={{
            background: mode === 'dark'
              ? 'rgba(245, 158, 11, 0.1)'
              : 'rgba(245, 158, 11, 0.05)',
            borderRadius: '16px',
            border: `1px solid ${theme.semantic.warning}40`,
            padding: '1.5rem'
          }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: 600,
              color: theme.text.primary,
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              ⚠ Points à améliorer ({result.weaknesses.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {result.weaknesses.length > 0 ? (
                result.weaknesses.map((weakness, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '0.75rem',
                      background: mode === 'dark'
                        ? 'rgba(30, 41, 59, 0.4)'
                        : 'rgba(255, 255, 255, 0.8)',
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      color: theme.text.secondary
                    }}
                  >
                    {weakness}
                  </div>
                ))
              ) : (
                <p style={{ color: theme.text.tertiary, fontSize: '0.875rem' }}>
                  Aucun point faible identifié
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center'
        }}>
          <button
            onClick={() => setShowRecommendations(true)}
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
            Voir les recommandations →
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
              e.currentTarget.style.borderColor = theme.border.hover;
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
