# SOUVERAIN - Addendum Master Plan

## INSTRUCTION IMPORTANTE

Ce document remplace la Phase 7 du Master Plan et complete les Phases 8 et 9.
La Phase 7 actuelle basee sur les styles techniques Bento Classic Gallery Minimal est obsolete.
Supprime cette implementation et reimplemente avec l approche ci-dessous.

---

## PHASE 7 REVISEE - PALETTES DE STYLE

### Probleme avec l ancienne approche

Les styles Bento Classic etc sont des termes techniques.
Un artisan plombier ou un avocat ne se reconnait pas dans "Bento".
Le rendu risque d etre trop uniforme et digital-friendly.

### Nouvelle approche : Palettes de personnalite

L utilisateur choisit une AMBIANCE pas un layout technique.
L IA adapte ensuite les layouts et le design selon cette ambiance.

### Les 6 palettes de style

PALETTE 1 MODERNE
Pour : Dev, designer, startup, freelance tech, creatif digital
Feeling : Jeune, dynamique, connecte, innovant
Layouts associes : bento_grid, cards_carousel, stats_band, hero_split
Typo : Inter, sans-serif moderne, grotesk
Couleurs : Vives, gradients, contrastes forts, bleu electrique, violet, vert vif
Espacements : Genereux, aeres, respiration
Animations : Oui, subtiles, hover effects
Formes : Coins tres arrondis, cartes flottantes
Ombres : Douces et colorees
Photos : Stylisees, mockups, ecrans

PALETTE 2 CLASSIQUE
Pour : Avocat, consultant senior, medecin, expert, cadre dirigeant
Feeling : Serieux, credible, rassurant, etabli
Layouts associes : two_columns, sections_lineaires, sidebar_navigation, hero_sobre
Typo : Serif elegant Georgia, Playfair, Lora pour les titres, sans-serif sobre pour le corps
Couleurs : Neutres, bleu marine, bordeaux, gris anthracite, touches dorees discretes
Espacements : Structures, grille stricte, alignements parfaits
Animations : Non ou tres subtiles fondus uniquement
Formes : Coins droits ou tres legerement arrondis
Ombres : Minimales
Photos : Portraits professionnels, bureaux, poignees de main

PALETTE 3 AUTHENTIQUE
Pour : Artisan, plombier, menuisier, boulanger, paysagiste, metiers manuels
Feeling : Proche, humain, concret, de confiance, ancre dans le reel
Layouts associes : hero_fullwidth_photo, temoignages_band, galerie_terrain, carte_zone
Typo : Rounded sans-serif chaleureux Nunito, Quicksand, accent manuscrit optionnel
Couleurs : Terre, bois, vert nature, ocre, couleurs chaudes, fond creme ou beige clair
Espacements : Confortables, genereux, pas serres
Animations : Non
Formes : Coins arrondis doux, aspect tactile
Ombres : Naturelles, douces
Photos : Chantiers, mains au travail, avant-apres, outils, equipe sur le terrain

PALETTE 4 ARTISTIQUE
Pour : Photographe, artiste, architecte, directeur artistique, illustrateur
Feeling : Les images parlent, immersif, elegant, contemplatif
Layouts associes : masonry, fullscreen_gallery, minimal_nav, hero_image_only
Typo : Minimale, fine, disparait au profit des images, sans-serif light
Couleurs : Noir et blanc dominant, ou palette tres reduite monochrome
Espacements : Images bord a bord ou tres aeres, grands blancs
Animations : Transitions elegantes, parallax subtil
Formes : Epurees, pas de decorations
Ombres : Aucune ou tres subtiles
Photos : TOUT le focus, plein ecran, haute qualite obligatoire

PALETTE 5 VITRINE
Pour : Restaurant, cafe, salon coiffure, boutique, commerce local, artisan avec pignon sur rue
Feeling : Accueillant, pratique, convivial, donnant envie de venir
Layouts associes : hero_ambiance, infos_pratiques_sticky, galerie_produits, avis_clients_carousel, carte_google
Typo : Accessible, lisible, sympathique, peut avoir une typo signature pour le nom
Couleurs : Selon ambiance du commerce, chaleureuses en general, peut matcher la devanture
Espacements : Clairs, bien hierarchises, mobile-first
Animations : Non ou hover simple sur les produits
Formes : Arrondies, accueillantes
Ombres : Legeres
Priorite absolue : Horaires, adresse, telephone, bouton appeler, avis clients, photos ambiance

