// SOUVERAIN - GROQ Portfolio Generation Service
// Génère un portfolio HTML complet avec IA

import { detectAndAnonymize, deanonymize, type AnonymizationMapping } from './anonymizationService';

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

const SYSTEM_PROMPT = `Tu es un expert en création de portfolios web professionnels. Ta mission est de générer un portfolio HTML complet et personnalisé à partir d'un template et des données utilisateur.

RÈGLES ABSOLUES :
1. NE JAMAIS modifier le CSS dans le bloc <style> marqué "STYLE PROTÉGÉ"
2. NE JAMAIS inventer d'informations non fournies
3. TOUJOURS supprimer les sections sans données (ne pas laisser de placeholder)
4. TOUJOURS adapter le ton selon le type de profil
5. TOUJOURS retourner du HTML valide et complet

SECTIONS CONDITIONNELLES :
- Section "Infos Pratiques" : Afficher UNIQUEMENT si adresse OU horaires fournis
- Section "Social Showcase" : Afficher en prominence UNIQUEMENT si socialIsMain = true
- Section "Projets" : Afficher UNIQUEMENT si au moins 1 projet fourni
- Section "Témoignages" : Afficher UNIQUEMENT si au moins 1 témoignage fourni
- Section "Services" : TOUJOURS afficher (données obligatoires)

ADAPTATION DU TON SELON LE PROFIL :
- freelance : Professionnel, orienté valeur et résultats
- commerce : Chaleureux, proximité, confiance
- creative : Visuel, personnalité, artistique
- student : Dynamique, potentiel, apprentissage
- employee : Crédible, expérience, expertise

POUR LES ZONES REPEAT :
- Duplique le bloc HTML pour chaque élément du tableau
- Supprime entièrement la zone si le tableau est vide

POUR LES ZONES IF :
- Garde le contenu si la condition est vraie
- Supprime entièrement le bloc (y compris les balises) si fausse`;

interface PortfolioData {
  name: string;
  profileType: 'freelance' | 'commerce' | 'creative' | 'student' | 'employee';
  tagline: string;
  services: string[];
  valueProp?: string;
  email: string;
  phone?: string;
  address?: string;
  openingHours?: string;
  socialLinks: Array<{ platform: string; url: string }>;
  socialIsMain: boolean;
  projects: Array<{
    title: string;
    description: string;
    image?: string;
    category?: string;
    link?: string;
  }>;
  testimonials: Array<{
    text: string;
    author: string;
    role: string;
  }>;
  media: Array<{ url: string; type: string }>;
}

interface GroqFlags {
  showPracticalInfo: boolean;
  showSocialShowcase: boolean;
  showProjects: boolean;
  showTestimonials: boolean;
  profileType: string;
  hasLinkedIn: boolean;
  hasNotion: boolean;
}

function computeFlags(data: PortfolioData): GroqFlags {
  return {
    showPracticalInfo: !!(data.address || data.openingHours),
    showSocialShowcase: data.socialIsMain === true,
    showProjects: data.projects && data.projects.length > 0,
    showTestimonials: data.testimonials && data.testimonials.length > 0,
    profileType: data.profileType,
    hasLinkedIn: data.socialLinks.some(s => s.platform.toLowerCase() === 'linkedin'),
    hasNotion: false,
  };
}

function buildUserPrompt(
  template: string,
  data: PortfolioData,
  flags: GroqFlags
): string {
  return `TEMPLATE HTML :
"""
${template}
"""

DONNÉES UTILISATEUR :
"""
${JSON.stringify(data, null, 2)}
"""

FLAGS :
"""
${JSON.stringify(flags, null, 2)}
"""

INSTRUCTIONS :
1. Remplace toutes les variables {{...}} par les données correspondantes
2. Pour chaque zone <!-- REPEAT: xxx --> ... <!-- END REPEAT: xxx --> :
   - Duplique le bloc pour chaque élément du tableau correspondant
   - Supprime la zone entière si le tableau est vide
3. Pour chaque zone <!-- IF: condition --> ... <!-- ENDIF: condition --> :
   - Garde le contenu si la condition est vraie dans FLAGS
   - Supprime entièrement si fausse
4. Pour chaque <!-- SECTION: xxx (OPTIONNEL) --> :
   - Supprime la section entière si elle n'a pas de données
5. Adapte les textes génériques au ton du profil (${data.profileType})
6. Retourne UNIQUEMENT le HTML final, sans explication ni markdown`;
}

