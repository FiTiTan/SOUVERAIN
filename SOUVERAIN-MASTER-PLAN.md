# SOUVERAIN - Master Plan Portfolio Hub

## PREAMBULE

Ce document est le plan de developpement complet du module Portfolio Hub.
Il remplace toute architecture precedente.
Gemini CLI doit suivre ce plan phase par phase.

Date de creation : 22 janvier 2025
Version : 3.0

---

## VISION GLOBALE

SOUVERAIN permet aux professionnels de creer des portfolios intelligents.
Le module Portfolio Hub est le coeur de cette promesse.

Trois couches distinctes :
1. COQUILLE - Structure technique fait
2. CONTENU - Donnees et intelligence en cours
3. TEMPLATES - Design achetables en boutique a venir

Ce master plan couvre la couche CONTENU.
Les templates viendront se brancher sur le JSON standardise.

---

## ARCHITECTURE PORTFOLIO HUB

Le portfolio ne se segmente plus par metier ou statut.
Il s organise comme un hub central avec trois piliers.

```
PORTFOLIO HUB
     |
     +-- MEDIATHEQUE AUTONOME
     |   Reservoir global de fichiers
     |   Independant du coffre fort
     |   Import libre sans affectation obligatoire
     |
     +-- GESTIONNAIRE DE PROJETS
     |   Realisations structurees
     |   6 types de projets
     |   IA conversationnelle pour enrichir
     |
     +-- AGREGATEUR DE COMPTES
         Liens vers plateformes externes
         Configuration des comptes a afficher
```

---

## PRINCIPES FONDAMENTAUX

### Securite et Souverainete

REGLE ABSOLUE : Toute donnee sensible doit etre anonymisee localement par Ollama AVANT tout traitement IA conversationnel.

Flux obligatoire :
1. Import des fichiers
2. Extraction locale des donnees
3. Anonymisation locale par Ollama
4. Stockage de la map anonymisation
5. IA conversationnelle recoit uniquement donnees anonymisees
6. Reinjection des vraies valeurs avant affichage
7. Choix utilisateur export anonymise ou non

### Format de donnees

Tout contenu est stocke en JSON standardise.
Les templates Figma viendront consommer ce JSON.
Le contenu est agnostique du design.

### UX Moderne

Pas de formulaires longs style 2015.
Approche : Import first puis IA conversationnelle puis fiche editable style Notion.

---

## PHASE 0 - MIGRATION

### Objectif
Nettoyer l ancien code et preparer la nouvelle structure.

### Actions
1. Creer dossier archive legacy-portfolio-v1
2. Deplacer ancien code portfolio dedans
3. Supprimer tables obsoletes
   - independant_profiles
   - commerce_profiles
   - portfolio_assets ancienne version
   - portfolio_elements
   - portfolio_project_elements
4. Garder ce qui fonctionne si reutilisable

### Livrable
Structure propre prete pour le nouveau code.

---

## PHASE 1 - SCHEMA BASE DE DONNEES

### Tables a creer

TABLE portfolios
- id TEXT PRIMARY KEY
- title TEXT
- tagline TEXT
- intention_form_json TEXT reponses formulaire intention
- selected_style TEXT bento classic gallery minimal
- created_at DATETIME
- updated_at DATETIME

TABLE mediatheque_items
- id TEXT PRIMARY KEY
- portfolio_id TEXT FK
- file_path TEXT
- file_type TEXT image video pdf document
- original_filename TEXT
- file_size INTEGER
- thumbnail_path TEXT
- tags_json TEXT
- metadata_json TEXT
- extracted_text TEXT pour OCR et contenu PDF
- created_at DATETIME

TABLE projects
- id TEXT PRIMARY KEY
- portfolio_id TEXT FK
- project_type TEXT client personal collaboration training contest opensource
- title TEXT
- summary TEXT
- date_type TEXT precise period ongoing
- date_start TEXT
- date_end TEXT nullable
- status TEXT completed ongoing abandoned
- detail_level TEXT synthetic casestudy gallery
- cover_image_id TEXT FK vers mediatheque_items
- is_highlight INTEGER 0 ou 1
- display_order INTEGER
- content_json TEXT structure complete du projet
- created_at DATETIME
- updated_at DATETIME

