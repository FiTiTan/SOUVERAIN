# SOUVERAIN - Brief Projet V2

## ATTENTION MIGRATION

Cette version V2 remplace completement l architecture precedente.
Avant de commencer, mettre au rebus les anciens composants portfolio :
- src components portfolio ancienne structure
- Les tables independant_profiles et commerce_profiles sont obsoletes
- Les notions de mode Independant vs Commerce sont abandonnees
- Les notions de secteur metier sont abandonnees
- Le lien avec le coffre fort est supprime pour le portfolio

Creer un dossier archive legacy-portfolio-v1 et y deplacer l ancien code avant de commencer.

---

## Vision Produit

SOUVERAIN est une application desktop Electron offline-first qui permet aux professionnels de creer des portfolios intelligents sans competence technique.

Positionnement : Un hub central qui regroupe realisations selectionnees et presence en ligne pour une vitrine professionnelle complete.

Cible : Tout professionnel qui veut montrer son travail. Artisans commercants creatifs developpeurs consultants professions liberales.

---

## Stack Technique

- Runtime : Electron + TypeScript + React + Tailwind CSS
- Base de donnees : better-sqlite3-multiple-ciphers avec chiffrement AES-256
- Moteur IA : Ollama en local avec Llama 3.2 3B
- Contrainte hardware : Optimise pour CPU mobile type Surface Pro 7

Vetos techniques souverainete :
- INTERDICTION d utiliser des API Cloud pour l IA. Tout passe par Ollama en local.
- Les donnees sensibles restent dans la DB chiffree locale.
- Export HTML autonome obligatoire pour garantir la souverainete.

---

## Nouvelle Architecture Portfolio Hub

Le portfolio ne se segmente plus par metier ou statut. Il s organise comme un hub central avec trois piliers :

```
PORTFOLIO HUB
     |
     +-- MEDIATHEQUE AUTONOME
     |   Reservoir global de fichiers
     |   Photos PDF videos plans
     |   Independant du coffre fort
     |   Import libre sans affectation obligatoire
     |
     +-- GESTIONNAIRE DE PROJETS
     |   Realisations structurees
     |   Chaque projet est une narration
     |   Brief - Challenge - Solution
     |   Selection des highlights pour le hub
     |
     +-- AGREGATEUR DE COMPTES
         Liens vers plateformes externes
         Montre le flux de travail quotidien
         Niveau de detail plus eleve que le portfolio
         Configuration des comptes a mettre en avant
```

---

## Listing Exhaustif des Comptes Externes

L utilisateur choisit les comptes a afficher. L IA les integre au template.

### Reseaux Sociaux et Flux Quotidiens
- Instagram travail au quotidien
- TikTok coulisses et behind the scenes
- Pinterest inspirations et moodboards
- Facebook page professionnelle
- Twitter X actualites et veille
- Threads discussions pro

### Plateformes Professionnelles
- LinkedIn profil et publications
- Malt profil freelance
- Freelance.com
- Upwork
- Fiverr
- 5euros.com
- Comet
- Crème de la Crème
- Talent.io
- Welcome to the Jungle

### Showcases Creatifs
- Behance
- Dribbble
- Adobe Portfolio
- ArtStation
- DeviantArt
- Canva portfolios
- Cargo
- Coroflot
- Domestika
- 99designs

### Espaces Techniques
- GitHub
- GitLab
- Bitbucket
- Stack Overflow
- CodePen
- CodeSandbox
- Replit
- Kaggle
- HuggingFace
- Observable
- Hashnode

### Contenus et Redactionnel
- Medium
- Substack
- Ghost blog
- WordPress blog
- Notion public
- YouTube chaine
- Vimeo
- Twitch
- Podcast RSS Spotify Apple etc
- Slideshare
- Speaker Deck

### Commerce et Local
- Google Business Profile
- TripAdvisor
- Yelp
- PagesJaunes
- Etsy boutique
- Shopify boutique
- Amazon Handmade
- Leboncoin pro
- Houzz pour archi et deco

### Portfolios et CV en ligne
- About.me
- Linktree
- Bento.me
- Read.cv
- Polywork
- Peerlist
- The Dots
- Contra

### Musique et Audio
- SoundCloud
- Bandcamp
- Spotify for Artists
- Apple Music for Artists
- Audiomack

### Photo specifique
- 500px
- Flickr
- Unsplash profil contributeur
- Shutterstock contributeur
- Adobe Stock contributeur

---

## User Journey Simplifie

### Etape 1 Formulaire d Intention IA

