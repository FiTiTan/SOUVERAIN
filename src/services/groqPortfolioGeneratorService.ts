// STUB - Service obsolète (V1)
// Remplacé par aiEnrichmentService.ts (V4)
// Conservé pour compatibilité avec les anciens composants non utilisés

export interface PortfolioGenerationInput {
  visionContext?: any;
  style?: string;
  anonymizedText?: string;
  projectsCount?: number;
}

export async function generatePortfolioContent(input: PortfolioGenerationInput): Promise<any> {
  console.warn('[groqPortfolioGeneratorService] OBSOLETE - Utiliser aiEnrichmentService.ts à la place');
  throw new Error('Service obsolète - Utiliser aiEnrichmentService.ts');
}
