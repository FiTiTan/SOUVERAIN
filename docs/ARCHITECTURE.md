# ARCHITECTURE SOUVERAIN

**Version:** 2.0
**Date:** 28 janvier 2026
**Projet:** SOUVERAIN — Outil d'audit exécutif avec souveraineté des données

---

## 🎯 Vision

SOUVERAIN est une application desktop qui permet aux professionnels de gérer leur carrière (CV, portfolios, coaching LinkedIn, job matching) avec une **souveraineté totale sur leurs données**. Tout est stocké localement, l'IA est optionnelle et anonymisée.

---

## 🛠 Stack Technique

| Couche | Technologie | Version | Rôle |
|--------|-------------|---------|------|
| Runtime | Electron | 28+ | App desktop cross-platform |
| Frontend | React | 18+ | UI composants |
| Langage | TypeScript | 5+ | Typage statique |
| Styling | CSS-in-JS | - | Thèmes dynamiques (CALM-UI) |
| Animation | Framer Motion | 10+ | Animations fluides |
| Base de données | SQLite | 3 | Stockage local chiffré |
| Chiffrement | AES-256-GCM | - | Protection données sensibles |
| IA locale | Ollama | - | Anonymisation (Llama 3.2) |
| IA cloud | Groq API | - | Génération contenu (Llama 3.3 70B) |
| Traitement images | Sharp | 0.33+ | Redimensionnement, compression |
| PDF | pdf-lib | - | Génération/manipulation PDF |
| DOCX | docx | - | Génération documents Word |

---

## 📁 Structure des Dossiers

```
souverain/
├── src/
│   ├── main/                       # Process Electron (Node.js)
│   │   ├── main.cjs                # Point d'entrée Electron
│   │   ├── preload.cjs             # Bridge IPC sécurisé
│   │   ├── database/
│   │   │   ├── database.cjs        # Connexion SQLite
│   │   │   ├── migrations/         # Scripts de migration
│   │   │   └── schema.sql          # Schéma initial
│   │   ├── services/
│   │   │   ├── encryptionService.cjs
│   │   │   ├── ollamaService.cjs   # Anonymisation locale
│   │   │   ├── groqService.cjs     # Appels API Groq
│   │   │   ├── templateService.cjs # Gestion templates
│   │   │   └── imageService.cjs    # Traitement images (sharp)
│   │   └── handlers/
│   │       ├── dbHandlers.cjs      # IPC base de données
│   │       ├── aiHandlers.cjs      # IPC services IA
│   │       ├── fileHandlers.cjs    # IPC fichiers
│   │       └── templateHandlers.cjs
│   │
│   ├── renderer/                   # Process React (Browser)
│   │   ├── index.html
│   │   ├── index.tsx               # Point d'entrée React
│   │   ├── App.tsx                 # Router principal
│   │   ├── components/
│   │   │   ├── ui/                 # Composants CALM-UI
│   │   │   │   ├── CalmCard.tsx
│   │   │   │   ├── CalmModal.tsx
│   │   │   │   ├── GlassInput.tsx
│   │   │   │   ├── GlassTextArea.tsx
│   │   │   │   ├── NotificationToast.tsx
│   │   │   │   └── index.ts
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   └── MainLayout.tsx
│   │   │   ├── portfolio/          # Module Portfolio Maître
│   │   │   │   ├── wizard/
│   │   │   │   │   ├── PortfolioWizard.tsx
│   │   │   │   │   ├── Step1Identity.tsx
│   │   │   │   │   ├── Step2Offer.tsx
│   │   │   │   │   ├── Step3Contact.tsx
│   │   │   │   │   ├── Step4Content.tsx
│   │   │   │   │   ├── Step5Template.tsx
│   │   │   │   │   └── components/
│   │   │   │   │       ├── MediaUploader.tsx
│   │   │   │   │       ├── ProjectModal.tsx
│   │   │   │   │       ├── TestimonialModal.tsx
│   │   │   │   │       ├── TemplateGrid.tsx
│   │   │   │   │       ├── TemplateCard.tsx
│   │   │   │   │       └── TemplatePreviewModal.tsx
│   │   │   │   ├── generation/
│   │   │   │   │   ├── GenerationScreen.tsx
│   │   │   │   │   └── PreviewScreen.tsx
│   │   │   │   ├── editor/
│   │   │   │   │   ├── PortfolioEditor.tsx
│   │   │   │   │   └── SectionEditor.tsx
│   │   │   │   ├── export/
│   │   │   │   │   └── ExportScreen.tsx
│   │   │   │   └── PortfolioHub.tsx
│   │   │   ├── cv/                 # Module CV (BMAD)
│   │   │   ├── job-matching/       # Module Job Matching
│   │   │   ├── linkedin-coach/     # Module LinkedIn Coach
│   │   │   └── vault/              # Module Coffre-fort
│   │   ├── contexts/
│   │   │   ├── ThemeContext.tsx    # Thème CALM-UI
│   │   │   ├── AuthContext.tsx     # Authentification locale
│   │   │   └── ToastContext.tsx    # Notifications
│   │   ├── hooks/
│   │   │   ├── useDatabase.ts
│   │   │   ├── useGroq.ts
│   │   │   ├── useTemplates.ts
│   │   │   └── useImageProcessor.ts
│   │   ├── services/               # Services côté renderer
│   │   │   └── api.ts              # Wrapper IPC
│   │   ├── types/
│   │   │   ├── portfolio.ts
│   │   │   ├── template.ts
│   │   │   ├── cv.ts
│   │   │   └── common.ts
│   │   └── utils/
│   │       ├── formatting.ts
│   │       ├── validation.ts
│   │       └── constants.ts
│   │
│   └── shared/                     # Code partagé main/renderer
│       ├── types.ts
│       └── constants.ts
│
├── resources/
│   ├── templates/
│   │   └── portfolio/
│   │       ├── index.json          # Registre des templates
│   │       ├── free/               # Templates gratuits
│   │       │   ├── bento-grid/
│   │       │   │   ├── template.html
│   │       │   │   ├── meta.json
│   │       │   │   └── thumbnail.png
│   │       │   ├── kinetic-typo/
│   │       │   ├── organic-flow/
│   │       │   ├── glassmorphism/
│   │       │   └── minimal-apple/
│   │       └── premium/            # Templates payants
│   │           ├── brutalism/
│   │           └── ...
│   ├── icons/
│   └── fonts/
│
├── docs/
│   ├── ARCHITECTURE.md             # Ce fichier
│   ├── CALM-UI.md                  # Design System
│   ├── WORKFLOW-PORTFOLIO-MAITRE-V2.md
│   ├── BRIEF-MPF-FORMULAIRE-V2.md
│   └── PROMPT-GROQ-GENERATION.md
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── scripts/
│   ├── build.js
│   └── migrate-db.js
│
├── package.json
├── tsconfig.json
├── electron-builder.json
└── CLAUDE.md                       # Instructions pour agents IA
```

