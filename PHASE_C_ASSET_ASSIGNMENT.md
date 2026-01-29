# PHASE C - Assignation d'Assets aux Projets - Documentation

## 📊 Vue d'ensemble

Implémentation du système drag & drop pour assigner des assets aux projets dans le module Portfolio de SOUVERAIN.

**Date**: 20 janvier 2025
**Status**: ✅ TERMINÉ

---

## ✅ Fonctionnalités Implémentées

### 1. Drag & Drop d'Assets

- **Composant**: `AssetCard.tsx`
- **Features**:
  - Carte asset devient draggable quand `draggable={true}`
  - Indication visuelle pendant le drag (opacité 50%, curseur grab)
  - Transfert de données JSON avec `assetId` et `assetName`
  - État `isDragging` pour feedback visuel

### 2. Drop Zone dans ProjectCard

- **Composant**: `ProjectCard.tsx`
- **Features**:
  - Zone de drop active quand un asset est en cours de drag
  - Indication visuelle: bordure accent + fond muted
  - Message "📂 Ajouter ici" centré pendant le survol
  - Gestion propre des événements drag (dragOver, dragLeave, drop)
  - Parsing sécurisé des données droppées

### 3. Gestion de l'Assignation

- **Composant**: `PortfolioModule.tsx`
- **Features**:
  - Handler `handleAssetDrop(projectId, assetId)` pour créer la liaison
  - Appel IPC via `window.electron.portfolioV2.projects.addElement()`
  - Toast de confirmation après assignation réussie
  - Rechargement automatique des projets pour mettre à jour le compteur
  - Comptage dynamique des assets assignés par projet

### 4. Propagation des Props

- **AssetGrid**: Prop `enableDragToProjects` pour activer le drag sur tous les assets
- **ProjectList**: Prop `onAssetDrop` propagée à toutes les ProjectCards
- **PortfolioModule**: Active drag & drop sur onglet Assets, handlers connectés

---

## 🗂️ Structure de Données

### Liaison Asset → Projet

```typescript
// Table: portfolio_project_elements
{
  id: string;              // Lien unique
  project_id: string;      // ID du projet
  element_id: string;      // ID de l'asset (utilisé comme element_id)
  display_order: number;   // Ordre d'affichage
  is_cover: boolean;       // Asset de couverture du projet
}
```

### Comptage Dynamique

Le compteur `_elementCount` dans `Project` est maintenant calculé dynamiquement :
- Appel à `getElements(projectId)` pour chaque projet
- Compte le nombre d'assets assignés
- Affiché dans ProjectCard : "📁 X élément(s)"

---

## 🔌 API et Handlers IPC

### Handlers Utilisés

```javascript
// Ajouter un asset à un projet
window.electron.portfolioV2.projects.addElement({
  id: string,
  projectId: string,
  elementId: string,  // ← ID de l'asset
  displayOrder: number,
  isCover: boolean
})

// Récupérer les assets d'un projet
window.electron.portfolioV2.projects.getElements(projectId)

// Supprimer un asset d'un projet
window.electron.portfolioV2.projects.removeElement(projectId, elementId)
```

---

## 📁 Fichiers Modifiés

### 1. AssetCard.tsx (4 modifications)

**Ajouts**:
- Prop `draggable?: boolean`
- État `isDragging`
- Handlers `handleDragStart()` et `handleDragEnd()`
- Attributes HTML5 drag: `draggable`, `onDragStart`, `onDragEnd`
- Style: curseur `grab`, opacité 0.5 pendant drag

**Lignes modifiées**: ~10-15 lignes

### 2. AssetGrid.tsx (3 modifications)

**Ajouts**:
- Prop `enableDragToProjects?: boolean`
- Propagation de `draggable={enableDragToProjects}` aux AssetCards

**Lignes modifiées**: ~5 lignes

### 3. ProjectCard.tsx (5 modifications)

