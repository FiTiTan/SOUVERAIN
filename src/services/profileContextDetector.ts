/**
 * SOUVERAIN - Profile Context Detector
 * 
 * Détecte automatiquement le type de profil (food, retail, tech, etc.)
 * à partir du métier/activité saisi par l'utilisateur.
 * 
 * Utilise DeepSeek pour une classification précise.
 */

export type ProfileContext = 
  | 'food'      // Restaurant, café, boulangerie...
  | 'retail'    // Boutique, fleuriste, librairie...
  | 'artisan'   // Plombier, électricien, menuisier...
  | 'service'   // Avocat, coach, comptable...
  | 'tech'      // Développeur, designer, graphiste...
  | 'niche';    // Tatoueur, DJ, sophrologue...

export interface ProfileContextResult {
  context: ProfileContext;
  confidence: 'high' | 'medium' | 'low';
  isPlace: boolean; // true = lieu/établissement, false = personne
}

const DETECTION_PROMPT = `Analyse cette activité/métier et classifie-la.

Activité : "{{ACTIVITY}}"

CATÉGORIES POSSIBLES :
- food : Restaurant, café, boulangerie, pâtisserie, traiteur, glacier, pizzeria, bar, bistrot, salon de thé, crêperie, food truck
- retail : Boutique, magasin, fleuriste, librairie, épicerie, caviste, concept store, friperie
- artisan : Plombier, électricien, menuisier, serrurier, peintre, carreleur, chauffagiste, maçon, couvreur, vitrier
- service : Avocat, coach, comptable, notaire, architecte, psychologue, kinésithérapeute, ostéopathe, consultant
- tech : Développeur, designer, graphiste, UX/UI, webmaster, community manager, SEO, data analyst, product manager
- niche : Tatoueur, DJ, sophrologue, hypnothérapeute, medium, décorateur événementiel, wedding planner

RÈGLES :
- Si c'est un LIEU où on consomme/achète sur place → isPlace: true
- Si c'est une PERSONNE qui propose des services → isPlace: false
- En cas de doute, utilise "service" avec confidence "low"

Réponds UNIQUEMENT en JSON :
{
  "context": "food|retail|artisan|service|tech|niche",
  "confidence": "high|medium|low",
  "isPlace": true|false
}`;

/**
 * Détecte le profileContext à partir de l'activité saisie
 */
export async function detectProfileContext(activity: string): Promise<ProfileContextResult> {
  if (!activity || activity.trim().length < 2) {
    return { context: 'service', confidence: 'low', isPlace: false };
  }

  try {
    // @ts-ignore
    const keyResult = await window.electron.deepseek.getApiKey();
    if (!keyResult.success || !keyResult.key) {
      console.warn('[ProfileDetector] No API key, using fallback');
      return fallbackDetection(activity);
    }

    const prompt = DETECTION_PROMPT.replace('{{ACTIVITY}}', activity.trim());

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${keyResult.key}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1, // Très déterministe
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      console.warn('[ProfileDetector] API error, using fallback');
      return fallbackDetection(activity);
    }

    const result = await response.json();
    let content = result.choices[0].message.content;
    content = content.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim();

    const parsed = JSON.parse(content);

    // Valider le résultat
    const validContexts: ProfileContext[] = ['food', 'retail', 'artisan', 'service', 'tech', 'niche'];
    if (!validContexts.includes(parsed.context)) {
      parsed.context = 'service';
      parsed.confidence = 'low';
    }

    console.log('[ProfileDetector] Detected:', parsed);

    return {
      context: parsed.context as ProfileContext,
      confidence: parsed.confidence || 'medium',
      isPlace: parsed.isPlace ?? false,
    };

  } catch (error) {
    console.error('[ProfileDetector] Error:', error);
    return fallbackDetection(activity);
  }
}

/**
 * Fallback local si l'API n'est pas disponible
 */
