/**
 * SOUVERAIN - Garde-fous de validation post-génération
 * 
 * À intégrer dans aiEnrichmentService.ts
 * Détecte les problèmes et retry automatiquement si nécessaire
 */

// ============================================
// CONSTANTES DE VALIDATION
// ============================================

/**
 * Mots interdits - Ton personnel
 * Détecte l'utilisation de "je", "nous", etc.
 */
const PERSONAL_TONE_REGEX = /\b(je |j'|nous |n'ai|n'est|n'a|notre |nos |mon |ma |mes )\b/i;

/**
 * Mots "consulting" interdits pour les commerces (food/retail)
 * Ces formulations sont typiques du conseil, pas de la vente de produits
 */
const CONSULTING_WORDS_BLACKLIST = [
  'conception de',
  'exploration de',
  'conseil en',
  'stratégie de',
  'analyse de',
  'optimisation des',
  'élaboration de',
  'mise en place de',
  'accompagnement stratégique',
  'développement de stratégie'
];

/**
 * Catégories qui vendent des PRODUITS (pas des services)
 */
const PRODUCT_CATEGORIES = ['food', 'retail'];

// ============================================
// FONCTIONS DE VALIDATION
// ============================================

/**
 * Détecte si un texte contient un ton personnel (je/nous/notre)
 */
export function hasPersonalTone(text: string): boolean {
  if (!text) return false;
  return PERSONAL_TONE_REGEX.test(text);
}

/**
 * Détecte si un texte contient du vocabulaire "consulting"
 * Ne s'applique qu'aux catégories food/retail
 */
export function hasConsultingWords(text: string, profileType: string): boolean {
  if (!text) return false;
  if (!PRODUCT_CATEGORIES.includes(profileType)) return false;
  
  const lowerText = text.toLowerCase();
  return CONSULTING_WORDS_BLACKLIST.some(word => lowerText.includes(word));
}

/**
 * Valide un service généré
 * Retourne un objet avec les problèmes détectés
 */
export function validateService(
  service: { title: string; description: string },
  profileType: string
): { isValid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  // Check ton personnel dans le titre
  if (hasPersonalTone(service.title)) {
    issues.push(`Ton personnel dans titre: "${service.title}"`);
  }
  
  // Check ton personnel dans la description
  if (hasPersonalTone(service.description)) {
    issues.push(`Ton personnel dans description`);
  }
  
  // Check vocabulaire consulting (food/retail uniquement)
  if (hasConsultingWords(service.title, profileType)) {
    issues.push(`Vocabulaire consulting dans titre: "${service.title}"`);
  }
  
  if (hasConsultingWords(service.description, profileType)) {
    issues.push(`Vocabulaire consulting dans description`);
  }
  
  // Check longueur description (30-50 mots)
  const wordCount = service.description?.split(/\s+/).length || 0;
  if (wordCount < 20) {
    issues.push(`Description trop courte: ${wordCount} mots`);
  }
  if (wordCount > 70) {
    issues.push(`Description trop longue: ${wordCount} mots`);
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
}

/**
 * Valide tous les services générés
 * Retourne true si tous sont valides
 */
export function validateAllServices(
  services: Array<{ title: string; description: string }>,
  profileType: string
): { isValid: boolean; allIssues: string[] } {
  const allIssues: string[] = [];
  
  services.forEach((service, index) => {
    const validation = validateService(service, profileType);
    if (!validation.isValid) {
      validation.issues.forEach(issue => {
        allIssues.push(`Service ${index + 1}: ${issue}`);
      });
    }
  });
  
  return {
    isValid: allIssues.length === 0,
    allIssues
  };
}

// ============================================
// WRAPPER AVEC RETRY AUTOMATIQUE
// ============================================

/**
 * Génère les services avec validation et retry automatique
 * 
 * @param generateFn - La fonction de génération originale
 * @param data - Les données du wizard (name, activity, valueProp, etc.)
 * @param maxRetries - Nombre max de tentatives (défaut: 2)
 */
export async function generateServicesWithValidation<T extends { profileType: string }>(
  generateFn: (data: T) => Promise<{ label: string; services: Array<{ title: string; description: string }> }>,
  data: T,
  maxRetries: number = 2
): Promise<{ label: string; services: Array<{ title: string; description: string }> }> {
  
  let lastResult = null;
  let lastIssues: string[] = [];
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`[AI] Génération services - Tentative ${attempt}/${maxRetries}`);
    
    try {
      const result = await generateFn(data);
      lastResult = result;
      
      // Validation
      const validation = validateAllServices(result.services, data.profileType);
      
      if (validation.isValid) {
        console.log(`[AI] ✅ Services validés - Tentative ${attempt}`);
        return result;
      }
      
      // Problèmes détectés
      lastIssues = validation.allIssues;
      console.warn(`[AI] ⚠️ Problèmes détectés - Tentative ${attempt}:`, validation.allIssues);
      
      if (attempt < maxRetries) {
        console.log(`[AI] 🔄 Retry...`);
        // Petit délai avant retry
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
    } catch (error) {
      console.error(`[AI] ❌ Erreur génération - Tentative ${attempt}:`, error);
      if (attempt === maxRetries) {
        throw error;
      }
    }
  }
  
  // Si on arrive ici, on retourne le dernier résultat malgré les issues
  console.warn(`[AI] ⚠️ Max retries atteint, retour du dernier résultat avec issues:`, lastIssues);
  return lastResult!;
}

// ============================================
// EXEMPLE D'UTILISATION
// ============================================

/*
// Dans aiEnrichmentService.ts :

import { generateServicesWithValidation, validateAllServices } from './aiValidation';

// Ancienne méthode :
// const result = await callDeepSeek(prompt, data);

// Nouvelle méthode avec validation :
const result = await generateServicesWithValidation(
  (data) => callDeepSeek(buildServicesPrompt(data), data),
  wizardData,
  2 // max 2 tentatives
);

// Le résultat est automatiquement validé et re-généré si nécessaire
*/
