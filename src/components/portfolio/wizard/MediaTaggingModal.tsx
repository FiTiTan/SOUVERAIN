import React, { useState, useCallback } from 'react';
import { useTheme } from '../../../ThemeContext';
import { typography, borderRadius, spacing } from '../../../design-system';
import Cropper from 'react-easy-crop';
import { Area } from 'react-easy-crop/types';

interface MediaTaggingModalProps {
  images: File[];
  currentIndex: number;
  onTag: (tag: MediaTag) => void;
  onSkip: () => void;
  onClose: () => void;
}

export interface MediaTag {
  type: 'profile' | 'business' | 'project';
  projectName?: string;
  croppedImageUrl?: string;
}

export const MediaTaggingModal: React.FC<MediaTaggingModalProps> = ({
  images,
  currentIndex,
  onTag,
  onSkip,
  onClose,
}) => {
  const { theme } = useTheme();
  const [selectedType, setSelectedType] = useState<'profile' | 'business' | 'project' | null>(null);
  const [projectName, setProjectName] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  
  // Crop state
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const currentImage = images[currentIndex];
  const totalImages = images.length;

  // Générer la preview de l'image
  React.useEffect(() => {
    if (currentImage) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(currentImage);
    }
  }, [currentImage]);

  // Reset crop quand le type change
  React.useEffect(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  }, [selectedType]);

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Get aspect ratio based on type
  const getAspectRatio = () => {
    switch (selectedType) {
      case 'profile':
        return 1; // 1:1 carré
      case 'business':
        return 16 / 9; // 16:9 banner
      case 'project':
        return 16 / 10; // 16:10 projet
      default:
        return 4 / 3; // Default
    }
  };

  // Create cropped image
  const createCroppedImage = async (
    imageSrc: string,
    pixelCrop: Area
  ): Promise<string> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('No 2d context');
    }

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error('Canvas is empty');
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(blob);
      }, 'image/jpeg', 0.92);
    });
  };

  const createImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.src = url;
    });
  };

  const handleSubmit = async () => {
    if (!selectedType || !croppedAreaPixels) return;

    try {
      // Créer l'image croppée
      const croppedImage = await createCroppedImage(previewUrl, croppedAreaPixels);

      const tag: MediaTag = {
        type: selectedType,
        projectName: selectedType === 'project' ? projectName : undefined,
        croppedImageUrl: croppedImage, // Passer l'image croppée
      };

      onTag(tag);
      
      // Reset pour la prochaine image
      setSelectedType(null);
      setProjectName('');
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
    } catch (error) {
      console.error('Error creating cropped image:', error);
    }
  };

  const canSubmit = selectedType && (selectedType !== 'project' || projectName.trim().length > 0);

  const styles = {
    overlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      backdropFilter: 'blur(4px)',
    },
    modal: {
      backgroundColor: theme.bg.primary,
      borderRadius: borderRadius.xl,
      padding: spacing[8],
      maxWidth: '600px',
      width: '90%',
      maxHeight: '90vh',
      overflow: 'auto',
      boxShadow: theme.shadow.xl,
    },
    header: {
      marginBottom: spacing[6],
    },
    progress: {
      fontSize: typography.fontSize.sm,
      color: theme.text.secondary,
      marginBottom: spacing[2],
    },
    title: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: theme.text.primary,
    },
    previewContainer: {
      marginBottom: spacing[6],
      borderRadius: borderRadius.lg,
      overflow: 'hidden',
      border: `2px solid ${theme.border.default}`,
      backgroundColor: theme.bg.secondary,
      position: 'relative' as const,
      height: '400px',
    },
    cropperContainer: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    cropInfo: {
      position: 'absolute' as const,
      bottom: spacing[3],
      left: spacing[3],
      right: spacing[3],
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      color: '#FFFFFF',
      padding: spacing[2],
      borderRadius: borderRadius.md,
      fontSize: typography.fontSize.xs,
      textAlign: 'center' as const,
      zIndex: 10,
    },
    question: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text.primary,
      marginBottom: spacing[4],
    },
    options: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: spacing[3],
      marginBottom: spacing[6],
    },
    option: {
      display: 'flex',
      alignItems: 'center',
      padding: spacing[4],
      borderRadius: borderRadius.lg,
      border: `2px solid ${theme.border.default}`,
      backgroundColor: theme.bg.secondary,
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    optionSelected: {
      borderColor: theme.accent.primary,
      backgroundColor: theme.accent.muted,
    },
    radio: {
      marginRight: spacing[3],
    },
    optionLabel: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium,
      color: theme.text.primary,
      flex: 1,
    },
    projectInput: {
      marginLeft: spacing[8],
      marginTop: spacing[2],
    },
    input: {
      width: '100%',
      padding: spacing[3],
      fontSize: typography.fontSize.base,
      border: `1px solid ${theme.border.default}`,
      borderRadius: borderRadius.md,
      backgroundColor: theme.bg.primary,
      color: theme.text.primary,
    },
    actions: {
      display: 'flex',
      gap: spacing[3],
      justifyContent: 'space-between',
    },
    button: {
      padding: `${spacing[3]} ${spacing[6]}`,
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium,
      borderRadius: borderRadius.lg,
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s',
    },
    buttonSecondary: {
      backgroundColor: theme.bg.tertiary,
      color: theme.text.secondary,
    },
    buttonPrimary: {
      backgroundColor: theme.accent.primary,
      color: '#FFFFFF',
    },
    buttonDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
  };

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <div style={styles.progress}>
            Image {currentIndex + 1} / {totalImages}
          </div>
          <h2 style={styles.title}>Taguer l'image</h2>
        </div>

        <div style={styles.previewContainer}>
          {previewUrl && selectedType && (
            <>
              <div style={styles.cropperContainer}>
                <Cropper
                  image={previewUrl}
                  crop={crop}
                  zoom={zoom}
                  aspect={getAspectRatio()}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              </div>
              <div style={styles.cropInfo}>
                Ajustez le cadrage avec le drag et le scroll/pinch pour zoomer
              </div>
            </>
          )}
          {previewUrl && !selectedType && (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.text.secondary,
            }}>
              Sélectionnez un type ci-dessous pour activer le crop
            </div>
          )}
        </div>

        <div style={styles.question}>À quoi correspond cette image ?</div>

        <div style={styles.options}>
          <div
            style={{
              ...styles.option,
              ...(selectedType === 'profile' ? styles.optionSelected : {}),
            }}
            onClick={() => setSelectedType('profile')}
          >
            <input
              type="radio"
              checked={selectedType === 'profile'}
              onChange={() => setSelectedType('profile')}
              style={styles.radio}
            />
            <span style={styles.optionLabel}>📸 Profil (photo de vous)</span>
          </div>

          <div
            style={{
              ...styles.option,
              ...(selectedType === 'business' ? styles.optionSelected : {}),
            }}
            onClick={() => setSelectedType('business')}
          >
            <input
              type="radio"
              checked={selectedType === 'business'}
              onChange={() => setSelectedType('business')}
              style={styles.radio}
            />
            <span style={styles.optionLabel}>🏢 Boutique/Entreprise (logo, vitrine)</span>
          </div>

          <div>
            <div
              style={{
                ...styles.option,
                ...(selectedType === 'project' ? styles.optionSelected : {}),
              }}
              onClick={() => setSelectedType('project')}
            >
              <input
                type="radio"
                checked={selectedType === 'project'}
                onChange={() => setSelectedType('project')}
                style={styles.radio}
              />
              <span style={styles.optionLabel}>📁 Projet</span>
            </div>
            {selectedType === 'project' && (
              <div style={styles.projectInput}>
                <input
                  type="text"
                  placeholder="Nom du projet (ex: FitTitan)"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  style={styles.input}
                  autoFocus
                />
              </div>
            )}
          </div>
        </div>

        <div style={styles.actions}>
          <button
            onClick={onSkip}
            style={{ ...styles.button, ...styles.buttonSecondary }}
          >
            Passer
          </button>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            style={{
              ...styles.button,
              ...styles.buttonPrimary,
              ...(canSubmit ? {} : styles.buttonDisabled),
            }}
          >
            {currentIndex < totalImages - 1 ? 'Suivant →' : 'Terminer'}
          </button>
        </div>
      </div>
    </div>
  );
};
