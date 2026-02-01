#!/usr/bin/env node
/**
 * Tests E2E SOUVERAIN avec Playwright
 * Workflows critiques automatisés
 */

import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

// ================================
// 1. ONBOARDING COMPLET
// ================================
test.describe('Onboarding Flow', () => {
  test('doit compléter le carousel onboarding', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Vérifier page d'accueil
    await expect(page.locator('h1')).toContainText('SOUVERAIN');
    
    // Parcourir le carousel (8-9 slides)
    for (let i = 0; i < 8; i++) {
      const nextButton = page.locator('button', { hasText: /suivant|next/i });
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(300);
      }
    }
    
    // Cliquer "Commencer"
    const startButton = page.locator('button', { hasText: /commencer|start/i });
    await startButton.click();
    
    // Vérifier redirection
    await expect(page).toHaveURL(/vault|dashboard|home/);
  });
});

// ================================
// 2. VAULT - UPLOAD DOCUMENT
// ================================
test.describe('Vault Module', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    // Skip onboarding si présent
    const skipButton = page.locator('button', { hasText: /passer|skip/i });
    if (await skipButton.isVisible()) {
      await skipButton.click();
    }
  });

  test('doit naviguer vers le module Vault', async ({ page }) => {
    // Cliquer sur menu Vault
    const vaultButton = page.locator('[aria-label*="vault" i], button:has-text("Vault")');
    await vaultButton.click();
    
    // Vérifier affichage
    await expect(page.locator('h1, h2')).toContainText(/vault|coffre/i);
  });

  test('doit uploader un document PDF', async ({ page }) => {
    // Aller au Vault
    await page.click('[aria-label*="vault" i]');
    
    // Cliquer "Ajouter document"
    const addButton = page.locator('button', { hasText: /ajouter|upload|nouveau/i });
    await addButton.first().click();
    
    // Upload file (créer un PDF test)
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test-document.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4\n%test content\n%%EOF')
    });
    
    // Remplir metadata
    await page.fill('input[name*="title" i], input[placeholder*="titre" i]', 'Document Test');
    await page.fill('textarea[name*="description" i]', 'Description de test');
    
    // Sauvegarder
    await page.click('button[type="submit"], button:has-text("Enregistrer")');
    
    // Vérifier ajout
    await expect(page.locator('text=Document Test')).toBeVisible();
  });

  test('doit rechercher un document', async ({ page }) => {
    await page.click('[aria-label*="vault" i]');
    
    // Utiliser la recherche
    const searchInput = page.locator('input[type="search"], input[placeholder*="recherche" i]');
    await searchInput.fill('Test');
    
    // Vérifier résultats filtrés
    await expect(page.locator('[data-testid*="document"], .document-card')).toHaveCount(1, { timeout: 2000 });
  });
});

// ================================
// 3. PORTFOLIO - WIZARD COMPLET
// ================================
test.describe('Portfolio Wizard', () => {
  test('doit créer un portfolio via wizard', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Aller au module Portfolio
    await page.click('[aria-label*="portfolio" i], button:has-text("Portfolio")');
    
    // Cliquer "Nouveau Portfolio"
    await page.click('button:has-text("Nouveau"), button:has-text("Créer")');
    
    // === STEP 1: Informations de base ===
    await page.fill('input[name="name"], input[placeholder*="nom" i]', 'Portfolio Test E2E');
    
    // Sélectionner type (Developer)
    await page.click('input[value="developer"], label:has-text("Developer")');
    
    // Suivant
    await page.click('button:has-text("Suivant")');
    
    // === STEP 2: Services ===
    await page.fill('input[placeholder*="service" i]', 'Développement Web');
    await page.click('button:has-text("Ajouter")');
    
    await page.click('button:has-text("Suivant")');
    
    // === STEP 3: Contact ===
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="tel"]', '+33612345678');
    
    await page.click('button:has-text("Suivant")');
    
    // === STEP 4: Projets ===
    await page.fill('input[placeholder*="projet" i]', 'Projet Test');
    await page.fill('textarea', 'Description du projet de test');
    
    await page.click('button:has-text("Suivant")');
    
    // === STEP 5: Génération ===
    await page.click('button:has-text("Générer"), button:has-text("Créer")');
    
    // Attendre génération (peut être long avec IA)
    await page.waitForSelector('text=Portfolio créé', { timeout: 30000 });
    
    // Vérifier redirection
    await expect(page).toHaveURL(/portfolio/);
  });

  test('doit prévisualiser le portfolio généré', async ({ page }) => {
    await page.goto(`${BASE_URL}/portfolio`);
    
    // Cliquer sur un portfolio
    await page.click('.portfolio-card, [data-testid="portfolio-card"]');
    
    // Cliquer "Prévisualiser"
    await page.click('button:has-text("Preview"), button:has-text("Aperçu")');
    
    // Vérifier ouverture preview
    await expect(page.locator('iframe, .preview-container')).toBeVisible();
  });
});

