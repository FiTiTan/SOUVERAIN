# CORRECTIONS PRIORITÉ 3 - BRIEF COMPLET

**Date:** 23 janvier 2026
**Module:** Portfolio SOUVERAIN
**Prérequis:** Priorité 1 et 2 complétées

---

## CONTEXTE

Ce document couvre les corrections de Priorité 3 pour finaliser le module Portfolio.

### État attendu
- ✅ Priorité 1 complétée (78% conformité)
- ✅ Priorité 2 complétée (90% conformité)
- ⏳ Priorité 3 à faire (Finalisation)

### Objectif
- Conformité Master Plan : 90% → 100%
- Module Portfolio pleinement opérationnel

---

## CORRECTION 3.1 - AGRÉGATEUR DE COMPTES COMPLET

### Objectif
Permettre à l'utilisateur d'ajouter ses comptes externes parmi 80+ plateformes catégorisées.

### Fichier à créer : `src/config/externalPlatforms.ts`

#### Structure des données

```typescript
export interface Platform {
  id: string;
  name: string;
  category: PlatformCategory;
  icon: string; // Emoji
  urlPattern: string;
  placeholder: string;
}

export type PlatformCategory =
  | 'social'
  | 'professional'
  | 'creative'
  | 'code'
  | 'video'
  | 'music'
  | 'commerce'
  | 'writing'
  | 'portfolio'
  | 'other';

export const PLATFORM_CATEGORIES: Record<PlatformCategory, string> = {
  social: 'Réseaux sociaux',
  professional: 'Professionnel',
  creative: 'Créatif & Design',
  code: 'Code & Tech',
  video: 'Vidéo',
  music: 'Musique',
  commerce: 'E-commerce',
  writing: 'Écriture & Blog',
  portfolio: 'Portfolio',
  other: 'Autre',
};
```

#### Liste des 80+ plateformes

**SOCIAL (12)**
- LinkedIn, Twitter/X, Instagram, Facebook, TikTok, Snapchat
- Threads, Mastodon, Bluesky, Discord, Telegram, WhatsApp Business

**PROFESSIONAL (11)**
- Malt, Freelance.com, Upwork, Fiverr, Toptal, Comet
- Crème de la Crème, Welcome to the Jungle, Glassdoor, Indeed, AngelList/Wellfound

**CREATIVE (11)**
- Behance, Dribbble, Figma Community, Pinterest, ArtStation
- DeviantArt, Unsplash, 500px, Flickr, Adobe Portfolio, Awwwards

**CODE (15)**
- GitHub, GitLab, Bitbucket, Stack Overflow, CodePen, CodeSandbox
- Replit, LeetCode, HackerRank, Dev.to, Hashnode, npm
- Product Hunt, Kaggle, Hugging Face

**VIDEO (5)**
- YouTube, Vimeo, Twitch, Dailymotion, Loom

**MUSIC (5)**
- Spotify, SoundCloud, Bandcamp, Apple Music, Deezer

**COMMERCE (10)**
- Etsy, Shopify, Amazon Seller, Leboncoin Pro, Vinted
- Gumroad, Patreon, Ko-fi, Buy Me a Coffee, Tipeee

**WRITING (7)**
- Medium, Substack, WordPress, Notion, Ghost, Blogger, Wattpad

**PORTFOLIO (7)**
- Linktree, Bento, Carrd, Read.cv, Contra, About.me, Bio.link

**OTHER (7)**
- Calendly, Cal.com, Google Maps, TripAdvisor, Yelp, Doctolib, Lien personnalisé

#### Fonctions utilitaires

```typescript
export function getPlatformsByCategory(): Record<PlatformCategory, Platform[]>
export function getPlatformById(id: string): Platform | undefined
```

### Fichier à créer : `src/components/portfolio/accounts/ExternalAccountsManager.tsx`

#### Fonctionnalités

1. **Liste des comptes ajoutés**
   - Affichage avec icône, nom, username
   - Badge "Principal" / "Secondaire"
   - Boutons : Lien externe, Supprimer
   - Drag & drop pour réordonner (GripVertical)

