import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ImagePlaceholder } from './ImagePlaceholder';
import { ImageLibrary, LibraryImage } from './ImageLibrary';
import { useTheme } from '../../ThemeContext';

interface Project {
  title: string;
  description: string;
  category?: string;
  image?: string;
}

interface PortfolioData {
  heroTitle: string;
  heroSubtitle: string;
  aboutText: string;
  heroImage?: string;
  aboutImage?: string;
  projects?: Project[];
}

interface ImageAssignments {
  hero?: string;
  about?: string;
  [key: string]: string | undefined;  // project-0, project-1, etc.
}

interface EditablePreviewProps {
  portfolioData: PortfolioData;
  initialHtml: string;
  onHtmlUpdate: (html: string) => void;
  onBack?: () => void;
  onExport?: () => void;
}

export const EditablePreview = React.memo<EditablePreviewProps>(({
  portfolioData,
  initialHtml,
  onHtmlUpdate,
  onBack,
  onExport,
}) => {
  const theme = useTheme();
  const [libraryImages, setLibraryImages] = useState<LibraryImage[]>([]);
  const [assignments, setAssignments] = useState<ImageAssignments>(() => ({
    hero: portfolioData.heroImage,
    about: portfolioData.aboutImage,
  }));

  // Initialiser les assignments des projets
  useEffect(() => {
    if (portfolioData.projects) {
      const projectAssignments: ImageAssignments = {};
      portfolioData.projects.forEach((project, index) => {
        if (project.image) {
          projectAssignments[`project-${index}`] = project.image;
        }
      });
      setAssignments(prev => ({ ...prev, ...projectAssignments }));
    }
  }, [portfolioData.projects]);

  // Mettre à jour le HTML quand les assignments changent
  useEffect(() => {
    const updatedHtml = injectImagesIntoHtml(initialHtml, assignments);
    onHtmlUpdate(updatedHtml);
  }, [assignments, initialHtml, onHtmlUpdate]);

  const handleAddImages = useCallback(async (files: FileList) => {
    const newImages: LibraryImage[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Vérifier que c'est bien une image
      if (!file.type.startsWith('image/')) {
        console.warn(`Fichier ${file.name} ignoré (type non supporté: ${file.type})`);
        continue;
      }
      
      try {
        const dataUrl = await fileToDataUrl(file);
        newImages.push({
          id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          filename: file.name,
          dataUrl,
        });
      } catch (error) {
        console.error(`Erreur lecture ${file.name}:`, error);
      }
    }
    
    setLibraryImages(prev => [...prev, ...newImages]);
  }, []);

  const handleRemoveLibraryImage = useCallback((id: string) => {
    setLibraryImages(prev => prev.filter(img => img.id !== id));
  }, []);

  const handleImageAssign = useCallback((zone: string, dataUrl: string) => {
    setAssignments(prev => ({ ...prev, [zone]: dataUrl }));
  }, []);

  const handleImageRemove = useCallback((zone: string) => {
    setAssignments(prev => {
      const newAssignments = { ...prev };
      delete newAssignments[zone];
      return newAssignments;
    });
  }, []);

  const projectsCount = useMemo(
    () => portfolioData.projects?.length || 0,
    [portfolioData.projects]
  );

  return (
    <div 
      className="flex flex-col h-full"
      style={{ backgroundColor: theme.background.secondary }}
    >
      {/* Header avec boutons */}
      <div 
        className="flex items-center justify-between p-4 border-b"
        style={{
          backgroundColor: theme.background.primary,
          borderColor: theme.border.default,
        }}
      >
        <h2 
          className="text-xl font-semibold"
          style={{ color: theme.text.primary }}
        >
          Personnalisation du Portfolio
        </h2>
        
        <div className="flex gap-2">
          {onBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: theme.background.secondary,
                color: theme.text.primary,
              }}
            >
              ← Retour
            </button>
          )}
          {onExport && (
            <button
              onClick={onExport}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{
                backgroundColor: theme.accent.primary,
                color: '#FFFFFF',
              }}
            >
              Exporter →
            </button>
          )}
        </div>
      </div>

      {/* Zone de preview */}
      <div className="flex-1 overflow-auto p-6">
        <div 
          className="max-w-4xl mx-auto rounded-xl shadow-lg overflow-hidden"
          style={{ backgroundColor: theme.background.primary }}
        >
          
          {/* Section Hero */}
          <section 
            className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8"
            style={{ borderRadius: theme.borderRadius.xl }}
          >
            <div className="flex flex-col justify-center">
              <h1 
                className="text-4xl font-bold"
                style={{ 
                  color: theme.text.primary,
                  fontSize: theme.typography.fontSize['2xl'],
                  fontWeight: theme.typography.fontWeight.bold,
                }}
              >
                {portfolioData.heroTitle}
              </h1>
              <p 
                className="mt-2"
                style={{ 
                  color: theme.text.secondary,
                  marginTop: theme.spacing.md,
                }}
              >
                {portfolioData.heroSubtitle}
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
          </section>

          {/* Section About */}
          <section 
            className="p-8"
            style={{ backgroundColor: theme.background.secondary }}
          >
            <h2 
              className="text-2xl font-bold mb-6"
              style={{ 
                color: theme.text.primary,
                fontSize: theme.typography.fontSize.xl,
                fontWeight: theme.typography.fontWeight.bold,
                marginBottom: theme.spacing.lg,
              }}
            >
              À propos
            </h2>
            <div className="flex gap-6 items-start">
              <ImagePlaceholder
                type="about"
                label="Photo de profil"
                currentImage={assignments.about}
                onImageDrop={(dataUrl) => handleImageAssign('about', dataUrl)}
                onImageRemove={() => handleImageRemove('about')}
              />
              <p 
                className="flex-1"
                style={{ color: theme.text.secondary }}
              >
                {portfolioData.aboutText}
              </p>
            </div>
          </section>

          {/* Section Projets */}
          {projectsCount > 0 && (
            <section 
              className="p-8"
              style={{ paddingTop: theme.spacing['2xl'] }}
            >
              <h2 
                className="text-2xl font-bold mb-6"
                style={{ 
                  color: theme.text.primary,
                  fontSize: theme.typography.fontSize.xl,
                  fontWeight: theme.typography.fontWeight.bold,
                  marginBottom: theme.spacing.lg,
                }}
              >
                Projets
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {portfolioData.projects?.map((project, index) => (
                  <ProjectCard
                    key={`project-${index}`}
                    project={project}
                    index={index}
                    currentImage={assignments[`project-${index}`]}
                    onImageDrop={(dataUrl) => handleImageAssign(`project-${index}`, dataUrl)}
                    onImageRemove={() => handleImageRemove(`project-${index}`)}
                  />
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
});

EditablePreview.displayName = 'EditablePreview';

// Sous-composant ProjectCard pour optimiser les re-renders
interface ProjectCardProps {
  project: Project;
  index: number;
  currentImage?: string;
  onImageDrop: (dataUrl: string) => void;
  onImageRemove: () => void;
}

const ProjectCard = React.memo<ProjectCardProps>(({
  project,
  index,
  currentImage,
  onImageDrop,
  onImageRemove,
}) => {
  const theme = useTheme();

  return (
    <div 
      className="border rounded-xl overflow-hidden shadow-sm"
      style={{
        backgroundColor: theme.background.primary,
        borderColor: theme.border.default,
        borderRadius: theme.borderRadius.xl,
      }}
    >
      <ImagePlaceholder
        type="project"
        label={project.title}
        currentImage={currentImage}
        onImageDrop={onImageDrop}
        onImageRemove={onImageRemove}
      />
      <div className="p-4" style={{ padding: theme.spacing.md }}>
        {project.category && (
          <span 
            className="text-xs font-medium uppercase"
            style={{
              color: theme.accent.primary,
              fontSize: theme.typography.fontSize.xs,
              fontWeight: theme.typography.fontWeight.medium,
            }}
          >
            {project.category}
          </span>
        )}
        <h3 
          className="font-semibold mt-1"
          style={{
            color: theme.text.primary,
            fontWeight: theme.typography.fontWeight.semibold,
            marginTop: theme.spacing.xs,
          }}
        >
          {project.title}
        </h3>
        <p 
          className="text-sm mt-1"
          style={{
            color: theme.text.secondary,
            fontSize: theme.typography.fontSize.sm,
            marginTop: theme.spacing.xs,
          }}
        >
          {project.description}
        </p>
      </div>
    </div>
  );
});

ProjectCard.displayName = 'ProjectCard';

// Utilitaires

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
      `data-image-zone="hero"><img src="${assignments.hero}" alt="Hero" class="w-full h-full object-cover"/></div>`
    );
  }

  // Injecter about image
  if (assignments.about) {
    result = result.replace(
      /data-image-zone="about"[^>]*>[\s\S]*?<\/div>/,
      `data-image-zone="about"><img src="${assignments.about}" alt="About" class="w-full h-full object-cover"/></div>`
    );
  }

  // Injecter project images
  Object.entries(assignments).forEach(([key, value]) => {
    if (key.startsWith('project-') && value) {
      const regex = new RegExp(
        `data-image-zone="${key}"[^>]*>[\\s\\S]*?<\\/div>`,
        'g'
      );
      result = result.replace(
        regex,
        `data-image-zone="${key}"><img src="${value}" alt="Project" class="w-full h-full object-cover"/></div>`
      );
    }
  });

  return result;
};
