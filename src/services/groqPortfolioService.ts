import { getAllMappings, deanonymize, type AnonymizedResult } from './anonymizationService';

interface PortfolioAnalysisInput {
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

export interface StyleAnalysisResult {
  recommendedStyle: 'moderne' | 'classique' | 'authentique' | 'artistique' | 'vitrine' | 'formel';
  confidence: number; // 0-100
  reasoning: string;
  missingInfo: string[] | null;
  alternativeStyle: string | null;
  keyInsights: string[];
}

/**
 * Analyse le style du portfolio via Groq API (distant) après anonymisation
 */
export async function analyzePortfolioStyleWithGroq(
  input: PortfolioAnalysisInput,
  portfolioId: string
): Promise<StyleAnalysisResult> {
  
  try {
    console.log('[Groq Service] Sending anonymized data for analysis...');
    
    // 1. Appel Groq via IPC
    // @ts-ignore
    const groqResult = await window.electron.invoke('groq-analyze-portfolio-style', {
      anonymizedText: input.anonymizedText,
      intentions: input.intentions,
      mediaStats: input.mediaStats,
      projectsCount: input.projectsCount
    });

    if (!groqResult.success) {
      throw new Error(groqResult.error || 'Groq analysis failed');
    }

    console.log('[Groq Service] Received analysis, deanonymizing...');

    // 2. Récupérer les mappings pour dé-anonymisation
    const mappings = await getAllMappings(portfolioId);

    // 3. Dé-anonymiser le résultat
    // On restaure les vrais noms dans le raisonnement et les insights
    const deanonymizedResult: StyleAnalysisResult = {
      ...groqResult.result,
      reasoning: deanonymize(groqResult.result.reasoning, mappings),
      keyInsights: (groqResult.result.keyInsights || []).map((insight: string) => 
        deanonymize(insight, mappings)
      ),
      // Si l'alternativeStyle contient des tokens (peu probable mais possible), on le dé-anonymise aussi
      alternativeStyle: groqResult.result.alternativeStyle 
        ? deanonymize(groqResult.result.alternativeStyle, mappings)
        : null
    };

    return deanonymizedResult;

  } catch (error) {
    console.error('[Groq Portfolio] Analysis error:', error);
    
    // Fallback : règles heuristiques simples si Groq échoue
    // Cela permet de ne pas bloquer l'utilisateur
    return {
      recommendedStyle: 'moderne',
      confidence: 40,
      reasoning: 'L\'analyse IA distante est temporairement indisponible. Nous vous suggérons ce style polyvalent par défaut.',
      missingInfo: ['Connexion au service d\'analyse IA échouée'],
      alternativeStyle: 'classique',
      keyInsights: []
    };
  }
}
