# MPF-5 : Génération du Portfolio

**Module:** Portfolio Maître SOUVERAIN  
**Priorité:** 🔴 Critique  
**Temps estimé:** 5-6h  
**Prérequis:** MPF-1 à MPF-4 implémentés  
**Workflow:** Anonymisation locale (Ollama NER) → Génération contenu (Groq API) → Rendu HTML (local)

---

## OBJECTIF

Générer le portfolio final en :
1. **Anonymisant** les données sensibles via Ollama NER (local)
2. **Générant** le contenu optimisé via Groq API (distant)
3. **Dé-anonymisant** les résultats pour affichage
4. **Produisant** un HTML/CSS autonome selon le style choisi
5. **Permettant** la preview avant validation
6. **Exportant** en fichier local ou publiant sur souverain.io

---

## FLUX DE GÉNÉRATION (Architecture Souveraine)

```
DONNÉES BRUTES  →  ANONYMISATION  →  GÉNÉRATION CONTENU  →  DÉ-ANONYMISATION  →  RENDU HTML
(Nom, Email...)    (Ollama NER)        (Groq API)           (Mapping local)       (Templates)
      🔒 LOCAL          🔒 LOCAL           ☁️ DISTANT            🔒 LOCAL           🔒 LOCAL
                            ↓                   ↓                     ↓
                     [PERSON_1]         Sections optimisées    "Jean Dupont"
                     [COMPANY_2]        (texte anonymisé)      "SARL Martin"
                     [EMAIL_1]                                 "jean@example.com"
```

**Garantie souveraineté :**
- Aucun nom, email, adresse brute n'est envoyé à Groq
- Seuls les tokens `[PERSON_X]`, `[COMPANY_Y]` sont transmis
- Dé-anonymisation en local après réception

---

## SERVICE ANONYMISATION (Réutilisé du module CV)

### Fichier : `src/services/anonymizationService.ts` (EXISTANT)

**Détection d'entités sensibles :**

```typescript
interface DetectedEntity {
  type: 'person' | 'company' | 'email' | 'phone' | 'amount' | 'address' | 'location';
  value: string;
  original: string;
}

async function detectEntitiesWithOllama(text: string): Promise<DetectedEntity[]> {
  const prompt = `Analyse le texte suivant et identifie toutes les entités sensibles.
  
Catégories :
- person : noms de personnes
- company : noms d'entreprises
- email : adresses email
- phone : numéros de téléphone
- amount : montants financiers
- address : adresses complètes
- location : villes, régions

Réponds en JSON :
{
  "entities": [
    {"type": "person", "value": "Jean Dupont"},
    {"type": "company", "value": "SARL Martin"},
    {"type": "email", "value": "jean@example.com"}
  ]
}

Texte : ${text}`;

  const result = await window.electron.invoke('ollama-chat', {
    messages: [
      { role: 'system', content: 'Expert NER. Réponds uniquement en JSON.' },
      { role: 'user', content: prompt }
    ],
    model: 'llama3.2:latest'
  });
  
  // Parser + fallback regex si échec
  // ...
}
```

**Anonymisation :**

```typescript
export const detectAndAnonymize = async (
  text: string,
  portfolioId: string,
  projectId: string | null
): Promise<AnonymizedResult> => {
  
  const entities = await detectEntitiesWithOllama(text);
  let anonymizedText = text;
  const mappings: AnonymizationMapping[] = [];

  for (const entity of entities) {
    // Récupérer token existant ou en créer un nouveau
    let token = await getExistingToken(portfolioId, entity.value);
    
    if (!token) {
      const count = await getTokenCount(portfolioId, entity.type);
      token = `[${entity.type.toUpperCase()}_${count + 1}]`;
      await persistMapping(portfolioId, projectId, entity.value, token, entity.type);
    }
    
    anonymizedText = anonymizedText.replace(
      new RegExp(escapeRegex(entity.value), 'g'),
      token
    );
    
    mappings.push({ portfolioId, projectId, original: entity.value, token, type: entity.type });
  }

  return { originalText: text, anonymizedText, mappings, entitiesDetected };
};
```

**Dé-anonymisation :**

