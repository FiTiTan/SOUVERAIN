import React, { useState, useRef, useEffect } from 'react';
import { AiSparkleIcon } from '../icons/AiSparkleIcon';
import { callDeepSeekRewrite } from '../../services/aiRewriteService';
import './AiRewriteWrapper.css';

interface AiRewriteWrapperProps {
  fieldId: string;
  fieldType: 'heroSubtitle' | 'aboutText' | 'valueProp' | 'serviceDescription' | 'projectDescription';
  initialValue: string;
  onChange: (newValue: string) => void;
  context: {
    name: string;
    valueProp: string;
    expertises: string[];
  };
  children: React.ReactNode;
}

export const AiRewriteWrapper: React.FC<AiRewriteWrapperProps> = ({
  fieldId,
  fieldType,
  initialValue,
  onChange,
  context,
  children,
}) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [promptText, setPromptText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentValue, setCurrentValue] = useState(initialValue);
  const [isModified, setIsModified] = useState(false);
  
  const wrapperRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Fermer popup si clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsPopupOpen(false);
      }
    };

    if (isPopupOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPopupOpen]);

  // Focus textarea quand popup s'ouvre
  useEffect(() => {
    if (isPopupOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isPopupOpen]);

  const openPopup = () => {
    setIsPopupOpen(true);
    setPromptText('');
    setError(null);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setPromptText('');
    setError(null);
  };

  const handleRegenerate = async () => {
    if (!promptText.trim()) {
      setError('Entrez une instruction pour modifier le texte');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await callDeepSeekRewrite({
        currentText: currentValue,
        instruction: promptText,
        fieldType,
        context,
      });

      setCurrentValue(result.newText);
      setIsModified(true);
      onChange(result.newText);
      closePopup();
    } catch (err: any) {
      console.error('AI rewrite failed:', err);
      setError(err.message || 'Erreur lors de la régénération');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentValue(initialValue);
    setIsModified(false);
    onChange(initialValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleRegenerate();
    }
    if (e.key === 'Escape') {
      closePopup();
    }
  };

  return (
    <div 
      ref={wrapperRef}
      className={`ai-rewrite-wrapper ${isModified ? 'modified' : ''}`}
    >
      {/* Contenu éditable (children) */}
      <div className="ai-rewrite-content">
        {children}
      </div>

      {/* Bouton AI Sparkle */}
      <button
        className="ai-rewrite-btn"
        onClick={openPopup}
        title="Modifier avec l'IA"
        type="button"
      >
        <AiSparkleIcon size={16} />
      </button>

      {/* Bouton Reset (visible si modifié) */}
      {isModified && (
        <button
          className="ai-reset-btn"
          onClick={handleReset}
          title="Réinitialiser"
          type="button"
        >
          ↺
        </button>
      )}

      {/* Popup de prompt */}
      {isPopupOpen && (
        <div className="ai-prompt-popup">
          <div className="ai-prompt-header">
            <AiSparkleIcon size={18} className="ai-prompt-icon" />
            <span>Comment modifier ce texte ?</span>
          </div>

          <textarea
            ref={textareaRef}
            className="ai-prompt-input"
            placeholder="Ex: Rends le plus percutant, ajoute des chiffres, raccourcis le texte..."
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={3}
          />

          {error && (
            <div className="ai-prompt-error">
              {error}
            </div>
          )}

          <div className="ai-prompt-hint">
            Astuce: Ctrl+Enter pour régénérer
          </div>

          <div className="ai-prompt-actions">
            <button
              className="ai-btn-cancel"
              onClick={closePopup}
              type="button"
              disabled={isLoading}
            >
              Annuler
            </button>
            <button
              className={`ai-btn-regenerate ${isLoading ? 'loading' : ''}`}
              onClick={handleRegenerate}
              type="button"
              disabled={isLoading || !promptText.trim()}
            >
              {isLoading ? (
                <>
                  <span className="ai-spinner" />
                  Génération...
                </>
              ) : (
                <>
                  <AiSparkleIcon size={14} />
                  Régénérer
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiRewriteWrapper;
