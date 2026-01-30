/**
 * Template Service
 * Gestion des templates de portfolio côté renderer
 */

export interface Template {
  id: string;
  name: string;
  description: string;
  category: 'free' | 'premium';
  price: number;
  thumbnail_path: string;
  html_path: string;
  is_owned: number; // SQLite boolean (0 or 1)
  purchased_at?: string;
  created_at: string;
  updated_at?: string;
  tags: string;
  ideal_for: string;
  version: string;
  author: string;
}

export interface TemplateFilters {
  category?: 'free' | 'premium' | 'all';
  owned?: boolean;
}

/**
 * Récupère tous les templates
 */
export async function getAllTemplates(): Promise<Template[]> {
  try {
    // @ts-ignore
    const result = await window.electron.invoke('db-templates-get-all');
    return result.templates || [];
  } catch (error) {
    console.error('[TemplateService] Error getting templates:', error);
    return [];
  }
}

/**
 * Récupère les templates gratuits
 */
export async function getFreeTemplates(): Promise<Template[]> {
  try {
    // @ts-ignore
    const result = await window.electron.invoke('db-templates-get-free');
    return result.templates || [];
  } catch (error) {
    console.error('[TemplateService] Error getting free templates:', error);
    return [];
  }
}

/**
 * Récupère les templates possédés (gratuits + achetés)
 */
export async function getOwnedTemplates(): Promise<Template[]> {
  try {
    // @ts-ignore
    const result = await window.electron.invoke('db-templates-get-owned');
    return result.templates || [];
  } catch (error) {
    console.error('[TemplateService] Error getting owned templates:', error);
    return [];
  }
}

/**
 * Récupère les templates de la boutique (premium non possédés)
 */
export async function getBoutiqueTemplates(): Promise<Template[]> {
  try {
    // @ts-ignore
    const result = await window.electron.invoke('db-templates-get-boutique');
    return result.templates || [];
  } catch (error) {
    console.error('[TemplateService] Error getting boutique templates:', error);
    return [];
  }
}

/**
 * Récupère un template par ID
 */
export async function getTemplateById(id: string): Promise<Template | null> {
  try {
    // @ts-ignore
    const result = await window.electron.invoke('db-templates-get-by-id', id);
    return result.template || null;
  } catch (error) {
    console.error('[TemplateService] Error getting template by ID:', error);
    return null;
  }
}

/**
 * Charge le HTML d'un template
 */
export async function getTemplateHTML(id: string): Promise<string | null> {
  try {
    // @ts-ignore
    const result = await window.electron.invoke('template-get-html', id);
    return result.html || null;
  } catch (error) {
    console.error('[TemplateService] Error getting template HTML:', error);
    return null;
  }
}

/**
 * Récupère le SVG thumbnail d'un template
 */
export async function getTemplateThumbnail(id: string): Promise<string | null> {
  try {
    // @ts-ignore
    const result = await window.electron.invoke('template-get-thumbnail', id);
    return result.svg || null;
  } catch (error) {
    console.error('[TemplateService] Error getting template thumbnail:', error);
    return null;
  }
}

/**
 * Achète un template premium (simulation pour l'instant)
 */
export async function purchaseTemplate(
  templateId: string,
  amountPaid: number,
  isPremiumDiscount: boolean = false
): Promise<{ success: boolean; error?: string }> {
  try {
    // @ts-ignore
    const result = await window.electron.invoke('template-purchase', {
      templateId,
      amountPaid,
      isPremiumDiscount,
    });
    return result;
  } catch (error: any) {
    console.error('[TemplateService] Error purchasing template:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Filtre les templates selon les critères
 */
export function filterTemplates(
  templates: Template[],
  filters: TemplateFilters
): Template[] {
  let filtered = [...templates];

  if (filters.category && filters.category !== 'all') {
    filtered = filtered.filter(t => t.category === filters.category);
  }

  if (filters.owned !== undefined) {
    filtered = filtered.filter(t => (filters.owned ? t.is_owned === 1 : t.is_owned === 0));
  }

  return filtered;
}

/**
 * Parse les tags d'un template
 */
export function parseTemplateTags(template: Template): string[] {
  return template.tags ? template.tags.split(',').map(t => t.trim()) : [];
}

/**
 * Parse les profils idéaux d'un template
 */
export function parseTemplateIdealFor(template: Template): string[] {
  return template.ideal_for ? template.ideal_for.split(',').map(t => t.trim()) : [];
}

/**
 * Obtient le chemin complet d'un thumbnail
 */
export function getTemplateThumbnailPath(template: Template): string {
  // Pour l'instant, retourne le chemin direct
  // Plus tard, on pourra ajouter une logique pour charger depuis resources/
  return template.thumbnail_path;
}

/**
 * Vérifie si un template est gratuit
 */
export function isTemplateFree(template: Template): boolean {
  return template.category === 'free' || template.price === 0;
}

/**
 * Vérifie si un template est possédé
 */
export function isTemplateOwned(template: Template): boolean {
  return template.is_owned === 1;
}

/**
 * Obtient le prix formaté d'un template
 */
export function getTemplatePrice(template: Template, isPremiumUser: boolean = false): string {
  if (isTemplateFree(template)) {
    return 'Gratuit';
  }

  const price = isPremiumUser && template.price > 0
    ? (template.price * 0.7).toFixed(2) // -30% pour les abonnés premium
    : template.price.toFixed(2);

  return `${price}€`;
}
