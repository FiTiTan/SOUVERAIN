import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../ThemeContext';
import { GlassTextArea } from '../ui/GlassForms';
import { type LinkedInProfile, generateLinkedInContent } from '../../services/linkedinCoachService';

interface ContentSuggestionsProps {
  profile: Partial<LinkedInProfile>;
  portfolioId: string;
  onBack: () => void;
}

export const ContentSuggestions: React.FC<ContentSuggestionsProps> = ({ profile, portfolioId, onBack }) => {
  const { theme, mode } = useTheme();
  const [contentType, setContentType] = useState<'headline' | 'about' | 'post' | 'connection_message'>('post');
  const [context, setContext] = useState('');
  const [tone, setTone] = useState<'professional' | 'inspiring' | 'casual' | 'expert'>('professional');
  const [generatedContent, setGeneratedContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const content = await generateLinkedInContent(profile as LinkedInProfile, contentType, context, tone, portfolioId);
      setGeneratedContent(content);
    } catch (error) {
      console.error('Error generating content:', error);
      alert('Erreur lors de la génération du contenu');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    alert('Contenu copié !');
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <button onClick={onBack} style={{
        background: 'transparent', border: 'none', color: theme.text.secondary,
        fontSize: '1rem', cursor: 'pointer', marginBottom: '2rem'
      }}>← Retour</button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, color: theme.text.primary, marginBottom: '0.5rem' }}>
          Générateur de Contenu
        </h1>
        <p style={{ fontSize: '1rem', color: theme.text.secondary, marginBottom: '2rem' }}>
          Que voulez-vous générer ?
        </p>

        <div style={{
          background: mode === 'dark' ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.7)',
          backdropFilter: 'blur(20px)', borderRadius: '16px', border: `1px solid ${theme.border.light}`, padding: '2rem'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { value: 'headline', label: 'Headline', icon: '✏️' },
              { value: 'about', label: 'About', icon: '📝' },
              { value: 'post', label: 'Post', icon: '📊' },
              { value: 'connection_message', label: 'Message', icon: '💬' }
            ].map(type => (
              <button key={type.value} onClick={() => setContentType(type.value as any)} style={{
                padding: '1rem', background: contentType === type.value ? theme.accent.primary : theme.bg.secondary,
                color: contentType === type.value ? '#ffffff' : theme.text.primary,
                border: `1px solid ${contentType === type.value ? theme.accent.primary : theme.border.default}`,
                borderRadius: '12px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem'
              }}>
                <span style={{ fontSize: '1.5rem' }}>{type.icon}</span>
                <span>{type.label}</span>
              </button>
            ))}
          </div>

          <GlassTextArea label="Contexte (optionnel)" rows={3} value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Ex: Je viens de terminer un projet de migration..." />

          <div style={{ marginTop: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: theme.text.primary, marginBottom: '0.75rem' }}>
              Ton souhaité
            </label>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {[
                { value: 'professional', label: 'Professionnel' },
                { value: 'inspiring', label: 'Inspirant' },
                { value: 'casual', label: 'Décontracté' },
                { value: 'expert', label: 'Expert' }
              ].map(t => (
                <button key={t.value} onClick={() => setTone(t.value as any)} style={{
                  padding: '0.5rem 1rem', background: tone === t.value ? theme.accent.primary : theme.bg.secondary,
                  color: tone === t.value ? '#ffffff' : theme.text.primary,
                  border: `1px solid ${tone === t.value ? theme.accent.primary : theme.border.default}`,
                  borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer'
                }}>{t.label}</button>
              ))}
            </div>
          </div>

          <button onClick={handleGenerate} disabled={loading} style={{
            width: '100%', marginTop: '1.5rem', padding: '1rem',
            background: loading ? theme.bg.tertiary : theme.accent.primary,
            color: loading ? theme.text.tertiary : '#ffffff',
            border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}>
            {loading ? 'Génération...' : 'Générer →'}
          </button>

          {generatedContent && (
            <div style={{ marginTop: '2rem', padding: '1.5rem', background: mode === 'dark' ? 'rgba(30, 41, 59, 0.4)' : 'rgba(255, 255, 255, 0.8)',
              borderRadius: '12px', border: `1px solid ${theme.border.default}` }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 600, color: theme.text.primary, marginBottom: '1rem' }}>Résultat :</p>
              <p style={{ fontSize: '0.875rem', color: theme.text.secondary, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {generatedContent}
              </p>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button onClick={handleCopy} style={{
                  padding: '0.75rem 1.5rem', background: theme.accent.primary, color: '#ffffff',
                  border: 'none', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer'
                }}>Copier</button>
                <button onClick={handleGenerate} style={{
                  padding: '0.75rem 1.5rem', background: theme.bg.secondary, color: theme.text.primary,
                  border: `1px solid ${theme.border.default}`, borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer'
                }}>Régénérer</button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