2. **Modal d'ajout**
   - Recherche par nom de plateforme
   - Filtres par catégorie (pills cliquables)
   - Grille 2-3 colonnes de boutons plateforme
   - Formulaire : URL (obligatoire) + Username (optionnel)

3. **Validation URL**
   - Vérifier que l'URL contient le pattern de la plateforme
   - Extraire automatiquement le username si possible

#### Props

```typescript
interface ExternalAccountsManagerProps {
  portfolioId: string;
  accounts: ExternalAccount[];
  onUpdate: (accounts: ExternalAccount[]) => void;
}

interface ExternalAccount {
  id: string;
  platform_type: string;
  account_url: string;
  account_username: string;
  is_primary: boolean;
  display_order: number;
}
```

#### UI Structure

```
┌─────────────────────────────────────────────┐
│ Comptes externes                    [+ Ajouter] │
├─────────────────────────────────────────────┤
│ 💼 LinkedIn           @jeanlouis  [Principal] │
│ 🐙 GitHub             @jldev      [Secondaire]│
│ 🏀 Dribbble           @jldesign   [Secondaire]│
└─────────────────────────────────────────────┘

Modal:
┌─────────────────────────────────────────────┐
│ Ajouter un compte                        [X] │
├─────────────────────────────────────────────┤
│ [🔍 Rechercher une plateforme...]            │
│                                              │
│ [Tout] [Social] [Pro] [Créatif] [Code] ...   │
│                                              │
│ ┌────────┐ ┌────────┐ ┌────────┐            │
│ │💼LinkedIn│ │🐦Twitter│ │📸Instagram│         │
│ └────────┘ └────────┘ └────────┘            │
│ ┌────────┐ ┌────────┐ ┌────────┐            │
│ │🐙GitHub │ │🏀Dribbble│ │🎨Behance │          │
│ └────────┘ └────────┘ └────────┘            │
└─────────────────────────────────────────────┘
```

### Handlers IPC à ajouter dans main.cjs

```javascript
ipcMain.handle('db-get-external-accounts', async (event, { portfolioId }) => {
  return db.externalAccounts_getByPortfolio(portfolioId);
});

ipcMain.handle('db-insert-external-account', async (event, { data }) => {
  return db.externalAccounts_insert(data);
});

ipcMain.handle('db-update-external-account', async (event, { id, data }) => {
  return db.externalAccounts_update(id, data);
});

ipcMain.handle('db-delete-external-account', async (event, { id }) => {
  return db.externalAccounts_delete(id);
});

ipcMain.handle('db-reorder-external-accounts', async (event, { portfolioId, orderedIds }) => {
  return db.externalAccounts_reorder(portfolioId, orderedIds);
});
```

### Tests de validation
- ✅ Ouvrir gestionnaire de comptes
- ✅ Cliquer "Ajouter" → Modal avec 80+ plateformes
- ✅ Rechercher "github" → Filtrage fonctionne
- ✅ Filtrer par catégorie "Code" → Liste réduite
- ✅ Sélectionner GitHub → Formulaire URL
- ✅ Valider → Compte ajouté à la liste
- ✅ Toggle Principal/Secondaire → Mise à jour
- ✅ Supprimer → Compte retiré

---

## CORRECTION 3.2 - PUBLICATION CLOUDFLARE

### Objectif
Permettre la publication du portfolio sur souverain.io via Cloudflare Pages.

### Architecture

```
User → SOUVERAIN App → Cloudflare Pages API → souverain.io/{slug}
                     ↓
              HTML/CSS/Assets générés localement
```

### Fichier à créer : `src/services/publishService.ts`

```typescript
interface PublishConfig {
  apiToken: string; // Stocké chiffré en DB
  projectName: string; // "souverain-portfolios"
}

interface PublishResult {
  success: boolean;
  url?: string;
  slug?: string;
  error?: string;
}

export async function publishPortfolio(
  portfolioId: string,
  slug: string,
  htmlContent: string,
  assets: { path: string; content: string }[]
): Promise<PublishResult>

export async function unpublishPortfolio(portfolioId: string): Promise<boolean>

export async function checkSlugAvailability(slug: string): Promise<boolean>

export async function getPublishedUrl(portfolioId: string): Promise<string | null>
```

