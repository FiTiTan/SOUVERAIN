# CORRECTION MODULE PORTFOLIO SOUVERAIN

## CONTEXTE

Audit realise le 23 janvier 2026.
Module Portfolio Hub a 65% de conformite avec le Master Plan.
Ce document detaille les corrections a apporter en 3 niveaux de priorite.

Ne pas modifier ce qui fonctionne deja.
Se concentrer sur les ecarts identifies.

---

## PRIORITE 1 - CRITIQUE

Ces corrections sont bloquantes. A faire en premier.

---

### CORRECTION 1.1 - BUG ELECTRON IPC

PROBLEME
Erreur window.electron.invoke is not a function visible dans l interface.
Empeche les appels au main process.

DIAGNOSTIC
Verifier dans src preload ou preload.js que contextBridge expose bien electron.invoke
Verifier que le renderer accede correctement a window.electron

FICHIERS CONCERNES
- electron preload.js ou preload.ts
- electron main.js ou main.ts
- Tout fichier renderer qui appelle window.electron.invoke

CORRECTION ATTENDUE
Le preload doit exposer les methodes IPC via contextBridge

Exemple de preload correct :

const { contextBridge, ipcRenderer } = require electron

contextBridge.exposeInMainWorld electron {
  invoke: (channel, ...args) => ipcRenderer.invoke(channel, ...args),
  on: (channel, callback) => ipcRenderer.on(channel, (event, ...args) => callback(...args)),
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
}

Verifier aussi que webPreferences dans main.js contient :
- contextIsolation: true
- nodeIntegration: false
- preload: chemin vers preload.js

TEST DE VALIDATION
Plus aucune erreur window.electron.invoke is not a function dans la console.
Les appels IPC fonctionnent mediatheque, projets, publication.

---

### CORRECTION 1.2 - ANONYMISATION COMPLETE

PROBLEME ACTUEL
L anonymisation utilise des regex basiques au lieu de NER via Ollama.
Les mappings ne sont pas persistes en base de donnees.
Pas de coherence cross-projet meme personne = tokens differents.

CE QUI EXISTE
- anonymizationService.ts avec fonctions regex
- Table anonymization_maps en base mais non utilisee
- Composant AnonymizationNotice.tsx

CE QUI MANQUE
1. Appel a Ollama pour detection NER des entites
2. Persistance des mappings dans anonymization_maps
3. Coherence cross-projet verification si entite deja connue
4. Option verification avant envoi a l IA

FICHIERS A MODIFIER

src services anonymizationService.ts

Ajouter fonction detectEntitiesWithOllama :

async function detectEntitiesWithOllama(text: string): Promise<DetectedEntity[]>

  const prompt = `
Analyse le texte suivant et identifie toutes les entites sensibles.
Retourne uniquement un JSON valide sans autre texte.

Categories a detecter :
- person : noms de personnes prenoms et noms de famille
- company : noms d entreprises societes marques
- address : adresses completes ou partielles
- email : adresses email
- phone : numeros de telephone
- amount : montants prix budgets avec ou sans devise
- location : villes regions pays lieux specifiques

Format de reponse :
{
  "entities": [
    {"type": "person", "value": "Jean Dupont"},
    {"type": "company", "value": "SARL Martin"}
  ]
}

Texte a analyser :
${text}
`

  const response = await callOllama(prompt)
  return parseEntitiesFromResponse(response)


Ajouter fonction persistMapping :

async function persistMapping(
  portfolioId: string,
  projectId: string | null,
  originalValue: string,
  token: string,
  valueType: string
): Promise<void>

  await window.electron.invoke db-insert-anonymization-map {
    id: generateId(),
    portfolio_id: portfolioId,
    project_id: projectId,
    original_value: originalValue,
    anonymized_token: token,
    value_type: valueType,
    created_at: new Date().toISOString()
  }


Ajouter fonction getExistingToken pour coherence cross-projet :

