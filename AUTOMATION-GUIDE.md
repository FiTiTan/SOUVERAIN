# 🎭 Guide d'Automation SOUVERAIN

## 🚀 Cas d'usage

L'automation browser permet de:
- ✅ **Tester l'UI automatiquement** (CI/CD)
- ✅ **Capturer des screenshots** pour documentation
- ✅ **Valider les workflows** (onboarding, vault, portfolio)
- ✅ **Détecter les erreurs console** en temps réel
- ✅ **Vérifier la conformité CALM-UI** (couleurs, thème)

---

## 📦 Outil 1: Playwright (Headless)

**Installation:**
```bash
npm install --save-dev playwright
npx playwright install chromium
```

**Exemple: test-automation-example.js**

Voir le fichier créé. Il montre comment:
1. Lancer le browser en headless
2. Naviguer vers localhost:5173
3. Extraire la structure de la page
4. Vérifier le thème CALM-UI
5. Capturer un screenshot
6. Détecter les erreurs console

**Exécution:**
```bash
# Assure-toi que le serveur Vite tourne
npm run vite:dev &

# Lance l'automation
node test-automation-example.js
```

---

## 🌐 Outil 2: Browser natif Clawdbot (GUI)

**Avantage:** Automation interactive depuis le chat Telegram.

**Comment ça marche:**

### 1. Ouvrir une page
```javascript
browser.open("http://localhost:5173")
```

### 2. Capturer la structure (snapshot)
```javascript
browser.snapshot()
// Retourne tous les éléments interactifs avec des refs (e1, e2, etc.)
```

**Exemple de sortie:**
```
heading "SOUVERAIN - Gestion de Carrière" level=1
button "Se connecter" e1
button "Créer un compte" e2
link "Découvrir" e3
input "Email" e4
```

### 3. Interagir avec des éléments
```javascript
// Cliquer sur un bouton
browser.act({ 
  kind: "click", 
  ref: "e2" // Référence depuis snapshot
})

// Remplir un champ
browser.act({ 
  kind: "type", 
  ref: "e4", 
  text: "jean-louis@example.com" 
})

// Appuyer sur Enter
browser.act({ 
  kind: "press", 
  key: "Enter" 
})
```

### 4. Screenshot
```javascript
browser.screenshot()
// Retourne une image PNG
```

### 5. Vérifier des éléments
```javascript
// Chercher du texte
browser.snapshot({ selector: "text=Erreur" })

// Vérifier un état
browser.snapshot({ selector: "[aria-disabled=true]" })
```

---

## 🧪 Workflows de Test SOUVERAIN

### Test 1: Onboarding
```javascript
// 1. Ouvrir l'app
await page.goto('http://localhost:5173');

// 2. Attendre le carousel
await page.waitForSelector('[data-testid="onboarding-slide"]');

// 3. Cliquer "Suivant" 3 fois
for (let i = 0; i < 3; i++) {
  await page.click('button:has-text("Suivant")');
  await page.waitForTimeout(500);
}

// 4. Cliquer "Commencer"
await page.click('button:has-text("Commencer")');

// 5. Vérifier redirection
await page.waitForURL('**/vault');
```

### Test 2: Création de Portfolio
```javascript
// 1. Aller au module Portfolio
await page.click('[aria-label="Portfolio"]');

// 2. Cliquer "Nouveau Portfolio"
await page.click('button:has-text("Nouveau Portfolio")');

// 3. Remplir le formulaire
await page.fill('input[name="name"]', 'Mon Portfolio Pro');
await page.click('input[type="checkbox"][value="developer"]');

// 4. Sauvegarder
await page.click('button:has-text("Créer")');

// 5. Vérifier création
await page.waitForSelector('text=Mon Portfolio Pro');
```

### Test 3: Vérification Dark Mode
```javascript
// 1. Toggle dark mode
await page.click('[aria-label="Toggle dark mode"]');

// 2. Vérifier background
const bg = await page.evaluate(() => {
  return window.getComputedStyle(document.body).backgroundColor;
});

// 3. Assertions
expect(bg).toMatch(/rgb\(18,\s*18,\s*18\)/); // Dark mode
```

---

## 🎯 Integration avec souverain skill

La skill `souverain` peut automatiser ces tests:

```bash
# Audit avant de lancer les tests
node skills/souverain/scripts/audit-calm-ui.js

# Si OK, lance les tests E2E
node test-automation-example.js

# Analyse du bundle après build
npm run build
bash skills/souverain/scripts/analyze-bundle.sh
```

---

## 🔄 CI/CD Pipeline (futur)

```yaml
# .github/workflows/test.yml
name: SOUVERAIN Tests

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
          npx playwright install chromium
      
      - name: Audit CALM-UI
        run: node skills/souverain/scripts/audit-calm-ui.js
      
      - name: TypeScript Check
        run: npx tsc --noEmit
      
      - name: Start Dev Server
        run: npm run vite:dev &
      
      - name: E2E Tests
        run: node test-automation-example.js
      
      - name: Upload Screenshots
        uses: actions/upload-artifact@v3
        with:
          name: screenshots
          path: screenshot-test.png
```

---

## 📚 Ressources

- **Playwright Docs:** https://playwright.dev
- **React Testing Library:** https://testing-library.com/react
- **Clawdbot Browser Tool:** `/home/ubuntu/.npm-global/lib/node_modules/clawdbot/docs/tools/browser.md`

---

**Créé le:** 2026-02-01  
**Skill associée:** `souverain`
