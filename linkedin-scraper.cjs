/**
 * SOUVERAIN - LinkedIn Profile Scraper
 * Scrape et parse les profils LinkedIn publics
 */

const https = require('https');
const { GroqClient } = require('./groq-client.cjs');

class LinkedInScraper {
  constructor() {
    this.groqClient = new GroqClient();
  }

  /**
   * Extrait les informations d'un profil LinkedIn
   * @param {string} profileUrl - URL du profil LinkedIn
   * @returns {Promise<Object>} Données structurées du profil
   */
  async scrapeProfile(profileUrl) {
    try {
      // Validation de l'URL
      if (!profileUrl.includes('linkedin.com/in/')) {
        throw new Error('URL LinkedIn invalide');
      }

      console.log('[LinkedIn Scraper] Tentative de récupération du profil...');

      // Fetch le contenu HTML du profil
      const html = await this.fetchProfile(profileUrl);

      // Parse avec Groq pour extraire les infos structurées
      const profileData = await this.parseWithGroq(html);

      console.log('[LinkedIn Scraper] Profil extrait avec succès');
      return {
        success: true,
        data: profileData
      };

    } catch (error) {
      console.error('[LinkedIn Scraper] Erreur:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Récupère le contenu HTML d'un profil LinkedIn
   * @param {string} url - URL du profil
   * @returns {Promise<string>} Contenu HTML
   */
  fetchProfile(url) {
    return new Promise((resolve, reject) => {
      const options = {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        }
      };

      https.get(url, options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          if (res.statusCode === 200) {
            resolve(data);
          } else if (res.statusCode === 999) {
            reject(new Error('Profil LinkedIn inaccessible. Veuillez vérifier que votre profil est public.'));
          } else {
            reject(new Error(`Erreur HTTP ${res.statusCode}`));
          }
        });
      }).on('error', (err) => {
        reject(new Error(`Erreur réseau: ${err.message}`));
      });
    });
  }

  /**
   * Parse le HTML avec Groq pour extraire les informations
   * @param {string} html - Contenu HTML
   * @returns {Promise<Object>} Données structurées
   */
  async parseWithGroq(html) {
    // Extraire les métadonnées OpenGraph et le contenu visible
    const metadata = this.extractMetadata(html);
    const visibleText = this.extractVisibleText(html);

    // Construire le prompt pour Groq
    const prompt = `Tu es un expert en extraction de données de profils professionnels. Analyse le contenu suivant d'un profil LinkedIn et extrait les informations au format JSON.

MÉTADONNÉES:
${JSON.stringify(metadata, null, 2)}

CONTENU VISIBLE:
${visibleText.substring(0, 3000)}

Extrait et retourne UNIQUEMENT un objet JSON avec la structure suivante (sans commentaires ni texte supplémentaire):
{
  "firstName": "string",
  "lastName": "string",
  "headline": "string (titre professionnel actuel)",
  "location": "string",
  "summary": "string (résumé du profil)",
  "experiences": [
    {
      "title": "string (poste)",
      "company": "string",
      "startDate": "string (format: Mois Année)",
      "endDate": "string (ou 'Présent')",
      "description": "string"
    }
  ],
  "education": [
    {
      "school": "string",
      "degree": "string",
      "fieldOfStudy": "string",
      "year": "string"
    }
  ],
  "skills": ["string"],
  "languages": ["string"]
}

Retourne UNIQUEMENT le JSON, rien d'autre.`;

    try {
      const response = await this.groqClient.chatCompletion([
        { role: 'user', content: prompt }
      ], {
        model: 'llama-3.1-8b-instant',
        temperature: 0.1,
        max_tokens: 2000
      });

      // Parse la réponse JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Format de réponse invalide');
      }

      const profileData = JSON.parse(jsonMatch[0]);
      return profileData;

    } catch (error) {
      console.error('[LinkedIn Scraper] Erreur parsing Groq:', error);
      throw new Error('Impossible d\'extraire les données du profil');
    }
  }

  /**
   * Extrait les métadonnées OpenGraph du HTML
   * @param {string} html - Contenu HTML
   * @returns {Object} Métadonnées
   */
  extractMetadata(html) {
    const metadata = {};

    // Titre
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    if (titleMatch) {
      metadata.title = titleMatch[1].trim();
    }

    // OpenGraph
    const ogMatches = html.matchAll(/<meta\s+property="og:([^"]+)"\s+content="([^"]+)"/gi);
    for (const match of ogMatches) {
      metadata[`og_${match[1]}`] = match[2];
    }

    // Description
    const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
    if (descMatch) {
      metadata.description = descMatch[1];
    }

    return metadata;
  }

  /**
   * Extrait le texte visible du HTML (approximation)
   * @param {string} html - Contenu HTML
   * @returns {string} Texte visible
   */
  extractVisibleText(html) {
    // Supprimer les scripts et styles
    let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
    text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

    // Extraire le texte des balises
    text = text.replace(/<[^>]+>/g, ' ');

    // Nettoyer les espaces
    text = text.replace(/\s+/g, ' ').trim();

    return text;
  }

  /**
   * Méthode alternative: parse depuis du texte copié-collé
   * @param {string} profileText - Texte du profil copié depuis LinkedIn
   * @returns {Promise<Object>} Données structurées
   */
  async parseFromText(profileText) {
    const prompt = `Tu es un expert en extraction de données de profils professionnels. Analyse le texte suivant copié depuis un profil LinkedIn et extrait les informations au format JSON.

TEXTE DU PROFIL:
${profileText}

Extrait et retourne UNIQUEMENT un objet JSON avec la structure suivante (sans commentaires ni texte supplémentaire):
{
  "firstName": "string",
  "lastName": "string",
  "headline": "string (titre professionnel actuel)",
  "location": "string",
  "summary": "string (résumé du profil)",
  "experiences": [
    {
      "title": "string (poste)",
      "company": "string",
      "startDate": "string (format: Mois Année)",
      "endDate": "string (ou 'Présent')",
      "description": "string"
    }
  ],
  "education": [
    {
      "school": "string",
      "degree": "string",
      "fieldOfStudy": "string",
      "year": "string"
    }
  ],
  "skills": ["string"],
  "languages": ["string"]
}

Retourne UNIQUEMENT le JSON, rien d'autre.`;

    try {
      const response = await this.groqClient.chatCompletion([
        { role: 'user', content: prompt }
      ], {
        model: 'llama-3.1-8b-instant',
        temperature: 0.1,
        max_tokens: 2000
      });

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Format de réponse invalide');
      }

      return JSON.parse(jsonMatch[0]);

    } catch (error) {
      console.error('[LinkedIn Scraper] Erreur parsing text:', error);
      throw new Error('Impossible d\'extraire les données du profil');
    }
  }
}

module.exports = { LinkedInScraper };
