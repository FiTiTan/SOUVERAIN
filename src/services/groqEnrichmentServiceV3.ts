// SOUVERAIN - GROQ Enrichment Service V3
// Enrichit avec TOUT le contexte : formulaire + PDF + LinkedIn + Notion
// Anonymise avant envoi, désanonymise après

import type { ExtractedData } from './extractionService';
import { anonymizeObject, deanonymizeObject, type EntityMap } from './anonymizationServiceV3';

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

const SYSTEM_PROMPT = `Tu es un expert en copywriting et personal branding. Ta mission est de créer un portfolio professionnel complet et impactant à partir de TOUTES les données fournies.

## RÈGLES ABSOLUES

1. UTILISE TOUTES LES DONNÉES DISPONIBLES
   - Données formulaire (nom, tagline, services)
   - Contenu des PDF/BPL (descriptions détaillées des projets)
   - Profil LinkedIn (parcours, expériences, compétences)
   - Pages Notion (informations complémentaires)

2. GÉNÈRE DU CONTENU RICHE
   - Descriptions de projets : 50-100 mots, basées sur les BPL fournis
   - About text : 100-150 mots, synthèse du parcours LinkedIn + formulaire
   - Services : 30-50 mots par service, détaillés et spécifiques

3. STRUCTURE DU CONTENU
   - heroTitle : NOM EXACT fourni (JAMAIS modifier)
   - heroSubtitle : Accroche percutante (15-25 mots)
   - aboutText : Narration engageante du parcours
   - Chaque projet : titre, description riche, catégorie, points clés

4. STYLE D'ÉCRITURE
   - Professionnel mais humain
   - Verbes d'action
   - Résultats concrets quand disponibles dans les BPL
   - Pas de clichés ("passionné", "expert reconnu")
   - Pas d'exclamations excessives

5. NE PAS INVENTER
   - Si une info n'est pas dans les données, ne pas l'inventer
   - Reformuler et enrichir, pas inventer

## NOTES SUR LES PLACEHOLDERS

Les données sont anonymisées. Tu verras des placeholders comme :
- PERSON_001, PERSON_002 (personnes)
- COMPANY_001, COMPANY_002 (entreprises)
- CITY_001 (villes)
- EMAIL_001, PHONE_001 (contacts)

GARDE CES PLACEHOLDERS TELS QUELS. Ils seront remplacés après.`;

function buildUserPrompt(data: ExtractedData): string {
  const { formData, documents, linkedInData, notionData, projectContexts } = data;

  // Construire le contexte des projets avec leurs BPL
  const projectsContext = projectContexts.map((pc, i) => {
    let context = `\n### Projet ${i + 1}: ${pc.projectTitle}`;
    if (pc.documentContent) {
      context += `\n\nCONTENU DU BPL/DOCUMENT :\n"""\n${pc.documentContent.substring(0, 3000)}\n"""`;
    }
    if (pc.images.length > 0) {
      context += `\nImages disponibles : ${pc.images.length}`;
    }
    return context;
  }).join('\n');

  // Documents généraux (non associés à un projet)
  const generalDocsContext = documents
    .filter(d => d.type === 'pdf' && d.content)
    .map(d => `\n### Document: ${d.filename}\n"""\n${d.content?.substring(0, 2000)}\n"""`)
    .join('\n');

  return `## DONNÉES FORMULAIRE

Nom : ${formData.name}
Type de profil : ${formData.profileType}
Tagline : ${formData.tagline}
Services : ${formData.services?.join(', ')}
Proposition de valeur : ${formData.valueProp || 'Non fournie'}

Email : ${formData.email}
Téléphone : ${formData.phone || 'Non fourni'}
Adresse : ${formData.address || 'Non fournie'}

## PROJETS ET LEURS DOCUMENTS
${projectsContext || 'Aucun projet avec documentation'}

## DOCUMENTS GÉNÉRAUX
${generalDocsContext || 'Aucun document général'}

## PROFIL LINKEDIN
${linkedInData ? `"""\n${linkedInData.substring(0, 3000)}\n"""` : 'Non connecté'}

## PAGES NOTION
${notionData ? `"""\n${notionData.substring(0, 2000)}\n"""` : 'Non connecté'}

---

## GÉNÈRE LE JSON SUIVANT

Utilise TOUTES les informations ci-dessus pour créer un portfolio riche et complet.

{
  "heroTitle": "${formData.name}",
  "heroSubtitle": "Accroche percutante basée sur le profil (15-25 mots)",
  "heroEyebrow": "Contexte court (ex: Freelance depuis 2018, Paris)",
  "heroCta": "Texte bouton d'action",
  
  "aboutText": "Paragraphe de présentation RICHE (100-150 mots). Utilise les infos LinkedIn et formulaire pour créer une narration engageante du parcours.",
  
  "valueProp": "Proposition de valeur reformulée et impactante (30-50 mots)",
  
  "services": [
    {
      "title": "Titre du service",
      "description": "Description DÉTAILLÉE du service (30-50 mots). Explique ce que tu fais concrètement."
    }
  ],
  
  "projects": [
    {
      "title": "Titre du projet",
      "description": "Description RICHE basée sur le BPL (50-100 mots). Inclus : contexte, défis, solutions, résultats si disponibles.",
      "category": "Catégorie",
      "highlights": ["Point clé 1", "Point clé 2", "Point clé 3"]
    }
  ],
  
  "testimonials": [
    {
      "text": "Témoignage (si fourni dans les données)",
      "author": "Nom",
      "role": "Rôle"
    }
  ]
}

IMPORTANT :
- Retourne UNIQUEMENT le JSON, sans backticks, sans explication
- heroTitle = "${formData.name}" EXACTEMENT
- Utilise le contenu des BPL pour enrichir les descriptions de projets
- Les placeholders (PERSON_001, etc.) doivent rester tels quels`;
}

