// SOUVERAIN - Project AI Service
// Handles the conversation flow and project generation

export interface ChatMessage {
    id: string;
    sender: 'ai' | 'user';
    text: string;
}

export interface ProjectData {
    title: string;
    description: string;
    context: string;
    process: string;
    results: string;
    tags: string[];
}


// Mock Questions Flow (Fallback)
const QUESTIONS = [
    "J'ai analysé vos documents. Pour commencer, quel était l'objectif principal de ce projet ?",
    "Quels défis majeurs avez-vous rencontrés durant la réalisation ?",
    "Quels outils ou technologies spécifiques avez-vous utilisés ?",
    "Pour finir, quel a été l'impact ou le résultat concret pour le client ?"
];

export const initiateConversation = async (projectType: string, anonymizedContext: string): Promise<ChatMessage> => {
    // System Prompt for the AI
    const systemPrompt = `Tu es un expert portfolio. Ton but est d'interviewer l'utilisateur pour créer une fiche projet "${projectType}".
    
    Contexte issu des documents (ANONYMISÉ, ne pas mentionner les [TOKENS] explicitement sauf si pertinent):
    "${anonymizedContext.slice(0, 2000)}..."
    
    Pose UNE SEULE question à la fois. Sois curieux, professionnel et concis.
    Commence par saluer et poser une première question pour clarifier l'objectif du projet si ce n'est pas clair dans le contexte, sinon demande les défis.`;

    try {
        // @ts-ignore
        const result = await window.electron.invoke('ollama-chat', {
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: "Commence l'interview." }
            ]
        });

        if (result.success && result.message) {
            return {
                id: 'init',
                sender: 'ai',
                text: result.message.content
            };
        }
    } catch (e) {
        console.error("AI Init failed", e);
    }

    // Fallback
    return {
        id: 'init',
        sender: 'ai',
        text: `Bonjour ! Je vois que c'est un projet de type "${projectType}". Je vais vous aider à construire la fiche parfaite. ${QUESTIONS[0]}`
    };
};

export const processUserAnswer = async (history: ChatMessage[], projectType: string, anonymizedContext: string): Promise<ChatMessage | null> => {
    // Construct full history for Ollama
    const systemPrompt = `Tu es un expert portfolio. Interview pour projet "${projectType}".
    Contexte: "${anonymizedContext.slice(0, 500)}...".
    Règles: 
    1. Pose une question à la fois.
    2. Si tu as assez d'infos (Objectif, Défis, Solutions, Résultats), propose de générer la fiche.
    3. Pour finir l'interview, réponds EXACTEMENT: "TERMINÉ" (et rien d'autre).
    `;

    const messages = [
        { role: 'system', content: systemPrompt },
        ...history.map(m => ({
            role: m.sender === 'ai' ? 'assistant' : 'user',
            content: m.text
        }))
    ];

    try {
        // @ts-ignore
        const result = await window.electron.invoke('ollama-chat', { messages });

        if (result.success && result.message) {
            const content = result.message.content;
            
            // Check for termination
            if (content.includes("TERMINÉ")) {
                return null;
            }

            return {
                id: Date.now().toString(),
                sender: 'ai',
                text: content
            };
        }
    } catch (e) {
        console.error("AI Chat failed", e);
    }
    
    // Fallback logic
    const questionIndex = Math.floor(history.length / 2);
    if (questionIndex < QUESTIONS.length) {
        return {
             id: `q-${questionIndex}`,
             sender: 'ai',
             text: QUESTIONS[questionIndex]
        };
    }
    return null;
};

export const generateProjectSheet = async (chatHistory: ChatMessage[]): Promise<ProjectData> => {
    const prompt = `Génère un JSON pour la fiche projet basée sur cette conversation.
    Format attendu:
    {
        "title": "Titre accrocheur",
        "description": "2 phrases max",
        "context": "Contexte client/projet",
        "process": "Démarche et solution",
        "results": "Impact et chiffres clés",
        "tags": ["Tag1", "Tag2", "Tag3"]
    }
    Réponds UNIQUEMENT le JSON.`;

    const messages = [
        ...chatHistory.map(m => ({
             role: m.sender === 'ai' ? 'assistant' : 'user',
             content: m.text
        })),
        { role: 'user', content: prompt }
    ];

    try {
        // @ts-ignore
        const result = await window.electron.invoke('ollama-chat', { messages });
        
        if (result.success && result.message) {
            // Try parse JSON
            const jsonText = result.message.content.replace(/```json/g, '').replace(/```/g, '').trim();
            const start = jsonText.indexOf('{');
            const end = jsonText.lastIndexOf('}');
            if (start !== -1 && end !== -1) {
                return JSON.parse(jsonText.substring(start, end + 1));
            }
        }
    } catch (e) {
        console.error("AI Gen failed", e);
    }

    // Mock Generation based on chat
    return {
        title: "Projet Généré (Fallback)",
        description: "L'IA n'a pas pu générer le résultat, voici un contenu par défaut.",
        context: "Contexte à remplir.",
        process: "Processus à d...",
        results: "Résultats...",
        tags: ["Projet", "Portfolio"]
    };
};
