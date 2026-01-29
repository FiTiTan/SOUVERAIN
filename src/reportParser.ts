/**
 * SOUVERAIN - Report Parser
 * Transforme le texte brut du Coach CV en données structurées
 */

// ============================================================
// TYPES
// ============================================================

export interface DiagnosticData {
  metier: string;
  secteur: string;
  niveau: string;
  experience: string;
  pointFort: string;
  axeAmelioration: string;
}

export interface ScoreDetail {
  label: string;
  score: number;
  description: string;
}

export interface ScoreData {
  global: number;
  impact: ScoreDetail[];
  lisibilite: ScoreDetail[];
  optimisation: ScoreDetail[];
}

export interface ExperienceData {
  company: string;
  poste: string;
  dates: string;
  pertinence: 'Essentielle' | 'Importante' | 'Secondaire' | 'À réduire' | 'À supprimer';
  pointsForts: string;
  pointsFaibles: string;
  verdict: string;
}

export interface ATSKeyword {
  keyword: string;
  priority?: 'high' | 'medium' | 'low';
  location?: string;
}

export interface ATSData {
  secteur: string;
  sousSpecialite: string;
  present: string[];
  missing: ATSKeyword[];
}

export interface ReformulationData {
  before: string;
  after: string;
  gain: string;
}

export interface ActionData {
  priority: 1 | 2 | 3;
  title: string;
  description: string;
  impact: string;
  duration: string;
}

export interface ParsedReport {
  diagnostic: DiagnosticData;
  score: ScoreData;
  experiences: ExperienceData[];
  ats: ATSData;
  reformulations: ReformulationData[];
  actions: ActionData[];
  conclusion: string;
  raw: string;
}

// ============================================================
// HELPER FUNCTIONS
// ============================================================

/**
 * Extrait une section entre deux délimiteurs
 */
const extractSection = (text: string, sectionName: string): string => {
  // Pattern pour trouver la section (avec ou sans numéro)
  const patterns = [
    new RegExp(`SECTION \\d+ — ${sectionName}[\\s\\S]*?(?=SECTION \\d+ —|$)`, 'i'),
    new RegExp(`${sectionName}[\\s\\S]*?(?=SECTION \\d+ —|═{10,}|$)`, 'i'),
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[0].replace(/═+/g, '').trim();
    }
  }
  return '';
};

/**
 * Extrait une valeur après un label
 */