---

## 🔌 Communication IPC

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        RENDERER PROCESS                          │
│                          (React App)                             │
│                                                                  │
│   Component ──► Hook ──► window.electron.invoke('channel', data) │
│                                    │                             │
└────────────────────────────────────┼─────────────────────────────┘
                                     │ IPC (contextBridge)
                                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                         MAIN PROCESS                             │
│                         (Electron/Node)                          │
│                                                                  │
│   ipcMain.handle('channel') ──► Handler ──► Service ──► Result  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Preload (Bridge sécurisé)

```javascript
// preload.cjs
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  invoke: (channel, data) => ipcRenderer.invoke(channel, data),
  on: (channel, callback) => {
    ipcRenderer.on(channel, (event, ...args) => callback(...args));
  },
  removeListener: (channel, callback) => {
    ipcRenderer.removeListener(channel, callback);
  },
});
```

### Channels IPC par module

#### Base de données
```
db-query                    # Query SQL générique
db-get-user-profile         # Récupérer profil utilisateur
db-save-user-profile        # Sauvegarder profil
db-get-portfolios           # Liste des portfolios
db-save-portfolio           # Sauvegarder un portfolio
db-delete-portfolio         # Supprimer un portfolio
```

#### Templates
```
templates-load              # Charger tous les templates
templates-get-free          # Templates gratuits
templates-get-owned         # Templates possédés
templates-get-boutique      # Templates en vente
template-get-html           # Charger HTML d'un template
template-install            # Installer template acheté
```

