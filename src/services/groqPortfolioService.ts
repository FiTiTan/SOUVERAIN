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

const SYSTEM_PROMPT = `Tu es un moteur de template HTML intelligent. Ta mission est de REMPLIR un template existant avec les données utilisateur, PAS de générer un nouveau design.

🚨 RÈGLES ABSOLUES - RESPECTE LA STRUCTURE DU TEMPLATE :
1. NE JAMAIS modifier la structure HTML du template (balises, classes, IDs)
2. NE JAMAIS modifier ou supprimer le CSS existant
3. NE JAMAIS créer de nouvelles sections ou blocs non présents dans le template
4. SEULEMENT remplacer les placeholders {{...}} par les vraies données
5. SEULEMENT dupliquer/supprimer les zones marquées REPEAT/IF
6. SEULEMENT améliorer la formulation du contenu texte (storytelling)

📋 TON TRAVAIL :
- Remplace {{NAME}} par le vrai nom
- Remplace {{TAGLINE}} par une version améliorée/reformulée de la tagline
- Remplace {{SERVICES}} par une liste HTML bien formatée
- Améliore la formulation des descriptions (storytelling) tout en gardant le sens
- NE PAS inventer de fausses informations
- NE PAS ajouter de sections non demandées

🎭 ADAPTATION DU TON (amélioration textuelle uniquement) :
- freelance : Professionnel, orienté valeur et résultats
- commerce : Chaleureux, proximité, confiance
- creative : Visuel, personnalité, artistique
- student : Dynamique, potentiel, apprentissage
- employee : Crédible, expérience, expertise

⚙️ TRAITEMENT DES ZONES SPÉCIALES :
- <!-- REPEAT: projects --> ... <!-- END REPEAT --> : Duplique le bloc pour chaque projet
- <!-- IF: showProjects --> ... <!-- ENDIF --> : Garde/supprime selon le flag
- Si une section est vide, supprime-la proprement (pas de placeholders vides)

✅ FORMAT DE SORTIE : HTML complet et valide, structure identique au template d'entrée`;

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
    hasLinkedIn: data.socialLinks.some(s => s.platform && s.platform.toLowerCase() === 'linkedin'),
    hasNotion: false,
  };
}

function buildUserPrompt(
  template: string,
  data: PortfolioData,
  flags: GroqFlags
): string {
  return `🎯 MISSION : Remplis ce template HTML avec les données utilisateur. GARDE LA STRUCTURE EXACTE DU TEMPLATE.

📄 TEMPLATE À REMPLIR (NE CHANGE PAS LA STRUCTURE, REMPLIS SEULEMENT) :
"""
${template}
"""

📊 DONNÉES UTILISATEUR (utilise ces valeurs pour remplir le template) :
"""
${JSON.stringify(data, null, 2)}
"""

🚦 FLAGS CONDITIONNELS (pour les blocs <!-- IF: ... -->) :
"""
${JSON.stringify(flags, null, 2)}
"""

✅ ÉTAPES EXACTES À SUIVRE :
1. Prends le template HTML tel quel
2. Remplace SEULEMENT les placeholders {{NAME}}, {{TAGLINE}}, {{EMAIL}}, etc. par les vraies valeurs
3. Pour {{TAGLINE}}, reformule intelligemment pour un storytelling captivant (profil: ${data.profileType})
4. Pour les zones <!-- REPEAT: projects --> : duplique le bloc pour chaque projet du tableau
5. Pour les zones <!-- IF: showProjects --> : garde si flags.showProjects = true, supprime sinon
6. NE TOUCHE PAS au CSS, aux classes, à la structure HTML
7. Retourne le HTML complet et valide

⚠️ INTERDIT :
- Créer de nouvelles sections
- Modifier le design ou le CSS
- Inventer des données non fournies
- Changer la structure des balises

📤 RETOURNE UNIQUEMENT LE HTML FINAL (sans markdown, sans explication)`;
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
    
    let anonymizedResult;
    try {
      anonymizedResult = await detectAndAnonymize(dataString, portfolioId);
    } catch (anonError: any) {
      console.error('[GROQ] Anonymization failed:', anonError);
      return { success: false, error: `Anonymization error: ${anonError.message}` };
    }
    
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
