// SOUVERAIN - AI Enrichment Service V3 (Multi-provider)
// Enrichit avec TOUT le contexte : formulaire + PDF + LinkedIn + Notion
// Anonymise avant envoi, désanonymise après
//
// Providers supportés :
// - DeepSeek V3 (défaut) : Meilleure qualité
// - Groq Llama 3.3 (fallback)

import type { ExtractedData } from './extractionService';
import { anonymizeObject, deanonymizeObject, type EntityMap } from './anonymizationServiceV3';
import { enrichServicesWithIcons } from '../utils/fallbackIcons';

// ============================================================
// AI PROVIDERS CONFIGURATION
// ============================================================

const PROVIDERS = {
  deepseek: {
    name: 'DeepSeek V3',
    url: 'https://api.deepseek.com/v1/chat/completions',
    model: 'deepseek-chat',
    getKey: async () => {
      try {
        // @ts-ignore
        const result = await window.electron.deepseek.getApiKey();
        return result.success ? result.key : null;
      } catch {
        return null;
      }
    },
  },
  groq: {
    name: 'Groq Llama 3.3',
    url: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama-3.3-70b-versatile',
    getKey: async () => {
      try {
        // @ts-ignore
        const result = await window.electron.groq.getApiKey();
        return result.success ? result.key : null;
      } catch {
        return null;
      }
    },
  },
};

/**
 * Récupère le provider actif (DeepSeek prioritaire, fallback Groq)
 */
async function getActiveProvider(): Promise<{ name: string; url: string; model: string; key: string }> {
  // Essayer DeepSeek d'abord
  const deepseekKey = await PROVIDERS.deepseek.getKey();
  if (deepseekKey) {
    console.log('[AI EnrichmentV3] Using DeepSeek V3');
    return { ...PROVIDERS.deepseek, key: deepseekKey };
  }
  
  // Fallback Groq
  const groqKey = await PROVIDERS.groq.getKey();
  if (groqKey) {
    console.log('[AI EnrichmentV3] Using Groq (fallback)');
    return { ...PROVIDERS.groq, key: groqKey };
  }
  
  throw new Error('No AI provider configured. Please add DeepSeek or Groq API key.');
}

const SYSTEM_PROMPT = `Expert copywriting. Crée portfolio pro à partir des données fournies.

RÈGLES :
1. heroTitle = NOM EXACT (JAMAIS modifier)
2. Utilise données formulaire + PDF + LinkedIn + Notion
3. N'invente PAS (dates, chiffres, entreprises)
4. Enrichis textes fournis

LONGUEURS :
- heroSubtitle: 15-25 mots
- aboutText: 100-150 mots (synthèse parcours)
- services: 30-50 mots/service
- projets: 50-100 mots (basé BPL si dispo)

STYLE : Pro, verbes action, résultats concrets, pas clichés.

PLACEHOLDERS : Garde PERSON_001, COMPANY_001, etc. tels quels (anonymisation).`;

function buildUserPrompt(data: ExtractedData): string {
  const { formData, documents, linkedInData, notionData, projectContexts } = data;

  // Limiter la taille des contextes pour éviter dépassement tokens
  const projectsContext = projectContexts.map((pc, i) => {
    let context = `Projet ${i + 1}: ${pc.projectTitle}`;
    if (pc.documentContent) {
      context += `\nBPL: ${pc.documentContent.substring(0, 1200)}`;
    }
    return context;
  }).join('\n');

  const generalDocsContext = documents
    .filter(d => d.type === 'pdf' && d.content)
    .map(d => `Doc: ${d.filename}\n${d.content?.substring(0, 800)}`)
    .join('\n');

  return `FORMULAIRE:
Nom: ${formData.name}
Profil: ${formData.profileType}
Tagline: ${formData.tagline}
Services: ${formData.services?.join(', ')}
Value prop: ${formData.valueProp || 'N/A'}

PROJETS:
${projectsContext || 'Aucun'}

DOCS:
${generalDocsContext || 'Aucun'}

LINKEDIN:
${linkedInData ? linkedInData.substring(0, 1500) : 'N/A'}

NOTION:
${notionData ? notionData.substring(0, 1000) : 'N/A'}

---

Génère JSON:
{
  "heroTitle": "${formData.name}",
  "heroSubtitle": "...(15-25 mots)",
  "heroEyebrow": "...",
  "heroCta": "...",
  "aboutText": "...(100-150 mots, synthèse parcours)",
  "valueProp": "...(30-50 mots)",
  "services": [{"title":"...","description":"...(30-50 mots)"}],
  "projects": [{"title":"...","description":"...(50-100 mots, basé BPL)","category":"...","highlights":["...","...","..."]}],
  "testimonials": [{"text":"...","author":"...","role":"..."}]
}

Retourne UNIQUEMENT JSON. heroTitle = "${formData.name}" exact. Garde placeholders (PERSON_001, etc.).`;
}

/**
 * Enrichit les données avec AI multi-provider (avec anonymisation)
 */