#### IA
```
ai-anonymize                # Anonymiser du texte (Ollama)
ai-deanonymize              # Dé-anonymiser (local)
ai-generate-portfolio       # Générer portfolio (Groq)
ai-analyze-cv               # Analyser CV (Groq)
ai-job-matching             # Matching offre/CV (Groq)
ai-linkedin-coach           # Analyse LinkedIn (Groq)
```

#### Fichiers
```
file-save-temp              # Sauvegarder fichier temporaire
file-process-image          # Traiter image (resize, compress)
file-export-html            # Exporter en HTML
file-export-pdf             # Exporter en PDF
file-open-dialog            # Ouvrir dialog fichier
file-save-dialog            # Ouvrir dialog sauvegarde
```

---

## 🗄 Base de Données (SQLite)

### Schéma principal

```sql
-- Configuration utilisateur
CREATE TABLE user_profile (
  id INTEGER PRIMARY KEY DEFAULT 1,
  name TEXT,
  email TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT
);

-- Portfolios
CREATE TABLE portfolios (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  template_id TEXT,
  form_data TEXT,                -- JSON étapes 1-4
  generated_html TEXT,           -- HTML généré
  status TEXT DEFAULT 'draft',   -- draft | generated | published
  published_url TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT,
  generated_at TEXT
);

-- Templates (cache local)
CREATE TABLE templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,                 -- free | premium
  price REAL DEFAULT 0,
  thumbnail_path TEXT,
  html_path TEXT,
  is_owned INTEGER DEFAULT 0,
  purchased_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Projets (pour Portfolio et CV)
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  image_path TEXT,
  link TEXT,
  start_date TEXT,
  end_date TEXT,
  tags TEXT,                     -- JSON array
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT
);

-- Médias
CREATE TABLE media (
  id TEXT PRIMARY KEY,
  original_path TEXT,
  optimized_path TEXT,
  original_width INTEGER,
  original_height INTEGER,
  optimized_width INTEGER,
  optimized_height INTEGER,
  original_size_mb REAL,
  optimized_size_mb REAL,
  format TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- CV
CREATE TABLE cvs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  raw_content TEXT,              -- Contenu brut importé
  parsed_data TEXT,              -- JSON structuré après analyse
  analysis_result TEXT,          -- Résultat analyse BMAD
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT,
  analyzed_at TEXT
);

-- Jobs (pour Job Matching)
CREATE TABLE jobs (
  id TEXT PRIMARY KEY,
  title TEXT,
  company TEXT,
  raw_content TEXT,              -- Contenu brut de l'offre
  parsed_data TEXT,              -- JSON structuré
  source_url TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Résultats Job Matching
CREATE TABLE job_matches (
  id TEXT PRIMARY KEY,
  cv_id TEXT REFERENCES cvs(id),
  job_id TEXT REFERENCES jobs(id),
  score INTEGER,                 -- 0-100
  category TEXT,                 -- excellent | good | average | poor
  matched_skills TEXT,           -- JSON array
  missing_skills TEXT,           -- JSON array
  recommendations TEXT,          -- JSON array
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Coffre-fort documents
CREATE TABLE vault_documents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT,                     -- pdf | docx | image | other
  encrypted_path TEXT,
  original_name TEXT,
  size_bytes INTEGER,
  tags TEXT,                     -- JSON array
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Entités anonymisées (mapping temporaire)
CREATE TABLE anonymization_map (
  id TEXT PRIMARY KEY,
  session_id TEXT,
  original_value TEXT,           -- Chiffré
  anonymized_value TEXT,
  entity_type TEXT,              -- name | email | phone | company | address
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### Chiffrement

```typescript
// Données sensibles chiffrées avec AES-256-GCM
// Clé dérivée du mot de passe utilisateur via PBKDF2

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const ITERATIONS = 100000;

function encrypt(text: string, password: string): string {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const key = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, 'sha512');
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  
  return Buffer.concat([salt, iv, tag, encrypted]).toString('base64');
}

