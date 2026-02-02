/**
 * SOUVERAIN - GROQ Enrichment Service (Sequenced) - V2 ENRICHED
 * Séquence les appels Groq en plusieurs étapes pour éviter dépassement tokens
 * Hero → Services → Projects
 * 
 * V2: Prompts enrichis pour générer du contenu plus détaillé (~500-800 mots total)
 */

import { detectAndAnonymize, deanonymize } from './anonymizationService';
import { enrichServicesWithIcons } from '../utils/fallbackIcons';
import type { RawPortfolioData, EnrichedPortfolioData } from './groqEnrichmentService';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// ============================================================
// CONTENT QUALITY GUIDELINES
// ============================================================

const PLACEHOLDER_RULES = `
RÈGLES CRITIQUES POUR LES PLACEHOLDERS :
- Ne modifie JAMAIS les tokens entre crochets : [PERSON_1], [COMPANY_1], [LOCATION_1], [EMAIL_1], etc.
- Garde-les EXACTEMENT tels quels dans ta réponse
- Ils seront remplacés automatiquement après génération
- Si tu vois [PERSON_1], écris [PERSON_1] dans ta réponse, pas autre chose`;

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
        { role: 'system', content: systemPrompt + '\n\nIMPORTANT: Réponds UNIQUEMENT avec du JSON valide, aucun texte avant ou après.' },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.5, // Un peu plus de créativité
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
 * OBJECTIF : aboutText = 80-120 mots, valueProp = 30-50 mots
 */
async function enrichHeroAndAbout(data: RawPortfolioData): Promise<any> {
  const systemPrompt = `Tu es un expert en copywriting pour portfolios professionnels haut de gamme.
Tu crées du contenu RICHE, AUTHENTIQUE et DÉTAILLÉ.

${PLACEHOLDER_RULES}

LONGUEURS REQUISES :
- heroSubtitle : 15-25 mots, accrocheur et mémorable
- aboutText : 80-120 mots MINIMUM (4-5 phrases complètes)
- valueProp : 30-50 mots (2 phrases percutantes)

QUALITÉ REQUISE :
- Utilise les VRAIES informations fournies
- Sois spécifique, pas générique
- Évite les clichés ("passionné", "innovant", "solutions sur-mesure")
- Préfère des verbes d'action et des résultats concrets

Retourne JSON: {"heroTitle","heroSubtitle","heroEyebrow","heroCta","aboutText","valueProp"}`;

  // Extraire du contexte des projets si disponible
  const projectsContext = data.projects?.map(p => 
    `${p.title}: ${(p.description || '').substring(0, 500)}`
  ).join('\n') || '';

  const userPrompt = `INFORMATIONS DU PROFIL :
- Nom exact (à copier tel quel) : ${data.name}
- Type de profil : ${data.profileType}
- Tagline actuelle : ${data.tagline || 'À créer'}
- Proposition de valeur : ${data.valueProp || 'À créer à partir du contexte'}
- Services proposés : ${data.services?.join(', ') || 'Non spécifiés'}

CONTEXTE DES PROJETS (utilise ces infos pour enrichir le aboutText) :
${projectsContext || 'Aucun projet fourni'}

RÈGLES STRICTES :
1. heroTitle = EXACTEMENT "${data.name}" sans modification
2. aboutText doit faire AU MOINS 80 mots (4-5 phrases)
3. Utilise le contexte des projets pour rendre le texte spécifique et crédible
4. valueProp doit expliquer le bénéfice CLIENT concret`;

  console.log('[GroqSequenced] Step 1/3: Enriching hero & about...');
  return await callGroq(systemPrompt, userPrompt, 1200);
}

/**
 * ÉTAPE 2 : Enrichir Services
 * OBJECTIF : Chaque description = 40-60 mots
 */
async function enrichServices(data: RawPortfolioData): Promise<any[]> {
  if (!data.services || data.services.length === 0) {
    return [];
  }

  const systemPrompt = `Tu es un expert en copywriting pour portfolios professionnels.
Tu crées des descriptions de services DÉTAILLÉES et CONVAINCANTES.

${PLACEHOLDER_RULES}

LONGUEUR REQUISE PAR SERVICE :
- description : 40-60 mots MINIMUM (2-3 phrases complètes)

STRUCTURE DE CHAQUE DESCRIPTION :
1. Phrase 1 : CE QUE c'est concrètement
2. Phrase 2 : COMMENT ça fonctionne / la méthodologie
3. Phrase 3 : Le BÉNÉFICE client / résultat attendu

QUALITÉ :
- Verbes d'action (concevoir, optimiser, transformer, développer...)
- Résultats concrets quand possible (%, temps, impact)
- Vocabulaire adapté au secteur

Retourne: {"services": [{"title","description","icon"}]}
icon: SVG minimaliste <svg viewBox="0 0 48 48" stroke="currentColor"...> avec GUILLEMETS DOUBLES uniquement.`;

  // Contexte des projets pour adapter le ton
  const projectsContext = data.projects?.map(p => 
    `${p.title}: ${(p.description || '').substring(0, 300)}`
  ).join(' | ') || '';

  const userPrompt = `SERVICES À ENRICHIR :
${data.services.map((s, i) => `${i + 1}. ${s}`).join('\n')}

PROFIL : ${data.name} - ${data.profileType}

CONTEXTE (projets réalisés, utilise pour adapter le vocabulaire) :
${projectsContext || 'Aucun contexte'}

RÈGLES :
- Chaque description DOIT faire 40-60 mots (2-3 phrases)
- Pas de phrases creuses type "service de qualité" ou "expertise reconnue"
- SVG avec guillemets DOUBLES uniquement`;

  console.log('[GroqSequenced] Step 2/3: Enriching services...');
  const result = await callGroq(systemPrompt, userPrompt, 1500);
  
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
  return svg.replace(/(\w+)='([^']*)'/g, '$1="$2"');
}

