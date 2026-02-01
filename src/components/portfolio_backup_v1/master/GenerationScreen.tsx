/**
 * SOUVERAIN - Portfolio Generation Screen (MPF-5)
 * Écran d'animation pendant la génération du portfolio
 * Architecture souveraine : Local → Cloud → Local
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../ThemeContext';
import { typography, borderRadius } from '../../../design-system';
import { detectAndAnonymize } from '../../../services/anonymizationService';
import { generatePortfolioContent, type PortfolioGenerationInput } from '../../../services/groqPortfolioGeneratorService';

// ============================================================
// ICONS
// ============================================================

const Icons = {
  Shield: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Brain: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3A2.5 2.5 0 0 0 14.5 2Z" />
    </svg>
  ),
  Palette: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
  ),
  Code: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  Check: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  Loader: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
      <line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
      <animateTransform
        attributeName="transform"
        attributeType="XML"
        type="rotate"
        from="0 12 12"
        to="360 12 12"
        dur="1s"
        repeatCount="indefinite"
      />
    </svg>
  )
};

// ============================================================
// TYPES
// ============================================================

interface GenerationStep {
  id: string;
  label: string;
  status: 'pending' | 'processing' | 'done';
  icon: React.FC;
}

interface GenerationScreenProps {
  portfolioData: any;
  onComplete: (result: { html: string; portfolioId: string }) => void;
  onError: (error: string) => void;
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export const GenerationScreen: React.FC<GenerationScreenProps> = ({
  portfolioData,
  onComplete,
  onError,
}) => {
  const { theme, mode } = useTheme();

  const [steps, setSteps] = useState<GenerationStep[]>([
    { id: 'anonymize', label: 'Anonymisation (🔒 Local)', status: 'pending', icon: Icons.Shield },
    { id: 'generate', label: 'Génération contenu (☁️ Groq)', status: 'pending', icon: Icons.Brain },
    { id: 'deanonymize', label: 'Dé-anonymisation (🔒 Local)', status: 'pending', icon: Icons.Shield },
    { id: 'style', label: 'Application style (🔒 Local)', status: 'pending', icon: Icons.Palette },
    { id: 'render', label: 'Rendu HTML (🔒 Local)', status: 'pending', icon: Icons.Code },
  ]);

  const [log, setLog] = useState('Initialisation...');

  useEffect(() => {
    runGeneration();
  }, []);

  const updateStep = (id: string, status: 'processing' | 'done') => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  const runGeneration = async () => {
    try {
      // 1. Anonymisation locale
      updateStep('anonymize', 'processing');
      setLog('🔒 Protection des données sensibles en local...');

      const allText = gatherAllText(portfolioData);
      const { anonymizedText } = await detectAndAnonymize(
        allText,
        portfolioData.portfolioId,
        null
      );

      updateStep('anonymize', 'done');
      await delay(300);

      // 2. Génération contenu (Groq distant)
      updateStep('generate', 'processing');
      setLog('☁️ Génération du contenu via Groq API...');

      const content = await generatePortfolioContent({
        anonymizedText,
        intentions: portfolioData.intentions,
        style: portfolioData.style,
        projects: portfolioData.projects,
        portfolioId: portfolioData.portfolioId
      });

      updateStep('generate', 'done');
      await delay(300);

      // 3. Dé-anonymisation locale (déjà faite dans generatePortfolioContent)
      updateStep('deanonymize', 'processing');
      setLog('🔓 Restauration des données réelles...');
      await delay(500);
      updateStep('deanonymize', 'done');

      // 4. Application du style
      updateStep('style', 'processing');
      setLog(`🎨 Application du style ${portfolioData.style}...`);
      await delay(500);
      updateStep('style', 'done');

      // 5. Rendu HTML
      updateStep('render', 'processing');
      setLog('📄 Génération du fichier HTML...');

      // @ts-ignore
      const html = await window.electron.invoke('render-portfolio-html', {
        sections: content.sections,
        seo: content.seo,
        style: portfolioData.style,
        projects: portfolioData.projects,
        practicalData: portfolioData.practicalData,
      });

      updateStep('render', 'done');
      await delay(300);

      // Sauvegarder en DB
      // @ts-ignore
      const portfolioId = await window.electron.invoke('save-generated-portfolio', {
        ...portfolioData,
        generatedHTML: html,
        generatedSections: content.sections
      });

      setLog('✅ Terminé !');
      setTimeout(() => onComplete({ html, portfolioId }), 800);

    } catch (error) {
      onError(error instanceof Error ? error.message : 'Erreur de génération');
    }
  };

  const progress = (steps.filter(s => s.status === 'done').length / steps.length) * 100;

  const styles = {
    container: {
      minHeight: '100vh',
      background: mode === 'dark' ? '#0f1729' : '#f8fafc',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    },
    wrapper: {
      maxWidth: '500px',
      width: '100%',
    },
    header: {
      textAlign: 'center' as const,
      marginBottom: '2rem',
    },
    iconWrapper: {
      width: '80px',
      height: '80px',
      background: theme.accent.primary,
      borderRadius: borderRadius['2xl'],
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto 1rem',
    },
    title: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: theme.text.primary,
      marginBottom: '0.5rem',
    },
    subtitle: {
      fontSize: typography.fontSize.base,
      color: theme.text.secondary,
    },
    progressBar: {
      height: '8px',
      background: theme.bg.tertiary,
      borderRadius: borderRadius.full,
      marginBottom: '2rem',
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      background: theme.accent.primary,
      transition: 'width 300ms ease',
      width: `${progress}%`,
    },
    stepsList: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.75rem',
      marginBottom: '2rem',
    },
    step: (status: string) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '1rem 1.25rem',
      borderRadius: borderRadius.xl,
      background: status === 'processing'
        ? `${theme.accent.primary}20`
        : status === 'done'
        ? theme.semantic.successBg
        : theme.bg.secondary,
      border: `1px solid ${
        status === 'processing'
          ? theme.accent.primary
          : status === 'done'
          ? theme.semantic.success
          : theme.border.light
      }`,
    }),
    stepIcon: (status: string) => ({
      width: '32px',
      height: '32px',
      borderRadius: borderRadius.full,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: status === 'processing'
        ? theme.accent.primary
        : status === 'done'
        ? theme.semantic.success
        : theme.bg.tertiary,
      color: status === 'pending' ? theme.text.tertiary : '#FFFFFF',
      flexShrink: 0,
    }),
    stepLabel: (status: string) => ({
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: status === 'done'
        ? theme.semantic.success
        : status === 'processing'
        ? theme.text.primary
        : theme.text.secondary,
    }),
    privacyBanner: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '1rem',
      background: theme.semantic.successBg,
      borderRadius: borderRadius.xl,
      border: `1px solid ${theme.semantic.success}`,
    },
    privacyText: {
      fontSize: typography.fontSize.sm,
      color: theme.text.secondary,
      lineHeight: typography.lineHeight.relaxed,
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        {/* Header */}
        <div style={styles.header}>
          <motion.div
            style={styles.iconWrapper}
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
          >
            <Icons.Loader />
          </motion.div>
          <h1 style={styles.title}>Génération en cours</h1>
          <p style={styles.subtitle}>{log}</p>
        </div>

        {/* Progress Bar */}
        <div style={styles.progressBar}>
          <motion.div
            style={styles.progressFill}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
          />
        </div>

        {/* Steps */}
        <div style={styles.stepsList}>
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.id}
                style={styles.step(step.status)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div style={styles.stepIcon(step.status)}>
                  {step.status === 'done' ? <Icons.Check /> :
                   step.status === 'processing' ? <Icons.Loader /> :
                   <Icon />}
                </div>
                <span style={styles.stepLabel(step.status)}>{step.label}</span>
              </motion.div>
            );
          })}
        </div>

        {/* Privacy Banner */}
        <div style={styles.privacyBanner}>
          <div style={{ color: theme.semantic.success, flexShrink: 0 }}>
            <Icons.Shield />
          </div>
          <p style={styles.privacyText}>
            Vos données sont protégées : anonymisation locale avant envoi à Groq
          </p>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// UTILITIES
// ============================================================

function gatherAllText(data: any): string {
  const texts = [
    data.imports?.linkedInData?.rawContent || '',
    data.imports?.notionData?.pageContent || '',
    ...data.projects.map((p: any) =>
      [p.brief_text, p.challenge_text, p.solution_text].filter(Boolean).join('\n')
    )
  ].filter(Boolean);

  return texts.join('\n\n');
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
