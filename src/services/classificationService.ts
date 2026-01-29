/**
 * SOUVERAIN - Classification Service
 * Service de classification IA locale via Ollama
 * Analyse les éléments du portfolio et les classifie automatiquement
 */

import type { ElementClassification } from '../components/portfolio/ElementClassificationView';

// ============================================================
// TYPES
// ============================================================

export interface ClassificationRequest {
  elementId: string;
  title: string;
  description?: string;
  format: string;
  thumbnailUrl?: string;
  extractedText?: string;
  metadata?: Record<string, any>;
}

export interface ClassificationResult extends ElementClassification {
  elementId: string;
  processingTime?: number;
}

// ============================================================
// CLASSIFICATION SERVICE
// ============================================================

/**
 * Classify a single element using Ollama
 */
export async function classifyElement(
  request: ClassificationRequest
): Promise<ClassificationResult> {
  try {
    // Appeler l'IPC handler Ollama
    const result = await window.electron.ollama.classifyElement(request);

    if (!result.success) {
      throw new Error(result.error || 'Classification failed');
    }

    return {
      elementId: request.elementId,
      category: result.classification.category,
      tags: result.classification.tags,
      suggestedProject: result.classification.suggestedProject,
      confidence: result.classification.confidence,
      reasoning: result.classification.reasoning,
      processingTime: result.processingTime,
    };
  } catch (error) {
    console.error('[ClassificationService] Erreur classification:', error);

    // Fallback: classification basique basée sur le format
    return fallbackClassification(request);
  }
}

/**
 * Classify multiple elements in batch
 */
export async function classifyElements(
  requests: ClassificationRequest[]
): Promise<ClassificationResult[]> {
  const results: ClassificationResult[] = [];

  for (const request of requests) {
    try {
      const result = await classifyElement(request);
      results.push(result);
    } catch (error) {
      console.error(`[ClassificationService] Erreur classification ${request.elementId}:`, error);
      results.push(fallbackClassification(request));
    }
  }

  return results;
}

/**
 * Check if Ollama is available
 */
export async function checkOllamaAvailability(): Promise<{
  available: boolean;
  model?: string;
  error?: string;
}> {
  try {
    const result = await window.electron.ollama.checkAvailability();
    return result;
  } catch (error) {
    return {
      available: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================================
// FALLBACK CLASSIFICATION
// ============================================================

/**
 * Basic classification based on file format when Ollama is not available
 */
function fallbackClassification(request: ClassificationRequest): ClassificationResult {
  const { elementId, format, title } = request;

  // Déterminer la catégorie basée sur le format
  let category = 'Autre';
  let tags: string[] = [];

  const lowerFormat = format.toLowerCase();

  if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(lowerFormat)) {
    category = 'Design';
    tags = ['Image', 'Visuel'];
  } else if (['pdf'].includes(lowerFormat)) {
    category = 'Document';
    tags = ['PDF', 'Document'];
  } else if (['mp4', 'mov', 'avi'].includes(lowerFormat)) {
    category = 'Vidéo';
    tags = ['Vidéo', 'Multimédia'];
  } else if (['pptx'].includes(lowerFormat)) {
    category = 'Présentation';
    tags = ['PowerPoint', 'Présentation'];
  } else if (['docx'].includes(lowerFormat)) {
    category = 'Document';
    tags = ['Word', 'Document'];
  }

  // Extraire des tags supplémentaires du titre
  const titleLower = title.toLowerCase();
  if (titleLower.includes('web')) tags.push('Web');
  if (titleLower.includes('mobile')) tags.push('Mobile');
  if (titleLower.includes('ui') || titleLower.includes('ux')) tags.push('UI/UX');
  if (titleLower.includes('logo')) tags.push('Logo');
  if (titleLower.includes('app')) tags.push('Application');

  return {
    elementId,
    category,
    tags: [...new Set(tags)], // Remove duplicates
    confidence: 0.5, // Lower confidence for fallback
    reasoning: 'Classification automatique basée sur le type de fichier (Ollama indisponible)',
  };
}

// ============================================================
// PROMPT TEMPLATES
// ============================================================

/**
 * Generate classification prompt for Ollama
 * Used by the main process
 */
export function generateClassificationPrompt(request: ClassificationRequest): string {
  const { title, description, format, extractedText } = request;

  return `Tu es un assistant IA spécialisé dans la classification de contenus de portfolio professionnel.

Analyse l'élément suivant et fournis une classification structurée :

**Titre :** ${title}
**Format :** ${format}
${description ? `**Description :** ${description}` : ''}
${extractedText ? `**Contenu extrait :** ${extractedText.substring(0, 500)}...` : ''}

Fournis une classification au format JSON strict suivant :
{
  "category": "<catégorie principale>",
  "tags": ["<tag1>", "<tag2>", "<tag3>"],
  "suggestedProject": "<nom de projet suggéré>",
  "confidence": <nombre entre 0 et 1>,
  "reasoning": "<explication courte de la classification>"
}

**Catégories possibles :**
- Design (UI/UX, graphisme, branding)
- Développement (web, mobile, logiciel)
- Marketing (contenu, campagnes, réseaux sociaux)
- Vidéo (montage, motion design, production)
- Photo (photographie, retouche)
- Rédaction (articles, copywriting, documentation)
- Autre

**Consignes :**
- Maximum 5 tags pertinents
- Suggère un nom de projet cohérent si possible
- Le confidence doit refléter ta certitude (0.7+ = bon, 0.5-0.7 = moyen, <0.5 = incertain)
- Réponds UNIQUEMENT avec le JSON, sans texte avant ou après`;
}

export default {
  classifyElement,
  classifyElements,
  checkOllamaAvailability,
  generateClassificationPrompt,
};
