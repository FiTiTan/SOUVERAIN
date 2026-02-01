/**
 * Types partagés pour le système de portfolio éditable
 */

export interface Project {
  title: string;
  description: string;
  category?: string;
  image?: string;
  url?: string;
  technologies?: string[];
}

export interface PortfolioData {
  // Hero section
  heroTitle: string;
  heroSubtitle: string;
  heroImage?: string;
  
  // About section
  aboutText: string;
  aboutImage?: string;
  
  // Contact
  email?: string;
  phone?: string;
  location?: string;
  
  // Social links
  socialLinks?: {
    platform: string;
    url: string;
  }[];
  
  // Projects
  projects?: Project[];
  
  // Services (pour freelances)
  services?: {
    title: string;
    description: string;
    icon?: string;
  }[];
  
  // Metadata
  templateId?: string;
  generatedAt?: Date;
}

export interface ImageAssignments {
  hero?: string;
  about?: string;
  [key: string]: string | undefined;  // project-0, project-1, etc.
}

export type ImageZoneType = 'hero' | 'about' | 'project' | 'service';

export interface LibraryImage {
  id: string;
  filename: string;
  dataUrl: string;
  size?: number;        // Taille en bytes
  width?: number;       // Largeur originale
  height?: number;      // Hauteur originale
  uploadedAt?: Date;
}
