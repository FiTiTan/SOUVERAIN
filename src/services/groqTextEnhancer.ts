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
    systemPrompt = `Tu es un expert en personal branding. Tu améliores les taglines pour les rendre plus percutantes et mémorables.

RÈGLES:
- Retourne UNIQUEMENT le tagline amélioré, rien d'autre
- Maximum 15-20 mots
- Évite les clichés ("passionné", "dynamique")
- Sois spécifique et concret
- Ton professionnel mais authentique
- Privilégie les verbes d'action`;

    userPrompt = `Améliore ce tagline pour qu'il soit plus impactant:

"${text}"

${options.context ? `Contexte: ${options.context.name || ''} - ${options.context.activity || ''} (${options.context.profileType || ''})` : ''}

Retourne UNIQUEMENT le tagline amélioré.`;
  } else {
    systemPrompt = `Tu es un expert en copywriting et propositions de valeur. Tu améliores les value propositions pour les rendre plus convaincantes.

RÈGLES:
- Retourne UNIQUEMENT la proposition de valeur améliorée, rien d'autre
- Maximum 25-40 mots
- Focus sur le bénéfice client/utilisateur
- Évite le jargon et les clichés
- Sois concret et différenciant
- Ton professionnel`;

    userPrompt = `Améliore cette proposition de valeur pour qu'elle soit plus convaincante:

"${text}"

${options.context ? `Contexte: ${options.context.name || ''} - ${options.context.activity || ''} (${options.context.profileType || ''})` : ''}

Retourne UNIQUEMENT la proposition de valeur améliorée.`;
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
        temperature: 0.7,
        max_tokens: 150,
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
