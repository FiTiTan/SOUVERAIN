/**
 * portfolioRenderService.ts
 *
 * Service de rendu HTML pour le Portfolio Maître V2
 * Remplace les placeholders des templates HTML avec les données du formulaire
 */

import type { PortfolioFormData } from '../components/portfolio/wizard/types';

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
 * Génère le HTML des services pour injection
 */
const renderServices = (services: string[]): string => {
  const validServices = services.filter(s => s.trim().length > 0);

  return validServices
    .map(service => `<div class="service-item">${escapeHtml(service)}</div>`)
    .join('\n          ');
};

/**
 * Génère le HTML des liens sociaux pour injection
 */
const renderSocialLinks = (formData: PortfolioFormData): string => {
  if (formData.socialLinks.length === 0) return '';

  return formData.socialLinks
    .map(link => {
      const label = link.platform === 'other' && link.label
        ? link.label
        : capitalizeFirst(link.platform);

      return `<a href="${escapeHtml(link.url)}" class="social-link" target="_blank" rel="noopener noreferrer">${escapeHtml(label)}</a>`;
    })
    .join('\n          ');
};

/**
 * Génère le HTML du téléphone (optionnel)
 */
const renderPhone = (phone: string): string => {
  if (!phone || phone.trim().length === 0) return '';
  return `<div class="contact-item">📞 ${escapeHtml(phone)}</div>`;
};

/**
 * Génère le HTML de l'adresse (optionnel)
 */
const renderAddress = (address: string, openingHours: string): string => {
  if (!address || address.trim().length === 0) return '';

  let html = `<div class="contact-item">📍 ${escapeHtml(address)}</div>`;

  if (openingHours && openingHours.trim().length > 0) {
    html += `\n          <div class="contact-item">🕒 ${escapeHtml(openingHours)}</div>`;
  }

  return html;
};

/**
 * Génère le HTML des projets (optionnel)
 */
const renderProjects = (projects: PortfolioFormData['projects']): string => {
  if (projects.length === 0) return '';

  return projects
    .slice(0, 6) // Limiter à 6 projets pour l'affichage
    .map(project => `
      <div class="bento-card project-card">
        <h3>${escapeHtml(project.title)}</h3>
        ${project.description ? `<p>${escapeHtml(project.description)}</p>` : ''}
        ${project.category ? `<span class="category">${escapeHtml(project.category)}</span>` : ''}
      </div>
    `)
    .join('\n      ');
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
 * Capitalise la première lettre
 */
const capitalizeFirst = (text: string): string => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

/**
 * Remplace tous les placeholders dans le template HTML
 */
export const replaceTemplatePlaceholders = (
  templateHTML: string,
  formData: PortfolioFormData
): string => {
  let html = templateHTML;

  // Données de base
  html = html.replace(/\{\{NAME\}\}/g, escapeHtml(formData.name));
  html = html.replace(/\{\{TAGLINE\}\}/g, escapeHtml(formData.tagline));
  html = html.replace(/\{\{EMAIL\}\}/g, escapeHtml(formData.email));
  html = html.replace(/\{\{VALUE_PROP\}\}/g, escapeHtml(formData.valueProp || ''));

  // Services
  html = html.replace(/\{\{SERVICES\}\}/g, renderServices(formData.services));

  // Liens sociaux
  html = html.replace(/\{\{SOCIAL_LINKS\}\}/g, renderSocialLinks(formData));

  // Téléphone (optionnel)
  html = html.replace(/\{\{PHONE\}\}/g, renderPhone(formData.phone));

  // Adresse + horaires (optionnels)
  html = html.replace(/\{\{ADDRESS\}\}/g, renderAddress(formData.address, formData.openingHours));

  // Projets (optionnels)
  html = html.replace(/\{\{PROJECTS\}\}/g, renderProjects(formData.projects));

  return html;
};

/**
 * Fonction principale : génère le HTML complet du portfolio
 */
export const renderPortfolioHTML = async (options: RenderOptions): Promise<string> => {
  const { formData, templateId } = options;

  // 1. Charger le template HTML
  const templateHTML = await loadTemplateHTML(templateId);

  // 2. Remplacer les placeholders
  const renderedHTML = replaceTemplatePlaceholders(templateHTML, formData);

  // 3. Ajouter des métadonnées (SEO)
  const finalHTML = renderedHTML.replace(
    '<title>',
    `<meta name="description" content="${escapeHtml(formData.tagline)}">\n  <title>`
  );

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

    return result.success;
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