async function getExistingToken(
  portfolioId: string,
  originalValue: string
): Promise<string | null>

  const existing = await window.electron.invoke db-get-anonymization-by-value {
    portfolioId,
    originalValue
  }
  return existing ? existing.anonymized_token : null


Modifier fonction principale anonymize :

async function anonymize(
  text: string,
  portfolioId: string,
  projectId: string | null
): Promise<{ anonymizedText: string, mappings: AnonymizationMapping[] }>

  // 1. Detecter entites avec Ollama
  const entities = await detectEntitiesWithOllama(text)
  
  // 2. Pour chaque entite verifier si token existe deja
  const mappings = []
  let anonymizedText = text
  
  for (const entity of entities) {
    let token = await getExistingToken(portfolioId, entity.value)
    
    if (!token) {
      // Creer nouveau token
      const count = await getTokenCount(portfolioId, entity.type)
      token = `[${entity.type.toUpperCase()}_${count + 1}]`
      
      // Persister en base
      await persistMapping(portfolioId, projectId, entity.value, token, entity.type)
    }
    
    // Remplacer dans le texte
    anonymizedText = anonymizedText.replaceAll(entity.value, token)
    mappings.push({ original: entity.value, token, type: entity.type })
  }
  
  return { anonymizedText, mappings }


FICHIERS A MODIFIER COTE MAIN PROCESS

electron main.js ou main.ts

Ajouter handlers IPC pour la base anonymization_maps :

ipcMain.handle db-insert-anonymization-map async (event, data) => {
  return database.insertAnonymizationMap(data)
}

ipcMain.handle db-get-anonymization-by-value async (event, { portfolioId, originalValue }) => {
  return database.getAnonymizationByValue(portfolioId, originalValue)
}

ipcMain.handle db-get-token-count async (event, { portfolioId, valueType }) => {
  return database.getTokenCountByType(portfolioId, valueType)
}


FICHIERS A MODIFIER COTE DATABASE

database.cjs ou database_schema_v2.cjs

Ajouter fonctions :

function insertAnonymizationMap(data) {
  const stmt = db.prepare(`
    INSERT INTO anonymization_maps (id, portfolio_id, project_id, original_value, anonymized_token, value_type, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `)
  return stmt.run(data.id, data.portfolio_id, data.project_id, data.original_value, data.anonymized_token, data.value_type, data.created_at)
}

function getAnonymizationByValue(portfolioId, originalValue) {
  const stmt = db.prepare(`
    SELECT * FROM anonymization_maps 
    WHERE portfolio_id = ? AND original_value = ?
    LIMIT 1
  `)
  return stmt.get(portfolioId, originalValue)
}

function getTokenCountByType(portfolioId, valueType) {
  const stmt = db.prepare(`
    SELECT COUNT(*) as count FROM anonymization_maps 
    WHERE portfolio_id = ? AND value_type = ?
  `)
  const result = stmt.get(portfolioId, valueType)
  return result.count
}


COMPOSANT VERIFICATION OPTIONNELLE

Ajouter dans src components portfolio anonymization AnonymizationPreview.tsx

Composant qui affiche les entites detectees et leurs tokens avant envoi a l IA.
Permet a l utilisateur de valider ou modifier.

Props :
- mappings: AnonymizationMapping[]
- onConfirm: () => void
- onEdit: (index: number, newValue: string) => void


TEST DE VALIDATION
1. Creer un projet avec texte contenant noms et montants
2. Verifier que Ollama detecte les entites
3. Verifier que les mappings sont en base anonymization_maps
4. Creer un second projet avec la meme personne
5. Verifier que le meme token est reutilise

---

### CORRECTION 1.3 - PALETTES DE STYLE 6 PERSONNALITES

PROBLEME ACTUEL
Le StyleSelector utilise les anciens styles techniques bento classic gallery minimal.
Pas les 6 palettes de personnalite definies dans l addendum.
Pas de suggestion IA.

CE QUI DOIT REMPLACER L EXISTANT

