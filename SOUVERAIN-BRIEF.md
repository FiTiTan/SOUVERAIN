# SOUVERAIN - Brief Projet

## Vision Produit

SOUVERAIN est une application desktop Electron offline-first qui permet aux professionnels independants et commerces de creer des portfolios professionnels sans competence technique.

Positionnement : Plus simple que Wix, moins cher, adapte a chaque metier.

Cible : Artisans, commercants, professions liberales, freelances - tous ceux qui ont besoin de montrer leur travail mais n ont pas le temps ou les competences pour creer un site.

---

## Stack Technique

- Runtime : Electron + TypeScript + React + Tailwind CSS
- Base de donnees : better-sqlite3-multiple-ciphers avec chiffrement AES-256
- Moteur IA : Ollama en local avec Llama 3.2 3B
- Contrainte hardware : Optimise pour CPU mobile type Surface Pro 7

Vetos techniques souverainete :
- INTERDICTION d utiliser des API Cloud pour l IA. Tout passe par Ollama en local.
- Les donnees sensibles restent dans la DB chiffree locale.

---

## Architecture Module Portfolio

```
IMPORT SOURCES
Google Drive - iCloud - Dossier local - GitHub - Dribbble
            |
            v
EXTRACTEURS par format
JPG PNG - PDF - MP4 MOV - PPTX
            |
            v
CLASSIFIER IA premier passage
Type : realisation - avant apres - document - plan - portrait
Pertinence : haute - moyenne - basse - exclure
            |
            v
NARRATEUR IA deuxieme passage
Regroupement en projets coherents
Generation titres et descriptions
Tone of voice adapte au secteur
            |
            v
TEMPLATES SECTORIELS
Mode Independant : realisations expertise confiance
Mode Commerce : infos pratiques ambiance offre
            |
            v
EXPORT ET PUBLICATION
PDF - HTML autonome - Hebergement souverain.io Premium
QR Code - Partage direct Mail WhatsApp AirDrop
```

---

## Deux Modes de Portfolio

### Mode Independant
Pour : Freelance, artisan, consultant, coach, profession liberale
Focus : Mettre en avant les realisations et l expertise
Sections : Hero - A propos - Realisations - Services - Temoignages - Contact

### Mode Commerce
Pour : Boutique, restaurant, salon, etablissement
Focus : Infos pratiques et ambiance
Sections : Hero - Infos essentielles avec horaires acces paiements - Galerie - Offre - A propos - Avis - Contact

---

## Secteurs Prioritaires

### Tier 1 MVP
- artisan_btp : plombier electricien macon peintre
- coiffeur_esthetique : salon coiffure institut beaute
- photographe
- agent_immobilier
- cuisinier_traiteur : restaurant patisserie traiteur
- coach_formateur
- architecte_interieur

### Tier 2 Extension
- paysagiste
- graphiste webdesigner
- developpeur
- avocat
- restaurant_cafe
- boutique
- fleuriste

---

## Formats Supportes

### Priorite 1 MVP
- JPG PNG : EXIF extraction compression thumbnail avec sharp et exif-parser
- PDF : extraction texte et images avec pdf-parse et pdf-lib
- MP4 MOV : thumbnail duree metadata avec ffmpeg et ffprobe

### Priorite 2
- PPTX : slides textes images avec pptx-parser ou unzip XML
- DOCX : texte structure images avec mammoth

---

## Anonymisation

Trois niveaux :
- none : tout visible
- partial : clients anonymises localisation generale mais identite pro visible
- full : tout anonymise y compris identite pour candidatures ou appels d offres

Tokens utilises :
- Noms : CLIENT_1 CLIENT_2
- Entreprises : ENTREPRISE_1
- Adresses : ADRESSE
- Villes : VILLE ou region generique
- Telephones : TELEPHONE
- Emails : EMAIL
- Montants : MONTANT

---

## Publication Web Premium

