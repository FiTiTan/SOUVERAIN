import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../ThemeContext';
import { GlassInput, GlassTextArea } from '../ui/GlassForms';
import { type JobOffer } from '../../services/jobMatchingService';

interface JobOfferInputProps {
  onNext: (jobOffer: Partial<JobOffer>) => void;
  onBack: () => void;
}

export const JobOfferInput: React.FC<JobOfferInputProps> = ({ onNext, onBack }) => {
  const { theme, mode } = useTheme();
  const [inputMode, setInputMode] = useState<'url' | 'paste'>('paste');
  const [url, setUrl] = useState('');
  const [pastedContent, setPastedContent] = useState('');
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [error, setError] = useState('');

  const handleAnalyze = () => {
    if (inputMode === 'url') {
      if (!url.trim()) {
        setError('Veuillez entrer une URL');
        return;
      }
      // TODO: Implement URL scraping
      setError('Le scraping d\'URL n\'est pas encore implémenté. Utilisez le mode copier-coller.');
      return;
    }

    if (!pastedContent.trim()) {
      setError('Veuillez coller le contenu de l\'offre');
      return;
    }

    if (!title.trim()) {
      setError('Veuillez entrer le titre du poste');
      return;
    }

    if (!company.trim()) {
      setError('Veuillez entrer le nom de l\'entreprise');
      return;
    }

    const jobOffer: Partial<JobOffer> = {
      id: `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      company,
      rawContent: pastedContent,
      url: undefined,
      createdAt: new Date().toISOString()
    };

    onNext(jobOffer);
  };

  return (
    <div style={{
      padding: '2rem',
      maxWidth: '900px',
      margin: '0 auto'
    }}>
      {/* Back Button */}
      <button
        onClick={onBack}
        style={{
          background: 'transparent',
          border: 'none',
          color: theme.text.secondary,
          fontSize: '1rem',
          cursor: 'pointer',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
      >
        ← Retour
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 style={{
          fontSize: '2rem',
          fontWeight: 700,
          color: theme.text.primary,
          marginBottom: '0.5rem'
        }}>
          Importer une offre
        </h1>
        <p style={{
          fontSize: '1rem',
          color: theme.text.secondary,
          marginBottom: '2rem'
        }}>
          Comment voulez-vous importer l'offre ?
        </p>

        {/* Mode Selector */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <button
            onClick={() => setInputMode('paste')}
            style={{
              flex: 1,
              padding: '1rem',
              background: inputMode === 'paste'
                ? theme.accent.primary
                : theme.bg.secondary,
              color: inputMode === 'paste' ? '#ffffff' : theme.text.primary,
              border: `1px solid ${inputMode === 'paste' ? theme.accent.primary : theme.border.default}`,
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            📋 Copier-coller le texte
          </button>
          <button
            onClick={() => setInputMode('url')}
            style={{
              flex: 1,
              padding: '1rem',
              background: inputMode === 'url'
                ? theme.accent.primary
                : theme.bg.secondary,
              color: inputMode === 'url' ? '#ffffff' : theme.text.primary,
              border: `1px solid ${inputMode === 'url' ? theme.accent.primary : theme.border.default}`,
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            🔗 Depuis une URL
          </button>
        </div>

        {/* Input Area */}
        <div style={{
          background: mode === 'dark'
            ? 'rgba(30, 41, 59, 0.6)'
            : 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)',
          borderRadius: '16px',
          border: `1px solid ${theme.border.light}`,
          padding: '2rem'
        }}>
          {inputMode === 'url' ? (
            <>
              <GlassInput
                label="URL de l'offre"
                placeholder="https://linkedin.com/jobs/view/123456789..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
              <p style={{
                fontSize: '0.875rem',
                color: theme.text.tertiary,
                marginTop: '0.5rem'
              }}>
                Supporte : LinkedIn, Indeed, Welcome to the Jungle
              </p>
            </>
          ) : (
            <>
              <GlassInput
                label="Titre du poste"
                placeholder="Ex: Développeur Full Stack"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <GlassInput
                label="Nom de l'entreprise"
                placeholder="Ex: Startup XYZ"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
              />
              <GlassTextArea
                label="Contenu de l'offre"
                placeholder="Collez ici le contenu de l'offre d'emploi..."
                rows={10}
                value={pastedContent}
                onChange={(e) => setPastedContent(e.target.value)}
                required
              />
            </>
          )}

          {error && (
            <div style={{
              padding: '1rem',
              background: `${theme.semantic.error}15`,
              border: `1px solid ${theme.semantic.error}`,
              borderRadius: '8px',
              color: theme.semantic.error,
              marginTop: '1rem'
            }}>
              {error}
            </div>
          )}

          <button
            onClick={handleAnalyze}
            style={{
              width: '100%',
              marginTop: '1.5rem',
              padding: '1rem',
              background: theme.accent.primary,
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Analyser l'offre →
          </button>
        </div>
      </motion.div>
    </div>
  );
};
