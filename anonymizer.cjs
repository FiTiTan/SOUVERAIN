/**
 * SOUVERAIN V16 - Anonymizer WebLLM
 * Détection intelligente des données personnelles via LLM local
 * Modèle léger exécuté 100% dans l'app
 */

// ============================================================
// NOTE: Ce module utilise l'API Transformers.js (Hugging Face)
// qui fonctionne en Node.js sans GPU
// npm install @xenova/transformers
// ============================================================

let pipeline = null;
let nerModel = null;

/**
 * Initialise le modèle NER (Named Entity Recognition)
 * Modèle léger ~50MB, s'exécute sur CPU
 */
async function initNERModel() {
  if (nerModel) return nerModel;

  try {
    // Import dynamique pour éviter les erreurs si le module n'est pas installé
    const { pipeline: transformersPipeline } = await import('@huggingface/transformers');
    
    console.log('[ANONYMIZER] Chargement du modèle NER...');
    
    // Modèle NER multilingue (supporte le français)
    nerModel = await transformersPipeline(
      'token-classification',
      'Xenova/bert-base-multilingual-cased-ner-hrl',
      { quantized: true } // Version quantifiée = plus rapide
    );
    
    console.log('[ANONYMIZER] Modèle NER chargé');
    return nerModel;
  } catch (error) {
    console.error('[ANONYMIZER] Erreur chargement modèle:', error.message);
    return null;
  }
}

// ============================================================
// PATTERNS REGEX (Fallback + Complément au NER)
// ============================================================

