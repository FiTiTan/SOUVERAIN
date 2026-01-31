// SOUVERAIN - HTML Exporter Service V2
// Utilise les templates HTML réels avec système de placeholders

import type { StylePalette } from '../config/stylePalettes';
import { getTemplateHTML } from './templateService';

export async function generateStaticSite(portfolio: any, projects: any[]): Promise<{ success: boolean; error?: string }> {
    try {
        // @ts-ignore
        const result = await window.electron.invoke('export-static-site', { portfolio, projects });
        if (result.success) {
            return { success: true };
        } else {
            return { success: false, error: result.error };
        }
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

/**
 * Remplace un placeholder simple dans le HTML
 */
function replacePlaceholder(html: string, key: string, value: string): string {
  const placeholder = `{{${key}}}`;
  return html.split(placeholder).join(value || '');
}

/**
 * Parse et remplace une section répétée (services, projects, etc.)
 */
function processRepeatedSection(
  html: string,
  sectionName: string,
  items: any[],
  renderItem: (template: string, item: any, index: number) => string
): string {
  const startMarker = `<!-- REPEAT: ${sectionName} -->`;
  const endMarker = `<!-- END REPEAT: ${sectionName} -->`;
  
  const startIndex = html.indexOf(startMarker);
  const endIndex = html.indexOf(endMarker);
  
  if (startIndex === -1 || endIndex === -1) {
    return html; // Section not found, skip
  }
  
  // Extract template between markers
  const templateStart = startIndex + startMarker.length;
  const itemTemplate = html.substring(templateStart, endIndex).trim();
  
  // Generate HTML for all items
  const renderedItems = items.map((item, index) => renderItem(itemTemplate, item, index)).join('\n');
  
  // Replace entire section (including markers) with rendered items
  const before = html.substring(0, startIndex);
  const after = html.substring(endIndex + endMarker.length);
  
  return before + renderedItems + after;
}

/**
 * Traite les conditions IF/ENDIF dans le template
 */
function processConditionals(html: string, conditions: Record<string, boolean>): string {
  let result = html;
  
  for (const [condition, value] of Object.entries(conditions)) {
    const ifMarker = `<!-- IF: ${condition} -->`;
    const endifMarker = `<!-- ENDIF: ${condition} -->`;
    
    const startIndex = result.indexOf(ifMarker);
    const endIndex = result.indexOf(endifMarker);
    
    if (startIndex !== -1 && endIndex !== -1) {
      const before = result.substring(0, startIndex);
      const content = result.substring(startIndex + ifMarker.length, endIndex);
      const after = result.substring(endIndex + endifMarker.length);
      
      // Keep content only if condition is true
      result = before + (value ? content : '') + after;
    }
  }
  
  return result;
}

/**
 * Génère le HTML pour un projet individuel
 * (Fallback simple, non utilisé pour les templates)
 */
export async function generateProjectHTML(
  project: any,
  palette: StylePalette,
  _portfolioId: string
): Promise<string> {
  const { designTokens } = palette;

  const googleFontsUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(designTokens.typography.headingFont)}:wght@${designTokens.typography.headingWeight}&family=${encodeURIComponent(designTokens.typography.bodyFont)}:wght@${designTokens.typography.bodyWeight}&display=swap`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${project.title}</title>
    <link href="${googleFontsUrl}" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: '${designTokens.typography.bodyFont}', sans-serif;
            font-weight: ${designTokens.typography.bodyWeight};
            font-size: ${designTokens.typography.baseSize};
            background-color: ${designTokens.colors.background};
            color: ${designTokens.colors.text};
            line-height: 1.6;
        }
        h1, h2, h3, h4 {
            font-family: '${designTokens.typography.headingFont}', serif;
            font-weight: ${designTokens.typography.headingWeight};
            color: ${designTokens.colors.text};
        }
        .container { max-width: 1200px; margin: 0 auto; padding: ${designTokens.spacing.contentPadding}; }
        .hero {
            padding: ${designTokens.spacing.sectionGap} 0;
            text-align: center;
            background: linear-gradient(135deg, ${designTokens.colors.primary}15, ${designTokens.colors.accent}15);
            border-radius: ${designTokens.borders.radius};
            margin-bottom: ${designTokens.spacing.sectionGap};
        }
        .hero h1 { font-size: 3rem; margin-bottom: 1rem; color: ${designTokens.colors.primary}; }
        .hero p { font-size: 1.25rem; color: ${designTokens.colors.textSecondary}; max-width: 700px; margin: 0 auto; }
        .section {
            margin-bottom: ${designTokens.spacing.sectionGap};
            padding: ${designTokens.spacing.cardPadding};
            background: ${designTokens.colors.secondary};
            border-radius: ${designTokens.borders.radius};
            box-shadow: ${designTokens.shadows.card};
        }
        .section h2 {
            font-size: 1.5rem;
            margin-bottom: 1rem;
            color: ${designTokens.colors.primary};
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .section p { color: ${designTokens.colors.textSecondary}; white-space: pre-wrap; }
        footer {
            text-align: center;
            padding: 2rem;
            color: ${designTokens.colors.textSecondary};
            font-size: 0.875rem;
            border-top: 1px solid ${designTokens.colors.secondary};
            margin-top: ${designTokens.spacing.sectionGap};
        }
        footer a { color: ${designTokens.colors.accent}; text-decoration: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="hero">
            <h1>${project.title}</h1>
            <p>${project.brief_text || project.description || ''}</p>
        </div>
        ${project.context_text ? `<div class="section"><h2>Contexte</h2><p>${project.context_text}</p></div>` : ''}
        ${project.challenge_text ? `<div class="section"><h2>Le Défi</h2><p>${project.challenge_text}</p></div>` : ''}
        ${project.solution_text ? `<div class="section"><h2>La Solution</h2><p>${project.solution_text}</p></div>` : ''}
        ${project.result_text ? `<div class="section"><h2>Résultats</h2><p>${project.result_text}</p></div>` : ''}
    </div>
    <footer><p>Généré avec <a href="https://souverain.app" target="_blank">SOUVERAIN</a></p></footer>
</body>
</html>`;
}

/**
 * Génère le HTML pour le portfolio complet à partir d'un template
 */
export async function generatePortfolioHTML(
  portfolio: any,
  projects: any[],
  _palette: StylePalette,
  templateId?: string
): Promise<string> {
  // Si pas de templateId, utiliser bento-grid par défaut
  const finalTemplateId = templateId || portfolio.template_id || 'bento-grid';
  
  console.log('[htmlExporter] Loading template:', finalTemplateId);
  
  // Charger le template HTML
  let html = await getTemplateHTML(finalTemplateId);
  
  if (!html) {
    console.error('[htmlExporter] Template not found, using fallback');
    // Fallback vers ancien système si template non trouvé
    return generateFallbackPortfolioHTML(portfolio, projects);
  }
  
  // === REMPLACEMENT DES PLACEHOLDERS SIMPLES ===
  
  // Hero section
  html = replacePlaceholder(html, 'HERO_TITLE', portfolio.authorName || portfolio.title || 'Portfolio');
  html = replacePlaceholder(html, 'HERO_SUBTITLE', portfolio.tagline || portfolio.authorBio || '');
  html = replacePlaceholder(html, 'HERO_EYEBROW', portfolio.authorTitle || '');
  html = replacePlaceholder(html, 'HERO_CTA_TEXT', 'Voir mes projets');
  
  // About section
  html = replacePlaceholder(html, 'ABOUT_TEXT', portfolio.authorBio || '');
  html = replacePlaceholder(html, 'ABOUT_IMAGE', portfolio.authorPhoto || '/placeholder-avatar.jpg');
  html = replacePlaceholder(html, 'VALUE_PROP', portfolio.valueProposition || '');
  
  // Contact section
  html = replacePlaceholder(html, 'CONTACT_EMAIL', portfolio.authorEmail || 'contact@example.com');
  html = replacePlaceholder(html, 'CONTACT_PHONE', portfolio.authorPhone || '');
  html = replacePlaceholder(html, 'CONTACT_ADDRESS', portfolio.authorAddress || '');
  
  // Footer
  const currentYear = new Date().getFullYear().toString();
  html = replacePlaceholder(html, 'CURRENT_YEAR', currentYear);
  
  // === SECTIONS RÉPÉTÉES ===
  
  // Services
  const services = [
    { icon: '💻', title: 'Développement Web', desc: 'Création de sites et applications modernes' },
    { icon: '🎨', title: 'Design UI/UX', desc: 'Interfaces intuitives et esthétiques' },
    { icon: '📱', title: 'Mobile', desc: 'Applications iOS et Android' }
  ];
  
  html = processRepeatedSection(html, 'services', services, (template, service) => {
    let item = template;
    item = replacePlaceholder(item, 'SERVICE_ICON', service.icon);
    item = replacePlaceholder(item, 'SERVICE_TITLE', service.title);
    item = replacePlaceholder(item, 'SERVICE_DESC', service.desc);
    return item;
  });
  
  // Projects
  const sortedProjects = projects.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  
  html = processRepeatedSection(html, 'projects', sortedProjects, (template, project) => {
    let item = template;
    item = replacePlaceholder(item, 'PROJECT_TITLE', project.title);
    item = replacePlaceholder(item, 'PROJECT_DESC', project.brief_text || project.description || '');
    item = replacePlaceholder(item, 'PROJECT_CATEGORY', project.category || 'Projet');
    item = replacePlaceholder(item, 'PROJECT_IMAGE', project.coverImage || '/placeholder-project.jpg');
    item = replacePlaceholder(item, 'PROJECT_LINK', project.liveUrl || '#');
    
    // Condition: afficher le lien seulement si présent
    item = processConditionals(item, {
      hasProjectLink: !!project.liveUrl
    });
    
    return item;
  });
  
  // Social links
  const socialLinks = [
    { platform: 'GitHub', url: portfolio.githubUrl || '#', icon: '🔗' },
    { platform: 'LinkedIn', url: portfolio.linkedinUrl || '#', icon: '🔗' },
    { platform: 'Twitter', url: portfolio.twitterUrl || '#', icon: '🔗' }
  ].filter(link => link.url && link.url !== '#');
  
  html = processRepeatedSection(html, 'socialLinks', socialLinks, (template, link) => {
    let item = template;
    item = replacePlaceholder(item, 'SOCIAL_PLATFORM', link.platform);
    item = replacePlaceholder(item, 'SOCIAL_URL', link.url);
    item = replacePlaceholder(item, 'SOCIAL_ICON', link.icon);
    return item;
  });
  
  // Testimonials (vide pour l'instant, sera ajouté plus tard)
  html = processRepeatedSection(html, 'testimonials', [], () => '');
  
  // === CONDITIONS GLOBALES ===
  html = processConditionals(html, {
    showProjects: projects.length > 0,
    showSocialShowcase: socialLinks.length > 0,
    showTestimonials: false,
    showPracticalInfo: false,
    hasAboutImage: !!portfolio.authorPhoto,
    hasValueProp: !!portfolio.valueProposition,
    hasAddress: !!portfolio.authorAddress,
    hasOpeningHours: false
  });
  
  return html;
}

/**
 * Fallback simple si template non trouvé
 */
function generateFallbackPortfolioHTML(portfolio: any, projects: any[]): string {
  const projectsHTML = projects
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
    .map(project => `
      <div class="project-card">
        <h3>${project.title}</h3>
        <p>${project.brief_text || project.description || ''}</p>
      </div>
    `).join('');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${portfolio.title || portfolio.authorName || 'Portfolio'}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #f5f5f7;
            color: #1d1d1f;
            line-height: 1.6;
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .hero {
            min-height: 60vh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            background: linear-gradient(135deg, #667eea20, #764ba220);
            border-radius: 24px;
            margin-bottom: 3rem;
            padding: 3rem;
        }
        .hero h1 { font-size: 4rem; margin-bottom: 1rem; }
        .hero p { font-size: 1.5rem; color: #86868b; max-width: 700px; }
        .projects-section { margin-bottom: 3rem; }
        .projects-section h2 { font-size: 2rem; margin-bottom: 2rem; }
        .projects-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }
        .project-card {
            padding: 2rem;
            background: white;
            border-radius: 16px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.08);
            transition: transform 0.2s ease;
        }
        .project-card:hover { transform: translateY(-4px); }
        .project-card h3 { font-size: 1.5rem; margin-bottom: 0.75rem; }
        .project-card p { color: #86868b; }
        footer {
            text-align: center;
            padding: 2rem;
            color: #86868b;
            font-size: 0.875rem;
            border-top: 1px solid #e5e5e5;
            margin-top: 3rem;
        }
    </style>
</head>
<body>
    <div class="hero">
        <div>
            <h1>${portfolio.authorName || portfolio.title || 'Portfolio'}</h1>
            <p>${portfolio.tagline || portfolio.authorBio || 'Bienvenue sur mon portfolio'}</p>
        </div>
    </div>
    <div class="container">
        <div class="projects-section">
            <h2>Projets</h2>
            <div class="projects-grid">${projectsHTML}</div>
        </div>
    </div>
    <footer><p>Généré avec <a href="https://souverain.app" target="_blank">SOUVERAIN</a></p></footer>
</body>
</html>`;
}
