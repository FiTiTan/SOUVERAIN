# MPF-4 : Analyse IA & Suggestion Intelligente de Style

**Module:** Portfolio Maître SOUVERAIN  
**Priorité:** 🔴 Critique  
**Temps estimé:** 4-5h  
**Prérequis:** MPF-1, MPF-2, MPF-3 implémentés  
**Workflow:** Anonymisation locale (Ollama NER) → Analyse distante (Groq API) → Dé-anonymisation

---

## OBJECTIF

Remplacer les règles heuristiques IF/THEN par une vraie analyse IA qui :
1. **Anonymise** les données sensibles localement (Ollama NER)
2. **Envoie** les données anonymisées à Groq API (distant)
3. **Analyse** le contenu pour suggérer un style adapté
4. **Dé-anonymise** les résultats pour affichage
5. **Gère** les cas où les données sont insuffisantes

---

## ARCHITECTURE SOUVERAINE

### Principe de Souveraineté des Données

```
┌─────────────────────────────────────────────────────────────┐
│  DONNÉES UTILISATEUR (nom, email, entreprises, adresses)   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │  OLLAMA NER (LOCAL)  │ 🔒 Détection entités sensibles
          │  Crée mappings:      │
          │  Jean → [PERSON_1]   │
          │  SARL X → [COMPANY_1]│
          └──────────┬───────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │  DONNÉES ANONYMISÉES │ 📤 Envoi sécurisé
          │  Texte avec tokens   │
          └──────────┬───────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │   GROQ API (CLOUD)   │ ☁️ Analyse intelligente
          │   Llama 3.3-70B      │
          │   Suggestion style   │
          └──────────┬───────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │ RÉSULTAT ANONYMISÉ   │
          │ "[PERSON_1] a un     │
          │  profil technique"   │
          └──────────┬───────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │ DÉ-ANONYMISATION     │ 🔓 Mapping inverse
          │ "Jean a un profil    │
          │  technique"          │
          └──────────┬───────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │   AFFICHAGE UI       │
          └──────────────────────┘
```

**Garantie :** Aucune donnée personnelle brute n'est envoyée à Groq. Seuls les tokens `[PERSON_X]`, `[COMPANY_Y]` sont transmis.

---

## FLUX DE DONNÉES COMPLET

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   MPF-1     │     │   MPF-2     │     │   MPF-2     │
│ Intentions  │     │  Contenus   │     │   Médias    │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           ▼
                 ┌─────────────────┐
                 │   AGRÉGATEUR    │
                 │ (PortfolioHub)  │
                 └────────┬────────┘
                          ▼
                 ┌─────────────────┐
                 │  ANONYMISATION  │ 🔒 Ollama NER (local)
                 │ detectAndAnonymize()
                 └────────┬────────┘
                          ▼
                 ┌─────────────────┐
                 │   GROQ API      │ ☁️ Analyse distante
                 │ analyzePortfolioStyle()
                 └────────┬────────┘
                          ▼
                 ┌─────────────────┐
                 │ DÉ-ANONYMISATION│ 🔓 deanonymize()
                 └────────┬────────┘
                          ▼
                 ┌─────────────────┐
                 │  UI ADAPTÉE     │
                 │ (StyleSuggestion)
                 └─────────────────┘
```

---

## SERVICE ANONYMISATION

### Fichier : `src/services/anonymizationService.ts` (EXISTANT - Réutilisé du module CV)

**Fonction principale :**

```typescript
export const detectAndAnonymize = async (
  text: string,
  portfolioId: string,
  projectId: string | null = null
): Promise<AnonymizedResult> => {
  
  // 1. Détection via Ollama NER (fallback regex si Ollama down)
  const entities = await detectEntitiesWithOllama(text);
  
  // 2. Pour chaque entité, créer ou récupérer un token
  const mappings: AnonymizationMapping[] = [];
  let anonymizedText = text;
  
  for (const entity of entities) {
    // Check si token existe déjà (cohérence cross-projet)
    let token = await getExistingToken(portfolioId, entity.value);
    
    if (!token) {
      const count = await getTokenCount(portfolioId, entity.type);
      token = `[${entity.type.toUpperCase()}_${count + 1}]`;
      await persistMapping(portfolioId, projectId, entity.value, token, entity.type);
    }
    
    // Remplacer dans le texte
    anonymizedText = anonymizedText.replace(new RegExp(escapeRegex(entity.value), 'g'), token);
    mappings.push({ portfolioId, projectId, original: entity.value, token, type: entity.type });
  }
  
  return { originalText: text, anonymizedText, mappings, entitiesDetected };
};
```

**Types détectés :**
- `PERSON` : Noms de personnes
- `COMPANY` : Entreprises, marques
- `EMAIL` : Adresses email
- `PHONE` : Numéros de téléphone
- `ADDRESS` : Adresses postales
- `AMOUNT` : Montants financiers
- `LOCATION` : Villes, régions

**Dé-anonymisation :**

```typescript
export const deanonymize = (text: string, mappings: AnonymizationMapping[]): string => {
  let result = text;
  mappings.forEach(mapping => {
    result = result.replace(new RegExp(escapeRegex(mapping.token), 'g'), mapping.original);
  });
  return result;
};
```

---

## SERVICE GROQ PORTFOLIO

### Fichier : `src/services/groqPortfolioService.ts` (NOUVEAU)

```typescript
import { getAllMappings, deanonymize, type AnonymizationMapping } from './anonymizationService';

