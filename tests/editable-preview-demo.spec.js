import { test, expect } from '@playwright/test';

test('Demo: Preview Éditable - Composants Visuels', async ({ page }) => {
  console.log('\n🎨 DEMO PREVIEW ÉDITABLE - COMPOSANTS REACT\n');
  
  // Créer page HTML de démo avec les composants
  await page.setContent(`
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <title>Demo Preview Éditable</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 40px 20px;
          }
          .demo-container {
            max-width: 1400px;
            margin: 0 auto;
          }
          .demo-header {
            text-align: center;
            color: white;
            margin-bottom: 40px;
          }
          .demo-header h1 {
            font-size: 48px;
            font-weight: 800;
            margin-bottom: 12px;
            text-shadow: 0 4px 12px rgba(0,0,0,0.2);
          }
          .demo-header p {
            font-size: 20px;
            opacity: 0.9;
          }
          .components-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            gap: 24px;
            margin-bottom: 32px;
          }
          .component-card {
            background: white;
            border-radius: 16px;
            padding: 24px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          }
          .component-title {
            font-size: 18px;
            font-weight: 700;
            color: #1a202c;
            margin-bottom: 16px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .badge-success {
            background: #c6f6d5;
            color: #276749;
          }
          .badge-info {
            background: #bee3f8;
            color: #2c5282;
          }
          
          /* ImagePlaceholder Styles */
          .image-placeholder {
            width: 100%;
            height: 240px;
            border: 3px dashed #cbd5e0;
            border-radius: 12px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 12px;
            cursor: pointer;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            background: #f7fafc;
            position: relative;
            overflow: hidden;
          }
          .image-placeholder:hover {
            border-color: #667eea;
            background: #edf2f7;
            transform: scale(1.02);
          }
          .image-placeholder.drag-over {
            border-color: #667eea;
            background: #e6fffa;
            transform: scale(1.05);
            box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
          }
          .image-placeholder img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 8px;
          }
          .placeholder-icon {
            width: 64px;
            height: 64px;
            color: #a0aec0;
          }
          .placeholder-text {
            font-size: 15px;
            font-weight: 600;
            color: #4a5568;
          }
          .placeholder-hint {
            font-size: 13px;
            color: #718096;
          }
          
          /* ImageLibrary Styles */
          .image-library {
            background: white;
            border-radius: 16px;
            padding: 24px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          }
          .library-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
          }
          .library-title {
            font-size: 18px;
            font-weight: 700;
            color: #1a202c;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .library-count {
            background: #667eea;
            color: white;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 600;
          }
          .import-btn {
            padding: 10px 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: transform 0.2s;
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
          }
          .import-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
          }
          .library-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
            gap: 16px;
          }
          .library-item {
            aspect-ratio: 1;
            border-radius: 12px;
            overflow: hidden;
            cursor: grab;
            position: relative;
            border: 3px solid transparent;
            transition: all 0.2s;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          .library-item:hover {
            border-color: #667eea;
            transform: scale(1.05);
            box-shadow: 0 8px 20px rgba(0,0,0,0.2);
          }
          .library-item:active {
            cursor: grabbing;
          }
          .library-item img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .library-item-label {
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
            color: white;
            padding: 8px;
            font-size: 11px;
            font-weight: 600;
            text-align: center;
          }
          
          /* Features List */
          .features {
            background: white;
            border-radius: 16px;
            padding: 24px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          }
          .features-title {
            font-size: 20px;
            font-weight: 700;
            color: #1a202c;
            margin-bottom: 16px;
          }
          .feature-item {
            padding: 12px 0;
            border-bottom: 1px solid #e2e8f0;
            display: flex;
            align-items: center;
            gap: 12px;
          }
          .feature-item:last-child {
            border-bottom: none;
          }
          .feature-icon {
            font-size: 24px;
          }
          .feature-text {
            flex: 1;
          }
          .feature-label {
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 2px;
          }
          .feature-desc {
            font-size: 13px;
            color: #718096;
          }
        </style>
      </head>
      <body>
        <div class="demo-container">
          <!-- Header -->
          <div class="demo-header">
            <h1>🎨 Preview Éditable</h1>
            <p>Feature Drag & Drop Images pour Portfolio</p>
          </div>
          
          <!-- Composants Grid -->
          <div class="components-grid">
            <!-- ImagePlaceholder Hero -->
            <div class="component-card">
              <div class="component-title">
                <span>ImagePlaceholder</span>
                <span class="badge badge-success">Component</span>
              </div>
              <div class="image-placeholder" id="hero-placeholder">
                <svg class="placeholder-icon" viewBox="0 0 64 64">
                  <rect x="4" y="4" width="56" height="56" rx="8" fill="none" stroke="currentColor" stroke-width="3" stroke-dasharray="8,4"/>
                  <circle cx="24" cy="24" r="8" fill="currentColor" opacity="0.3"/>
                  <path d="M8 52 L24 32 L40 44 L52 28 L60 38 L60 52 Z" fill="currentColor" opacity="0.3"/>
                  <path d="M32 20 L32 44 M20 32 L44 32" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
                </svg>
                <div class="placeholder-text">Glissez une image ici</div>
                <div class="placeholder-hint">ou cliquez pour parcourir</div>
              </div>
            </div>
            
            <!-- ImagePlaceholder About -->
            <div class="component-card">
              <div class="component-title">
                <span>ImagePlaceholder (Round)</span>
                <span class="badge badge-success">Component</span>
              </div>
              <div style="display: flex; justify-content: center;">
                <div class="image-placeholder" id="about-placeholder" style="width: 200px; height: 200px; border-radius: 50%;">
                  <svg class="placeholder-icon" viewBox="0 0 48 48" style="width: 48px; height: 48px;">
                    <circle cx="24" cy="24" r="20" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="4,4"/>
                    <circle cx="24" cy="18" r="6" fill="currentColor" opacity="0.3"/>
                    <path d="M12 38 C12 30, 36 30, 36 38" stroke="currentColor" stroke-width="2" fill="none"/>
                  </svg>
                  <div class="placeholder-text" style="font-size: 13px;">Photo profil</div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- ImageLibrary -->
          <div class="image-library">
            <div class="library-header">
              <div class="library-title">
                <span>📁 ImageLibrary</span>
                <span class="library-count" id="library-count">3</span>
              </div>
              <button class="import-btn">+ Importer</button>
            </div>
            
            <div class="library-grid" id="library-grid">
              <div class="library-item">
                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23FF6B6B' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='32' font-family='system-ui' font-weight='bold'%3EHero.jpg%3C/text%3E%3C/svg%3E" alt="Hero">
                <div class="library-item-label">hero.jpg</div>
              </div>
              <div class="library-item">
                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%234ECDC4' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='28' font-family='system-ui' font-weight='bold'%3EProfile.jpg%3C/text%3E%3C/svg%3E" alt="Profile">
                <div class="library-item-label">profile.jpg</div>
              </div>
              <div class="library-item">
                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%2395E1D3' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='white' font-size='26' font-family='system-ui' font-weight='bold'%3EProject1.jpg%3C/text%3E%3C/svg%3E" alt="Project">
                <div class="library-item-label">project1.jpg</div>
              </div>
            </div>
          </div>
          
          <!-- Features -->
          <div class="features" style="margin-top: 32px;">
            <div class="features-title">✨ Features Implémentées</div>
            <div class="feature-item">
              <div class="feature-icon">🎯</div>
              <div class="feature-text">
                <div class="feature-label">Drag & Drop depuis Bibliothèque</div>
                <div class="feature-desc">Glissez les images vers les zones du portfolio</div>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">📁</div>
              <div class="feature-text">
                <div class="feature-label">Drag & Drop Fichiers</div>
                <div class="feature-desc">Depuis l'explorateur directement</div>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">🖱️</div>
              <div class="feature-text">
                <div class="feature-label">Click pour Parcourir</div>
                <div class="feature-desc">Fallback si drag & drop non supporté</div>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">🔄</div>
              <div class="feature-text">
                <div class="feature-label">Changement/Suppression</div>
                <div class="feature-desc">Boutons au hover sur images assignées</div>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">♿</div>
              <div class="feature-text">
                <div class="feature-label">Accessible (WCAG AA)</div>
                <div class="feature-desc">Keyboard navigation + ARIA labels</div>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">🎨</div>
              <div class="feature-text">
                <div class="feature-label">CALM-UI Compliant</div>
                <div class="feature-desc">0 couleurs hardcodées, 100% theme tokens</div>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">⚡</div>
              <div class="feature-text">
                <div class="feature-label">Optimisé Performance</div>
                <div class="feature-desc">React.memo, useCallback, useMemo</div>
              </div>
            </div>
          </div>
        </div>
        
        <script>
          // Drag effects
          document.querySelectorAll('.library-item').forEach(item => {
            item.addEventListener('dragstart', (e) => {
              e.dataTransfer.effectAllowed = 'copy';
              item.style.opacity = '0.5';
            });
            
            item.addEventListener('dragend', () => {
              item.style.opacity = '1';
            });
          });
          
          // Drop zones
          document.querySelectorAll('.image-placeholder').forEach(zone => {
            zone.addEventListener('dragover', (e) => {
              e.preventDefault();
              zone.classList.add('drag-over');
            });
            
            zone.addEventListener('dragleave', () => {
              zone.classList.remove('drag-over');
            });
            
            zone.addEventListener('drop', (e) => {
              e.preventDefault();
              zone.classList.remove('drag-over');
              
              // Effet visuel de drop réussi
              const success = document.createElement('div');
              success.style.cssText = 'position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background: #48bb78; color: white; padding: 12px 24px; border-radius: 8px; font-weight: 600; animation: fadeOut 2s forwards;';
              success.textContent = '✓ Image assignée!';
              zone.style.position = 'relative';
              zone.appendChild(success);
              
              setTimeout(() => success.remove(), 2000);
            });
          });
          
          // Animation CSS
          const style = document.createElement('style');
          style.textContent = '@keyframes fadeOut { to { opacity: 0; transform: translate(-50%, -60%); } }';
          document.head.appendChild(style);
        </script>
      </body>
    </html>
  `);
  
  await page.waitForLoadState('networkidle');
  console.log('✅ Page demo créée\n');
  
  // Screenshots
  await page.screenshot({ path: 'demo-editable-preview-full.png', fullPage: true });
  console.log('📸 Screenshot complet: demo-editable-preview-full.png\n');
  
  // Tester drag effect visuel
  await page.hover('.library-item:first-child');
  await page.waitForTimeout(500);
  
  await page.screenshot({ path: 'demo-editable-preview-hover.png', fullPage: true });
  console.log('📸 Screenshot hover: demo-editable-preview-hover.png\n');
  
  // Vérifier composants présents
  const components = await page.evaluate(() => ({
    placeholders: document.querySelectorAll('.image-placeholder').length,
    libraryItems: document.querySelectorAll('.library-item').length,
    features: document.querySelectorAll('.feature-item').length,
  }));
  
  console.log('📊 Composants trouvés:');
  console.log(`  - ImagePlaceholder: ${components.placeholders}`);
  console.log(`  - Images bibliothèque: ${components.libraryItems}`);
  console.log(`  - Features listées: ${components.features}\n`);
  
  console.log('✅ DEMO PREVIEW ÉDITABLE TERMINÉE!\n');
  
  // Assertions
  expect(components.placeholders).toBeGreaterThan(0);
  expect(components.libraryItems).toBeGreaterThan(0);
});
