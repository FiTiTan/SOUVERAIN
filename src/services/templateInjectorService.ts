// SOUVERAIN - Template Injector Service V2
// Injecte les données enrichies dans le template HTML
// 100% déterministe, PAS d'IA

import type { EnrichedPortfolioData } from './groqEnrichmentService';

export interface PortfolioFlags {
  showPracticalInfo: boolean;
  showSocialShowcase: boolean;
  showProjects: boolean;
  showTestimonials: boolean;
  hasPhone: boolean;
  hasAddress: boolean;
  hasOpeningHours: boolean;
  profileType: string;
}

export function computeFlags(data: EnrichedPortfolioData): PortfolioFlags {
  return {
    showPracticalInfo: !!(data.address || data.openingHours),
    showSocialShowcase: data.socialIsMain === true,
    showProjects: !!(data.projects && data.projects.length > 0),
    showTestimonials: !!(data.testimonials && data.testimonials.length > 0),
    hasPhone: !!data.phone,
    hasAddress: !!data.address,
    hasOpeningHours: !!data.openingHours,
    profileType: data.heroTitle ? 'defined' : 'unknown',
  };
}

/**
 * Injecte les données enrichies dans un template HTML
 * 100% déterministe, pas d'IA
 */
export function injectDataIntoTemplate(
  template: string,
  data: EnrichedPortfolioData,
  flags: PortfolioFlags
): string {
  let html = template;

  console.log('[TemplateInjector] Starting injection...');

  // 1. Remplacer les variables simples
  html = replaceSimpleVariables(html, data);

  // 2. Traiter les zones REPEAT
  html = processRepeatZones(html, data);

  // 3. Traiter les zones IF/ENDIF
  html = processConditionalZones(html, flags);

  // 4. Nettoyer les sections vides
  html = cleanEmptySections(html);

  // 5. Remplacer l'année courante
  html = html.replace(/\{\{CURRENT_YEAR\}\}/g, new Date().getFullYear().toString());

  console.log('[TemplateInjector] ✓ Injection complete');

  return html;
}

/**
 * Remplace les variables simples {{VARIABLE}}
 */
function replaceSimpleVariables(html: string, data: EnrichedPortfolioData): string {
  const replacements: Record<string, string> = {
    'HERO_TITLE': data.heroTitle || '',
    'NAME': data.heroTitle || '',
    'HERO_SUBTITLE': data.heroSubtitle || '',
    'TAGLINE': data.heroSubtitle || '',
    'HERO_EYEBROW': data.heroEyebrow || '',
    'HERO_CTA_TEXT': data.heroCta || 'Me contacter',
    'ABOUT_TEXT': data.aboutText || '',
    'ABOUT_IMAGE': data.aboutImage || '',
    'VALUE_PROP': data.valueProp || '',
    'CONTACT_EMAIL': data.email || '',
    'EMAIL': data.email || '',
    'CONTACT_PHONE': data.phone || '',
    'PHONE': data.phone || '',
    'CONTACT_ADDRESS': data.address || '',
    'ADDRESS': data.address || '',
    'OPENING_HOURS': data.openingHours || '',
  };

  let result = html;
  for (const [key, value] of Object.entries(replacements)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, escapeHtml(value));
  }

  return result;
}

/**
 * Traite les zones <!-- REPEAT: xxx --> ... <!-- END REPEAT: xxx -->
 */
function processRepeatZones(html: string, data: EnrichedPortfolioData): string {
  let result = html;

  // REPEAT: services
  result = processRepeat(result, 'services', data.services, (service) => ({
    'SERVICE_TITLE': service.title,
    'SERVICE_DESC': service.description,
    'SERVICE_DESCRIPTION': service.description,
  }));

  // REPEAT: projects
  result = processRepeat(result, 'projects', data.projects || [], (project) => ({
    'PROJECT_TITLE': project.title,
    'PROJECT_DESC': project.description,
    'PROJECT_DESCRIPTION': project.description,
    'PROJECT_IMAGE': project.image || '',
    'PROJECT_CATEGORY': project.category || '',
    'PROJECT_LINK': project.link || '#',
  }));

  // REPEAT: testimonials
  result = processRepeat(result, 'testimonials', data.testimonials || [], (testimonial) => ({
    'TESTIMONIAL_TEXT': testimonial.text,
    'TESTIMONIAL_AUTHOR': testimonial.author,
    'TESTIMONIAL_ROLE': testimonial.role || '',
  }));

  // REPEAT: socialLinks
  result = processRepeat(result, 'socialLinks', data.socialLinks || [], (link) => ({
    'SOCIAL_PLATFORM': link.platform,
    'SOCIAL_URL': link.url,
    'SOCIAL_LABEL': link.label || capitalizeFirst(link.platform),
  }));

  return result;
}

/**
 * Fonction générique pour traiter un bloc REPEAT
 */
function processRepeat<T>(
  html: string,
  zoneName: string,
  items: T[],
  getReplacements: (item: T) => Record<string, string>
): string {
  const regex = new RegExp(
    `<!-- REPEAT: ${zoneName} -->([\\s\\S]*?)<!-- END REPEAT: ${zoneName} -->`,
    'g'
  );

  return html.replace(regex, (match, blockContent) => {
    if (!items || items.length === 0) {
      return ''; // Supprimer la zone si pas d'éléments
    }

    return items.map((item) => {
      let block = blockContent;
      const replacements = getReplacements(item);
      
      for (const [key, value] of Object.entries(replacements)) {
        const varRegex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        block = block.replace(varRegex, escapeHtml(value));
      }
      
      return block;
    }).join('\n');
  });
}

/**
 * Traite les zones <!-- IF: condition --> ... <!-- ENDIF: condition -->
 */
function processConditionalZones(html: string, flags: PortfolioFlags): string {
  let result = html;

  const conditions: Record<string, boolean> = {
    'showPracticalInfo': flags.showPracticalInfo,
    'showSocialShowcase': flags.showSocialShowcase,
    'showProjects': flags.showProjects,
    'showTestimonials': flags.showTestimonials,
    'hasPhone': flags.hasPhone,
    'hasAddress': flags.hasAddress,
    'hasOpeningHours': flags.hasOpeningHours,
  };

  for (const [conditionName, conditionValue] of Object.entries(conditions)) {
    const regex = new RegExp(
      `<!-- IF: ${conditionName} -->([\\s\\S]*?)<!-- ENDIF: ${conditionName} -->`,
      'g'
    );

    result = result.replace(regex, (match, content) => {
      return conditionValue ? content : '';
    });
  }

  return result;
}

/**
 * Supprime les sections marquées comme optionnelles si vides
 */
function cleanEmptySections(html: string): string {
  // Supprimer les sections avec uniquement des espaces/newlines
  return html
    .replace(/<section[^>]*>\s*<\/section>/g, '')
    .replace(/\n\s*\n\s*\n/g, '\n\n'); // Nettoyer les lignes vides multiples
}

/**
 * Échappe les caractères HTML dangereux
 */
function escapeHtml(text: string): string {
  if (!text) return '';
  
  const escapeMap: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  
  return text.replace(/[&<>"']/g, (char) => escapeMap[char] || char);
}

/**
 * Capitalise la première lettre
 */
function capitalizeFirst(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}
