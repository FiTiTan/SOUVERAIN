/**
 * Project Analyzer
 * Génère les 5 sections obligatoires via Groq AI
 * Réutilise les patterns de groq-client.cjs
 */

const axios = require('axios');

class ProjectAnalyzer {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.apiURL = 'https://api.groq.com/openai/v1/chat/completions';
    this.model = 'llama-3.3-70b-versatile';
  }

  async analyzeProject(sourceData, sourceType) {
    // Détecter le type de projet (code vs design)
    const projectType = this._detectProjectType(sourceData, sourceType);

    const systemPrompt = this._buildSystemPrompt(projectType);
    const userPrompt = this._buildAnalysisPrompt(sourceData, sourceType, projectType);

    try {
      const startTime = Date.now();

      const response = await axios.post(
        this.apiURL,
        {
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.4,
          max_tokens: 2000,
          top_p: 0.9
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 60000 // 60s timeout
        }
      );

      const latency = Date.now() - startTime;
      const rawResult = response.data.choices[0].message.content;

      // Parser le résultat structuré
      const parsed = this._parseAnalysisResult(rawResult);

      return {
        success: true,
        ...parsed,
        latency,
        tokens: response.data.usage
      };
    } catch (err) {
      console.error('[ProjectAnalyzer] Erreur analyse:', err.message);
      return {
        success: false,
        error: `Erreur analyse IA: ${err.message}`
      };
    }
  }

  /**
   * Détecte le type de projet (code vs design)
   */
  _detectProjectType(sourceData, sourceType) {
    // Si projectType déjà fourni par le scraper (local-scraper)
    if (sourceData.projectType) {
      return sourceData.projectType;
    }

    // GitHub: détecter selon le langage
    if (sourceType === 'github') {
      const creativeLangs = ['HTML', 'CSS', 'SCSS'];
      const lang = sourceData.language || '';

      // Si langage créatif OU présence de "design" dans description
      if (creativeLangs.includes(lang) ||
          (sourceData.description && /design|ui|ux|creative|portfolio|graphic/i.test(sourceData.description))) {
        return 'design';
      }
    }

    // Par défaut: code
    return 'code';
  }

  /**
   * Génère le system prompt adapté au type de projet
   */
  _buildSystemPrompt(projectType) {
    if (projectType === 'design') {
      return `Tu es un expert en portfolios créatifs et design.
Ta mission : transformer des données brutes de projet en une étude de cas percutante orientée DESIGN.

RÈGLES ABSOLUES:
1. Ton analyse doit être en français impeccable
2. Structure stricte: 5 sections obligatoires (Pitch, Stack, Challenge, Solution, Output)
3. Vocabulaire DESIGN : esthétique, direction artistique, expérience utilisateur, identité visuelle
4. Focus sur : impact visuel, cohérence graphique, choix créatifs, storytelling visuel
5. Verbes d'action créatifs : concevoir, imaginer, composer, styliser, harmoniser
6. Si tu détectes des tokens d'anonymisation [TYPE_N], conserve-les tels quels`;
    }

    // Code (défaut)
    return `Tu es un expert en rédaction de portfolios professionnels techniques.
Ta mission : transformer des données brutes de projet en une étude de cas percutante orientée DÉVELOPPEMENT.

RÈGLES ABSOLUES:
1. Ton analyse doit être en français impeccable
2. Structure stricte: 5 sections obligatoires (Pitch, Stack, Challenge, Solution, Output)
3. Vocabulaire TECHNIQUE : architecture, performance, scalabilité, algorithmes
4. Sois concret, factuel, orienté résultats techniques
5. Verbes d'action forts : développer, optimiser, créer, implémenter, automatiser
6. Si tu détectes des tokens d'anonymisation [TYPE_N], conserve-les tels quels`;
  }

  _buildAnalysisPrompt(sourceData, sourceType, projectType) {
    const isDesign = projectType === 'design';
    const tools = sourceData.tools || sourceData.languages || [];

    if (sourceType === 'github') {
      return `Analyse ce projet ${isDesign ? 'créatif' : 'technique'} et génère une étude de cas professionnelle.

DONNÉES DU PROJET:
- Nom: ${sourceData.name}
- Description: ${sourceData.description}
- ${isDesign ? 'Outils' : 'Langages'}: ${tools.join(', ') || sourceData.language || 'Non spécifié'}
- README (extrait):
${sourceData.readme ? sourceData.readme.substring(0, 2000) : 'Pas de README disponible'}

GÉNÈRE LES 5 SECTIONS:

1. LE PITCH (1-2 phrases max)
Une accroche percutante qui capte l'attention en 3 secondes.
${isDesign
  ? 'Format: "[Titre projet] — [Impact créatif/expérience] pour [audience cible]"'
  : 'Format: "[Titre projet] — [Valeur ajoutée technique] pour [cible utilisateurs]"'
}

2. ${isDesign ? 'LES OUTILS' : 'LA STACK'} (liste items)
Liste exhaustive des ${isDesign ? 'outils créatifs et technologies' : 'technologies'} utilisés.
Format: ${isDesign ? '["Figma", "Photoshop", "After Effects", "HTML/CSS"]' : '["React", "TypeScript", "Node.js", "PostgreSQL"]'}

3. LE CHALLENGE (2-3 phrases)
${isDesign
  ? 'Quel défi créatif ou problème d\'expérience utilisateur ce projet résout-il ? Contraintes esthétiques, ergonomiques, identité de marque.'
  : 'Quel problème technique/métier complexe ce projet résout-il ? Contexte, contraintes, enjeux.'
}

4. LA SOLUTION (3-4 phrases)
${isDesign
  ? 'Quelle approche créative as-tu adoptée ? Direction artistique, choix de design, processus créatif, itérations.'
  : 'Comment as-tu résolu le challenge ? Méthode, architecture, choix techniques. Sois précis et technique.'
}

5. LES OUTPUTS (liens)
- ${isDesign ? 'Voir le projet' : 'Code source'}: ${sourceData.url}
- Démo live: ${sourceData.homepage || 'N/A'}

RÉPONDS AU FORMAT JSON STRICT:
\`\`\`json
{
  "pitch": "...",
  "stack": ["tech1", "tech2"],
  "challenge": "...",
  "solution": "...",
  "outputs": [
    {"label": "${isDesign ? 'Voir le projet' : 'Code source'}", "url": "..."},
    {"label": "Démo", "url": "..."}
  ]
}
\`\`\``;
    } else if (sourceType === 'local') {
      return `Analyse ce projet ${isDesign ? 'créatif' : 'technique'} local et génère une étude de cas professionnelle.

DONNÉES DU PROJET:
- Nom: ${sourceData.name}
- Dossier: ${sourceData.path}
- ${isDesign ? 'Outils' : 'Langages'} détectés: ${tools.join(', ') || 'Non spécifié'}
- Nombre d'images: ${sourceData.images ? sourceData.images.length : 0}
- README (extrait):
${sourceData.readme ? sourceData.readme.substring(0, 2000) : 'Pas de README disponible'}

GÉNÈRE LES 5 SECTIONS:

1. LE PITCH (1-2 phrases max)
Une accroche percutante qui capte l'attention en 3 secondes.
${isDesign
  ? 'Format: "[Titre projet] — [Impact créatif/expérience] pour [audience cible]"'
  : 'Format: "[Titre projet] — [Valeur ajoutée technique] pour [cible utilisateurs]"'
}

2. ${isDesign ? 'LES OUTILS' : 'LA STACK'} (liste items)
Liste exhaustive des ${isDesign ? 'outils créatifs et technologies' : 'technologies'} utilisés.
Format: ${isDesign ? '["Figma", "Photoshop", "After Effects", "HTML/CSS"]' : '["React", "TypeScript", "Node.js", "PostgreSQL"]'}

3. LE CHALLENGE (2-3 phrases)
${isDesign
  ? 'Quel défi créatif ou problème d\'expérience utilisateur ce projet résout-il ? Contraintes esthétiques, ergonomiques, identité de marque.'
  : 'Quel problème technique/métier complexe ce projet résout-il ? Contexte, contraintes, enjeux.'
}

4. LA SOLUTION (3-4 phrases)
${isDesign
  ? 'Quelle approche créative as-tu adoptée ? Direction artistique, choix de design, processus créatif, itérations.'
  : 'Comment as-tu résolu le challenge ? Méthode, architecture, choix techniques. Sois précis et technique.'
}

5. LES OUTPUTS (liens)
- Dossier local: ${sourceData.path}

RÉPONDS AU FORMAT JSON STRICT:
\`\`\`json
{
  "pitch": "...",
  "stack": ["tech1", "tech2"],
  "challenge": "...",
  "solution": "...",
  "outputs": [
    {"label": "Fichiers source", "url": "file://${sourceData.path}"}
  ]
}
\`\`\``;
    }

    return 'Erreur: type de source non supporté';
  }

  _parseAnalysisResult(rawResult) {
    try {
      // Extraire JSON du markdown si présent
      const jsonMatch = rawResult.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : rawResult;

      const parsed = JSON.parse(jsonStr);

      return {
        pitch: parsed.pitch || '',
        stack: Array.isArray(parsed.stack) ? parsed.stack : [],
        challenge: parsed.challenge || '',
        solution: parsed.solution || '',
        outputs: Array.isArray(parsed.outputs) ? parsed.outputs : []
      };
    } catch (err) {
      console.error('[ProjectAnalyzer] Erreur parsing:', err.message);
      // Fallback: retourner structure vide
      return {
        pitch: 'Erreur de parsing',
        stack: [],
        challenge: '',
        solution: '',
        outputs: []
      };
    }
  }

  async regenerateSection(projectData, sectionName) {
    // Régénérer une seule section
    const prompt = `Régénère uniquement la section "${sectionName}" pour ce projet:

${JSON.stringify(projectData, null, 2)}

Réponds avec UNIQUEMENT le contenu de la section ${sectionName}, sans JSON, sans markdown.`;

    try {
      const response = await axios.post(
        this.apiURL,
        {
          model: this.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.5,
          max_tokens: 500
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      return {
        success: true,
        content: response.data.choices[0].message.content.trim()
      };
    } catch (err) {
      return {
        success: false,
        error: err.message
      };
    }
  }
}

module.exports = ProjectAnalyzer;
