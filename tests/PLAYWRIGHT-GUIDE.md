# 🎭 Guide Playwright pour SOUVERAIN

## 🚀 Pourquoi Playwright > Tests Manuels

**Avant (tests manuels):**
- ⏱️ 10-15 min par workflow
- 🐛 Bugs découverts tard (après push)
- 🔄 Régression non détectée
- 📸 Pas de preuve visuelle

**Après (Playwright):**
- ⏱️ 2 min pour TOUS les tests
- 🐛 Bugs détectés avant commit
- 🔄 Régression automatiquement détectée
- 📸 Screenshots + vidéos auto

---

## 🎯 Ce que Playwright Peut Faire

### 1. ✅ Tests E2E Complets

**Onboarding:**
```javascript
test('parcourir carousel onboarding', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Cliquer "Suivant" 8 fois
  for (let i = 0; i < 8; i++) {
    await page.click('button:has-text("Suivant")');
  }
  
  // Vérifier redirection
  await expect(page).toHaveURL(/vault/);
});
```

**Upload Vault:**
```javascript
test('uploader un PDF', async ({ page }) => {
  await page.click('[aria-label="Vault"]');
  
  // Upload fichier
  await page.setInputFiles('input[type="file"]', 'test.pdf');
  
  // Remplir metadata
  await page.fill('input[name="title"]', 'Document Test');
  await page.click('button[type="submit"]');
  
  // Vérifier ajout
  await expect(page.locator('text=Document Test')).toBeVisible();
});
```

**Wizard Portfolio Complet:**
```javascript
test('créer portfolio via wizard', async ({ page }) => {
  // Step 1: Nom + Type
  await page.fill('input[name="name"]', 'Portfolio Pro');
  await page.click('input[value="developer"]');
  await page.click('button:has-text("Suivant")');
  
  // Step 2: Services
  await page.fill('input[placeholder*="service"]', 'Dev Web');
  await page.click('button:has-text("Ajouter")');
  await page.click('button:has-text("Suivant")');
  
  // ... Steps 3-5
  
  // Vérifier génération
  await expect(page.locator('text=Portfolio créé')).toBeVisible();
});
```

---

### 2. 📸 Visual Regression Testing

**Détecter changements visuels automatiquement:**

```javascript
test('homepage visual regression', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // 1er run: crée baseline screenshot
  // Runs suivants: compare avec baseline
  await expect(page).toHaveScreenshot('homepage.png', {
    maxDiffPixels: 100 // Tolérance
  });
});
```

**Cas d'usage:**
- ✅ Détecter CSS cassé après changement
- ✅ Vérifier responsive (mobile/desktop)
- ✅ Comparer dark vs light mode
- ✅ Archiver design historique

**Output si différence:**
```
❌ Screenshot diff detected:
  Expected: homepage.png
  Actual: homepage-actual.png
  Diff: homepage-diff.png (234 pixels changed)
```

---

### 3. ♿ Tests d'Accessibilité

**Vérifier que tout est accessible au clavier:**

```javascript
test('navigation clavier', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Tab à travers tous les éléments
  for (let i = 0; i < 10; i++) {
    await page.keyboard.press('Tab');
  }
  
  // Vérifier focus visible
  const focusedElement = await page.locator(':focus');
  await expect(focusedElement).toBeVisible();
});
```

**Vérifier aria-labels:**

```javascript
test('tous les boutons ont aria-label', async ({ page }) => {
  const buttons = await page.locator('button').all();
  
  for (const button of buttons) {
    const ariaLabel = await button.getAttribute('aria-label');
    const text = await button.textContent();
    
    expect(ariaLabel || text?.trim()).toBeTruthy();
  }
});
```

---

### 4. ⚡ Tests de Performance

**Mesurer temps de chargement:**

```javascript
test('page charge en < 3s', async ({ page }) => {
  const startTime = Date.now();
  
  await page.goto('http://localhost:5173', { 
    waitUntil: 'networkidle' 
  });
  
  const loadTime = Date.now() - startTime;
  
  expect(loadTime).toBeLessThan(3000);
});
```

**Mesurer navigation:**

```javascript
test('navigation fluide', async ({ page }) => {
  const modules = ['vault', 'portfolio', 'cv'];
  
  for (const module of modules) {
    const start = Date.now();
    await page.click(`[aria-label="${module}"]`);
    await page.waitForLoadState('networkidle');
    
    expect(Date.now() - start).toBeLessThan(1000);
  }
});
```

---

### 5. 🔌 Network Mocking

**Tester comportement offline:**

```javascript
test('gère perte connexion', async ({ page, context }) => {
  await page.goto('http://localhost:5173');
  
  // Simuler offline
  await context.setOffline(true);
  
  // Tenter action
  await page.click('button:has-text("Sauvegarder")');
  
  // Vérifier message d'erreur
  await expect(page.locator('text=connexion')).toBeVisible();
});
```

**Mocker API responses:**

```javascript
test('mock GROQ API', async ({ page }) => {
  // Intercepter requête
  await page.route('**/api/groq', route => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({ result: 'Mocked response' })
    });
  });
  
  // Utiliser l'app
  await page.click('button:has-text("Générer Portfolio")');
  
  // Vérifier utilisation du mock
  await expect(page.locator('text=Mocked response')).toBeVisible();
});
```

---

### 6. 🎥 Vidéos + Screenshots Auto

**Configuration (déjà dans playwright.config.js):**

```javascript
use: {
  video: 'retain-on-failure',        // Vidéo si test échoue
  screenshot: 'only-on-failure',    // Screenshot si test échoue
  trace: 'retain-on-failure',       // Trace complète (network, console, etc.)
}
```