PALETTE 6 FORMEL
Pour : Notaire, expert-comptable, huissier, avocat d affaires, institution, cabinet etabli
Feeling : Confiance, rigueur, tradition, solidite, discretion
Layouts associes : sections_numerotees, sidebar_navigation, certifications_band, hero_minimal_texte
Typo : Serif traditionnel tres lisible, Times-like ou Garamond, hierarchie stricte
Couleurs : Bleu marine, gris, blanc casse, noir, touches dorees ou bordeaux tres discretes
Espacements : Stricts, alignes, grille rigide
Animations : Aucune
Formes : Coins droits, lignes fines de separation
Ombres : Aucune
Ton general : Sobre, presque austere, inspire confiance par la retenue

---

### Logique de suggestion IA

L IA analyse le contenu et les intentions pour suggerer une palette.

CRITERES D ANALYSE

Comptes externes lies
- GitHub, Dribbble, Behance, CodePen -> MODERNE
- LinkedIn seul, pas de reseaux sociaux -> CLASSIQUE ou FORMEL
- Instagram avec photos terrain -> AUTHENTIQUE
- Instagram, Behance, 500px avec photos artistiques -> ARTISTIQUE
- Google Business, TripAdvisor, Yelp -> VITRINE

Reponses formulaire intention
- Objectif "missions freelance tech" -> MODERNE
- Objectif "trouver emploi" + peu de visuel -> CLASSIQUE
- Objectif "clients locaux" -> AUTHENTIQUE ou VITRINE
- Objectif "montrer savoir-faire visuel" -> ARTISTIQUE
- Objectif "developper notoriete cabinet" -> FORMEL

Type de contenu uploade
- Majoritairement screenshots, mockups, code -> MODERNE
- Majoritairement documents, PDF, textes -> CLASSIQUE ou FORMEL
- Majoritairement photos chantier, terrain -> AUTHENTIQUE
- Majoritairement photos artistiques haute qualite -> ARTISTIQUE
- Majoritairement photos produits, lieu, equipe -> VITRINE

Mots cles detectes dans les textes
- startup, MVP, sprint, agile, stack -> MODERNE
- cabinet, etude, expertise, conseil, audit -> CLASSIQUE ou FORMEL
- chantier, intervention, depannage, artisan -> AUTHENTIQUE
- serie, exposition, shooting, direction artistique -> ARTISTIQUE
- horaires, menu, carte, reservation, boutique -> VITRINE

REGLES DE SUGGESTION

Si plusieurs criteres convergent vers une palette -> Suggerer cette palette avec confiance haute
Si criteres mixtes -> Proposer les 2 plus probables au choix
Si aucun critere clair -> Demander a l utilisateur de choisir parmi les 6

---

### Interface de selection

ECRAN CHOIX DE STYLE

```
Quel style vous ressemble

Selectionnez l ambiance qui correspond a votre image

MODERNE                    CLASSIQUE                  AUTHENTIQUE
[preview thumbnail]        [preview thumbnail]        [preview thumbnail]
Dynamique et connecte      Sobre et structure         Chaleureux et terrain
Ideal freelance tech       Ideal consultant expert    Ideal artisan metier
et creatif digital         et profession liberale     manuel et local

ARTISTIQUE                 VITRINE                    FORMEL
[preview thumbnail]        [preview thumbnail]        [preview thumbnail]
Vos images en vedette      Pratique et accueillant    Institutionnel et
Ideal photographe          Ideal commerce local       rigoureux
et artiste                 restaurant boutique        Ideal notaire cabinet
```

SI L IA A UNE SUGGESTION

