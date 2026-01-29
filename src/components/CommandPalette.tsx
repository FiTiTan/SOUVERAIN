/**
 * SOUVERAIN - Command Palette
 * Navigation rapide par raccourcis clavier (Ctrl+K / Cmd+K)
 */

import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../ThemeContext';
import { typography, borderRadius, transitions, zIndex } from '../design-system';
import { useEscapeKey } from '../hooks/useKeyboardShortcut';
import type { ModuleId } from './Sidebar';

// ============================================================
// TYPES
// ============================================================

interface CommandItem {
  id: string;
  type: 'navigation' | 'action';
  label: string;
  icon: string;
  shortcut?: string;
  action: () => void;
}

// ============================================================
// ICONS
// ============================================================

const SearchIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

// ============================================================
// COMMAND PALETTE COMPONENT
// ============================================================

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (module: ModuleId) => void;
  onToggleTheme: () => void;
  onImportCV?: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onToggleTheme,
  onImportCV,
}) => {
  const { theme } = useTheme();
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fermer avec Escape
  useEscapeKey(onClose, isOpen);

  // Focus automatique sur l'input
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Reset search on close
  useEffect(() => {
    if (!isOpen) {
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Commandes disponibles
  const commands: CommandItem[] = [
    {
      id: 'nav-cv',
      type: 'navigation',
      label: 'CV Coach',
      icon: '📄',
      shortcut: '⌘+1',
      action: () => { onNavigate('cv'); onClose(); },
    },
    {
      id: 'nav-portfolio',
      type: 'navigation',
      label: 'Portfolio',
      icon: '📁',
      shortcut: '⌘+2',
      action: () => { onNavigate('portfolio'); onClose(); },
    },
    {
      id: 'nav-jobs',
      type: 'navigation',
      label: 'Job Match',
      icon: '🎯',
      shortcut: '⌘+3',
      action: () => { onNavigate('jobs'); onClose(); },
    },
    {
      id: 'nav-linkedin',
      type: 'navigation',
      label: 'LinkedIn',
      icon: '💼',
      shortcut: '⌘+4',
      action: () => { onNavigate('linkedin'); onClose(); },
    },
    {
      id: 'nav-vault',
      type: 'navigation',
      label: 'Coffre-Fort',
      icon: '🔒',
      shortcut: '⌘+5',
      action: () => { onNavigate('vault'); onClose(); },
    },
    {
      id: 'nav-shop',
      type: 'navigation',
      label: 'Boutique',
      icon: '🛒',
      shortcut: '⌘+6',
      action: () => { onNavigate('shop'); onClose(); },
    },
    {
      id: 'action-import',
      type: 'action',
      label: 'Importer un CV',
      icon: '📤',
      shortcut: '⌘+I',
      action: () => { onImportCV?.(); onClose(); },
    },
    {
      id: 'action-theme',
      type: 'action',
      label: 'Basculer thème',
      icon: '🌙',
      shortcut: '⌘+D',
      action: () => { onToggleTheme(); onClose(); },
    },
    {
      id: 'nav-settings',
      type: 'navigation',
      label: 'Paramètres',
      icon: '⚙️',
      shortcut: '⌘+,',
      action: () => { onNavigate('settings'); onClose(); },
    },
  ];

  // Filtrer les commandes selon la recherche
  const filteredCommands = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(search.toLowerCase())
  );

  // Navigation au clavier
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filteredCommands.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action();
      }
    }
  };

  // Regrouper par type
  const navigationCommands = filteredCommands.filter((cmd) => cmd.type === 'navigation');
  const actionCommands = filteredCommands.filter((cmd) => cmd.type === 'action');

  if (!isOpen) return null;

  const styles = {
    backdrop: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(20px)',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'center',
      paddingTop: '20vh',
      zIndex: zIndex.modal,
      transform: 'translate3d(0,0,0)', // Force GPU
    },
    palette: {
      backgroundColor: theme.bg.elevated,
      backdropFilter: 'blur(24px)',
      borderRadius: borderRadius['2xl'],
      width: '600px',
      maxWidth: '90vw',
      boxShadow: `${theme.shadow.xl}, 0 0 80px -20px ${theme.accent.primary}40`,
      border: `1px solid ${theme.border.light}`,
      overflow: 'hidden',
      transform: 'translate3d(0,0,0)', // Force GPU
    },
    searchBox: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '1rem 1.5rem',
      borderBottom: `1px solid ${theme.border.light}`,
    },
    searchIcon: {
      color: theme.text.tertiary,
      flexShrink: 0,
    },
    searchInput: {
      flex: 1,
      border: 'none',
      outline: 'none',
      backgroundColor: 'transparent',
      fontSize: typography.fontSize.base,
      color: theme.text.primary,
      fontFamily: typography.fontFamily.sans,
    },
    escHint: {
      fontSize: typography.fontSize.xs,
      color: theme.text.tertiary,
      padding: '0.25rem 0.5rem',
      backgroundColor: theme.bg.tertiary,
      borderRadius: borderRadius.sm,
      border: `1px solid ${theme.border.light}`,
    },
    results: {
      maxHeight: '400px',
      overflowY: 'auto' as const,
      padding: '0.5rem',
    },
    section: {
      marginBottom: '1rem',
    },
    sectionTitle: {
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text.tertiary,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      padding: '0.5rem 1rem',
    },
    commandItem: (selected: boolean) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '0.75rem 1rem',
      borderRadius: borderRadius.lg,
      cursor: 'pointer',
      transition: transitions.normal,
      backgroundColor: selected ? theme.accent.muted : 'transparent',
      border: selected ? `1px solid ${theme.accent.primary}40` : '1px solid transparent',
      transform: selected ? 'translateX(4px)' : 'translateX(0)',
      boxShadow: selected ? `0 4px 12px ${theme.accent.primary}20` : 'none',
      width: '100%',
      textAlign: 'left' as const,
    }),
    commandIcon: {
      fontSize: typography.fontSize.xl,
      flexShrink: 0,
    },
    commandLabel: {
      flex: 1,
      fontSize: typography.fontSize.sm,
      color: theme.text.primary,
    },
    commandShortcut: {
      fontSize: typography.fontSize.xs,
      color: theme.text.tertiary,
      padding: '0.25rem 0.5rem',
      backgroundColor: theme.bg.tertiary,
      borderRadius: borderRadius.sm,
      border: `1px solid ${theme.border.light}`,
      fontFamily: typography.fontFamily.mono,
    },
    empty: {
      padding: '2rem',
      textAlign: 'center' as const,
      color: theme.text.tertiary,
      fontSize: typography.fontSize.sm,
    },
  };

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={styles.palette} onClick={(e) => e.stopPropagation()}>
        {/* Search input */}
        <div style={styles.searchBox}>
          <div style={styles.searchIcon}>
            <SearchIcon />
          </div>
          <input
            ref={inputRef}
            type="text"
            placeholder="Rechercher ou naviguer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            style={styles.searchInput}
          />
          <div style={styles.escHint}>ESC</div>
        </div>

        {/* Results */}
        <div style={styles.results}>
          {filteredCommands.length === 0 ? (
            <div style={styles.empty}>Aucun résultat trouvé</div>
          ) : (
            <>
              {navigationCommands.length > 0 && (
                <div style={styles.section}>
                  <div style={styles.sectionTitle}>Navigation</div>
                  {navigationCommands.map((cmd, idx) => {
                    const globalIndex = filteredCommands.indexOf(cmd);
                    return (
                      <button
                        key={cmd.id}
                        style={styles.commandItem(selectedIndex === globalIndex)}
                        onClick={cmd.action}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                      >
                        <span style={styles.commandIcon}>{cmd.icon}</span>
                        <span style={styles.commandLabel}>{cmd.label}</span>
                        {cmd.shortcut && (
                          <span style={styles.commandShortcut}>{cmd.shortcut}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {actionCommands.length > 0 && (
                <div style={styles.section}>
                  <div style={styles.sectionTitle}>Actions</div>
                  {actionCommands.map((cmd, idx) => {
                    const globalIndex = filteredCommands.indexOf(cmd);
                    return (
                      <button
                        key={cmd.id}
                        style={styles.commandItem(selectedIndex === globalIndex)}
                        onClick={cmd.action}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                      >
                        <span style={styles.commandIcon}>{cmd.icon}</span>
                        <span style={styles.commandLabel}>{cmd.label}</span>
                        {cmd.shortcut && (
                          <span style={styles.commandShortcut}>{cmd.shortcut}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
