# 🎨 Workflow Drag & Drop Images - Documentation

**Date:** 2026-02-01  
**Feature:** Personnalisation visuelle post-génération

---

## 📐 Vue d'ensemble

Le système permet aux utilisateurs de **personnaliser les images de leur portfolio APRÈS la génération**, en glissant-déposant leurs images sur les zones appropriées.

---

## 🔄 Workflow Complet

```
1-7. Wizard (Identity, Offer, Contact, Documents, Social, Media, Template)
     ↓
8. Génération (GROQ IA génère HTML avec placeholders SVG)
     ↓
9. Preview Éditable ← NOUVEAU
   • Affichage portfolio avec zones droppables
   • Import images dans bibliothèque
   • Drag & drop sur zones (Hero, About, Projets)
     ↓
10. Preview Final (HTML avec vraies images)
     ↓
11. Export HTML
```

---

## 🧩 Composants créés

### 1. `ImagePlaceholder.tsx` (8.5 KB)
Zone droppable avec placeholder SVG stylé.

**Props:**
- `type`: 'hero' | 'about' | 'project'
- `label`: Texte affiché
- `currentImage`: Data URL si image assignée
- `onImageDrop`: Callback quand image déposée
- `onImageRemove`: Callback suppression

**Fonctionnalités:**
- Drag & drop depuis bibliothèque
- Drop direct de fichiers
- Click pour parcourir fichiers
- Overlay hover (changer/supprimer)
- Placeholder SVG quand vide

### 2. `ImageLibrary.tsx` (9.3 KB)
Bibliothèque d'images en bas de l'écran.

**Props:**
- `images`: Array de LibraryImage
- `onAddImages`: Callback import
- `onRemoveImage`: Callback suppression

**Fonctionnalités:**
- Import multiple images
- Preview thumbnails (96x96px)
- Drag depuis bibliothèque
- Supprimer image individuellement
- Compteur d'images

### 3. `EditablePreviewScreen.tsx` (13 KB)
Écran complet de personnalisation.

**Props:**
- `portfolioData`: Données du portfolio
- `initialHtml`: HTML généré par IA
- `onBack`: Retour au wizard
- `onExport`: Export vers preview final

**Fonctionnalités:**
- Affichage Hero + About + Projets
- Gestion assignments (hero, about, project-0, project-1...)
- Injection images dans HTML
- Headers avec boutons Retour/Exporter

---

## 🏗️ Modifications Templates

**Tous les 10 templates HTML ont été modifiés :**

### Hero
```html
<div class="hero-visual" data-image-zone="hero">
    <svg viewBox="0 0 400 300" style="width: 100%; height: 100%; opacity: 0.3;">
        <!-- Placeholder SVG -->
    </svg>
</div>
```

### About
```html
<div class="about-image-card" data-image-zone="about">
    <img src="{{ABOUT_IMAGE}}" alt="{{HERO_TITLE}}">
</div>
```

### Projects (dans boucle REPEAT)
```html
<!-- REPEAT: projects -->
<div class="project-image" data-image-zone="project" data-project-index="{{INDEX}}">
    <img src="{{PROJECT_IMAGE}}" alt="{{PROJECT_TITLE}}">
</div>
<!-- END REPEAT: projects -->
```

**Templates modifiés :**
1. bento-grid.html
2. glassmorphism.html
3. dopamine-colors.html
4. kinetic-typography.html
5. organic-anti-grid.html
6. scroll-storytelling.html
7. 3d-immersif-webgl.html
8. tactile-maximalism.html
9. hand-drawn-scribble.html
10. exaggerated-hierarchy.html

---

## 🔧 Modifications Services

### `templateInjectorService.ts`

**Ajout support `{{INDEX}}` dans boucles REPEAT :**

```typescript
return items.map((item, index) => {
  let block = blockContent;
  const replacements = getReplacements(item);
  
  // Ajouter l'index
  replacements['INDEX'] = index.toString();
  
  // ... reste du code
});
```

Résultat : `data-project-index="{{INDEX}}"` devient `data-project-index="0"`, `"1"`, `"2"`...

### `EditablePreviewScreen.tsx`

**Fonction `injectImagesIntoHtml` :**

```typescript
// Injecter hero
result = result.replace(
  /data-image-zone="hero"[^>]*>[\s\S]*?<\/div>/,
  `data-image-zone="hero"><img src="${assignments.hero}" .../></div>`
);

// Injecter about
result = result.replace(
  /data-image-zone="about"[^>]*>[\s\S]*?<\/div>/,
  `data-image-zone="about"><img src="${assignments.about}" .../></div>`
);

// Injecter projets
Object.entries(assignments).forEach(([key, value]) => {
  if (key.startsWith('project-') && value) {
    const projectIndex = key.split('-')[1];
    const regex = new RegExp(
      `data-image-zone="project"[^>]*data-project-index="${projectIndex}"[^>]*>[\\s\\S]*?<\\/div>`
    );
    result = result.replace(regex, ...);
  }
});
```

