# PROMPT KIMI - Création Template Portfolio SOUVERAIN

**Usage:** Copier-coller directement dans Kimi
**Résultat:** Template HTML complet, compatible Groq, avec marqueurs {{...}}

---

## Specs Images (pour référence)

| Type | Taille min | Taille recommandée | Ratio | Poids max |
|------|------------|-------------------|-------|-----------|
| Hero background | 1920×1080 | 2560×1440 | 16:9 | 5MB |
| About photo | 400×400 | 800×800 | 1:1 | 2MB |
| Project image | 800×600 | 1600×1200 | 4:3 ou 16:9 | 3MB |

---

## Le Prompt à copier dans Kimi :

```
Tu es un expert en création de templates web. Tu vas créer un portfolio one-page HTML/CSS/JS complet et prêt à l'emploi.

## ÉTAPE 1 : CHOIX DU STYLE

Avant de coder, propose-moi UN style parmi ces 20 tendances design. Présente-les de façon concise et attends ma réponse :

🏆 **TOP 5 : ULTRA-TENDANCE**
1. **Kinetic Typography** — Animation textuelle percutante, titres qui bougent
2. **Bento Grid Layout** — Organisation modulaire façon Apple, cards asymétriques
3. **Scroll Storytelling** — Expérience narrative cinématographique, sections plein écran
4. **Tactile Maximalism** — Textures 3D, couleurs saturées, bold
5. **Organic/Anti-Grid** — Formes fluides, blobs, liberté visuelle

🚀 **TOP 10 : TRÈS TENDANCE**
6. **Dopamine Colors** — Néons, gradients vibrants, énergie pure
7. **3D Immersif WebGL** — Profondeur, ombres réalistes, technique
8. **Exaggerated Hierarchy** — Contrastes de tailles extrêmes, titres géants
9. **Hand-Drawn Scribble** — Gribouillages, authenticité, fait main
10. **Glassmorphism Affiné** — Transparence, blur, élégance premium

💡 **TOP 15 : TENDANCE ÉTABLIE**
11. **AI-Powered Look** — Interface futuriste, grilles de données, tech
12. **Retro Revival 80-00** — Nostalgie Windows 95, Y2K, pixels
13. **Museumcore** — Luxe, sérif élégant, tons profonds, galerie
14. **Variable Fonts Expressifs** — Typographie vivante, morphing
15. **Micro-interactions Alive** — Feedback organique, hover magiques

📌 **TOP 20 : NICHE CRÉATIVE**
16. **Brutalism Élevé** — Anti-design brut, radical, borders harsh
17. **Hyperréalité Surrealism** — Onirisme digital, collages impossibles
18. **Blend Photos + Graphismes** — Mix média, superpositions créatives
19. **Retrofuture Femme** — Pastels, argenté, kawaii sophistiqué
20. **Dial-up Design** — Esthétique bas-débit, MS Paint, anti-moderne

👉 **Dis-moi ton numéro (1-20) ou décris le style que tu veux, et je génère le template.**

---

## ÉTAPE 2 : GÉNÉRATION DU TEMPLATE

Une fois le style choisi, génère un template HTML COMPLET avec ces spécifications EXACTES :

### RÈGLES ANTI-IA (CRITIQUES)

```
⛔ INTERDITS :
- Émojis dans le contenu (titres, descriptions, boutons, CTA)
- Émojis comme icônes (📸 💼 🚀 💡 etc.)
- Formulations IA : "Bienvenue !", "Découvrez...", "N'hésitez pas...", "Je serais ravi..."
- Listes avec émojis (❌ ✅ 🔥 ⭐)
- Points d'exclamation excessifs
- Ton promotionnel générique

✅ OBLIGATOIRES :
- Icônes = SVG inline uniquement (Simple Icons pour réseaux, Lucide pour UI)
- Icônes SÉPARÉES du texte (Option C : dans un div/span dédié)
- Ton naturel et professionnel
- Formulations directes et sobres
```

### ICÔNES SVG À UTILISER

Pour les réseaux sociaux, inclure ces SVG dans le template (à placer dans une balise `<svg>` avec `class="icon"`) :

```html
<!-- Instagram -->
<svg class="icon" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>

<!-- LinkedIn -->
<svg class="icon" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>

<!-- TikTok -->
<svg class="icon" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>

<!-- YouTube -->
<svg class="icon" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>

<!-- GitHub -->
<svg class="icon" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>

