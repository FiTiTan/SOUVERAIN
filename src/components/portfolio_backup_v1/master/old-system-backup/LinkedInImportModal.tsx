import React, { useState } from 'react';
import { useTheme } from '../../../ThemeContext';

interface LinkedInImportModalProps {
  onClose: () => void;
  onImport: (data: { profileUrl?: string; rawContent?: string }) => void;
}

type ImportMode = 'url' | 'paste';

export const LinkedInImportModal: React.FC<LinkedInImportModalProps> = ({ onClose, onImport }) => {
  const { theme } = useTheme();
  const [mode, setMode] = useState<ImportMode>('url');
  const [profileUrl, setProfileUrl] = useState('');
  const [rawContent, setRawContent] = useState('');
  const [error, setError] = useState('');

  const validateLinkedInUrl = (url: string): boolean => {
    const linkedinPattern = /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|pub)\/[a-zA-Z0-9_-]+\/?$/;
    return linkedinPattern.test(url);
  };

  const handleImport = () => {
    setError('');

    if (mode === 'url') {
      if (!profileUrl.trim()) {
        setError('Veuillez entrer une URL de profil LinkedIn');
        return;
      }
      if (!validateLinkedInUrl(profileUrl)) {
        setError('URL LinkedIn invalide. Format attendu: linkedin.com/in/username');
        return;
      }
      onImport({ profileUrl });
    } else {
      if (!rawContent.trim()) {
        setError('Veuillez coller le contenu de votre profil');
        return;
      }
      onImport({ rawContent });
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: theme.bg.primary,
          borderRadius: '16px',
          width: '100%',
          maxWidth: '600px',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          border: `1px solid ${theme.border.default}`,
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: `1px solid ${theme.border.light}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{
              margin: 0,
              fontSize: '1.25rem',
              fontWeight: 600,
              color: theme.text.primary
            }}>
              💼 Importer depuis LinkedIn
            </h2>
            <p style={{
              margin: '0.25rem 0 0 0',
              fontSize: '0.875rem',
              color: theme.text.secondary
            }}>
              Récupérez vos expériences professionnelles
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: theme.bg.secondary,
              color: theme.text.secondary,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              transition: 'all 0.2s',
              outline: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.bg.tertiary || theme.bg.secondary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.bg.secondary;
            }}
          >
            ×
          </button>
        </div>

        {/* Mode selector */}
        <div style={{
          padding: '1.5rem',
          borderBottom: `1px solid ${theme.border.light}`
        }}>
          <div style={{
            display: 'flex',
            gap: '0.75rem'
          }}>
            <button
              onClick={() => setMode('url')}
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '12px',
                border: `2px solid ${mode === 'url' ? theme.accent.primary : theme.border.default}`,
                backgroundColor: mode === 'url' ? `${theme.accent.primary}11` : theme.bg.secondary,
                color: theme.text.primary,
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                outline: 'none'
              }}
            >
              🔗 URL du profil
            </button>
            <button
              onClick={() => setMode('paste')}
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '12px',
                border: `2px solid ${mode === 'paste' ? theme.accent.primary : theme.border.default}`,
                backgroundColor: mode === 'paste' ? `${theme.accent.primary}11` : theme.bg.secondary,
                color: theme.text.primary,
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                outline: 'none'
              }}
            >
              📋 Copier-coller
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.5rem'
        }}>
          {mode === 'url' ? (
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: theme.text.primary,
                marginBottom: '0.5rem'
              }}>
                URL du profil LinkedIn
              </label>
              <input
                type="text"
                value={profileUrl}
                onChange={(e) => {
                  setProfileUrl(e.target.value);
                  setError('');
                }}
                placeholder="https://linkedin.com/in/votre-profil"
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  border: `1px solid ${error ? '#EF4444' : theme.border.default}`,
                  borderRadius: '12px',
                  fontSize: '0.95rem',
                  outline: 'none',
                  backgroundColor: theme.bg.secondary,
                  color: theme.text.primary,
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => !error && (e.target.style.borderColor = theme.accent.primary)}
                onBlur={(e) => !error && (e.target.style.borderColor = theme.border.default!)}
              />
              <p style={{
                marginTop: '0.5rem',
                fontSize: '0.8rem',
                color: theme.text.tertiary
              }}>
                Collez l'URL complète de votre profil LinkedIn
              </p>
            </div>
          ) : (
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: theme.text.primary,
                marginBottom: '0.5rem'
              }}>
                Contenu du profil
              </label>
              <textarea
                value={rawContent}
                onChange={(e) => {
                  setRawContent(e.target.value);
                  setError('');
                }}
                placeholder="Collez ici le contenu copié depuis votre profil LinkedIn..."
                rows={10}
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  border: `1px solid ${error ? '#EF4444' : theme.border.default}`,
                  borderRadius: '12px',
                  fontSize: '0.95rem',
                  outline: 'none',
                  backgroundColor: theme.bg.secondary,
                  color: theme.text.primary,
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => !error && (e.target.style.borderColor = theme.accent.primary)}
                onBlur={(e) => !error && (e.target.style.borderColor = theme.border.default!)}
              />
              <p style={{
                marginTop: '0.5rem',
                fontSize: '0.8rem',
                color: theme.text.tertiary
              }}>
                Visitez votre profil LinkedIn, sélectionnez et copiez le contenu de la page
              </p>
            </div>
          )}

          {error && (
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              backgroundColor: '#FEE2E2',
              border: '1px solid #FECACA',
              color: '#991B1B',
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '1.5rem',
          borderTop: `1px solid ${theme.border.light}`,
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '0.75rem'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '12px',
              border: `1px solid ${theme.border.default}`,
              backgroundColor: theme.bg.secondary,
              color: theme.text.primary,
              fontSize: '0.9rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
              outline: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.bg.tertiary || theme.bg.secondary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.bg.secondary;
            }}
          >
            Annuler
          </button>
          <button
            onClick={handleImport}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: theme.accent.primary,
              color: '#FFFFFF',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              outline: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Importer
          </button>
        </div>
      </div>
    </div>
  );
};
