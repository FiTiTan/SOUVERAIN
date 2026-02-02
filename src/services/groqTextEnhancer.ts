/**
 * SOUVERAIN - GROQ Text Enhancer
 * Service simple pour améliorer des textes courts (tagline, value prop)
 */

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

async function getGroqApiKey(): Promise<string> {
  try {
    // @ts-ignore
    const result = await window.electron.groq.getApiKey();
    if (!result.success || !result.key) {
      throw new Error('API key not available');
    }
    return result.key;
  } catch (error) {
    console.error('[GROQ] Failed to get API key:', error);
    throw new Error('GROQ API key not configured');
  }
}

interface EnhanceOptions {
  type: 'tagline' | 'valueProp';
  context?: {
    name?: string;
    activity?: string;
    profileType?: string;
  };
}

export async function enhanceText(text: string, options: EnhanceOptions): Promise<string> {
  if (!text || text.trim().length === 0) {
    throw new Error('Le texte à améliorer ne peut pas être vide');
  }

  const apiKey = await getGroqApiKey();

  let systemPrompt = '';
  let userPrompt = '';

  if (options.type === 'tagline') {
    systemPrompt = `Tu es un expert en personal branding et copywriting. Tu transformes les taglines génériques en accroches percutantes et mémorables.

INTERDICTIONS ABSOLUES:
❌ "Passionné par", "Spécialisé dans", "Expert en"
❌ "Dynamique", "Motivé", "Créatif"
❌ "Solutions innovantes", "Expériences uniques"
❌ Jargon vague ("moderne", "performant", "de qualité")

RÈGLES:
✅ Commence par un VERBE D'ACTION fort (je conçois, je développe, je transforme, je crée)
✅ Sois ULTRA-SPÉCIFIQUE (technologies, secteurs, méthodes)
✅ Montre le RÉSULTAT concret, pas le processus
✅ Maximum 15-20 mots
✅ Ton professionnel mais direct

EXEMPLES DE TRANSFORMATION:

❌ "Passionné par le développement web moderne et performant"
✅ "Je développe des applications React qui servent 100k+ utilisateurs/jour"

❌ "Designer créatif spécialisé en UX/UI"
✅ "Je conçois des interfaces SaaS B2B qui augmentent la rétention de 40%"

❌ "Consultant en stratégie digitale innovante"
✅ "J'aide les PME industrielles à générer des leads qualifiés via LinkedIn"`;

    userPrompt = `Transforme ce tagline générique en accroche PERCUTANTE et CONCRÈTE:

"${text}"

${options.context ? `Contexte: ${options.context.name || ''} - ${options.context.activity || ''} (${options.context.profileType || ''})` : ''}

Applique les règles. Retourne UNIQUEMENT le tagline amélioré (pas d'explication).`;
  } else {
    systemPrompt = `Tu es un expert en copywriting B2B/B2C. Tu transformes les value propositions génériques en messages qui CONVERTISSENT.

INTERDICTIONS ABSOLUES:
❌ "Je transforme vos idées en applications web"
❌ "Solutions personnalisées et sur-mesure"
❌ "Accompagnement de A à Z"
❌ "Écoute de vos besoins"
❌ Promesses vagues sans preuve

RÈGLES:
✅ Commence par le PROBLÈME du client (frustration, manque, coût)
✅ Enchaîne sur la SOLUTION concrète (méthode, outil, résultat)
✅ Quantifie quand possible (délais, économies, gains)
✅ Maximum 30-40 mots
✅ Ton direct, pas commercial

STRUCTURE RECOMMANDÉE:
[Problème client] → [Solution] → [Résultat mesurable]

EXEMPLES DE TRANSFORMATION:

❌ "Je crée des sites web modernes et performants adaptés à vos besoins"
✅ "Votre site WordPress rame et perd des clients ? Je le migre vers Webflow en 2 semaines, -70% de temps de chargement garanti"

❌ "Accompagnement personnalisé pour développer votre stratégie digitale"
✅ "Vos posts LinkedIn ont 0 engagement ? Je vous forme à créer du contenu viral en 30 jours (méthode testée sur 50+ profils)"

❌ "Designer UX/UI pour des expériences utilisateur exceptionnelles"
✅ "Vos utilisateurs abandonnent au checkout ? J'optimise votre tunnel pour +25% de conversion en 3 sprints"`;

    userPrompt = `Transforme cette value proposition générique en message qui CONVERTIT:

"${text}"

${options.context ? `Contexte: ${options.context.name || ''} - ${options.context.activity || ''} (${options.context.profileType || ''})` : ''}

Applique la structure [Problème] → [Solution] → [Résultat]. Retourne UNIQUEMENT la value prop améliorée (pas d'explication).`;
  }

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.5, // Réduit pour plus de contrôle sur les clichés
        max_tokens: 200, // Augmenté pour value props plus longues
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('[GROQ] API error:', error);
      throw new Error(`Erreur API GROQ: ${response.status}`);
    }

    const data = await response.json();
    const enhanced = data.choices[0]?.message?.content?.trim();

    if (!enhanced) {
      throw new Error('Aucune amélioration générée');
    }

    // Nettoyer les guillemets si présents
    return enhanced.replace(/^["']|["']$/g, '');
  } catch (error: any) {
    console.error('[GROQ] Enhancement failed:', error);
    throw new Error(error.message || 'Échec de l\'amélioration IA');
  }
}