```typescript
export const deanonymize = (text: string, mappings: AnonymizationMapping[]): string => {
  let result = text;
  mappings.forEach(mapping => {
    result = result.replace(
      new RegExp(escapeRegex(mapping.token), 'g'),
      mapping.original
    );
  });
  return result;
};
```

---

## SERVICE GÉNÉRATION CONTENU (Groq API)

### Fichier : `src/services/groqPortfolioGeneratorService.ts` (NOUVEAU)

```typescript
import { getAllMappings, deanonymize } from './anonymizationService';

interface GeneratedSection {
  id: string;
  type: 'hero' | 'about' | 'services' | 'projects' | 'contact' | 'practical';
  title: string;
  content: string;
  metadata?: Record<string, any>;
}

interface GeneratedPortfolio {
  sections: GeneratedSection[];
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
}

const STYLE_TONES: Record<string, string> = {
  moderne: 'Dynamique, direct, moderne. Phrases courtes, impact fort.',
  classique: 'Professionnel, posé, expert. Phrases élaborées.',
  authentique: 'Chaleureux, humain, proche. Storytelling.',
  artistique: 'Minimal, évocateur. Très court.',
  vitrine: 'Accueillant, commercial. Infos pratiques en priorité.',
  formel: 'Institutionnel, rigoureux. Organisé.',
};

export async function generatePortfolioContent(input: {
  anonymizedText: string;
  intentions: any;
  style: string;
  projects: any[];
  portfolioId: string;
}): Promise<GeneratedPortfolio> {
  
  // 1. Appel Groq via IPC
  // @ts-ignore
  const groqResult = await window.electron.invoke('groq-generate-portfolio-content', {
    anonymizedText: input.anonymizedText,
    intentions: input.intentions,
    style: input.style,
    tone: STYLE_TONES[input.style] || STYLE_TONES.moderne,
    projectsCount: input.projects.length
  });

  if (!groqResult.success) {
    // Fallback : sections par défaut
    return {
      sections: [
        {
          id: 'hero',
          type: 'hero',
          title: 'Bienvenue',
          content: 'Portfolio professionnel',
          metadata: { cta: 'Contact' }
        },
        {
          id: 'projects',
          type: 'projects',
          title: 'Réalisations',
          content: 'Découvrez mes projets.'
        },
        {
          id: 'contact',
          type: 'contact',
          title: 'Contact',
          content: 'Prenons contact.'
        }
      ],
      seo: {
        title: 'Portfolio',
        description: 'Mon portfolio professionnel',
        keywords: ['portfolio']
      }
    };
  }

  // 2. Récupérer mappings pour dé-anonymisation
  const mappings = await getAllMappings(input.portfolioId);

  // 3. Dé-anonymiser toutes les sections
  const deanonymizedPortfolio = {
    ...groqResult.result,
    sections: groqResult.result.sections.map((section: GeneratedSection) => ({
      ...section,
      title: deanonymize(section.title, mappings),
      content: deanonymize(section.content, mappings)
    })),
    seo: {
      ...groqResult.result.seo,
      title: deanonymize(groqResult.result.seo.title, mappings),
      description: deanonymize(groqResult.result.seo.description, mappings)
    }
  };

  return deanonymizedPortfolio;
}
```

---

## HANDLER IPC GROQ (Génération Contenu)

### Fichier : `main.cjs` (AJOUT)

```javascript
ipcMain.handle('groq-generate-portfolio-content', async (event, data) => {
  if (!groqClient) {
    return { success: false, error: 'Groq client non initialisé' };
  }

  const prompt = buildContentGenerationPrompt(data);
  
  try {
    const response = await groqClient.chat([
      {
        role: 'system',
        content: 'Tu es un expert en rédaction de contenus web professionnels. Réponds UNIQUEMENT en JSON valide.'
      },
      { role: 'user', content: prompt }
    ], {
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7, // Plus créatif pour la génération de contenu
      max_tokens: 3000
    });

    // Parser JSON
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { success: false, error: 'Format de réponse invalide' };
    }

    return {
      success: true,
      result: JSON.parse(jsonMatch[0]),
      latency: response.latency
    };

  } catch (error) {
    return { success: false, error: error.message };
  }
});

function buildContentGenerationPrompt(data) {
  return `Tu es un expert en rédaction de portfolios professionnels.

