/**
 * SOUVERAIN - Shell Layout
 * Layout principal avec Sidebar + Content + Command Palette
 */

import React, { useState, useMemo, useCallback, Suspense, lazy, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../ThemeContext';
import { Sidebar, type ModuleId } from './Sidebar';
import { CommandPalette } from './CommandPalette';
import { Settings } from './Settings';
import { useCtrlKey } from '../hooks/useKeyboardShortcut';
import { typography, borderRadius } from '../design-system';

// ============================================================
// LAZY LOADED MODULES (Performance Optimization - Phase 1)
// ============================================================
const VaultModule = lazy(() => import('./VaultModule').then(m => ({ default: m.VaultModule })));
const PortfolioHub = lazy(() => import('./portfolio/PortfolioHub').then(m => ({ default: m.PortfolioHub })));
const JobMatchingModule = lazy(() => import('./job-matching/JobMatchingModule').then(m => ({ default: m.JobMatchingModule })));
const LinkedInCoachModule = lazy(() => import('./linkedin-coach/LinkedInCoachModule').then(m => ({ default: m.LinkedInCoachModule })));

// ============================================================
// TYPES
// ============================================================

interface ShellProps {
  children: ReactNode;
  onShowTutorial?: () => void;
  pageTitle?: string | null;
  onResetModule?: () => void;
}

// ============================================================
// MODULE PLACEHOLDERS
// ============================================================

const ModulePlaceholder: React.FC<{ title: string; description: string; onBack: () => void }> = ({
  title,
  description,
  onBack,
}) => {
  const { theme } = useTheme();

  const styles = useMemo(() => ({
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
  }), [theme]);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>{title}</h1>
      <p style={styles.description}>{description}</p>
      <button style={styles.button} onClick={onBack}>
        Retour au CV Coach
      </button>
    </div>
  );
};

// ============================================================
// SHELL COMPONENT
// ============================================================

