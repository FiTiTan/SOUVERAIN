// SOUVERAIN - Portfolio Labels Configuration
// Labels adaptatifs selon le contexte professionnel

export type PortfolioContext = 'tech' | 'service' | 'artisan' | 'food' | 'retail' | 'junior' | 'default';

export interface PortfolioLabels {
  services: string;
  realisations: string;
  realisationsSubtitle: string;
}

export const PORTFOLIO_LABELS: Record<PortfolioContext, PortfolioLabels> = {
  tech: {
    services: 'Services',
    realisations: 'Projets',
    realisationsSubtitle: 'Découvrez mes réalisations',
  },
  service: {
    services: 'Domaines d\'intervention',
    realisations: 'Références',
    realisationsSubtitle: 'Quelques cas accompagnés',
  },
  artisan: {
    services: 'Prestations',
    realisations: 'Réalisations',
    realisationsSubtitle: 'Nos derniers travaux',
  },
  food: {
    services: 'Nos spécialités',
    realisations: 'Nos plats signatures',
    realisationsSubtitle: 'Découvrez notre carte',
  },
  retail: {
    services: 'Nos services',
    realisations: 'Nos produits',
    realisationsSubtitle: 'Notre sélection',
  },
  junior: {
    services: 'Compétences',
    realisations: 'Expériences & Projets',
    realisationsSubtitle: 'Mon parcours',
  },
  default: {
    services: 'Services',
    realisations: 'Réalisations',
    realisationsSubtitle: 'Découvrez notre travail',
  },
};

/**
 * Retourne les labels appropriés selon le contexte professionnel
 */
export function getLabels(context: PortfolioContext = 'default'): PortfolioLabels {
  return PORTFOLIO_LABELS[context] || PORTFOLIO_LABELS.default;
}

/**
 * Détecte automatiquement le contexte depuis les données du portfolio
 */
export function detectContext(profileType: string, services: string[]): PortfolioContext {
  // Si c'est un lieu (business)
  if (profileType === 'place') {
    const keywords = services.join(' ').toLowerCase();
    
    if (keywords.includes('restaurant') || keywords.includes('cuisine') || keywords.includes('plat')) {
      return 'food';
    }
    if (keywords.includes('boutique') || keywords.includes('magasin') || keywords.includes('vente')) {
      return 'retail';
    }
    if (keywords.includes('plomberie') || keywords.includes('électricité') || keywords.includes('construction')) {
      return 'artisan';
    }
    
    return 'service';
  }
  
  // Si c'est une personne
  const keywords = services.join(' ').toLowerCase();
  
  if (keywords.includes('développement') || keywords.includes('dev') || keywords.includes('code') || keywords.includes('app')) {
    return 'tech';
  }
  if (keywords.includes('avocat') || keywords.includes('conseil') || keywords.includes('consultant')) {
    return 'service';
  }
  if (keywords.includes('junior') || keywords.includes('stage') || keywords.includes('étudiant')) {
    return 'junior';
  }
  
  return 'default';
}
