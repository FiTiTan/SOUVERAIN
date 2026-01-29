import React, { useState } from 'react';
import { useTheme } from '../../ThemeContext';
import { typography, borderRadius, transitions } from '../../design-system';
import { v4 as uuidv4 } from 'uuid';

type Step = 'connect' | 'select' | 'analyze';

interface GitHubImportProps {
  onClose: () => void;
  onSuccess: (projects: any[]) => void;
}

export const PortfolioGitHubImport: React.FC<GitHubImportProps> = ({ onClose, onSuccess }) => {
  const { theme } = useTheme();
  const [step, setStep] = useState<Step>('connect');
  const [token, setToken] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [sourceId, setSourceId] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('');
  const [repos, setRepos] = useState<any[]>([]);
  const [selectedRepos, setSelectedRepos] = useState<Set<string>>(new Set());
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleConnect = async () => {
    if (!token.trim()) {
      setError('Veuillez entrer un token GitHub');
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const result = await window.electron.portfolio.connectSource('github', { accessToken: token });

      if (result.success) {
        setSourceId(result.sourceId);
        setUsername(result.username);
        setStep('select');

        // Charger repos
        const reposResult = await window.electron.portfolio.fetchGitHubRepos(result.sourceId);
        if (reposResult.success) {
          setRepos(reposResult.repos);
        }
      } else {
        setError(result.error || 'Erreur de connexion');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur inattendue');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleAnalyze = async () => {
    if (selectedRepos.size === 0) {
      setError('Veuillez sélectionner au moins un repo');
      return;
    }

    // Vérifier limite Free
    const currentCount = await window.electron.portfolio.countAllProjects();
    const isPremium = false; // TODO: vérifier statut Premium

    if (!isPremium && currentCount >= 3) {
      setError('Limite Free atteinte (3 projets max). Passez en Premium pour des projets illimités.');
      return;
    }

    if (!isPremium && currentCount + selectedRepos.size > 3) {
      setError(`Vous ne pouvez ajouter que ${3 - currentCount} projet(s) supplémentaire(s) en version Free.`);
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setStep('analyze');

    try {
      const selectedReposList = repos.filter(r => selectedRepos.has(r.id));
      const total = selectedReposList.length;
      let completed = 0;

      for (const repo of selectedReposList) {
        // Analyser avec IA
        const result = await window.electron.portfolio.analyzeProject(repo, 'github');

        if (result.success) {
          // Sauvegarder projet
          await window.electron.portfolio.createProject({
            id: uuidv4(),
            portfolio_id: 'default', // TODO: gérer multi-portfolio
            title: repo.name,
            slug: repo.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            source_type: 'github',
            source_url: repo.url,
            source_data: JSON.stringify(repo),
            pitch: result.pitch,
            stack: JSON.stringify(result.stack),
            challenge: result.challenge,
            solution: result.solution,
            outputs: JSON.stringify(result.outputs),
            order_index: completed
          });
        }

        completed++;
        setAnalysisProgress(Math.round((completed / total) * 100));
      }

      onSuccess(selectedReposList);
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
      maxWidth: '700px',
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
    field: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.5rem',
      marginBottom: '1.5rem',
    },
    label: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text.primary,
    },
    input: {
      padding: '0.75rem',
      fontSize: typography.fontSize.base,
      color: theme.text.primary,
      backgroundColor: theme.bg.primary,
      border: `1px solid ${theme.border.default}`,
      borderRadius: borderRadius.md,
      outline: 'none',
    },
    hint: {
      fontSize: typography.fontSize.sm,
      color: theme.text.secondary,
      marginTop: '0.25rem',
    },
    error: {
      padding: '0.75rem',
      backgroundColor: theme.semantic.error.bg,
      color: theme.semantic.error.text,
      borderRadius: borderRadius.md,
      fontSize: typography.fontSize.sm,
      marginBottom: '1rem',
    },
    reposList: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.75rem',
      maxHeight: '400px',
      overflowY: 'auto' as const,
    },
    repoItem: {
      padding: '1rem',
      border: `1px solid ${theme.border.default}`,
      borderRadius: borderRadius.md,
      cursor: 'pointer',
      transition: transitions.fast,
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.75rem',
    },
    checkbox: {
      marginTop: '0.25rem',
    },
    repoInfo: {
      flex: 1,
    },
    repoName: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text.primary,
    },
    repoMeta: {
      fontSize: typography.fontSize.sm,
      color: theme.text.secondary,
      marginTop: '0.25rem',
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
    buttonPrimary: {
      backgroundColor: theme.accent.primary,
      color: '#FFFFFF',
    },
  };

  const renderStepConnect = () => (
    <>
      <div style={styles.content}>
        <p style={{ color: theme.text.secondary, marginBottom: '1.5rem' }}>
          Connectez votre compte GitHub avec un Personal Access Token.
        </p>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.field}>
          <label style={styles.label}>Personal Access Token</label>
          <input
            type="password"
            style={styles.input}
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="ghp_xxxxxxxxxxxxx"
          />
          <p style={styles.hint}>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                window.electron.openExternal('https://github.com/settings/tokens/new');
              }}
              style={{ color: theme.accent.primary }}
            >
              Créer un token GitHub →
            </a> (scope: repo)
          </p>
        </div>
      </div>

      <div style={styles.footer}>
        <button style={{ ...styles.button, ...styles.buttonSecondary }} onClick={onClose}>
          Annuler
        </button>
        <button
          style={{ ...styles.button, ...styles.buttonPrimary }}
          onClick={handleConnect}
          disabled={isConnecting}
        >
          {isConnecting ? 'Connexion...' : 'Se connecter'}
        </button>
      </div>
    </>
  );

  const renderStepSelect = () => (
    <>
      <div style={styles.content}>
        <p style={{ color: theme.text.secondary, marginBottom: '1.5rem' }}>
          🐙 @{username} • {repos.length} repos publics
        </p>

        {error && <div style={styles.error}>{error}</div>}

        <div style={styles.reposList}>
          {repos.map((repo) => (
            <div
              key={repo.id}
              style={{
                ...styles.repoItem,
                borderColor: selectedRepos.has(repo.id) ? theme.accent.primary : theme.border.default,
              }}
              onClick={() => {
                const newSelected = new Set(selectedRepos);
                if (newSelected.has(repo.id)) {
                  newSelected.delete(repo.id);
                } else {
                  newSelected.add(repo.id);
                }
                setSelectedRepos(newSelected);
              }}
            >
              <input
                type="checkbox"
                checked={selectedRepos.has(repo.id)}
                onChange={() => {}}
                style={styles.checkbox}
              />
              <div style={styles.repoInfo}>
                <div style={styles.repoName}>{repo.name}</div>
                <div style={styles.repoMeta}>
                  {repo.language} • ⭐ {repo.stargazers_count} • {new Date(repo.updated_at).toLocaleDateString('fr-FR')}
                </div>
              </div>
            </div>
          ))}
        </div>

        <p style={{ color: theme.text.secondary, marginTop: '1rem', fontSize: typography.fontSize.sm }}>
          {selectedRepos.size} repo(s) sélectionné(s)
        </p>
      </div>

      <div style={styles.footer}>
        <button style={{ ...styles.button, ...styles.buttonSecondary }} onClick={onClose}>
          Annuler
        </button>
        <button
          style={{ ...styles.button, ...styles.buttonPrimary }}
          onClick={handleAnalyze}
        >
          Analyser avec l'IA →
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
            💡 L'IA génère le pitch, la stack, le challenge et la solution pour chaque projet
          </p>
        </div>
      </div>
    </>
  );

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>
            {step === 'connect' && 'Connexion GitHub'}
            {step === 'select' && 'Sélection des repos'}
            {step === 'analyze' && 'Analyse IA'}
          </h2>
          <button style={styles.closeButton} onClick={onClose}>×</button>
        </div>

        {step === 'connect' && renderStepConnect()}
        {step === 'select' && renderStepSelect()}
        {step === 'analyze' && renderStepAnalyze()}
      </div>
    </div>
  );
};
