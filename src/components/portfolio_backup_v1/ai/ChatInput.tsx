import React, { useState, useRef } from 'react';
import type { KeyboardEvent } from 'react';
import { useTheme } from '../../../ThemeContext';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  disabled = false,
  placeholder = 'Écrivez votre réponse...'
}) => {
  const { theme } = useTheme();
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (input.trim() && !disabled) {
      onSend(input);
      setInput('');
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  return (
    <div style={{
      position: 'sticky',
      bottom: 0,
      padding: '1rem',
      backgroundColor: theme.bg.primary,
      borderTop: `1px solid ${theme.border.light}`,
      zIndex: 10
    }}>
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        display: 'flex',
        gap: '0.75rem',
        alignItems: 'flex-end'
      }}>
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          style={{
            flex: 1,
            padding: '0.875rem 1rem',
            fontSize: '0.95rem',
            lineHeight: '1.5',
            border: `2px solid ${disabled ? theme.border.light : theme.border.default}`,
            borderRadius: '12px',
            backgroundColor: theme.bg.secondary,
            color: theme.text.primary,
            resize: 'none',
            outline: 'none',
            transition: 'border-color 0.2s',
            fontFamily: 'inherit',
            minHeight: '44px',
            maxHeight: '120px'
          }}
          onFocus={(e) => {
            if (!disabled) {
              e.target.style.borderColor = theme.accent.primary;
            }
          }}
          onBlur={(e) => {
            e.target.style.borderColor = theme.border.default;
          }}
        />

        {/* Send Button */}
        <button
          onClick={handleSend}
          disabled={!input.trim() || disabled}
          style={{
            padding: '0.875rem 1.5rem',
            backgroundColor: input.trim() && !disabled ? theme.accent.primary : theme.border.light,
            color: input.trim() && !disabled ? '#fff' : theme.text.tertiary,
            border: 'none',
            borderRadius: '12px',
            fontSize: '0.95rem',
            fontWeight: 600,
            cursor: input.trim() && !disabled ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap',
            height: '44px'
          }}
          onMouseEnter={(e) => {
            if (input.trim() && !disabled) {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          Envoyer
        </button>
      </div>

      {/* Hint */}
      <div style={{
        maxWidth: '900px',
        margin: '0.5rem auto 0',
        fontSize: '0.75rem',
        color: theme.text.tertiary,
        textAlign: 'center'
      }}>
        Appuyez sur Entrée pour envoyer, Maj+Entrée pour une nouvelle ligne
      </div>
    </div>
  );
};
