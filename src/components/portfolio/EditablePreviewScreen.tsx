/**
 * SOUVERAIN - Editable Preview Screen V3
 * Layout 3 colonnes : Bibliothèque | Zones Drop | Preview
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useTheme } from '../../ThemeContext';
import { typography, borderRadius, transitions } from '../../design-system';
import type { LibraryImage, ImageAssignments, PortfolioPreviewData } from './types';

// ============================================================
// TYPES
// ============================================================

interface EditablePreviewScreenProps {
  portfolioData: PortfolioPreviewData;
  initialHtml: string;
  onBack: () => void;
  onExport: (html: string) => void;
}

// ============================================================
// COMPONENT
// ============================================================

export const EditablePreviewScreen: React.FC<EditablePreviewScreenProps> = ({
  portfolioData,
  initialHtml,
  onBack,
  onExport,
}) => {
  const { theme } = useTheme();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [libraryImages, setLibraryImages] = useState<LibraryImage[]>([]);
  const [assignments, setAssignments] = useState<ImageAssignments>({});
  const [dragOverZone, setDragOverZone] = useState<string | null>(null);
  const [detectedProjectCount, setDetectedProjectCount] = useState<number>(0);

  // ============================================================
  // DETECT PROJECTS FROM HTML
  // ============================================================

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleIframeLoad = () => {
      const doc = iframe.contentDocument;
      if (!doc) return;

      // Détecter le nombre de projets dans le HTML
      const projectZones = doc.querySelectorAll('[data-image-zone="project"]');
      setDetectedProjectCount(projectZones.length);
      
      console.log('[EditablePreview] Detected projects:', projectZones.length);
    };

    iframe.addEventListener('load', handleIframeLoad);

    return () => {
      iframe.removeEventListener('load', handleIframeLoad);
    };
  }, []);

  // ============================================================
  // INJECT IMAGES INTO IFRAME
  // ============================================================

  useEffect(() => {
    // Petit délai pour s'assurer que l'iframe est complètement chargée
    const timer = setTimeout(() => {
      const iframe = iframeRef.current;
      if (!iframe?.contentDocument) {
        console.log('[EditablePreview] Iframe contentDocument not ready');
        return;
      }

      const doc = iframe.contentDocument;

    // Injecter hero
    if (assignments.hero) {
      const heroZone = doc.querySelector('[data-image-zone="hero"]');
      if (heroZone) {
        heroZone.innerHTML = `<img src="${assignments.hero}" alt="Hero" style="width: 100%; height: 100%; object-fit: cover;">`;
        console.log('[EditablePreview] Injected hero image');
      } else {
        console.warn('[EditablePreview] Hero zone not found in HTML');
      }
    }

    // Injecter about
    if (assignments.about) {
      const aboutZone = doc.querySelector('[data-image-zone="about"]');
      if (aboutZone) {
        aboutZone.innerHTML = `<img src="${assignments.about}" alt="About" style="width: 100%; height: 100%; object-fit: cover;">`;
        console.log('[EditablePreview] Injected about image');
      } else {
        console.warn('[EditablePreview] About zone not found in HTML');
      }
    }

    // Injecter projets
    Object.entries(assignments).forEach(([key, value]) => {
      if (key.startsWith('project-') && value) {
        const projectIndex = key.split('-')[1];
        const projectZone = doc.querySelector(`[data-image-zone="project"][data-project-index="${projectIndex}"]`);
        if (projectZone) {
          projectZone.innerHTML = `<img src="${value}" alt="Project ${projectIndex}" style="width: 100%; height: 100%; object-fit: cover;">`;
          console.log(`[EditablePreview] Injected project ${projectIndex} image`);
        } else {
          console.warn(`[EditablePreview] Project ${projectIndex} zone not found in HTML`);
        }
      }
    });
    }, 300); // Attendre 300ms que l'iframe soit prête

    return () => clearTimeout(timer);
  }, [assignments]);

  // ============================================================
  // HANDLERS
  // ============================================================

  const handleAddImages = useCallback(async (files: FileList) => {
    const newImages: LibraryImage[] = await Promise.all(
      Array.from(files).map(async (file) => ({
        id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        filename: file.name,
        dataUrl: await fileToDataUrl(file),
      }))
    );
    setLibraryImages((prev) => [...prev, ...newImages]);
  }, []);

  const handleRemoveLibraryImage = useCallback((id: string) => {
    setLibraryImages((prev) => prev.filter((img) => img.id !== id));
  }, []);

  const handleDragStart = useCallback((e: React.DragEvent, image: LibraryImage) => {
    e.dataTransfer.setData('imageDataUrl', image.dataUrl);
    e.dataTransfer.effectAllowed = 'copy';
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, zoneId: string) => {
    e.preventDefault();
    setDragOverZone(null);

    const dataUrl = e.dataTransfer.getData('imageDataUrl');
    if (dataUrl) {
      setAssignments((prev) => ({ ...prev, [zoneId]: dataUrl }));
    }
  }, []);

  const handleRemoveAssignment = useCallback((zoneId: string) => {
    setAssignments((prev) => {
      const updated = { ...prev };
      delete updated[zoneId];
      return updated;
    });
  }, []);

  const handleExport = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument) {
      onExport(initialHtml);
      return;
    }

    const finalHtml = iframe.contentDocument.documentElement.outerHTML;
    onExport(finalHtml);
  }, [initialHtml, onExport]);

  // ============================================================
  // STYLES
  // ============================================================

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: theme.bg.primary,
  };

  const headerStyle: React.CSSProperties = {
    padding: '1.5rem 2rem',
    borderBottom: `1px solid ${theme.border.light}`,
    backgroundColor: theme.bg.secondary,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const mainStyle: React.CSSProperties = {
    flex: 1,
    display: 'grid',
    gridTemplateColumns: '240px 280px 1fr',
    gap: 0,
    overflow: 'hidden',
  };

  const columnStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  };

  const columnHeaderStyle: React.CSSProperties = {
    padding: '1rem 1.5rem',
    borderBottom: `1px solid ${theme.border.light}`,
    backgroundColor: theme.bg.secondary,
  };

  const dropZoneStyle = (zoneId: string): React.CSSProperties => {
    const hasImage = !!assignments[zoneId];
    const isHovered = dragOverZone === zoneId;
    
    const size = '100px';

    return {
      position: 'relative',
      height: size,
      width: size,
      borderRadius: borderRadius.lg,
      border: `2px dashed ${isHovered ? theme.accent.primary : hasImage ? theme.semantic.success : theme.border.default}`,
      backgroundColor: isHovered ? theme.accent.muted : theme.bg.tertiary,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      transition: transitions.fast,
      overflow: 'hidden',
      margin: zoneId === 'about' ? '0 auto' : 0,
    };
  };

  const buttonStyle = (variant: 'primary' | 'secondary'): React.CSSProperties => ({
    padding: '0.75rem 1.5rem',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    backgroundColor: variant === 'primary' ? theme.accent.primary : 'transparent',
    color: variant === 'primary' ? '#FFFFFF' : theme.text.secondary,
    border: variant === 'primary' ? 'none' : `1px solid ${theme.border.default}`,
    borderRadius: borderRadius.lg,
    cursor: 'pointer',
    transition: transitions.fast,
  });

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div>
          <h2 style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.semibold, color: theme.text.primary }}>
            ✨ Personnalisation des images
          </h2>
          <p style={{ fontSize: typography.fontSize.sm, color: theme.text.tertiary, marginTop: '0.25rem' }}>
            Glissez vos images depuis la bibliothèque vers les zones
          </p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={onBack} style={buttonStyle('secondary')}>← Retour</button>
          <button onClick={handleExport} style={buttonStyle('primary')}>Exporter →</button>
        </div>
      </div>

      {/* Main 3 colonnes */}
      <div style={mainStyle}>
        
        {/* COLONNE 1 : BIBLIOTHÈQUE */}
        <div style={{ ...columnStyle, borderRight: `1px solid ${theme.border.light}`, backgroundColor: theme.bg.secondary }}>
          <div style={columnHeaderStyle}>
            <h3 style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, color: theme.text.primary }}>
              📁 Bibliothèque ({libraryImages.length})
            </h3>
          </div>

          <div style={{ flex: 1, padding: '1rem', overflowY: 'auto' }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                width: '100%',
                padding: '0.75rem',
                marginBottom: '1rem',
                backgroundColor: theme.accent.primary,
                color: '#FFFFFF',
                border: 'none',
                borderRadius: borderRadius.lg,
                cursor: 'pointer',
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.medium,
              }}
            >
              + Importer des images
            </button>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => e.target.files && handleAddImages(e.target.files)}
            />

            {libraryImages.length === 0 ? (
              <p style={{ textAlign: 'center', color: theme.text.tertiary, fontSize: typography.fontSize.sm, padding: '2rem 0' }}>
                Aucune image<br/>Importez-en pour commencer
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {libraryImages.map((img) => (
                  <div
                    key={img.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, img)}
                    style={{
                      position: 'relative',
                      width: '100%',
                      paddingBottom: '100%', // Ratio 1:1 carré
                      borderRadius: borderRadius.lg,
                      overflow: 'hidden',
                      cursor: 'grab',
                      border: `2px solid ${theme.border.light}`,
                    }}
                  >
                    <img src={img.dataUrl} alt={img.filename} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveLibraryImage(img.id);
                      }}
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        padding: '4px 8px',
                        backgroundColor: theme.semantic.error,
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: borderRadius.md,
                        cursor: 'pointer',
                        fontSize: '10px',
                        zIndex: 1,
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* COLONNE 2 : ZONES DE DROP */}
        <div style={{ ...columnStyle, borderRight: `1px solid ${theme.border.light}`, backgroundColor: theme.bg.primary }}>
          <div style={columnHeaderStyle}>
            <h3 style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, color: theme.text.primary }}>
              🎯 Zones
            </h3>
          </div>

          <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
            
            {/* Hero */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: theme.text.secondary, marginBottom: '0.5rem' }}>
                Hero
              </label>
              <div
                style={dropZoneStyle('hero')}
                onDragOver={handleDragOver}
                onDragEnter={() => setDragOverZone('hero')}
                onDragLeave={() => setDragOverZone(null)}
                onDrop={(e) => handleDrop(e, 'hero')}
              >
                {assignments.hero ? (
                  <>
                    <img src={assignments.hero} alt="Hero" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      onClick={() => handleRemoveAssignment('hero')}
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        padding: '4px 8px',
                        backgroundColor: theme.semantic.error,
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: borderRadius.md,
                        cursor: 'pointer',
                        fontSize: '10px',
                      }}
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  <span style={{ fontSize: typography.fontSize.xs, color: theme.text.tertiary }}>Glissez ici</span>
                )}
              </div>
            </div>

            {/* About */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: theme.text.secondary, marginBottom: '0.5rem' }}>
                À propos
              </label>
              <div
                style={dropZoneStyle('about')}
                onDragOver={handleDragOver}
                onDragEnter={() => setDragOverZone('about')}
                onDragLeave={() => setDragOverZone(null)}
                onDrop={(e) => handleDrop(e, 'about')}
              >
                {assignments.about ? (
                  <>
                    <img src={assignments.about} alt="About" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <button
                      onClick={() => handleRemoveAssignment('about')}
                      style={{
                        position: 'absolute',
                        top: '4px',
                        right: '4px',
                        padding: '4px 8px',
                        backgroundColor: theme.semantic.error,
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: borderRadius.md,
                        cursor: 'pointer',
                        fontSize: '10px',
                      }}
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  <span style={{ fontSize: typography.fontSize.xs, color: theme.text.tertiary }}>Glissez ici</span>
                )}
              </div>
            </div>

            {/* Projets */}
            {detectedProjectCount > 0 && (
              <div>
                <label style={{ display: 'block', fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: theme.text.secondary, marginBottom: '0.75rem' }}>
                  Projets ({detectedProjectCount})
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {Array.from({ length: detectedProjectCount }).map((_, i) => {
                    const zoneId = `project-${i}`;
                    const projectTitle = portfolioData.projects?.[i]?.title || `Projet ${i + 1}`;
                    return (
                      <div key={i}>
                        <label style={{ display: 'block', fontSize: typography.fontSize.xs, color: theme.text.tertiary, marginBottom: '0.25rem' }}>
                          {projectTitle}
                        </label>
                        <div
                          style={dropZoneStyle(zoneId)}
                          onDragOver={handleDragOver}
                          onDragEnter={() => setDragOverZone(zoneId)}
                          onDragLeave={() => setDragOverZone(null)}
                          onDrop={(e) => handleDrop(e, zoneId)}
                        >
                          {assignments[zoneId] ? (
                            <>
                              <img src={assignments[zoneId]} alt={projectTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRemoveAssignment(zoneId);
                                }}
                                style={{
                                  position: 'absolute',
                                  top: '4px',
                                  right: '4px',
                                  padding: '4px 8px',
                                  backgroundColor: theme.semantic.error,
                                  color: '#FFFFFF',
                                  border: 'none',
                                  borderRadius: borderRadius.md,
                                  cursor: 'pointer',
                                  fontSize: '10px',
                                  zIndex: 1,
                                }}
                              >
                                ✕
                              </button>
                            </>
                          ) : (
                            <span style={{ fontSize: typography.fontSize.xs, color: theme.text.tertiary, textAlign: 'center' }}>Glissez ici</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* COLONNE 3 : PREVIEW */}
        <div style={{ ...columnStyle, backgroundColor: theme.bg.tertiary }}>
          <div style={columnHeaderStyle}>
            <h3 style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, color: theme.text.primary }}>
              👁️ Aperçu final
            </h3>
          </div>

          <div style={{ flex: 1, overflow: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', backgroundColor: theme.bg.tertiary, padding: '2rem' }}>
            <div style={{ 
              width: '1200px', 
              minHeight: '100%',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 0 40px rgba(0,0,0,0.1)',
              transform: 'scale(0.75)',
              transformOrigin: 'top center',
            }}>
              <iframe
                ref={iframeRef}
                srcDoc={initialHtml}
                style={{
                  width: '1200px',
                  height: '100%',
                  minHeight: '100vh',
                  border: 'none',
                  display: 'block',
                }}
                title="Portfolio Preview"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// ============================================================
// UTILITAIRES
// ============================================================

const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
