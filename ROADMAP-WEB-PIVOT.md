# ROADMAP — Pivot Web SOUVERAIN

> **Objectif** : Transformer SOUVERAIN en Career OS web-first, mobile-friendly  
> **Timeline** : 6 semaines MVP (CV Coach) + 4 semaines (Portfolio)  
> **Stack** : Next.js 14 + Supabase + Vercel + Stripe

---

## 🧱 Stack Technique

### Pourquoi cette stack ?

| Techno | Rôle | Alternative Electron |
|--------|------|---------------------|
| **Next.js 14** | Framework React web (App Router) | Vite + React |
| **Supabase** | BDD + Auth + Storage + Realtime | SQLite + custom auth |
| **Vercel** | Hosting + CDN + Edge Functions | Electron packaging |
| **Stripe** | Paiements + Abonnements | — |
| **Groq** | LLM rapide (Llama 3.1 70B) | Ollama local |
| **Tailwind CSS** | Styling (déjà utilisé) | CALM-UI |

### Architecture simplifiée

```
┌─────────────────────────────────────────────────────┐
│                    VERCEL                           │
│  ┌─────────────────────────────────────────────┐   │
│  │           Next.js App Router                │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────────┐   │   │
│  │  │ Landing │ │ CV Coach│ │  Portfolio  │   │   │
│  │  │  Page   │ │   App   │ │   Wizard    │   │   │
│  │  └─────────┘ └─────────┘ └─────────────┘   │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
           │              │              │
           ▼              ▼              ▼
┌─────────────────────────────────────────────────────┐
│                   SUPABASE                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │
│  │ Auth     │  │ Database │  │ Storage          │  │
│  │ (OAuth)  │  │ (Postgres)│  │ (CV PDFs, images)│  │
│  └──────────┘  └──────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────┘
           │
           ▼
┌─────────────────┐    ┌─────────────────┐
│   Groq API      │    │   Stripe        │
│ (LLM Analysis)  │    │  (Payments)     │
└─────────────────┘    └─────────────────┘
```

---

## 📅 Phase 1 : MVP CV Coach (6 semaines)

### Semaine 1 — Fondations

**Objectif** : Projet initialisé, auth fonctionnelle, landing déployée

#### Tâches

- [ ] Créer projet Next.js 14 (App Router, TypeScript)
  ```bash
  npx create-next-app@latest souverain-web --typescript --tailwind --app
  ```
- [ ] Configurer Supabase
  - [ ] Créer projet sur supabase.com
  - [ ] Configurer Auth (email + Google OAuth)
  - [ ] Créer table `users` avec extension RLS
- [ ] Landing page
  - [ ] Hero section ("Analysez votre CV en 30 secondes")
  - [ ] Features preview (3 modules)
  - [ ] Waitlist form (email → Supabase)
  - [ ] Footer + mentions légales
- [ ] Déployer sur Vercel (auto-deploy on push)
- [ ] Configurer domaine (souverain.fr ou souverain.app)

#### Livrables

- ✅ URL live avec landing + waitlist
- ✅ Auth email/Google fonctionnelle
- ✅ CI/CD automatique

#### Critères de Done

- [ ] Landing accessible sur le domaine
- [ ] Inscription/connexion OK
- [ ] Emails waitlist stockés en BDD

---

### Semaine 2 — Upload & Extraction CV

**Objectif** : L'utilisateur peut uploader un CV et on extrait le texte

#### Tâches

- [ ] Page `/dashboard` protégée (auth required)
- [ ] Composant `CVUploader`
  - [ ] Drag & drop PDF
  - [ ] Validation (PDF only, max 5MB)
  - [ ] Preview du fichier
- [ ] Supabase Storage bucket `cvs`
  - [ ] Upload sécurisé (RLS: user peut voir que ses fichiers)
- [ ] Extraction texte PDF
  - [ ] Option A : `pdf-parse` côté API route
  - [ ] Option B : Service externe (Unstructured.io)
- [ ] Table `cv_analyses`
  ```sql
  create table cv_analyses (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id),
    file_path text not null,
    raw_text text,
    status text default 'pending', -- pending, processing, done, error
    created_at timestamptz default now()
  );
  ```

#### Livrables

- ✅ Upload CV fonctionnel
- ✅ Texte extrait et stocké
- ✅ Historique des CVs uploadés

---

### Semaine 3 — Intégration IA (Groq + Prompt V5)

**Objectif** : Analyse complète du CV avec le prompt BMAD

#### Tâches

- [ ] API route `/api/analyze`
  - [ ] Récupérer le texte du CV
  - [ ] Appeler Groq avec prompt V5
  - [ ] Parser la réponse JSON
  - [ ] Sauvegarder en BDD