<!-- Behance -->
<svg class="icon" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M6.938 4.503c.702 0 1.34.06 1.92.188.577.13 1.07.33 1.485.61.41.28.733.65.96 1.12.225.47.34 1.05.34 1.73 0 .74-.17 1.36-.507 1.86-.338.5-.837.9-1.502 1.22.906.26 1.576.72 2.022 1.37.448.66.665 1.45.665 2.36 0 .75-.13 1.39-.41 1.93-.28.55-.67 1-1.16 1.35-.48.348-1.05.6-1.67.767-.61.165-1.252.254-1.91.254H0V4.51h6.938v-.007zM6.545 9.57c.555 0 1.014-.15 1.36-.44.348-.29.52-.713.52-1.27 0-.3-.05-.563-.14-.776-.094-.21-.23-.39-.403-.522-.17-.133-.37-.23-.596-.287-.228-.057-.47-.085-.727-.085H3.43v3.38h3.115zm.165 5.7c.284 0 .556-.03.807-.093.25-.063.47-.163.654-.305.182-.14.328-.336.437-.587.108-.252.16-.567.16-.94 0-.748-.2-1.29-.604-1.63-.403-.336-.95-.506-1.64-.506H3.43v4.06h3.28zM21.062 17.634c-.728.478-1.767.713-3.122.713-1.162 0-2.075-.134-2.75-.402-.67-.27-1.207-.622-1.61-1.062-.4-.436-.678-.936-.838-1.5-.16-.56-.24-1.13-.24-1.71s.074-1.13.22-1.68c.147-.54.39-1.03.74-1.47.348-.44.794-.8 1.34-1.08.545-.28 1.22-.42 2.03-.42.75 0 1.393.13 1.922.4.528.266.962.615 1.3 1.05.34.433.586.922.743 1.466.156.544.234 1.094.234 1.65v.902H14.41c.042.767.284 1.346.724 1.736.444.39 1.08.59 1.91.59.68 0 1.207-.13 1.58-.39.37-.26.677-.58.92-.95l1.89 1.106c-.265.49-.57.87-.912 1.15-.34.278-.71.5-1.11.67-.396.166-.814.28-1.248.343-.434.062-.87.093-1.305.093h-.797zm-.136-6.028c-.073-.404-.2-.75-.38-1.04-.18-.29-.42-.52-.72-.69-.298-.17-.673-.254-1.12-.254-.396 0-.73.06-1 .18-.27.116-.5.27-.687.454-.187.184-.337.393-.45.63-.112.237-.185.477-.22.72h4.577zM15.328 2.996h5.534v1.59h-5.534v-1.59z"/></svg>

<!-- Twitter/X -->
<svg class="icon" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
```

Pour les icônes UI (services, infos pratiques), utiliser des formes géométriques simples ou des icônes Lucide en SVG :

```html
<!-- Icône générique "service" - cercle avec forme -->
<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>

<!-- Icône "localisation" -->
<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>

<!-- Icône "horloge" -->
<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>

<!-- Icône "email" -->
<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>

<!-- Icône "téléphone" -->
<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
```

### STRUCTURE DES ICÔNES (Option C)

Les icônes doivent être dans un conteneur SÉPARÉ du texte :

```html
<!-- ✅ CORRECT : Icône séparée -->
<div class="service-card">
  <div class="service-icon">
    <svg class="icon" viewBox="0 0 24 24">...</svg>
  </div>
  <h3>Conseil & Stratégie</h3>
  <p>Description du service</p>
</div>

<!-- ❌ INCORRECT : Icône collée au texte -->
<div class="service-card">
  <h3>💡 Conseil & Stratégie</h3>
</div>

<!-- ❌ INCORRECT : Emoji -->
<div class="service-card">
  <span class="service-icon">💡</span>
  <h3>Conseil & Stratégie</h3>
</div>
```

### CSS pour les icônes

```css
.icon {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.service-icon,
.info-icon,
.social-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: var(--color-accent-light, rgba(0, 113, 227, 0.1));
  margin-bottom: 1rem;
}

.service-icon .icon,
.info-icon .icon {
  width: 24px;
  height: 24px;
  color: var(--color-accent);
}