export async function enrichPortfolioDataV3(
  extractedData: ExtractedData
): Promise<{ success: boolean; enrichedData?: any; entityMap?: EntityMap; error?: string }> {
  
  try {
    console.log('[AI EnrichmentV3] Starting enrichment...');
    
    // 1. Anonymiser toutes les données
    console.log('[AI EnrichmentV3] Anonymizing data...');
    const { anonymized: anonymizedData, entityMap } = await anonymizeObject(extractedData);
    
    console.log(`[AI EnrichmentV3] ${Object.keys(entityMap).length} entities anonymized`);
    
    // 2. Construire le prompt avec données anonymisées
    const userPrompt = buildUserPrompt(anonymizedData);
    
    // 3. Appeler le provider actif (DeepSeek ou Groq)
    console.log('[AI EnrichmentV3] Calling AI API...');
    const provider = await getActiveProvider();
    
    const response = await fetch(provider.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.key}`,
      },
      body: JSON.stringify({
        model: provider.model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.4,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[AI EnrichmentV3] ${provider.name} API error:`, errorText);
      throw new Error(`${provider.name} API error: ${response.status}`);
    }

    const result = await response.json();
    let content = result.choices[0].message.content;

    // Nettoyer les backticks si présents
    content = content.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim();

    console.log('[AI EnrichmentV3] Parsing JSON...');
    const enrichedAnonymized = JSON.parse(content);

    // 4. Désanonymiser le résultat
    console.log('[AI EnrichmentV3] Deanonymizing...');
    const enrichedData = deanonymizeObject(enrichedAnonymized, entityMap);

    // 4.5. Enrichir les services avec icônes fallback si nécessaire
    if (enrichedData.services) {
      enrichedData.services = enrichServicesWithIcons(enrichedData.services);
    }

    // 5. Réinjecter les données non modifiées par AI
    enrichedData.email = extractedData.formData.email;
    enrichedData.phone = extractedData.formData.phone;
    enrichedData.address = extractedData.formData.address;
    enrichedData.openingHours = extractedData.formData.openingHours;
    enrichedData.socialLinks = extractedData.formData.socialLinks;
    enrichedData.socialIsMain = extractedData.formData.socialIsMain;
    enrichedData.aboutImage = extractedData.formData.aboutImage;

    // Réinjecter les chemins d'images dans les projets
    if (enrichedData.projects) {
      enrichedData.projects = enrichedData.projects.map((project: any, i: number) => {
        // Chercher l'image dans cet ordre :
        // 1. projectContexts (images extraites des PDF)
        // 2. formData.projects (images uploadées spécifiques au projet)
        // 3. formData.media avec matching par tag
        let projectImage = 
          extractedData.projectContexts?.[i]?.images[0] || 
          extractedData.formData.projects?.[i]?.image;
        
        // Si pas d'image trouvée, chercher dans media avec matching intelligent
        if (!projectImage && extractedData.formData.media && extractedData.formData.media.length > 0) {
          // 1. Chercher une image taguée spécifiquement pour ce projet
          const taggedImage = extractedData.formData.media.find((m: any) => 
            m.tag === 'project' && 
            m.projectName && 
            project.title &&
            m.projectName.toLowerCase().includes(project.title.toLowerCase().substring(0, 5))
          );
          
          if (taggedImage) {
            projectImage = taggedImage.url || taggedImage;
          } else {
            // 2. Sinon, chercher la première image taguée "project" sans nom spécifique
            const genericProjectImage = extractedData.formData.media.find((m: any) => m.tag === 'project');
            if (genericProjectImage) {
              projectImage = genericProjectImage.url || genericProjectImage;
            } else {
              // 3. En dernier recours, utiliser la première image non taguée
              const unttaggedImage = extractedData.formData.media.find((m: any) => !m.tag);
              if (unttaggedImage) {
                projectImage = unttaggedImage.url || unttaggedImage;
              }
            }
          }
        }

        return {
          ...project,
          image: projectImage,
          link: extractedData.formData.projects?.[i]?.link,
        };
      });
    }

    // Assigner l'image de profil si taguée
    if (extractedData.formData.media) {
      const profileImage = extractedData.formData.media.find((m: any) => m.tag === 'profile');
      if (profileImage) {
        enrichedData.aboutImage = profileImage.url || profileImage;
      }

      const businessImage = extractedData.formData.media.find((m: any) => m.tag === 'business');
      if (businessImage) {
        enrichedData.heroImage = businessImage.url || businessImage;
      }
    }

    // Témoignages non modifiés
    if (!enrichedData.testimonials || enrichedData.testimonials.length === 0) {
      enrichedData.testimonials = extractedData.formData.testimonials;
    }

    console.log('[AI EnrichmentV3] ✓ Enrichment complete');
    
    return { success: true, enrichedData, entityMap };

  } catch (error: any) {
    console.error('[AI EnrichmentV3] Error:', error);
    
    // Fallback : retourner les données brutes formatées
    console.warn('[AI EnrichmentV3] Using fallback enrichment');
    const fallbackData = fallbackEnrichment(extractedData);
    
    return { success: false, enrichedData: fallbackData, error: error.message };
  }
}

/**
 * Fallback si AI échoue
 */
function fallbackEnrichment(data: ExtractedData): any {
  const { formData } = data;
  return {
    heroTitle: formData.name,
    heroSubtitle: formData.tagline,
    heroEyebrow: formData.profileType === 'freelance' ? 'Freelance' : '',
    heroCta: 'Me contacter',
    aboutText: formData.valueProp || formData.tagline,
    valueProp: formData.valueProp,
    services: formData.services?.map((s: string) => ({
      title: s,
      description: '',
    })) || [],
    projects: formData.projects || [],
    testimonials: formData.testimonials || [],
    email: formData.email,
    phone: formData.phone,
    address: formData.address,
    openingHours: formData.openingHours,
    socialLinks: formData.socialLinks,
    socialIsMain: formData.socialIsMain,
    aboutImage: formData.aboutImage,
  };
}