- [ ] Migrer le prompt V5 existant
  - [ ] Adapter au format API (pas Electron)
  - [ ] Garder scoring BMAD intact
- [ ] Table `cv_results`
  ```sql
  create table cv_results (
    id uuid primary key default gen_random_uuid(),
    analysis_id uuid references cv_analyses(id),
    score_global int,
    scores_detail jsonb, -- {technique: 85, experience: 72, ...}
    strengths jsonb,     -- ["Point fort 1", "Point fort 2"]
    weaknesses jsonb,
    recommendations jsonb,
    raw_response jsonb,  -- Réponse complète pour debug
    created_at timestamptz default now()
  );
  ```
- [ ] Gestion des erreurs / retry
- [ ] Rate limiting (1 analyse free / jour)

#### Livrables

- ✅ Analyse IA complète
- ✅ Scores BMAD calculés
- ✅ Recommandations générées

---

### Semaine 4 — UI Rapport Interactif

**Objectif** : Interface de visualisation du rapport, partage public

#### Tâches

- [ ] Page `/report/[id]`
  - [ ] Score global avec jauge animée
  - [ ] Breakdown par catégorie (radar chart)
  - [ ] Liste forces/faiblesses
  - [ ] Recommandations actionnables
- [ ] Composants UI
  - [ ] `ScoreGauge` — jauge circulaire animée
  - [ ] `RadarChart` — chart.js ou recharts
  - [ ] `RecommendationCard` — cards avec priorité
- [ ] Mode public
  - [ ] URL partageable `/report/[id]?public=true`
  - [ ] Meta tags OpenGraph (preview LinkedIn/Twitter)
  - [ ] Bouton "Partager mon score"
- [ ] Dashboard utilisateur
  - [ ] Liste des analyses passées
  - [ ] Comparaison entre versions

#### Livrables

- ✅ Rapport visuel complet
- ✅ URL partageable avec preview social
- ✅ Historique des analyses

---

### Semaine 5 — Monétisation Stripe

**Objectif** : Plans Free/Pro, paywall fonctionnel

#### Tâches

- [ ] Intégration Stripe
  - [ ] Compte Stripe + produits/prix
  - [ ] Stripe Checkout pour upgrade
  - [ ] Webhooks pour sync abonnements
- [ ] Plans
  ```
  FREE:  1 analyse/mois, rapport basique
  PRO:   €19/mois — Illimité, rapport complet, export PDF, historique
  ```
- [ ] Table `subscriptions`
  ```sql
  create table subscriptions (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id),
    stripe_customer_id text,
    stripe_subscription_id text,
    plan text default 'free', -- free, pro
    status text,              -- active, canceled, past_due
    current_period_end timestamptz,
    created_at timestamptz default now()
  );
  ```
- [ ] Paywall logic
  - [ ] Check quota avant analyse
  - [ ] Modal upgrade si quota atteint
  - [ ] Customer portal pour gérer abo
- [ ] Export PDF du rapport (feature Pro)

#### Livrables

- ✅ Paiement Stripe fonctionnel
- ✅ Gestion abonnements
- ✅ Paywall + upgrade flow

---

### Semaine 6 — Polish & Launch

**Objectif** : Prêt pour lancement public

#### Tâches

- [ ] SEO
  - [ ] Meta tags toutes pages
  - [ ] Sitemap.xml
  - [ ] robots.txt
  - [ ] Landing pages sectorielles (/cv-developpeur, /cv-commercial)
- [ ] Analytics
  - [ ] Vercel Analytics ou Plausible
  - [ ] Events tracking (upload, analyse, upgrade)
- [ ] Emails transactionnels
  - [ ] Welcome email
  - [ ] Rapport prêt (avec lien)
  - [ ] Resend ou Supabase Edge Functions
- [ ] Tests
  - [ ] Flow complet E2E
  - [ ] Test de charge basique
- [ ] Legal
  - [ ] CGU / CGV
  - [ ] Politique de confidentialité
  - [ ] Bandeau cookies RGPD
- [ ] Launch prep
  - [ ] Product Hunt draft
  - [ ] Screenshots / vidéo démo
  - [ ] Liste beta testers waitlist

#### Livrables

- ✅ App production-ready
- ✅ SEO configuré
- ✅ Prêt pour Product Hunt

---

## 📅 Phase 2 : Portfolio Wizard (Semaines 7-10)

### Semaine 7-8 — Migration Wizard

- [ ] Wizard 4 étapes (simplifié de 7)
  - [ ] Identité (nom, métier, bio)
  - [ ] Réalisations (projets, médias)
  - [ ] Style (template, couleurs)
  - [ ] Publication
- [ ] Migration `ProfileContextDetector`
- [ ] 3 templates sectoriels (artisan/tech/food)

