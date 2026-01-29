# PROMPT GROQ - Génération Portfolio

**Usage:** À intégrer dans `groqPortfolioGeneratorService.ts`
**Modèle:** Llama 3.3 70B Versatile
**Temperature:** 0.3 (cohérent mais pas robotique)

---

## Prompt Système

```
Tu es un expert en création de portfolios web professionnels. Ta mission est de générer un portfolio HTML complet et personnalisé à partir d'un template et des données utilisateur.

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
- Supprime entièrement le bloc (y compris les balises) si fausse
```

---

## Prompt Utilisateur (template)

```
TEMPLATE HTML :
"""
{TEMPLATE_HTML}
"""

DONNÉES UTILISATEUR :
"""
{USER_DATA_JSON}
"""

FLAGS :
"""
{FLAGS_JSON}
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
5. Adapte les textes génériques au ton du profil ({PROFILE_TYPE})
6. Retourne UNIQUEMENT le HTML final, sans explication ni markdown
```

---

## Implémentation TypeScript

```typescript
// src/services/groqPortfolioGeneratorService.ts

import { PortfolioData, GroqFlags } from '../types/portfolio';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

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

function computeFlags(data: PortfolioData): GroqFlags {
  return {
    showPracticalInfo: !!(data.address || data.openingHours),
    showSocialShowcase: data.socialIsMain === true,
    showProjects: data.projects && data.projects.length > 0,
    showTestimonials: data.testimonials && data.testimonials.length > 0,
    profileType: data.profileType,
    hasLinkedIn: !!data.linkedInData,
    hasNotion: !!data.notionData,
  };
}

export async function generatePortfolioHTML(
  template: string,
  data: PortfolioData
): Promise<string> {
  const flags = computeFlags(data);
  const userPrompt = buildUserPrompt(template, data, flags);

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 16000, // Templates peuvent être longs
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const result = await response.json();
    let html = result.choices[0].message.content;

    // Nettoyer si Groq a ajouté des backticks markdown
    html = html.replace(/^```html?\n?/i, '').replace(/\n?```$/i, '');

    // Validation basique
    if (!html.includes('<!DOCTYPE html>') && !html.includes('<html')) {
      throw new Error('Invalid HTML generated');
    }

    return html;

  } catch (error) {
    console.error('Erreur génération portfolio:', error);
    throw error;
  }
}

// Version avec anonymisation (si données sensibles)
export async function generatePortfolioHTMLSecure(
  template: string,
  data: PortfolioData,
  anonymize: (text: string) => Promise<{ text: string; map: Map<string, string> }>,
  deanonymize: (text: string, map: Map<string, string>) => string
): Promise<string> {
  // Anonymiser les données sensibles
  const dataString = JSON.stringify(data);
  const { text: anonymizedData, map: entityMap } = await anonymize(dataString);
  const anonymizedPortfolioData = JSON.parse(anonymizedData);

  // Générer avec données anonymisées
  const anonymizedHTML = await generatePortfolioHTML(template, anonymizedPortfolioData);

  // Dé-anonymiser le résultat
  const finalHTML = deanonymize(anonymizedHTML, entityMap);

  return finalHTML;
}
```

---

## Handler IPC (main.cjs)

```javascript
const { generatePortfolioHTML } = require('./services/groqPortfolioGeneratorService');
const fs = require('fs');
const path = require('path');

// Charger le template (stocké dans l'app)
const TEMPLATE_PATH = path.join(__dirname, 'templates', 'portfolio-universal.html');

ipcMain.handle('generate-portfolio', async (event, portfolioData) => {
  try {
    // Charger le template
    const template = fs.readFileSync(TEMPLATE_PATH, 'utf-8');
    
    // Générer le HTML
    const html = await generatePortfolioHTML(template, portfolioData);
    
    return { success: true, html };
  } catch (error) {
    console.error('Erreur génération:', error);
    return { success: false, error: error.message };
  }
});
```

---

## Appel côté Renderer

```typescript
// Dans le composant React
const handleGenerate = async () => {
  setIsGenerating(true);
  
  try {
    const result = await window.electron.invoke('generate-portfolio', portfolioData);
    
    if (result.success) {
      setGeneratedHTML(result.html);
      setStep('preview');
      toast.success('Portfolio généré !');
    } else {
      throw new Error(result.error);
    }
  } catch (error) {
    toast.error('Erreur', 'La génération a échoué. Réessayez.');
    console.error(error);
  } finally {
    setIsGenerating(false);
  }
};
```

---

## Gestion des images

Les images (projets, médias) sont stockées localement. Dans le HTML généré, on utilise des URLs locales :

```typescript
// Avant d'envoyer à Groq, convertir les chemins en placeholder
const prepareDataForGroq = (data: PortfolioData): PortfolioData => {
  return {
    ...data,
    projects: data.projects.map((p, i) => ({
      ...p,
      image: p.image ? `{{PROJECT_IMAGE_${i}}}` : undefined,
    })),
    media: data.media.map((m, i) => ({
      ...m,
      url: `{{MEDIA_${i}}}`,
    })),
  };
};

// Après génération, remplacer les placeholders par les vraies URLs/base64
const injectImages = (html: string, data: PortfolioData): string => {
  let result = html;
  
  data.projects.forEach((p, i) => {
    if (p.image) {
      result = result.replace(`{{PROJECT_IMAGE_${i}}}`, p.image);
    }
  });
  
  data.media.forEach((m, i) => {
    result = result.replace(`{{MEDIA_${i}}}`, m.url);
  });
  
  return result;
};
```

---

## Tests

```typescript
// Test avec données minimales
const minimalData: PortfolioData = {
  name: "Jean Dupont",
  profileType: "freelance",
  tagline: "Développeur web freelance",
  services: ["Développement web"],
  email: "jean@exemple.com",
  socialLinks: [],
  socialIsMain: false,
  projects: [],
  testimonials: [],
  media: [],
};

// Test avec données complètes
const fullData: PortfolioData = {
  name: "Marie Martin",
  profileType: "commerce",
  tagline: "Fleuriste artisanale depuis 2010",
  services: ["Bouquets sur mesure", "Décoration événementielle", "Livraison"],
  valueProp: "Des fleurs fraîches et locales, livrées le jour même.",
  email: "contact@fleurs-marie.fr",
  phone: "01 23 45 67 89",
  address: "12 rue des Lilas, 75011 Paris",
  openingHours: "Lun-Sam : 9h-19h",
  socialLinks: [
    { platform: "instagram", url: "https://instagram.com/fleursmarie" },
  ],
  socialIsMain: false,
  projects: [
    {
      title: "Mariage Château de Versailles",
      description: "Décoration florale complète pour 200 invités",
      image: "/path/to/image.jpg",
      category: "Mariage",
    },
  ],
  testimonials: [
    {
      text: "Des fleurs magnifiques et un service impeccable !",
      author: "Sophie L.",
      role: "Mariée 2024",
    },
  ],
  media: [],
};
```

---

## Fallback si Groq échoue

```typescript
// Génération basique côté client si Groq indisponible
function generateFallbackHTML(data: PortfolioData): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.name} | Portfolio</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
    h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
    .tagline { font-size: 1.25rem; color: #666; margin-bottom: 2rem; }
    .section { margin-bottom: 3rem; }
    .section h2 { font-size: 1.5rem; border-bottom: 2px solid #000; padding-bottom: 0.5rem; }
  </style>
</head>
<body>
  <header>
    <h1>${data.name}</h1>
    <p class="tagline">${data.tagline}</p>
  </header>
  
  <section class="section">
    <h2>Services</h2>
    <ul>
      ${data.services.map(s => `<li>${s}</li>`).join('\n')}
    </ul>
  </section>
  
  <footer>
    <p>Contact : <a href="mailto:${data.email}">${data.email}</a></p>
    ${data.phone ? `<p>Tél : ${data.phone}</p>` : ''}
  </footer>
</body>
</html>
  `;
}
```

---

**Ce prompt est optimisé pour que Groq génère des portfolios cohérents et complets.**