const extractValue = (text: string, label: string): string => {
  const patterns = [
    new RegExp(`${label}\\s*:\\s*(.+?)(?=\\n|$)`, 'i'),
    new RegExp(`${label}\\s*(.+?)(?=\\n|$)`, 'i'),
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return '';
};

/**
 * Extrait un score (X/10)
 */
const extractScore = (text: string): number => {
  const match = text.match(/(\d+(?:[.,]\d+)?)\s*\/\s*10/);
  if (match) {
    return parseFloat(match[1].replace(',', '.'));
  }
  return 0;
};

/**
 * Extrait la description après le score (après →)
 */
const extractScoreDescription = (text: string): string => {
  const match = text.match(/→\s*(.+?)(?=\n|$)/);
  if (match) {
    return match[1].trim().replace(/^\[|\]$/g, '');
  }
  // Fallback: prendre tout après X/10
  const fallback = text.match(/\/10\s*[-—]\s*(.+?)(?=\n|$)/);
  if (fallback) {
    return fallback[1].trim().replace(/^\[|\]$/g, '');
  }
  return '';
};

// ============================================================
// MAIN PARSER
// ============================================================

export const parseReport = (rawText: string): ParsedReport => {
  const text = rawText || '';
  
  // ============================================================
  // SECTION 1 - DIAGNOSTIC
  // ============================================================
  
  const diagnosticSection = extractSection(text, 'DIAGNOSTIC EXPRESS');
  
  const diagnostic: DiagnosticData = {
    metier: extractValue(diagnosticSection, 'Métier identifié') || 'Non identifié',
    secteur: extractValue(diagnosticSection, 'Secteur') || 'Non identifié',
    niveau: extractValue(diagnosticSection, 'Niveau') || 'Non identifié',
    experience: extractValue(diagnosticSection, 'Expérience totale') || extractValue(diagnosticSection, 'Expérience') || '',
    pointFort: '',
    axeAmelioration: '',
  };
  
  // Extraire point fort et axe d'amélioration
  const pointFortMatch = diagnosticSection.match(/Point fort[^:]*:\s*(.+?)(?=\n|Axe|$)/is);
  if (pointFortMatch) {
    diagnostic.pointFort = pointFortMatch[1].trim();
  }
  
  const axeMatch = diagnosticSection.match(/(?:Axe d'amélioration|À améliorer)[^:]*:\s*(.+?)(?=\n\n|$)/is);
  if (axeMatch) {
    diagnostic.axeAmelioration = axeMatch[1].trim();
  }

  // ============================================================
  // SECTION 2 - SCORING
  // ============================================================
  
  const scoreSection = extractSection(text, 'SCORING');
  
  const score: ScoreData = {
    global: 0,
    impact: [],
    lisibilite: [],
    optimisation: [],
  };
  
  // Score global
  const globalMatch = scoreSection.match(/SCORE GLOBAL\s*:\s*(\d+(?:[.,]\d+)?)/i);
  if (globalMatch) {
    score.global = parseFloat(globalMatch[1].replace(',', '.'));
  }
  
  // Parser les sous-scores
  const parseSubScores = (sectionText: string, category: string): ScoreDetail[] => {
    const results: ScoreDetail[] = [];
    const categoryMatch = sectionText.match(new RegExp(`${category}[^•]*([\\s\\S]*?)(?=(?:LISIBILITÉ|OPTIMISATION|SCORE GLOBAL)|$)`, 'i'));
    
    if (categoryMatch) {
      const lines = categoryMatch[1].split('\n');
      let currentLabel = '';
      let currentScore = 0;
      let currentDesc = '';
      
      for (const line of lines) {
        const scoreLine = line.match(/•\s*(.+?)\s*:\s*(\d+(?:[.,]\d+)?)\s*\/\s*10/);
        if (scoreLine) {
          if (currentLabel) {
            results.push({ label: currentLabel, score: currentScore, description: currentDesc });
          }
          currentLabel = scoreLine[1].trim();
          currentScore = parseFloat(scoreLine[2].replace(',', '.'));
          currentDesc = '';
        }
        
        const descLine = line.match(/→\s*(.+)/);
        if (descLine) {
          currentDesc = descLine[1].trim().replace(/^\[|\]$/g, '');
        }
      }
      
      if (currentLabel) {
        results.push({ label: currentLabel, score: currentScore, description: currentDesc });
      }
    }
    
    return results;
  };
  
  score.impact = parseSubScores(scoreSection, 'IMPACT');
  score.lisibilite = parseSubScores(scoreSection, 'LISIBILITÉ');
  score.optimisation = parseSubScores(scoreSection, 'OPTIMISATION');

  // ============================================================
  // SECTION 3 - EXPÉRIENCES
  // ============================================================
  
  const expSection = extractSection(text, 'ANALYSE.*EXPÉRIENCE');
  const experiences: ExperienceData[] = [];
  
  // Pattern pour chaque expérience (commence par ** ou ---)
  const expBlocks = expSection.split(/(?=\*\*\[|\*\*[A-Z]|---\n\*\*)/);
  
  for (const block of expBlocks) {
    if (!block.trim() || block.length < 50) continue;
    
    // Extraire header (Company — Poste — Dates)
    const headerMatch = block.match(/\*\*(.+?)(?:\*\*|—)/);
    if (!headerMatch) continue;
    
    const fullHeader = block.match(/\*\*(.+?)\*\*/)?.[1] || '';
    const parts = fullHeader.split(/\s*—\s*/);
    
    const exp: ExperienceData = {
      company: parts[0]?.trim() || 'Non spécifié',
      poste: parts[1]?.trim() || '',
      dates: parts[2]?.trim() || '',
      pertinence: 'Secondaire',
      pointsForts: '',
      pointsFaibles: '',
      verdict: '',
    };
    
    // Pertinence
    const pertinenceMatch = block.match(/Pertinence[^:]*:\s*(.+?)(?=\n|$)/i);
    if (pertinenceMatch) {
      const p = pertinenceMatch[1].trim();
      if (p.includes('Essentielle')) exp.pertinence = 'Essentielle';
      else if (p.includes('Importante')) exp.pertinence = 'Importante';
      else if (p.includes('réduire')) exp.pertinence = 'À réduire';
      else if (p.includes('supprimer')) exp.pertinence = 'À supprimer';
      else exp.pertinence = 'Secondaire';
    }
    
    // Points forts/faibles
    const fortsMatch = block.match(/Points? forts?\s*:\s*(.+?)(?=Points? faibles?|Verdict|\n\n|$)/is);
    if (fortsMatch) {
      exp.pointsForts = fortsMatch[1].trim().replace(/\n/g, ' ');
    }
    
    const faiblesMatch = block.match(/Points? faibles?\s*:\s*(.+?)(?=Verdict|\n\n|$)/is);
    if (faiblesMatch) {
      exp.pointsFaibles = faiblesMatch[1].trim().replace(/\n/g, ' ');
    }
    
    // Verdict
    const verdictMatch = block.match(/Verdict\s*:\s*(.+?)(?=\n\n|---|$)/is);
    if (verdictMatch) {
      exp.verdict = verdictMatch[1].trim().replace(/\n/g, ' ');
    }
    
    if (exp.company !== 'Non spécifié') {
      experiences.push(exp);
    }
  }

  // ============================================================
  // SECTION 5 - ATS
  // ============================================================
  
  const atsSection = extractSection(text, 'ANALYSE ATS|COMPATIBILITÉ ATS');
  
  const ats: ATSData = {
    secteur: extractValue(atsSection, 'Secteur') || diagnostic.secteur,
    sousSpecialite: extractValue(atsSection, 'Sous-spécialité') || '',
    present: [],
    missing: [],
  };
  
  // Mots-clés présents
  const presentSection = atsSection.match(/PRÉSENTS?[^:]*:?\s*([\s\S]*?)(?=MANQUANTS?|À AJOUTER|$)/i);
  if (presentSection) {
    const bullets = presentSection[1].match(/[•\-\*]\s*(.+?)(?=\n|$)/g);
    if (bullets) {
      ats.present = bullets.map(b => b.replace(/^[•\-\*]\s*/, '').trim()).filter(k => k.length > 1);
    }
  }
  
  // Mots-clés manquants
  const missingSection = atsSection.match(/(?:MANQUANTS?|À AJOUTER)[^:]*:?\s*([\s\S]*?)(?=OÙ INTÉGRER|$)/i);
  if (missingSection) {
    const lines = missingSection[1].split('\n');
    let currentPriority: 'high' | 'medium' | 'low' = 'medium';
    
    for (const line of lines) {
      if (line.toLowerCase().includes('haute') || line.toLowerCase().includes('high')) {
        currentPriority = 'high';
        continue;
      }
      if (line.toLowerCase().includes('moyenne') || line.toLowerCase().includes('medium')) {
        currentPriority = 'medium';
        continue;
      }
      if (line.toLowerCase().includes('basse') || line.toLowerCase().includes('low')) {
        currentPriority = 'low';
        continue;
      }
      
      const bulletMatch = line.match(/[•\-\*]\s*(.+?)(?:\s*—\s*(.+))?$/);
      if (bulletMatch) {
        ats.missing.push({
          keyword: bulletMatch[1].trim(),
          priority: currentPriority,
          location: bulletMatch[2]?.trim() || undefined,
        });
      }
    }
  }

  // ============================================================
  // SECTION 6 - REFORMULATIONS
  // ============================================================
  
  const reformSection = extractSection(text, 'REFORMULATIONS');
  const reformulations: ReformulationData[] = [];
  
  // Pattern: AVANT: "..." APRÈS: "..." GAIN: ...
  const reformBlocks = reformSection.split(/(?=\d+\.\s*\n?AVANT|(?<=\n)\d+\.)/);
  
  for (const block of reformBlocks) {
    const beforeMatch = block.match(/AVANT\s*:\s*"?(.+?)"?\s*(?=APRÈS|$)/is);
    const afterMatch = block.match(/APRÈS\s*:\s*"?(.+?)"?\s*(?=GAIN|POURQUOI|$)/is);
    const gainMatch = block.match(/(?:GAIN|POURQUOI)\s*:\s*(.+?)(?=\n\n|\d+\.|$)/is);
    
    if (beforeMatch && afterMatch) {
      reformulations.push({
        before: beforeMatch[1].trim().replace(/^"|"$/g, ''),
        after: afterMatch[1].trim().replace(/^"|"$/g, ''),
        gain: gainMatch?.[1]?.trim() || '',
      });
    }
  }

  // ============================================================
  // SECTION 7 - PLAN D'ACTION
  // ============================================================
  
  const actionSection = extractSection(text, "PLAN D'ACTION");
  const actions: ActionData[] = [];
  
  // Pattern pour chaque priorité
  const priorityBlocks = actionSection.split(/(?=🥇|🥈|🥉|PRIORITÉ \d)/i);
  
  for (const block of priorityBlocks) {
    let priority: 1 | 2 | 3 = 1;
    if (block.includes('🥇') || block.match(/PRIORITÉ 1/i)) priority = 1;
    else if (block.includes('🥈') || block.match(/PRIORITÉ 2/i)) priority = 2;
    else if (block.includes('🥉') || block.match(/PRIORITÉ 3/i)) priority = 3;
    else continue;
    
    const titleMatch = block.match(/(?:🥇|🥈|🥉|PRIORITÉ \d)[^:]*:\s*(.+?)(?=\n|$)/i);
    const actionMatch = block.match(/(?:Action|Ce qu'il faut faire)\s*:\s*(.+?)(?=Impact|$)/is);
    const impactMatch = block.match(/Impact[^:]*:\s*(.+?)(?=Durée|Temps|$)/is);
    const durationMatch = block.match(/(?:Durée|Temps)[^:]*:\s*(.+?)(?=\n\n|🥇|🥈|🥉|PRIORITÉ|$)/is);
    
    if (titleMatch) {
      actions.push({
        priority,
        title: titleMatch[1].trim(),
        description: actionMatch?.[1]?.trim().replace(/\n/g, ' ') || '',
        impact: impactMatch?.[1]?.trim().replace(/\n/g, ' ') || '',
        duration: durationMatch?.[1]?.trim() || '',
      });
    }
  }

  // ============================================================
  // CONCLUSION
  // ============================================================
  
  const conclusionSection = extractSection(text, 'CONCLUSION');
  const conclusion = conclusionSection
    .replace(/CONCLUSION/i, '')
    .replace(/═+/g, '')
    .trim();

  // ============================================================
  // RETURN
  // ============================================================
  
  return {
    diagnostic,
    score,
    experiences,
    ats,
    reformulations,
    actions,
    conclusion,
    raw: rawText,
  };
};

// ============================================================
// VALIDATION
// ============================================================

export const isValidReport = (report: ParsedReport): boolean => {
  return (
    report.diagnostic.metier !== 'Non identifié' &&
    report.score.global > 0 &&
    report.experiences.length > 0
  );
};
