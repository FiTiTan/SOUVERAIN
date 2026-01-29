# BRIEF MPF - Formulaire Portfolio Universel

**Version:** 2.0 (refonte complète)
**Date:** 28 janvier 2026
**Objectif:** Un seul formulaire qui génère des portfolios adaptés à tous les profils

---

## 🎯 Changements vs V1

| Avant (V1) | Après (V2) |
|------------|------------|
| 6 styles différents | 1 template universel |
| Suggestion de style IA | Groq adapte automatiquement |
| Formulaire fragmenté | 4 étapes claires |
| Beaucoup de champs optionnels | Questions essentielles uniquement |

---

## 📋 Structure du Formulaire

```
ÉTAPE 1 : Identité (obligatoire)
    ↓
ÉTAPE 2 : Offre (obligatoire)
    ↓
ÉTAPE 3 : Coordonnées (mixte)
    ↓
ÉTAPE 4 : Contenu (import)
    ↓
GÉNÉRATION GROQ
    ↓
PREVIEW + ÉDITION
```

---

## ÉTAPE 1 : QUI ÊTES-VOUS ?

### Écran

```
┌─────────────────────────────────────────────────────────────────┐
│  Étape 1/4                                    ████░░░░░░░░ 25%  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Qui êtes-vous ?                                               │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Votre nom ou nom d'activité *                          │   │
│  │  [Jean Dupont                                        ]  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Vous êtes : *                                                 │
│                                                                 │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                          │
│  │ 💼      │ │ 🏪      │ │ 🎨      │                          │
│  │Freelance│ │Commerce │ │Créatif  │                          │
│  │Indépen- │ │Artisan  │ │Artiste  │                          │
│  │dant     │ │         │ │Créateur │                          │
│  └─────────┘ └─────────┘ └─────────┘                          │
│                                                                 │
│  ┌─────────┐ ┌─────────┐                                       │
│  │ 🎓      │ │ 👔      │                                       │
│  │Étudiant │ │Cadre    │                                       │
│  │Jeune    │ │Employé  │                                       │
│  │diplômé  │ │en trans.│                                       │
│  └─────────┘ └─────────┘                                       │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Décrivez votre activité en une phrase *                │   │
│  │  [J'aide les startups à créer des produits digitaux  ]  │   │
│  │                                                          │   │
│  │  💡 Cette phrase sera votre accroche principale         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│                                              [Continuer →]      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Champs

| Champ | Type | Obligatoire | Variable Groq |
|-------|------|-------------|---------------|
| Nom / Nom d'activité | Text input | ✅ | `{{HERO_TITLE}}` |
| Type de profil | Single select (5 options) | ✅ | `{{PROFILE_TYPE}}` |
| Description activité | Textarea (max 150 car.) | ✅ | `{{HERO_SUBTITLE}}` |

### Options "Type de profil"

```typescript
const PROFILE_TYPES = [
  { 
    id: 'freelance', 
    label: 'Freelance / Indépendant',
    icon: '💼',
    hint: 'Consultant, développeur, designer, coach...'
  },
  { 
    id: 'commerce', 
    label: 'Commerce / Artisan',
    icon: '🏪',
    hint: 'Boutique, restaurant, artisan, prestataire local...'
  },
  { 
    id: 'creative', 
    label: 'Créatif / Artiste / Créateur',
    icon: '🎨',
    hint: 'Photographe, vidéaste, musicien, influenceur...'
  },
  { 
    id: 'student', 
    label: 'Étudiant / Jeune diplômé',
    icon: '🎓',
    hint: 'En recherche de stage, alternance ou premier emploi...'
  },
  { 
    id: 'employee', 
    label: 'Cadre / Employé en transition',
    icon: '👔',
    hint: 'En recherche d\'opportunités, personal branding...'
  },
];
```

---

## ÉTAPE 2 : VOTRE OFFRE

### Écran

```
┌─────────────────────────────────────────────────────────────────┐
│  Étape 2/4                                    ████████░░░░ 50%  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Que proposez-vous ?                                           │
│                                                                 │
│  Vos services ou compétences principales (3 max) *             │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  1. [Design UX/UI                                    ]  │   │
│  │  2. [Développement React                             ]  │   │
│  │  3. [Conseil produit                                 ]  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [+ Ajouter un service]  (max 3)                               │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Ce qui vous différencie                                │   │
│  │  [                                                    ] │   │
│  │  [J'accompagne mes clients de l'idée au produit fini,] │   │
│  │  [avec une approche centrée utilisateur.             ] │   │
│  │                                                          │   │
│  │  💡 Qu'est-ce qui vous rend unique ?                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [← Retour]                                  [Continuer →]      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Champs

