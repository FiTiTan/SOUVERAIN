/**
 * SOUVERAIN - CV Coach Module
 * Écran de choix + Flow d'analyse CV
 */

import React, { useState } from 'react';
import { useTheme } from '../ThemeContext';
import { typography, borderRadius, transitions } from '../design-system';

// ============================================================
// TYPES
// ============================================================

type CVPath = 'choice' | 'existing' | 'scratch';

interface CVChoiceProps {
  onSelectPath: (path: 'existing' | 'scratch') => void;
}

// ============================================================
// ICONS
// ============================================================

const Icons = {
  FileText: () => (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  Rocket: () => (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  ),
};

// ============================================================
// PATH CARD COMPONENT
// ============================================================

interface PathCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

const PathCard: React.FC<PathCardProps> = ({ icon, title, description, onClick }) => {
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        padding: '2rem',
        backgroundColor: isHovered ? theme.accent.muted : theme.bg.secondary,
        borderRadius: borderRadius.xl,
        border: `2px solid ${isHovered ? theme.accent.primary : theme.border.light}`,
        cursor: 'pointer',
        transition: transitions.normal,
        textAlign: 'center',
        flex: 1,
        maxWidth: '280px',
      }}
    >
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: borderRadius.xl,
        backgroundColor: isHovered ? theme.accent.primary : theme.accent.muted,
        color: isHovered ? '#FFFFFF' : theme.accent.primary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto 1.25rem',
        transition: transitions.normal,
      }}>
        {icon}
      </div>

      <h3 style={{
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        color: theme.text.primary,
        marginBottom: '0.5rem',
      }}>
        {title}
      </h3>

      <p style={{
        fontSize: typography.fontSize.sm,
        color: theme.text.secondary,
        lineHeight: typography.lineHeight.relaxed,
      }}>
        {description}
      </p>
    </div>
  );
};

// ============================================================
// CV CHOICE SCREEN
// ============================================================

export const CVChoice: React.FC<CVChoiceProps> = ({ onSelectPath }) => {
  const { theme } = useTheme();

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: '2rem',
      textAlign: 'center' as const,
    },
    title: {
      fontSize: typography.fontSize['3xl'],
      fontWeight: typography.fontWeight.bold,
      color: theme.text.primary,
      marginBottom: '0.75rem',
    },
    subtitle: {
      fontSize: typography.fontSize.base,
      color: theme.text.secondary,
      lineHeight: typography.lineHeight.relaxed,
      marginBottom: '3rem',
      maxWidth: '600px',
    },
    cardsContainer: {
      display: 'flex',
      gap: '1.5rem',
      flexWrap: 'wrap' as const,
      justifyContent: 'center',
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Édition de CV</h1>
      <p style={styles.subtitle}>
        Comment souhaitez-vous commencer ?
      </p>

      <div style={styles.cardsContainer}>
        <PathCard
          icon={<Icons.FileText />}
          title="J'ai déjà un CV"
          description="Analysez et améliorez votre CV existant avec notre coach IA."
          onClick={() => onSelectPath('existing')}
        />
        <PathCard
          icon={<Icons.Rocket />}
          title="Je pars de zéro"
          description="Construisez votre CV étape par étape, guidé par notre assistant."
          onClick={() => onSelectPath('scratch')}
        />
      </div>
    </div>
  );
};

// ============================================================
// SCRATCH PLACEHOLDER
// ============================================================

interface ScratchPlaceholderProps {
  onBack: () => void;
}

export const ScratchPlaceholder: React.FC<ScratchPlaceholderProps> = ({ onBack }) => {
  const { theme } = useTheme();

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      padding: '2rem',
      textAlign: 'center' as const,
    },
    title: {
      fontSize: typography.fontSize['3xl'],
      fontWeight: typography.fontWeight.bold,
      color: theme.text.primary,
      marginBottom: '1rem',
    },
    description: {
      fontSize: typography.fontSize.base,
      color: theme.text.secondary,
      marginBottom: '2rem',
      maxWidth: '500px',
    },
    button: {
      padding: '0.875rem 1.5rem',
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      backgroundColor: theme.accent.primary,
      color: '#FFFFFF',
      border: 'none',
      borderRadius: borderRadius.lg,
      cursor: 'pointer',
    },
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Créer un CV de zéro</h1>
      <p style={styles.description}>
        Le questionnaire guidé arrive bientôt ! Vous pourrez créer votre CV étape par étape avec l'aide de notre assistant IA.
      </p>
      <button style={styles.button} onClick={onBack}>
        Retour au choix
      </button>
    </div>
  );
};
