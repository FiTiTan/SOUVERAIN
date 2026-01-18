// Portfolio utility functions

import type {
  SectionType,
  SectionContent,
  HeroContent,
  AboutContent,
  ExperienceContent,
  SkillsContent,
  ProjectsContent,
  EducationContent,
  ContactContent,
} from '../types/portfolio';

/**
 * Génère un slug unique à partir d'un nom
 * @param name - Nom du portfolio
 * @param existingSlugs - Liste des slugs existants pour éviter les collisions
 * @returns Slug unique
 */
export const generateSlug = (name: string, existingSlugs: string[] = []): string => {
  // Normaliser et convertir en slug
  const base = name
    .toLowerCase()
    .normalize('NFD') // Décomposer les caractères accentués
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^a-z0-9]+/g, '-') // Remplacer caractères spéciaux par tirets
    .replace(/^-|-$/g, ''); // Supprimer tirets début/fin

  // Vérifier unicité
  let slug = base;
  let counter = 2;
  while (existingSlugs.includes(slug)) {
    slug = `${base}-${counter}`;
    counter++;
  }

  return slug;
};

/**
 * Génère un UUID v4 (utilise crypto.randomUUID natif)
 * @returns UUID v4
 */
export const generateId = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback pour environnements sans crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Retourne le contenu par défaut (vide) pour un type de section
 * @param type - Type de section
 * @returns Contenu par défaut pour ce type
 */
export const getDefaultSectionContent = (type: SectionType): SectionContent => {
  const defaults: Record<SectionType, SectionContent> = {
    hero: {
      photo: null,
      name: '',
      title: '',
      tagline: '',
      location: '',
      availability: '',
    } as HeroContent,

    about: {
      headline: '',
      bio: '',
      highlights: [],
    } as AboutContent,

    experience: {
      entries: [],
    } as ExperienceContent,

    skills: {
      categories: [],
    } as SkillsContent,

    projects: {
      entries: [],
    } as ProjectsContent,

    education: {
      entries: [],
    } as EducationContent,

    contact: {
      email: '',
      phone: '',
      linkedin: '',
      github: '',
      website: '',
      twitter: '',
      customLinks: [],
    } as ContactContent,
  };

  return defaults[type];
};

/**
 * Liste des types de sections par défaut dans l'ordre
 */
export const DEFAULT_SECTION_TYPES: SectionType[] = [
  'hero',
  'about',
  'experience',
  'skills',
  'projects',
  'education',
  'contact',
];

/**
 * Labels français pour les types de sections
 */
export const SECTION_LABELS: Record<SectionType, string> = {
  hero: 'En-tête',
  about: 'À propos',
  experience: 'Expériences',
  skills: 'Compétences',
  projects: 'Réalisations',
  education: 'Formation',
  contact: 'Contact',
};

/**
 * Icônes pour les types de sections
 */
export const SECTION_ICONS: Record<SectionType, string> = {
  hero: '👤',
  about: '📝',
  experience: '💼',
  skills: '🎯',
  projects: '🚀',
  education: '🎓',
  contact: '📧',
};