.social-link .icon {
  width: 20px;
  height: 20px;
}
```

### STRUCTURE OBLIGATOIRE

Le fichier doit commencer par cet en-tête :
```html
<!--
TEMPLATE: [Nom du style choisi]
DESCRIPTION: [Description courte du style]
SECTIONS_OBLIGATOIRES: hero, about, services, contact
SECTIONS_OPTIONNELLES: social_showcase, projects, testimonials, practical_info
-->
```

### STACK TECHNIQUE

- HTML5 sémantique (header, main, section, footer)
- CSS dans un bloc `<style>` unique avec ce marqueur :
```css
/* ========== NE PAS MODIFIER - STYLE PROTÉGÉ ========== */
...tout le CSS ici...
/* ========== FIN STYLE PROTÉGÉ ========== */
```
- Variables CSS pour TOUTES les couleurs
- Google Fonts (adapté au style)
- GSAP + ScrollTrigger pour animations (CDN)
- Responsive mobile-first (breakpoints: 480px, 768px, 1024px)
- TOUT dans un seul fichier HTML

### SECTIONS À CRÉER

**OBLIGATOIRES :**

1. **Navigation** (fixe)
```html
<nav>
  <a href="#" class="logo">{{HERO_TITLE}}</a>
  <ul>
    <li><a href="#about">À propos</a></li>
    <li><a href="#services">Services</a></li>
    <li><a href="#projects">Projets</a></li>
    <li><a href="#contact">Contact</a></li>
  </ul>
</nav>
```

2. **Hero** 
```html
<!-- SECTION: hero (OBLIGATOIRE) -->
<section class="hero" id="hero">
  <span class="hero-eyebrow">{{HERO_EYEBROW}}</span>
  <h1>{{HERO_TITLE}}</h1>
  <p class="hero-subtitle">{{HERO_SUBTITLE}}</p>
  <a href="#contact" class="btn-primary">{{HERO_CTA_TEXT}}</a>
</section>
```

3. **About**
```html
<!-- SECTION: about (OBLIGATOIRE) -->
<section class="about" id="about">
  <!-- IF: hasAboutImage -->
  <img src="{{ABOUT_IMAGE}}" alt="{{HERO_TITLE}}">
  <!-- ENDIF: hasAboutImage -->
  <div class="about-content">
    <h2>À propos</h2>
    <p>{{ABOUT_TEXT}}</p>
    <!-- IF: hasValueProp -->
    <p class="value-prop">{{VALUE_PROP}}</p>
    <!-- ENDIF: hasValueProp -->
  </div>
</section>
```

4. **Services**
```html
<!-- SECTION: services (OBLIGATOIRE) -->
<section class="services" id="services">
  <h2>Services</h2>
  <div class="services-grid">
    <!-- REPEAT: services -->
    <div class="service-card">
      <div class="service-icon">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
      </div>
      <h3>{{SERVICE_TITLE}}</h3>
      <p>{{SERVICE_DESC}}</p>
    </div>
    <!-- END REPEAT: services -->
  </div>
</section>
```

5. **Contact**
```html
<!-- SECTION: contact (OBLIGATOIRE) -->
<section class="contact" id="contact">
  <h2>Contact</h2>
  <div class="contact-content">
    <a href="mailto:{{CONTACT_EMAIL}}" class="contact-email">{{CONTACT_EMAIL}}</a>
    <!-- IF: hasPhone -->
    <a href="tel:{{CONTACT_PHONE}}" class="contact-phone">{{CONTACT_PHONE}}</a>
    <!-- ENDIF: hasPhone -->
  </div>
  <!-- IF: NOT showSocialShowcase -->
  <div class="social-links">
    <!-- REPEAT: socialLinks -->
    <a href="{{SOCIAL_URL}}" target="_blank" title="{{SOCIAL_PLATFORM}}">{{SOCIAL_PLATFORM}}</a>
    <!-- END REPEAT: socialLinks -->
  </div>
  <!-- ENDIF: NOT showSocialShowcase -->
</section>
```

6. **Footer**
```html
<footer>
  <p>© {{CURRENT_YEAR}} {{HERO_TITLE}}. Tous droits réservés.</p>
</footer>
```

**OPTIONNELLES (avec conditions) :**

7. **Social Showcase** — Position : JUSTE APRÈS LE HERO
```html
<!-- SECTION: social_showcase (OPTIONNEL - SI vitrine = réseaux) -->
<!-- IF: showSocialShowcase -->
<section class="social-showcase">
  <h2>Retrouvez mon travail</h2>
  <div class="social-main">
    <!-- REPEAT: socialLinks -->
    <a href="{{SOCIAL_URL}}" class="social-link-large" target="_blank">
      <span class="social-icon">
        <!-- SVG correspondant à {{SOCIAL_PLATFORM}} -->
      </span>
      <span>{{SOCIAL_PLATFORM}}</span>
    </a>
    <!-- END REPEAT: socialLinks -->
  </div>