TABLE project_media
- id TEXT PRIMARY KEY
- project_id TEXT FK
- mediatheque_item_id TEXT FK
- display_order INTEGER
- caption TEXT
- section_key TEXT a quelle section ce media appartient

TABLE external_accounts
- id TEXT PRIMARY KEY
- portfolio_id TEXT FK
- platform_type TEXT voir listing complet
- platform_category TEXT social professional creative technical content commerce
- account_url TEXT
- account_username TEXT
- account_display_name TEXT ce qui s affiche
- is_primary INTEGER 0 ou 1
- display_order INTEGER
- created_at DATETIME

TABLE anonymization_maps
- id TEXT PRIMARY KEY
- portfolio_id TEXT FK
- project_id TEXT FK nullable si global au portfolio
- token TEXT ex CLIENT_1
- original_value TEXT ex Famille Martin
- value_type TEXT person company address email phone amount date location
- created_at DATETIME

TABLE portfolio_publications
- id TEXT PRIMARY KEY
- portfolio_id TEXT FK
- publication_type TEXT full ou project_single
- project_id TEXT FK nullable si full
- slug TEXT UNIQUE
- published_url TEXT
- qr_code_path TEXT
- published_at DATETIME
- is_active INTEGER 0 ou 1

### Index a creer
- mediatheque_items portfolio_id
- projects portfolio_id
- project_media project_id
- external_accounts portfolio_id
- anonymization_maps portfolio_id
- anonymization_maps project_id

### Livrable
Script SQL de creation des tables.
Migration depuis ancien schema si donnees existantes.

---

## PHASE 2 - MEDIATHEQUE AUTONOME

### Objectif
Permettre l import et la gestion de fichiers independamment des projets.

### Fonctionnalites

IMPORT FICHIERS
- Bouton importer dans la vue mediatheque
- Selecteur fichiers natif Electron
- Selection multiple
- Drag and drop sur la zone
- Formats supportes JPG JPEG PNG GIF WEBP PDF MP4 MOV WEBM

TRAITEMENT A L IMPORT
- Copie dans dossier data portfolio mediatheque
- Generation thumbnail pour images max 300px
- Generation thumbnail pour videos premiere frame
- Extraction metadonnees EXIF date taille dimensions
- Extraction texte OCR pour images avec texte via Ollama vision
- Extraction contenu PDF via pdf-parse

AFFICHAGE
- Grille de miniatures responsive
- Filtre par type image video document
- Recherche par nom ou tag
- Selection multiple pour actions groupees

ACTIONS SUR UN ITEM
- Ouvrir preview grande taille
- Ouvrir avec application systeme
- Renommer
- Ajouter modifier tags
- Supprimer
- Ajouter a un projet

### Composants a creer

MediathequeView.tsx
Vue principale de la mediatheque avec grille et filtres

MediathequeImporter.tsx
Zone d import avec drag drop et bouton

MediathequeGrid.tsx
Grille responsive des items

MediathequeItem.tsx
Carte individuelle avec thumbnail et actions

MediathequePreview.tsx
Modal de preview grande taille

MediathequeFilters.tsx
Filtres par type et recherche

### Services a creer

mediathequeService.ts
- importFiles copie et traite les fichiers
- generateThumbnail cree miniature
- extractMetadata extrait EXIF et infos
- extractText OCR et contenu PDF
- deleteItem supprime fichier et DB
- getItemsByPortfolio recupere tous les items
- updateItem modifie tags ou nom
- searchItems recherche par nom ou tag

### Structure dossiers

userData
  portfolios
    [portfolio_id]
      mediatheque
        originals
          [fichiers originaux]
        thumbnails
          [miniatures]

### Livrable
Mediatheque fonctionnelle avec import preview et gestion.

---

## PHASE 3 - SYSTEME D ANONYMISATION

### Objectif
Garantir que toute donnee sensible est anonymisee avant traitement IA.

### Flux d anonymisation

ETAPE 1 DETECTION
Ollama local analyse le contenu texte extrait des fichiers et entrees utilisateur.
Detecte les entites sensibles :
- Noms de personnes
- Noms d entreprises
- Adresses et lieux
- Emails
- Numeros de telephone
- Montants et prix
- Dates specifiques si sensibles

