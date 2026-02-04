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
  { id: 'person', label: 'Une personne', icon: '👤', hint: 'Freelance, salarié, artisan...' },
  { id: 'place', label: 'Un lieu / Une entreprise', icon: '📍', hint: 'Restaurant, boutique, cabinet...' },
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

// Liste des plateformes sociales disponibles
export const SOCIAL_PLATFORMS: { id: SocialPlatform; label: string }[] = [
  { id: 'instagram', label: 'Instagram' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'tiktok', label: 'TikTok' },
  { id: 'youtube', label: 'YouTube' },
  { id: 'behance', label: 'Behance' },
  { id: 'github', label: 'GitHub' },
  { id: 'dribbble', label: 'Dribbble' },
  { id: 'twitter', label: 'Twitter' },
  { id: 'facebook', label: 'Facebook' },
  { id: 'malt', label: 'Malt' },
  { id: 'pinterest', label: 'Pinterest' },
  { id: 'medium', label: 'Medium' },
  { id: 'other', label: 'Autre' },
];

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

// Labels pour les services selon le profileType
export const getServiceLabel = (profileType: string | null): string => {
  const labels: Record<string, string> = {
    freelance: 'Services',
    commerce: 'Spécialités',
    creative: 'Spécialités',
    student: 'Compétences',
    employee: "Domaines d'expertise",
    person: 'Services',
    place: 'Spécialités',
  };
  return profileType ? labels[profileType] : 'Services';
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

// Placeholders pour les services selon le profileType
export const getServicePlaceholder = (profileType: string | null, index: number): string => {
  const placeholders: Record<string, string[]> = {
    freelance: ['Design UX', 'Développement web', 'Conseil stratégique'],
    commerce: ['Cafés de spécialité', 'Pâtisseries maison', 'Brunchs'],
    creative: ['Photo portrait', 'Vidéo corporate', 'Montage'],
    student: ['Python', 'Marketing digital', 'Anglais courant'],
    employee: ['Management', 'Finance', 'Stratégie'],
    person: ['Design UX', 'Développement web', 'Conseil stratégique'],
    place: ['Cafés de spécialité', 'Pâtisseries maison', 'Brunchs'],
  };
  return profileType ? (placeholders[profileType]?.[index] || '') : '';
};

// Labels dynamiques selon le ProfileContext (pour wizard V2)
export const getContextLabels = (context: ProfileContext | null, isPlace: boolean = false) => {
  const labels: Record<ProfileContext, {
    activityLabel: string;
    activityPlaceholder: string;
    expertisesLabel: string;
    expertisesHelper: string;
    expertisesPlaceholders: string[];
  }> = {
    food: {
      activityLabel: 'Type de lieu',
      activityPlaceholder: 'Ex: Coffee shop, Restaurant, Boulangerie',
      expertisesLabel: 'Spécialités',
      expertisesHelper: 'Ce que vous proposez à la carte',
      expertisesPlaceholders: ['Cafés de spécialité', 'Pâtisseries maison', 'Brunchs'],
    },
    retail: {
      activityLabel: 'Type de lieu',
      activityPlaceholder: 'Ex: Boutique vêtements, Fleuriste, Librairie',
      expertisesLabel: 'Types de produits',
      expertisesHelper: "Ce qu'on trouve chez vous",
      expertisesPlaceholders: ['Robes de mariée', 'Accessoires', 'Sur-mesure'],
    },
    artisan: {
      activityLabel: 'Métier',
      activityPlaceholder: 'Ex: Plombier, Électricien, Menuisier',
      expertisesLabel: 'Savoir-faire',
      expertisesHelper: 'Ce que vous savez faire',
      expertisesPlaceholders: ['Dépannage urgent', 'Installation', 'Rénovation'],
    },
    service: {
      activityLabel: 'Métier',
      activityPlaceholder: 'Ex: Avocat, Coach sportif, Photographe',
      expertisesLabel: 'Domaines',
      expertisesHelper: "Vos domaines d'intervention",
      expertisesPlaceholders: ['Divorce amiable', "Garde d'enfants", 'Médiation'],
    },
    tech: {
      activityLabel: 'Métier',
      activityPlaceholder: 'Ex: Développeur web, Designer UI/UX, Graphiste',
      expertisesLabel: 'Expertises',
      expertisesHelper: 'Vos compétences clés',
      expertisesPlaceholders: ['React / Vue.js', 'API Node.js', 'E-commerce'],
    },
    niche: {
      activityLabel: 'Métier',
      activityPlaceholder: 'Ex: Tatoueur, Sophrologue, DJ',
      expertisesLabel: 'Spécialités',
      expertisesHelper: 'Ce que vous proposez',
      expertisesPlaceholders: ['Tatouage réaliste', 'Cover-up', 'Dotwork'],
    },
  };

  if (!context) {
    return isPlace ? labels.food : labels.service;
  }

  return labels[context];
};

// Labels pour sections du portfolio selon le ProfileContext
export const getSectionLabels = (context: ProfileContext | null) => {
  const labels: Record<ProfileContext, {
    services: string;
    realisations: string;
    about: string;
  }> = {
    food: {
      services: 'Notre carte',
      realisations: 'Nos créations',
      about: 'Notre histoire',
    },
    retail: {
      services: 'Nos produits',
      realisations: 'Nos collections',
      about: 'Notre boutique',
    },
    artisan: {
      services: 'Prestations',
      realisations: 'Réalisations',
      about: 'Mon parcours',
    },
    service: {
      services: 'Services',
      realisations: 'Références',
      about: 'À propos',
    },
    tech: {
      services: 'Prestations',
      realisations: 'Projets',
      about: 'À propos',
    },
    niche: {
      services: 'Services',
      realisations: 'Portfolio',
      about: 'À propos',
    },
  };

  return context ? labels[context] : labels.service;
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
