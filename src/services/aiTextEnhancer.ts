/**
 * SOUVERAIN - AI Text Enhancer (Multi-provider)
 * Service simple pour améliorer des textes courts (tagline, value prop)
 * 
 * Providers supportés :
 * - DeepSeek V3 (défaut) : Meilleure qualité
 * - Groq Llama 3.3 (fallback)
 */

// ============================================================
// AI PROVIDERS CONFIGURATION
// ============================================================

const PROVIDERS = {
  deepseek: {
    name: 'DeepSeek V3',
    url: 'https://api.deepseek.com/v1/chat/completions',
    model: 'deepseek-chat',
    getKey: async () => {
      try {
        // @ts-ignore
        const result = await window.electron.deepseek.getApiKey();
        return result.success ? result.key : null;
      } catch {
        return null;
      }
    },
  },
  groq: {
    name: 'Groq Llama 3.3',
    url: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama-3.3-70b-versatile',
    getKey: async () => {
      try {
        // @ts-ignore
        const result = await window.electron.groq.getApiKey();
        return result.success ? result.key : null;
      } catch {
        return null;
      }
    },
  },
};

/**
 * Récupère le provider actif (DeepSeek prioritaire, fallback Groq)
 */
async function getActiveProvider(): Promise<{ name: string; url: string; model: string; key: string }> {
  // Essayer DeepSeek d'abord
  const deepseekKey = await PROVIDERS.deepseek.getKey();
  if (deepseekKey) {
    console.log('[AI TextEnhancer] Using DeepSeek V3');
    return { ...PROVIDERS.deepseek, key: deepseekKey };
  }
  
  // Fallback Groq
  const groqKey = await PROVIDERS.groq.getKey();
  if (groqKey) {
    console.log('[AI TextEnhancer] Using Groq (fallback)');
    return { ...PROVIDERS.groq, key: groqKey };
  }
  
  throw new Error('No AI provider configured. Please add DeepSeek or Groq API key.');
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

  const provider = await getActiveProvider();

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
    const response = await fetch(provider.url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${provider.key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: provider.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.5,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`[AI TextEnhancer] ${provider.name} API error:`, error);
      throw new Error(`Erreur API ${provider.name}: ${response.status}`);
    }

    const data = await response.json();
    const enhanced = data.choices[0]?.message?.content?.trim();

    if (!enhanced) {
      throw new Error('Aucune amélioration générée');
    }

    // Nettoyer les guillemets si présents
    return enhanced.replace(/^["']|["']$/g, '');
  } catch (error: any) {
    console.error('[AI TextEnhancer] Enhancement failed:', error);
    throw new Error(error.message || 'Échec de l\'amélioration IA');
  }
}
