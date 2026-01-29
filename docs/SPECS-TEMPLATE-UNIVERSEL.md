# SPECS TEMPLATE UNIVERSEL - Pour Gemini → Kimi

**Usage:** Donne ce brief à Gemini pour qu'il génère le prompt Kimi
**Objectif:** Un seul template HTML flexible pour tous les profils

---

## 🎯 Contexte

Tu dois créer un prompt pour Kimi afin qu'il génère un template HTML portfolio :
- Design moderne, minimaliste, inspiré Apple
- Responsive (mobile-first)
- Animations subtiles (GSAP ou CSS)
- Sections modulaires (activables/désactivables)

---

## 📐 Sections du Template

### OBLIGATOIRES (toujours présentes)

#### 1. HERO
```
- Titre principal (nom/activité)
- Sous-titre (accroche/tagline)
- CTA principal (bouton)
- Background sobre ou image optionnelle
```

#### 2. ABOUT
```
- Photo/avatar (optionnel)
- Texte de présentation
- Points clés ou proposition de valeur
```

#### 3. SERVICES/OFFRES
```
- 1 à 3 services/compétences
- Icône ou visuel par service
- Description courte
- Design en cards ou grille
```

#### 4. CONTACT
```
- Email (obligatoire)
- Téléphone (optionnel)
- Formulaire simple OU juste les coordonnées
- Réseaux sociaux (icônes)
```

---

### OPTIONNELLES (selon les données)

#### 5. PROJETS/RÉALISATIONS
```
Condition : SI projets fournis

- Grille ou liste de projets
- Image par projet
- Titre + description courte
- Catégorie (optionnel)
- Lien vers le projet (optionnel)
- Design : cards avec hover effect
```

#### 6. INFOS PRATIQUES
```
Condition : SI adresse OU horaires fournis

- Adresse avec lien Google Maps
- Horaires d'ouverture
- Informations de parking/accès (optionnel)
- Design : section distincte, facile à repérer
```

#### 7. TÉMOIGNAGES
```
Condition : SI témoignages fournis

- Citation avec guillemets
- Nom de l'auteur
- Rôle/entreprise
- Design : slider ou grille de cards
```

#### 8. SOCIAL SHOWCASE
```
Condition : SI vitrine principale = réseaux sociaux

- Mise en avant du réseau principal (Instagram, TikTok, etc.)
- CTA "Suivez-moi" prominent
- Optionnel : embed du feed ou aperçu
- Position : juste après le Hero
```

---

## 🎨 Directives de Design

### Style général
```
- Minimaliste, épuré
- Beaucoup d'espace blanc
- Typographie : Inter ou SF Pro ou similaire
- Couleurs : Noir/Blanc + 1 accent (bleu par défaut, personnalisable)
- Pas de gradients complexes
- Ombres très subtiles
```

### Responsive
```
- Mobile-first
- Breakpoints : 480px / 768px / 1024px / 1280px
- Navigation : burger menu sur mobile
- Images : object-fit cover, lazy loading
```

### Animations
```
- Fade-in au scroll (GSAP ScrollTrigger ou Intersection Observer)
- Hover effects subtils sur les cards
- Transitions smooth (0.3s ease)
- Pas d'animations excessives
```

### Accessibilité
```
- Contraste suffisant (WCAG AA)
- Alt text sur les images
- Focus states visibles
- Semantic HTML (header, main, section, footer)
```

---

## 📝 Variables à utiliser

Le template doit utiliser ces variables (format `{{VARIABLE}}`) :

```
// Identité
{{HERO_TITLE}}          - Nom ou nom d'activité
{{HERO_SUBTITLE}}       - Accroche principale
{{HERO_CTA_TEXT}}       - Texte du bouton CTA (défaut: "Me contacter")
{{ABOUT_TEXT}}          - Texte de présentation
{{ABOUT_IMAGE}}         - URL de la photo (optionnel)

// Services (répétables)
{{SERVICE_TITLE}}       - Titre du service
{{SERVICE_DESC}}        - Description du service
{{SERVICE_ICON}}        - Emoji ou icône (optionnel)

// Projets (répétables)
{{PROJECT_TITLE}}       - Titre du projet
{{PROJECT_DESC}}        - Description
{{PROJECT_IMAGE}}       - Image du projet
{{PROJECT_CATEGORY}}    - Catégorie (optionnel)
{{PROJECT_LINK}}        - Lien externe (optionnel)

// Témoignages (répétables)
{{TESTIMONIAL_TEXT}}    - Citation
{{TESTIMONIAL_AUTHOR}}  - Nom de l'auteur
{{TESTIMONIAL_ROLE}}    - Rôle/entreprise

// Contact
{{CONTACT_EMAIL}}       - Email
{{CONTACT_PHONE}}       - Téléphone (optionnel)
{{CONTACT_ADDRESS}}     - Adresse (optionnel)
{{OPENING_HOURS}}       - Horaires (optionnel)

// Réseaux sociaux (répétables)
{{SOCIAL_PLATFORM}}     - Nom du réseau
{{SOCIAL_URL}}          - URL du profil
{{SOCIAL_ICON}}         - Icône du réseau

// Meta
{{PROFILE_TYPE}}        - Type de profil (pour adaptation du ton)
{{CURRENT_YEAR}}        - Année en cours
```

