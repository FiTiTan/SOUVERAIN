/**
 * SOUVERAIN - HomeScreen CALM-UI
 * Écran d'accueil avec design CALM complet : glassmorphisme, CalmCard, animations
 * Version migrée depuis HomeScreen.tsx original
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../ThemeContext';
import { typography, borderRadius, transitions } from '../design-system';
import { CalmCard } from './ui/CalmCard';
import { CalmModal } from './ui/CalmModal';

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
// ICONS
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
  Help: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  Check: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Zap: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" opacity="0.3"/>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" fill="none" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
};

// Feature Icons (Emojis pour simplicité)
const FeatureIcons = {
  briefcase: '💼',
  lock: '🔒',
  target: '🎯',
  linkedin: '🔗',
  shop: '🛍️',
  shield: '🛡️',
  fileText: '📄',
  rocket: '🚀',
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
  const [showCVModal, setShowCVModal] = useState(false);

  // Tools configuration
  const tools = [
    {
      id: 'cv' as ToolType,
      icon: FeatureIcons.briefcase,
      title: 'CV & Portfolios',
      description: 'Créez des documents qui marquent les recruteurs.',
      themeColor: 'purple' as const,
      comingSoon: false,
    },
    {
      id: 'vault' as ToolType,
      icon: FeatureIcons.lock,
      title: 'Coffre-Fort Pro',
      description: 'Stockez tous vos documents professionnels en sécurité.',
      themeColor: 'blue' as const,
      comingSoon: false,
    },
    {
      id: 'matching' as ToolType,
      icon: FeatureIcons.target,
      title: 'Job Matching',
      description: 'Découvrez les postes qui correspondent à votre profil.',
      themeColor: 'orange' as const,
      comingSoon: false,
    },
    {
      id: 'linkedin' as ToolType,
      icon: FeatureIcons.linkedin,
      title: 'LinkedIn Boost',
      description: 'Optimisez votre présence professionnelle en ligne.',
      themeColor: 'teal' as const,
      comingSoon: true,
    },
    {
      id: 'boutique' as ToolType,
      icon: FeatureIcons.shop,
      title: 'Boutique',
      description: 'Templates premium et ressources professionnelles.',
      themeColor: 'pink' as const,
      comingSoon: true,
    },
  ];

  const handleToolClick = (toolId: ToolType) => {
    if (toolId === 'cv') {
      setShowCVModal(true);
    } else if (toolId === 'vault') {
      onOpenVault();
    } else {
      console.log(`Tool ${toolId} - coming soon`);
    }
  };

  const handleSelectPath = (path: UserPath) => {
    setShowCVModal(false);
    onSelectPath(path);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: mode === 'dark'
        ? 'linear-gradient(135deg, #0f1729 0%, #1a1f35 100%)'
        : 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      fontFamily: typography.fontFamily.sans,
    }}>
      {/* Header avec Glassmorphisme */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: mode === 'dark'
            ? 'rgba(30, 41, 59, 0.6)'
            : 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${theme.border.light}`,
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <motion.span
          whileHover={{ scale: 1.05 }}
          style={{
            fontSize: typography.fontSize.xl,
            fontWeight: typography.fontWeight.bold,
            color: theme.text.primary,
            letterSpacing: '0.05em',
            cursor: 'default',
          }}
        >
          SOUVERAIN
        </motion.span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onOpenHelp}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: 'transparent',
              border: `1px solid ${theme.border.light}`,
              borderRadius: borderRadius.lg,
              cursor: 'pointer',
              color: theme.text.secondary,
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              transition: transitions.fast,
            }}
          >
            <Icons.Help />
            Aide
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, rotate: 180 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.5rem',
              background: 'transparent',
              border: `1px solid ${theme.border.light}`,
              borderRadius: borderRadius.lg,
              cursor: 'pointer',
              color: theme.text.secondary,
              transition: transitions.fast,
            }}
          >
            {mode === 'dark' ? <Icons.Sun /> : <Icons.Moon />}
          </motion.button>
        </div>
      </motion.header>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        style={{
          textAlign: 'center',
          padding: '4rem 2rem 3rem',
          maxWidth: '800px',
          margin: '0 auto',
        }}
      >
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{
            fontSize: typography.fontSize['4xl'],
            fontWeight: typography.fontWeight.bold,
            color: theme.text.primary,
            marginBottom: '1rem',
            lineHeight: typography.lineHeight.tight,
            letterSpacing: '-0.02em',
          }}
        >
          Votre carrière. Vos règles.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{
            fontSize: typography.fontSize.lg,
            color: theme.text.secondary,
            marginBottom: '2rem',
            lineHeight: typography.lineHeight.relaxed,
          }}
        >
          Créez, stockez et optimisez vos documents professionnels.<br />
          Reprenez le contrôle de votre trajectoire.
        </motion.p>
      </motion.section>

      {/* Privacy Section avec Glassmorphisme */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        style={{
          padding: '2rem',
          maxWidth: '700px',
          margin: '0 auto 4rem',
        }}
      >
        <div style={{
          padding: '2.5rem',
          background: mode === 'dark'
            ? 'rgba(30, 41, 59, 0.5)'
            : 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(24px)',
          borderRadius: borderRadius['2xl'],
          border: `1px solid ${theme.border.light}`,
          boxShadow: theme.shadow.lg,
          textAlign: 'center',
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            margin: '0 auto 1.5rem',
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${theme.semantic.successBg}, rgba(34, 197, 94, 0.1))`,
            border: `1px solid ${theme.semantic.success}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2.5rem',
          }}>
            {FeatureIcons.shield}
          </div>

          <h2 style={{
            fontSize: typography.fontSize['2xl'],
            fontWeight: typography.fontWeight.bold,
            color: theme.text.primary,
            marginBottom: '0.75rem',
          }}>
            Privacy First
          </h2>

          <p style={{
            fontSize: typography.fontSize.base,
            color: theme.text.secondary,
            lineHeight: typography.lineHeight.relaxed,
            marginBottom: '2rem',
          }}>
            Vos données restent les vôtres, anonymisées avant analyse.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '1rem',
            textAlign: 'left',
          }}>
            {[
              'Anonymisation automatique des données personnelles',
              'Aucune donnée stockée sur nos serveurs',
              'Chiffrement AES-256 pour le coffre-fort local',
              'Conformité RGPD garantie'
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.6 + idx * 0.1 }}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  fontSize: typography.fontSize.sm,
                  color: theme.text.primary,
                }}
              >
                <span style={{
                  color: theme.semantic.success,
                  flexShrink: 0,
                  marginTop: '2px'
                }}>
                  <Icons.Check />
                </span>
                {feature}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Toolbox Section avec CalmCards */}
      <section style={{
        padding: '2rem',
        maxWidth: '1400px',
        margin: '0 auto',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          style={{
            textAlign: 'center',
            marginBottom: '3rem',
          }}
        >
          <h2 style={{
            fontSize: typography.fontSize['3xl'],
            fontWeight: typography.fontWeight.bold,
            color: theme.text.primary,
            marginBottom: '0.5rem',
            letterSpacing: '-0.02em',
          }}>
            Boîte à outils
          </h2>
          <p style={{
            fontSize: typography.fontSize.base,
            color: theme.text.secondary,
          }}>
            Une suite complète d'outils pour gérer votre carrière
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1.5rem',
            justifyContent: 'center',
          }}
        >
          {tools.map((tool, idx) => (
            <motion.div
              key={tool.id}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.5,
                    delay: 0.8 + idx * 0.1
                  }
                }
              }}
            >
              <CalmCard
                title={tool.title}
                description={tool.description}
                icon={tool.icon}
                themeColor={tool.themeColor}
                disabled={tool.comingSoon}
                onClick={() => !tool.comingSoon && handleToolClick(tool.id)}
              >
                {tool.comingSoon && (
                  <div style={{
                    marginTop: '1rem',
                    padding: '0.5rem 1rem',
                    background: theme.semantic.warningBg,
                    color: theme.semantic.warning,
                    borderRadius: borderRadius.full,
                    fontSize: typography.fontSize.xs,
                    fontWeight: typography.fontWeight.semibold,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>
                    Bientôt disponible
                  </div>
                )}
              </CalmCard>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Trust Badges */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.2 }}
        style={{
          padding: '3rem 2rem',
          display: 'flex',
          justifyContent: 'center',
          gap: '3rem',
          flexWrap: 'wrap',
        }}
      >
        {[
          { icon: FeatureIcons.shield, text: 'Données anonymisées' },
          { icon: FeatureIcons.target, text: 'Analyse en moins de 10s' },
          { icon: '✓', text: '100% personnalisé' }
        ].map((badge, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.05 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: typography.fontSize.sm,
              color: theme.text.secondary,
              fontWeight: typography.fontWeight.medium,
            }}
          >
            <span style={{ fontSize: '1.25rem' }}>{badge.icon}</span>
            {badge.text}
          </motion.div>
        ))}
      </motion.section>

      {/* CV Selection Modal avec CalmModal */}
      <CalmModal
        isOpen={showCVModal}
        onClose={() => setShowCVModal(false)}
        title="Édition de CV"
      >
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
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          <CalmCard
            title="J'ai déjà un CV"
            description="Analysez et améliorez votre CV existant avec notre coach IA."
            icon={FeatureIcons.fileText}
            themeColor="blue"
            onClick={() => handleSelectPath('existing-cv')}
            style={{ maxWidth: '300px' }}
          />

          <CalmCard
            title="Je pars de zéro"
            description="Construisez votre CV étape par étape, guidé par notre assistant."
            icon={FeatureIcons.rocket}
            themeColor="purple"
            recommended
            onClick={() => handleSelectPath('from-scratch')}
            style={{ maxWidth: '300px' }}
          />
        </div>
      </CalmModal>
    </div>
  );
};

export default HomeScreen;
