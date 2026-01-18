// CV to Portfolio Mapping Utility

import type { ParsedReport } from '../reportParser';
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
import { generateId } from './portfolio';

/**
 * Mappe les données d'une analyse CV vers les sections d'un portfolio
 * @param cvAnalysis - Résultat d'analyse CV (ia_result)
 * @returns Objet avec le contenu des 7 sections
 */
export const mapCvToPortfolio = (cvAnalysis: string): Record<SectionType, SectionContent> => {
  let parsed: ParsedReport;

  try {
    parsed = JSON.parse(cvAnalysis);
  } catch (err) {
    console.error('[CV→Portfolio] Erreur parsing JSON:', err);
    // Retourner sections vides en cas d'erreur
    return getEmptySections();
  }

  return {
    hero: mapHeroSection(parsed),
    about: mapAboutSection(parsed),
    experience: mapExperienceSection(parsed),
    skills: mapSkillsSection(parsed),
    projects: mapProjectsSection(),
    education: mapEducationSection(),
    contact: mapContactSection(),
  };
};

/**
 * Section Hero: photo, nom, titre, tagline, localisation
 */
const mapHeroSection = (parsed: ParsedReport): HeroContent => {
  return {
    photo: null,
    name: '', // Pas de nom dans le CV (anonymisé)
    title: parsed.diagnostic?.metier || '',
    tagline: parsed.diagnostic?.pointFort || '',
    location: '',
    availability: 'Disponible',
  };
};

/**
 * Section About: headline, bio, highlights
 */
const mapAboutSection = (parsed: ParsedReport): AboutContent => {
  const { diagnostic, conclusion, actions } = parsed;

  // Headline à partir du niveau et secteur
  let headline = '';
  if (diagnostic?.niveau && diagnostic?.secteur) {
    headline = `${diagnostic.niveau} en ${diagnostic.secteur}`;
  }

  // Highlights à partir des 3 premières actions prioritaires
  const highlights =
    actions
      ?.slice(0, 3)
      .map((a) => a.title)
      .filter(Boolean) || [];

  return {
    headline,
    bio: conclusion || '',
    highlights,
  };
};

/**
 * Section Experience: liste des expériences professionnelles
 */
const mapExperienceSection = (parsed: ParsedReport): ExperienceContent => {
  const { experiences } = parsed;

  if (!experiences || experiences.length === 0) {
    return { entries: [] };
  }

  const entries = experiences.map((exp) => {
    // Parser les dates (ex: "2020 - 2023" ou "2020 - Présent")
    const isCurrent = exp.dates.toLowerCase().includes('présent') || exp.dates.toLowerCase().includes('actuel');
    let startDate = '';
    let endDate: string | null = null;

    // Extraction dates basique (format YYYY ou YYYY-MM)
    const dateMatch = exp.dates.match(/(\d{4}(?:-\d{2})?)/g);
    if (dateMatch && dateMatch.length > 0) {
      startDate = dateMatch[0];
      endDate = dateMatch[1] || null;
    }

    if (isCurrent) {
      endDate = null;
    }

    // Extraire achievements à partir de pointsForts
    let achievements: string[] = [];
    if (exp.pointsForts) {
      achievements = exp.pointsForts
        .split(/[•\-\n]/)
        .map((s) => s.trim())
        .filter((s) => s.length > 5);
    }

    return {
      id: generateId(),
      company: exp.company || '',
      position: exp.poste || '',
      location: '',
      startDate,
      endDate,
      isCurrent,
      description: exp.verdict || '',
      achievements,
      tags: [],
    };
  });

  return { entries };
};

/**
 * Section Skills: catégories de compétences
 */
const mapSkillsSection = (parsed: ParsedReport): SkillsContent => {
  const { ats } = parsed;

  if (!ats || !ats.present || ats.present.length === 0) {
    return { categories: [] };
  }

  // Créer une catégorie "Compétences clés" avec les mots-clés ATS présents
  const category = {
    id: generateId(),
    name: 'Compétences clés',
    skills: ats.present.slice(0, 15).map((keyword) => ({
      name: keyword,
      level: 'intermediate' as const,
      yearsOfExperience: null,
    })),
  };

  return {
    categories: [category],
  };
};

/**
 * Section Projects: pas de données dans le CV
 */
const mapProjectsSection = (): ProjectsContent => {
  return { entries: [] };
};

/**
 * Section Education: pas de données dans le CV (nécessite parsing manuel)
 */
const mapEducationSection = (): EducationContent => {
  return { entries: [] };
};

/**
 * Section Contact: pas de données (anonymisées dans le CV)
 */
const mapContactSection = (): ContactContent => {
  return {
    email: '',
    phone: '',
    linkedin: '',
    github: '',
    website: '',
    twitter: '',
    customLinks: [],
  };
};

/**
 * Retourne des sections vides (fallback en cas d'erreur)
 */
const getEmptySections = (): Record<SectionType, SectionContent> => {
  return {
    hero: {
      photo: null,
      name: '',
      title: '',
      tagline: '',
      location: '',
      availability: '',
    },
    about: {
      headline: '',
      bio: '',
      highlights: [],
    },
    experience: {
      entries: [],
    },
    skills: {
      categories: [],
    },
    projects: {
      entries: [],
    },
    education: {
      entries: [],
    },
    contact: {
      email: '',
      phone: '',
      linkedin: '',
      github: '',
      website: '',
      twitter: '',
      customLinks: [],
    },
  };
};
