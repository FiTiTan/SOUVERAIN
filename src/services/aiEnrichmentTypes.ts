// SOUVERAIN - GROQ Enrichment Service V2
// Groq enrichit SEULEMENT les textes (JSON → JSON enrichi)
// NE TOUCHE JAMAIS au HTML

import { detectAndAnonymize, deanonymize } from './anonymizationService';
import { enrichServicesWithIcons } from '../utils/fallbackIcons';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

// Get API key from main process (secure)
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

const SYSTEM_PROMPT = `Expert en copywriting. Enrichis les données portfolio (JSON → JSON enrichi).

RÈGLES :
1. Retourne UNIQUEMENT du JSON valide
2. heroTitle = COPIE EXACTE du champ "name" (JAMAIS modifier)
3. N'invente PAS de dates/chiffres/entreprises
4. Enrichis les textes fournis

TON selon profil :
- freelance: Pro, résultats, expertise
- commerce: Chaleureux, confiance
- creative: Unique, vision
- student: Dynamique, potentiel
- employee: Crédible, impact

LONGUEURS :
- heroSubtitle: 10-20 mots
- aboutText: 50-100 mots
- serviceDesc: 15-30 mots
- valueProp: 20-40 mots

ICÔNES SERVICES :
Format: <svg viewBox='0 0 48 48' fill='none' stroke='currentColor' stroke-width='2'>...</svg>
Génère SVG minimaliste (laptop, engrenage, palette, etc.)
PAS de cercle vide seul.

STYLE :
Évite clichés ("passionné", "expert"). Verbes d'action. Spécifique.`;

export interface RawPortfolioData {
  name: string;
  profileType: 'freelance' | 'commerce' | 'creative' | 'student' | 'employee';
  tagline: string;
  services: string[];
  valueProp?: string;
  email: string;
  phone?: string;
  address?: string;
  openingHours?: string;
  socialLinks?: Array<{ platform: string; url: string; label?: string }>;
  socialIsMain?: boolean;
  projects?: Array<{
    title: string;
    description?: string;
    image?: string;
    category?: string;
    link?: string;
  }>;
  testimonials?: Array<{
    text: string;
    author: string;
    role?: string;
  }>;
  aboutImage?: string;
}

export interface EnrichedPortfolioData {
  // Hero
  heroTitle: string;
  heroSubtitle: string;
  heroEyebrow?: string;
  heroCta: string;
  
  // About
  aboutText: string;
  aboutImage?: string;
  valueProp?: string;
  
  // Services (auto-générés par DeepSeek)
  services: Array<{
    title: string;
    description: string;
    icon: string; // SVG inline
  }>;
  servicesLabel?: string; // Label dynamique (Services, Savoir-faire, Prestations, etc.)
  
  // Projects (enrichis)
  projects?: Array<{
    title: string;
    description: string;
    image?: string;
    category?: string;
    link?: string;
  }>;
  
  // Testimonials (pas modifiés)
  testimonials?: Array<{
    text: string;
    author: string;
    role?: string;
  }>;
  
  // Contact (pas modifiés)
  email: string;
  phone?: string;
  address?: string;
  openingHours?: string;
  
  // Social
  socialLinks?: Array<{ platform: string; url: string; label?: string }>;
  socialIsMain?: boolean;
}

function buildUserPrompt(data: RawPortfolioData): string {
  // Limiter la taille des contextes externes pour éviter dépassement tokens
  const linkedInContext = data.linkedInData ? data.linkedInData.substring(0, 1500) : '';
  const notionContext = data.notionData ? data.notionData.substring(0, 800) : '';
  
  return `PROFIL: ${data.profileType}
NOM: ${data.name}

DONNÉES:
Tagline: ${data.tagline}
Services: ${data.services?.join(', ')}
Value prop: ${data.valueProp || 'N/A'}
Projets: ${data.projects?.map(p => `${p.title} (${p.category || 'N/A'})`).join(', ') || 'Aucun'}

${linkedInContext ? `LinkedIn:\n${linkedInContext}` : ''}
${notionContext ? `Notion:\n${notionContext}` : ''}

Génère JSON:
{
  "heroTitle": "${data.name}",
  "heroSubtitle": "...",
  "heroEyebrow": "...",
  "heroCta": "...",
  "aboutText": "...",
  "valueProp": "...",
  "services": [{"title":"...","description":"...","icon":"<svg>...</svg>"}],
  "projects": [{"title":"...","description":"...","category":"..."}]
}

Retourne UNIQUEMENT le JSON.`;
}