**Résultat:**

Si un test échoue:
```
playwright-report/
├── video-1.webm           # Vidéo du test qui a échoué
├── screenshot-failure.png # Screenshot exact du moment d'échec
└── trace.zip              # Trace complète (network, console, DOM)
```

Tu peux **rejouer** le test dans le viewer Playwright:
```bash
npx playwright show-trace trace.zip
```

---

### 7. 🌍 Cross-Browser Testing

**Tester Chrome + Firefox + Safari:**

```javascript
// playwright.config.js
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit', use: { ...devices['Desktop Safari'] } },
]
```

**Résultat:**
```
✅ chromium: 25/25 tests passed
✅ firefox: 25/25 tests passed
⚠️ webkit: 24/25 tests passed (1 failed)
```

---

### 8. 📱 Responsive Testing

**Tester mobile + tablet + desktop:**

```javascript
projects: [
  { name: 'Desktop', use: { viewport: { width: 1920, height: 1080 } } },
  { name: 'Tablet', use: { viewport: { width: 768, height: 1024 } } },
  { name: 'Mobile', use: { ...devices['Pixel 5'] } },
]
```

---

### 9. 🐛 Error Handling

**Tester upload fichier invalide:**

```javascript
test('rejette fichier invalide', async ({ page }) => {
  await page.setInputFiles('input[type="file"]', {
    name: 'invalid.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('not a PDF')
  });
  
  // Vérifier message d'erreur
  await expect(page.locator('.error-message')).toBeVisible();
  await expect(page.locator('text=Format invalide')).toBeVisible();
});
```

---

### 10. 🔍 Console Errors Detection

**Fail test si erreur console:**

```javascript
test('aucune erreur console', async ({ page }) => {
  const consoleErrors = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  
  await page.goto('http://localhost:5173');
  await page.waitForTimeout(3000);
  
  expect(consoleErrors).toHaveLength(0);
});
```

---

## 🚀 Installation & Usage

### Setup (une fois)

```bash
cd /home/ubuntu/clawd/SOUVERAIN

# Installer Playwright (déjà fait)
npm install --save-dev @playwright/test

# Installer browsers
npx playwright install chromium
```

### Lancer les tests

**Tous les tests:**
```bash
npx playwright test
```

**Un seul fichier:**
```bash
npx playwright test playwright-workflows.spec.js
```

**Un seul test:**
```bash
npx playwright test -g "doit uploader un PDF"
```

**Mode UI (debug):**
```bash
npx playwright test --ui
```

**Mode headed (voir le browser):**
```bash
npx playwright test --headed
```

**Debug un test spécifique:**
```bash
npx playwright test --debug -g "wizard"
```

---

## 📊 Reports

**HTML Report (après tests):**
```bash
npx playwright show-report
```

**Output:**
- Ouvre un dashboard interactif
- Voit tous les tests (passed/failed)
- Vidéos des échecs
- Screenshots
- Network logs
- Console logs

**JSON Report (pour CI/CD):**
```bash
cat test-results.json
```

---

## 🔄 Integration CI/CD

**GitHub Actions:**

```yaml
name: Playwright Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps chromium
      
      - name: Run tests
        run: npx playwright test
      
      - name: Upload report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 🎯 Workflows SOUVERAIN Testés

### ✅ Déjà implémentés (playwright-workflows.spec.js)

1. **Onboarding** → Carousel complet
2. **Vault** → Upload document, recherche
3. **Portfolio** → Wizard création, preview
4. **Job Matching** → Import CV, analyse
5. **Dark Mode** → Toggle + persistance
6. **Performance** → Temps de chargement
7. **Accessibilité** → Navigation clavier, aria-labels
8. **Error Handling** → Upload invalide, offline
9. **Visual Regression** → Screenshots comparatifs

### 🔜 À ajouter

10. **Mediatheque** → Upload images, organisation
11. **Templates** → Sélection, customization
12. **Export** → PDF, HTML génération
13. **Settings** → Changements config
14. **Multi-Portfolio** → Création, switch

---

## 💡 Exemples Concrets

### Test Complet: Création Portfolio

```bash
npx playwright test -g "créer portfolio"
```

**Durée:** 15-20s  
**Couverture:**
- Navigation module
- Wizard 5 étapes
- Upload médias
- Génération IA (GROQ)
- Preview HTML

**Output si succès:**
```
✅ Portfolio Wizard › doit créer un portfolio via wizard (18s)
```

**Output si échec:**
```
❌ Portfolio Wizard › doit créer un portfolio via wizard (12s)

Error: Timeout waiting for "Portfolio créé"
  
Attachments:
  - video.webm
  - screenshot.png
  - trace.zip
```

---

## 🎬 Résumé

**Playwright permet de:**

✅ Tester TOUS les workflows en 2 min (vs 30 min manuellement)  
✅ Détecter régressions automatiquement (visual diff)  
✅ Vérifier accessibilité (keyboard, aria)  
✅ Mesurer performance (load time, navigation)  
✅ Capturer vidéos + screenshots d'échecs  
✅ Mocker network (offline, API errors)  
✅ Tester cross-browser (Chrome, Firefox, Safari)  
✅ Tester responsive (mobile, tablet, desktop)  
✅ Générer reports HTML interactifs  
✅ Intégration CI/CD (GitHub Actions)

**1 commande = confiance totale dans le code** 🚀

---

**Prochaine étape:** Lancer les tests!

```bash
cd /home/ubuntu/clawd/SOUVERAIN
npx playwright test
```
