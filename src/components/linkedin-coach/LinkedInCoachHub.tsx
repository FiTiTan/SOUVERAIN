import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../ThemeContext';
import { CalmCard } from '../ui/CalmCard';
import { type ProfileAnalysis } from '../../services/linkedinCoachService';

interface LinkedInCoachHubProps {
  onAnalyzeProfile: () => void;
  onGenerateContent: () => void;
}

export const LinkedInCoachHub: React.FC<LinkedInCoachHubProps> = ({
  onAnalyzeProfile,
  onGenerateContent
}) => {
  const { theme } = useTheme();
  const [lastAnalysis, setLastAnalysis] = useState<ProfileAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLastAnalysis();
  }, []);

  const loadLastAnalysis = async () => {
    try {
      // @ts-ignore
      const analyses = await window.electron.invoke('db-get-linkedin-analyses');
      if (analyses && analyses.length > 0) {
        setLastAnalysis(analyses[0]);
      }
    } catch (error) {
      console.error('Error loading last analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return theme.semantic.success;
    if (score >= 70) return '#f59e0b'; // Orange
    if (score >= 50) return theme.semantic.warning;
    return theme.semantic.error;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Aujourd'hui";
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays} jours`;
    if (diffDays < 30) return `Il y a ${Math.floor(diffDays / 7)} semaines`;
    return `Il y a ${Math.floor(diffDays / 30)} mois`;
  };

  return (
    <div style={{
      padding: '2rem',
      maxWidth: '1400px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: '3rem' }}
      >
        <h1 style={{
          fontSize: '2.5rem',
          fontWeight: 700,
          color: theme.text.primary,
          marginBottom: '0.5rem',
          letterSpacing: '-0.02em'
        }}>
          Coach LinkedIn
        </h1>
        <p style={{
          fontSize: '1.125rem',
          color: theme.text.secondary,
          lineHeight: 1.6
        }}>
          Optimisez votre présence LinkedIn avec l'IA
        </p>
      </motion.div>

      {/* Action Cards */}
      <div style={{
        display: 'flex',
        gap: '2rem',
        marginBottom: '3rem',
        flexWrap: 'wrap'
      }}>
        <CalmCard
          title="Analyser mon profil"
          description="Score + Recommandations personnalisées"
          icon="🔍"
          themeColor="blue"
          onClick={onAnalyzeProfile}
        />
        <CalmCard
          title="Générer du contenu"
          description="Posts, Headline, About optimisé"
          icon="✨"
          themeColor="purple"
          onClick={onGenerateContent}
        />
      </div>

      {/* Last Analysis */}
      {!loading && lastAnalysis && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            padding: '2rem',
            background: `linear-gradient(135deg, ${getScoreColor(lastAnalysis.globalScore)}15, transparent)`,
            borderRadius: '16px',
            border: `1px solid ${getScoreColor(lastAnalysis.globalScore)}40`
          }}
        >
          <p style={{
            fontSize: '0.875rem',
            color: theme.text.tertiary,
            marginBottom: '0.5rem'
          }}>
            Dernière analyse
          </p>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <p style={{
                fontSize: '2rem',
                fontWeight: 700,
                color: getScoreColor(lastAnalysis.globalScore),
                marginBottom: '0.25rem'
              }}>
                {lastAnalysis.globalScore}/100
              </p>
              <p style={{
                fontSize: '0.875rem',
                color: theme.text.tertiary
              }}>
                {formatTimeAgo(lastAnalysis.createdAt)}
              </p>
            </div>
            <button
              onClick={onAnalyzeProfile}
              style={{
                padding: '0.75rem 1.5rem',
                background: theme.accent.primary,
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '0.875rem',
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
              Voir les détails →
            </button>
          </div>
        </motion.div>
      )}

      {!loading && !lastAnalysis && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            textAlign: 'center',
            padding: '3rem',
            color: theme.text.tertiary
          }}
        >
          <p>Aucune analyse pour le moment. Commencez par analyser votre profil LinkedIn.</p>
        </motion.div>
      )}
    </div>
  );
};
