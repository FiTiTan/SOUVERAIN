/**
 * SOUVERAIN V15 - Hardware Profiler
 * Détection intelligente basée sur RAM DISPONIBLE (pas totale)
 * et détection des CPU mobiles/basse consommation
 */

const os = require('os');

/**
 * Détecte si le CPU est un modèle mobile/basse consommation
 */
function isMobileCPU() {
  const cpuModel = os.cpus()[0]?.model?.toLowerCase() || '';
  
  // Suffixes typiques des CPU mobiles/basse conso
  const mobileIndicators = [
    'u',      // Intel U-series (ultra low power)
    'y',      // Intel Y-series (extremely low power)
    'm',      // Mobile
    'p',      // Performance mobile
    'g',      // Intel avec GPU intégré
    'apple m' // Apple Silicon (bien que performant, limité thermiquement)
  ];

  // Vérifier le suffixe du numéro de modèle
  const modelMatch = cpuModel.match(/(\d{4,5})([a-z]*)/);
  if (modelMatch && modelMatch[2]) {
    const suffix = modelMatch[2];
    if (mobileIndicators.some(ind => suffix.includes(ind))) {
      return true;
    }
  }

  // Vérifier les mots-clés
  if (cpuModel.includes('surface') || cpuModel.includes('mobile')) {
    return true;
  }

  // Fréquence de base basse = probablement mobile
  const baseFreq = os.cpus()[0]?.speed || 0;
  if (baseFreq < 2000 && baseFreq > 0) { // < 2GHz
    return true;
  }

  return false;
}

/**
 * Analyse les capacités hardware et retourne un profil optimisé
 */
function detectHardwareProfile() {
  const cpuCores = os.cpus().length;          // Cores logiques
  const physicalCores = Math.ceil(cpuCores / 2); // Estimation cores physiques
  const totalRAM = Math.round(os.totalmem() / (1024 ** 3));
  const freeRAM = Math.round(os.freemem() / (1024 ** 3));
  const cpuModel = os.cpus()[0]?.model || 'Unknown';
  const platform = os.platform();
  const isMobile = isMobileCPU();

  // Score basé sur RAM DISPONIBLE (critique pour Ollama)
  let score = 0;
  
  // RAM disponible : facteur principal (Ollama charge le modèle en RAM)
  // 3B model = ~2-3 Go, besoin de marge
  if (freeRAM >= 6) {
    score += 40;
  } else if (freeRAM >= 4) {
    score += 30;
  } else if (freeRAM >= 2) {
    score += 15;
  } else {
    score += 5; // RAM critique
  }

  // CPU : cores physiques comptent plus que logiques
  score += Math.min(physicalCores * 8, 30);

  // Pénalité CPU mobile
  if (isMobile) {
    score -= 15;
  }

  // Bonus si beaucoup de RAM totale (peut libérer)
  if (totalRAM >= 16) {
    score += 10;
  }

  // Déterminer le profil
  let profile;
  if (score < 35) {
    profile = 'ECO';
  } else if (score < 55) {
    profile = 'STANDARD';
  } else {
    profile = 'PERFORMANCE';
  }

  // Paramètres Ollama selon profil
  const ollamaConfig = getOllamaConfig(profile, physicalCores, isMobile);

  return {
    profile,
    score: Math.round(score),
    hardware: {
      cpuCores,
      physicalCores,
      cpuModel: cpuModel.substring(0, 50),
      totalRAM,
      freeRAM,
      platform,
      isMobileCPU: isMobile
    },
    ollama: ollamaConfig
  };
}

/**
 * Retourne la config Ollama optimisée selon le profil
 */
function getOllamaConfig(profile, physicalCores, isMobile) {
  // Pour CPU mobile, on réduit encore plus les threads
  const threadMultiplier = isMobile ? 0.5 : 0.65;

  const configs = {
    ECO: {
      num_thread: Math.max(2, Math.floor(physicalCores * 0.5)),
      num_ctx: 1024,           // Minimum pour éviter hallucinations
      num_predict: 700,        // Réponses courtes mais complètes
      temperature: 0.05,       // Plus déterministe
      num_batch: 128,
      repeat_penalty: 1.15,    // Évite les répétitions
      top_k: 20,               // Plus focalisé
      top_p: 0.8,
      description: "Mode économie - RAM/CPU limités"
    },
    STANDARD: {
      num_thread: Math.max(2, Math.floor(physicalCores * threadMultiplier)),
      num_ctx: 1536,           // Contexte modéré
      num_predict: 900,
      temperature: 0.1,
      num_batch: 256,
      repeat_penalty: 1.1,
      top_k: 30,
      top_p: 0.85,
      description: "Mode équilibré"
    },
    PERFORMANCE: {
      num_thread: Math.max(4, physicalCores),
      num_ctx: 2048,           // Contexte étendu
      num_predict: 1200,
      temperature: 0.1,
      num_batch: 512,
      repeat_penalty: 1.1,
      top_k: 40,
      top_p: 0.9,
      description: "Mode performance"
    }
  };

  return configs[profile];
}

/**
 * Sélectionne le meilleur modèle disponible selon la RAM libre
 */
function recommendModel(availableModels, freeRAM) {
  // Priorité selon RAM disponible
  if (freeRAM < 3) {
    // Très peu de RAM : modèle 1B seulement
    const small = availableModels.find(m => m.includes('1b') || m.includes('phi'));
    if (small) return small;
  }

  // RAM suffisante : 3B
  const preferred = [
    'llama3.2:3b',
    'llama3.2:1b',
    'phi3:mini',
    'gemma2:2b'
  ];

  for (const model of preferred) {
    if (availableModels.some(m => m.includes(model.split(':')[0]))) {
      return availableModels.find(m => m.includes(model.split(':')[0]));
    }
  }

  return availableModels[0] || 'llama3.2:3b';
}

module.exports = {
  detectHardwareProfile,
  getOllamaConfig,
  recommendModel
};
