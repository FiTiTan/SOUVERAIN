/**
 * SOUVERAIN - Shell Layout
 * Layout principal avec Sidebar + Content + Command Palette
 */

import React, { useState, type ReactNode } from 'react';
import { useTheme } from '../ThemeContext';
import { Sidebar, type ModuleId } from './Sidebar';
import { CommandPalette } from './CommandPalette';
import { Settings } from './Settings';
import { VaultModule } from './VaultModule';
import { PortfolioHub } from './portfolio/PortfolioHub';
import { useCtrlKey } from '../hooks/useKeyboardShortcut';
import { typography, borderRadius } from '../design-system';
import { Tag } from './ui';

// ============================================================
// TYPES
// ============================================================

interface ShellProps {
  children: ReactNode;
  onShowTutorial?: () => void;
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

export const Shell: React.FC<ShellProps> = ({ children, onShowTutorial }) => {
  const { theme, toggleTheme } = useTheme();
  const [activeModule, setActiveModule] = useState<ModuleId>('cv');
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
  useCtrlKey(',', () => setActiveModule('settings'));

  const handleNavigate = (module: ModuleId) => {
    setActiveModule(module);
  };

  const handleImportCV = () => {
    setActiveModule('cv');
    // L'import sera géré par le composant CV Coach lui-même
  };

  const styles = {
    shell: {
      display: 'flex',
      height: '100vh',
      backgroundColor: theme.bg.primary,
      fontFamily: typography.fontFamily.sans,
      overflow: 'hidden',
    },
    content: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column' as const,
      overflow: 'hidden',
    },
    header: {
      padding: '1rem 2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: `1px solid ${theme.border.light}`,
      backgroundColor: theme.bg.primary,
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
  };

  // Rendu du contenu selon le module actif
  const renderContent = () => {
    switch (activeModule) {
      case 'cv':
        // Le contenu CV Coach sera injecté ici
        return children;

      case 'portfolio':
        return <PortfolioHub />;

      case 'jobs':
        return (
          <ModulePlaceholder
            title="Job Match"
            description="Trouvez les opportunités qui correspondent à votre profil. Cette fonctionnalité arrive bientôt !"
            onBack={() => setActiveModule('cv')}
          />
        );

      case 'linkedin':
        return (
          <ModulePlaceholder
            title="LinkedIn Optimizer"
            description="Optimisez votre profil LinkedIn avec l'IA. Cette fonctionnalité arrive bientôt !"
            onBack={() => setActiveModule('cv')}
          />
        );

      case 'vault':
        return <VaultModule />;

      case 'shop':
        return (
          <ModulePlaceholder
            title="Boutique"
            description="Découvrez nos services premium. Cette fonctionnalité arrive bientôt !"
            onBack={() => setActiveModule('cv')}
          />
        );

      case 'settings':
        return <Settings onShowTutorial={onShowTutorial} />;

      default:
        return children;
    }
  };

  // Déterminer le titre du module pour le header
  const getModuleLabel = (): string => {
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
  };

  return (
    <div style={styles.shell}>
      {/* Sidebar */}
      <Sidebar activeModule={activeModule} onNavigate={handleNavigate} />

      {/* Main Content */}
      <div style={styles.content}>
        {/* Header */}
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <span style={styles.logo}>SOUVERAIN</span>
            <Tag variant="accent" size="sm">
              {getModuleLabel()}
            </Tag>
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
              onClick={() => setShowCommandPalette(true)}
            >
              ⌘K
            </span>
          </div>
        </header>

        {/* Content Area */}
        <main style={styles.main}>{renderContent()}</main>
      </div>

      {/* Command Palette */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onNavigate={handleNavigate}
        onToggleTheme={toggleTheme}
        onImportCV={handleImportCV}
      />

      {/* Global styles */}
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        button:hover { filter: brightness(1.05); }
        button:active { transform: scale(0.98); }
      `}</style>
    </div>
  );
};
