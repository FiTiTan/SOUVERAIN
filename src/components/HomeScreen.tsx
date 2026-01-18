/**
 * SOUVERAIN - HomeScreen
 * Écran d'accueil avec choix du parcours et aperçu des features
 */

import React, { useState } from 'react';
import { useTheme } from '../ThemeContext';
import { typography, borderRadius, transitions } from '../design-system';
import { Tag } from './ui';

// ============================================================
// TYPES
// ============================================================

type UserPath = 'existing-cv' | 'from-scratch' | null;
type ToolType = 'cv' | 'vault' | 'matching' | 'linkedin' | 'boutique' | null;

interface HomeScreenProps {
  onSelectPath: (path: UserPath) => void;
  onOpenVault: () => void;
  onOpenHelp: () => void;
}

// ============================================================
// FEATURE COLORS
// ============================================================

const featureColors = {
  privacy: { bg: '#DCFCE7', color: '#16A34A', darkBg: '#14532D', darkColor: '#4ADE80' },
  vault: { bg: '#DBEAFE', color: '#2563EB', darkBg: '#1E3A5F', darkColor: '#60A5FA' },
  cv: { bg: '#F3E8FF', color: '#9333EA', darkBg: '#3B0764', darkColor: '#C084FC' },
  matching: { bg: '#FFEDD5', color: '#EA580C', darkBg: '#431407', darkColor: '#FB923C' },
  linkedin: { bg: '#DBEAFE', color: '#0077B5', darkBg: '#1E3A5F', darkColor: '#38BDF8' },
  boutique: { bg: '#FCE7F3', color: '#DB2777', darkBg: '#500724', darkColor: '#F472B6' },
};

// ============================================================
// ICONS (plus grandes, 28-32px)
// ============================================================

