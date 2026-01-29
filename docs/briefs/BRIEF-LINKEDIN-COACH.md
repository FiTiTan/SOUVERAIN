# BRIEF AUTONOME - Module Coach LinkedIn

**Agent:** Ralph (Gemini CLI)
**Durée estimée:** 1h de travail autonome
**Contexte:** SOUVERAIN V17 - Application Electron avec CALM-UI

---

## 🎯 Objectif

Créer un module **Coach LinkedIn** qui permet à l'utilisateur de :
1. Importer son profil LinkedIn (URL ou copier-coller)
2. Obtenir une analyse complète de son profil
3. Recevoir des recommandations d'amélioration section par section
4. Générer des suggestions de contenu optimisé

---

## 📋 Contexte Projet

### Stack (à respecter impérativement)
- **Electron** + React 18 + TypeScript
- **CALM-UI** : CalmCard, CalmModal, GlassForms, useToast
- **ThemeContext** : Toujours utiliser `const { theme } = useTheme()`
- **Framer Motion** : Animations entrance/exit
- **IPC** : `window.electron.invoke('handler-name', params)`
- **IA** : Ollama (local) pour anonymisation, Groq API pour analyse

### Fichiers de référence
- `docs/CALM-UI.md` - Design system complet
- `docs/ARCHITECTURE.md` - Patterns de code
- `src/components/ui/` - Composants à réutiliser
- `src/components/portfolio/master/LinkedInImportModal.tsx` - Import LinkedIn existant

---

## 🏗 Architecture à Créer

### Structure fichiers

```
src/components/linkedin-coach/
├── LinkedInCoachHub.tsx       # Page principale du module
├── ProfileImport.tsx          # Import profil (URL ou paste)
├── ProfileAnalysis.tsx        # Écran d'analyse en cours
├── ProfileScorecard.tsx       # Score global + par section
├── SectionDetail.tsx          # Détail d'une section avec recos
├── ContentSuggestions.tsx     # Suggestions de contenu IA
└── BeforeAfterPreview.tsx     # Comparaison avant/après

src/services/
└── linkedinCoachService.ts    # Service analyse Groq
```

### Handlers IPC à ajouter dans `main.cjs`

```javascript
// Sauvegarder un profil LinkedIn analysé
ipcMain.handle('db-save-linkedin-profile', async (event, profile) => {
  return db.linkedinProfiles_save(profile);
});

// Récupérer l'historique des analyses
ipcMain.handle('db-get-linkedin-analyses', async () => {
  return db.linkedinAnalyses_getAll();
});

// Sauvegarder une analyse
ipcMain.handle('db-save-linkedin-analysis', async (event, analysis) => {
  return db.linkedinAnalyses_save(analysis);
});
```

---

## 📐 Spécifications Fonctionnelles

### Écran 1 : LinkedInCoachHub