/**
 * ÉTAPE 3 : Enrichir Projects (par batch)
 * OBJECTIF : Chaque description = 60-100 mots
 * 
 * C'EST ICI QUE LE CONTENU DU PDF DOIT ÊTRE EXPLOITÉ !
 */
async function enrichProjects(data: RawPortfolioData): Promise<any[]> {
  if (!data.projects || data.projects.length === 0) {
    return [];
  }

  console.log('[GroqSequenced] Step 3/3: Enriching projects...');
  
  // DEBUG LOG
  console.log('[GroqSequenced] enrichProjects - input projects:', data.projects.map(p => ({
    title: p.title,
    descLength: p.description?.length || 0,
    descPreview: p.description?.substring(0, 200)
  })));

  const systemPrompt = `Tu es un expert en copywriting pour portfolios professionnels.
Tu crées des descriptions de projets RICHES et DÉTAILLÉES basées sur le contenu fourni.

${PLACEHOLDER_RULES}

LONGUEUR REQUISE PAR PROJET :
- description : 60-100 mots MINIMUM (3-4 phrases complètes)

STRUCTURE DE CHAQUE DESCRIPTION :
1. Phrase 1 : Le CONTEXTE / problème à résoudre
2. Phrase 2 : La SOLUTION apportée / ce qui a été fait
3. Phrase 3 : Les RÉSULTATS / impact / bénéfices
4. Phrase 4 (optionnel) : Point technique notable ou apprentissage

QUALITÉ :
- Extrais les informations SPÉCIFIQUES du contenu fourni
- Cite des chiffres, métriques, technologies si disponibles
- Pas de descriptions génériques - chaque projet doit être unique
- Utilise le vocabulaire du domaine (tech, food, service, etc.)

Retourne: {"projects": [{"title","description","category"}]}`;

  const batchSize = 2;
  const enrichedProjects: any[] = [];

  for (let i = 0; i < data.projects.length; i += batchSize) {
    const batch = data.projects.slice(i, i + batchSize);
    
    // IMPORTANT : Passer BEAUCOUP plus de contenu (2000 chars au lieu de 150)
    const projectsDetails = batch.map(p => {
      const desc = p.description || '';
      // Prendre les 2000 premiers caractères pour avoir du contexte riche
      const truncatedDesc = desc.length > 2000 
        ? desc.substring(0, 2000) + '... [contenu tronqué]'
        : desc;
      
      return `
### PROJET : ${p.title}
Catégorie : ${p.category || 'Non spécifiée'}

CONTENU SOURCE (utilise ces informations) :
${truncatedDesc || 'Pas de description fournie'}
`;
    }).join('\n---\n');

    const userPrompt = `PROJETS À ENRICHIR :

${projectsDetails}

RÈGLES STRICTES :
1. Chaque description DOIT faire 60-100 mots (3-4 phrases)
2. Extrais les informations CLÉS du contenu source
3. Mentionne des éléments SPÉCIFIQUES (chiffres, technologies, résultats)
4. Ne génère PAS de contenu générique - base-toi sur le contenu fourni
5. Si le contenu parle d'un business plan, mentionne la vision, le marché cible, etc.
6. Garde les placeholders [PERSON_X], [COMPANY_X] tels quels`;

    try {
      const result = await callGroq(systemPrompt, userPrompt, 1200);
      
      if (result.projects && Array.isArray(result.projects)) {
        enrichedProjects.push(...result.projects);
      } else {
        console.warn(`[GroqSequenced] Batch ${i / batchSize + 1}: unexpected response format`);
        enrichedProjects.push(...batch.map(p => ({
          title: p.title,
          description: p.description?.substring(0, 200) || '',
          category: p.category
        })));
      }
    } catch (error) {
      console.warn(`[GroqSequenced] Batch ${i / batchSize + 1} failed, using raw data:`, error);
      enrichedProjects.push(...batch.map(p => ({
        title: p.title,
        description: p.description?.substring(0, 200) || '',
        category: p.category
      })));
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
      heroTitle: anonymizedData.name, // FORCER le nom original
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
    
    // LOG de validation du contenu
    console.log('[GroqSequenced] Content stats:', {
      aboutTextWords: finalData.aboutText?.split(/\s+/).length || 0,
      valuePropWords: finalData.valueProp?.split(/\s+/).length || 0,
      servicesCount: finalData.services?.length || 0,
      avgServiceDescWords: finalData.services?.reduce((acc, s) => acc + (s.description?.split(/\s+/).length || 0), 0) / (finalData.services?.length || 1),
      projectsCount: finalData.projects?.length || 0,
      avgProjectDescWords: finalData.projects?.reduce((acc, p) => acc + (p.description?.split(/\s+/).length || 0), 0) / (finalData.projects?.length || 1),
    });
    
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
