import React, { useState, useEffect, useRef } from 'react';
import type { WizardState } from '../ProjectCreationWizard';
import { useTheme } from '../../../../../ThemeContext';
import { initiateConversation, processUserAnswer, generateProjectSheet, type ChatMessage } from '../../../../../services/projectAIService';

interface Step4Props {
    context: WizardState;
    onComplete: (data: any) => void;
}

export const Step4_AIChat: React.FC<Step4Props> = ({ context, onComplete }) => {
    const { mode } = useTheme();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // Init Chat
    useEffect(() => {
        const start = async () => {
            // @ts-ignore - WizardState uses any for anonymizedContent, but we accept it
            const textContext = context.anonymizedContent?.anonymizedText || '';
            const msg = await initiateConversation(context.projectType, textContext);
            setMessages([msg]);
            setIsTyping(false);
        };
        start();
    }, []);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        // User Message
        const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', text: inputValue };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        // Process Answer with History + Context
        // @ts-ignore
        const textContext = context.anonymizedContent?.anonymizedText || '';
        const response = await processUserAnswer([...messages, userMsg], context.projectType, textContext);
        
        if (response) {
            setMessages(prev => [...prev, response]);
            setIsTyping(false);
        } else {
            // End of conversation -> Generate
            setIsTyping(false);
            setIsGenerating(true);
            const projectData = await generateProjectSheet([...messages, userMsg]);
            onComplete(projectData);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    if (isGenerating) {
        return (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
                <div className="text-4xl animate-bounce">✨</div>
                <h3 className="text-xl font-bold">L'IA rédige votre fiche projet...</h3>
                <p className="opacity-60">Rédaction du contexte, structuration des résultats et choix des tags.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto space-y-4 p-4">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-4 rounded-xl shadow-sm text-sm leading-relaxed
                            ${msg.sender === 'user' 
                                ? 'bg-blue-600 text-white rounded-br-none' 
                                : mode === 'dark' ? 'bg-[#252528] text-gray-100 rounded-bl-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}
                        `}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className={`p-4 rounded-xl rounded-bl-none text-sm
                            ${mode === 'dark' ? 'bg-[#252528]' : 'bg-gray-100'}
                        `}>
                            <span className="dot-flashing">...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className={`p-4 border-t ${mode === 'dark' ? 'border-[#333]' : 'border-gray-200'}`}>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Répondez à l'IA..."
                        autoFocus
                        disabled={isTyping}
                        className={`flex-1 p-3 rounded-lg border outline-none transition-colors
                            ${mode === 'dark' ? 'bg-[#0A0A0B] border-[#333] text-white' : 'bg-white border-gray-300'}
                            focus:border-blue-500
                        `}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isTyping}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 rounded-lg font-bold transition-colors"
                    >
                        Envoyer
                    </button>
                </div>
            </div>
        </div>
    );
};
