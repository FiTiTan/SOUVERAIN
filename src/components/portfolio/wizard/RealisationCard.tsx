/**
 * SOUVERAIN - Realisation Card Component
 * Card éditable pour une réalisation/projet
 */

import React from 'react';
import { useTheme } from '../../../ThemeContext';
import { typography, borderRadius, transitions } from '../../../design-system';
import type { Realisation } from '../types';
import { DocumentPreview } from './DocumentPreview';
import { TrashIcon } from '../../icons/FeatherIcons';

interface RealisationCardProps {
  realisation: Realisation;
  onUpdate: (updates: Partial<Realisation>) => void;
  onDelete: () => void;
}

export const RealisationCard: React.FC<RealisationCardProps> = ({
  realisation,
  onUpdate,
  onDelete,
}) => {
  const { theme } = useTheme();

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return '📄';
      case 'notion':
        return '🔗';
      case 'url':
        return '🌐';
      case 'manual':
        return '✍️';
      default:
        return '📋';
    }
  };

  const getSourceLabel = (type: string, path?: string, url?: string) => {
    switch (type) {
      case 'pdf':
        return path ? path.split('/').pop() || 'PDF' : 'PDF';
      case 'notion':
        return url || 'Notion';
      case 'url':
        return url || 'URL';
      case 'manual':
        return 'Manuel';
      default:
        return 'Source inconnue';
    }
  };

  // Styles
  const cardStyle: React.CSSProperties = {
    padding: '1.5rem',
    border: `1px solid ${theme.border.default}`,
    borderRadius: borderRadius.lg,
    backgroundColor: theme.bg.secondary,
    marginBottom: '1rem',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1rem',
  };

  const sourceInfoStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: typography.fontSize.sm,
    color: theme.text.tertiary,
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    fontSize: typography.fontSize.base,
    border: `1px solid ${theme.border.default}`,
    borderRadius: borderRadius.md,
    backgroundColor: theme.bg.primary,
    color: theme.text.primary,
    transition: transitions.fast,
  };

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: '80px',
    resize: 'vertical' as const,
    fontFamily: 'inherit',
  };

  const formGroupStyle: React.CSSProperties = {
    marginBottom: '1rem',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: theme.text.secondary,
    marginBottom: '0.5rem',
  };

  const buttonStyle: React.CSSProperties = {
    padding: '0.5rem 1rem',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    backgroundColor: theme.semantic.error,
    color: '#FFFFFF',
    border: 'none',
    borderRadius: borderRadius.md,
    cursor: 'pointer',
    transition: transitions.fast,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
  };

  return (
    <div style={cardStyle}>
      {/* Header avec source et bouton supprimer */}
      <div style={headerStyle}>
        <div style={sourceInfoStyle}>
          <span>{getSourceIcon(realisation.source.type)}</span>
          <span>{getSourceLabel(realisation.source.type, realisation.source.path, realisation.source.url)}</span>
        </div>
        <button onClick={onDelete} style={buttonStyle}>
          <TrashIcon size={16} color="#FFFFFF" />
        </button>
      </div>

      {/* Titre */}
      <div style={formGroupStyle}>
        <label style={labelStyle}>Titre :</label>
        <input
          type="text"
          value={realisation.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Titre de la réalisation"
          style={inputStyle}
        />
      </div>

      {/* Preview du contenu extrait OU Description éditable */}
      <div style={formGroupStyle}>
        <label style={labelStyle}>
          {realisation.extractedContent ? 'Contenu extrait :' : 'Description :'}
        </label>
        {realisation.extractedContent ? (
          <DocumentPreview
            content={realisation.extractedContent}
            sourceType={realisation.source.type}
            sourceName={realisation.source.path || realisation.source.url}
            onContentEdit={(newContent) => {
              onUpdate({ 
                extractedContent: newContent,
                description: newContent.substring(0, 200) + (newContent.length > 200 ? '...' : '')
              });
            }}
          />
        ) : (
          <textarea
            value={realisation.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            placeholder="Décrivez cette réalisation..."
            style={textareaStyle}
          />
        )}
      </div>

      {/* Catégorie */}
      <div style={formGroupStyle}>
        <label style={labelStyle}>Catégorie :</label>
        <select
          value={realisation.category || ''}
          onChange={(e) => onUpdate({ category: e.target.value })}
          style={selectStyle}
        >
          <option value="">Choisir une catégorie</option>
          <option value="Application Mobile">Application Mobile</option>
          <option value="Site Web">Site Web</option>
          <option value="API">API</option>
          <option value="Design">Design</option>
          <option value="Consulting">Consulting</option>
          <option value="Formation">Formation</option>
          <option value="Autre">Autre</option>
        </select>
      </div>
    </div>
  );
};