export const Shell: React.FC<ShellProps> = ({ children, onShowTutorial, pageTitle, onResetModule }) => {
  const { theme, toggleTheme, mode } = useTheme();
  const [activeModule, setActiveModule] = useState<ModuleId>('cv');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);

  // Ctrl+K / Cmd+K pour ouvrir la command palette
  useCtrlKey('k', () => setShowCommandPalette(true));

  // Raccourcis de navigation (⌘+1 à ⌘+6)
  useCtrlKey('1', () => setActiveModule('cv'));
  useCtrlKey('2', () => setActiveModule('portfolio'));
  useCtrlKey('3', () => setActiveModule('jobs'));
  useCtrlKey('4', () => setActiveModule('linkedin'));
  useCtrlKey('5', () => setActiveModule('vault'));
  useCtrlKey('6', () => setActiveModule('shop'));

  // Autres raccourcis
  useCtrlKey('d', toggleTheme);
  useCtrlKey(',', () => setShowSettingsModal(true));

  const handleNavigate = useCallback((module: ModuleId) => {
    if (module === 'settings') {
      setShowSettingsModal(true);
    } else {
      setActiveModule(module);
    }
  }, []);

  const handleImportCV = useCallback(() => {
    setActiveModule('cv');
    // L'import sera géré par le composant CV Coach lui-même
  }, []);

  const styles = useMemo(() => ({
    shell: {
      display: 'flex',
      height: '100vh',
      background: mode === 'dark'
        ? '#0f1729' // Deep dark blue
        : '#f8fafc', // Clean slate 50

      fontFamily: typography.fontFamily.sans,
      overflow: 'hidden',
      color: theme.text.primary,
    },
    content: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column' as const,
      overflow: 'hidden',
      position: 'relative' as const,
      zIndex: 1,
    },
    header: {
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: `1px solid ${theme.border.light}`,
      background: mode === 'dark'
        ? 'rgba(30, 41, 59, 0.6)'
        : 'rgba(255, 255, 255, 0.7)',
      backdropFilter: 'blur(20px)',
      position: 'sticky' as const,
      top: 0,
      zIndex: 100,
      flexShrink: 0,
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    logo: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      color: theme.text.primary,
      letterSpacing: '0.05em',
    },
    main: {
      flex: 1,
      overflow: 'auto',
      padding: '0.5rem', // Espace pour que les box-shadows ne soient pas coupées
    },
    headerRight: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    tutorialButton: {
      width: '32px',
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.bg.tertiary,
      border: `1px solid ${theme.border.light}`,
      borderRadius: borderRadius.lg,
      cursor: 'pointer',
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.bold,
      color: theme.text.secondary,
      transition: 'all 150ms ease',
    },
  }), [theme, mode]);

  // Loading fallback pour lazy loading
  const LoadingFallback = useMemo(() => (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      color: theme.text.secondary,
      fontSize: typography.fontSize.sm,
    }}>
      Chargement...
    </div>
  ), [theme]);

  // Rendu du contenu selon le module actif
  const renderContent = () => {
    switch (activeModule) {
      case 'cv':
        // Le contenu CV Coach sera injecté ici
        return children;

      case 'portfolio':
        return (
          <Suspense fallback={LoadingFallback}>
            <PortfolioHub />
          </Suspense>
        );

      case 'jobs':
        return (
          <Suspense fallback={LoadingFallback}>
            <JobMatchingModule />
          </Suspense>
        );

      case 'linkedin':
        return (
          <Suspense fallback={LoadingFallback}>
            <LinkedInCoachModule />
          </Suspense>
        );

      case 'vault':
        return (
          <Suspense fallback={LoadingFallback}>
            <VaultModule />
          </Suspense>
        );

      case 'shop':
        return (
          <ModulePlaceholder
            title="Boutique"
            description="Découvrez nos services premium. Cette fonctionnalité arrive bientôt !"
            onBack={() => setActiveModule('cv')}
          />
        );

      // Settings is now a modal, no longer a page content
      case 'settings':
         return children; // Fallback to current content if triggered? Or maybe null? But activeModule should not be settings.


      default:
        return children;
    }
  };

  // Déterminer le titre du module pour le header
  const getModuleLabel = useCallback((): string => {
    const labels: Record<ModuleId, string> = {
      cv: 'Coach CV',
      portfolio: 'Portfolio',
      jobs: 'Job Match',
      linkedin: 'LinkedIn',
      vault: 'Coffre-Fort',
      shop: 'Boutique',
      settings: 'Paramètres',
    };
    return labels[activeModule];
  }, [activeModule]);

  const handleModuleReset = useCallback(() => {
    handleNavigate(activeModule);
    if (activeModule === 'cv' && onResetModule) onResetModule();
  }, [activeModule, handleNavigate, onResetModule]);

  const handleCommandPaletteOpen = useCallback(() => {
    setShowCommandPalette(true);
  }, []);

  const handleCommandPaletteClose = useCallback(() => {
    setShowCommandPalette(false);
  }, []);

  const handleSettingsClose = useCallback(() => {
    setShowSettingsModal(false);
  }, []);

  return (
    <div style={styles.shell}>
      {/* Background Ambient Orbs (Critical for Glassmorphism) */}
      {/* Background Ambient Orbs (Optimized: Radial Gradient instead of Blur Filter) */}
      <div style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        zIndex: 0,
        pointerEvents: 'none',
        transform: 'translate3d(0,0,0)', // Keep GPU layer
        background: mode === 'dark'
          ? `
            radial-gradient(circle at 15% 15%, rgba(76, 29, 149, 0.15) 0%, transparent 40%),
            radial-gradient(circle at 85% 85%, rgba(15, 118, 110, 0.15) 0%, transparent 40%)
          `
          : `
            radial-gradient(circle at 15% 15%, rgba(59, 130, 246, 0.12) 0%, transparent 40%),
            radial-gradient(circle at 85% 85%, rgba(20, 184, 166, 0.12) 0%, transparent 40%)
          `
      }} />

      {/* Sidebar */}
      <Sidebar activeModule={activeModule} onNavigate={handleNavigate} pageTitle={pageTitle || undefined} />

      {/* Main Content */}
      <div style={styles.content}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.headerLeft}>
             {/* BREADCRUMB NAVIGATION */}
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {/* Module Root (Clickable) */}
                <button
                  onClick={handleModuleReset}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    fontSize: typography.fontSize.base, // Fixed: was normal
                    fontWeight: 500,
                    color: theme.text.secondary, 
                    transition: 'color 0.2s',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = theme.text.primary}
                  onMouseLeave={(e) => e.currentTarget.style.color = theme.text.secondary}
                >
                  {getModuleLabel()}
                </button>

                {/* SubPage Title - Only show passed title if in CV module */}
                <AnimatePresence mode="wait">
                  {pageTitle && activeModule === 'cv' && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -5 }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                        <span style={{ color: theme.text.tertiary }}>/</span>
                        <span style={{ 
                            fontSize: typography.fontSize.base, // Fixed: was normal
                            fontWeight: 600, 
                            color: theme.text.primary,
                            whiteSpace: 'nowrap'
                        }}>
                            {pageTitle}
                        </span>
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>
          </div>
          <div style={styles.headerRight}>
            {/* Tutorial button */}
            {onShowTutorial && (
              <button
                style={styles.tutorialButton}
                onClick={onShowTutorial}
                title="Revoir le tutoriel"
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.accent.primary;
                  e.currentTarget.style.color = '#FFFFFF';
                  e.currentTarget.style.borderColor = theme.accent.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.bg.tertiary;
                  e.currentTarget.style.color = theme.text.secondary;
                  e.currentTarget.style.borderColor = theme.border.light;
                }}
              >
                ?
              </button>
            )}

            {/* Keyboard shortcut hint */}
            <span
              style={{
                fontSize: typography.fontSize.xs,
                color: theme.text.tertiary,
                padding: '0.25rem 0.5rem',
                backgroundColor: theme.bg.tertiary,
                borderRadius: borderRadius.sm,
                border: `1px solid ${theme.border.light}`,
                fontFamily: typography.fontFamily.mono,
                cursor: 'pointer',
              }}
              onClick={handleCommandPaletteOpen}
            >
              ⌘K
            </span>
          </div>
        </header>

        {/* Content Area */}
        <main style={styles.main}>
            {renderContent()}
        </main>
      </div>

      {/* Command Palette */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={handleCommandPaletteClose}
        onNavigate={handleNavigate}
        onToggleTheme={toggleTheme}
        onImportCV={handleImportCV}
      />

      {/* MODALS */}
      <Settings
        isOpen={showSettingsModal}
        onClose={handleSettingsClose}
        onShowTutorial={onShowTutorial}
      />

      {/* Global styles */}
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { 
          background-color: ${mode === 'dark' ? '#0f1729' : '#f8fafc'} !important;
          overscroll-behavior: none;
        }
        button:hover { filter: brightness(1.05); }
        button:active { transform: scale(0.98); }
      `}</style>
    </div>
  );
};
