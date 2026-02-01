#!/usr/bin/env node
/**
 * Exemple d'automation SOUVERAIN avec Playwright
 * Teste l'interface React en mode dev (localhost:5173)
 */

import { chromium } from 'playwright';

async function testSOUVERAIN() {
  console.log('🎭 Lancement de l\'automation SOUVERAIN\n');
  
  // Lance le browser en headless
  const browser = await chromium.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'] // Pour VPS
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  try {
    // 1. Navigation
    console.log('📍 Navigation vers http://localhost:5173');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    console.log('✅ Page chargée\n');
    
    // 2. Capture du titre
    const title = await page.title();
    console.log(`📄 Titre: ${title}`);
    
    // 3. Snapshot de la structure
    console.log('\n🔍 Structure de la page:');
    const structure = await page.evaluate(() => {
      const headers = Array.from(document.querySelectorAll('h1, h2, h3')).map(h => ({
        tag: h.tagName,
        text: h.textContent?.trim().substring(0, 50)
      }));
      
      const buttons = Array.from(document.querySelectorAll('button')).map(b => ({
        text: b.textContent?.trim() || b.getAttribute('aria-label'),
        classes: b.className
      }));
      
      return { headers, buttons };
    });
    
    console.log('\n📋 Headers trouvés:');
    structure.headers.forEach(h => console.log(`  ${h.tag}: ${h.text}`));
    
    console.log('\n🔘 Boutons trouvés:');
    structure.buttons.slice(0, 10).forEach(b => console.log(`  - ${b.text}`));
    
    // 4. Vérifier le thème (CALM-UI)
    console.log('\n🎨 Vérification du thème CALM-UI:');
    const themeCheck = await page.evaluate(() => {
      const bodyStyles = window.getComputedStyle(document.body);
      return {
        backgroundColor: bodyStyles.backgroundColor,
        color: bodyStyles.color,
        hasThemeContext: !!window.__THEME_CONTEXT__ // Si exposé
      };
    });
    console.log(`  Background: ${themeCheck.backgroundColor}`);
    console.log(`  Color: ${themeCheck.color}`);
    
    // 5. Capture d'écran
    console.log('\n📸 Capture d\'écran...');
    await page.screenshot({ 
      path: '/home/ubuntu/clawd/SOUVERAIN/screenshot-test.png',
      fullPage: true 
    });
    console.log('✅ Screenshot sauvegardé: screenshot-test.png');
    
    // 6. Test interaction: clic sur un bouton (si présent)
    const firstButton = await page.$('button');
    if (firstButton) {
      console.log('\n🖱️  Test d\'interaction: clic sur premier bouton');
      const buttonText = await firstButton.textContent();
      console.log(`  Bouton: "${buttonText}"`);
      await firstButton.click();
      await page.waitForTimeout(1000);
      console.log('✅ Clic effectué');
    }
    
    // 7. Vérifier console errors
    console.log('\n⚠️  Erreurs console:');
    const consoleLogs = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleLogs.push(msg.text());
      }
    });
    
    await page.waitForTimeout(2000);
    if (consoleLogs.length > 0) {
      consoleLogs.forEach(log => console.log(`  ❌ ${log}`));
    } else {
      console.log('  ✅ Aucune erreur console détectée');
    }
    
    console.log('\n✅ Automation terminée avec succès!');
    
  } catch (error) {
    console.error('\n❌ Erreur durant l\'automation:', error.message);
  } finally {
    await browser.close();
  }
}

// Exécution
testSOUVERAIN().catch(console.error);
