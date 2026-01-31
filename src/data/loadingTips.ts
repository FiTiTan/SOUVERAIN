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
  // CV Tips
  {
    category: 'cv',
    text: "Les recruteurs passent en moyenne 7 secondes sur un CV.",
    stat: "7 secondes",
    source: "Étude TheLadders 2023"
  },
  {
    category: 'cv',
    text: "75% des CV sont filtrés par des ATS avant d'atteindre un humain.",
    stat: "75%",
    source: "Jobscan 2024"
  },
  {
    category: 'cv',
    text: "Un CV optimisé augmente vos chances d'entretien de 40%.",
    stat: "+40%",
    source: "LinkedIn Talent Solutions"
  },
  {
    category: 'cv',
    text: "60% des candidats ne personnalisent jamais leur CV par poste.",
    stat: "60%",
  },
  {
    category: 'cv',
    text: "Les CV avec des verbes d'action obtiennent 2x plus de réponses.",
    stat: "2x plus",
  },

  // Portfolio Tips
  {
    category: 'portfolio',
    text: "Les freelances avec portfolio reçoivent 3x plus de demandes.",
    stat: "3x plus",
    source: "Malt 2024"
  },
  {
    category: 'portfolio',
    text: "70% des recruteurs tech visitent le portfolio avant l'entretien.",
    stat: "70%",
    source: "Stack Overflow Developer Survey"
  },
  {
    category: 'portfolio',
    text: "Un portfolio professionnel augmente vos tarifs de 35% en moyenne.",
    stat: "+35%",
    source: "Freelance.com"
  },
  {
    category: 'portfolio',
    text: "86% des clients choisissent un prestataire grâce à son portfolio.",
    stat: "86%",
  },
  {
    category: 'portfolio',
    text: "Les portfolios avec études de cas convertissent 5x mieux.",
    stat: "5x mieux",
  },

  // LinkedIn Tips
  {
    category: 'linkedin',
    text: "Les profils LinkedIn complets reçoivent 40x plus de vues.",
    stat: "40x plus",
    source: "LinkedIn"
  },
  {
    category: 'linkedin',
    text: "87% des recruteurs utilisent LinkedIn pour sourcer des candidats.",
    stat: "87%",
    source: "LinkedIn Recruiting"
  },
  {
    category: 'linkedin',
    text: "Un profil avec photo obtient 14x plus de vues.",
    stat: "14x plus",
    source: "LinkedIn"
  },
  {
    category: 'linkedin',
    text: "Les profils actifs (1 post/semaine) ont 2x plus d'opportunités.",
    stat: "2x plus",
  },
  {
    category: 'linkedin',
    text: "70% des embauches se font via le réseau, pas les annonces.",
    stat: "70%",
  },

  // Job Match Tips
  {
    category: 'jobmatch',
    text: "Les candidats qualifiés ont 50% de chances d'obtenir le poste.",
    stat: "50%",
  },
  {
    category: 'jobmatch',
    text: "80% des offres ne sont jamais publiées (marché caché).",
    stat: "80%",
    source: "Harvard Business Review"
  },
  {
    category: 'jobmatch',
    text: "Postuler dans les 24h augmente vos chances de 10x.",
    stat: "10x",
    source: "Indeed"
  },
  {
    category: 'jobmatch',
    text: "Les candidatures personnalisées ont 3x plus de retours.",
    stat: "3x plus",
  },
  {
    category: 'jobmatch',
    text: "50% des recruteurs écartent les candidats sur-qualifiés.",
    stat: "50%",
  },

  // Vault / Security Tips
  {
    category: 'vault',
    text: "77% des candidats perdent des documents importants entre deux jobs.",
    stat: "77%",
  },
  {
    category: 'vault',
    text: "Un coffre-fort numérique réduit le stress de recherche de 65%.",
    stat: "-65%",
  },
  {
    category: 'vault',
    text: "Vos données restent sur votre appareil. Aucun cloud tiers.",
    stat: "100% local",
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