6 palettes :
1. MODERNE - Digital native, dynamique, connecte
2. CLASSIQUE - Expert etabli, sobre, structure
3. AUTHENTIQUE - Artisan, chaleureux, terrain
4. ARTISTIQUE - Creatif, images dominantes
5. VITRINE - Commerce local, pratique, accueillant
6. FORMEL - Institutionnel, rigoureux, sobre

FICHIER A CREER

src config stylePalettes.ts

export const STYLE_PALETTES = {
  moderne: {
    id: "moderne",
    name: "Moderne",
    tagline: "Dynamique et connecte",
    idealFor: "Freelance tech, startup, creatif digital",
    
    designTokens: {
      typography: {
        headingFont: "Inter",
        headingWeight: "700",
        bodyFont: "Inter",
        bodyWeight: "400",
        baseSize: "16px"
      },
      colors: {
        primary: "#3b82f6",
        primaryLight: "#60a5fa",
        secondary: "#f1f5f9",
        accent: "#8b5cf6",
        background: "#ffffff",
        text: "#0f172a",
        textSecondary: "#64748b"
      },
      spacing: {
        sectionGap: "4rem",
        contentPadding: "2rem",
        cardPadding: "1.5rem"
      },
      borders: {
        radius: "1rem"
      },
      shadows: {
        card: "0 4px 20px rgba(0,0,0,0.08)"
      },
      animations: {
        enabled: true
      }
    },
    
    layoutPreference: {
      hero: "hero_split",
      projects: "bento_grid",
      accounts: "cards_carousel"
    }
  },
  
  classique: {
    id: "classique",
    name: "Classique",
    tagline: "Sobre et structure",
    idealFor: "Consultant, expert, profession liberale",
    
    designTokens: {
      typography: {
        headingFont: "Playfair Display",
        headingWeight: "600",
        bodyFont: "Source Sans Pro",
        bodyWeight: "400",
        baseSize: "16px"
      },
      colors: {
        primary: "#1e3a5f",
        primaryLight: "#2d4a6f",
        secondary: "#f8f9fa",
        accent: "#8b7355",
        background: "#ffffff",
        text: "#1a1a1a",
        textSecondary: "#6b7280"
      },
      spacing: {
        sectionGap: "3rem",
        contentPadding: "2rem",
        cardPadding: "1.5rem"
      },
      borders: {
        radius: "0.25rem"
      },
      shadows: {
        card: "0 1px 3px rgba(0,0,0,0.1)"
      },
      animations: {
        enabled: false
      }
    },
    
    layoutPreference: {
      hero: "hero_centered",
      projects: "cards_vertical",
      accounts: "list_simple"
    }
  },
  
  authentique: {
    id: "authentique",
    name: "Authentique",
    tagline: "Chaleureux et terrain",
    idealFor: "Artisan, metier manuel, service local",
    
    designTokens: {
      typography: {
        headingFont: "Nunito",
        headingWeight: "700",
        bodyFont: "Open Sans",
        bodyWeight: "400",
        baseSize: "16px"
      },
      colors: {
        primary: "#b45309",
        primaryLight: "#d97706",
        secondary: "#fef3c7",
        accent: "#15803d",
        background: "#fffbeb",
        text: "#292524",
        textSecondary: "#57534e"
      },
      spacing: {
        sectionGap: "3.5rem",
        contentPadding: "2rem",
        cardPadding: "1.5rem"
      },
      borders: {
        radius: "1rem"
      },
      shadows: {
        card: "0 2px 8px rgba(0,0,0,0.08)"
      },
      animations: {
        enabled: false
      }
    },
    
    layoutPreference: {
      hero: "hero_fullwidth_photo",
      projects: "cards_comfortable",
      accounts: "list_icons"
    }
  },
  
  artistique: {
    id: "artistique",
    name: "Artistique",
    tagline: "L image avant tout",
    idealFor: "Photographe, artiste, architecte",
    
    designTokens: {
      typography: {
        headingFont: "Cormorant Garamond",
        headingWeight: "300",
        bodyFont: "Lato",
        bodyWeight: "300",
        baseSize: "15px"
      },
      colors: {
        primary: "#171717",
        primaryLight: "#404040",
        secondary: "#fafafa",
        accent: "#a3a3a3",
        background: "#ffffff",
        text: "#171717",
        textSecondary: "#737373"
      },
      spacing: {
        sectionGap: "5rem",
        contentPadding: "1rem",
        cardPadding: "0"
      },
      borders: {
        radius: "0"
      },
      shadows: {
        card: "none"
      },
      animations: {
        enabled: true
      }
    },
    
    layoutPreference: {
      hero: "hero_image_only",
      projects: "masonry",
      accounts: "minimal_footer"
    }
  },
  
  vitrine: {
    id: "vitrine",
    name: "Vitrine",
    tagline: "Pratique et accueillant",
    idealFor: "Commerce local, restaurant, boutique",
    
    designTokens: {
      typography: {
        headingFont: "Poppins",
        headingWeight: "600",
        bodyFont: "Poppins",
        bodyWeight: "400",
        baseSize: "16px"
      },
      colors: {
        primary: "#dc2626",
        primaryLight: "#ef4444",
        secondary: "#fef2f2",
        accent: "#16a34a",
        background: "#ffffff",
        text: "#1f2937",
        textSecondary: "#6b7280"
      },
      spacing: {
        sectionGap: "2.5rem",
        contentPadding: "1.5rem",
        cardPadding: "1rem"
      },
      borders: {
        radius: "0.75rem"
      },
      shadows: {
        card: "0 2px 10px rgba(0,0,0,0.1)"
      },
      animations: {
        enabled: false
      }
    },
    
    layoutPreference: {
      hero: "hero_ambiance",
      projects: "gallery_products",
      accounts: "social_bar",
      infos: "sticky_practical"
    }
  },
  
  formel: {
    id: "formel",
    name: "Formel",
    tagline: "Institutionnel et rigoureux",
    idealFor: "Notaire, cabinet etabli, institution",
    
    designTokens: {
      typography: {
        headingFont: "Libre Baskerville",
        headingWeight: "700",
        bodyFont: "Source Serif Pro",
        bodyWeight: "400",
        baseSize: "16px"
      },
      colors: {
        primary: "#1e3a5f",
        primaryLight: "#2d4a6f",
        secondary: "#f1f5f9",
        accent: "#b8860b",
        background: "#ffffff",
        text: "#111827",
        textSecondary: "#4b5563"
      },
      spacing: {
        sectionGap: "3rem",
        contentPadding: "2.5rem",
        cardPadding: "2rem"
      },
      borders: {
        radius: "0"
      },
      shadows: {
        card: "none"
      },
      animations: {
        enabled: false
      }
    },
    
    layoutPreference: {
      hero: "hero_minimal_text",
      projects: "sections_numbered",
      accounts: "list_formal"
    }
  }
}

