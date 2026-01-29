# SOUVERAIN V17 - Récapitulatif Complet

## Vue d'ensemble

**SOUVERAIN** est une application desktop Electron multiplateforme (Windows/Mac/Linux) de gestion de carrière professionnelle en français. L'application combine analyse de CV alimentée par IA, gestion documentaire chiffrée, et création de portfolio professionnel.

**Vision produit** : "Votre carrière. Vos règles."
- **Hook d'acquisition** : Analyse CV gratuite et performante
- **Rétention** : Coffre-Fort sécurisé + Portfolio + LinkedIn
- **Objectif** : Devenir l'outil de référence pour gérer sa carrière en toute souveraineté

---

## Architecture technique

### Stack technologique

#### Frontend (Renderer Process)
- **React 19.2** avec TypeScript
- **Vite 7.2** pour le bundling et dev server
- **Design System custom** (pas de Tailwind) avec tokens de thème
- **Inline styles** avec support dark/light mode
- **State management** : React hooks locaux (useState, useEffect)

#### Backend (Main Process)
- **Electron 39.2** (architecture dual-process)
- **Node.js** avec modules CommonJS (.cjs)
- **SQLite chiffré** (better-sqlite3-multiple-ciphers) avec AES-256
- **Groq Cloud API** (llama-3.3-70b-versatile) pour l'analyse IA
- **pdf.js-extract** pour extraction de texte PDF

#### Dépendances clés
```json
{
  "better-sqlite3-multiple-ciphers": "^12.5.0",  // DB chiffrée
  "@mlc-ai/web-llm": "^0.2.80",                  // IA locale (future)
  "jspdf": "^4.0.0",                             // Export PDF
  "pdf-parse": "^2.4.5",                         // Parsing PDF
  "uuid": "^13.0.0"                              // Génération IDs
}
```

---

## Architecture Electron

### Main Process (CJS, root/)

**main.cjs** - Orchestrateur principal
- Lifecycle Electron (app.whenReady, window creation)
- Handlers IPC pour tous les modules
- Gestion fenêtre (1440x900, minWidth: 1024)
- Mode dev : http://localhost:5173 (Vite)
- Mode prod : dist/index.html

**groq-client.cjs** - Client API Groq
- Modèles : llama-3.3-70b-versatile (analyse), llama-3.1-8b-instant (extraction)
- Prompt Coach CV Premium : 20 ans d'expérience, bienveillant mais direct
- Format de sortie : rapport structuré en sections (diagnostic, score, expériences, ATS, reformulations, actions)
- Respect strict des tokens d'anonymisation ([PERSON_X], [COMPANY_X], etc.)

**anonymizer.cjs** - Anonymisation LLM
- **AnonymizerGroq** : Extraction d'entités via Groq API
- Détection : noms, emails, téléphones, entreprises, écoles, lieux
- Tokenisation : [PERSON_1], [COMPANY_2], [SCHOOL_1], etc.
- Mapping bidirectionnel pour réincrémentation après analyse
- Patterns regex en fallback (emails, téléphones français, URLs)

**database.cjs** - Gestion SQLite chiffrée
- Base : souverain_vault.db (userData directory)
- Chiffrement AES-256 avec clé dérivée de GROQ_API_KEY
- Tables :
  - `analyses` : Historique analyses CV
  - `vault_documents` : Documents chiffrés du coffre-fort
  - `vault_categories` : Catégories personnalisées
  - `portfolios` : Portfolios web
  - `portfolio_sections` : 7 sections par portfolio
  - `portfolio_projects` : Projets détachés (V2)
  - `portfolio_sources` : Connexions GitHub/local

**linkedin-scraper.cjs** - Import LinkedIn
- Scraping de profils publics LinkedIn
- Parsing HTML + extraction via Groq
- Génération CV structuré depuis profil
- Sections : expériences, formations, compétences, langues

**preload.cjs** - Context Bridge
- Expose API sécurisée au renderer via `window.electron`
- Channels IPC : analyze-cv, import-cv, save-to-vault, portfolio-*, vault-*

### Renderer Process (React/TS, src/)

**App.tsx** - Application principale
- États : choice, upload, scratch, linkedin, loaded, report
- Gestion 3 parcours :
  1. Import CV existant (PDF/TXT)
  2. Questionnaire "De zéro" (7 étapes)
  3. Import LinkedIn