interface PortfolioAnalysisInput {
  anonymizedText: string;
  intentions: {
    target: string;
    priorities: string[];
    practicalInfo: string[];
  };
  mediaStats: {
    images: number;
    videos: number;
    pdfs: number;
    texts: number;
    total: number;
  };
  projectsCount: number;
}

export interface StyleAnalysisResult {
  recommendedStyle: 'moderne' | 'classique' | 'authentique' | 'artistique' | 'vitrine' | 'formel';
  confidence: number; // 0-100
  reasoning: string;
  missingInfo: string[] | null;
  alternativeStyle: string | null;
  keyInsights: string[];
}

export async function analyzePortfolioStyleWithGroq(
  input: PortfolioAnalysisInput,
  portfolioId: string
): Promise<StyleAnalysisResult> {
  
  try {
    // 1. Appel Groq via IPC
    // @ts-ignore
    const groqResult = await window.electron.invoke('groq-analyze-portfolio-style', {
      anonymizedText: input.anonymizedText,
      intentions: input.intentions,
      mediaStats: input.mediaStats,
      projectsCount: input.projectsCount
    });

    if (!groqResult.success) {
      throw new Error(groqResult.error || 'Groq analysis failed');
    }

    // 2. Récupérer les mappings pour dé-anonymisation
    const mappings = await getAllMappings(portfolioId);

    // 3. Dé-anonymiser le résultat
    const deanonymizedResult: StyleAnalysisResult = {
      ...groqResult.result,
      reasoning: deanonymize(groqResult.result.reasoning, mappings),
      keyInsights: (groqResult.result.keyInsights || []).map((insight: string) => 
        deanonymize(insight, mappings)
      )
    };

    return deanonymizedResult;

  } catch (error) {
    console.error('[Groq Portfolio] Analyse error:', error);
    
    // Fallback : règles heuristiques simples
    return {
      recommendedStyle: 'moderne',
      confidence: 40,
      reasoning: 'Analyse Groq indisponible. Suggestion par défaut basée sur le style le plus polyvalent.',
      missingInfo: ['Connexion Groq échouée - vérifier clé API et connexion Internet'],
      alternativeStyle: 'classique',
      keyInsights: []
    };
  }
}
```

---

## HANDLER IPC GROQ

### Fichier : `main.cjs` (AJOUT)

```javascript
const { GroqClient } = require('./groq-client.cjs');
let groqClient = null;

