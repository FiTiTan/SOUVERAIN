/**
 * SOUVERAIN - GROQ Enrichment Service (Sequenced) - V4 FINAL
 * 
 * Structure validée :
 * - heroSubtitle : 15-30 mots
 * - aboutText : 80-120 mots
 * - valueProp : 20-30 mots
 * - Service : 30-50 mots chacun
 * - Projet : 60-80 mots chacun (synthétique mais substantiel)
 * 
 * Ton : 100% impersonnel (freelances, agences, boutiques, lieux)
 */

import { detectAndAnonymize, deanonymize } from './anonymizationService';
import { enrichServicesWithIcons } from '../utils/fallbackIcons';
import type { RawPortfolioData, EnrichedPortfolioData } from './groqEnrichmentService';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// ============================================================
// GUIDELINES GLOBALES
// ============================================================

const TONE_GUIDELINES = `
TON IMPERSONNEL OBLIGATOIRE :
- JAMAIS de "je", "nous", "notre", "mon", "mes"
- Formulations : "Conception de...", "Spécialisé dans...", "Une approche..."
- Fonctionne pour : freelances, agences, boutiques, restaurants, entreprises
- Factuel, professionnel, orienté bénéfice client

INTERDICTIONS :
- Pas de clichés : "passionné", "innovant", "sur-mesure", "unique"
- Pas de superlatifs sans preuve : "le meilleur", "expert reconnu"
- Pas de phrases creuses : "solutions de qualité", "accompagnement personnalisé"
`;

const PLACEHOLDER_RULES = `
PLACEHOLDERS - RÈGLES CRITIQUES :
- Les tokens [PERSON_1], [COMPANY_1], [LOCATION_1] sont des données anonymisées
- GARDE-LES EXACTEMENT tels quels, ils seront remplacés automatiquement
- N'invente JAMAIS de nouveaux placeholders
`;

// ============================================================
// API
// ============================================================

async function getGroqApiKey(): Promise<string> {
  try {
    // @ts-ignore
    const result = await window.electron.groq.getApiKey();
    if (!result.success || !result.key) {
      throw new Error('API key not available');
    }
    return result.key;
  } catch (error) {
    console.error('[GROQ] Failed to get API key:', error);
    throw new Error('GROQ API key not configured');
  }
}

async function callGroq(systemPrompt: string, userPrompt: string, maxTokens: number = 1500): Promise<any> {
  const apiKey = await getGroqApiKey();
  
  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.5,
      max_tokens: maxTokens,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[GroqSequenced] API error:', errorText);
    throw new Error(`GROQ API error: ${response.status}`);
  }

  const result = await response.json();
  let content = result.choices[0].message.content;
  
  content = content.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim();
  
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    content = jsonMatch[0];
  }
  
  try {
    return JSON.parse(content);
  } catch (parseError) {
    console.error('[GroqSequenced] Failed to parse JSON:', content.substring(0, 200));
    throw new Error(`Invalid JSON response: ${parseError.message}`);
  }
}

// ============================================================
// UTILITAIRES
// ============================================================

function cleanSvgQuotes(svg: string): string {
  if (!svg) return svg;
  return svg.replace(/(\w+)='([^']*)'/g, '$1="$2"');
}