⚠️ IMPORTANT : Les données sont anonymisées. Les tokens [PERSON_X], [COMPANY_Y] remplacent les vraies informations.  
Utilise-les tels quels dans les sections générées (la dé-anonymisation se fera après).

═══════════════════════════════════════════════════════════════
CONTEXTE PORTFOLIO (DONNÉES ANONYMISÉES)
═══════════════════════════════════════════════════════════════

TYPE : ${data.intentions.target}
PRIORITÉS : ${data.intentions.priorities.join(', ')}
INFOS PRATIQUES : ${data.intentions.practicalInfo.join(', ')}
NOMBRE DE PROJETS : ${data.projectsCount}

STYLE CHOISI : ${data.style}
TON : ${data.tone}

CONTENU SOURCE (ANONYMISÉ) :
${data.anonymizedText.slice(0, 5000)}

═══════════════════════════════════════════════════════════════
SECTIONS À GÉNÉRER
═══════════════════════════════════════════════════════════════

1. **hero** : Titre accrocheur + baseline + CTA
2. **about** : Présentation (2-3 paragraphes)
3. **projects** : Intro galerie (1 paragraphe)
4. **contact** : Message engageant (1 paragraphe)

RÈGLES DE RÉDACTION :
- Utiliser le TON du style choisi
- Garder les tokens anonymisés ([PERSON_1], etc.)
- Adapter la longueur au style (artistique = très court, classique = détaillé)
- Inclure les priorités mentionnées
- Si infos pratiques demandées, créer une section "practical"

═══════════════════════════════════════════════════════════════
FORMAT DE RÉPONSE (JSON STRICT)
═══════════════════════════════════════════════════════════════

{
  "sections": [
    {
      "id": "hero",
      "type": "hero",
      "title": "[Titre principal avec [PERSON_1] si pertinent]",
      "content": "[Baseline accrocheuse]",
      "metadata": { "cta": "Découvrir mes réalisations" }
    },
    {
      "id": "about",
      "type": "about",
      "title": "À propos",
      "content": "[2-3 paragraphes avec tokens anonymisés]"
    },
    {
      "id": "projects",
      "type": "projects",
      "title": "Réalisations",
      "content": "[Introduction à la galerie de projets]"
    },
    {
      "id": "contact",
      "type": "contact",
      "title": "Travaillons ensemble",
      "content": "[Message engageant]"
    }
  ],
  "seo": {
    "title": "[Titre SEO (60 car. max)]",
    "description": "[Description SEO (150 car. max)]",
    "keywords": ["mot-clé 1", "mot-clé 2", "mot-clé 3"]
  }
}

RÉPONDS UNIQUEMENT AVEC LE JSON.`;
}
```

---

## SERVICE RENDU HTML (Local)

### Fichier : `src/services/portfolioRendererService.ts` (INCHANGÉ - 100% Local)

Le rendu HTML se fait en local avec les données **déjà dé-anonymisées** :

```typescript
export function renderPortfolioHTML(input: {
  sections: GeneratedSection[];
  seo: any;
  style: string;
  projects: any[];
  practicalData?: any;
}): string {
  
  const tokens = STYLE_TOKENS[input.style] || STYLE_TOKENS.moderne;
  const css = generateCSS(tokens);
  const body = input.sections.map(s => renderSection(s, input)).join('\n');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHTML(input.seo.title)}</title>
  <meta name="description" content="${escapeHTML(input.seo.description)}">
  <style>${css}</style>
</head>
<body>
${body}
</body>
</html>`;
}

// Aucune donnée anonymisée ici - tout est déjà restauré
```

---

## ÉCRAN GÉNÉRATION

### Fichier : `src/components/portfolio/master/GenerationScreen.tsx`

```tsx
import React, { useState, useEffect } from 'react';
import { Shield, Brain, Palette, Code, Check, Loader2 } from 'lucide-react';

interface GenerationScreenProps {
  portfolioData: any;
  onComplete: (result: { html: string; portfolioId: string }) => void;
  onError: (error: string) => void;
}