### Fichier à créer : `src/components/portfolio/publish/PublishModal.tsx`

#### Fonctionnalités

1. **Étape 1 : Choix du slug**
   - Input : `souverain.io/[__________]`
   - Validation en temps réel (disponibilité, format)
   - Suggestions basées sur le nom du portfolio

2. **Étape 2 : Preview final**
   - Aperçu du portfolio complet
   - Checklist : "X projets", "X comptes", "Style: Moderne"

3. **Étape 3 : Publication**
   - Progress bar pendant upload
   - Message succès avec URL cliquable
   - Génération QR Code

4. **Gestion du publié**
   - Si déjà publié : afficher URL + QR Code + bouton "Dépublier"
   - Option "Mettre à jour" si contenu modifié

#### UI

```
┌─────────────────────────────────────────────┐
│ Publier mon portfolio                    [X] │
├─────────────────────────────────────────────┤
│                                              │
│ Votre portfolio sera accessible à :          │
│                                              │
│ souverain.io/ [jean-louis-portfolio    ]    │
│               ✅ Disponible                  │
│                                              │
│ ─────────────────────────────────────────── │
│                                              │
│ Résumé :                                     │
│ • 5 projets (dont 3 highlights)              │
│ • 4 comptes externes                         │
│ • Style : Moderne                            │
│                                              │
│              [Annuler]  [🚀 Publier]         │
└─────────────────────────────────────────────┘
```

### Table DB à utiliser

```sql
portfolio_publications
- id
- portfolio_id
- publication_type ('full' | 'project_single')
- project_id (null si full)
- slug
- published_url
- qr_code_path
- published_at
- is_active
```

### Tests de validation
- ✅ Ouvrir modal publication
- ✅ Entrer slug → Vérification disponibilité
- ✅ Publier → Progress bar + succès
- ✅ URL fonctionnelle sur souverain.io
- ✅ QR Code généré et téléchargeable
- ✅ Dépublier → Portfolio retiré

---

## CORRECTION 3.3 - OCR IMAGES MÉDIATHÈQUE

### Objectif
Extraire le texte des images pour permettre la recherche et l'anonymisation.

### Approche

1. **Ollama Vision** (préféré si disponible)
   - Utiliser le modèle llava ou similaire
   - Prompt : "Extract all visible text from this image. Return only the text, nothing else."

2. **Tesseract.js** (fallback)
   - Librairie OCR JavaScript
   - Fonctionne offline
   - Support multi-langues

### Fichier à créer : `src/services/ocrService.ts`

```typescript
interface OCRResult {
  text: string;
  confidence: number;
  source: 'ollama' | 'tesseract';
}

export async function extractTextFromImage(
  imagePath: string
): Promise<OCRResult>

export async function extractTextFromBase64(
  base64: string,
  mimeType: string
): Promise<OCRResult>

// Implémentation Ollama
async function extractWithOllama(base64: string): Promise<string | null> {
  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llava',
        prompt: 'Extract all visible text from this image. Return only the text, nothing else.',
        images: [base64],
        stream: false,
      }),
    });
    const data = await response.json();
    return data.response || null;
  } catch {
    return null;
  }
}

// Implémentation Tesseract (fallback)
async function extractWithTesseract(imagePath: string): Promise<string> {
  const Tesseract = await import('tesseract.js');
  const result = await Tesseract.recognize(imagePath, 'fra+eng');
  return result.data.text;
}
```

### Intégration dans le flux d'import

Modifier `src/services/mediathequeService.ts` :

