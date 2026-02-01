/**
 * SOUVERAIN - Editable Preview Screen V2
 * Affiche le vrai HTML généré + overlays drag & drop
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTheme } from '../../ThemeContext';
import { typography, borderRadius, transitions } from '../../design-system';
import { ImageLibrary } from './ImageLibrary';
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

interface ImageZone {
  id: string;
  element: HTMLElement;
  bounds: DOMRect;
  type: 'hero' | 'about' | 'project';
  projectIndex?: number;
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
  const [libraryImages, setLibraryImages] = useState<LibraryImage[]>([]);
  const [assignments, setAssignments] = useState<ImageAssignments>({});
  const [imageZones, setImageZones] = useState<ImageZone[]>([]);
  const [dragOverZone, setDragOverZone] = useState<string | null>(null);

  // ============================================================
  // DETECT IMAGE ZONES
  // ============================================================

  const detectImageZones = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument) return;

    const doc = iframe.contentDocument;
    const zones: ImageZone[] = [];

    // Détecter toutes les zones avec data-image-zone
    const elements = doc.querySelectorAll('[data-image-zone]');
    
    elements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      const zoneType = htmlEl.getAttribute('data-image-zone');
      const projectIndex = htmlEl.getAttribute('data-project-index');

      if (zoneType === 'hero' || zoneType === 'about') {
        zones.push({
          id: zoneType,
          element: htmlEl,
          bounds: htmlEl.getBoundingClientRect(),
          type: zoneType,
        });
      } else if (zoneType === 'project' && projectIndex !== null) {
        zones.push({
          id: `project-${projectIndex}`,
          element: htmlEl,
          bounds: htmlEl.getBoundingClientRect(),
          type: 'project',
          projectIndex: parseInt(projectIndex),
        });
      }
    });

    setImageZones(zones);
    console.log('[EditablePreview] Detected zones:', zones.length);
  }, []);

  // Détecter les zones quand l'iframe charge
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleLoad = () => {
      console.log('[EditablePreview] Iframe loaded');
      detectImageZones();
      
      // Re-détecter au resize
      iframe.contentWindow?.addEventListener('resize', detectImageZones);
    };

    iframe.addEventListener('load', handleLoad);

    return () => {
      iframe.removeEventListener('load', handleLoad);
      iframe.contentWindow?.removeEventListener('resize', detectImageZones);
    };
  }, [detectImageZones]);

  // Injecter les images assignées dans l'iframe
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument) return;

    imageZones.forEach((zone) => {
      const assignedImage = assignments[zone.id];
      
      if (assignedImage) {
        // Remplacer le contenu de la zone par l'image
        zone.element.innerHTML = `<img src="${assignedImage}" alt="${zone.id}" style="width: 100%; height: 100%; object-fit: cover; ${zone.type === 'about' ? 'border-radius: 50%;' : ''}">`;
      }
    });
  }, [assignments, imageZones]);

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

  const handleDragOver = useCallback((e: React.DragEvent, zoneId: string) => {
    e.preventDefault();
    setDragOverZone(zoneId);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverZone(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, zoneId: string) => {
    e.preventDefault();
    setDragOverZone(null);

    const dataUrl = e.dataTransfer.getData('imageDataUrl');
    if (dataUrl) {
      setAssignments((prev) => ({ ...prev, [zoneId]: dataUrl }));
    }
  }, []);

  const handleExport = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe?.contentDocument) {
      onExport(initialHtml);
      return;
    }

    // Récupérer le HTML final de l'iframe
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
    zIndex: 10,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.semibold,
    color: theme.text.primary,
    marginBottom: '0.25rem',
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: typography.fontSize.sm,
    color: theme.text.tertiary,
  };

  const buttonStyle = (variant: 'secondary' | 'primary'): React.CSSProperties => ({
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

  const mainContentStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
  };

  const iframeContainerStyle: React.CSSProperties = {
    flex: 1,
    position: 'relative',
    overflow: 'auto',
  };

  const overlayContainerStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
    zIndex: 5,
  };

  const overlayZoneStyle = (zone: ImageZone): React.CSSProperties => {
    const isHovered = dragOverZone === zone.id;
    const hasImage = !!assignments[zone.id];

    return {
      position: 'absolute',
      left: zone.bounds.left,
      top: zone.bounds.top,
      width: zone.bounds.width,
      height: zone.bounds.height,
      border: isHovered ? `3px solid ${theme.accent.primary}` : hasImage ? `2px solid ${theme.semantic.success}` : `2px dashed ${theme.border.default}`,
      backgroundColor: isHovered ? `${theme.accent.primary}20` : 'transparent',
      pointerEvents: 'all',
      transition: transitions.fast,
      borderRadius: zone.type === 'about' ? '50%' : borderRadius.md,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: typography.fontSize.sm,
      color: theme.text.secondary,
      fontWeight: typography.fontWeight.medium,
    };
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <div>
          <h2 style={titleStyle}>✨ Preview Éditable - Glissez vos images</h2>
          <p style={subtitleStyle}>Personnalisez votre portfolio en ajoutant vos images</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={onBack} style={buttonStyle('secondary')}>
            ← Retour
          </button>
          <button onClick={handleExport} style={buttonStyle('primary')}>
            Exporter →
          </button>
        </div>
      </div>

      {/* Main content with iframe + overlays */}
      <div style={mainContentStyle}>
        <div style={iframeContainerStyle}>
          <iframe
            ref={iframeRef}
            srcDoc={initialHtml}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
            }}
            title="Portfolio Preview"
          />

          {/* Overlays drag & drop */}
          <div style={overlayContainerStyle}>
            {imageZones.map((zone) => (
              <div
                key={zone.id}
                style={overlayZoneStyle(zone)}
                onDragOver={(e) => handleDragOver(e, zone.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, zone.id)}
              >
                {!assignments[zone.id] && (
                  <span style={{ pointerEvents: 'none' }}>
                    {zone.type === 'hero' && 'Hero'}
                    {zone.type === 'about' && 'Profil'}
                    {zone.type === 'project' && `Projet ${(zone.projectIndex || 0) + 1}`}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bibliothèque d'images */}
      <ImageLibrary
        images={libraryImages}
        onAddImages={handleAddImages}
        onRemoveImage={handleRemoveLibraryImage}
      />
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