// ================================
// 4. JOB MATCHING - CV IMPORT
// ================================
test.describe('Job Matching', () => {
  test('doit importer un CV', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Aller au module CV/Job Matching
    await page.click('[aria-label*="cv" i], button:has-text("CV")');
    
    // Upload CV
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'cv-test.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('%PDF-1.4\nTest CV Content\n%%EOF')
    });
    
    // Attendre analyse (IA)
    await page.waitForSelector('text=Analyse terminée', { timeout: 15000 });
    
    // Vérifier extraction
    await expect(page.locator('text=Compétences, text=Skills')).toBeVisible();
  });
});

// ================================
// 5. DARK MODE
// ================================
test.describe('Theme Toggle', () => {
  test('doit basculer entre light et dark mode', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Récupérer couleur initiale
    const initialBg = await page.evaluate(() => 
      window.getComputedStyle(document.body).backgroundColor
    );
    
    // Trouver et cliquer toggle
    const toggle = page.locator('[aria-label*="dark" i], [aria-label*="theme" i], button:has-text("☀"), button:has-text("🌙")');
    await toggle.click();
    
    // Attendre transition
    await page.waitForTimeout(500);
    
    // Vérifier changement
    const newBg = await page.evaluate(() => 
      window.getComputedStyle(document.body).backgroundColor
    );
    
    expect(initialBg).not.toBe(newBg);
  });

  test('dark mode doit persister après reload', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Activer dark mode
    await page.click('[aria-label*="dark" i]');
    
    const darkBg = await page.evaluate(() => 
      window.getComputedStyle(document.body).backgroundColor
    );
    
    // Reload
    await page.reload();
    
    // Vérifier persistance
    const reloadBg = await page.evaluate(() => 
      window.getComputedStyle(document.body).backgroundColor
    );
    
    expect(reloadBg).toBe(darkBg);
  });
});

// ================================
// 6. PERFORMANCE
// ================================
test.describe('Performance', () => {
  test('page initiale doit charger en < 3s', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    
    const loadTime = Date.now() - startTime;
    
    expect(loadTime).toBeLessThan(3000);
  });

  test('navigation entre modules doit être fluide', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const modules = ['vault', 'portfolio', 'cv'];
    
    for (const module of modules) {
      const startTime = Date.now();
      
      await page.click(`[aria-label*="${module}" i]`);
      await page.waitForLoadState('networkidle');
      
      const navTime = Date.now() - startTime;
      
      expect(navTime).toBeLessThan(1000); // < 1s par navigation
    }
  });
});

// ================================
// 7. ACCESSIBILITÉ
// ================================
test.describe('Accessibility', () => {
  test('tous les boutons doivent avoir un aria-label ou texte', async ({ page }) => {
    await page.goto(BASE_URL);
    
    const buttons = await page.locator('button').all();
    
    for (const button of buttons) {
      const ariaLabel = await button.getAttribute('aria-label');
      const text = await button.textContent();
      
      expect(ariaLabel || text?.trim()).toBeTruthy();
    }
  });

  test('navigation au clavier doit fonctionner', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Tab à travers les éléments
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
    }
    
    // Vérifier que le focus est visible
    const focusedElement = await page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });
});

// ================================
// 8. ERROR HANDLING
// ================================
test.describe('Error Handling', () => {
  test('doit afficher erreur si upload échoue', async ({ page }) => {
    await page.goto(`${BASE_URL}/vault`);
    
    // Simuler upload fichier invalide
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'invalid.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('invalid content')
    });
    
    // Vérifier message d'erreur
    await expect(page.locator('text=erreur, text=error, .error-message')).toBeVisible({ timeout: 5000 });
  });

  test('doit gérer perte de connexion gracefully', async ({ page, context }) => {
    await page.goto(BASE_URL);
    
    // Simuler offline
    await context.setOffline(true);
    
    // Tenter action
    await page.click('button:has-text("Sauvegarder")').catch(() => {});
    
    // Vérifier message offline
    await expect(page.locator('text=connexion, text=offline')).toBeVisible();
  });
});

// ================================
// 9. VISUAL REGRESSION
// ================================
test.describe('Visual Regression', () => {
  test('homepage doit correspondre au snapshot', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Screenshot pleine page
    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true,
      maxDiffPixels: 100 // Tolérance
    });
  });

  test('vault module doit correspondre au snapshot', async ({ page }) => {
    await page.goto(`${BASE_URL}/vault`);
    
    await expect(page).toHaveScreenshot('vault.png', {
      fullPage: true,
      maxDiffPixels: 100
    });
  });
});
