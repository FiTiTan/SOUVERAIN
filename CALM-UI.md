# CALM-UI Design System
## SOUVERAIN V17 - Documentation du Design

---

## 🎨 Philosophie du Design

**CALM = Clean, Accessible, Lightweight, Modern**

Le design de SOUVERAIN suit une approche minimaliste et élégante inspirée par :
- **Google Material Design** : Clarté, hiérarchie visuelle, micro-interactions
- **Palantir Foundry** : Glassmorphism, surfaces semi-transparentes, data-density
- **Apple HIG** : Espacements généreux, typographie lisible, animations fluides

### Principes Clés
1. **Respiration** : Espaces blancs généreux, pas de surcharge visuelle
2. **Glassmorphisme** : Surfaces semi-transparentes avec backdrop-filter
3. **Monochrome + Accent** : Palette grise neutre avec un accent bleu professionnel
4. **Mode Sombre First** : Les deux modes (clair/sombre) sont équivalents
5. **Micro-interactions** : Feedbacks subtils à chaque action utilisateur

---

## 🎨 Palette de Couleurs

### Mode Clair (Light)
```typescript
bg: {
  primary: '#FAFAFA',      // Fond principal (blanc cassé)
  secondary: '#FFFFFF',    // Cards, surfaces blanches
  tertiary: '#F5F5F5',     // Bento boxes, zones secondaires
  elevated: '#FFFFFF',     // Modals, dropdowns (au-dessus)
  document: '#FFFFFF',     // Preview document A4
}

text: {
  primary: '#1A1A1A',      // Titres, texte principal (noir)
  secondary: '#4A4A4A',    // Sous-titres, labels (gris foncé)
  tertiary: '#717171',     // Hints, placeholders (gris moyen)
  muted: '#9E9E9E',        // Désactivé (gris clair)
  inverse: '#FFFFFF',      // Texte sur fond sombre
}

border: {
  light: '#E8E8E8',        // Bordures très subtiles
  default: '#D4D4D4',      // Bordures standards
  strong: '#BDBDBD',       // Bordures contrastées
}

accent: {
  primary: '#2563EB',      // Bleu professionnel (CTA, focus)
  secondary: '#3B82F6',    // Hover states
  tertiary: '#60A5FA',     // Accents légers
  muted: '#DBEAFE',        // Backgrounds avec accent
}
```

### Mode Sombre (Dark)
```typescript
bg: {
  primary: '#0F0F0F',      // Fond principal (noir profond)
  secondary: '#171717',    // Cards, surfaces
  tertiary: '#1F1F1F',     // Bento boxes
  elevated: '#262626',     // Modals
  document: '#1A1A1A',     // Preview document (légèrement plus clair)
}

text: {
  primary: '#F5F5F5',      // Titres, texte principal (blanc cassé)
  secondary: '#A3A3A3',    // Sous-titres (gris clair)
  tertiary: '#737373',     // Hints (gris moyen)
  muted: '#525252',        // Désactivé
  inverse: '#0F0F0F',      // Texte sur fond clair
}

border: {
  light: '#262626',
  default: '#333333',
  strong: '#404040',
}

accent: {
  primary: '#3B82F6',      // Bleu plus lumineux en mode sombre
  secondary: '#60A5FA',
  tertiary: '#93C5FD',
  muted: '#1E3A5F',
}
```

### Couleurs Sémantiques
```typescript
semantic: {
  success: '#16A34A' / '#22C55E',       // Vert (light/dark)
  successBg: '#DCFCE7' / '#14532D',     // Fond vert
  warning: '#CA8A04' / '#EAB308',       // Jaune/Orange
  warningBg: '#FEF9C3' / '#422006',
  error: '#DC2626' / '#EF4444',         // Rouge
  errorBg: '#FEE2E2' / '#450A0A',
  info: '#2563EB' / '#3B82F6',          // Bleu
  infoBg: '#DBEAFE' / '#1E3A5F',
}
```

### Couleurs de Score (Gradient 1-10)
```typescript
score: {
  excellent: '#16A34A' / '#22C55E',     // 9-10 points (Vert)
  good: '#22C55E' / '#4ADE80',          // 7-8 points (Vert clair)
  average: '#EAB308' / '#FACC15',       // 5-6 points (Jaune)
  poor: '#F97316' / '#FB923C',          // 3-4 points (Orange)
  critical: '#DC2626' / '#EF4444',      // 1-2 points (Rouge)
}
```

