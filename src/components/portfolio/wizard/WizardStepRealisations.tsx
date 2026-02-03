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
        // Lire le fichier comme ArrayBuffer
        const arrayBuffer = await file.arrayBuffer();
        
        // Import PDF via IPC
        // @ts-ignore
        const result = await window.electron.portfolio.extractFromPDF(arrayBuffer, file.name);
        
        // DEBUG LOG - À SUPPRIMER APRÈS FIX
        console.log('[Step3] PDF extraction result:', {
          success: result.success,
          error: result.error,
          hasData: !!result.data,
          hasText: !!result.data?.text,
          textLength: result.data?.text?.length || 0,
          textPreview: result.data?.text?.substring(0, 300)
        });
        
        if (!result.success) {
          throw new Error(result.error || 'Échec de l\'extraction PDF');
        }

        // Créer une réalisation depuis les données extraites
        const realisation: Realisation = {
          id: `real-${Date.now()}`,
          title: result.data.filename.replace('.pdf', ''),
          description: result.data.text ? result.data.text.substring(0, 200) + '...' : '',
          source: {
            type: 'pdf',
            path: file.name, // Juste le nom, pas de path accessible
          },
          extractedContent: result.data.text, // ✅ Stocker le texte complet pour l'IA
        };
        
        // DEBUG LOG - À SUPPRIMER APRÈS FIX
        console.log('[Step3] ✅ Realisation created:', {
          id: realisation.id,
          title: realisation.title,
          hasExtractedContent: !!realisation.extractedContent,
          extractedContentLength: realisation.extractedContent?.length || 0,
          extractedContentPreview: realisation.extractedContent?.substring(0, 300)
        });

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

  const updateExpertise = (index: number, value: string) => {
    const updated = [...formData.expertises];
    updated[index] = value;
    onUpdate({ expertises: updated });
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
        <h1 style={titleStyle}>ÉTAPE 2 : RÉALISATIONS</h1>
        <p style={subtitleStyle}>Définissez votre positionnement et importez vos projets</p>
      </div>

      {/* ========== ENCART POSITIONNEMENT ========== */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
        border: '1px solid rgba(99, 102, 241, 0.15)',
        borderRadius: borderRadius.lg,
        padding: '1.5rem',
        marginBottom: '2rem',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: '1.5rem' }}>🎯</span>
          <h3 style={{
            fontSize: typography.fontSize.lg,
            fontWeight: typography.fontWeight.semibold,
            margin: 0,
            color: theme.text.primary,
          }}>
            Votre positionnement
          </h3>
          <p style={{
            width: '100%',
            fontSize: typography.fontSize.sm,
            color: theme.text.secondary,
            margin: '0.5rem 0 0 0',
          }}>
            Ces informations guident l'IA pour générer un portfolio cohérent
          </p>
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <label htmlFor="valueProp" style={{
            display: 'block',
            fontWeight: typography.fontWeight.medium,
            marginBottom: '0.5rem',
            color: theme.text.primary,
          }}>
            Proposition de valeur
            <span style={{
              display: 'block',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.normal,
              color: theme.text.tertiary,
              marginTop: '0.25rem',
            }}>
              Ce qu'on doit retenir de vous en une phrase
            </span>
          </label>
          <input
            id="valueProp"
            type="text"
            placeholder="Ex: Expert en applications mobiles gamifiées"
            value={formData.valueProp}
            onChange={(e) => onUpdate({ valueProp: e.target.value })}
            maxLength={150}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              border: `1px solid ${theme.border.default}`,
              borderRadius: borderRadius.md,
              fontSize: typography.fontSize.base,
              backgroundColor: theme.bg.primary,
              color: theme.text.primary,
              transition: transitions.fast,
            }}
          />
        </div>

        <div>
          <label style={{
            display: 'block',
            fontWeight: typography.fontWeight.medium,
            marginBottom: '0.5rem',
            color: theme.text.primary,
          }}>
            Vos 3 expertises clés
            <span style={{
              display: 'block',
              fontSize: typography.fontSize.sm,
              fontWeight: typography.fontWeight.normal,
              color: theme.text.tertiary,
              marginTop: '0.25rem',
            }}>
              Les compétences à mettre en avant
            </span>
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '0.75rem',
          }}>
            <input
              type="text"
              placeholder="Expertise 1"
              value={formData.expertises[0] || ''}
              onChange={(e) => updateExpertise(0, e.target.value)}
              maxLength={50}
              style={{
                padding: '0.75rem 1rem',
                border: `1px solid ${theme.border.default}`,
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.base,
                backgroundColor: theme.bg.primary,
                color: theme.text.primary,
                transition: transitions.fast,
              }}
            />
            <input
              type="text"
              placeholder="Expertise 2"
              value={formData.expertises[1] || ''}
              onChange={(e) => updateExpertise(1, e.target.value)}
              maxLength={50}
              style={{
                padding: '0.75rem 1rem',
                border: `1px solid ${theme.border.default}`,
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.base,
                backgroundColor: theme.bg.primary,
                color: theme.text.primary,
                transition: transitions.fast,
              }}
            />
            <input
              type="text"
              placeholder="Expertise 3"
              value={formData.expertises[2] || ''}
              onChange={(e) => updateExpertise(2, e.target.value)}
              maxLength={50}
              style={{
                padding: '0.75rem 1rem',
                border: `1px solid ${theme.border.default}`,
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.base,
                backgroundColor: theme.bg.primary,
                color: theme.text.primary,
                transition: transitions.fast,
              }}
            />
          </div>
        </div>
      </div>

      {/* ========== SÉPARATEUR ========== */}
      <div style={{
        height: '1px',
        background: `linear-gradient(90deg, transparent, ${theme.border.default}, transparent)`,
        margin: '2rem 0',
      }} />

      {/* ========== IMPORT RÉALISATIONS ========== */}
      <h2 style={{
        fontSize: typography.fontSize.lg,
        fontWeight: typography.fontWeight.semibold,
        color: theme.text.primary,
        marginBottom: '1rem',
      }}>
        Vos réalisations
      </h2>

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