```
Je vous suggere le style AUTHENTIQUE

Vu votre contenu photos de chantier et votre objectif clients locaux
ce style chaleureux et ancre dans le terrain semble ideal.

[Accepter AUTHENTIQUE]    [Voir tous les styles]
```

---

### Structure JSON Palette de style

```
{
  "style_palette": {
    "id": "authentique",
    "name": "Authentique",
    "tagline": "Chaleureux et ancre dans le terrain",
    "ideal_for": "Artisan, metier manuel, service local",
    
    "design_tokens": {
      "typography": {
        "heading_font": "Nunito",
        "heading_weight": "700",
        "body_font": "Open Sans",
        "body_weight": "400",
        "accent_font": "Caveat",
        "base_size": "16px",
        "scale_ratio": "1.25"
      },
      
      "colors": {
        "primary": "#b45309",
        "primary_light": "#d97706",
        "primary_dark": "#92400e",
        "secondary": "#f5f5f4",
        "accent": "#15803d",
        "background": "#fffbeb",
        "surface": "#ffffff",
        "text_primary": "#292524",
        "text_secondary": "#57534e",
        "text_muted": "#a8a29e",
        "border": "#e7e5e4"
      },
      
      "spacing": {
        "section_gap": "4rem",
        "content_padding": "2rem",
        "card_padding": "1.5rem",
        "element_gap": "1rem"
      },
      
      "borders": {
        "radius_small": "0.5rem",
        "radius_medium": "1rem",
        "radius_large": "1.5rem",
        "radius_full": "9999px",
        "width": "1px",
        "style": "solid"
      },
      
      "shadows": {
        "small": "0 1px 3px rgba(0,0,0,0.08)",
        "medium": "0 4px 12px rgba(0,0,0,0.1)",
        "large": "0 8px 24px rgba(0,0,0,0.12)"
      },
      
      "animations": {
        "enabled": false,
        "duration": "0ms",
        "easing": "ease"
      }
    },
    
    "layout_config": {
      "hero": {
        "type": "hero_fullwidth_photo",
        "height": "70vh",
        "overlay": "gradient_bottom",
        "text_position": "bottom_left"
      },
      
      "projects": {
        "type": "cards_comfortable",
        "columns_desktop": 2,
        "columns_tablet": 1,
        "columns_mobile": 1,
        "gap": "2rem",
        "card_style": "photo_dominant"
      },
      
      "testimonials": {
        "type": "highlighted_band",
        "background": "secondary",
        "show_photos": true,
        "show_rating": true
      },
      
      "gallery": {
        "type": "natural_grid",
        "columns": 3,
        "aspect_ratio": "natural",
        "gap": "0.5rem"
      },
      
      "contact": {
        "type": "simple_centered",
        "show_map": true,
        "show_phone_prominent": true
      }
    },
    
    "content_priority": [
      "photos_terrain",
      "temoignages_clients",
      "zone_intervention",
      "savoir_faire",
      "certifications",
      "contact_direct"
    ],
    
    "image_treatment": {
      "filter": "warm",
      "saturation": "1.05",
      "brightness": "1.02",
      "border_radius": "radius_medium"
    }
  }
}
```

---

### Composants a creer ou modifier

StylePaletteSelector.tsx
Grille des 6 palettes avec previews et descriptions

StylePaletteCard.tsx
Carte individuelle d une palette avec thumbnail et infos

StyleSuggestion.tsx
Modal de suggestion IA avec explication

StylePreview.tsx
Preview live du portfolio avec la palette selectionnee

StyleCompare.tsx
Comparaison cote a cote de 2 palettes optionnel

### Services a modifier

styleService.ts
- suggestPalette analyse contenu et intentions retourne palette suggeree avec score de confiance
- getAllPalettes retourne les 6 palettes disponibles
- getPaletteById retourne une palette specifique
- applyPalette applique les design tokens et layout config
- generatePreview genere une preview avec une palette donnee

### Fichiers de configuration

src config stylePalettes.ts
Contient les 6 palettes completes avec tous leurs tokens

### Prompts Ollama pour suggestion

PROMPT ANALYSE POUR SUGGESTION STYLE

