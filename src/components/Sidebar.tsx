/**
 * SOUVERAIN - Sidebar Navigation
 * Architecture "Mechanical Curtain" (Rideau Mécanique)
 * - Header: Breadcrumb (Fil d'Ariane) "Module / Page"
 * - Navigation: Boutons Pillules
 * - Footer: Privacy & Settings
 */

import React, { useState, useMemo, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../ThemeContext';
import { typography, borderRadius, transitions } from '../design-system';
import { PrivacyBadge, PrivacyModal } from './PrivacyBadge';

// ============================================================
// DATA
// ============================================================

export type ModuleId = 'cv' | 'portfolio' | 'jobs' | 'linkedin' | 'vault' | 'shop' | 'settings';

interface Module {
  id: ModuleId;
  label: string;
  icon: React.FC;
  colorKey: keyof typeof moduleColors;
}

const moduleColors = {
  cv: { bg: '#F3E8FF', color: '#9333EA', darkBg: '#3B0764', darkColor: '#C084FC' },
  portfolio: { bg: '#DBEAFE', color: '#2563EB', darkBg: '#1E3A5F', darkColor: '#60A5FA' },
  jobs: { bg: '#FFEDD5', color: '#EA580C', darkBg: '#431407', darkColor: '#FB923C' },
  linkedin: { bg: '#DBEAFE', color: '#0077B5', darkBg: '#1E3A5F', darkColor: '#38BDF8' },
  vault: { bg: '#DCFCE7', color: '#16A34A', darkBg: '#14532D', darkColor: '#4ADE80' },
  shop: { bg: '#FCE7F3', color: '#DB2777', darkBg: '#500724', darkColor: '#F472B6' },
};

const Icons = {
  FileText: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
  Briefcase: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>,
  Target: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>,
  Linkedin: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect x="2" y="9" width="4" height="12" /><circle cx="4" cy="4" r="2" /></svg>,
  Lock: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>,
  ShoppingBag: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>,
  Settings: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>,
  Menu: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" /></svg>,
  ChevronLeft: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>,
};

const MODULES: Module[] = [
  { id: 'cv', label: 'CV Coach', icon: Icons.FileText, colorKey: 'cv' },
  { id: 'portfolio', label: 'Portfolio', icon: Icons.Briefcase, colorKey: 'portfolio' },
  { id: 'jobs', label: 'Job Match', icon: Icons.Target, colorKey: 'jobs' },
  { id: 'linkedin', label: 'LinkedIn', icon: Icons.Linkedin, colorKey: 'linkedin' },
  { id: 'vault', label: 'Coffre-Fort', icon: Icons.Lock, colorKey: 'vault' },
  { id: 'shop', label: 'Boutique', icon: Icons.ShoppingBag, colorKey: 'shop' },
];

// ============================================================
// COMPONENT: NAV ITEM (Absolute Mask Layout)
// ============================================================

interface NavItemProps {
  icon: React.FC;
  label: string;
  isActive: boolean;
  colorKey?: keyof typeof moduleColors;
  collapsed: boolean;
  onClick: () => void;
  isSettings?: boolean;
}

const NavItem: React.FC<NavItemProps> = memo(({ icon: Icon, label, isActive, colorKey, collapsed, onClick, isSettings }) => {
  const { theme, mode } = useTheme();

  // Colors - Memoized
  const colors = useMemo(() => {
    let bg = 'transparent';
    let color = theme.text.secondary;

    if (isActive) {
        if (isSettings) {
            bg = mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
            color = theme.text.primary;
        } else if (colorKey) {
            const c = moduleColors[colorKey];
            bg = mode === 'dark' ? c.darkBg : c.bg;
            color = mode === 'dark' ? c.darkColor : c.color;
        }
    }

    return { bg, color };
  }, [isActive, isSettings, colorKey, mode, theme]);

  const buttonStyle = useMemo(() => ({
    display: 'block',
    width: '100%',
    padding: 0,
    border: 'none',
    background: colors.bg,
    color: colors.color,
    cursor: 'pointer',
    borderRadius: '9999px',
    height: '48px',
    position: 'relative' as const,
    overflow: 'hidden' as const,
  }), [colors]);

  const iconContainerStyle = useMemo(() => ({
    position: 'absolute' as const,
    left: 0,
    top: 0,
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2
  }), []);

  const textContainerStyle = useMemo(() => ({
    position: 'absolute' as const,
    left: '48px',
    top: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    whiteSpace: 'nowrap' as const,
    paddingRight: '1rem',
    zIndex: 1,
    fontWeight: 500
  }), []);

  const motionVariants = useMemo(() => ({
    hover: { scale: 1.02 },
    tap: { scale: 0.98 }
  }), []);

  const iconRotateVariants = useMemo(() => ({
    hover: { rotate: 10 }
  }), []);

  return (
    <motion.button
      onClick={onClick}
      whileHover="hover"
      whileTap="tap"
      variants={motionVariants}
      style={buttonStyle}
    >
      {/* ICON: Static Left, but animates internal rotation */}
      <div style={iconContainerStyle}>
          <motion.div
             variants={iconRotateVariants}
             transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <Icon />
          </motion.div>
      </div>

      {/* TEXT: Static Absolute position (Hidden by overflow when width < text pos) */}
      <div style={textContainerStyle}>
          {label}
      </div>
    </motion.button>
  );
});

// ============================================================
// MAIN COMPONENT: SIDEBAR
// ============================================================

interface SidebarProps {
  activeModule: ModuleId;
  onNavigate: (module: ModuleId) => void;
  pageTitle?: string; // Optional subtitle (e.g. "Edition de CV")
}

export const Sidebar: React.FC<SidebarProps> = ({ activeModule, onNavigate, pageTitle }) => {
  const { theme, mode } = useTheme();

  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('sidebar_collapsed') === 'true');
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const toggleCollapse = useCallback(() => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem('sidebar_collapsed', String(next));
  }, [collapsed]);

  const handlePrivacyModalOpen = useCallback(() => {
    setShowPrivacyModal(true);
  }, []);

  const handlePrivacyModalClose = useCallback(() => {
    setShowPrivacyModal(false);
  }, []);

  // Resolve Header Content (Breadcrumb)
  const activeModuleData = useMemo(() => MODULES.find(m => m.id === activeModule), [activeModule]);
  const mainLabel = useMemo(() => activeModuleData?.label || 'SOUVERAIN', [activeModuleData]);

  // Sidebar Container Animation
  const sidebarVariants = useMemo(() => ({
      collapsed: { width: 80, transition: { type: 'spring', stiffness: 180, damping: 24 } },
      expanded: { width: 260, transition: { type: 'spring', stiffness: 180, damping: 24 } }
  }), []);

  const sidebarStyle = useMemo(() => ({
    height: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    zIndex: 100,
    background: mode === 'dark' ? 'rgba(30, 30, 35, 0.4)' : 'rgba(255, 255, 255, 0.4)',
    backdropFilter: 'blur(20px)',
    borderRight: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.4)'}`,
    padding: '1rem',
    overflow: 'hidden' as const,
    transform: 'translate3d(0,0,0)',
  }), [mode]);

  const headerStyle = useMemo(() => ({
    height: '48px',
    position: 'relative' as const,
    marginBottom: '2rem',
  }), []);

  const logoContainerStyle = useMemo(() => ({
    position: 'absolute' as const,
    left: '48px',
    top: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    whiteSpace: 'nowrap' as const,
    opacity: collapsed ? 0 : 1,
    transition: 'opacity 0.2s',
    pointerEvents: (collapsed ? 'none' : 'auto') as const
  }), [collapsed]);

  const logoTextStyle = useMemo(() => ({
    fontSize: '1.25rem',
    fontWeight: 800,
    letterSpacing: '-0.02em',
    color: theme.text.primary,
    fontFamily: typography.fontFamily.sans
  }), [theme]);

  const toggleButtonContainerStyle = useMemo(() => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: collapsed ? 'center' : 'flex-end',
    width: '100%',
    height: '100%',
    transition: 'justify-content 0.3s'
  }), [collapsed]);

  const toggleButtonStyle = useMemo(() => ({
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'transparent',
    border: 'none',
    color: theme.text.tertiary,
    cursor: 'pointer',
    borderRadius: '8px',
  }), [theme]);

  const navStyle = useMemo(() => ({
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem'
  }), []);

  const footerStyle = useMemo(() => ({
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
    paddingTop: '1rem'
  }), []);

  const privacyBadgeContainerStyle = useMemo(() => ({
    display: 'flex',
    justifyContent: collapsed ? 'center' : 'flex-start'
  }), [collapsed]);

  return (
    <>
      <motion.aside
        initial={false}
        animate={collapsed ? "collapsed" : "expanded"}
        variants={sidebarVariants}
        style={sidebarStyle}
      >
        {/* HEADER */}
        <div style={headerStyle}>
            {/* LOGO AREA: Absolute Mask Layout */}
            <div style={logoContainerStyle}>
                <span style={logoTextStyle}>
                    SOUVERAIN
                </span>
            </div>

             <div style={toggleButtonContainerStyle}>
                <button
                    onClick={toggleCollapse}
                    style={toggleButtonStyle}
                >
                    {collapsed ? <Icons.Menu /> : <Icons.ChevronLeft />}
                </button>
             </div>
        </div>

        {/* NAVIGATION ITEMS */}
        <nav style={navStyle}>
            {MODULES.map(module => (
                <NavItem
                    key={module.id}
                    icon={module.icon}
                    label={module.label}
                    colorKey={module.colorKey}
                    isActive={activeModule === module.id}
                    collapsed={collapsed}
                    onClick={() => onNavigate(module.id)}
                />
            ))}
        </nav>

        {/* FOOTER */}
        <div style={footerStyle}>
             <div style={privacyBadgeContainerStyle}>
                <PrivacyBadge collapsed={collapsed} onClick={handlePrivacyModalOpen} />
             </div>

             <NavItem
                icon={Icons.Settings}
                label="Paramètres"
                isActive={activeModule === 'settings'}
                collapsed={collapsed}
                onClick={() => onNavigate('settings')}
                isSettings
             />
        </div>

      </motion.aside>

      {/* MODALS */}
      {showPrivacyModal && (
        <PrivacyModal onClose={handlePrivacyModalClose} />
      )}
    </>
  );
};
