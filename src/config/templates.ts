/**
 * SOUVERAIN - Configuration des templates de portfolio
 * Définit les templates disponibles pour les modes Indépendant et Commerce
 */

import type { PortfolioMode } from '../types/sectors';

// ============================================================
// TYPES
// ============================================================

export interface TemplateSection {
  id: string;
  type: string;
  label: string;
  isRequired: boolean;
  isDefault: boolean;
}

export interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  thumbnail: string;          // Path vers la preview
  mode: PortfolioMode | 'both';
  tier: 'free' | 'premium';
  sections: TemplateSection[];
  features: string[];
}

// ============================================================
// TEMPLATES MODE INDÉPENDANT
// ============================================================

export const INDEPENDANT_TEMPLATES: TemplateConfig[] = [
  {
    id: 'classic',
    name: 'Classique',
    description: 'Design épuré et professionnel, idéal pour les artisans et professions libérales.',
    thumbnail: '/templates/classic-preview.png',
    mode: 'independant',
    tier: 'free',
    sections: [
      { id: 'hero', type: 'hero', label: 'En-tête', isRequired: true, isDefault: true },
      { id: 'about', type: 'about', label: 'À propos', isRequired: false, isDefault: true },
      { id: 'services', type: 'services', label: 'Services', isRequired: false, isDefault: true },
      { id: 'realizations', type: 'gallery', label: 'Réalisations', isRequired: false, isDefault: true },
      { id: 'testimonials', type: 'testimonials', label: 'Témoignages', isRequired: false, isDefault: false },
      { id: 'certifications', type: 'certifications', label: 'Certifications', isRequired: false, isDefault: false },
      { id: 'contact', type: 'contact', label: 'Contact', isRequired: true, isDefault: true },
    ],
    features: ['Responsive', 'SEO optimisé', 'Formulaire de contact'],
  },
  {
    id: 'modern',
    name: 'Moderne',
    description: 'Design contemporain avec animations subtiles, parfait pour les créatifs.',
    thumbnail: '/templates/modern-preview.png',
    mode: 'independant',
    tier: 'free',
    sections: [
      { id: 'hero', type: 'hero-fullscreen', label: 'En-tête plein écran', isRequired: true, isDefault: true },
      { id: 'intro', type: 'intro', label: 'Introduction', isRequired: false, isDefault: true },
      { id: 'expertise', type: 'expertise', label: 'Expertise', isRequired: false, isDefault: true },
      { id: 'portfolio', type: 'masonry', label: 'Portfolio', isRequired: false, isDefault: true },
      { id: 'process', type: 'timeline', label: 'Processus', isRequired: false, isDefault: false },
      { id: 'testimonials', type: 'carousel', label: 'Témoignages', isRequired: false, isDefault: true },
      { id: 'cta', type: 'cta', label: 'Appel à l\'action', isRequired: false, isDefault: true },
      { id: 'contact', type: 'contact-modern', label: 'Contact', isRequired: true, isDefault: true },
    ],
    features: ['Animations', 'Parallax', 'Dark mode', 'Responsive'],
  },
  {
    id: 'creative',
    name: 'Créatif',
    description: 'Design audacieux et artistique pour les profils créatifs.',
    thumbnail: '/templates/creative-preview.png',
    mode: 'independant',
    tier: 'premium',
    sections: [
      { id: 'splash', type: 'splash', label: 'Splash screen', isRequired: true, isDefault: true },
      { id: 'manifesto', type: 'manifesto', label: 'Manifeste', isRequired: false, isDefault: true },
      { id: 'works', type: 'case-studies', label: 'Travaux', isRequired: false, isDefault: true },
      { id: 'lab', type: 'experimental', label: 'Lab', isRequired: false, isDefault: false },
      { id: 'press', type: 'press', label: 'Presse', isRequired: false, isDefault: false },
      { id: 'contact', type: 'contact-creative', label: 'Contact', isRequired: true, isDefault: true },
    ],
    features: ['Animations avancées', 'Scroll horizontal', 'Cursor personnalisé', 'Sound design'],
  },
  {
    id: 'executive',
    name: 'Exécutif',
    description: 'Design sobre et élégant pour les consultants et dirigeants.',
    thumbnail: '/templates/executive-preview.png',
    mode: 'independant',
    tier: 'premium',
    sections: [
      { id: 'hero', type: 'hero-split', label: 'En-tête', isRequired: true, isDefault: true },
      { id: 'bio', type: 'bio', label: 'Biographie', isRequired: false, isDefault: true },
      { id: 'expertise', type: 'expertise-cards', label: 'Domaines d\'expertise', isRequired: false, isDefault: true },
      { id: 'track-record', type: 'metrics', label: 'Track record', isRequired: false, isDefault: true },
      { id: 'publications', type: 'publications', label: 'Publications', isRequired: false, isDefault: false },
      { id: 'speaking', type: 'events', label: 'Interventions', isRequired: false, isDefault: false },
      { id: 'contact', type: 'contact-executive', label: 'Contact', isRequired: true, isDefault: true },
    ],
    features: ['Design premium', 'LinkedIn intégré', 'PDF export', 'Calendly'],
  },
];

// ============================================================
// TEMPLATES MODE COMMERCE
// ============================================================

