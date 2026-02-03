# SOUVERAIN - Liste exhaustive des features

**Date :** 3 février 2026  
**Version :** 2.0  
**Status :** Document de référence complet

---

## 🎯 Vision globale

**SOUVERAIN** est une application desktop Electron qui permet aux professionnels de gérer leur carrière avec une **souveraineté totale sur leurs données**. Tout est stocké localement, l'IA est optionnelle et anonymisée.

---

## 📦 Modules principaux

### 1. 🏠 **HOME & ONBOARDING**

#### Features implémentées ✅
- **Splash Screen moderne** avec animation
- **Onboarding Carousel** (3 slides)
  - Présentation de l'app
  - Explication souveraineté données
  - Choix du mode (IA cloud vs local)
- **Home Screen CALM-UI**
  - Cartes modules avec hover effects
  - Mascot space (20vh réservé)
  - Navigation vers les modules
- **Settings**
  - Gestion des clés API (Groq, DeepSeek)
  - Configuration Ollama local
  - Choix du thème (Light/Dark)
  - Gestion de la base de données

---

### 2. 📄 **CV GENERATOR MODULE**

#### Features implémentées ✅

**CVChoice - 3 parcours de création** :
- **"J'ai déjà un CV"** : Upload PDF/DOCX → Analyse IA → Suggestions d'amélioration
- **"Je pars de zéro"** : Wizard création guidée en 6-7 étapes
- **"Importer LinkedIn"** : Scraping profil LinkedIn → Conversion automatique en CV

