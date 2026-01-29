import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../../ThemeContext';
import { useAIChat } from '../../../hooks/useAIChat';
import { AIMessage } from './AIMessage';
import { UserMessage } from './UserMessage';
import { ChatInput } from './ChatInput';
import {
  askMPFQuestion,
  startMPFConversation,
  type MPFChatContext
} from '../../../services/portfolioAIService';

interface PortfolioAIChatProps {
  portfolioId: string;
  onComplete: () => void;
  onClose: () => void;
}

export const PortfolioAIChat: React.FC<PortfolioAIChatProps> = ({
  portfolioId,
  onComplete,
  onClose
}) => {
  const { theme } = useTheme();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [context, setContext] = React.useState<MPFChatContext | null>(null);

  // Charger le contexte
  useEffect(() => {
    const loadContext = async () => {
      try {
        // @ts-ignore
        const portfolioResult = await window.electron.portfolio.getAll();
        // @ts-ignore
        const projectsResult = await window.electron.invoke('db-get-projects', portfolioId);
        // @ts-ignore
        const accountsResult = await window.electron.invoke('db-get-external-accounts', portfolioId);
        // @ts-ignore
        const mediaResult = await window.electron.invoke('db-get-mediatheque-items', portfolioId);

        const portfolio = portfolioResult.success
          ? portfolioResult.portfolios.find((p: any) => p.id === portfolioId)
          : null;

        const projects = projectsResult.success ? projectsResult.projects : [];
        const accounts = accountsResult.success ? accountsResult.accounts : [];
        const media = mediaResult.success ? mediaResult.items : [];

        setContext({
          portfolioId,
          currentPortfolio: portfolio,
          projectsCount: projects.length,
          highlightsCount: projects.filter((p: any) => p.is_highlight).length,
          accountsCount: accounts.length,
          mediaStats: {
            images: media.filter((m: any) => m.file_type === 'image').length,
            videos: media.filter((m: any) => m.file_type === 'video').length,
            documents: media.filter((m: any) => m.file_type === 'document').length
          }
        });
      } catch (error) {
        console.error('[PortfolioAIChat] Failed to load context:', error);
      }
    };

    loadContext();
  }, [portfolioId]);

  // Hook chat
  const { messages, isTyping, sendMessage, addMessage } = useAIChat(
    async (userMessage, history) => {
      if (!context) throw new Error('Context not loaded');
      return await askMPFQuestion(userMessage, history, context);
    },
    context,
    {
      onResponseReceived: (response) => {
        if (response.data?.completed) {
          // Le questionnaire est terminé
          setTimeout(() => {
            onComplete();
          }, 2000);
        }
      }
    }
  );

  // Démarrer la conversation au montage
  useEffect(() => {
    if (context && messages.length === 0) {
      const welcome = startMPFConversation();
      addMessage({
        role: 'assistant',
        content: welcome.message
      });
    }
  }, [context, messages.length, addMessage]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!context) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        backgroundColor: theme.bg.primary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center', color: theme.text.secondary }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏳</div>
          <p>Préparation du chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      backgroundColor: theme.bg.primary,
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        padding: '1.5rem 2rem',
        borderBottom: `1px solid ${theme.border.light}`,
        backgroundColor: theme.bg.secondary,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h2 style={{
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: 700,
            color: theme.text.primary
          }}>
            💬 Personnalisez votre portfolio
          </h2>
          <p style={{
            margin: '0.25rem 0 0 0',
            fontSize: '0.9rem',
            color: theme.text.secondary
          }}>
            Répondez aux questions pour créer un portfolio qui vous ressemble
          </p>
        </div>
        <button
          onClick={onClose}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: 'transparent',
            border: `1px solid ${theme.border.default}`,
            borderRadius: '8px',
            color: theme.text.secondary,
            cursor: 'pointer',
            fontSize: '0.9rem',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.bg.tertiary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          Fermer
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '2rem',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          maxWidth: '900px',
          margin: '0 auto',
          width: '100%'
        }}>
          {messages.map((message) => (
            message.role === 'assistant'
              ? <AIMessage key={message.id} message={message} />
              : <UserMessage key={message.id} message={message} />
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div style={{
              display: 'flex',
              justifyContent: 'flex-start',
              marginBottom: '1rem'
            }}>
              <div style={{
                display: 'flex',
                gap: '0.75rem',
                alignItems: 'flex-start'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${theme.accent.primary}, ${theme.accent.secondary})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1rem'
                }}>
                  ✨
                </div>
                <div style={{
                  backgroundColor: theme.bg.secondary,
                  border: `1px solid ${theme.border.light}`,
                  borderRadius: '12px',
                  padding: '0.875rem 1rem',
                  display: 'flex',
                  gap: '4px'
                }}>
                  <div className="typing-dot" style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: theme.text.tertiary,
                    animation: 'typing 1.4s infinite'
                  }} />
                  <div className="typing-dot" style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: theme.text.tertiary,
                    animation: 'typing 1.4s infinite 0.2s'
                  }} />
                  <div className="typing-dot" style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: theme.text.tertiary,
                    animation: 'typing 1.4s infinite 0.4s'
                  }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <ChatInput
        onSend={sendMessage}
        disabled={isTyping}
        placeholder="Écrivez votre réponse..."
      />

      {/* Animations CSS */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.7;
          }
          30% {
            transform: translateY(-8px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};