---

## ✍️ Typographie

### Familles de Police
```typescript
fontFamily: {
  sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  mono: "'JetBrains Mono', 'Fira Code', monospace",
  document: "'Georgia', 'Times New Roman', serif", // Pour previews A4
}
```

### Échelle de Tailles
```typescript
fontSize: {
  xs: '0.75rem',     // 12px - Labels, badges
  sm: '0.875rem',    // 14px - Body text secondaire
  base: '1rem',      // 16px - Body text principal
  lg: '1.125rem',    // 18px - Sous-titres
  xl: '1.25rem',     // 20px - Titres de sections
  '2xl': '1.5rem',   // 24px - Titres de pages
  '3xl': '1.875rem', // 30px - Hero titles
  '4xl': '2.25rem',  // 36px - Landing pages
}
```

### Poids & Hauteur de Ligne
```typescript
fontWeight: {
  normal: 400,    // Body text
  medium: 500,    // Labels
  semibold: 600,  // Boutons, titres secondaires
  bold: 700,      // Titres principaux
}

lineHeight: {
  tight: 1.25,    // Titres
  normal: 1.5,    // Body text
  relaxed: 1.75,  // Texte long (documentation)
}
```

---

## 📐 Espacements & Layout

### Échelle d'Espacement
```typescript
spacing: {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px (base)
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
}
```

### Border Radius
```typescript
borderRadius: {
  none: '0',
  sm: '0.25rem',   // 4px - Badges, tags
  md: '0.5rem',    // 8px - Inputs, petits boutons
  lg: '0.75rem',   // 12px - Cards, boutons standards
  xl: '1rem',      // 16px - Large cards
  '2xl': '1.5rem', // 24px - Modals, grands containers
  full: '9999px',  // Pills, boutons ronds
}
```

### Ombres (Shadows)
```typescript
shadow: {
  sm: '0 1px 2px rgba(0,0,0,0.05)',              // Subtle hover
  md: '0 4px 6px rgba(0,0,0,0.05)',              // Cards
  lg: '0 10px 15px rgba(0,0,0,0.05)',            // Elevated cards
  xl: '0 20px 25px rgba(0,0,0,0.08)',            // Modals
  // Mode sombre: opacité plus élevée (0.3-0.4)
}
```

---

## 🧩 Composants UI

### 1. CalmCard (Composant Principal)

**Usage :** Cards interactives avec glassmorphisme et effet hover.

**Props :**
```typescript
{
  title: string;                  // Titre de la card
  description?: string;           // Description optionnelle
  icon?: React.ReactNode;         // Icône (emoji ou SVG)
  themeColor?: 'blue' | 'teal' | 'purple' | 'pink' | 'orange';
  recommended?: boolean;          // Badge "RECOMMENDED"
  disabled?: boolean;             // État désactivé
  onClick?: () => void;
  style?: React.CSSProperties;
}
```

**Caractéristiques :**
- Glassmorphisme : `backdrop-filter: blur(20px)`
- Dimensions : `minWidth: 280px`, `maxWidth: 320px`, `minHeight: 360px`
- Border radius : `32px`
- Padding : `2.5rem 2rem`
- Hover : Translation `-8px` + scale `1.02` + glow effect
- Icône circulaire : `80px x 80px` avec gradient radial

**Couleurs thématiques :**
```typescript
colors = {
  blue: { shadow: 'rgba(59, 130, 246, 0.4)', bg: 'rgba(59, 130, 246, 0.1)' },
  teal: { shadow: 'rgba(20, 184, 166, 0.4)', bg: 'rgba(20, 184, 166, 0.1)' },
  purple: { shadow: 'rgba(139, 92, 246, 0.4)', bg: 'rgba(139, 92, 246, 0.1)' },
  pink: { shadow: 'rgba(236, 72, 153, 0.4)', bg: 'rgba(236, 72, 153, 0.1)' },
  orange: { shadow: 'rgba(245, 158, 11, 0.4)', bg: 'rgba(245, 158, 11, 0.1)' }
}
```

---

### 2. CalmModal (Modal avec Glassmorphisme)

**Usage :** Modals pour formulaires, confirmations, ou contenu détaillé.

