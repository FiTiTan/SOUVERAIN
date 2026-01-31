// SOUVERAIN - Anonymization Service V3
// Regex-based anonymization for V3 workflow
// Compatible with Electron renderer process

export interface EntityMap {
  [placeholder: string]: string;
}

export interface AnonymizationResult {
  anonymizedText: string;
  entityMap: EntityMap;
  sessionId: string;
  stats: {
    people: number;
    companies: number;
    emails: number;
    phones: number;
    cities: number;
    dates: number;
  };
}

// Compteurs pour les placeholders
let entityCounters: { [type: string]: number } = {};

/**
 * Génère un placeholder unique
 */
function getPlaceholder(entityType: string): string {
  if (!entityCounters[entityType]) {
    entityCounters[entityType] = 0;
  }
  entityCounters[entityType]++;
  return `${entityType}_${String(entityCounters[entityType]).padStart(3, '0')}`;
}

/**
 * Détecte les emails avec regex
 */
function detectEmails(text: string): Array<{ text: string; start: number; end: number }> {
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches: Array<{ text: string; start: number; end: number }> = [];
  let match;
  
  while ((match = emailRegex.exec(text)) !== null) {
    matches.push({
      text: match[0],
      start: match.index,
      end: match.index + match[0].length,
    });
  }
  
  return matches;
}

/**
 * Détecte les numéros de téléphone avec regex
 */
function detectPhones(text: string): Array<{ text: string; start: number; end: number }> {
  // Formats français et internationaux
  const phoneRegex = /(?:\+33|0033|0)[1-9](?:[\s.-]?\d{2}){4}|\+\d{1,3}[\s.-]?\d{1,4}[\s.-]?\d{1,4}[\s.-]?\d{1,9}/g;
  const matches: Array<{ text: string; start: number; end: number }> = [];
  let match;
  
  while ((match = phoneRegex.exec(text)) !== null) {
    matches.push({
      text: match[0],
      start: match.index,
      end: match.index + match[0].length,
    });
  }
  
  return matches;
}

/**
 * Détecte les noms propres (simple heuristique)
 * Format: Majuscule + minuscules, potentiellement avec plusieurs mots
 */
function detectNames(text: string): Array<{ text: string; start: number; end: number }> {
  // Noms composés ou simples avec majuscule
  const nameRegex = /\b[A-ZÀ-Ö][a-zà-ö]+(?:[\s-][A-ZÀ-Ö][a-zà-ö]+)+\b/g;
  const matches: Array<{ text: string; start: number; end: number }> = [];
  let match;
  
  while ((match = nameRegex.exec(text)) !== null) {
    // Filtrer les faux positifs courants
    const name = match[0];
    if (!['Bonjour', 'Merci', 'Cordialement', 'France', 'Paris'].includes(name)) {
      matches.push({
        text: name,
        start: match.index,
        end: match.index + name.length,
      });
    }
  }
  
  return matches;
}

/**
 * Détecte les entreprises (heuristique simple)
 * Mots avec majuscules, SARL, SAS, SA, etc.
 */
function detectCompanies(text: string): Array<{ text: string; start: number; end: number }> {
  const companyRegex = /\b(?:[A-ZÀ-Ö][a-zà-ö]+\s+)*(?:SARL|SAS|SA|EURL|SCI|SASU|Auto-entrepreneur|Freelance)\b/g;
  const matches: Array<{ text: string; start: number; end: number }> = [];
  let match;
  
  while ((match = companyRegex.exec(text)) !== null) {
    matches.push({
      text: match[0],
      start: match.index,
      end: match.index + match[0].length,
    });
  }
  
  return matches;
}

/**
 * Détecte les villes françaises courantes
 */
