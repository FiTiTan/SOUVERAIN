/**
 * Loading Tips - Proof of Value
 * Random tips displayed during splash screen
 */

export interface LoadingTip {
  category: 'cv' | 'portfolio' | 'linkedin' | 'jobmatch' | 'vault';
  text: string;
  stat?: string; // Optional stat to highlight
  source?: string; // Optional source for credibility
}

export const loadingTips: LoadingTip[] = [
  // CV Tips - VÉRIFIÉ
  {
    category: 'cv',
    text: "Les recruteurs passent en moyenne 7 secondes sur un CV.",
    stat: "7.4 sec",
    source: "TheLadders Eye-Tracking Study 2018"
  },
  {
    category: 'cv',
    text: "90% des entreprises utilisent un système de tri automatique (ATS).",
    stat: "90%",
    source: "Harvard Business School + Accenture 2025"
  },
  {
    category: 'cv',
    text: "88% des employeurs disent que l'ATS peut filtrer des candidats qualifiés.",
    stat: "88%",
    source: "Harvard Business School 2025"
  },
  {
    category: 'cv',
    text: "Un CV bien structuré passe les filtres ATS et atteint les recruteurs.",
  },

  // Portfolio Tips - GÉNÉRIQUE (pas de stats vérifiées)
  {
    category: 'portfolio',
    text: "Un portfolio montre concrètement vos compétences aux clients.",
  },
  {
    category: 'portfolio',
    text: "Les freelances expérimentés avec portfolio facturent $100-200/h vs $25-50/h débutants.",
    stat: "x2-4",
    source: "Consensus marché freelance 2025"
  },
  {
    category: 'portfolio',
    text: "Un bon portfolio vous différencie face à des centaines de candidats.",
  },

  // LinkedIn Tips - VÉRIFIÉ
  {
    category: 'linkedin',
    text: "Un profil LinkedIn complet génère 21x plus de vues.",
    stat: "21x",
    source: "Omnicore Agency 2024"
  },
  {
    category: 'linkedin',
    text: "Les profils complets reçoivent 36x plus de messages de recruteurs.",
    stat: "36x",
    source: "Omnicore Agency 2024"
  },
  {
    category: 'linkedin',
    text: "Un profil complet augmente vos callbacks de 15.8% pour les postes entry-level.",
    stat: "+15.8%",
    source: "Statista 2024"
  },
  {
    category: 'linkedin',
    text: "Votre réseau est votre meilleur atout pour trouver des opportunités.",
  },

  // Job Match Tips - VÉRIFIÉ
  {
    category: 'jobmatch',
    text: "50 à 70% des postes se remplissent sans annonce publique (marché caché).",
    stat: "50-70%",
    source: "The Interview Guys 2025, Management Consulted 2024"
  },
  {
    category: 'jobmatch',
    text: "Les candidats recommandés en interne ont 15x plus de chances d'être embauchés.",
    stat: "15x",
    source: "OpenArc 2025"
  },
  {
    category: 'jobmatch',
    text: "Votre réseau professionnel ouvre plus de portes que les candidatures en ligne.",
  },
  {
    category: 'jobmatch',
    text: "Personnaliser sa candidature fait la différence entre 100 CV identiques.",
  },

  // Vault / Security Tips - FACTUEL
  {
    category: 'vault',
    text: "Vos données restent sur votre appareil. Aucun cloud tiers.",
    stat: "100% local",
  },
  {
    category: 'vault',
    text: "Centralisez vos documents pour ne jamais chercher votre CV pendant 30 minutes.",
  },
  {
    category: 'vault',
    text: "Un système organisé réduit le stress lors de candidatures urgentes.",
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