```
┌─────────────────────────────────────────────────────────────────┐
│  Coach LinkedIn                                  [Historique →] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Optimisez votre présence LinkedIn avec l'IA                   │
│                                                                 │
│  ┌─────────────────────┐    ┌─────────────────────┐            │
│  │                     │    │                     │            │
│  │   🔍 ANALYSER       │    │   ✨ GÉNÉRER        │            │
│  │   MON PROFIL        │    │   DU CONTENU        │            │
│  │                     │    │                     │            │
│  │   Score + Recos     │    │   Posts, Headline   │            │
│  │   personnalisées    │    │   About optimisé    │            │
│  └─────────────────────┘    └─────────────────────┘            │
│                                                                 │
│  Dernière analyse : 85/100 - Il y a 3 jours                    │
│  [Voir les détails →]                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Écran 2 : ProfileImport

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Retour              Importer votre profil                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Comment voulez-vous importer votre profil ?                   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  🔗 Depuis l'URL de votre profil                         │   │
│  │                                                          │   │
│  │  [https://linkedin.com/in/votre-profil              ]    │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ─────────────────── OU ───────────────────                    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  📋 Copier-coller votre profil                           │   │
│  │                                                          │   │
│  │  Allez sur votre profil LinkedIn, sélectionnez tout     │   │
│  │  le texte (Ctrl+A) et collez-le ici :                   │   │
│  │                                                          │   │
│  │  [                                                    ]  │   │
│  │  [                                                    ]  │   │
│  │  [                                                    ]  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                                        [Analyser mon profil →]  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Écran 3 : ProfileAnalysis (Loading)

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                         🔍                                      │
│                                                                 │
│              Analyse de votre profil LinkedIn                   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ✓ Extraction des informations                           │   │
│  │ ✓ Analyse de la headline                                │   │
│  │ ✓ Analyse du résumé (About)                             │   │
│  │ ● Analyse des expériences...                            │   │
│  │ ○ Analyse des compétences                               │   │
│  │ ○ Calcul du score global                                │   │
│  │ ○ Génération des recommandations                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ████████████████░░░░  75%                                     │
│                                                                 │
│  🔒 Vos données sont anonymisées avant analyse                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Écran 4 : ProfileScorecard

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Retour              Votre Score LinkedIn                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│              ┌───────────────────┐                              │
│              │                   │                              │
│              │       85/100      │     Très bon profil !       │
│              │    ████████████   │     Top 15% de votre        │
│              │                   │     secteur                  │
│              └───────────────────┘                              │
│                                                                 │
│  Détail par section :                                          │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ Photo de profil      ████████████████████  95/100   [→]   ││
│  │ Headline             ████████████░░░░░░░░  65/100   [→]   ││
│  │ About (Résumé)       ████████████████░░░░  80/100   [→]   ││
│  │ Expériences          ████████████████████  90/100   [→]   ││
│  │ Compétences          ████████████████░░░░  75/100   [→]   ││
│  │ Recommandations      ████████░░░░░░░░░░░░  40/100   [→]   ││
│  │ Activité/Posts       ████████████░░░░░░░░  60/100   [→]   ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                 │
│  🎯 Priorité : Améliorer votre Headline (+20 points possible)  │
│                                                                 │
│  [Voir toutes les recommandations →]                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Écran 5 : SectionDetail

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Retour              Headline                    65/100       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Votre headline actuelle :                                     │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ "Développeur Full Stack | React | Node.js"              │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ❌ Problèmes identifiés :                                     │
│  • Trop générique (des milliers de profils similaires)         │
│  • Ne mentionne pas la valeur apportée                         │
│  • Pas de différenciation                                      │
│                                                                 │
│  ✅ Bonnes pratiques :                                         │
│  • Mentionner votre spécialité ou niche                        │
│  • Inclure un résultat chiffré si possible                     │
│  • Montrer votre personnalité                                  │
│                                                                 │
│  💡 Suggestions générées par l'IA :                            │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 1. "Full Stack Dev | J'aide les startups à scaler      │   │
│  │    leurs apps React de 0 à 100k users"          [Copier]│   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ 2. "Développeur React/Node passionné | Ex-Startup      │   │
│  │    → Scale-up | Open source contributor"        [Copier]│   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ 3. "Tech Lead Full Stack | +50 apps livrées |          │   │
│  │    Performance & Clean Code"                    [Copier]│   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [Régénérer des suggestions]    [Section suivante : About →]   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Écran 6 : ContentSuggestions

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Retour              Générateur de Contenu                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Que voulez-vous générer ?                                     │
│                                                                 │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐   │
│  │ Headline  │  │  About    │  │   Post    │  │ Message   │   │
│  │  optimisé │  │ optimisé  │  │ LinkedIn  │  │ connexion │   │
│  └───────────┘  └───────────┘  └───────────┘  └───────────┘   │
│                                                                 │
│  Contexte (optionnel) :                                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Ex: "Je viens de terminer un projet de migration..."   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Ton souhaité :                                                │
│  ○ Professionnel   ○ Inspirant   ○ Décontracté   ○ Expert     │
│                                                                 │
│                                              [Générer →]        │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Résultat :                                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🚀 Je viens de terminer une migration de 2M de lignes  │   │
│  │ de code legacy vers une architecture moderne.           │   │
│  │                                                          │   │
│  │ Voici les 3 leçons que j'en tire :                      │   │
│  │                                                          │   │
│  │ 1️⃣ ...                                                  │   │
│  │ 2️⃣ ...                                                  │   │
│  │ 3️⃣ ...                                                  │   │
│  │                                                          │   │
│  │ Et vous, quelle a été votre plus gros défi technique ?  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [Copier]    [Régénérer]    [Sauvegarder]                      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Service d'Analyse

### `src/services/linkedinCoachService.ts`

```typescript
import { anonymizeText, deanonymize } from './anonymizationService';

