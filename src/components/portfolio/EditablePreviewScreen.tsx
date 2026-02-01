/**
 * SOUVERAIN - Editable Preview Screen
 * Écran de personnalisation visuelle post-génération
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useTheme } from '../../ThemeContext';
import { typography, borderRadius, transitions } from '../../design-system';
import { ImagePlaceholder } from './ImagePlaceholder';
import { ImageLibrary, LibraryImage } from './ImageLibrary';

// ============================================================
// TYPES
// ============================================================

interface Project {
  title: string;
  description: string;
  category?: string;
}

interface PortfolioData {
  firstName: string;
  lastName: string;
  title: string;
  bio?: string;
  aboutText?: string;
  projects?: Project[];
}

interface ImageAssignments {
  hero?: string;
  about?: string;
  [key: string]: string | undefined; // project-0, project-1, etc.
}

interface EditablePreviewScreenProps {
  portfolioData: PortfolioData;
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
  const [libraryImages, setLibraryImages] = useState<LibraryImage[]>([]);
  const [assignments, setAssignments] = useState<ImageAssignments>({});
  const [currentHtml, setCurrentHtml] = useState<string>(initialHtml);

  // Mettre à jour le HTML quand les assignments changent
  useEffect(() => {
    const updatedHtml = injectImagesIntoHtml(initialHtml, assignments);
    setCurrentHtml(updatedHtml);
  }, [assignments, initialHtml]);

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

  const handleImageAssign = useCallback((zone: string, dataUrl: string) => {
    setAssignments((prev) => ({ ...prev, [zone]: dataUrl }));
  }, []);

  const handleImageRemove = useCallback((zone: string) => {
    setAssignments((prev) => {
      const newAssignments = { ...prev };
      delete newAssignments[zone];
      return newAssignments;
    });
  }, []);

  const handleExport = useCallback(() => {
    onExport(currentHtml);
  }, [currentHtml, onExport]);

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
    overflow: 'auto',
    padding: '2rem',
    backgroundColor: theme.bg.tertiary,
  };

  const previewContainerStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    backgroundColor: theme.bg.primary,
    borderRadius: borderRadius.xl,
    boxShadow: theme.shadow.lg,
    overflow: 'hidden',
  };

  const sectionStyle: React.CSSProperties = {
    padding: '2rem',
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: typography.fontSize['2xl'],
    fontWeight: typography.fontWeight.bold,
    color: theme.text.primary,
    marginBottom: '1.5rem',
  };

  const projectsGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
  };

  const projectCardStyle: React.CSSProperties = {
    backgroundColor: theme.bg.secondary,
    border: `1px solid ${theme.border.light}`,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  };

  const projectContentStyle: React.CSSProperties = {
    padding: '1rem',
  };

  const projectTitleStyle: React.CSSProperties = {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: theme.text.primary,
    marginTop: '0.5rem',
  };

  const projectDescStyle: React.CSSProperties = {
    fontSize: typography.fontSize.sm,
    color: theme.text.secondary,
    marginTop: '0.5rem',
  };

  const categoryStyle: React.CSSProperties = {
    fontSize: typography.fontSize.xs,
    color: theme.accent.primary,
    fontWeight: typography.fontWeight.medium,
    textTransform: 'uppercase' as const,
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
          <button
            onClick={onBack}
            style={buttonStyle('secondary')}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.bg.tertiary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            ← Retour
          </button>
          <button
            onClick={handleExport}
            style={buttonStyle('primary')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.02)';
              e.currentTarget.style.boxShadow = theme.shadow.md;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Exporter →
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={mainContentStyle}>
        <div style={previewContainerStyle}>
          {/* Section Hero */}
          <section style={{ ...sectionStyle, backgroundColor: theme.bg.secondary }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem',
                alignItems: 'center',
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: typography.fontSize['4xl'],
                    fontWeight: typography.fontWeight.bold,
                    color: theme.text.primary,
                    marginBottom: '0.5rem',
                  }}
                >
                  {portfolioData.firstName} {portfolioData.lastName}
                </h1>
                <p style={{ fontSize: typography.fontSize.lg, color: theme.text.secondary }}>
                  {portfolioData.title}
                </p>
              </div>
              <div>
                <ImagePlaceholder
                  type="hero"
                  label="Image Hero"
                  currentImage={assignments.hero}
                  onImageDrop={(dataUrl) => handleImageAssign('hero', dataUrl)}
                  onImageRemove={() => handleImageRemove('hero')}
                />
              </div>
            </div>
          </section>

          {/* Section About */}
          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>À propos</h2>
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
              <ImagePlaceholder
                type="about"
                label="Photo de profil"
                currentImage={assignments.about}
                onImageDrop={(dataUrl) => handleImageAssign('about', dataUrl)}
                onImageRemove={() => handleImageRemove('about')}
              />
              <p
                style={{
                  flex: 1,
                  fontSize: typography.fontSize.base,
                  color: theme.text.secondary,
                  lineHeight: typography.lineHeight.relaxed,
                }}
              >
                {portfolioData.bio || portfolioData.aboutText || 'Ajoutez une description...'}
              </p>
            </div>
          </section>

          {/* Section Projets */}
          {portfolioData.projects && portfolioData.projects.length > 0 && (
            <section style={{ ...sectionStyle, backgroundColor: theme.bg.tertiary }}>
              <h2 style={sectionTitleStyle}>Projets</h2>
              <div style={projectsGridStyle}>
                {portfolioData.projects.map((project, index) => (
                  <div key={index} style={projectCardStyle}>
                    <ImagePlaceholder
                      type="project"
                      label={project.title}
                      currentImage={assignments[`project-${index}`]}
                      onImageDrop={(dataUrl) => handleImageAssign(`project-${index}`, dataUrl)}
                      onImageRemove={() => handleImageRemove(`project-${index}`)}
                    />
                    <div style={projectContentStyle}>
                      {project.category && <span style={categoryStyle}>{project.category}</span>}
                      <h3 style={projectTitleStyle}>{project.title}</h3>
                      <p style={projectDescStyle}>{project.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
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

const injectImagesIntoHtml = (html: string, assignments: ImageAssignments): string => {
  let result = html;

  // Injecter hero image
  if (assignments.hero) {
    result = result.replace(
      /data-image-zone="hero"[^>]*>[\s\S]*?<\/div>/,
      `data-image-zone="hero"><img src="${assignments.hero}" alt="Hero" style="width: 100%; height: 100%; object-fit: cover;"/></div>`
    );
  }

  // Injecter about image
  if (assignments.about) {
    result = result.replace(
      /data-image-zone="about"[^>]*>[\s\S]*?<\/div>/,
      `data-image-zone="about"><img src="${assignments.about}" alt="About" style="width: 100%; height: 100%; object-fit: cover; border-radius: 50%;"/></div>`
    );
  }

  // Injecter project images
  Object.entries(assignments).forEach(([key, value]) => {
    if (key.startsWith('project-') && value) {
      const regex = new RegExp(`data-image-zone="${key}"[^>]*>[\\s\\S]*?<\\/div>`, 'g');
      result = result.replace(
        regex,
        `data-image-zone="${key}"><img src="${value}" alt="Project" style="width: 100%; height: 100%; object-fit: cover;"/></div>`
      );
    }
  });

  return result;
};