**Ajouts**:
- Prop `onAssetDrop?: (projectId, assetId) => void`
- État `isDropTarget`
- Handlers: `handleDragOver()`, `handleDragLeave()`, `handleDrop()`
- Style `dropIndicator` pour message "Ajouter ici"
- Style card: bordure 2px + fond muted quand drop target
- Attributes HTML5: `onDragOver`, `onDragLeave`, `onDrop`

**Lignes ajoutées**: ~40 lignes

### 4. ProjectList.tsx (2 modifications)

**Ajouts**:
- Prop `onAssetDrop?: (projectId, assetId) => void`
- Propagation à toutes les ProjectCards

**Lignes modifiées**: ~3 lignes

### 5. PortfolioModule.tsx (3 modifications)

**Ajouts**:
- Handler `handleAssetDrop(projectId, assetId)`
  - Création liaison via IPC
  - Toast confirmation
  - Rechargement projets
- Modification `loadProjects()` pour compter assets assignés (Promise.all + getElements)
- Prop `enableDragToProjects={true}` sur AssetGrid
- Prop `onAssetDrop={handleAssetDrop}` sur ProjectList

**Lignes ajoutées**: ~40 lignes
**Lignes modifiées**: ~30 lignes

---

## 🎨 Interface Utilisateur

### Flow Utilisateur - Assignation d'Asset

```
Ouvrir portfolio
  → Onglet Assets
  → Cliquer-maintenir sur un asset
  → Drag vers onglet Projets
  → Survoler un ProjectCard
    → Bordure devient accent
    → Fond devient muted
    → Message "📂 Ajouter ici" apparaît
  → Relâcher sur le projet
  → Toast "Asset ajouté au projet"
  → Compteur du projet incrémente (ex: "📁 1 élément(s)")
```

### Feedback Visuel

**Asset en cours de drag**:
- Opacité: 50%
- Curseur: grab → grabbing

**ProjectCard en survol**:
- Bordure: 1px → 2px solid accent
- Fond: bg.secondary → accent.muted
- Shadow: md
- Message centré: "📂 Ajouter ici"

**Après drop**:
- Toast success: "Asset ajouté au projet"
- Compteur mis à jour instantanément

---

## 🔄 Flow Technique

### 1. Drag Start (AssetCard)
```typescript
handleDragStart(e) {
  setIsDragging(true);
  e.dataTransfer.setData('application/json', JSON.stringify({
    assetId: asset.id,
    assetName: asset.originalFilename
  }));
}
```

### 2. Drag Over (ProjectCard)
```typescript
handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'copy';
  setIsDropTarget(true);
}
```

### 3. Drop (ProjectCard → PortfolioModule)
```typescript
handleDrop(e) {
  const data = JSON.parse(e.dataTransfer.getData('application/json'));
  onAssetDrop(project.id, data.assetId);
}

handleAssetDrop(projectId, assetId) {
  await window.electron.portfolioV2.projects.addElement({...});
  toast.success('Asset ajouté au projet');
  await loadProjects(selectedPortfolioId); // Recharge + recompte
}
```

### 4. Recompte Assets (loadProjects)
```typescript
const mappedProjects = await Promise.all(
  projects.map(async (project) => {
    const elements = await getElements(project.id);
    return {
      ...project,
      _elementCount: elements?.length || 0
    };
  })
);
```

---

## 📊 Métriques

| Métrique | Valeur |
|----------|--------|
| Fichiers modifiés | 5 |
| Lignes ajoutées | ~100 |
| Lignes modifiées | ~50 |
| Handlers IPC utilisés | 2 (addElement, getElements) |
| Erreurs TypeScript | 0 |
| Temps d'implémentation | ~30 min |

---

## ✅ Tests de Validation

### Tests Manuels Requis

| Test | Attendu | Status |
|------|---------|--------|
| **Compilation TS** | 0 erreurs | ✅ PASS |
| Drag asset depuis Assets | Opacité 50%, curseur grab | ⏳ À tester |
| Survol ProjectCard pendant drag | Bordure accent, message "Ajouter ici" | ⏳ À tester |
| Drop asset sur projet | Toast success, compteur +1 | ⏳ À tester |
| Compteur éléments correct | Affiche nombre réel d'assets | ⏳ À tester |
| Rechargement portfolio | Assets assignés persistés | ⏳ À tester |
| Drop hors projet | Aucune action | ⏳ À tester |
| Drag asset déjà assigné | Permet réassignation | ⏳ À tester |

