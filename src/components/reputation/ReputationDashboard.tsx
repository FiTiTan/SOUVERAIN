/**
 * Dashboard e-réputation - Page principale
 */

import React, { useEffect, useState } from 'react';
import { useTheme } from '../../ThemeContext';
import { typography, borderRadius } from '../../design-system';
import type { ReputationData } from '../../types/reputation';
import { getReputationData } from '../../services/reputationService';
import { ScoreGauge } from './ScoreGauge';
import { ActionCard } from './ActionCard';
import { ScoreBreakdown } from './ScoreBreakdown';
import { SocialPlatforms } from './SocialPlatforms';
import { ZapIcon, LightbulbIcon, TargetIcon, CheckIcon } from '../icons/FeatherIcons';

export const ReputationDashboard: React.FC = () => {
  const { theme } = useTheme();
  const [data, setData] = useState<ReputationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const reputationData = await getReputationData();
      setData(reputationData);
    } catch (error) {
      console.error('[Reputation] Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        color: theme.text.secondary,
      }}>
        Chargement...
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        color: theme.text.secondary,
      }}>
        Erreur de chargement
      </div>
    );
  }

  const highPriorityActions = data.actions.filter(a => a.priority === 'high' && !a.completed);
  const otherActions = data.actions.filter(a => a.priority !== 'high' && !a.completed);

  return (
    <div style={{
      padding: '2rem',
      maxWidth: '1400px',
      margin: '0 auto',
    }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontSize: typography.fontSize['2xl'],
          fontWeight: typography.fontWeight.bold,
          color: theme.text.primary,
          marginBottom: '0.5rem',
        }}>
          E-Réputation
        </h1>
        <p style={{
          fontSize: typography.fontSize.base,
          color: theme.text.secondary,
        }}>
          Pilote ta présence en ligne et booste ta visibilité professionnelle
        </p>
      </div>

      {/* Top section: Score + Breakdown */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: '2rem',
        marginBottom: '2rem',
      }}>
        {/* Score Gauge */}
        <div style={{
          padding: '2rem',
          backgroundColor: theme.bg.secondary,
          border: `1px solid ${theme.border.default}`,
          borderRadius: borderRadius.lg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <ScoreGauge score={data.score.global} size={200} />
        </div>

        {/* Breakdown */}
        <ScoreBreakdown breakdown={data.score.breakdown} />
      </div>

      {/* Actions prioritaires */}
      {highPriorityActions.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{
            fontSize: typography.fontSize.xl,
            fontWeight: typography.fontWeight.semibold,
            color: theme.text.primary,
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <ZapIcon size={20} color={theme.semantic.error} strokeWidth={2} />
            Actions prioritaires
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
            gap: '1rem',
          }}>
            {highPriorityActions.map(action => (
              <ActionCard key={action.id} action={action} />
            ))}
          </div>
        </div>
      )}

      {/* Autres actions */}
      {otherActions.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{
            fontSize: typography.fontSize.xl,
            fontWeight: typography.fontWeight.semibold,
            color: theme.text.primary,
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}>
            <LightbulbIcon size={20} color={theme.accent.primary} strokeWidth={2} />
            Recommandations
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
            gap: '1rem',
          }}>
            {otherActions.map(action => (
              <ActionCard key={action.id} action={action} />
            ))}
          </div>
        </div>
      )}

      {/* Plateformes sociales */}
      <SocialPlatforms platforms={data.socialPlatforms} />

      {/* Objectifs */}
      <div style={{
        padding: '1.5rem',
        backgroundColor: theme.bg.secondary,
        border: `1px solid ${theme.border.default}`,
        borderRadius: borderRadius.lg,
      }}>
        <h3 style={{
          fontSize: typography.fontSize.lg,
          fontWeight: typography.fontWeight.semibold,
          color: theme.text.primary,
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}>
          <TargetIcon size={20} color={theme.accent.primary} strokeWidth={2} />
          Objectif : {data.goals.targetScore} points
        </h3>
        
        <div style={{
          display: 'flex',
          gap: '1rem',
        }}>
          {data.goals.milestones.map((milestone, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                padding: '1rem',
                backgroundColor: milestone.achieved ? theme.accent.primary + '20' : theme.bg.tertiary,
                borderRadius: borderRadius.md,
                textAlign: 'center',
              }}
            >
              <div style={{
                fontSize: typography.fontSize['2xl'],
                fontWeight: typography.fontWeight.bold,
                color: milestone.achieved ? theme.accent.primary : theme.text.tertiary,
                marginBottom: '0.25rem',
              }}>
                {milestone.score}
              </div>
              <div style={{
                fontSize: typography.fontSize.sm,
                color: theme.text.secondary,
              }}>
                {milestone.label}
              </div>
              {milestone.achieved && (
                <div style={{
                  marginTop: '0.5rem',
                  display: 'flex',
                  justifyContent: 'center',
                }}>
                  <CheckIcon size={20} color={theme.accent.primary} strokeWidth={2.5} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