export type StylePaletteId = keyof typeof STYLE_PALETTES


FICHIER A MODIFIER

src components portfolio styles StyleSelector.tsx

Remplacer completement le contenu pour afficher les 6 palettes.

Chaque palette affichee avec :
- Nom
- Tagline
- Ideal pour
- Preview miniature ou couleurs dominantes
- Selection au clic

Interface :

Quelle ambiance vous correspond ?
Choisissez une palette basee sur votre personnalite

[Carte Moderne]    [Carte Classique]    [Carte Authentique]
[Carte Artistique] [Carte Vitrine]      [Carte Formel]


FICHIER A MODIFIER

src services styleService.ts

Remplacer la fonction analyzeContentForStyle pour utiliser Ollama :

async function suggestStyleWithOllama(
  externalAccounts: ExternalAccount[],
  intentionForm: IntentionForm | null,
  projectsCount: number,
  mediaStats: { images: number, videos: number, documents: number }
): Promise<{ suggestedStyle: StylePaletteId, confidence: number, reasoning: string }>

  const prompt = `
Analyse le profil suivant et suggere la palette de style la plus adaptee.

Palettes disponibles :
- moderne : freelance tech, startup, creatif digital, dynamique et connecte
- classique : consultant, expert, profession liberale, sobre et serieux
- authentique : artisan, metier manuel, service local, chaleureux et terrain
- artistique : photographe, artiste, architecte, images dominantes
- vitrine : commerce local, restaurant, boutique, pratique et accueillant
- formel : notaire, institution, cabinet etabli, rigoureux et sobre

Profil a analyser :
- Comptes externes : ${externalAccounts.map(a => a.platform_type).join(", ") || "aucun"}
- Objectif declare : ${intentionForm?.objective || "non renseigne"}
- Type de contenu : ${intentionForm?.contentType || "non renseigne"}
- Nombre de projets : ${projectsCount}
- Medias : ${mediaStats.images} images, ${mediaStats.videos} videos, ${mediaStats.documents} documents

Reponds uniquement en JSON :
{
  "suggestedStyle": "authentique",
  "confidence": 0.85,
  "reasoning": "Explication courte"
}
`

  const response = await callOllama(prompt)
  return JSON.parse(response)


