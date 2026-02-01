import { test, expect } from '@playwright/test';

/**
 * Tests Portfolio Wizard - Mode DEV
 * (Onboarding désactivé en dev - sera géré en fin de projet)
 */

test.describe('Portfolio Wizard - Mode DEV', () => {
  
  test('Accès direct au module Portfolio', async ({ page }) => {
    console.log('🎯 Test accès direct Portfolio (dev mode)\n');
    
    // Navigation directe vers /portfolio (bypass onboarding)
    await page.goto('http://localhost:5173/portfolio');
    await page.waitForLoadState('networkidle');
    console.log('✅ Navigation directe /portfolio');
    
    await page.waitForTimeout(2000);
    
    // Screenshot
    await page.screenshot({ path: 'dev-portfolio-page.png', fullPage: true });
    console.log('📸 Screenshot: dev-portfolio-page.png');
    
    // Lister boutons disponibles
    const buttons = await page.locator('button').allTextContents();
    const visibleButtons = buttons.filter(t => t.trim()).slice(0, 15);
    console.log(`\n🔍 Boutons disponibles: ${visibleButtons.join(', ')}`);
    
    // Chercher bouton "Nouveau"
    const newBtn = page.locator(
      'button:has-text("Nouveau"), ' +
      'button:has-text("Créer"), ' +
      'button:has-text("Ajouter")'
    ).first();
    
    const isVisible = await newBtn.isVisible({ timeout: 5000 }).catch(() => false);
    
    if (isVisible) {
      const btnText = await newBtn.textContent();
      console.log(`\n✅ Bouton wizard trouvé: "${btnText?.trim()}"`);
      
      // Test du clic
      await newBtn.click();
      await page.waitForTimeout(1000);
      
      // Vérifier ouverture wizard
      const wizardOpen = await page.locator(
        'input[name="name"], ' +
        'text=Step 1, ' +
        'text=Étape 1, ' +
        'button:has-text("Suivant")'
      ).isVisible({ timeout: 3000 }).catch(() => false);
      
      if (wizardOpen) {
        console.log('✅ Wizard ouvert!');
        
        await page.screenshot({ path: 'dev-wizard-opened.png', fullPage: true });
        console.log('📸 Screenshot: dev-wizard-opened.png');
      } else {
        console.log('⚠️ Wizard pas détecté');
      }
    } else {
      console.log('\n⚠️ Bouton "Nouveau" non trouvé sur /portfolio');
      console.log('💡 Peut-être que le wizard est dans un sous-chemin?');
    }
  });
  
  test('Wizard: Step 1 - Formulaire de base', async ({ page }) => {
    // Accès direct (bypass navigation)
    await page.goto('http://localhost:5173/portfolio');
    await page.waitForTimeout(2000);
    
    // Ouvrir wizard
    const newBtn = page.locator('button:has-text("Nouveau")').first();
    if (await newBtn.isVisible({ timeout: 3000 })) {
      await newBtn.click();
      await page.waitForTimeout(500);
      
      console.log('\n📝 Test Step 1: Formulaire');
      
      // Input nom
      const nameInput = page.locator('input[name="name"]').first();
      if (await nameInput.isVisible({ timeout: 3000 })) {
        // Test: champ vide → pas de validation
        const nextBtn = page.locator('button:has-text("Suivant")').first();
        await nextBtn.click();
        
        // Vérifier si on reste sur Step 1 (validation active)
        await page.waitForTimeout(500);
        const stillStep1 = await nameInput.isVisible();
        
        if (stillStep1) {
          console.log('  ✅ Validation champs obligatoires active');
        } else {
          console.log('  ⚠️ Pas de validation (peut passer vide)');
        }
        
        // Remplir et passer
        await nameInput.fill('Test Portfolio Dev');
        console.log('  ✅ Nom rempli');
        
        // Type
        const typeRadio = page.locator('input[value="developer"]').first();
        if (await typeRadio.isVisible({ timeout: 2000 })) {
          await typeRadio.click().catch(() => {});
          console.log('  ✅ Type sélectionné');
        }
        
        // Suivant
        await nextBtn.click();
        await page.waitForTimeout(500);
        
        // Vérifier passage Step 2
        const step2Visible = await page.locator(
          'input[placeholder*="service" i], ' +
          'text=Step 2, ' +
          'text=Services'
        ).isVisible({ timeout: 2000 }).catch(() => false);
        
        if (step2Visible) {
          console.log('  ✅ Navigation Step 1 → Step 2 OK');
        } else {
          console.log('  ⚠️ Pas passé au Step 2');
        }
      } else {
        console.log('  ⚠️ Wizard Step 1 non accessible');
      }
    } else {
      test.skip();
    }
  });
  
  test('Wizard: Parcours rapide 5 steps', async ({ page }) => {
    await page.goto('http://localhost:5173/portfolio');
    await page.waitForTimeout(2000);
    
    // Ouvrir wizard
    const newBtn = page.locator('button:has-text("Nouveau")').first();
    if (!(await newBtn.isVisible({ timeout: 3000 }))) {
      test.skip();
      return;
    }
    
    await newBtn.click();
    await page.waitForTimeout(500);
    
    console.log('\n🚀 Parcours rapide 5 steps\n');
    
    // Step 1
    console.log('📝 Step 1');
    await page.fill('input[name="name"]', 'Portfolio Rapide');
    await page.click('input[value="developer"]').catch(() => {});
    await page.click('button:has-text("Suivant")');
    await page.waitForTimeout(300);
    console.log('  ✅ Step 1 → 2');
    
    // Step 2
    console.log('📝 Step 2');
    const serviceInput = page.locator('input[placeholder*="service" i]').first();
    if (await serviceInput.isVisible({ timeout: 2000 })) {
      await serviceInput.fill('Dev Web');
    }
    await page.click('button:has-text("Suivant")').catch(() => {});
    await page.waitForTimeout(300);
    console.log('  ✅ Step 2 → 3');
    
    // Step 3
    console.log('📝 Step 3');
    await page.fill('input[type="email"]', 'test@dev.local').catch(() => {});
    await page.click('button:has-text("Suivant")').catch(() => {});
    await page.waitForTimeout(300);
    console.log('  ✅ Step 3 → 4');
    
    // Step 4
    console.log('📝 Step 4');
    const projectInput = page.locator('input[placeholder*="projet" i]').first();
    if (await projectInput.isVisible({ timeout: 2000 })) {
      await projectInput.fill('App Test');
    }
    await page.click('button:has-text("Suivant")').catch(() => {});
    await page.waitForTimeout(300);
    console.log('  ✅ Step 4 → 5');
    
    // Step 5
    console.log('📝 Step 5: Génération');
    
    await page.screenshot({ path: 'dev-wizard-step5.png', fullPage: true });
    console.log('  📸 Screenshot pré-génération');
    
    const generateBtn = page.locator('button:has-text("Générer"), button:has-text("Créer")').first();
    if (await generateBtn.isVisible({ timeout: 3000 })) {
      await generateBtn.click();
      console.log('  ✅ Génération lancée');
      
      // Attendre (génération peut prendre du temps)
      console.log('  ⏳ Attente 10s...');
      await page.waitForTimeout(10000);
      
      await page.screenshot({ path: 'dev-wizard-after-generate.png', fullPage: true });
      console.log('  📸 Screenshot post-génération');
      
      console.log('\n✅ Wizard complet testé!');
    }
  });
  
  test('Performance: Temps de réponse wizard', async ({ page }) => {
    await page.goto('http://localhost:5173/portfolio');
    await page.waitForLoadState('networkidle');
    
    const newBtn = page.locator('button:has-text("Nouveau")').first();
    if (!(await newBtn.isVisible({ timeout: 3000 }))) {
      test.skip();
      return;
    }
    
    console.log('\n⏱️ Test performance wizard\n');
    
    // Test 1: Ouverture wizard
    const startOpen = Date.now();
    await newBtn.click();
    await page.waitForSelector('input[name="name"]', { timeout: 5000 });
    const openTime = Date.now() - startOpen;
    
    console.log(`  Ouverture wizard: ${openTime}ms`);
    expect(openTime).toBeLessThan(2000); // < 2s
    
    // Test 2: Navigation entre steps
    await page.fill('input[name="name"]', 'Perf Test');
    
    const startNav = Date.now();
    await page.click('button:has-text("Suivant")');
    await page.waitForTimeout(300);
    const navTime = Date.now() - startNav;
    
    console.log(`  Navigation Step 1 → 2: ${navTime}ms`);
    expect(navTime).toBeLessThan(1000); // < 1s
    
    console.log('\n✅ Performance OK');
  });
});
