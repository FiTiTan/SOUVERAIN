// SOUVERAIN - Portfolio Generator Service V3
// Orchestrateur du workflow complet
// Extraction → Anonymisation → Enrichissement GROQ → Désanonymisation → Injection Template

import { aggregateAllData, type ExtractedData } from './extractionService';
import { enrichPortfolioDataV3 } from './groqEnrichmentServiceV3';
import { injectDataIntoTemplate, computeFlags } from './templateInjectorService';

export interface GenerationInputV3 {
  formData: any;
  uploadedFiles: Array<{ path: string; type: string; associatedProject?: string }>;
  linkedInData?: string;
  notionData?: string;
  templateId: string;
}

export interface GenerationResultV3 {
  success: boolean;
  html?: string;
  error?: string;
  debug?: {
    extractedDocsCount: number;
    anonymizedEntities: number;
    enrichmentSource: 'groq' | 'fallback';
  };
}

/**
 * Charge un template HTML via IPC
 */
async function loadTemplateHTML(templateId: string): Promise<string> {
  try {
    console.log('[GeneratorV3] Loading template:', templateId);
    // @ts-ignore
    const result = await window.electron.invoke('template-get-html', templateId);
    
    if (typeof result === 'object' && result !== null && 'html' in result) {
      return result.html || '';
    }
    return typeof result === 'string' ? result : '';
  } catch (error) {
    console.error(`[GeneratorV3] Error loading template ${templateId}:`, error);
    throw new Error(`Impossible de charger le template ${templateId}`);
  }
}

/**
 * Génère un portfolio complet avec le workflow V3
 */
export async function generatePortfolioV3(input: GenerationInputV3): Promise<GenerationResultV3> {
  const { formData, uploadedFiles, linkedInData, notionData, templateId } = input;

  try {
    console.log('[GeneratorV3] Starting V3 generation workflow...');
    
    // 1. Charger le template
    console.log('[GeneratorV3] Step 1: Loading template...');
    const templateHTML = await loadTemplateHTML(templateId);
    
    if (!templateHTML || templateHTML.length === 0) {
      return { success: false, error: 'Template HTML is empty' };
    }

    // 2. Extraire et agréger toutes les données
    console.log('[GeneratorV3] Step 2: Extracting data...');
    const extractedData = await aggregateAllData(
      formData,
      uploadedFiles || [],
      linkedInData,
      notionData
    );

    console.log(`[GeneratorV3] ${extractedData.documents.length} documents extracted`);
    console.log(`[GeneratorV3] ${extractedData.projectContexts.length} projects with context`);

    // 3. Enrichir avec Groq (inclut anonymisation/désanonymisation)
    console.log('[GeneratorV3] Step 3: Enriching with Groq...');
    const enrichmentResult = await enrichPortfolioDataV3(extractedData);

    if (!enrichmentResult.success || !enrichmentResult.enrichedData) {
      console.warn('[GeneratorV3] Groq enrichment failed, using fallback');
    }

    const enrichedData = enrichmentResult.enrichedData!;
    const entityMap = enrichmentResult.entityMap || {};

    // 4. Calculer les flags pour les sections conditionnelles
    const flags = computeFlags(enrichedData);

    // 5. Injecter dans le template
    console.log('[GeneratorV3] Step 4: Injecting into template...');
    const renderedHTML = injectDataIntoTemplate(templateHTML, enrichedData, flags);

    // 6. Ajouter métadonnées SEO
    const finalHTML = renderedHTML.replace(
      '<title>',
      `<meta name="description" content="${escapeHtml(formData.tagline || '')}">\n  <title>`
    );

    console.log('[GeneratorV3] ✓ V3 generation complete');

    return {
      success: true,
      html: finalHTML,
      debug: {
        extractedDocsCount: extractedData.documents.length,
        anonymizedEntities: Object.keys(entityMap).length,
        enrichmentSource: enrichmentResult.success ? 'groq' : 'fallback',
      },
    };

  } catch (error: any) {
    console.error('[GeneratorV3] Error:', error);
    return {
      success: false,
      error: error.message || 'Portfolio generation failed',
    };
  }
}

/**
 * Échappe les caractères HTML
 */
function escapeHtml(text: string): string {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
