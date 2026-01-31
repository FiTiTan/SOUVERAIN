# TEMPLATES - Système de génération portfolio

## 📐 Architecture

**Problème résolu :** Avant, `htmlExporter.ts` générait du HTML basique hardcodé. Les templates stylisés dans `/templates/*.html` n'étaient jamais utilisés.

**Solution :** Système de templates avec placeholders et sections répétées.

---

## 📂 Structure fichiers

```
/templates/
  ├── bento-grid.html              # Template Apple-style
  ├── glassmorphism.html           # Effet verre dépoli
  ├── kinetic-typography.html      # Typographie animée
  ├── organic-anti-grid.html       # Formes organiques
  ├── scroll-storytelling.html     # Narration au scroll
  ├── tactile-maximalism.html      # Design maximaliste
  ├── hand-drawn-scribble.html     # Esthétique dessinée
  ├── exaggerated-hierarchy.html   # Hiérarchie typographique
  ├── 3d-immersif-webgl.html       # 3D WebGL
  ├── dopamine-colors.html         # Couleurs vibrantes
  └── thumbnails/
      ├── bento-grid.svg           # Preview template
      └── ...
```

---

## 🔧 Système de placeholders

### Variables simples

Remplacées par `{{VAR_NAME}}` :

**Hero section :**
- `{{HERO_TITLE}}` → Nom du portfolio
- `{{HERO_SUBTITLE}}` → Tagline
- `{{HERO_EYEBROW}}` → Titre professionnel
- `{{HERO_CTA_TEXT}}` → Texte bouton CTA

**About :**
- `{{ABOUT_TEXT}}` → Bio
- `{{ABOUT_IMAGE}}` → Photo auteur
- `{{VALUE_PROP}}` → Proposition de valeur

**Contact :**
- `{{CONTACT_EMAIL}}` → Email
- `{{CONTACT_PHONE}}` → Téléphone
- `{{CONTACT_ADDRESS}}` → Adresse

**Footer :**
- `{{CURRENT_YEAR}}` → Année courante

---

## 🔁 Sections répétées

### Syntaxe

```html
<!-- REPEAT: sectionName -->
<div class="item">
  <h3>{{ITEM_TITLE}}</h3>
  <p>{{ITEM_DESC}}</p>
</div>
<!-- END REPEAT: sectionName -->
```

### Sections disponibles

**1. Services** (`services`)

Variables :
- `{{SERVICE_ICON}}` → Emoji ou icône
- `{{SERVICE_TITLE}}` → Titre du service
- `{{SERVICE_DESC}}` → Description

**2. Projets** (`projects`)

Variables :
- `{{PROJECT_TITLE}}` → Nom du projet
- `{{PROJECT_DESC}}` → Description
- `{{PROJECT_CATEGORY}}` → Catégorie
- `{{PROJECT_IMAGE}}` → Image de couverture
- `{{PROJECT_LINK}}` → URL du projet

**3. Social links** (`socialLinks`)

Variables :
- `{{SOCIAL_PLATFORM}}` → Nom plateforme
- `{{SOCIAL_URL}}` → Lien
- `{{SOCIAL_ICON}}` → Icône

**4. Testimonials** (`testimonials`)

Variables :
- `{{TESTIMONIAL_TEXT}}` → Citation
- `{{TESTIMONIAL_AUTHOR}}` → Nom
- `{{TESTIMONIAL_ROLE}}` → Titre

---

## ❓ Conditions

### Syntaxe

```html
<!-- IF: conditionName -->
<div>Contenu affiché si true</div>
<!-- ENDIF: conditionName -->
```

### Conditions disponibles

- `showProjects` → Afficher section projets (si > 0 projets)
- `showSocialShowcase` → Afficher réseaux sociaux (si liens présents)
- `showTestimonials` → Afficher témoignages
- `showPracticalInfo` → Afficher infos pratiques
- `hasAboutImage` → Afficher photo auteur
- `hasValueProp` → Afficher proposition de valeur
- `hasAddress` → Afficher adresse
- `hasProjectLink` → Afficher lien projet (dans boucle)

---

## 🚀 Utilisation

### Dans le code

```typescript
import { generatePortfolioHTML } from '@/services/htmlExporter';

const html = await generatePortfolioHTML(
  portfolio,      // Données portfolio
  projects,       // Liste des projets
  palette,        // Palette de couleurs (non utilisée pour templates V2)
  'bento-grid'    // ID du template
);
```

### Workflow

1. **User sélectionne template** dans Step7Template
2. **Preview chargé** via PreviewPortfolio.tsx
3. **htmlExporter.ts** :
   - Charge template HTML via `getTemplateHTML(templateId)`
   - Remplace placeholders simples
   - Parse et duplique sections répétées
   - Applique conditions IF/ENDIF
   - Retourne HTML final

---

## 🐛 Debug

**Template ne charge pas ?**

Vérifier :
1. Template existe dans `/templates/*.html` ✅
2. Template seed dans `database_templates.cjs` ✅
3. Handler IPC `template-get-html` dans `main.cjs` ✅
4. Preload expose `window.electron.templates.getHTML()` ✅

**Placeholder non remplacé ?**

- Vérifier syntaxe : `{{VAR_NAME}}` (MAJUSCULES)
- Vérifier présence dans `htmlExporter.ts` ligne ~190

**Section répétée vide ?**

- Vérifier syntaxe markers : `<!-- REPEAT: name -->` / `<!-- END REPEAT: name -->`
- Vérifier nom section dans `processRepeatedSection()`

---

## ✅ Migration anciens templates

**Supprimés (obsolètes) :**
- kinetic-typo.html → remplacé par kinetic-typography.html
- minimal-apple.html → template basique non stylisé
- organic-flow.html → remplacé par organic-anti-grid.html

**Migrés v2 (améliorés) :**
- bento-grid.html → Version complète avec sections
- glassmorphism.html → Glassmorphism Affiné
- + 6 nouveaux templates

---

## 📝 Créer un nouveau template

1. **Créer `/templates/mon-template.html`**
   - Ajouter placeholders `{{VAR_NAME}}`
   - Utiliser `<!-- REPEAT: -->` pour sections
   - Utiliser `<!-- IF: -->` pour conditions

2. **Créer thumbnail `/templates/thumbnails/mon-template.svg`**

3. **Seed dans `database_templates.cjs` :**
   ```javascript
   {
     id: 'mon-template',
     name: 'Mon Template',
     description: 'Description...',
     category: 'free',
     price: 0,
     thumbnail_path: 'templates/thumbnails/mon-template.svg',
     html_path: 'templates/mon-template.html',
     is_owned: 1,
     tags: 'tag1,tag2',
     ideal_for: 'Cible idéale',
     version: '1.0.0'
   }
   ```

4. **Restart app** → Template auto-seed

---

**Dernière mise à jour :** 31 janvier 2026