ETAPE 2 TOKENISATION
Chaque entite detectee recoit un token unique :
- Personne -> PERSON_1 PERSON_2 etc
- Entreprise -> COMPANY_1 COMPANY_2 etc
- Adresse -> ADDRESS_1 etc
- Email -> EMAIL_1 etc
- Telephone -> PHONE_1 etc
- Montant -> AMOUNT_1 etc
- Lieu -> LOCATION_1 etc

ETAPE 3 STOCKAGE MAP
La correspondance token vers valeur reelle est stockee dans anonymization_maps.
Cette table reste locale et chiffree.

ETAPE 4 SUBSTITUTION
Avant envoi a l IA conversationnelle, tout texte passe par le substituteur qui remplace les valeurs reelles par les tokens.

ETAPE 5 REINJECTION
Avant affichage a l utilisateur, le texte passe par le reinjecteur qui remet les vraies valeurs.

### Coherence cross projet

Si une meme entite apparait dans plusieurs projets, elle doit avoir le meme token.
Exemple : CLIENT_1 = Famille Martin partout.

Logique :
1. Avant de creer un nouveau token, verifier si la valeur existe deja dans la map du portfolio
2. Si oui reutiliser le token existant
3. Si non creer un nouveau token

### Communication utilisateur

Afficher un message rassurant avant le premier traitement IA :

```
Vos donnees sont protegees

Avant d analyser votre projet SOUVERAIN anonymise
automatiquement toutes les informations sensibles

Les noms de clients et personnes
Les noms d entreprises
Les adresses et lieux
Les emails et telephones
Les montants et budgets

L IA ne voit que des donnees anonymisees
Vos informations reelles restent sur votre machine

[Continuer]
```

### Option verification

En mode avance l utilisateur peut voir les donnees anonymisees avant envoi.

```
Verifier l anonymisation

Donnees originales          Donnees anonymisees
Famille Martin         ->   PERSON_1
Boulangerie du Marche  ->   COMPANY_1
12 rue des Lilas Lyon  ->   ADDRESS_1
15000 euros            ->   AMOUNT_1

[Modifier] [Confirmer et continuer]
```

### Option export

A l export l utilisateur choisit :
- Exporter avec les vraies donnees
- Exporter en version anonymisee

### Composants a creer

AnonymizationNotice.tsx
Message de reassurance affiche une fois

AnonymizationPreview.tsx
Modal de verification des donnees anonymisees

AnonymizationExportChoice.tsx
Choix du mode d export

### Services a creer

anonymizationService.ts
- detectEntities analyse texte et detecte entites sensibles via Ollama
- tokenize cree ou recupere token pour une entite
- substitute remplace valeurs par tokens dans un texte
- reinject remplace tokens par valeurs dans un texte
- getMapByPortfolio recupere la map complete
- getMapByProject recupere la map d un projet
- exportAnonymized genere contenu avec tokens
- exportOriginal genere contenu avec vraies valeurs

### Prompts Ollama

PROMPT DETECTION ENTITES

```
Analyse le texte suivant et identifie toutes les entites sensibles.
Retourne un JSON avec les entites trouvees.

Categories a detecter :
- person : noms de personnes prenoms et noms de famille
- company : noms d entreprises societes marques
- address : adresses completes ou partielles
- email : adresses email
- phone : numeros de telephone
- amount : montants prix budgets avec ou sans devise
- location : villes regions pays lieux specifiques

Format de reponse :
{
  "entities": [
    {"type": "person", "value": "Jean Dupont", "start": 0, "end": 11},
    {"type": "company", "value": "SARL Martin", "start": 45, "end": 56}
  ]
}

Texte a analyser :
[TEXTE]
```

### Livrable
Systeme d anonymisation complet et teste.

---

## PHASE 4 - GESTIONNAIRE DE PROJETS

### Objectif
Permettre la creation et l edition de projets avec une UX moderne.

### Les 6 types de projets

TYPE CLIENT
Mission realisee pour un commanditaire externe.
Champs specifiques : client secteur besoin contraintes role solution outils livrable impact temoignage

TYPE PERSONAL
Initiative propre sans commande.
Champs specifiques : motivation probleme realisation outils difficultes apprentissages evolution lien statut

TYPE COLLABORATION
Realisation a plusieurs mains.
Champs specifiques : partenaires nombre organisation role part interactions livrable impact

TYPE TRAINING
Projet academique ou exercice.
Champs specifiques : formation module individuel_groupe objectif production outils competences note influence

