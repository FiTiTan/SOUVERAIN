# Mode Light - Spécifications

## Objectif
Faire tourner SOUVERAIN sur **toutes les configs**, y compris machines anciennes/faibles.

---

## Détection Automatique

**Critères pour activer Light Mode par défaut:**
- RAM < 8 GB
- CPU < 4 cores ou vieux (>5 ans)
- Electron performance score faible

**API Electron:**
```javascript
const { cpus, totalmem } = require('os');
const totalRAM = totalmem() / (1024 ** 3); // GB
const cpuCount = cpus().length;

const isLowEnd = totalRAM < 8 || cpuCount < 4;
```

---

## Features Mode Light

### ❌ Désactivé en Light Mode

**1. AI Workers (WebLLM)**
- Plus gros consommateur de RAM (~2-4 GB)
- Fallback: API Groq uniquement (cloud)
- Gain: -2 GB RAM, -50% CPU

**2. Framer Motion (animations)**
- Remplacer par CSS transitions
- Gain: -30% render time, -20% bundle

**3. Image optimization real-time**
- Désactiver Sharp processing
- Utiliser thumbnails pré-générées seulement
- Gain: -40% CPU sur médiathèque

**4. Auto-save fréquent**
- Sauvegardes: 30s → 2min
- Gain: -20% I/O

**5. Syntax highlighting (Code preview)**
- Désactiver Monaco Editor
- Fallback: plain text
- Gain: -100 MB RAM

### ✅ Gardé (Optimisé)

**1. Base de données SQLite**
- Déjà léger
- Optimiser: PRAGMA cache_size = 2000 (au lieu de default)

**2. PDF Generation**
- Nécessaire pour export CV
- Mais: lazy load (charger seulement si utilisé)

**3. Interface React**
- Léger si bien optimisé
- Skeleton screens au lieu de loaders animés

---

## Settings UI

**Ajout dans Settings.tsx:**

```typescript
const [performanceMode, setPerformanceMode] = useState<'auto' | 'performance' | 'light'>('auto');

// Auto-detect
useEffect(() => {
  if (performanceMode === 'auto') {
    const isLowEnd = await window.api.detectPerformance();
    setActualMode(isLowEnd ? 'light' : 'performance');
  }
}, [performanceMode]);
```

**UI:**
```
Performances
├─ Mode : [Auto] [Performance] [Light]
├─ Animations : [Auto] [Activées] [Désactivées]
├─ IA Locale : [Auto] [Activée] [Cloud uniquement]
└─ Optimisations image : [Auto] [Activées] [Désactivées]
```

---

## Gains Estimés (Light vs Performance)

| Métrique | Performance | Light | Gain Light |
|----------|-------------|-------|------------|
| RAM (idle) | 500 MB | 200 MB | **-60%** |
| RAM (AI actif) | 2-4 GB | 500 MB | **-80%** |
| CPU (render) | 40% | 15% | **-62%** |
| Bundle size | 120 MB | 50 MB | **-58%** |
| Startup time | 8s | 4s | **-50%** |

---

## Implémentation Phases

### Phase 1 (Quick)
- ✅ Détection auto config
- ✅ Toggle animations (CSS vs framer-motion)
- ✅ Désactiver WebLLM en light mode

### Phase 2 (Medium)
- ✅ Lazy load Sharp/Monaco
- ✅ Optimiser SQLite (PRAGMA)
- ✅ Skeleton screens partout

### Phase 3 (Advanced)
- ✅ Bundle splitting par mode (light.bundle.js vs full.bundle.js)
- ✅ Service worker pour cache
- ✅ Progressive enhancement

---

## Target Configs

**Light Mode doit tourner sur:**
- Surface Pro 6 (i5-8350U, 8 GB) ✅ Config de référence
- MacBook Air 2015 (i5, 8 GB)
- PC portables entreprise basiques (i3, 4 GB)
- Même: Raspberry Pi 4 (4 GB) 😎

**Performance Mode:**
- MacBook Pro M1+ (16+ GB)
- PC gaming/workstation (16+ GB, GPU dédié)
- Desktop récents

---

## Notes Techniques

**Bundler config (vite.config.ts):**
```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: (id) => {
        // Heavy modules → lazy chunk
        if (id.includes('framer-motion')) return 'animations-heavy';
        if (id.includes('monaco-editor')) return 'editor-heavy';
        if (id.includes('@mlc-ai')) return 'ai-heavy';
        
        // Light mode: skip these chunks
        if (process.env.MODE === 'light') return 'excluded';
      }
    }
  }
}
```

---

## User Communication

**First run:**
```
⚙️ Configuration détectée:
• RAM: 8 GB
• CPU: Intel i5-8350U

Nous recommandons le Mode Light pour de meilleures performances.

[Activer Mode Light]  [Rester en Auto]
```

**In-app badge (Settings):**
```
🪶 Mode Light activé
Performance optimisée pour votre machine
```

---

**Auteur:** Jean-Louis  
**Date:** 2026-01-31  
**Priorité:** Haute (vision produit: accessible à tous)
