/**
 * SOUVERAIN - Project Narrator
 * Génération de titres et descriptions pour les projets via Ollama
 * Adapte le ton selon le secteur d'activité
 */

import { buildNarratorPrompt, getSectorPrompts } from '../../config/sectors';
import type { PortfolioProjectV2, PortfolioElement } from '../../types/portfolio';

// ============================================================
// TYPES
// ============================================================

export interface NarrationInput {
  projectId: string;
  elements: {
    id: string;
    classification: string;
    description: string;
    tags: string[];
  }[];
  existingTitle?: string;
  existingDescription?: string;
}

export interface NarrationResult {
  projectId: string;
  title: string;
  description: string;
  suggestedTags: string[];
  callToAction?: string;
}

export interface NarratorOptions {
  sectorId: string;
  model?: string;
  maxTitleLength?: number;
  maxDescriptionLength?: number;
}

// ============================================================
// OLLAMA CLIENT
// ============================================================

const OLLAMA_BASE_URL = 'http://localhost:11434';
const DEFAULT_MODEL = 'llama3.2:3b';

interface OllamaResponse {
  model: string;
  response: string;
  done: boolean;
}

async function callOllama(
  prompt: string,
  systemPrompt: string,
  model: string = DEFAULT_MODEL
): Promise<string> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        prompt,
        system: systemPrompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          num_predict: 400,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status}`);
    }

    const data: OllamaResponse = await response.json();
    return data.response;
  } catch (error) {
    throw error;
  }
}

// ============================================================
// NARRATOR
// ============================================================

/**
 * Génère un titre et une description pour un projet
 */
export async function narrateProject(
  input: NarrationInput,
  options: NarratorOptions
): Promise<NarrationResult> {
  const { sectorId, model = DEFAULT_MODEL, maxTitleLength = 60, maxDescriptionLength = 300 } = options;

  // Construire le prompt système
  const systemPrompt = buildNarratorPrompt(sectorId);

  // Construire le prompt utilisateur
  const userPrompt = buildNarratorUserPrompt(input, maxTitleLength, maxDescriptionLength);

  try {
    const response = await callOllama(userPrompt, systemPrompt, model);
    return parseNarrationResponse(response, input.projectId);
  } catch (error) {
    // Fallback avec valeurs par défaut
    return {
      projectId: input.projectId,
      title: input.existingTitle || 'Nouveau projet',
      description: input.existingDescription || 'Description à compléter',
      suggestedTags: [],
    };
  }
}

/**
 * Regroupe automatiquement les éléments en projets cohérents
 */
export async function suggestProjectGroupings(
  elements: {
    id: string;
    classification: string;
    description: string;
    tags: string[];
    metadata?: Record<string, unknown>;
  }[],
  options: NarratorOptions
): Promise<{ projectName: string; elementIds: string[] }[]> {
  const { sectorId, model = DEFAULT_MODEL } = options;

  const systemPrompt = `Tu es un expert en organisation de portfolio. Regroupe les éléments suivants en projets cohérents.
Critères de regroupement :
- Même thématique ou type de travail
- Même période ou événement
- Éléments complémentaires (avant/après, plans + réalisation)
- Pertinence visuelle ou narrative`;

  const userPrompt = `Voici ${elements.length} éléments à organiser :

${elements.map((e, i) => `${i + 1}. [${e.classification}] ${e.description} (tags: ${e.tags.join(', ')})`).join('\n')}

Propose des regroupements au format JSON :
{
  "projects": [
    { "name": "Nom du projet", "elementIndices": [1, 2, 3] }
  ]
}`;

  try {
    const response = await callOllama(userPrompt, systemPrompt, model);
    return parseGroupingResponse(response, elements);
  } catch {
    // En cas d'erreur, chaque élément devient son propre projet
    return elements.map((e, i) => ({
      projectName: `Projet ${i + 1}`,
      elementIds: [e.id],
    }));
  }
}

// ============================================================
// HELPERS
// ============================================================

function buildNarratorUserPrompt(
  input: NarrationInput,
  maxTitleLength: number,
  maxDescriptionLength: number
): string {
  let prompt = `Génère un titre et une description pour ce projet de portfolio.\n\n`;

  prompt += `Éléments du projet :\n`;
  input.elements.forEach((el, i) => {
    prompt += `${i + 1}. [${el.classification}] ${el.description}\n`;
    if (el.tags.length > 0) {
      prompt += `   Tags: ${el.tags.join(', ')}\n`;
    }
  });

  if (input.existingTitle) {
    prompt += `\nTitre actuel : "${input.existingTitle}"\n`;
  }

  prompt += `
Contraintes :
- Titre : max ${maxTitleLength} caractères, accrocheur et descriptif
- Description : max ${maxDescriptionLength} caractères, met en valeur le travail

Réponds au format JSON :
{
  "title": "Titre du projet",
  "description": "Description engageante du projet",
  "suggestedTags": ["tag1", "tag2", "tag3"],
  "callToAction": "Phrase d'appel à l'action optionnelle"
}`;

  return prompt;
}

function parseNarrationResponse(
  response: string,
  projectId: string
): NarrationResult {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Pas de JSON trouvé');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      projectId,
      title: parsed.title || 'Nouveau projet',
      description: parsed.description || '',
      suggestedTags: Array.isArray(parsed.suggestedTags) ? parsed.suggestedTags : [],
      callToAction: parsed.callToAction,
    };
  } catch {
    return {
      projectId,
      title: 'Nouveau projet',
      description: 'Description à compléter',
      suggestedTags: [],
    };
  }
}

function parseGroupingResponse(
  response: string,
  elements: { id: string }[]
): { projectName: string; elementIds: string[] }[] {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Pas de JSON trouvé');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(parsed.projects)) {
      throw new Error('Format invalide');
    }

    return parsed.projects.map((p: { name: string; elementIndices: number[] }) => ({
      projectName: p.name,
      elementIds: p.elementIndices
        .filter((i) => i > 0 && i <= elements.length)
        .map((i) => elements[i - 1].id),
    }));
  } catch {
    // Fallback : chaque élément est son propre projet
    return elements.map((e, i) => ({
      projectName: `Projet ${i + 1}`,
      elementIds: [e.id],
    }));
  }
}

// ============================================================
// TONE OF VOICE EXAMPLES
// ============================================================

export const SECTOR_TONE_EXAMPLES: Record<string, { good: string; bad: string }> = {
  artisan_btp: {
    good: 'Rénovation complète d\'une salle de bain de 8m² dans un appartement haussmannien. Pose de carrelage grand format effet béton ciré, création d\'une douche italienne et optimisation des rangements.',
    bad: 'On a fait la salle de bain. Carrelage et douche.',
  },
  photographe: {
    good: 'Reportage intimiste d\'un mariage champêtre en Provence. Captation des préparatifs à la cérémonie laïque, en lumière naturelle dorée de fin de journée.',
    bad: 'Photos de mariage.',
  },
  coiffeur_esthetique: {
    good: 'Transformation balayage californien sur base châtain. Travail de décoloration progressive pour un résultat naturel et lumineux, sublimé par un soin Olaplex.',
    bad: 'Coloration cheveux.',
  },
  cuisinier_traiteur: {
    good: 'Menu gastronomique 5 services pour un dîner corporate de 80 couverts. Entrée de Saint-Jacques snackées aux agrumes, plat de magret rosé et son jus aux épices douces.',
    bad: 'On a fait un repas pour une entreprise.',
  },
};
