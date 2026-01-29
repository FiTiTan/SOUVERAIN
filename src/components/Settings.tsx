/**
 * SOUVERAIN V17 - Settings Page
 * Page de paramètres complète avec sections:
 * - Apparence (Dark mode toggle)
 * - Tutoriel (Revoir le tutoriel)
 * - Sécurité du coffre-fort (Protection par mot de passe)
 * - À propos (Version + Mentions légales)
 * - Compte (Placeholder)
 */

import React, { useState } from 'react';
import { useTheme } from '../ThemeContext';
import { typography, borderRadius, transitions } from '../design-system';
import { CalmModal } from './ui/CalmModal';

// ... (Icons remain unchanged)
const SettingsIcons = {
  Sun: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
  Moon: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  ),
  Book: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  ),
  Info: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  User: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  ExternalLink: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  ),
  Lock: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  AlertTriangle: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
};

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  onShowTutorial?: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ isOpen, onClose, onShowTutorial }) => {
  const { theme, mode, toggleTheme } = useTheme();
  const isDark = mode === 'dark';

  // État pour la protection par mot de passe
  const [passwordProtectionEnabled, setPasswordProtectionEnabled] = useState(false);
  const [showPasswordSetup, setShowPasswordSetup] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleResetTutorial = () => {
    localStorage.removeItem('souverain_onboarding_completed');
    if (onShowTutorial) {
      onShowTutorial();
      onClose(); // Close settings to show tutorial
    }
  };

  const handleOpenLegalNotice = () => {
    // Ouvrir les mentions légales dans le navigateur
    window.electron?.openExternal?.('https://example.com/mentions-legales');
  };

  const handleTogglePasswordProtection = () => {
    if (passwordProtectionEnabled) {
      // Désactiver : demander confirmation
      const confirmed = confirm(
        'Désactiver la protection par mot de passe ?\n\n' +
        'Votre coffre-fort ne sera plus protégé par mot de passe. ' +
        'Les documents restent chiffrés mais accessibles sans mot de passe.'
      );
      if (confirmed) {
        setPasswordProtectionEnabled(false);
        // TODO: Appeler l'API Electron pour désactiver
      }
    } else {
      // Activer : afficher le formulaire
      setShowPasswordSetup(true);
    }
  };

  const handleSavePassword = () => {
    if (!newPassword || newPassword.length < 8) {
      alert('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Les mots de passe ne correspondent pas.');
      return;
    }

    // TODO: Appeler l'API Electron pour sauvegarder le mot de passe haché
    console.log('Protection par mot de passe activée');
    setPasswordProtectionEnabled(true);
    setShowPasswordSetup(false);
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleCancelPasswordSetup = () => {
    setShowPasswordSetup(false);
    setNewPassword('');
    setConfirmPassword('');
  };

  const styles = {
    // container styles removed as handled by Modal
    section: {
      marginBottom: '2rem',
      padding: '1.5rem',
      backgroundColor: theme.bg.secondary,
      border: `1px solid ${theme.border.light}`,
      borderRadius: borderRadius.xl,
    },
    // ... other styles same as before
    sectionHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      marginBottom: '1rem',
    },
    sectionIcon: {
      color: theme.accent.primary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    sectionTitle: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text.primary,
    },
    sectionDescription: {
      fontSize: typography.fontSize.sm,
      color: theme.text.secondary,
      marginBottom: '1.5rem',
    },
    settingRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem',
      backgroundColor: theme.bg.primary,
      border: `1px solid ${theme.border.light}`,
      borderRadius: borderRadius.lg,
      marginBottom: '0.75rem',
      transition: transitions.fast,
    },
    settingLabel: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.25rem',
    },
    settingTitle: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium,
      color: theme.text.primary,
    },
    settingDesc: {
      fontSize: typography.fontSize.sm,
      color: theme.text.secondary,
    },
    toggle: {
      width: '48px',
      height: '28px',
      backgroundColor: isDark ? theme.accent.primary : theme.border.default,
      borderRadius: '14px',
      position: 'relative' as const,
      cursor: 'pointer',
      transition: transitions.fast,
      border: 'none',
      padding: 0,
    },
    toggleCircle: {
      width: '22px',
      height: '22px',
      backgroundColor: '#FFFFFF',
      borderRadius: '50%',
      position: 'absolute' as const,
      top: '3px',
      left: isDark ? '23px' : '3px',
      transition: transitions.fast,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    },
    button: {
      padding: '0.75rem 1.5rem',
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      backgroundColor: theme.bg.primary,
      color: theme.text.primary,
      border: `1px solid ${theme.border.default}`,
      borderRadius: borderRadius.lg,
      cursor: 'pointer',
      transition: transitions.fast,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    infoGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '1rem',
    },
    infoCard: {
      padding: '1rem',
      backgroundColor: theme.bg.primary,
      border: `1px solid ${theme.border.light}`,
      borderRadius: borderRadius.lg,
    },
    infoLabel: {
      fontSize: typography.fontSize.xs,
      color: theme.text.tertiary,
      marginBottom: '0.25rem',
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
    },
    infoValue: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium,
      color: theme.text.primary,
    },
    link: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.375rem',
      fontSize: typography.fontSize.sm,
      color: theme.accent.primary,
      textDecoration: 'none',
      cursor: 'pointer',
      transition: transitions.fast,
    },
    placeholder: {
      padding: '2rem',
      textAlign: 'center' as const,
      backgroundColor: theme.bg.primary,
      border: `2px dashed ${theme.border.default}`,
      borderRadius: borderRadius.lg,
      color: theme.text.tertiary,
    },
    placeholderIcon: {
      fontSize: typography.fontSize['3xl'],
      marginBottom: '0.75rem',
    },
    placeholderText: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium,
    },
    passwordForm: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1rem',
      marginTop: '1rem',
      padding: '1rem',
      backgroundColor: theme.bg.primary,
      border: `1px solid ${theme.border.light}`,
      borderRadius: borderRadius.lg,
    },
    input: {
      width: '100%',
      padding: '0.75rem 1rem',
      fontSize: typography.fontSize.sm,
      backgroundColor: theme.bg.secondary,
      border: `1px solid ${theme.border.light}`,
      borderRadius: borderRadius.md,
      color: theme.text.primary,
      outline: 'none',
      transition: transitions.fast,
    },
    formActions: {
      display: 'flex',
      gap: '0.75rem',
      justifyContent: 'flex-end',
      marginTop: '0.5rem',
    },
    warningBox: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.75rem',
      padding: '1rem',
      backgroundColor: `${theme.semantic.warning}15`,
      border: `1px solid ${theme.semantic.warning}`,
      borderRadius: borderRadius.lg,
      marginTop: '1rem',
    },
    warningIcon: {
      color: theme.semantic.warning,
      flexShrink: 0,
      marginTop: '0.125rem',
    },
    warningText: {
      flex: 1,
      fontSize: typography.fontSize.sm,
      color: theme.text.primary,
      lineHeight: typography.lineHeight.relaxed,
    },
  };

  return (
    <CalmModal
      isOpen={isOpen}
      onClose={onClose}
      title="Paramètres"
      width="800px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Section 1: Apparence */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionIcon}>
              {isDark ? <SettingsIcons.Moon /> : <SettingsIcons.Sun />}
            </div>
            <h2 style={styles.sectionTitle}>Apparence</h2>
          </div>
          <p style={styles.sectionDescription}>
            Personnalisez l'apparence de l'interface selon vos préférences
          </p>

          <div style={styles.settingRow}>
            <div style={styles.settingLabel}>
              <span style={styles.settingTitle}>Mode sombre</span>
              <span style={styles.settingDesc}>
                {isDark ? 'Thème sombre activé' : 'Thème clair activé'}
              </span>
            </div>
            <button
              style={styles.toggle}
              onClick={toggleTheme}
              aria-label="Basculer le mode sombre"
            >
              <div style={styles.toggleCircle} />
            </button>
          </div>
        </section>

        {/* Section 2: Tutoriel */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionIcon}>
              <SettingsIcons.Book />
            </div>
            <h2 style={styles.sectionTitle}>Tutoriel</h2>
          </div>
          <p style={styles.sectionDescription}>
            Revoyez le tutoriel d'introduction pour découvrir toutes les fonctionnalités
          </p>

          <button
            style={styles.button}
            onClick={handleResetTutorial}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.bg.tertiary;
              e.currentTarget.style.borderColor = theme.accent.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.bg.primary;
              e.currentTarget.style.borderColor = theme.border.default;
            }}
          >
            <SettingsIcons.Book />
            Revoir le tutoriel
          </button>
        </section>

        {/* Section 3: Sécurité du coffre-fort */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionIcon}>
              <SettingsIcons.Lock />
            </div>
            <h2 style={styles.sectionTitle}>Sécurité du coffre-fort</h2>
          </div>
          <p style={styles.sectionDescription}>
            Protégez l'accès à vos documents professionnels avec un mot de passe supplémentaire
          </p>

          <div style={styles.settingRow}>
            <div style={styles.settingLabel}>
              <span style={styles.settingTitle}>Protection par mot de passe</span>
              <span style={styles.settingDesc}>
                {passwordProtectionEnabled
                  ? 'Votre coffre-fort est protégé par mot de passe'
                  : 'Ajouter une couche de sécurité supplémentaire'}
              </span>
            </div>
            <button
              style={styles.toggle}
              onClick={handleTogglePasswordProtection}
              aria-label="Basculer la protection par mot de passe"
            >
              <div style={{
                ...styles.toggleCircle,
                left: passwordProtectionEnabled ? '23px' : '3px',
              }} />
            </button>
          </div>

          {showPasswordSetup && (
            <div style={styles.passwordForm}>
              <div>
                <label style={{ fontSize: typography.fontSize.sm, color: theme.text.secondary, display: 'block', marginBottom: '0.5rem' }}>
                  Nouveau mot de passe (min. 8 caractères)
                </label>
                <input
                  type="password"
                  style={styles.input}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  autoFocus
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = theme.accent.primary;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = theme.border.light;
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: typography.fontSize.sm, color: theme.text.secondary, display: 'block', marginBottom: '0.5rem' }}>
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  style={styles.input}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = theme.accent.primary;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = theme.border.light;
                  }}
                />
              </div>
              <div style={styles.formActions}>
                <button
                  style={{ ...styles.button, backgroundColor: theme.bg.tertiary }}
                  onClick={handleCancelPasswordSetup}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.bg.elevated;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme.bg.tertiary;
                  }}
                >
                  Annuler
                </button>
                <button
                  style={{
                    ...styles.button,
                    backgroundColor: theme.accent.primary,
                    color: '#FFFFFF',
                    borderColor: theme.accent.primary,
                  }}
                  onClick={handleSavePassword}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.accent.secondary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme.accent.primary;
                  }}
                >
                  Activer la protection
                </button>
              </div>
            </div>
          )}

          <div style={styles.warningBox}>
            <div style={styles.warningIcon}>
              <SettingsIcons.AlertTriangle />
            </div>
            <div style={styles.warningText}>
              <strong>Important :</strong> Si vous oubliez votre mot de passe, vos documents seront définitivement inaccessibles.
              Il n'existe aucun moyen de récupération. Assurez-vous de le conserver dans un endroit sûr.
            </div>
          </div>
        </section>

        {/* Section 4: À propos */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionIcon}>
              <SettingsIcons.Info />
            </div>
            <h2 style={styles.sectionTitle}>À propos</h2>
          </div>
          <p style={styles.sectionDescription}>
            Informations sur l'application et mentions légales
          </p>

          <div style={styles.infoGrid}>
            <div style={styles.infoCard}>
              <div style={styles.infoLabel}>Version</div>
              <div style={styles.infoValue}>1.0.0</div>
            </div>
            <div style={styles.infoCard}>
              <div style={styles.infoLabel}>Application</div>
              <div style={styles.infoValue}>SOUVERAIN</div>
            </div>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <a
              style={styles.link}
              onClick={handleOpenLegalNotice}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.8';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              Mentions légales
              <SettingsIcons.ExternalLink />
            </a>
          </div>
        </section>

        {/* Section 5: Mon compte (Placeholder) */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionIcon}>
              <SettingsIcons.User />
            </div>
            <h2 style={styles.sectionTitle}>Mon compte</h2>
          </div>
          <p style={styles.sectionDescription}>
            Gérez votre compte et vos préférences personnelles
          </p>

          <div style={styles.placeholder}>
            <div style={styles.placeholderIcon}>🚀</div>
            <div style={styles.placeholderText}>Bientôt disponible</div>
            <p style={{ ...styles.settingDesc, marginTop: '0.5rem' }}>
              La gestion de compte arrive dans une prochaine version
            </p>
          </div>
        </section>
      </div>
    </CalmModal>
  );
};
