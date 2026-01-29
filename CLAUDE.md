# SOUVERAIN - Instructions Agent

> Ce fichier guide les agents IA (Claude Code, Gemini CLI, Cursor) pour travailler sur ce projet.

---

## 🎯 Contexte Projet

**SOUVERAIN** est une application desktop Electron permettant aux professionnels de :
- Créer des portfolios web (Module Portfolio Maître ✅)
- Analyser et optimiser leurs CV (Module Audit CV - à venir)
- Gérer leurs réalisations professionnelles

**Principe fondamental** : Souveraineté des données. Tout est local, chiffré, avec anonymisation avant tout traitement cloud.

---

## 🛠 Stack Technique

| Couche | Technologie |
|--------|-------------|
| Runtime | Electron |
| Frontend | React 18 + TypeScript |
| State | React Context + useState |
| Styling | **CALM-UI** (voir section dédiée) |
| Animations | Framer Motion |
| DB | SQLite avec better-sqlite3 (chiffré AES-256) |
| IA locale | Ollama (Mistral / Llama 3.2) |
| IA cloud | Groq API (avec anonymisation obligatoire) |
| Icons | Lucide React |

---

## 🎨 Design System : CALM-UI

**CALM = Clean, Accessible, Lightweight, Modern**

### Composants obligatoires

```tsx
// Toujours utiliser ces composants, jamais de HTML brut pour les UI
import { CalmCard } from '@/components/ui/CalmCard';
import { CalmModal } from '@/components/ui/CalmModal';
import { GlassInput, GlassTextArea, GlassSelect } from '@/components/ui/GlassForms';
import { useToast } from '@/components/ui/NotificationToast';
```

### Règles de style

```tsx
// ✅ BON - Utiliser le ThemeContext
const { theme, mode } = useTheme();
<div style={{ backgroundColor: theme.bg.secondary, color: theme.text.primary }}>

// ❌ MAUVAIS - Couleurs en dur
<div style={{ backgroundColor: '#ffffff', color: '#000000' }}>
```

### Glassmorphisme standard

```tsx
// Pattern pour surfaces glass
style={{
  background: mode === 'dark' 
    ? 'rgba(30, 41, 59, 0.6)' 
    : 'rgba(255, 255, 255, 0.7)',
  backdropFilter: 'blur(20px)',
  border: `1px solid ${theme.border.light}`,
  borderRadius: '16px',
}}
```

### Animations Framer Motion

```tsx
// Entrance standard
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
```

**Documentation complète** : `docs/CALM-UI.md`

---

## 📁 Structure des Fichiers

```
souverain/
├── src/
│   ├── main.cjs              # Process Electron principal
│   ├── preload.cjs           # Bridge IPC sécurisé
│   ├── database.cjs          # Couche SQLite
│   ├── App.tsx               # Entry React
│   ├── ThemeContext.tsx      # Provider dark/light
│   ├── design-system.ts      # Tokens CALM-UI
│   │
│   ├── components/
│   │   ├── ui/               # Composants CALM-UI (ne pas modifier)
│   │   ├── layout/           # Sidebar, Header
│   │   ├── portfolio/        # Module Portfolio Maître
│   │   ├── cv/               # Module Audit CV
│   │   └── common/           # Composants partagés
│   │
│   └── services/
│       ├── ollamaService.ts
│       ├── groqPortfolioGeneratorService.ts
│       └── anonymizationService.ts
│
└── docs/
    ├── PRD.md                # Vision produit
    ├── ARCHITECTURE.md       # Architecture technique
    ├── CALM-UI.md            # Design system
    └── modules/              # PRD par module
```

---

## 🔌 Communication IPC

### Pattern standard

```tsx
// Côté Renderer (React)
const data = await window.electron.invoke('handler-name', params);

// Côté Main (Electron) - dans main.cjs
ipcMain.handle('handler-name', async (event, params) => {
  return db.someMethod(params);
});
```

### Convention de nommage

```
db-get-*         → Lecture DB
db-create-*      → Création
db-update-*      → Mise à jour
db-delete-*      → Suppression
analyze-*        → Traitement IA
render-*         → Génération HTML/PDF
export-*         → Export fichier
check-*          → Vérification status
```

---

## 🔒 Sécurité IA

### Règle absolue

> **Jamais** de données personnelles vers Groq API sans anonymisation préalable.

### Flow obligatoire

```
Données brutes → Ollama NER (local) → Données anonymisées → Groq API → Résultat → Dé-anonymisation
```

### Exemple

```typescript
// 1. Anonymiser localement
const { anonymizedText, entityMap } = await anonymizeText(rawText);

// 2. Envoyer à Groq (safe)
const result = await groqGenerate(anonymizedText);

// 3. Dé-anonymiser le résultat
const finalText = deanonymize(result, entityMap);
```

---

## ✅ Conventions de Code

### Nommage

| Type | Convention | Exemple |
|------|------------|---------|
| Composants | PascalCase | `PortfolioEditor.tsx` |
| Hooks | camelCase + use | `usePortfolio.ts` |
| Services | camelCase + Service | `portfolioService.ts` |
| Handlers IPC | kebab-case | `'db-get-portfolio'` |

### Structure composant

```tsx
// 1. Imports (React, libs, local)
// 2. Types/Interfaces
// 3. Composant avec hooks en premier
// 4. Export
```

### Gestion d'erreurs

```tsx
// Toujours try/catch avec toast
try {
  const result = await window.electron.invoke('...');
  toast.success('Succès');
} catch (error) {
  toast.error('Erreur', error.message);
  console.error(error);
}
```

---

## 📚 Documentation de Référence

| Document | Contenu |
|----------|---------|
| `docs/PRD.md` | Vision produit, roadmap, personas |
| `docs/ARCHITECTURE.md` | Stack, DB, IPC, patterns |
| `docs/CALM-UI.md` | Design system complet |
| `docs/modules/*.md` | PRD par module |

---

## 🚧 Module Actif

<!-- 
METTRE À JOUR CETTE SECTION QUAND TU CHANGES DE MODULE
Ou simplement préciser en début de conversation avec l'agent
-->

### Actuellement : Tests & Stabilisation

**Statut** : Portfolio Maître 100% implémenté, phase de tests

**Priorités** :
1. Tester le flux complet création → génération → export
2. Corriger les bugs identifiés
3. Préparer le module Audit CV

**Fichiers concernés** :
- `src/components/portfolio/**`
- `src/services/groqPortfolioGeneratorService.ts`

---

## ⚠️ Points d'Attention

1. **Ne jamais modifier** les composants dans `src/components/ui/` sans raison majeure
2. **Toujours** utiliser le ThemeContext, jamais de couleurs en dur
3. **Toujours** anonymiser avant envoi cloud
4. **Toujours** gérer les erreurs avec try/catch + toast
5. **Préférer** les handlers IPC existants avant d'en créer de nouveaux

---

## 🆘 En cas de doute

1. Consulter `docs/ARCHITECTURE.md` pour les patterns
2. Consulter `docs/CALM-UI.md` pour le design
3. Regarder les composants existants comme référence
4. Demander clarification plutôt que deviner

---

*Dernière mise à jour : 27 janvier 2026 - V17*