---

## 🏗 Structure HTML attendue

```html
<!--
TEMPLATE: Portfolio Universel
DESCRIPTION: Template modulaire adapté à tous les profils
SECTIONS_OBLIGATOIRES: hero, about, services, contact
SECTIONS_OPTIONNELLES: projects, practical_info, testimonials, social_showcase
-->

<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{HERO_TITLE}} | Portfolio</title>
  
  <!-- Fonts -->
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  
  <!-- GSAP (optionnel) -->
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js" defer></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js" defer></script>
  
  <style>
  /* ========== NE PAS MODIFIER - STYLE PROTÉGÉ ========== */
  
  /* Variables CSS */
  :root { ... }
  
  /* Reset & Base */
  * { ... }
  
  /* Typography */
  h1, h2, h3 { ... }
  
  /* Layout */
  .container { ... }
  .section { ... }
  
  /* Components */
  .btn { ... }
  .card { ... }
  
  /* Sections */
  .hero { ... }
  .about { ... }
  .services { ... }
  .projects { ... }
  .testimonials { ... }
  .practical-info { ... }
  .social-showcase { ... }
  .contact { ... }
  .footer { ... }
  
  /* Responsive */
  @media (max-width: 768px) { ... }
  @media (max-width: 480px) { ... }
  
  /* ========== FIN STYLE PROTÉGÉ ========== */
  </style>
</head>

<body>
  <!-- Navigation -->
  <nav>...</nav>

  <!-- SECTION: hero (OBLIGATOIRE) -->
  <section class="hero">
    <h1>{{HERO_TITLE}}</h1>
    <p>{{HERO_SUBTITLE}}</p>
    <a href="#contact" class="btn">{{HERO_CTA_TEXT}}</a>
  </section>

  <!-- SECTION: social_showcase (OPTIONNEL - SI vitrine = réseaux) -->
  <!-- IF: showSocialShowcase -->
  <section class="social-showcase">
    <h2>Retrouvez mon travail</h2>
    <!-- REPEAT: socialLinks -->
    <a href="{{SOCIAL_URL}}" class="social-main-link">{{SOCIAL_PLATFORM}}</a>
    <!-- END REPEAT: socialLinks -->
  </section>
  <!-- ENDIF: showSocialShowcase -->

  <!-- SECTION: about (OBLIGATOIRE) -->
  <section class="about">
    <!-- IF: hasAboutImage -->
    <img src="{{ABOUT_IMAGE}}" alt="{{HERO_TITLE}}">
    <!-- ENDIF: hasAboutImage -->
    <p>{{ABOUT_TEXT}}</p>
  </section>

  <!-- SECTION: services (OBLIGATOIRE) -->
  <section class="services">
    <h2>Services</h2>
    <!-- REPEAT: services -->
    <div class="service-card">
      <span class="service-icon">{{SERVICE_ICON}}</span>
      <h3>{{SERVICE_TITLE}}</h3>
      <p>{{SERVICE_DESC}}</p>
    </div>
    <!-- END REPEAT: services -->
  </section>

  <!-- SECTION: projects (OPTIONNEL - SI projets fournis) -->
  <!-- IF: showProjects -->
  <section class="projects">
    <h2>Réalisations</h2>
    <!-- REPEAT: projects -->
    <article class="project-card">
      <img src="{{PROJECT_IMAGE}}" alt="{{PROJECT_TITLE}}">
      <span class="project-category">{{PROJECT_CATEGORY}}</span>
      <h3>{{PROJECT_TITLE}}</h3>
      <p>{{PROJECT_DESC}}</p>
      <!-- IF: hasProjectLink -->
      <a href="{{PROJECT_LINK}}">Voir le projet →</a>
      <!-- ENDIF: hasProjectLink -->
    </article>
    <!-- END REPEAT: projects -->
  </section>
  <!-- ENDIF: showProjects -->

  <!-- SECTION: testimonials (OPTIONNEL - SI témoignages fournis) -->
  <!-- IF: showTestimonials -->
  <section class="testimonials">
    <h2>Témoignages</h2>
    <!-- REPEAT: testimonials -->
    <blockquote class="testimonial">
      <p>"{{TESTIMONIAL_TEXT}}"</p>
      <cite>
        <strong>{{TESTIMONIAL_AUTHOR}}</strong>
        <span>{{TESTIMONIAL_ROLE}}</span>
      </cite>
    </blockquote>
    <!-- END REPEAT: testimonials -->
  </section>
  <!-- ENDIF: showTestimonials -->

  <!-- SECTION: practical_info (OPTIONNEL - SI adresse OU horaires) -->
  <!-- IF: showPracticalInfo -->
  <section class="practical-info">
    <h2>Informations pratiques</h2>
    <!-- IF: hasAddress -->
    <div class="address">
      <h3>Adresse</h3>
      <p>{{CONTACT_ADDRESS}}</p>
      <a href="https://maps.google.com/?q={{CONTACT_ADDRESS}}" target="_blank">Voir sur Google Maps</a>
    </div>
    <!-- ENDIF: hasAddress -->
    <!-- IF: hasOpeningHours -->
    <div class="hours">
      <h3>Horaires</h3>
      <p>{{OPENING_HOURS}}</p>
    </div>
    <!-- ENDIF: hasOpeningHours -->
  </section>
  <!-- ENDIF: showPracticalInfo -->

  <!-- SECTION: contact (OBLIGATOIRE) -->
  <section class="contact" id="contact">
    <h2>Contact</h2>
    <a href="mailto:{{CONTACT_EMAIL}}">{{CONTACT_EMAIL}}</a>
    <!-- IF: hasPhone -->
    <a href="tel:{{CONTACT_PHONE}}">{{CONTACT_PHONE}}</a>
    <!-- ENDIF: hasPhone -->
    
    <!-- Réseaux sociaux (en footer si pas vitrine principale) -->
    <!-- IF: NOT showSocialShowcase -->
    <div class="social-links">
      <!-- REPEAT: socialLinks -->
      <a href="{{SOCIAL_URL}}" title="{{SOCIAL_PLATFORM}}">{{SOCIAL_ICON}}</a>
      <!-- END REPEAT: socialLinks -->
    </div>
    <!-- ENDIF: NOT showSocialShowcase -->
  </section>

  <!-- Footer -->
  <footer>
    <p>© {{CURRENT_YEAR}} {{HERO_TITLE}}. Tous droits réservés.</p>
  </footer>

  <!-- Scripts -->
  <script>
    // Animations GSAP (optionnel)
    if (typeof gsap !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
      // ... animations
    }
  </script>
</body>
</html>
```

