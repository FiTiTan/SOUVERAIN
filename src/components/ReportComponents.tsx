/**
 * SOUVERAIN - CV Report Components
 * Composants spécifiques au rapport d'analyse CV
 */

import React from 'react';
import { useTheme } from '../ThemeContext';
import { BentoCard, Tag, ScoreBar, SectionHeader } from './ui';
import { typography, borderRadius, transitions, getScoreColor } from '../design-system';

// ============================================================
// DIAGNOSTIC CARD - En-tête du rapport
// ============================================================

interface DiagnosticCardProps {
  metier: string;
  secteur: string;
  niveau: string;
  experience: string;
  pointFort: string;
  axeAmelioration: string;
}

export const DiagnosticCard: React.FC<DiagnosticCardProps> = ({
  metier,
  secteur,
  niveau,
  experience,
  pointFort,
  axeAmelioration
}) => {
  const { theme } = useTheme();

  return (
    <BentoCard span={2} padding="2rem">
      <SectionHeader title="Diagnostic Express" />
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(4, 1fr)', 
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div>
          <p style={{ fontSize: typography.fontSize.xs, color: theme.text.tertiary, marginBottom: '0.25rem' }}>
            MÉTIER
          </p>
          <p style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: theme.text.primary }}>
            {metier}
          </p>
        </div>
        <div>
          <p style={{ fontSize: typography.fontSize.xs, color: theme.text.tertiary, marginBottom: '0.25rem' }}>
            SECTEUR
          </p>
          <p style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: theme.text.primary }}>
            {secteur}
          </p>
        </div>
        <div>
          <p style={{ fontSize: typography.fontSize.xs, color: theme.text.tertiary, marginBottom: '0.25rem' }}>
            NIVEAU
          </p>
          <Tag variant="accent">{niveau}</Tag>
        </div>
        <div>
          <p style={{ fontSize: typography.fontSize.xs, color: theme.text.tertiary, marginBottom: '0.25rem' }}>
            EXPÉRIENCE
          </p>
          <p style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold, color: theme.text.primary }}>
            {experience}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div style={{ 
          padding: '1rem', 
          backgroundColor: theme.semantic.successBg, 
          borderRadius: borderRadius.lg,
          borderLeft: `3px solid ${theme.semantic.success}`
        }}>
          <p style={{ fontSize: typography.fontSize.xs, color: theme.semantic.success, fontWeight: typography.fontWeight.semibold, marginBottom: '0.25rem' }}>
            ✓ POINT FORT
          </p>
          <p style={{ fontSize: typography.fontSize.sm, color: theme.text.primary }}>
            {pointFort}
          </p>
        </div>
        <div style={{ 
          padding: '1rem', 
          backgroundColor: theme.semantic.warningBg, 
          borderRadius: borderRadius.lg,
          borderLeft: `3px solid ${theme.semantic.warning}`
        }}>
          <p style={{ fontSize: typography.fontSize.xs, color: theme.semantic.warning, fontWeight: typography.fontWeight.semibold, marginBottom: '0.25rem' }}>
            ⚡ À AMÉLIORER
          </p>
          <p style={{ fontSize: typography.fontSize.sm, color: theme.text.primary }}>
            {axeAmelioration}
          </p>
        </div>
      </div>
    </BentoCard>
  );
};

// ============================================================
// SCORE CARD - Score global avec détails
// ============================================================

interface ScoreDetail {
  label: string;
  score: number;
  description: string;
}

interface ScoreCardProps {
  globalScore: number;
  details: {
    impact: ScoreDetail[];
    lisibilite: ScoreDetail[];
    optimisation: ScoreDetail[];
  };
}