```
Analyse le contenu suivant et determine quelle palette de style convient le mieux.

Palettes disponibles :
- MODERNE : freelance tech, startup, creatif digital, dynamique
- CLASSIQUE : consultant, expert, profession liberale, sobre et serieux
- AUTHENTIQUE : artisan, metier manuel, service local, chaleureux et terrain
- ARTISTIQUE : photographe, artiste, architecte, images dominantes
- VITRINE : commerce local, restaurant, boutique, pratique et accueillant
- FORMEL : notaire, institution, cabinet etabli, rigoureux et sobre

Contenu a analyser :
Comptes externes : [LISTE]
Intentions declarees : [REPONSES FORMULAIRE]
Types de fichiers : [STATS MEDIATHEQUE]
Mots cles extraits : [LISTE]

Reponds en JSON :
{
  "suggested_palette": "authentique",
  "confidence": 0.85,
  "reasoning": "Explication courte",
  "alternative": "vitrine",
  "alternative_confidence": 0.6
}
```

### Livrable Phase 7

Systeme de palettes de style complet avec :
- Les 6 palettes configurees
- Interface de selection avec previews
- Suggestion IA basee sur le contenu
- Preview live avant validation

---

## PHASE 8 - PREVIEW ET EXPORT

### Objectif

Permettre de visualiser et exporter le portfolio et les projets individuels.
Le rendu utilise la palette de style choisie.

### Deux niveaux d export

EXPORT PROJET INDIVIDUEL
- Exporter un seul projet en PDF ou HTML
- Ideal pour envoyer a un client potentiel ou repondre a un appel d offre
- Le projet garde la palette de style du portfolio parent

EXPORT PORTFOLIO COMPLET
- Exporter tout le portfolio en PDF ou HTML
- Inclut tous les projets highlights
- Inclut les comptes externes
- Inclut les sections selon la palette

### Moteur de rendu

Le moteur de rendu fusionne :
- Le contenu JSON du projet ou portfolio
- La palette de style JSON
- Les templates de layout

PROCESSUS DE RENDU

```
CONTENU JSON
titre, sections, medias, metadata
         +
PALETTE JSON
design tokens, layout config
         +
LAYOUT TEMPLATES
composants HTML par type de section
         |
         v
MOTEUR DE RENDU
Assemble le tout
         |
         v
HTML FINAL
Pret pour preview, export PDF, export HTML
```

### Preview

PREVIEW PROJET
- Modal ou page dediee
- Affiche le projet avec la palette appliquee
- Boutons export PDF et HTML
- Bouton fermer ou retour

PREVIEW PORTFOLIO
- Page dediee plein ecran
- Navigation entre sections
- Simulation du site final
- Boutons export et publier

### Export PDF

Methode : Generer le HTML complet puis convertir via puppeteer ou electron-pdf

Options proposees a l utilisateur :
- Format : A4 ou US Letter
- Orientation : Portrait ou Paysage
- Marges : Normales ou Reduites
- Anonymisation : Avec vraies donnees ou Anonymise

Processus :
1. Generer le HTML avec la palette
2. Injecter CSS print-friendly
3. Convertir en PDF via puppeteer
4. Proposer telechargement

### Export HTML

Deux modes :

MODE FICHIER UNIQUE
- Un seul fichier HTML
- CSS dans balise style
- Images en base64
- Zero dependance externe
- Fonctionne offline
- Fichier plus lourd mais autonome

MODE DOSSIER
- index.html
- styles.css
- Dossier assets avec images originales
- Plus leger mais plusieurs fichiers

Options proposees :
- Mode : Fichier unique ou Dossier
- Anonymisation : Avec vraies donnees ou Anonymise

### QR Code

Generer un QR code pour partager facilement.

Si portfolio publie en ligne :
- QR pointe vers URL publique

Si export local uniquement :
- QR peut pointer vers un lien temporaire de partage optionnel
- Ou simplement generer un QR avec texte personnalise

Lib : qrcode npm package

### Composants a creer

PreviewProject.tsx
Preview plein ecran d un projet individuel

PreviewPortfolio.tsx
Preview plein ecran du portfolio complet