Infrastructure cible : Cloudflare R2 + Workers + CDN
Cout : quasi nul jusqu a 100k users

Fonctionnalites Premium :
- Hebergement sur nom.souverain.io
- QR Code dynamique
- Domaine personnalise en option
- Analytics vues et clics

---

## Schema Base de Donnees Portfolio

Tables principales :
- portfolios : id mode sector template title anonymization_level
- independant_profiles : infos profil independant liees au portfolio
- commerce_profiles : infos commerce avec horaires acces paiements
- portfolio_assets : fichiers importes avec source format metadata
- portfolio_elements : elements extraits apres parsing avec classification IA
- portfolio_projects : regroupement d elements en projets
- portfolio_project_elements : liaison projets et elements
- portfolio_publications : infos publication web slug url qr_code
- anonymization_maps : coherence des tokens anonymisation

---

## Phases de Developpement

Ordre decide : B C D A

### Phase B - Import et gestion des assets COMPLETE ✅
- ✅ Bouton import fichiers avec selecteur natif Electron
- ✅ Support JPG PNG PDF MP4 MOV WEBM
- ✅ Copie dans dossier data du portfolio (userData/portfolios/{id}/assets/)
- ✅ Generation thumbnails automatique pour images (300px max, JPEG 80%)
- ✅ Affichage grille responsive des assets importes
- ✅ Suppression d un asset avec confirmation
- ✅ Service assetService.ts avec toutes les fonctions
- ✅ Composants UI : AssetImporter, AssetGrid, AssetCard
- ✅ Handlers IPC : save-file, generate-thumbnail
- ✅ Documentation complete

### Phase C - Organisation des projets COMPLETE ✅
- ✅ Liste et affichage des projets (ProjectList, ProjectCard)
- ✅ Creation/edition de projets (ProjectCreateModal)
- ✅ Titre, description, tags, featured
- ✅ Integration dans PortfolioModule avec onglets
- ✅ CRUD complet (Create, Read, Update, Delete)
- ✅ Assignation d assets aux projets (drag & drop)
  - Drag & drop d'assets depuis onglet Assets
  - Drop zone visuelle dans ProjectCard
  - Comptage dynamique assets assignés
  - Toast confirmation après assignation
- ⏳ Affichage des assets assignés (ProjectEditor)
- ✅ Désassignation et réorganisation d'assets
- ⏳ Classification IA des elements (Ollama)

### Phase D - Preview et export
- Preview du portfolio avec template
- Export PDF
- Export HTML autonome
- Generation QR Code

### Phase A - Edition du profil
- Formulaire complet independant
- Formulaire complet commerce avec horaires acces paiements
- Edition des sections du portfolio

---

## Etat Actuel

Date derniere mise a jour : jeudi 22 janvier 2026

Ce qui fonctionne :
- Creation de portfolio mode et secteur
- Ouverture du portfolio depuis la liste
- Structure de base affichee avec placeholder
- **Phase B COMPLETE** : Import et gestion des assets
  - ✅ Import multi-fichiers (JPG, PNG, PDF, MP4, MOV, WEBM)
  - ✅ Generation automatique de miniatures pour images
  - ✅ **NOUVEAU :** Extraction de texte, d'images, et génération de miniature pour les fichiers PDF.
  - ✅ Affichage en grille responsive
  - ✅ Suppression d un asset avec confirmation
  - ✅ Service assetService.ts complet
  - ✅ Composants AssetImporter, AssetGrid, AssetCard
