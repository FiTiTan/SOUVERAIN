# CORRECTIONS PRIORITÉ 2 - BRIEF COMPLET

**Date:** 23 janvier 2026
**Module:** Portfolio SOUVERAIN
**Prérequis:** Priorité 1 complétée (IPC, Anonymisation, Palettes)

---

## CONTEXTE

Les corrections critiques de Priorité 1 sont terminées. Ce document couvre les corrections de Priorité 2.

### État actuel
- ✅ Priorité 1 complétée (78% conformité)
- ⏳ Priorité 2 à faire (Important)

### Objectif
- Conformité Master Plan : 78% → 90%

---

## CORRECTION 2.1 - FORMULAIRE D'INTENTION

### Objectif
Capturer les intentions de l'utilisateur dès le premier accès au portfolio pour personnaliser l'expérience et guider la suggestion IA.

### Fichiers à créer

#### 1. `src/components/portfolio/intention/IntentionForm.tsx`

Composant multi-étapes avec 5 questions :

1. **Objectif principal** — Trouver clients / Montrer travail / Transition / Personal branding
2. **Audience cible** — B2B / B2C / Recruteurs / Investisseurs / Mixte
3. **Type de contenu** — Visuel / Technique / Service / Produit / Contenu (multi-sélection)
4. **Ton souhaité** — Professionnel / Créatif / Chaleureux / Expert / Premium
5. **Secteur** — Tech / Créatif / Artisanat / Conseil / Commerce / Santé / Juridique / Éducation

**Structure du composant :**
- State `step` (1-5) et `formData`
- Progress bar en haut
- Boutons radio/checkbox stylisés Tailwind
- Navigation Retour/Suivant
- Option "Passer cette étape" au step 1

**Props :**
```typescript
interface IntentionFormProps {
  onComplete: (data: IntentionFormData) => void;
  onSkip: () => void;
  initialData?: IntentionFormData | null;
}
```

#### 2. `src/components/portfolio/intention/IntentionSummary.tsx`

Affiche un résumé des intentions avec :
- 5 lignes avec icônes (Target, Users, Layers, MessageSquare, Briefcase)
- Bouton "Modifier" qui réouvre le formulaire
- Style card zinc-900 avec border zinc-800

#### 3. `src/services/intentionService.ts`

```typescript
export interface IntentionFormData {
  objective: string;
  targetAudience: string;
  contentType: string[];
  desiredTone: string;
  sector: string;
}

// Fonctions à implémenter :
export async function saveIntention(portfolioId: string, data: IntentionFormData): Promise<void>
export async function getIntention(portfolioId: string): Promise<IntentionFormData | null>
export async function hasCompletedIntention(portfolioId: string): Promise<boolean>
export function intentionToAIContext(data: IntentionFormData): string
```

### Intégration dans PortfolioHub.tsx

```tsx
// Ajouter au composant :
const [showIntentionForm, setShowIntentionForm] = useState(false);
const [intentionData, setIntentionData] = useState<IntentionFormData | null>(null);

useEffect(() => {
  const checkIntention = async () => {
    if (portfolioId) {
      const completed = await hasCompletedIntention(portfolioId);
      if (!completed) {
        setShowIntentionForm(true);
      } else {
        const data = await getIntention(portfolioId);
        setIntentionData(data);
      }
    }
  };
  checkIntention();
}, [portfolioId]);

// Afficher le formulaire en plein écran si showIntentionForm === true
```

### Tests de validation
- ✅ Premier accès portfolio → Formulaire intention affiché
- ✅ Remplir les 5 étapes → Données sauvegardées en DB
- ✅ Retour sur portfolio → Formulaire non affiché
- ✅ IntentionSummary affiche les données correctement
- ✅ Bouton "Modifier" → Réouvre le formulaire

---

## CORRECTION 2.2 - SUGGESTION IA DE STYLE INTÉGRÉE

### Objectif
Appeler automatiquement `suggestStyleWithOllama()` au chargement du StyleSelector.

### Modification de StyleSelector.tsx

Ajouter au composant :

```tsx
const [suggestion, setSuggestion] = useState<StyleSuggestion | null>(null);
const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(true);

useEffect(() => {
  const loadSuggestion = async () => {
    setIsLoadingSuggestion(true);
    try {
      const intention = await getIntention(portfolioId);
      const result = await suggestStyleWithOllama(
        externalAccounts || [],
        intention,
        projectsCount || 0,
        mediaStats || { images: 0, videos: 0, documents: 0 }
      );
      setSuggestion(result);
    } catch (error) {
      console.error('Erreur suggestion style:', error);
    } finally {
      setIsLoadingSuggestion(false);
    }
  };
  loadSuggestion();
}, [portfolioId]);
```

### UI de la suggestion

Ajouter en haut du sélecteur :

```tsx
{isLoadingSuggestion ? (
  <div className="mb-6 p-4 bg-zinc-800/50 rounded-lg animate-pulse">
    <div className="h-4 bg-zinc-700 rounded w-48 mb-2"></div>
    <div className="h-3 bg-zinc-700 rounded w-64"></div>
  </div>
) : suggestion && (
  <div className="mb-6 p-4 bg-violet-500/10 border border-violet-500/30 rounded-lg">
    <div className="flex items-start justify-between">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="w-4 h-4 text-violet-400" />
          <span className="text-sm font-medium text-violet-300">Suggestion IA</span>
          <span className="text-xs text-violet-400/60">{Math.round(suggestion.confidence * 100)}%</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-1">
          Style {STYLE_PALETTES[suggestion.suggestedStyle]?.name}
        </h3>
        <p className="text-sm text-zinc-400">{suggestion.reasoning}</p>
      </div>
      <button
        onClick={() => onSelectStyle(suggestion.suggestedStyle)}
        className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-500"
      >
        Appliquer
      </button>
    </div>
  </div>
)}
```