interface LinkedInProfile {
  id: string;
  rawContent: string;
  headline?: string;
  about?: string;
  experiences?: any[];
  skills?: string[];
  recommendations?: number;
}

interface SectionScore {
  name: string;
  score: number;
  maxScore: number;
  issues: string[];
  tips: string[];
}

interface ProfileAnalysis {
  globalScore: number;
  percentile: number; // Top X% du secteur
  sections: SectionScore[];
  priorityAction: string;
  suggestions: {
    headline: string[];
    about: string[];
  };
}

const ANALYSIS_PROMPT = `Tu es un expert LinkedIn et personal branding.

PROFIL LINKEDIN (anonymisé) :
{PROFILE}

Analyse ce profil et réponds en JSON :

{
  "globalScore": <0-100>,
  "percentile": <1-100>,
  "sections": [
    {
      "name": "Photo de profil",
      "score": <0-100>,
      "maxScore": 100,
      "issues": ["problème 1", "problème 2"],
      "tips": ["conseil 1", "conseil 2"]
    },
    {
      "name": "Headline",
      "score": <0-100>,
      "maxScore": 100,
      "issues": [],
      "tips": []
    },
    {
      "name": "About (Résumé)",
      "score": <0-100>,
      "maxScore": 100,
      "issues": [],
      "tips": []
    },
    {
      "name": "Expériences",
      "score": <0-100>,
      "maxScore": 100,
      "issues": [],
      "tips": []
    },
    {
      "name": "Compétences",
      "score": <0-100>,
      "maxScore": 100,
      "issues": [],
      "tips": []
    },
    {
      "name": "Recommandations",
      "score": <0-100>,
      "maxScore": 100,
      "issues": [],
      "tips": []
    },
    {
      "name": "Activité/Posts",
      "score": <0-100>,
      "maxScore": 100,
      "issues": [],
      "tips": []
    }
  ],
  "priorityAction": "Action prioritaire pour gagner le plus de points",
  "suggestions": {
    "headline": ["suggestion 1", "suggestion 2", "suggestion 3"],
    "about": ["version optimisée du résumé"]
  }
}

Critères de scoring :
- Photo : Professionnelle, bien cadrée, sourire
- Headline : Spécifique, valeur ajoutée, différenciant
- About : Storytelling, résultats chiffrés, CTA
- Expériences : Verbes d'action, métriques, pertinence
- Compétences : Pertinentes, endorsées, ordonnées
- Recommandations : Nombre et qualité
- Activité : Fréquence, engagement, valeur

Sois précis et actionnable.`;

const CONTENT_GENERATION_PROMPT = `Tu es un expert en copywriting LinkedIn.

PROFIL (anonymisé) :
{PROFILE}

TYPE DE CONTENU : {CONTENT_TYPE}
CONTEXTE : {CONTEXT}
TON : {TONE}

Génère le contenu demandé. Sois engageant, authentique et professionnel.
Utilise des emojis avec parcimonie.
Pour les posts, structure avec des sauts de ligne pour la lisibilité.

Réponds uniquement avec le contenu généré, sans explication.`;