function cleanOrphanPlaceholders(text: string): string {
  if (!text) return text;
  return text
    .replace(/\s*\[PERSON_\d+\]\s*/g, ' ')
    .replace(/\s*\[COMPANY_\d+\]\s*/g, ' ')
    .replace(/\s*\[LOCATION_\d+\]\s*/g, ' ')
    .replace(/\s*\[EMAIL_\d+\]\s*/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function countWords(text: string): number {
  if (!text) return 0;
  return text.split(/\s+/).filter(w => w.length > 0).length;
}

// ============================================================
// ÉTAPE 1 : HERO + ABOUT
// ============================================================

async function enrichHeroAndAbout(data: RawPortfolioData): Promise<any> {
  const systemPrompt = `Tu es un copywriter expert pour portfolios professionnels haut de gamme.

${TONE_GUIDELINES}

${PLACEHOLDER_RULES}

SECTIONS À GÉNÉRER :

1. heroTitle : COPIE EXACTE du nom fourni, aucune modification
2. heroSubtitle (15-30 mots) : Accroche percutante qui résume l'expertise et donne envie
3. heroEyebrow (2-4 mots) : Rôle ou statut (ex: "Freelance", "Studio créatif", "Restaurant")
4. heroCta (2-4 mots) : Call-to-action (ex: "Découvrir les projets", "Voir la carte")
5. aboutText (80-120 mots) : Texte de présentation qui crée la confiance

STRUCTURE aboutText :
- Phrase 1-2 : Positionnement et expertise
- Phrase 3 : Mention de projets/réalisations concrets (utilise le contexte fourni)
- Phrase 4 : Approche ou méthodologie
- Phrase 5 : Bénéfice client

6. valueProp (20-30 mots) : La promesse client en 1-2 phrases. Répond à "Qu'est-ce que j'y gagne ?"

Réponds UNIQUEMENT en JSON valide :
{"heroTitle","heroSubtitle","heroEyebrow","heroCta","aboutText","valueProp"}`;

  const projectsContext = data.projects?.map(p => 
    `- ${p.title}: ${(p.description || '').substring(0, 400)}`
  ).join('\n') || 'Aucun projet';

  const userPrompt = `PROFIL :
- Nom (à copier tel quel) : ${data.name}
- Type : ${data.profileType}
- Tagline : ${data.tagline || 'À créer'}
- Services : ${data.services?.join(', ') || 'Non spécifiés'}

CONTEXTE PROJETS (utilise pour enrichir aboutText) :
${projectsContext}

RAPPEL LONGUEURS :
- heroSubtitle : 15-30 mots
- aboutText : 80-120 mots (5 phrases)
- valueProp : 20-30 mots`;

  console.log('[GroqSequenced] Step 1/3: Enriching hero & about...');
  return await callGroq(systemPrompt, userPrompt, 1200);
}

// ============================================================
// ÉTAPE 2 : SERVICES
// ============================================================

async function enrichServices(data: RawPortfolioData): Promise<any[]> {
  if (!data.services || data.services.length === 0) {
    return [];
  }

  const systemPrompt = `Tu es un copywriter expert pour portfolios professionnels.

${TONE_GUIDELINES}

SECTION SERVICES :

Objectif : Clarifier l'offre en quelques mots percutants

Contraintes par service :
- title : Nom du service (garder celui fourni ou améliorer légèrement)
- description : 30-50 mots (2-3 phrases max)
- icon : SVG minimaliste 48x48

STRUCTURE description :
- Phrase 1 : Ce que c'est concrètement
- Phrase 2 : Le bénéfice client direct

INTERDICTIONS ABSOLUES :
- JAMAIS de noms de personnes
- JAMAIS de placeholders [PERSON_X], [COMPANY_X]
- JAMAIS de "je", "nous", "notre"

EXEMPLES BONS :
✅ "Conception de sites web optimisés pour la conversion. Navigation fluide et design moderne qui transforment les visiteurs en clients."
✅ "Développement d'applications mobiles natives. Des apps performantes qui répondent aux attentes des utilisateurs exigeants."

EXEMPLES MAUVAIS :
❌ "Je crée des sites web pour mes clients..."
❌ "Notre expertise en développement..."
❌ "Solutions innovantes et sur-mesure..."

Réponds en JSON : {"services": [{"title","description","icon"}]}
icon = <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2">...</svg>`;

  const userPrompt = `SERVICES À ENRICHIR :
${data.services.map((s, i) => `${i + 1}. ${s}`).join('\n')}

TYPE DE PROFIL : ${data.profileType}

RAPPEL : 30-50 mots par description, ton impersonnel, aucun placeholder`;

  console.log('[GroqSequenced] Step 2/3: Enriching services...');
  const result = await callGroq(systemPrompt, userPrompt, 1500);
  
  if (result.services) {
    result.services = result.services.map((service: any) => ({
      ...service,
      icon: service.icon ? cleanSvgQuotes(service.icon) : null,
      description: cleanOrphanPlaceholders(service.description),
    }));
  }
  
  return result.services || [];
}

// ============================================================
// ÉTAPE 3 : PROJETS
// ============================================================

async function enrichProjects(data: RawPortfolioData): Promise<any[]> {
  if (!data.projects || data.projects.length === 0) {
    return [];
  }

  console.log('[GroqSequenced] Step 3/3: Enriching projects...');
  
  console.log('[GroqSequenced] enrichProjects - input:', data.projects.map(p => ({
    title: p.title,
    descLength: p.description?.length || 0,
  })));

  const systemPrompt = `Tu es un copywriter expert pour portfolios professionnels.

${TONE_GUIDELINES}

${PLACEHOLDER_RULES}

SECTION PROJETS/RÉALISATIONS :

Objectif : Prouver l'expertise par des exemples concrets et donner envie d'en savoir plus

Contraintes par projet :
- title : Nom du projet (garder celui fourni)
- description : 60-80 mots (4-6 lignes max) - SYNTHÉTIQUE mais SUBSTANTIEL
- category : Type de projet (Application Mobile, Site Web, Branding, etc.)

STRUCTURE description (4 phrases) :
1. CONTEXTE : Quel problème ou besoin ? (1 phrase)
2. SOLUTION : Quelle approche ou réalisation ? (1-2 phrases)
3. RÉSULTAT : Quel impact ou bénéfice ? (1 phrase)
4. POINT NOTABLE (optionnel) : Techno, chiffre clé, innovation

CE QU'IL FAUT EXTRAIRE du contenu source :
- Les enjeux business ou humains
- Les chiffres clés s'il y en a
- Les technologies ou méthodes utilisées
- Les résultats ou impacts

EXEMPLE BON (72 mots) :
"Réponse au défi de maintenir une routine sportive sur le long terme. L'application s'inspire des mécaniques de progression des jeux RPG pour transformer l'effort physique en expérience engageante. Le système utilise le MET (Équivalent Métabolique) pour quantifier équitablement tout type d'activité. Objectif : rendre l'exercice addictif et créer des habitudes durables chez les utilisateurs."

EXEMPLE MAUVAIS :
"Une application innovante qui révolutionne le fitness avec une approche unique..." (trop vague, pas de substance)

Réponds en JSON : {"projects": [{"title","description","category"}]}`;

  const batchSize = 2;
  const enrichedProjects: any[] = [];

  for (let i = 0; i < data.projects.length; i += batchSize) {
    const batch = data.projects.slice(i, i + batchSize);
    
    const projectsDetails = batch.map(p => {
      const desc = p.description || '';
      // 2500 chars pour avoir assez de contexte
      const truncatedDesc = desc.length > 2500 
        ? desc.substring(0, 2500) + '...'
        : desc;
      
      return `
===== PROJET : ${p.title} =====
Catégorie actuelle : ${p.category || 'À déterminer'}

CONTENU SOURCE À SYNTHÉTISER :
${truncatedDesc || 'Pas de contenu - génère une description générique'}
`;
    }).join('\n');

    const userPrompt = `PROJETS À ENRICHIR :

${projectsDetails}

RAPPELS :
- 60-80 mots par description (4-6 lignes)
- Extraire les ENJEUX et ÉLÉMENTS CLÉS
- Rester SYNTHÉTIQUE mais SUBSTANTIEL
- Catégorie : Application Mobile, Site Web, Branding, Business Plan, etc.`;

    try {
      const result = await callGroq(systemPrompt, userPrompt, 1500);
      
      if (result.projects && Array.isArray(result.projects)) {
        const projectsWithDefaults = result.projects.map((p: any, idx: number) => ({
          ...p,
          category: p.category || batch[idx]?.category || 'Projet',
        }));
        enrichedProjects.push(...projectsWithDefaults);
      } else {
        enrichedProjects.push(...batch.map(p => ({
          title: p.title,
          description: p.description?.substring(0, 300) || '',
          category: p.category || 'Projet'
        })));
      }
    } catch (error) {
      console.warn(`[GroqSequenced] Batch ${Math.floor(i / batchSize) + 1} failed:`, error);
      enrichedProjects.push(...batch.map(p => ({
        title: p.title,
        description: p.description?.substring(0, 300) || '',
        category: p.category || 'Projet'
      })));
    }
  }
  
  return enrichedProjects;
}

// ============================================================
// SERVICE PRINCIPAL
// ============================================================

export async function enrichPortfolioDataSequenced(
  rawData: RawPortfolioData,
  portfolioId: string
): Promise<{ success: boolean; data?: EnrichedPortfolioData; error?: string }> {
  
  try {
    console.log('[GroqSequenced] Starting sequenced enrichment V4...');

    // Anonymisation
    const dataString = JSON.stringify(rawData);
    const anonymizedResult = await detectAndAnonymize(dataString, portfolioId);
    const anonymizedData: RawPortfolioData = JSON.parse(anonymizedResult.anonymizedText);

    // Étape 1 : Hero + About
    const heroAbout = await enrichHeroAndAbout(anonymizedData);

    // Étape 2 & 3 : Services + Projects (parallèle)
    const [enrichedServices, enrichedProjects] = await Promise.all([
      enrichServices(anonymizedData).catch(err => {
        console.warn('[GroqSequenced] Services failed:', err);
        return anonymizedData.services?.map(s => ({ title: s, description: '', icon: '' })) || [];
      }),
      enrichProjects(anonymizedData).catch(err => {
        console.warn('[GroqSequenced] Projects failed:', err);
        return anonymizedData.projects || [];
      }),
    ]);

    // Icônes fallback
    const servicesWithIcons = enrichServicesWithIcons(enrichedServices);

    // Fusion
    const merged: EnrichedPortfolioData = {
      ...heroAbout,
      heroTitle: anonymizedData.name,
      services: servicesWithIcons,
      projects: enrichedProjects.map((p: any, i: number) => ({
        ...p,
        category: p.category || 'Projet',
        image: rawData.projects?.[i]?.image,
        link: rawData.projects?.[i]?.link,
      })),
      testimonials: rawData.testimonials,
      email: rawData.email,
      phone: rawData.phone,
      address: rawData.address,
      openingHours: rawData.openingHours,
      socialLinks: rawData.socialLinks,
      socialIsMain: rawData.socialIsMain,
      aboutImage: rawData.aboutImage,
    };

    // Dé-anonymisation
    console.log('[GroqSequenced] De-anonymizing...');
    const finalDataString = JSON.stringify(merged);
    const deanonymizedString = deanonymize(finalDataString, anonymizedResult.mappings);
    const finalData: EnrichedPortfolioData = JSON.parse(deanonymizedString);

    // Stats de validation
    const stats = {
      heroSubtitleWords: countWords(finalData.heroSubtitle),
      aboutTextWords: countWords(finalData.aboutText),
      valuePropWords: countWords(finalData.valueProp),
      servicesCount: finalData.services?.length || 0,
      avgServiceWords: Math.round((finalData.services?.reduce((acc, s) => acc + countWords(s.description), 0) || 0) / (finalData.services?.length || 1)),
      projectsCount: finalData.projects?.length || 0,
      avgProjectWords: Math.round((finalData.projects?.reduce((acc, p) => acc + countWords(p.description), 0) || 0) / (finalData.projects?.length || 1)),
    };
    
    console.log('[GroqSequenced] ✓ Complete. Stats:', stats);
    
    // Warnings si hors limites
    if (stats.heroSubtitleWords < 15 || stats.heroSubtitleWords > 30) {
      console.warn(`[GroqSequenced] ⚠️ heroSubtitle: ${stats.heroSubtitleWords} mots (attendu: 15-30)`);
    }
    if (stats.aboutTextWords < 80 || stats.aboutTextWords > 120) {
      console.warn(`[GroqSequenced] ⚠️ aboutText: ${stats.aboutTextWords} mots (attendu: 80-120)`);
    }
    if (stats.avgServiceWords < 30 || stats.avgServiceWords > 50) {
      console.warn(`[GroqSequenced] ⚠️ services avg: ${stats.avgServiceWords} mots (attendu: 30-50)`);
    }
    if (stats.avgProjectWords < 60 || stats.avgProjectWords > 80) {
      console.warn(`[GroqSequenced] ⚠️ projects avg: ${stats.avgProjectWords} mots (attendu: 60-80)`);
    }
    
    return { success: true, data: finalData };

  } catch (error: any) {
    console.error('[GroqSequenced] Error:', error);
    
    // Fallback
    const fallbackData: EnrichedPortfolioData = {
      heroTitle: rawData.name,
      heroSubtitle: rawData.tagline,
      heroEyebrow: rawData.profileType === 'freelance' ? 'Freelance' : '',
      heroCta: 'Me contacter',
      aboutText: rawData.valueProp || rawData.tagline,
      valueProp: rawData.valueProp,
      services: rawData.services?.map(s => ({ title: s, description: '', icon: '' })) || [],
      projects: rawData.projects?.map(p => ({ ...p, category: p.category || 'Projet' })) || [],
      testimonials: rawData.testimonials || [],
      email: rawData.email,
      phone: rawData.phone,
      address: rawData.address,
      openingHours: rawData.openingHours,
      socialLinks: rawData.socialLinks,
      socialIsMain: rawData.socialIsMain,
      aboutImage: rawData.aboutImage,
    };
    
    return { success: false, data: fallbackData, error: error.message };
  }
}