PreviewFrame.tsx
Iframe ou conteneur pour le rendu HTML

ExportModal.tsx
Modal avec toutes les options d export

ExportOptions.tsx
Formulaire des options format orientation anonymisation

ExportProgress.tsx
Barre de progression pendant generation

ExportSuccess.tsx
Confirmation avec bouton telecharger

QRCodeDisplay.tsx
Affichage du QR code genere avec options copier telecharger

### Services a creer

renderService.ts
- renderProject genere HTML d un projet avec palette
- renderPortfolio genere HTML du portfolio complet avec palette
- applyDesignTokens injecte les tokens CSS
- assembleLayout assemble les sections selon layout config

exportService.ts
- exportProjectPDF genere PDF d un projet
- exportProjectHTML genere HTML d un projet fichier unique ou dossier
- exportPortfolioPDF genere PDF du portfolio
- exportPortfolioHTML genere HTML du portfolio
- getExportOptions retourne options disponibles selon contexte

pdfService.ts
- generatePDF convertit HTML en PDF via puppeteer
- configurePrintStyles ajoute CSS pour impression
- setPageFormat configure format et orientation

qrService.ts
- generateQRCode genere QR code PNG
- generateQRCodeSVG genere QR code SVG
- generateQRCodeDataURL genere QR en data URL pour affichage inline

### Templates de layout HTML

Creer des templates HTML pour chaque type de section.
Les templates utilisent des placeholders pour le contenu et les tokens CSS.

src templates layouts hero_split.html
src templates layouts hero_fullwidth.html
src templates layouts two_columns.html
src templates layouts cards_grid.html
src templates layouts masonry.html
src templates layouts testimonials_band.html
src templates layouts gallery_natural.html
src templates layouts contact_centered.html
etc

Exemple de template :

```
<section class="hero hero--split" style="background: var(--color-background);">
  <div class="hero__content">
    <h1 class="hero__title" style="font-family: var(--font-heading); color: var(--color-text-primary);">
      {{title}}
    </h1>
    <p class="hero__tagline" style="font-family: var(--font-body); color: var(--color-text-secondary);">
      {{tagline}}
    </p>
  </div>
  <div class="hero__image">
    <img src="{{hero_image_src}}" alt="{{hero_image_alt}}">
  </div>
</section>
```

### Livrable Phase 8

Systeme de preview et export complet avec :
- Preview projet et portfolio
- Export PDF avec options
- Export HTML fichier unique et dossier
- QR Code generation
- Anonymisation optionnelle a l export

---

## PHASE 9 - PUBLICATION WEB

### Objectif

Permettre de publier le portfolio en ligne sur souverain.io
Fonctionnalite reservee aux utilisateurs Premium.

### Infrastructure Cloudflare

CLOUDFLARE R2
Stockage des fichiers statiques HTML CSS images
Pas de frais de sortie egress
Cout quasi nul

CLOUDFLARE WORKERS
API pour upload et gestion
Verification des droits Premium
Gestion des slugs

CLOUDFLARE CDN
Distribution mondiale rapide
SSL automatique
Cache intelligent

### Modele d URL

Portfolio complet :
monnom.souverain.io

Projet individuel :
monnom.souverain.io/projet/nom-du-projet

### Fonctionnalites

PUBLICATION PORTFOLIO COMPLET
1. User clique Publier
2. Verification statut Premium
3. Choix du slug verification disponibilite
4. Generation du HTML final
5. Upload vers R2 via Worker
6. URL active et QR code genere

PUBLICATION PROJET INDIVIDUEL
1. User clique Publier ce projet
2. Meme flow mais pour un seul projet
3. URL monnom.souverain.io/projet/slug-projet

MISE A JOUR
1. User modifie son contenu
2. Clique Mettre a jour
3. Re-generation et re-upload
4. Meme URL conservee
5. Cache purge automatique

DEPUBLICATION
1. User clique Depublier
2. Confirmation
3. Fichiers supprimes de R2
4. URL devient inactive
5. Enregistrement DB mis a jour

### Verification Premium

