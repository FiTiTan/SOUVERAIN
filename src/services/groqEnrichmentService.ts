// SOUVERAIN - GROQ Enrichment Service V2
// Groq enrichit SEULEMENT les textes (JSON → JSON enrichi)
// NE TOUCHE JAMAIS au HTML

import { detectAndAnonymize, deanonymize } from './anonymizationService';

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

const SYSTEM_PROMPT = `Tu es un expert en copywriting et personal branding. Ta mission est d'enrichir les données d'un portfolio professionnel pour les rendre plus impactantes et engageantes.

RÈGLES ABSOLUES :
1. Tu retournes UNIQUEMENT du JSON valide, rien d'autre
2. Tu NE génères PAS de HTML
3. Tu NE inventes PAS d'informations factuelles (dates, chiffres, entreprises)
4. Tu ENRICHIS et REFORMULES les textes fournis
5. Tu GÉNÈRES les descriptions manquantes à partir du contexte

⚠️ RÈGLES CRITIQUES POUR LE NOM :
6. heroTitle = COPIE EXACTE du champ "name" fourni, SANS AUCUNE MODIFICATION
7. NE JAMAIS répéter le nom (pas de "Jean Jean", "Marie Marie", etc.)
8. NE JAMAIS ajouter de titre ou suffixe au nom
9. Si name = "Jean Dupont", alors heroTitle = "Jean Dupont" (identique)

ADAPTATION DU TON SELON LE PROFIL :
- freelance : Professionnel, orienté valeur et résultats, expertise technique
- commerce : Chaleureux, proximité, confiance, service client
- creative : Artistique, unique, personnalité forte, vision
- student : Dynamique, potentiel, curiosité, apprentissage rapide
- employee : Crédible, expérience solide, leadership, impact

LONGUEURS RECOMMANDÉES :
- heroSubtitle : 10-20 mots (accroche percutante)
- heroEyebrow : 2-5 mots (contexte rapide)
- aboutText : 50-100 mots (paragraphe engageant)
- serviceDesc : 15-30 mots par service
- valueProp : 20-40 mots

STYLE D'ÉCRITURE :
- Évite les clichés ("passionné", "dynamique", "expert reconnu")
- Privilégie les verbes d'action
- Sois spécifique plutôt que générique
- Pas de points d'exclamation excessifs
- Ton naturel, pas robotique`;

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
  
  // Services (enrichis)
  services: Array<{
    title: string;
    description: string;
  }>;
  
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
  return `PROFIL : ${data.profileType}
NOM EXACT (à copier tel quel dans heroTitle) : ${data.name}

DONNÉES BRUTES :
${JSON.stringify({
  tagline: data.tagline,
  services: data.services,
  valueProp: data.valueProp,
  projects: data.projects?.map(p => ({ title: p.title, description: p.description, category: p.category })),
}, null, 2)}

${data.linkedInData ? `CONTEXTE LINKEDIN :\n${data.linkedInData}` : ''}
${data.notionData ? `CONTEXTE NOTION :\n${data.notionData}` : ''}

---

Génère un JSON avec les champs suivants.

⚠️ ATTENTION : heroTitle DOIT être exactement "${data.name}" sans modification.

{
  "heroTitle": "${data.name}",
  "heroSubtitle": "Accroche enrichie basée sur la tagline (10-20 mots)",
  "heroEyebrow": "Contexte court (2-5 mots, ex: Freelance, Depuis 2015)",
  "heroCta": "Texte bouton (ex: Me contacter, Voir mes projets)",
  "aboutText": "Paragraphe de présentation enrichi (50-100 mots)",
  "valueProp": "Proposition de valeur reformulée (20-40 mots)",
  "services": [
    { "title": "Titre service original ou légèrement amélioré", "description": "Description enrichie (15-30 mots)" }
  ],
  "projects": [
    { "title": "Titre projet", "description": "Description enrichie", "category": "Catégorie" }
  ]
}

IMPORTANT : 
- Retourne UNIQUEMENT le JSON, sans backticks, sans explication
- heroTitle = "${data.name}" (COPIE EXACTE)`;
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

    // 4. Fusionner avec les données originales (garder ce que Groq n'a pas enrichi)
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

    // 5. Dé-anonymisation
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
