/**
 * SOUVERAIN - Document Preview Component
 * Preview incorporé du contenu extrait (PDF, Notion, URL, etc.)
 */

import React, { useState } from 'react';
import { useTheme } from '../../../ThemeContext';
import { typography, borderRadius, transitions } from '../../../design-system';

interface DocumentPreviewProps {
  content: string;
  sourceType: 'pdf' | 'notion' | 'url' | 'manual';
  sourceName?: string;
  onContentEdit?: (newContent: string) => void;
}

export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  content,
  sourceType,
  sourceName,
  onContentEdit,
}) => {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);

  const maxPreviewLength = 500;
  const shouldTruncate = content.length > maxPreviewLength;
  const displayContent = isExpanded || !shouldTruncate 
    ? content 
    : content.substring(0, maxPreviewLength) + '...';

  const handleSaveEdit = () => {
    if (onContentEdit) {
      onContentEdit(editedContent);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedContent(content);
    setIsEditing(false);
  };

  // Styles
  const containerStyle: React.CSSProperties = {
    border: `1px solid ${theme.border.default}`,
    borderRadius: borderRadius.lg,
    backgroundColor: theme.bg.primary,
    overflow: 'hidden',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 1rem',
    backgroundColor: theme.bg.secondary,
    borderBottom: `1px solid ${theme.border.light}`,
  };

  const headerLabelStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: theme.text.secondary,
  };

  const iconStyle: React.CSSProperties = {
    width: '20px',
    height: '20px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const previewContentStyle: React.CSSProperties = {
    padding: '1rem',
    fontSize: typography.fontSize.sm,
    lineHeight: 1.6,
    color: theme.text.primary,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    maxHeight: isExpanded ? 'none' : '300px',
    overflow: isExpanded ? 'visible' : 'hidden',
    position: 'relative',
  };

  const textareaStyle: React.CSSProperties = {
    width: '100%',
    padding: '1rem',
    fontSize: typography.fontSize.sm,
    lineHeight: 1.6,
    color: theme.text.primary,
    backgroundColor: theme.bg.primary,
    border: 'none',
    outline: `2px solid ${theme.accent.primary}`,
    borderRadius: borderRadius.md,
    fontFamily: 'inherit',
    minHeight: '300px',
    resize: 'vertical' as const,
  };

  const buttonStyle = (variant: 'primary' | 'secondary'): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      padding: '0.5rem 1rem',
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.medium,
      border: 'none',
      borderRadius: borderRadius.md,
      cursor: 'pointer',
      transition: transitions.fast,
    };

    if (variant === 'primary') {
      return {
        ...baseStyle,
        backgroundColor: theme.accent.primary,
        color: '#FFFFFF',
      };
    } else {
      return {
        ...baseStyle,
        backgroundColor: 'transparent',
        color: theme.text.secondary,
        border: `1px solid ${theme.border.default}`,
      };
    }
  };

  const footerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '0.5rem',
    padding: '0.75rem 1rem',
    backgroundColor: theme.bg.secondary,
    borderTop: `1px solid ${theme.border.light}`,
  };

  const getSourceIcon = () => {
    switch (sourceType) {
      case 'pdf':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={iconStyle}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        );
      case 'notion':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={iconStyle}>
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        );
      case 'url':
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={iconStyle}>
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        );
      default:
        return (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={iconStyle}>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        );
    }
  };

  const getSourceTypeLabel = () => {
    switch (sourceType) {
      case 'pdf': return 'PDF';
      case 'notion': return 'Notion';
      case 'url': return 'Web';
      default: return 'Document';
    }
  };

  if (!content || content.trim().length === 0) {
    return (
      <div style={containerStyle}>
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          color: theme.text.tertiary,
          fontSize: typography.fontSize.sm,
        }}>
          <span style={{ fontSize: '2rem', display: 'block', marginBottom: '0.5rem' }}>📄</span>
          Aucun contenu extrait
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div style={headerLabelStyle}>
          {getSourceIcon()}
          <span>Preview {getSourceTypeLabel()}</span>
          {sourceName && (
            <span style={{ color: theme.text.tertiary }}>• {sourceName}</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {!isEditing && onContentEdit && (
            <button
              onClick={() => setIsEditing(true)}
              style={{
                ...buttonStyle('secondary'),
                padding: '0.25rem 0.75rem',
              }}
              title="Éditer le contenu"
            >
              ✏️ Éditer
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      {isEditing ? (
        <div style={{ padding: '1rem' }}>
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            style={textareaStyle}
            autoFocus
          />
        </div>
      ) : (
        <div style={previewContentStyle}>
          {displayContent}
          {shouldTruncate && !isExpanded && (
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: '80px',
              background: `linear-gradient(to bottom, transparent, ${theme.bg.primary})`,
              pointerEvents: 'none',
            }} />
          )}
        </div>
      )}

      {/* Footer */}
      <div style={footerStyle}>
        {isEditing ? (
          <>
            <button onClick={handleCancelEdit} style={buttonStyle('secondary')}>
              Annuler
            </button>
            <button onClick={handleSaveEdit} style={buttonStyle('primary')}>
              Enregistrer
            </button>
          </>
        ) : (
          <>
            <div style={{
              fontSize: typography.fontSize.xs,
              color: theme.text.tertiary,
            }}>
              {content.length} caractères
            </div>
            {shouldTruncate && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                style={buttonStyle('secondary')}
              >
                {isExpanded ? '⬆️ Réduire' : '⬇️ Voir tout'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