/**
 * Enrichit les données brutes du portfolio avec GROQ
 * Retourne du JSON enrichi, PAS du HTML
 */
export async function enrichPortfolioData(
  rawData: RawPortfolioData,
  portfolioId: string
): Promise<{ success: boolean; data?: EnrichedPortfolioData; error?: string }> {
  try {
    console.log('[GroqEnrichment] Starting content enrichment...');

    // 1. Anonymisation des données sensibles
    const dataString = JSON.stringify(rawData);
    const anonymizedResult = await detectAndAnonymize(dataString, portfolioId);
    const anonymizedData: RawPortfolioData = JSON.parse(anonymizedResult.anonymizedText);

    console.log('[GroqEnrichment] Data anonymized, calling GROQ API...');

    // 2. Construire le prompt
    const userPrompt = buildUserPrompt(anonymizedData);

    // 3. Appel GROQ API
    const apiKey = await getGroqApiKey();
    if (!apiKey) {
      throw new Error('GROQ API key not available');
    }

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.4, // Plus créatif pour le copywriting
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[GroqEnrichment] API error:', errorText);
      throw new Error(`GROQ API error: ${response.status}`);
    }

    const result = await response.json();
    let content = result.choices[0].message.content;

    console.log('[GroqEnrichment] Response received, parsing JSON...');

    // Nettoyer si Groq a ajouté des backticks markdown
    content = content.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim();

    const enriched = JSON.parse(content);

    // 4. Enrichir les services avec icônes fallback si nécessaire
    enriched.services = enrichServicesWithIcons(enriched.services || []);

    // 5. Fusionner avec les données originales (garder ce que Groq n'a pas enrichi)
    const merged: EnrichedPortfolioData = {
      ...enriched,
      // Données non modifiées par Groq
      email: rawData.email,
      phone: rawData.phone,
      address: rawData.address,
      openingHours: rawData.openingHours,
      socialLinks: rawData.socialLinks,
      socialIsMain: rawData.socialIsMain,
      aboutImage: rawData.aboutImage,
      // Réinjecter les images et liens dans les projets
      projects: enriched.projects?.map((p: any, i: number) => ({
        ...p,
        image: rawData.projects?.[i]?.image,
        link: rawData.projects?.[i]?.link,
      })),
      // Témoignages non modifiés
      testimonials: rawData.testimonials,
    };

    // 6. Dé-anonymisation
    console.log('[GroqEnrichment] De-anonymizing data...');
    const finalDataString = JSON.stringify(merged);
    const deanonymizedString = deanonymize(finalDataString, anonymizedResult.mappings);
    const finalData: EnrichedPortfolioData = JSON.parse(deanonymizedString);

    console.log('[GroqEnrichment] ✓ Enrichment complete');

    return { success: true, data: finalData };

  } catch (error: any) {
    console.error('[GroqEnrichment] Error:', error);
    
    // Fallback : retourner les données brutes formatées
    console.warn('[GroqEnrichment] Falling back to basic formatting');
    const fallbackData = fallbackEnrichment(rawData);
    
    return { success: false, data: fallbackData, error: error.message };
  }
}

/**
 * Fallback si Groq échoue : formatage basique sans IA
 */
function fallbackEnrichment(data: RawPortfolioData): EnrichedPortfolioData {
  return {
    heroTitle: data.name,
    heroSubtitle: data.tagline,
    heroEyebrow: data.profileType === 'freelance' ? 'Freelance' : '',
    heroCta: 'Me contacter',
    aboutText: data.valueProp || data.tagline,
    valueProp: data.valueProp,
    services: data.services.map(s => ({
      title: s,
      description: '', // Pas de description générée sans IA
    })),
    projects: data.projects?.map(p => ({
      title: p.title,
      description: p.description || '',
      image: p.image,
      category: p.category,
      link: p.link,
    })),
    testimonials: data.testimonials,
    email: data.email,
    phone: data.phone,
    address: data.address,
    openingHours: data.openingHours,
    socialLinks: data.socialLinks,
    socialIsMain: data.socialIsMain,
    aboutImage: data.aboutImage,
  };
}
