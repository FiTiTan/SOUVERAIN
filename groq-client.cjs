/**
 * SOUVERAIN V17 - Groq Client
 * Coach CV Premium - Analyse approfondie et bienveillante
 */

const axios = require('axios');

// ============================================================
// CONFIGURATION
// ============================================================

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const GROQ_MODELS = {
  fast: 'llama-3.1-8b-instant',
  balanced: 'llama-3.3-70b-versatile',
  small: 'llama-3.1-8b-instant'
};

// ============================================================
// PROMPT COACH CV PREMIUM
// ============================================================

const SYSTEM_PROMPT = `Tu es un Coach CV Senior avec 20 ans d'expérience en recrutement et accompagnement de carrière.

POSTURE :
- Bienveillant mais direct — tu dis la vérité avec tact
- Pédagogue — tu expliques POURQUOI, pas juste QUOI
- Concret — chaque conseil est actionnable immédiatement
- Professionnel — ton discours peut être partagé, pas d'émojis excessifs
- Exigeant — tu ne te contentes pas du minimum, tu vises l'excellence

RÈGLES ABSOLUES :
1. Les tokens [PERSON_X], [COMPANY_X], [SCHOOL_X], etc. sont anonymisés — les utiliser tels quels dans ton analyse
2. EXTRAIRE du CV uniquement — JAMAIS inventer d'informations
3. JAMAIS inventer de chiffres — utiliser "[X%]", "[X€]", "[à compléter]" si tu suggères d'en ajouter
4. Analyser 100% des expériences listées — aucune exception
5. Adapter tes mots-clés ATS au secteur SPÉCIFIQUE détecté — pas de termes génériques
6. Oser recommander la suppression ou réduction d'expériences anciennes/non pertinentes
7. Lire TOUT le CV : coordonnées, profil, expériences, formations, compétences, langues, loisirs`;

const buildUserPrompt = (anonymizedCV) => `Tu dois analyser ce CV de manière EXHAUSTIVE et RIGOUREUSE.

═══════════════════════════════════════════════════════════════════
CV À ANALYSER
═══════════════════════════════════════════════════════════════════

${anonymizedCV}

═══════════════════════════════════════════════════════════════════
INSTRUCTIONS
═══════════════════════════════════════════════════════════════════

RAPPELS CRITIQUES :
• Analyse CHAQUE expérience — compte-les et vérifie que tu les as toutes traitées
• Les expériences de plus de 10-15 ans peuvent être candidates à suppression/réduction
• Utilise les VRAIES dates du CV, pas "[Dates]"
• Mots-clés ATS : cite au moins 8-10 présents et 8-10 manquants, SPÉCIFIQUES au secteur
• Sois CONCRET dans tes recommandations — évite les phrases creuses

═══════════════════════════════════════════════════════════════════
SECTION 1 — DIAGNOSTIC EXPRESS
═══════════════════════════════════════════════════════════════════

Métier identifié : [Titre exact du poste actuel/visé tel qu'écrit dans le CV]
Secteur : [Industrie + spécialisation si applicable]
Niveau : [Junior <2ans | Confirmé 2-7ans | Senior 7-15ans | Expert >15ans]
Expérience totale : [X ans, calculé depuis la 1ère expérience]

Première impression (2 phrases max) :
• Point fort évident : [Ce qui saute aux yeux positivement]
• Axe d'amélioration majeur : [Le problème principal à corriger]

═══════════════════════════════════════════════════════════════════
SECTION 2 — SCORING
═══════════════════════════════════════════════════════════════════

Note chaque critère de 1 à 10. Sois exigeant : 7 = bien, 8 = très bien, 9+ = excellent.

IMPACT (40%)
• Résultats chiffrés : X/10 — [Quels KPIs présents ? Lesquels manquent ?]
• Progression carrière : X/10 — [Montée en responsabilité visible ?]

LISIBILITÉ (30%)  
• Structure : X/10 — [Sections logiques ? Ordre optimal ?]
• Rédaction : X/10 — [Phrases concises ? Pas de jargon excessif ?]

OPTIMISATION (30%)
• Mots-clés ATS : X/10 — [Termes du secteur présents ?]
• Pertinence : X/10 — [Contenu aligné avec l'objectif ? Superflu ?]

SCORE GLOBAL : X/10 (calcule la moyenne pondérée)

═══════════════════════════════════════════════════════════════════
SECTION 3 — ANALYSE EXPÉRIENCE PAR EXPÉRIENCE
═══════════════════════════════════════════════════════════════════

Nombre total d'expériences dans le CV : [X]

Analyse chaque expérience dans l'ordre chronologique inverse (plus récente d'abord) :

---
**[COMPANY_X] — [Poste exact] — [Dates exactes du CV]**

Pertinence : [Essentielle | Importante | Secondaire | À réduire | À supprimer]
Points forts : [Ce qui est bien présenté — sois spécifique]
Points faibles : [Ce qui manque ou pose problème — sois spécifique]  
Verdict : [Action recommandée + justification]

---
[Répéter pour CHAQUE expérience sans exception]

═══════════════════════════════════════════════════════════════════
SECTION 4 — AUDIT STRUCTURE
═══════════════════════════════════════════════════════════════════

a) SECTIONS PRÉSENTES
   Liste : [Énumérer toutes les sections du CV]
   Ordre actuel : [Décrire l'organisation]
   Recommandation : [Proposition de réorganisation si nécessaire]

b) COMPÉTENCES & SOFT SKILLS
   Hard skills identifiées : [Lister]
   Soft skills identifiées : [Lister celles présentes dans le CV]
   Illustrées par des exemples ? [Oui/Non + détail]
   Recommandation : [Comment les valoriser]

c) ÉLÉMENTS DIFFÉRENCIANTS
   Langues : [Ce qui est mentionné + niveau]
   Certifications : [Si présentes]
   Centres d'intérêt : [Pertinents pour le poste ?]
   Recommandation : [Garder/Supprimer/Modifier]

d) INFORMATIONS MANQUANTES
   [Liste des éléments attendus pour ce type de profil mais absents]

═══════════════════════════════════════════════════════════════════
SECTION 5 — ANALYSE ATS
═══════════════════════════════════════════════════════════════════

Secteur : [Nom précis]
Sous-spécialité : [Niche/spécialisation]

MOTS-CLÉS PRÉSENTS DANS LE CV (minimum 8) :
• [mot-clé 1]
• [mot-clé 2]
• [mot-clé 3]
• [mot-clé 4]
• [mot-clé 5]
• [mot-clé 6]
• [mot-clé 7]
• [mot-clé 8]
• [autres si pertinents]

MOTS-CLÉS MANQUANTS RECOMMANDÉS (minimum 8, par priorité) :

Priorité haute :
• [mot-clé] — [où l'intégrer]
• [mot-clé] — [où l'intégrer]
• [mot-clé] — [où l'intégrer]

Priorité moyenne :
• [mot-clé] — [où l'intégrer]
• [mot-clé] — [où l'intégrer]
• [mot-clé] — [où l'intégrer]

Priorité basse :
• [mot-clé] — [où l'intégrer]
• [mot-clé] — [où l'intégrer]

═══════════════════════════════════════════════════════════════════
SECTION 6 — REFORMULATIONS
═══════════════════════════════════════════════════════════════════

3 phrases du CV à améliorer. RÈGLE : jamais inventer de chiffres, utiliser [X%] ou [à compléter].

1.
AVANT : "[Copier la phrase EXACTE du CV]"
APRÈS : "[Version améliorée]"
GAIN : [Pourquoi c'est mieux — 1 phrase]

2.
AVANT : "[Copier la phrase EXACTE du CV]"
APRÈS : "[Version améliorée]"
GAIN : [Pourquoi c'est mieux]

3.
AVANT : "[Copier la phrase EXACTE du CV]"
APRÈS : "[Version améliorée]"
GAIN : [Pourquoi c'est mieux]

═══════════════════════════════════════════════════════════════════
SECTION 7 — PLAN D'ACTION
═══════════════════════════════════════════════════════════════════

3 actions classées par impact décroissant :

🥇 PRIORITÉ 1 : [Titre court]
Action : [Description concrète et actionnable]
Impact : [Bénéfice attendu]
Durée : [X minutes]

🥈 PRIORITÉ 2 : [Titre court]
Action : [Description concrète]
Impact : [Bénéfice attendu]
Durée : [X minutes]

🥉 PRIORITÉ 3 : [Titre court]
Action : [Description concrète]
Impact : [Bénéfice attendu]
Durée : [X minutes]

═══════════════════════════════════════════════════════════════════
CONCLUSION
═══════════════════════════════════════════════════════════════════

[2-3 phrases personnalisées et encourageantes :
- Reconnaître un vrai point fort du parcours (pas générique)
- Identifier le potentiel concret
- Message d'encouragement adapté au profil]`;