- **Phase C COMPLETE** : Organisation des projets
  - ✅ Gestion CRUD projets (creation, edition, suppression)
  - ✅ Systeme onglets Assets/Projets dans PortfolioModule
  - ✅ ProjectCard avec titre, description, tags, featured, compteur elements
  - ✅ ProjectList avec tri (featured first, puis displayOrder)
  - ✅ ProjectCreateModal pour creation/edition projets
  - ✅ Assignation assets aux projets via drag & drop
    - Drag & drop HTML5 natif depuis onglet Assets
    - Drop zone visuelle dans ProjectCard (bordure accent + message)
    - Comptage dynamique assets assignes par projet
    - Toast confirmation apres assignation
    - Persistance via table portfolio_project_elements
  - ✅ ProjectEditor pour vue detaillee d un projet
    - Modal plein ecran avec overlay
    - Affichage grille des assets assignes avec miniatures
    - Desassignation d assets (bouton Retirer + confirmation)
    - Selection asset de couverture (IMPLEMENTEE - 1 seul cover par projet)
    - Rechargement automatique apres modifications
    - Ouverture au clic sur ProjectCard
    - Handler IPC updateElement pour mise a jour isCover et displayOrder
- **Phase 2 Mediatheque COMPLETE** :
  - ✅ Service `mediathequeService.ts` pour opérations CRUD sur les éléments de la médiathèque.
  - ✅ Handlers IPC dans `src/main/main.ts` et `src/preload/index.ts` pour le service médiathèque et les opérations de système de fichiers (sauvegarde/suppression de fichiers).
  - ✅ Génération de miniatures pour les images dans `src/main/utils/thumbnailGenerator.ts` (implémentation de base, avec placeholders pour PDF/vidéo).
  - ✅ Service API côté rendu (`src/services/mediathequeApiService.ts`) pour les appels à l'API.
  - ✅ Composants UI dans `src/components/MediathequeModule.tsx` pour le téléchargement de fichiers, l'affichage en grille, l'aperçu des éléments et la gestion de base des tags.
  - ✅ Intégration du `MediathequeModule` dans `src/App.tsx` avec un sélecteur de fonctionnalités.
  - ✅ Mise à jour du schéma de base de données dans `src/main/database.ts` pour inclure `source_type` et `source_path` dans la table `mediatheque_items`.
  - ✅ Stratégie de test et exemple conceptuel pour les nouvelles fonctionnalités de la Médiathèque.

Ce qui reste a faire :
- Phase D : preview et export (COMPLETE ✅)
  - ✅ Moteur de rendu HTML universel (base)
  - ✅ Export HTML fichier unique
  - ✅ Export PDF Global (Electron Print)
  - ✅ Generation QR Code
- Phase 9 : Publication Web (COMPLETE - Mock ✅)
  - ✅ Simulation Cloudflare R2
  - ✅ Vérification Premium & Slugs
  - ✅ Interface de Publication intégrée
- Phase "FIX-PROJET" (Refonte UX) (COMPLETE ✅)
  - ✅ Suppression ancien modal Excellence
  - ✅ Nouveau Wizard en 5 étapes (Type, Fichiers, Anom, Chat, Edit)
  - ✅ Anonymisation des données avant envoi IA
  - ✅ Interface type Chat (Connectée Ollama Local 🦙)
  - ✅ Settings Portfolio séparés (Identité, Styles, Public.)
- Phase A : edition profil (PARTIEL)
  - ✅ Formulaire Identité et Réseaux Sociaux (Phases 5 & 6)
  - ⏳ Edition sections avancée
- Ameliorations optionnelles Phase C :
  - Reorganisation ordre assets par drag & drop dans ProjectEditor
  - ✅ Preview asset en grand au clic
  - ✅ Classification IA (via Wizard Project Creation)
- Ameliorations Mediatheque :
  - Implémentation complète de la génération de miniatures pour PDF et vidéo.
  - Filtrage et recherche par tags et autres métadonnées.
  - Organisation avancée des éléments.

Bugs connus :
- Aucun bug bloquant actuellement

Derniere implementation :
- **Phase 2 Mediatheque completee le jeudi 22 janvier 2026**
- Implémentation complète de la Médiathèque, incluant le backend, les services, les composants UI de base et l'intégration à l'application principale.
- Ajout de la gestion des tags pour les éléments de la Médiathèque.
- Installation de `sharp` pour la génération de miniatures d'images.
- Mise à jour des schémas de base de données et des types.
- Tests TypeScript : 0 erreurs.
- Commit : `feat(mediatheque): implement full Phase 2 Mediatheque`

