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

// SOUVERAIN - HTML Exporter Service (Previews)
import type { StylePalette } from '../config/stylePalettes';

/**
 * Génère le HTML pour un projet individuel
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
 * Génère le HTML pour le portfolio complet
 */
export async function generatePortfolioHTML(
  portfolio: any,
  projects: any[],
  palette: StylePalette
): Promise<string> {
  const { designTokens } = palette;

  const googleFontsUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(designTokens.typography.headingFont)}:wght@${designTokens.typography.headingWeight}&family=${encodeURIComponent(designTokens.typography.bodyFont)}:wght@${designTokens.typography.bodyWeight}&display=swap`;

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
            min-height: 60vh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            background: linear-gradient(135deg, ${designTokens.colors.primary}20, ${designTokens.colors.accent}20);
            border-radius: ${designTokens.borders.radius};
            margin-bottom: ${designTokens.spacing.sectionGap};
            padding: ${designTokens.spacing.sectionGap};
        }
        .hero h1 { font-size: 4rem; margin-bottom: 1rem; color: ${designTokens.colors.primary}; }
        .hero p { font-size: 1.5rem; color: ${designTokens.colors.textSecondary}; max-width: 700px; }
        .projects-section { margin-bottom: ${designTokens.spacing.sectionGap}; }
        .projects-section h2 { font-size: 2rem; margin-bottom: 2rem; color: ${designTokens.colors.primary}; }
        .projects-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }
        .project-card {
            padding: ${designTokens.spacing.cardPadding};
            background: ${designTokens.colors.secondary};
            border-radius: ${designTokens.borders.radius};
            box-shadow: ${designTokens.shadows.card};
            transition: transform 0.2s ease;
        }
        .project-card:hover { transform: translateY(-4px); }
        .project-card h3 { font-size: 1.5rem; margin-bottom: 0.75rem; color: ${designTokens.colors.primary}; }
        .project-card p { color: ${designTokens.colors.textSecondary}; }
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
