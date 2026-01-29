/**
 * SOUVERAIN - Configuration des secteurs
 * Prompts IA et labels spécifiques par secteur
 */

import type { PortfolioMode, SectorConfig } from '../types/sectors';

// ============================================================
// PROMPTS IA PAR SECTEUR
// ============================================================

export interface SectorPromptConfig {
  sectorId: string;

  // Prompts pour le classificateur d'éléments
  classifierSystemPrompt: string;
  classifierExamples: string[];

  // Prompts pour le narrateur
  narratorToneOfVoice: string;
  narratorTitleStyle: string;
  narratorDescriptionStyle: string;

  // Mots-clés de pertinence
  highRelevanceKeywords: string[];
  lowRelevanceKeywords: string[];
}

// ============================================================
// PROMPTS TIER 1
// ============================================================

export const SECTOR_PROMPTS: Record<string, SectorPromptConfig> = {
  // ARTISAN BTP
  artisan_btp: {
    sectorId: 'artisan_btp',
    classifierSystemPrompt: `Tu es un expert en travaux du bâtiment. Analyse les images de chantiers et réalisations.
Identifie les types de travaux : rénovation, construction neuve, extension, aménagement.
Repère les photos avant/après qui démontrent la transformation.
Privilégie les photos montrant la qualité de finition et le savoir-faire.`,
    classifierExamples: [
      'Rénovation complète salle de bain avec douche italienne',
      'Extension maison ossature bois 40m²',
      'Pose carrelage grand format effet béton ciré',
    ],
    narratorToneOfVoice: 'Professionnel, rassurant, expert technique. Mettez en avant le savoir-faire et la qualité des finitions.',
    narratorTitleStyle: 'Courts et percutants, axés sur le type de travaux et le lieu.',
    narratorDescriptionStyle: 'Détaillez les travaux réalisés, les matériaux utilisés, les défis techniques relevés. Incluez les délais et surfaces si pertinent.',
    highRelevanceKeywords: ['chantier', 'rénovation', 'travaux', 'finition', 'pose', 'installation'],
    lowRelevanceKeywords: ['selfie', 'famille', 'vacances', 'restaurant'],
  },

  // PHOTOGRAPHE
  photographe: {
    sectorId: 'photographe',
    classifierSystemPrompt: `Tu es un directeur artistique photo. Analyse les images pour un portfolio photographe.
Identifie le style : portrait, événementiel, corporate, produit, paysage, reportage.
Évalue la qualité technique : composition, lumière, post-traitement.
Privilégie les images qui montrent une signature artistique cohérente.`,
    classifierExamples: [
      'Portrait corporate dirigeant en lumière naturelle',
      'Reportage mariage - préparatifs mariée',
      'Photo produit cosmétique fond blanc',
    ],
    narratorToneOfVoice: 'Artistique et sensible, tout en restant professionnel. Mettez en avant l\'émotion capturée.',
    narratorTitleStyle: 'Évocateurs et poétiques, suggérant l\'atmosphère du shooting.',
    narratorDescriptionStyle: 'Contextualisez la séance, l\'approche artistique choisie, le travail sur la lumière. Mentionnez le client ou l\'événement si pertinent.',
    highRelevanceKeywords: ['shooting', 'séance', 'portrait', 'reportage', 'éclairage', 'composition'],
    lowRelevanceKeywords: ['screenshot', 'document', 'texte', 'formulaire'],
  },

  // AGENT IMMOBILIER
  agent_immobilier: {
    sectorId: 'agent_immobilier',
    classifierSystemPrompt: `Tu es un expert immobilier. Analyse les photos de biens et transactions.
Identifie le type de bien : appartement, maison, local commercial, terrain.
Repère les photos mettant en valeur les atouts : luminosité, volumes, extérieurs.
Privilégie les photos de qualité professionnelle montrant le potentiel.`,
    classifierExamples: [
      'Appartement 3 pièces lumineux - séjour double exposition',
      'Maison contemporaine avec piscine et jardin paysager',
      'Local commercial 200m² en centre-ville',
    ],
    narratorToneOfVoice: 'Commercial mais authentique. Mettez en avant les atouts sans survendre.',
    narratorTitleStyle: 'Descriptifs et localisant le bien.',
    narratorDescriptionStyle: 'Présentez le bien, sa surface, son emplacement, ses points forts. Mentionnez le contexte de la transaction si pertinent.',
    highRelevanceKeywords: ['bien', 'appartement', 'maison', 'vente', 'location', 'transaction'],
    lowRelevanceKeywords: ['personnel', 'vacances', 'famille'],
  },

  // COACH FORMATEUR
  coach_formateur: {
    sectorId: 'coach_formateur',
    classifierSystemPrompt: `Tu es un expert en formation professionnelle. Analyse les visuels de formations et coachings.
Identifie le contexte : formation présentiel, coaching individuel, conférence, atelier.
Repère les photos montrant l'interaction et l'engagement des participants.
Privilégie les images professionnelles de mise en situation.`,
    classifierExamples: [
      'Atelier leadership équipe commerciale - 12 participants',
      'Coaching dirigeant transformation digitale',
      'Conférence bien-être au travail - 200 personnes',
    ],
    narratorToneOfVoice: 'Inspirant et bienveillant. Mettez en avant les transformations obtenues et l\'impact.',
    narratorTitleStyle: 'Axés sur la thématique et les résultats.',
    narratorDescriptionStyle: 'Décrivez le contexte, les objectifs, la méthodologie utilisée. Mettez en avant les résultats concrets si disponibles.',
    highRelevanceKeywords: ['formation', 'coaching', 'atelier', 'conférence', 'accompagnement', 'transformation'],
    lowRelevanceKeywords: ['personnel', 'vacances', 'non-professionnel'],
  },

  // ARCHITECTE INTÉRIEUR
  architecte_interieur: {
    sectorId: 'architecte_interieur',
    classifierSystemPrompt: `Tu es un critique en design d'intérieur. Analyse les projets d'aménagement.
Identifie le type de projet : résidentiel, commercial, bureaux, hôtellerie.
Repère les photos avant/après montrant la transformation des espaces.
Privilégie les vues d'ensemble et les détails de finition qui illustrent le concept.`,
    classifierExamples: [
      'Réaménagement loft parisien 120m² - style industriel chic',
      'Design boutique mode - concept store minimaliste',
      'Agencement cuisine ouverte avec îlot central',
    ],
    narratorToneOfVoice: 'Créatif et inspiré. Mettez en avant la vision architecturale et l\'attention aux détails.',
    narratorTitleStyle: 'Évoquant le concept et le lieu.',
    narratorDescriptionStyle: 'Présentez le brief client, les contraintes, les choix conceptuels, les matériaux. Détaillez la transformation de l\'espace.',
    highRelevanceKeywords: ['aménagement', 'design', 'décoration', 'espace', 'concept', 'mobilier'],
    lowRelevanceKeywords: ['personnel', 'non-fini', 'brouillon'],
  },

  // COIFFEUR ESTHÉTICIENNE
  coiffeur_esthetique: {
    sectorId: 'coiffeur_esthetique',
    classifierSystemPrompt: `Tu es un expert beauté et coiffure. Analyse les réalisations du salon.
Identifie le type de prestation : coupe, coloration, coiffure événementielle, soin, maquillage.
Repère les photos avant/après qui montrent la transformation.
Privilégie les photos de qualité montrant le résultat sur les clients.`,
    classifierExamples: [
      'Balayage californien sur cheveux châtains - transformation naturelle',
      'Coiffure mariage bohème avec couronne de fleurs',
      'Soin visage anti-âge - résultat avant/après',
    ],
    narratorToneOfVoice: 'Chaleureux et tendance. Mettez en avant la transformation et le bien-être des clients.',
    narratorTitleStyle: 'Accrocheurs, décrivant la prestation et le style.',
    narratorDescriptionStyle: 'Décrivez la prestation, les produits ou techniques utilisés, le résultat obtenu. Mettez en avant la satisfaction client.',
    highRelevanceKeywords: ['coupe', 'coloration', 'coiffure', 'soin', 'beauté', 'transformation'],
    lowRelevanceKeywords: ['stock', 'commande', 'administratif'],
  },

  // CUISINIER TRAITEUR
  cuisinier_traiteur: {
    sectorId: 'cuisinier_traiteur',
    classifierSystemPrompt: `Tu es un critique gastronomique. Analyse les créations culinaires.
Identifie le type : plat gastronomique, buffet traiteur, pâtisserie, événement.
Repère les photos mettant en valeur le dressage, les couleurs, la créativité.
Privilégie les images de qualité food photography.`,
    classifierExamples: [
      'Menu gastronomique 5 services - dîner corporate 80 couverts',
      'Wedding cake 4 étages - thème champêtre',
      'Buffet cocktail dînatoire - vernissage galerie d\'art',
    ],
    narratorToneOfVoice: 'Gourmand et raffiné. Mettez en avant la créativité et la qualité des produits.',
    narratorTitleStyle: 'Appétissants, décrivant la création ou l\'événement.',
    narratorDescriptionStyle: 'Décrivez le contexte, le menu, les ingrédients phares, l\'événement. Mettez en avant le sur-mesure et l\'attention aux détails.',
    highRelevanceKeywords: ['plat', 'menu', 'création', 'buffet', 'gâteau', 'événement'],
    lowRelevanceKeywords: ['administratif', 'facture', 'bon de commande'],
  },
};

