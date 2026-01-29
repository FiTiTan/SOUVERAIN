# CALM-UI Audit - État des Lieux
## SOUVERAIN V17 - Conformité Design

**Date:** 2026-01-26
**Objectif:** Identifier toutes les pages/modules et leur niveau de conformité au template CALM-UI

---

## 📊 Vue d'Ensemble

### Pages/Modules Identifiés

| Module | Fichier | Conformité CALM | Priorité | Notes |
|--------|---------|-----------------|----------|-------|
| **CV Coach** | `App.tsx` | ⚠️ Partiel | 🔴 P1 | Utilise design-system mais pas de glassmorphisme |
| **CV Choice** | `CVChoice.tsx` | ⚠️ Partiel | 🟡 P2 | Pourrait utiliser CalmCard au lieu de cards custom |
| **CV Wizard** | `cv/CVWizard.tsx` | ✅ Conforme | ✅ | **Référence CALM parfaite** |
| **LinkedIn Import** | `LinkedInImportModal.tsx` | ⚠️ Partiel | 🟡 P2 | Modal custom, pourrait utiliser CalmModal |
| **Home Screen** | `HomeScreen.tsx` | ❌ Non conforme | 🔴 P1 | Design ancien, aucun glassmorphisme |
| **Shell Layout** | `Shell.tsx` | ⚠️ Partiel | 🔴 P1 | Layout OK, mais header/sidebar non CALM |
| **Sidebar** | `Sidebar.tsx` | ❌ Non conforme | 🔴 P1 | Style ancien, pas de glassmorphisme |
| **Settings** | `Settings.tsx` | ⚠️ Partiel | 🟡 P2 | Modal basique, pourrait utiliser CalmModal |
| **Vault Module** | `VaultModule.tsx` | ❌ Non conforme | 🔴 P1 | Liste/grille standard, pas de glassmorphisme |
| **Portfolio Hub** | `portfolio/PortfolioHub.tsx` | ⚠️ Partiel | 🟡 P2 | À vérifier |
| **Mediatheque** | `portfolio/mediatheque/MediathequeModule.tsx` | ❌ Non conforme | 🟢 P3 | Module secondaire |
| **Accounts** | `portfolio/accounts/AccountsModule.tsx` | ❌ Non conforme | 🟢 P3 | Module secondaire |
| **Command Palette** | `CommandPalette.tsx` | ⚠️ Partiel | 🟡 P2 | Design correct mais pourrait être plus CALM |
| **Onboarding** | `OnboardingCarousel.tsx` | ⚠️ Partiel | 🟢 P3 | Fonctionnel, amélioration optionnelle |
| **Analysis Animation** | `AnalysisAnimation.tsx` | ✅ Conforme | ✅ | Animation CALM parfaite |
| **Report Components** | `ReportComponents.tsx` | ⚠️ Partiel | 🔴 P1 | BentoCards OK, mais pourrait être plus glass |

---

## 🎯 Priorités de Migration

### 🔴 Priorité 1 - CRITIQUE (Impact UX majeur)
Ces pages sont les plus visibles et nécessitent une migration urgente:

1. **HomeScreen** - Première impression utilisateur
2. **Shell + Sidebar** - Layout présent sur TOUTES les pages
3. **Vault Module** - Feature clé du produit
4. **App.tsx (CV Coach)** - Page principale de l'application
5. **ReportComponents** - Affichage des résultats d'analyse

### 🟡 Priorité 2 - IMPORTANTE (Cohérence visuelle)
Ces pages sont fréquemment utilisées:

1. **CVChoice** - Point d'entrée après HomeScreen
2. **Settings** - Accessibilité utilisateur
3. **Command Palette** - Feature de power user
4. **LinkedInImportModal** - Flow d'import

### 🟢 Priorité 3 - OPTIONNELLE (Modules secondaires)
Ces modules peuvent être migrés ultérieurement:

1. **Portfolio submodules** (Mediatheque, Accounts, etc.)
2. **Onboarding** - Déjà fonctionnel

---

## 📋 Checklist de Conformité CALM-UI

Pour qu'une page soit **100% conforme CALM**, elle doit:

### ✅ Design Tokens
- [ ] Utilise `theme.*` depuis `useTheme()` pour TOUTES les couleurs
- [ ] Utilise `typography.*` pour police, taille, poids
- [ ] Utilise `borderRadius.*` pour arrondis
- [ ] Utilise `spacing.*` pour marges/paddings
- [ ] Utilise `transitions.*` pour animations

### ✅ Glassmorphisme
- [ ] Surfaces avec `backdropFilter: blur(20px)`
- [ ] Background semi-transparent (`rgba(...)`)
- [ ] Border subtile avec `theme.border.light`
- [ ] Shadow appropriée (`theme.shadow.lg`)

### ✅ Composants CALM
- [ ] Utilise `CalmCard` pour les cards interactives
- [ ] Utilise `CalmModal` pour les modals
- [ ] Utilise `GlassInput/TextArea/Select` pour les formulaires
- [ ] Utilise `AnonymizationTicker` pour feedback de progression
- [ ] Utilise `useToast()` pour les notifications (pas `alert()`)

### ✅ Animations
- [ ] Utilise `framer-motion` pour les transitions
- [ ] Hover states avec `whileHover`
- [ ] Entrance animations avec `initial/animate`
- [ ] `AnimatePresence` pour mounting/unmounting

### ✅ Accessibilité
- [ ] Focus states visibles (border accent)
- [ ] Keyboard navigation (Tab, Enter, Escape)
- [ ] Labels explicites sur tous les champs
- [ ] Contraste suffisant (WCAG AA minimum)

---

## 🔍 Analyse Détaillée par Page

### 1. HomeScreen ❌ Non conforme

**Problèmes:**
- Utilise des styles inline custom au lieu de tokens
- Pas de glassmorphisme sur les cards
- Animations de base (pas de framer-motion sophistiqué)
- Header custom au lieu de composant réutilisable

**Migration requise:**
- Remplacer cards custom par `CalmCard`
- Ajouter glassmorphisme au container principal
- Migrer les couleurs vers `theme.*`
- Utiliser `motion.*` pour animations

**Effort:** 🟠 Moyen (4-6h)

---

### 2. Shell + Sidebar ⚠️ Partiel

**Problèmes:**
- Sidebar utilise styles custom
- Pas de glassmorphisme sur la sidebar
- Header basique sans effet glass
- Navigation pas assez visuelle

**Migration requise:**
- Appliquer glassmorphisme à la Sidebar
- Moderniser les icônes de navigation
- Ajouter hover effects plus prononcés
- Uniformiser avec le reste de l'app

**Effort:** 🔴 Important (6-8h)

---

### 3. Vault Module ❌ Non conforme

**Problèmes:**
- Liste/grille standard sans glassmorphisme
- Filtres basiques sans CalmModal
- Cards d'analyses non stylées CALM
- Pas d'animations de transition

**Migration requise:**
- Convertir les cards en `CalmCard`
- Ajouter glassmorphisme au container
- Migrer filtres vers `CalmModal` + `GlassSelect`
- Ajouter animations d'entrée/sortie

**Effort:** 🔴 Important (8-10h)

---

### 4. App.tsx (CV Coach) ⚠️ Partiel

**Problèmes:**
- Utilise `BentoCard` au lieu de `CalmCard`
- Pas de glassmorphisme global
- Report components pourraient être plus CALM
- Layout rigide sans breathing space

**Migration requise:**
- Envelopper dans container glass
- Migrer vers `CalmCard` pour les résultats
- Ajouter animations entre états (choice → report)
- Améliorer spacing et hierarchy

**Effort:** 🔴 Important (8-12h)

---

### 5. CVChoice ⚠️ Partiel

**Problèmes:**
- Cards custom au lieu de `CalmCard`
- Animations basiques
- Manque de cohérence avec CVWizard

**Migration requise:**
- Remplacer cards par `CalmCard` avec themeColor
- Ajouter glassmorphisme au container
- Harmoniser avec CVWizard (même feel)

**Effort:** 🟢 Léger (2-3h)

---

### 6. ReportComponents ⚠️ Partiel

**Problèmes:**
- `BentoCard` pourrait être remplacé par `CalmCard`
- Pas de glassmorphisme sur les cards
- Couleurs parfois hardcodées

**Migration requise:**
- Migrer vers `CalmCard`
- Ajouter glassmorphisme
- S'assurer que toutes les couleurs viennent de `theme.*`

**Effort:** 🟠 Moyen (4-6h)

---

