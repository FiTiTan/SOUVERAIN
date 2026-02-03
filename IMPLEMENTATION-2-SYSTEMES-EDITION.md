# Implémentation propre : 2 systèmes d'édition distincts

**Date :** 3 février 2026  
**Commit :** `d4c3bb3`  
**Branch :** `perf-optimization-phase1`

---

## 🎯 Objectif

Implémenter **2 features distinctes** selon les 2 briefs :

1. **BRIEF 1** : Édition basique (contenteditable manuel)
2. **BRIEF 2** : AI Rewrite (régénération IA avec boutons ✨)

---

## 📊 Architecture propre

```
EditablePreviewScreen.tsx
│
├─ [BRIEF 1] injectEditableFeatures(doc)
│   ├─ contenteditable="true" sur les textes
│   ├─ data-original pour le reset
│   ├─ Boutons reset individuels (↺)
│   ├─ Toolbar "Tout réinitialiser"
│   └─ 100% manuel, PAS d'IA
│
├─ [BRIEF 2] injectAiRewriteSystem(doc, config)
│   ├─ Import depuis injectAiRewrite.ts
│   ├─ Wrappe les champs éligibles
│   ├─ Ajoute boutons ✨ triple sparkle
│   ├─ Popup avec textarea
│   └─ postMessage pour demander régénération
│
└─ [BRIEF 2] Handler postMessage
    ├─ Écoute AI_REWRITE_REQUEST
    ├─ Appelle aiRewriteService.ts
    └─ Renvoie AI_REWRITE_RESPONSE
```

---

## 📁 Fichiers créés/modifiés

| Fichier | Brief | Action |
|---------|-------|--------|
| `EditablePreviewScreen.tsx` | 1 + 2 | ✏️ Modifié - Appels séparés aux 2 systèmes |
| `injectAiRewrite.ts` | 2 | ✨ Créé - Injection AI Rewrite dans iframe |
| `aiRewriteService.ts` | 2 | ✨ Créé - Appel DeepSeek/Groq |

