# Mission : Adapter les templates portfolio pour génération IA

## Contexte

Je développe SOUVERAIN, une app Electron qui génère des portfolios web. 
L'utilisateur importe ses données (intentions, projets, médias) et Groq (Llama 3.3 70B) 
génère le HTML final en adaptant un template.

## Ce que Groq doit pouvoir faire

1. Remplacer le contenu par les données utilisateur
2. Supprimer les sections non pertinentes
3. Adapter le ton/longueur selon le contexte
4. NE JAMAIS toucher au CSS/style

## Format de template requis

Adapte mes templates HTML avec ces conventions :

### 1. En-tête de template (commentaire en haut)
```html
<!--
TEMPLATE: [Nom du style]
DESCRIPTION: [Description courte]
SECTIONS_OBLIGATOIRES: hero, contact
SECTIONS_OPTIONNELLES: about, services, projects, testimonials, gallery
-->
```

### 2. Marqueurs de contenu dynamique
- `{{VARIABLE_NAME}}` pour le contenu à remplacer
- Variables en SCREAMING_SNAKE_CASE
- Exemples : `{{HERO_TITLE}}`, `{{ABOUT_TEXT}}`, `{{SERVICE_1_TITLE}}`

### 3. Commentaires de section
```html
<!-- SECTION: nom_section (OBLIGATOIRE) -->
<!-- SECTION: nom_section (OPTIONNEL - supprimer si non pertinent) -->
```

### 4. Protection du style
```html
<style>
/* ========== NE PAS MODIFIER - STYLE PROTÉGÉ ========== */
...
/* ========== FIN STYLE PROTÉGÉ ========== */
</style>
```

### 5. Zones répétables (projets, services, etc.)
```html
<!-- REPEAT: projects -->
<div class="project-card">
  <h3>{{PROJECT_TITLE}}</h3>
  <p>{{PROJECT_DESCRIPTION}}</p>
  <img src="{{PROJECT_IMAGE}}" alt="{{PROJECT_TITLE}}">
</div>
<!-- END REPEAT: projects -->
```

### 6. Contenu conditionnel
```html
<!-- IF: has_testimonials -->
<section class="testimonials">
  ...
</section>
<!-- ENDIF: has_testimonials -->
```

## Variables standard à utiliser

```
HERO_TITLE          - Titre principal
HERO_SUBTITLE       - Sous-titre / accroche
ABOUT_TEXT          - Texte de présentation
CONTACT_EMAIL       - Email de contact
CONTACT_PHONE       - Téléphone (optionnel)
CONTACT_ADDRESS     - Adresse (optionnel)

SERVICE_X_TITLE     - Titre du service X
SERVICE_X_DESC      - Description du service X

PROJECT_X_TITLE     - Titre du projet X
PROJECT_X_DESC      - Description du projet X
PROJECT_X_IMAGE     - URL image du projet X

TESTIMONIAL_X_TEXT  - Texte du témoignage X
TESTIMONIAL_X_AUTHOR - Auteur du témoignage X
```

## Ta tâche

Pour chaque template HTML que je te fournis :

1. Ajoute l'en-tête de métadonnées
2. Remplace le contenu par des marqueurs `{{...}}`
3. Ajoute les commentaires de section avec (OBLIGATOIRE) ou (OPTIONNEL)
4. Protège le bloc `<style>` avec les commentaires
5. Identifie les zones répétables et ajoute les balises REPEAT
6. Garde le HTML/CSS intact, change UNIQUEMENT le contenu texte et les attributs src/alt

## Exemple de sortie attendue

```html
<!--
TEMPLATE: Minimaliste Apple
DESCRIPTION: Design épuré, beaucoup de blanc, typographie élégante
SECTIONS_OBLIGATOIRES: hero, about, contact
SECTIONS_OPTIONNELLES: services, projects
-->

<!DOCTYPE html>
<html lang="fr">
<head>
  <style>
  /* ========== NE PAS MODIFIER - STYLE PROTÉGÉ ========== */
  * { margin: 0; padding: 0; }
  .hero { ... }
  /* ========== FIN STYLE PROTÉGÉ ========== */
  </style>
</head>
<body>
  <!-- SECTION: hero (OBLIGATOIRE) -->
  <section class="hero">
    <h1>{{HERO_TITLE}}</h1>
    <p>{{HERO_SUBTITLE}}</p>
  </section>

  <!-- SECTION: services (OPTIONNEL - supprimer si non pertinent) -->
  <section class="services">
    <!-- REPEAT: services -->
    <div class="service">
      <h3>{{SERVICE_TITLE}}</h3>
      <p>{{SERVICE_DESC}}</p>
    </div>
    <!-- END REPEAT: services -->
  </section>

  <!-- SECTION: contact (OBLIGATOIRE) -->
  <section class="contact">
    <a href="mailto:{{CONTACT_EMAIL}}">{{CONTACT_EMAIL}}</a>
    <!-- IF: has_phone -->
    <a href="tel:{{CONTACT_PHONE}}">{{CONTACT_PHONE}}</a>
    <!-- ENDIF: has_phone -->
  </section>
</body>
</html>
```

---

## Template à adapter

[COLLER LE TEMPLATE HTML ICI]
