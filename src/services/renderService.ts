// SOUVERAIN - Render Service
// Universal HTML Generation Engine

import type { PortfolioV2, PortfolioProjectV2 } from '../types/portfolio';
import { type StylePalette, getStyleById } from './styleService';

// ============================================================
// HTML TEMPLATES
// ============================================================

const BASE_HTML = (title: string, css: string, content: string) => `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        /* RESET */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: sans-serif; line-height: 1.6; }
        img { max-width: 100%; display: block; }
        
        /* DYNAMIC CSS VIA TOKENS */
        ${css}
    </style>
</head>
<body>
    ${content}
</body>
</html>
`;

// Helper: Convert Tokens to CSS Variables
const generateCSS = (palette: StylePalette): string => {
    const { tokens } = palette;
    return `
        :root {
            --font-heading: ${tokens.typography.headingFont};
            --font-body: ${tokens.typography.bodyFont};
            --radius: ${tokens.typography.borderRadius};
            
            --color-primary: ${tokens.colors.primary};
            --color-secondary: ${tokens.colors.secondary};
            --color-bg: ${tokens.colors.background};
            --color-text: ${tokens.colors.text};
        }

        body {
            background-color: var(--color-bg);
            color: var(--color-text);
            font-family: var(--font-body);
        }

        h1, h2, h3, h4 {
            font-family: var(--font-heading);
            color: var(--color-text);
        }
        
        /* LAYOUT UTILS */
        .container { max-width: 1200px; margin: 0 auto; padding: 2rem; }
        .section { padding: 4rem 0; }
        .btn { 
            display: inline-block; 
            padding: 0.75rem 1.5rem; 
            background: var(--color-primary); 
            color: white; 
            text-decoration: none; 
            border-radius: var(--radius); 
            font-weight: bold;
        }
        
        /* HERO STYLES */
        .hero { min-height: 60vh; display: flex; align-items: center; justify-content: center; text-align: center; background: var(--color-secondary); }
        .hero--split { display: grid; grid-template-columns: 1fr 1fr; text-align: left; }
        .hero__content { padding: 3rem; }
        .hero__title { font-size: 3.5rem; margin-bottom: 1rem; line-height: 1.1; }
        .hero__tagline { font-size: 1.5rem; opacity: 0.8; }

        /* GRID STYLES */
        .grid { display: grid; gap: 2rem; }
        .grid--bento { grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }
        .grid--masonry { columns: 3 300px; gap: 1rem; }
        
        .card { 
            background: white; 
            border: 1px solid rgba(0,0,0,0.1); 
            border-radius: var(--radius); 
            overflow: hidden; 
            break-inside: avoid; 
            margin-bottom: 1rem;
        }
        .card__img { height: 200px; background: #ddd; object-fit: cover; width: 100%; }
        .card__content { padding: 1.5rem; }
        .card__title { font-size: 1.25rem; margin-bottom: 0.5rem; }
        @media print {
            @page { margin: 0; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .card { break-inside: avoid; page-break-inside: avoid; }
            .hero { break-inside: avoid; min-height: 50vh; }
            section { break-inside: avoid; }
        }
    `;
};

// ============================================================
// RENDERERS
// ============================================================

export const renderPortfolioHTML = (portfolio: PortfolioV2, projects: PortfolioProjectV2[], qrCodeUrl?: string) => {
    const paletteId = (portfolio as any).selected_style || 'moderne'; // Fallback
    const palette = getStyleById(paletteId);
    
    // 1. Generate CSS
    const css = generateCSS(palette);

    // 2. Generate Content
    const heroHTML = renderHero(portfolio, palette);
    const projectsHTML = renderProjects(projects, palette);
    
    // QR Code Section
    const qrHTML = qrCodeUrl ? `
        <div style="margin-top: 2rem; text-align: center;">
            <p style="margin-bottom: 0.5rem; font-size: 0.8rem; opacity: 0.7;">Scanner pour voir en ligne</p>
            <img src="${qrCodeUrl}" alt="QR Code" style="width: 100px; height: 100px; margin: 0 auto;">
        </div>
    ` : '';
    
    const content = `
        ${heroHTML}
        <section class="section container">
            <h2 style="margin-bottom: 2rem; font-size: 2rem;">Projets</h2>
            ${projectsHTML}
        </section>
        <footer class="section" style="text-align: center; opacity: 0.6; padding: 2rem;">
            <p>&copy; ${new Date().getFullYear()} ${portfolio.authorName || portfolio.title}</p>
            ${qrHTML}
        </footer>
    `;

    return BASE_HTML(portfolio.title || 'Portfolio', css, content);
};

const renderHero = (portfolio: PortfolioV2, palette: StylePalette) => {
    const title = portfolio.authorName || portfolio.title;
    const tagline = portfolio.tagline || (portfolio as any).authorBio || 'Bienvenue sur mon portfolio.';
    
    // Simple logic based on palette layout config
    if (palette.layoutConfig.hero === 'hero_split') {
        return `
            <header class="hero hero--split">
                <div class="hero__content">
                    <h1 class="hero__title">${title}</h1>
                    <p class="hero__tagline">${tagline}</p>
                </div>
                <div style="background: var(--color-primary); height: 100%; min-height: 400px;">
                    <!-- Placeholder for hero image -->
                </div>
            </header>
        `;
    }
    
    // Default / Minimal / Fullwidth
    return `
        <header class="hero">
            <div class="hero__content">
                <h1 class="hero__title">${title}</h1>
                <p class="hero__tagline">${tagline}</p>
            </div>
        </header>
    `;
};

const renderProjects = (projects: PortfolioProjectV2[], palette: StylePalette) => {
    const gridClass = palette.layoutConfig.list === 'masonry' ? 'grid--masonry' : 'grid grid--bento';
    
    // Sort logic here if needed
    const sorted = [...projects].sort((a,b) => (a.displayOrder || 0) - (b.displayOrder || 0));

    const items = sorted.map(proj => `
        <article class="card">
            <div class="card__img"></div> <!-- Placeholder -->
            <div class="card__content">
                <h3 class="card__title">${proj.title}</h3>
                <p>${proj.brief_text || proj.description || ''}</p>
            </div>
        </article>
    `).join('');

    return `<div class="${gridClass}">${items}</div>`;
};