| Champ | Type | Obligatoire | Variable Groq |
|-------|------|-------------|---------------|
| Services/Compétences | Array[3] text inputs | ✅ (min 1) | `{{SERVICES}}` |
| Proposition de valeur | Textarea (max 300 car.) | ❌ | `{{VALUE_PROP}}` |

### Adaptation selon profil (aide contextuelle)

| Profil | Label du champ | Placeholder |
|--------|----------------|-------------|
| Freelance | "Vos services" | "Design UX, Développement web..." |
| Commerce | "Vos produits/services" | "Plomberie, Installation, Dépannage..." |
| Créatif | "Vos spécialités" | "Photo portrait, Vidéo corporate..." |
| Étudiant | "Vos compétences" | "Python, Marketing digital, Anglais..." |
| Cadre | "Vos domaines d'expertise" | "Management, Finance, Stratégie..." |

---

## ÉTAPE 3 : VOS COORDONNÉES

### Écran

```
┌─────────────────────────────────────────────────────────────────┐
│  Étape 3/4                                    ████████████░ 75% │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Comment vous contacter ?                                      │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Email *                                                │   │
│  │  [contact@exemple.com                                ]  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Téléphone                                              │   │
│  │  [06 12 34 56 78                                     ]  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ── Lieu (optionnel) ──────────────────────────────────────    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Adresse                                                │   │
│  │  [12 rue des Lilas, 75011 Paris                      ]  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Horaires d'ouverture                                   │   │
│  │  [Lun-Ven : 9h-18h / Sam : 10h-13h                   ]  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ── Réseaux sociaux ───────────────────────────────────────    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  [ ] Instagram  [@moncompte                          ]  │   │
│  │  [ ] LinkedIn   [linkedin.com/in/monprofil           ]  │   │
│  │  [ ] TikTok     [@moncompte                          ]  │   │
│  │  [ ] YouTube    [youtube.com/@machaine               ]  │   │
│  │  [ ] Behance    [behance.net/monportfolio            ]  │   │
│  │  [ ] GitHub     [github.com/monpseudo                ]  │   │
│  │  [ ] Autre      [                                    ]  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  ⭐ Mon travail est principalement visible sur mes      │   │
│  │     réseaux sociaux                                     │   │
│  │                                                          │   │
│  │     ( ) Oui, mettre mes réseaux en avant               │   │
│  │     (•) Non, mon portfolio est ma vitrine principale   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [← Retour]                                  [Continuer →]      │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Champs

| Champ | Type | Obligatoire | Variable Groq | Active section |
|-------|------|-------------|---------------|----------------|
| Email | Email input | ✅ | `{{CONTACT_EMAIL}}` | - |
| Téléphone | Tel input | ❌ | `{{CONTACT_PHONE}}` | - |
| Adresse | Text input | ❌ | `{{CONTACT_ADDRESS}}` | "Infos pratiques" |
| Horaires | Text input | ❌ | `{{OPENING_HOURS}}` | "Infos pratiques" |
| Réseaux sociaux | Multi-input | ❌ | `{{SOCIAL_LINKS}}` | - |
| Vitrine = réseaux | Radio (Oui/Non) | ✅ | `{{SOCIAL_IS_MAIN}}` | "Social Showcase" |

### Logique conditionnelle

```typescript
// Si adresse OU horaires renseignés → Section "Infos Pratiques" activée
const showPracticalInfo = formData.address || formData.openingHours;