Plus de choix de secteur ou de mode. L utilisateur repond a des questions sur ses motivations :

Questions type :
- Quel est l objectif principal de ce portfolio
  - Decrocher des contrats clients
  - Trouver un emploi salarie
  - Montrer un savoir faire technique
  - Vendre des services locaux
  - Developper ma notoriete
  - Autre

- Quel type de contenu allez vous principalement montrer
  - Realisations visuelles photos designs
  - Projets techniques code applications
  - Prestations de service chantiers interventions
  - Contenus redactionnels articles etudes
  - Mix de plusieurs types

- Quelles informations pratiques souhaitez vous afficher
  - Horaires et localisation
  - Tarifs indicatifs
  - Zone d intervention
  - Moyens de contact uniquement
  - Aucune je veux rester discret

L IA utilise ces reponses pour orienter la mise en page et le contenu genere.

### Etape 2 Configuration du Hub

L utilisateur configure les trois piliers :

A. Agregateur de Comptes
- Selection des comptes a afficher
- Ordre de priorite
- Comptes principaux vs secondaires

B. Gestionnaire de Projets
- Creation de projets avec narration
- Import de medias dans chaque projet
- Selection des projets highlights pour la page d accueil

C. Mediatheque
- Import libre de fichiers
- Organisation par tags ou dossiers
- Fichiers disponibles pour integration IA

### Etape 3 Selection des Highlights

L utilisateur choisit :
- Les projets a mettre en avant sur le hub
- Les comptes externes prioritaires
- Les medias de la mediatheque a integrer

### Etape 4 Choix du Style

L IA propose des styles adaptes au contenu :

Style Bento
- Ideal si beaucoup de liens externes
- Petits projets visuels
- Mise en page modulaire type grille

Style Classique Multipage
- Ideal si contenu majoritairement textuel
- Grandes etudes de cas
- Pages separees par section

Style Galerie
- Ideal si contenu tres visuel
- Photographes designers artistes
- Focus sur les images

Style Minimaliste
- Ideal si peu de contenu
- Profil sobre et epure
- Focus sur l essentiel

L utilisateur peut accepter la suggestion IA ou choisir un autre style.

### Etape 5 Generation et Export

L IA genere le portfolio avec :
- Coherence graphique palette typo
- Hierarchie visuelle adaptee
- Integration fluide des comptes externes
- Mise en page des projets highlights

---

## Deux Niveaux de Presentation

### A. Presentation Individuelle de Projet

Chaque projet peut etre exporte seul. Ideal pour :
- Envoyer a un client potentiel
- Repondre a un appel d offre
- Montrer une realisation specifique

Contenu :
- Recit structure Brief Challenge Solution
- Medias du projet photos videos plans
- Documents associes si pertinents
- Lien vers le portfolio complet optionnel

Export :
- PDF projet seul
- HTML projet seul
- Lien partageable si publie

### B. Presentation du Portfolio General Hub

Vue d ensemble de tout le travail. Ideal pour :
- Page personnelle permanente
- Carte de visite numerique
- Vitrine complete

Contenu :
- Projets highlights selectionnes
- Comptes externes integres
- Infos pratiques selon formulaire
- Bio et intentions

Export :
- PDF portfolio complet
- HTML autonome complet
- Publication sur souverain.io
- QR Code

---

## Role de l IA Ollama Local

L IA n est plus un simple executant de template. Elle devient architecte de la mise en page :

### Analyse du Contenu
- Detecte la nature du contenu visuel textuel technique
- Identifie les marqueurs sectoriels sans imposer de categorie
- Evalue la coherence entre documents et images

### Decisions de Mise en Page
- Choisit la hierarchie visuelle
- Determine quels elements meritent plus d espace
- Adapte le style au volume de contenu

### Generation des Textes
- Synthetise les briefs uploades
- Genere des descriptions de projet si manquantes
- Adapte le ton selon les intentions declarees

### Coherence Graphique
- Definit palette de couleurs
- Choisit typographies adaptees
- Assure l harmonie generale

---

## Schema Base de Donnees V2

Tables a creer :

