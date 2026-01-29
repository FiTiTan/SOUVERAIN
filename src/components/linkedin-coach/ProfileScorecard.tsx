import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../ThemeContext';
import { type ProfileAnalysis } from '../../services/linkedinCoachService';

interface ProfileScorecardProps {
  analysis: ProfileAnalysis;
  onSectionClick: (sectionName: string) => void;
  onBack: () => void;
}

export const ProfileScorecard: React.FC<ProfileScorecardProps> = ({ analysis, onSectionClick, onBack }) => {
  const { theme, mode } = useTheme();

  const getScoreColor = (score: number) => {
    if (score >= 85) return theme.semantic.success;
    if (score >= 70) return '#f59e0b';
    if (score >= 50) return theme.semantic.warning;
    return theme.semantic.error;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 85) return 'Très bon profil !';
    if (score >= 70) return 'Bon profil';
    if (score >= 50) return 'Profil correct';
    return 'Profil à améliorer';
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <button onClick={onBack} style={{
        background: 'transparent', border: 'none', color: theme.text.secondary,
        fontSize: '1rem', cursor: 'pointer', marginBottom: '2rem'
      }}>← Retour</button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: theme.text.primary, marginBottom: '3rem' }}>
          Votre Score LinkedIn
        </h1>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4rem' }}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{
            width: '200px', height: '200px', borderRadius: '50%',
            background: `conic-gradient(${getScoreColor(analysis.globalScore)} ${analysis.globalScore}%, ${theme.bg.tertiary} 0)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '3rem'
          }}>
            <div style={{
              width: '160px', height: '160px', borderRadius: '50%',
              background: mode === 'dark' ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
            }}>
              <div style={{ fontSize: '3rem', fontWeight: 700, color: getScoreColor(analysis.globalScore) }}>
                {analysis.globalScore}/100
              </div>
            </div>
          </motion.div>
          <div>
            <p style={{ fontSize: '1.5rem', fontWeight: 600, color: theme.text.primary, marginBottom: '0.5rem' }}>
              {getScoreLabel(analysis.globalScore)}
            </p>
            <p style={{ fontSize: '1rem', color: theme.text.tertiary }}>
              Top {analysis.percentile}% de votre secteur
            </p>
          </div>
        </div>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: theme.text.primary, marginBottom: '1.5rem' }}>
          Détail par section
        </h2>

        <div style={{
          background: mode === 'dark' ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)', borderRadius: '16px', border: `1px solid ${theme.border.light}`, padding: '1.5rem'
        }}>
          {analysis.sections.map((section, index) => (
            <div key={section.name} onClick={() => onSectionClick(section.name)} style={{
              padding: '1.25rem', borderBottom: index < analysis.sections.length - 1 ? `1px solid ${theme.border.light}` : 'none',
              cursor: 'pointer', borderRadius: '8px', transition: 'background 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }} onMouseEnter={(e) => e.currentTarget.style.background = theme.bg.tertiary}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '1rem', fontWeight: 600, color: theme.text.primary, marginBottom: '0.5rem' }}>
                  {section.name}
                </p>
                <div style={{ width: '100%', height: '6px', background: theme.bg.tertiary, borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ width: `${section.score}%`, height: '100%', background: getScoreColor(section.score), borderRadius: '999px' }} />
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '2rem' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, color: getScoreColor(section.score) }}>
                  {section.score}/100
                </span>
                <span style={{ color: theme.text.tertiary }}>→</span>
              </div>
            </div>
          ))}
        </div>

        {analysis.priorityAction && (
          <div style={{
            marginTop: '2rem', padding: '1.5rem',
            background: `${theme.accent.primary}15`,
            border: `1px solid ${theme.accent.primary}40`,
            borderRadius: '12px'
          }}>
            <p style={{ fontSize: '0.875rem', color: theme.text.tertiary, marginBottom: '0.5rem' }}>
              🎯 Action prioritaire
            </p>
            <p style={{ fontSize: '1rem', color: theme.text.primary, fontWeight: 500 }}>
              {analysis.priorityAction}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};