### Commandes de Test

```bash
# Compiler TypeScript
npx tsc --noEmit

# Lancer l'app
npm start

# Tester manuellement:
# 1. Ouvrir un portfolio
# 2. Importer quelques assets (onglet Assets)
# 3. Créer un projet (onglet Projets)
# 4. Retourner sur onglet Assets
# 5. Drag & drop un asset sur le projet
# 6. Vérifier toast success
# 7. Vérifier compteur projet incrémente
# 8. Recharger app, vérifier persistance
```

---

## 🔜 Fonctionnalités Futures

### Priorité 1 - Affichage Assets Assignés
- [ ] Composant `ProjectEditor.tsx` pour vue détaillée projet
- [ ] Liste des assets assignés avec miniatures
- [ ] Bouton "Retirer" pour désassigner
- [ ] Réorganisation ordre des assets (drag & drop)
- [ ] Sélection asset de couverture

### Priorité 2 - UX Améliorée
- [ ] Drag & drop multiple (sélection multi-assets)
- [ ] Preview asset pendant drag
- [ ] Confirmation avant réassignation si déjà dans autre projet
- [ ] Shortcuts clavier (Del pour désassigner)
- [ ] Filtre "Assets non assignés" dans onglet Assets

### Priorité 3 - Analytics
- [ ] Statistiques: % assets assignés vs non assignés
- [ ] Projets avec le plus d'assets
- [ ] Suggestions: "Ce projet a 0 assets, assignez-en ?"

---

## 🛠️ Décisions Techniques

### 1. Assets vs Éléments

**Problème**: Le système prévoit `portfolio_elements` (assets classifiés par IA) mais nous n'avons que des `portfolio_assets`.

**Solution**: Utiliser directement l'ID de l'asset comme `element_id` dans la table de liaison.

**Raison**: Simplifie l'implémentation initiale. À terme, quand la classification IA sera implémentée, on créera des `portfolio_elements` à partir des assets et on utilisera ces IDs.

### 2. Comptage Dynamique vs Cache

**Choix**: Compter les assets à chaque `loadProjects()` via appels IPC multiples.

**Alternative**: Stocker le count dans `portfolio_projects_v2.element_count` et l'incrémenter/décrémenter.

**Raison**:
- Plus simple à implémenter
- Garantit exactitude (pas de désynchronisation)
- Performance acceptable pour <100 projets

**Future optimization**: Si >100 projets, passer à un compteur cached.

### 3. HTML5 Drag & Drop vs Bibliothèque

**Choix**: HTML5 Drag & Drop natif

**Alternative**: react-dnd, dnd-kit

**Raison**:
- Pas de dépendance externe
- API simple pour notre cas d'usage
- Performance native

---

## 🐛 Bugs Connus

- Aucun bug bloquant actuellement

---

## 📚 Ressources

### Code
- `src/components/portfolio/AssetCard.tsx`
- `src/components/portfolio/AssetGrid.tsx`
- `src/components/portfolio/ProjectCard.tsx`
- `src/components/portfolio/ProjectList.tsx`
- `src/components/portfolio/PortfolioModule.tsx`

### Base de Données
- Table: `portfolio_project_elements`
- Handlers: `database.cjs` (lignes ~2229-2290)

### Backend
- Handlers IPC: `main.cjs` (lignes ~1275-1295)
- API exposée: `preload.cjs` (lignes ~160-162)

---

## 🎯 Prochaines Étapes

### Session Suivante

1. **Tester l'assignation d'assets** manuellement
2. **Créer ProjectEditor** pour afficher assets assignés
3. **Implémenter désassignation** d'assets
4. **Drag & drop pour réordonner** assets dans un projet

---

**Maintenu par**: Claude Sonnet 4.5
**Dernière mise à jour**: 20/01/2025 19h45
**Status**: ✅ Assignation d'Assets Terminée - Tests manuels requis