// Si vitrine = réseaux → Section "Social Showcase" en prominence
const socialIsMain = formData.socialIsMain === true;
```

---

## ÉTAPE 4 : VOTRE CONTENU

### Écran

```
┌─────────────────────────────────────────────────────────────────┐
│  Étape 4/4                                    ████████████ 100% │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Ajoutez du contenu à votre portfolio                          │
│                                                                 │
│  ── Projets & Réalisations ────────────────────────────────    │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ 📁              │  │ 📤              │  │                 │ │
│  │ Depuis mes      │  │ Uploader des    │  │  + Ajouter      │ │
│  │ projets         │  │ images          │  │    un projet    │ │
│  │ SOUVERAIN       │  │                 │  │    manuellement │ │
│  │                 │  │                 │  │                 │ │
│  │ [3 projets]     │  │ [Glisser ici]   │  │                 │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                 │
│  Projets sélectionnés : 2                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ ☑ Refonte site e-commerce         [Voir] [Retirer]      │  │
│  │ ☑ Application mobile fitness      [Voir] [Retirer]      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ── Enrichir avec vos données (optionnel) ─────────────────    │
│                                                                 │
│  ┌─────────────────┐  ┌─────────────────┐                      │
│  │ 🔗 LinkedIn     │  │ 📝 Notion       │                      │
│  │                 │  │                 │                      │
│  │ Importer mon    │  │ Importer une    │                      │
│  │ profil          │  │ page            │                      │
│  │                 │  │                 │                      │
│  │ [Connecté ✓]    │  │ [Connecter]     │                      │
│  └─────────────────┘  └─────────────────┘                      │
│                                                                 │
│  ── Témoignages clients (optionnel) ───────────────────────    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  [+ Ajouter un témoignage]                              │   │
│  │                                                          │   │
│  │  "Excellent travail, je recommande !"                   │   │
│  │  — Marie D., CEO StartupXYZ                    [×]      │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  [← Retour]                              [Générer mon portfolio]│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Champs

| Champ | Type | Obligatoire | Variable Groq |
|-------|------|-------------|---------------|
| Projets SOUVERAIN | Multi-select | ❌ | `{{PROJECTS}}` |
| Médias uploadés | File upload (images) | ❌ | `{{MEDIA}}` |
| Projet manuel | Modal (titre, desc, image) | ❌ | `{{PROJECTS}}` |
| LinkedIn import | OAuth / Paste | ❌ | `{{LINKEDIN_DATA}}` |
| Notion import | OAuth / Paste | ❌ | `{{NOTION_DATA}}` |
| Témoignages | Array [{text, author, role}] | ❌ | `{{TESTIMONIALS}}` |

### Modal "Ajouter un projet manuellement"