**Props :**
```typescript
{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;              // Default: '600px'
}
```

**Caractéristiques :**
- Backdrop : `backdrop-filter: blur(8px)` + overlay semi-transparent
- Border radius : `2xl` (24px)
- Padding header : `1.5rem 2rem`
- Padding body : `2rem`
- Animation : Spring (stiffness: 350, damping: 25)
- Fermeture : Clic backdrop, touche Escape, ou bouton ✕
- Scroll : Body scrollable si contenu dépasse `85vh`

---

### 3. GlassForms (Inputs, TextArea, Select)

**Usage :** Formulaires cohérents avec focus states et validation.

#### GlassInput
```typescript
{
  label: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
  type?: string;              // 'text', 'email', 'tel', etc.
  value: string;
  onChange: (e) => void;
  autoFocus?: boolean;
}
```

#### GlassTextArea
```typescript
{
  label: string;
  rows?: number;              // Default: 4
  error?: string;
  required?: boolean;
  placeholder?: string;
  value: string;
  onChange: (e) => void;
}
```

#### GlassSelect
```typescript
{
  label: string;
  options: Array<{ value: string; label: string }>;
  error?: string;
  required?: boolean;
  value: string;
  onChange: (e) => void;
}
```

**Caractéristiques :**
- Padding : `0.875rem 1rem` (14px 16px)
- Border radius : `lg` (12px)
- Focus : Border `accent.primary` + background `bg.primary`
- Blur : Retour à `border.default` + background `bg.secondary`
- Erreur : Border `semantic.error` + message rouge en dessous
- Label : `fontWeight: semibold`, `fontSize: sm`, astérisque rouge si required

---

### 4. CVWizard (Assistant de Création)

**Usage :** Questionnaire multi-étapes pour créer un CV from scratch.

**Étapes (7 au total) :**
1. **Identité** : Prénom, nom, email, téléphone, localisation
2. **Objectif** : Poste visé, secteur, niveau d'expérience (junior/confirmé/senior)
3. **Formation** : Liste de diplômes (degree, school, year) - ajout multiple
4. **Expérience** : Liste de postes (position, company, dates, description) - ajout multiple
5. **Compétences** : Skills (tags) + Langues (name + level)
6. **Extras** : LinkedIn, portfolio, hobbies
7. **Récapitulatif** : Validation finale avec résumé

**Caractéristiques :**
- Container : `maxWidth: 800px`, centré
- Header : Indicateur `Étape X/7` + titre + barre de progression animée
- Content area : Glassmorphisme avec `borderRadius: 2xl`, `padding: 2rem`
- Animations : `AnimatePresence` avec slide horizontale (x: -20 → 0 → 20)
- Footer : Boutons "Précédent" (outlined) et "Continuer" (accent, disabled si validation échoue)
- Validation : Chaque étape a une fonction `validate()` pour activer le bouton Continuer

**Composants dynamiques :**
- Listes éditables (Formation, Expérience) : Cards avec bouton "Supprimer"
- Tags (Compétences, Langues) : Pills avec bouton ×
- Bouton "Ajouter" : Bordure en pointillés (`dashed`), background `bg.tertiary`

---

## 🔔 Composants de Notification

### 5. AnonymizationTicker

**Usage :** Indicateur de progression pendant l'anonymisation et l'analyse.

**Props :**
```typescript
{
  isActive: boolean;  // Affiche/cache le ticker
}
```

**Caractéristiques :**
- Position : `fixed`, `bottom: 2rem`, `right: 2rem`
- z-index : `1000`
- Rotation de messages : 15 messages (anonymisation → analyse)
- Intervalle : 2.5 secondes par message
- Style : Background `semantic.successBg`, border `semantic.success`
- Police : `fontFamily.mono` pour aspect technique
- Indicateur : Dot pulsant vert avec glow effect
- Animation : Fade + slide (y: 20 → 0 → -20) avec scale

**Messages affichés :**
```typescript
// Phase Anonymisation (7 messages)
"Emails anonymisés 🔒"
"Numéros de téléphone masqués 🔒"
"Identités pseudonymisées 🛡️"
"Adresses postales floutées 📍"
"Entreprises protégées 🏢"
"Établissements scolaires masqués 🎓"
"Liens & réseaux sociaux chiffrés 🔗"

// Phase Analyse (8 messages)
"Transmission sécurisée à l'IA..."
"Analyse des compétences techniques..."
"Détection des Soft Skills..."
"Évaluation de l'impact..."
"Comparaison avec le marché..."
"Calcul du score de lisibilité..."
"Rédaction des recommandations..."
"Génération du rapport final..."
```

