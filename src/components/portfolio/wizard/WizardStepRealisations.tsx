/**
 * SOUVERAIN - Wizard Step 2: Votre offre
 * 
 * Section 1: Positionnement (expertises, slogan, différenciation)
 * Section 2: Réalisations/projets
 */

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../../ThemeContext';
import { typography, borderRadius, transitions } from '../../../design-system';
import type { WizardStepProps, Realisation, ProfileContext } from '../types';
import { RealisationCard } from './RealisationCard';
import { AIGeneratorButton } from './AIGeneratorButton';
import { 
  detectProfileContext, 
  getContextLabels,
  type ProfileContextResult 
} from '../../../services/profileContextDetector';

export const WizardStepRealisations: React.FC<WizardStepProps> = ({
  formData,
  onUpdate,
  onNext,
  onBack,
}) => {
  const { theme } = useTheme();
  
  // États pour la section réalisations
  const [url, setUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // États pour la section positionnement
  const [isDetectingContext, setIsDetectingContext] = useState(false);
  const [detectedContext, setDetectedContext] = useState<ProfileContext | null>(null);
  const [contextLabels, setContextLabels] = useState(getContextLabels('service', false));

  // Détection automatique du contexte AU MONTAGE
  useEffect(() => {
    const detectContext = async () => {
      if (!formData.title || formData.title.length < 3) {
        console.log('[WizardStepRealisations] No activity to detect');
        return;
      }

      console.log('[WizardStepRealisations] Running context detection for:', formData.title);
      setIsDetectingContext(true);

      try {
        const result = await detectProfileContext(formData.title);
        console.log('[WizardStepRealisations] Detected:', result);
        
        setDetectedContext(result.context);
        setContextLabels(getContextLabels(result.context, result.isPlace));
        
        onUpdate({ 
          profileContext: result.context,
          profileType: result.isPlace ? 'place' : 'person',
        });
      } catch (error) {
        console.error('[WizardStepRealisations] Detection error:', error);
      } finally {
        setIsDetectingContext(false);
      }
    };

    detectContext();
  }, []); // Uniquement au montage - force detection même si profileContext existe

  // Handlers expertises
  const expertises = formData.expertises || ['', '', ''];
  const handleExpertiseChange = (index: number, value: string) => {
    const updated = [...expertises];
    updated[index] = value;
    onUpdate({ expertises: updated });
  };

  // Handlers réalisations (existants)
  const handleUrlImport = async () => {
    if (!url.trim()) return;

    setIsImporting(true);
    setError(null);

    try {
      if (url.includes('notion.so') || url.includes('notion.site')) {
        const realisation: Realisation = {
          id: `real-${Date.now()}`,
          title: 'Projet depuis Notion',
          description: 'Description extraite de Notion',
        };
        onUpdate({
          realisations: [...formData.realisations, realisation],
        });
      } else {
        // @ts-ignore
        const result = await window.electron.scrapeWebsite(url);
        
        if (!result.success) {
          throw new Error(result.error || 'Échec de l\'extraction');
        }

        const realisation: Realisation = {
          id: `real-${Date.now()}`,
          title: result.data.title || 'Projet importé',
          description: result.data.description || '',
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
        const arrayBuffer = await file.arrayBuffer();
        
        // @ts-ignore
        const result = await window.electron.portfolio.extractFromPDF(arrayBuffer, file.name);
        
        console.log('[WizardStepRealisations] PDF extraction result:', result);

        if (!result.success) {
          throw new Error(result.error || 'Échec de l\'extraction du PDF');
        }

        const realisations = result.data.realisations || [];
        if (realisations.length > 0) {
          onUpdate({
            realisations: [...formData.realisations, ...realisations],
          });
        }
      } else if (file.type === 'text/plain') {
        const text = await file.text();
        const realisation: Realisation = {
          id: `real-${Date.now()}`,
          title: file.name.replace(/\.txt$/, ''),
          description: text.substring(0, 500),
        };
        onUpdate({
          realisations: [...formData.realisations, realisation],
        });
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'import du fichier');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveRealisation = (id: string) => {
    onUpdate({
      realisations: formData.realisations.filter(r => r.id !== id),
    });
  };

  const hasExpertises = expertises.filter(e => e.trim() !== '').length > 0;
  const canProceed = hasExpertises;

  // ============================================
  // STYLES
  // ============================================

  const containerStyle: React.CSSProperties = {
    padding: '2rem',
    maxWidth: '800px',
    margin: '0 auto',
  };

  const sectionStyle: React.CSSProperties = {
    marginBottom: '3rem',
    paddingBottom: '2rem',
    borderBottom: `1px solid ${theme.border}`,
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: theme.text.primary,
    marginBottom: '0.5rem',
  };

  const sectionSubtitleStyle: React.CSSProperties = {
    fontSize: typography.fontSize.sm,
    color: theme.text.secondary,
    marginBottom: '1.5rem',
  };

  const formGroupStyle: React.CSSProperties = {
    marginBottom: '1.5rem',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: theme.text.primary,
    marginBottom: '0.5rem',
  };

  const helperStyle: React.CSSProperties = {
    fontSize: typography.fontSize.xs,
    color: theme.text.secondary,
    fontWeight: typography.fontWeight.normal,
    marginLeft: '0.5rem',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.75rem',
    fontSize: typography.fontSize.base,
    color: theme.text.primary,
    background: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: borderRadius.md,
    outline: 'none',
    transition: transitions.default,
  };

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: '100px',
    resize: 'vertical' as const,
  };

  const expertisesGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
  };

  const buttonContainerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '3rem',
  };

  const iconButtonStyle = (variant: 'back' | 'next', disabled: boolean = false): React.CSSProperties => ({
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: variant === 'next' ? theme.primary : theme.surface,
    border: `1px solid ${variant === 'next' ? theme.primary : theme.border}`,
    color: variant === 'next' ? '#fff' : theme.text.primary,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.4 : 1,
    transition: transitions.default,
  });

  const importButtonStyle: React.CSSProperties = {
    padding: '0.75rem 1rem',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: theme.text.primary,
    background: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: borderRadius.md,
    cursor: 'pointer',
    transition: transitions.default,
  };

  return (
    <div style={containerStyle}>
      {/* ============================================ */}
      {/* SECTION 1: POSITIONNEMENT */}
      {/* ============================================ */}
      <div style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Votre positionnement</h2>
        <p style={sectionSubtitleStyle}>
          Définissez vos expertises et votre message
        </p>

        {/* Catégorie détectée */}
        {(detectedContext || formData.profileContext) && (
          <div style={{ 
            fontSize: typography.fontSize.xs, 
            color: theme.primary,
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
          }}>
            ✓ Catégorie détectée : {detectedContext || formData.profileContext}
            {isDetectingContext && <span style={{ marginLeft: '0.5rem', opacity: 0.6 }}>Détection...</span>}
          </div>
        )}

        {/* Expertises */}
        <div style={formGroupStyle}>
          <label style={labelStyle}>
            {formData.profileType === 'place' 
              ? 'Vos 3 prestations clés' 
              : 'Vos 3 compétences clés'}
            <span style={helperStyle}>
              {formData.profileType === 'place' 
                ? 'Ce que vous proposez' 
                : 'Vos expertises principales'}
            </span>
          </label>
          <div style={expertisesGridStyle}>
            {expertises.map((expertise, index) => (
              <input
                key={index}
                type="text"
                value={expertise}
                onChange={(e) => handleExpertiseChange(index, e.target.value)}
                placeholder=""
                style={inputStyle}
              />
            ))}
          </div>
        </div>

        {/* Slogan */}
        <div style={formGroupStyle}>
          <label style={labelStyle}>
            Votre slogan *
            <span style={helperStyle}>Votre promesse en une phrase.</span>
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <textarea
              value={formData.tagline}
              onChange={(e) => onUpdate({ tagline: e.target.value })}
              placeholder=""
              rows={3}
              style={{ ...textareaStyle, flex: 1 }}
            />
            <AIGeneratorButton
              type="slogan"
              activity={formData.title || ''}
              expertises={expertises.filter(e => e.trim() !== '')}
              onSelect={(value) => onUpdate({ tagline: value })}
            />
          </div>
          {!hasExpertises && (
            <div style={{ color: theme.warning, fontSize: typography.fontSize.xs, marginTop: '0.5rem' }}>
              ⚠️ Renseignez d'abord vos spécialités pour activer la suggestion IA
            </div>
          )}
        </div>

        {/* Ce qui vous différencie */}
        <div style={formGroupStyle}>
          <label style={labelStyle}>
            Ce qui vous différencie
            <span style={helperStyle}>Pourquoi vous plutôt qu'un autre ?</span>
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
            <textarea
              value={formData.valueProp}
              onChange={(e) => onUpdate({ valueProp: e.target.value })}
              placeholder=""
              rows={4}
              style={{ ...textareaStyle, flex: 1 }}
            />
            <AIGeneratorButton
              type="difference"
              activity={formData.title || ''}
              expertises={expertises.filter(e => e.trim() !== '')}
              slogan={formData.tagline}
              onSelect={(value) => onUpdate({ valueProp: value })}
            />
          </div>
          {(!hasExpertises || !formData.tagline) && (
            <div style={{ color: theme.warning, fontSize: typography.fontSize.xs, marginTop: '0.5rem' }}>
              ⚠️ Renseignez d'abord vos spécialités et votre slogan
            </div>
          )}
        </div>
      </div>

      {/* ============================================ */}
      {/* SECTION 2: RÉALISATIONS */}
      {/* ============================================ */}
      <div>
        <h2 style={sectionTitleStyle}>Vos réalisations (optionnel)</h2>
        <p style={sectionSubtitleStyle}>
          Importez vos projets depuis différentes sources
        </p>

        {/* Import URL */}
        <div style={formGroupStyle}>
          <label style={labelStyle}>Importer depuis une URL</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder=""
              style={{ ...inputStyle, flex: 1 }}
              disabled={isImporting}
            />
            <button
              onClick={handleUrlImport}
              disabled={isImporting || !url.trim()}
              style={importButtonStyle}
            >
              {isImporting ? 'Import...' : 'Importer'}
            </button>
          </div>
        </div>

        {/* Import fichier */}
        <div style={formGroupStyle}>
          <label style={labelStyle}>Ou importer un fichier (PDF, TXT)</label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt"
            onChange={(e) => handleFileImport(e.target.files)}
            style={{ display: 'block', fontSize: typography.fontSize.sm }}
            disabled={isImporting}
          />
        </div>

        {/* Erreur */}
        {error && (
          <div style={{ 
            padding: '0.75rem',
            background: theme.error + '20',
            color: theme.error,
            borderRadius: borderRadius.md,
            fontSize: typography.fontSize.sm,
            marginBottom: '1rem',
          }}>
            {error}
          </div>
        )}

        {/* Liste des réalisations */}
        {formData.realisations.length > 0 && (
          <div style={{ marginTop: '1.5rem' }}>
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1rem',
            }}>
              {formData.realisations.map((realisation) => (
                <RealisationCard
                  key={realisation.id}
                  realisation={realisation}
                  onRemove={handleRemoveRealisation}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Boutons navigation */}
      <div style={buttonContainerStyle}>
        <button 
          onClick={onBack} 
          style={iconButtonStyle('back')}
          title="Retour"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <button
          onClick={onNext}
          disabled={!canProceed}
          style={iconButtonStyle('next', !canProceed)}
          title="Suivant"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>
    </div>
  );
};
