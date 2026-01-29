# BRIEF AUTONOME - Module Job Matching

**Agent:** Ralph (Gemini CLI)
**Durée estimée:** 1h de travail autonome
**Contexte:** SOUVERAIN V17 - Application Electron avec CALM-UI

---

## 🎯 Objectif

Créer un module **Job Matching** qui permet à l'utilisateur de :
1. Importer une offre d'emploi (URL ou copier-coller)
2. Analyser la compatibilité avec son profil CV
3. Obtenir un score de matching + recommandations

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
- `src/services/groqPortfolioGeneratorService.ts` - Pattern appel Groq

---

## 🏗 Architecture à Créer

### Structure fichiers

```
src/components/job-matching/
├── JobMatchingHub.tsx        # Page principale du module
├── JobOfferInput.tsx         # Import offre (URL ou paste)
├── ProfileSelector.tsx       # Sélection CV à comparer
├── MatchingAnalysis.tsx      # Écran d'analyse en cours
├── MatchingResult.tsx        # Résultats avec score
└── RecommendationsPanel.tsx  # Recommandations d'amélioration

src/services/
└── jobMatchingService.ts     # Service analyse Groq
```

### Handlers IPC à ajouter dans `main.cjs`

```javascript
// Récupérer tous les CV de l'utilisateur
ipcMain.handle('db-get-all-cvs', async () => {
  return db.cvs_getAll();
});

// Sauvegarder une offre analysée
ipcMain.handle('db-save-job-offer', async (event, offer) => {
  return db.jobOffers_save(offer);
});

// Récupérer l'historique des matchings
ipcMain.handle('db-get-matching-history', async () => {
  return db.matchings_getAll();
});

// Sauvegarder un résultat de matching
ipcMain.handle('db-save-matching-result', async (event, result) => {
  return db.matchings_save(result);
});
```

---

## 📐 Spécifications Fonctionnelles

### Écran 1 : JobMatchingHub

