/**
 * Types pour le module e-réputation
 */

export interface ReputationScore {
  global: number; // 0-100
  breakdown: {
    profileCompleteness: number; // 0-100
    socialPresence: number; // 0-100
    contentFreshness: number; // 0-100
    engagement: number; // 0-100
  };
  evolution: {
    date: string;
    score: number;
  }[];
  lastUpdated: Date;
}

export interface ReputationAction {
  id: string;
  title: string;
  description: string;
  impact: number; // Points gagnables
  category: 'profile' | 'social' | 'content' | 'engagement';
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  actionType: 'internal' | 'external'; // internal = dans l'app, external = lien externe
  link?: string; // Pour actions externes
  route?: string; // Pour actions internes
}

export interface SocialPlatformStatus {
  platform: 'linkedin' | 'github' | 'twitter' | 'instagram' | 'facebook';
  connected: boolean;
  profileUrl?: string;
  lastSync?: Date;
  score: number; // 0-100
  issues: string[]; // Ex: "Photo manquante", "Pas de bio"
}

export interface ReputationData {
  userId: string;
  score: ReputationScore;
  actions: ReputationAction[];
  socialPlatforms: SocialPlatformStatus[];
  goals: {
    targetScore: number;
    deadline?: Date;
    milestones: {
      score: number;
      label: string;
      achieved: boolean;
    }[];
  };
}
