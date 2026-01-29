/**
 * SOUVERAIN - AssetPreviewModal
 * Affiche un aperçu agrandi d'un asset (image, PDF, etc.)
 */
import React from 'react';
import { useTheme } from '../../ThemeContext';
import { borderRadius, spacing, transitions } from '../../design-system';
import type { Asset } from '../../services/assetService';

interface AssetPreviewModalProps {
  asset: Asset;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
}

export const AssetPreviewModal: React.FC<AssetPreviewModalProps> = ({ 
  asset, 
  onClose,
  onNext,
  onPrev,
  hasPrev = false,
  hasNext = false
}) => {
  const { theme } = useTheme();

  // Gestion clavier
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && onNext && hasNext) onNext();
      if (e.key === 'ArrowLeft' && onPrev && hasPrev) onPrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext, onPrev, hasNext, hasPrev, onClose]);

  const styles = {
    overlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1100,
    },
    modal: {
      position: 'relative' as const, 
      backgroundColor: theme.bg.primary,
      borderRadius: borderRadius.lg,
      padding: spacing[2],
      maxWidth: '90vw',
      maxHeight: '90vh',
      width: 'auto',
      height: 'auto',
      display: 'flex',
      flexDirection: 'column' as const,
      boxShadow: theme.shadow.xl,
    },
    header: {
      padding: `${spacing[2]} ${spacing[4]}`, 
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    assetName: {
      color: theme.text.secondary,
      fontSize: '0.9rem',
    },
    closeButton: {
      width: '32px',
      height: '32px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
      border: `none`,
      borderRadius: borderRadius.full,
      cursor: 'pointer',
      fontSize: '1.2rem',
      color: theme.text.primary, // Plus visible
      transition: transitions.fast,
    },
    navButton: {
      position: 'absolute' as const,
      top: '50%',
      transform: 'translateY(-50%)',
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      color: 'white',
      border: 'none',
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      fontSize: '1.5rem',
      transition: 'all 0.2s',
      zIndex: 10,
    },
    prevButton: {
      left: '-60px',
    },
    nextButton: {
      right: '-60px',
    },
    content: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing[2], // Moins de padding pour plus d'image
      minHeight: '60vh', 
      minWidth: '60vw',
    },
    image: {
      maxWidth: '85vw',
      maxHeight: '80vh',
      objectFit: 'contain' as const,
      borderRadius: borderRadius.md,
    },
    placeholder: {
        width: '100%',
        height: '100%',
        minHeight: '400px',
        minWidth: '600px',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        color: theme.text.secondary,
        backgroundColor: theme.bg.secondary,
        borderRadius: borderRadius.md,
    },
    placeholderIcon: {
        fontSize: '4rem',
        marginBottom: spacing[4],
    },
  };
  
  const getAssetIcon = (format: string): string => {
    const lower = format.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(lower)) return '🖼️';
    if (['pdf'].includes(lower)) return '📄';
    if (['mp4', 'mov', 'webm', 'avi'].includes(lower)) return '🎬';
    return '📁';
  };

  const normalizedPath = asset.localPath ? `file:///${asset.localPath.replace(/\\/g, '/')}` : '';
  const lowerFormat = asset.format.toLowerCase();
  
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(lowerFormat);
  const isPdf = ['pdf'].includes(lowerFormat);
  const isVideo = ['mp4', 'mov', 'webm', 'avi'].includes(lowerFormat);

  // Fonction pour rendre le contenu approprié
  const renderContent = () => {
      if (isImage) {
          return (
            <img 
              src={normalizedPath} 
              alt={asset.originalFilename || 'Aperçu de l\'asset'}
              style={styles.image}
            />
          );
      }
      
      if (isPdf) {
          return (
             <embed 
               src={normalizedPath} 
               type="application/pdf"
               width="100%"
               height="100%"
               style={{ 
                 borderRadius: borderRadius.md,
                 minHeight: '80vh', // Force height explicitly
                 display: 'block'
               }}
             />
          );
      }

      if (isVideo) {
          return (
            <video 
              src={normalizedPath} 
              controls
              style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: borderRadius.md }}
            >
                Votre navigateur ne supporte pas la lecture de cette vidéo.
            </video>
          );
      }

      return (
        <div style={styles.placeholder}>
            <div style={styles.placeholderIcon}>{getAssetIcon(asset.format)}</div>
            <p>Aperçu non disponible pour ce format de fichier.</p>
            <div style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: theme.bg.tertiary, borderRadius: borderRadius.md }}>
                Format : {asset.format.toUpperCase()}
            </div>
        </div>
      );
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      {/* Navigation - Boutons flottants à l'extérieur du cadre */}
      {hasPrev && (
        <button 
          style={{ ...styles.navButton, ...styles.prevButton }}
          onClick={(e) => { e.stopPropagation(); onPrev?.(); }}
          className="hover:bg-white/20"
        >
          ‹
        </button>
      )}
      
      {hasNext && (
        <button 
          style={{ ...styles.navButton, ...styles.nextButton }}
          onClick={(e) => { e.stopPropagation(); onNext?.(); }}
          className="hover:bg-white/20"
        >
          ›
        </button>
      )}

      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <span style={styles.assetName}>{asset.originalFilename || 'Aperçu'}</span>
          <button
            style={styles.closeButton}
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        <div style={styles.content}>
          {renderContent()}
        </div>
      </div>
    </div>
  );
};
