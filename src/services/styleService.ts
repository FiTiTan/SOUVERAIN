// SOUVERAIN - Style Service V2
// AI-powered style suggestion using Ollama

import { STYLE_PALETTES, type StylePaletteId, getPalette, type StylePalette } from '../config/stylePalettes';
export type { StylePalette };

export interface StyleSuggestion {
    suggestedStyle: StylePaletteId;
    confidence: number;
    reasoning: string;
}

export interface ExternalAccount {
    platform_type: string;
    account_url?: string;
}

export interface IntentionForm {
    objective?: string;
    targetAudience?: string;
    contentType?: string[];
    desiredTone?: string;
    sector?: string;
}

export interface MediaStats {
    images: number;
    videos: number;
    documents: number;
}

/**
 * Suggest style palette using Ollama AI
 */
export async function suggestStyleWithOllama(
    externalAccounts: ExternalAccount[],
    intentionForm: IntentionForm | null,
    projectsCount: number,
    mediaStats: MediaStats
): Promise<StyleSuggestion> {

    const prompt = `Analyse le profil suivant et suggère la palette de style la plus adaptée.

Palettes disponibles :
- moderne : freelance tech, startup, créatif digital, dynamique et connecté
- classique : consultant, expert, profession libérale, sobre et sérieux
- authentique : artisan, métier manuel, service local, chaleureux et terrain
- artistique : photographe, artiste, architecte, images dominantes
- vitrine : commerce local, restaurant, boutique, pratique et accueillant
- formel : notaire, institution, cabinet établi, rigoureux et sobre

Profil à analyser :
- Comptes externes : ${externalAccounts.map(a => a.platform_type).join(", ") || "aucun"}
- Objectif déclaré : ${intentionForm?.objective || "non renseigné"}
- Type de contenu : ${intentionForm?.contentType || "non renseigné"}
- Ton souhaité : ${intentionForm?.desiredTone || "non renseigné"}
- Nombre de projets : ${projectsCount}
- Médias : ${mediaStats.images} images, ${mediaStats.videos} vidéos, ${mediaStats.documents} documents

Réponds uniquement en JSON valide :
{
  "suggestedStyle": "authentique",
  "confidence": 0.85,
  "reasoning": "Explication courte (2-3 phrases max)"
}`;

    try {
        // @ts-ignore
        const result = await window.electron.invoke('ollama-chat', {
            messages: [
                { role: 'system', content: 'Tu es un expert en design et en expérience utilisateur. Analyse le profil et suggère le style le plus adapté en JSON.' },
                { role: 'user', content: prompt }
            ],
            model: 'llama3.2:latest'
        });

        if (!result.success || !result.message) {
            console.warn('[StyleService] Ollama suggestion failed, using fallback');
            return fallbackSuggestion(externalAccounts, intentionForm, projectsCount, mediaStats);
        }

        // Parse JSON response
        const content = result.message.content;
        const jsonMatch = content.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
            console.warn('[StyleService] No JSON found in response, using fallback');
            return fallbackSuggestion(externalAccounts, intentionForm, projectsCount, mediaStats);
        }

        const parsed = JSON.parse(jsonMatch[0]);

        // Validate that suggested style exists
        if (!STYLE_PALETTES[parsed.suggestedStyle]) {
            console.warn('[StyleService] Invalid style ID from AI, using fallback');
            return fallbackSuggestion(externalAccounts, intentionForm, projectsCount, mediaStats);
        }

        return {
            suggestedStyle: parsed.suggestedStyle as StylePaletteId,
            confidence: parsed.confidence || 0.7,
            reasoning: parsed.reasoning || "Style suggéré par l'IA"
        };

    } catch (error) {
        console.error('[StyleService] Ollama suggestion error:', error);
        return fallbackSuggestion(externalAccounts, intentionForm, projectsCount, mediaStats);
    }
}

/**
 * Fallback heuristic suggestion (if Ollama fails)
 */
function fallbackSuggestion(
    externalAccounts: ExternalAccount[],
    intentionForm: IntentionForm | null,
    projectsCount: number,
    mediaStats: MediaStats
): StyleSuggestion {

    const objective = (intentionForm?.objective || '').toLowerCase();
    const contentType = Array.isArray(intentionForm?.contentType) 
        ? intentionForm.contentType.join(', ').toLowerCase() 
        : '';
    const platforms = externalAccounts.map(a => a.platform_type.toLowerCase());

    // Heuristic logic
    if (platforms.includes('github') || platforms.includes('gitlab') || objective.includes('tech') || objective.includes('dev')) {
        return {
            suggestedStyle: 'moderne',
            confidence: 0.75,
            reasoning: "Votre profil technique et vos comptes développeur suggèrent un style moderne et dynamique."
        };
    }

    if (objective.includes('artisan') || objective.includes('manuel') || contentType.includes('chantier')) {
        return {
            suggestedStyle: 'authentique',
            confidence: 0.8,
            reasoning: "Votre activité artisanale mérite un style chaleureux et authentique qui met en avant le savoir-faire."
        };
    }

    if (platforms.includes('instagram') || platforms.includes('behance') || mediaStats.images > mediaStats.documents * 3) {
        return {
            suggestedStyle: 'artistique',
            confidence: 0.75,
            reasoning: "Votre contenu visuel dominant appelle un style artistique qui met les images en avant."
        };
    }

    if (objective.includes('restaurant') || objective.includes('boutique') || objective.includes('commerce')) {
        return {
            suggestedStyle: 'vitrine',
            confidence: 0.8,
            reasoning: "Pour un commerce local, le style vitrine offre une présentation pratique et accueillante."
        };
    }

    if (objective.includes('notaire') || objective.includes('avocat') || objective.includes('cabinet')) {
        return {
            suggestedStyle: 'formel',
            confidence: 0.85,
            reasoning: "Votre profession institutionnelle nécessite un style formel, sobre et rigoureux."
        };
    }

    if (objective.includes('consultant') || objective.includes('expert') || objective.includes('conseil')) {
        return {
            suggestedStyle: 'classique',
            confidence: 0.75,
            reasoning: "Pour un consultant, le style classique inspire confiance et professionnalisme."
        };
    }

    // Default
    return {
        suggestedStyle: 'moderne',
        confidence: 0.6,
        reasoning: "Le style moderne est un choix polyvalent adapté à la plupart des profils."
    };
}

/**
 * Get available styles
 */
export function getAvailableStyles() {
    return Object.values(STYLE_PALETTES);
}

/**
 * Get style by ID with fallback
 */
export function getStyleById(id: string): StylePalette {
    const palette = getPalette(id);
    if (!palette) {
        // Fallback to 'moderne' or first available
        return STYLE_PALETTES['moderne'] || Object.values(STYLE_PALETTES)[0];
    }
    return palette;
}
