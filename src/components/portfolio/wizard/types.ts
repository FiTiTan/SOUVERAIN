/**
 * SOUVERAIN - Portfolio Wizard Types V2
 * 
 * Mise à jour avec :
 * - profileContext (food, retail, tech, artisan, service, niche)
 * - expertises (3 spécialités)
 */

// ⚡ DEV MODE - Set to false for production
export const DEV_MODE = true;

// Type de profil simple (personne ou lieu)
export type ProfileType = 'person' | 'place';

// Options de sélection pour ProfileType
export const PROFILE_TYPES = [
  { id: 'person', label: 'Une personne', icon: '👤' },
  { id: 'place', label: 'Un lieu / Une entreprise', icon: '📍' },
];

// Contexte de profil détaillé (détecté automatiquement par IA)
export type ProfileContext = 
  | 'food'      // Restaurant, café, boulangerie...
  | 'retail'    // Boutique, fleuriste, librairie...
  | 'artisan'   // Plombier, électricien, menuisier...
  | 'service'   // Avocat, coach, comptable...
  | 'tech'      // Développeur, designer, graphiste...
  | 'niche';    // Tatoueur, DJ, sophrologue...

export type SocialPlatform = 
  | 'instagram' 
  | 'linkedin' 
  | 'tiktok' 
  | 'youtube' 
  | 'behance' 
  | 'github' 
  | 'dribbble'
  | 'twitter'
  | 'facebook'
  | 'malt'
  | 'pinterest'
  | 'medium'
  | 'other';

export interface SocialLink {
  platform: string;
  url: string;
  label?: string;
}

export interface ImportSource {
  type: 'website' | 'pdf' | 'linkedin' | 'notion';
  url?: string;
  filename?: string;
  extractedData?: {
    name?: string;
    title?: string;
    tagline?: string;
    email?: string;
    phone?: string;
    address?: string;
    socialLinks?: SocialLink[];
  };
}

export interface Realisation {
  id: string;
  title: string;
  description: string;
  category?: string;
  extractedContent?: string;
  image?: string;
}

export interface Media {
  url: string;
  alt?: string;
  optimized?: boolean;
  originalSize?: number;
  optimizedSize?: number;
  tag?: 'profile' | 'business' | 'project';
  projectName?: string;
}

// ============================================
// FORMULAIRE PRINCIPAL V2
// ============================================

export interface PortfolioFormDataV2 {
  // Identité
  portfolioId: string;
  name: string;
  profileType: ProfileType | null;      // person ou place
  profileContext: ProfileContext | null; // food, retail, tech... (détecté auto)
  title: string;                         // Métier / Type de lieu
  
  // Positionnement
  expertises: string[];                  // 3 spécialités
  tagline: string;                       // Slogan
  valueProp: string;                     // Ce qui vous différencie
  
  // Contact (surtout pour les lieux)
  email: string;
  phone: string;
  address: string;
  openingHours: string;
  
  // Sources importées
  importSources: ImportSource[];
  
  // Réseaux sociaux
  socialLinks: SocialLink[];
  
  // Réalisations
  realisations: Realisation[];
  
  // Médias
  media: Media[];
  imageAssignments: Record<string, string>;
  
  // Template
  templateId: string | null;
}

// ============================================
// PROPS DES STEPS
// ============================================

export interface WizardStepProps {
  formData: PortfolioFormDataV2;
  onUpdate: (updates: Partial<PortfolioFormDataV2>) => void;
  onNext: () => void;
  onBack: () => void;
}

// ============================================
// HELPERS
// ============================================

// Labels pour les services selon le contexte
export const getServiceLabel = (context: ProfileContext | null): string => {
  const labels: Record<ProfileContext, string> = {
    food: 'Spécialités',
    retail: 'Nos produits',
    artisan: 'Savoir-faire',
    service: 'Services',
    tech: 'Prestations',
    niche: 'Services',
  };
  return context ? labels[context] : 'Services';
};

// Labels pour les réalisations selon le contexte
export const getRealisationsLabel = (context: ProfileContext | null): string => {
  const labels: Record<ProfileContext, string> = {
    food: 'Notre carte',
    retail: 'Nos produits',
    artisan: 'Nos réalisations',
    service: 'Nos références',
    tech: 'Projets',
    niche: 'Portfolio',
  };
  return context ? labels[context] : 'Réalisations';
};

// ============================================
// DONNÉES INITIALES
// ============================================

const devFormData: PortfolioFormDataV2 = {
  portfolioId: 'dev-portfolio-001',
  name: 'Jean Dupont',
  profileType: 'person',
  profileContext: 'tech',
  title: 'Développeur Full-Stack',
  expertises: ['React / Next.js', 'Node.js / API', 'E-commerce'],
  tagline: 'Du concept au déploiement',
  valueProp: 'Spécialiste e-commerce, +30 boutiques livrées, code propre garanti',
  email: 'jean.dupont@example.com',
  phone: '+33 6 12 34 56 78',
  address: '',
  openingHours: '',
  importSources: [],
  socialLinks: [
    { platform: 'GitHub', url: 'github.com/jeandupont' },
    { platform: 'LinkedIn', url: 'linkedin.com/in/jeandupont' },
  ],
  realisations: [],
  media: [],
  imageAssignments: {},
  templateId: null,
};

const emptyFormData: PortfolioFormDataV2 = {
  portfolioId: '',
  name: '',
  profileType: null,
  profileContext: null,
  title: '',
  expertises: ['', '', ''],
  tagline: '',
  valueProp: '',
  email: '',
  phone: '',
  address: '',
  openingHours: '',
  importSources: [],
  socialLinks: [],
  realisations: [],
  media: [],
  imageAssignments: {},
  templateId: null,
};

export const initialFormData: PortfolioFormDataV2 = DEV_MODE ? devFormData : emptyFormData;

// ============================================
// VALIDATION
// ============================================

export const validateStepAbout = (data: PortfolioFormDataV2): boolean => {
  return (
    data.name.trim().length > 0 &&
    data.tagline.trim().length > 0
  );
};

export const validateStepRealisations = (data: PortfolioFormDataV2): boolean => {
  return true; // Réalisations optionnelles
};

export const validateStepTemplate = (data: PortfolioFormDataV2): boolean => {
  return data.templateId !== null;
};