// ============================================================
// TEMPLATES PAR SECTEUR
// ============================================================

export interface SectorTemplateConfig {
  sectorId: string;
  recommendedTemplates: string[];
  defaultTemplate: string;
  colorSchemes: {
    id: string;
    name: string;
    primary: string;
    secondary: string;
    accent: string;
  }[];
}

export const SECTOR_TEMPLATES: Record<string, SectorTemplateConfig> = {
  artisan_btp: {
    sectorId: 'artisan_btp',
    recommendedTemplates: ['classic', 'modern', 'grid'],
    defaultTemplate: 'classic',
    colorSchemes: [
      { id: 'pro', name: 'Professionnel', primary: '#1F2937', secondary: '#D97706', accent: '#F59E0B' },
      { id: 'nature', name: 'Naturel', primary: '#365314', secondary: '#84CC16', accent: '#A3E635' },
    ],
  },
  photographe: {
    sectorId: 'photographe',
    recommendedTemplates: ['visual', 'minimal', 'creative'],
    defaultTemplate: 'visual',
    colorSchemes: [
      { id: 'dark', name: 'Sombre', primary: '#111827', secondary: '#FFFFFF', accent: '#7C3AED' },
      { id: 'clean', name: 'Épuré', primary: '#FFFFFF', secondary: '#111827', accent: '#3B82F6' },
    ],
  },
  agent_immobilier: {
    sectorId: 'agent_immobilier',
    recommendedTemplates: ['executive', 'modern', 'classic'],
    defaultTemplate: 'executive',
    colorSchemes: [
      { id: 'trust', name: 'Confiance', primary: '#1E3A5F', secondary: '#059669', accent: '#10B981' },
      { id: 'luxury', name: 'Premium', primary: '#1F2937', secondary: '#D4AF37', accent: '#F59E0B' },
    ],
  },
  coach_formateur: {
    sectorId: 'coach_formateur',
    recommendedTemplates: ['modern', 'creative', 'executive'],
    defaultTemplate: 'modern',
    colorSchemes: [
      { id: 'energy', name: 'Dynamique', primary: '#DC2626', secondary: '#F59E0B', accent: '#FBBF24' },
      { id: 'zen', name: 'Sérénité', primary: '#0D9488', secondary: '#2DD4BF', accent: '#5EEAD4' },
    ],
  },
  architecte_interieur: {
    sectorId: 'architecte_interieur',
    recommendedTemplates: ['visual', 'minimal', 'creative'],
    defaultTemplate: 'minimal',
    colorSchemes: [
      { id: 'minimal', name: 'Minimaliste', primary: '#FFFFFF', secondary: '#1F2937', accent: '#0891B2' },
      { id: 'warm', name: 'Chaleureux', primary: '#FEF3C7', secondary: '#92400E', accent: '#D97706' },
    ],
  },
  coiffeur_esthetique: {
    sectorId: 'coiffeur_esthetique',
    recommendedTemplates: ['modern', 'creative', 'visual'],
    defaultTemplate: 'modern',
    colorSchemes: [
      { id: 'glam', name: 'Glamour', primary: '#831843', secondary: '#EC4899', accent: '#F472B6' },
      { id: 'natural', name: 'Naturel', primary: '#ECFCCB', secondary: '#365314', accent: '#84CC16' },
    ],
  },
  cuisinier_traiteur: {
    sectorId: 'cuisinier_traiteur',
    recommendedTemplates: ['visual', 'classic', 'creative'],
    defaultTemplate: 'visual',
    colorSchemes: [
      { id: 'gourmet', name: 'Gastronomique', primary: '#1F2937', secondary: '#B45309', accent: '#F59E0B' },
      { id: 'fresh', name: 'Fraîcheur', primary: '#ECFDF5', secondary: '#047857', accent: '#10B981' },
    ],
  },
};

