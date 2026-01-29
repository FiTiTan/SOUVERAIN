import { getAllMappings, deanonymize } from './anonymizationService';
import type { VisionContext } from './portfolioVisionService';

// ============================================================
// TYPES
// ============================================================

export interface GeneratedSection {
  id: string;
  type: 'hero' | 'about' | 'services' | 'projects' | 'contact' | 'practical';
  title: string;
  content: string;
  metadata?: Record<string, any>;
}

export interface GeneratedPortfolio {
  sections: GeneratedSection[];
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
}

export interface PortfolioGenerationInput {
  anonymizedText: string; // Gardé pour context additionnel si besoin
  visionContext: VisionContext; // Single Source of Truth
  style: string; // Le style FINALEMENT choisi (peut différer de la recommandation)
  portfolioId: string;
  projects: any[]; // Gardé pour le comptage/structure
}

// ============================================================
// GENERATION FUNCTION
// ============================================================

export async function generatePortfolioContent(
  input: PortfolioGenerationInput
): Promise<GeneratedPortfolio> {

  try {
    console.log('[Groq Generator] Starting generation with Vision Context...');

    // 1. Appel Groq via IPC (Utilise le VisionContext comme blueprint)
    // @ts-ignore
    const groqResult = await window.electron.invoke('groq-generate-portfolio-content', {
      visionContext: input.visionContext,
      style: input.style,
      // On passe encore le texte brut au cas où le llm en ait besoin pour des détails spécifiques
      anonymizedText: input.anonymizedText, 
      projectsCount: input.projects.length
    });

    if (!groqResult.success) {
      console.warn('[Groq Generator] Generation failed, using fallback');
      return getFallbackPortfolio(input);
    }

    console.log('[Groq Generator] Success, deanonymizing...');

    // 2. Dé-anonymisation
    const mappings = await getAllMappings(input.portfolioId);

    const deanonymizedPortfolio: GeneratedPortfolio = {
      ...groqResult.result,
      sections: groqResult.result.sections.map((section: GeneratedSection) => ({
        ...section,
        title: deanonymize(section.title, mappings),
        content: deanonymize(section.content, mappings)
      })),
      seo: {
        ...groqResult.result.seo,
        title: deanonymize(groqResult.result.seo.title, mappings),
        description: deanonymize(groqResult.result.seo.description, mappings)
      }
    };

    return deanonymizedPortfolio;

  } catch (error) {
    console.error('[Groq Generator] Critical error:', error);
    return getFallbackPortfolio(input);
  }
}

// ============================================================
// FALLBACK UTILITIES
// ============================================================

function getFallbackPortfolio(input: PortfolioGenerationInput): GeneratedPortfolio {
  return {
    sections: [
      {
        id: 'hero',
        type: 'hero',
        title: 'Bienvenue',
        content: input.visionContext.contentHints?.hero || 'Portfolio professionnel',
        metadata: { cta: 'Découvrir' }
      },
      {
        id: 'about',
        type: 'about',
        title: 'À propos',
        content: input.visionContext.summary || 'Professionnel passionné.'
      },
      {
        id: 'contact',
        type: 'contact',
        title: 'Contact',
        content: 'Contactez-moi pour toute opportunité.'
      }
    ],
    seo: {
        title: 'Portfolio Pro',
        description: 'Mon portfolio en ligne',
        keywords: ['portfolio']
    }
  };
}