### Tests de validation
- ✅ Ouvrir StyleSelector → Loader affiché
- ✅ Suggestion chargée → Bloc violet avec suggestion
- ✅ Cliquer "Appliquer" → Style sélectionné
- ✅ Sans formulaire intention → Fallback heuristique fonctionne

---

## CORRECTION 2.3 - PREVIEWS DÉDIÉS

### Objectif
Prévisualiser un projet individuel ou le portfolio complet avant export.

### Fichiers à créer

#### 1. `src/components/portfolio/preview/PreviewFrame.tsx`

Composant iframe avec :
- Header avec titre et dimensions
- Switcher Desktop (1280×800) / Tablet (768×1024) / Mobile (375×667)
- Boutons Fullscreen et Fermer
- Zone centrale avec iframe scalée
- Border-radius adapté au device (24px mobile, 12px tablet, 0 desktop)

**Props :**
```typescript
interface PreviewFrameProps {
  htmlContent: string;
  title: string;
  onClose: () => void;
}
```

**Logique :**
```typescript
useEffect(() => {
  if (iframeRef.current) {
    const doc = iframeRef.current.contentDocument;
    if (doc) {
      doc.open();
      doc.write(htmlContent);
      doc.close();
    }
  }
}, [htmlContent]);
```

#### 2. `src/components/portfolio/preview/PreviewProject.tsx`

- Charge le projet et génère le HTML via `generateProjectHTML()`
- Affiche loader pendant génération
- Affiche erreur si échec
- Passe le HTML à PreviewFrame

**Props :**
```typescript
interface PreviewProjectProps {
  project: Project;
  styleId: string;
  portfolioId: string;
  onClose: () => void;
}
```

#### 3. `src/components/portfolio/preview/PreviewPortfolio.tsx`

- Charge le portfolio complet et génère le HTML via `generatePortfolioHTML()`
- Même logique que PreviewProject

#### 4. Compléter `src/services/htmlExporter.ts`

Ajouter deux fonctions :

```typescript
export async function generateProjectHTML(
  project: any,
  palette: StylePalette,
  portfolioId: string
): Promise<string>

export async function generatePortfolioHTML(
  portfolio: any,
  palette: StylePalette
): Promise<string>
```

**Contenu généré :**
- DOCTYPE + HTML5 valide
- Import Google Fonts selon palette
- CSS inline avec design tokens (colors, typography, spacing, borders)
- Structure : Hero → Sections Brief/Challenge/Solution (projet) ou Hero → Projects Grid → Accounts (portfolio)
- Footer "Généré avec SOUVERAIN"

### Intégration bouton "Aperçu"

Dans `ProjectCard.tsx` :
```tsx
import { Eye } from 'lucide-react';
import { PreviewProject } from '../preview/PreviewProject';

const [showPreview, setShowPreview] = useState(false);

// Dans le render :
<button onClick={() => setShowPreview(true)} title="Aperçu">
  <Eye className="w-4 h-4" />
</button>

{showPreview && (
  <PreviewProject
    project={project}
    styleId={currentStyleId}
    portfolioId={portfolioId}
    onClose={() => setShowPreview(false)}
  />
)}
```

### Tests de validation
- ✅ Bouton "Aperçu" visible sur chaque carte projet
- ✅ Clic → Modal PreviewFrame s'ouvre
- ✅ Switcher Desktop/Tablet/Mobile fonctionne
- ✅ HTML généré respecte la palette sélectionnée
- ✅ Preview portfolio complet fonctionne

---

## FICHIERS À CRÉER (PRIORITÉ 2)

1. `src/components/portfolio/intention/IntentionForm.tsx`
2. `src/components/portfolio/intention/IntentionSummary.tsx`
3. `src/services/intentionService.ts`
4. `src/components/portfolio/preview/PreviewFrame.tsx`
5. `src/components/portfolio/preview/PreviewProject.tsx`
6. `src/components/portfolio/preview/PreviewPortfolio.tsx`

## FICHIERS À MODIFIER (PRIORITÉ 2)

1. `src/components/portfolio/PortfolioHub.tsx` — Intégrer formulaire intention
2. `src/components/portfolio/styles/StyleSelector.tsx` — Ajouter suggestion auto
3. `src/components/portfolio/projects/ProjectCard.tsx` — Ajouter bouton aperçu
4. `src/services/htmlExporter.ts` — Ajouter fonctions génération HTML

---

## ORDRE D'EXÉCUTION RECOMMANDÉ

**Jour 1 :**
- Correction 2.1 — Formulaire d'intention (composants + service + intégration)

**Jour 2 :**
- Correction 2.2 — Suggestion IA de style
- Correction 2.3 — Previews dédiés

---

## VALIDATION FINALE PRIORITÉ 2

1. Ouvrir portfolio pour la première fois → Formulaire intention affiché
2. Remplir les 5 questions → Données sauvegardées
3. Aller dans paramètres → Suggestion IA affichée
4. Cliquer sur un projet → Bouton aperçu visible
5. Aperçu projet → Preview responsive fonctionnel
6. Aperçu portfolio complet → HTML avec projets highlights

**Status attendu :** Conformité 78% → 90%

---

**Auteur:** Claude Opus 4.5
**Projet:** SOUVERAIN - Module Portfolio Hub V2
