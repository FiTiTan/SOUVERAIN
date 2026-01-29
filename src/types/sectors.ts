/**
 * SOUVERAIN - Types et configuration des secteurs d'activité
 * Définit les secteurs supportés pour le Portfolio Universel
 */

// ============================================================
// MODE DE PORTFOLIO
// ============================================================

export type PortfolioMode = 'independant' | 'commerce';

export interface PortfolioModeConfig {
  id: PortfolioMode;
  label: string;
  description: string;
  icon: string;
  features: string[];
}

export const PORTFOLIO_MODES: Record<PortfolioMode, PortfolioModeConfig> = {
  independant: {
    id: 'independant',
    label: 'Indépendant / Freelance',
    description: 'Pour les professionnels indépendants, artisans, consultants et professions libérales',
    icon: '👤',
    features: [
      'Galerie de réalisations',
      'Parcours et expertise',
      'Témoignages clients',
      'Zone de confiance (certifications)',
    ],
  },
  commerce: {
    id: 'commerce',
    label: 'Commerce / Établissement',
    description: 'Pour les commerces, restaurants, salons et établissements accueillant du public',
    icon: '🏪',
    features: [
      'Infos pratiques (horaires, accès)',
      'Ambiance et galerie photos',
      'Carte / Menu / Offre',
      'Réservation en ligne',
    ],
  },
};

// ============================================================
// SECTEURS D'ACTIVITÉ
// ============================================================

export type SectorTier = 'tier1' | 'tier2';

export interface SectorConfig {
  id: string;
  label: string;
  labelPlural: string;
  mode: PortfolioMode;
  tier: SectorTier;
  icon: string;
  color: string;
  description: string;
  keywords: string[];
  defaultTags: string[];
  // Vocabulaire spécifique au secteur
  vocabulary: {
    realisation: string;      // "réalisation", "création", "projet", "prestation"
    realisationPlural: string;
    client: string;           // "client", "patient", "élève"
    clientPlural: string;
  };
}

// ============================================================
// TIER 1 - MVP (Priorité haute)
// ============================================================

