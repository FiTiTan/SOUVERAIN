import { test, expect } from '@playwright/test';

test('Demo: page SOUVERAIN charge correctement', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Vérifier titre (premier h1)
  await expect(page.locator('h1').first()).toContainText(/SOUVERAIN|Bienvenue/i);
  
  // Vérifier pas d'erreur console
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  
  await page.waitForTimeout(2000);
  
  expect(consoleErrors).toHaveLength(0);
});