### Semaine 9 — Hébergement & Domaines

- [ ] Publication sur `username.souverain.fr`
- [ ] Custom domain support
- [ ] SSL automatique (Vercel)

### Semaine 10 — Monétisation Portfolio

- [ ] Paywall templates premium
- [ ] Watermark sur plan Free
- [ ] Analytics portfolio (vues, clics)

---

## 📅 Phase 3 : Job Matching (Semaines 11-14)

- [ ] Scraping offres FR (France Travail API, Indeed)
- [ ] Matching CV ↔ Offres
- [ ] Dashboard candidatures
- [ ] Alertes email

---

## 💰 Modèle de Revenue

| Plan | Prix | Limites |
|------|------|---------|
| **FREE** | 0€ | 1 analyse CV/mois, 1 portfolio (watermark) |
| **PRO** | 19€/mois | Illimité, export PDF, 3 portfolios, custom domain |
| **BUSINESS** | 49€/mois | Tout PRO + API, analytics avancés, support prio |

### Projections M12

- 2000-3000 users free
- 3-5% conversion Pro → 60-150 clients
- MRR cible : €1,500-3,000
- + Boutique templates : €3-8K one-time

---

## 🛠️ Migration depuis Electron

### Ce qu'on garde

- ✅ Prompt V5 + BMAD (cœur de l'analyse)
- ✅ ProfileContext detector (logique JS pure)
- ✅ Templates portfolio (HTML/CSS)
- ✅ Design system Tailwind

### Ce qu'on abandonne

- ❌ SQLite local → Supabase Postgres
- ❌ IPC Electron → API Routes Next.js
- ❌ File system local → Supabase Storage
- ❌ Ollama local → Groq cloud

### Fichiers à migrer

| Source (Electron) | Destination (Next.js) |
|-------------------|----------------------|
| `src/services/profileContextDetector.ts` | `lib/profile-context.ts` |
| `groq-client.cjs` | `lib/groq.ts` |
| `templates/` | `public/templates/` ou composants React |
| Prompts V5 | `lib/prompts/cv-analysis.ts` |

---

## 📁 Structure Projet Cible

```
souverain-web/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx           # Dashboard home
│   │   ├── cv/
│   │   │   ├── page.tsx       # Liste analyses
│   │   │   └── [id]/page.tsx  # Détail analyse
│   │   └── portfolio/
│   │       ├── page.tsx       # Liste portfolios
│   │       └── wizard/page.tsx
│   ├── report/[id]/page.tsx   # Rapport public
│   ├── api/
│   │   ├── analyze/route.ts
│   │   ├── stripe/webhook/route.ts
│   │   └── portfolio/publish/route.ts
│   ├── layout.tsx
│   └── page.tsx               # Landing
├── components/
│   ├── ui/                    # Shadcn/ui
│   ├── cv/
│   │   ├── CVUploader.tsx
│   │   ├── ScoreGauge.tsx
│   │   └── ReportView.tsx
│   └── portfolio/
│       └── WizardSteps.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   ├── stripe.ts
│   ├── groq.ts
│   ├── profile-context.ts
│   └── prompts/
│       └── cv-analysis.ts
├── public/
│   └── templates/
└── supabase/
    └── migrations/
```

---

## ⚡ Quick Start (Semaine 1)

```bash
# 1. Créer le projet
npx create-next-app@latest souverain-web --typescript --tailwind --app --src-dir

# 2. Installer dépendances
cd souverain-web
npm install @supabase/supabase-js @supabase/ssr stripe @stripe/stripe-js

# 3. Configurer Supabase
npx supabase init
npx supabase login
npx supabase link --project-ref <your-project-ref>

# 4. Variables d'environnement (.env.local)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
GROQ_API_KEY=xxx
STRIPE_SECRET_KEY=xxx
STRIPE_WEBHOOK_SECRET=xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=xxx

# 5. Déployer
vercel
```

---

## 📊 KPIs à tracker

| Métrique | Cible S6 | Cible S12 |
|----------|----------|-----------|
| Users inscrits | 200 | 2000 |
| CVs analysés | 500 | 5000 |
| Conversion Free→Pro | — | 3-5% |
| MRR | €0 | €1500-3000 |
| NPS | — | >40 |

---

## 🚀 Go/No-Go Checklist Semaine 6

- [ ] Landing convertit >5% visiteurs → waitlist
- [ ] Auth 0 bug
- [ ] Analyse CV <30s
- [ ] Rapport lisible mobile
- [ ] Paiement Stripe testé (mode test)
- [ ] 50+ beta testers ont validé le flow
- [ ] Legal OK (CGU, RGPD)

---

*Créé le 2026-02-05 — Pivot Web SOUVERAIN*