```
┌─────────────────────────────────────────────────────────────────┐
│  Job Matching                                    [Historique →] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────┐    ┌─────────────────────┐            │
│  │                     │    │                     │            │
│  │   📄 IMPORTER       │    │   📊 HISTORIQUE     │            │
│  │   UNE OFFRE         │    │   DES MATCHINGS     │            │
│  │                     │    │                     │            │
│  │   Analysez une      │    │   Retrouvez vos     │            │
│  │   offre d'emploi    │    │   analyses          │            │
│  │                     │    │   précédentes       │            │
│  └─────────────────────┘    └─────────────────────┘            │
│                                                                 │
│  Derniers matchings :                                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Dev Full Stack @ Startup XYZ    85%    Il y a 2 jours    │  │
│  │ Lead Dev @ BigCorp              72%    Il y a 1 semaine  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Écran 2 : JobOfferInput

**Deux modes d'import :**

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Retour              Importer une offre                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Comment voulez-vous importer l'offre ?                        │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  🔗 Depuis une URL                                       │   │
│  │                                                          │   │
│  │  [https://linkedin.com/jobs/view/123456789...         ]  │   │
│  │                                                          │   │
│  │  Supporte : LinkedIn, Indeed, Welcome to the Jungle     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ─────────────────── OU ───────────────────                    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  📋 Copier-coller le texte                               │   │
│  │                                                          │   │
│  │  [                                                    ]  │   │
│  │  [  Collez ici le contenu de l'offre d'emploi...     ]  │   │
│  │  [                                                    ]  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                                          [Analyser l'offre →]   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Écran 3 : ProfileSelector

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Retour              Sélectionner votre CV                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Offre : Développeur Full Stack - Startup XYZ                  │
│                                                                 │
│  Quel CV voulez-vous comparer ?                                │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ○  CV Principal (mis à jour il y a 3 jours)             │   │
│  │ ○  CV Tech (mis à jour il y a 2 semaines)               │   │
│  │ ○  CV Management (mis à jour il y a 1 mois)             │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Pas de CV ? [Créer un CV →]                                   │
│                                                                 │
│                                          [Lancer l'analyse →]   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Écran 4 : MatchingAnalysis (Loading)

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                         🔍                                      │
│                                                                 │
│                 Analyse en cours...                             │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ✓ Extraction des compétences requises                   │   │
│  │ ✓ Analyse de votre profil                               │   │
│  │ ● Calcul du score de compatibilité...                   │   │
│  │ ○ Génération des recommandations                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ████████████░░░░░░░░  60%                                     │
│                                                                 │
│  🔒 Vos données sont anonymisées avant analyse                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Écran 5 : MatchingResult

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Retour              Résultat du matching                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Développeur Full Stack @ Startup XYZ                          │
│                                                                 │
│         ┌─────────────────────┐                                │
│         │                     │                                │
│         │        85%          │   Excellente compatibilité !   │
│         │     ███████████     │                                │
│         │                     │                                │
│         └─────────────────────┘                                │
│                                                                 │
│  Points forts (4)                               Points à (2)   │
│  ┌────────────────────────────┐  ┌────────────────────────────┐│
│  │ ✓ React / TypeScript       │  │ ⚠ Kubernetes (non mentionné)│
│  │ ✓ 5+ ans d'expérience      │  │ ⚠ AWS (basique requis)     ││
│  │ ✓ Méthodologie Agile       │  │                            ││
│  │ ✓ Anglais courant          │  │                            ││
│  └────────────────────────────┘  └────────────────────────────┘│
│                                                                 │
│  [Voir les recommandations →]    [Nouvelle analyse]            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Écran 6 : RecommendationsPanel

```
┌─────────────────────────────────────────────────────────────────┐
│  Recommandations pour améliorer votre candidature              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  🎯 Pour cette offre spécifiquement :                          │
│                                                                 │
│  1. Mentionnez votre expérience Docker dans votre CV           │
│     → Kubernetes est demandé, Docker est une base solide       │
│                                                                 │
│  2. Ajoutez une certification AWS                              │
│     → Même un niveau "Practitioner" serait un plus            │
│                                                                 │
│  3. Mettez en avant votre projet [Projet X]                    │
│     → Il correspond exactement au stack demandé               │
│                                                                 │
│  📝 Optimisations de votre CV :                                │
│                                                                 │
│  • Réorganiser la section "Compétences" par pertinence        │
│  • Ajouter des métriques chiffrées à vos expériences          │
│                                                                 │
│  [Appliquer au CV →]    [Exporter en PDF]    [Fermer]         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 Service d'Analyse

### `src/services/jobMatchingService.ts`

```typescript
import { anonymizeText, deanonymize } from './anonymizationService';

interface JobOffer {
  id: string;
  title: string;
  company: string;
  rawContent: string;
  extractedSkills?: string[];
  extractedRequirements?: string[];
}

interface CVProfile {
  id: string;
  name: string;
  skills: string[];
  experiences: any[];
  education: any[];
}

interface MatchingResult {
  score: number; // 0-100
  category: 'excellent' | 'good' | 'average' | 'poor';
  matchedSkills: string[];
  missingSkills: string[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  optimizations: string[];
}

const MATCHING_PROMPT = `Tu es un expert en recrutement et analyse de CV.

OFFRE D'EMPLOI (anonymisée) :
{JOB_OFFER}

PROFIL CANDIDAT (anonymisé) :
{CV_PROFILE}

Analyse la compatibilité et réponds en JSON :

{
  "score": <0-100>,
  "category": "excellent|good|average|poor",
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["skill1", "skill2"],
  "strengths": ["point fort 1", "point fort 2"],
  "weaknesses": ["point faible 1"],
  "recommendations": [
    "Recommandation spécifique 1",
    "Recommandation spécifique 2"
  ],
  "optimizations": [
    "Optimisation CV 1",
    "Optimisation CV 2"
  ]
}