export const ScoreCard: React.FC<ScoreCardProps> = ({ globalScore, details }) => {
  const { theme, mode } = useTheme();
  const scoreColor = getScoreColor(globalScore, mode === 'dark');

  return (
    <BentoCard padding="2rem">
      <SectionHeader title="Score Global" />
      
      {/* Score principal */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '120px',
          height: '120px',
          borderRadius: borderRadius.full,
          border: `4px solid ${scoreColor}`,
          backgroundColor: theme.bg.tertiary,
        }}>
          <div>
            <span style={{ 
              fontSize: typography.fontSize['4xl'], 
              fontWeight: typography.fontWeight.bold,
              color: scoreColor,
            }}>
              {globalScore.toFixed(1)}
            </span>
            <span style={{ 
              fontSize: typography.fontSize.lg, 
              color: theme.text.tertiary 
            }}>/10</span>
          </div>
        </div>
      </div>

      {/* Détails par catégorie */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <p style={{ 
            fontSize: typography.fontSize.xs, 
            color: theme.text.tertiary, 
            fontWeight: typography.fontWeight.semibold,
            marginBottom: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Impact (40%)
          </p>
          {details.impact.map((item, idx) => (
            <ScoreBar key={idx} score={item.score} label={item.label} description={item.description} />
          ))}
        </div>
        
        <div>
          <p style={{ 
            fontSize: typography.fontSize.xs, 
            color: theme.text.tertiary, 
            fontWeight: typography.fontWeight.semibold,
            marginBottom: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Lisibilité (30%)
          </p>
          {details.lisibilite.map((item, idx) => (
            <ScoreBar key={idx} score={item.score} label={item.label} description={item.description} />
          ))}
        </div>

        <div>
          <p style={{ 
            fontSize: typography.fontSize.xs, 
            color: theme.text.tertiary, 
            fontWeight: typography.fontWeight.semibold,
            marginBottom: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Optimisation (30%)
          </p>
          {details.optimisation.map((item, idx) => (
            <ScoreBar key={idx} score={item.score} label={item.label} description={item.description} />
          ))}
        </div>
      </div>
    </BentoCard>
  );
};

// ============================================================
// EXPERIENCE CARD - Analyse d'une expérience
// ============================================================

type Pertinence = 'Essentielle' | 'Importante' | 'Secondaire' | 'À réduire' | 'À supprimer';

interface ExperienceCardProps {
  company: string;
  poste: string;
  dates: string;
  pertinence: Pertinence;
  pointsForts: string;
  pointsFaibles: string;
  verdict: string;
}

export const ExperienceCard: React.FC<ExperienceCardProps> = ({
  company,
  poste,
  dates,
  pertinence,
  pointsForts,
  pointsFaibles,
  verdict
}) => {
  const { theme } = useTheme();

  const pertinenceConfig: Record<Pertinence, { color: string; bg: string }> = {
    'Essentielle': { color: theme.semantic.success, bg: theme.semantic.successBg },
    'Importante': { color: theme.semantic.info, bg: theme.semantic.infoBg },
    'Secondaire': { color: theme.text.tertiary, bg: theme.bg.tertiary },
    'À réduire': { color: theme.semantic.warning, bg: theme.semantic.warningBg },
    'À supprimer': { color: theme.semantic.error, bg: theme.semantic.errorBg },
  };

  const config = pertinenceConfig[pertinence] || pertinenceConfig['Secondaire'];

  return (
    <div style={{
      padding: '1.25rem',
      backgroundColor: theme.bg.secondary,
      borderRadius: borderRadius.lg,
      border: `1px solid ${theme.border.light}`,
      marginBottom: '1rem',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div>
          <h4 style={{ 
            fontSize: typography.fontSize.base, 
            fontWeight: typography.fontWeight.semibold, 
            color: theme.text.primary,
            margin: 0 
          }}>
            {company}
          </h4>
          <p style={{ 
            fontSize: typography.fontSize.sm, 
            color: theme.text.secondary,
            margin: '0.25rem 0 0 0'
          }}>
            {poste}
          </p>
          <p style={{ 
            fontSize: typography.fontSize.xs, 
            color: theme.text.tertiary,
            margin: '0.25rem 0 0 0'
          }}>
            {dates}
          </p>
        </div>
        <span style={{
          padding: '0.25rem 0.75rem',
          fontSize: typography.fontSize.xs,
          fontWeight: typography.fontWeight.medium,
          backgroundColor: config.bg,
          color: config.color,
          borderRadius: borderRadius.full,
        }}>
          {pertinence}
        </span>
      </div>

      {/* Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <p style={{ 
            fontSize: typography.fontSize.xs, 
            color: theme.semantic.success, 
            fontWeight: typography.fontWeight.medium,
            marginBottom: '0.25rem'
          }}>
            Points forts
          </p>
          <p style={{ fontSize: typography.fontSize.sm, color: theme.text.secondary }}>
            {pointsForts}
          </p>
        </div>
        <div>
          <p style={{ 
            fontSize: typography.fontSize.xs, 
            color: theme.semantic.warning, 
            fontWeight: typography.fontWeight.medium,
            marginBottom: '0.25rem'
          }}>
            Points faibles
          </p>
          <p style={{ fontSize: typography.fontSize.sm, color: theme.text.secondary }}>
            {pointsFaibles}
          </p>
        </div>
      </div>

      {/* Verdict */}
      <div style={{ 
        padding: '0.75rem 1rem', 
        backgroundColor: theme.bg.tertiary, 
        borderRadius: borderRadius.md,
        borderLeft: `3px solid ${theme.accent.primary}`
      }}>
        <p style={{ 
          fontSize: typography.fontSize.xs, 
          color: theme.accent.primary, 
          fontWeight: typography.fontWeight.semibold,
          marginBottom: '0.25rem'
        }}>
          VERDICT
        </p>
        <p style={{ fontSize: typography.fontSize.sm, color: theme.text.primary, margin: 0 }}>
          {verdict}
        </p>
      </div>
    </div>
  );
};

// ============================================================
// ATS TABLE - Tableau des mots-clés
// ============================================================

interface ATSKeyword {
  keyword: string;
  priority?: 'high' | 'medium' | 'low';
  location?: string;
}

interface ATSTableProps {
  secteur: string;
  sousSpecialite?: string;
  present: string[];
  missing: ATSKeyword[];
}

export const ATSTable: React.FC<ATSTableProps> = ({
  secteur,
  sousSpecialite,
  present,
  missing
}) => {
  const { theme } = useTheme();

  const priorityColors = {
    high: { color: theme.semantic.error, label: 'Haute' },
    medium: { color: theme.semantic.warning, label: 'Moyenne' },
    low: { color: theme.text.tertiary, label: 'Basse' },
  };

  return (
    <BentoCard span={2} padding="2rem">
      <SectionHeader 
        title="Compatibilité ATS" 
        subtitle={`${secteur}${sousSpecialite ? ` — ${sousSpecialite}` : ''}`}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Mots-clés présents */}
        <div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            marginBottom: '1rem',
            paddingBottom: '0.75rem',
            borderBottom: `1px solid ${theme.border.light}`
          }}>
            <span style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: borderRadius.full, 
              backgroundColor: theme.semantic.success 
            }} />
            <span style={{ 
              fontSize: typography.fontSize.sm, 
              fontWeight: typography.fontWeight.semibold, 
              color: theme.text.primary 
            }}>
              Présents dans le CV ({present.length})
            </span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {present.map((keyword, idx) => (
              <span key={idx} style={{
                padding: '0.375rem 0.75rem',
                fontSize: typography.fontSize.sm,
                backgroundColor: theme.semantic.successBg,
                color: theme.semantic.success,
                borderRadius: borderRadius.md,
              }}>
                {keyword}
              </span>
            ))}
          </div>
        </div>

        {/* Mots-clés manquants */}
        <div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            marginBottom: '1rem',
            paddingBottom: '0.75rem',
            borderBottom: `1px solid ${theme.border.light}`
          }}>
            <span style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: borderRadius.full, 
              backgroundColor: theme.semantic.error 
            }} />
            <span style={{ 
              fontSize: typography.fontSize.sm, 
              fontWeight: typography.fontWeight.semibold, 
              color: theme.text.primary 
            }}>
              À ajouter ({missing.length})
            </span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {missing.map((item, idx) => (
              <div key={idx} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.5rem 0.75rem',
                backgroundColor: theme.bg.tertiary,
                borderRadius: borderRadius.md,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: borderRadius.full,
                    backgroundColor: item.priority ? priorityColors[item.priority].color : theme.text.tertiary,
                  }} />
                  <span style={{ fontSize: typography.fontSize.sm, color: theme.text.primary }}>
                    {item.keyword}
                  </span>
                </div>
                {item.location && (
                  <span style={{ fontSize: typography.fontSize.xs, color: theme.text.tertiary }}>
                    → {item.location}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </BentoCard>
  );
};

// ============================================================
// ACTION CARD - Plan d'action
// ============================================================

interface ActionItemProps {
  priority: 1 | 2 | 3;
  title: string;
  description: string;
  impact: string;
  duration: string;
}

export const ActionCard: React.FC<ActionItemProps> = ({
  priority,
  title,
  description,
  impact,
  duration
}) => {
  const { theme } = useTheme();

  const medals = {
    1: { emoji: '🥇', color: '#FFD700' },
    2: { emoji: '🥈', color: '#C0C0C0' },
    3: { emoji: '🥉', color: '#CD7F32' },
  };

  const medal = medals[priority];

  return (
    <div style={{
      padding: '1.25rem',
      backgroundColor: theme.bg.secondary,
      borderRadius: borderRadius.lg,
      border: `1px solid ${theme.border.light}`,
      display: 'flex',
      gap: '1rem',
    }}>
      <div style={{ 
        fontSize: '2rem',
        lineHeight: 1,
      }}>
        {medal.emoji}
      </div>
      <div style={{ flex: 1 }}>
        <h4 style={{ 
          fontSize: typography.fontSize.base, 
          fontWeight: typography.fontWeight.semibold, 
          color: theme.text.primary,
          margin: '0 0 0.5rem 0'
        }}>
          {title}
        </h4>
        <p style={{ 
          fontSize: typography.fontSize.sm, 
          color: theme.text.secondary,
          margin: '0 0 0.75rem 0',
          lineHeight: typography.lineHeight.relaxed,
        }}>
          {description}
        </p>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <div>
            <span style={{ fontSize: typography.fontSize.xs, color: theme.text.tertiary }}>Impact : </span>
            <span style={{ fontSize: typography.fontSize.xs, color: theme.accent.primary, fontWeight: typography.fontWeight.medium }}>
              {impact}
            </span>
          </div>
          <div>
            <span style={{ fontSize: typography.fontSize.xs, color: theme.text.tertiary }}>Durée : </span>
            <span style={{ fontSize: typography.fontSize.xs, color: theme.text.primary, fontWeight: typography.fontWeight.medium }}>
              {duration}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// REFORMULATION CARD
// ============================================================

interface ReformulationCardProps {
  index: number;
  before: string;
  after: string;
  gain: string;
}

export const ReformulationCard: React.FC<ReformulationCardProps> = ({
  index,
  before,
  after,
  gain
}) => {
  const { theme } = useTheme();

  return (
    <div style={{
      padding: '1.25rem',
      backgroundColor: theme.bg.secondary,
      borderRadius: borderRadius.lg,
      border: `1px solid ${theme.border.light}`,
      marginBottom: '1rem',
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem',
        marginBottom: '1rem'
      }}>
        <span style={{
          width: '24px',
          height: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: typography.fontSize.xs,
          fontWeight: typography.fontWeight.bold,
          backgroundColor: theme.accent.muted,
          color: theme.accent.primary,
          borderRadius: borderRadius.full,
        }}>
          {index}
        </span>
        <span style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: theme.text.primary }}>
          Reformulation
        </span>
      </div>

      <div style={{ 
        padding: '0.75rem 1rem', 
        backgroundColor: theme.semantic.errorBg, 
        borderRadius: borderRadius.md,
        marginBottom: '0.75rem'
      }}>
        <p style={{ fontSize: typography.fontSize.xs, color: theme.semantic.error, fontWeight: typography.fontWeight.medium, marginBottom: '0.25rem' }}>
          AVANT
        </p>
        <p style={{ fontSize: typography.fontSize.sm, color: theme.text.primary, margin: 0, fontStyle: 'italic' }}>
          "{before}"
        </p>
      </div>

      <div style={{ 
        padding: '0.75rem 1rem', 
        backgroundColor: theme.semantic.successBg, 
        borderRadius: borderRadius.md,
        marginBottom: '0.75rem'
      }}>
        <p style={{ fontSize: typography.fontSize.xs, color: theme.semantic.success, fontWeight: typography.fontWeight.medium, marginBottom: '0.25rem' }}>
          APRÈS
        </p>
        <p style={{ fontSize: typography.fontSize.sm, color: theme.text.primary, margin: 0, fontWeight: typography.fontWeight.medium }}>
          "{after}"
        </p>
      </div>

      <p style={{ fontSize: typography.fontSize.xs, color: theme.text.tertiary, margin: 0 }}>
        <strong style={{ color: theme.text.secondary }}>Gain :</strong> {gain}
      </p>
    </div>
  );
};