TEST DE VALIDATION
1. Ouvrir le selecteur de style
2. Voir les 6 palettes avec leurs descriptions
3. Selectionner une palette
4. Verifier que le style est enregistre dans portfolios.selected_style
5. Tester la suggestion IA si formulaire intention rempli

---

## PRIORITE 2 - IMPORTANT

Ces corrections completent le flow. A faire apres Priorite 1.

---

### CORRECTION 2.1 - FORMULAIRE INTENTION

PROBLEME
La colonne intention_form_json existe en base mais aucune UI pour la remplir.

FICHIERS A CREER

src components portfolio intention IntentionForm.tsx

Formulaire avec 5 questions :

Question 1 - Objectif principal
Quel est l objectif principal de ce portfolio ?
- Decrocher des missions clients
- Trouver un emploi salarie
- Montrer un savoir-faire technique
- Vendre des services locaux
- Developper ma notoriete en ligne
- Documenter mon parcours
- Autre

Question 2 - Type de contenu
Quel type de contenu allez-vous principalement montrer ?
- Realisations visuelles photos designs
- Projets techniques code applications
- Prestations de service chantiers interventions
- Contenus redactionnels articles etudes
- Mix de plusieurs types

Question 3 - Infos pratiques
Quelles informations pratiques souhaitez-vous afficher ?
Selection multiple :
- Horaires d ouverture
- Localisation et adresse
- Zone d intervention
- Tarifs indicatifs
- Moyens de paiement
- Moyens de contact uniquement
- Aucune je prefere rester discret

Question 4 - Ton souhaite
Quel ton souhaitez-vous pour votre portfolio ?
- Professionnel et sobre
- Creatif et dynamique
- Chaleureux et accessible
- Technique et precis
- Je laisse l IA decider

Question 5 - Complement optionnel
Y a-t-il autre chose que l IA devrait savoir ?
Textarea libre


src components portfolio intention IntentionSummary.tsx

Resume des reponses affiche apres validation.
Permet de modifier une reponse.


FICHIER A CREER

src services intentionService.ts

export async function saveIntention(portfolioId: string, form: IntentionForm): Promise<void> {
  await window.electron.invoke("db-update-portfolio-intention", {
    portfolioId,
    intentionFormJson: JSON.stringify(form)
  })
}

export async function getIntention(portfolioId: string): Promise<IntentionForm | null> {
  const result = await window.electron.invoke("db-get-portfolio-intention", portfolioId)
  return result ? JSON.parse(result.intention_form_json) : null
}


OU INTEGRER LE FORMULAIRE