---

### 6. NotificationToast (Context + Provider)

**Usage :** Système de notifications toast pour feedback utilisateur (remplace `alert()`).

**Context API :**
```typescript
const { success, error, warning, info } = useToast();

// Exemples
success("CV importé", "Votre fichier a été chargé avec succès");
error("Échec de l'analyse", "Veuillez réessayer dans quelques instants");
warning("Fichier volumineux", "Le traitement peut prendre plus de temps");
info("Nouvelle version disponible");
```

**Types de Toast :**
```typescript
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;     // Optionnel
  duration?: number;    // Default: 3000ms (success/info), 5000ms (error), 4000ms (warning)
}
```

**Caractéristiques :**
- Position : `fixed`, `top: 24px`, `right: 24px`
- z-index : `10000` (au-dessus de tout)
- Layout : Stack vertical avec `gap: 12px`
- Dimensions : `minWidth: 300px`, `maxWidth: 400px`
- Auto-dismiss : Disparaît automatiquement après durée définie
- Fermeture manuelle : Bouton ✕ en haut à droite
- Animation : Slide-in from right + fade
- Structure : Icône circulaire + titre + message optionnel + bouton fermer

**Styles par type :**
```typescript
success: {
  backgroundColor: theme.semantic.successBg,
  borderColor: theme.semantic.success (2px),
  icon: '✓',
  iconColor: theme.semantic.success
}

error: {
  backgroundColor: theme.semantic.errorBg,
  borderColor: theme.semantic.error (2px),
  icon: '✕',
  iconColor: theme.semantic.error
}

warning: {
  backgroundColor: theme.semantic.warningBg,
  borderColor: theme.semantic.warning (2px),
  icon: '⚠',
  iconColor: theme.semantic.warning
}

info: {
  backgroundColor: theme.semantic.infoBg,
  borderColor: theme.semantic.info (2px),
  icon: 'ℹ',
  iconColor: theme.semantic.info
}
```

**Installation :**
```tsx
// Dans App.tsx ou root
import { ToastProvider } from './components/ui/NotificationToast';

<ToastProvider>
  <App />
</ToastProvider>

// Dans n'importe quel composant
import { useToast } from './components/ui/NotificationToast';

const MyComponent = () => {
  const { success, error } = useToast();

  const handleAction = () => {
    try {
      // ... action
      success("Succès !");
    } catch (err) {
      error("Erreur", err.message);
    }
  };
};
```

---

## 🎬 Animations & Transitions

### Timings
```typescript
transitions: {
  fast: '150ms ease',           // Hover, focus
  normal: '250ms ease',         // Transitions standards
  slow: '350ms ease',           // Animations complexes
  spring: '500ms cubic-bezier(0.34, 1.56, 0.64, 1)', // Bouncy effects
}
```

### Patterns Communs

#### Hover Card
```typescript
whileHover={{
  y: -8,                        // Translation verticale
  scale: 1.02,                  // Légère croissance
  boxShadow: '...'              // Glow effect (couleur thématique)
}}
```

#### Modal Entrance
```typescript
initial={{ opacity: 0, scale: 0.95, y: 20 }}
animate={{ opacity: 1, scale: 1, y: 0 }}
exit={{ opacity: 0, scale: 0.95, y: 20 }}
transition={{ type: 'spring', stiffness: 350, damping: 25 }}
```

#### Wizard Steps Transition
```typescript
initial={{ opacity: 0, x: 20 }}
animate={{ opacity: 1, x: 0 }}
exit={{ opacity: 0, x: -20 }}
transition={{ duration: 0.3 }}
```

#### Progress Bar Animation
```typescript
initial={{ width: 0 }}
animate={{ width: `${progress}%` }}
transition={{ type: 'spring', stiffness: 50, damping: 20 }}
```

---

## 📏 Z-Index Layers

```typescript
zIndex: {
  base: 0,           // Contenu standard
  dropdown: 100,     // Dropdowns, tooltips
  sticky: 200,       // Headers sticky
  modal: 300,        // Modals (backdrop + content)
  tooltip: 400,      // Tooltips au-dessus des modals
  toast: 500,        // Notifications toast
}
```

