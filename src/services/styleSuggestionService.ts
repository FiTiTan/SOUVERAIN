/**
 * Style Suggestion Service
 * 
 * Rule-based IA logic to suggest the most appropriate portfolio style
 * based on user's intentions, content, and context.
 */

export interface StyleSuggestionInput {
  portfolioTarget: string;
  keyPriorities: string[];
  practicalInfo: string[];
  projectsCount: number;
  hasLinkedIn: boolean;
  hasNotion: boolean;
  mediaStats: {
    images: number;
    videos: number;
    pdfs: number;
    documents: number;
  };
}

export interface StyleSuggestion {
  styleId: 'moderne' | 'classique' | 'authentique' | 'artistique' | 'vitrine' | 'formel';
  confidence: number;
  reason: string;
}

/**
 * Suggest the most appropriate portfolio style based on input data
 */
export function suggestStyle(input: StyleSuggestionInput): StyleSuggestion {
  const { portfolioTarget, keyPriorities, practicalInfo, mediaStats, hasLinkedIn } = input;

  // VITRINE : Commerce local avec infos pratiques
  if (
    ['shop', 'restaurant'].includes(portfolioTarget) &&
    practicalInfo.some(p => ['hours', 'address', 'phone'].includes(p))
  ) {
    return {
      styleId: 'vitrine',
      confidence: 0.9,
      reason: 'Votre commerce bénéficiera d\'un style mettant en avant vos informations pratiques.',
    };
  }

  // FORMEL : Cabinet, praticien
  if (['cabinet', 'health'].includes(portfolioTarget)) {
    return {
      styleId: 'formel',
      confidence: 0.85,
      reason: 'Un style institutionnel inspirera confiance à vos clients et patients.',
    };
  }

  // ARTISTIQUE : Projet artistique ou beaucoup d'images
  if (
    portfolioTarget === 'artistic' ||
    (mediaStats.images > 10 && keyPriorities.includes('showcase_work'))
  ) {
    return {
      styleId: 'artistique',
      confidence: 0.85,
      reason: 'Vos visuels méritent d\'être mis en avant dans un style épuré.',
    };
  }

  // MODERNE : Freelance avec LinkedIn
  if (
    portfolioTarget === 'personal' &&
    hasLinkedIn &&
    keyPriorities.some(p => ['attract_clients', 'show_expertise'].includes(p))
  ) {
    return {
      styleId: 'moderne',
      confidence: 0.8,
      reason: 'Un style dynamique correspondra parfaitement à votre profil freelance.',
    };
  }

  // CLASSIQUE : Entreprise avec confiance
  if (
    portfolioTarget === 'company' &&
    keyPriorities.includes('build_trust')
  ) {
    return {
      styleId: 'classique',
      confidence: 0.8,
      reason: 'Un style sobre et professionnel renforcera la crédibilité de votre entreprise.',
    };
  }

  // AUTHENTIQUE : Artisan avec tarifs/RDV
  if (
    practicalInfo.some(p => ['pricing', 'booking'].includes(p)) &&
    !['shop', 'restaurant', 'cabinet', 'health'].includes(portfolioTarget)
  ) {
    return {
      styleId: 'authentique',
      confidence: 0.75,
      reason: 'Un style chaleureux mettra en valeur votre savoir-faire.',
    };
  }

  // Défaut : MODERNE
  return {
    styleId: 'moderne',
    confidence: 0.6,
    reason: 'Le style Moderne est polyvalent et s\'adapte à la plupart des profils.',
  };
}
