# Preview Éditable - Documentation Technique

## 🎯 Vue d'ensemble

Système de personnalisation visuelle post-génération permettant aux utilisateurs de drag & drop leurs images sur leur portfolio.

---

## 📦 Composants

### 1. `ImagePlaceholder.tsx`

**Rôle:** Zone droppable pour recevoir des images.

**Props:**
```typescript
interface ImagePlaceholderProps {
  type: 'hero' | 'about' | 'project';
  label?: string;
  currentImage?: string;
  onImageDrop: (dataUrl: string) => void;
  onImageRemove?: () => void;
  disabled?: boolean;
}
```

**Features:**
- ✅ Drag & drop d'images depuis la bibliothèque
- ✅ Drag & drop de fichiers depuis l'explorateur
- ✅ Clic pour parcourir (fallback)
- ✅ Changement/suppression au hover
- ✅ Accessible (keyboard + ARIA)
- ✅ CALM-UI compliant
- ✅ React.memo optimisé

**Utilisation:**
```tsx
<ImagePlaceholder
  type="hero"
  label="Bannière principale"
  currentImage={heroImageUrl}
  onImageDrop={(dataUrl) => setHeroImage(dataUrl)}
  onImageRemove={() => setHeroImage(undefined)}
/>
```

---

### 2. `ImageLibrary.tsx`

**Rôle:** Bibliothèque d'images draggables.

**Props:**
```typescript
interface ImageLibraryProps {
  images: LibraryImage[];
  onAddImages: (files: FileList) => void;
  onRemoveImage: (id: string) => void;
}
```

**Features:**
- ✅ Import multiple d'images
- ✅ Drag images vers les placeholders
- ✅ Suppression au hover
- ✅ Affichage nom fichier
- ✅ Compteur d'images
- ✅ Optimisé (sub-component LibraryImageCard)

**Utilisation:**
```tsx
<ImageLibrary
  images={libraryImages}
  onAddImages={handleAddImages}
  onRemoveImage={handleRemoveImage}
/>
```

---

### 3. `EditablePreview.tsx`

**Rôle:** Composant principal orchestrant le preview éditable.

**Props:**
```typescript
interface EditablePreviewProps {
  portfolioData: PortfolioData;
  initialHtml: string;
  onHtmlUpdate: (html: string) => void;
  onBack?: () => void;
  onExport?: () => void;
}
```

**Features:**
- ✅ Preview complet du portfolio
- ✅ Sections Hero, About, Projects
- ✅ Gestion état des images
- ✅ Injection images dans HTML
- ✅ Boutons navigation (Retour/Export)
- ✅ Optimisé (ProjectCard sub-component)

**Utilisation:**
```tsx
<EditablePreview
  portfolioData={generatedData}
  initialHtml={generatedHtml}
  onHtmlUpdate={setFinalHtml}
  onBack={() => setStep('wizard')}
  onExport={() => exportPortfolio(finalHtml)}
/>
```

---

## 🪝 Custom Hook

### `useImageLibrary.ts`

**Rôle:** Logique réutilisable de gestion d'images.

```typescript
const {
  libraryImages,
  assignments,
  addImages,
  removeImage,
  assignImage,
  removeAssignment,
  clearAll,
} = useImageLibrary(initialAssignments);
```

**Avantages:**
- Logique centralisée
- Réutilisable dans d'autres composants
- Testable unitairement
- Separation of concerns

---

## 📐 Architecture

```
EditablePreview
├── Header (Retour/Export)
├── Preview Zone
│   ├── Hero Section
│   │   └── ImagePlaceholder (hero)
│   ├── About Section
│   │   └── ImagePlaceholder (about)
│   └── Projects Section
│       └── ProjectCard[]
│           └── ImagePlaceholder (project-N)
└── ImageLibrary
    └── LibraryImageCard[]
```

---

## 🔄 Workflow de Données

```typescript
// 1. User importe images
FileList → addImages() → libraryImages[]

// 2. User drag image
LibraryImage → handleDragStart() → setData('imageDataUrl')

// 3. User drop sur placeholder
handleDrop() → assignImage(zone, dataUrl) → assignments{}

// 4. Update HTML
assignments → injectImagesIntoHtml() → finalHtml

// 5. Export
finalHtml → exportPortfolio()
```

---

## 🎨 CALM-UI Compliance

**✅ Toutes les couleurs utilisent `theme.*`:**

```typescript
// ❌ ÉVITER
style={{ backgroundColor: '#FFFFFF' }}

// ✅ CORRECT
style={{ backgroundColor: theme.background.primary }}
```

**Tokens utilisés:**
- `theme.background.primary/secondary/tertiary`
- `theme.text.primary/secondary/inverse`
- `theme.accent.primary/secondary`
- `theme.border.default`
- `theme.borderRadius.*`
- `theme.spacing.*`
- `theme.typography.*`

---

## ♿ Accessibilité

