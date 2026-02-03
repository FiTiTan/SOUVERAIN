/**
 * SOUVERAIN - AI Enrichment Service V4
 * Génération séquencée par section avec positionnement (valueProp + expertises)
 * 
 * Stratégie :
 * 1. Hero + About → basé sur valueProp
 * 2. Services → basé sur expertises (ou déduit des réalisations si vide)
 * 3. Projets → descriptions enrichies avec référence au positionnement
 */

import type { PortfolioFormDataV2 } from '../components/portfolio/types';
import { anonymizeObject, deanonymizeObject, type EntityMap } from './anonymizationServiceV3';
import { enrichServicesWithIcons } from '../utils/fallbackIcons';

// ============================================================
// CONFIGURATION
// ============================================================

const DEEPSEEK_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_MODEL = 'deepseek-chat';

async function getDeepSeekKey(): Promise<string> {
  try {
    // @ts-ignore
    const result = await window.electron.deepseek.getApiKey();
    if (!result.success || !result.key) {
      throw new Error('No DeepSeek API key configured');
    }
    return result.key;
  } catch (error) {
    throw new Error('DeepSeek API key not available');
  }
}

async function callAI(systemPrompt: string, userPrompt: string, maxTokens: number = 1500): Promise<any> {
  const apiKey = await getDeepSeekKey();
  
  const response = await fetch(DEEPSEEK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: DEEPSEEK_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.4,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  let content = result.choices[0].message.content;

  // Nettoyer les backticks si présents
  content = content.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim();

  return JSON.parse(content);
}

// ============================================================
// ENRICHISSEMENT SÉQUENCÉ
// ============================================================

interface PositioningData {
  valueProp: string;
  expertises: string[];
}

interface RawPortfolioData {
  name: string;
  profileType: string;
  valueProp: string;
  expertises: string[];
  realisations?: Array<{
    title: string;
    description: string;
    extractedContent?: string;
  }>;
}

function cleanSvgQuotes(svg: string): string {
  if (!svg) return '';
  return svg.replace(/'/g, '"');
}

function cleanOrphanPlaceholders(text: string): string {
  if (!text) return '';
  // Supprimer les placeholders isolés qui n'ont pas été désanonymisés
  return text.replace(/\[PERSON_\d+\]|\[COMPANY_\d+\]/g, '');
}

/**
 * 1. HERO + ABOUT
 */
async function enrichHeroAndAbout(data: RawPortfolioData): Promise<any> {
  const positioning = {
    valueProp: data.valueProp || '',
    expertises: data.expertises?.filter(e => e.trim() !== '') || [],
  };

  const systemPrompt = `Tu es un copywriter expert pour portfolios professionnels haut de gamme.

TON IMPERSONNEL OBLIGATOIRE :
- JAMAIS de "je", "nous", "notre", "mon", "mes"
- Formulations : "Conception de...", "Spécialisé dans...", "Une approche..."
- Factuel, professionnel, orienté bénéfice client

PLACEHOLDERS :
- Les tokens [PERSON_1], [COMPANY_1] sont anonymisés, garde-les tels quels

SECTIONS À GÉNÉRER :

1. heroTitle : COPIE EXACTE du nom fourni
2. heroSubtitle (15-30 mots) : Accroche basée sur la PROPOSITION DE VALEUR fournie
3. heroEyebrow (2-4 mots) : Rôle ou statut
4. heroCta (2-4 mots) : Call-to-action
5. aboutText (60-80 mots, 3-4 phrases) :
   - Phrase 1 : Positionnement basé sur la proposition de valeur
   - Phrase 2 : Mention des expertises clés
   - Phrase 3 : Référence à une réalisation concrète
   - Phrase 4 : Bénéfice client
6. valueProp (20-30 mots) : Reformulation de la proposition de valeur

IMPORTANT :
- Utilise la PROPOSITION DE VALEUR fournie comme fil rouge
- Les EXPERTISES doivent transparaître dans le texte
- Reste cohérent avec les RÉALISATIONS listées

Réponds UNIQUEMENT en JSON valide :
{"heroTitle","heroSubtitle","heroEyebrow","heroCta","aboutText","valueProp"}`;

  const projectsContext = data.realisations?.map(p => 
    `- ${p.title}: ${(p.description || '').substring(0, 300)}`
  ).join('\n') || 'Aucun projet';

  const userPrompt = `PROFIL :
- Nom : ${data.name}
- Type : ${data.profileType}

POSITIONNEMENT (À UTILISER COMME FIL ROUGE) :
- Proposition de valeur : "${positioning.valueProp || 'À déduire des réalisations'}"
- Expertises clés : ${positioning.expertises.length > 0 ? positioning.expertises.join(', ') : 'À déduire des réalisations'}

RÉALISATIONS (contexte) :
${projectsContext}

RAPPELS :
- heroSubtitle : 15-30 mots, basé sur la proposition de valeur
- aboutText : 60-80 mots, mentionne les expertises
- Ton impersonnel`;

  return await callAI(systemPrompt, userPrompt, 1200);
}

/**
 * 2. SERVICES (basé sur expertises)
 */
async function enrichServices(data: RawPortfolioData): Promise<any> {
  const expertises = data.expertises?.filter(e => e.trim() !== '') || [];
  const hasExpertises = expertises.length > 0;

  const systemPrompt = `Tu es un copywriter expert pour portfolios professionnels.

TON IMPERSONNEL OBLIGATOIRE :
- JAMAIS de "je", "nous", "notre"
- Formulations : "Conception de...", "Développement de...", "Accompagnement dans..."
- Factuel, professionnel, orienté bénéfice client

GÉNÉRATION DE SERVICES :

${hasExpertises ? `
EXPERTISES FOURNIES PAR L'UTILISATEUR :
${expertises.map((e, i) => `${i + 1}. ${e}`).join('\n')}

RÈGLE : Génère EXACTEMENT 3 services basés sur ces expertises.
Chaque expertise devient un service avec :
- Un titre professionnel (peut reformuler l'expertise)
- Une description de 35-45 mots
` : `
AUCUNE EXPERTISE FOURNIE.
RÈGLE : Déduis 3 services pertinents basés sur les réalisations et le type de profil.
`}

STRUCTURE PAR SERVICE :
- title : Nom du service (professionnel)
- description : 35-45 mots (2-3 phrases)
  - Phrase 1 : Ce que c'est concrètement
  - Phrase 2 : Le bénéfice client direct
- icon : SVG minimaliste 48x48

LABEL DE SECTION :
Propose aussi un label adapté au profil :
- tech/freelance → "Services"
- artisan → "Savoir-faire"
- food/restaurant → "Spécialités"
- retail/boutique → "Offres"
- service → "Prestations"
- default → "Expertises"

INTERDICTIONS :
- Pas de noms de personnes
- Pas de placeholders [PERSON_X]
- Pas de clichés ("innovant", "sur-mesure", "passionné")

Réponds en JSON :
{
  "servicesLabel": "Services",
  "services": [
    {"title", "description", "icon"}
  ]
}`;

  const projectsContext = data.realisations?.map(p => 
    `- ${p.title}: ${(p.description || '').substring(0, 200)}`
  ).join('\n') || 'Aucun projet';

  const userPrompt = `TYPE DE PROFIL : ${data.profileType}

${hasExpertises ? `EXPERTISES À TRANSFORMER EN SERVICES :
${expertises.map((e, i) => `${i + 1}. ${e}`).join('\n')}` : `RÉALISATIONS (pour déduire les services) :
${projectsContext}`}

RAPPELS :
- EXACTEMENT 3 services
- 35-45 mots par description
- Ton impersonnel
- Label de section adapté au profil`;

  const result = await callAI(systemPrompt, userPrompt, 1500);
  
  // Nettoyer les SVG et descriptions
  if (result.services) {
    result.services = result.services.map((service: any) => ({
      ...service,
      icon: service.icon ? cleanSvgQuotes(service.icon) : null,
      description: cleanOrphanPlaceholders(service.description),
    }));
  }
  
  return result;
}

/**
 * 3. PROJETS (enrichissement des descriptions)
 */
async function enrichProjects(data: RawPortfolioData): Promise<any[]> {
  if (!data.realisations || data.realisations.length === 0) {
    return [];
  }

  const positioning = {
    valueProp: data.valueProp || '',
    expertises: data.expertises?.filter(e => e.trim() !== '') || [],
  };

  const systemPrompt = `Tu es un copywriter expert pour portfolios professionnels.

TON IMPERSONNEL OBLIGATOIRE :
- Formulations factuelles et orientées résultat

CONTEXTE POSITIONNEMENT :
- Proposition de valeur : "${positioning.valueProp}"
- Expertises : ${positioning.expertises.join(', ') || 'Non spécifiées'}

RÈGLE : Les descriptions de projets doivent RENFORCER le positionnement.
Mets en avant les aspects qui correspondent aux expertises.

STRUCTURE PAR PROJET (60-80 mots, 4 phrases) :
1. CONTEXTE : Quel problème ou besoin ? (1 phrase)
2. SOLUTION : Quelle approche ou réalisation ? (1-2 phrases)
3. RÉSULTAT : Quel impact ou bénéfice ? (1 phrase)
4. POINT NOTABLE (optionnel) : Techno, chiffre clé

CATÉGORIES possibles :
Application Mobile, Site Web, Branding, Business Plan, Design, E-commerce, etc.

Réponds en JSON : {"projects": [{"title","description","category"}]}`;

  // Traiter par batch de 3 projets pour limiter la taille du prompt
  const projects = data.realisations;
  const batchSize = 3;
  const enrichedProjects: any[] = [];

  for (let i = 0; i < projects.length; i += batchSize) {
    const batch = projects.slice(i, i + batchSize);
    
    const projectsPrompt = batch.map((p, idx) => {
      const extractedText = p.extractedContent ? `\nCONTENU EXTRAIT:\n${p.extractedContent.substring(0, 1500)}` : '';
      return `PROJET ${idx + 1}:
Titre: ${p.title}
Description initiale: ${p.description || 'Non fournie'}${extractedText}`;
    }).join('\n\n');

    const userPrompt = `${projectsPrompt}

RAPPELS :
- 60-80 mots par description
- Renforcer le positionnement : ${positioning.valueProp}
- Ton impersonnel et factuel`;

    try {
      const result = await callAI(systemPrompt, userPrompt, 1200);
      if (result.projects && Array.isArray(result.projects)) {
        enrichedProjects.push(...result.projects.map((p: any) => ({
          ...p,
          description: cleanOrphanPlaceholders(p.description),
        })));
      }
    } catch (error) {
      console.error('[EnrichProjects] Batch error:', error);
      // Fallback : garder les projets originaux
      enrichedProjects.push(...batch.map(p => ({
        title: p.title,
        description: p.description || '',
        category: '',
      })));
    }
  }

  return enrichedProjects;
}

/**
 * ORCHESTRATEUR PRINCIPAL
 */
export async function enrichPortfolioDataSequenced(
  rawData: RawPortfolioData,
  portfolioId: string
): Promise<{ success: boolean; data?: any; error?: string }> {
  
  try {
    console.log('[AI V4] Starting sequenced enrichment...');
    console.log('[AI V4] Positioning:', {
      valueProp: rawData.valueProp,
      expertises: rawData.expertises,
    });

    // 1. Anonymiser les données
    const { anonymized, entityMap } = await anonymizeObject(rawData);
    
    // 2. Enrichir Hero + About
    console.log('[AI V4] Enriching Hero + About...');
    const heroAbout = await enrichHeroAndAbout(anonymized);
    
    // 3. Enrichir Services
    console.log('[AI V4] Enriching Services...');
    const servicesData = await enrichServices(anonymized);
    
    // 4. Enrichir Projets
    console.log('[AI V4] Enriching Projects...');
    const projects = await enrichProjects(anonymized);
    
    // 5. Désanonymiser le tout
    const enrichedAnonymized = {
      ...heroAbout,
      servicesLabel: servicesData.servicesLabel,
      services: servicesData.services,
      projects,
    };
    
    const enrichedData = deanonymizeObject(enrichedAnonymized, entityMap);
    
    // 6. Enrichir les services avec icônes fallback si nécessaire
    if (enrichedData.services) {
      enrichedData.services = enrichServicesWithIcons(enrichedData.services);
    }
    
    console.log('[AI V4] ✓ Enrichment complete');
    
    return { success: true, data: enrichedData };

  } catch (error: any) {
    console.error('[AI V4] Error:', error);
    return { success: false, error: error.message };
  }
}