/**
 * Enrichit les données avec Groq (avec anonymisation)
 */
export async function enrichPortfolioDataV3(
  extractedData: ExtractedData
): Promise<{ success: boolean; enrichedData?: any; entityMap?: EntityMap; error?: string }> {
  
  try {
    console.log('[GroqEnrichmentV3] Starting enrichment...');
    
    // 1. Anonymiser toutes les données
    console.log('[GroqEnrichmentV3] Anonymizing data...');
    const { anonymized: anonymizedData, entityMap } = await anonymizeObject(extractedData);
    
    console.log(`[GroqEnrichmentV3] ${Object.keys(entityMap).length} entities anonymized`);
    
    // 2. Construire le prompt avec données anonymisées
    const userPrompt = buildUserPrompt(anonymizedData);
    
    // 3. Appeler Groq
    console.log('[GroqEnrichmentV3] Calling Groq API...');
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
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.4,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[GroqEnrichmentV3] API error:', errorText);
      throw new Error(`Groq API error: ${response.status}`);
    }

    const result = await response.json();
    let content = result.choices[0].message.content;

    // Nettoyer les backticks si présents
    content = content.replace(/^```json?\n?/i, '').replace(/\n?```$/i, '').trim();

    console.log('[GroqEnrichmentV3] Parsing JSON...');
    const enrichedAnonymized = JSON.parse(content);

    // 4. Désanonymiser le résultat
    console.log('[GroqEnrichmentV3] Deanonymizing...');
    const enrichedData = deanonymizeObject(enrichedAnonymized, entityMap);

    // 5. Réinjecter les données non modifiées par Groq
    enrichedData.email = extractedData.formData.email;
    enrichedData.phone = extractedData.formData.phone;
    enrichedData.address = extractedData.formData.address;
    enrichedData.openingHours = extractedData.formData.openingHours;
    enrichedData.socialLinks = extractedData.formData.socialLinks;
    enrichedData.socialIsMain = extractedData.formData.socialIsMain;
    enrichedData.aboutImage = extractedData.formData.aboutImage;

    // Réinjecter les chemins d'images dans les projets
    if (enrichedData.projects && extractedData.projectContexts) {
      enrichedData.projects = enrichedData.projects.map((project: any, i: number) => ({
        ...project,
        image: extractedData.projectContexts[i]?.images[0] || extractedData.formData.projects?.[i]?.image,
        link: extractedData.formData.projects?.[i]?.link,
      }));
    }

    // Témoignages non modifiés
    if (!enrichedData.testimonials || enrichedData.testimonials.length === 0) {
      enrichedData.testimonials = extractedData.formData.testimonials;
    }

    console.log('[GroqEnrichmentV3] ✓ Enrichment complete');
    
    return { success: true, enrichedData, entityMap };

  } catch (error: any) {
    console.error('[GroqEnrichmentV3] Error:', error);
    
    // Fallback : retourner les données brutes formatées
    console.warn('[GroqEnrichmentV3] Using fallback enrichment');
    const fallbackData = fallbackEnrichment(extractedData);
    
    return { success: false, enrichedData: fallbackData, error: error.message };
  }
}

/**
 * Fallback si Groq échoue
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
