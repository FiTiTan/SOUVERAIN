/**
 * SOUVERAIN - Portfolio Component Types V2
 * Refonte partielle du wizard
 */

import type { PortfolioContext } from '../../config/portfolioLabels';

// Types existants conservés pour compatibilité
export interface LibraryImage {
  id: string;
  filename: string;
  dataUrl: string;
}

export interface ImageAssignments {
  hero?: string;
  about?: string;
  [key: string]: string | undefined; // project-0, project-1, etc.
}

export interface Project {
  title: string;
  description: string;
  category?: string;
}

export interface PortfolioPreviewData {
  firstName: string;
  lastName: string;
  title: string;
  bio?: string;
  aboutText?: string;
  projects?: Project[];
}

// ============================================================
// NOUVEAUX TYPES V2
// ============================================================

export type ProfileType = 'person' | 'place';

export type ImportSourceType = 'linkedin' | 'website' | 'google_business' | 'pdf' | 'text';

export interface ImportSource {
  type: ImportSourceType;
  url?: string;
  filePath?: string;
  rawContent?: string;
  extractedData?: any;
}

export interface SocialLink {
  platform: string;
  url: string;
  label?: string;
}

export interface Service {
  title: string;
  description: string;
  suggested?: boolean;  // Suggéré par l'IA
}

export interface Realisation {
  id: string;
  title: string;
  description: string;
  category?: string;
  source: {
    type: 'pdf' | 'notion' | 'url' | 'manual';
    path?: string;
    url?: string;
  };
  image?: string;  // Ajouté au Step 6
  extractedContent?: string;  // Contenu complet extrait (PDF, Notion, etc.) pour GROQ
}

/**
 * Structure complète du formulaire Portfolio V2
 */
export interface PortfolioFormDataV2 {
  // Step 1 : À Propos
  profileType: ProfileType;
  profileContext: PortfolioContext;
  
  name: string;
  title?: string;
  tagline: string;
  
  importSources: ImportSource[];
  
  socialLinks: SocialLink[];
  
  // Infos lieu uniquement (si profileType === 'place')
  address?: string;
  phone?: string;
  email?: string;
  openingHours?: string;

  // Step 2 : Expertise
  services: Service[];
  valueProp: string;

  // Step 3 : Réalisations
  realisations: Realisation[];

  // Step 4 : Template
  templateId: string;

  // Step 6 : Images
  imageAssignments: ImageAssignments;
  
  // Métadonnées
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * État du wizard (step en cours, validation...)
 */
export interface WizardState {
  currentStep: number;
  totalSteps: number;
  formData: PortfolioFormDataV2;
  isGenerating: boolean;
  generationProgress: number;
  errors: Record<string, string>;
}

/**
 * Props communes aux composants Step
 */
export interface WizardStepProps {
  formData: PortfolioFormDataV2;
  onUpdate: (updates: Partial<PortfolioFormDataV2>) => void;
  onNext: () => void;
  onBack: () => void;
}

/**
 * Résultat du scraping d'un site web
 */
export interface ScrapedWebsite {
  name?: string;
  title?: string;
  tagline?: string;
  description?: string;
  email?: string;
  phone?: string;
  address?: string;
  socialLinks?: SocialLink[];
  services?: Array<{ title: string; description: string }>;
  images?: string[];
  realisations?: Array<{ title: string; description: string }>;
}