// Initialisation Groq (appelé au démarrage avec clé API depuis config)
ipcMain.handle('init-groq-client', async (event, apiKey) => {
  try {
    groqClient = new GroqClient(apiKey);
    const test = await groqClient.testConnection();
    return { success: test.valid, error: test.error };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Analyse de style
ipcMain.handle('groq-analyze-portfolio-style', async (event, data) => {
  if (!groqClient) {
    return { success: false, error: 'Groq client non initialisé. Configurez votre clé API.' };
  }

  const prompt = buildPortfolioStylePrompt(data);
  
  try {
    const startTime = Date.now();
    
    const response = await groqClient.chat([
      {
        role: 'system',
        content: 'Tu es un expert en design de portfolios professionnels. Réponds UNIQUEMENT en JSON valide.'
      },
      { role: 'user', content: prompt }
    ], {
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 2000
    });

    const latency = Date.now() - startTime;

    // Parser JSON
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return { success: false, error: 'Format de réponse invalide (JSON non trouvé)' };
    }

    const result = JSON.parse(jsonMatch[0]);

    return {
      success: true,
      result,
      latency,
      tokens: response.tokens
    };

  } catch (error) {
    console.error('[Groq IPC] Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
});

function buildPortfolioStylePrompt(data) {
  return `Tu es un expert en design de portfolios professionnels.

⚠️ IMPORTANT : Les données sont anonymisées. Les tokens [PERSON_X], [COMPANY_Y], etc. remplacent les vraies informations. Utilise-les tels quels dans ton analyse.

═══════════════════════════════════════════════════════════════
DONNÉES PORTFOLIO (ANONYMISÉES)
═══════════════════════════════════════════════════════════════

TYPE DE PORTFOLIO : ${data.intentions.target}
PRIORITÉS : ${data.intentions.priorities.join(', ')}
INFOS PRATIQUES : ${data.intentions.practicalInfo.join(', ')}

NOMBRE DE PROJETS : ${data.projectsCount}
MÉDIAS : ${data.mediaStats.total} fichiers
  - Images : ${data.mediaStats.images}
  - Vidéos : ${data.mediaStats.videos}
  - PDFs : ${data.mediaStats.pdfs}
  - Textes : ${data.mediaStats.texts}

CONTENU TEXTUEL (ANONYMISÉ) :
${data.anonymizedText.slice(0, 4000)} ${data.anonymizedText.length > 4000 ? '...' : ''}

═══════════════════════════════════════════════════════════════
STYLES DISPONIBLES
═══════════════════════════════════════════════════════════════

1. **moderne** : Dynamique, bento grid, gradients, animations  
   Idéal pour : Freelance tech, startup, créatif digital

2. **classique** : Sobre, structuré, serif, bleu marine  
   Idéal pour : Consultant, expert, profession libérale

3. **authentique** : Chaleureux, tons terre, photos terrain  
   Idéal pour : Artisan, métier manuel, service local

4. **artistique** : Minimal, noir/blanc, 90% images  
   Idéal pour : Photographe, artiste, architecte

5. **vitrine** : Pratique, horaires, galerie produits  
   Idéal pour : Boutique, restaurant, commerce local

6. **formel** : Institutionnel, numéroté, serif, bleu/or  
   Idéal pour : Cabinet, notaire, institution

═══════════════════════════════════════════════════════════════
RÈGLES D'ANALYSE
═══════════════════════════════════════════════════════════════

1. Analyser le CONTENU (même anonymisé) pour comprendre le profil
2. Prendre en compte TYPE, PRIORITÉS et INFOS PRATIQUES
3. Évaluer la RICHESSE des médias disponibles
4. Identifier les INFORMATIONS MANQUANTES

RÈGLES DE CONFIANCE :
- Confiance HAUTE (≥60%) : Données riches (LinkedIn/Notion + 3+ projets + médias variés)
- Confiance BASSE (<60%) : Données limitées (intentions seules, peu de projets)

═══════════════════════════════════════════════════════════════
FORMAT DE RÉPONSE (JSON STRICT)
═══════════════════════════════════════════════════════════════

{
  "recommendedStyle": "moderne",
  "confidence": 75,
  "reasoning": "Basé sur le profil technique détecté et les 5 projets orientés développement web, je recommande le style Moderne car il met en valeur l'expertise digitale avec un design dynamique.",
  "missingInfo": ["Profil LinkedIn complet", "Descriptions détaillées des projets"],
  "alternativeStyle": "classique",
  "keyInsights": [
    "Profil technique confirmé (développement web)",
    "Portfolio orienté B2B/entreprises",
    "Expertise en [DOMAIN] clairement visible"
  ]
}

RÉPONDS UNIQUEMENT AVEC LE JSON, SANS AUTRE TEXTE.`;
}
```

---

## INTÉGRATION PORTFOLIOHUB

### Fichier modifié : `src/components/portfolio/PortfolioHub.tsx`

**Fonction `handleMediaImportComplete` mise à jour :**

```typescript
const handleMediaImportComplete = async (files: any[]) => {
  console.log('[MPF-4] Starting analysis with Groq...');
  
  // Sauvegarder médias
  const savedMedia = await saveMediaFiles(files);
  setMediaFiles(savedMedia);
  
  // Démarrer analyse
  setIsAnalyzing(true);
  setMpfScreen('analysis-loading');
  
  try {
    // 1. Charger les projets complets
    // @ts-ignore
    const allProjects = await window.electron.invoke('db-get-all-projects');
    const selectedProjects = allProjects.filter((p: any) => 
      projectImportData.selectedProjectIds.includes(p.id)
    );

    // 2. Agréger tout le texte
    const allText = [
      projectImportData.linkedInData?.rawContent || '',
      projectImportData.notionData?.pageContent || '',
      ...selectedProjects.map((p: any) => 
        [p.brief_text, p.challenge_text, p.solution_text]
          .filter(Boolean)
          .join('\n')
      )
    ].filter(Boolean).join('\n\n');

    // 3. Anonymiser localement (Ollama NER)
    const { anonymizedText, mappings } = await detectAndAnonymize(
      allText,
      portfolioId,
      null
    );

    // 4. Analyser avec Groq (distant) puis dé-anonymiser
    const analysisResult = await analyzePortfolioStyleWithGroq(
      {
        anonymizedText,
        intentions: intentionData,
        mediaStats: {
          images: savedMedia.filter(m => m.type === 'image').length,
          videos: savedMedia.filter(m => m.type === 'video').length,
          pdfs: savedMedia.filter(m => m.type === 'pdf').length,
          texts: savedMedia.filter(m => m.type === 'text').length,
          total: savedMedia.length
        },
        projectsCount: selectedProjects.length
      },
      portfolioId
    );

    setAnalysisResult(analysisResult);

    // Animation min 3.8s
    setTimeout(() => {
      setIsAnalyzing(false);
      setMpfScreen('style-suggestion');
    }, 3800);

  } catch (error) {
    console.error('[MPF-4] Analysis error:', error);
    
    // Fallback
    setAnalysisResult({
      recommendedStyle: 'moderne',
      confidence: 40,
      reasoning: 'Erreur lors de l\'analyse. Style par défaut suggéré.',
      missingInfo: ['Erreur technique'],
      alternativeStyle: null,
      keyInsights: []
    });
    
    setTimeout(() => {
      setIsAnalyzing(false);
      setMpfScreen('style-suggestion');
    }, 2000);
  }
};
```

---

## TESTS DE VALIDATION

### Scénario 1 : Données complètes + Groq actif
- ✅ LinkedIn + Notion + 3 projets + 10 médias
- ✅ Anonymisation détecte : 2 noms, 1 email, 1 entreprise
- ✅ Groq reçoit texte avec tokens `[PERSON_1]`, `[COMPANY_1]`
- ✅ Groq suggère style pertinent (confiance 75%)
- ✅ Dé-anonymisation restaure noms dans `reasoning` et `keyInsights`
- ✅ UI affiche mode "haute confiance"

### Scénario 2 : Données minimales + Groq actif
- ✅ Intentions seules, 0 projet, 0 média
- ✅ Anonymisation trouve peu d'entités
- ✅ Groq retourne confiance <60%
- ✅ UI affiche mode "basse confiance" avec tous les styles en grille

### Scénario 3 : Groq indisponible (clé API invalide / offline)
- ✅ Anonymisation fonctionne (local Ollama)
- ✅ Appel Groq échoue → Fallback automatique
- ✅ Style par défaut = "moderne" (confiance 40%)
- ✅ Message clair : "Analyse Groq indisponible"

### Scénario 4 : Ollama down (NER indisponible)
- ✅ Fallback anonymisation → Regex patterns
- ✅ Détection basique (emails, téléphones, montants)
- ✅ Groq fonctionne normalement
- ✅ Workflow complet sans blocage

---

## FICHIERS À CRÉER/MODIFIER

### Nouveau
1. `src/services/groqPortfolioService.ts`

### Modifié
1. `src/components/portfolio/PortfolioHub.tsx`
2. `main.cjs` (handlers IPC Groq)

### Réutilisé (existant du module CV)
1. `src/services/anonymizationService.ts` ✅
2. `groq-client.cjs` ✅
3. Handlers IPC anonymisation (main.cjs) ✅

---

## CONFIGURATION CLÉ API GROQ

**Dans Settings :**

```tsx
<div className="setting-section">
  <h3>🔑 Clé API Groq</h3>
  <input
    type="password"
    value={groqApiKey}
    onChange={(e) => setGroqApiKey(e.target.value)}
    placeholder="gsk_..."
  />
  <button onClick={async () => {
    // @ts-ignore
    const result = await window.electron.invoke('init-groq-client', groqApiKey);
    if (result.success) {
      alert('✅ Groq connecté !');
      // Sauvegarder en config chiffrée
    } else {
      alert(`❌ Erreur : ${result.error}`);
    }
  }}>
    Valider
  </button>
  <p className="help-text">
    Obtenez votre clé sur <a href="https://console.groq.com" target="_blank">console.groq.com</a>
  </p>
</div>
```

---

## SÉCURITÉ & RGPD

### ✅ Garanties

1. **Anonymisation locale** : Ollama NER tourne en local, aucune donnée brute envoyée
2. **Tokens uniques** : `[PERSON_1]` cohérent entre projets d'un même portfolio
3. **Mapping persisté** : Base SQLite chiffrée (AES-256)
4. **Dé-anonymisation sécurisée** : Reconstruction uniquement côté client
5. **Fallback gracieux** : Si Groq down, pas de blocage utilisateur

### ⚠️ Mentions légales

**À ajouter dans l'UI ou CGU :**

> "SOUVERAIN utilise l'API Groq pour l'analyse intelligente de vos portfolios. Vos données sont systématiquement anonymisées (noms, emails, entreprises masqués) avant envoi. Aucune donnée personnelle brute n'est transmise à Groq. Vous pouvez désactiver cette fonctionnalité et utiliser uniquement l'analyse locale."

---

**Fin du brief MPF-4 (Version Groq API)**
