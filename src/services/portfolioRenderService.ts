/**
 * portfolioRenderService.ts
 *
 * Service de rendu HTML pour le Portfolio Maître V2
 * Architecture V2 : GROQ enrichit les textes, le code injecte dans le template
 * GROQ ne voit JAMAIS le HTML
 */

import type { PortfolioFormData } from '../components/portfolio/wizard/types';
import { enrichPortfolioData, type RawPortfolioData } from './groqEnrichmentService';
import { injectDataIntoTemplate, computeFlags } from './templateInjectorService';

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
export const renderPortfolioHTML = async (options: RenderOptions): Promise<string> => {
  const { formData, templateId } = options;

  console.log('[PortfolioRender] Starting V2 generation (GROQ enrichment + template injection)');

  // 1. Charger le template HTML
  const templateHTML = await loadTemplateHTML(templateId);

  // 2. Convertir formData en RawPortfolioData
  const rawData: RawPortfolioData = {
    name: formData.name,
    profileType: formData.profileType || 'freelance',
    tagline: formData.tagline,
    services: formData.services.filter(s => s.trim().length > 0),
    valueProp: formData.valueProp,
    email: formData.email,
    phone: formData.phone,
    address: formData.address,
    openingHours: formData.openingHours,
    socialLinks: (formData.socialLinks || []).map(link => ({
      platform: link.platform === 'other' ? 'website' : link.platform,
      url: link.url || '#',
      label: link.label || undefined,
    })).filter(link => link.url !== '#'),
    socialIsMain: formData.socialIsMain || false,
    projects: (formData.projects || []).map(p => ({
      title: p.title || 'Projet',
      description: p.description || '',
      image: p.image || undefined,
      category: p.category || undefined,
      link: p.link || undefined,
    })),
    testimonials: (formData.testimonials || []).map(t => ({
      text: t.text || '',
      author: t.author || '',
      role: t.role || undefined,
    })),
    aboutImage: undefined, // TODO: ajouter support dans le wizard
  };

  // 3. ÉTAPE 1 : Enrichissement GROQ (JSON → JSON enrichi)
  const portfolioId = `portfolio_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const enrichmentResult = await enrichPortfolioData(rawData, portfolioId);

  if (!enrichmentResult.success || !enrichmentResult.data) {
    console.warn('[PortfolioRender] GROQ enrichment failed, using fallback data');
  }

  const enrichedData = enrichmentResult.data!;

  // 4. ÉTAPE 2 : Injection dans le template (code local, 100% déterministe)
  const flags = computeFlags(enrichedData);
  const renderedHTML = injectDataIntoTemplate(templateHTML, enrichedData, flags);

  // 5. Ajouter métadonnées SEO
  const finalHTML = renderedHTML.replace(
    '<title>',
    `<meta name="description" content="${escapeHtml(formData.tagline)}">\n  <title>`
  );

  console.log('[PortfolioRender] ✓ V2 generation complete');

  return finalHTML;
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
