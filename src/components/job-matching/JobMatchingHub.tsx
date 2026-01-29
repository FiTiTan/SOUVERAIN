import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../ThemeContext';
import { CalmCard } from '../ui/CalmCard';
import { 
    type JobOffer, 
    type CVProfile, 
    type MatchingResult,
    analyzeJobMatching 
} from '../../services/jobMatchingService';

interface JobMatchingHubProps {
  onStartNewMatching: () => void;
  onViewHistory: () => void;
}

export const JobMatchingHub: React.FC<JobMatchingHubProps> = ({
  onStartNewMatching,
  onViewHistory
}) => {
  const { theme, mode } = useTheme();
  const [recentMatchings, setRecentMatchings] = useState<MatchingResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecentMatchings();
  }, []);

  const loadRecentMatchings = async () => {
    try {
      // @ts-ignore
      const history = await window.electron.invoke('db-get-matching-history');
      setRecentMatchings(history?.slice(0, 3) || []);
    } catch (error) {
      console.error('Error loading matching history:', error);
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
          Job Matching
        </h1>
        <p style={{
          fontSize: '1.125rem',
          color: theme.text.secondary,
          lineHeight: 1.6
        }}>
          Analysez la compatibilité entre vos CV et des offres d'emploi
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
          title="Importer une offre"
          description="Analysez une offre d'emploi par rapport à votre profil"
          icon="📄"
          themeColor="blue"
          onClick={onStartNewMatching}
        />
        <CalmCard
          title="Historique des matchings"
          description="Retrouvez vos analyses précédentes"
          icon="📊"
          themeColor="purple"
          onClick={onViewHistory}
        />
      </div>

      {/* Recent Matchings */}
      {!loading && recentMatchings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 600,
            color: theme.text.primary,
            marginBottom: '1.5rem'
          }}>
            Derniers matchings
          </h2>

          <div style={{
            background: mode === 'dark'
              ? 'rgba(30, 41, 59, 0.6)'
              : 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(20px)',
            borderRadius: '16px',
            border: `1px solid ${theme.border.light}`,
            padding: '1.5rem'
          }}>
            {recentMatchings.map((matching, index) => (
              <div
                key={matching.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1rem',
                  borderBottom: index < recentMatchings.length - 1
                    ? `1px solid ${theme.border.light}`
                    : 'none',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = theme.bg.tertiary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontSize: '1rem',
                    fontWeight: 600,
                    color: theme.text.primary,
                    marginBottom: '0.25rem'
                  }}>
                    {matching.jobOfferId}
                  </p>
                  <p style={{
                    fontSize: '0.875rem',
                    color: theme.text.tertiary
                  }}>
                    {formatTimeAgo(matching.createdAt)}
                  </p>
                </div>
                <div style={{
                  fontSize: '1.5rem',
                  fontWeight: 700,
                  color: getScoreColor(matching.score)
                }}>
                  {matching.score}%
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {!loading && recentMatchings.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            textAlign: 'center',
            padding: '3rem',
            color: theme.text.tertiary
          }}
        >
          <p>Aucun matching pour le moment. Commencez par analyser une offre d'emploi.</p>
        </motion.div>
      )}
    </div>
  );
};