export const SECTORS_TIER1: SectorConfig[] = [
  // INDÉPENDANTS
  {
    id: 'artisan_btp',
    label: 'Artisan BTP',
    labelPlural: 'Artisans BTP',
    mode: 'independant',
    tier: 'tier1',
    icon: '🔨',
    color: '#D97706',
    description: 'Maçon, plombier, électricien, carreleur, peintre, menuisier...',
    keywords: ['rénovation', 'construction', 'travaux', 'chantier', 'devis'],
    defaultTags: ['Rénovation', 'Construction', 'Travaux'],
    vocabulary: {
      realisation: 'chantier',
      realisationPlural: 'chantiers',
      client: 'client',
      clientPlural: 'clients',
    },
  },
  {
    id: 'photographe',
    label: 'Photographe',
    labelPlural: 'Photographes',
    mode: 'independant',
    tier: 'tier1',
    icon: '📷',
    color: '#7C3AED',
    description: 'Photographe événementiel, portrait, corporate, produit...',
    keywords: ['shooting', 'séance photo', 'reportage', 'retouche', 'studio'],
    defaultTags: ['Portrait', 'Événementiel', 'Corporate'],
    vocabulary: {
      realisation: 'shooting',
      realisationPlural: 'shootings',
      client: 'client',
      clientPlural: 'clients',
    },
  },
  {
    id: 'agent_immobilier',
    label: 'Agent immobilier',
    labelPlural: 'Agents immobiliers',
    mode: 'independant',
    tier: 'tier1',
    icon: '🏠',
    color: '#059669',
    description: 'Agent immobilier, mandataire, négociateur...',
    keywords: ['vente', 'location', 'estimation', 'mandat', 'visite'],
    defaultTags: ['Vente', 'Location', 'Estimation'],
    vocabulary: {
      realisation: 'transaction',
      realisationPlural: 'transactions',
      client: 'client',
      clientPlural: 'clients',
    },
  },
  {
    id: 'coach_formateur',
    label: 'Coach / Formateur',
    labelPlural: 'Coachs & Formateurs',
    mode: 'independant',
    tier: 'tier1',
    icon: '🎯',
    color: '#DC2626',
    description: 'Coach professionnel, formateur, consultant, mentor...',
    keywords: ['formation', 'coaching', 'accompagnement', 'développement', 'bilan'],
    defaultTags: ['Coaching', 'Formation', 'Accompagnement'],
    vocabulary: {
      realisation: 'accompagnement',
      realisationPlural: 'accompagnements',
      client: 'coaché',
      clientPlural: 'coachés',
    },
  },
  {
    id: 'architecte_interieur',
    label: 'Architecte d\'intérieur',
    labelPlural: 'Architectes d\'intérieur',
    mode: 'independant',
    tier: 'tier1',
    icon: '🏛️',
    color: '#0891B2',
    description: 'Architecte d\'intérieur, décorateur, home stager...',
    keywords: ['aménagement', 'décoration', 'design', 'plans', 'mobilier'],
    defaultTags: ['Aménagement', 'Décoration', 'Design'],
    vocabulary: {
      realisation: 'projet',
      realisationPlural: 'projets',
      client: 'client',
      clientPlural: 'clients',
    },
  },
  // COMMERCES
  {
    id: 'coiffeur_esthetique',
    label: 'Coiffeur / Esthéticienne',
    labelPlural: 'Coiffeurs & Esthéticiennes',
    mode: 'commerce',
    tier: 'tier1',
    icon: '💇',
    color: '#EC4899',
    description: 'Salon de coiffure, institut de beauté, spa, barbier...',
    keywords: ['coupe', 'coloration', 'soin', 'massage', 'onglerie'],
    defaultTags: ['Coiffure', 'Soins', 'Beauté'],
    vocabulary: {
      realisation: 'prestation',
      realisationPlural: 'prestations',
      client: 'client',
      clientPlural: 'clients',
    },
  },
  {
    id: 'cuisinier_traiteur',
    label: 'Cuisinier / Traiteur / Pâtissier',
    labelPlural: 'Cuisiniers, Traiteurs & Pâtissiers',
    mode: 'commerce',
    tier: 'tier1',
    icon: '👨‍🍳',
    color: '#F59E0B',
    description: 'Chef à domicile, traiteur événementiel, pâtissier, boulanger...',
    keywords: ['menu', 'réception', 'buffet', 'gâteau', 'création culinaire'],
    defaultTags: ['Événementiel', 'Création', 'Sur-mesure'],
    vocabulary: {
      realisation: 'création',
      realisationPlural: 'créations',
      client: 'client',
      clientPlural: 'clients',
    },
  },
];

// ============================================================
// TIER 2 - Extension
// ============================================================

