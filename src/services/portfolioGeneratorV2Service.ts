/**
 * SOUVERAIN - Portfolio Generator V2 Service
 * Adapte le nouveau wizard V2 vers le système de génération existant
 * 
 * FIX V4 (03/02/2026):
 * - profileType garde les vraies valeurs (food, retail, tech, artisan, service, niche)
 * - Ajout transmission des expertises à l'IA
 */

import type { PortfolioFormDataV2 } from '../components/portfolio/types';
import type { EnrichedPortfolioData, RawPortfolioData } from './aiEnrichmentTypes';
import { enrichPortfolioDataSequenced } from './aiEnrichmentService';
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
 * Convertit les données du wizard V2 vers le format RawPortfolioData pour l'IA
 * 
 * IMPORTANT: profileType doit garder les valeurs exactes pour que le prompt V4 fonctionne :
 * - food: Restaurants, cafés, boulangeries, glaciers → génère des PRODUITS
 * - retail: Boutiques, fleuristes, librairies → génère des OFFRES
 * - service: Avocats, coachs, comptables → génère des PRESTATIONS
 * - tech: Développeurs, designers, graphistes → génère des PRESTATIONS DIGITALES
 * - artisan: Plombiers, électriciens, menuisiers → génère des TRAVAUX
 * - niche: Tatoueurs, sophrologues, DJ → génère des SERVICES spécialisés
 */
function convertToRawData(formData: PortfolioFormDataV2): RawPortfolioData {
  // Mapping des profileContext vers les types attendus par le prompt V4
  const profileTypeMapping: Record<string, string> = {
    'junior': 'student',
    'food': 'food',
    'retail': 'retail', 
    'artisan': 'artisan',
    'service': 'service',
    'tech': 'tech',
    'niche': 'niche',
    'creative': 'tech',      // Les créatifs utilisent le même prompt que tech
    'consulting': 'service', // Les consultants utilisent le même prompt que service
  };

  const profileType = profileTypeMapping[formData.profileContext] || 'freelance';

  console.log('[GeneratorV2] profileContext:', formData.profileContext, '→ profileType:', profileType);
  console.log('[GeneratorV2] expertises:', formData.expertises);

  return {
    name: formData.name,
    profileType: profileType,
    tagline: formData.tagline,
    
    // ✅ FIX: Transmettre les expertises à l'IA
    expertises: formData.expertises || [],
    
    services: [], // Services générés automatiquement par DeepSeek
    valueProp: '', // Généré par DeepSeek
    email: formData.email || '',
    phone: formData.phone,
    address: formData.address,
    openingHours: formData.openingHours,
    socialLinks: formData.socialLinks,
    socialIsMain: false,
    projects: formData.realisations.map(r => ({
      title: r.title,
      description: r.extractedContent || r.description,
      category: r.category,
    })),
  };
}

/**
 * Convertit les données du wizard V2 vers le format EnrichedPortfolioData (sans IA)
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
    valueProp: '',
    
    // Services (seront générés par DeepSeek - fallback vide)
    services: [],
    servicesLabel: labels.services || 'Services',
    
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
    
    // DEBUG LOG
    console.log('[GeneratorV2] convertToRawData - profileType:', rawData.profileType);
    console.log('[GeneratorV2] convertToRawData - expertises:', rawData.expertises);
    console.log('[GeneratorV2] convertToRawData - projects:', rawData.projects.map(p => ({
      title: p.title,
      descriptionLength: p.description?.length || 0,
      descriptionPreview: p.description?.substring(0, 200),
      descriptionSource: p.description === '' ? 'EMPTY' : 
                         p.description?.length > 100 ? 'EXTRACTED_CONTENT' : 'FALLBACK_DESC'
    })));
    
    // Étape 3 : Enrichissement par IA (séquencé)
    onProgress?.('Enrichissement du contenu par IA (1/3: Hero)...', 50);
    let enrichedData: EnrichedPortfolioData;
    
    try {
      const result = await enrichPortfolioDataSequenced(rawData, formData.portfolioId);
      onProgress?.('Enrichissement du contenu par IA (2/3: Services)...', 65);
      
      if (!result.success || !result.data) {
        throw new Error('AI enrichment returned no data');
      }
      
      onProgress?.('Enrichissement du contenu par IA (3/3: Projects)...', 75);
      enrichedData = result.data;
      console.log('[GeneratorV2] ✅ AI enrichment successful (sequenced)');
    } catch (aiError) {
      console.warn('[GeneratorV2] ⚠️ AI enrichment failed, fallback to basic data:', aiError);
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
