/**
 * SOUVERAIN - Types du module Portfolio Universel
 * Définit les structures pour les portfolios (legacy + V2)
 */

import type { PortfolioMode } from './sectors';
import type { ImportSourceType } from './formats';
import type { CommerceProfile } from './commerce';

// ============================================================
// TYPES EXISTANTS (Legacy - rétrocompatibilité)
// ============================================================

export type SectionType = 'hero' | 'about' | 'experience' | 'skills' | 'projects' | 'education' | 'contact';

export interface Portfolio {
  id: string;
  name: string;
  slug: string;
  template: string;
  is_public: number;
  is_published: number;
  metadata: string | null; // JSON stringified PortfolioMetadata
  created_at: string;
  updated_at: string;
  sections?: PortfolioSection[];
  // V2 Fields
  is_legacy?: number;
  mode?: PortfolioMode;
  sector?: string;
  anonymization_level?: AnonymizationLevel;
  is_primary?: number;
}

export interface PortfolioMetadata {
  description?: string;
  theme_colors?: {
    primary: string;
    secondary: string;
  };
  seo_title?: string;
}

// ============================================================
// TYPES V2 - PORTFOLIO UNIVERSEL
// ============================================================

export type AnonymizationLevel = 'none' | 'partial' | 'full';

/**
 * Portfolio V2 - Structure étendue pour le Portfolio Universel
 */
export interface PortfolioV2 {
  id: string;
  userId: string;
  mode: PortfolioMode;
  sector: string;
  template: string;
  title?: string;
  tagline?: string;
  anonymizationLevel: AnonymizationLevel;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;

  // Relations
  independantProfile?: IndependantProfile;
  commerceProfile?: CommerceProfile;
  assets?: PortfolioAsset[];
  elements?: PortfolioElement[];
  projects?: PortfolioProjectV2[];
  publication?: PortfolioPublication;
  // Master Plan Additions
  authorName?: string;
  authorBio?: string;
  authorEmail?: string;
  socials?: ExternalAccount[];
  slug?: string;
}

export interface ExternalAccount {
  id: string;
  portfolioId: string;
  platform: 'linkedin' | 'github' | 'twitter' | 'instagram' | 'behance' | 'dribbble' | 'website' | 'other';
  url: string;
  username?: string;
  isPrimary: boolean;
  displayOrder: number;
}

// ============================================================
// PROFIL INDÉPENDANT
// ============================================================

export interface IndependantProfile {
  id: string;
  portfolioId: string;

  // Identité
  displayName: string;
  photoPath?: string;
  bio?: string;

  // Expérience
  yearsExperience?: number;

  // Localisation
  locationCity?: string;
  locationRegion?: string;

  // Contact
  phone?: string;
  email?: string;
  website?: string;
  socialMedia?: {
    linkedin?: string;
    instagram?: string;
    twitter?: string;
    facebook?: string;
    youtube?: string;
    tiktok?: string;
  };

  // Expertise
  certifications?: string[];
  specialties?: string[];

  // Métadonnées
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// ASSETS IMPORTÉS
// ============================================================

export interface MediathequeItem {
  id: string;
  portfolioId: string;

  // Source
  sourceType: ImportSourceType;
  sourcePath: string;           // Chemin ou URL origine
  localPath: string;            // Chemin local après import

  // Fichier
  format: string;               // Extension (jpg, pdf, mp4, etc.)
  originalFilename?: string;
  fileSize: number;

  // Métadonnées extraites (JSON stringified in DB)
  metadata?: AssetMetadata;
  metadata_json?: string; // Raw JSON string from DB
  thumbnailPath?: string;
  
  // Tags (JSON stringified in DB)
  tags?: string[];
  tags_json?: string; // Raw JSON string from DB

  // New fields
  source_type?: string;
  source_path?: string;
  
  // DB Compatibility (snake_case)
  file_path?: string;
  file_type?: string;
  original_filename?: string;
  file_size?: number; // DB might return this snake_case? No, usually matches unless alias.

  createdAt: string;
}

export type PortfolioAsset = MediathequeItem;

export interface AssetMetadata {
  // Images (EXIF)
  width?: number;
  height?: number;
  dateTaken?: string;
  camera?: string;
  location?: string;

  // Vidéos
  duration?: number;            // En secondes
  resolution?: string;          // Ex: "1920x1080"

  // PDF
  pageCount?: number;
  author?: string;
  title?: string;

  // Autres métadonnées custom
  [key: string]: unknown;
}

// ============================================================
// ÉLÉMENTS EXTRAITS
// ============================================================

export type ElementType = 'image' | 'text' | 'video_thumbnail' | 'slide';
export type AIClassification = 'realisation' | 'avant_apres' | 'document' | 'plan' | 'portrait' | 'autre';
export type AIPertinence = 'haute' | 'moyenne' | 'basse' | 'exclure';

export interface PortfolioElement {
  id: string;
  portfolioId: string;
  assetId: string;

