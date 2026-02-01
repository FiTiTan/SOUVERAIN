// Type definitions for Portfolio Wizard V2

// ⚡ DEV MODE - Set to false for production
export const DEV_MODE = true;

export type ProfileType = 'freelance' | 'commerce' | 'creative' | 'student' | 'employee';

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
  | 'other';

export interface SocialLink {
  platform: SocialPlatform;
  url: string;
  label?: string; // For "other" platform
}

export interface Project {
  id?: string;
  title: string;
  description?: string;
  image?: string;
  category?: string;
  link?: string;
}

export interface Testimonial {
  text: string;
  author: string;
  role?: string;
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

export interface UploadedFile {
  path: string;           // Chemin sur disque
  type: string;           // 'pdf', 'image', 'doc', etc.
  filename: string;       // Nom original
  associatedProject?: string; // ID du projet associé (optionnel)
}

export interface PortfolioFormData {
  // Step 1: Identity
  name: string;
  profileType: ProfileType | null;
  tagline: string;

  // Step 2: Offer
  services: string[];
  valueProp: string;

  // Step 3: Contact
  email: string;
  phone: string;
  address: string;
  openingHours: string;

  // Step 4: Documents
  uploadedFiles: UploadedFile[];  // ← NOUVEAU : chemins des fichiers uploadés
  notionData: string;
  linkedInData?: string;  // ← Ajouté pour LinkedIn

  // Step 5: Social Networks
  socialLinks: SocialLink[];
  socialIsMain: boolean;
  linkedInImported: boolean;

  // Step 6: Media
  media: Media[];  // ← Changé de File[] à Media[] (contient les chemins)

  // Step 7: Template
  selectedTemplateId: string | null;

  // Future: Projects (separate screen, not in wizard)
  projects: Project[];
  testimonials: Testimonial[];
}

export interface GroqFlags {
  showPracticalInfo: boolean;
  showSocialShowcase: boolean;
  showProjects: boolean;
  showTestimonials: boolean;
  profileType: ProfileType | null;
  hasLinkedIn: boolean;
  hasNotion: boolean;
}

export interface ProfileTypeOption {
  id: ProfileType;
  label: string;
  icon: string;
  hint: string;
}

export const PROFILE_TYPES: ProfileTypeOption[] = [
  {
    id: 'freelance',
    label: 'Freelance / Indépendant',
    icon: '💼',
    hint: 'Consultant, développeur, designer, coach...',
  },
  {
    id: 'commerce',
    label: 'Commerce / Artisan',
    icon: '🏪',
    hint: 'Boutique, restaurant, artisan, prestataire local...',
  },
  {
    id: 'creative',
    label: 'Créatif / Artiste / Créateur',
    icon: '🎨',
    hint: 'Photographe, vidéaste, musicien, influenceur...',
  },
  {
    id: 'student',
    label: 'Étudiant / Jeune diplômé',
    icon: '🎓',
    hint: 'En recherche de stage, alternance ou premier emploi...',
  },
  {
    id: 'employee',
    label: 'Cadre / Employé en transition',
    icon: '👔',
    hint: "En recherche d'opportunités, personal branding...",
  },
];

export const SOCIAL_PLATFORMS = [
  { id: 'linkedin' as SocialPlatform, label: 'LinkedIn', placeholder: 'linkedin.com/in/monprofil' },
  { id: 'instagram' as SocialPlatform, label: 'Instagram', placeholder: '@moncompte' },
  { id: 'twitter' as SocialPlatform, label: 'Twitter / X', placeholder: 'x.com/monpseudo' },
  { id: 'facebook' as SocialPlatform, label: 'Facebook', placeholder: 'facebook.com/mapage' },
  { id: 'github' as SocialPlatform, label: 'GitHub', placeholder: 'github.com/monpseudo' },
  { id: 'behance' as SocialPlatform, label: 'Behance', placeholder: 'behance.net/monportfolio' },
  { id: 'dribbble' as SocialPlatform, label: 'Dribbble', placeholder: 'dribbble.com/monprofil' },
  { id: 'youtube' as SocialPlatform, label: 'YouTube', placeholder: 'youtube.com/@machaine' },
  { id: 'tiktok' as SocialPlatform, label: 'TikTok', placeholder: '@moncompte' },
  { id: 'malt' as SocialPlatform, label: 'Malt', placeholder: 'malt.fr/profile/monprofil' },
  { id: 'pinterest' as SocialPlatform, label: 'Pinterest', placeholder: 'pinterest.com/monprofil' },
  { id: 'other' as SocialPlatform, label: 'Autre', placeholder: 'URL personnalisée' },
];

// Helper to get service label based on profile type
export const getServiceLabel = (profileType: ProfileType | null): string => {
  const labels: Record<ProfileType, string> = {
    freelance: 'Vos services',
    commerce: 'Vos produits/services',
    creative: 'Vos spécialités',
    student: 'Vos compétences',
    employee: "Vos domaines d'expertise",
  };
  return profileType ? labels[profileType] : 'Vos services';
};

// Helper to get service placeholder based on profile type
export const getServicePlaceholder = (profileType: ProfileType | null, index: number): string => {
  const placeholders: Record<ProfileType, string[]> = {
    freelance: ['Design UX', 'Développement web', 'Conseil stratégique'],
    commerce: ['Plomberie', 'Installation', 'Dépannage'],
    creative: ['Photo portrait', 'Vidéo corporate', 'Montage'],
    student: ['Python', 'Marketing digital', 'Anglais courant'],
    employee: ['Management', 'Finance', 'Stratégie'],
  };
  return profileType ? placeholders[profileType][index] || '' : '';
};

// Validation functions
export const validateStep1 = (data: PortfolioFormData): boolean => {
  return (
    data.name.trim().length > 0 &&
    data.profileType !== null &&
    data.tagline.trim().length > 0 &&
    data.tagline.length <= 150
  );
};

export const validateStep2 = (data: PortfolioFormData): boolean => {
  return data.services.filter(s => s.trim().length > 0).length >= 1;
};

export const validateStep3 = (data: PortfolioFormData): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(data.email);
};

