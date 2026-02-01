/**
 * SOUVERAIN - Wizard Step 3: Réalisations
 * Import et édition des réalisations/projets
 */

import React, { useState, useRef } from 'react';
import { useTheme } from '../../../ThemeContext';
import { typography, borderRadius, transitions } from '../../../design-system';
import type { WizardStepProps, Realisation } from '../types';
import { RealisationCard } from './RealisationCard';

export const WizardStepRealisations: React.FC<WizardStepProps> = ({
  formData,
  onUpdate,
  onNext,
  onBack,
}) => {
  const { theme } = useTheme();
  const [url, setUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUrlImport = async () => {
    if (!url.trim()) return;

    setIsImporting(true);
    setError(null);

    try {
      // Détecter le type d'URL
      if (url.includes('notion.so') || url.includes('notion.site')) {
        // Import Notion
        // TODO: Implémenter extraction Notion
        const realisation: Realisation = {
          id: `real-${Date.now()}`,
          title: 'Projet depuis Notion',
          description: 'Description extraite de Notion',
          source: {
            type: 'notion',
            url: url,
          },
        };
        onUpdate({
          realisations: [...formData.realisations, realisation],
        });
      } else {
        // Import URL générique (scraping basique)
        // @ts-ignore
        const result = await window.electron.scrapeWebsite(url);
        
        if (!result.success) {
          throw new Error(result.error || 'Échec de l\'extraction');
        }

        const realisation: Realisation = {
          id: `real-${Date.now()}`,
          title: result.data.title || 'Projet importé',
          description: result.data.description || '',
          source: {
            type: 'url',
            url: url,
          },
        };

        onUpdate({
          realisations: [...formData.realisations, realisation],
        });
      }

      setUrl('');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'import');
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileImport = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsImporting(true);
    setError(null);

    try {
      if (file.type === 'application/pdf') {
        // Import PDF
        // @ts-ignore
        const result = await window.electron.portfolio.extractFromPDF({ filePath: file.path });
        
        if (!result.success) {
          throw new Error(result.error || 'Échec de l\'extraction PDF');
        }

        // Créer une réalisation depuis les données extraites
        const realisation: Realisation = {
          id: `real-${Date.now()}`,
          title: file.name.replace('.pdf', ''),
          description: result.data.text ? result.data.text.substring(0, 200) + '...' : '',
          source: {
            type: 'pdf',
            path: file.path,
          },
        };

        onUpdate({
          realisations: [...formData.realisations, realisation],
        });
      } else {
        throw new Error('Format de fichier non supporté. Utilisez PDF.');
      }

      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'import du fichier');
    } finally {
      setIsImporting(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFileImport(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleRealisationUpdate = (index: number, updates: Partial<Realisation>) => {
    const updated = [...formData.realisations];
    updated[index] = { ...updated[index], ...updates };
    onUpdate({ realisations: updated });
  };

  const handleRealisationDelete = (index: number) => {
    const updated = formData.realisations.filter((_, i) => i !== index);
    onUpdate({ realisations: updated });
  };

  const handleAddManual = () => {
    const newRealisation: Realisation = {
      id: `real-${Date.now()}`,
      title: '',
      description: '',
      source: {
        type: 'manual',
      },
    };
    onUpdate({
      realisations: [...formData.realisations, newRealisation],
    });
  };

  // On peut passer même sans réalisations (c'est optionnel)
  const canProceed = true;

  // Styles
  const containerStyle: React.CSSProperties = {
    padding: '2rem',
    maxWidth: '800px',
    margin: '0 auto',
  };

  const headerStyle: React.CSSProperties = {
    marginBottom: '2rem',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: theme.text.primary,
    marginBottom: '0.5rem',
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: typography.fontSize.base,
    color: theme.text.secondary,
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: '2rem',
  };

  const dropZoneStyle: React.CSSProperties = {
    border: `2px dashed ${theme.border.default}`,
    borderRadius: borderRadius.lg,
    padding: '2rem',
    backgroundColor: theme.bg.secondary,
    textAlign: 'center',
    marginBottom: '2rem',
  };

  const iconStyle: React.CSSProperties = {
    fontSize: '3rem',
    marginBottom: '1rem',
  };

  const inputContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '1rem',
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

  const buttonStyle = (variant: 'primary' | 'secondary'): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      padding: '0.75rem 1.5rem',
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      border: 'none',
      borderRadius: borderRadius.lg,
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
    marginTop: '3rem',
    paddingTop: '2rem',
    borderTop: `1px solid ${theme.border.light}`,
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>STEP 3 : RÉALISATIONS</h1>
        <p style={subtitleStyle}>Qu'avez-vous accompli ? (optionnel)</p>
      </div>

      {/* Zone d'import */}
      <div
        style={dropZoneStyle}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div style={iconStyle}>📄</div>
        <p style={{ color: theme.text.secondary, marginBottom: '1rem' }}>
          Glissez des fichiers ou collez une URL
        </p>

        {/* Input URL */}
        <div style={inputContainerStyle}>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://notion.so/mon-projet..."
            disabled={isImporting}
            style={inputStyle}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleUrlImport();
              }
            }}
          />
          <button
            onClick={handleUrlImport}
            disabled={isImporting || !url.trim()}
            style={{
              ...buttonStyle('primary'),
              opacity: (isImporting || !url.trim()) ? 0.5 : 1,
              cursor: (isImporting || !url.trim()) ? 'not-allowed' : 'pointer',
            }}
          >
            {isImporting ? '⏳' : 'Importer'}
          </button>
        </div>

        {/* Bouton fichier */}
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={(e) => handleFileImport(e.target.files)}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            style={buttonStyle('secondary')}
          >
            📄 Ou choisir un fichier PDF
          </button>
        </div>

        <p style={{ fontSize: typography.fontSize.sm, color: theme.text.tertiary, marginTop: '1rem' }}>
          Formats : PDF, Notion, URL site/app, Texte
        </p>

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

      {/* Liste des réalisations */}
      {formData.realisations.length > 0 && (
        <div style={sectionStyle}>
          <h2 style={{
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.semibold,
            color: theme.text.primary,
            marginBottom: '1rem',
          }}>
            Réalisations importées ({formData.realisations.length}) :
          </h2>
          {formData.realisations.map((realisation, index) => (
            <RealisationCard
              key={realisation.id}
              realisation={realisation}
              onUpdate={(updates) => handleRealisationUpdate(index, updates)}
              onDelete={() => handleRealisationDelete(index)}
            />
          ))}
        </div>
      )}

      {/* Ajout manuel */}
      <div style={{ marginBottom: '2rem' }}>
        <button onClick={handleAddManual} style={buttonStyle('secondary')}>
          + Ajouter manuellement
        </button>
      </div>

      {/* Footer avec navigation */}
      <div style={footerStyle}>
        <button onClick={onBack} style={buttonStyle('secondary')}>
          ← Retour
        </button>
        <button
          onClick={onNext}
          style={buttonStyle('primary')}
        >
          Suivant →
        </button>
      </div>
    </div>
  );
};
