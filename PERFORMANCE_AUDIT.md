# 🚀 Audit de Performance SOUVERAIN

**Date:** 31 janvier 2026  
**Analyseur:** Claude Code  
**Contexte:** Ralentissements constatés par l'utilisateur

---

## 📊 Résumé Exécutif

**Problèmes majeurs détectés :**
1. ❌ **Composants monolithiques** (>700 lignes)
2. ❌ **Manque d'optimisation mémoire** (useMemo/useCallback)
3. ⚠️ **Usage excessif de framer-motion** (48 fichiers)
4. ⚠️ **Re-renders non contrôlés** (VaultModule)

**Impact estimé :**
- 🔴 Critique : 2 problèmes
- 🟠 Majeur : 3 problèmes
- 🟡 Mineur : 5 problèmes

---

## 🔴 Problèmes Critiques

### 1. Composants Monolithiques (CRITIQUE)

**Fichiers concernés :**
- `OnboardingCarousel.tsx` - **1162 lignes** 🚨
- `App.tsx` - **909 lignes** 🚨
- `VaultModule.tsx` - **720 lignes**
- `CVWizard.tsx` - **762 lignes**
- `PortfolioEditor.tsx` - **760 lignes**

**Impact :** Temps de compilation long, re-renders massifs, difficile à débugger

**Solution :**
```tsx
// ❌ AVANT (tout dans un seul fichier)
export const VaultModule = () => {
  // 720 lignes de logique...
}

// ✅ APRÈS (découper en sous-composants)
// VaultModule.tsx (150 lignes max)
export const VaultModule = () => {
  return (
    <VaultProvider>
      <VaultHeader />
      <VaultToolbar />
      <VaultContent />
    </VaultProvider>
  )
}

// VaultHeader.tsx (50 lignes)
// VaultToolbar.tsx (80 lignes)
// VaultContent.tsx (100 lignes)
```

**Gain estimé :** 40-60% de réduction du temps de re-render

---

### 2. Absence d'Optimisation Mémoire (CRITIQUE)

**VaultModule.tsx :**
- 24 hooks (useState/useEffect)
- **0 useMemo**
- **0 useCallback**
- = Re-calculs à chaque render

**Exemple de problème :**
```tsx
// ❌ AVANT (dans VaultModule.tsx)
const [documents, setDocuments] = useState([])
const [filteredDocs, setFilteredDocs] = useState([])
const [searchQuery, setSearchQuery] = useState('')

// Recalcul à CHAQUE render même si documents/searchQuery n'ont pas changé
const filtered = documents.filter(doc => 
  doc.name.includes(searchQuery)
)

// ✅ APRÈS
const filteredDocs = useMemo(() => {
  return documents.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  )
}, [documents, searchQuery]) // Ne recalcule que si dependencies changent
```

**Fichiers à optimiser (priorité) :**
1. `VaultModule.tsx` - 0/24 hooks optimisés (0%)
2. `ProjectEditor.tsx` - 13 hooks non vérifiés
3. `PortfolioEditor.tsx` - 13 hooks non vérifiés

**Gain estimé :** 50-70% de réduction CPU lors des interactions

---

## 🟠 Problèmes Majeurs

### 3. Framer Motion Overuse

**Stats :**
- 48 fichiers utilisent framer-motion
- Animations potentiellement concurrentes

**Problèmes potentiels :**
- Trop d'animations simultanées (wizard steps + modals + cards)
- Animations sur des listes longues (MediathequeGrid avec 50+ items)
- Pas de `layoutId` pour les transitions optimisées

**Solution :**
```tsx
// ❌ AVANT (anime chaque item d'une liste de 100 items)
{items.map(item => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    {item.name}
  </motion.div>
))}

// ✅ APRÈS (anime seulement le conteneur)
<motion.div 
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
>
  {items.map(item => <div>{item.name}</div>)}
</motion.div>

// OU désactiver les animations pour les listes longues
{items.map(item => (
  <div> {/* pas de motion.div */}
    {item.name}
  </div>
))}
```