const Icons = {
  Moon: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
  Sun: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  ),
  Vault: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="12" cy="12" r="3" />
      <line x1="12" y1="9" x2="12" y2="6" />
    </svg>
  ),
  Help: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
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
  // Feature icons - plus grandes et stylisées
  Shield: ({ size = 28 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" opacity="0.2"/>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M9 12l2 2 4-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Lock: ({ size = 28 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" opacity="0.2"/>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="12" cy="16" r="1.5" fill="currentColor"/>
    </svg>
  ),
  Briefcase: ({ size = 28 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" opacity="0.2"/>
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" fill="none" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  Target: ({ size = 28 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="10" opacity="0.2"/>
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="12" cy="12" r="2" fill="currentColor"/>
    </svg>
  ),
  Linkedin: ({ size = 28 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <rect x="2" y="2" width="20" height="20" rx="4" opacity="0.2"/>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      <rect x="2" y="9" width="4" height="12" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="4" cy="4" r="2" fill="none" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  ShoppingBag: ({ size = 28 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" opacity="0.2"/>
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" fill="none" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M16 10a4 4 0 0 1-8 0" fill="none" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  ChevronRight: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  Zap: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" opacity="0.3"/>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="none" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  Check: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Star: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" opacity="0.3"/>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="none" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
};

// ============================================================
// TOOL CARD COMPONENT (Boîte à outils)
// ============================================================

interface ToolCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  colorKey: keyof typeof featureColors;
  comingSoon?: boolean;
  onClick: () => void;
}

const ToolCard: React.FC<ToolCardProps> = ({
  icon,
  title,
  description,
  colorKey,
  comingSoon = false,
  onClick
}) => {
  const { theme, mode } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const colors = featureColors[colorKey];
  const iconBg = mode === 'dark' ? colors.darkBg : colors.bg;
  const iconColor = mode === 'dark' ? colors.darkColor : colors.color;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        padding: '1.5rem',
        backgroundColor: isHovered ? theme.bg.tertiary : theme.bg.secondary,
        borderRadius: borderRadius.xl,
        border: `1px solid ${isHovered ? theme.border.default : theme.border.light}`,
        cursor: 'pointer',
        transition: transitions.normal,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {comingSoon && (
        <span style={{
          position: 'absolute',
          top: '0.75rem',
          right: '0.75rem',
          padding: '0.25rem 0.5rem',
          fontSize: typography.fontSize.xs,
          fontWeight: typography.fontWeight.medium,
          backgroundColor: theme.semantic.warningBg,
          color: theme.semantic.warning,
          borderRadius: borderRadius.md,
        }}>
          Bientôt
        </span>
      )}

      <div style={{
        width: '80px',
        height: '80px',
        borderRadius: borderRadius.xl,
        backgroundColor: iconBg,
        color: iconColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.25rem',
        transition: transitions.normal,
        transform: isHovered ? 'scale(1.05)' : 'scale(1)',
      }}>
        {icon}
      </div>

      <h3 style={{
        fontSize: typography.fontSize.base,
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
// CV SELECTION MODAL
// ============================================================

interface CVSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPath: (path: UserPath) => void;
}

const CVSelectionModal: React.FC<CVSelectionModalProps> = ({ isOpen, onClose, onSelectPath }) => {
  const { theme } = useTheme();

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '2rem',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: theme.bg.secondary,
          borderRadius: borderRadius.xl,
          padding: '2rem',
          maxWidth: '700px',
          width: '100%',
          boxShadow: theme.shadow.xl,
        }}
      >
        <h2 style={{
          fontSize: typography.fontSize.xl,
          fontWeight: typography.fontWeight.bold,
          color: theme.text.primary,
          marginBottom: '0.75rem',
          textAlign: 'center',
        }}>
          Édition de CV
        </h2>

        <p style={{
          fontSize: typography.fontSize.base,
          color: theme.text.secondary,
          lineHeight: typography.lineHeight.relaxed,
          marginBottom: '2rem',
          textAlign: 'center',
        }}>
          Comment souhaitez-vous commencer ?
        </p>

        <div style={{
          display: 'flex',
          gap: '1.5rem',
          marginBottom: '1.5rem',
        }}>
          <PathCard
            icon={<Icons.FileText />}
            title="J'ai déjà un CV"
            description="Analysez et améliorez votre CV existant avec notre coach IA."
            onClick={() => {
              onSelectPath('existing-cv');
              onClose();
            }}
          />
          <PathCard
            icon={<Icons.Rocket />}
            title="Je pars de zéro"
            description="Construisez votre CV étape par étape, guidé par notre assistant."
            onClick={() => {
              onSelectPath('from-scratch');
              onClose();
            }}
          />
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%',
            padding: '0.875rem',
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            backgroundColor: theme.bg.tertiary,
            color: theme.text.secondary,
            border: `1px solid ${theme.border.light}`,
            borderRadius: borderRadius.lg,
            cursor: 'pointer',
          }}
        >
          Annuler
        </button>
      </div>
    </div>
  );
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSelectPath,
  onOpenVault,
  onOpenHelp
}) => {
  const { theme, mode, toggleTheme } = useTheme();
  const [selectedTool, setSelectedTool] = useState<ToolType>(null);

  // Tools data
  const tools = [
    {
      id: 'cv' as ToolType,
      icon: <Icons.Briefcase size={40} />,
      title: 'CV & Portfolios',
      description: 'Créez des documents qui marquent les recruteurs.',
      colorKey: 'cv' as const,
      comingSoon: false,
    },
    {
      id: 'vault' as ToolType,
      icon: <Icons.Lock size={40} />,
      title: 'Coffre-Fort Pro',
      description: 'Stockez tous vos documents professionnels en sécurité.',
      colorKey: 'vault' as const,
      comingSoon: false,
    },
    {
      id: 'matching' as ToolType,
      icon: <Icons.Target size={40} />,
      title: 'Job Matching',
      description: 'Découvrez les postes qui correspondent à votre profil.',
      colorKey: 'matching' as const,
      comingSoon: false,
    },
    {
      id: 'linkedin' as ToolType,
      icon: <Icons.Linkedin size={40} />,
      title: 'LinkedIn Boost',
      description: 'Optimisez votre présence professionnelle en ligne.',
      colorKey: 'linkedin' as const,
      comingSoon: true,
    },
    {
      id: 'boutique' as ToolType,
      icon: <Icons.ShoppingBag size={40} />,
      title: 'Boutique',
      description: 'Templates premium et ressources professionnelles.',
      colorKey: 'boutique' as const,
      comingSoon: true,
    },
  ];

  const handleToolClick = (toolId: ToolType) => {
    if (toolId === 'cv') {
      setSelectedTool('cv');
    } else if (toolId === 'vault') {
      onOpenVault();
    } else {
      // Pour les autres outils, on peut afficher un message "Bientôt disponible"
      console.log(`Tool ${toolId} clicked - coming soon`);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: theme.bg.primary,
      fontFamily: typography.fontFamily.sans,
    },
    header: {
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: `1px solid ${theme.border.light}`,
    },
    logo: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      color: theme.text.primary,
      letterSpacing: '0.05em',
    },
    headerActions: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    headerButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      backgroundColor: 'transparent',
      border: `1px solid ${theme.border.light}`,
      borderRadius: borderRadius.lg,
      cursor: 'pointer',
      color: theme.text.secondary,
      fontSize: typography.fontSize.sm,
      transition: transitions.fast,
    },
    heroSection: {
      textAlign: 'center' as const,
      padding: '4rem 2rem 2rem',
      maxWidth: '800px',
      margin: '0 auto',
    },
    motto: {
      fontSize: typography.fontSize['3xl'],
      fontWeight: typography.fontWeight.bold,
      color: theme.text.primary,
      marginBottom: '1rem',
      lineHeight: typography.lineHeight.tight,
    },
    subtitle: {
      fontSize: typography.fontSize.lg,
      color: theme.text.secondary,
      marginBottom: '2rem',
      lineHeight: typography.lineHeight.relaxed,
    },
    privacySection: {
      padding: '3rem 2rem',
      backgroundColor: theme.bg.tertiary,
    },
    privacyCard: {
      maxWidth: '600px',
      margin: '0 auto',
      padding: '2rem',
      backgroundColor: theme.bg.secondary,
      borderRadius: borderRadius.xl,
      border: `1px solid ${theme.border.light}`,
      textAlign: 'center' as const,
    },
    privacyIcon: {
      width: '80px',
      height: '80px',
      margin: '0 auto 1.5rem',
      borderRadius: borderRadius.xl,
      backgroundColor: featureColors.privacy[mode === 'dark' ? 'darkBg' : 'bg'],
      color: featureColors.privacy[mode === 'dark' ? 'darkColor' : 'color'],
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    privacyTitle: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      color: theme.text.primary,
      marginBottom: '0.75rem',
    },
    privacyDescription: {
      fontSize: typography.fontSize.base,
      color: theme.text.secondary,
      lineHeight: typography.lineHeight.relaxed,
      marginBottom: '1.5rem',
    },
    privacyFeatures: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '1rem',
      marginTop: '1.5rem',
    },
    privacyFeature: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.5rem',
      fontSize: typography.fontSize.sm,
      color: theme.text.primary,
      textAlign: 'left' as const,
    },
    toolboxSection: {
      padding: '3rem 2rem',
    },
    toolboxHeader: {
      textAlign: 'center' as const,
      marginBottom: '2rem',
    },
    toolboxTitle: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: theme.text.primary,
      marginBottom: '0.5rem',
    },
    toolboxSubtitle: {
      fontSize: typography.fontSize.base,
      color: theme.text.secondary,
    },
    toolboxGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '1.5rem',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    trustSection: {
      padding: '2rem',
      display: 'flex',
      justifyContent: 'center',
      gap: '3rem',
    },
    trustItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontSize: typography.fontSize.sm,
      color: theme.text.secondary,
    },
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <span style={styles.logo}>SOUVERAIN</span>
        <div style={styles.headerActions}>
          <button onClick={onOpenHelp} style={styles.headerButton}>
            <Icons.Help />
            Aide
          </button>
          <button onClick={toggleTheme} style={{ ...styles.headerButton, padding: '0.5rem' }}>
            {mode === 'dark' ? <Icons.Sun /> : <Icons.Moon />}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section style={styles.heroSection}>
        <h1 style={styles.motto}>
          Votre carrière. Vos règles.
        </h1>
        <p style={styles.subtitle}>
          Créez, stockez et optimisez vos documents professionnels.<br />
          Reprenez le contrôle de votre trajectoire.
        </p>
      </section>

      {/* Privacy Section */}
      <section style={styles.privacySection}>
        <div style={styles.privacyCard}>
          <div style={styles.privacyIcon}>
            <Icons.Shield size={40} />
          </div>
          <h2 style={styles.privacyTitle}>Privacy First</h2>
          <p style={styles.privacyDescription}>
            Vos données restent les vôtres, anonymisées avant analyse.
          </p>
          <div style={styles.privacyFeatures}>
            <div style={styles.privacyFeature}>
              <span style={{ color: theme.semantic.success, flexShrink: 0, marginTop: '2px' }}>
                <Icons.Check />
              </span>
              Anonymisation automatique des données personnelles
            </div>
            <div style={styles.privacyFeature}>
              <span style={{ color: theme.semantic.success, flexShrink: 0, marginTop: '2px' }}>
                <Icons.Check />
              </span>
              Aucune donnée stockée sur nos serveurs
            </div>
            <div style={styles.privacyFeature}>
              <span style={{ color: theme.semantic.success, flexShrink: 0, marginTop: '2px' }}>
                <Icons.Check />
              </span>
              Chiffrement AES-256 pour le coffre-fort local
            </div>
            <div style={styles.privacyFeature}>
              <span style={{ color: theme.semantic.success, flexShrink: 0, marginTop: '2px' }}>
                <Icons.Check />
              </span>
              Conformité RGPD garantie
            </div>
          </div>
        </div>
      </section>

      {/* Toolbox Section */}
      <section style={styles.toolboxSection}>
        <div style={styles.toolboxHeader}>
          <h2 style={styles.toolboxTitle}>Boîte à outils</h2>
          <p style={styles.toolboxSubtitle}>Une suite complète d'outils pour gérer votre carrière</p>
        </div>

        <div style={styles.toolboxGrid}>
          {tools.map((tool) => (
            <ToolCard
              key={tool.id}
              icon={tool.icon}
              title={tool.title}
              description={tool.description}
              colorKey={tool.colorKey}
              comingSoon={tool.comingSoon}
              onClick={() => handleToolClick(tool.id)}
            />
          ))}
        </div>
      </section>

      {/* Trust Section */}
      <section style={styles.trustSection}>
        <div style={styles.trustItem}>
          <Icons.Shield />
          Données anonymisées
        </div>
        <div style={styles.trustItem}>
          <Icons.Zap />
          Analyse en moins de 10s
        </div>
        <div style={styles.trustItem}>
          <Icons.Check />
          100% personnalisé
        </div>
      </section>

      {/* CV Selection Modal */}
      <CVSelectionModal
        isOpen={selectedTool === 'cv'}
        onClose={() => setSelectedTool(null)}
        onSelectPath={onSelectPath}
      />

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 900px) {
          .toolbox-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 600px) {
          .toolbox-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default HomeScreen;
