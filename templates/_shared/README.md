# CSS Partagés pour les Templates

Ces fichiers CSS sont conçus pour être **partagés entre tous les templates** afin d'assurer une cohérence de layout, typographie et édition.

## Fichiers

### `_layout-adaptive.css`
Gère la disposition adaptative des sections :
- **Services** : toujours 3 colonnes (1 col sur mobile)
- **Projets** : layout adaptatif selon le nombre
  - 1 projet → horizontal (image + texte côte à côte)
  - 2 projets → 2 colonnes
  - 3+ projets → grille 2 colonnes
- **Contact** : pleine largeur
- Hauteurs harmonisées

### `_typography.css`
Typographie standardisée :
- Texte justifié sur desktop
- Line-height confortable (1.7)
- Hyphenation automatique
- Pas de justification sur mobile

### `_editable.css`
Styles pour la preview éditable :
- Highlight au survol des champs éditables
- Focus avec outline personnalisé
- Indicateur visuel des modifications (barre bleue)
- Bouton reset par champ

## Utilisation

### Dans un template monolithique (HTML)

Insérer dans la balise `<style>` :

```html
<style>
  /* Import des CSS partagés */
  @import url('./_shared/_layout-adaptive.css');
  @import url('./_shared/_typography.css');
  @import url('./_shared/_editable.css');

  /* Styles spécifiques au template */
  :root {
    --primary-color: #6366f1;
    /* ... */
  }
  
  /* ... reste du CSS ... */
</style>
```

### Dans un template React/Vue

```javascript
import '../../templates/_shared/_layout-adaptive.css';
import '../../templates/_shared/_typography.css';
import '../../templates/_shared/_editable.css';
```

## Classes CSS à utiliser

### Services
```html
<div class="services-grid">
  <div class="service-card">
    <h3>Service 1</h3>
    <p class="service-description">...</p>
  </div>
  <!-- ... -->
</div>
```

### Projets
```html
<div class="projects-grid" data-count="3">
  <div class="project-card">
    <img class="project-image" src="..." alt="...">
    <h3>Projet 1</h3>
    <p class="project-description">...</p>
  </div>
  <!-- ... -->
</div>
```

### Preview éditable
```html
<div class="editable-wrapper">
  <h1 
    contenteditable="true" 
    data-field="heroTitle"
    data-original="{{heroTitle}}"
  >{{heroTitle}}</h1>
  <button class="reset-btn" title="Réinitialiser">↺</button>
</div>
```

## JavaScript pour l'édition

```javascript
// Détecter modifications
document.querySelectorAll('[contenteditable="true"]').forEach(el => {
  el.addEventListener('input', () => {
    const isModified = el.innerText !== el.dataset.original;
    el.classList.toggle('modified', isModified);
  });
});

// Reset individuel
document.querySelectorAll('.reset-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const wrapper = btn.closest('.editable-wrapper');
    const field = wrapper.querySelector('[contenteditable]');
    field.innerText = field.dataset.original;
    field.classList.remove('modified');
  });
});
```

## Migration des templates existants

Pour migrer un template :
1. Ajouter les imports CSS en haut du `<style>`
2. Remplacer les classes custom par les classes standardisées
3. Ajouter `data-count` sur `.projects-grid`
4. Tester sur desktop + mobile

## Compatibilité

- Navigateurs modernes (Chrome 90+, Firefox 88+, Safari 14+)
- Support `:has()` pour les layouts adaptatifs avancés
- Fallback avec `data-count` pour les anciens navigateurs
