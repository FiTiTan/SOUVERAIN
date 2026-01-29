/**
 * SOUVERAIN - LinkedIn Import Modal CALM-UI
 * Modal pour importer un CV depuis un profil LinkedIn
 * Migré vers CalmModal + GlassInput
 */

import React, { useState } from 'react';
import { useTheme } from '../ThemeContext';
import { typography, borderRadius } from '../design-system';
import { CalmModal } from './ui/CalmModal';
import { GlassInput } from './ui/GlassForms';

// ============================================================
// TYPES
// ============================================================

interface LinkedInImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (url: string) => void;
}

// ============================================================
// ICONS
// ============================================================

const Icons = {
  AlertCircle: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  Loader: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
      <line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
      <animateTransform
        attributeName="transform"
        attributeType="XML"
        type="rotate"
        from="0 12 12"
        to="360 12 12"
        dur="1s"
        repeatCount="indefinite"
      />
    </svg>
  ),
};

// ============================================================
// MAIN COMPONENT
// ============================================================

export const LinkedInImportModal: React.FC<LinkedInImportModalProps> = ({
  isOpen,
  onClose,
  onImport
}) => {
  const { theme } = useTheme();
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImport = async () => {
    // Validation de l'URL
    if (!url.trim()) {
      setError('Veuillez entrer une URL LinkedIn');
      return;
    }

    if (!url.includes('linkedin.com/in/')) {
      setError('URL invalide. Format attendu : https://linkedin.com/in/username');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      await onImport(url);
      setUrl('');
      setIsLoading(false);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'import');
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setUrl('');
      setError('');
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      handleImport();
    }
  };

  return (
    <CalmModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Importer depuis LinkedIn"
      width="600px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Glass Input */}
        <GlassInput
          label="Collez l'URL de votre profil LinkedIn"
          placeholder="https://linkedin.com/in/votre-profil"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          autoFocus
          error={error}
          required
        />

        {/* Hint Box */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.5rem',
          padding: '0.75rem',
          backgroundColor: theme.semantic.infoBg,
          borderRadius: borderRadius.md,
          fontSize: typography.fontSize.sm,
          color: theme.semantic.info,
          lineHeight: typography.lineHeight.relaxed,
          border: `1px solid ${theme.semantic.info}`,
        }}>
          <Icons.AlertCircle />
          <div>
            Assurez-vous que votre profil est en mode <strong>public</strong> pour permettre l'import des données.
          </div>
        </div>

        {/* Footer Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '1rem',
          marginTop: '1rem',
        }}>
          <button
            onClick={handleClose}
            disabled={isLoading}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              backgroundColor: 'transparent',
              color: theme.text.secondary,
              border: `1px solid ${theme.border.default}`,
              borderRadius: borderRadius.lg,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              opacity: isLoading ? 0.5 : 1,
            }}
          >
            Annuler
          </button>

          <button
            onClick={handleImport}
            disabled={isLoading || !url.trim()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.medium,
              backgroundColor: theme.accent.primary,
              color: '#FFFFFF',
              border: 'none',
              borderRadius: borderRadius.lg,
              cursor: (isLoading || !url.trim()) ? 'not-allowed' : 'pointer',
              opacity: (isLoading || !url.trim()) ? 0.5 : 1,
            }}
          >
            {isLoading ? (
              <>
                <Icons.Loader />
                Import en cours...
              </>
            ) : (
              'Importer →'
            )}
          </button>
        </div>
      </div>
    </CalmModal>
  );
};
