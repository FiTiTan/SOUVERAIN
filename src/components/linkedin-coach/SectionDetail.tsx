import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../ThemeContext';
import { type SectionScore } from '../../services/linkedinCoachService';

interface SectionDetailProps {
  section: SectionScore;
  suggestions: string[];
  onBack: () => void;
  onCopySuggestion: (suggestion: string) => void;
  onRegenerate?: () => void;
}

export const SectionDetail: React.FC<SectionDetailProps> = ({
  section, suggestions, onBack, onCopySuggestion, onRegenerate
}) => {
  const { theme, mode } = useTheme();

  const getScoreColor = (score: number) => {
    if (score >= 85) return theme.semantic.success;
    if (score >= 70) return '#f59e0b';
    if (score >= 50) return theme.semantic.warning;
    return theme.semantic.error;
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <button onClick={onBack} style={{
        background: 'transparent', border: 'none', color: theme.text.secondary,
        fontSize: '1rem', cursor: 'pointer', marginBottom: '2rem'
      }}>← Retour</button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: theme.text.primary }}>{section.name}</h1>
          <div style={{ fontSize: '2rem', fontWeight: 700, color: getScoreColor(section.score) }}>
            {section.score}/100
          </div>
        </div>

        {section.issues.length > 0 && (
          <div style={{
            background: `${theme.semantic.error}10`, borderRadius: '12px',
            border: `1px solid ${theme.semantic.error}40`, padding: '1.5rem', marginBottom: '2rem'
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: theme.text.primary, marginBottom: '1rem' }}>
              ❌ Problèmes identifiés
            </h3>
            <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
              {section.issues.map((issue, i) => (
                <li key={i} style={{ fontSize: '0.875rem', color: theme.text.secondary, marginBottom: '0.5rem' }}>{issue}</li>
              ))}
            </ul>
          </div>
        )}

        {section.tips.length > 0 && (
          <div style={{
            background: `${theme.semantic.success}10`, borderRadius: '12px',
            border: `1px solid ${theme.semantic.success}40`, padding: '1.5rem', marginBottom: '2rem'
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: theme.text.primary, marginBottom: '1rem' }}>
              ✅ Bonnes pratiques
            </h3>
            <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
              {section.tips.map((tip, i) => (
                <li key={i} style={{ fontSize: '0.875rem', color: theme.text.secondary, marginBottom: '0.5rem' }}>{tip}</li>
              ))}
            </ul>
          </div>
        )}

        {suggestions.length > 0 && (
          <div style={{
            background: mode === 'dark' ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(20px)', borderRadius: '16px', border: `1px solid ${theme.border.light}`, padding: '2rem'
          }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: theme.text.primary, marginBottom: '1.5rem' }}>
              💡 Suggestions générées par l'IA
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {suggestions.map((suggestion, i) => (
                <div key={i} style={{
                  padding: '1.25rem', background: mode === 'dark' ? 'rgba(30, 41, 59, 0.4)' : 'rgba(255, 255, 255, 0.8)',
                  borderRadius: '12px', border: `1px solid ${theme.border.default}`,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem'
                }}>
                  <p style={{ flex: 1, fontSize: '0.875rem', color: theme.text.secondary }}>{suggestion}</p>
                  <button onClick={() => onCopySuggestion(suggestion)} style={{
                    padding: '0.5rem 1rem', background: theme.accent.primary, color: '#ffffff',
                    border: 'none', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer'
                  }}>Copier</button>
                </div>
              ))}
            </div>
            {onRegenerate && (
              <button onClick={onRegenerate} style={{
                marginTop: '1rem', padding: '0.75rem 1.5rem', background: theme.bg.secondary, color: theme.text.primary,
                border: `1px solid ${theme.border.default}`, borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer'
              }}>Régénérer des suggestions</button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
