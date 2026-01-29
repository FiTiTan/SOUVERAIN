# SOUVERAIN - CALM UI Design System

> **Philosophy:** "Calm", "Clean", "Focus".  
> The interface should feel like a breathing space. Avoid clutter, harsh lines, and aggressive colors. Prioritize white space, soft shadows, and organic roundness.

---

## 1. Core Variables

### Colors (Theme Palette)
Used for Icons and Glows.

| Theme | Icon Background (Solid) | Shadow (Diffuse) | Glow (Soft Bloom) |
| :--- | :--- | :--- | :--- |
| **Blue** | `#3B82F6` | `rgba(59, 130, 246, 0.4)` | `rgba(59, 130, 246, 0.25)` |
| **Teal** | `#14B8A6` | `rgba(20, 184, 166, 0.4)` | `rgba(20, 184, 166, 0.25)` |
| **Purple** | `#8B5CF6` | `rgba(139, 92, 246, 0.4)` | `rgba(139, 92, 246, 0.25)` |
| **Pink** | `#EC4899` | `rgba(236, 72, 153, 0.4)` | `rgba(236, 72, 153, 0.25)` |

### Typography
- **Font Family:** Sans-serif (via `design-system.ts`).
- **Page Titles:** Thin/Light weight (`200` - `300`), Large size (`3.5rem`), Centered.
- **Card Titles:** Semibold (`600`), Centered.
- **Body Text:** Light/Regular, Grey (`text.secondary`), Centered.

---

## 2. Component: "Calm Card"

The foundational element of the Dashboard and Choice screens.

### Structure
- **Dimensions:** Min `280px`, Max `320px`.
- **Height:** Fixed Standard `360px` (or `min-height: 360px` with `flex: 1`).
- **Border Radius:** `32px` (Critical for the organic feel).
- **Padding:** `2.5rem` (Generous internal breathing room).
- **Alignment:** Flex Column, Center/Center.

### Page Layout (Mascot Space)
- **Header:** Must reserve **1/5th of screen height (20vh)**.
- **Purpose:** Dedicated space for the AI Mascot and tutorial text.
- **Implementation:**
  ```tsx
  <div style={{ minHeight: '20vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
    {/* Mascot & Title Area */}
  </div>
  ```

### States

#### Default State (Rest)
- **Background (Light Mode):** `rgba(255, 255, 255, 0.7)` with `backdropFilter: blur(20px)`.
- **Background (Dark Mode):** `rgba(30, 30, 35, 0.6)`.
- **Border:**
  - Light: `1px solid rgba(255,255,255,0.8)`
  - Dark: `1px solid rgba(255,255,255,0.05)`
- **Shadow:** Standard neutral shadow.
  - `0 20px 40px -10px rgba(200, 210, 230, 0.4)` (Light)

#### Hover State (Overlay)
- **Movement:** `y: -8px`, `scale: 1.02`.
- **Shadow (The "Glow"):**
  - **No Border Color Change.**
  - **Soft Bloom:** A large colored shadow matching the card's theme.
  - CSS: `box-shadow: 0 20px 40px -10px rgba(neutral), 0 20px 60px -20px ${ThemeColor.shadow}`.

### Iconography
- **Container:** `80px` x `80px` Circle.
- **Background:** Solid Linear Gradient (135deg, ThemeColor, ThemeColor).
- **Icon:** White (`#FFFFFF`), Standardized SVG (`32px`).
- **Initial Shadow:** Subtle.
- **Hover Interaction:** 
  - Independent or Sync: Rotates `5deg`, Scales `1.1`.
  - **No extra colored glow** on the icon itself (keep it clean).

---

## 3. Implementation Reference (React + Framer Motion)

```tsx
<motion.div
  style={{
    borderRadius: '32px',
    background: 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(20px)',
    // ... base styles
  }}
  whileHover="hover"
  initial="initial"
  variants={{
    hover: {
      y: -8,
      scale: 1.02,
      boxShadow: `
        0 20px 40px -10px rgba(200, 210, 230, 0.4),
        0 20px 60px -20px ${THEME_COLOR_SHADOW}
      `
    }
  }}
>
   {/* Icon */}
   <motion.div
     style={{ 
       width: '80px', height: '80px', borderRadius: '50%',
       background: THEME_COLOR_bg,
       color: 'white' 
     }}
     variants={{
       hover: { rotate: 5, scale: 1.1 }
     }}
   >
     <Icon />
   </motion.div>
</motion.div>
```

---

## 4. Utility Components

### Action Button (e.g., Delete/Close)
Used for secondary actions on cards (top-right absolute position).

- **Position:** Absolute, Top: `1.5rem`, Right: `1.5rem`.
- **Shape:** Circle (`32px` X `32px`).
- **Initial State:** 
  - Background: `transparent`.
  - Opacity: `0.4` (Subtle).
  - Color: Secondary Text.
- **Hover State:**
  - Opacity: `1.0`.
  - Scale: `1.1`.
  - **Contextual Background:** e.g., Red (`rgba(239, 68, 68, 0.1)`) for destructive actions.

**Reference Code:**
```tsx
<motion.button
  initial={{ opacity: 0.4 }}
  whileHover={{ opacity: 1, scale: 1.1, backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
  whileTap={{ scale: 0.9 }}
  style={{
    position: 'absolute',
    top: '1.5rem', right: '1.5rem',
    width: '32px', height: '32px',
    borderRadius: '50%',
    background: 'transparent',
    color: theme.text.secondary
  }}
>
  <Icon />
</motion.button>
```

---

## 5. Performance & Optimization (Critical)

Glassmorphism (`backdrop-filter`) is computationally expensive. To prevent scroll lag and visual glitches (black borders), **Hardware Acceleration** must be forced on all heavy glass elements.

### Rule: GPU Layer Promotion
Any component using `backdrop-filter` or large `filter: blur()` **MUST** include:

```css
transform: translate3d(0, 0, 0);
will-change: transform; /* Optional, use sparingly on animating elements */
```

### Checklist
- [x] **Shell Ambient Orbs:** REPLACED `filter: blur()` with `radial-gradient` (Much faster).
- [x] **CalmCard:** Hover effects + Blur → Needs `translate3d`.
- [x] **Modals/Overlays:** Fixed overlays → Needs `translate3d`.
- [x] **Sticky Headers:** `backdrop-filter` → Needs `translate3d`.