### 7. Settings ⚠️ Partiel

**Problèmes:**
- Modal custom au lieu de `CalmModal`
- Formulaire basique sans `GlassForms`

**Migration requise:**
- Remplacer par `CalmModal`
- Utiliser `GlassInput/Select` pour les champs
- Ajouter animations d'entrée/sortie

**Effort:** 🟢 Léger (2-3h)

---

### 8. LinkedInImportModal ⚠️ Partiel

**Problèmes:**
- Modal custom
- Input basique sans style glass

**Migration requise:**
- Remplacer par `CalmModal`
- Utiliser `GlassInput`
- Harmoniser avec CVWizard

**Effort:** 🟢 Léger (1-2h)

---

### 9. Command Palette ⚠️ Partiel

**Problèmes:**
- Glassmorphisme présent mais pourrait être amélioré
- Animations pourraient être plus fluides

**Migration requise:**
- Peaufiner le glassmorphisme
- Améliorer les animations de recherche
- Ajouter micro-interactions

**Effort:** 🟢 Léger (2h)

---

## 📈 Estimation Totale

### Effort de Migration Complet

| Priorité | Nb Pages | Effort Total | Délai Estimé |
|----------|----------|--------------|--------------|
| P1 (Critique) | 5 pages | ~40h | 1 semaine |
| P2 (Important) | 4 pages | ~12h | 2 jours |
| P3 (Optionnel) | 3 pages | ~8h | 1 jour |
| **TOTAL** | **12 pages** | **~60h** | **~2 semaines** |

---

## 🎯 Plan de Migration Recommandé

### Phase 1 - Foundation (Semaine 1)
**Objectif:** Migrer les composants de base visibles sur toutes les pages

1. **Jour 1-2:** Shell + Sidebar (8h)
   - Appliquer glassmorphisme
   - Moderniser navigation
   - Tester sur toutes les pages

2. **Jour 3:** HomeScreen (6h)
   - Remplacer par CalmCards
   - Glassmorphisme global
   - Animations d'entrée

3. **Jour 4-5:** Vault Module (10h)
   - Migrer vers CalmCard
   - Filters avec CalmModal
   - Animations de liste

### Phase 2 - Core Features (Semaine 2)
**Objectif:** Migrer les features principales

1. **Jour 1-3:** App.tsx + ReportComponents (16h)
   - Migration vers CalmCard
   - Glassmorphisme sur containers
   - Animations de transition

2. **Jour 4:** P2 Tasks (8h)
   - CVChoice
   - Settings
   - LinkedInImportModal
   - Command Palette polish

3. **Jour 5:** Testing + Polish (8h)
   - Tests visuels sur toutes les pages
   - Corrections de bugs
   - Documentation

### Phase 3 - Optionnel (À planifier)
- Portfolio submodules
- Onboarding amélioré
- Micro-interactions avancées

---

## 🚀 Quick Wins

Ces changements peuvent être faits rapidement pour un impact immédiat:

1. **Remplacer tous les `alert()` par `useToast()`** (1h)
2. **Ajouter glassmorphisme au Shell container** (30min)
3. **Migrer CVChoice vers CalmCard** (2h)
4. **Migrer Settings vers CalmModal** (2h)

**Total Quick Wins:** 5.5h pour ~30% d'amélioration visuelle

---

## 📝 Notes Techniques

### Dépendances
- `framer-motion` ✅ Déjà installé
- `design-system.ts` ✅ Prêt
- `CalmCard`, `CalmModal`, `GlassForms` ✅ Implémentés

### Compatibilité
- Mode clair/sombre ✅ Supporté partout
- Responsive ⚠️ À tester sur chaque page migrée
- Performance ✅ Glassmorphisme optimisé

### Risques
- 🟡 **Breaking changes possibles** sur les composants existants
- 🟡 **Regressions visuelles** si migration partielle
- 🟢 **Peu de risque technique** (stack stable)

---

## ✅ Prochaines Étapes

1. **Valider ce plan** avec l'équipe
2. **Prioriser Phase 1** (Shell, HomeScreen, Vault)
3. **Créer des branches feature** par page
4. **Tester systématiquement** chaque migration
5. **Documenter les patterns** découverts

---

**Dernière mise à jour:** 2026-01-26
**Version:** SOUVERAIN V17 - CALM-UI Audit 1.0