export const validateStep4 = (data: PortfolioFormData): boolean => {
  return true; // Documents are optional
};

export const validateStep5 = (data: PortfolioFormData): boolean => {
  return true; // Social links are optional
};

export const validateStep6 = (data: PortfolioFormData): boolean => {
  return true; // Media is optional
};

export const validateStep7 = (data: PortfolioFormData): boolean => {
  return data.selectedTemplateId !== null;
};

// Dev autofill data
const devFormData: PortfolioFormData = {
  name: 'Jean Dupont',
  profileType: 'freelance',
  tagline: 'Développeur Full-Stack passionné par les solutions innovantes',
  services: ['Développement web', 'Conseil technique', 'Formation'],
  valueProp: 'Je transforme vos idées en applications web performantes et élégantes',
  email: 'jean.dupont@example.com',
  phone: '+33 6 12 34 56 78',
  address: '42 rue de la Tech, 75001 Paris',
  openingHours: 'Lun-Ven 9h-18h',
  uploadedFiles: [],
  notionData: '',
  linkedInData: undefined,
  socialLinks: [
    { platform: 'github', url: 'github.com/jeandupont' },
    { platform: 'linkedin', url: 'linkedin.com/in/jeandupont' },
  ],
  socialIsMain: false,
  linkedInImported: false,
  media: [],
  selectedTemplateId: null,
  projects: [],
  testimonials: [],
};

// Initial form data - Autofilled in DEV_MODE
export const initialFormData: PortfolioFormData = DEV_MODE ? devFormData : {
  name: '',
  profileType: null,
  tagline: '',
  services: ['', '', ''],
  valueProp: '',
  email: '',
  phone: '',
  address: '',
  openingHours: '',
  uploadedFiles: [],
  notionData: '',
  linkedInData: undefined,
  socialLinks: [],
  socialIsMain: false,
  linkedInImported: false,
  media: [],
  selectedTemplateId: null,
  projects: [],
  testimonials: [],
};

// Calculate Groq flags based on form data
export const calculateGroqFlags = (data: PortfolioFormData): GroqFlags => {
  return {
    showPracticalInfo: !!(data.address || data.openingHours),
    showSocialShowcase: data.socialIsMain,
    showProjects: data.projects.length > 0,
    showTestimonials: data.testimonials.length > 0,
    profileType: data.profileType,
    hasLinkedIn: !!data.linkedInData,
    hasNotion: !!data.notionData,
  };
};
