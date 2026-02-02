/**
 * SOUVERAIN - Social Links Grid
 * Grille de boutons pour ajouter des réseaux sociaux avec popup modal
 */

import React, { useState } from 'react';
import { useTheme } from '../../../ThemeContext';
import { typography, borderRadius, transitions } from '../../../design-system';

interface SocialPlatform {
  id: string;
  name: string;
  icon: JSX.Element;
  color: string;
  placeholder: string;
  prefix?: string;
}

const SOCIAL_PLATFORMS: SocialPlatform[] = [
  {
    id: 'linkedin',
    name: 'LinkedIn',
    color: '#0A66C2',
    placeholder: 'linkedin.com/in/votre-profil',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
        <path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"/>
      </svg>
    ),
  },
  {
    id: 'twitter',
    name: 'Twitter / X',
    color: '#000000',
    placeholder: 'twitter.com/votre-compte',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    id: 'github',
    name: 'GitHub',
    color: '#181717',
    placeholder: 'github.com/votre-username',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
      </svg>
    ),
  },
  {
    id: 'instagram',
    name: 'Instagram',
    color: '#E4405F',
    placeholder: 'instagram.com/votre-compte',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
  },
  {
    id: 'facebook',
    name: 'Facebook',
    color: '#1877F2',
    placeholder: 'facebook.com/votre-page',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  {
    id: 'behance',
    name: 'Behance',
    color: '#1769FF',
    placeholder: 'behance.net/votre-profil',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
        <path d="M0 4.4v15.2h7.3c3.7 0 6.2-2.3 6.2-5.3 0-2.1-1.3-3.8-3.3-4.4 1.4-.5 2.4-1.9 2.4-3.7 0-2.6-2-4.8-5.3-4.8H0zm2.5 2.1H6.8c1.6 0 2.8.9 2.8 2.4s-1.2 2.4-2.8 2.4H2.5V6.5zm0 6.9h5c1.8 0 3.1 1.1 3.1 2.8s-1.3 2.8-3.1 2.8h-5v-5.6zm13.5-4.5c-3.9 0-6.9 3-6.9 6.9s3 6.9 6.9 6.9c3.2 0 5.9-2 6.7-4.9h-2.8c-.5 1.1-1.7 1.9-3.3 1.9-2.1 0-3.8-1.5-4.1-3.6h10.5c.1-.5.1-.9.1-1.4 0-3.9-3-6.8-6.9-6.8zm0 2.3c2 0 3.6 1.4 4 3.3h-8c.4-1.9 2-3.3 4-3.3zm1.5-5.4h5.5v1.5h-5.5V5.8z"/>
      </svg>
    ),
  },
  {
    id: 'dribbble',
    name: 'Dribbble',
    color: '#EA4C89',
    placeholder: 'dribbble.com/votre-profil',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
        <path d="M12 24C5.385 24 0 18.615 0 12S5.385 0 12 0s12 5.385 12 12-5.385 12-12 12zm10.12-10.358c-.35-.11-3.17-.953-6.384-.438 1.34 3.684 1.887 6.684 1.992 7.308 2.3-1.555 3.936-4.02 4.395-6.87zm-6.115 7.808c-.153-.9-.75-4.032-2.19-7.77l-.066.02c-5.79 2.015-7.86 6.025-8.04 6.4 1.73 1.358 3.92 2.166 6.29 2.166 1.42 0 2.77-.29 4-.814zm-11.62-2.58c.232-.4 3.045-5.055 8.332-6.765.135-.045.27-.084.405-.12-.26-.585-.54-1.167-.832-1.74C7.17 11.775 2.206 11.71 1.756 11.7l-.004.312c0 2.633.998 5.037 2.634 6.855zm-2.42-8.955c.46.008 4.683.026 9.477-1.248-1.698-3.018-3.53-5.558-3.8-5.928-2.868 1.35-5.01 3.99-5.676 7.17zM9.6 2.052c.282.38 2.145 2.914 3.822 6 3.645-1.365 5.19-3.44 5.373-3.702-1.81-1.61-4.19-2.586-6.795-2.586-.825 0-1.63.1-2.4.285zm10.335 3.483c-.218.29-1.935 2.493-5.724 4.04.24.49.47.985.68 1.486.08.18.15.36.22.53 3.41-.43 6.8.26 7.14.33-.02-2.42-.88-4.64-2.31-6.38z"/>
      </svg>
    ),
  },
  {
    id: 'youtube',
    name: 'YouTube',
    color: '#FF0000',
    placeholder: 'youtube.com/@votre-chaine',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    color: '#000000',
    placeholder: 'tiktok.com/@votre-compte',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
      </svg>
    ),
  },
  {
    id: 'medium',
    name: 'Medium',
    color: '#000000',
    placeholder: 'medium.com/@votre-compte',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
        <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
      </svg>
    ),
  },
];

