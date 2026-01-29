import { ollamaService } from './ollamaService';

// ============================================
// TYPES
// ============================================

interface PortfolioIntentions {
  portfolioTarget: string;
  portfolioTargetOther?: string;
  keyPriorities: string[];
  keyPriorityOther?: string;
  practicalInfo: string[];
}

interface PortfolioImports {
  selectedProjectIds: string[];
  linkedInData?: {
    profileUrl?: string;
    rawContent?: string;
  };
  notionData?: {
    pageContent?: string;
    fileName?: string;
  };
}

interface MediaFile {
  id: string;
  file: {
    name: string;
    type: string;
    size: number;
  };
  type: 'image' | 'video' | 'pdf' | 'text' | 'document';
}

interface ProjectData {
  id: string;
  title: string;
  brief_text?: string;
  challenge_text?: string;
  solution_text?: string;
}

export interface PortfolioData {
  intentions: PortfolioIntentions;
  imports: PortfolioImports;
  media: MediaFile[];
  projects: ProjectData[];
}

export interface StyleAnalysisResult {
  recommendedStyle: 'moderne' | 'classique' | 'authentique' | 'artistique' | 'vitrine' | 'formel';
 confidence: number; // 0-100
  reasoning: string;
  missingInfo: string[] | null;
  alternativeStyle: string | null;
  keyInsights: string[];
}

// ============================================
// AGRÉGATION DES DONNÉES
// ============================================

function aggregateTextContent(data: PortfolioData): string {
  const textParts: string[] = [];

  // Intentions en texte
  textParts.push(`Type de portfolio: ${data.intentions.portfolioTarget}`);
  if (data.intentions.portfolioTargetOther) {
    textParts.push(`Précision: ${data.intentions.portfolioTargetOther}`);
  }
  textParts.push(`Priorités: ${data.intentions.keyPriorities.join(', ')}`);
  if (data.intentions.keyPriorityOther) {
    textParts.push(`Priorité personnalisée: ${data.intentions.keyPriorityOther}`);
  }
  textParts.push(`Infos pratiques souhaitées: ${data.intentions.practicalInfo.join(', ')}`);

  // Contenu LinkedIn
  if (data.imports.linkedInData?.rawContent) {
    textParts.push(`\n--- CONTENU LINKEDIN ---\n${data.imports.linkedInData.rawContent}`);
  }

  // Contenu Notion
  if (data.imports.notionData?.pageContent) {
    textParts.push(`\n--- CONTENU NOTION ---\n${data.imports.notionData.pageContent}`);
  }

  // Descriptions des projets
  if (data.projects.length > 0) {
    textParts.push(`\n--- PROJETS (${data.projects.length}) ---`);
    data.projects.forEach(project => {
      textParts.push(`\nProjet: ${project.title}`);
      if (project.brief_text) textParts.push(`Brief: ${project.brief_text}`);
      if (project.challenge_text) textParts.push(`Challenge: ${project.challenge_text}`);
      if (project.solution_text) textParts.push(`Solution: ${project.solution_text}`);
    });
  }

  return textParts.join('\n');
}

function aggregateMediaStats(media: MediaFile[]): {
  images: number;
  videos: number;
  pdfs: number;
  texts: number;
  documents: number;
  total: number;
} {
  return {
    images: media.filter(m => m.type === 'image').length,
    videos: media.filter(m => m.type === 'video').length,
    pdfs: media.filter(m => m.type === 'pdf').length,
    texts: media.filter(m => m.type === 'text').length,
    documents: media.filter(m => m.type === 'document').length,
    total: media.length,
  };
}

// ============================================
// PROMPT OLLAMA
// ============================================

