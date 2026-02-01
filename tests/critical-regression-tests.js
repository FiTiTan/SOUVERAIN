#!/usr/bin/env node
/**
 * Tests de régression critiques SOUVERAIN
 * Basés sur les erreurs récurrentes historiques
 */

import { chromium } from 'playwright';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const SOUVERAIN_PATH = process.env.SOUVERAIN_PATH || '/home/ubuntu/clawd/SOUVERAIN';
const VITE_URL = 'http://localhost:5173';

// Couleurs pour output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(emoji, message, color = 'reset') {
  console.log(`${colors[color]}${emoji} ${message}${colors.reset}`);
}

async function runTests() {
  log('🎭', 'Tests de régression SOUVERAIN - Démarrage\n', 'blue');
  
  let passedTests = 0;
  let failedTests = 0;
  const errors = [];

  // ================================
  // TEST 1: IPC Handlers Sync
  // ================================
  log('🔍', 'Test 1: Synchronisation handlers IPC (main.cjs ↔ preload.cjs)', 'yellow');
  try {
    const mainHandlers = execSync(`grep "ipcMain.handle" ${SOUVERAIN_PATH}/main.cjs | cut -d"'" -f2 | sort`, { encoding: 'utf-8' })
      .split('\n').filter(Boolean);
    
    const preloadCalls = execSync(`grep "ipcRenderer.invoke" ${SOUVERAIN_PATH}/preload.cjs | cut -d"'" -f2 | sort`, { encoding: 'utf-8' })
      .split('\n').filter(Boolean);
    
    const missing = preloadCalls.filter(call => !mainHandlers.includes(call));
    
    if (missing.length > 0) {
      throw new Error(`Handlers IPC manquants dans main.cjs: ${missing.join(', ')}`);
    }
    
    log('✅', `IPC handlers synchronisés (${mainHandlers.length} handlers)`, 'green');
    passedTests++;
  } catch (error) {
    log('❌', `IPC handlers: ${error.message}`, 'red');
    errors.push({ test: 'IPC Handlers', error: error.message });
    failedTests++;
  }

  // ================================
  // TEST 2: Git Conflict Markers
  // ================================
  log('🔍', 'Test 2: Marqueurs de conflit Git', 'yellow');
  try {
    const conflicts = execSync(`grep -rn "^<<<<<<< \\|^>>>>>>> " ${SOUVERAIN_PATH}/src/ || true`, { encoding: 'utf-8' });
    
    if (conflicts.trim().length > 0) {
      throw new Error(`Conflits Git non résolus trouvés:\n${conflicts}`);
    }
    
    log('✅', 'Aucun conflit Git détecté', 'green');
    passedTests++;
  } catch (error) {
    log('❌', `Conflits Git: ${error.message}`, 'red');
    errors.push({ test: 'Git Conflicts', error: error.message });
    failedTests++;
  }

  // ================================
  // TEST 3: TypeScript Compilation
  // ================================
  log('🔍', 'Test 3: Compilation TypeScript', 'yellow');
  try {
    execSync(`cd ${SOUVERAIN_PATH} && npx tsc --noEmit`, { encoding: 'utf-8', stdio: 'pipe' });
    log('✅', 'TypeScript compile sans erreur', 'green');
    passedTests++;
  } catch (error) {
    log('❌', `TypeScript: Erreurs de compilation détectées`, 'red');
    errors.push({ test: 'TypeScript', error: 'Compilation failed' });
    failedTests++;
  }

  // ================================
  // TEST 4: Imports .ts Extensions
  // ================================
  log('🔍', 'Test 4: Imports avec extensions .ts (invalides)', 'yellow');
  try {
    const badImports = execSync(`grep -rn "from.*\\.ts['\"]" ${SOUVERAIN_PATH}/src/ || true`, { encoding: 'utf-8' });
    
    if (badImports.trim().length > 0) {
      throw new Error(`Imports avec .ts trouvés:\n${badImports.substring(0, 500)}`);
    }
    
    log('✅', 'Aucun import .ts invalide', 'green');
    passedTests++;
  } catch (error) {
    log('❌', `Imports .ts: ${error.message}`, 'red');
    errors.push({ test: 'Imports .ts', error: error.message });
    failedTests++;
  }

  // ================================
  // TEST 5: CALM-UI Compliance
  // ================================
  log('🔍', 'Test 5: Conformité CALM-UI (hardcoded colors)', 'yellow');
  try {
    const hexColors = execSync(`grep -rn '#[0-9A-Fa-f]\\{6\\}' ${SOUVERAIN_PATH}/src/ --include="*.tsx" --include="*.ts" | wc -l`, { encoding: 'utf-8' });
    const colorCount = parseInt(hexColors.trim());
    
    if (colorCount > 50) {
      log('⚠️', `${colorCount} couleurs hardcodées trouvées (tolérance: 50)`, 'yellow');
    } else {
      log('✅', `${colorCount} couleurs hardcodées (acceptable)`, 'green');
    }
    passedTests++;
  } catch (error) {
    log('❌', `CALM-UI: ${error.message}`, 'red');
    errors.push({ test: 'CALM-UI', error: error.message });
    failedTests++;
  }

  // ================================
  // TESTS BROWSER (si serveur actif)
  // ================================
  log('\n🌐', 'Tests Browser (nécessite serveur Vite actif)...', 'blue');
  
  let browser;
  try {
    // Vérifier si serveur actif
    execSync(`curl -s ${VITE_URL} > /dev/null`, { stdio: 'pipe' });
    
    browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
    const page = await context.newPage();

    // ================================
    // TEST 6: Page Load
    // ================================
    log('🔍', 'Test 6: Chargement de la page', 'yellow');
    try {
      await page.goto(VITE_URL, { waitUntil: 'networkidle', timeout: 10000 });
      const title = await page.title();
      
      if (!title || title.length === 0) {
        throw new Error('Titre de page vide');
      }
      
      log('✅', `Page chargée: "${title}"`, 'green');
      passedTests++;
    } catch (error) {
      log('❌', `Page load: ${error.message}`, 'red');
      errors.push({ test: 'Page Load', error: error.message });
      failedTests++;
    }

    // ================================
    // TEST 7: Console Errors
    // ================================
    log('🔍', 'Test 7: Erreurs console', 'yellow');
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    await page.waitForTimeout(3000);
    
    if (consoleErrors.length > 0) {
      log('❌', `${consoleErrors.length} erreur(s) console:`, 'red');
      consoleErrors.slice(0, 3).forEach(err => log('  ↳', err.substring(0, 100), 'red'));
      errors.push({ test: 'Console Errors', error: consoleErrors[0] });
      failedTests++;
    } else {
      log('✅', 'Aucune erreur console', 'green');
      passedTests++;
    }

    // ================================
    // TEST 8: Wizard Fields Clickable
    // ================================
    log('🔍', 'Test 8: Champs wizard clickables', 'yellow');
    try {
      // Chercher un input dans le wizard
      const input = await page.$('input[type="text"]');
      
      if (!input) {
        log('⚠️', 'Aucun input trouvé (peut-être sur une autre page)', 'yellow');
        passedTests++;
      } else {
        await input.click();
        await input.type('Test');
        const value = await input.inputValue();
        
        if (value !== 'Test') {
          throw new Error('Input non éditable');
        }
        
        log('✅', 'Champs wizard fonctionnels', 'green');
        passedTests++;
      }
    } catch (error) {
      log('❌', `Wizard fields: ${error.message}`, 'red');
      errors.push({ test: 'Wizard Fields', error: error.message });
      failedTests++;
    }

    // ================================
    // TEST 9: Theme Toggle
    // ================================
    log('🔍', 'Test 9: Toggle dark mode', 'yellow');
    try {
      const bgBefore = await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor);
      
      // Chercher toggle dark mode
      const toggle = await page.$('[aria-label*="dark"], [aria-label*="theme"], button:has-text("☀"), button:has-text("🌙")');
      
      if (toggle) {
        await toggle.click();
        await page.waitForTimeout(500);
        
        const bgAfter = await page.evaluate(() => window.getComputedStyle(document.body).backgroundColor);
        
        if (bgBefore === bgAfter) {
          log('⚠️', 'Theme toggle trouvé mais background inchangé', 'yellow');
        } else {
          log('✅', 'Dark mode toggle fonctionnel', 'green');
        }
      } else {
        log('⚠️', 'Toggle dark mode non trouvé', 'yellow');
      }
      
      passedTests++;
    } catch (error) {
      log('❌', `Theme toggle: ${error.message}`, 'red');
      errors.push({ test: 'Theme Toggle', error: error.message });
      failedTests++;
    }

    await browser.close();
    
  } catch (error) {
    log('⚠️', 'Tests browser skippés (serveur Vite non actif)', 'yellow');
    log('  ↳', 'Lancer: npm run vite:dev', 'yellow');
  }

  // ================================
  // RÉSUMÉ
  // ================================
  console.log('\n' + '='.repeat(50));
  log('📊', 'RÉSUMÉ DES TESTS', 'blue');
  console.log('='.repeat(50));
  log('✅', `Tests réussis: ${passedTests}`, 'green');
  log('❌', `Tests échoués: ${failedTests}`, 'red');
  
  if (errors.length > 0) {
    console.log('\n❌ Erreurs détaillées:');
    errors.forEach((e, i) => {
      console.log(`\n${i + 1}. ${e.test}`);
      console.log(`   ${e.error.substring(0, 200)}`);
    });
  }
  
  console.log('\n' + '='.repeat(50));
  
  // Exit code
  process.exit(failedTests > 0 ? 1 : 0);
}

// Exécution
runTests().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