```
portfolios
- id
- title
- tagline
- intention_form_json reponses au formulaire
- selected_style bento classique galerie minimaliste
- created_at
- updated_at

mediatheque_items
- id
- portfolio_id
- file_path
- file_type image video pdf document
- original_filename
- file_size
- thumbnail_path
- tags_json
- metadata_json
- created_at

projects
- id
- portfolio_id
- title
- brief_text
- challenge_text
- solution_text
- is_highlight mis en avant sur le hub
- display_order
- cover_image_id reference vers mediatheque_items
- created_at
- updated_at

project_media
- id
- project_id
- mediatheque_item_id
- display_order
- caption

external_accounts
- id
- portfolio_id
- platform_type instagram github linkedin etc
- account_url
- account_username
- is_primary compte principal ou secondaire
- display_order
- created_at

portfolio_publications
- id
- portfolio_id
- publication_type full ou project_single
- project_id null si full
- slug
- published_url
- qr_code_path
- published_at
- is_active

generated_styles
- id
- portfolio_id
- style_type
- color_palette_json
- typography_json
- layout_config_json
- generated_at
```

Tables obsoletes a supprimer :
- independant_profiles
- commerce_profiles
- portfolio_assets ancienne version
- portfolio_elements
- portfolio_project_elements
- anonymization_maps si plus utilise

---

## Phases de Developpement Revisees

### Phase 1 Migration et Structure
- Archiver l ancien code dans legacy-portfolio-v1
- Creer les nouvelles tables DB
- Mettre en place la structure de fichiers

### Phase 2 Mediatheque
- Import de fichiers multi formats
- Generation thumbnails
- Affichage grille avec preview
- Gestion tags et organisation

### Phase 3 Gestionnaire de Projets
- Creation de projet avec formulaire Brief Challenge Solution
- Association de medias depuis mediatheque ou import direct
- Tout media importe rejoint automatiquement la mediatheque
- Selection des highlights

### Phase 4 Agregateur de Comptes
- Interface de configuration des comptes
- Selection depuis le listing exhaustif
- Ordre et priorite
- Verification basique des liens

### Phase 5 Formulaire d Intention
- Questions sur les motivations
- Stockage des reponses
- Utilisation par l IA pour orienter le rendu

### Phase 6 Generation IA et Styles
- Analyse du contenu par Ollama
- Proposition de style adapte
- Generation de la mise en page
- Coherence graphique automatique

### Phase 7 Preview et Export
- Preview du portfolio complet
- Preview de chaque projet individuel
- Export PDF portfolio complet
- Export PDF projet seul
- Export HTML autonome portfolio
- Export HTML autonome projet
- Generation QR Code

### Phase 8 Publication Web
- Integration Cloudflare R2 Workers
- Publication portfolio complet
- Publication projet individuel
- Gestion des slugs et URLs

---

## Etat Actuel

Date derniere mise a jour : 22 janvier 2026

Etape en cours : Phase 2 Mediatheque

Implementations realisees :
- Archivage des anciens composants portfolio dans `legacy-portfolio-v1/src/components/portfolio`.
- Migration de la Schema DB vers V2 Hub : Tables `portfolios`, `mediatheque_items`, `projects`, `project_media`, `external_accounts`, `portfolio_publications`, `generated_styles` créées dans `database.cjs`.
- Initialisation de la structure `src/components/portfolio/PortfolioHub.tsx` et `mediatheque`.
- **Réparation Critique Database** : Nettoyage `database.cjs`, modularisation du schéma V2, et correction des conflits V1/V2.

Decisions techniques prises :
- Adoption de l'architecture Hub V2 (3 piliers).
- Base de données : SQLite avec schema Hub V2.
- **Sécurisation Migration** : Extraction du schéma V2 dans un module dédié (`database_schema_v2.cjs`) pour éviter la corruption du fichier principal.

Prochaine etape : Vérification de l'intégration Database dans le processus Principal (`main.cjs`) et reprise du développement Médiathèque.

Bugs connus : Aucun sur la nouvelle architecture

---

## Instructions pour Gemini CLI

### Debut de session
Lis ce fichier BRIEF.md et confirme que tu as compris :
- L architecture Portfolio Hub en trois piliers
- L abandon des notions de secteur et mode
- Le role de l IA comme architecte
- Les deux niveaux d export projet seul et portfolio complet

### Pendant la session
Refere toi aux sections pertinentes.
Attention a bien respecter :
- La mediatheque est autonome et globale
- Tout media importe dans un projet rejoint aussi la mediatheque
- L IA decide de la mise en page pas l utilisateur directement

### Fin de session
Mets a jour la section ETAT ACTUEL avec :
- Ce qui a ete implemente
- Les decisions techniques prises
- La prochaine etape

---

## Questions en Attente

Aucune actuellement.

Pour tout pivot majeur ou question d architecture, noter ici et remonter lors de la prochaine session strategique avec Claude Opus.
