# Génération automatique de thumbnails templates

## 🎯 Objectif

Générer automatiquement des miniatures (400x300 PNG) pour chaque template à partir du rendu HTML réel.

## 🛠️ Comment ça marche

**1. Handler IPC** (`main.cjs`)
- `template-generate-screenshot` : Charge template, injecte données fictives, capture screenshot

**2. Processus** :
```
1. Charge template HTML
2. Injecte données fictives (Jean Dupont, services, projets)
3. Crée BrowserWindow invisible (headless)
4. Capture screenshot
5. Resize à 400x300 (sharp)
6. Save en PNG dans templates/thumbnails/
```

## 🚀 Utilisation

### Via console DevTools

1. Ouvre l'app en mode dev
2. Ouvre DevTools (Ctrl+Shift+I)
3. Dans la console :

```javascript
// Charger l'utilitaire
import('/src/utils/generateAllThumbnails.ts').then(m => m.generateAllThumbnails())

// Ou si déjà chargé
window.generateAllThumbnails()
```

### Via code

```typescript
import { generateAllThumbnails } from './utils/generateAllThumbnails';

// Régénérer tous les thumbnails
await generateAllThumbnails();
```

### Via IPC direct (depuis renderer)

```typescript
// Générer pour un template spécifique
// @ts-ignore
const result = await window.electron.templates.generateScreenshot('bento-grid');

if (result.success) {
  console.log('Thumbnail saved at:', result.path);
}
```

## 📂 Fichiers générés

```
/templates/thumbnails/
  ├── bento-grid.png
  ├── glassmorphism.png
  ├── kinetic-typography.png
  ├── organic-anti-grid.png
  ├── scroll-storytelling.png
  ├── tactile-maximalism.png
  ├── hand-drawn-scribble.png
  ├── exaggerated-hierarchy.png
  ├── 3d-immersif-webgl.png
  └── dopamine-colors.png
```

## 🐛 Dépannage

**Problème : "sharp not found"**
```bash
npm install sharp
```

**Problème : Screenshot vide/noir**
- Augmenter le délai de rendu (ligne 2000ms)
- Vérifier que le template HTML est valide

**Problème : Template non trouvé**
- Vérifier que le template existe dans la DB
- Vérifier que `html_path` est correct

## 🔧 Configuration

**Taille thumbnail** : Modifier dans `main.cjs`
```javascript
.resize(400, 300, {
  fit: 'cover',
  position: 'top'
})
```

**Qualité PNG** : Ajuster
```javascript
.png({ quality: 90 })
```

**Données fictives** : Modifier `mockData` dans le handler

## ✅ Checklist nouvelle template

Quand tu ajoutes un nouveau template :

1. Ajouter HTML dans `/templates/nomTemplate.html`
2. Seed dans `database_templates.cjs`
3. Régénérer thumbnail : `window.generateAllThumbnails()`
4. Vérifier `/templates/thumbnails/nomTemplate.png`

---

**Avantage** : Thumbnails 100% fidèles au rendu réel (pas de SVG manuels à maintenir) ✅
