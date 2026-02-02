/**
 * SOUVERAIN - GROQ Enrichment Service (Sequenced)
 * Séquence les appels Groq en plusieurs étapes pour éviter dépassement tokens
 * Hero → Services → Projects
 */

import { detectAndAnonymize, deanonymize } from './anonymizationService';
import { enrichServicesWithIcons } from '../utils/fallbackIcons';
import type { RawPortfolioData, EnrichedPortfolioData } from './groqEnrichmentService';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

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

/**
 * Appel générique à Groq
 */
async function callGroq(systemPrompt: string, userPrompt: string, maxTokens: number = 1000): Promise<any> {
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
        { role: 'system', content: systemPrompt + '\n\nIMPORTANT: Réponds UNIQUEMENT avec du JSON valide, aucun texte avant ou après.' },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.4,
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
  
  // Nettoyer backticks markdown
  content = content.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim();
  
  // Extraire JSON si entouré de texte
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

/**
 * ÉTAPE 1 : Enrichir Hero + About + Value Prop
 */
async function enrichHeroAndAbout(data: RawPortfolioData): Promise<any> {
  const systemPrompt = `Expert copywriting. Génère hero section + about.
Retourne JSON : {"heroTitle","heroSubtitle","heroEyebrow","heroCta","aboutText","valueProp"}
heroTitle = EXACTEMENT le nom fourni, SANS modification ni ajout. Copie-colle strict.
heroSubtitle: reformuler la tagline de façon percutante (15-25 mots max).
heroEyebrow: rôle/statut court (ex: "Freelance", "Studio", "Designer").
heroCta: CTA action (ex: "Voir mes projets", "Me contacter").
aboutText: paragraphe à propos (40-60 mots), personnel et authentique.`;

  const userPrompt = `Nom: ${data.name}
Profil: ${data.profileType}
Tagline: ${data.tagline}
Value prop: ${data.valueProp || 'N/A'}

IMPORTANT: heroTitle doit être EXACTEMENT "${data.name}", rien d'autre.`;

  console.log('[GroqSequenced] Step 1/3: Enriching hero & about...');
  return await callGroq(systemPrompt, userPrompt, 800);
}

/**
 * ÉTAPE 2 : Enrichir Services
 */
async function enrichServices(data: RawPortfolioData): Promise<any[]> {
  if (!data.services || data.services.length === 0) {
    return [];
  }

  const systemPrompt = `Expert copywriting. Enrichis services.
Retourne objet JSON: {"services": [{"title","description","icon"}]}
description: 20-35 mots spécifiques.
icon: SVG <svg viewBox="0 0 48 48" stroke="currentColor"...> minimaliste (GUILLEMETS DOUBLES obligatoires).`;

  const userPrompt = `Services: ${data.services.join(', ')}
Profil: ${data.profileType}

Génère objet JSON avec clé "services" contenant array enrichi. SVG avec guillemets doubles UNIQUEMENT.`;

  console.log('[GroqSequenced] Step 2/3: Enriching services...');
  const result = await callGroq(systemPrompt, userPrompt, 1200);
  
  // Nettoyer les SVG : forcer guillemets doubles
  if (result.services) {
    result.services = result.services.map((service: any) => ({
      ...service,
      icon: service.icon ? cleanSvgQuotes(service.icon) : service.icon,
    }));
  }
  
  return result.services || [];
}

/**
 * Nettoie un SVG en forçant les guillemets doubles
 */
function cleanSvgQuotes(svg: string): string {
  if (!svg) return svg;
  // Remplacer les guillemets simples par des doubles dans les attributs SVG
  return svg.replace(/(\w+)='([^']*)'/g, '$1="$2"');
}

/**
 * ÉTAPE 3 : Enrichir Projects (par batch pour éviter 413)
 */
async function enrichProjects(data: RawPortfolioData): Promise<any[]> {
  if (!data.projects || data.projects.length === 0) {
    return [];
  }

  console.log('[GroqSequenced] Step 3/3: Enriching projects...');
  
  const systemPrompt = `Expert copywriting. Enrichis projets de manière CONCISE.
Retourne objet JSON: {"projects": [{"title","description","category"}]}
description: MAX 40 mots. Pitch court et impactant. PAS de détails exhaustifs.`;

  const batchSize = 2; // Traiter 2 projets à la fois max
  const enrichedProjects: any[] = [];

  for (let i = 0; i < data.projects.length; i += batchSize) {
    const batch = data.projects.slice(i, i + batchSize);
    const projectsSummary = batch.map(p => 
      `${p.title} (${p.category || 'N/A'}): ${(p.description || '').substring(0, 150)}`
    ).join(' | ');

    const userPrompt = `Projets: ${projectsSummary}

Génère objet JSON avec clé "projects" contenant array enrichi. Descriptions MAX 40 mots chacune.`;

    try {
      const result = await callGroq(systemPrompt, userPrompt, 600);
      enrichedProjects.push(...(result.projects || []));
    } catch (error) {
      console.warn(`[GroqSequenced] Batch ${i / batchSize + 1} failed, using raw data:`, error);
      enrichedProjects.push(...batch);
    }
  }
  
  return enrichedProjects;
}

/**
 * Service principal : Enrichissement séquencé
 */
export async function enrichPortfolioDataSequenced(
  rawData: RawPortfolioData,
  portfolioId: string
): Promise<{ success: boolean; data?: EnrichedPortfolioData; error?: string }> {
  
  try {
    console.log('[GroqSequenced] Starting sequenced enrichment...');

    // Anonymisation des données
    const dataString = JSON.stringify(rawData);
    const anonymizedResult = await detectAndAnonymize(dataString, portfolioId);
    const anonymizedData: RawPortfolioData = JSON.parse(anonymizedResult.anonymizedText);

    // ÉTAPE 1 : Hero + About (séquentiel)
    const heroAbout = await enrichHeroAndAbout(anonymizedData);

    // ÉTAPE 2 & 3 : Services + Projects (parallèle)
    const [enrichedServices, enrichedProjects] = await Promise.all([
      enrichServices(anonymizedData).catch(err => {
        console.warn('[GroqSequenced] Services enrichment failed, using fallback:', err);
        return anonymizedData.services?.map(s => ({ title: s, description: '' })) || [];
      }),
      enrichProjects(anonymizedData).catch(err => {
        console.warn('[GroqSequenced] Projects enrichment failed, using fallback:', err);
        return anonymizedData.projects || [];
      }),
    ]);

    // Enrichir icônes services avec fallback
    const servicesWithIcons = enrichServicesWithIcons(enrichedServices);

    // Fusionner les résultats
    const merged: EnrichedPortfolioData = {
      ...heroAbout,
      services: servicesWithIcons,
      projects: enrichedProjects.map((p: any, i: number) => ({
        ...p,
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

    console.log('[GroqSequenced] ✓ Sequenced enrichment complete');
    return { success: true, data: finalData };

  } catch (error: any) {
    console.error('[GroqSequenced] Error:', error);
    
    // Fallback basique
    console.warn('[GroqSequenced] Using fallback enrichment');
    const fallbackData: EnrichedPortfolioData = {
      heroTitle: rawData.name,
      heroSubtitle: rawData.tagline,
      heroEyebrow: rawData.profileType === 'freelance' ? 'Freelance' : '',
      heroCta: 'Me contacter',
      aboutText: rawData.valueProp || rawData.tagline,
      valueProp: rawData.valueProp,
      services: rawData.services?.map(s => ({
        title: s,
        description: '',
        icon: '',
      })) || [],
      projects: rawData.projects || [],
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
