import React, { useState } from 'react';
import { useTheme } from '../../../ThemeContext';
import { typography, borderRadius, spacing } from '../../../design-system';

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

  const handleSubmit = () => {
    if (!selectedType) return;

    const tag: MediaTag = {
      type: selectedType,
      projectName: selectedType === 'project' ? projectName : undefined,
    };

    onTag(tag);
    
    // Reset pour la prochaine image
    setSelectedType(null);
    setProjectName('');
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
    },
    preview: {
      width: '100%',
      maxHeight: '300px',
      objectFit: 'contain' as const,
      display: 'block',
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
          {previewUrl && <img src={previewUrl} alt={currentImage?.name} style={styles.preview} />}
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
