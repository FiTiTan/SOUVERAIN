import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../ThemeContext';
import { GlassInput, GlassTextArea } from '../ui/GlassForms';
import { type LinkedInProfile } from '../../services/linkedinCoachService';

interface ProfileImportProps {
  onNext: (profile: Partial<LinkedInProfile>) => void;
  onBack: () => void;
}

export const ProfileImport: React.FC<ProfileImportProps> = ({ onNext, onBack }) => {
  const { theme, mode } = useTheme();
  const [inputMode, setInputMode] = useState<'url' | 'paste'>('paste');
  const [url, setUrl] = useState('');
  const [pastedContent, setPastedContent] = useState('');
  const [error, setError] = useState('');

  const handleAnalyze = () => {
    if (inputMode === 'url') {
      if (!url.trim()) {
        setError('Veuillez entrer l\'URL de votre profil');
        return;
      }
      setError('Le scraping d\'URL n\'est pas encore implémenté. Utilisez le mode copier-coller.');
      return;
    }

    if (!pastedContent.trim()) {
      setError('Veuillez coller le contenu de votre profil');
      return;
    }

    const profile: Partial<LinkedInProfile> = {
      id: `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      rawContent: pastedContent,
      url: inputMode === 'url' ? url : undefined,
      createdAt: new Date().toISOString()
    };

    onNext(profile);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <button onClick={onBack} style={{
        background: 'transparent', border: 'none', color: theme.text.secondary,
        fontSize: '1rem', cursor: 'pointer', marginBottom: '2rem',
        display: 'flex', alignItems: 'center', gap: '0.5rem'
      }}>
        ← Retour
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: theme.text.primary, marginBottom: '0.5rem' }}>
          Importer votre profil
        </h1>
        <p style={{ fontSize: '1rem', color: theme.text.secondary, marginBottom: '2rem' }}>
          Comment voulez-vous importer votre profil ?
        </p>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button onClick={() => setInputMode('paste')} style={{
            flex: 1, padding: '1rem',
            background: inputMode === 'paste' ? theme.accent.primary : theme.bg.secondary,
            color: inputMode === 'paste' ? '#ffffff' : theme.text.primary,
            border: `1px solid ${inputMode === 'paste' ? theme.accent.primary : theme.border.default}`,
            borderRadius: '12px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer'
          }}>
            📋 Copier-coller
          </button>
          <button onClick={() => setInputMode('url')} style={{
            flex: 1, padding: '1rem',
            background: inputMode === 'url' ? theme.accent.primary : theme.bg.secondary,
            color: inputMode === 'url' ? '#ffffff' : theme.text.primary,
            border: `1px solid ${inputMode === 'url' ? theme.accent.primary : theme.border.default}`,
            borderRadius: '12px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer'
          }}>
            🔗 Depuis l'URL
          </button>
        </div>

        <div style={{
          background: mode === 'dark' ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)', borderRadius: '16px',
          border: `1px solid ${theme.border.light}`, padding: '2rem'
        }}>
          {inputMode === 'url' ? (
            <GlassInput label="URL de votre profil" placeholder="https://linkedin.com/in/votre-profil"
              value={url} onChange={(e) => setUrl(e.target.value)} required />
          ) : (
            <>
              <p style={{ fontSize: '0.875rem', color: theme.text.tertiary, marginBottom: '1rem' }}>
                Allez sur votre profil LinkedIn, sélectionnez tout le texte (Ctrl+A) et collez-le ici :
              </p>
              <GlassTextArea label="Contenu de votre profil"
                placeholder="Collez ici le contenu de votre profil LinkedIn..." rows={12}
                value={pastedContent} onChange={(e) => setPastedContent(e.target.value)} required />
            </>
          )}

          {error && (
            <div style={{
              padding: '1rem', background: `${theme.semantic.error}15`,
              border: `1px solid ${theme.semantic.error}`, borderRadius: '8px',
              color: theme.semantic.error, marginTop: '1rem'
            }}>{error}</div>
          )}

          <button onClick={handleAnalyze} style={{
            width: '100%', marginTop: '1.5rem', padding: '1rem',
            background: theme.accent.primary, color: '#ffffff', border: 'none',
            borderRadius: '12px', fontSize: '1rem', fontWeight: 600, cursor: 'pointer'
          }}>
            Analyser mon profil →
          </button>
        </div>
      </motion.div>
    </div>
  );
};