Avant toute publication verifier que l utilisateur a un statut Premium actif.
Si Free afficher un message d upgrade.

```
Fonctionnalite Premium

La publication en ligne est reservee aux utilisateurs Premium.

Avantages Premium :
- Publication sur souverain.io
- URL personnalisee
- QR Code de partage
- Mises a jour illimitees

[Passer Premium]    [Rester en export local]
```

### Gestion des slugs

REGLES DE VALIDATION
- Minimum 3 caracteres
- Maximum 30 caracteres
- Uniquement lettres minuscules chiffres et tirets
- Pas de tiret au debut ou a la fin
- Pas de tirets consecutifs
- Unique dans toute la base

VERIFICATION DISPONIBILITE
- Check en temps reel pendant la saisie
- Afficher disponible ou deja pris
- Suggerer des alternatives si pris

### Composants a creer

PublishButton.tsx
Bouton publier avec verification Premium

PublishModal.tsx
Modal de publication avec choix du slug

SlugInput.tsx
Champ de saisie du slug avec verification temps reel

PublishProgress.tsx
Progression de l upload

PublishSuccess.tsx
Confirmation avec URL QR code et boutons partage

PublishManager.tsx
Liste des publications actives avec actions mettre a jour depublier

PremiumGate.tsx
Modal d upgrade si user Free

### Services a creer

publishService.ts
- checkPremiumStatus verifie si user est Premium
- checkSlugAvailability verifie disponibilite du slug
- suggestAlternativeSlugs suggere des alternatives
- publishPortfolio publie le portfolio complet
- publishProject publie un projet individuel
- updatePublication met a jour une publication existante
- unpublish retire une publication
- getPublications liste les publications actives du user

cloudflareService.ts
- uploadToR2 upload fichiers vers R2
- deleteFromR2 supprime fichiers de R2
- purgeCache purge le cache CDN pour une URL
- getWorkerEndpoint retourne l endpoint du Worker

### Worker Cloudflare

Creer un Worker qui :
- Recoit les requetes d upload
- Verifie l authentification
- Valide le contenu
- Ecrit dans R2
- Retourne l URL publique

Endpoint :
POST api.souverain.io/publish
Headers : Authorization Bearer token
Body : multipart form avec fichiers

Reponse :
{
  "success": true,
  "url": "https://monnom.souverain.io",
  "published_at": "2025-01-22T10:30:00Z"
}

### Securite

- Authentification obligatoire pour publier
- Verification Premium cote serveur aussi pas juste client
- Rate limiting pour eviter les abus
- Validation du contenu avant upload pas de scripts malicieux
- HTTPS obligatoire

### Livrable Phase 9

Systeme de publication complet avec :
- Verification Premium
- Choix et validation du slug
- Upload vers Cloudflare R2
- URL publique fonctionnelle
- QR Code de partage
- Mise a jour et depublication
- Worker Cloudflare configure

---

## RECAPITULATIF PHASES RESTANTES

PHASE 7 REVISEE
Remplacer l implementation actuelle par les palettes de style
6 palettes basees sur la personnalite pas la technique
Suggestion IA intelligente

PHASE 8
Preview projet et portfolio
Export PDF et HTML
QR Code
Anonymisation optionnelle

PHASE 9
Publication web Premium
Infrastructure Cloudflare
Gestion des slugs et URLs

---

## ORDRE D EXECUTION

1. Phase 7 revisee en premier
   Supprimer ancien code des styles
   Implementer les 6 palettes
   Tester la suggestion IA

2. Phase 8 ensuite
   Depend de la Phase 7 pour le rendu
   Preview puis export

3. Phase 9 en dernier
   Depend de la Phase 8 pour le HTML genere
   Configuration Cloudflare necessaire

---

## INSTRUCTIONS POUR GEMINI

Commence par supprimer l implementation actuelle de la Phase 7.
Reimplemente avec les 6 palettes de style decrites ci-dessus.
Puis enchaine avec les Phases 8 et 9.

A chaque fin de phase indique :
- Ce qui a ete fait
- Ce qui fonctionne
- Les bugs eventuels
- Pret pour la phase suivante oui non
