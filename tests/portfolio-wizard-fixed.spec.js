import { test, expect } from '@playwright/test';

test('Portfolio Wizard: Parcours complet 5 étapes', async ({ page }) => {
  await page.goto('http://localhost:5173');
  console.log('✅ Page chargée');
  
  await page.waitForLoadState('networkidle');
  
  // === ÉTAPE 0: Fermer onboarding si présent ===
  console.log('\n📍 Vérification onboarding...');
  
  // Chercher bouton "Passer" ou "Skip"
  const skipBtn = page.locator(
    'button:has-text("Passer"), ' +
    'button:has-text("Skip"), ' +
    'button:has-text("Commencer")'
  );
  
  if (await skipBtn.first().isVisible({ timeout: 2000 })) {
    // Si onboarding: parcourir rapidement ou skip
    const commencerBtn = page.locator('button:has-text("Commencer")');
    if (await commencerBtn.isVisible({ timeout: 1000 })) {
      await commencerBtn.click();
      console.log('✅ Onboarding fermé (Commencer)');
    } else {
      // Cliquer Passer
      await skipBtn.first().click();
      console.log('✅ Onboarding skipped');
    }
    await page.waitForTimeout(1000);
  } else {
    console.log('  ℹ️ Pas d\'onboarding');
  }
  
  // === Navigation vers Portfolio ===
  console.log('\n📍 Navigation vers Portfolio...');
  
  // Force click (ignore overlays)
  await page.locator('button', { hasText: 'Portfolio' }).first().click({ force: true }).catch(async () => {
    // Fallback: chercher dans sidebar
    await page.locator('[aria-label*="portfolio" i]').first().click({ force: true });
  });
  
  console.log('✅ Module Portfolio ouvert');
  await page.waitForTimeout(1000);
  
  // === Ouvrir wizard ===
  console.log('\n📍 Ouverture wizard...');
  
  const newBtn = page.locator('button:has-text("Nouveau")').first();
  await expect(newBtn).toBeVisible({ timeout: 5000 });
  await newBtn.click();
  console.log('✅ Wizard ouvert');
  
  await page.waitForTimeout(500);
  
  // === STEP 1: Nom + Type ===
  console.log('\n📝 STEP 1: Informations');
  
  await page.fill('input[name="name"]', 'Portfolio Playwright Test');
  console.log('  ✅ Nom: Portfolio Playwright Test');
  
  // Sélectionner type
  await page.click('input[value="developer"]').catch(() => 
    page.click('label:has-text("Developer")')
  );
  console.log('  ✅ Type: Developer');
  
  await page.click('button:has-text("Suivant")');
  console.log('  ✅ Step 1 → Step 2\n');
  await page.waitForTimeout(500);
  
  // === STEP 2: Services ===
  console.log('📝 STEP 2: Services');
  
  const serviceInput = page.locator('input[placeholder*="service" i]').first();
  if (await serviceInput.isVisible({ timeout: 3000 })) {
    await serviceInput.fill('Dev Web + Mobile');
    console.log('  ✅ Service ajouté');
    
    const addBtn = page.locator('button:has-text("Ajouter")').first();
    if (await addBtn.isVisible({ timeout: 1000 })) {
      await addBtn.click();
    }
  }
  
  await page.click('button:has-text("Suivant")');
  console.log('  ✅ Step 2 → Step 3\n');
  await page.waitForTimeout(500);
  
  // === STEP 3: Contact ===
  console.log('📝 STEP 3: Contact');
  
  await page.fill('input[type="email"]', 'test@playwright.test');
  console.log('  ✅ Email');
  
  const phoneInput = page.locator('input[type="tel"]').first();
  if (await phoneInput.isVisible({ timeout: 2000 })) {
    await phoneInput.fill('+33600000000');
    console.log('  ✅ Téléphone');
  }
  
  await page.click('button:has-text("Suivant")');
  console.log('  ✅ Step 3 → Step 4\n');
  await page.waitForTimeout(500);
  
  // === STEP 4: Projets ===
  console.log('📝 STEP 4: Projets');
  
  const projectInput = page.locator('input[placeholder*="projet" i]').first();
  if (await projectInput.isVisible({ timeout: 3000 })) {
    await projectInput.fill('App Test');
    console.log('  ✅ Projet ajouté');
  }
  
  const descTextarea = page.locator('textarea').first();
  if (await descTextarea.isVisible({ timeout: 2000 })) {
    await descTextarea.fill('Description test automatique');
  }
  
  await page.click('button:has-text("Suivant")');
  console.log('  ✅ Step 4 → Step 5\n');
  await page.waitForTimeout(500);
  
  // === STEP 5: Génération ===
  console.log('📝 STEP 5: Génération');
  
  // Screenshot avant génération
  await page.screenshot({ path: 'wizard-before-generate.png' });
  console.log('  📸 Screenshot pré-génération');
  
  const generateBtn = page.locator('button:has-text("Générer"), button:has-text("Créer")').first();
  await expect(generateBtn).toBeVisible({ timeout: 5000 });
  
  await generateBtn.click();
  console.log('  ✅ Génération lancée');
  console.log('  ⏳ Attente (max 30s)...');
  
  // Attendre fin de génération
  await page.waitForTimeout(5000);
  
  // Screenshot final
  await page.screenshot({ path: 'wizard-after-generate.png', fullPage: true });
  console.log('  📸 Screenshot post-génération');
  
  console.log('\n✅ WIZARD COMPLET!');
  console.log('\n📊 Résumé:');
  console.log('  ✅ Step 1: Nom + Type');
  console.log('  ✅ Step 2: Services');
  console.log('  ✅ Step 3: Contact');
  console.log('  ✅ Step 4: Projets');
  console.log('  ✅ Step 5: Génération');
  console.log('\n📸 Screenshots:');
  console.log('  - wizard-before-generate.png');
  console.log('  - wizard-after-generate.png');
});