TYPE CONTEST
Participation a un challenge.
Champs specifiques : concours organisateur theme solo_equipe temps approche classement retours_jury apprentissages

TYPE OPENSOURCE
Contribution a un projet communautaire.
Champs specifiques : repository description_projet motivation nature_contribution prs_issues impact merged retours mainteneur

### UX Moderne en 4 etapes

ETAPE 1 IMPORT FIRST
L utilisateur commence par uploader ses fichiers.
Depuis la mediatheque ou import direct.
Les fichiers importes en projet rejoignent aussi la mediatheque.

ETAPE 2 ANALYSE ET ANONYMISATION
Ollama analyse les fichiers.
Extrait le texte et les metadonnees.
Anonymise les donnees sensibles.
Affiche le message de securite.

ETAPE 3 IA CONVERSATIONNELLE
L IA pose des questions pour enrichir le projet.
Elle recoit uniquement les donnees anonymisees.
Les questions sont adaptees au type de projet detecte ou choisi.

Exemple de conversation :

```
IA : J ai analyse tes fichiers. Je vois des photos de renovation.
     C est une mission client ou un projet personnel ?
User : Client

IA : Ok. C etait qui le client ?
User : Une famille a Lyon

IA : Quel etait le besoin principal ?
User : Refaire leur cuisine completement

IA : Et concretement tu as fait quoi ?
User : Demontage de l ancienne abattage d une cloison
       creation d un ilot central pose du carrelage
       installation de la nouvelle cuisine

IA : Ca a dure combien de temps ?
User : 3 semaines

IA : Top j ai ce qu il me faut. Tu veux voir la fiche projet ?
```

ETAPE 4 FICHE EDITABLE STYLE NOTION
L IA genere une fiche pre-remplie.
L utilisateur peut modifier inline.
Ajout de sections possible.
Reorganisation des medias.

### Structure JSON Contenu Projet

```
{
  "id": "project_xxx",
  "type": "client",
  "title": "Renovation Cuisine",
  "summary": "Transformation complete d une cuisine annees 80",
  
  "hero_media": {
    "id": "media_xxx",
    "path": "chemin/vers/fichier.jpg"
  },
  
  "sections": [
    {
      "key": "context",
      "title": "Le contexte",
      "content": "Famille avec 3 enfants souhaitant moderniser...",
      "order": 1
    },
    {
      "key": "realisation", 
      "title": "Ce que j ai fait",
      "content": "Abattage cloison creation ilot central...",
      "order": 2
    },
    {
      "key": "resultat",
      "title": "Le resultat",
      "content": "Surface multipliee par 2 client satisfait...",
      "order": 3
    }
  ],
  
  "gallery": [
    {
      "id": "media_xxx",
      "path": "chemin/fichier.jpg",
      "caption": "Avant les travaux",
      "order": 1
    },
    {
      "id": "media_yyy",
      "path": "chemin/fichier2.jpg",
      "caption": "Apres les travaux",
      "order": 2
    }
  ],
  
  "metadata": [
    {
      "key": "client",
      "label": "Client",
      "value": "Famille Martin",
      "visible": true
    },
    {
      "key": "date",
      "label": "Date",
      "value": "Janvier 2025",
      "visible": true
    },
    {
      "key": "duration",
      "label": "Duree",
      "value": "3 semaines",
      "visible": true
    },
    {
      "key": "tools",
      "label": "Outils",
      "value": "Cuisine Schmidt carrelage grand format",
      "visible": false
    }
  ],
  
  "display_options": {
    "show_client": true,
    "show_date": true,
    "show_duration": true,
    "show_tools": false,
    "show_budget": false
  },
  
  "detail_level": "casestudy"
}
```

### Composants a creer

ProjectHub.tsx
Vue principale listant tous les projets avec filtres

ProjectCard.tsx
Carte projet dans la liste avec thumbnail et infos cles

ProjectCreator.tsx
Wizard de creation nouveau projet

ProjectTypeSelector.tsx
Selection du type de projet avec icones et descriptions

ProjectImporter.tsx
Zone d import de fichiers pour le projet

ProjectAIChat.tsx
Interface conversationnelle avec l IA

ProjectEditor.tsx
Fiche projet editable style Notion

ProjectSection.tsx
Section editable du projet titre et contenu

