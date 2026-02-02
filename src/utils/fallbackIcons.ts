/**
 * Générateur d'icônes SVG fallback
 * Utilisé si l'IA échoue à générer une icône pour un service
 */

const ICON_TEMPLATES: Record<string, string> = {
  // Développement / Web
  'dev': `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><rect x="6" y="10" width="36" height="28" rx="2"/><line x1="6" y1="18" x2="42" y2="18"/><circle cx="12" cy="14" r="1.5"/><circle cx="17" cy="14" r="1.5"/><circle cx="22" cy="14" r="1.5"/></svg>`,
  
  // Design / Créatif
  'design': `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 36l6-16 6 8 6-12 6 20"/><circle cx="12" cy="36" r="2" fill="currentColor"/><circle cx="36" cy="36" r="2" fill="currentColor"/></svg>`,
  
  // Conseil / Stratégie
  'conseil': `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><circle cx="24" cy="24" r="10"/><path d="M24 14v20M34 24H14"/><circle cx="24" cy="14" r="2" fill="currentColor"/><circle cx="34" cy="24" r="2" fill="currentColor"/></svg>`,
  
  // Marketing / Communication
  'marketing': `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 38L24 10l14 28z"/><circle cx="24" cy="20" r="3"/><path d="M18 28h12"/></svg>`,
  
  // Formation / Éducation
  'formation': `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><path d="M24 8l-16 8v12c0 8 16 12 16 12s16-4 16-12V16z"/><polyline points="20,24 22,26 28,20"/></svg>`,
  
  // Maintenance / Support
  'maintenance': `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><circle cx="24" cy="24" r="3"/><path d="M24 8v3M24 37v3M8 24h3M37 24h3M14 14l2 2M32 32l2 2M32 14l-2 2M14 32l-2 2"/></svg>`,
  
  // SEO / Référencement
  'seo': `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><circle cx="20" cy="20" r="8"/><line x1="26" y1="26" x2="38" y2="38"/><polyline points="16,20 18,22 24,16"/></svg>`,
  
  // Mobile / Application
  'mobile': `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><rect x="14" y="6" width="20" height="36" rx="3"/><line x1="14" y1="34" x2="34" y2="34"/><circle cx="24" cy="38" r="1.5" fill="currentColor"/></svg>`,
  
  // Fallback générique
  'default': `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2"><rect x="10" y="10" width="28" height="28" rx="4"/><line x1="16" y1="20" x2="32" y2="20"/><line x1="16" y1="24" x2="32" y2="24"/><line x1="16" y1="28" x2="24" y2="28"/></svg>`,
};

const KEYWORDS_MAP: Record<string, string> = {
  // Dev keywords
  'développement': 'dev',
  'web': 'dev',
  'site': 'dev',
  'application': 'mobile',
  'app': 'mobile',
  'code': 'dev',
  'programmation': 'dev',
  'frontend': 'dev',
  'backend': 'dev',
  'fullstack': 'dev',
  
  // Design keywords
  'design': 'design',
  'graphisme': 'design',
  'ui': 'design',
  'ux': 'design',
  'interface': 'design',
  'branding': 'design',
  'identité': 'design',
  'logo': 'design',
  
  // Conseil keywords
  'conseil': 'conseil',
  'consulting': 'conseil',
  'stratégie': 'conseil',
  'accompagnement': 'conseil',
  'audit': 'conseil',
  
  // Marketing keywords
  'marketing': 'marketing',
  'communication': 'marketing',
  'publicité': 'marketing',
  'social': 'marketing',
  'contenu': 'marketing',
  
  // Formation keywords
  'formation': 'formation',
  'cours': 'formation',
  'enseignement': 'formation',
  'coaching': 'formation',
  'mentorat': 'formation',
  
  // Maintenance keywords
  'maintenance': 'maintenance',
  'support': 'maintenance',
  'dépannage': 'maintenance',
  'assistance': 'maintenance',
  'hotline': 'maintenance',
  
  // SEO keywords
  'seo': 'seo',
  'référencement': 'seo',
  'google': 'seo',
  'optimisation': 'seo',
  
  // Mobile keywords
  'mobile': 'mobile',
  'ios': 'mobile',
  'android': 'mobile',
  'smartphone': 'mobile',
};

/**
 * Génère une icône SVG fallback basée sur le titre du service
 */
export function generateFallbackIcon(serviceTitle: string): string {
  const titleLower = serviceTitle.toLowerCase();
  
  // Chercher un keyword match
  for (const [keyword, iconKey] of Object.entries(KEYWORDS_MAP)) {
    if (titleLower.includes(keyword)) {
      return ICON_TEMPLATES[iconKey];
    }
  }
  
  // Fallback générique
  return ICON_TEMPLATES['default'];
}

/**
 * Vérifie si une icône SVG est valide (pas juste un cercle vide)
 */
export function isValidIcon(icon: string): boolean {
  if (!icon || icon.trim().length === 0) return false;
  
  // Icône invalide si c'est juste un cercle seul
  const isJustCircle = /<svg[^>]*>\s*<circle[^>]*\/>\s*<\/svg>/i.test(icon);
  if (isJustCircle) return false;
  
  // Icône invalide si c'est juste un commentaire
  const isJustComment = /<svg[^>]*>\s*<!--[^>]*-->\s*<\/svg>/i.test(icon);
  if (isJustComment) return false;
  
  // Icône valide si elle contient au moins 2 éléments graphiques
  const graphicElements = (icon.match(/<(rect|circle|path|line|polyline|polygon)/g) || []).length;
  return graphicElements >= 2;
}

/**
 * Enrichit les services avec des icônes fallback si nécessaire
 */
export function enrichServicesWithIcons(services: Array<{ title: string; description: string; icon?: string }>): Array<{ title: string; description: string; icon: string }> {
  return services.map(service => ({
    ...service,
    icon: service.icon && isValidIcon(service.icon) 
      ? service.icon 
      : generateFallbackIcon(service.title),
  }));
}
