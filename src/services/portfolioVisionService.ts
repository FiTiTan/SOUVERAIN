import { getAllMappings, deanonymize } from './anonymizationService';

// ============================================================
// TYPES
// ============================================================

export interface VisionContext {
  summary: string;
  detectedSector: string;
  keyStrengths: string[];
  targetAudience: string;
  recommendedStyle: 'moderne' | 'classique' | 'authentique' | 'artistique' | 'vitrine' | 'formel';
  confidence: number;
  reasoning: string;
  alternativeStyles: string[];
  suggestedSections: string[];
  toneGuidelines: string;
  contentHints: Record<string, string>;
  missingInfo?: string[];
}

export interface VisionInput {
  anonymizedText: string;
  intentions: {
    target: string;
    priorities: string[];
    practicalInfo: string[];
  };
  mediaStats: {
    images: number;
    videos: number;
    pdfs: number;
    texts: number;
    total: number;
  };
  projectsCount: number;
}

// ============================================================
// VISION COMPILATION
// ============================================================

export async function compilePortfolioVision(
  input: VisionInput,
  portfolioId: string
): Promise<VisionContext> {
  try {
    console.log('[Portfolio Vision] Starting compilation...');

    // 1. Appel Groq via IPC (Single Source of Truth)
    // @ts-ignore
    const groqResult = await window.electron.invoke('groq-compile-vision', {
      analysisData: input,
      portfolioId
    });

    if (!groqResult.success) {
      throw new Error(groqResult.error || 'Groq vision compilation failed');
    }

    console.log('[Portfolio Vision] Vision compiled, deanonymizing...');

    // 2. Dé-anonymisation contextuelle
    const mappings = await getAllMappings(portfolioId);

    // Fonction helper pour dÃ©-anonymiser un tableau de strings
    const deanonymizeArray = (arr: string[] = []) => arr.map(s => deanonymize(s, mappings));

    const vision: VisionContext = {
      summary: deanonymize(groqResult.result.summary, mappings),
      detectedSector: deanonymize(groqResult.result.detectedSector, mappings),
      keyStrengths: deanonymizeArray(groqResult.result.keyStrengths),
      targetAudience: deanonymize(groqResult.result.targetAudience, mappings),
      recommendedStyle: groqResult.result.recommendedStyle,
      confidence: groqResult.result.confidence,
      reasoning: deanonymize(groqResult.result.reasoning, mappings),
      alternativeStyles: groqResult.result.alternativeStyles || [],
      suggestedSections: groqResult.result.suggestedSections || ['hero', 'about', 'contact'],
      toneGuidelines: deanonymize(groqResult.result.toneGuidelines, mappings),
      contentHints: {}, // Sera rempli ci-dessous
      missingInfo: groqResult.result.missingInfo
    };

    // Dé-anonymiser les hints de contenu (objet clé-valeur)
    if (groqResult.result.contentHints) {
        Object.entries(groqResult.result.contentHints).forEach(([key, value]) => {
            vision.contentHints[key] = deanonymize(value as string, mappings);
        });
    }

    return vision;

  } catch (error) {
    console.error('[Portfolio Vision] Compilation error:', error);
    
    // Fallback "Safe Mode"
    return {
      summary: "Analyse automatique indisponible. Le mode manuel est activé.",
      detectedSector: "Généraliste",
      keyStrengths: [],
      targetAudience: "Tout public",
      recommendedStyle: 'moderne', // Style par défaut sûr
      confidence: 30, // Confiance basse pour forcer le choix utilisateur
      reasoning: "Le service d'analyse IA n'a pas pu aboutir. Veuillez sélectionner votre style manuellement.",
      alternativeStyles: ['classique', 'vitrine'],
      suggestedSections: ['hero', 'about', 'contact'],
      toneGuidelines: "Professionnel et direct.",
      contentHints: {},
      missingInfo: ["Service indisponible"]
    };
  }
}
