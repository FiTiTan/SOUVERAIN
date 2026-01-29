/**
 * SOUVERAIN - Ghost Mode Utility
 * Service d'anonymisation pour les exports (Mode Fantôme)
 */

export interface AnonymizationMap {
  [key: string]: string;
}

export interface GhostModeOptions {
  enabled: boolean;
  mappings?: AnonymizationMap;
}

// Regex pour détecter les entités sensibles
const PATTERNS = {
  // Emails: capture les formats standard
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  
  // Téléphones FR: 06 12 34 56 78 ou +33 6...
  phone: /(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}/g,
  
  // Adresses (simplifié: détecte codes postaux 5 chiffres)
  postalCode: /\b\d{5}\b/g,
};

/**
 * Anonymise un texte selon les règles du Ghost Mode
 */
export function anonymizeContent(text: string, options: GhostModeOptions): string {
  if (!options.enabled || !text) return text;

  let processedText = text;

  // 1. Appliquer les mappings spécifiques (ex: Nom Client -> [CLIENT_1])
  if (options.mappings) {
    Object.entries(options.mappings).forEach(([original, replacement]) => {
      // Échapper les caractères spéciaux pour la regex
      const escapedOriginal = original.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedOriginal, 'gi'); // Case insensitive
      processedText = processedText.replace(regex, replacement);
    });
  }

  // 2. Masquage automatique des données sensibles (emails, téléphones)
  processedText = processedText.replace(PATTERNS.email, '[EMAIL_MASQUÉ]');
  processedText = processedText.replace(PATTERNS.phone, '[TÉL_MASQUÉ]');

  return processedText;
}

/**
 * Détecte les entités sensibles potentielles dans un texte
 * Utile pour suggérer des mappings à l'utilisateur
 */
export function detectSensitiveData(text: string): string[] {
  const matches: string[] = [];
  
  // Emails
  const emails = text.match(PATTERNS.email);
  if (emails) matches.push(...emails);

  // Phones
  const phones = text.match(PATTERNS.phone);
  if (phones) matches.push(...phones);

  return [...new Set(matches)]; // Uniques
}