---

## 🔗 Intégration PortfolioHub

### États ajoutés

```typescript
type MPFScreen = 'selector' | 'wizard' | 'generating' | 'editable-preview' | 'preview' | 'mpf-view';
```

### Handlers ajoutés

```typescript
const handleEditablePreviewBack = useCallback(() => {
  setMpfScreen('wizard');
}, []);

const handleEditablePreviewExport = useCallback((html: string) => {
  setGeneratedHTML(html);
  setMpfScreen('preview');
  toast.success('Succès', 'Portfolio personnalisé !');
}, [toast]);
```

### Flux de navigation

```typescript
// Après génération, passer à editable-preview au lieu de preview
if (result.success && result.html) {
  setGeneratedHTML(result.html);
  setMpfScreen('editable-preview'); // ← Changé
}

// Render conditionnel
{mpfScreen === 'editable-preview' && generatedHTML && wizardData && (
  <EditablePreviewScreen
    portfolioData={{...}}
    initialHtml={generatedHTML}
    onBack={handleEditablePreviewBack}
    onExport={handleEditablePreviewExport}
  />
)}
```

---

## 🎨 Design System

**100% CALM-UI** (design-system.ts) :
- `useTheme()` pour tous les styles
- Couleurs : `theme.bg.primary`, `theme.accent.primary`, etc.
- Typography : `typography.fontSize.sm`, `typography.fontWeight.medium`
- Radius : `borderRadius.lg`, `borderRadius.xl`
- Transitions : `transitions.fast`

**Zero Tailwind** utilisé.

---

## 📊 État des assignments

```typescript
interface ImageAssignments {
  hero?: string;        // Data URL image hero
  about?: string;       // Data URL photo profil
  'project-0'?: string; // Data URL projet 1
  'project-1'?: string; // Data URL projet 2
  // ...
}
```

---

## ✅ Tests

### Test manuel

1. Lancer l'app : `npm run start`
2. Aller dans Portfolio Hub → Créer un portfolio
3. Remplir le wizard (7 étapes)
4. Attendre la génération
5. **Preview Éditable s'affiche**
6. Cliquer "+ Importer" → Ajouter 3-4 images
7. Drag une image vers zone Hero → Image s'affiche
8. Drag une image vers zone About → Image s'affiche
9. Drag des images vers projets → Images s'affichent
10. Cliquer "Exporter" → Preview final avec images
11. Exporter HTML → Vérifier que les images sont intégrées

### Validation TypeScript

```bash
npx tsc --noEmit
```

✅ 0 erreurs

---

## 🚀 Prochaines améliorations

### Optionnelles (futures)
- [ ] Crop images avant assignment
- [ ] Suggestions IA de placement d'images
- [ ] Preview temps réel du HTML
- [ ] Undo/Redo pour assignments
- [ ] Galerie templates avec preview images
- [ ] Export optimisé (compression images)

---

## 📝 Notes techniques

### Data URLs
Les images sont stockées en **data URLs** (base64) pour :
- ✅ Éviter dépendances serveur
- ✅ Export HTML standalone
- ✅ Compatibilité offline
- ⚠️ Taille HTML plus grande (acceptable pour portfolios)

### Placeholders SVG
Préférés aux emojis/texte pour :
- ✅ Rendu professionnel
- ✅ Adaptable au thème (stroke="currentColor")
- ✅ Pas de dépendances externes

### Performance
- `React.useCallback` pour tous les handlers
- Pas de re-render inutile des composants
- Injection HTML optimisée (regex ciblées)

---

## 🐛 Debug

### Images ne s'affichent pas après drop

1. Vérifier console : `data-image-zone` présent dans HTML ?
2. Vérifier assignments : `console.log(assignments)`
3. Vérifier injection : Regex match le HTML généré ?

### Template sans placeholder

1. Vérifier que `data-image-zone="hero"` existe
2. Si manquant, ajouter manuellement dans le template
3. Vérifier que le service de rendering traite le template

### Index projets incorrects

1. Vérifier `templateInjectorService` : `{{INDEX}}` remplacé ?
2. Vérifier HTML généré : `data-project-index="0"` présent ?
3. Vérifier regex dans `injectImagesIntoHtml`

---

**Auteur:** Claude (Assistant IA)  
**Dernière mise à jour:** 2026-02-01