```
┌─────────────────────────────────────────────────────────────────┐
│  Ajouter un projet                                        [×]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Titre du projet *                                             │
│  [Refonte site e-commerce                                   ]  │
│                                                                 │
│  Description                                                   │
│  [Refonte complète d'une boutique en ligne avec +40% de     ] │
│  [conversion après 3 mois.                                  ] │
│                                                                 │
│  Image                                                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                          │   │
│  │          [Glisser une image ou cliquer]                 │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Catégorie (optionnel)                                         │
│  [Web Design                                                ]  │
│                                                                 │
│  Lien (optionnel)                                              │
│  [https://exemple.com                                       ]  │
│                                                                 │
│                                    [Annuler]  [Ajouter]        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Modal "Ajouter un témoignage"

```
┌─────────────────────────────────────────────────────────────────┐
│  Ajouter un témoignage                                    [×]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Témoignage *                                                  │
│  [Jean a été d'une grande aide pour notre projet. Son       ] │
│  [expertise et sa réactivité ont fait la différence.        ] │
│                                                                 │
│  Nom de la personne *                                          │
│  [Marie Dupont                                              ]  │
│                                                                 │
│  Rôle / Entreprise                                             │
│  [CEO, StartupXYZ                                           ]  │
│                                                                 │
│                                    [Annuler]  [Ajouter]        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🖼 Traitement Automatique des Images

### Specs par type d'image

| Type | Taille min | Taille max | Ratio | Poids max | Format sortie |
|------|------------|------------|-------|-----------|---------------|
| Hero background | 1920×1080 | 2560×1440 | 16:9 | 5 MB | WebP |
| About photo | 400×400 | 800×800 | 1:1 | 2 MB | WebP |
| Project image | 800×600 | 1600×1200 | 4:3 ou 16:9 | 3 MB | WebP |
| Général | 800×600 | 1920×1080 | Libre | 3 MB | WebP |

### Traitement automatique à l'import

```typescript
// Configuration des specs
const IMAGE_SPECS = {
  hero: { maxWidth: 2560, maxHeight: 1440, quality: 85, maxSizeMB: 5 },
  about: { maxWidth: 800, maxHeight: 800, quality: 85, maxSizeMB: 2 },
  project: { maxWidth: 1600, maxHeight: 1200, quality: 80, maxSizeMB: 3 },
  general: { maxWidth: 1920, maxHeight: 1080, quality: 80, maxSizeMB: 3 },
};

// Logique de traitement
SI image.width > spec.maxWidth OU image.height > spec.maxHeight :
   → Redimensionner (conserver le ratio)
   
SI image.sizeMB > spec.maxSizeMB :
   → Compresser en WebP (quality: spec.quality)
   
SINON :
   → Garder l'original
```

### Handler IPC (main.cjs)

```javascript
const sharp = require('sharp');

ipcMain.handle('process-image', async (event, { filePath, type = 'general' }) => {
  const spec = IMAGE_SPECS[type] || IMAGE_SPECS.general;
  const stats = fs.statSync(filePath);
  const originalSizeMB = stats.size / (1024 * 1024);
  
  let image = sharp(filePath);
  const metadata = await image.metadata();
  
  const result = {
    original: {
      width: metadata.width,
      height: metadata.height,
      sizeMB: originalSizeMB.toFixed(2),
    },
    processed: null,
    wasProcessed: false,
    warnings: [],
  };

  const needsResize = metadata.width > spec.maxWidth || metadata.height > spec.maxHeight;
  const needsCompress = originalSizeMB > spec.maxSizeMB;

  if (needsResize || needsCompress) {
    result.wasProcessed = true;
    
    if (needsResize) {
      image = image.resize(spec.maxWidth, spec.maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      });
      result.warnings.push(`Redimensionnée (${metadata.width}×${metadata.height} → max ${spec.maxWidth}×${spec.maxHeight})`);
    }

    const outputPath = filePath.replace(/\.[^.]+$/, '_optimized.webp');
    await image.webp({ quality: spec.quality }).toFile(outputPath);

    const newStats = fs.statSync(outputPath);
    const newMetadata = await sharp(outputPath).metadata();

    result.processed = {
      path: outputPath,
      width: newMetadata.width,
      height: newMetadata.height,
      sizeMB: (newStats.size / (1024 * 1024)).toFixed(2),
      format: 'webp',
    };

    if (needsCompress) {
      result.warnings.push(`Compressée (${originalSizeMB.toFixed(1)}MB → ${result.processed.sizeMB}MB)`);
    }
  } else {
    result.processed = {
      path: filePath,
      width: metadata.width,
      height: metadata.height,
      sizeMB: originalSizeMB.toFixed(2),
      format: metadata.format,
    };
  }

  return result;
});
```

### UI Zone d'upload avec feedback

```
┌─────────────────────────────────────────────────────────────────┐
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                          │   │
│  │     📤  Glissez vos images ici ou cliquez pour          │   │
│  │         parcourir                                        │   │
│  │                                                          │   │
│  │     Formats : JPG, PNG, WebP                            │   │
│  │     Taille max recommandée : 1920×1080                  │   │
│  │     Poids max : 5 MB par image                          │   │
│  │                                                          │   │
│  │  ┌─────────────────────────────────────────────────┐    │   │
│  │  │  ℹ️  Les images trop grandes seront             │    │   │
│  │  │     automatiquement redimensionnées et          │    │   │
│  │  │     compressées pour optimiser votre portfolio  │    │   │
│  │  └─────────────────────────────────────────────────┘    │   │
│  │                                                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Images importées : 3                                          │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 🖼 photo-bureau.jpg                                       │  │
│  │   Original: 4000×3000 (8.2 MB)                           │  │
│  │   ✓ Optimisée: 1920×1440 (1.2 MB) — WebP        [×]     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 🖼 portrait.png                                           │  │
│  │   800×800 (0.4 MB)                                       │  │
│  │   ✓ Aucune modification nécessaire              [×]     │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Dépendance requise

```bash
npm install sharp --save
```

---

## 📤 Données envoyées à Groq

### Structure JSON compilée

```typescript
interface PortfolioData {
  // Étape 1
  name: string;                    // "Jean Dupont"
  profileType: ProfileType;        // "freelance" | "commerce" | "creative" | "student" | "employee"
  tagline: string;                 // "J'aide les startups..."
  
  // Étape 2
  services: string[];              // ["Design UX", "Dev React", "Conseil"]
  valueProp?: string;              // "Ce qui me différencie..."
  
  // Étape 3
  email: string;                   // "contact@exemple.com"
  phone?: string;                  // "06 12 34 56 78"
  address?: string;                // "12 rue..." → Active section Infos Pratiques
  openingHours?: string;           // "Lun-Ven 9h-18h" → Active section Infos Pratiques
  socialLinks: SocialLink[];       // [{platform: "instagram", url: "@compte"}]
  socialIsMain: boolean;           // true → Section Social Showcase en avant
  
  // Étape 4
  projects: Project[];             // [{title, description, image, category, link}]
  testimonials: Testimonial[];     // [{text, author, role}]
  linkedInData?: string;           // Texte brut importé
  notionData?: string;             // Texte brut importé
  media: Media[];                  // [{url, alt}]
}

interface SocialLink {
  platform: 'instagram' | 'linkedin' | 'tiktok' | 'youtube' | 'behance' | 'github' | 'other';
  url: string;
  label?: string;                  // Pour "other"
}

interface Project {
  title: string;
  description?: string;
  image?: string;
  category?: string;
  link?: string;
}

interface Testimonial {
  text: string;
  author: string;
  role?: string;
}

interface Media {
  url: string;                     // URL locale ou base64
  alt?: string;
}
```

### Flags pour Groq

```typescript
interface GroqFlags {
  // Sections conditionnelles
  showPracticalInfo: boolean;      // address || openingHours
  showSocialShowcase: boolean;     // socialIsMain === true
  showProjects: boolean;           // projects.length > 0
  showTestimonials: boolean;       // testimonials.length > 0
  
  // Adaptation du ton
  profileType: ProfileType;        // Pour adapter le ton et les labels
  
  // Données enrichies disponibles
  hasLinkedIn: boolean;
  hasNotion: boolean;
}
```

---

## 🎨 Composants CALM-UI à utiliser

| Composant | Usage |
|-----------|-------|
| `CalmCard` | Sélection type de profil, options d'import |
| `CalmModal` | Ajout projet, ajout témoignage |
| `GlassInput` | Tous les champs texte |
| `GlassTextArea` | Description, proposition de valeur |
| `GlassSelect` | Non utilisé (pills préférées) |
| `useToast` | Feedback succès/erreur |

### Progress bar

```tsx
<div style={{ 
  width: '100%', 
  height: '4px', 
  backgroundColor: theme.bg.tertiary,
  borderRadius: '2px',
}}>
  <motion.div
    initial={{ width: 0 }}
    animate={{ width: `${(step / 4) * 100}%` }}
    style={{
      height: '100%',
      backgroundColor: theme.accent.primary,
      borderRadius: '2px',
    }}
  />
</div>
```

---

## ✅ Validation par étape

```typescript
const validateStep1 = (data: PortfolioData): boolean => {
  return (
    data.name.trim().length > 0 &&
    data.profileType !== null &&
    data.tagline.trim().length > 0
  );
};

const validateStep2 = (data: PortfolioData): boolean => {
  return data.services.filter(s => s.trim().length > 0).length >= 1;
};

const validateStep3 = (data: PortfolioData): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(data.email);
};