ProjectGallery.tsx
Galerie de medias du projet avec reorganisation

ProjectMetadata.tsx
Liste des metadonnees avec toggles de visibilite

ProjectPreview.tsx
Preview du projet avec le contenu structure

### Services a creer

projectService.ts
- createProject cree un nouveau projet
- updateProject met a jour un projet
- deleteProject supprime un projet
- getProjectsByPortfolio liste les projets
- getProjectById recupere un projet complet
- reorderProjects change l ordre des projets
- toggleHighlight marque comme highlight ou non
- exportProjectJSON exporte le contenu JSON

projectAIService.ts
- analyzeFiles analyse les fichiers importes via Ollama
- detectProjectType suggere le type de projet
- generateQuestions genere les questions adaptees
- processAnswer traite une reponse utilisateur
- generateProjectContent genere le contenu de la fiche
- enrichSection enrichit une section specifique

### Prompts Ollama

PROMPT ANALYSE FICHIERS

```
Analyse les fichiers suivants et decris ce que tu vois.
Identifie le type de projet probable.
Extrait les informations cles.

Fichiers :
[LISTE DES FICHIERS AVEC METADONNEES ET TEXTE EXTRAIT]

Reponds en JSON :
{
  "detected_type": "client|personal|collaboration|training|contest|opensource",
  "confidence": 0.0 a 1.0,
  "summary": "description courte",
  "key_elements": ["element1", "element2"],
  "suggested_title": "titre suggere",
  "missing_info": ["ce qui manque pour completer"]
}
```

PROMPT GENERATION QUESTIONS

```
Tu es un assistant qui aide a documenter un projet professionnel.
Le projet est de type [TYPE].
Tu as deja ces informations :
[INFOS CONNUES]

Pose la prochaine question pour completer la fiche projet.
Une seule question a la fois.
Ton style est conversationnel et sympathique.
```

PROMPT GENERATION CONTENU

```
Genere le contenu structure d un projet portfolio.
Type de projet : [TYPE]
Informations collectees :
[TOUTES LES INFOS]

Genere un JSON avec :
- title : titre accrocheur
- summary : resume en une phrase
- sections : array de sections avec key title content
- metadata : array de metadonnees avec key label value

Les sections doivent raconter une histoire coherente.
Le ton est professionnel mais accessible.
```

### Livrable
Gestionnaire de projets complet avec UX moderne et IA conversationnelle.

---

## PHASE 5 - AGREGATEUR DE COMPTES EXTERNES

### Objectif
Permettre de lier et afficher des comptes externes pour montrer l activite quotidienne.

### Listing complet des plateformes

CATEGORIE SOCIAL
Reseaux sociaux et flux quotidiens
- instagram
- tiktok
- pinterest
- facebook
- twitter
- threads
- snapchat

CATEGORIE PROFESSIONAL
Plateformes professionnelles et freelance
- linkedin
- malt
- freelance_com
- upwork
- fiverr
- cinq_euros
- comet
- creme_de_la_creme
- talent_io
- welcome_to_the_jungle

CATEGORIE CREATIVE
Showcases creatifs
- behance
- dribbble
- adobe_portfolio
- artstation
- deviantart
- canva
- cargo
- coroflot
- domestika
- ninetynine_designs

CATEGORIE TECHNICAL
Espaces techniques
- github
- gitlab
- bitbucket
- stackoverflow
- codepen
- codesandbox
- replit
- kaggle
- huggingface
- observable
- hashnode

CATEGORIE CONTENT
Contenus et redactionnel
- medium
- substack
- ghost
- wordpress
- notion_public
- youtube
- vimeo
- twitch
- podcast_rss
- slideshare
- speaker_deck

CATEGORIE COMMERCE
Commerce et local
- google_business
- tripadvisor
- yelp
- pagesjaunes
- etsy
- shopify
- amazon_handmade
- leboncoin_pro
- houzz

CATEGORIE PORTFOLIO
Portfolios et CV en ligne
- about_me
- linktree
- bento_me
- read_cv
- polywork
- peerlist
- the_dots
- contra

CATEGORIE MUSIC
Musique et audio
- soundcloud
- bandcamp
- spotify_artists
- apple_music_artists
- audiomack

CATEGORIE PHOTO
Photo specifique
- fivehundredpx
- flickr
- unsplash
- shutterstock
- adobe_stock

