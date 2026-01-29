import { useState, useCallback, useRef, useEffect } from 'react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  data?: any; // Données structurées suggérées par l'IA
}

interface UseAIChatOptions {
  onMessageSent?: (message: string) => void;
  onResponseReceived?: (response: ChatMessage) => void;
  initialMessages?: ChatMessage[];
}

export function useAIChat(
  serviceFunction: (userMessage: string, history: ChatMessage[], context: any) => Promise<any>,
  context: any,
  options: UseAIChatOptions = {}
) {
  const [messages, setMessages] = useState<ChatMessage[]>(options.initialMessages || []);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messageIdCounter = useRef(0);

  const generateMessageId = () => {
    messageIdCounter.current += 1;
    return `msg-${Date.now()}-${messageIdCounter.current}`;
  };

  const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: generateMessageId(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    setError(null);

    // Add user message
    const userMessage = addMessage({
      role: 'user',
      content: content.trim()
    });

    options.onMessageSent?.(content);

    // Show typing indicator
    setIsTyping(true);

    try {
      // Call AI service
      const response = await serviceFunction(content, messages, context);

      // Add AI response
      const aiMessage = addMessage({
        role: 'assistant',
        content: response.message || response.content,
        data: response.suggestedData || response.data
      });

      options.onResponseReceived?.(aiMessage);
    } catch (err) {
      console.error('[useAIChat] Error:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      
      // Add error message
      addMessage({
        role: 'assistant',
        content: "Désolé, j'ai rencontré une erreur. Pouvez-vous reformuler votre réponse ?"
      });
    } finally {
      setIsTyping(false);
    }
  }, [messages, context, serviceFunction, addMessage, options]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const retryLastMessage = useCallback(() => {
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (lastUserMessage) {
      // Remove messages after last user message
      const index = messages.findIndex(m => m.id === lastUserMessage.id);
      setMessages(messages.slice(0, index));
      // Resend
      sendMessage(lastUserMessage.content);
    }
  }, [messages, sendMessage]);

  return {
    messages,
    isTyping,
    error,
    sendMessage,
    clearMessages,
    retryLastMessage,
    addMessage
  };
}