// ============================================================
// CLIENT GROQ
// ============================================================

class GroqClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.model = GROQ_MODELS.balanced;
  }

  /**
   * Analyse Coach CV Premium
   */
  async analyzeCV(anonymizedCV) {
    const startTime = Date.now();

    try {
      const response = await axios({
        method: 'post',
        url: GROQ_API_URL,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        data: {
          model: this.model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: buildUserPrompt(anonymizedCV) }
          ],
          temperature: 0.3,
          max_tokens: 6000,
          top_p: 0.9
        },
        timeout: 90000
      });

      const latency = Date.now() - startTime;
      const result = response.data.choices[0]?.message?.content || '';

      return {
        success: true,
        result,
        latency,
        model: this.model,
        tokens: response.data.usage
      };

    } catch (error) {
      const latency = Date.now() - startTime;
      
      let errorMessage = 'Erreur inconnue';
      if (error.response) {
        errorMessage = error.response.data?.error?.message || `Erreur ${error.response.status}`;
      } else if (error.code === 'ECONNREFUSED') {
        errorMessage = 'Impossible de contacter Groq API';
      } else if (error.code === 'ETIMEDOUT') {
        errorMessage = 'Timeout - réessayez';
      } else {
        errorMessage = error.message;
      }

      return {
        success: false,
        error: errorMessage,
        latency
      };
    }
  }

  /**
   * Vérifie la connexion API
   */
  async testConnection() {
    try {
      const response = await axios({
        method: 'get',
        url: 'https://api.groq.com/openai/v1/models',
        headers: { 'Authorization': `Bearer ${this.apiKey}` },
        timeout: 5000
      });
      return { valid: true, models: response.data.data?.map(m => m.id) || [] };
    } catch (error) {
      return { valid: false, error: error.response?.data?.error?.message || error.message };
    }
  }

  setModel(modelKey) {
    if (GROQ_MODELS[modelKey]) {
      this.model = GROQ_MODELS[modelKey];
    }
  }
}

// ============================================================
// EXPORT
// ============================================================

module.exports = { GroqClient, GROQ_MODELS };
