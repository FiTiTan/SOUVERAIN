/**
 * SOUVERAIN - AI Enhance Button Inline
 * Version intégrée dans l'input (position absolute à droite)
 */

import React, { useState } from 'react';
import { useTheme } from '../../../ThemeContext';
import { typography, borderRadius, transitions } from '../../../design-system';

interface AIEnhanceButtonInlineProps {
  onEnhance: () => Promise<void>;
  isLoading?: boolean;
}

export const AIEnhanceButtonInline: React.FC<AIEnhanceButtonInlineProps> = ({
  onEnhance,
  isLoading = false,
}) => {
  const { theme } = useTheme();
  const [showWarning, setShowWarning] = useState(false);

  const handleClick = () => {
    setShowWarning(true);
  };

  const handleAccept = async () => {
    setShowWarning(false);
    await onEnhance();
  };

  const handleRefuse = () => {
    setShowWarning(false);
  };

  // Styles
  const buttonStyle: React.CSSProperties = {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    color: theme.text.tertiary,
    border: 'none',
    borderRadius: borderRadius.sm,
    cursor: isLoading ? 'not-allowed' : 'pointer',
    opacity: isLoading ? 0.5 : 1,
    transition: transitions.fast,
  };

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

  const warningStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'start',
    gap: '1rem',
    padding: '1rem',
    backgroundColor: theme.semantic.warning + '20',
    borderRadius: borderRadius.md,
    marginBottom: '1.5rem',
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
    backgroundColor: '#3A3A3A',
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

  return (
    <>
      <button
        onClick={handleClick}
        disabled={isLoading}
        style={buttonStyle}
        title="Boost IA"
        onMouseEnter={(e) => {
          e.currentTarget.style.color = theme.accent.primary;
          e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.color = theme.text.tertiary;
          e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
        }}
      >
        {isLoading ? (
          '⏳'
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0l1.545 7.455L21 9l-7.455 1.545L12 18l-1.545-7.455L3 9l7.455-1.545L12 0z"/>
            <path d="M6 14l.727 3.273L10 18l-3.273.727L6 22l-.727-3.273L2 18l3.273-.727L6 14z" opacity="0.7"/>
            <path d="M18 2l.545 2.455L21 5l-2.455.545L18 8l-.545-2.455L15 5l2.455-.545L18 2z" opacity="0.7"/>
          </svg>
        )}
      </button>

      {/* Modal warning */}
      {showWarning && (
        <div style={modalOverlayStyle} onClick={handleRefuse}>
          <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
            <h3 style={{
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.semibold,
              color: theme.text.primary,
              marginBottom: '1rem',
            }}>
              Amélioration par IA
            </h3>

            <div style={warningStyle}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={theme.semantic.warning} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <div>
                <div style={{
                  fontWeight: typography.fontWeight.semibold,
                  color: theme.text.primary,
                  marginBottom: '0.25rem',
                }}>
                  Attention
                </div>
                <div style={{
                  fontSize: typography.fontSize.sm,
                  color: theme.text.secondary,
                }}>
                  Les données de ce champ ne seront pas anonymisées avant l'envoi à l'IA. 
                  Elles seront utilisées pour améliorer votre texte.
                </div>
              </div>
            </div>

            <div style={modalButtonsStyle}>
              <button onClick={handleRefuse} style={secondaryButtonStyle}>
                Refuser
              </button>
              <button onClick={handleAccept} style={primaryButtonStyle}>
                Accepter
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
