/**
 * SOUVERAIN - Portfolio Generator V2 Service
 * Adapte le nouveau wizard V2 vers le système de génération existant
 */

import type { PortfolioFormDataV2 } from '../components/portfolio/types';
import type { EnrichedPortfolioData, RawPortfolioData } from './groqEnrichmentService';
import { enrichPortfolioData } from './groqEnrichmentService';
import { injectDataIntoTemplate, computeFlags } from './templateInjectorService';
import { getLabels } from '../config/portfolioLabels';

/**
 * Charge un template HTML
 */
async function loadTemplateHTML(templateId: string): Promise<string> {
  try {
    // @ts-ignore
    const result = await window.electron.templates.getHTML(templateId);
    
    if (typeof result === 'object' && result !== null) {
      if (!result.success) {
        throw new Error(result.error || 'Template loading failed');
      }
      if (!result.html) {
        throw new Error('Template HTML is empty');
      }
      return result.html;
    }
    
    // Fallback pour legacy
    if (typeof result === 'string' && result.length > 0) {
      return result;
    }
    
    throw new Error('Invalid template result format');
  } catch (error) {
    console.error(`[GeneratorV2] Error loading template:`, error);
    throw new Error(`Impossible de charger le template: ${error.message}`);
  }
}

/**
 * Convertit les données du wizard V2 vers le format RawPortfolioData pour GROQ
 */
function convertToRawData(formData: PortfolioFormDataV2): RawPortfolioData {
  return {
    name: formData.name,
    profileType: formData.profileContext === 'junior' ? 'student' : 
                 formData.profileContext === 'food' ? 'commerce' :
                 formData.profileContext === 'retail' ? 'commerce' :
                 formData.profileContext === 'artisan' ? 'service' :
                 formData.profileContext === 'service' ? 'service' :
                 formData.profileContext === 'tech' ? 'freelance' : 'freelance',
    tagline: formData.tagline,
    services: formData.services.map(s => s.title),
    valueProp: formData.valueProp,
    email: formData.email || '',
    phone: formData.phone,
    address: formData.address,
    openingHours: formData.openingHours,
    socialLinks: formData.socialLinks,
    socialIsMain: false,
    projects: formData.realisations.map(r => ({
      title: r.title,
      description: r.description,
      category: r.category,
    })),
  };
}

/**
 * Convertit les données du wizard V2 vers le format EnrichedPortfolioData (sans GROQ)
 */
function convertToEnrichedData(formData: PortfolioFormDataV2): EnrichedPortfolioData {
  const labels = getLabels(formData.profileContext);
  
  return {
    // Hero
    heroTitle: formData.name,
    heroSubtitle: formData.tagline,
    heroEyebrow: formData.title || '',
    heroCta: 'Me contacter',
    
    // About
    aboutText: `${formData.name} - ${formData.tagline}`,
    aboutImage: formData.imageAssignments.about,
    valueProp: formData.valueProp,
    
    // Services
    services: formData.services.map(s => ({
      title: s.title,
      description: s.description,
      icon: '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="24" cy="24" r="20" stroke="currentColor" stroke-width="2"/></svg>', // Placeholder
    })),
    
    // Projects/Réalisations
    projects: formData.realisations.map((r, index) => ({
      title: r.title,
      description: r.description,
      category: r.category,
      image: formData.imageAssignments[`project-${index}`],
      link: '#',
    })),
    
    // Contact
    email: formData.email || 'contact@example.com',
    phone: formData.phone,
    address: formData.address,
    openingHours: formData.openingHours,
    
    // Social
    socialLinks: formData.socialLinks.map(s => ({
      platform: s.platform,
      url: s.url,
      label: s.label || s.platform,
    })),
    
    socialIsMain: false,
  };
}

/**
 * Génère le HTML du portfolio depuis les données du wizard V2
 */