function buildAnalysisPrompt(
  textContent: string,
  mediaStats: ReturnType<typeof aggregateMediaStats>
): string {
  return `Tu es un expert en design de portfolios professionnels. Tu dois analyser le profil d'un utilisateur et recommander LE style de portfolio le plus adapté.

## STYLES DISPONIBLES

1. **MODERNE** (Digital Native)
   - Cible : Freelance tech, startup, créatif digital, développeur
   - Design : Bento grid, cards carousel, gradients, animations subtiles
   - Typo : Inter, sans-serif moderne
   - Couleurs : Vives, contrastes forts
   
2. **CLASSIQUE** (Expert Établi)
   - Cible : Consultant, avocat, expert-comptable, profession libérale
   - Design : Colonnes, sections linéaires, sidebar fixe
   - Typo : Serif élégant (Georgia, Playfair)
   - Couleurs : Bleu marine, bordeaux, or discret
   
3. **AUTHENTIQUE** (Artisan)
   - Cible : Artisan, métier manuel, service local, coach
   - Design : Hero fullwidth, témoignages, galerie terrain
   - Typo : Rounded sans-serif chaleureux
   - Couleurs : Terre, bois, vert, couleurs chaudes
   
4. **ARTISTIQUE** (Créatif)
   - Cible : Photographe, artiste, architecte, designer
   - Design : Masonry, fullscreen gallery, navigation minimale
   - Typo : Minimale, au profit des images
   - Couleurs : Noir/blanc ou palette très réduite
   - Ratio : 90% images, 10% texte
   
5. **VITRINE** (Commerce Local)
   - Cible : Boutique, restaurant, café, salon
   - Design : Hero ambiance, infos pratiques sticky, galerie produits
   - Typo : Accessible, lisible
   - Priorité : Horaires, adresse, téléphone, avis
   
6. **FORMEL** (Institutionnel)
   - Cible : Cabinet notarial, étude, institution, grande entreprise
   - Design : Sections numérotées, sidebar navigation, certifications
   - Typo : Serif traditionnel
   - Couleurs : Bleu marine, gris, blanc, touches dorées

## DONNÉES UTILISATEUR À ANALYSER

${textContent}

## STATISTIQUES MÉDIAS

- Images : ${mediaStats.images}
- Vidéos : ${mediaStats.videos}
- PDF : ${mediaStats.pdfs}
- Textes : ${mediaStats.texts}
- Documents : ${mediaStats.documents}
- Total fichiers : ${mediaStats.total}

## RÈGLES D'ANALYSE

1. Analyse le vocabulaire utilisé (technique, artistique, commercial, institutionnel...)
2. Identifie le secteur d'activité
3. Détecte les priorités réelles (au-delà des cases cochées)
4. Évalue si le ratio texte/images correspond à un style particulier
5. Prends en compte les infos pratiques demandées

## GESTION DE L'INCERTITUDE

- Si tu as suffisamment d'éléments : confiance ≥ 70%
- Si certains éléments manquent mais tu peux déduire : confiance 50-69%
- Si vraiment insuffisant : confiance < 50%, recommande MODERNE (le plus polyvalent) et liste ce qui manque

## FORMAT DE RÉPONSE (JSON STRICT)

{
  "recommendedStyle": "moderne|classique|authentique|artistique|vitrine|formel",
  "confidence": <nombre 0-100>,
  "reasoning": "<explication en 2-3 phrases de ton choix>",
  "missingInfo": ["<élément manquant 1>", "<élément manquant 2>"] ou null si confiance >= 70,
  "alternativeStyle": "<style alternatif pertinent>" ou null,
  "keyInsights": ["<insight 1>", "<insight 2>", "<insight 3>"]
}

Réponds UNIQUEMENT avec le JSON, sans texte avant ou après.`;
}

// ============================================
// APPEL OLLAMA
// ============================================

export async function analyzePortfolioForStyle(data: PortfolioData): Promise<StyleAnalysisResult> {
  // Agréger les données
  const textContent = aggregateTextContent(data);
  const mediaStats = aggregateMediaStats(data.media);

  // Construire le prompt
  const prompt = buildAnalysisPrompt(textContent, mediaStats);

  try {
    // Appel Ollama
    const response = await ollamaService.chat({
      model: 'mistral', // ou llama3, selon ce qui est installé
      messages: [
        { role: 'user', content: prompt }
      ],
      options: {
        temperature: 0.3, // Réponses plus déterministes
      },
    });

    // Parser la réponse JSON
    const content = response.message.content.trim();

    // Extraire le JSON (au cas où il y aurait du texte autour)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Réponse Ollama invalide : pas de JSON trouvé');
    }

    const result: StyleAnalysisResult = JSON.parse(jsonMatch[0]);

    // Validation basique
    const validStyles = ['moderne', 'classique', 'authentique', 'artistique', 'vitrine', 'formel'];
    if (!validStyles.includes(result.recommendedStyle)) {
      result.recommendedStyle = 'moderne';
    }
    if (typeof result.confidence !== 'number' || result.confidence < 0 || result.confidence > 100) {
      result.confidence = 50;
    }

    return result;

  } catch (error) {
    console.error('Erreur analyse Ollama:', error);

    // Fallback en cas d'erreur
    return {
      recommendedStyle: 'moderne',
      confidence: 40,
      reasoning: "Je n'ai pas pu analyser complètement vos données. Le style Moderne est recommandé car c'est le plus polyvalent.",
      missingInfo: ['Analyse IA indisponible - vérifiez que Ollama est lancé'],
      alternativeStyle: null,
      keyInsights: [],
    };
  }
}

// ============================================
// FONCTION UTILITAIRE : VÉRIFIER OLLAMA
// ============================================

export async function checkOllamaAvailability(): Promise<boolean> {
  try {
    const response = await fetch('http://localhost:11434/api/tags');
    return response.ok;
  } catch {
    return false;
  }
}
