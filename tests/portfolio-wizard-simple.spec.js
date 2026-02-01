import { test, expect } from '@playwright/test';

test('Portfolio: Vérifier que le bouton "Nouveau" existe', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Fermer onboarding complètement
  console.log('⏳ Fermeture onboarding...');
  
  // Cliquer "Passer" jusqu'à ce qu'il disparaisse
  for (let i = 0; i < 3; i++) {
    const skipBtn = page.locator('button:has-text("Passer")');
    if (await skipBtn.isVisible({ timeout: 1000 })) {
      await skipBtn.click();
      await page.waitForTimeout(500);
    } else {
      break;
    }
  }
  
  // Ou cliquer "Commencer" si disponible
  const startBtn = page.locator('button:has-text("Commencer")');
  if (await startBtn.isVisible({ timeout: 1000 })) {
    await startBtn.click();
    console.log('✅ Onboarding fermé');
  }
  
  await page.waitForTimeout(1000);
  
  // Navigation vers Portfolio
  console.log('📍 Navigation Portfolio...');
  
  // Click force sur Portfolio
  await page.locator('button:has-text("Portfolio")').click({ force: true });
  await page.waitForTimeout(2000);
  
  // Screenshot de la page Portfolio
  await page.screenshot({ path: 'portfolio-page.png', fullPage: true });
  console.log('📸 Screenshot: portfolio-page.png');
  
  // Lister TOUS les boutons sur la page
  const buttons = await page.locator('button').all();
  console.log(`\n🔍 ${buttons.length} boutons trouvés sur la page:`);
  
  for (let i = 0; i < Math.min(buttons.length, 20); i++) {
    const text = await buttons[i].textContent();
    const ariaLabel = await buttons[i].getAttribute('aria-label');
    console.log(`  ${i + 1}. "${text?.trim() || ariaLabel || '[sans texte]'}"`);
  }
  
  // Chercher bouton "Nouveau" ou équivalent
  const possibleButtons = [
    'button:has-text("Nouveau")',
    'button:has-text("Créer")',
    'button:has-text("Ajouter")',
    'button:has-text("+")',
    '[aria-label*="nouveau" i]',
    '[aria-label*="créer" i]'
  ];
  
  let foundButton = null;
  for (const selector of possibleButtons) {
    const btn = page.locator(selector).first();
    if (await btn.isVisible({ timeout: 1000 }).catch(() => false)) {
      const text = await btn.textContent();
      foundButton = { selector, text };
      console.log(`\n✅ Bouton trouvé: "${text}" (${selector})`);
      break;
    }
  }
  
  if (!foundButton) {
    console.log('\n❌ Aucun bouton "Nouveau/Créer/Ajouter" trouvé');
    console.log('💡 Suggestion: Vérifier screenshot portfolio-page.png');
  } else {
    // Tester le clic
    console.log('\n🧪 Test du clic...');
    await page.locator(foundButton.selector).first().click();
    await page.waitForTimeout(1000);
    
    // Screenshot après clic
    await page.screenshot({ path: 'portfolio-after-click.png', fullPage: true });
    console.log('📸 Screenshot après clic: portfolio-after-click.png');
    
    // Vérifier si wizard ouvert
    const wizardIndicators = [
      'text=Step 1',
      'text=Étape 1',
      'input[name="name"]',
      'text=Informations',
      'button:has-text("Suivant")'
    ];
    
    let wizardOpen = false;
    for (const indicator of wizardIndicators) {
      if (await page.locator(indicator).isVisible({ timeout: 2000 }).catch(() => false)) {
        console.log(`✅ Wizard détecté: ${indicator}`);
        wizardOpen = true;
        break;
      }
    }
    
    if (wizardOpen) {
      console.log('\n✅ WIZARD PORTFOLIO ACCESSIBLE!');
    } else {
      console.log('\n⚠️ Wizard pas détecté après clic');
    }
  }
});