```typescript
import { extractTextFromImage } from './ocrService';

export async function importMediaFile(filePath: string, portfolioId: string) {
  // ... code existant ...

  // Si c'est une image, extraire le texte
  if (['image/png', 'image/jpeg', 'image/webp'].includes(mimeType)) {
    try {
      const ocrResult = await extractTextFromImage(filePath);
      if (ocrResult.text) {
        // Stocker dans extracted_text
        await updateMediaItem(itemId, {
          extracted_text: ocrResult.text,
          ocr_confidence: ocrResult.confidence,
          ocr_source: ocrResult.source,
        });
      }
    } catch (error) {
      console.warn('OCR failed for', filePath, error);
    }
  }

  // ... suite du code ...
}
```

### Colonnes DB à ajouter

```sql
ALTER TABLE mediatheque_items ADD COLUMN extracted_text TEXT;
ALTER TABLE mediatheque_items ADD COLUMN ocr_confidence REAL;
ALTER TABLE mediatheque_items ADD COLUMN ocr_source TEXT;
```

### Installation Tesseract.js

```bash
npm install tesseract.js
```

### Tests de validation
- ✅ Importer une image contenant du texte (facture, document)
- ✅ Vérifier que `extracted_text` est rempli en DB
- ✅ Le texte extrait peut être recherché dans la médiathèque
- ✅ Le texte extrait passe par l'anonymisation si nécessaire
- ✅ Fallback Tesseract fonctionne si Ollama Vision indisponible

---

## FICHIERS À CRÉER (PRIORITÉ 3)

1. `src/config/externalPlatforms.ts` — 80+ plateformes catégorisées
2. `src/components/portfolio/accounts/ExternalAccountsManager.tsx`
3. `src/services/publishService.ts` — Publication Cloudflare
4. `src/components/portfolio/publish/PublishModal.tsx`
5. `src/services/ocrService.ts` — Extraction texte images

## FICHIERS À MODIFIER (PRIORITÉ 3)

1. `main.cjs` — Handlers IPC pour comptes externes
2. `database.cjs` — Fonctions CRUD comptes externes
3. `src/services/mediathequeService.ts` — Intégrer OCR à l'import

## DÉPENDANCES À INSTALLER

```bash
npm install tesseract.js qrcode
```

---

## ORDRE D'EXÉCUTION RECOMMANDÉ

**Jour 1 :**
- Correction 3.1 — Agrégateur de comptes (config + composant + handlers)

**Jour 2 :**
- Correction 3.2 — Publication Cloudflare (service + modal)

**Jour 3 :**
- Correction 3.3 — OCR images (service + intégration)
- Tests finaux

---

## VALIDATION FINALE PRIORITÉ 3

1. Ajouter 5 comptes externes variés (LinkedIn, GitHub, Dribbble...)
2. Vérifier affichage dans la liste
3. Importer une image avec du texte → OCR fonctionne
4. Publier le portfolio → URL accessible
5. Vérifier QR Code généré
6. Dépublier → Portfolio retiré

**Status attendu :** Conformité 100%

---

## RÉCAPITULATIF GLOBAL

### Corrections Priorité 1 ✅
- 1.1 Bug Electron IPC
- 1.2 Anonymisation complète Ollama NER
- 1.3 6 Palettes de style personnalité

### Corrections Priorité 2
- 2.1 Formulaire d'intention (5 questions)
- 2.2 Suggestion IA de style intégrée
- 2.3 Previews dédiés (projet + portfolio)

### Corrections Priorité 3
- 3.1 Agrégateur comptes (80+ plateformes)
- 3.2 Publication Cloudflare
- 3.3 OCR images médiathèque

### Métriques finales attendues

| Phase | Avant | Après |
|-------|-------|-------|
| Priorité 1 | 65% | 78% |
| Priorité 2 | 78% | 90% |
| Priorité 3 | 90% | 100% |

### Temps estimé total

| Priorité | Temps |
|----------|-------|
| P1 (fait) | 4h |
| P2 | 4-5h |
| P3 | 5-6h |
| **Total** | **13-15h** |

---

**Document généré le:** 23 janvier 2026
**Auteur:** Claude Opus 4.5
**Projet:** SOUVERAIN - Module Portfolio Hub V2
