import React, { useState } from 'react';
import { useTheme } from '../../ThemeContext';
import { typography, borderRadius, transitions } from '../../design-system';
import { v4 as uuidv4 } from 'uuid';

type Step = 'select' | 'analyze';

interface LocalImportProps {
  onClose: () => void;
  onSuccess: (projects: any[]) => void;
}

export const PortfolioLocalImport: React.FC<LocalImportProps> = ({ onClose, onSuccess }) => {
  const { theme } = useTheme();
  const [step, setStep] = useState<Step>('select');
  const [projectData, setProjectData] = useState<any | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleSelectFolder = async () => {
    setError(null);

    try {
      const result = await window.electron.portfolio.importFromLocal();

      if (result.success && result.project) {
        setProjectData(result.project);
        handleAnalyze(result.project);
      } else if (!result.canceled) {
        setError(result.error || 'Erreur lors de la sélection du dossier');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur inattendue');
    }
  };

  const handleAnalyze = async (project: any) => {
    // Vérifier limite Free
    const currentCount = await window.electron.portfolio.countAllProjects();
    const isPremium = false; // TODO: vérifier statut Premium

    if (!isPremium && currentCount >= 3) {
      setError('Limite Free atteinte (3 projets max). Passez en Premium pour des projets illimités.');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setStep('analyze');

    try {
      setAnalysisProgress(30);

      // Analyser avec IA
      const result = await window.electron.portfolio.analyzeProject(project, 'local');

      setAnalysisProgress(70);

      if (result.success) {
        // Sauvegarder projet
        await window.electron.portfolio.createProject({
          id: uuidv4(),
          portfolio_id: 'default', // TODO: gérer multi-portfolio
          title: project.name,
          slug: project.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          source_type: 'local',
          source_url: project.path,
          source_data: JSON.stringify(project),
          pitch: result.pitch,
          stack: JSON.stringify(result.stack),
          challenge: result.challenge,
          solution: result.solution,
          outputs: JSON.stringify(result.outputs),
          order_index: 0
        });

        setAnalysisProgress(100);
        onSuccess([project]);
      } else {
        setError(result.error || 'Erreur lors de l\'analyse');
        setIsAnalyzing(false);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'analyse');
      setIsAnalyzing(false);
    }
  };

  const styles = {
    overlay: {
      position: 'fixed' as const,
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)',
    },
    modal: {
      backgroundColor: theme.bg.elevated,
      borderRadius: borderRadius.xl,
      boxShadow: theme.shadow.xl,
      width: '90%',
      maxWidth: '600px',
      maxHeight: '80vh',
      overflow: 'auto' as const,
      border: `1px solid ${theme.border.default}`,
    },
    header: {
      padding: '1.5rem',
      borderBottom: `1px solid ${theme.border.light}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: theme.text.primary,
      margin: 0,
    },
    closeButton: {
      background: 'none',
      border: 'none',
      fontSize: typography.fontSize['2xl'],
      color: theme.text.secondary,
      cursor: 'pointer',
      padding: '0.25rem',
    },
    content: {
      padding: '1.5rem',
    },
    error: {
      padding: '0.75rem',
      backgroundColor: theme.semantic.error.bg,
      color: theme.semantic.error.text,
      borderRadius: borderRadius.md,
      fontSize: typography.fontSize.sm,
      marginBottom: '1rem',
    },
    selectButton: {
      width: '100%',
      padding: '2rem',
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      backgroundColor: theme.accent.primary,
      color: '#FFFFFF',
      border: 'none',
      borderRadius: borderRadius.lg,
      cursor: 'pointer',
      transition: transitions.normal,
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      gap: '1rem',
    },
    icon: {
      fontSize: '3rem',
    },
    progressContainer: {
      textAlign: 'center' as const,
    },
    progressBar: {
      width: '100%',
      height: '8px',
      backgroundColor: theme.bg.secondary,
      borderRadius: borderRadius.full,
      overflow: 'hidden',
      marginBottom: '1rem',
    },
    progressFill: {
      height: '100%',
      backgroundColor: theme.accent.primary,
      transition: 'width 0.3s ease',
    },
    progressText: {
      fontSize: typography.fontSize.lg,
      color: theme.text.primary,
      fontWeight: typography.fontWeight.semibold,
    },
    footer: {
      padding: '1.5rem',
      borderTop: `1px solid ${theme.border.light}`,
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '0.75rem',
    },
    button: {
      padding: '0.75rem 1.5rem',
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      borderRadius: borderRadius.lg,
      cursor: 'pointer',
      transition: transitions.normal,
      border: 'none',
    },
    buttonSecondary: {
      backgroundColor: 'transparent',
      color: theme.text.secondary,
      border: `1px solid ${theme.border.default}`,
    },
  };

  const renderStepSelect = () => (
    <>
      <div style={styles.content}>
        <p style={{ color: theme.text.secondary, marginBottom: '1.5rem' }}>
          Sélectionnez un dossier contenant votre projet. L'IA analysera automatiquement le README et les fichiers pour générer une présentation professionnelle.
        </p>

        {error && <div style={styles.error}>{error}</div>}

        <button
          style={styles.selectButton}
          onClick={handleSelectFolder}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.accent.secondary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = theme.accent.primary;
          }}
        >
          <div style={styles.icon}>📁</div>
          <div>Sélectionner un dossier</div>
        </button>

        <p style={{ color: theme.text.secondary, marginTop: '1rem', fontSize: typography.fontSize.sm }}>
          💡 Astuce : Assurez-vous que votre projet contient un fichier README.md pour une analyse optimale
        </p>
      </div>

      <div style={styles.footer}>
        <button style={{ ...styles.button, ...styles.buttonSecondary }} onClick={onClose}>
          Annuler
        </button>
      </div>
    </>
  );

  const renderStepAnalyze = () => (
    <>
      <div style={styles.content}>
        <div style={styles.progressContainer}>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${analysisProgress}%` }} />
          </div>
          <div style={styles.progressText}>
            {analysisProgress < 100 ? `Analyse en cours... ${analysisProgress}%` : 'Analyse terminée !'}
          </div>
          <p style={{ color: theme.text.secondary, marginTop: '1rem' }}>
            💡 L'IA génère le pitch, la stack, le challenge et la solution pour votre projet
          </p>
          {projectData && (
            <p style={{ color: theme.text.secondary, marginTop: '0.5rem', fontSize: typography.fontSize.sm }}>
              Projet : {projectData.name}
            </p>
          )}
        </div>
      </div>
    </>
  );

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>
            {step === 'select' && 'Import depuis un dossier local'}
            {step === 'analyze' && 'Analyse IA'}
          </h2>
          <button style={styles.closeButton} onClick={onClose}>×</button>
        </div>

        {step === 'select' && renderStepSelect()}
        {step === 'analyze' && renderStepAnalyze()}
      </div>
    </div>
  );
};