### Fonctionnalites

AJOUT DE COMPTE
- Selection de la plateforme dans une liste categorisee
- Saisie de l URL du profil
- Saisie du nom d affichage optionnel
- Validation basique du format URL
- Marquage comme compte principal ou secondaire

GESTION DES COMPTES
- Liste des comptes ajoutes
- Reorganisation par drag drop
- Modification des infos
- Suppression
- Toggle principal secondaire

AFFICHAGE SUR LE PORTFOLIO
- L IA integre les comptes selon le template choisi
- Les comptes principaux sont mis en avant
- Les secondaires sont en liste ou pied de page

### Composants a creer

ExternalAccountsManager.tsx
Vue principale de gestion des comptes

AccountPlatformSelector.tsx
Selection de plateforme par categorie

AccountForm.tsx
Formulaire d ajout modification de compte

AccountList.tsx
Liste des comptes avec drag drop

AccountCard.tsx
Carte individuelle de compte

### Services a creer

externalAccountsService.ts
- addAccount ajoute un compte
- updateAccount modifie un compte
- deleteAccount supprime un compte
- getAccountsByPortfolio liste les comptes
- reorderAccounts change l ordre
- togglePrimary bascule principal secondaire
- validateUrl verifie le format URL
- getPlatformInfo retourne les infos d une plateforme icone couleur etc

### Configuration des plateformes

```
{
  "instagram": {
    "name": "Instagram",
    "category": "social",
    "icon": "instagram",
    "color": "#E4405F",
    "url_pattern": "https://instagram.com/",
    "placeholder": "votre_compte"
  },
  "github": {
    "name": "GitHub",
    "category": "technical", 
    "icon": "github",
    "color": "#181717",
    "url_pattern": "https://github.com/",
    "placeholder": "votre_username"
  }
}
```

### Livrable
Agregateur de comptes complet avec toutes les plateformes.

---

## PHASE 6 - FORMULAIRE D INTENTION

### Objectif
Collecter les motivations de l utilisateur pour orienter l IA.

### Questions du formulaire

QUESTION 1 OBJECTIF PRINCIPAL
Quel est l objectif principal de ce portfolio
- Decrocher des missions clients
- Trouver un emploi salarie
- Montrer un savoir faire technique
- Vendre des services locaux
- Developper ma notoriete en ligne
- Documenter mon parcours
- Autre

QUESTION 2 TYPE DE CONTENU
Quel type de contenu allez vous principalement montrer
- Realisations visuelles photos designs
- Projets techniques code applications
- Prestations de service chantiers interventions
- Contenus redactionnels articles etudes
- Mix de plusieurs types

QUESTION 3 INFOS PRATIQUES
Quelles informations pratiques souhaitez vous afficher
Selection multiple
- Horaires d ouverture
- Localisation et adresse
- Zone d intervention
- Tarifs indicatifs
- Moyens de paiement
- Moyens de contact uniquement
- Aucune je prefere rester discret

QUESTION 4 TON SOUHAITE
Quel ton souhaitez vous pour votre portfolio
- Professionnel et sobre
- Creatif et dynamique
- Chaleureux et accessible
- Technique et precis
- Je laisse l IA decider

QUESTION 5 INFORMATIONS COMPLEMENTAIRES
Optionnel texte libre
Y a t il autre chose que l IA devrait savoir pour creer votre portfolio

### Utilisation par l IA

Les reponses sont stockees dans intention_form_json.
L IA les utilise pour :
- Adapter le ton des textes generes
- Decider des sections a mettre en avant
- Orienter le choix de style suggere
- Personnaliser les questions dans le chat projet

### Composants a creer

IntentionForm.tsx
Formulaire complet avec les 5 questions

IntentionQuestion.tsx
Composant generique pour une question

IntentionSummary.tsx
Resume des reponses modifiable

### Services a creer

intentionService.ts
- saveIntention enregistre les reponses
- getIntention recupere les reponses
- updateIntention modifie une reponse

### Livrable
Formulaire d intention fonctionnel et integre.

---

## PHASE 7 - GENERATION IA ET STYLES

### Objectif
L IA analyse le contenu et propose un style de portfolio adapte.

### Styles disponibles

STYLE BENTO
- Grille modulaire type bento box
- Ideal si beaucoup de liens externes
- Petits projets visuels
- Rendu moderne et dynamique

