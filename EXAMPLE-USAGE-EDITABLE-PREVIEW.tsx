/**
 * EXEMPLE D'UTILISATION COMPLET
 * Preview Éditable avec Drag & Drop Images
 * 
 * Ce fichier montre comment intégrer EditablePreview dans votre workflow
 */

import React, { useState } from 'react';
import { EditablePreview } from './src/components/portfolio/EditablePreview';
import type { PortfolioData } from './src/components/portfolio/types';

// ============================================================
// EXEMPLE 1: Utilisation Basique
// ============================================================

export const BasicExample = () => {
  const [finalHtml, setFinalHtml] = useState<string>('');

  const portfolioData: PortfolioData = {
    heroTitle: 'Jean Dupont',
    heroSubtitle: 'Développeur Full Stack Freelance',
    aboutText: 'Passionné par le web depuis 10 ans...',
    projects: [
      {
        title: 'E-commerce Kelios',
        description: 'Plateforme de vente en ligne',
        category: 'Web',
      },
      {
        title: 'App Fitness Tracker',
        description: 'Application mobile de suivi sportif',
        category: 'Mobile',
      },
    ],
  };

  const initialHtml = `
    <!DOCTYPE html>
    <html>
      <head><title>Portfolio</title></head>
      <body>
        <div data-image-zone="hero"></div>
        <div data-image-zone="about"></div>
        <div data-image-zone="project-0"></div>
        <div data-image-zone="project-1"></div>
      </body>
    </html>
  `;

  return (
    <EditablePreview
      portfolioData={portfolioData}
      initialHtml={initialHtml}
      onHtmlUpdate={setFinalHtml}
      onExport={() => {
        // Télécharger le HTML final
        const blob = new Blob([finalHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'portfolio.html';
        a.click();
      }}
    />
  );
};

// ============================================================
// EXEMPLE 2: Intégration dans un Wizard Multi-étapes
// ============================================================

type WizardStep = 'info' | 'projects' | 'generate' | 'preview' | 'export';

export const WizardExample = () => {
  const [step, setStep] = useState<WizardStep>('info');
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [generatedHtml, setGeneratedHtml] = useState<string>('');
  const [finalHtml, setFinalHtml] = useState<string>('');

  const handleGeneration = async (data: PortfolioData) => {
    // Appeler votre service de génération
    const html = await generatePortfolioHtml(data);
    setGeneratedHtml(html);
    setPortfolioData(data);
    setStep('preview');
  };

  const handleExport = () => {
    setStep('export');
    // Logique d'export (download, save to DB, etc.)
    exportPortfolio(finalHtml);
  };

  return (
    <div className="wizard-container">
      {step === 'info' && (
        <InfoStep onNext={(data) => {
          setPortfolioData(data);
          setStep('projects');
        }} />
      )}

      {step === 'projects' && (
        <ProjectsStep 
          onNext={() => setStep('generate')}
          onBack={() => setStep('info')}
        />
      )}

      {step === 'generate' && portfolioData && (
        <GenerateStep 
          data={portfolioData}
          onComplete={handleGeneration}
          onBack={() => setStep('projects')}
        />
      )}

      {step === 'preview' && portfolioData && (
        <EditablePreview
          portfolioData={portfolioData}
          initialHtml={generatedHtml}
          onHtmlUpdate={setFinalHtml}
          onBack={() => setStep('generate')}
          onExport={handleExport}
        />
      )}

      {step === 'export' && (
        <ExportConfirmation html={finalHtml} />
      )}
    </div>
  );
};

// ============================================================
// EXEMPLE 3: Avec Hook Custom useImageLibrary
// ============================================================

import { useImageLibrary } from './src/hooks/useImageLibrary';

export const HookExample = () => {
  const {
    libraryImages,
    assignments,
    addImages,
    removeImage,
    assignImage,
    removeAssignment,
  } = useImageLibrary({
    hero: '/assets/default-hero.jpg',  // Images par défaut
  });

  // Utiliser dans votre UI personnalisée
  return (
    <div>
      <button onClick={() => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = 'image/*';
        input.onchange = (e) => {
          const files = (e.target as HTMLInputElement).files;
          if (files) addImages(files);
        };
        input.click();
      }}>
        Importer Images
      </button>

      <div className="library">
        {libraryImages.map(img => (
          <div key={img.id} draggable>
            <img src={img.dataUrl} alt={img.filename} />
            <button onClick={() => removeImage(img.id)}>×</button>
          </div>
        ))}
      </div>

      <div className="preview">
        {assignments.hero && (
          <img src={assignments.hero} alt="Hero" />
        )}
      </div>
    </div>
  );
};

// ============================================================
// EXEMPLE 4: Sauvegarde État dans localStorage
// ============================================================

export const PersistentExample = () => {
  const [assignments, setAssignments] = useState<Record<string, string>>(() => {
    // Charger depuis localStorage au démarrage
    const saved = localStorage.getItem('portfolio_images');
    return saved ? JSON.parse(saved) : {};
  });

  const handleImageUpdate = (zone: string, dataUrl: string) => {
    const newAssignments = { ...assignments, [zone]: dataUrl };
    setAssignments(newAssignments);
    
    // Sauvegarder automatiquement
    localStorage.setItem('portfolio_images', JSON.stringify(newAssignments));
  };

  return (
    <EditablePreview
      portfolioData={portfolioData}
      initialHtml={initialHtml}
      onHtmlUpdate={(html) => {
        // HTML contient déjà les images via assignments
        console.log('HTML mis à jour');
      }}
    />
  );
};

// ============================================================
// EXEMPLE 5: Validation & Limites
// ============================================================

export const ValidationExample = () => {
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  const validateFiles = (files: FileList): FileList | null => {
    const validFiles: File[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Check type
      if (!ALLOWED_TYPES.includes(file.type)) {
        alert(`${file.name}: Type non supporté (uniquement JPG, PNG, WebP)`);
        continue;
      }

      // Check size
      if (file.size > MAX_FILE_SIZE) {
        alert(`${file.name}: Fichier trop lourd (max 5MB)`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) return null;

    // Convert back to FileList (workaround)
    const dataTransfer = new DataTransfer();
    validFiles.forEach(file => dataTransfer.items.add(file));
    return dataTransfer.files;
  };

  const handleAddImages = (files: FileList) => {
    const validFiles = validateFiles(files);
    if (validFiles) {
      // Proceed with valid files
      addImagesToLibrary(validFiles);
    }
  };

  return (
    <ImageLibrary
      images={libraryImages}
      onAddImages={handleAddImages}
      onRemoveImage={removeImage}
    />
  );
};

// ============================================================
// EXEMPLE 6: Preview avec Analytics
// ============================================================

export const AnalyticsExample = () => {
  const trackImageDrop = (zone: string) => {
    // Envoyer event analytics
    analytics.track('portfolio_image_dropped', {
      zone,
      timestamp: Date.now(),
    });
  };

  const trackExport = () => {
    analytics.track('portfolio_exported', {
      images_count: Object.keys(assignments).length,
      timestamp: Date.now(),
    });
  };

  return (
    <EditablePreview
      portfolioData={portfolioData}
      initialHtml={initialHtml}
      onHtmlUpdate={(html) => {
        // Compter les images dans le HTML
        const imgCount = (html.match(/<img/g) || []).length;
        console.log(`${imgCount} images dans le portfolio`);
      }}
      onExport={() => {
        trackExport();
        exportPortfolio(finalHtml);
      }}
    />
  );
};

// ============================================================
// UTILITAIRES
// ============================================================

const generatePortfolioHtml = async (data: PortfolioData): Promise<string> => {
  // Votre logique de génération (template engine, IA, etc.)
  return '<html>...</html>';
};

const exportPortfolio = (html: string) => {
  // Download HTML file
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `portfolio-${Date.now()}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const addImagesToLibrary = async (files: FileList) => {
  // Implementation
};

// Composants placeholder pour l'exemple
const InfoStep = ({ onNext }: any) => <div>Step 1</div>;
const ProjectsStep = ({ onNext, onBack }: any) => <div>Step 2</div>;
const GenerateStep = ({ data, onComplete, onBack }: any) => <div>Step 3</div>;
const ExportConfirmation = ({ html }: any) => <div>Export</div>;
const portfolioData: PortfolioData = {} as any;
const initialHtml = '';
const finalHtml = '';
const libraryImages: any[] = [];
const removeImage = () => {};
const assignments: any = {};
const analytics = { track: () => {} };
const addImages = () => {};
