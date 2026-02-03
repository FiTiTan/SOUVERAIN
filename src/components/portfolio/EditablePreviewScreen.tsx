/**
 * SOUVERAIN - Editable Preview Screen V4
 * Layout 2 colonnes : Bibliothèque | Preview avec drop direct dans iframe
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useTheme } from '../../ThemeContext';
import { typography, borderRadius, transitions } from '../../design-system';
import type { LibraryImage, ImageAssignments, PortfolioPreviewData } from './types';
import { injectAiRewriteSystem } from './injectAiRewrite';
import { callDeepSeekRewrite } from '../../services/aiRewriteService';

// ============================================================
// UTILS
// ============================================================

const fileToDataUrl = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

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
  const dragImageRef = useRef<string | null>(null);
  
  const [libraryImages, setLibraryImages] = useState<LibraryImage[]>([]);
  const [assignments, setAssignments] = useState<ImageAssignments>({});
  const [isDragging, setIsDragging] = useState(false);
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);

  // ============================================================
  // INJECT IMAGES INTO IFRAME
  // ============================================================

  useEffect(() => {
    // Délai simple pour s'assurer que l'iframe est chargée (mécanique V3)
    const timer = setTimeout(() => {
      const iframe = iframeRef.current;
      if (!iframe?.contentDocument) return;

      const doc = iframe.contentDocument;

      // Injecter les CSS pour les zones droppables
      injectDropZonesCSS(doc);
      
      // ===== BRIEF 1 : Édition basique (contenteditable) =====
      injectEditableFeatures(doc);
      
      // ===== BRIEF 2 : AI Rewrite (boutons ✨ + régénération IA) =====
      injectAiRewriteSystem(doc, {
        name: portfolioData.authorName || '',
        valueProp: '',  // TODO: extraire du HTML généré
        expertises: [],  // TODO: extraire du HTML généré
      });

      // Injecter les images assignées
      Object.entries(assignments).forEach(([zoneId, dataUrl]) => {
        const zone = findZoneByIdInIframe(doc, zoneId);
        if (zone) {
          zone.innerHTML = `<img src="${dataUrl}" alt="${zoneId}" style="width: 100%; height: 100%; object-fit: cover;">`;
        }
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [assignments]);

  // ============================================================
  // AI REWRITE MESSAGE HANDLER (BRIEF 2)
  // ============================================================

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      // Vérifier que le message vient de l'iframe
      if (event.source !== iframeRef.current?.contentWindow) return;

      if (event.data.type === 'AI_REWRITE_REQUEST') {
        const { currentText, instruction, fieldType, context } = event.data.payload;

        try {
          console.log('[Preview] AI Rewrite request:', { instruction, fieldType });

          const result = await callDeepSeekRewrite({
            currentText,
            instruction,
            fieldType,
            context,
          });

          // Envoyer la réponse à l'iframe
          iframeRef.current?.contentWindow?.postMessage(
            {
              type: 'AI_REWRITE_RESPONSE',
              payload: {
                newText: result.newText,
              },
            },
            '*'
          );
        } catch (error: any) {
          console.error('[Preview] AI Rewrite error:', error);

          // Envoyer l'erreur à l'iframe
          iframeRef.current?.contentWindow?.postMessage(
            {
              type: 'AI_REWRITE_RESPONSE',
              payload: {
                error: error.message || 'Erreur lors de la régénération',
              },
            },
            '*'
          );
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  // ============================================================
  // INJECT CSS FOR DROP ZONES
  // ============================================================

  const injectDropZonesCSS = (doc: Document) => {
    let style = doc.getElementById('drop-zones-style');
    if (!style) {
      style = doc.createElement('style');
      style.id = 'drop-zones-style';
      doc.head.appendChild(style);
    }

    style.textContent = `
      [data-image-zone] {
        position: relative;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      
      [data-image-zone]:not(:has(img))::after {
        content: '📷 Drop image here';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: rgba(156, 163, 175, 0.6);
        font-size: 0.875rem;
        font-weight: 500;
        pointer-events: none;
        z-index: 1;
      }
      
      [data-image-zone].drag-hover {
        outline: 3px dashed #3A3A3A;
        outline-offset: -3px;
        background-color: rgba(58, 58, 58, 0.1);
      }
      
      [data-image-zone]:hover {
        outline: 2px solid rgba(58, 58, 58, 0.3);
        outline-offset: -2px;
      }
    `;
  };

  // ============================================================
  // INJECT EDITABLE FEATURES
  // ============================================================

  const injectEditableFeatures = (doc: Document) => {
    // 1. Injecter le CSS pour les éléments éditables
    let editableStyle = doc.getElementById('editable-style');
    if (!editableStyle) {
      editableStyle = doc.createElement('style');
      editableStyle.id = 'editable-style';
      doc.head.appendChild(editableStyle);
    }

    editableStyle.textContent = `
      [contenteditable="true"] {
        outline: none;
        border-radius: 4px;
        transition: background 0.2s;
        cursor: text;
        position: relative;
      }
      
      [contenteditable="true"]:hover {
        background: rgba(99, 102, 241, 0.05);
      }
      
      [contenteditable="true"]:focus {
        background: rgba(99, 102, 241, 0.1);
        box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.3);
      }
      
      [contenteditable="true"].modified {
        border-left: 3px solid #6366f1;
        padding-left: 0.5rem;
      }
    `;

    // 2. Trouver et marquer les éléments éditables
    const editableSelectors = [
      { selector: '.hero-title, .heroTitle, h1[class*="hero"]', field: 'heroTitle' },
      { selector: '.hero-subtitle, .heroSubtitle', field: 'heroSubtitle' },
      { selector: '.hero-eyebrow, .heroEyebrow', field: 'heroEyebrow' },
      { selector: '.hero-cta, button[class*="hero"]', field: 'heroCta' },
      { selector: '.about-text, .aboutText, .bio-text', field: 'aboutText' },
      { selector: '.value-prop, .valueProp', field: 'valueProp' },
      { selector: '.service-title, .service h3', field: 'serviceTitle' },
      { selector: '.service-description, .service p', field: 'serviceDescription' },
      { selector: '.project-title, .project h3', field: 'projectTitle' },
      { selector: '.project-description, .project p:not(.category)', field: 'projectDescription' },
      { selector: '.contact-email, [href^="mailto"]', field: 'email' },
      { selector: '.contact-phone, [href^="tel"]', field: 'phone' },
    ];

    editableSelectors.forEach(({ selector, field }) => {
      const elements = doc.querySelectorAll(selector);
      elements.forEach((el) => {
        const htmlEl = el as HTMLElement;
        if (!htmlEl.hasAttribute('contenteditable')) {
          htmlEl.setAttribute('contenteditable', 'true');
          htmlEl.setAttribute('data-field', field);
          htmlEl.setAttribute('data-original', htmlEl.innerText);
        }
      });
    });

    // 3. Injecter le script de détection de modifications
    let editableScript = doc.getElementById('editable-script');
    if (!editableScript) {
      editableScript = doc.createElement('script');
      editableScript.id = 'editable-script';
      doc.body.appendChild(editableScript);
    }

    editableScript.textContent = `
      (function() {
        // Détecter les modifications
        document.querySelectorAll('[contenteditable="true"]').forEach(el => {
          el.addEventListener('input', () => {
            const isModified = el.innerText !== el.getAttribute('data-original');
            if (isModified) {
              el.classList.add('modified');
            } else {
              el.classList.remove('modified');
            }
          });
        });
        
        // Fonction de reset globale (exposée pour le bouton toolbar)
        window.resetAllEdits = function() {
          document.querySelectorAll('[contenteditable="true"]').forEach(el => {
            el.innerText = el.getAttribute('data-original');
            el.classList.remove('modified');
          });
        };
      })();
    `;
  };

  // ============================================================
  // FIND ZONE HELPER
  // ============================================================

  const findZoneByIdInIframe = (doc: Document, zoneId: string): HTMLElement | null => {
    if (zoneId === 'hero') {
      return doc.querySelector('[data-image-zone="hero"]');
    } else if (zoneId === 'about') {
      return doc.querySelector('[data-image-zone="about"]');
    } else if (zoneId.startsWith('project-')) {
      const projectIndex = zoneId.split('-')[1];
      return doc.querySelector(`[data-image-zone="project"][data-project-index="${projectIndex}"]`);
    }
    return null;
  };

  // ============================================================
  // DRAG & DROP HANDLERS (sur la bibliothèque)
  // ============================================================

  const handleDragStart = useCallback((e: React.DragEvent, image: LibraryImage) => {
    dragImageRef.current = image.dataUrl;
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'copy';
    
    // Image fantôme pendant le drag
    const dragImage = new Image();
    dragImage.src = image.dataUrl;
    dragImage.style.width = '100px';
    dragImage.style.height = '100px';
    dragImage.style.objectFit = 'cover';
    e.dataTransfer.setDragImage(dragImage, 50, 50);
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    dragImageRef.current = null;
    setHoveredZone(null);
    
    // Retirer tous les hover states de l'iframe
    const doc = iframeRef.current?.contentDocument;
    if (doc) {
      doc.querySelectorAll('[data-image-zone].drag-hover').forEach(el => {
        el.classList.remove('drag-hover');
      });
    }
  }, []);

  // ============================================================
  // TRACK MOUSE OVER IFRAME DURING DRAG
  // ============================================================

  useEffect(() => {
    if (!isDragging) return;

    const iframe = iframeRef.current;
    if (!iframe) return;

    const handleMouseMove = (e: DragEvent) => {
      const doc = iframe.contentDocument;
      if (!doc) return;

      // Convertir coordonnées parent vers iframe
      const iframeRect = iframe.getBoundingClientRect();
      const relativeX = e.clientX - iframeRect.left;
      const relativeY = e.clientY - iframeRect.top;

      // Vérifier si on est au-dessus de l'iframe
      if (relativeX < 0 || relativeY < 0 || relativeX > iframeRect.width || relativeY > iframeRect.height) {
        setHoveredZone(null);
        doc.querySelectorAll('[data-image-zone].drag-hover').forEach(el => {
          el.classList.remove('drag-hover');
        });
        return;
      }

      // Trouver l'élément sous le curseur dans l'iframe (sans tenir compte du scroll pour elementFromPoint)
      const elementInIframe = doc.elementFromPoint(relativeX, relativeY);
      
      // Remonter pour trouver la zone droppable
      let zone: Element | null = elementInIframe;
      while (zone && !zone.hasAttribute('data-image-zone')) {
        zone = zone.parentElement;
      }

      // Mettre à jour les hover states
      doc.querySelectorAll('[data-image-zone]').forEach(el => {
        if (el === zone) {
          el.classList.add('drag-hover');
        } else {
          el.classList.remove('drag-hover');
        }
      });

      if (zone) {
        const zoneType = zone.getAttribute('data-image-zone');
        const projectIndex = zone.getAttribute('data-project-index');
        const zoneId = zoneType === 'project' ? `project-${projectIndex}` : zoneType || '';
        setHoveredZone(zoneId);
      } else {
        setHoveredZone(null);
      }
    };

    // Écouter les mouvements de souris sur le document parent
    const handleDragOver = (e: DragEvent) => {
      e.preventDefault(); // Important pour permettre le drop
      handleMouseMove(e);
    };

    document.addEventListener('dragover', handleDragOver);

    return () => {
      document.removeEventListener('dragover', handleDragOver);
    };
  }, [isDragging]);

  // ============================================================
  // DROP HANDLER
  // ============================================================

  useEffect(() => {
    if (!isDragging) return;

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      
      if (!dragImageRef.current || !hoveredZone) {
        return;
      }

      // Assigner l'image à la zone
      setAssignments(prev => ({
        ...prev,
        [hoveredZone]: dragImageRef.current!
      }));
    };

    document.addEventListener('drop', handleDrop);

    return () => {
      document.removeEventListener('drop', handleDrop);
    };
  }, [isDragging, hoveredZone]);

  // ============================================================
  // LIBRARY HANDLERS
  // ============================================================

  const handleAddImages = useCallback(async (files: FileList) => {
    const newImages: LibraryImage[] = await Promise.all(
      Array.from(files).map(async (file) => ({
        id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        filename: file.name,
        dataUrl: await fileToDataUrl(file),
      }))
    );
    setLibraryImages(prev => [...prev, ...newImages]);
  }, []);

  const handleRemoveLibraryImage = useCallback((id: string) => {
    setLibraryImages(prev => prev.filter(img => img.id !== id));
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

  const titleStyle: React.CSSProperties = {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: theme.text.primary,
  };

  const mainStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '280px 1fr',
    gap: 0,
    flex: 1,
    overflow: 'hidden',
  };

  const sidebarStyle: React.CSSProperties = {
    padding: '1.5rem',
    backgroundColor: theme.bg.secondary,
    borderRight: `1px solid ${theme.border.light}`,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  };

  const sidebarTitleStyle: React.CSSProperties = {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: theme.text.primary,
    marginBottom: '0.5rem',
  };

  const addButtonStyle: React.CSSProperties = {
    padding: '0.75rem',
    backgroundColor: '#3A3A3A',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: borderRadius.md,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    cursor: 'pointer',
    transition: transitions.fast,
  };

  const imageGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '0.75rem',
  };

  const imageItemStyle: React.CSSProperties = {
    position: 'relative',
    aspectRatio: '1',
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    cursor: 'grab',
    border: `2px solid ${theme.border.default}`,
    transition: transitions.fast,
  };

  const removeImageButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '0.25rem',
    right: '0.25rem',
    width: '24px',
    height: '24px',
    backgroundColor: theme.semantic.error,
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '50%',
    fontSize: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    transition: transitions.fast,
  };

  const previewContainerStyle: React.CSSProperties = {
    position: 'relative',
    backgroundColor: theme.bg.tertiary,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  };

  const iframeStyle: React.CSSProperties = {
    width: '100%',
    flex: 1,
    border: 'none',
    backgroundColor: '#FFFFFF',
    pointerEvents: isDragging ? 'none' : 'auto', // ✅ Désactiver pendant le drag pour que les événements passent
  };

  const buttonStyle = (variant: 'primary' | 'secondary'): React.CSSProperties => {
    if (variant === 'primary') {
      return {
        padding: '0.75rem 1.5rem',
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
        backgroundColor: '#3A3A3A',
        color: '#FFFFFF',
        border: 'none',
        borderRadius: borderRadius.lg,
        cursor: 'pointer',
        transition: transitions.fast,
      };
    } else {
      return {
        padding: '0.75rem 1.5rem',
        fontSize: typography.fontSize.sm,
        fontWeight: typography.fontWeight.medium,
        backgroundColor: 'transparent',
        color: theme.text.secondary,
        border: `1px solid ${theme.border.default}`,
        borderRadius: borderRadius.lg,
        cursor: 'pointer',
        transition: transitions.fast,
      };
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={titleStyle}>ÉTAPE 6 : PERSONNALISEZ</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={onBack} style={buttonStyle('secondary')}>
            ← Retour
          </button>
          <button onClick={handleExport} style={buttonStyle('primary')}>
            Exporter →
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={mainStyle}>
        {/* Bibliothèque d'images */}
        <div style={sidebarStyle}>
          <div>
            <h2 style={sidebarTitleStyle}>Bibliothèque d'images</h2>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={e => e.target.files && handleAddImages(e.target.files)}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              style={addButtonStyle}
            >
              + Importer
            </button>
          </div>

          <div>
            <p style={{
              fontSize: typography.fontSize.xs,
              color: theme.text.tertiary,
              marginBottom: '0.75rem',
            }}>
              Glissez les images vers le preview →
            </p>
            <div style={imageGridStyle}>
              {libraryImages.map(image => (
                <div
                  key={image.id}
                  draggable
                  onDragStart={e => handleDragStart(e, image)}
                  onDragEnd={handleDragEnd}
                  style={imageItemStyle}
                  onMouseEnter={(e) => {
                    const btn = e.currentTarget.querySelector('.remove-btn') as HTMLElement;
                    if (btn) btn.style.opacity = '1';
                  }}
                  onMouseLeave={(e) => {
                    const btn = e.currentTarget.querySelector('.remove-btn') as HTMLElement;
                    if (btn) btn.style.opacity = '0';
                  }}
                >
                  <img
                    src={image.dataUrl}
                    alt={image.filename}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      pointerEvents: 'none',
                    }}
                  />
                  <button
                    className="remove-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveLibraryImage(image.id);
                    }}
                    style={removeImageButtonStyle}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Preview */}
        <div style={previewContainerStyle}>
          {/* Toolbar d'édition */}
          <div style={{
            padding: '0.75rem 1rem',
            backgroundColor: theme.bg.secondary,
            borderBottom: `1px solid ${theme.border.light}`,
            display: 'flex',
            gap: '1rem',
            alignItems: 'center',
          }}>
            <span style={{
              fontSize: typography.fontSize.sm,
              color: theme.text.secondary,
            }}>
              💡 Cliquez sur les textes pour les modifier
            </span>
            <div style={{ flex: 1 }} />
            <button
              onClick={() => {
                const iframe = iframeRef.current;
                if (iframe?.contentWindow) {
                  // @ts-ignore
                  iframe.contentWindow.resetAllEdits?.();
                }
              }}
              style={{
                padding: '0.5rem 1rem',
                fontSize: typography.fontSize.xs,
                fontWeight: typography.fontWeight.medium,
                backgroundColor: 'transparent',
                color: theme.text.secondary,
                border: `1px solid ${theme.border.default}`,
                borderRadius: borderRadius.md,
                cursor: 'pointer',
                transition: transitions.fast,
              }}
            >
              ↺ Tout réinitialiser
            </button>
          </div>
          
          {/* iframe */}
          <iframe
            ref={iframeRef}
            srcDoc={initialHtml}
            style={iframeStyle}
            title="Portfolio Preview"
          />
        </div>
      </div>
    </div>
  );
};
