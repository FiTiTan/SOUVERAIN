# 🔴 Erreurs Récurrentes SOUVERAIN

Analyse des bugs historiques et tests automatisés correspondants.

---

## 📊 Top Erreurs Récurrentes

### 1. 🔌 **IPC Handlers Non Synchronisés** ⭐⭐⭐⭐⭐

**Fréquence:** Très haute  
**Impact:** Critique (fonctionnalités cassées)

**Symptômes:**
- Fonctionnalités ne chargent pas (thumbnails, templates, etc.)
- `Uncaught Error: invoke not found` dans la console
- Calls IPC échouent silencieusement

**Cause:**
- Handler ajouté dans `main.cjs` → `ipcMain.handle('handler-name', ...)`
- **Mais oublié** dans `preload.cjs` → `window.electron.xyz.method()`

**Exemples historiques:**
- 2026-01-30: `template-get-thumbnail` (commit fd54c1a)
- 2026-01-31: `get-groq-api-key` (commit ad79a4b)

**Test automatisé:**
```bash
# Test 1 dans critical-regression-tests.js
grep "ipcMain.handle" main.cjs vs grep "ipcRenderer.invoke" preload.cjs
```

**Checklist manuelle:**
1. Nouveau handler dans `main.cjs` ?
2. Exposé dans `preload.cjs` via `contextBridge.exposeInMainWorld` ?
3. Renderer appelle via `window.electron.*` ?

---

### 2. 🔀 **Marqueurs de Conflit Git** ⭐⭐⭐⭐

**Fréquence:** Moyenne  
**Impact:** Critique (parsing JSX cassé)

**Symptômes:**
- Erreur Babel: `SyntaxError: Unexpected token`
- Build échoue avec erreurs cryptiques
- JSX/TSX ne compile pas

**Cause:**
- Merge conflict non résolu
- Marqueurs `<<<<<<<`, `=======`, `>>>>>>>` laissés dans le code

**Exemples historiques:**
- 2026-01-30: Conflits dans templateService.ts (commit 832c682)

**Test automatisé:**
```bash
# Test 2 dans critical-regression-tests.js
grep -rn "^<<<<<<< \|^>>>>>>> " src/
```

**Prévention:**
- Toujours vérifier status Git avant commit
- Utiliser diff visuel pour résoudre conflits

---

### 3. 📦 **Imports avec Extensions .ts** ⭐⭐⭐

**Fréquence:** Moyenne  
**Impact:** Moyen (dev OK, build fail)

**Symptômes:**
- `npm run build` échoue
- Module not found en production
- Imports fonctionnent en dev mais cassent au build

**Cause:**
- Import écrit comme: `import { x } from './file.ts'`
- Devrait être: `import { x } from './file'`

**Test automatisé:**
```bash
# Test 4 dans critical-regression-tests.js
grep -rn 'from.*\.ts["']' src/
```

**Fix:**
```typescript
// ❌ Mauvais
import { theme } from './design-system.ts';

// ✅ Bon
import { theme } from './design-system';
```

---

### 4. 🎨 **Couleurs Hardcodées (CALM-UI)** ⭐⭐⭐⭐

**Fréquence:** Haute  
**Impact:** Faible (UX, pas fonctionnel)

**Symptômes:**
- Dark mode cassé (couleurs ne changent pas)
- Thème incohérent
- 515 couleurs hardcodées détectées (audit 2026-02-01)

**Cause:**
- Utilisation de `#FFFFFF`, `rgb(...)` au lieu de `theme.*`
- Oubli de consulter le design system CALM-UI

**Exemples:**
```tsx
// ❌ Mauvais
<div style={{ backgroundColor: '#FFFFFF', color: '#000000' }}>

// ✅ Bon
<div style={{ backgroundColor: theme.background.primary, color: theme.text.primary }}>
```

**Test automatisé:**
```bash
# Test 5 dans critical-regression-tests.js
grep -rn '#[0-9A-Fa-f]{6}' src/
```

**Skill associée:** `souverain` → `audit-calm-ui.js`

---

### 5. 🔤 **Types `any` TypeScript** ⭐⭐⭐

**Fréquence:** Haute  
**Impact:** Faible (type safety)

**Symptômes:**
- Perte de type safety
- Erreurs runtime non détectées
- 178 instances détectées (audit 2026-02-01)

**Cause:**
- Flemme de typer correctement
- Erreurs TypeScript bypassées avec `any`

**Test automatisé:**
```bash
# Skill souverain → check-types.js
grep -rn ": any" src/
```

