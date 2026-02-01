/**
 * SOUVERAIN - Web Scraper Service
 * Service de scraping de sites web pour extraction automatique de données
 */

import type { ScrapedWebsite } from '../components/portfolio/types';

/**
 * Scrape un site web et extrait les informations pertinentes
 * Appelle le main process via IPC pour faire le fetch et le parsing
 */
export async function scrapeWebsite(url: string): Promise<ScrapedWebsite> {
  try {
    // @ts-ignore
    const result = await window.electron.scrapeWebsite(url);
    
    if (!result.success) {
      throw new Error(result.error || 'Échec du scraping');
    }
    
    return result.data;
  } catch (error: any) {
    console.error('[WebScraper] Error:', error);
    throw new Error(`Impossible de scraper le site: ${error.message}`);
  }
}

/**
 * Détecte le type de site (portfolio, commerce, professionnel...)
 */
export function detectWebsiteType(scrapedData: ScrapedWebsite): 'person' | 'place' {
  const text = [
    scrapedData.description || '',
    scrapedData.tagline || '',
    ...(scrapedData.services || []).map(s => s.title),
  ].join(' ').toLowerCase();
  
  // Indices d'un lieu/commerce
  const placeIndicators = [
    'restaurant', 'boutique', 'magasin', 'horaires', 'ouverture',
    'adresse', 'nous trouver', 'notre établissement'
  ];
  
  const hasPlaceIndicators = placeIndicators.some(indicator => 
    text.includes(indicator)
  );
  
  if (hasPlaceIndicators || scrapedData.openingHours || scrapedData.address) {
    return 'place';
  }
  
  return 'person';
}