</section>
<!-- ENDIF: showSocialShowcase -->
```

8. **Projects**
```html
<!-- SECTION: projects (OPTIONNEL - SI projets fournis) -->
<!-- IF: showProjects -->
<section class="projects" id="projects">
  <h2>Réalisations</h2>
  <div class="projects-grid">
    <!-- REPEAT: projects -->
    <article class="project-card">
      <div class="project-image">
        <img src="{{PROJECT_IMAGE}}" alt="{{PROJECT_TITLE}}">
      </div>
      <div class="project-content">
        <span class="project-category">{{PROJECT_CATEGORY}}</span>
        <h3>{{PROJECT_TITLE}}</h3>
        <p>{{PROJECT_DESC}}</p>
        <!-- IF: hasProjectLink -->
        <a href="{{PROJECT_LINK}}" class="project-link">Voir le projet →</a>
        <!-- ENDIF: hasProjectLink -->
      </div>
    </article>
    <!-- END REPEAT: projects -->
  </div>
</section>
<!-- ENDIF: showProjects -->
```

9. **Testimonials**
```html
<!-- SECTION: testimonials (OPTIONNEL - SI témoignages fournis) -->
<!-- IF: showTestimonials -->
<section class="testimonials" id="testimonials">
  <h2>Témoignages</h2>
  <div class="testimonials-grid">
    <!-- REPEAT: testimonials -->
    <blockquote class="testimonial-card">
      <p class="testimonial-text">"{{TESTIMONIAL_TEXT}}"</p>
      <footer>
        <strong class="testimonial-author">{{TESTIMONIAL_AUTHOR}}</strong>
        <span class="testimonial-role">{{TESTIMONIAL_ROLE}}</span>
      </footer>
    </blockquote>
    <!-- END REPEAT: testimonials -->
  </div>
</section>
<!-- ENDIF: showTestimonials -->
```

10. **Practical Info**
```html
<!-- SECTION: practical_info (OPTIONNEL - SI adresse OU horaires) -->
<!-- IF: showPracticalInfo -->
<section class="practical-info" id="info">
  <h2>Informations pratiques</h2>
  <div class="info-grid">
    <!-- IF: hasAddress -->
    <div class="info-card">
      <div class="info-icon">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
      </div>
      <h3>Adresse</h3>
      <p>{{CONTACT_ADDRESS}}</p>
      <a href="https://maps.google.com/?q={{CONTACT_ADDRESS}}" target="_blank" class="map-link">Voir sur Google Maps</a>
    </div>
    <!-- ENDIF: hasAddress -->
    <!-- IF: hasOpeningHours -->
    <div class="info-card">
      <div class="info-icon">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
      </div>
      <h3>Horaires</h3>
      <p>{{OPENING_HOURS}}</p>
    </div>
    <!-- ENDIF: hasOpeningHours -->
  </div>
</section>
<!-- ENDIF: showPracticalInfo -->
```

### ORDRE DES SECTIONS DANS LE HTML

```
1. nav
2. hero (OBLIGATOIRE)
3. social_showcase (OPTIONNEL - si showSocialShowcase)
4. about (OBLIGATOIRE)
5. services (OBLIGATOIRE)
6. projects (OPTIONNEL - si showProjects)
7. testimonials (OPTIONNEL - si showTestimonials)
8. practical_info (OPTIONNEL - si showPracticalInfo)
9. contact (OBLIGATOIRE)
10. footer
```

### CONTENU DE DÉMONSTRATION

Utilise ce contenu placeholder pour que le template soit visualisable :

```
{{HERO_EYEBROW}} → "Portfolio"
{{HERO_TITLE}} → "Votre Nom"
{{HERO_SUBTITLE}} → "Votre accroche professionnelle percutante"
{{HERO_CTA_TEXT}} → "Me contacter"

{{ABOUT_IMAGE}} → https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop
{{ABOUT_TEXT}} → "Passionné par mon métier, j'accompagne mes clients avec expertise et créativité. Mon approche combine rigueur professionnelle et écoute attentive pour des résultats qui dépassent les attentes."
{{VALUE_PROP}} → "Mon engagement : transformer vos idées en réalité."

Services (3) :
- {{SERVICE_TITLE}}: "Conseil & Stratégie" | {{SERVICE_DESC}}: "Accompagnement personnalisé pour définir et atteindre vos objectifs."
- {{SERVICE_TITLE}}: "Création & Design" | {{SERVICE_DESC}}: "Réalisation sur mesure avec un souci du détail et de l'excellence."
- {{SERVICE_TITLE}}: "Développement" | {{SERVICE_DESC}}: "Solutions techniques robustes et évolutives."