function decrypt(encryptedData: string, password: string): string {
  const buffer = Buffer.from(encryptedData, 'base64');
  
  const salt = buffer.subarray(0, SALT_LENGTH);
  const iv = buffer.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const tag = buffer.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
  const encrypted = buffer.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
  
  const key = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, 'sha512');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  
  return decipher.update(encrypted) + decipher.final('utf8');
}
```

---

## 🤖 Architecture IA

### Flux de sécurité (Anonymisation)

```
┌──────────────────────────────────────────────────────────────────┐
│                     FLUX IA SÉCURISÉ                             │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. DONNÉES UTILISATEUR                                          │
│     "Jean Dupont, contact@jeandupont.fr, 06 12 34 56 78"        │
│                          │                                       │
│                          ▼                                       │
│  2. ANONYMISATION (Ollama - LOCAL)                              │
│     Llama 3.2 détecte et remplace les entités                   │
│     "PERSON_001, EMAIL_001, PHONE_001"                          │
│                          │                                       │
│     Mapping stocké localement (chiffré) :                       │
│     { PERSON_001: "Jean Dupont", EMAIL_001: "contact@..." }     │
│                          │                                       │
│                          ▼                                       │
│  3. ENVOI À GROQ (Cloud)                                        │
│     Seules les données anonymisées sortent                      │
│                          │                                       │
│                          ▼                                       │
│  4. RÉPONSE GROQ                                                │
│     "PERSON_001 est un expert en..."                            │
│                          │                                       │
│                          ▼                                       │
│  5. DÉ-ANONYMISATION (LOCAL)                                    │
│     Remplacement inverse avec le mapping                        │
│     "Jean Dupont est un expert en..."                           │
│                          │                                       │
│                          ▼                                       │
│  6. AFFICHAGE À L'UTILISATEUR                                   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### Services IA

```typescript
// ollamaService.ts - Anonymisation locale

interface AnonymizationResult {
  anonymizedText: string;
  entityMap: Map<string, string>;
  sessionId: string;
}

async function anonymize(text: string): Promise<AnonymizationResult> {
  const sessionId = generateSessionId();
  
  const response = await ollama.generate({
    model: 'llama3.2',
    prompt: `Analyse ce texte et remplace toutes les informations personnelles par des identifiants anonymes.

RÈGLES :
- Noms de personnes → PERSON_001, PERSON_002...
- Emails → EMAIL_001, EMAIL_002...
- Téléphones → PHONE_001, PHONE_002...
- Entreprises → COMPANY_001, COMPANY_002...
- Adresses → ADDRESS_001, ADDRESS_002...

Retourne UNIQUEMENT un JSON avec :
- "anonymized": le texte anonymisé
- "mapping": { "PERSON_001": "valeur originale", ... }

Texte à anonymiser :
${text}`,
  });

  const result = JSON.parse(response);
  const entityMap = new Map(Object.entries(result.mapping));

  // Stocker le mapping chiffré en DB
  await saveAnonymizationMap(sessionId, entityMap);

  return {
    anonymizedText: result.anonymized,
    entityMap,
    sessionId,
  };
}

function deanonymize(text: string, entityMap: Map<string, string>): string {
  let result = text;
  for (const [placeholder, original] of entityMap) {
    result = result.replaceAll(placeholder, original);
  }
  return result;
}
```

```typescript
// groqService.ts - Génération via Groq

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface GroqOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

async function generateContent(
  systemPrompt: string,
  userPrompt: string,
  options: GroqOptions = {}
): Promise<string> {
  const {
    model = 'llama-3.3-70b-versatile',
    temperature = 0.3,
    maxTokens = 8000,
  } = options;

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    throw new Error(`Groq API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
```

---

## 🎨 Design System (CALM-UI)

### Référence
Voir `CALM-UI.md` pour la documentation complète.

### Principes clés

```typescript
// Theme structure
interface Theme {
  bg: {
    primary: string;    // Fond principal
    secondary: string;  // Fond secondaire (cards)
    tertiary: string;   // Fond tertiaire (inputs)
  };
  text: {
    primary: string;    // Texte principal
    secondary: string;  // Texte secondaire
    muted: string;      // Texte atténué
  };
  accent: {
    primary: string;    // Couleur d'accent principale
    secondary: string;  // Couleur d'accent secondaire
  };
  border: {
    default: string;    // Bordures par défaut
    light: string;      // Bordures légères
  };
  semantic: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
}