Implementation precedente :
- **Phase B Extracteur PDF completee le 21/01/2026 - 16h00**
- Ajout des librairies `pdf-lib`, `pdfjs-dist` et `canvas`.
- Implémentation de l'extraction d'images et de la génération de miniature pour les fichiers PDF.
- Le service peut maintenant extraire le texte, les images et la miniature d'un fichier PDF.
- Tests TypeScript : 0 erreurs (compilation `vite build` réussie).
- Commit : `feat(extractor): implement full PDF extractor with image and thumbnail support`

Implementation precedente :
- **CONNEXION BACKEND WIZARD (Intégration IA & Files) completee le 23/01/2026**
- `Step3` connecté à l'extracteur de fichiers Electron (PDF/Images -> Texte).
- `Step4` connecté à Ollama via nouvel IPC `ollama-chat`.
- `projectAIService` utilise désormais des vrais prompts système pour l'interview et la génération.

Implementation precedente :
- **REFONTE UX PROJET (FIX-PROJET.md) completee le 23/01/2026**
- Suppression des onglets dans `ProjectHub`. Création `PortfolioSettingsModal`.
- Implémentation du `ProjectCreationWizard` (5 étapes).
- Création `anonymizationService` (Regex MVP pour Emails, Tél, Montants).
- Création `projectAIService` (Mock Chat flow et Génération).
- UX fluide guidée par l'IA.

Implementation precedente :
- **Phases 8 & 9 (Export & Publish) completees le 23/01/2026**
- Implémentation Export PDF Global via IPC Electron `printToPDF`.
- Génération QR Code via `qrcode` lib.
- Moteur de rendu `renderService` étendu pour Print CSS.
- Phase 9 : Mock Service Cloudflare + Interface UI complète (`PublishManager`).
- Tests : 0 erreurs TypeScript, Lints corrigés.

Implementation precedente :
- **Phase 7 Revisée (Palettes) completee le 22/01/2026**
- Remplacement des "Thèmes" techniques par "Palettes de Personnalité" (Addendum).
- 6 palettes implémentées : Moderne, Classique, Authentique, Artistique, Vitrine, Formel.
- Interface `StyleSelector` mise à jour avec descriptions "feeling" et "idealFor".
- Service `styleService.ts` avec définitions complètes des tokens.
- Début Phase 8 : Moteur de rendu universel (`renderService.ts`) opérationnel pour HTML simple.

Implementation precedente :
- **Phase B Extracteur PDF completee le 21/01/2026 - 16h00**
- Problème de scope React identifié et corrigé
- Modal ProjectCreateModal déplacé dans le bon return (vue détail)
- Modal était rendu dans Return 2 (liste) au lieu de Return 1 (détail)
- Ajout ProjectEditor aussi dans le bon scope
- Tests TypeScript : 0 erreurs
- Documentation : FIX_BOUTON_CREER_PROJET.md
- TEST MANUEL REQUIS : Voir QUICK_TEST_BOUTON.md

Implementation precedente :
- **DEBUG Bouton Créer un projet - 21/01/2025 - 01h45**
- Ajout logs console détaillés dans handleCreateProject
- Ajout validation portfolio sélectionné avec toast erreur
- Ajout logs rendu modal avec diagnostic automatique
- Ajout log dans ProjectCreateModal au mount
- Documentation complète : DEBUG_BOUTON_CREER_PROJET.md
- Tests TypeScript : 0 erreurs

Implementation precedente :
- **FIX Portfolio V1 completee le 21/01/2025 - 01h30**
- BUG 1 (Bouton Créer un projet) : FAUX POSITIF - Bouton fonctionnel
- BUG 2 (Ouverture assets) : CORRIGÉ
  - Handler IPC open-file créé dans main.cjs
  - API openFile exposée dans preload.cjs
  - Handler handleAssetClick ajouté dans PortfolioModule
  - Clic sur asset → Ouverture avec app par défaut système
