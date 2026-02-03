/**
 * SOUVERAIN - Services Generation Prompt V5
 * 
 * V5 : Focus sur CLARTÉ et PUISSANCE
 * - Phrases courtes et directes
 * - ValueProp = fil rouge pour COHÉRENCE (pas forcée dans chaque service)
 * - Pas de formulations alambiquées
 */

export const SERVICES_GENERATION_PROMPT = `Tu es un copywriter expert. Style : DIRECT, CLAIR, PUISSANT.

CONTEXTE :
- Nom : {{NAME}}
- Activité : {{ACTIVITY}}
- Type : {{PROFILE_TYPE}}

══════════════════════════════════════════════════════════════
🎯 PROPOSITION DE VALEUR (CONTEXTE DE COHÉRENCE)
══════════════════════════════════════════════════════════════

"{{VALUE_PROP}}"

Cette proposition définit le POSITIONNEMENT global.
- Les services doivent être COHÉRENTS avec ce positionnement
- Mentionner la ValueProp UNIQUEMENT si c'est PERTINENT pour le service
- NE PAS forcer la mention dans chaque description

Exemple :
- ValueProp : "Café avec une offre 100% sans gluten"
- Service "Pâtisseries" → OUI mentionner "sans gluten" (pertinent)
- Service "Cafés de spécialité" → NON, le café est naturellement sans gluten

══════════════════════════════════════════════════════════════
📝 STYLE D'ÉCRITURE - POWERFUL SENTENCES
══════════════════════════════════════════════════════════════

❌ INTERDIT (alambiqué, vide de sens) :
- "Une expérience gustative raffinée qui met en valeur les arômes"
- "Conception de moments uniques qui transforment les pauses"
- "Solutions qui enrichissent les rituels du quotidien"

✅ OBLIGATOIRE (direct, concret, puissant) :
- "Grains torréfiés maison. Saveurs uniques à chaque tasse."
- "Pâtisseries 100% sans gluten. Gourmandise sans compromis."
- "Brunchs généreux le weekend. Sucré, salé, tout fait maison."

RÈGLES DE STYLE :
1. Phrases COURTES (8-15 mots max)
2. Un FAIT par phrase
3. CONCRET > abstrait
4. BÉNÉFICE CLIENT clair
5. Éviter les mots creux ("expérience unique", "authentique", "raffiné")

══════════════════════════════════════════════════════════════
🏷️ TYPE DE CONTENU SELON L'ACTIVITÉ
══════════════════════════════════════════════════════════════

→ FOOD / RETAIL (commerces) :
  = PRODUITS concrets qu'on achète
  ❌ "Conception de", "Exploration de", "Conseil en"
  ✅ "Cafés", "Pâtisseries", "Formules", "Plats"

→ SERVICE (avocats, coachs) :
  = PRESTATIONS qu'on facture
  ✅ "Accompagnement divorce", "Coaching individuel"

→ TECH (devs, designers) :
  = LIVRABLES digitaux
  ✅ "Sites web", "Applications", "Identités visuelles"

→ ARTISAN (plombiers, électriciens) :
  = TRAVAUX concrets
  ✅ "Dépannage", "Installation", "Rénovation"

══════════════════════════════════════════════════════════════
⚠️ TON IMPERSONNEL - ZÉRO EXCEPTION
══════════════════════════════════════════════════════════════

❌ JAMAIS : "je", "nous", "notre", "mon", "mes"
✅ TOUJOURS : Tournures nominales ou passives

Exemples :
  ❌ "Nous préparons des cafés" → ✅ "Cafés préparés avec soin"
  ❌ "Je crée des sites" → ✅ "Création de sites sur-mesure"

══════════════════════════════════════════════════════════════

{{EXPERTISES_BLOCK}}

LONGUEUR : 25-40 mots par description. 2-3 phrases COURTES.

FORMAT JSON UNIQUEMENT :
{
  "label": "Spécialités|Services|Offres|Savoir-faire",
  "services": [
    { "title": "Titre court (2-4 mots)", "description": "Phrase 1. Phrase 2. Phrase 3." },
    { "title": "Titre court (2-4 mots)", "description": "Phrase 1. Phrase 2. Phrase 3." },
    { "title": "Titre court (2-4 mots)", "description": "Phrase 1. Phrase 2. Phrase 3." }
  ]
}`;

/**
 * Construit le bloc {{EXPERTISES_BLOCK}} pour le prompt
 */
export function buildExpertisesBlock(expertises: string[]): string {
  if (expertises && expertises.length > 0) {
    return `══════════════════════════════════════════════════════════════
📋 EXPERTISES FOURNIES (BASE OBLIGATOIRE)
══════════════════════════════════════════════════════════════

${expertises.map((e, i) => `${i + 1}. ${e}`).join('\n')}

→ Génère EXACTEMENT 3 services basés sur ces expertises.
→ Reformule en titres COURTS (2-4 mots).
→ Descriptions concrètes et directes.`;
  }
  
  return `══════════════════════════════════════════════════════════════
📋 AUCUNE EXPERTISE FOURNIE
══════════════════════════════════════════════════════════════

→ Déduis 3 services CONCRETS pour ce type d'activité.
→ Reste cohérent avec le positionnement global.`;
}

/**
 * Labels de section par profileType
 */
export const SECTION_LABELS: Record<string, string> = {
  food: 'Spécialités',
  retail: 'Nos produits',
  service: 'Services',
  tech: 'Prestations',
  artisan: 'Savoir-faire',
  niche: 'Services',
  student: 'Compétences',
  freelance: 'Services',
};

export function getRecommendedLabel(profileType: string): string {
  return SECTION_LABELS[profileType] || 'Services';
}