export const SECTORS_TIER2: SectorConfig[] = [
  // INDÉPENDANTS
  {
    id: 'paysagiste',
    label: 'Paysagiste',
    labelPlural: 'Paysagistes',
    mode: 'independant',
    tier: 'tier2',
    icon: '🌳',
    color: '#16A34A',
    description: 'Paysagiste, jardinier, élagueur...',
    keywords: ['jardin', 'aménagement extérieur', 'plantation', 'entretien', 'terrasse'],
    defaultTags: ['Jardins', 'Terrasses', 'Entretien'],
    vocabulary: {
      realisation: 'aménagement',
      realisationPlural: 'aménagements',
      client: 'client',
      clientPlural: 'clients',
    },
  },
  {
    id: 'graphiste',
    label: 'Graphiste / Webdesigner',
    labelPlural: 'Graphistes & Webdesigners',
    mode: 'independant',
    tier: 'tier2',
    icon: '🎨',
    color: '#8B5CF6',
    description: 'Graphiste, webdesigner, directeur artistique...',
    keywords: ['logo', 'identité visuelle', 'site web', 'print', 'branding'],
    defaultTags: ['Branding', 'Web', 'Print'],
    vocabulary: {
      realisation: 'création',
      realisationPlural: 'créations',
      client: 'client',
      clientPlural: 'clients',
    },
  },
  {
    id: 'developpeur',
    label: 'Développeur',
    labelPlural: 'Développeurs',
    mode: 'independant',
    tier: 'tier2',
    icon: '💻',
    color: '#3B82F6',
    description: 'Développeur web, mobile, freelance tech...',
    keywords: ['application', 'site web', 'API', 'mobile', 'SaaS'],
    defaultTags: ['Web', 'Mobile', 'API'],
    vocabulary: {
      realisation: 'projet',
      realisationPlural: 'projets',
      client: 'client',
      clientPlural: 'clients',
    },
  },
  {
    id: 'avocat',
    label: 'Avocat',
    labelPlural: 'Avocats',
    mode: 'independant',
    tier: 'tier2',
    icon: '⚖️',
    color: '#1F2937',
    description: 'Avocat, juriste indépendant, médiateur...',
    keywords: ['droit', 'conseil juridique', 'contentieux', 'contrat', 'médiation'],
    defaultTags: ['Conseil', 'Contentieux', 'Contrats'],
    vocabulary: {
      realisation: 'dossier',
      realisationPlural: 'dossiers',
      client: 'client',
      clientPlural: 'clients',
    },
  },
  // COMMERCES
  {
    id: 'restaurant_cafe',
    label: 'Restaurant / Café',
    labelPlural: 'Restaurants & Cafés',
    mode: 'commerce',
    tier: 'tier2',
    icon: '🍽️',
    color: '#B45309',
    description: 'Restaurant, café, bar, brasserie...',
    keywords: ['carte', 'menu', 'réservation', 'ambiance', 'terrasse'],
    defaultTags: ['Cuisine', 'Ambiance', 'Terrasse'],
    vocabulary: {
      realisation: 'plat',
      realisationPlural: 'plats',
      client: 'client',
      clientPlural: 'clients',
    },
  },
  {
    id: 'boutique',
    label: 'Boutique',
    labelPlural: 'Boutiques',
    mode: 'commerce',
    tier: 'tier2',
    icon: '🛍️',
    color: '#BE185D',
    description: 'Boutique de mode, décoration, artisanat...',
    keywords: ['produits', 'collection', 'nouveautés', 'tendances', 'créateurs'],
    defaultTags: ['Collections', 'Créateurs', 'Tendances'],
    vocabulary: {
      realisation: 'produit',
      realisationPlural: 'produits',
      client: 'client',
      clientPlural: 'clients',
    },
  },
  {
    id: 'fleuriste',
    label: 'Fleuriste',
    labelPlural: 'Fleuristes',
    mode: 'commerce',
    tier: 'tier2',
    icon: '💐',
    color: '#DB2777',
    description: 'Fleuriste, décorateur floral...',
    keywords: ['bouquet', 'composition', 'événement', 'mariage', 'livraison'],
    defaultTags: ['Bouquets', 'Événements', 'Mariages'],
    vocabulary: {
      realisation: 'création',
      realisationPlural: 'créations',
      client: 'client',
      clientPlural: 'clients',
    },
  },
];

// ============================================================
// TOUS LES SECTEURS
// ============================================================

export const ALL_SECTORS: SectorConfig[] = [...SECTORS_TIER1, ...SECTORS_TIER2];

// ============================================================
// HELPERS
// ============================================================

/**
 * Récupère un secteur par son ID
 */
export function getSectorById(id: string): SectorConfig | undefined {
  return ALL_SECTORS.find((s) => s.id === id);
}

/**
 * Récupère les secteurs par mode
 */
export function getSectorsByMode(mode: PortfolioMode): SectorConfig[] {
  return ALL_SECTORS.filter((s) => s.mode === mode);
}

/**
 * Récupère les secteurs par tier
 */
export function getSectorsByTier(tier: SectorTier): SectorConfig[] {
  return ALL_SECTORS.filter((s) => s.tier === tier);
}

/**
 * Vérifie si un secteur est disponible (Tier 1 = MVP)
 */
export function isSectorAvailable(id: string): boolean {
  const sector = getSectorById(id);
  return sector?.tier === 'tier1';
}