export const COMMERCE_TEMPLATES: TemplateConfig[] = [
  {
    id: 'storefront',
    name: 'Vitrine',
    description: 'Page vitrine classique pour commerces et boutiques.',
    thumbnail: '/templates/storefront-preview.png',
    mode: 'commerce',
    tier: 'free',
    sections: [
      { id: 'hero', type: 'hero-commerce', label: 'En-tête', isRequired: true, isDefault: true },
      { id: 'about', type: 'about-commerce', label: 'Notre histoire', isRequired: false, isDefault: true },
      { id: 'services', type: 'services-grid', label: 'Nos services', isRequired: false, isDefault: true },
      { id: 'gallery', type: 'gallery', label: 'Galerie', isRequired: false, isDefault: true },
      { id: 'hours', type: 'opening-hours', label: 'Horaires', isRequired: true, isDefault: true },
      { id: 'location', type: 'map', label: 'Nous trouver', isRequired: true, isDefault: true },
      { id: 'contact', type: 'contact-commerce', label: 'Contact', isRequired: true, isDefault: true },
    ],
    features: ['Google Maps', 'Horaires dynamiques', 'Formulaire contact', 'Responsive'],
  },
  {
    id: 'restaurant',
    name: 'Restaurant',
    description: 'Template optimisé pour restaurants, cafés et traiteurs.',
    thumbnail: '/templates/restaurant-preview.png',
    mode: 'commerce',
    tier: 'free',
    sections: [
      { id: 'hero', type: 'hero-restaurant', label: 'En-tête', isRequired: true, isDefault: true },
      { id: 'concept', type: 'concept', label: 'Notre concept', isRequired: false, isDefault: true },
      { id: 'menu', type: 'menu', label: 'La carte', isRequired: false, isDefault: true },
      { id: 'chef', type: 'team', label: 'Le chef', isRequired: false, isDefault: false },
      { id: 'gallery', type: 'food-gallery', label: 'Galerie', isRequired: false, isDefault: true },
      { id: 'reviews', type: 'reviews', label: 'Avis clients', isRequired: false, isDefault: true },
      { id: 'reservation', type: 'booking', label: 'Réservation', isRequired: false, isDefault: true },
      { id: 'practical', type: 'practical-info', label: 'Infos pratiques', isRequired: true, isDefault: true },
    ],
    features: ['Menu digital', 'Réservation en ligne', 'Intégration TripAdvisor', 'QR Code menu'],
  },
  {
    id: 'salon',
    name: 'Salon',
    description: 'Template élégant pour salons de coiffure et instituts de beauté.',
    thumbnail: '/templates/salon-preview.png',
    mode: 'commerce',
    tier: 'premium',
    sections: [
      { id: 'hero', type: 'hero-salon', label: 'En-tête', isRequired: true, isDefault: true },
      { id: 'welcome', type: 'welcome', label: 'Bienvenue', isRequired: false, isDefault: true },
      { id: 'services', type: 'services-pricing', label: 'Prestations & Tarifs', isRequired: false, isDefault: true },
      { id: 'team', type: 'team-carousel', label: 'L\'équipe', isRequired: false, isDefault: true },
      { id: 'transformations', type: 'before-after', label: 'Transformations', isRequired: false, isDefault: true },
      { id: 'products', type: 'products', label: 'Nos produits', isRequired: false, isDefault: false },
      { id: 'booking', type: 'booking-widget', label: 'Prendre RDV', isRequired: false, isDefault: true },
      { id: 'practical', type: 'practical-salon', label: 'Infos pratiques', isRequired: true, isDefault: true },
    ],
    features: ['Prise de RDV en ligne', 'Tarifs interactifs', 'Galerie avant/après', 'Instagram feed'],
  },
];

// ============================================================
// TOUS LES TEMPLATES
// ============================================================

export const ALL_TEMPLATES: TemplateConfig[] = [...INDEPENDANT_TEMPLATES, ...COMMERCE_TEMPLATES];

// ============================================================
// HELPERS
// ============================================================

/**
 * Récupère un template par son ID
 */
export function getTemplateById(id: string): TemplateConfig | undefined {
  return ALL_TEMPLATES.find((t) => t.id === id);
}

/**
 * Récupère les templates par mode
 */
export function getTemplatesByMode(mode: PortfolioMode): TemplateConfig[] {
  return ALL_TEMPLATES.filter((t) => t.mode === mode || t.mode === 'both');
}

/**
 * Récupère les templates gratuits
 */
export function getFreeTemplates(): TemplateConfig[] {
  return ALL_TEMPLATES.filter((t) => t.tier === 'free');
}

/**
 * Récupère les templates premium
 */
export function getPremiumTemplates(): TemplateConfig[] {
  return ALL_TEMPLATES.filter((t) => t.tier === 'premium');
}

/**
 * Récupère le template par défaut pour un mode et un secteur
 */
export function getDefaultTemplate(mode: PortfolioMode, sectorId?: string): TemplateConfig {
  // Pour l'instant, retourne le premier template gratuit du mode
  const templates = getTemplatesByMode(mode).filter((t) => t.tier === 'free');
  return templates[0] || ALL_TEMPLATES[0];
}

/**
 * Récupère les sections par défaut d'un template
 */
export function getDefaultSections(templateId: string): TemplateSection[] {
  const template = getTemplateById(templateId);
  if (!template) return [];
  return template.sections.filter((s) => s.isDefault);
}
