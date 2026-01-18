// Types for Portfolio Builder Module

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
}

export interface PortfolioMetadata {
  description?: string;
  theme_colors?: {
    primary: string;
    secondary: string;
  };
  seo_title?: string;
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
