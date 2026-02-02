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
    systemPrompt = `Expert personal branding. Transforme taglines génériques en accroches percutantes.

INTERDIT: "Passionné", "Spécialisé", "Expert", "Dynamique", "Solutions innovantes", jargon vague.

RÈGLES:
- Verbe action fort en début
- Ultra-spécifique (technos, secteurs)
- Résultat concret
- Max 15-20 mots

EXEMPLES:
❌ "Passionné développement web"
✅ "Je développe des apps React 100k+ users/jour"

❌ "Designer UX/UI créatif"
✅ "Interfaces SaaS qui +40% rétention"`;

    userPrompt = `Transforme en accroche percutante:
"${text}"
${options.context ? `(${options.context.profileType})` : ''}
Retourne UNIQUEMENT le tagline.`;
  } else {
    systemPrompt = `Expert copywriting. Transforme value props génériques en messages qui convertissent.

INTERDIT: "Solutions sur-mesure", "Accompagnement A-Z", "Écoute besoins", promesses vagues.

STRUCTURE: [Problème client] → [Solution] → [Résultat mesurable]
Max 30-40 mots. Ton direct. Quantifie si possible.

EXEMPLES:
❌ "Sites web adaptés vos besoins"
✅ "Site WordPress rame ? Migration Webflow en 2 sem, -70% temps chargement"

❌ "Accompagnement stratégie digitale"
✅ "Posts LinkedIn 0 engagement ? Formation contenu viral 30j (50+ profils testés)"`;

    userPrompt = `Transforme en message qui convertit:
"${text}"
${options.context ? `(${options.context.profileType})` : ''}
Structure: Problème→Solution→Résultat. Retourne UNIQUEMENT value prop.`;
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