const validateStep4 = (data: PortfolioData): boolean => {
  return true; // Tout est optionnel
};
```

---

## 🔄 Navigation

```typescript
const [step, setStep] = useState(1);
const [data, setData] = useState<PortfolioData>(initialData);

const canContinue = () => {
  switch (step) {
    case 1: return validateStep1(data);
    case 2: return validateStep2(data);
    case 3: return validateStep3(data);
    case 4: return validateStep4(data);
    default: return false;
  }
};

const handleContinue = () => {
  if (step < 4) {
    setStep(step + 1);
  } else {
    handleGenerate(); // Lancer la génération
  }
};

const handleBack = () => {
  if (step > 1) {
    setStep(step - 1);
  }
};
```

---

## 📁 Fichiers à créer

```
src/components/portfolio/wizard/
├── PortfolioWizard.tsx           # Container principal
├── WizardProgress.tsx            # Barre de progression
├── Step1Identity.tsx             # Qui êtes-vous
├── Step2Offer.tsx                # Votre offre
├── Step3Contact.tsx              # Coordonnées
├── Step4Content.tsx              # Import contenu
├── ProjectModal.tsx              # Modal ajout projet
├── TestimonialModal.tsx          # Modal ajout témoignage
└── types.ts                      # Interfaces TypeScript
```

---

**Ce brief remplace les anciens MPF-1, MPF-2, MPF-3, MPF-4.**
**MPF-5 (génération) et MPF-6 (édition) restent valides.**