STYLE CLASSIC
- Pages multiples structurees
- Ideal si contenu textuel important
- Grandes etudes de cas
- Rendu professionnel traditionnel

STYLE GALLERY
- Focus sur les visuels
- Ideal si contenu tres visuel
- Photographes designers artistes
- Rendu immersif

STYLE MINIMAL
- Epure et sobre
- Ideal si peu de contenu
- Focus sur l essentiel
- Rendu elegant

### Logique de suggestion

L IA analyse :
- Nombre et type de projets
- Ratio texte vs images
- Nombre de comptes externes
- Reponses au formulaire d intention

Regles :
- Beaucoup de liens externes et projets courts -> Bento
- Contenu majoritairement textuel ou etudes de cas -> Classic
- Contenu tres visuel plus de 70 pourcent images -> Gallery
- Peu de contenu ou profil minimaliste -> Minimal

### Choix utilisateur

L IA suggere un style mais l utilisateur peut choisir autrement.

```
IA : Vu ton contenu je te suggere le style Bento.
     Tu as beaucoup de liens externes et des projets visuels.
     
     [Accepter Bento] [Voir les autres styles]
```

### Structure JSON Template

Les templates Figma seront convertis en JSON avec cette structure :

```
{
  "id": "template_xxx",
  "name": "Bento Modern",
  "style": "bento",
  "version": "1.0",
  "price": 9.99,
  "preview_image": "path/to/preview.jpg",
  
  "layout": {
    "type": "bento",
    "columns": 3,
    "gap": 16
  },
  
  "slots": {
    "hero": {
      "type": "image",
      "position": "top",
      "height": 400
    },
    "title": {
      "type": "text",
      "style": {
        "font": "Inter",
        "size": 48,
        "weight": "bold",
        "color": "neutral-900"
      }
    },
    "sections": {
      "type": "repeatable",
      "layout": "vertical"
    },
    "gallery": {
      "type": "media_grid",
      "columns": 2
    },
    "accounts": {
      "type": "link_list",
      "layout": "horizontal"
    }
  },
  
  "colors": {
    "primary": "blue-600",
    "secondary": "neutral-100",
    "accent": "amber-500",
    "background": "white",
    "text": "neutral-900"
  }
}
```

### Composants a creer

StyleSelector.tsx
Selection du style avec previews

StyleSuggestion.tsx
Suggestion IA avec explication

StylePreview.tsx
Preview du style sur le contenu actuel

### Services a creer

styleService.ts
- analyzeContentForStyle analyse le contenu et suggere un style
- getAvailableStyles liste les styles disponibles
- applyStyle applique un style au contenu
- generatePreview genere une preview du rendu

### Livrable
Systeme de suggestion et selection de style.

---

## PHASE 8 - PREVIEW ET EXPORT

### Objectif
Permettre de visualiser et exporter le portfolio et les projets individuels.

### Deux niveaux d export

EXPORT PROJET INDIVIDUEL
- Exporter un seul projet
- Ideal pour envoyer a un client potentiel
- PDF projet seul
- HTML projet seul

EXPORT PORTFOLIO COMPLET
- Exporter tout le portfolio
- PDF complet
- HTML autonome complet

### Preview

PREVIEW PROJET
- Affiche le projet avec le style choisi
- Permet de verifier avant export

PREVIEW PORTFOLIO
- Affiche le portfolio complet
- Navigation entre sections
- Permet de verifier avant export

### Export PDF

Utiliser une lib comme puppeteer ou electron-pdf.
Generer le HTML puis convertir en PDF.

Options :
- Format A4 ou US Letter
- Orientation portrait ou paysage
- Avec ou sans anonymisation

### Export HTML

Generer un fichier HTML autonome :
- CSS inline ou dans une balise style
- Images en base64 ou dans un dossier assets
- Zero dependance externe
- Fonctionne hors ligne

Options :
- Fichier unique tout en base64
- Dossier avec index.html et assets
- Avec ou sans anonymisation

### QR Code

Generer un QR code pointant vers :
- URL publiee si publication web
- Ou fichier HTML local

Lib suggeree : qrcode

### Composants a creer

PreviewProject.tsx
Preview d un projet individuel

PreviewPortfolio.tsx
Preview du portfolio complet

ExportModal.tsx
Modal avec options d export