**Gain estimé :** 30-40% de réduction de lag dans les interfaces animées

---

### 4. Shell.tsx - Rendering Overhead

**Problème :** Shell re-render à chaque changement de module

**Code actuel :**
```tsx
const [activeModule, setActiveModule] = useState<ModuleId>('cv')
const [showSettingsModal, setShowSettingsModal] = useState(false)
const [showCommandPalette, setShowCommandPalette] = useState(false)

// 30+ useMemo/useCallback mais beaucoup de logique inline
```

**Optimisations possibles :**
1. Extraire la logique de rendu de module dans un composant séparé
2. Utiliser `React.lazy()` avec `Suspense` (déjà fait ✓)
3. Mémoïser les callbacks de navigation

**Gain estimé :** 10-15% de réduction des re-renders du Shell

---

### 5. ThemeContext Re-renders

**Fichier :** `ThemeContext.tsx`

**Problème actuel :**
```tsx
// Chaque composant qui utilise useTheme() re-render quand le theme change
const { theme, mode, toggleTheme } = useTheme()
```

**Solution :**
```tsx
// Séparer les valeurs statiques des fonctions
const ThemeStateContext = createContext()
const ThemeActionsContext = createContext()

// Les composants n'utilisant que toggleTheme ne re-renderont plus
const { toggleTheme } = useThemeActions() // Stable
const { theme } = useThemeState() // Change seulement si theme change
```

**Gain estimé :** 20-30% de réduction des re-renders lors du toggle dark/light

---

## 🟡 Problèmes Mineurs

### 6. Images Non Optimisées

**Localisation :** Médiathèque, previews de templates

**Solution :**
- Lazy loading des images (`loading="lazy"`)
- Thumbnails pré-générés au lieu de charger les originaux
- WebP avec fallback JPEG

---

### 7. Manque de Virtualisation

**Fichiers concernés :**
- `MediathequeGrid.tsx` - peut avoir 50+ items
- `VaultModule.tsx` - peut avoir 100+ documents

**Solution :** Utiliser `react-window` ou `react-virtual`

```tsx
// ✅ APRÈS
import { FixedSizeGrid } from 'react-window'

<FixedSizeGrid
  columnCount={3}
  rowCount={Math.ceil(items.length / 3)}
  height={600}
  width={900}
  columnWidth={300}
  rowHeight={200}
>
  {({ columnIndex, rowIndex, style }) => (
    <div style={style}>
      <MediaCard item={items[rowIndex * 3 + columnIndex]} />
    </div>
  )}
</FixedSizeGrid>
```

---

### 8. useEffect Sans Dépendances Optimales

**Exemple détecté :**
```tsx
// ❌ Risque de boucle infinie ou effet qui ne se déclenche pas
useEffect(() => {
  fetchData()
}, []) // fetchData n'est pas stable !

// ✅ Correct
const fetchData = useCallback(async () => {
  // ...
}, [dependency1, dependency2])

useEffect(() => {
  fetchData()
}, [fetchData])
```

---

### 9. Inline Styles vs CSS Modules

**Problème :** Tous les styles sont inline (objets créés à chaque render)

**Solution (long terme) :**
- Migrer vers CSS Modules ou Tailwind
- Ou au minimum, extraire les styles statiques hors du render

```tsx
// ❌ AVANT (objet recréé à chaque render)
<div style={{ padding: '1rem', color: theme.text.primary }} />

// ✅ APRÈS (objet stable)
const styles = useMemo(() => ({
  container: { padding: '1rem', color: theme.text.primary }
}), [theme])

<div style={styles.container} />
```

---

### 10. Logs Console Excessifs

**Impact :** Ralentit le navigateur en dev mode

**Solution :** Supprimer ou conditionner les logs

```tsx
// ✅ Logger seulement en debug mode
if (import.meta.env.DEV) {
  console.log('[PortfolioHub] Data loaded:', data)
}
```