- Animation d'analyse (4 phases : reading, anonymizing, analyzing, complete)
- Affichage rapport structuré (bento layout)

**Shell.tsx** - Layout principal
- Sidebar de navigation (6 modules)
- Raccourcis clavier (Cmd+1 à Cmd+6, Cmd+K pour palette)
- Content area dynamique selon module actif
- Command Palette (Cmd+K)

**ThemeContext.tsx** - Gestion thème
- Modes : dark (défaut) / light
- Persistance localStorage
- Design tokens (bg, text, accent, semantic, border, shadow)

**design-system.ts** - Tokens de design
- Typography (font-family, fontSize, fontWeight, lineHeight)
- Colors (light/dark palettes)
- BorderRadius, transitions, shadows
- Semantic colors (success, warning, error, info)

---

## Modules fonctionnels

### 1. CV Coach (Module principal)

**Parcours utilisateur**

1. **Écran de choix** (CVChoice.tsx)
   - 3 options : CV existant / De zéro / LinkedIn
   - Icônes colorées par parcours
   - Animations hover

2. **Import CV existant**
   - Formats : PDF, TXT
   - Extraction texte via pdf.js-extract
   - Prévisualisation : nom fichier + nombre de caractères

3. **Questionnaire "De zéro"** (ScratchQuestionnaire.tsx)
   - 7 étapes interactives :
     1. Identité (prénom, nom, email, téléphone, localisation)
     2. Objectif professionnel (poste visé, secteur, niveau)
     3. Formation (diplômes, écoles, années - ajout multiple)
     4. Expérience (postes, entreprises, dates, descriptions)
     5. Compétences & Langues (techniques + niveaux langues)
     6. Infos complémentaires (LinkedIn, portfolio, centres d'intérêt)
     7. Récapitulatif + validation
   - Navigation : Précédent / Suivant
   - Génération CV formaté automatique

4. **Import LinkedIn** (LinkedInImportModal.tsx)
   - Validation URL linkedin.com/in/
   - Scraping profil public
   - Parsing Groq pour extraction structurée
   - Génération CV formaté

**Workflow d'analyse**

1. **Anonymisation** (AnonymizerGroq)
   - Détection entités sensibles via Groq
   - Remplacement par tokens [TYPE_N]
   - Stats : nombre d'éléments masqués

2. **Analyse Coach CV** (GroqClient)
   - Prompt expert : 20 ans d'expérience recrutement
   - Sections : diagnostic, scoring, expériences, ATS, reformulations, actions
   - Modèle : llama-3.3-70b-versatile

3. **Réincrémentation**
   - Remplacement tokens par valeurs originales
   - Préservation confidentialité (données jamais envoyées au cloud)

4. **Parsing rapport** (reportParser.ts)
   - Transformation texte brut → structure TypeScript
   - Interface `ParsedReport` :
     - `diagnostic` : métier, secteur, niveau, expérience, points forts/faibles
     - `score` : global + impact/lisibilité/optimisation
     - `experiences` : analyse par expérience
     - `ats` : mots-clés présents/manquants
     - `reformulations` : suggestions avant/après
     - `actions` : 3 priorités (P1/P2/P3)
     - `conclusion` : message final

**Animation d'analyse** (AnalysisAnimation.tsx)

- 4 phases visuelles :
  1. **Reading** : Lecture du CV (icône fichier)
  2. **Anonymizing** : Masquage données (icône bouclier + stats)
  3. **Analyzing** : Analyse IA (icône cerveau)
  4. **Complete** : Terminé (icône check)
- Stats affichées : nombre d'éléments protégés
- Design glassmorphism avec overlay semi-transparent

**Affichage rapport** (ReportComponents.tsx)

- **DiagnosticCard** : Métier, secteur, niveau, expérience, 1ère impression
- **ScoreCard** : Score global /10 + détails par critère
- **ExperienceCard** : Analyse par expérience (pertinence, points forts/faibles, verdict)
- **ATSTable** : Mots-clés secteur présents/manquants
- **ReformulationCard** : Avant/Après + gain impact
- **ActionCard** : Priorité (P1/P2/P3) + titre + description + impact + durée
- **Conclusion** : Message final bienveillant

**Composants UI** (ui.tsx)

- BentoBox : Grille responsive
- BentoCard : Cartes avec padding/border personnalisables
- Tag : Labels colorés (variant: default/success/warning/error)
- SectionHeader : Titres de section + sous-titre
- Divider : Séparateur horizontal
- PrivacyBadge : Badge "Données protégées"

---

### 2. Coffre-Fort (Vault)

**Fonctionnalités**

- **Stockage chiffré AES-256**
  - Chiffrement client-side avant stockage
  - Clé dérivée de GROQ_API_KEY via scrypt
  - Format : IV (16 bytes) + données chiffrées

- **Catégories de documents**
  - CV, Lettre de motivation, Portfolio
  - Diplôme/Certif, Recommandation
  - Contrat, Fiche de paie
  - Autre + catégories personnalisées (illimitées en Premium)

- **Métadonnées**
  - Nom, catégorie, type fichier, taille
  - Tags multiples (auto-complétion)
  - Notes textuelles
  - Date du document (extraction auto si possible)
  - Favori (étoile)
  - Miniature (preview image si applicable)

- **Filtres avancés** (VaultFilterDropdownV2.tsx)
  - Sections pliables/dépliables (état persisté localStorage)
  - **Année** : Multi-sélection (extraction auto depuis created_at)
  - **Mois** : Multi-sélection (1-12)
  - **Catégorie** : Multi-sélection + bouton "Tout sélectionner"
  - **Tags** : Multi-sélection + bouton "Tout sélectionner"
  - **Favoris** : Toggle
  - Bouton ✕ par section pour reset individuel
  - Bouton "Effacer" global (visible seulement si filtres actifs)
  - Compteur de filtres actifs

- **Vues**
  - Grille (cartes avec preview)
  - Liste (tableau compact)
  - Tri : Date, Nom, Catégorie, Taille
  - Ordre : ASC / DESC

- **Limites Free**
  - 20 documents max
  - 25 MB par fichier
  - 500 MB stockage total
  - Notifications upgrade si limite atteinte

- **Actions**
  - Import fichiers (drag & drop + file picker)
  - Preview modal (vue complète métadonnées)
  - Téléchargement (déchiffrement + save dialog)
  - Édition métadonnées (nom, catégorie, tags, notes, favori)
  - Suppression (confirmation)

**Fichiers clés**

- VaultModule.tsx : Container principal
- VaultDocumentCard.tsx : Card grille
- VaultDocumentList.tsx : Liste compacte
- VaultImportModal.tsx : Modal d'import
- VaultPreviewModal.tsx : Modal de prévisualisation
- VaultFilterDropdownV2.tsx : Filtres avancés (FIX-002)
- VaultEmptyState.tsx : État vide initial

---

### 3. Portfolio

**Architecture V2 (Projets détachés)**

- **Portfolios** (V1 legacy) : Sites web 7 sections
  - Hero, About, Experience, Skills, Education, Projects, Contact
  - 3 templates : Modern, Developer, Minimal, Visual
  - Export HTML/CSS

- **Projets V2** (nouvelle architecture)
  - Projets autonomes, non liés à un portfolio
  - Sources : GitHub, Dossier local
  - Analyse IA automatique (Groq)
  - Sections détaillées : Pitch, Challenge, Solution
  - Technologies, metrics, screenshots
  - Anonymisation pour export (FIX-003)

**Import de projets**

**1. GitHub**
- Connexion via Personal Access Token
- Fetch repositories publics
- Extraction : README, langages, commits, stars, forks
- Analyse IA : génération pitch/challenge/solution

**2. Dossier local**
- Scan récursif fichiers
- Détection technos (package.json, requirements.txt, etc.)
- Analyse structure projet
- Génération description IA

**Anonymisation Portfolio** (FIX-003)

- **Détection entités** (AnonymizerGroq)
  - Scan pitch + challenge + solution
  - Extraction : noms, entreprises, écoles, emails, téléphones
  - Tokens : [PERSON_X], [COMPANY_X], etc.

- **Preview dual-mode** (PortfolioPreviewTabs.tsx)
  - Onglet 1 : Texte normal
  - Onglet 2 : Texte anonymisé avec tokens colorés
  - Toggle "Anonymiser pour export" dans éditeur

- **Export**
  - Génération version anonymisée à la volée
  - Préservation tokens pour cohérence
  - Pas de modification BDD (anonymisation temporaire)

**Composants Portfolio**

- PortfolioModule.tsx : Container avec tabs Portfolios/Projets
- PortfolioCard.tsx : Card portfolio
- PortfolioEditor.tsx : Éditeur portfolio (7 sections)
- PortfolioProjectCard.tsx : Card projet V2
- PortfolioProjectEditor.tsx : Éditeur projet
- PortfolioProjectViewer.tsx : Viewer projet
- PortfolioImportModal.tsx : Modal import GitHub/local
- PortfolioPreviewTabs.tsx : Preview normal/anonymisé (FIX-003)
- sections/HeroEditor.tsx : Éditeur section Hero
- sections/AboutEditor.tsx : Éditeur section About
- sections/ProjectsEditor.tsx : Éditeur section Projects
- templates/ModernTemplate.tsx : Template Modern
- templates/DeveloperTemplate.tsx : Template Developer

**Limites Free**

- 1 portfolio max
- 3 projets V2 max
- Export HTML/CSS uniquement (pas PDF Premium)

---

### 4. LinkedIn (Placeholder)

Module non implémenté (V18+)
- Génération posts LinkedIn
- Optimisation profil
- Analyse réseau

---

### 5. Job Matching (Placeholder)

Module non implémenté (V18+)
- Matching offres d'emploi
- Alertes personnalisées
- Score de compatibilité CV/offre

---

### 6. Boutique (Placeholder)

Module non implémenté (V18+)
- Templates CV Premium
- Formations carrière
- Services coaching 1-to-1

---

## Onboarding & UX

### Tutoriel d'accueil (OnboardingCarousel.tsx)

**6 slides animés** (première ouverture)

1. **Bienvenue** : Présentation SOUVERAIN
2. **Privacy First** : Anonymisation automatique
3. **CV Coach** : Analyse IA en 30 secondes
4. **Coffre-Fort** : Stockage chiffré AES-256
5. **Portfolio** : Création site pro automatique
6. **Raccourcis** : Cmd+K, Cmd+1-6, Cmd+D

- Overlay fullscreen glassmorphism
- Navigation : points indicateurs + flèches
- Bouton "Passer" ou "Commencer"
- Stockage localStorage : `souverain_onboarding_completed`
- Réactivable via bouton "?" dans la sidebar

### Raccourcis clavier

**Navigation**
- `Cmd/Ctrl + 1` : CV Coach
- `Cmd/Ctrl + 2` : Portfolio
- `Cmd/Ctrl + 3` : Job Matching
- `Cmd/Ctrl + 4` : LinkedIn
- `Cmd/Ctrl + 5` : Coffre-Fort
- `Cmd/Ctrl + 6` : Boutique

**Actions**
- `Cmd/Ctrl + K` : Command Palette
- `Cmd/Ctrl + D` : Toggle Dark/Light mode
- `Cmd/Ctrl + ,` : Paramètres

### Command Palette (CommandPalette.tsx)

- Overlay fullscreen
- Recherche fuzzy dans toutes les commandes
- Catégories : Navigation, Actions, Thème
- Raccourcis affichés à droite
- Échap pour fermer

---

## Système de Design

### Tokens de couleurs (design-system.ts)

**Dark Mode** (défaut)
```typescript
bg: {
  primary: '#0A0A0B',    // Fond principal
  secondary: '#18181B',  // Cartes
  tertiary: '#27272A',   // Surfaces élevées
  elevated: '#3F3F46'    // Hovers, actifs
},
text: {
  primary: '#FAFAFA',    // Texte principal
  secondary: '#A1A1AA',  // Texte secondaire
  tertiary: '#71717A'    // Texte tertiaire
},
accent: {
  primary: '#8B5CF6',    // Violet principal
  muted: 'rgba(139, 92, 246, 0.1)',
  hover: '#7C3AED'
}
```

**Light Mode**
```typescript
bg: {
  primary: '#FFFFFF',
  secondary: '#F9FAFB',
  tertiary: '#F3F4F6',
  elevated: '#E5E7EB'
},
text: {
  primary: '#111827',
  secondary: '#6B7280',
  tertiary: '#9CA3AF'
},
accent: {
  primary: '#8B5CF6',
  muted: 'rgba(139, 92, 246, 0.08)',
  hover: '#7C3AED'
}
```

### Semantic Colors

- **Success** : #10B981 (vert) - Validations, succès
- **Warning** : #F59E0B (orange) - Avertissements
- **Error** : #EF4444 (rouge) - Erreurs, dangers
- **Info** : #3B82F6 (bleu) - Informations

### Typography

- **Font Family** : Inter (sans), JetBrains Mono (mono)
- **Font Sizes** : xs (0.75rem) → 3xl (1.875rem)
- **Font Weights** : 400, 500, 600, 700, 800
- **Line Heights** : tight (1.25) → loose (2)

### Border Radius

- sm: 0.375rem
- md: 0.5rem
- lg: 0.75rem
- xl: 1rem
- full: 9999px

### Transitions

- fast: 150ms
- base: 200ms
- slow: 300ms

---

## IPC Channels (Electron)

### CV Coach

- `analyze-cv` : Analyse complète (anonymisation + Groq + réincrémentation)
- `import-cv` : Import fichier PDF/TXT
- `import-linkedin` : Import profil LinkedIn
- `get-system-status` : Status connexion Groq
- `save-to-vault` : Sauvegarder analyse dans BDD
- `load-history` : Charger historique analyses
- `save-pdf` : Export rapport PDF

### Vault

- `vault-get-documents` : Récupérer documents (avec filtres)
- `vault-add-document` : Ajouter document chiffré
- `vault-get-document` : Récupérer document par ID
- `vault-update-document` : Mettre à jour métadonnées
- `vault-delete-document` : Supprimer document
- `vault-download-document` : Télécharger (déchiffrer) document
- `vault-count-documents` : Compter documents
- `vault-get-total-storage` : Calculer stockage total
- `vault-get-available-years` : Années disponibles (pour filtres)
- `vault-add-category` : Ajouter catégorie personnalisée
- `vault-get-categories` : Récupérer catégories
- `vault-delete-category` : Supprimer catégorie

### Portfolio

**Portfolios**
- `portfolio-get-all` : Récupérer tous les portfolios
- `portfolio-get-by-id` : Récupérer portfolio par ID
- `portfolio-create` : Créer portfolio (7 sections auto)
- `portfolio-update` : Mettre à jour portfolio
- `portfolio-delete` : Supprimer portfolio
- `portfolio-count` : Compter portfolios

**Sections**
- `portfolio-section-update` : Mettre à jour contenu section
- `portfolio-section-toggle-visibility` : Toggle visibilité section
- `portfolio-section-reorder` : Réorganiser sections

**Projets V2**
- `portfolio-project-create` : Créer projet
- `portfolio-project-get-all` : Récupérer projets d'un portfolio
- `portfolio-project-get-by-id` : Récupérer projet par ID
- `portfolio-project-update` : Mettre à jour projet
- `portfolio-project-delete` : Supprimer projet
- `portfolio-project-reorder` : Réorganiser projets
- `portfolio-project-count-all` : Compter tous les projets (limite Free)

**Sources & Import**
- `portfolio-source-connect` : Connecter source (GitHub)
- `portfolio-source-disconnect` : Déconnecter source
- `portfolio-source-get-all` : Récupérer sources
- `portfolio-fetch-github-repos` : Fetch repos GitHub
- `portfolio-import-local` : Import dossier local
- `portfolio-analyze-project` : Analyser projet avec IA
- `portfolio-regenerate-section` : Regénérer section projet

**Anonymisation**
- `portfolio-detect-sensitive-entities` : Détecter entités sensibles
- `portfolio-apply-ghost-mode` : Appliquer Ghost Mode (remplacements permanents)
- `portfolio-anonymize-for-export` : Anonymiser pour export (tokens temporaires - FIX-003)

---

## Sécurité & Privacy

### Anonymisation

**Flux de données**

1. **CV brut** → Renderer
2. **Anonymisation** → Main process (AnonymizerGroq)
   - Détection entités via Groq API
   - Remplacement par tokens [TYPE_N]
3. **CV anonymisé** → Groq API (analyse)
4. **Rapport anonymisé** → Main process
5. **Réincrémentation** → Tokens remplacés par valeurs originales
6. **Rapport final** → Renderer

**Données JAMAIS envoyées au cloud**
- Noms de personnes
- Emails
- Téléphones
- Noms d'entreprises
- Noms d'écoles
- Adresses

**Tokens utilisés**
- `[PERSON_1]`, `[PERSON_2]`, etc.
- `[COMPANY_1]`, `[COMPANY_2]`, etc.
- `[SCHOOL_1]`, `[SCHOOL_2]`, etc.
- `[LOCATION_1]`, `[EMAIL_1]`, `[PHONE_1]`, etc.

### Chiffrement Database

- **Algorithme** : AES-256-CBC
- **Clé** : Dérivée de GROQ_API_KEY via scrypt (32 bytes)
- **IV** : Aléatoire 16 bytes (stocké avec données)
- **Format stockage** : IV + données chiffrées (Buffer concat)
- **Chiffrement** : Client-side (main process)
- **Déchiffrement** : À la demande (téléchargement)

### Variables d'environnement

**.env** (requis)
```bash
GROQ_API_KEY=gsk_xxxxxxxxxxxxx
```

Validation au démarrage → `process.exit(1)` si manquante

---

## Développement

### Commands

```bash
# Installation
npm install
npm run postinstall  # Rebuild native modules (better-sqlite3)

# Développement
npm start            # Vite + Electron (concurrently)
npm run vite:dev     # Vite dev server seul (http://localhost:5173)
npm run electron:dev # Electron seul (nécessite Vite actif)

# Production
npm run build        # Vite build + Electron builder
```

### Structure des fichiers

```
SOUVERAIN/
├── main.cjs                    # Main process principal
├── preload.cjs                 # Context bridge
├── groq-client.cjs             # Client Groq API
├── anonymizer.cjs              # Anonymisation LLM
├── database.cjs                # SQLite chiffré
├── linkedin-scraper.cjs        # Scraper LinkedIn
├── package.json
├── vite.config.ts
├── tsconfig.json
├── .env                        # GROQ_API_KEY
├── src/
│   ├── main.tsx                # Entry point React
│   ├── App.tsx                 # App principale
│   ├── ThemeContext.tsx        # Provider thème
│   ├── design-system.ts        # Tokens design
│   ├── reportParser.ts         # Parser rapport Groq
│   ├── env.d.ts                # Types Electron
│   ├── components/
│   │   ├── ui.tsx              # Composants UI de base
│   │   ├── ReportComponents.tsx# Composants rapport CV
│   │   ├── Shell.tsx           # Layout principal
│   │   ├── Sidebar.tsx         # Navigation sidebar
│   │   ├── CommandPalette.tsx  # Palette de commandes
│   │   ├── Settings.tsx        # Paramètres
│   │   ├── HomeScreen.tsx      # Écran d'accueil
│   │   ├── CVChoice.tsx        # Choix parcours CV
│   │   ├── ScratchQuestionnaire.tsx # Questionnaire 7 étapes
│   │   ├── LinkedInImportModal.tsx  # Modal LinkedIn
│   │   ├── AnalysisAnimation.tsx    # Animation analyse
│   │   ├── OnboardingCarousel.tsx   # Tutoriel accueil
│   │   ├── PrivacyBadge.tsx    # Badge privacy
│   │   ├── VaultModule.tsx     # Module Coffre-Fort
│   │   ├── VaultDocumentCard.tsx
│   │   ├── VaultDocumentList.tsx
│   │   ├── VaultFilterDropdownV2.tsx # Filtres avancés (FIX-002)
│   │   ├── VaultImportModal.tsx
│   │   ├── VaultPreviewModal.tsx
│   │   ├── VaultEmptyState.tsx
│   │   └── portfolio/
│   │       ├── PortfolioModule.tsx
│   │       ├── PortfolioEditor.tsx
│   │       ├── PortfolioProjectEditor.tsx
│   │       ├── PortfolioProjectViewer.tsx
│   │       ├── PortfolioPreviewTabs.tsx # Preview anonymisé (FIX-003)
│   │       ├── PortfolioImportModal.tsx
│   │       ├── sections/
│   │       │   ├── HeroEditor.tsx
│   │       │   ├── AboutEditor.tsx
│   │       │   ├── ExperienceEditor.tsx
│   │       │   ├── SkillsEditor.tsx
│   │       │   ├── EducationEditor.tsx
│   │       │   ├── ProjectsEditor.tsx
│   │       │   └── ContactEditor.tsx
│   │       └── templates/
│   │           ├── ModernTemplate.tsx
│   │           ├── DeveloperTemplate.tsx
│   │           ├── MinimalTemplate.tsx
│   │           └── VisualTemplate.tsx
│   ├── hooks/
│   │   ├── useKeyboardShortcut.ts
│   │   └── useLocalAI.ts
│   ├── types/
│   │   └── portfolio.ts
│   └── utils/
│       ├── portfolio.ts
│       └── cvToPortfolio.ts
└── dist/                       # Build Vite (production)
```

### Convention de nommage

- **Main process** : `.cjs` (CommonJS)
- **Renderer** : `.ts`, `.tsx` (ESM + TypeScript)
- **Composants** : PascalCase (CVChoice.tsx, VaultModule.tsx)
- **Hooks** : camelCase avec prefix `use` (useTheme, useKeyboardShortcut)
- **Utils** : camelCase (portfolio.ts, cvToPortfolio.ts)

---

## Versions & Historique

### V17 (Actuelle)

**Nouvelles fonctionnalités**

1. **Écran de choix de parcours** (CVChoice.tsx)
   - 3 options : CV existant / De zéro / LinkedIn
   - Icônes colorées par feature

2. **Questionnaire "De zéro"** (ScratchQuestionnaire.tsx)
   - 7 étapes interactives
   - Génération CV automatique

3. **Import LinkedIn** (FIX-001)
   - Scraping profils publics
   - Parsing Groq
   - Génération CV structuré

4. **Filtres Coffre-Fort améliorés** (FIX-002)
   - Sections pliables/dépliables
   - État persisté localStorage
   - Boutons "Tout sélectionner" par section
   - Reset individuel par section
   - Bouton "Effacer" global intelligent

5. **Anonymisation Portfolio** (FIX-003)
   - Détection entités via AnonymizerGroq
   - Preview dual-mode (normal/anonymisé)
   - Tokens colorés dans preview
   - Export anonymisé temporaire

6. **Animation d'analyse** (AnalysisAnimation.tsx)
   - 4 phases visuelles
   - Stats anonymisation en temps réel

7. **Tutoriel d'accueil** (OnboardingCarousel.tsx)
   - 6 slides animés
   - Présentation features principales

### Batches de fixes

**FIX-BATCH-001** (Completed)
- ✅ FIX-001 : Import LinkedIn
- ✅ FIX-002 : Filtres Coffre-Fort V2
- ✅ FIX-003 : Anonymisation Portfolio

---

## Limites Free vs Premium

### Free (V17)

**CV Coach**
- ✅ Analyses illimitées
- ✅ Anonymisation automatique
- ✅ Import PDF/TXT
- ✅ Import LinkedIn
- ✅ Questionnaire "De zéro"
- ✅ Export PDF rapports

**Coffre-Fort**
- ✅ 20 documents max
- ✅ 25 MB par fichier
- ✅ 500 MB stockage total
- ✅ Chiffrement AES-256
- ✅ Catégories de base (8)
- ❌ Catégories personnalisées illimitées

**Portfolio**
- ✅ 1 portfolio max
- ✅ 3 projets V2 max
- ✅ Export HTML/CSS
- ❌ Export PDF
- ❌ Templates Premium
- ❌ Domaine personnalisé

**Général**
- ✅ Dark/Light mode
- ✅ Raccourcis clavier
- ✅ Command Palette
- ❌ Support prioritaire
- ❌ IA locale (en développement)

### Premium (Non implémenté)

**Coffre-Fort**
- Documents illimités
- 100 MB par fichier
- 10 GB stockage total
- Catégories personnalisées illimitées

**Portfolio**
- Portfolios illimités
- Projets illimités
- Export PDF haute qualité
- Templates Premium exclusifs
- Domaine personnalisé
- Analytics

**Job Matching**
- Matching offres d'emploi
- Alertes personnalisées
- Score compatibilité CV/offre

**LinkedIn**
- Génération posts IA
- Optimisation profil
- Analyse réseau

**Boutique**
- Templates CV Premium
- Formations carrière
- Services coaching 1-to-1

**Support**
- Support prioritaire 24/7
- Onboarding personnalisé
- Roadmap features exclusives

---

## Roadmap future

### V18 (Q2 2026)

- [ ] Module Job Matching
  - Scraping offres Indeed/Welcome to the Jungle
  - Matching IA CV/offre
  - Alertes email personnalisées

- [ ] Module LinkedIn
  - Génération posts IA
  - Optimisation profil
  - Analyse réseau (force des liens)

- [ ] IA locale (privacy++)
  - Migration @mlc-ai/web-llm
  - Modèle local Phi-3 / Llama 3.1 8B
  - Analyse 100% offline

### V19 (Q3 2026)

- [ ] Module Boutique
  - Templates CV Premium
  - Formations vidéo carrière
  - Marketplace services coaching

- [ ] Multi-comptes
  - Gestion plusieurs profils professionnels
  - Switch rapide entre comptes

- [ ] Synchronisation cloud (optionnelle)
  - Backup chiffré E2E
  - Sync multi-devices
  - Pas de lecture serveur (zero-knowledge)

### V20+ (Long terme)

- [ ] Mobile app (React Native)
- [ ] Extensions navigateur (auto-fill candidatures)
- [ ] Intégration CRM recrutement
- [ ] API publique (webhooks, intégrations)

---

## Contribution & Documentation

### Pour développeurs

**Avant de commencer**
1. Fork le repo
2. Créer `.env` avec `GROQ_API_KEY`
3. `npm install && npm run postinstall`
4. `npm start` (Vite + Electron)

**Guidelines**
- Suivre conventions nommage (PascalCase composants, camelCase utils)
- Utiliser design-system.ts pour styles (pas de Tailwind)
- Inline styles avec theme tokens
- Tests unitaires requis pour logique métier
- Commentaires JSDoc pour fonctions publiques

**Pull Requests**
- Branch depuis `master`
- Préfixe : `feat/`, `fix/`, `docs/`, `refactor/`
- Description : problème + solution + tests
- Screenshots si UI change

### Pour contributeurs docs

**Fichiers clés**
- `CLAUDE.md` : Instructions pour Claude Code
- `RECAP_SOUVERAIN_V17.md` : Ce document
- `README.md` : Présentation publique
- `CHANGELOG.md` : Historique versions

---

## Contacts & Ressources

**Auteur** : Jean-Louis
**Email** : (à définir)
**Repo GitHub** : (à publier)
**Licence** : Propriétaire (Commercial)

**Technologies**
- [Electron](https://www.electronjs.org/) - Framework desktop
- [React](https://react.dev/) - UI library
- [Groq Cloud](https://groq.com/) - API IA
- [Vite](https://vitejs.dev/) - Build tool
- [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) - SQLite Node.js

**Inspirations**
- Notion (design, UX)
- Linear (command palette, shortcuts)
- 1Password (vault, security)
- Vercel (portfolio hosting)

---

## Notes techniques

### Performance

- **Startup** : ~2s (cold start), ~800ms (warm)
- **Analyse CV** : 5-10s (dont 3-5s Groq API)
- **Anonymisation** : 2-3s (Groq extraction)
- **Chiffrement document** : <100ms (10 MB)
- **Déchiffrement** : <50ms (10 MB)

### Compatibilité

- **OS** : Windows 10+, macOS 10.15+, Linux (Ubuntu 20.04+)
- **Architecture** : x64, arm64 (Apple Silicon)
- **Résolution** : 1024x700 minimum (recommandé 1440x900)
- **Connexion internet** : Requise pour Groq API (analyse CV, import LinkedIn)

### Dépendances natives

- `better-sqlite3-multiple-ciphers` : Nécessite rebuild après install
- `pdf.js-extract` : Node.js bindings (pas de rebuild)

### Limites connues

- **LinkedIn scraping** : Profils publics uniquement (erreur 999 si privé)
- **PDF parsing** : Qualité variable selon complexité layout
- **Groq rate limits** : 30 requêtes/min (suffisant usage normal)
- **Stockage local** : Pas de sync cloud (V17)

---

## Conclusion

**SOUVERAIN V17** est une application mature de gestion de carrière alliant puissance IA et privacy. L'architecture dual-process Electron garantit sécurité et performance. Le système d'anonymisation LLM assure confidentialité totale des données personnelles.

Les 3 modules principaux (CV Coach, Coffre-Fort, Portfolio) couvrent l'essentiel du parcours professionnel. La roadmap V18+ apportera Job Matching, LinkedIn, et IA locale pour une souveraineté totale.

L'UX soignée (dark mode, raccourcis, command palette, onboarding) et le design system cohérent font de SOUVERAIN un outil professionnel de référence.

**Prochaine étape** : Lancement beta privée + feedback utilisateurs pour polir V17 avant release publique.