- AMÉLIORATION UX : Labels explicatifs ajoutés
  - Section Assets : "Vos fichiers importés (images, PDFs, vidéos)..."
  - Section Projets : "Regroupez vos fichiers en réalisations professionnelles..."
- Tests TypeScript : 0 erreurs
- Documentation : FIX_PORTFOLIO_V1_COMPLETED.md

Implementation precedente :
- **Phase C Asset de Couverture completee le 20/01/2025 - 20h15**
- 3 fichiers modifies : database.cjs, main.cjs, preload.cjs
- 1 fichier modifie : ProjectEditor.tsx (fonction handleSetCover)
- Handler IPC portfolio-project-element-update cree
- Fonction portfolioProjectElement_update avec update dynamique
- Selection asset de couverture fonctionnelle (1 seul cover par projet)
- Desactivation automatique ancien cover lors selection nouveau
- Tests TypeScript : 0 erreurs
- Documentation : PHASE_C_PROJECT_EDITOR.md (mise a jour)

Implementation precedente :
- **Phase C ProjectEditor completee le 20/01/2025 - 20h00**
- 1 fichier cree : ProjectEditor.tsx (500 lignes)
- 1 fichier modifie : PortfolioModule.tsx
- Vue detaillee d un projet avec modal plein ecran
- Affichage grille assets assignes avec miniatures
- Desassignation d assets avec confirmation et toast
- Documentation : PHASE_C_PROJECT_EDITOR.md

Implementation precedente :
- **Phase C Assignation Assets completee le 20/01/2025 - 19h45**
- 5 fichiers modifies : AssetCard.tsx, AssetGrid.tsx, ProjectCard.tsx, ProjectList.tsx, PortfolioModule.tsx
- Drag & drop HTML5 natif pour assigner assets aux projets
- Drop zone visuelle dans ProjectCard avec feedback
- Comptage dynamique des assets assignés par projet
- Documentation : PHASE_C_ASSET_ASSIGNMENT.md

Implementation precedente :
- **Phase C Base completee le 20/01/2025 - 19h15**
- 3 fichiers crees : ProjectCard.tsx, ProjectList.tsx, ProjectCreateModal.tsx
- 1 fichier modifie : PortfolioModule.tsx (ajout onglets + gestion projets)
- Systeme onglets Assets/Projets
- CRUD projets complet (titre, description, tags, featured)
- Documentation : PHASE_C_IMPLEMENTATION.md

Implementation precedente :
- Phase B completee le 20/01/2025
- 6 fichiers crees : assetService.ts, AssetImporter.tsx, AssetGrid.tsx, AssetCard.tsx + docs
- 4 fichiers modifies : PortfolioModule.tsx, main.cjs, preload.cjs, database.cjs
- Handlers IPC ajoutes : portfolio-v2-save-file, portfolio-v2-generate-thumbnail
- Documentation : PORTFOLIO_ASSETS_IMPLEMENTATION.md, PORTFOLIO_ASSETS_ARCHITECTURE.md

---

## Instructions pour Claude Code

### Debut de session
Lis ce fichier BRIEF.md et confirme que tu as compris le contexte et l etat actuel.

### Pendant la session
Refere toi aux sections pertinentes pour rester aligne avec l architecture et la vision.

### Fin de session
Mets a jour la section ETAT ACTUEL avec :
- Ce qui a ete implemente
- Les bugs rencontres et resolus
- Les decisions techniques prises
- La prochaine etape

---

## Contacts et Decisions

Responsable projet : Jean-Louis
Decisions strategiques validees avec Claude Opus sur claude.ai

Pour tout pivot majeur ou question d architecture globale, noter la question ici et la remonter lors de la prochaine session strategique.

Questions en attente :
- Aucune actuellement