Option A : Dans les parametres du portfolio PortfolioSettingsModal.tsx
Option B : Au premier acces au portfolio si intention_form_json est null
Option C : Onglet dedie Profil ou Mon identite

Recommandation : Option B au premier acces puis modifiable dans les parametres.

TEST DE VALIDATION
1. Creer un nouveau portfolio
2. Le formulaire intention apparait au premier acces
3. Remplir les 5 questions
4. Verifier que intention_form_json est rempli en base
5. La suggestion de style utilise ces reponses

---

### CORRECTION 2.2 - SUGGESTION IA DE STYLE

PROBLEME
La suggestion de style existe en heuristique mais pas via Ollama.

DEPENDANCE
Necessite Correction 2.1 formulaire intention.
Necessite Correction 1.3 palettes de style.

FICHIER A MODIFIER

src components portfolio styles StyleSelector.tsx

Ajouter un bloc de suggestion au-dessus des palettes :

Si l IA a une suggestion :

Je vous suggere le style [NOM]

[Reasoning de l IA]

[Accepter ce style]    [Voir tous les styles]


FICHIER A MODIFIER

src services styleService.ts

La fonction suggestStyleWithOllama est deja decrite dans Correction 1.3.
S assurer qu elle est appelee au chargement du StyleSelector.

TEST DE VALIDATION
1. Remplir le formulaire intention
2. Ajouter quelques comptes externes
3. Ouvrir le selecteur de style
4. La suggestion IA apparait avec son raisonnement
5. Accepter ou choisir manuellement

---

### CORRECTION 2.3 - PREVIEW DEDIES

PROBLEME
L export fonctionne mais il n y a pas de preview dedies avant export.

FICHIERS A CREER

src components portfolio preview PreviewProject.tsx

Modal ou page plein ecran affichant un projet avec la palette appliquee.
Boutons : Fermer, Exporter PDF, Exporter HTML

Props :
- projectId: string
- paletteId: StylePaletteId


src components portfolio preview PreviewPortfolio.tsx

Modal ou page plein ecran affichant le portfolio complet.
Navigation entre sections.
Boutons : Fermer, Exporter PDF, Exporter HTML, Publier

Props :
- portfolioId: string
- paletteId: StylePaletteId


src components portfolio preview PreviewFrame.tsx

Iframe ou conteneur qui affiche le HTML genere.
Isole les styles du preview de l app principale.


INTEGRATION

Dans ProjectCard.tsx ajouter bouton Apercu qui ouvre PreviewProject.
Dans PortfolioHub.tsx ajouter bouton Apercu portfolio qui ouvre PreviewPortfolio.

TEST DE VALIDATION
1. Cliquer Apercu sur un projet
2. Le projet s affiche avec la palette
3. Cliquer Exporter PDF depuis le preview
4. Le PDF est genere correctement

---

## PRIORITE 3 - FINALISATION

Ces corrections finalisent le module. A faire en dernier.

---

### CORRECTION 3.1 - AGREGATEUR COMPTES 80 PLATEFORMES

PROBLEME
L UI des comptes externes est basique.
Pas de categorisation.
Pas la liste complete des 80 plateformes.

FICHIER A CREER

src config externalPlatforms.ts

