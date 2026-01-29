/**
 * SOUVERAIN - Element Classifier
 * Classification IA des éléments importés via Ollama (local)
 * Détermine le type, la pertinence et génère une description
 */

import type { AIClassification, AIPertinence } from '../../types/portfolio';
import { buildClassifierPrompt, getSectorPrompts } from '../../config/sectors';

// ============================================================
// TYPES
// ============================================================

export interface ClassificationInput {
  elementId: string;
  type: 'image' | 'text' | 'video_thumbnail' | 'slide';
  contentPath?: string;
  contentText?: string;
  metadata?: Record<string, unknown>;
}

export interface ClassificationResult {
  elementId: string;
  classification: AIClassification;
  pertinence: AIPertinence;
  description: string;
  tags: string[];
  confidence: number;     // 0-1
  reasoning?: string;
}

export interface ClassifierOptions {
  sectorId: string;
  batchSize?: number;
  model?: string;
}

// ============================================================
// OLLAMA CLIENT
// ============================================================

const OLLAMA_BASE_URL = 'http://localhost:11434';
const DEFAULT_MODEL = 'llama3.2:3b';

interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_count?: number;
  prompt_eval_duration?: number;
  eval_count?: number;
  eval_duration?: number;
}

/**
 * Appel à l'API Ollama
 */
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
          temperature: 0.3,
          top_p: 0.9,
          num_predict: 500,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama error: ${response.status} ${response.statusText}`);
    }

    const data: OllamaResponse = await response.json();
    return data.response;

  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Ollama n\'est pas accessible. Vérifiez qu\'il est démarré sur localhost:11434');
    }
    throw error;
  }
}

/**
 * Vérifie si Ollama est disponible
 */
export async function checkOllamaStatus(): Promise<boolean> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Liste les modèles disponibles
 */
export async function listOllamaModels(): Promise<string[]> {
  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    if (!response.ok) return [];

    const data = await response.json();
    return data.models?.map((m: { name: string }) => m.name) || [];
  } catch {
    return [];
  }
}

// ============================================================
// CLASSIFIER
// ============================================================

/**
 * Classifie un élément unique
 */
export async function classifyElement(
  input: ClassificationInput,
  options: ClassifierOptions
): Promise<ClassificationResult> {
  const { sectorId, model = DEFAULT_MODEL } = options;

  // Construire le prompt système basé sur le secteur
  const systemPrompt = buildClassifierPrompt(sectorId);

  // Construire le prompt utilisateur
  const userPrompt = buildUserPrompt(input);

  try {
    const response = await callOllama(userPrompt, systemPrompt, model);
    const result = parseClassificationResponse(response, input.elementId);
    return result;
  } catch (error) {
    // En cas d'erreur, retourner un résultat par défaut
    return {
      elementId: input.elementId,
      classification: 'autre',
      pertinence: 'moyenne',
      description: 'Classification non disponible',
      tags: [],
      confidence: 0,
      reasoning: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

/**
 * Classifie un lot d'éléments
 */
export async function classifyElements(
  inputs: ClassificationInput[],
  options: ClassifierOptions
): Promise<ClassificationResult[]> {
  const { batchSize = 5 } = options;
  const results: ClassificationResult[] = [];

  // Traiter par lots pour éviter de surcharger Ollama
  for (let i = 0; i < inputs.length; i += batchSize) {
    const batch = inputs.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((input) => classifyElement(input, options))
    );
    results.push(...batchResults);
  }

  return results;
}

// ============================================================
// HELPERS
// ============================================================

/**
 * Construit le prompt utilisateur pour un élément
 */
function buildUserPrompt(input: ClassificationInput): string {
  let prompt = `Analyse cet élément et classifie-le.\n\n`;

  prompt += `Type d'élément: ${input.type}\n`;

  if (input.contentText) {
    prompt += `\nContenu textuel:\n${input.contentText.substring(0, 500)}...\n`;
  }

  if (input.metadata) {
    prompt += `\nMétadonnées:\n`;
    if (input.metadata.width && input.metadata.height) {
      prompt += `- Dimensions: ${input.metadata.width}x${input.metadata.height}\n`;
    }
    if (input.metadata.dateTaken) {
      prompt += `- Date: ${input.metadata.dateTaken}\n`;
    }
    if (input.metadata.duration) {
      prompt += `- Durée: ${input.metadata.duration}s\n`;
    }
  }

  prompt += `
Réponds au format JSON suivant:
{
  "classification": "realisation" | "avant_apres" | "document" | "plan" | "portrait" | "autre",
  "pertinence": "haute" | "moyenne" | "basse" | "exclure",
  "description": "Description courte de l'élément",
  "tags": ["tag1", "tag2", "tag3"],
  "confidence": 0.0-1.0,
  "reasoning": "Explication de la classification"
}`;

  return prompt;
}

/**
 * Parse la réponse de classification
 */
function parseClassificationResponse(
  response: string,
  elementId: string
): ClassificationResult {
  try {
    // Extraire le JSON de la réponse
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Pas de JSON trouvé dans la réponse');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Valider et normaliser les valeurs
    const validClassifications: AIClassification[] = [
      'realisation', 'avant_apres', 'document', 'plan', 'portrait', 'autre'
    ];
    const validPertinences: AIPertinence[] = [
      'haute', 'moyenne', 'basse', 'exclure'
    ];

    const classification = validClassifications.includes(parsed.classification)
      ? parsed.classification
      : 'autre';

    const pertinence = validPertinences.includes(parsed.pertinence)
      ? parsed.pertinence
      : 'moyenne';

    return {
      elementId,
      classification,
      pertinence,
      description: parsed.description || 'Aucune description',
      tags: Array.isArray(parsed.tags) ? parsed.tags.slice(0, 5) : [],
      confidence: typeof parsed.confidence === 'number'
        ? Math.max(0, Math.min(1, parsed.confidence))
        : 0.5,
      reasoning: parsed.reasoning,
    };
  } catch {
    return {
      elementId,
      classification: 'autre',
      pertinence: 'moyenne',
      description: 'Erreur de parsing',
      tags: [],
      confidence: 0,
      reasoning: 'Impossible de parser la réponse IA',
    };
  }
}

// ============================================================
// CLASSIFICATION LABELS
// ============================================================

export const CLASSIFICATION_LABELS: Record<AIClassification, { label: string; icon: string; description: string }> = {
  realisation: {
    label: 'Réalisation',
    icon: '✨',
    description: 'Projet terminé, travail accompli',
  },
  avant_apres: {
    label: 'Avant/Après',
    icon: '🔄',
    description: 'Transformation, évolution visible',
  },
  document: {
    label: 'Document',
    icon: '📄',
    description: 'Document administratif, contrat, devis',
  },
  plan: {
    label: 'Plan',
    icon: '📐',
    description: 'Plan technique, schéma, maquette',
  },
  portrait: {
    label: 'Portrait',
    icon: '👤',
    description: 'Photo de personne, équipe',
  },
  autre: {
    label: 'Autre',
    icon: '📎',
    description: 'Élément non classifié',
  },
};

export const PERTINENCE_LABELS: Record<AIPertinence, { label: string; color: string }> = {
  haute: { label: 'Haute', color: '#16A34A' },
  moyenne: { label: 'Moyenne', color: '#EAB308' },
  basse: { label: 'Basse', color: '#F97316' },
  exclure: { label: 'À exclure', color: '#DC2626' },
};
