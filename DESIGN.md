# DESIGN.md - CALM-UI Design System

**Règle absolue :** Tous les nouveaux composants SOUVERAIN doivent respecter ce design system.

## 🎨 CALM-UI Principles

**CALM** = **C**onsistent, **A**ccessible, **L**ightweight, **M**inimalist

### Core Values
- ❌ **PAS d'émojis** dans l'UI (sauf cas exceptionnels type onboarding)
- ✅ **Icônes SVG uniquement** (Feather Icons ou custom)
- ✅ **Typographie cohérente** (design-system.ts)
- ✅ **Couleurs sémantiques** (theme colors)
- ✅ **Animations subtiles** (transitions.fast/normal/slow)

---

## 🎯 Typography

**Import :**
```typescript
import { typography } from '../../design-system';
```

**Tailles disponibles :**
```typescript
typography.fontSize = {
  xs: '0.75rem',    // 12px - Labels, badges
  sm: '0.875rem',   // 14px - Body secondaire
  base: '1rem',     // 16px - Body principal
  lg: '1.125rem',   // 18px - Sous-titres
  xl: '1.25rem',    // 20px - Titres sections
  '2xl': '1.5rem',  // 24px - Titres pages
  '3xl': '1.875rem',// 30px - Hero titles
}

typography.fontWeight = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
}
```

**Usage :**
```typescript
fontSize: typography.fontSize.base,
fontWeight: typography.fontWeight.semibold,
```

---

## 🎨 Colors (Theme-aware)

**Import :**
```typescript
import { useTheme } from '../../ThemeContext';
const { theme, mode } = useTheme();
```

**Couleurs disponibles :**
```typescript
// Texte
theme.text.primary    // Titres, texte principal
theme.text.secondary  // Descriptions, labels
theme.text.tertiary   // Placeholders, hints

// Backgrounds
theme.bg.primary      // Fond principal
theme.bg.secondary    // Cards, panels
theme.bg.tertiary     // Inputs, disabled states

// Borders
theme.border.default  // Bordures normales
theme.border.light    // Dividers, subtle borders

// Accents
theme.accent.primary  // Boutons CTA, highlights
theme.accent.secondary

// Sémantique
theme.semantic.success  // #10B981 (vert)
theme.semantic.warning  // #F59E0B (orange)
theme.semantic.error    // #EF4444 (rouge)
theme.semantic.info     // #3B82F6 (bleu)
```

**Exemple :**
```typescript
style={{
  color: theme.text.primary,
  backgroundColor: theme.bg.secondary,
  border: `1px solid ${theme.border.default}`,
}}
```

---

## 📐 Spacing & Radius

**Border Radius :**
```typescript
import { borderRadius } from '../../design-system';

borderRadius.sm   // 0.25rem (4px)
borderRadius.md   // 0.5rem (8px)
borderRadius.lg   // 0.75rem (12px)
borderRadius.xl   // 1rem (16px)
borderRadius.full // 9999px (cercle)
```

**Spacing conventions :**
```typescript
// Padding cards
padding: '1.5rem'  // Standard card padding

// Gaps
gap: '1rem'        // Entre éléments de même groupe
gap: '0.5rem'      // Entre icône et texte

// Margins sections
marginBottom: '2rem'  // Entre sections
```

---

## ⚡ Transitions

**Import :**
```typescript
import { transitions } from '../../design-system';
```

**Disponibles :**
```typescript
transitions.fast   // 150ms - Hover, petits éléments
transitions.normal // 300ms - Modals, panels
transitions.slow   // 500ms - Grandes animations
```

**Usage :**
```typescript
transition: transitions.fast,
// ou
transition: 'all 150ms ease',
```

---

## 🎭 Icons - SVG Uniquement

**❌ INTERDIT :**
```typescript
// Émojis
<span>📊</span>
<div>🔥 Actions prioritaires</div>
```

**✅ CORRECT :**
```typescript
// SVG inline (Feather Icons style)
const TrendingUpIcon = () => (
  <svg 
    width="20" 
    height="20" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2"
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);
```

**Icônes courantes disponibles :**

Consulter `/src/components/Sidebar.tsx` pour les icônes existantes :
- `FileText` - Documents, CV
- `TrendingUp` - Stats, croissance
- `Briefcase` - Portfolio, projets
- `Target` - Objectifs, jobs
- `Linkedin` - LinkedIn
- `Lock` - Sécurité, vault
- `ShoppingBag` - Boutique
- `Settings` - Paramètres
- `ChevronLeft` - Navigation

**Créer de nouvelles icônes :**
1. Aller sur [Feather Icons](https://feathericons.com)
2. Copier le SVG
3. Wrapper dans un composant React
4. Utiliser `currentColor` pour hériter la couleur

---

## 📦 Component Structure Template

```typescript
/**
 * [NOM] - [Description courte]
 */

import React from 'react';
import { useTheme } from '../../ThemeContext';
import { typography, borderRadius, transitions } from '../../design-system';

interface [NOM]Props {
  // Props typées
}

export const [NOM]: React.FC<[NOM]Props> = ({ ...props }) => {
  const { theme } = useTheme();

  // Styles memoizés si composant complexe
  const containerStyle: React.CSSProperties = {
    padding: '1.5rem',
    backgroundColor: theme.bg.secondary,
    border: `1px solid ${theme.border.default}`,
    borderRadius: borderRadius.lg,
  };

  return (
    <div style={containerStyle}>
      {/* Contenu */}
    </div>
  );
};
```

---

## 🚫 Anti-Patterns (À ÉVITER)

### ❌ Émojis hardcodés
```typescript
<h2>🔥 Actions prioritaires</h2>
```

### ❌ Couleurs hardcodées
```typescript
backgroundColor: '#3A3A3A'  // Utiliser theme.bg.secondary
color: '#FFFFFF'            // Utiliser theme.text.primary
```

### ❌ Font-sizes en px
```typescript
fontSize: '16px'  // Utiliser typography.fontSize.base
```

### ❌ Transitions inline sans variable
```typescript
transition: 'all 0.3s ease'  // Utiliser transitions.normal
```

---

## ✅ Checklist Nouveau Composant

Avant de commit un nouveau composant :

- [ ] Import `useTheme`, `typography`, `borderRadius`, `transitions`
- [ ] Utilise `theme.*` pour toutes les couleurs
- [ ] Utilise `typography.fontSize.*` pour les tailles
- [ ] Utilise `borderRadius.*` pour les arrondis
- [ ] Utilise `transitions.*` pour les animations
- [ ] **Aucun émoji** dans le JSX (sauf onboarding)
- [ ] **Icônes SVG uniquement** (pas d'émojis, pas d'images)
- [ ] Types TypeScript complets
- [ ] Compatible dark/light mode (via `theme`)

---

## 📚 Références

- **Design System :** `/src/design-system.ts`
- **Theme Context :** `/src/ThemeContext.tsx`
- **Icônes existantes :** `/src/components/Sidebar.tsx`
- **Exemples CALM-UI :**
  - `/src/components/reputation/` (module récent conforme)
  - `/src/components/portfolio/wizard/` (wizard v2)

---

## 🎯 Objectif

**Chaque nouveau composant doit être indiscernable des composants existants.**  
Cohérence > Créativité.  
CALM-UI = Expérience utilisateur apaisante et professionnelle.