interface SocialLinksGridProps {
  selectedLinks: Array<{ platform: string; url: string }>;
  onUpdate: (links: Array<{ platform: string; url: string }>) => void;
}

export const SocialLinksGrid: React.FC<SocialLinksGridProps> = ({
  selectedLinks,
  onUpdate,
}) => {
  const { theme } = useTheme();
  const [modalOpen, setModalOpen] = useState<string | null>(null);
  const [modalUrl, setModalUrl] = useState('');

  const handleOpenModal = (platformId: string) => {
    const existing = selectedLinks.find(l => l.platform === platformId);
    setModalUrl(existing?.url || '');
    setModalOpen(platformId);
  };

  const handleSaveModal = () => {
    if (!modalOpen) return;

    const platform = SOCIAL_PLATFORMS.find(p => p.id === modalOpen);
    if (!platform) return;

    const updated = selectedLinks.filter(l => l.platform !== modalOpen);
    
    if (modalUrl.trim()) {
      updated.push({
        platform: platform.name,
        url: modalUrl.trim(),
      });
    }

    onUpdate(updated);
    setModalOpen(null);
    setModalUrl('');
  };

  const handleCloseModal = () => {
    setModalOpen(null);
    setModalUrl('');
  };

  const isPlatformActive = (platformId: string) => {
    return selectedLinks.some(l => l.platform === SOCIAL_PLATFORMS.find(p => p.id === platformId)?.name);
  };

  // Styles
  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
    marginBottom: '1rem',
  };

  const buttonStyle = (platform: SocialPlatform, active: boolean): React.CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '1rem',
    border: `2px solid ${active ? platform.color : theme.border.default}`,
    borderRadius: borderRadius.lg,
    backgroundColor: active ? platform.color + '10' : theme.bg.secondary,
    color: active ? platform.color : theme.text.tertiary,
    cursor: 'pointer',
    transition: transitions.fast,
    minHeight: '100px',
  });

  const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  };

  const modalContentStyle: React.CSSProperties = {
    backgroundColor: theme.bg.primary,
    padding: '2rem',
    borderRadius: borderRadius.lg,
    minWidth: '400px',
    maxWidth: '500px',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    fontSize: typography.fontSize.base,
    border: `1px solid ${theme.border.default}`,
    borderRadius: borderRadius.md,
    backgroundColor: theme.bg.secondary,
    color: theme.text.primary,
    marginBottom: '1rem',
  };

  const modalButtonsStyle: React.CSSProperties = {
    display: 'flex',
    gap: '0.75rem',
    justifyContent: 'flex-end',
  };

  const primaryButtonStyle: React.CSSProperties = {
    padding: '0.75rem 1.5rem',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    backgroundColor: theme.accent.primary,
    color: '#FFFFFF',
    border: 'none',
    borderRadius: borderRadius.md,
    cursor: 'pointer',
  };

  const secondaryButtonStyle: React.CSSProperties = {
    padding: '0.75rem 1.5rem',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    backgroundColor: 'transparent',
    color: theme.text.secondary,
    border: `1px solid ${theme.border.default}`,
    borderRadius: borderRadius.md,
    cursor: 'pointer',
  };

  const activePlatform = SOCIAL_PLATFORMS.find(p => p.id === modalOpen);

  return (
    <>
      <div style={gridStyle}>
        {SOCIAL_PLATFORMS.map((platform) => {
          const active = isPlatformActive(platform.id);
          return (
            <div
              key={platform.id}
              style={buttonStyle(platform, active)}
              onClick={() => handleOpenModal(platform.id)}
            >
              <div style={{ opacity: active ? 1 : 0.4 }}>
                {platform.icon}
              </div>
              <span style={{ fontSize: typography.fontSize.xs, fontWeight: typography.fontWeight.medium }}>
                {platform.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {modalOpen && activePlatform && (
        <div style={modalOverlayStyle} onClick={handleCloseModal}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.semibold,
              color: theme.text.primary,
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <div style={{ color: activePlatform.color }}>
                {activePlatform.icon}
              </div>
              {activePlatform.name}
            </h3>
            <p style={{
              fontSize: typography.fontSize.sm,
              color: theme.text.secondary,
              marginBottom: '1rem',
            }}>
              Entrez l'URL de votre profil {activePlatform.name}
            </p>
            <input
              type="url"
              value={modalUrl}
              onChange={(e) => setModalUrl(e.target.value)}
              placeholder={activePlatform.placeholder}
              style={inputStyle}
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSaveModal();
                }
              }}
            />
            <div style={modalButtonsStyle}>
              <button onClick={handleCloseModal} style={secondaryButtonStyle}>
                Annuler
              </button>
              <button onClick={handleSaveModal} style={primaryButtonStyle}>
                Valider
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