---

## 📄 Format Document A4

Pour les previews de CV et portfolios :

```typescript
documentA4: {
  width: '210mm',
  height: '297mm',
  padding: '20mm',
  // Pour l'écran (aspect ratio préservé)
  screenWidth: '595px',    // 210mm @ 72dpi
  screenHeight: '842px',   // 297mm @ 72dpi
  scaleFactor: 0.7,        // Scale pour preview dans l'UI
}
```

---

## 🎯 Bonnes Pratiques

### 1. Utiliser le ThemeContext
Toujours récupérer les couleurs depuis le theme actif :
```typescript
const { theme, mode } = useTheme();
// Puis utiliser theme.text.primary, theme.bg.secondary, etc.
```

### 2. Styles Inline avec Theme Tokens
Privilégier les styles inline avec tokens du design-system :
```typescript
style={{
  fontSize: typography.fontSize.base,
  color: theme.text.primary,
  borderRadius: borderRadius.lg,
  padding: spacing[4]
}}
```

### 3. Animations Framer Motion
Utiliser `motion.*` pour les composants animés :
```typescript
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
```

### 4. Glassmorphisme Standard
Pour créer un effet glass :
```typescript
background: mode === 'dark'
  ? 'rgba(30, 41, 59, 0.6)'     // Slate 800 @ 60%
  : 'rgba(255, 255, 255, 0.7)', // White @ 70%
backdropFilter: 'blur(20px)',
border: `1px solid ${theme.border.light}`,
```

### 5. Focus States Accessibles
Toujours gérer les états focus pour l'accessibilité :
```typescript
onFocus={(e) => {
  e.currentTarget.style.borderColor = theme.accent.primary;
}}
onBlur={(e) => {
  e.currentTarget.style.borderColor = theme.border.default;
}}
```

---

## 📚 Exemples d'Utilisation

### Card Interactive
```tsx
<CalmCard
  title="Créer un CV"
  description="Partez de zéro avec notre assistant intelligent"
  icon="✨"
  themeColor="blue"
  recommended={true}
  onClick={() => handleCreateCV()}
/>
```

### Modal avec Formulaire
```tsx
<CalmModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Importer depuis LinkedIn"
>
  <GlassInput
    label="URL du profil LinkedIn"
    placeholder="https://linkedin.com/in/..."
    value={url}
    onChange={(e) => setUrl(e.target.value)}
    required
  />
  <button onClick={handleImport}>Importer</button>
</CalmModal>
```

### Wizard Step
```tsx
{step === 1 && (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
    <GlassInput
      label="Prénom"
      value={data.firstName}
      onChange={(e) => update('firstName', e.target.value)}
      required
      autoFocus
    />
  </motion.div>
)}
```

---

## 🔄 Évolutions Futures

### À venir
- **CalmButton** : Composant bouton standardisé avec variants (primary, secondary, ghost)
- **CalmTooltip** : Tooltips avec glassmorphisme
- **CalmDropdown** : Dropdown menu avec animations
- **CalmBadge** : Badges et pills standardisés (déjà partiellement implémenté dans CVWizard)
- **CalmProgress** : Barres de progression circulaires et linéaires (barre linéaire existe dans CVWizard)
- **CalmTabs** : Système de tabs avec animations

### Améliorations
- Système de design tokens plus granulaire (JSON exportable)
- Support des gradients thématiques
- Modes de contraste élevé (accessibilité)
- Composants de data visualization (charts, graphs)

---

## 📖 Références

- **Design System** : `src/design-system.ts`
- **Theme Context** : `src/ThemeContext.tsx`
- **Composants UI** : `src/components/ui/`
  - `CalmCard.tsx` - Cards interactives avec glassmorphisme
  - `CalmModal.tsx` - Modals avec backdrop blur
  - `GlassForms.tsx` - Input, TextArea, Select avec focus states
  - `AnonymizationTicker.tsx` - Indicateur de progression anonymisation
  - `NotificationToast.tsx` - Système de notifications toast
- **Wizard CV** : `src/components/cv/CVWizard.tsx`

---

**Dernière mise à jour :** 2026-01-26
**Version :** SOUVERAIN V17 - CALM-UI 1.0