export async function generatePortfolioFromWizardV2(
  formData: PortfolioFormDataV2,
  onProgress?: (step: string, progress: number) => void
): Promise<{ success: boolean; html?: string; error?: string }> {
  try {
    console.log('[GeneratorV2] Starting generation...');
    
    if (!formData.templateId) {
      throw new Error('Aucun template sélectionné');
    }
    
    // Étape 1 : Chargement du template
    onProgress?.('Chargement du template...', 20);
    const templateHTML = await loadTemplateHTML(formData.templateId);
    
    if (!templateHTML) {
      throw new Error('Template HTML vide');
    }
    
    // Étape 2 : Conversion vers RawData
    onProgress?.('Préparation des données...', 40);
    const rawData = convertToRawData(formData);
    
    // Étape 3 : Enrichissement par GROQ (IA)
    onProgress?.('Enrichissement du contenu par IA...', 60);
    let enrichedData: EnrichedPortfolioData;
    
    try {
      enrichedData = await enrichPortfolioData(rawData);
      console.log('[GeneratorV2] ✅ GROQ enrichment successful');
      console.log('[GeneratorV2] 🔍 Enriched data sample:', {
        heroTitle: enrichedData.heroTitle,
        heroSubtitle: enrichedData.heroSubtitle,
        aboutText: enrichedData.aboutText?.substring(0, 100),
        servicesCount: enrichedData.services?.length || 0,
        projectsCount: enrichedData.projects?.length || 0,
      });
    } catch (groqError) {
      console.warn('[GeneratorV2] ⚠️ GROQ enrichment failed, fallback to basic data:', groqError);
      // Fallback: utiliser conversion basique sans IA
      enrichedData = convertToEnrichedData(formData);
    }
    
    // Étape 4 : Calcul des flags
    onProgress?.('Configuration...', 75);
    const flags = computeFlags(enrichedData);
    
    // Étape 5 : Injection dans le template
    onProgress?.('Génération du HTML...', 90);
    const labels = getLabels(formData.profileContext);
    
    // Ajouter les labels dans les données
    const dataWithLabels = {
      ...enrichedData,
      SERVICES_LABEL: labels.services,
      REALISATIONS_LABEL: labels.realisations,
      REALISATIONS_SUBTITLE: labels.realisationsSubtitle,
    };
    
    const renderedHTML = injectDataIntoTemplate(templateHTML, dataWithLabels, flags);
    
    onProgress?.('Finalisation...', 100);
    
    console.log('[GeneratorV2] ✅ Generation complete');
    
    return {
      success: true,
      html: renderedHTML,
    };
  } catch (error: any) {
    console.error('[GeneratorV2] ❌ Error:', error);
    return {
      success: false,
      error: error.message || 'Erreur lors de la génération',
    };
  }
}

/**
 * Exporte le portfolio en ZIP (HTML + assets)
 */
export async function exportPortfolioZip(
  formData: PortfolioFormDataV2,
  html: string
): Promise<{ success: boolean; path?: string; error?: string }> {
  try {
    console.log('[GeneratorV2] Exporting portfolio...');
    
    // Préparer les assets (images)
    const assets: Array<{ name: string; data: string }> = [];
    
    // Collecter toutes les images
    Object.entries(formData.imageAssignments).forEach(([key, dataUrl]) => {
      if (dataUrl) {
        assets.push({
          name: `${key}.jpg`,
          data: dataUrl,
        });
      }
    });
    
    // Appeler le main process pour créer le ZIP
    // @ts-ignore
    const result = await window.electron.invoke('export-portfolio-zip', {
      html,
      assets,
      filename: `${formData.name.replace(/\s+/g, '_')}_portfolio.zip`,
    });
    
    if (!result.success) {
      throw new Error(result.error || 'Échec de l\'export');
    }
    
    console.log('[GeneratorV2] ✅ Export complete:', result.path);
    
    return {
      success: true,
      path: result.path,
    };
  } catch (error: any) {
    console.error('[GeneratorV2] ❌ Export error:', error);
    return {
      success: false,
      error: error.message || 'Erreur lors de l\'export',
    };
  }
}
