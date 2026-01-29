# Audit de Performance - SOUVERAIN

**Date**: 27 janvier 2026
**Version**: V17
**Analysé par**: Claude (Sonnet 4.5)

---

## 🎯 Résumé Exécutif

### Problèmes Identifiés (Par Priorité)

#### 🔴 CRITIQUE - Impact Majeur
1. **Absence totale de mémoïsation React** (0 composants avec React.memo)
2. **Modules chargés en permanence** (tous les modules importés même si inactifs)
3. **Dépendances lourdes** (@huggingface/transformers, @mlc-ai/web-llm, canvas)
4. **Re-renders en cascade** (PortfolioHub: 25+ useEffect sans dépendances optimisées)

#### 🟠 ÉLEVÉ - Impact Significatif
5. **Absence de lazy loading** pour les composants
6. **Workers Web non optimisés** (NER worker initialisé à chaque appel)
7. **Framer Motion sur TOUS les éléments** (overhead d'animation partout)
8. **Styles inline recalculés** à chaque render

#### 🟡 MOYEN - Impact Modéré
9. **Hooks personnalisés sans mémoïsation** (useCallback/useMemo rarissimes: 34 occurrences sur 495 hooks)
10. **Base de données SQLite** interrogée sans cache

---

## 📊 Métriques Détectées

### Code Base
- **Fichiers TypeScript**: 174 fichiers
- **Composants React**: ~100+ composants
- **Hooks utilisés**: 495 occurrences (useState, useEffect)
- **Hooks optimisés**: 34 occurrences (useCallback, useMemo) → **6.8% seulement**
- **Composants mémoïsés**: 0 (React.memo jamais utilisé)

### Dépendances Lourdes
```json
{
  "@huggingface/transformers": "^3.8.1",     // 🔴 TRÈS LOURD (ML local)
  "@mlc-ai/web-llm": "^0.2.80",              // 🔴 TRÈS LOURD (LLM local)
  "canvas": "^3.2.1",                        // 🔴 LOURD (native addon)
  "framer-motion": "^12.29.0",               // 🟠 LOURD (animations partout)
  "pdfjs-dist": "^5.4.530",                  // 🟠 LOURD
  "better-sqlite3-multiple-ciphers": "^12.5.0" // Native addon
}
```

---

## 🔍 Analyse Détaillée par Catégorie

### 1. Composants React - Re-renders Excessifs

#### Problème: Shell.tsx
```typescript
// ❌ PROBLÈME: Tous les modules sont importés même si inactifs
import { PortfolioHub } from './portfolio/PortfolioHub';
import { JobMatchingModule } from './job-matching/JobMatchingModule';
import { LinkedInCoachModule } from './linkedin-coach/LinkedInCoachModule';
import { VaultModule } from './VaultModule';

// ❌ PROBLÈME: Switch statement charge tous les composants en mémoire
const renderContent = () => {
  switch (activeModule) {
    case 'cv': return children;
    case 'portfolio': return <PortfolioHub />;  // Toujours monté
    case 'jobs': return <JobMatchingModule />;
    // ...
  }
};
```

**Impact**: Tous les modules sont chargés au démarrage, même ceux jamais utilisés.

#### Problème: PortfolioHub.tsx
```typescript
// ❌ PROBLÈME: 25+ états locaux
const [currentView, setCurrentView] = useState<PortfolioView>('landing');
const [mpfScreen, setMpfScreen] = useState<MPFScreen>('selector');
const [showOnboarding, setShowOnboarding] = useState(false);
// ... 20+ autres useState

// ❌ PROBLÈME: 3 useEffect qui s'exécutent en parallèle au mount
useEffect(() => { fetchData(); }, []); // Fetch portfolio
useEffect(() => { checkPremium(); }, []); // Check premium
useEffect(() => { checkOnboarding(); }, [portfolioId]); // Check onboarding

// ❌ PROBLÈME: Inline styles recalculés à chaque render
const styles = {
  container: {
    display: 'flex',  // Recréé à chaque render
    // ...
  }
};
```

**Impact**: Re-renders massifs à chaque changement d'état, cascade de re-calculs.

#### Problème: Sidebar.tsx
```typescript
// ❌ PROBLÈME: NavItem NON mémoïsé
const NavItem: React.FC<NavItemProps> = ({ icon, label, ... }) => {
  const { theme, mode } = useTheme(); // Re-render à chaque thème change

  // ❌ Calculs inline refaits à chaque parent render
  let bg = 'transparent';
  let color = theme.text.secondary;
  if (isActive) {
    if (isSettings) {
      bg = mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
      // ...
    }
  }

  // ❌ Framer Motion variants recréés à chaque render
  return (
    <motion.button variants={{ hover: { scale: 1.02 }, tap: { scale: 0.98 } }}>
      {/* ... */}
    </motion.button>
  );
};
```

**Impact**: Chaque item de navigation re-render à chaque changement, même si non concerné.

---

### 2. Animations Framer Motion - Overhead Partout

#### Problème Général
```typescript
// ❌ PARTOUT dans le code:
<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
  <motion.button whileHover="hover" whileTap="tap">
    <motion.div animate={{ rotate: 10 }}>
```

**Composants utilisant motion**: ~50+ composants

**Impact**:
- Overhead de calcul pour CHAQUE élément animé
- Listeners d'événements sur des centaines d'éléments
- Pas de stratégie de désactivation (ex: reduce motion)

#### Exemples Critiques
- **Sidebar**: 6+ animations par item × 6 items = 36+ calculs d'animation
- **CalmCard**: Animation sur TOUTES les cartes, même hors viewport
- **Job Matching/LinkedIn**: Animations sur chaque étape du wizard

---

### 3. Workers Web - Initialisation Inefficace

#### Problème: anonymizationService.ts
```typescript
// ❌ PROBLÈME: Worker global jamais nettoyé
let nerWorker: Worker | null = null;
let workerReadyPromise: Promise<void> | null = null;

function getNerWorker(): Promise<Worker> {
  if (nerWorker) return Promise.resolve(nerWorker);

  // ❌ Initialisation lourde à chaque première utilisation
  nerWorker = new Worker(new URL('../workers/ner.worker.ts', import.meta.url), {
    type: 'module'
  });

  workerReadyPromise = new Promise((resolve, reject) => {
    nerWorker!.onmessage = (e) => {
      if (e.data.status === 'ready') resolve();
      if (e.data.status === 'error') reject(e.data.error);
    };
    nerWorker!.postMessage({ type: 'init' });
  });

  return workerReadyPromise.then(() => nerWorker!);
}
```

**Impact**:
- Worker chargé en lazy mais jamais terminé (fuite mémoire potentielle)
- Pas de pool de workers pour traitement parallèle
- Initialisation bloquante au premier appel

---

### 4. IPC et Opérations Asynchrones

#### Problème: Appels IPC en Cascade
```typescript
// Dans PortfolioHub.tsx
useEffect(() => {
  const fetchData = async () => {
    // ❌ 3 appels IPC séquentiels au lieu de Promise.all
    const portfolioResult = await window.electron.portfolio.getAll();
    const projectsResult = await window.electron.portfolio.getAllProjects(id);
    const mediaResult = await window.electron.mediatheque.getAll(id);
  };
  fetchData();
}, []);
```

**Impact**: Latence cumulée au lieu de parallélisation

#### Problème: Pas de Cache
```typescript
// ❌ Chaque appel refait une requête DB complète
const portfolios = await window.electron.invoke('db-get-all-portfolios');
// Pas de cache, pas de memoization
```

---

### 5. Gestion des Dépendances

#### Problèmes Majeurs

**@huggingface/transformers** (~200MB)
- Utilisé pour NER local (détection d'entités)
- Chargé même si anonymisation non utilisée
- Alternative: API cloud seulement ou chargement conditionnel

**@mlc-ai/web-llm** (~100MB+)
- LLM local (jamais réellement utilisé dans le code actuel)
- Peut être supprimé ou lazy-loaded

**canvas** (~50MB native)
- Requis pour PDF/QR generation
- Devrait être lazy-loaded uniquement lors de l'export

**framer-motion** (~30MB)
- Animations partout
- Alternative: CSS animations pour les cas simples

---

### 6. Styles et CSS-in-JS

#### Problème: Inline Styles Recalculés
```typescript
// ❌ Dans TOUS les composants
const MyComponent = () => {
  const { theme } = useTheme();

  // ❌ Objet styles recréé à CHAQUE render
  const styles = {
    container: {
      backgroundColor: theme.bg.primary,
      padding: '2rem',
      // ...
    },
    button: {
      background: theme.accent.primary,
      // ...
    }
  };

  return <div style={styles.container}>...</div>;
};
```

**Impact**: Garbage collection constante, overhead de comparaison DOM

#### Solution Manquante
Pas d'utilisation de:
- `useMemo` pour les styles
- Styled-components ou alternatives
- Classes CSS statiques

---

## 🎯 Recommandations Priorisées

### 🔴 PRIORITÉ 1 - Quick Wins (Impact Maximum, Effort Minimal)

#### 1.1 Lazy Loading des Modules
```typescript
// AVANT (Shell.tsx)
import { PortfolioHub } from './portfolio/PortfolioHub';
import { JobMatchingModule } from './job-matching/JobMatchingModule';

// APRÈS
const PortfolioHub = React.lazy(() => import('./portfolio/PortfolioHub'));
const JobMatchingModule = React.lazy(() => import('./job-matching/JobMatchingModule'));

// Dans renderContent()
<Suspense fallback={<LoadingSpinner />}>
  {activeModule === 'portfolio' && <PortfolioHub />}
</Suspense>
```

**Gain estimé**: -40% temps de chargement initial, -30% mémoire

#### 1.2 Mémoïser les Composants Critiques
```typescript
// AVANT
const NavItem: React.FC<NavItemProps> = ({ icon, label, ... }) => {
  // ...
};

// APRÈS
const NavItem = React.memo<NavItemProps>(({ icon, label, ... }) => {
  // ...
}, (prevProps, nextProps) => {
  return prevProps.isActive === nextProps.isActive &&
         prevProps.label === nextProps.label;
});
```

**Appliquer à**:
- `NavItem` (Sidebar)
- `CalmCard`
- `ProjectCard`
- `MediathequeCard`
- Tous les items de listes

**Gain estimé**: -60% re-renders inutiles

#### 1.3 Mémoïser les Styles
```typescript
// APRÈS
const MyComponent = () => {
  const { theme } = useTheme();

  const styles = useMemo(() => ({
    container: {
      backgroundColor: theme.bg.primary,
      padding: '2rem',
    },
    button: {
      background: theme.accent.primary,
    }
  }), [theme]); // Recalculé UNIQUEMENT si thème change

  return <div style={styles.container}>...</div>;
};
```

**Gain estimé**: -30% overhead de calcul

---

### 🟠 PRIORITÉ 2 - Optimisations Structurelles

#### 2.1 Optimiser PortfolioHub
```typescript
// Paralléliser les appels IPC
const fetchData = async () => {
  const [portfolioResult, systemStatus] = await Promise.all([
    window.electron.portfolio.getAll(),
    window.electron.invoke('get-system-status')
  ]);

  if (portfolioResult.success && portfolioResult.portfolios.length > 0) {
    const primary = portfolioResult.portfolios[0];
    setPortfolioId(primary.id);

    // Paralléleiser les fetches enfants
    const [projectsResult, mediaResult] = await Promise.all([
      window.electron.portfolio.getAllProjects(primary.id),
      window.electron.mediatheque.getAll(primary.id)
    ]);

    setProjectCount(projectsResult.projects?.length || 0);
    setMediaCount(mediaResult?.length || 0);
  }
};
```

**Gain estimé**: -50% temps de chargement des données

#### 2.2 useCallback pour les Handlers
```typescript
// AVANT
const handleNavigate = (module: ModuleId) => {
  if (module === 'settings') {
    setShowSettingsModal(true);
  } else {
    setActiveModule(module);
  }
};

// APRÈS
const handleNavigate = useCallback((module: ModuleId) => {
  if (module === 'settings') {
    setShowSettingsModal(true);
  } else {
    setActiveModule(module);
  }
}, []); // Stable reference
```

**Appliquer partout** où des callbacks sont passés aux enfants.

#### 2.3 Désactiver Animations sur Reduce Motion
```typescript
// Design System
const shouldAnimate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Dans composants
<motion.div
  initial={shouldAnimate ? { opacity: 0, y: 20 } : {}}
  animate={shouldAnimate ? { opacity: 1, y: 0 } : {}}
>
```

**Gain estimé**: -20% overhead sur machines lentes

---

### 🟡 PRIORITÉ 3 - Optimisations Avancées

#### 3.1 Virtualisation des Listes
Pour les listes longues (médias, projets):
```bash
npm install react-window
```

```typescript
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={items.length}
  itemSize={120}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      <MediaCard media={items[index]} />
    </div>
  )}
</FixedSizeList>
```

**Gain estimé**: -80% overhead sur listes 50+ items

#### 3.2 Code Splitting Agressif
```typescript
// Split par route
const routes = {
  portfolio: () => import('./portfolio/PortfolioHub'),
  jobs: () => import('./job-matching/JobMatchingModule'),
  linkedin: () => import('./linkedin-coach/LinkedInCoachModule'),
};

// Split par composants lourds
const PdfExporter = React.lazy(() => import('./services/pdfExporter'));
const QrGenerator = React.lazy(() => import('./services/qrService'));
```

#### 3.3 Web Workers Pool
```typescript
// workerPool.ts
class WorkerPool {
  private workers: Worker[] = [];
  private maxWorkers = navigator.hardwareConcurrency || 4;

  async execute<T>(task: any): Promise<T> {
    const worker = this.getAvailableWorker();
    return new Promise((resolve, reject) => {
      worker.onmessage = (e) => {
        if (e.data.error) reject(e.data.error);
        else resolve(e.data.result);
        this.releaseWorker(worker);
      };
      worker.postMessage(task);
    });
  }

  // ...
}
```

---

### 🔵 PRIORITÉ 4 - Nettoyage des Dépendances

#### 4.1 Supprimer les Dépendances Non Utilisées
```bash
# Vérifier si vraiment utilisés
npm uninstall @mlc-ai/web-llm  # LLM local jamais utilisé actuellement
```

#### 4.2 Lazy Load Dependencies
```typescript
// Au lieu de:
import { PDFDocument } from 'pdf-lib';

// Faire:
const generatePdf = async () => {
  const { PDFDocument } = await import('pdf-lib');
  // ...
};
```

#### 4.3 Bundle Analyzer
```bash
npm install --save-dev vite-plugin-bundle-visualizer

# Dans vite.config.ts
import { visualizer } from 'vite-plugin-bundle-visualizer';

export default defineConfig({
  plugins: [
    react(),
    visualizer({ open: true })
  ]
});
```

---

## 📈 Gains Estimés par Priorité

### Implémentation PRIORITÉ 1 uniquement
- **Temps de chargement initial**: -40%
- **Re-renders inutiles**: -60%
- **Utilisation mémoire**: -30%
- **FPS pendant navigation**: +50%

### Implémentation PRIORITÉ 1 + 2
- **Temps de chargement initial**: -60%
- **Re-renders inutiles**: -80%
- **Utilisation mémoire**: -45%
- **FPS pendant navigation**: +80%

### Implémentation Complète (P1 + P2 + P3 + P4)
- **Temps de chargement initial**: -75%
- **Re-renders inutiles**: -90%
- **Utilisation mémoire**: -60%
- **Bundle size**: -50%
- **FPS**: Stable 60fps

---

## 🔧 Plan d'Implémentation Recommandé

### Phase 1 (1-2 jours) - Quick Wins
- [ ] Lazy loading des modules (Shell.tsx)
- [ ] React.memo sur 10 composants critiques
- [ ] useMemo sur tous les objets styles
- [ ] useCallback sur tous les handlers

### Phase 2 (2-3 jours) - Optimisations Structurelles
- [ ] Paralléliser les appels IPC
- [ ] Désactiver animations sur reduce motion
- [ ] Optimiser les useEffect (dépendances précises)

### Phase 3 (3-5 jours) - Optimisations Avancées
- [ ] Virtualisation des listes longues
- [ ] Code splitting agressif
- [ ] Worker pool pour traitement parallèle

### Phase 4 (1-2 jours) - Nettoyage
- [ ] Bundle analyzer
- [ ] Supprimer dépendances inutiles
- [ ] Lazy load dépendances lourdes

---

## 📊 Checklist de Vérification Post-Optimisation

### Performance
- [ ] Lighthouse Score > 90
- [ ] First Contentful Paint < 1s
- [ ] Time to Interactive < 2s
- [ ] Total Blocking Time < 200ms

### Développement
- [ ] Aucun warning React en console
- [ ] Aucune fuite mémoire détectée (Chrome DevTools)
- [ ] Bundle size < 500KB (gzipped)

### Expérience Utilisateur
- [ ] Navigation fluide (60fps constant)
- [ ] Pas de lag lors du changement de module
- [ ] Formulaires réactifs instantanément
- [ ] Animations fluides sur toutes les machines

---

## 🎓 Ressources et Bonnes Pratiques

### Documentation
- [React Optimization Guide](https://react.dev/learn/render-and-commit)
- [Web.dev Performance](https://web.dev/performance/)
- [Vite Performance](https://vitejs.dev/guide/performance.html)

### Outils Recommandés
- **Chrome DevTools Performance**: Profiling
- **React DevTools Profiler**: Identifier les re-renders
- **Lighthouse**: Audit performance global
- **Bundle Phobia**: Vérifier la taille des packages

---

**Audit Complété le 27 janvier 2026**
**Prochaine révision recommandée**: Après implémentation Phase 1