// ============================================================
// HELPERS
// ============================================================

/**
 * Récupère la config prompts pour un secteur
 */
export function getSectorPrompts(sectorId: string): SectorPromptConfig | undefined {
  return SECTOR_PROMPTS[sectorId];
}

/**
 * Récupère la config templates pour un secteur
 */
export function getSectorTemplates(sectorId: string): SectorTemplateConfig | undefined {
  return SECTOR_TEMPLATES[sectorId];
}

/**
 * Génère le prompt système pour le classificateur IA
 */
export function buildClassifierPrompt(sectorId: string): string {
  const config = SECTOR_PROMPTS[sectorId];
  if (!config) {
    return `Analyse cette image et détermine sa pertinence pour un portfolio professionnel.`;
  }

  return `${config.classifierSystemPrompt}

Exemples de descriptions attendues :
${config.classifierExamples.map((ex, i) => `${i + 1}. ${ex}`).join('\n')}

Mots-clés de haute pertinence : ${config.highRelevanceKeywords.join(', ')}
Mots-clés de basse pertinence : ${config.lowRelevanceKeywords.join(', ')}`;
}

/**
 * Génère le prompt système pour le narrateur IA
 */
export function buildNarratorPrompt(sectorId: string): string {
  const config = SECTOR_PROMPTS[sectorId];
  if (!config) {
    return `Génère un titre et une description professionnels pour ce projet.`;
  }

  return `Tu rédiges le contenu d'un portfolio professionnel.

TONE OF VOICE :
${config.narratorToneOfVoice}

STYLE DES TITRES :
${config.narratorTitleStyle}

STYLE DES DESCRIPTIONS :
${config.narratorDescriptionStyle}

Génère un titre accrocheur et une description engageante pour ce projet.`;
}