const PATTERNS = {
  // Emails
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi,
  
  // Téléphones français (tous formats)
  phone: /(?:(?:\+|00)33[\s.-]?|0)[1-9](?:[\s.-]?\d{2}){4}/gi,
  
  // Codes postaux français
  postalCode: /\b(?:0[1-9]|[1-8]\d|9[0-5]|97[1-6])\d{3}\b/g,
  
  // URLs LinkedIn/GitHub
  linkedin: /(?:https?:\/\/)?(?:[\w-]+\.)?linkedin\.com\/in\/[\w-]+\/?/gi,
  github: /(?:https?:\/\/)?(?:www\.)?github\.com\/[\w-]+\/?/gi,
  
  // Generic URLs (Catch-all pour Portfolio, Twitter, etc)
  genericUrl: /(?:https?:\/\/|www\.)[^\s/$.?#].[^\s]*/gi, 
  
  // Fichiers Images (Photos)
  imageFile: /\b[\w-]+\.(?:jpg|jpeg|png|gif|webp|bmp)\b/gi,
  
  // Numéro de sécurité sociale
  ssn: /\b[12]\s?\d{2}\s?\d{2}\s?(?:\d{2}|\d[AB])\s?\d{3}\s?\d{3}(?:\s?\d{2})?\b/gi,
  
  // Âge explicite
  age: /\b(\d{1,2})\s*ans\b/gi,
  
  // Situation familiale
  situation: /(?:marié|mariée|célibataire|pacsé|pacsée|divorcé|divorcée|veuf|veuve)/gi,

  // Heuristiques Noms (Contexte)
  contextName: /(?:Nom|Prénom|M\.|Mme|Mlle)\s*[:.]?\s+([A-Z][a-zÀ-ÖØ-öø-ÿ]+(?:[- ][A-Z][a-zÀ-ÖØ-öø-ÿ]+)?)/g,
  
  // Mots tout en MAJUSCULES (souvent nom de famille sur CV) - min 3 lettres pour éviter sigles courts
  uppercaseName: /\b[A-ZÀ-ÖØ-Þ]{3,}\b/g,
};

// ============================================================
// CLASSE ANONYMIZER HYBRIDE
// ============================================================

class Anonymizer {
  constructor() {
    this.mappings = new Map();
    this.reverseMap = new Map();
    this.counters = {
      person: 0,
      location: 0,
      organization: 0,
      email: 0,
      phone: 0,
      url: 0,
      misc: 0
    };
    this.useNER = false;
  }

  /**
   * Initialise le modèle NER (à appeler au démarrage de l'app)
   */
  async init() {
    const model = await initNERModel();
    this.useNER = model !== null;
    return this.useNER;
  }

  /**
   * Génère un token anonyme et stocke le mapping
   */
  _createToken(type, originalValue) {
    const normalized = originalValue.trim();
    const key = normalized.toLowerCase();
    
    if (this.mappings.has(key)) {
      return this.mappings.get(key);
    }

    this.counters[type] = (this.counters[type] || 0) + 1;
    const token = `[${type.toUpperCase()}_${this.counters[type]}]`;
    
    this.mappings.set(key, token);
    this.reverseMap.set(token, normalized);
    
    return token;
  }

  /**
   * Détecte les entités via NER
   */
  async _detectEntitiesNER(text) {
    if (!nerModel) return [];

    try {
      const results = await nerModel(text, {
        aggregation_strategy: 'simple'
      });

      // Mapper les types d'entités (FILTRAGE OPTIMAL: PSEUDONYMISATION)
      // On masque l'identité directe (Nom, Contact, Photo)
      // On GARDE l'employeur (ORG) pour que l'IA comprenne le contexte métier (RGPD: C'est de la pseudonymisation autorisée)
      const entityMap = {
        'PER': 'person',      // A masquer (Identité)
        'LOC': 'location',    // A masquer (Domicile)
        // 'ORG': 'organization', // VISIBLE (Contexte Pro)
        'MISC': 'misc'        // A masquer (Images/Fichiers/Divers)
      };

      return results
        .filter(r => r.score > 0.85)
        .filter(r => ['PER', 'LOC'].includes(r.entity_group)) // On exclut ORG et MISC (KPIs/Skills) du masquage
        .map(r => ({
          text: r.word.replace(/^##/, ''),
          type: entityMap[r.entity_group],
          score: r.score
        }))
        // Filtre anti-bruit : ignorer les fragments < 3 chars sauf si c'est une personne (ex: Al)
        .filter(e => e.text.length > 2 || e.type === 'person');
    } catch (error) {
      console.error('[ANONYMIZER] Erreur NER:', error.message);
      return [];
    }
  }

  /**
   * Détecte les entités via Regex (fallback)
   */
  _detectEntitiesRegex(text) {
    const entities = [];

    // Emails
    const emails = text.match(PATTERNS.email) || [];
    emails.forEach(e => entities.push({ text: e, type: 'email', score: 1 }));

    // Téléphones
    const phones = text.match(PATTERNS.phone) || [];
    phones.forEach(p => entities.push({ text: p, type: 'phone', score: 1 }));

    // LinkedIn/GitHub
    const linkedins = text.match(PATTERNS.linkedin) || [];
    linkedins.forEach(l => entities.push({ text: l, type: 'url', score: 1 }));
    
    const githubs = text.match(PATTERNS.github) || [];
    githubs.forEach(g => entities.push({ text: g, type: 'url', score: 1 }));

    // Generic URLs
    const urls = text.match(PATTERNS.genericUrl) || [];
    urls.forEach(u => entities.push({ text: u, type: 'url', score: 1 }));

    // Images
    const images = text.match(PATTERNS.imageFile) || [];
    images.forEach(i => entities.push({ text: i, type: 'misc', score: 1 }));

    // Codes postaux
    const postals = text.match(PATTERNS.postalCode) || [];
    postals.forEach(p => entities.push({ text: p, type: 'location', score: 0.8 }));

    // SSN
    const ssns = text.match(PATTERNS.ssn) || [];
    ssns.forEach(s => entities.push({ text: s, type: 'misc', score: 1 }));

    // Situation familiale
    const situations = text.match(PATTERNS.situation) || [];
    situations.forEach(s => entities.push({ text: s, type: 'misc', score: 1 }));

    // Heuristiques Noms (Contexte)
    // Reset regex index par sécurité
    PATTERNS.contextName.lastIndex = 0;
    let nameMatch;
    while ((nameMatch = PATTERNS.contextName.exec(text)) !== null) {
      if (nameMatch[1]) {
        entities.push({ text: nameMatch[1], type: 'person', score: 0.95 });
      }
    }

    // Mots Majuscules (Noms de famille potentiels)
    const uppercases = text.match(PATTERNS.uppercaseName) || [];
    const ignoreList = [
      'HTML', 'CSS', 'PHP', 'SQL', 'JAVA', 'JIRA', 'WORD', 'EXCEL', 'PPT', 'PDF', 'SNCF', 'RATP', 'SMIC', 
      'CDI', 'CDD', 'BAC', 'BTS', 'DUT', 'MBA', 'PERMIS',
      // Titres de sections CV
      'FORMATION', 'FORMATIONS', 'EXPERIENCE', 'EXPERIENCES', 'COMPETENCES', 'LANGUES', 'CENTRES', 'INTERET', 'INTERETS',
      'INFORMATIQUE', 'INFORMATIQUES', 'OUTILS', 'LOGICIELS', 'PROFIL', 'PROFESSIONNEL', 'PROFESSIONNELLE',
      'CONTACT', 'DIVERS', 'LOISIRS', 'ACTIVITES', 'CERTIFICATIONS', 'PROJETS', 'REFERENCES', 'MISSIONS',
      'STAGE', 'ALTERNANCE', 'ECOLE', 'UNIVERSITE', 'LYCEE', 'COLLEGE', 'INSTITUT', 'GROUPE',
      'JANVIER', 'FEVRIER', 'MARS', 'AVRIL', 'MAI', 'JUIN', 'JUILLET', 'AOUT', 'SEPTEMBRE', 'OCTOBRE', 'NOVEMBRE', 'DECEMBRE',
      'ADMINISTRATION', 'DE', 'LA', 'LE', 'LES', 'DES', 'POUR', 'SUR', 'DANS', 'PAR', 'AVEC', 'SANS', 'SOUS'
    ];
    
    uppercases.forEach(u => {
      if (!ignoreList.includes(u) && u.length > 2) {
         // On classe en 'misc' ou 'person' ? 'person' est risqué, 'misc' est safe (sera [MISC_X] mais masqué)
         entities.push({ text: u, type: 'misc', score: 0.6 }); 
      }
    });

    return entities;
  }

  /**
   * Anonymise le texte du CV
   */
  async anonymize(text) {
    let result = text;
    const detectedEntities = [];

    // 1. Détection NER (si disponible)
    if (this.useNER) {
      const nerEntities = await this._detectEntitiesNER(text);
      detectedEntities.push(...nerEntities);
    }

    // 2. Détection Regex (toujours, en complément)
    const regexEntities = this._detectEntitiesRegex(text);
    detectedEntities.push(...regexEntities);

    // 3. Dédupliquer et trier par longueur (plus long d'abord pour éviter les remplacements partiels)
    const uniqueEntities = [];
    const seen = new Set();
    
    for (const entity of detectedEntities) {
      const key = entity.text.toLowerCase().trim();
      if (!seen.has(key) && entity.text.length > 1) {
        seen.add(key);
        uniqueEntities.push(entity);
      }
    }
    
    uniqueEntities.sort((a, b) => b.text.length - a.text.length);

    // 4. Remplacer les entités par des tokens
    for (const entity of uniqueEntities) {
      const token = this._createToken(entity.type, entity.text);
      
      // Remplacer toutes les occurrences (insensible à la casse)
      const escapedText = entity.text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escapedText, 'gi');
      result = result.replace(regex, token);
    }

    return {
      anonymized: result,
      mappings: Object.fromEntries(this.reverseMap),
      entities: uniqueEntities,
      stats: {
        totalMasked: this.reverseMap.size,
        byType: { ...this.counters },
        nerUsed: this.useNER
      }
    };
  }

  /**
   * Réincremente le texte avec les données originales
   */
  deanonymize(text) {
    let result = text;
    
    for (const [token, original] of this.reverseMap) {
      result = result.split(token).join(original);
    }
    
    return result;
  }

  /**
   * Retourne le mapping pour debug
   */
  getMappings() {
    return Object.fromEntries(this.reverseMap);
  }

  /**
   * Réinitialise
   */
  reset() {
    this.mappings.clear();
    this.reverseMap.clear();
    this.counters = {
      person: 0,
      location: 0,
      organization: 0,
      email: 0,
      phone: 0,
      url: 0,
      misc: 0
    };
  }
}

// ============================================================
// ALTERNATIVE: ANONYMIZER VIA GROQ (Ultra-rapide)
// Utilise Groq lui-même pour détecter les entités
// ============================================================

class AnonymizerGroq {
  constructor(groqClient) {
    this.groqClient = groqClient;
    this.mappings = new Map();
    this.reverseMap = new Map();
    this.counters = {};
  }

  _createToken(type, originalValue) {
    const normalized = originalValue.trim();
    const key = normalized.toLowerCase();
    
    if (this.mappings.has(key)) {
      return this.mappings.get(key);
    }

    this.counters[type] = (this.counters[type] || 0) + 1;
    const token = `[${type.toUpperCase()}_${this.counters[type]}]`;
    
    this.mappings.set(key, token);
    this.reverseMap.set(token, normalized);
    
    return token;
  }

  async anonymize(text) {
    // Prompt avec exemples clairs par catégorie
    const extractionPrompt = `Extrait les données personnelles du CV. ATTENTION aux catégories :

- persons: Nom et prénom de la personne (ex: "Jean Dupont")
- emails: Adresses email (ex: "jean@mail.com")  
- phones: Numéros de téléphone (ex: "06 12 34 56 78")
- locations: Villes uniquement (ex: "Paris", "Lyon")
- companies: Entreprises/employeurs (ex: "BMW", "Renault", "Carrefour") — PAS les écoles
- schools: Écoles et universités (ex: "Université Paris 8", "HEC", "GNFA") — PAS les entreprises

CV:
${text.substring(0, 3500)}

JSON (strings simples, pas d'objets):
{"persons":[],"emails":[],"phones":[],"locations":[],"companies":[],"schools":[]}`;

    try {
      console.log('[ANONYMIZER] Appel API Groq pour extraction...');
      
      const response = await this.groqClient.client.post('/chat/completions', {
        model: 'llama-3.1-8b-instant',
        messages: [
          { 
            role: 'system', 
            content: 'Tu extrais des données de CV. Réponds UNIQUEMENT en JSON. ATTENTION: les universités et écoles vont dans "schools", pas dans "companies". Ne mets pas les titres de sections du CV.' 
          },
          { role: 'user', content: extractionPrompt }
        ],
        temperature: 0,
        max_tokens: 600
      });

      const content = response.data.choices[0]?.message?.content || '{}';
      console.log('[ANONYMIZER] Réponse brute:', content.substring(0, 400));
      
      // Parser le JSON - nettoyer agressivement
      let entities;
      try {
        // Extraire le JSON même s'il y a du texte autour
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const cleanJson = jsonMatch ? jsonMatch[0] : '{}';
        const rawEntities = JSON.parse(cleanJson);
        
        // Normaliser : extraire les strings des objets si nécessaire
        const extractStrings = (arr) => {
          if (!Array.isArray(arr)) return [];
          return arr.map(item => {
            if (typeof item === 'string') return item;
            if (typeof item === 'object' && item !== null) {
              // Chercher une propriété qui contient la valeur
              return item.name || item.value || item.email || item.phone || item.location || Object.values(item)[0] || '';
            }
            return '';
          }).filter(s => s && s.length > 0);
        };

        entities = {
          persons: extractStrings(rawEntities.persons),
          emails: extractStrings(rawEntities.emails),
          phones: extractStrings(rawEntities.phones),
          locations: extractStrings(rawEntities.locations),
          companies: extractStrings(rawEntities.companies),
          schools: extractStrings(rawEntities.schools)
        };
        
        // Filtre post-extraction pour virer les faux positifs
        const sectionTitles = ['expériences', 'formations', 'compétences', 'langues', 'centres', 'intérêt', 'profil', 'outils', 'informatiques'];
        
        entities.companies = entities.companies.filter(c => {
          const lower = c.toLowerCase();
          // Virer les titres de sections
          if (sectionTitles.some(t => lower.includes(t))) return false;
          // Virer si c'est une école mal classée
          if (lower.includes('université') || lower.includes('école') || lower.includes('institut')) return false;
          return c.length > 1 && c.length < 50;
        });
        
        entities.schools = entities.schools.filter(s => {
          const lower = s.toLowerCase();
          if (sectionTitles.some(t => lower.includes(t))) return false;
          return s.length > 1 && s.length < 60;
        });
        
        console.log('[ANONYMIZER] Entités normalisées:', JSON.stringify(entities, null, 2));
      } catch (parseError) {
        console.error('[ANONYMIZER] JSON invalide:', content);
        console.error('[ANONYMIZER] Parse error:', parseError.message);
        entities = { persons: [], emails: [], phones: [], locations: [], companies: [], schools: [] };
      }

      // Nettoyer les entités (filtres de sécurité)
      const cleanEntities = {
        persons: (entities.persons || []).filter(p => 
          p && p.length > 2 && p.length < 40 && !p.toLowerCase().includes('conseiller') && !p.toLowerCase().includes('commercial')
        ),
        emails: (entities.emails || []).filter(e => e && e.includes('@')),
        phones: (entities.phones || []).filter(p => p && p.replace(/\D/g, '').length >= 10),
        locations: (entities.locations || []).filter(l => 
          l && l.length > 2 && l.length < 30 && !['france', 'français', 'francais'].includes(l.toLowerCase())
        ),
        companies: (entities.companies || []).filter(c => 
          c && c.length > 1 && c.length < 50 && 
          !c.toLowerCase().includes('conseiller') && 
          !c.toLowerCase().includes('alexandre') &&
          !c.toLowerCase().includes('stage') &&
          !c.toLowerCase().includes('missions')
        ),
        schools: (entities.schools || []).filter(s => 
          s && s.length > 2 && s.length < 60 &&
          !s.toLowerCase().startsWith('dut') &&
          !s.toLowerCase().startsWith('licence') &&
          !s.toLowerCase().startsWith('master') &&
          !s.toLowerCase().startsWith('bts') &&
          !s.toLowerCase().startsWith('bac') &&
          !s.toLowerCase().includes('c.q.p') &&
          !s.toLowerCase().includes('cqp')
        )
      };

      // Appliquer les remplacements
      let result = text;

      // Personnes
      for (const person of cleanEntities.persons) {
        const token = this._createToken('person', person);
        const regex = new RegExp(person.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        result = result.replace(regex, token);
      }

      // Emails
      for (const email of cleanEntities.emails) {
        const token = this._createToken('email', email);
        result = result.split(email).join(token);
      }

      // Téléphones
      for (const phone of cleanEntities.phones) {
        const token = this._createToken('phone', phone);
        result = result.split(phone).join(token);
      }

      // Locations
      for (const loc of cleanEntities.locations) {
        const token = this._createToken('location', loc);
        const regex = new RegExp(loc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        result = result.replace(regex, token);
      }

      // Entreprises
      for (const company of cleanEntities.companies) {
        const token = this._createToken('company', company);
        const regex = new RegExp(company.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        result = result.replace(regex, token);
      }

      // Écoles
      for (const school of cleanEntities.schools) {
        const token = this._createToken('school', school);
        const regex = new RegExp(school.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        result = result.replace(regex, token);
      }

      return {
        anonymized: result,
        mappings: Object.fromEntries(this.reverseMap),
        entities: cleanEntities,
        stats: {
          totalMasked: this.reverseMap.size,
          byType: { ...this.counters },
          method: 'groq'
        }
      };

    } catch (error) {
      console.error('[ANONYMIZER] Erreur Groq:', error.message);
      return this._fallbackRegex(text);
    }
  }

  _fallbackRegex(text) {
    let result = text;
    
    // Emails
    const emails = text.match(PATTERNS.email) || [];
    for (const email of emails) {
      const token = this._createToken('email', email);
      result = result.split(email).join(token);
    }

    // Téléphones
    const phones = text.match(PATTERNS.phone) || [];
    for (const phone of phones) {
      const token = this._createToken('phone', phone);
      result = result.split(phone).join(token);
    }

    return {
      anonymized: result,
      mappings: Object.fromEntries(this.reverseMap),
      stats: {
        totalMasked: this.reverseMap.size,
        byType: { ...this.counters },
        method: 'regex-fallback'
      }
    };
  }

  deanonymize(text) {
    let result = text;
    for (const [token, original] of this.reverseMap) {
      result = result.split(token).join(original);
    }
    return result;
  }

  getMappings() {
    return Object.fromEntries(this.reverseMap);
  }

  reset() {
    this.mappings.clear();
    this.reverseMap.clear();
    this.counters = {};
  }
}

// ============================================================
// EXPORT
// ============================================================

module.exports = { 
  Anonymizer,           // Version NER (Transformers.js)
  AnonymizerGroq,       // Version Groq (recommandée - plus simple)
  initNERModel 
};