---

## 📋 Prompt pour Kimi

Utilise ce prompt pour demander à Kimi de générer le template :

```
Crée un template HTML de portfolio professionnel avec ces caractéristiques :

DESIGN :
- Style minimaliste inspiré Apple
- Font : Inter
- Couleurs : Noir (#000), Blanc (#fff), Gris (#666, #999), Accent bleu (#0071e3)
- Beaucoup d'espace blanc
- Animations subtiles au scroll (GSAP)
- Responsive mobile-first

SECTIONS À INCLURE :
1. Hero : Titre, sous-titre, bouton CTA
2. About : Photo optionnelle, texte de présentation
3. Services : 3 cards avec icône, titre, description
4. Projets : Grille de cards avec image, titre, description (section optionnelle)
5. Témoignages : Citations avec auteur (section optionnelle)
6. Infos pratiques : Adresse, horaires, Google Maps (section optionnelle)
7. Social Showcase : Mise en avant des réseaux (section optionnelle, position après Hero)
8. Contact : Email, téléphone, réseaux sociaux
9. Footer : Copyright

IMPORTANT :
- Le CSS doit être inline dans une balise <style>
- Utilise des variables CSS pour les couleurs
- Le HTML doit être sémantique (header, main, section, footer)
- Ajoute des classes pour les animations (.reveal, .fade-in, etc.)
- Le design doit être élégant et professionnel
- Prévois des hover effects sur les cards et boutons

Génère le HTML complet avec tout le CSS intégré.
```

---

## ✅ Checklist après génération Kimi

Une fois que Kimi a généré le template :

1. [ ] Vérifier que toutes les sections sont présentes
2. [ ] Vérifier le responsive (tester sur mobile)
3. [ ] Vérifier les animations
4. [ ] Passer dans Gemini pour ajouter les marqueurs {{...}}
5. [ ] Ajouter les commentaires SECTION, REPEAT, IF/ENDIF
6. [ ] Protéger le bloc <style>
7. [ ] Tester avec des données réelles

---

**Ce document te permet de reproduire la chaîne Gemini → Kimi → Gemini.**