export const GenerationScreen: React.FC<GenerationScreenProps> = ({
  portfolioData,
  onComplete,
  onError,
}) => {
  const [steps, setSteps] = useState([
    { id: 'anonymize', label: 'Anonymisation (🔒 Local)', status: 'pending' as const, icon: Shield },
    { id: 'generate', label: 'Génération contenu (☁️ Groq)', status: 'pending' as const, icon: Brain },
    { id: 'deanonymize', label: 'Dé-anonymisation (🔒 Local)', status: 'pending' as const, icon: Shield },
    { id: 'style', label: 'Application style (🔒 Local)', status: 'pending' as const, icon: Palette },
    { id: 'render', label: 'Rendu HTML (🔒 Local)', status: 'pending' as const, icon: Code },
  ]);
  const [log, setLog] = useState('Initialisation...');

  useEffect(() => {
    runGeneration();
  }, []);

  const updateStep = (id: string, status: 'processing' | 'done') => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  const runGeneration = async () => {
    try {
      // 1. Anonymisation locale
      updateStep('anonymize', 'processing');
      setLog('🔒 Protection des données sensibles en local...');
      
      const allText = gatherAllText(portfolioData);
      const { anonymizedText, mappings } = await detectAndAnonymize(
        allText,
        portfolioData.portfolioId,
        null
      );
      
      updateStep('anonymize', 'done');

      // 2. Génération contenu (Groq distant)
      updateStep('generate', 'processing');
      setLog('☁️ Génération du contenu via Groq API...');
      
      const content = await generatePortfolioContent({
        anonymizedText,
        intentions: portfolioData.intentions,
        style: portfolioData.style,
        projects: portfolioData.projects,
        portfolioId: portfolioData.portfolioId
      });
      
      updateStep('generate', 'done');

      // 3. Dé-anonymisation locale (déjà faite dans generatePortfolioContent)
      updateStep('deanonymize', 'processing');
      setLog('🔓 Restauration des données réelles...');
      await new Promise(r => setTimeout(r, 300));
      updateStep('deanonymize', 'done');

      // 4. Application du style
      updateStep('style', 'processing');
      setLog(`🎨 Application du style ${portfolioData.style}...`);
      await new Promise(r => setTimeout(r, 500));
      updateStep('style', 'done');

      // 5. Rendu HTML
      updateStep('render', 'processing');
      setLog('📄 Génération du fichier HTML...');
      
      const html = await window.electron.invoke('render-portfolio-html', {
        sections: content.sections,
        seo: content.seo,
        style: portfolioData.style,
        projects: portfolioData.projects,
        practicalData: portfolioData.practicalData,
      });
      
      updateStep('render', 'done');

      // Sauvegarder en DB
      const portfolioId = await window.electron.invoke('save-generated-portfolio', {
        ...portfolioData,
        generatedHTML: html,
        generatedSections: content.sections
      });

      setLog('✅ Terminé !');
      setTimeout(() => onComplete({ html, portfolioId }), 800);

    } catch (error) {
      onError(error instanceof Error ? error.message : 'Erreur de génération');
    }
  };

  const progress = (steps.filter(s => s.status === 'done').length / steps.length) * 100;

  return (
    <div className="min-h-screen bg-zinc-900 text-white flex items-center justify-center p-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-10 h-10 animate-spin" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Génération en cours</h1>
          <p className="text-zinc-400">{log}</p>
        </div>

        <div className="h-2 bg-zinc-800 rounded-full mb-8 overflow-hidden">
          <div className="h-full bg-blue-500 transition-all" style={{ width: `${progress}%` }} />
        </div>

        <div className="space-y-3">
          {steps.map(step => {
            const Icon = step.icon;
            return (
              <div key={step.id} className={`flex items-center gap-4 p-4 rounded-xl ${
                step.status === 'processing' ? 'bg-blue-600/20' :
                step.status === 'done' ? 'bg-green-600/10' : 'bg-zinc-800'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step.status === 'processing' ? 'bg-blue-600' :
                  step.status === 'done' ? 'bg-green-600' : 'bg-zinc-700'
                }`}>
                  {step.status === 'done' ? <Check className="w-4 h-4" /> :
                   step.status === 'processing' ? <Loader2 className="w-4 h-4 animate-spin" /> :
                   <Icon className="w-4 h-4" />}
                </div>
                <span className={step.status === 'done' ? 'text-green-400' : 
                               step.status === 'processing' ? 'text-white' : 'text-zinc-500'}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-8 p-4 bg-zinc-800 rounded-xl flex items-center gap-3">
          <Shield className="w-5 h-5 text-green-500" />
          <p className="text-sm text-zinc-400">
            Vos données sont protégées : anonymisation locale avant envoi à Groq
          </p>
        </div>
      </div>
    </div>
  );
};

function gatherAllText(data: any): string {
  return [
    data.imports?.linkedInData?.rawContent || '',
    data.imports?.notionData?.pageContent || '',
    ...data.projects.map((p: any) => 
      [p.brief_text, p.challenge_text, p.solution_text].filter(Boolean).join('\n')
    )
  ].filter(Boolean).join('\n\n');
}
```

---

## HANDLERS IPC

Dans `main.cjs` :

```javascript
// Render HTML (local - pas de données anonymisées ici)
ipcMain.handle('render-portfolio-html', async (event, data) => {
  const { renderPortfolioHTML } = require('./services/portfolioRendererService');
  return renderPortfolioHTML(data);
});

// Sauvegarder portfolio généré
ipcMain.handle('save-generated-portfolio', async (event, data) => {
  const portfolioId = data.portfolioId || crypto.randomUUID();
  
  dbManager.db.prepare(`
    UPDATE portfolios 
    SET generated_html = ?, 
        generated_sections = ?,
        updated_at = ?
    WHERE id = ?
  `).run(
    data.generatedHTML,
    JSON.stringify(data.generatedSections),
    new Date().toISOString(),
    portfolioId
  );
  
  return portfolioId;
});

// Export HTML
ipcMain.handle('export-portfolio-html', async (event, { portfolioId, html }) => {
  const { dialog } = require('electron');
  const fs = require('fs');
  
  const result = await dialog.showSaveDialog({
    title: 'Exporter le portfolio',
    defaultPath: `portfolio-${portfolioId}.html`,
    filters: [{ name: 'HTML', extensions: ['html'] }],
  });
  
  if (!result.canceled && result.filePath) {
    fs.writeFileSync(result.filePath, html, 'utf-8');
    return { success: true, path: result.filePath };
  }
  return { success: false };
});
```

---

## FICHIERS À CRÉER

1. `src/services/groqPortfolioGeneratorService.ts` (NOUVEAU)
2. `src/components/portfolio/master/GenerationScreen.tsx` (MAJ)
3. `src/components/portfolio/master/PortfolioPreview.tsx` (inchangé)
4. `src/services/portfolioRendererService.ts` (inchangé)

---

## TESTS DE VALIDATION

### Test 1 : Génération complète avec Groq actif
- ✅ Anonymisation détecte 3 noms, 2 emails, 1 entreprise
- ✅ Groq génère 4 sections avec tokens `[PERSON_1]`, `[EMAIL_1]`
- ✅ Dé-anonymisation restaure les vraies données
- ✅ HTML final contient "Jean Dupont" (pas `[PERSON_1]`)
- ✅ Export HTML fonctionne

### Test 2 : Groq indisponible (API down)
- ✅ Anonymisation fonctionne (local)
- ✅ Appel Groq échoue → Fallback sections par défaut
- ✅ Génération continue avec contenu minimal
- ✅ Message d'erreur clair affiché

### Test 3 : Vérification souveraineté
- ✅ Inspecter le payload envoyé à Groq → Aucun nom réel
- ✅ Vérifier base SQLite → Mappings persistés
- ✅ Tester dé-anonymisation croisée (2 projets) → Cohérence tokens

---

## SÉCURITÉ & MENTIONS LÉGALES

**À ajouter dans CGU/Confidentialité :**

> "SOUVERAIN utilise l'API Groq pour générer intelligemment le contenu de votre portfolio. Vos données personnelles (noms, emails, adresses, entreprises) sont systématiquement anonymisées localement via une IA de détection (Ollama NER) avant tout envoi à Groq. 
> 
> Seuls des tokens génériques ([PERSON_1], [COMPANY_2], etc.) sont transmis à Groq. Après réception du contenu généré, la dé-anonymisation est effectuée localement pour restaurer vos vraies informations.
> 
> Aucune donnée personnelle brute n'est envoyée à Groq ou stockée sur des serveurs distants."

---

**Fin du brief MPF-5 (Version Groq API)**
