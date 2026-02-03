/**
 * Service de réécriture AI pour les paragraphes du portfolio
 */

interface RewriteParams {
  currentText: string;
  instruction: string;
  fieldType: string;
  context: {
    name: string;
    valueProp: string;
    expertises: string[];
  };
}

interface RewriteResult {
  newText: string;
}

// Contraintes par type de champ
const FIELD_CONSTRAINTS: Record<string, string> = {
  heroSubtitle: '15-30 mots maximum. Accroche percutante et mémorable.',
  aboutText: '60-80 mots (3-4 phrases). Présentation professionnelle.',
  valueProp: '20-30 mots (1-2 phrases). Promesse de valeur claire.',
  serviceDescription: '35-45 mots (2-3 phrases). Bénéfice client direct.',
  projectDescription: '60-80 mots (4 phrases). Structure: contexte, solution, résultat.',
};

// Exemples de prompts utilisateur
const PROMPT_EXAMPLES: Record<string, string[]> = {
  heroSubtitle: [
    'Plus percutant',
    'Ajoute une notion de résultat',
    'Plus orienté client',
  ],
  aboutText: [
    'Plus concis',
    'Ajoute des chiffres',
    'Mets en avant l\'expertise technique',
    'Rends le plus humain',
  ],
  valueProp: [
    'Plus direct',
    'Orienté bénéfice client',
    'Ajoute un élément différenciant',
  ],
  serviceDescription: [
    'Plus spécifique',
    'Ajoute le bénéfice concret',
    'Raccourcis',
  ],
  projectDescription: [
    'Mets en avant les résultats',
    'Ajoute les technologies utilisées',
    'Plus orienté business',
    'Ajoute des métriques',
  ],
};

/**
 * Détermine le provider et l'URL
 */
async function getProvider(): Promise<{ url: string; model: string; key: string }> {
  try {
    // @ts-ignore
    const deepseekResult = await window.electron.deepseek?.getApiKey();
    if (deepseekResult?.success && deepseekResult?.key) {
      return {
        url: 'https://api.deepseek.com/v1/chat/completions',
        model: 'deepseek-chat',
        key: deepseekResult.key,
      };
    }
  } catch (e) {}

  try {
    // @ts-ignore
    const groqResult = await window.electron.groq?.getApiKey();
    if (groqResult?.success && groqResult?.key) {
      return {
        url: 'https://api.groq.com/openai/v1/chat/completions',
        model: 'llama-3.3-70b-versatile',
        key: groqResult.key,
      };
    }
  } catch (e) {}

  throw new Error('Aucun provider AI configuré. Ajoutez une clé DeepSeek ou Groq dans les paramètres.');
}

/**
 * Appelle l'API pour réécrire le texte
 */
export async function callDeepSeekRewrite(params: RewriteParams): Promise<RewriteResult> {
  const { currentText, instruction, fieldType, context } = params;

  const provider = await getProvider();
  const constraints = FIELD_CONSTRAINTS[fieldType] || '50-80 mots';

  const systemPrompt = `Tu es un copywriter expert spécialisé dans les portfolios professionnels.

TÂCHE : Réécris le texte selon l'instruction de l'utilisateur.

CONTRAINTES POUR CE CHAMP :
${constraints}

RÈGLES STRICTES :
- Ton impersonnel OBLIGATOIRE (jamais "je", "nous", "notre")
- Formulations : "Conception de...", "Spécialisé dans...", "Une approche..."
- Garde la cohérence avec le contexte du portfolio
- Respecte STRICTEMENT les contraintes de longueur
- Pas de clichés ("innovant", "passionné", "sur-mesure")
- Pas de superlatifs sans preuve

CONTEXTE DU PORTFOLIO :
- Nom : ${context.name || 'Non spécifié'}
- Proposition de valeur : ${context.valueProp || 'Non spécifiée'}
- Expertises : ${context.expertises?.join(', ') || 'Non spécifiées'}

IMPORTANT : Réponds UNIQUEMENT avec le nouveau texte.
Pas de guillemets, pas d'explication, pas de préambule.
Juste le texte réécrit.`;

  const userPrompt = `TEXTE ACTUEL :
${currentText}

INSTRUCTION DE L'UTILISATEUR :
${instruction}

Réécris le texte en suivant l'instruction tout en respectant les contraintes.`;

  console.log('[AiRewrite] Calling API with instruction:', instruction);

  const response = await fetch(provider.url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${provider.key}`,
    },
    body: JSON.stringify({
      model: provider.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[AiRewrite] API error:', errorText);
    throw new Error(`Erreur API: ${response.status}`);
  }

  const result = await response.json();
  let newText = result.choices[0].message.content;

  // Nettoyer le texte
  newText = newText
    .trim()
    .replace(/^["']|["']$/g, '') // Retirer guillemets
    .replace(/^Voici.*?:\s*/i, '') // Retirer préambules
    .replace(/^Nouveau texte.*?:\s*/i, '')
    .trim();

  console.log('[AiRewrite] Generated text:', newText.substring(0, 100) + '...');

  return { newText };
}

/**
 * Retourne des suggestions de prompts pour un type de champ
 */
export function getPromptSuggestions(fieldType: string): string[] {
  return PROMPT_EXAMPLES[fieldType] || [
    'Plus court',
    'Plus percutant',
    'Change le ton',
  ];
}