**CVWizard - Création guidée** :
- **Step 1** : Identité (nom, email, téléphone, localisation)
- **Step 2** : Objectif professionnel (poste visé, secteur, niveau d'expérience)
- **Step 3** : Formation (diplômes, écoles, années)
- **Step 4** : Expériences professionnelles (postes, entreprises, dates, descriptions)
- **Step 5** : Compétences techniques + Langues (avec niveaux)
- **Step 6** : Extras (LinkedIn, portfolio, hobbies)

**Export basique** :
- PDF optimisé
- DOCX éditable
- HTML responsive

#### Features prévues 🚧

**Phase 1 - Templates Freemium (Sprint 2-3 semaines)** :

**Templates gratuits (3-5)** :
- **Classique ATS** : Épuré, sans design, optimisé parsing automatique (prioritaire)
- **Moderne Clean** : Minimaliste élégant, style tech/startups
- **Créatif Color** : Sections colorées, infographies, pour profils créatifs
- **Academic** : Sobre, formel, pour recherche/enseignement
- **Executive** : Premium look sobre, pour cadres/direction

**Templates premium (payants)** :
- **Tech Engineer** (4.99€) : Aesthetic code, dark mode, pour développeurs
- **Creative Pro** (6.99€) : Bold, portfolio-like, avec mini-projets visuels
- **Luxury Executive** (9.99€) : Ultra-premium, serif, gold accents
- **Infographic CV** (7.99€) : Data viz, charts automatiques, visuel
- **Video CV Ready** (5.99€) : QR codes, liens vidéo intégrés

**Boutique CV Templates** :
- Grid de templates (comme Portfolio)
- Preview modal avec zoom
- Achat in-app (Stripe)
- Badge "Premium" + prix

**Phase 2 - Features différenciantes (Sprint 3-4 semaines)** :

**ATS Scoring** (unique CV, pas sur Portfolio) :
- Score 0-100% compatibilité ATS par template
- Analyse mots-clés métier
- Suggestions d'optimisation parsing
- Badge score visible sur chaque template

**AI Rewrite pour CV** (réutilisation du système Portfolio) :
- Boutons ✨ sur expériences/compétences
- Popup instructions : "Plus orienté résultats", "Ajoute mots-clés ATS"
- Régénération DeepSeek/Groq
- Optimisation automatique du contenu

**Multi-langues avec traduction IA** :
- FR/EN/ES/DE/IT
- Traduction automatique DeepSeek
- Adaptation culturelle (formats dates, terminologie)
- Export simultané multi-langues

**Anonymisation RGPD** :
- Mode "CV anonyme" (masque nom, contacts)
- Pour candidatures initiales privacy-first
- Révélation progressive des infos

**Phase 3 - Analyse IA avancée (Sprint 5-6 semaines)** :

**Coach CV intelligent** :
- Analyse sémantique approfondie
- Suggestions par section (expérience, formation, compétences)
- Comparaison avec CVs top performers du secteur
- Score global + axes d'amélioration
- Avant/Après avec suggestions appliquées

---

### 3. 🎨 **PORTFOLIO MODULE**

#### Features implémentées ✅

**Wizard V2 (6 steps)** :
- **Step 1 - À propos** : Nom, type de profil, photo
- **Step 2 - Réalisations + Positionnement** :
  - Encart positionnement (valueProp + 3 expertises)
  - Import projets (PDF, URL Notion, manuel)
  - Extraction automatique contenu PDF
- **Step 3 - Template** : Choix du style visuel
  - 10 templates gratuits (Bento Grid, Kinetic Typo, etc.)
  - Templates premium (payants)
- **Step 4 - Génération** : IA compile tout
  - Service IA V4 avec prompts séquencés
  - Génération Hero + About basée sur valueProp
  - Génération Services basée sur expertises
  - Enrichissement descriptions projets
- **Step 5 - Preview éditable** :
  - **BRIEF 1** : Édition manuelle (contenteditable)
    - Tous les textes modifiables
    - Boutons reset individuels (↺)
    - Toolbar "Tout réinitialiser"
    - Indicateur modifications (barre bleue)
  - **BRIEF 2** : AI Rewrite (régénération IA)
    - Boutons ✨ triple sparkle au survol
    - Popup avec textarea pour instructions
    - Appel DeepSeek/Groq pour réécrire
    - Exemples : "Rends le plus percutant", "Ajoute des chiffres"
  - Drag & drop d'images
  - Bibliothèque d'images
- **Step 6 - Export** :
  - HTML standalone
  - PDF haute qualité
  - Hébergement prévu (futur)

**Templates inclus** :
1. Bento Grid (moderne, grille asymétrique)
2. Kinetic Typography (animations texte)
3. Organic Flow (anti-grid, formes organiques)
4. Glassmorphism (verre dépoli, flou)
5. Minimalist Apple (épuré, blanc)
6. Dopamine Colors (couleurs vives)
7. Exaggerated Hierarchy (titres XXL)
8. Hand-drawn Scribble (dessiné main)
9. Scroll Storytelling (parallax, scroll)
10. Tactile Maximalism (textures, relief)
11. 3D Immersif WebGL (preview 3D)

**CSS partagés** (`templates/_shared/`) :
- `_layout-adaptive.css` : Layout adaptatif (1 projet → horizontal, 3+ → grille)
- `_typography.css` : Texte justifié, hyphenation
- `_editable.css` : Styles contenteditable

#### Features prévues 🚧
- Hébergement portfolios (souverain.app/[username])
- Analytics visiteurs (privacy-first, sans cookies)
- Domaine personnalisé (custom domain)
- Mode multi-portfolios (pro, perso, créatif)
- Templates premium supplémentaires
- Thème builder (customiser un template)

---

### 4. 💼 **JOB MATCHING MODULE**

#### Features prévues 🚧
- **Import offre d'emploi**
  - Via URL (LinkedIn, Welcome to the Jungle, Indeed)
  - Copier-coller texte
  - Upload PDF
- **Analyse compatibilité**
  - Score de matching (0-100%)
  - Analyse par critère :
    - Compétences techniques
    - Expérience requise
    - Formation
    - Soft skills
  - Points forts / points faibles
- **Recommandations personnalisées**
  - Mots-clés à ajouter au CV
  - Compétences à mettre en avant
  - Formations recommandées
  - Lettre de motivation suggérée
- **Historique des matchings**
  - Sauvegarde offres analysées
  - Suivi candidatures
  - Statistiques

#### Architecture technique
- **Service IA** : `jobMatchingService.ts`
- **Composants** :
  - `JobMatchingHub.tsx`
  - `JobOfferInput.tsx`
  - `ProfileSelector.tsx`
  - `MatchingAnalysis.tsx`
  - `MatchingResult.tsx`
  - `RecommendationsPanel.tsx`

---

### 5. 🎓 **LINKEDIN COACH MODULE**

#### Features prévues 🚧
- **Import profil LinkedIn**
  - Via URL (profil public)
  - Copier-coller HTML
  - Scraping automatisé (si permissions)
- **Analyse complète du profil**
  - Score global (0-100%)
  - Analyse par section :
    - Photo de profil (qualité, professionnalisme)
    - Titre (mots-clés, accroche)
    - Résumé (storytelling, longueur)
    - Expérience (verbes d'action, résultats)
    - Compétences (endorsements, pertinence)
    - Recommandations
    - Publications / Articles
- **Recommandations section par section**
  - Avant / Après
  - Suggestions de réécriture IA
  - Best practices LinkedIn
  - Exemples de profils top performers
- **Générateur de contenu**
  - Posts LinkedIn optimisés
  - Résumé percutant
  - Suggestions de hashtags
  - Calendrier de publication

#### Architecture technique
- **Service IA** : `linkedinCoachService.ts`
- **Composants** :
  - `LinkedInCoachHub.tsx`
  - `ProfileImport.tsx`
  - `ProfileAnalysis.tsx`
  - `ProfileScorecard.tsx`
  - `SectionDetail.tsx`
  - `ContentSuggestions.tsx`
  - `BeforeAfterPreview.tsx`

---

### 6. 🔒 **VAULT (COFFRE-FORT DOCUMENTS)**

#### Features implémentées ✅
- **Stockage sécurisé local**
  - Chiffrement AES-256-GCM
  - Aucune synchronisation cloud par défaut
- **Import documents**
  - Drag & drop
  - Sélection fichier
  - Support : PDF, DOCX, images, ZIP
- **Catégorisation**
  - Diplômes
  - Contrats
  - Bulletins de salaire
  - Documents administratifs
  - Autres
- **Filtres & recherche**
  - Par catégorie
  - Par date
  - Par nom
  - Recherche full-text
- **Preview intégré**
  - PDF dans modal
  - Images en lightbox
  - Texte extractible
- **Export**
  - Déchiffrement à la volée
  - Backup chiffré

#### Features prévues 🚧
- Tags personnalisés
- OCR automatique (extraction texte images)
- Détection documents sensibles (auto-chiffrement renforcé)
- Expiration documents (rappels renouvellement)
- Partage sécurisé (lien temporaire chiffré)

---

### 7. 🏆 **REPUTATION MODULE**

#### Features prévues 🚧
- **Agrégation des avis**
  - Import avis Google
  - Import avis LinkedIn
  - Import témoignages manuels
- **Score de réputation**
  - Moyenne pondérée
  - Évolution dans le temps
  - Benchmarking secteur
- **Widgets à intégrer**
  - Badge réputation (pour portfolio)
  - Carrousel témoignages
  - Wall of love
- **Gestion des retours**
  - Demande d'avis automatisée
  - Templates emails
  - Suivi réponses

---

## 🎨 **DESIGN SYSTEM (CALM-UI)**

### Principes
- **Philosophy** : "Calm", "Clean", "Focus"
- **Couleurs douces** : Bleu, Teal, Purple, Pink avec glows
- **Typographie** : Sans-serif, weights 200-600
- **Animations** : Framer Motion (smooth, organic)
- **Glassmorphism** : Backdrop blur, transparence

### Composants disponibles
- **CalmCard** : Carte avec hover glow
- **CalmModal** : Modale glassmorphism
- **GlassInput** : Input avec backdrop blur
- **GlassTextArea** : Textarea verre dépoli
- **CalmButton** : Bouton avec states
- **NotificationToast** : Toasts animés
- **Sidebar** : Navigation latérale
- **Header** : Barre supérieure
- **OnboardingSlide** : Slides onboarding
- **PrivacyBadge** : Badge souveraineté
- **PremiumBadge** : Badge features premium

### Mascot Space
- **20vh réservé** en haut de chaque page
- Espace pour mascotte IA (à venir)
- Texte tutoriel contextuel

---

## 🤖 **INTELLIGENCE ARTIFICIELLE**

### Architecture sécurisée

**Flux d'anonymisation** :
1. **Données utilisateur** → Texte brut avec infos personnelles
2. **Anonymisation locale (Ollama)** → Llama 3.2 remplace entités
3. **Mapping chiffré stocké** → Base locale SQLite
4. **Envoi à Groq** → Seulement données anonymisées
5. **Réception réponse** → Texte avec placeholders
6. **Dé-anonymisation locale** → Remplacement inverse
7. **Affichage utilisateur** → Données complètes

### Services IA disponibles

#### 1. Portfolio Generation (aiEnrichmentServiceV4)
- **Provider** : DeepSeek V3 (prioritaire) ou Groq Llama 3.3
- **Génération séquencée** :
  - Hero + About (basé sur valueProp)
  - Services (basé sur expertises)
  - Projets (descriptions enrichies)
- **Prompts optimisés** :
  - Ton impersonnel obligatoire
  - Contraintes de longueur strictes
  - Pas de clichés

#### 2. AI Rewrite (aiRewriteService)
- **Provider** : DeepSeek ou Groq (fallback)
- **Réécriture guidée** par instructions user
- **Contraintes par champ** :
  - heroSubtitle : 15-30 mots
  - aboutText : 60-80 mots
  - valueProp : 20-30 mots
  - serviceDescription : 35-45 mots
  - projectDescription : 60-80 mots

#### 3. Job Matching (à venir)
- Analyse compatibilité offre/CV
- Score 0-100%
- Recommandations personnalisées

#### 4. LinkedIn Coach (à venir)
- Analyse profil LinkedIn
- Score par section
- Suggestions de réécriture

---

## 🔧 **ARCHITECTURE TECHNIQUE**

### Stack
| Couche | Technologie | Version |
|--------|-------------|---------|
| Runtime | Electron | 28+ |
| Frontend | React | 18+ |
| Langage | TypeScript | 5+ |
| Styling | CSS-in-JS | - |
| Animation | Framer Motion | 10+ |
| BDD | SQLite | 3 |
| Chiffrement | AES-256-GCM | - |
| IA locale | Ollama | - |
| IA cloud | DeepSeek V3, Groq | - |
| Images | Sharp | 0.33+ |
| PDF | pdf-lib | - |
| DOCX | docx | - |

### Communication IPC (Electron)

**Channels principaux** :
- `db-*` : Opérations base de données
- `ai-*` : Services IA
- `file-*` : Gestion fichiers
- `templates-*` : Templates portfolios
- `groq-*` / `deepseek-*` : Appels API IA

### Sécurité
- **Chiffrement AES-256-GCM** pour données sensibles
- **Stockage local uniquement** (pas de cloud par défaut)
- **Anonymisation** avant tout envoi vers IA cloud
- **Context isolation** Electron (preload bridge)
- **CSP** (Content Security Policy)

---

## 📊 **BASE DE DONNÉES (SQLite)**

### Tables principales
- `user_profiles` : Profil utilisateur
- `portfolios` : Portfolios créés
- `cvs` : CV créés
- `vault_documents` : Documents coffre-fort
- `job_offers` : Offres d'emploi analysées
- `job_matchings` : Résultats matching
- `linkedin_profiles` : Profils LinkedIn importés
- `linkedin_analyses` : Analyses LinkedIn
- `anonymization_maps` : Mappings anonymisation (chiffrés)
- `api_keys` : Clés API (chiffrées)
- `templates_owned` : Templates achetés

---

## 🚀 **ROADMAP**

### Phase 1 - MVP ✅ (Terminé)
- Home & Onboarding
- CV Module (basique)
- Portfolio Wizard V2
- Vault documents
- Design System CALM-UI
- IA Anonymisation

### Phase 2 - Enrichissement 🚧 (En cours)
- ✅ AI Rewrite Portfolio (Preview éditable) - **Terminé**
- 🚧 Templates CV Freemium (3-5 gratuits + premium) - **En développement**
- 🚧 ATS Scoring pour CV - **En développement**
- 📅 Job Matching Module - **Planifié**
- 📅 LinkedIn Coach Module - **Planifié**
- 🚧 Export PDF optimisé - **En cours**

### Phase 3 - Monétisation 📅 (Planifié)
- Marketplace templates
- Hébergement portfolios
- Features premium (AI illimité)
- Domaines personnalisés
- Analytics avancés

### Phase 4 - Écosystème 🔮 (Vision)
- API publique (pour intégrations)
- Plugins communautaires
- Mobile companion app
- Collaboration teams
- White-label pour entreprises

---

## 💰 **MONÉTISATION**

### Modèle Freemium

**Gratuit** :
- 3 portfolios
- 5 CV
- 10 templates gratuits
- 100 requêtes IA/mois
- Vault 100 documents
- Export HTML/PDF

**Premium (9.99€/mois)** :
- Portfolios illimités
- CV illimités
- Tous les templates (50+)
- IA illimitée
- Vault illimité
- Hébergement portfolios
- Domaine personnalisé
- Support prioritaire

**Pro (29.99€/mois)** :
- Tout Premium
- White-label (branding custom)
- API access
- Analytics avancés
- Multi-users (équipes)

---

## 🎯 **PROCHAINES FEATURES PRIORITAIRES**

### Court terme (2-4 semaines)

1. ✅ **Wizard Portfolio V2 + AI Rewrite** - Terminé (3 fév 2026)
2. 🚧 **Templates CV Freemium** - Sprint en cours
   - 3-5 templates gratuits (Classique ATS, Moderne, Créatif)
   - Structure boutique (comme Portfolio)
   - Preview + achat templates premium
3. 🚧 **ATS Scoring CV** - Sprint en cours
   - Score compatibilité 0-100%
   - Badge sur chaque template
   - Suggestions optimisation
4. 📅 **AI Rewrite pour CV** - Planifié (Sprint 3)
   - Réutilisation système Portfolio
   - Boutons ✨ sur expériences/compétences
   - Optimisation contenu ATS

### Moyen terme (1-2 mois)

5. 📅 **Job Matching Module** (Brief prêt)
6. 📅 **LinkedIn Coach Module** (Brief prêt)
7. 📅 **Multi-langues CV** (FR/EN/ES/DE avec traduction IA)
8. 📅 **Marketplace templates unifiée** (CV + Portfolio)

### Long terme (3-6 mois)

9. 📅 **Hébergement portfolios** (souverain.app/[username])
10. 📅 **Analytics visiteurs** (privacy-first)
11. 📅 **API publique** (intégrations tierces)
12. 📅 **Tests E2E complets** (automatisation QA)

---

## 📚 **DOCUMENTATION**

### Fichiers clés
- `DESIGN.md` : Design system CALM-UI
- `ARCHITECTURE.md` : Architecture technique complète
- `WORKFLOW-PORTFOLIO-MAITRE-V2.md` : Workflow portfolio
- `WIZARD-V2-IMPLEMENTATION.md` : Implémentation wizard V2
- `IMPLEMENTATION-2-SYSTEMES-EDITION.md` : Édition + AI Rewrite
- `BRIEF-JOB-MATCHING.md` : Spéc Job Matching
- `BRIEF-LINKEDIN-COACH.md` : Spéc LinkedIn Coach

---

**Fin du document** ✅  
**Dernière mise à jour** : 3 février 2026
