/**
 * SOUVERAIN - AI Enrichment Types
 * 
 * FIX V4: Ajout du champ expertises dans RawPortfolioData
 */

/**
 * Données brutes du wizard avant enrichissement IA
 */
export interface RawPortfolioData {
  name: string;
  
  /**
   * Type de profil - IMPORTANT pour la génération des services
   * 
   * Valeurs attendues par le prompt V4 :
   * - 'food': Restaurants, cafés, boulangeries → génère des PRODUITS
   * - 'retail': Boutiques, fleuristes → génère des OFFRES  
   * - 'service': Avocats, coachs → génère des PRESTATIONS
   * - 'tech': Développeurs, designers → génère des PRESTATIONS DIGITALES
   * - 'artisan': Plombiers, électriciens → génère des TRAVAUX
   * - 'niche': Tatoueurs, sophrologues → génère des SERVICES spécialisés
   * - 'student': Juniors/étudiants
   * - 'freelance': Fallback par défaut
   */
  profileType: string;
  
  tagline: string;
  
  /**
   * ✅ NOUVEAU - Expertises/spécialités saisies par l'utilisateur
   * 
   * Exemples:
   * - Coffee shop: ["Cafés de spécialité", "Pâtisseries maison", "Brunchs"]
   * - Plombier: ["Dépannage urgent", "Installation sanitaire", "Rénovation salle de bain"]
   * - Développeur: ["React", "Node.js", "WordPress"]
   * 
   * Si fournies, l'IA DOIT baser ses services sur ces expertises.
   * Si vides, l'IA déduit automatiquement.
   */
  expertises?: string[];
  
  services: Array<{
    title: string;
    description: string;
  }>;
  
  valueProp: string;
  email: string;
  phone?: string;
  address?: string;
  openingHours?: string;
  
  socialLinks: Array<{
    platform: string;
    url: string;
    label?: string;
  }>;
  
  socialIsMain: boolean;
  
  projects: Array<{
    title: string;
    description: string;
    category?: string;
  }>;
}

/**
 * Données enrichies par l'IA, prêtes pour injection dans le template
 */
export interface EnrichedPortfolioData {
  // Hero section
  heroTitle: string;
  heroSubtitle: string;
  heroEyebrow?: string;
  heroCta: string;
  heroImage?: string;
  
  // About section
  aboutText: string;
  aboutImage?: string;
  valueProp: string;
  
  // Services section
  services: Array<{
    title: string;
    description: string;
    icon?: string;
  }>;
  servicesLabel?: string;
  
  // Projects section
  projects: Array<{
    title: string;
    description: string;
    category?: string;
    image?: string;
    link?: string;
  }>;
  
  // Contact section
  email: string;
  phone?: string;
  address?: string;
  openingHours?: string;
  
  // Social
  socialLinks: Array<{
    platform: string;
    url: string;
    label: string;
  }>;
  socialIsMain: boolean;
}

/**
 * Résultat de l'enrichissement IA
 */
export interface AIEnrichmentResult {
  success: boolean;
  data?: EnrichedPortfolioData;
  error?: string;
}
