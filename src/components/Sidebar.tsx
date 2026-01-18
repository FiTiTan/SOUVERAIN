/**
 * SOUVERAIN - Sidebar Navigation
 * Navigation principale avec collapse/expand
 */

import React, { useState } from 'react';
import { useTheme } from '../ThemeContext';
import { typography, borderRadius, transitions } from '../design-system';
import { PrivacyBadge, PrivacyModal } from './PrivacyBadge';

// ============================================================
// TYPES
// ============================================================

export type ModuleId = 'cv' | 'portfolio' | 'jobs' | 'linkedin' | 'vault' | 'shop' | 'settings';

interface Module {
  id: ModuleId;
  label: string;
  icon: React.FC;
  route: string;
  colorKey: keyof typeof moduleColors;
}

// ============================================================
// MODULE COLORS (from HomeScreen.tsx)
// ============================================================

const moduleColors = {
  cv: { bg: '#F3E8FF', color: '#9333EA', darkBg: '#3B0764', darkColor: '#C084FC' },
  portfolio: { bg: '#DBEAFE', color: '#2563EB', darkBg: '#1E3A5F', darkColor: '#60A5FA' },
  jobs: { bg: '#FFEDD5', color: '#EA580C', darkBg: '#431407', darkColor: '#FB923C' },
  linkedin: { bg: '#DBEAFE', color: '#0077B5', darkBg: '#1E3A5F', darkColor: '#38BDF8' },
  vault: { bg: '#DCFCE7', color: '#16A34A', darkBg: '#14532D', darkColor: '#4ADE80' },
  shop: { bg: '#FCE7F3', color: '#DB2777', darkBg: '#500724', darkColor: '#F472B6' },
};

// ============================================================
// ICONS
// ============================================================

const Icons = {
  FileText: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  Briefcase: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  Target: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
  Linkedin: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  ),
  Lock: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  ShoppingBag: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  ),
  Settings: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  Menu: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  ChevronLeft: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  ),
};

// ============================================================
// MODULES
// ============================================================

const MODULES: Module[] = [
  { id: 'cv', label: 'CV Coach', icon: Icons.FileText, route: '/cv', colorKey: 'cv' },
  { id: 'portfolio', label: 'Portfolio', icon: Icons.Briefcase, route: '/portfolio', colorKey: 'portfolio' },
  { id: 'jobs', label: 'Job Match', icon: Icons.Target, route: '/jobs', colorKey: 'jobs' },
  { id: 'linkedin', label: 'LinkedIn', icon: Icons.Linkedin, route: '/linkedin', colorKey: 'linkedin' },
  { id: 'vault', label: 'Coffre-Fort', icon: Icons.Lock, route: '/vault', colorKey: 'vault' },
  { id: 'shop', label: 'Boutique', icon: Icons.ShoppingBag, route: '/shop', colorKey: 'shop' },
];

// ============================================================
// SIDEBAR COMPONENT
// ============================================================

interface SidebarProps {
  activeModule: ModuleId;
  onNavigate: (module: ModuleId) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeModule, onNavigate }) => {
  const { theme, mode } = useTheme();

  // Persister l'état collapse dans localStorage
  const [collapsed, setCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar_collapsed');
    return saved === 'true';
  });

  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const toggleCollapse = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem('sidebar_collapsed', String(newState));
  };

  // Helper pour obtenir les couleurs d'un module
  const getModuleColor = (colorKey: keyof typeof moduleColors) => {
    const colors = moduleColors[colorKey];
    return {
      bg: mode === 'dark' ? colors.darkBg : colors.bg,
      color: mode === 'dark' ? colors.darkColor : colors.color,
    };
  };

  const styles = {
    sidebar: {
      width: collapsed ? '64px' : '200px',
      height: '100vh',
      backgroundColor: theme.bg.secondary,
      borderRight: `1px solid ${theme.border.light}`,
      display: 'flex',
      flexDirection: 'column' as const,
      transition: transitions.normal,
      flexShrink: 0,
    },
    header: {
      padding: '1rem',
      borderBottom: `1px solid ${theme.border.light}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: collapsed ? 'center' : 'space-between',
    },
    logo: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.bold,
      color: theme.text.primary,
      letterSpacing: '0.05em',
      whiteSpace: 'nowrap' as const,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    toggleButton: {
      width: '32px',
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      border: `1px solid ${theme.border.light}`,
      borderRadius: borderRadius.md,
      cursor: 'pointer',
      color: theme.text.secondary,
      transition: transitions.fast,
    },
    nav: {
      flex: 1,
      padding: '1rem 0.5rem',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.5rem',
      overflowY: 'auto' as const,
    },
    navItem: (active: boolean, moduleColors?: { bg: string; color: string }) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: collapsed ? '0.75rem' : '0.75rem 1rem',
      borderRadius: borderRadius.lg,
      cursor: 'pointer',
      transition: transitions.fast,
      backgroundColor: active && moduleColors ? moduleColors.bg : 'transparent',
      color: active && moduleColors ? moduleColors.color : theme.text.secondary,
      fontWeight: active ? typography.fontWeight.medium : typography.fontWeight.normal,
      fontSize: typography.fontSize.sm,
      border: 'none',
      textAlign: 'left' as const,
      justifyContent: collapsed ? 'center' : 'flex-start',
      whiteSpace: 'nowrap' as const,
      overflow: 'hidden',
    }),
    footer: {
      padding: '1rem 0.5rem',
      borderTop: `1px solid ${theme.border.light}`,
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.5rem',
    },
  };

  return (
    <>
      <aside style={styles.sidebar}>
        {/* Header with toggle */}
        <div style={styles.header}>
          {!collapsed && <span style={styles.logo}>SOUVERAIN</span>}
          <button
            style={styles.toggleButton}
            onClick={toggleCollapse}
            title={collapsed ? "Agrandir" : "Réduire"}
          >
            {collapsed ? <Icons.Menu /> : <Icons.ChevronLeft />}
          </button>
        </div>

        {/* Navigation */}
        <nav style={styles.nav}>
          {MODULES.map((module) => {
            const isActive = activeModule === module.id;
            const colors = isActive ? getModuleColor(module.colorKey) : undefined;
            return (
              <button
                key={module.id}
                style={styles.navItem(isActive, colors)}
                onClick={() => onNavigate(module.id)}
                title={collapsed ? module.label : undefined}
              >
                <module.icon />
                {!collapsed && <span>{module.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={styles.footer}>
          <PrivacyBadge
            collapsed={collapsed}
            onClick={() => setShowPrivacyModal(true)}
          />
          <button
            style={styles.navItem(activeModule === 'settings')}
            onClick={() => onNavigate('settings')}
            title={collapsed ? "Paramètres" : undefined}
          >
            <Icons.Settings />
            {!collapsed && <span>Paramètres</span>}
          </button>
        </div>
      </aside>

      {/* Privacy Modal */}
      {showPrivacyModal && (
        <PrivacyModal onClose={() => setShowPrivacyModal(false)} />
      )}
    </>
  );
};
