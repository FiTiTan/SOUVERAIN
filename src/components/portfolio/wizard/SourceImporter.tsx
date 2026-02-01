/**
 * SOUVERAIN - Source Importer Component
 * Composant unifié pour import URL/fichier (LinkedIn, site web, PDF, etc.)
 */

import React, { useState, useRef } from 'react';
import { useTheme } from '../../../ThemeContext';
import { typography, borderRadius, transitions } from '../../../design-system';
import type { ImportSource, ProfileType } from '../types';
import { scrapeWebsite, detectWebsiteType } from '../../../services/webScraperService';

interface SourceImporterProps {
  profileType: ProfileType;
  onImport: (source: ImportSource) => Promise<void>;
}

export const SourceImporter: React.FC<SourceImporterProps> = ({
  profileType,
  onImport,
}) => {
  const { theme } = useTheme();
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUrlImport = async () => {
    if (!url.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      let source: ImportSource;

      // Détecter le type de source
      if (url.includes('linkedin.com')) {
        // Import LinkedIn
        source = {
          type: 'linkedin',
          url: url,
        };
        // TODO: Appeler l'API d'extraction LinkedIn
        await onImport(source);
      } else if (url.startsWith('http')) {
        // Import site web
        const scrapedData = await scrapeWebsite(url);
        source = {
          type: 'website',
          url: url,
          extractedData: scrapedData,
        };
        await onImport(source);
      } else {
        throw new Error('Format d\'URL non reconnu');
      }

      setUrl('');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'import');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileImport = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsLoading(true);
    setError(null);

    try {
      if (file.type === 'application/pdf') {
        // Import PDF
        // @ts-ignore
        const result = await window.electron.portfolio.extractFromPDF({ filePath: file.path });
        
        if (!result.success) {
          throw new Error(result.error || 'Échec de l\'extraction PDF');
        }

        const source: ImportSource = {
          type: 'pdf',
          filePath: file.path,
          extractedData: result.data,
        };

        await onImport(source);
      } else if (file.type === 'text/plain') {
        // Import texte
        const text = await file.text();
        const source: ImportSource = {
          type: 'text',
          rawContent: text,
        };
        await onImport(source);
      } else {
        throw new Error('Format de fichier non supporté. Utilisez PDF ou TXT.');
      }

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'import du fichier');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFileImport(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Styles
  const containerStyle: React.CSSProperties = {
    border: `2px dashed ${theme.border.default}`,
    borderRadius: borderRadius.lg,
    padding: '2rem',
    backgroundColor: theme.bg.secondary,
    textAlign: 'center',
  };

  const dropZoneStyle: React.CSSProperties = {
    marginBottom: '1.5rem',
  };

  const iconStyle: React.CSSProperties = {
    fontSize: '3rem',
    marginBottom: '1rem',
  };

  const inputContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '1.5rem',
  };

  const inputStyle: React.CSSProperties = {
    flex: 1,
    padding: '0.75rem',
    fontSize: typography.fontSize.base,
    border: `1px solid ${theme.border.default}`,
    borderRadius: borderRadius.md,
    backgroundColor: theme.bg.primary,
    color: theme.text.primary,
  };

  const buttonStyle: React.CSSProperties = {
    padding: '0.75rem 1.5rem',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    backgroundColor: theme.accent.primary,
    color: '#FFFFFF',
    border: 'none',
    borderRadius: borderRadius.md,
    cursor: isLoading ? 'not-allowed' : 'pointer',
    opacity: isLoading ? 0.5 : 1,
    transition: transitions.fast,
  };

  const sourcesListStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '0.75rem',
    fontSize: typography.fontSize.sm,
    color: theme.text.secondary,
  };

  const sourceItemStyle: React.CSSProperties = {
    padding: '0.5rem',
    backgroundColor: theme.bg.tertiary,
    borderRadius: borderRadius.sm,
  };

  return (
    <div style={containerStyle}>
      {/* Zone de drop */}
      <div
        style={dropZoneStyle}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div style={iconStyle}>🔗</div>
        <p style={{ color: theme.text.secondary, marginBottom: '1rem' }}>
          Collez un lien ou glissez un fichier
        </p>

        {/* Input URL */}
        <div style={inputContainerStyle}>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://..."
            disabled={isLoading}
            style={inputStyle}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleUrlImport();
              }
            }}
          />
          <button
            onClick={handleUrlImport}
            disabled={isLoading || !url.trim()}
            style={buttonStyle}
          >
            {isLoading ? '⏳ Import...' : 'Importer'}
          </button>
        </div>

        {/* Bouton fichier */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt"
            onChange={(e) => handleFileImport(e.target.files)}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            style={{ ...buttonStyle, backgroundColor: 'transparent', color: theme.text.secondary, border: `1px solid ${theme.border.default}` }}
          >
            📄 Ou choisir un fichier (PDF, TXT)
          </button>
        </div>
      </div>

      {/* Sources acceptées */}
      <div style={{ marginTop: '1.5rem' }}>
        <p style={{ fontSize: typography.fontSize.sm, color: theme.text.tertiary, marginBottom: '0.75rem' }}>
          Sources acceptées :
        </p>
        <div style={sourcesListStyle}>
          {profileType === 'person' ? (
            <>
              <div style={sourceItemStyle}>👤 LinkedIn</div>
              <div style={sourceItemStyle}>🌐 Site web perso</div>
              <div style={sourceItemStyle}>📄 CV PDF</div>
              <div style={sourceItemStyle}>✍️ Texte libre</div>
            </>
          ) : (
            <>
              <div style={sourceItemStyle}>📍 Google Business</div>
              <div style={sourceItemStyle}>🌐 Site web</div>
              <div style={sourceItemStyle}>⭐ TripAdvisor</div>
              <div style={sourceItemStyle}>✍️ Texte libre</div>
            </>
          )}
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem',
          backgroundColor: theme.semantic.error + '20',
          color: theme.semantic.error,
          borderRadius: borderRadius.md,
          fontSize: typography.fontSize.sm,
        }}>
          ⚠️ {error}
        </div>
      )}
    </div>
  );
};