**✅ Keyboard Navigation:**
- Tab/Shift+Tab: Navigation entre zones
- Enter/Space: Activer le placeholder
- Delete/Backspace: Supprimer une image de la bibliothèque

**✅ ARIA:**
- `aria-label` sur tous les boutons
- `role="button"` sur placeholders
- `role="listitem"` sur images bibliothèque
- `aria-hidden` sur éléments décoratifs

**✅ Screen Readers:**
- Labels descriptifs
- Messages d'état explicites
- Alt text sur toutes les images

---

## ⚡ Optimisations React

### 1. React.memo
```typescript
export const ImagePlaceholder = React.memo(...)
export const ImageLibrary = React.memo(...)
export const EditablePreview = React.memo(...)
export const ProjectCard = React.memo(...)
export const LibraryImageCard = React.memo(...)
```

**Pourquoi:** Évite re-renders inutiles quand props identiques.

### 2. useCallback
```typescript
const handleImageDrop = useCallback((dataUrl) => {
  setAssignments(prev => ({ ...prev, [zone]: dataUrl }));
}, [zone]);
```

**Pourquoi:** Évite re-création de fonctions à chaque render.

### 3. useMemo
```typescript
const projectsCount = useMemo(
  () => portfolioData.projects?.length || 0,
  [portfolioData.projects]
);
```

**Pourquoi:** Évite re-calculs coûteux.

### 4. Sub-components
```typescript
// Au lieu de mapper directement dans EditablePreview
{projects.map((project) => (
  <ProjectCard key={project.id} {...project} />
))}
```

**Pourquoi:** Seuls les ProjectCard modifiés re-render, pas tous.

---

## 🧪 Tests (à implémenter)

### Tests unitaires

```typescript
// ImagePlaceholder.test.tsx
describe('ImagePlaceholder', () => {
  it('affiche le placeholder quand pas d\'image', () => {});
  it('affiche l\'image quand assignée', () => {});
  it('appelle onImageDrop au drop', () => {});
  it('appelle onImageRemove au clic supprimer', () => {});
  it('est accessible au clavier', () => {});
});

// ImageLibrary.test.tsx
describe('ImageLibrary', () => {
  it('affiche le message vide quand aucune image', () => {});
  it('affiche les images importées', () => {});
  it('permet de supprimer une image', () => {});
  it('permet de drag une image', () => {});
});

// useImageLibrary.test.ts
describe('useImageLibrary', () => {
  it('ajoute des images', async () => {});
  it('supprime des images', () => {});
  it('assigne des images aux zones', () => {});
  it('supprime des assignments', () => {});
});
```

### Tests d'intégration

```typescript
describe('EditablePreview intégration', () => {
  it('workflow complet: import → drag → drop → export', async () => {});
  it('persistance des assignments', () => {});
  it('génération HTML final correct', () => {});
});
```

---

## 🐛 Error Handling

**✅ Fichiers non-images:**
```typescript
if (!file.type.startsWith('image/')) {
  console.warn(`Fichier ${file.name} ignoré`);
  continue;
}
```

**✅ Erreur lecture fichier:**
```typescript
try {
  const dataUrl = await fileToDataUrl(file);
  ...
} catch (error) {
  console.error(`Erreur lecture ${file.name}:`, error);
}
```

**✅ HTML injection sécurisée:**
```typescript
// Utilise regex pour remplacer uniquement les zones attendues
result.replace(/data-image-zone="hero"[^>]*>[\s\S]*?<\/div>/, ...)
```

---

## 📊 Performance

**Optimisations implémentées:**

1. **Lazy loading images:** `loading="lazy"` sur toutes les `<img>`
2. **Debounce HTML update:** useEffect avec dependencies optimales
3. **Memoization:** React.memo + useCallback + useMemo
4. **Sub-components:** Évite re-render de toute la liste
5. **FileReader asynchrone:** Lecture fichiers en parallèle

**Métriques attendues:**
- < 100ms: Drop image → affichage
- < 50ms: Changement assignment → update HTML
- < 1s: Import 10 images (dépend taille)

---

## 🔮 Améliorations Futures

**Phase 2:**
- [ ] Crop/resize images avant assignment
- [ ] Filtres (grayscale, sepia, etc.)
- [ ] Undo/Redo
- [ ] Prévisualisation template en temps réel
- [ ] Optimisation automatique des images (compression)
- [ ] Support vidéos/GIFs
- [ ] Bibliothèque persistée (localStorage)
- [ ] Drag & drop réordering des projets

---

## 📝 Changelog

**v1.0.0** (2026-02-01)
- ✅ ImagePlaceholder créé
- ✅ ImageLibrary créé
- ✅ EditablePreview créé
- ✅ useImageLibrary hook créé
- ✅ Types TypeScript définis
- ✅ CALM-UI compliant
- ✅ Accessibilité implémentée
- ✅ Optimisations React appliquées

---

**Auteur:** React-Expert Skill  
**Dernière MAJ:** 2026-02-01
