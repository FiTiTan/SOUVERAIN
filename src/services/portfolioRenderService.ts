/**
 * portfolioRenderService.ts
 *
 * Service de rendu HTML pour le Portfolio Maître V3
 * Architecture V3 : Extraction PDF + Anonymisation + Enrichissement GROQ + Injection template
 * Workflow complet : Documents → Texte → Anonymisé → Enrichi → Désanonymisé → HTML
 */

import type { PortfolioFormData } from '../components/portfolio/wizard/types';
import { generatePortfolioFromWizardV2 } from './portfolioGeneratorV2Service';
import type { PortfolioFormDataV2 } from '../components/portfolio/types';

interface RenderOptions {
  formData: PortfolioFormData;
  templateId: string;
}

/**
 * Charge le HTML du template depuis le système de fichiers
 */
export const loadTemplateHTML = async (templateId: string): Promise<string> => {
  try {
    console.log('[PortfolioRender] Loading template:', templateId);
    console.log('[PortfolioRender] window.electron exists:', !!window.electron);
    console.log('[PortfolioRender] window.electron.invoke exists:', !!(window.electron && window.electron.invoke));
    
    // @ts-ignore
    const result = await window.electron.invoke('template-get-html', templateId);
    console.log('[PortfolioRender] Result type:', typeof result);
    console.log('[PortfolioRender] Result:', result);
    
    // Ensure we return the HTML string, whether it's direct or wrapped
    if (typeof result === 'object' && result !== null && 'html' in result) {
      console.log('[PortfolioRender] Returning result.html, length:', result.html?.length);
      return result.html || '';
    }
    console.log('[PortfolioRender] Returning result as string, length:', result?.length);
    return typeof result === 'string' ? result : '';
  } catch (error) {
    console.error(`[PortfolioRender] Error loading template ${templateId}:`, error);
    throw new Error(`Impossible de charger le template ${templateId}`);
  }
};

/**
 * Échappe les caractères HTML pour éviter les injections
 */
const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

/**
 * Fonction principale V2 : génère le HTML complet du portfolio
 * Architecture : GROQ enrichit les textes → Code injecte dans le template
 */
export const renderPortfolioHTML = async (options: RenderOptions): Promise<{ success: boolean; html?: string; error?: string }> => {
  try {
    const { formData, templateId } = options;

    console.log('[PortfolioRender] ========== STARTING V2 GENERATION ==========');
    console.log('[PortfolioRender] formData received:', formData);
    
    // Convertir formData au format V2 si nécessaire
    const formDataV2: PortfolioFormDataV2 = {
      ...formData as any,
      templateId: templateId || formData.templateId,
    };

    console.log('[PortfolioRender] Calling generatePortfolioFromWizardV2...');
    
    // Utiliser le workflow V2
    const result = await generatePortfolioFromWizardV2(formDataV2);

    console.log('[PortfolioRender] Result received:', result);

    if (result && result.success) {
      console.log('[PortfolioRender] ✓ V2 generation complete');
      return result;
    } else if (result && !result.success) {
      console.error('[PortfolioRender] Generation failed:', result.error);
      return result;
    } else {
      console.error('[PortfolioRender] Result is undefined or invalid');
      return { success: false, error: 'No result from generator' };
    }
    
  } catch (error: any) {
    console.error('[PortfolioRender] Generation error:', error);
    return { success: false, error: error?.message || 'Portfolio generation failed' };
  }
};

/**
 * Sauvegarde le portfolio dans la base de données
 */
export const savePortfolioToDB = async (
  portfolioId: string,
  htmlContent: string,
  formData: PortfolioFormData
): Promise<boolean> => {
  try {
    // @ts-ignore
    const result = await window.electron.invoke('db-save-portfolio-v2', {
      id: portfolioId,
      name: formData.name,
      content: htmlContent,
      templateId: formData.selectedTemplateId,
      metadata: {
        profileType: formData.profileType,
        tagline: formData.tagline,
        email: formData.email,
        createdAt: new Date().toISOString(),
      },
    });

    if (!result || typeof result !== 'object') {
      console.error('[PortfolioRender] Invalid result from db-save-portfolio-v2:', result);
      return false;
    }

    return result.success === true;
  } catch (error) {
    console.error('Error saving portfolio to DB:', error);
    return false;
  }
};

/**
 * Export du portfolio en fichier HTML
 */
export const exportPortfolioHTML = async (
  htmlContent: string,
  filename: string
): Promise<boolean> => {
  try {
    // @ts-ignore
    const result = await window.electron.invoke('export-portfolio-html', {
      html: htmlContent,
      filename: filename,
    });

    return result.success;
  } catch (error) {
    console.error('Error exporting portfolio:', error);
    return false;
  }
};