function detectCities(text: string): Array<{ text: string; start: number; end: number }> {
  const commonCities = [
    'Paris', 'Lyon', 'Marseille', 'Toulouse', 'Bordeaux', 'Lille', 'Nice', 'Nantes',
    'Strasbourg', 'Montpellier', 'Rennes', 'Grenoble', 'Dijon', 'Angers', 'Saint-Étienne',
    'Le Havre', 'Toulon', 'Clermont-Ferrand', 'Aix-en-Provence', 'Brest'
  ];
  
  const matches: Array<{ text: string; start: number; end: number }> = [];
  
  for (const city of commonCities) {
    const regex = new RegExp(`\\b${city}\\b`, 'gi');
    let match;
    while ((match = regex.exec(text)) !== null) {
      matches.push({
        text: match[0],
        start: match.index,
        end: match.index + match[0].length,
      });
    }
  }
  
  return matches;
}

/**
 * Anonymise un texte avec regex renforcées
 */
export async function anonymize(text: string): Promise<AnonymizationResult> {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  entityCounters = {}; // Reset compteurs
  
  const entityMap: EntityMap = {};
  let anonymizedText = text;
  
  const stats = {
    people: 0,
    companies: 0,
    emails: 0,
    phones: 0,
    cities: 0,
    dates: 0,
  };
  
  // 1. Détection des emails et téléphones (regex - plus fiable)
  const emails = detectEmails(text);
  const phones = detectPhones(text);
  const names = detectNames(text);
  const companies = detectCompanies(text);
  const cities = detectCities(text);
  
  // Stocker les entités
  for (const email of emails) {
    const placeholder = getPlaceholder('EMAIL');
    entityMap[placeholder] = email.text;
    stats.emails++;
  }
  
  for (const phone of phones) {
    const placeholder = getPlaceholder('PHONE');
    entityMap[placeholder] = phone.text;
    stats.phones++;
  }
  
  for (const name of names) {
    const placeholder = getPlaceholder('PERSON');
    entityMap[placeholder] = name.text;
    stats.people++;
  }
  
  for (const company of companies) {
    const placeholder = getPlaceholder('COMPANY');
    entityMap[placeholder] = company.text;
    stats.companies++;
  }
  
  for (const city of cities) {
    const placeholder = getPlaceholder('CITY');
    entityMap[placeholder] = city.text;
    stats.cities++;
  }
  
  // 2. Remplacer les entités (du plus long au plus court pour éviter les conflits)
  const sortedEntities = Object.entries(entityMap).sort(
    ([, a], [, b]) => b.length - a.length
  );
  
  for (const [placeholder, originalValue] of sortedEntities) {
    // Échapper les caractères spéciaux pour la regex
    const escaped = originalValue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
    anonymizedText = anonymizedText.replace(regex, placeholder);
  }
  
  console.log(`[Anonymization] ${Object.keys(entityMap).length} entités anonymisées`);
  console.log('[Anonymization] Stats:', stats);
  
  return {
    anonymizedText,
    entityMap,
    sessionId,
    stats,
  };
}

/**
 * Désanonymise un texte avec le mapping
 */
export function deanonymize(text: string, entityMap: EntityMap): string {
  let result = text;
  
  // Remplacer les placeholders par les valeurs originales
  // Du plus long au plus court pour éviter les conflits partiels
  const sortedPlaceholders = Object.keys(entityMap).sort((a, b) => b.length - a.length);
  
  for (const placeholder of sortedPlaceholders) {
    const originalValue = entityMap[placeholder];
    const regex = new RegExp(`\\b${placeholder}\\b`, 'g');
    result = result.replace(regex, originalValue);
  }
  
  console.log(`[Deanonymization] ${sortedPlaceholders.length} entités restaurées`);
  
  return result;
}

/**
 * Anonymise un objet JSON complet (récursif)
 */
export async function anonymizeObject(obj: any): Promise<{ anonymized: any; entityMap: EntityMap }> {
  // Convertir en string JSON, anonymiser, reconvertir
  const jsonString = JSON.stringify(obj, null, 2);
  const { anonymizedText, entityMap } = await anonymize(jsonString);
  const anonymized = JSON.parse(anonymizedText);
  
  return { anonymized, entityMap };
}

/**
 * Désanonymise un objet JSON complet
 */
export function deanonymizeObject(obj: any, entityMap: EntityMap): any {
  const jsonString = JSON.stringify(obj, null, 2);
  const deanonymized = deanonymize(jsonString, entityMap);
  return JSON.parse(deanonymized);
}
