// SOUVERAIN - Intention Service
// Gère le formulaire d'intention utilisateur pour personnaliser l'expérience

export interface IntentionFormData {
  objective: string;
  targetAudience: string;
  contentType: string[];
  desiredTone: string;
  sector: string;
}

/**
 * Sauvegarde les intentions de l'utilisateur
 */
export async function saveIntention(
  portfolioId: string,
  data: IntentionFormData
): Promise<void> {
  try {
    const intentionJson = JSON.stringify(data);
    
    // @ts-ignore
    const result = await window.electron.invoke('db-update-portfolio-intention', {
      portfolioId,
      intentionFormJson: intentionJson
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to save intention');
    }
  } catch (error) {
    console.error('[IntentionService] Save error:', error);
    throw error;
  }
}

/**
 * Récupère les intentions de l'utilisateur
 */
export async function getIntention(
  portfolioId: string
): Promise<IntentionFormData | null> {
  try {
    // @ts-ignore
    const result = await window.electron.invoke('db-get-portfolio-intention', portfolioId);

    if (!result || !result.intention_form_json) {
      return null;
    }

    return JSON.parse(result.intention_form_json);
  } catch (error) {
    console.error('[IntentionService] Get error:', error);
    return null;
  }
}

/**
 * Vérifie si l'utilisateur a complété le formulaire d'intention
 */
export async function hasCompletedIntention(
  portfolioId: string
): Promise<boolean> {
  const data = await getIntention(portfolioId);
  return data !== null;
}

/**
 * Convertit les données d'intention en contexte pour l'IA
 */
export function intentionToAIContext(data: IntentionFormData): string {
  const parts = [
    `Objectif: ${data.objective}`,
    `Audience: ${data.targetAudience}`,
    `Type de contenu: ${data.contentType.join(', ')}`,
    `Ton: ${data.desiredTone}`,
    `Secteur: ${data.sector}`
  ];

  return parts.join(' | ');
}

/**
 * Options disponibles pour le formulaire
 */
export const INTENTION_OPTIONS = {
  objectives: [
    { id: 'find_clients', label: 'Trouver des clients', icon: '🎯' },
    { id: 'showcase_work', label: 'Montrer mon travail', icon: '✨' },
    { id: 'career_transition', label: 'Transition de carrière', icon: '🚀' },
    { id: 'personal_branding', label: 'Personal branding', icon: '💼' }
  ],
  audiences: [
    { id: 'b2b', label: 'Entreprises (B2B)', icon: '🏢' },
    { id: 'b2c', label: 'Particuliers (B2C)', icon: '👥' },
    { id: 'recruiters', label: 'Recruteurs', icon: '🎓' },
    { id: 'investors', label: 'Investisseurs', icon: '💰' },
    { id: 'mixed', label: 'Mixte', icon: '🌐' }
  ],
  contentTypes: [
    { id: 'visual', label: 'Visuel (photos, design)', icon: '🎨' },
    { id: 'technical', label: 'Technique (code, architecture)', icon: '💻' },
    { id: 'service', label: 'Service (conseil, accompagnement)', icon: '🤝' },
    { id: 'product', label: 'Produit (création, fabrication)', icon: '📦' },
    { id: 'content', label: 'Contenu (rédaction, média)', icon: '✍️' }
  ],
  tones: [
    { id: 'professional', label: 'Professionnel', icon: '👔' },
    { id: 'creative', label: 'Créatif', icon: '🎭' },
    { id: 'warm', label: 'Chaleureux', icon: '🌟' },
    { id: 'expert', label: 'Expert', icon: '🎓' },
    { id: 'premium', label: 'Premium', icon: '💎' }
  ],
  sectors: [
    { id: 'tech', label: 'Tech / Digital', icon: '💻' },
    { id: 'creative', label: 'Créatif / Design', icon: '🎨' },
    { id: 'craft', label: 'Artisanat / Manuel', icon: '🔨' },
    { id: 'consulting', label: 'Conseil / Expertise', icon: '📊' },
    { id: 'commerce', label: 'Commerce / Vente', icon: '🛍️' },
    { id: 'health', label: 'Santé / Bien-être', icon: '🏥' },
    { id: 'legal', label: 'Juridique / Finance', icon: '⚖️' },
    { id: 'education', label: 'Éducation / Formation', icon: '📚' }
  ]
};