export async function analyzeLinkedInProfile(
  profile: LinkedInProfile
): Promise<ProfileAnalysis> {
  // 1. Anonymiser
  const { anonymizedText, entityMap } = await anonymizeText(
    JSON.stringify(profile)
  );

  // 2. Construire le prompt
  const prompt = ANALYSIS_PROMPT.replace('{PROFILE}', anonymizedText);

  // 3. Appeler Groq
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid response');
    
    const result: ProfileAnalysis = JSON.parse(jsonMatch[0]);
    
    // Dé-anonymiser les suggestions
    result.suggestions.headline = result.suggestions.headline.map(
      s => deanonymize(s, entityMap)
    );
    result.suggestions.about = result.suggestions.about.map(
      s => deanonymize(s, entityMap)
    );
    
    return result;

  } catch (error) {
    console.error('Erreur analyse LinkedIn:', error);
    throw error;
  }
}

export async function generateLinkedInContent(
  profile: LinkedInProfile,
  contentType: 'headline' | 'about' | 'post' | 'connection_message',
  context: string,
  tone: 'professional' | 'inspiring' | 'casual' | 'expert'
): Promise<string> {
  const { anonymizedText, entityMap } = await anonymizeText(
    JSON.stringify(profile)
  );

  const prompt = CONTENT_GENERATION_PROMPT
    .replace('{PROFILE}', anonymizedText)
    .replace('{CONTENT_TYPE}', contentType)
    .replace('{CONTEXT}', context || 'Aucun contexte spécifique')
    .replace('{TONE}', tone);

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    let content = data.choices[0].message.content;
    
    // Dé-anonymiser
    content = deanonymize(content, entityMap);
    
    return content;

  } catch (error) {
    console.error('Erreur génération contenu:', error);
    throw error;
  }
}
```

---

## 🎨 Règles CALM-UI à Respecter

```tsx
// ✅ Score visuel avec couleurs sémantiques
const getScoreColor = (score: number) => {
  if (score >= 85) return theme.semantic.success;
  if (score >= 70) return theme.score.good;
  if (score >= 50) return theme.semantic.warning;
  return theme.semantic.error;
};

// ✅ Barres de progression
<div style={{
  width: '100%',
  height: '8px',
  backgroundColor: theme.bg.tertiary,
  borderRadius: '4px',
  overflow: 'hidden',
}}>
  <motion.div
    initial={{ width: 0 }}
    animate={{ width: `${score}%` }}
    style={{
      height: '100%',
      backgroundColor: getScoreColor(score),
    }}
  />
</div>

// ✅ Cards cliquables pour les sections
<CalmCard
  title="Headline"
  description="65/100 - À améliorer"
  icon="✏️"
  themeColor="orange"
  onClick={() => setSelectedSection('headline')}
/>

// ✅ Copier dans le presse-papier avec feedback
const handleCopy = (text: string) => {
  navigator.clipboard.writeText(text);
  success('Copié !', 'Le contenu est dans votre presse-papier');
};
```

---

## ✅ Checklist de Validation

Avant de considérer le module terminé :

- [ ] `LinkedInCoachHub.tsx` affiche les 2 CalmCards principales
- [ ] `ProfileImport.tsx` permet URL ou copier-coller
- [ ] `ProfileAnalysis.tsx` affiche la progression (7 étapes)
- [ ] `ProfileScorecard.tsx` affiche le score global + par section
- [ ] `SectionDetail.tsx` affiche problèmes + tips + suggestions
- [ ] `ContentSuggestions.tsx` génère du contenu selon le type/ton
- [ ] `linkedinCoachService.ts` appelle Groq avec anonymisation
- [ ] Handlers IPC ajoutés dans `main.cjs`
- [ ] Navigation ajoutée dans la sidebar
- [ ] Boutons "Copier" fonctionnels
- [ ] Tous les composants utilisent CALM-UI
- [ ] Dark/Light mode fonctionne

---

## 🚀 Pour Commencer

1. Lire `docs/CALM-UI.md` pour le design system
2. Regarder `src/components/portfolio/master/LinkedInImportModal.tsx` comme référence
3. Créer le dossier `src/components/linkedin-coach/`
4. Commencer par `LinkedInCoachHub.tsx`
5. Implémenter l'analyse avant la génération de contenu

**Priorité** : Score + Recommandations d'abord, génération de contenu ensuite.

---

*Brief généré le 27 janvier 2026 pour travail autonome*