  // Type et contenu
  elementType: ElementType;
  elementIndex?: number;        // Index dans l'asset (slide 3, page 2...)
  contentPath?: string;         // Chemin fichier extrait
  contentText?: string;         // Texte extrait

  // Classification IA
  aiClassification?: AIClassification;
  aiPertinence?: AIPertinence;
  aiDescription?: string;
  aiTags?: string[];

  // Validation utilisateur
  userValidated: boolean;
  userOverride?: {
    classification?: AIClassification;
    description?: string;
    tags?: string[];
  };

  createdAt: string;
}

// ============================================================
// PROJETS V2
// ============================================================

export interface PortfolioProjectV2 {
  id: string;
  portfolioId: string;

  // Contenu
  title: string;
  description?: string;
  // Contenu Excellence
  brief_text?: string;
  context_text?: string;
  challenge_text?: string;
  solution_text?: string;
  result_text?: string;
  
  // Nouveaux champs Phase 4
  projectType?: string; // client, personal, etc.
  summary?: string;
  date_start?: string;
  date_end?: string;
  status?: 'ongoing' | 'completed' | 'archived';
  detail_level?: 'standard' | 'casestudy' | 'showcase';
  content_json?: string;

  displayOrder: number;
  isFeatured: boolean;
  tags?: string[];

  // Éléments liés
  elements?: ProjectElement[];

  createdAt: string;
  updatedAt: string;
}

export interface ProjectElement {
  id: string;
  projectId: string;
  elementId: string;
  displayOrder: number;
// ... existing ProjectElement ...
  isCover: boolean;             // Image de couverture du projet
}

export interface DisplayableAsset {
  asset: PortfolioAsset;
  element: PortfolioElement;
}

// ============================================================
// PUBLICATION
// ============================================================

export interface PortfolioPublication {
  id: string;
  portfolioId: string;
  slug: string;
  publishedUrl: string;
  qrCodePath?: string;
  publishedAt: string;
  updatedAt?: string;
  isActive: boolean;
}

// ============================================================
// MAP D'ANONYMISATION
// ============================================================

export type AnonymizationValueType = 'person' | 'company' | 'address' | 'phone' | 'email' | 'amount';

export interface AnonymizationMapping {
  id: string;
  portfolioId: string;
  originalValue: string;
  anonymizedToken: string;      // Ex: [PERSON_1], [COMPANY_2]
  valueType: AnonymizationValueType;
}

export interface PortfolioSection {
  id: string;
  portfolio_id: string;
  section_type: SectionType;
  content: string; // JSON stringified SectionContent
  order_index: number;
  is_visible: number;
  created_at: string;
  updated_at: string;
}

// Parsed section content types
export type SectionContent =
  | HeroContent
  | AboutContent
  | ExperienceContent
  | SkillsContent
  | ProjectsContent
  | EducationContent
  | ContactContent;

export interface HeroContent {
  photo: string | null;
  name: string;
  title: string;
  tagline: string;
  location: string;
  availability: string;
}

export interface AboutContent {
  headline: string;
  bio: string;
  highlights: string[];
}

export interface ExperienceContent {
  entries: ExperienceEntry[];
}

export interface ExperienceEntry {
  id: string;
  company: string;
  position: string;
  location: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  description: string;
  achievements: string[];
  tags: string[];
}

export interface SkillsContent {
  categories: SkillCategory[];
}

export interface SkillCategory {
  id: string;
  name: string;
  skills: Skill[];
}

export interface Skill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience: number | null;
}

export interface ProjectsContent {
  entries: string[]; // IDs référençant portfolio_projects
}

export interface EducationContent {
  entries: EducationEntry[];
}

export interface EducationEntry {
  id: string;
  school: string;
  degree: string;
  field: string;
  location: string;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  description: string;
  achievements: string[];
}

export interface ContactContent {
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  website: string;
  twitter: string;
  customLinks: CustomLink[];
}

export interface CustomLink {
  label: string;
  url: string;
}

export interface PortfolioProject {
  id: string;
  portfolio_id: string;
  title: string;
  slug: string;
  description: string;
  long_description: string;
  thumbnail: string | null; // Base64 or file path
  images: string; // JSON stringified string[]
  tags: string; // JSON stringified string[]
  tech_stack: string; // JSON stringified string[]
  url: string | null;
  github_url: string | null;
  start_date: string | null;
  end_date: string | null;
  is_featured: number;
  order_index: number;
  created_at: string;
  updated_at: string;
}

// Helper type for API responses
export interface PortfolioApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