export const PLATFORMS = {
  social: {
    label: "Reseaux sociaux",
    platforms: [
      { id: "instagram", name: "Instagram", icon: "instagram", color: "#E4405F" },
      { id: "tiktok", name: "TikTok", icon: "tiktok", color: "#000000" },
      { id: "pinterest", name: "Pinterest", icon: "pinterest", color: "#BD081C" },
      { id: "facebook", name: "Facebook", icon: "facebook", color: "#1877F2" },
      { id: "twitter", name: "X Twitter", icon: "twitter", color: "#1DA1F2" },
      { id: "threads", name: "Threads", icon: "threads", color: "#000000" },
      { id: "snapchat", name: "Snapchat", icon: "snapchat", color: "#FFFC00" }
    ]
  },
  professional: {
    label: "Plateformes pro",
    platforms: [
      { id: "linkedin", name: "LinkedIn", icon: "linkedin", color: "#0A66C2" },
      { id: "malt", name: "Malt", icon: "malt", color: "#FC5757" },
      { id: "upwork", name: "Upwork", icon: "upwork", color: "#14A800" },
      { id: "fiverr", name: "Fiverr", icon: "fiverr", color: "#1DBF73" },
      { id: "welcometothejungle", name: "Welcome to the Jungle", icon: "wtj", color: "#FFCD00" }
    ]
  },
  creative: {
    label: "Showcases creatifs",
    platforms: [
      { id: "behance", name: "Behance", icon: "behance", color: "#1769FF" },
      { id: "dribbble", name: "Dribbble", icon: "dribbble", color: "#EA4C89" },
      { id: "artstation", name: "ArtStation", icon: "artstation", color: "#13AFF0" },
      { id: "deviantart", name: "DeviantArt", icon: "deviantart", color: "#00E59B" }
    ]
  },
  technical: {
    label: "Espaces techniques",
    platforms: [
      { id: "github", name: "GitHub", icon: "github", color: "#181717" },
      { id: "gitlab", name: "GitLab", icon: "gitlab", color: "#FC6D26" },
      { id: "stackoverflow", name: "Stack Overflow", icon: "stackoverflow", color: "#F58025" },
      { id: "codepen", name: "CodePen", icon: "codepen", color: "#000000" },
      { id: "kaggle", name: "Kaggle", icon: "kaggle", color: "#20BEFF" }
    ]
  },
  content: {
    label: "Contenu et media",
    platforms: [
      { id: "medium", name: "Medium", icon: "medium", color: "#000000" },
      { id: "substack", name: "Substack", icon: "substack", color: "#FF6719" },
      { id: "youtube", name: "YouTube", icon: "youtube", color: "#FF0000" },
      { id: "vimeo", name: "Vimeo", icon: "vimeo", color: "#1AB7EA" },
      { id: "twitch", name: "Twitch", icon: "twitch", color: "#9146FF" }
    ]
  },
  commerce: {
    label: "Commerce et local",
    platforms: [
      { id: "googlebusiness", name: "Google Business", icon: "google", color: "#4285F4" },
      { id: "tripadvisor", name: "TripAdvisor", icon: "tripadvisor", color: "#00AF87" },
      { id: "yelp", name: "Yelp", icon: "yelp", color: "#D32323" },
      { id: "etsy", name: "Etsy", icon: "etsy", color: "#F56400" },
      { id: "shopify", name: "Shopify", icon: "shopify", color: "#96BF48" }
    ]
  },
  photo: {
    label: "Photo",
    platforms: [
      { id: "500px", name: "500px", icon: "500px", color: "#0099E5" },
      { id: "flickr", name: "Flickr", icon: "flickr", color: "#0063DC" },
      { id: "unsplash", name: "Unsplash", icon: "unsplash", color: "#000000" }
    ]
  },
  music: {
    label: "Musique",
    platforms: [
      { id: "soundcloud", name: "SoundCloud", icon: "soundcloud", color: "#FF5500" },
      { id: "bandcamp", name: "Bandcamp", icon: "bandcamp", color: "#629AA9" },
      { id: "spotify", name: "Spotify", icon: "spotify", color: "#1DB954" }
    ]
  }
}

Completer avec toutes les plateformes du Master Plan.


FICHIER A MODIFIER

src components portfolio accounts AccountsModule.tsx

Afficher les plateformes par categorie.
Permettre la recherche.
Afficher l icone et la couleur de chaque plateforme.

Interface :

Vos comptes externes

[Rechercher une plateforme...]

Reseaux sociaux
[Instagram] [TikTok] [Pinterest] ...

Plateformes pro
[LinkedIn] [Malt] [Upwork] ...

etc.


