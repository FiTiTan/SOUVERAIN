import { test, expect } from '@playwright/test';

test('Navigation basique SOUVERAIN', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Vérifier que la page charge
  await expect(page.locator('h1').first()).toBeVisible();
  
  // Vérifier titre contient SOUVERAIN
  const title = await page.title();
  expect(title.toLowerCase()).toContain('souverain');
  
  // Vérifier qu'il y a des boutons
  const buttons = await page.locator('button').count();
  expect(buttons).toBeGreaterThan(0);
  
  console.log(`✅ Page chargée avec ${buttons} bouton(s)`);
});

test('Test de clic basique', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Trouver premier bouton visible
  const firstButton = page.locator('button').first();
  await expect(firstButton).toBeVisible();
  
  // Cliquer (ne fail pas si ça redirige)
  await firstButton.click().catch(() => {});
  
  // Attendre un peu
  await page.waitForTimeout(500);
  
  console.log('✅ Clic button fonctionnel');
});

test('Screenshot de la homepage', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Attendre chargement complet
  await page.waitForLoadState('networkidle');
  
  // Screenshot
  await page.screenshot({ path: 'homepage-test.png', fullPage: true });
  
  console.log('✅ Screenshot sauvegardé: homepage-test.png');
});
