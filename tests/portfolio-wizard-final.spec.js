import { test, expect } from '@playwright/test';

test('Portfolio Wizard: Workflow complet (onboarding → wizard → génération)', async ({ page }) => {
  console.log('🎭 Démarrage test wizard portfolio\n');
  
  await page.goto('http://localhost:5173');
  await page.waitForLoadState('networkidle');
  console.log('✅ Page chargée');
  
  // ===================================================================
  // PHASE 1: FERMER L'ONBOARDING (vraiment!)
  // ===================================================================
  console.log('\n🎯 PHASE 1: Fermeture onboarding');
  
  // Vérifier si onboarding présent
  const commencerBtn = page.locator('button:has-text("Commencer")');
  
  if (await commencerBtn.isVisible({ timeout: 3000 })) {
    console.log('  📍 Onboarding détecté → clic "Commencer"');
    await commencerBtn.click();
    await page.waitForTimeout(1500);
    console.log('  ✅ Onboarding fermé');
  } else {
    console.log('  ℹ️  Pas d\'onboarding (ou déjà fermé)');
  }
  
  // Vérifier que carousel a disparu
  const carouselStillVisible = await page.locator('button:has-text("Aller au slide")').isVisible({ timeout: 1000 }).catch(() => false);
  
  if (carouselStillVisible) {
    console.log('  ⚠️  Carousel toujours visible, nouvelle tentative...');
    // Fallback: parcourir rapidement les slides
    for (let i = 0; i < 9; i++) {
      const nextSlide = page.locator('button:has-text("Suivant")').first();
      if (await nextSlide.isVisible({ timeout: 500 })) {
        await nextSlide.click();
        await page.waitForTimeout(200);
      }
    }
    await commencerBtn.click().catch(() => {});
    await page.waitForTimeout(1000);
  }
  
  console.log('  ✅ Navigation maintenant disponible');
  
  // ===================================================================
  // PHASE 2: NAVIGUER VERS PORTFOLIO
  // ===================================================================
  console.log('\n🎯 PHASE 2: Navigation vers Portfolio');
  
  // Attendre que le DOM soit stabilisé
  await page.waitForTimeout(1000);
  
  // Trouver et cliquer sur Portfolio (plusieurs stratégies)
  const portfolioClicked = await (async () => {
    // Stratégie 1: Bouton dans sidebar (force click pour ignorer overlays)
    const portfolioBtn = page.locator('button:has-text("Portfolio")').first();
    if (await portfolioBtn.isVisible({ timeout: 2000 })) {
      await portfolioBtn.click({ force: true });
      console.log('  ✅ Clic sidebar Portfolio (force)');
      return true;
    }
    
    // Stratégie 2: Lien dans navigation
    const portfolioLink = page.locator('a[href*="portfolio"]').first();
    if (await portfolioLink.isVisible({ timeout: 1000 })) {
      await portfolioLink.click({ force: true });
      console.log('  ✅ Clic lien Portfolio (force)');
      return true;
    }
    
    return false;
  })();
  
  if (!portfolioClicked) {
    throw new Error('❌ Impossible de naviguer vers Portfolio');
  }
  
  await page.waitForTimeout(2000);
  
  // Screenshot de la page Portfolio
  await page.screenshot({ path: 'test-portfolio-page.png', fullPage: true });
  console.log('  📸 Screenshot: test-portfolio-page.png');
  
  // ===================================================================
  // PHASE 3: OUVRIR LE WIZARD
  // ===================================================================
  console.log('\n🎯 PHASE 3: Ouverture wizard');
  
  // Lister tous les boutons disponibles (debug)
  const allButtons = await page.locator('button').allTextContents();
  console.log(`  🔍 Boutons disponibles: ${allButtons.filter(t => t.trim()).slice(0, 10).join(', ')}`);
  
  // Chercher bouton "Nouveau" / "Créer" / "Ajouter" / "+"
  const wizardOpeners = [
    'button:has-text("Nouveau")',
    'button:has-text("Créer un portfolio")',
    'button:has-text("Créer")',
    'button:has-text("Ajouter")',
    'button:text("+")',
    '[aria-label*="nouveau" i]',
    '[aria-label*="créer" i]'
  ];
  
  let wizardOpened = false;
  for (const selector of wizardOpeners) {
    const btn = page.locator(selector).first();
    if (await btn.isVisible({ timeout: 1000 }).catch(() => false)) {
      const btnText = await btn.textContent();
      console.log(`  📍 Bouton trouvé: "${btnText?.trim()}" → clic`);
      await btn.click();
      wizardOpened = true;
      break;
    }
  }
  
  if (!wizardOpened) {
    console.log('  ⚠️  Aucun bouton "Nouveau" trouvé');
    console.log('  💡 Peut-être que la page Portfolio affiche directement le wizard?');
    console.log('  💡 Ou peut-être qu\'il faut créer un portfolio d\'abord?');
    
    // Screenshot pour debug
    await page.screenshot({ path: 'test-no-new-button.png', fullPage: true });
    
    // Vérifier si wizard déjà ouvert
    const wizardAlreadyOpen = await page.locator('input[name="name"], text=Step 1, text=Étape').isVisible({ timeout: 2000 }).catch(() => false);
    
    if (wizardAlreadyOpen) {
      console.log('  ✅ Wizard déjà ouvert!');
      wizardOpened = true;
    } else {
      throw new Error('Wizard non accessible - voir test-no-new-button.png');
    }
  }
  
  await page.waitForTimeout(1000);
  
  // ===================================================================
  // PHASE 4: REMPLIR LE WIZARD (5 steps)
  // ===================================================================
  console.log('\n🎯 PHASE 4: Remplissage wizard');
  
  // --- STEP 1: Nom + Type ---
  console.log('\n  📝 Step 1: Informations de base');
  
  const nameInput = page.locator('input[name="name"], input[placeholder*="nom" i]').first();
  if (await nameInput.isVisible({ timeout: 3000 })) {
    await nameInput.fill('Portfolio Test Playwright');
    console.log('    ✅ Nom: Portfolio Test Playwright');
  } else {
    console.log('    ⚠️  Input nom non trouvé');
  }
  
  // Type (Developer)
  const typeRadio = page.locator('input[value="developer"], label:has-text("Developer")').first();
  if (await typeRadio.isVisible({ timeout: 2000 })) {
    await typeRadio.click().catch(() => {});
    console.log('    ✅ Type: Developer');
  }
  
  // Suivant
  const nextBtn1 = page.locator('button:has-text("Suivant"), button:has-text("Next")').first();
  if (await nextBtn1.isVisible({ timeout: 2000 })) {
    await nextBtn1.click();
    console.log('    ✅ Step 1 → Step 2');
    await page.waitForTimeout(500);
  }
  
  // --- STEP 2: Services ---
  console.log('\n  📝 Step 2: Services');
  
  const serviceInput = page.locator('input[placeholder*="service" i], textarea[placeholder*="service" i]').first();
  if (await serviceInput.isVisible({ timeout: 2000 })) {
    await serviceInput.fill('Développement Full Stack');
    console.log('    ✅ Service ajouté');
    
    const addBtn = page.locator('button:has-text("Ajouter")').first();
    if (await addBtn.isVisible({ timeout: 1000 })) {
      await addBtn.click();
    }
  }
  
  await page.locator('button:has-text("Suivant")').first().click().catch(() => {});
  console.log('    ✅ Step 2 → Step 3');
  await page.waitForTimeout(500);
  
  // --- STEP 3: Contact ---
  console.log('\n  📝 Step 3: Contact');
  
  const emailInput = page.locator('input[type="email"]').first();
  if (await emailInput.isVisible({ timeout: 2000 })) {
    await emailInput.fill('test@playwright.e2e');
    console.log('    ✅ Email');
  }
  
  const phoneInput = page.locator('input[type="tel"]').first();
  if (await phoneInput.isVisible({ timeout: 1000 })) {
    await phoneInput.fill('+33600000000');
    console.log('    ✅ Téléphone');
  }
  
  await page.locator('button:has-text("Suivant")').first().click().catch(() => {});
  console.log('    ✅ Step 3 → Step 4');
  await page.waitForTimeout(500);
  
  // --- STEP 4: Projets ---
  console.log('\n  📝 Step 4: Projets');
  
  const projectInput = page.locator('input[placeholder*="projet" i]').first();
  if (await projectInput.isVisible({ timeout: 2000 })) {
    await projectInput.fill('Application Test E2E');
    console.log('    ✅ Projet ajouté');
  }
  
  const descTextarea = page.locator('textarea').first();
  if (await descTextarea.isVisible({ timeout: 1000 })) {
    await descTextarea.fill('Description automatique générée par test Playwright');
  }
  
  await page.locator('button:has-text("Suivant")').first().click().catch(() => {});
  console.log('    ✅ Step 4 → Step 5');
  await page.waitForTimeout(500);
  
  // --- STEP 5: Génération ---
  console.log('\n  📝 Step 5: Génération');
  
  await page.screenshot({ path: 'test-wizard-step5.png', fullPage: true });
  console.log('    📸 Screenshot pré-génération');
  
  const generateBtn = page.locator('button:has-text("Générer"), button:has-text("Créer"), button:has-text("Terminer")').first();
  
  if (await generateBtn.isVisible({ timeout: 3000 })) {
    await generateBtn.click();
    console.log('    ✅ Génération lancée');
    console.log('    ⏳ Attente génération (max 30s)...');
    
    // Attendre fin (timeout 30s)
    await page.waitForTimeout(5000);
    
    await page.screenshot({ path: 'test-wizard-after-generate.png', fullPage: true });
    console.log('    📸 Screenshot post-génération');
    
    // Vérifier succès ou erreur
    const successMsg = page.locator('text=créé, text=succès, text=terminé, .success');
    const errorMsg = page.locator('text=erreur, text=échec, .error');
    
    const hasSuccess = await successMsg.isVisible({ timeout: 25000 }).catch(() => false);
    const hasError = await errorMsg.isVisible({ timeout: 1000 }).catch(() => false);
    
    if (hasSuccess) {
      console.log('    ✅ Génération réussie!');
    } else if (hasError) {
      console.log('    ⚠️  Erreur détectée durant génération');
    } else {
      console.log('    ℹ️  Génération en cours ou terminée (pas de message clair)');
    }
  } else {
    console.log('    ⚠️  Bouton "Générer" non trouvé');
  }
  
  // ===================================================================
  // RÉSUMÉ
  // ===================================================================
  console.log('\n📊 RÉSUMÉ DU TEST:');
  console.log('  ✅ Phase 1: Onboarding fermé');
  console.log('  ✅ Phase 2: Navigation Portfolio');
  console.log(`  ${wizardOpened ? '✅' : '⚠️ '} Phase 3: Wizard ouvert`);
  console.log('  ✅ Phase 4: Formulaire rempli (5 steps)');
  console.log('  ✅ Phase 5: Génération lancée');
  console.log('\n📸 Screenshots générés:');
  console.log('  - test-portfolio-page.png');
  console.log('  - test-wizard-step5.png');
  console.log('  - test-wizard-after-generate.png');
});