**Fichiers supprimés** (étaient dans l'ancienne implémentation mélangée) :
- `src/components/icons/AiSparkleIcon.tsx`
- `src/components/portfolio/AiRewriteWrapper.tsx`
- `src/components/portfolio/AiRewriteWrapper.css`

---

## 🔍 BRIEF 1 : Édition basique (contenteditable)

### Localisation

**Fichier** : `EditablePreviewScreen.tsx`  
**Fonction** : `injectEditableFeatures(doc: Document)`

### Fonctionnalités

| Feature | Implémenté |
|---------|-----------|
| contenteditable="true" | ✅ |
| data-original | ✅ |
| Boutons reset individuels | ✅ |
| Toolbar "Tout réinitialiser" | ✅ |
| Détection modifications | ✅ |
| Indicateur visuel (barre bleue) | ✅ |

### Champs éditables

```javascript
const editableSelectors = [
  { selector: '.hero-title, .heroTitle, h1[class*="hero"]', field: 'heroTitle' },
  { selector: '.hero-subtitle, .heroSubtitle', field: 'heroSubtitle' },
  { selector: '.hero-eyebrow, .heroEyebrow', field: 'heroEyebrow' },
  { selector: '.hero-cta, button[class*="hero"]', field: 'heroCta' },
  { selector: '.about-text, .aboutText, .bio-text', field: 'aboutText' },
  { selector: '.value-prop, .valueProp', field: 'valueProp' },
  { selector: '.service-title, .service h3', field: 'serviceTitle' },
  { selector: '.service-description, .service p', field: 'serviceDescription' },
  { selector: '.project-title, .project h3', field: 'projectTitle' },
  { selector: '.project-description, .project p:not(.category)', field: 'projectDescription' },
  { selector: '.contact-email, [href^="mailto"]', field: 'email' },
  { selector: '.contact-phone, [href^="tel"]', field: 'phone' },
];
```

---

## ✨ BRIEF 2 : AI Rewrite

### Localisation

**Fichiers** :
- `injectAiRewrite.ts` - Injection dans iframe
- `aiRewriteService.ts` - Service API
- `EditablePreviewScreen.tsx` - Handler postMessage

### Fonctionnalités

| Feature | Implémenté |
|---------|-----------|
| Boutons ✨ au survol | ✅ |
| Popup avec textarea | ✅ |
| Placeholder exemples | ✅ |
| Ctrl+Enter pour régénérer | ✅ |
| Escape pour fermer | ✅ |
| Clic extérieur ferme popup | ✅ |
| Loading state (spinner) | ✅ |
| Gestion d'erreurs | ✅ |
| Communication postMessage | ✅ |
| Support DeepSeek + Groq | ✅ |

### Champs éligibles AI Rewrite

```javascript
const AI_REWRITE_FIELDS = [
  { selector: '.hero-subtitle, .heroSubtitle', fieldType: 'heroSubtitle' },
  { selector: '.about-text, .aboutText, .bio-text', fieldType: 'aboutText' },
  { selector: '.value-prop, .valueProp', fieldType: 'valueProp' },
  { selector: '.service-description, .service p', fieldType: 'serviceDescription' },
  { selector: '.project-description, .project p:not(.category)', fieldType: 'projectDescription' },
];
```

### Communication postMessage

**iframe → parent** :
```javascript
{
  type: 'AI_REWRITE_REQUEST',
  payload: {
    currentText: "...",
    instruction: "Rends le plus percutant",
    fieldType: "heroSubtitle",
    context: { name, valueProp, expertises }
  }
}
```

**parent → iframe** :
```javascript
{
  type: 'AI_REWRITE_RESPONSE',
  payload: {
    newText: "..."  // ou error: "..."
  }
}
```

---

## 🔧 Différences clés entre les 2 systèmes

| Aspect | BRIEF 1 (Contenteditable) | BRIEF 2 (AI Rewrite) |
|--------|---------------------------|----------------------|
| **Édition** | Manuelle (user tape) | Guidée par IA |
| **Boutons** | Reset (↺) | Sparkle (✨) |
| **Popup** | Aucune | Avec textarea |
| **IA** | Non | Oui (DeepSeek/Groq) |
| **Champs** | Tous les textes | Sous-ensemble |
| **Indicateur** | Barre bleue | Barre bleue |
| **Reset** | Bouton ↺ individuel | Pas de reset IA (modif permanente) |

---

## 📦 Appel dans EditablePreviewScreen.tsx

```typescript
useEffect(() => {
  const timer = setTimeout(() => {
    const doc = iframe.contentDocument;
    
    // ===== BRIEF 1 : Édition basique (contenteditable) =====
    injectEditableFeatures(doc);
    
    // ===== BRIEF 2 : AI Rewrite (boutons ✨ + régénération IA) =====
    injectAiRewriteSystem(doc, {
      name: portfolioData.authorName || '',
      valueProp: '',
      expertises: [],
    });
  }, 300);
}, [assignments]);

// Handler postMessage pour BRIEF 2
useEffect(() => {
  const handleMessage = async (event: MessageEvent) => {
    if (event.data.type === 'AI_REWRITE_REQUEST') {
      const result = await callDeepSeekRewrite(event.data.payload);
      iframe.contentWindow.postMessage({
        type: 'AI_REWRITE_RESPONSE',
        payload: { newText: result.newText }
      }, '*');
    }
  };
  
  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
}, []);
```

---

## 🧪 Tests à effectuer

### Test BRIEF 1 (Contenteditable)

1. Ouvrir preview (Step 5)
2. **Cliquer** sur un texte → Éditer manuellement
3. **Vérifier** barre bleue apparaît (modified)
4. **Cliquer** bouton ↺ → Texte revient à l'original
5. **Toolbar** "Tout réinitialiser" → Reset global

### Test BRIEF 2 (AI Rewrite)

1. Ouvrir preview (Step 5)
2. **Survoler** un paragraphe → Bouton ✨ apparaît
3. **Cliquer** ✨ → Popup s'ouvre
4. **Taper** instruction : "Plus court"
5. **Ctrl+Enter** → Loading → Texte régénéré
6. **Escape** → Popup se ferme
7. **Clic extérieur** → Popup se ferme
8. **Erreur** (sans API key) → Message d'erreur affiché

---

## 🎯 Prochaines étapes (optionnelles)

### Amélioration BRIEF 2 (AI Rewrite)

1. **Extraire valueProp + expertises** du HTML généré (au lieu de valeurs vides)
2. **Quick prompts** : Boutons suggestions ("Plus court", "Ajoute des chiffres")
3. **Historique** : Annuler/Refaire les modifications IA
4. **Preview côte à côte** : Ancien vs nouveau texte avant validation

### Amélioration BRIEF 1 (Contenteditable)

1. **Undo/Redo** : Historique des modifications manuelles
2. **Validation** : Vérifier contraintes de longueur (15-30 mots, etc.)
3. **Auto-save** : Sauvegarder les modifications dans localStorage

---

## 📝 Notes techniques

### Pourquoi 2 systèmes séparés ?

**Avantages** :
- Code clair et maintenable
- Activation/désactivation indépendante
- Respect strict des 2 briefs distincts
- Pas de confusion entre édition manuelle et IA

**Inconvénient** :
- 2 fichiers d'injection (mais logique séparée)

### SVG Triple Sparkle

```html
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
  <!-- Étoile principale -->
  <path d="M11 5L12.5 9.5L17 11L12.5 12.5L11 17L9.5 12.5L5 11L9.5 9.5L11 5Z" />
  <!-- Petite étoile haut droite -->
  <path d="M18 3L18.7 5.3L21 6L18.7 6.7L18 9L17.3 6.7L15 6L17.3 5.3L18 3Z" />
  <!-- Petite étoile bas droite -->
  <path d="M18 15L18.7 17.3L21 18L18.7 18.7L18 21L17.3 18.7L15 18L17.3 17.3L18 15Z" />
</svg>
```

### Contraintes AI par type de champ

```typescript
const FIELD_CONSTRAINTS = {
  heroSubtitle: '15-30 mots maximum. Accroche percutante et mémorable.',
  aboutText: '60-80 mots (3-4 phrases). Présentation professionnelle.',
  valueProp: '20-30 mots (1-2 phrases). Promesse de valeur claire.',
  serviceDescription: '35-45 mots (2-3 phrases). Bénéfice client direct.',
  projectDescription: '60-80 mots (4 phrases). Structure: contexte, solution, résultat.',
};
```

---

**Fin de l'implémentation** ✅
