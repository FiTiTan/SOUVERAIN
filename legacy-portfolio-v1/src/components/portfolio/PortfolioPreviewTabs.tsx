/**
 * SOUVERAIN - Portfolio Preview Tabs
 * Preview avec/sans anonymisation pour export
 */

import React, { useState, useEffect } from 'react';
import { useTheme } from '../../ThemeContext';
import { typography, borderRadius, transitions } from '../../design-system';

interface PortfolioPreviewTabsProps {
  projectId: string;
  pitch: string;
  challenge: string;
  solution: string;
  anonymizeEnabled: boolean;
}

type PreviewTab = 'normal' | 'anonymized';

export const PortfolioPreviewTabs: React.FC<PortfolioPreviewTabsProps> = ({
  projectId,
  pitch,
  challenge,
  solution,
  anonymizeEnabled
}) => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<PreviewTab>('normal');
  const [anonymizedContent, setAnonymizedContent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Charger le contenu anonymisé si le toggle est activé
  useEffect(() => {
    if (anonymizeEnabled && activeTab === 'anonymized') {
      loadAnonymizedContent();
    }
  }, [anonymizeEnabled, activeTab, projectId]);

  const loadAnonymizedContent = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await window.electron.portfolio.anonymizeForExport(projectId);

      if (result.success) {
        setAnonymizedContent(result.anonymizedSections);
      } else {
        setError(result.error || 'Erreur lors de l\'anonymisation');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur inattendue');
    } finally {
      setIsLoading(false);
    }
  };

  const styles = {
    container: {
      marginTop: '1.5rem',
      border: `1px solid ${theme.border.light}`,
      borderRadius: borderRadius.xl,
      overflow: 'hidden',
    },
    tabs: {
      display: 'flex',
      borderBottom: `1px solid ${theme.border.light}`,
      backgroundColor: theme.bg.secondary,
    },
    tab: (active: boolean) => ({
      flex: 1,
      padding: '0.875rem 1.5rem',
      fontSize: typography.fontSize.base,
      fontWeight: active ? typography.fontWeight.semibold : typography.fontWeight.medium,
      color: active ? theme.accent.primary : theme.text.secondary,
      backgroundColor: active ? theme.bg.primary : 'transparent',
      border: 'none',
      borderBottom: active ? `2px solid ${theme.accent.primary}` : 'none',
      cursor: 'pointer',
      transition: transitions.fast,
      textAlign: 'center' as const,
    }),
    content: {
      padding: '1.5rem',
      backgroundColor: theme.bg.primary,
    },
    section: {
      marginBottom: '1.5rem',
    },
    sectionLabel: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text.tertiary,
      textTransform: 'uppercase' as const,
      marginBottom: '0.5rem',
      letterSpacing: '0.05em',
    },
    sectionContent: {
      fontSize: typography.fontSize.base,
      color: theme.text.primary,
      lineHeight: typography.lineHeight.relaxed,
      whiteSpace: 'pre-wrap' as const,
    },
    token: {
      display: 'inline-block',
      padding: '0.125rem 0.375rem',
      backgroundColor: theme.accent.muted,
      color: theme.accent.primary,
      borderRadius: borderRadius.sm,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      fontFamily: typography.fontFamily.mono,
    },
    loader: {
      textAlign: 'center' as const,
      padding: '2rem',
      color: theme.text.tertiary,
    },
    error: {
      padding: '1rem',
      backgroundColor: theme.semantic.errorBg,
      color: theme.semantic.error,
      borderRadius: borderRadius.md,
      fontSize: typography.fontSize.sm,
    },
    info: {
      padding: '1rem',
      backgroundColor: theme.semantic.infoBg,
      color: theme.semantic.info,
      borderRadius: borderRadius.md,
      fontSize: typography.fontSize.sm,
      marginBottom: '1rem',
    },
  };

  // Fonction pour mettre en évidence les tokens d'anonymisation
  const highlightTokens = (text: string) => {
    const tokenRegex = /\[(PERSON|COMPANY|EMAIL|PHONE|SCHOOL|LOCATION)_\d+\]/g;
    const parts = text.split(tokenRegex);
    const matches = text.match(tokenRegex) || [];

    return parts.map((part, index) => {
      if (matches.includes(part) || part.match(/^(PERSON|COMPANY|EMAIL|PHONE|SCHOOL|LOCATION)_\d+$/)) {
        return <span key={index} style={styles.token}>[{part}]</span>;
      }
      return part;
    });
  };

  const renderContent = () => {
    if (activeTab === 'normal') {
      return (
        <>
          {pitch && (
            <div style={styles.section}>
              <div style={styles.sectionLabel}>Pitch</div>
              <div style={styles.sectionContent}>{pitch}</div>
            </div>
          )}

          {challenge && (
            <div style={styles.section}>
              <div style={styles.sectionLabel}>Challenge</div>
              <div style={styles.sectionContent}>{challenge}</div>
            </div>
          )}

          {solution && (
            <div style={styles.section}>
              <div style={styles.sectionLabel}>Solution</div>
              <div style={styles.sectionContent}>{solution}</div>
            </div>
          )}
        </>
      );
    }

    // Tab anonymisé
    if (!anonymizeEnabled) {
      return (
        <div style={styles.info}>
          ℹ️ Activez "Anonymiser pour export" pour voir le preview anonymisé
        </div>
      );
    }

    if (isLoading) {
      return <div style={styles.loader}>⏳ Anonymisation en cours...</div>;
    }

    if (error) {
      return <div style={styles.error}>❌ {error}</div>;
    }

    if (!anonymizedContent) {
      return <div style={styles.loader}>Cliquez sur un onglet pour charger le preview</div>;
    }

    return (
      <>
        <div style={styles.info}>
          🔒 Les données sensibles sont remplacées par des tokens ([PERSON_1], [COMPANY_2]...)
        </div>

        {anonymizedContent.pitch && (
          <div style={styles.section}>
            <div style={styles.sectionLabel}>Pitch (Anonymisé)</div>
            <div style={styles.sectionContent}>
              {highlightTokens(anonymizedContent.pitch)}
            </div>
          </div>
        )}

        {anonymizedContent.challenge && (
          <div style={styles.section}>
            <div style={styles.sectionLabel}>Challenge (Anonymisé)</div>
            <div style={styles.sectionContent}>
              {highlightTokens(anonymizedContent.challenge)}
            </div>
          </div>
        )}

        {anonymizedContent.solution && (
          <div style={styles.section}>
            <div style={styles.sectionLabel}>Solution (Anonymisée)</div>
            <div style={styles.sectionContent}>
              {highlightTokens(anonymizedContent.solution)}
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <div style={styles.container}>
      <div style={styles.tabs}>
        <button
          style={styles.tab(activeTab === 'normal')}
          onClick={() => setActiveTab('normal')}
          onMouseEnter={(e) => {
            if (activeTab !== 'normal') {
              e.currentTarget.style.backgroundColor = theme.bg.tertiary;
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'normal') {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          Preview
        </button>
        <button
          style={styles.tab(activeTab === 'anonymized')}
          onClick={() => setActiveTab('anonymized')}
          onMouseEnter={(e) => {
            if (activeTab !== 'anonymized') {
              e.currentTarget.style.backgroundColor = theme.bg.tertiary;
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== 'anonymized') {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          Preview anonymisé
        </button>
      </div>

      <div style={styles.content}>
        {renderContent()}
      </div>
    </div>
  );
};
