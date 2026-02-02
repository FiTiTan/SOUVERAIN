/**
 * Service de calcul du score e-réputation
 */

import type { ReputationScore, ReputationAction, ReputationData, SocialPlatformStatus } from '../types/reputation';

/**
 * Calcule le score de complétude du profil
 */
export function calculateProfileCompleteness(): number {
  // TODO: Vérifier DB pour CV, Portfolio, Photo, Bio, etc.
  // Pour l'instant: mock
  const checks = {
    hasCv: true,
    hasPortfolio: true,
    hasPhoto: false,
    hasBio: true,
    hasContact: true,
  };

  const completed = Object.values(checks).filter(Boolean).length;
  return Math.round((completed / Object.keys(checks).length) * 100);
}

/**
 * Calcule le score de présence sociale
 */
export function calculateSocialPresence(platforms: SocialPlatformStatus[]): number {
  if (platforms.length === 0) return 0;

  const connected = platforms.filter(p => p.connected).length;
  const avgScore = platforms.reduce((sum, p) => sum + p.score, 0) / platforms.length;

  return Math.round((connected / platforms.length) * 50 + avgScore * 0.5);
}

/**
 * Calcule le score de fraîcheur du contenu
 */
export function calculateContentFreshness(): number {
  // TODO: Vérifier date dernière mise à jour CV, portfolio, posts
  // Pour l'instant: mock basé sur date du jour
  const lastUpdate = new Date('2026-02-01'); // Mock
  const daysSinceUpdate = Math.floor((Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));

  if (daysSinceUpdate <= 7) return 100;
  if (daysSinceUpdate <= 30) return 80;
  if (daysSinceUpdate <= 90) return 60;
  return 40;
}

/**
 * Calcule le score d'engagement
 */
export function calculateEngagement(): number {
  // TODO: Intégrer API LinkedIn, GitHub pour likes, comments, stars, etc.
  // Pour l'instant: mock
  return 65;
}

/**
 * Calcule le score global
 */
export function calculateGlobalScore(breakdown: ReputationScore['breakdown']): number {
  const weights = {
    profileCompleteness: 0.30,
    socialPresence: 0.25,
    contentFreshness: 0.25,
    engagement: 0.20,
  };

  return Math.round(
    breakdown.profileCompleteness * weights.profileCompleteness +
    breakdown.socialPresence * weights.socialPresence +
    breakdown.contentFreshness * weights.contentFreshness +
    breakdown.engagement * weights.engagement
  );
}

/**
 * Génère les actions recommandées
 */
export function generateRecommendedActions(
  score: ReputationScore,
  platforms: SocialPlatformStatus[]
): ReputationAction[] {
  const actions: ReputationAction[] = [];

  // Actions profil
  if (score.breakdown.profileCompleteness < 100) {
    actions.push({
      id: 'complete-profile',
      title: 'Complète ton profil',
      description: 'Ajoute une photo et remplis tous les champs',
      impact: 15,
      category: 'profile',
      priority: 'high',
      completed: false,
      actionType: 'internal',
      route: '/cv-coach',
    });
  }

  // Actions réseaux sociaux
  const disconnected = platforms.filter(p => !p.connected);
  if (disconnected.length > 0) {
    actions.push({
      id: 'connect-socials',
      title: `Connecte ${disconnected.length} réseau(x) social`,
      description: `${disconnected.map(p => p.platform).join(', ')}`,
      impact: 20,
      category: 'social',
      priority: 'high',
      completed: false,
      actionType: 'internal',
      route: '/portfolio',
    });
  }

  // Actions contenu
  if (score.breakdown.contentFreshness < 80) {
    actions.push({
      id: 'update-portfolio',
      title: 'Mets à jour ton portfolio',
      description: 'Ajoute tes projets récents',
      impact: 18,
      category: 'content',
      priority: 'high',
      completed: false,
      actionType: 'internal',
      route: '/portfolio',
    });
  }

  // Actions engagement
  if (score.breakdown.engagement < 70) {
    actions.push({
      id: 'post-linkedin',
      title: 'Publie sur LinkedIn',
      description: 'Partage un projet ou une réflexion',
      impact: 12,
      category: 'engagement',
      priority: 'medium',
      completed: false,
      actionType: 'external',
      link: 'https://www.linkedin.com/feed/',
    });
  }

  // Trier par impact décroissant
  return actions.sort((a, b) => b.impact - a.impact);
}

/**
 * Récupère les données complètes de réputation
 */
export async function getReputationData(): Promise<ReputationData> {
  // Mock platforms
  const platforms: SocialPlatformStatus[] = [
    {
      platform: 'linkedin',
      connected: true,
      profileUrl: 'https://linkedin.com/in/jean-louis',
      lastSync: new Date(),
      score: 85,
      issues: [],
    },
    {
      platform: 'github',
      connected: true,
      profileUrl: 'https://github.com/jeanlou',
      score: 90,
      issues: [],
    },
    {
      platform: 'twitter',
      connected: false,
      score: 0,
      issues: ['Non connecté'],
    },
  ];

  const breakdown = {
    profileCompleteness: calculateProfileCompleteness(),
    socialPresence: calculateSocialPresence(platforms),
    contentFreshness: calculateContentFreshness(),
    engagement: calculateEngagement(),
  };

  const globalScore = calculateGlobalScore(breakdown);

  // Mock evolution (30 derniers jours)
  const evolution = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    score: Math.min(100, Math.max(0, globalScore + Math.random() * 20 - 10)),
  }));

  const score: ReputationScore = {
    global: globalScore,
    breakdown,
    evolution,
    lastUpdated: new Date(),
  };

  const actions = generateRecommendedActions(score, platforms);

  return {
    userId: 'user-1', // TODO: get from auth
    score,
    actions,
    socialPlatforms: platforms,
    goals: {
      targetScore: 90,
      milestones: [
        { score: 60, label: 'Débutant', achieved: globalScore >= 60 },
        { score: 75, label: 'Intermédiaire', achieved: globalScore >= 75 },
        { score: 90, label: 'Expert', achieved: globalScore >= 90 },
      ],
    },
  };
}