**Fix:**
```typescript
// ❌ Mauvais
const handleData = (data: any) => { ... }

// ✅ Bon
interface DataPayload {
  id: string;
  name: string;
}
const handleData = (data: DataPayload) => { ... }
```

---

### 6. 🖱️ **Champs Wizard Non Clickables** ⭐⭐⭐

**Fréquence:** Rare (mais critique)  
**Impact:** Critique (UX cassée)

**Symptômes:**
- Input fields ne répondent pas au clic
- Focus impossible sur les champs
- Labels affichés mais champs invisibles

**Cause:**
- Props `label` requis mais non fourni
- Conditional rendering incorrect dans composants `Glass*`

**Exemples historiques:**
- 2026-01-30: GlassInput/GlassTextArea (commit 362ecf8)

**Fix appliqué:**
- Rendu `label` optionnel dans BaseFieldProps
- `{label && <label>...</label>}` dans les composants

**Test automatisé:**
```bash
# Test 8 dans critical-regression-tests.js
# Test d'interaction: clic + typing dans input
```

---

### 7. ⚠️ **Erreurs Console Non Détectées** ⭐⭐⭐⭐

**Fréquence:** Haute  
**Impact:** Variable

**Symptômes:**
- Console pleine d'erreurs rouges
- Fonctionnalités silencieusement cassées
- Utilisateur ne voit rien, mais app bugue

**Causes courantes:**
- PropTypes warnings
- Undefined variables
- Failed API calls
- Missing dependencies dans useEffect

**Test automatisé:**
```bash
# Test 7 dans critical-regression-tests.js
# Écoute page.on('console', msg => ...)
```

**Monitoring:**
- Vérifier console après chaque changement
- CI/CD devrait fail si erreurs console

---

### 8. 🌓 **Dark Mode Non Fonctionnel** ⭐⭐

**Fréquence:** Moyenne  
**Impact:** Moyen (UX)

**Symptômes:**
- Toggle dark mode ne change rien
- Thème persiste après toggle
- Certains composants ne réagissent pas

**Cause:**
- Couleurs hardcodées (voir #4)
- ThemeContext non propagé
- Composants non wrappés avec `useTheme()`

**Test automatisé:**
```bash
# Test 9 dans critical-regression-tests.js
# Compare background before/after toggle
```

---

### 9. 📝 **TypeScript Compilation Errors** ⭐⭐⭐⭐

**Fréquence:** Moyenne  
**Impact:** Critique (bloque build)

**Symptômes:**
- `npm run build` échoue
- Erreurs de types
- Missing imports

**Cause:**
- Types incorrects
- Imports manquants
- Props mal typées

**Test automatisé:**
```bash
# Test 3 dans critical-regression-tests.js
npx tsc --noEmit
```

**Prévention:**
- Activer strict mode dans tsconfig.json
- Linter en pre-commit hook

---

## 🚀 Utilisation des Tests

### Lancer tous les tests

```bash
cd /home/ubuntu/clawd/SOUVERAIN

# Assure-toi que le serveur Vite tourne
npm run vite:dev &

# Lance les tests
chmod +x tests/critical-regression-tests.js
node tests/critical-regression-tests.js
```

### Output attendu

```
🎭 Tests de régression SOUVERAIN - Démarrage

🔍 Test 1: Synchronisation handlers IPC
✅ IPC handlers synchronisés (15 handlers)

🔍 Test 2: Marqueurs de conflit Git
✅ Aucun conflit Git détecté

🔍 Test 3: Compilation TypeScript
✅ TypeScript compile sans erreur

...

📊 RÉSUMÉ DES TESTS
✅ Tests réussis: 9
❌ Tests échoués: 0
```

---

## 🔄 Integration CI/CD

### GitHub Actions (futur)

```yaml
name: Tests Régression SOUVERAIN

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      
      - name: Install
        run: |
          npm ci
          npm install -g playwright
          npx playwright install chromium
      
      - name: Start Server
        run: npm run vite:dev &
      
      - name: Tests Critiques
        run: node tests/critical-regression-tests.js
      
      - name: Fail if errors
        if: failure()
        run: exit 1
```

---

## 📚 Skills Associées

- **souverain** → `audit-calm-ui.js`, `check-types.js`
- **react-expert** → Best practices React
- **playwright-cli** → Automation browser (si CLI installé)

---

**Dernière mise à jour:** 2026-02-01  
**Source:** MEMORY.md + daily logs 2026-01-30/31