// Dark theme (par défaut)
const darkTheme: Theme = {
  bg: {
    primary: '#0a0a0f',
    secondary: '#12121a',
    tertiary: '#1a1a24',
  },
  text: {
    primary: '#ffffff',
    secondary: '#a0a0b0',
    muted: '#606070',
  },
  accent: {
    primary: '#6366f1',
    secondary: '#818cf8',
  },
  border: {
    default: '#2a2a3a',
    light: '#1f1f2e',
  },
  semantic: {
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
};
```

### Composants obligatoires

| Composant | Usage |
|-----------|-------|
| `CalmCard` | Conteneurs avec effet glassmorphism |
| `CalmModal` | Modales avec overlay |
| `GlassInput` | Champs texte stylisés |
| `GlassTextArea` | Zones de texte |
| `GlassSelect` | Sélecteurs dropdown |
| `NotificationToast` | Notifications (success, error, warning, info) |

### Conventions CSS

```css
/* Pas de Tailwind - CSS-in-JS ou CSS Modules */

/* Bordures arrondies */
border-radius: 12px;  /* Cards */
border-radius: 8px;   /* Inputs, boutons */
border-radius: 16px;  /* Modales */

/* Ombres */
box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);  /* Cards */
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);  /* Modales */

/* Transitions */
transition: all 0.2s ease;  /* Interactions rapides */
transition: all 0.3s ease;  /* Animations plus longues */

/* Glassmorphism */
background: rgba(18, 18, 26, 0.8);
backdrop-filter: blur(12px);
border: 1px solid rgba(255, 255, 255, 0.1);
```

---

## 📦 Templates Portfolio

### Structure d'un template

```
resources/templates/portfolio/free/bento-grid/
├── template.html     # HTML avec marqueurs {{...}}
├── meta.json         # Métadonnées
└── thumbnail.png     # Screenshot 800×600
```

### meta.json

```json
{
  "id": "bento-grid",
  "name": "Bento Grid Layout",
  "description": "Organisation modulaire façon Apple, cards asymétriques",
  "category": "free",
  "price": 0,
  "version": "1.0.0",
  "author": "SOUVERAIN",
  "tags": ["moderne", "minimaliste", "tech", "freelance"],
  "idealFor": ["Freelances", "Créatifs", "Tech"],
  "createdAt": "2026-01-28",
  "updatedAt": "2026-01-28"
}
```

### index.json (Registre)

```json
{
  "version": "1.0.0",
  "updatedAt": "2026-01-28",
  "templates": {
    "free": [
      { "id": "bento-grid", "path": "free/bento-grid", "name": "Bento Grid Layout" },
      { "id": "kinetic-typo", "path": "free/kinetic-typo", "name": "Kinetic Typography" },
      { "id": "organic-flow", "path": "free/organic-flow", "name": "Organic Flow" },
      { "id": "glassmorphism", "path": "free/glassmorphism", "name": "Glassmorphism" },
      { "id": "minimal-apple", "path": "free/minimal-apple", "name": "Minimal Apple" }
    ],
    "premium": [
      { "id": "brutalism", "path": "premium/brutalism", "name": "Brutalism Elevated", "price": 4.99 }
    ]
  }
}
```

### Marqueurs supportés

```
// Identité
{{HERO_TITLE}}          {{HERO_SUBTITLE}}        {{HERO_EYEBROW}}
{{HERO_CTA_TEXT}}       {{ABOUT_TEXT}}           {{ABOUT_IMAGE}}
{{VALUE_PROP}}

// Services (REPEAT)
{{SERVICE_TITLE}}       {{SERVICE_DESC}}

// Projets (REPEAT + IF)
{{PROJECT_TITLE}}       {{PROJECT_DESC}}         {{PROJECT_IMAGE}}
{{PROJECT_CATEGORY}}    {{PROJECT_LINK}}

// Témoignages (REPEAT + IF)
{{TESTIMONIAL_TEXT}}    {{TESTIMONIAL_AUTHOR}}   {{TESTIMONIAL_ROLE}}

// Contact
{{CONTACT_EMAIL}}       {{CONTACT_PHONE}}        {{CONTACT_ADDRESS}}
{{OPENING_HOURS}}

// Réseaux (REPEAT)
{{SOCIAL_PLATFORM}}     {{SOCIAL_URL}}

// Meta
{{CURRENT_YEAR}}
```

### Conditions et répétitions

```html
<!-- Section conditionnelle -->
<!-- IF: showProjects -->
<section class="projects">...</section>
<!-- ENDIF: showProjects -->

