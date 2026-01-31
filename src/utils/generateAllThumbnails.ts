/**
 * Utility to regenerate all template thumbnails
 * Run this when templates are added/updated
 */

export async function generateAllThumbnails(): Promise<void> {
  try {
    console.log('[Thumbnails] Starting generation for all templates...');

    // @ts-ignore
    const result = await window.electron.templates.getAll();
    const templates = result.templates || [];

    console.log(`[Thumbnails] Found ${templates.length} templates`);

    for (const template of templates) {
      console.log(`[Thumbnails] Generating screenshot for ${template.id}...`);

      try {
        // @ts-ignore
        const screenshotResult = await window.electron.templates.generateScreenshot(template.id);

        if (screenshotResult.success) {
          console.log(`[Thumbnails] ✓ ${template.id} → ${screenshotResult.path}`);
        } else {
          console.error(`[Thumbnails] ✗ ${template.id}: ${screenshotResult.error}`);
        }
      } catch (error: any) {
        console.error(`[Thumbnails] ✗ ${template.id}:`, error.message);
      }

      // Wait a bit between screenshots to avoid overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log('[Thumbnails] Generation complete!');
  } catch (error) {
    console.error('[Thumbnails] Generation failed:', error);
  }
}

// Call this from console: window.generateAllThumbnails()
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.generateAllThumbnails = generateAllThumbnails;
}