Règles de scoring :
- 85-100 : Excellente compatibilité (category: excellent)
- 70-84 : Bonne compatibilité (category: good)  
- 50-69 : Compatibilité moyenne (category: average)
- 0-49 : Faible compatibilité (category: poor)

Sois précis et actionnable dans tes recommandations.`;

export async function analyzeJobMatching(
  jobOffer: JobOffer,
  cvProfile: CVProfile
): Promise<MatchingResult> {
  // 1. Anonymiser les données
  const { anonymizedText: anonJob, entityMap: jobMap } = await anonymizeText(
    JSON.stringify(jobOffer)
  );
  const { anonymizedText: anonCV, entityMap: cvMap } = await anonymizeText(
    JSON.stringify(cvProfile)
  );

  // 2. Construire le prompt
  const prompt = MATCHING_PROMPT
    .replace('{JOB_OFFER}', anonJob)
    .replace('{CV_PROFILE}', anonCV);

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
    
    // 4. Parser le JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid response');
    
    const result: MatchingResult = JSON.parse(jsonMatch[0]);
    
    // 5. Dé-anonymiser les recommandations si nécessaire
    // (généralement pas nécessaire car ce sont des conseils génériques)
    
    return result;

  } catch (error) {
    console.error('Erreur matching:', error);
    // Fallback basique
    return {
      score: 50,
      category: 'average',
      matchedSkills: [],
      missingSkills: [],
      strengths: ['Analyse non disponible'],
      weaknesses: [],
      recommendations: ['Veuillez réessayer'],
      optimizations: [],
    };
  }
}

export async function extractJobOfferFromURL(url: string): Promise<Partial<JobOffer>> {
  // TODO: Implémenter le scraping (ou demander copier-coller pour V1)
  throw new Error('URL scraping not implemented - use paste mode');
}
```

---

## 🎨 Règles CALM-UI à Respecter

```tsx
// ✅ Utiliser CalmCard pour les options
<CalmCard
  title="Importer une offre"
  description="Analysez une offre d'emploi"
  icon="📄"
  themeColor="blue"
  onClick={() => setStep('input')}
/>

// ✅ Utiliser CalmModal pour les détails
<CalmModal isOpen={showDetails} onClose={closeDetails} title="Détails">
  ...
</CalmModal>

// ✅ Utiliser GlassInput/GlassTextArea
<GlassInput
  label="URL de l'offre"
  placeholder="https://linkedin.com/jobs/..."
  value={url}
  onChange={(e) => setUrl(e.target.value)}
/>

// ✅ Utiliser useToast pour les notifications
const { success, error } = useToast();
success('Analyse terminée', 'Score: 85%');

// ✅ Utiliser Framer Motion
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
>
```

---

## ✅ Checklist de Validation

Avant de considérer le module terminé :

- [ ] `JobMatchingHub.tsx` affiche les CalmCards et l'historique
- [ ] `JobOfferInput.tsx` permet URL ou copier-coller
- [ ] `ProfileSelector.tsx` liste les CV disponibles
- [ ] `MatchingAnalysis.tsx` affiche la progression
- [ ] `MatchingResult.tsx` affiche le score et les détails
- [ ] `RecommendationsPanel.tsx` affiche les conseils
- [ ] `jobMatchingService.ts` appelle Groq avec anonymisation
- [ ] Handlers IPC ajoutés dans `main.cjs`
- [ ] Navigation ajoutée dans la sidebar
- [ ] Tous les composants utilisent CALM-UI
- [ ] Dark/Light mode fonctionne

---

## 🚀 Pour Commencer

1. Lire `docs/CALM-UI.md` pour le design system
2. Regarder `src/components/portfolio/` comme référence
3. Créer le dossier `src/components/job-matching/`
4. Commencer par `JobMatchingHub.tsx`
5. Implémenter écran par écran

**Priorité** : Avoir un flux fonctionnel même basique, plutôt qu'un seul écran parfait.

---

*Brief généré le 27 janvier 2026 pour travail autonome*
