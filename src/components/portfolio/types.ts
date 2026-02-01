/**
 * SOUVERAIN - Portfolio Component Types
 */

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
