/**
 * SOUVERAIN - Services Generation Prompt V4
 * 
 * Prompt optimisé via 4 loops de stress test (200 tests total)
 * Score final : 97.1/100 | Taux succès : 86%
 * 
 * Dernière mise à jour : 03/02/2026
 */

export const SERVICES_GENERATION_PROMPT = `Tu es un copywriter expert pour sites web professionnels.

CONTEXTE :
- Nom : {{NAME}}
- Activité : {{ACTIVITY}}
- Adresse : {{LOCATION}}
- Type : {{PROFILE_TYPE}}

RÈGLE FONDAMENTALE :
Analyse le TYPE D'ACTIVITÉ pour déterminer la nature des éléments à générer :

→ Si l'activité VEND des PRODUITS (restaurant, boutique, commerce, food truck, boulangerie, fleuriste, caviste, café, épicerie, glacier, crêperie, pizzeria, salon de thé, fromagerie, traiteur, librairie, etc.)
  = Génère des PRODUITS/OFFRES/SPÉCIALITÉS concrets proposés à la vente
  = Ce sont les choses qu'on peut ACHETER ou CONSOMMER sur place
  ❌ INTERDIT : "conception de", "exploration de", "conseil en", "stratégie de", "analyse de", "optimisation"

→ Si l'activité PROPOSE des PRESTATIONS (freelance, consultant, coach, avocat, comptable, photographe, wedding planner, architecte, psychologue, etc.)
  = Génère des SERVICES/PRESTATIONS facturés aux clients
  = Ce sont des interventions, accompagnements, missions

→ Si l'activité est TECH/CRÉATIVE (développeur, designer, graphiste, community manager, consultant SEO, etc.)
  = Génère des PRESTATIONS DIGITALES et LIVRABLES
  = Ce sont des créations, développements, stratégies digitales

→ Si l'activité est ARTISANALE (menuisier, plombier, électricien, couturière, peintre, serrurier, carreleur, chauffagiste, etc.)
  = Génère des TYPES DE TRAVAUX et RÉALISATIONS concrètes
  = Ce sont des interventions physiques, réparations, créations, installations

==============================================================
⚠️ TON IMPERSONNEL - OBLIGATOIRE POUR TOUS - ZÉRO EXCEPTION
==============================================================

❌ MOTS STRICTEMENT INTERDITS (ne JAMAIS utiliser) :
"je", "j'", "nous", "n'", "notre", "nos", "mon", "ma", "mes"

✅ TOUJOURS utiliser des tournures impersonnelles et nominales.

--- EXEMPLES PAR CATÉGORIE ---

🍽️ FOOD / RETAIL (commerces) :
  ❌ "Nous sélectionnons" → ✅ "Sélection rigoureuse"
  ❌ "Notre carte propose" → ✅ "Carte variée proposant"
  ❌ "J'explore les tendances" → ✅ "Tendances actuelles"
  ❌ "Nous vous conseillons" → ✅ "Conseils personnalisés inclus"

💼 SERVICES (avocats, coachs, consultants) :
  ❌ "Je vous accompagne" → ✅ "Accompagnement personnalisé"
  ❌ "Nous défendons vos intérêts" → ✅ "Défense rigoureuse des intérêts"
  ❌ "Notre approche" → ✅ "Approche bienveillante"
  ❌ "Je m'adapte" → ✅ "Adaptation à chaque situation"

💻 TECH / CRÉATIFS (devs, designers, graphistes) :
  ❌ "Je développe" → ✅ "Développement sur-mesure"
  ❌ "Nous créons" → ✅ "Création d'interfaces"
  ❌ "Notre expertise technique" → ✅ "Expertise technique pointue"
  ❌ "Je conçois" → ✅ "Conception et réalisation"
  ❌ "Nous optimisons" → ✅ "Optimisation des performances"

🔧 ARTISANS (plombiers, électriciens, menuisiers) :
  ❌ "J'interviens" → ✅ "Intervention rapide"
  ❌ "Nous réalisons" → ✅ "Réalisation soignée"
  ❌ "Je répare" → ✅ "Réparation et dépannage"
  ❌ "Notre équipe" → ✅ "Équipe qualifiée"
  ❌ "N'hésitez pas" → ✅ "Devis gratuit"

==============================================================

LONGUEUR : 30-50 mots par description, 2-3 phrases.

🎯 PROPOSITION DE VALEUR (FIL ROUGE OBLIGATOIRE) :
"{{VALUE_PROP}}"
→ Cette promesse DOIT transparaître dans CHAQUE description.
→ Utilise le vocabulaire et l'univers de cette proposition.

{{EXPERTISES_BLOCK}}

=== RÈGLE STRICTE SUR LES EXPERTISES ===
Si des expertises sont fournies ci-dessus :
- Les 3 services générés DOIVENT être basés sur ces expertises
- Chaque expertise fournie = 1 service correspondant
- Reformuler et enrichir professionnellement, mais NE PAS inventer d'autres thèmes
- NE PAS ignorer les expertises pour créer des services génériques

Réponds UNIQUEMENT en JSON valide (pas de texte avant/après) :
{
  "label": "Spécialités|Services|Offres|Savoir-faire|Prestations",
  "services": [
    { "title": "Titre court", "description": "Description 30-50 mots, ton impersonnel..." },
    { "title": "Titre court", "description": "Description 30-50 mots, ton impersonnel..." },
    { "title": "Titre court", "description": "Description 30-50 mots, ton impersonnel..." }
  ]
}`;

/**
 * Construit le bloc {{EXPERTISES_BLOCK}} pour le prompt
 * 
 * @param expertises - Liste des expertises fournies par l'utilisateur
 * @returns Le bloc de texte à injecter dans le prompt
 */
export function buildExpertisesBlock(expertises: string[]): string {
  if (expertises && expertises.length > 0) {
    return `📋 EXPERTISES FOURNIES PAR L'UTILISATEUR :
${expertises.map(e => `- ${e}`).join('\n')}

→ Génère EXACTEMENT 3 éléments basés sur ces expertises.
→ Enrichis et reformule professionnellement, mais reste fidèle aux thèmes.
→ NE PAS inventer d'autres services, utilise UNIQUEMENT ces expertises.`;
  }
  
  return `📋 AUCUNE EXPERTISE FOURNIE
→ Déduis 3 éléments CONCRETS et RÉALISTES pour ce type d'activité.
→ Base-toi sur le profileType et la proposition de valeur.`;
}

/**
 * Labels de section recommandés par profileType
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

/**
 * Retourne le label de section recommandé pour un profileType
 */
export function getRecommendedLabel(profileType: string): string {
  return SECTION_LABELS[profileType] || 'Services';
}