---

## 📋 Plan d'Action Recommandé

### Phase 1 - Quick Wins (1-2h) 🚀
1. ✅ Ajouter `useMemo` sur VaultModule filtrage
2. ✅ Ajouter `useCallback` sur les handlers VaultModule
3. ✅ Désactiver animations framer-motion sur listes >20 items
4. ✅ Supprimer logs console non nécessaires

**Gain estimé :** 30-40% d'amélioration perçue

---

### Phase 2 - Refactoring (4-6h) ⚙️
1. Découper `OnboardingCarousel.tsx` (1162 → 4 fichiers de ~300 lignes)
2. Découper `VaultModule.tsx` (720 → 5 fichiers de ~150 lignes)
3. Découper `CVWizard.tsx` (762 → 7 steps séparés)
4. Optimiser ThemeContext (split state/actions)

**Gain estimé :** 50-60% d'amélioration globale

---

### Phase 3 - Optimisations Avancées (8-12h) 🎯
1. Implémenter virtualisation (react-window) pour grilles >30 items
2. Lazy loading des images médiathèque
3. Code-splitting des gros modules (Vault, Portfolio Editor)
4. Profiler avec React DevTools et optimiser les bottlenecks

**Gain estimé :** 70-80% d'amélioration globale

---

## 🎯 Métriques Cibles

**Avant optimisation (estimé actuel) :**
- Time to Interactive: ~3-4s
- Re-render sur toggle theme: ~500ms
- Scroll lag (grilles): ~100ms
- Modal open time: ~300ms

**Après Phase 1 :**
- Time to Interactive: ~2-2.5s (-30%)
- Re-render toggle: ~300ms (-40%)
- Scroll lag: ~60ms (-40%)
- Modal open: ~200ms (-33%)

**Après Phase 2 :**
- Time to Interactive: ~1.5-2s (-50%)
- Re-render toggle: ~150ms (-70%)
- Scroll lag: ~30ms (-70%)
- Modal open: ~100ms (-67%)

**Après Phase 3 :**
- Time to Interactive: <1s (-75%)
- Re-render toggle: <100ms (-80%)
- Scroll lag: <20ms (-80%)
- Modal open: <50ms (-83%)

---

## 🛠️ Outils de Diagnostic

```bash
# 1. Installer React DevTools Profiler
# Chrome Extension: React Developer Tools

# 2. Analyser les re-renders
# Dans DevTools → Profiler → Record → Interagir → Stop

# 3. Identifier les composants lents
# Highlight updates when components render

# 4. Bundle analyzer
npm run build -- --analyze

# 5. Lighthouse audit
# DevTools → Lighthouse → Analyze page load
```

---

## 📝 Checklist de Vérification

### Avant chaque commit :
- [ ] Pas de `.map()` sans `key` unique
- [ ] Pas de inline functions dans render (utiliser useCallback)
- [ ] Pas de calculs lourds sans useMemo
- [ ] Pas de useEffect avec [] qui utilise des props/state
- [ ] Composants <300 lignes idéalement

### Avant chaque PR :
- [ ] Profiler React DevTools montre <100ms render time
- [ ] Pas de console.log en production
- [ ] Images lazy-loaded si >50KB
- [ ] Animations désactivées sur mobile si lag

---

## 🤔 Ta Petite Idée

> "J'ai ma petite idée, mais je veux ton avis"

**Si ton idée était :**
- **Trop de re-renders** → ✅ Confirmé (VaultModule, ThemeContext)
- **Composants trop gros** → ✅ Confirmé (OnboardingCarousel, VaultModule)
- **Animations lourdes** → ✅ Confirmé (48 fichiers framer-motion)
- **Manque d'optimisation** → ✅ Confirmé (0 useMemo/useCallback dans Vault)

**Autre hypothèse ?** Dis-moi ton intuition et je creuse plus en profondeur ! 🔍

---

**Prochaine étape :** Veux-tu que je commence par la Phase 1 (quick wins) ?
