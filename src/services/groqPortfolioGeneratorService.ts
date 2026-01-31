// STUB - Service obsolète (V1)
// Remplacé par groqEnrichmentService.ts (V2)
// Conservé pour compatibilité avec les anciens composants non utilisés

export interface PortfolioGenerationInput {
  visionContext?: any;
  style?: string;
  anonymizedText?: string;
  projectsCount?: number;
}

export async function generatePortfolioContent(input: PortfolioGenerationInput): Promise<any> {
  console.warn('[groqPortfolioGeneratorService] OBSOLETE - Utiliser groqEnrichmentService.ts à la place');
  throw new Error('Service obsolète - Utiliser groqEnrichmentService.ts');
}