ExportProgress.tsx
Barre de progression pendant l export

QRCodeGenerator.tsx
Generation et affichage du QR code

### Services a creer

previewService.ts
- generateProjectPreview genere le HTML de preview projet
- generatePortfolioPreview genere le HTML de preview portfolio
- applyTemplate applique le template JSON au contenu JSON

exportService.ts
- exportProjectPDF exporte un projet en PDF
- exportProjectHTML exporte un projet en HTML
- exportPortfolioPDF exporte le portfolio en PDF
- exportPortfolioHTML exporte le portfolio en HTML
- generateQRCode genere le QR code

### Livrable
Systeme de preview et export complet.

---

## PHASE 9 - PUBLICATION WEB

### Objectif
Permettre de publier le portfolio en ligne.

### Infrastructure

Cloudflare R2 pour le stockage.
Cloudflare Workers pour l API upload.
Cloudflare CDN pour la distribution.
SSL automatique.

### Fonctionnalites

PUBLICATION PORTFOLIO COMPLET
- Choix du slug monnom.souverain.io
- Verification disponibilite
- Upload des fichiers
- URL publique generee
- QR code genere

PUBLICATION PROJET INDIVIDUEL
- Meme logique mais pour un seul projet
- URL type monnom.souverain.io/projet/slug-projet

MISE A JOUR
- Republier apres modifications
- Meme URL conservee

DEPUBLICATION
- Retirer le portfolio ou projet de la publication
- L URL devient inactive

### Restriction Premium

La publication web est reservee aux utilisateurs Premium.
Les users Free peuvent uniquement exporter en local.

### Composants a creer

PublishModal.tsx
Modal de publication avec choix du slug

PublishProgress.tsx
Progression de l upload

PublishSuccess.tsx
Confirmation avec URL et QR code

PublishManager.tsx
Gestion des publications actives

### Services a creer

publishService.ts
- checkSlugAvailability verifie si le slug est disponible
- publishPortfolio publie le portfolio complet
- publishProject publie un projet individuel
- updatePublication met a jour une publication
- unpublish retire une publication
- getPublications liste les publications actives

cloudflareService.ts
- uploadFiles upload vers R2
- deleteFiles supprime de R2
- purgeCache purge le cache CDN

### Livrable
Systeme de publication web complet.

---

## RECAPITULATIF DES PHASES

PHASE 0 - MIGRATION
Archiver ancien code et nettoyer

PHASE 1 - SCHEMA DB
Creer les nouvelles tables

PHASE 2 - MEDIATHEQUE
Import et gestion des fichiers

PHASE 3 - ANONYMISATION
Securiser les donnees avant traitement IA

PHASE 4 - PROJETS
Creation et edition avec IA conversationnelle

PHASE 5 - COMPTES EXTERNES
Agregateur de plateformes

PHASE 6 - FORMULAIRE INTENTION
Collecter les motivations

PHASE 7 - STYLES
Suggestion et selection IA

PHASE 8 - PREVIEW ET EXPORT
Visualisation et export PDF HTML

PHASE 9 - PUBLICATION
Mise en ligne sur souverain.io

---

## ORDRE D EXECUTION RECOMMANDE

1. Phase 0 et 1 en parallele migration et DB
2. Phase 2 mediatheque base pour tout le reste
3. Phase 3 anonymisation critique pour la securite
4. Phase 4 projets coeur du module
5. Phase 5 et 6 en parallele comptes et intention
6. Phase 7 styles
7. Phase 8 preview et export
8. Phase 9 publication en dernier

---

## INSTRUCTIONS POUR GEMINI CLI

### Debut de session
Lis ce Master Plan et confirme que tu as compris :
- L architecture Portfolio Hub en trois piliers
- Le flux d anonymisation obligatoire
- L approche UX moderne import first puis IA conversationnelle
- Le format JSON standardise pour le contenu
- Les 9 phases de developpement

### Pendant la session
Suis le plan phase par phase.
Ne saute pas de phase.
Chaque phase doit etre testee avant de passer a la suivante.

### Fin de session
Indique :
- Phase en cours
- Ce qui a ete fait
- Ce qui reste a faire
- Bugs rencontres

---

## QUESTIONS EN ATTENTE

Aucune actuellement.

Pour tout pivot majeur remonter lors de la prochaine session strategique avec Claude Opus.