<!-- Zone répétable -->
<!-- REPEAT: services -->
<div class="service-card">
  <h3>{{SERVICE_TITLE}}</h3>
  <p>{{SERVICE_DESC}}</p>
</div>
<!-- END REPEAT: services -->
```

### Règles Anti-IA pour templates

```
⛔ INTERDITS :
- Émojis dans le contenu
- Formulations IA ("Bienvenue !", "N'hésitez pas...")
- Points d'exclamation excessifs

✅ OBLIGATOIRES :
- Icônes = SVG inline (Simple Icons, Lucide)
- Icônes SÉPARÉES du texte (dans div dédié)
- Ton naturel et professionnel
```

---

## 🖼 Traitement Images

### Specs par type

| Type | Taille max | Poids max | Format sortie |
|------|------------|-----------|---------------|
| Hero background | 2560×1440 | 5 MB | WebP |
| About photo | 800×800 | 2 MB | WebP |
| Project image | 1600×1200 | 3 MB | WebP |
| Général | 1920×1080 | 3 MB | WebP |

### Service (Sharp)

```javascript
const sharp = require('sharp');

const IMAGE_SPECS = {
  hero: { maxWidth: 2560, maxHeight: 1440, quality: 85, maxSizeMB: 5 },
  about: { maxWidth: 800, maxHeight: 800, quality: 85, maxSizeMB: 2 },
  project: { maxWidth: 1600, maxHeight: 1200, quality: 80, maxSizeMB: 3 },
  general: { maxWidth: 1920, maxHeight: 1080, quality: 80, maxSizeMB: 3 },
};

async function processImage(filePath, type = 'general') {
  const spec = IMAGE_SPECS[type];
  let image = sharp(filePath);
  const metadata = await image.metadata();
  
  const needsResize = metadata.width > spec.maxWidth || metadata.height > spec.maxHeight;
  
  if (needsResize) {
    image = image.resize(spec.maxWidth, spec.maxHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    });
  }

  const outputPath = filePath.replace(/\.[^.]+$/, '_optimized.webp');
  await image.webp({ quality: spec.quality }).toFile(outputPath);
  
  return outputPath;
}
```

---

## 🔒 Sécurité

### Principes

1. **Données locales** : Tout est stocké sur la machine de l'utilisateur
2. **Chiffrement** : Données sensibles chiffrées AES-256-GCM
3. **Anonymisation** : Les données envoyées au cloud sont anonymisées
4. **Pas de télémétrie** : Aucune donnée collectée sans consentement

### Bonnes pratiques

```typescript
// ❌ NE JAMAIS FAIRE
const apiKey = 'sk-xxxx';  // Clé en dur
await fetch(url, { body: JSON.stringify(userData) });  // Données non anonymisées

// ✅ FAIRE
const apiKey = process.env.GROQ_API_KEY;  // Variable d'environnement
const { anonymizedText } = await anonymize(userData);
await fetch(url, { body: JSON.stringify({ text: anonymizedText }) });
```

---

## 🧪 Tests

### Structure

```
tests/
├── unit/
│   ├── services/
│   └── components/
├── integration/
│   ├── database.test.ts
│   └── ipc.test.ts
└── e2e/
    └── portfolio-wizard.test.ts
```

### Commandes

```bash
npm run test          # Tests unitaires
npm run test:int      # Tests intégration
npm run test:e2e      # Tests end-to-end
npm run test:coverage # Couverture
```

---

## 🚀 Build & Deploy

### Scripts

```bash
npm run dev           # Développement
npm run build         # Build production
npm run package       # Package Electron (toutes plateformes)
npm run package:mac   # Package macOS
npm run package:win   # Package Windows
npm run package:linux # Package Linux
```

---

## 📚 Références

| Document | Description |
|----------|-------------|
| `CLAUDE.md` | Instructions pour agents IA |
| `CALM-UI.md` | Documentation Design System |
| `WORKFLOW-PORTFOLIO-MAITRE-V2.md` | Workflow complet Portfolio |
| `BRIEF-MPF-FORMULAIRE-V2.md` | Spécifications formulaire |
| `PROMPT-GROQ-GENERATION.md` | Prompt de génération Groq |
| `PROMPT-KIMI-TEMPLATE-DIRECT.md` | Prompt création templates |

---

**Ce document est la référence architecturale pour SOUVERAIN.**