Projects (3) :
- {{PROJECT_IMAGE}}: URL Unsplash bureau/travail | {{PROJECT_CATEGORY}}: "Stratégie" | {{PROJECT_TITLE}}: "Projet Alpha" | {{PROJECT_DESC}}: "Refonte complète avec +40% de résultats."
- {{PROJECT_IMAGE}}: URL Unsplash créatif | {{PROJECT_CATEGORY}}: "Design" | {{PROJECT_TITLE}}: "Projet Beta" | {{PROJECT_DESC}}: "Solution innovante pour un client exigeant."
- {{PROJECT_IMAGE}}: URL Unsplash tech | {{PROJECT_CATEGORY}}: "Digital" | {{PROJECT_TITLE}}: "Projet Gamma" | {{PROJECT_DESC}}: "Transformation réussie en 3 mois."

Testimonials (3) :
- {{TESTIMONIAL_TEXT}}: "Excellent travail, résultats au-delà de mes attentes." | {{TESTIMONIAL_AUTHOR}}: "Marie D." | {{TESTIMONIAL_ROLE}}: "Directrice, StartupXYZ"
- {{TESTIMONIAL_TEXT}}: "Professionnel, créatif et toujours à l'écoute." | {{TESTIMONIAL_AUTHOR}}: "Thomas L." | {{TESTIMONIAL_ROLE}}: "Entrepreneur"
- {{TESTIMONIAL_TEXT}}: "Une collaboration enrichissante, je recommande." | {{TESTIMONIAL_AUTHOR}}: "Sophie M." | {{TESTIMONIAL_ROLE}}: "Responsable projet"

{{CONTACT_EMAIL}} → "contact@exemple.com"
{{CONTACT_PHONE}} → "+33 6 12 34 56 78"
{{CONTACT_ADDRESS}} → "123 Rue de l'Exemple, 75001 Paris"
{{OPENING_HOURS}} → "Lun-Ven : 9h-18h | Sam : 10h-13h"

Social Links (utiliser les SVG correspondants) :
- {{SOCIAL_PLATFORM}}: "Instagram" | {{SOCIAL_URL}}: "https://instagram.com"
- {{SOCIAL_PLATFORM}}: "LinkedIn" | {{SOCIAL_URL}}: "https://linkedin.com"

{{CURRENT_YEAR}} → "2026"
```

**IMPORTANT : Pas d'émojis dans le contenu de démonstration. Utiliser uniquement des SVG pour les icônes.**

### ANIMATIONS GSAP

Inclure ce script à la fin du body :
```javascript
<script>
  gsap.registerPlugin(ScrollTrigger);
  
  // Fade-in au scroll
  gsap.utils.toArray('.service-card, .project-card, .testimonial-card, .info-card').forEach(el => {
    gsap.fromTo(el, 
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%' }
      }
    );
  });
  
  // Hero animation
  gsap.timeline()
    .fromTo('.hero-eyebrow', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 })
    .fromTo('.hero h1', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 }, '-=0.3')
    .fromTo('.hero-subtitle', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, '-=0.4')
    .fromTo('.hero .btn-primary', { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.5 }, '-=0.2');
  
  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      document.querySelector(this.getAttribute('href')).scrollIntoView({ behavior: 'smooth' });
    });
  });
</script>
```

### RESPONSIVE

Le CSS doit inclure :
```css
@media (max-width: 1024px) { /* Tablette */ }
@media (max-width: 768px) { /* Mobile large */ }
@media (max-width: 480px) { /* Mobile small */ }
```

### FORMAT DE SORTIE

Génère UN SEUL bloc de code HTML complet, prêt à être copié et enregistré en fichier .html. Pas d'explications, juste le code.

---

👉 **Quel style veux-tu ? (1-20)**
```

---

## Comment utiliser ce prompt

1. **Copie tout le contenu** entre les balises ``` ci-dessus
2. **Colle dans Kimi**
3. **Kimi te propose les 20 styles**
4. **Tu choisis un numéro** (ex: "2" pour Bento Grid)
5. **Kimi génère le template complet**, directement compatible Groq

---

## Résultat attendu

Un fichier HTML avec :
- ✅ En-tête TEMPLATE avec métadonnées
- ✅ CSS protégé avec marqueur
- ✅ Toutes les sections obligatoires
- ✅ Sections optionnelles avec IF/ENDIF
- ✅ Zones REPEAT pour listes
- ✅ Variables {{...}} partout
- ✅ Contenu de démo visible
- ✅ Animations GSAP
- ✅ Responsive complet
- ✅ Prêt pour Groq
- ✅ **ZÉRO ÉMOJI** dans le template
- ✅ **Icônes SVG inline** pour réseaux sociaux et UI
- ✅ **Icônes séparées du texte** (Option C)
- ✅ **Ton naturel** sans marqueurs IA