function fallbackDetection(activity: string): ProfileContextResult {
  const lower = activity.toLowerCase();

  // Food (lieux)
  if (/restaurant|café|coffee|boulangerie|pâtisserie|traiteur|glacier|pizzeria|bar|bistrot|salon de thé|crêperie|food truck|snack|brasserie/.test(lower)) {
    return { context: 'food', confidence: 'medium', isPlace: true };
  }

  // Retail (lieux)
  if (/boutique|magasin|fleuriste|librairie|épicerie|caviste|concept store|friperie|mercerie|bijouterie|parfumerie/.test(lower)) {
    return { context: 'retail', confidence: 'medium', isPlace: true };
  }

  // Artisan (personnes)
  if (/plombier|électricien|menuisier|serrurier|peintre|carreleur|chauffagiste|maçon|couvreur|vitrier|charpentier|soudeur/.test(lower)) {
    return { context: 'artisan', confidence: 'medium', isPlace: false };
  }

  // Tech (personnes)
  if (/développeur|designer|graphiste|dev|ux|ui|web|mobile|freelance|data|product|community manager|seo|webmaster|full.?stack|front.?end|back.?end/.test(lower)) {
    return { context: 'tech', confidence: 'medium', isPlace: false };
  }

  // Service (personnes)
  if (/avocat|coach|comptable|notaire|architecte|photographe|psychologue|kiné|ostéo|consultant|formateur|traducteur|rédacteur/.test(lower)) {
    return { context: 'service', confidence: 'medium', isPlace: false };
  }

  // Niche (personnes)
  if (/tatoueur|dj|sophrologue|hypno|medium|voyant|wedding|décorateur|maquilleur|coiffeur|esthéti/.test(lower)) {
    return { context: 'niche', confidence: 'medium', isPlace: false };
  }

  // Default
  return { context: 'service', confidence: 'low', isPlace: false };
}

/**
 * Retourne les labels adaptés au profileContext
 */
export function getContextLabels(context: ProfileContext, isPlace: boolean) {
  const labels = {
    food: {
      activityLabel: 'Type de lieu',
      activityPlaceholder: 'Ex: Coffee shop, Restaurant, Boulangerie',
      expertisesLabel: 'Vos 3 spécialités',
      expertisesHelper: 'Ce que vous proposez à la carte',
      expertisesPlaceholders: ['Ex: Cafés de spécialité', 'Ex: Pâtisseries maison', 'Ex: Brunchs'],
    },
    retail: {
      activityLabel: 'Type de lieu',
      activityPlaceholder: 'Ex: Boutique vêtements, Fleuriste, Librairie',
      expertisesLabel: 'Vos 3 types de produits',
      expertisesHelper: "Ce qu'on trouve chez vous",
      expertisesPlaceholders: ['Ex: Robes de mariée', 'Ex: Accessoires', 'Ex: Sur-mesure'],
    },
    artisan: {
      activityLabel: 'Votre métier',
      activityPlaceholder: 'Ex: Plombier, Électricien, Menuisier',
      expertisesLabel: 'Vos 3 savoir-faire',
      expertisesHelper: 'Ce que vous savez faire',
      expertisesPlaceholders: ['Ex: Dépannage urgent', 'Ex: Installation', 'Ex: Rénovation'],
    },
    service: {
      activityLabel: 'Votre métier',
      activityPlaceholder: 'Ex: Avocat, Coach sportif, Photographe',
      expertisesLabel: 'Vos 3 domaines',
      expertisesHelper: "Vos domaines d'intervention",
      expertisesPlaceholders: ['Ex: Divorce amiable', 'Ex: Garde d\'enfants', 'Ex: Médiation'],
    },
    tech: {
      activityLabel: 'Votre métier',
      activityPlaceholder: 'Ex: Développeur web, Designer UI/UX, Graphiste',
      expertisesLabel: 'Vos 3 expertises',
      expertisesHelper: 'Vos compétences clés',
      expertisesPlaceholders: ['Ex: React / Vue.js', 'Ex: API Node.js', 'Ex: E-commerce'],
    },
    niche: {
      activityLabel: 'Votre métier',
      activityPlaceholder: 'Ex: Tatoueur, Sophrologue, DJ',
      expertisesLabel: 'Vos 3 spécialités',
      expertisesHelper: 'Ce que vous proposez',
      expertisesPlaceholders: ['Ex: Tatouage réaliste', 'Ex: Cover-up', 'Ex: Dotwork'],
    },
  };

  return labels[context] || labels.service;
}
