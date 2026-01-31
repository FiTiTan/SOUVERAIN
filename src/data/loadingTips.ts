/**
 * Loading Tips - Proof of Value
 * Random tips displayed during splash screen
 */

export interface LoadingTip {
  category: 'cv' | 'portfolio' | 'linkedin' | 'jobmatch' | 'vault';
  text: string;
  source?: string; // Optional source for credibility
}

export const loadingTips: LoadingTip[] = [
  // CV Tips - VÉRIFIÉ
  {
    category: 'cv',
    text: "Les recruteurs passent en moyenne 7 secondes pour décider si votre CV mérite leur attention.",
    source: "TheLadders Eye-Tracking Study 2018"
  },
  {
    category: 'cv',
    text: "90% des entreprises utilisent un système de tri automatique (ATS) pour filtrer les candidatures.",
    source: "Harvard Business School + Accenture 2025"
  },
  {
    category: 'cv',
    text: "88% des employeurs reconnaissent que l'ATS peut filtrer des candidats qualifiés par erreur.",
    source: "Harvard Business School 2025"
  },
  {
    category: 'cv',
    text: "Un CV bien structuré passe les filtres ATS et atteint les recruteurs.",
  },

  // Portfolio Tips - VÉRIFIÉ
  {
    category: 'portfolio',
    text: "Un portfolio montre concrètement vos compétences aux clients.",
  },
  {
    category: 'portfolio',
    text: "Les freelances expérimentés avec portfolio facturent 2 à 4 fois plus que les débutants ($100-200/h vs $25-50/h).",
    source: "Consensus marché freelance 2025"
  },
  {
    category: 'portfolio',
    text: "Un bon portfolio vous différencie face à des centaines de candidats.",
  },

  // LinkedIn Tips - VÉRIFIÉ
  {
    category: 'linkedin',
    text: "Un profil LinkedIn complet génère 21 fois plus de vues qu'un profil incomplet.",
    source: "Omnicore Agency 2024"
  },
  {
    category: 'linkedin',
    text: "Les profils complets reçoivent 36 fois plus de messages de recruteurs.",
    source: "Omnicore Agency 2024"
  },
  {
    category: 'linkedin',
    text: "Un profil complet augmente vos chances de callback de 15,8% pour les postes entry-level.",
    source: "Statista 2024"
  },

  // 💤 LinkedIn Animator (future feature - currently disabled)
  // Uncomment when LinkedIn networking/animator module is ready
  // {
  //   category: 'linkedin',
  //   text: "50 à 70% des postes se remplissent sans annonce publique (marché caché).",
  //   source: "The Interview Guys 2025, Management Consulted 2024"
  // },
  // {
  //   category: 'linkedin',
  //   text: "Les candidats recommandés en interne ont 15 fois plus de chances d'être embauchés.",
  //   source: "OpenArc 2025"
  // },
  // {
  //   category: 'linkedin',
  //   text: "Votre réseau professionnel ouvre plus de portes que les candidatures en ligne.",
  // },

  // Business / Online Presence - VÉRIFIÉ
  {
    category: 'portfolio',
    text: "76% des clients regardent votre présence en ligne avant de visiter votre boutique physique.",
    source: "Netsertive 2021"
  },
  {
    category: 'portfolio',
    text: "96% des clients utilisent internet pour lire les avis sur les commerces locaux.",
    source: "Fit Small Business 2023"
  },
  {
    category: 'portfolio',
    text: "Les avis Google ont un impact de 20% sur votre visibilité locale dans les recherches.",
    source: "BridgeMedia 2025"
  },
  {
    category: 'portfolio',
    text: "81% des consommateurs utilisent Google reviews pour évaluer les commerces avant de s'y rendre.",
    source: "Shapo.io 2025"
  },
  {
    category: 'portfolio',
    text: "45% des gens visitent le magasin physique après avoir découvert une forte présence en ligne.",
    source: "Netsertive 2021"
  },

  // Social Media - VÉRIFIÉ
  {
    category: 'portfolio',
    text: "54% des 25-34 ans utilisent Instagram pour chercher des commerces locaux.",
    source: "Hootsuite 2025"
  },
  {
    category: 'portfolio',
    text: "78% des commerces locaux utilisent les réseaux sociaux pour augmenter leur notoriété.",
    source: "Synup 2025"
  },

  // Vault / Security Tips - VÉRIFIÉ
  {
    category: 'vault',
    text: "Vos données restent à 100% sur votre appareil. Aucun cloud tiers.",
  },
  {
    category: 'vault',
    text: "Centralisez vos documents pour ne jamais chercher votre CV pendant 30 minutes.",
  },
  {
    category: 'vault',
    text: "Une candidature urgente? Pas de panique ! Retrouvez l'ensemble de vos dossiers professionnels dans le Coffre-Fort sécurisé.",
  },
  {
    category: 'vault',
    text: "92% des gens s'inquiètent de leur vie privée en ligne et de la façon dont leurs données sont utilisées.",
    source: "Usercentrics 2025"
  },
  {
    category: 'vault',
    text: "81% des piratages de comptes sont causés par des mots de passe faibles ou réutilisés.",
    source: "Trust & Will"
  },
  {
    category: 'vault',
    text: "19% des gens ont été informés d'une fuite de leurs données personnelles au cours de l'année passée.",
    source: "Thales 2025"
  },
];

/**
 * Get a random tip
 */
export function getRandomTip(): LoadingTip {
  const randomIndex = Math.floor(Math.random() * loadingTips.length);
  return loadingTips[randomIndex];
}

/**
 * Get a random tip from a specific category
 */
export function getRandomTipByCategory(category: LoadingTip['category']): LoadingTip {
  const categoryTips = loadingTips.filter(tip => tip.category === category);
  if (categoryTips.length === 0) return getRandomTip();
  const randomIndex = Math.floor(Math.random() * categoryTips.length);
  return categoryTips[randomIndex];
}