TEST DE VALIDATION
1. Ouvrir l onglet Comptes
2. Voir toutes les categories
3. Rechercher une plateforme
4. Ajouter un compte avec son URL
5. Le compte apparait dans la liste avec son icone

---

### CORRECTION 3.2 - PUBLICATION CLOUDFLARE

PROBLEME
Le service publishService.ts existe mais l integration Cloudflare n est pas validee.
Erreur potentielle window.electron.invoke.

VERIFICATION A FAIRE

1. Verifier que publishService.ts appelle correctement les endpoints Cloudflare
2. Verifier que le Worker Cloudflare est deploye et fonctionnel
3. Verifier la gestion des erreurs reseau
4. Verifier la restriction Premium

FICHIERS A VERIFIER

src services publishService.ts
electron main.js handlers de publication

SI CLOUDFLARE NON CONFIGURE

Creer un Worker Cloudflare minimal :

export default {
  async fetch(request, env) {
    if (request.method === "POST") {
      const formData = await request.formData()
      const slug = formData.get("slug")
      const html = formData.get("html")
      
      // Upload vers R2
      await env.PORTFOLIO_BUCKET.put(`${slug}/index.html`, html, {
        httpMetadata: { contentType: "text/html" }
      })
      
      return new Response(JSON.stringify({
        success: true,
        url: `https://${slug}.souverain.io`
      }), { headers: { "Content-Type": "application/json" } })
    }
    
    return new Response("Method not allowed", { status: 405 })
  }
}


TEST DE VALIDATION
1. Creer un portfolio avec du contenu
2. Cliquer Publier
3. Choisir un slug
4. La publication reussit
5. L URL est accessible

---

### CORRECTION 3.3 - OCR IMAGES MEDIATHEQUE

PROBLEME
Les images sont importees mais le texte n est pas extrait OCR.
La colonne extracted_text manque dans mediatheque_items.

CORRECTION BASE DE DONNEES

ALTER TABLE mediatheque_items ADD COLUMN extracted_text TEXT


FICHIER A MODIFIER

src services assetService.ts ou mediathequeService.ts

Ajouter fonction extractTextFromImage :

async function extractTextFromImage(imagePath: string): Promise<string> {
  // Option 1 : Ollama vision
  const base64 = await readFileAsBase64(imagePath)
  const prompt = "Extract all text visible in this image. Return only the text, nothing else."
  const response = await callOllamaVision(prompt, base64)
  return response
  
  // Option 2 : Tesseract.js si Ollama vision indisponible
}


Appeler cette fonction apres l import d une image.
Stocker le resultat dans extracted_text.

TEST DE VALIDATION
1. Importer une image contenant du texte
2. Verifier que extracted_text est rempli en base
3. Le texte extrait peut etre utilise pour la recherche et l anonymisation

---

## ORDRE D EXECUTION

JOUR 1
- Correction 1.1 Bug Electron IPC

JOUR 2-3
- Correction 1.2 Anonymisation complete

JOUR 4
- Correction 1.3 Palettes de style

JOUR 5
- Correction 2.1 Formulaire intention

JOUR 6
- Correction 2.2 Suggestion IA de style
- Correction 2.3 Preview dedies

JOUR 7-8
- Correction 3.1 Agregateur comptes
- Correction 3.2 Publication Cloudflare
- Correction 3.3 OCR images

JOUR 9
- Tests complets
- Fix des bugs restants

---

## VALIDATION FINALE

Quand toutes les corrections sont faites :

1. Creer un nouveau portfolio
2. Remplir le formulaire intention
3. Importer des fichiers dans la mediatheque
4. Creer un projet via le wizard IA
5. Verifier l anonymisation en base
6. Choisir une palette de style avec suggestion IA
7. Ajouter des comptes externes
8. Preview du portfolio
9. Exporter en PDF et HTML
10. Publier en ligne

Si tout fonctionne le module Portfolio est complet.

---

FIN DU BRIEF DE CORRECTION