/**
 * Génère un portfolio HTML via GROQ avec anonymisation
 */
export async function generatePortfolioWithGroq(
  templateHTML: string,
  portfolioData: PortfolioData,
  portfolioId: string
): Promise<{ success: boolean; html?: string; error?: string }> {
  try {
    console.log('[GROQ] Starting portfolio generation...');

    // 1. Anonymisation des données sensibles
    console.log('[GROQ] Step 1: Anonymizing data...');
    const dataString = JSON.stringify(portfolioData);
    const anonymizedResult = await detectAndAnonymize(dataString, portfolioId);
    const anonymizedData: PortfolioData = JSON.parse(anonymizedResult.anonymizedText);

    console.log('[GROQ] Anonymization complete:', {
      people: anonymizedResult.entitiesDetected.people.length,
      emails: anonymizedResult.entitiesDetected.emails.length,
      phones: anonymizedResult.entitiesDetected.phones.length,
    });

    // 2. Compute flags
    const flags = computeFlags(anonymizedData);
    const userPrompt = buildUserPrompt(templateHTML, anonymizedData, flags);

    console.log('[GROQ] Step 2: Calling GROQ API...');

    // Get API key
    const apiKey = await getGroqApiKey();
    if (!apiKey) {
      throw new Error('GROQ API key not available');
    }

    // 3. Appel GROQ API
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
        temperature: 0.3,
        max_tokens: 16000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[GROQ] API error:', errorText);
      throw new Error(`GROQ API error: ${response.status}`);
    }

    const result = await response.json();
    let generatedHTML = result.choices[0].message.content;

    console.log('[GROQ] Step 3: Processing response...');

    // Nettoyer si Groq a ajouté des backticks markdown
    generatedHTML = generatedHTML.replace(/^```html?\n?/i, '').replace(/\n?```$/i, '');

    // 4. Dé-anonymisation
    console.log('[GROQ] Step 4: De-anonymizing...');
    const finalHTML = deanonymize(generatedHTML, anonymizedResult.mappings);

    // 5. Validation basique
    if (!finalHTML.includes('<!DOCTYPE html>') && !finalHTML.includes('<html')) {
      throw new Error('Invalid HTML generated by GROQ');
    }

    console.log('[GROQ] Portfolio generation complete ✓');

    return { success: true, html: finalHTML };

  } catch (error: any) {
    console.error('[GROQ] Generation error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Fallback si GROQ échoue - génération simple côté client
 */
export function generateFallbackPortfolioHTML(data: PortfolioData): string {
  const projectsHTML = data.projects
    .map(
      (p) => `
    <div class="project">
      <h3>${p.title}</h3>
      <p>${p.description}</p>
      ${p.link ? `<a href="${p.link}">Voir le projet →</a>` : ''}
    </div>
  `
    )
    .join('');

  const servicesHTML = data.services.map((s) => `<li>${s}</li>`).join('');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.name} | Portfolio</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
      line-height: 1.6;
    }
    h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
    .tagline { font-size: 1.25rem; color: #666; margin-bottom: 2rem; }
    .section { margin-bottom: 3rem; }
    .section h2 { font-size: 1.5rem; border-bottom: 2px solid #000; padding-bottom: 0.5rem; margin-bottom: 1rem; }
    .project { margin-bottom: 1.5rem; padding: 1rem; background: #f5f5f5; border-radius: 8px; }
    .project h3 { margin-bottom: 0.5rem; }
    .project a { color: #0066cc; text-decoration: none; }
    ul { list-style-position: inside; }
  </style>
</head>
<body>
  <header>
    <h1>${data.name}</h1>
    <p class="tagline">${data.tagline}</p>
  </header>
  
  <section class="section">
    <h2>Services</h2>
    <ul>${servicesHTML}</ul>
  </section>
  
  ${
    data.projects.length > 0
      ? `
  <section class="section">
    <h2>Projets</h2>
    ${projectsHTML}
  </section>
  `
      : ''
  }
  
  <footer>
    <p>Contact : <a href="mailto:${data.email}">${data.email}</a></p>
    ${data.phone ? `<p>Tél : ${data.phone}</p>` : ''}
    ${data.address ? `<p>Adresse : ${data.address}</p>` : ''}
  </footer>
</body>
</html>`;
}
