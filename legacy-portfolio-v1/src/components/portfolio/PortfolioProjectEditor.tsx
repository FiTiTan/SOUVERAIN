import React, { useState, useEffect } from 'react';
import { useTheme } from '../../ThemeContext';
import { typography, borderRadius, transitions } from '../../design-system';
import { PortfolioPreviewTabs } from './PortfolioPreviewTabs';

interface PortfolioProjectEditorProps {
  projectId: string;
  onClose: () => void;
  onSave: () => void;
}

interface OutputLink {
  label: string;
  url: string;
}

export const PortfolioProjectEditor: React.FC<PortfolioProjectEditorProps> = ({
  projectId,
  onClose,
  onSave
}) => {
  const { theme } = useTheme();
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [regeneratingSection, setRegeneratingSection] = useState<string | null>(null);

  // États pour les 5 sections
  const [pitch, setPitch] = useState('');
  const [stack, setStack] = useState<string[]>([]);
  const [stackInput, setStackInput] = useState('');
  const [challenge, setChallenge] = useState('');
  const [solution, setSolution] = useState('');
  const [outputs, setOutputs] = useState<OutputLink[]>([]);
  const [newOutputLabel, setNewOutputLabel] = useState('');
  const [newOutputUrl, setNewOutputUrl] = useState('');

  // État pour l'anonymisation
  const [anonymizeForExport, setAnonymizeForExport] = useState(false);

  useEffect(() => {
    loadProject();
  }, [projectId]);

  const loadProject = async () => {
    setIsLoading(true);
    try {
      const result = await window.electron.portfolio.getProjectById(projectId);
      if (result) {
        setProject(result);

        // Parser les données JSON
        setPitch(result.pitch || '');
        setStack(result.stack ? JSON.parse(result.stack) : []);
        setChallenge(result.challenge || '');
        setSolution(result.solution || '');
        setOutputs(result.outputs ? JSON.parse(result.outputs) : []);
      }
    } catch (error) {
      console.error('[PortfolioProjectEditor] Erreur chargement:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updates = {
        pitch,
        stack: JSON.stringify(stack),
        challenge,
        solution,
        outputs: JSON.stringify(outputs)
      };

      const result = await window.electron.portfolio.updateProject(projectId, updates);
      if (result.success) {
        onSave();
        onClose();
      } else {
        alert('Erreur lors de la sauvegarde');
      }
    } catch (error) {
      console.error('[PortfolioProjectEditor] Erreur sauvegarde:', error);
      alert('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRegenerate = async (section: string) => {
    setRegeneratingSection(section);
    try {
      const result = await window.electron.portfolio.regenerateSection(projectId, section);
      if (result.success) {
        // Mettre à jour la section correspondante
        switch (section) {
          case 'pitch':
            setPitch(result.content);
            break;
          case 'stack':
            try {
              const parsed = JSON.parse(result.content);
              setStack(Array.isArray(parsed) ? parsed : [result.content]);
            } catch {
              setStack([result.content]);
            }
            break;
          case 'challenge':
            setChallenge(result.content);
            break;
          case 'solution':
            setSolution(result.content);
            break;
        }
      } else {
        alert('Erreur lors de la régénération');
      }
    } catch (error) {
      console.error('[PortfolioProjectEditor] Erreur régénération:', error);
      alert('Erreur lors de la régénération');
    } finally {
      setRegeneratingSection(null);
    }
  };

  const handleAddStackItem = () => {
    if (stackInput.trim()) {
      setStack([...stack, stackInput.trim()]);
      setStackInput('');
    }
  };

  const handleRemoveStackItem = (index: number) => {
    setStack(stack.filter((_, i) => i !== index));
  };

  const handleAddOutput = () => {
    if (newOutputLabel.trim() && newOutputUrl.trim()) {
      setOutputs([...outputs, { label: newOutputLabel.trim(), url: newOutputUrl.trim() }]);
      setNewOutputLabel('');
      setNewOutputUrl('');
    }
  };

  const handleRemoveOutput = (index: number) => {
    setOutputs(outputs.filter((_, i) => i !== index));
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
      maxWidth: '900px',
      maxHeight: '90vh',
      overflow: 'auto' as const,
      border: `1px solid ${theme.border.default}`,
    },
    header: {
      padding: '1.5rem',
      borderBottom: `1px solid ${theme.border.light}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky' as const,
      top: 0,
      backgroundColor: theme.bg.elevated,
      zIndex: 10,
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
    section: {
      marginBottom: '2rem',
    },
    sectionHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '0.75rem',
    },
    sectionLabel: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text.primary,
    },
    regenerateButton: {
      padding: '0.5rem 1rem',
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      backgroundColor: 'transparent',
      color: theme.accent.primary,
      border: `1px solid ${theme.accent.primary}`,
      borderRadius: borderRadius.md,
      cursor: 'pointer',
      transition: transitions.fast,
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    textarea: {
      width: '100%',
      padding: '0.75rem',
      fontSize: typography.fontSize.base,
      color: theme.text.primary,
      backgroundColor: theme.bg.primary,
      border: `1px solid ${theme.border.default}`,
      borderRadius: borderRadius.md,
      outline: 'none',
      fontFamily: 'inherit',
      resize: 'vertical' as const,
    },
    stackContainer: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '0.5rem',
      marginBottom: '0.75rem',
    },
    stackTag: {
      padding: '0.5rem 0.75rem',
      fontSize: typography.fontSize.sm,
      backgroundColor: theme.accent.primary,
      color: '#FFFFFF',
      borderRadius: borderRadius.full,
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    stackRemoveButton: {
      background: 'none',
      border: 'none',
      color: '#FFFFFF',
      cursor: 'pointer',
      fontSize: typography.fontSize.lg,
      lineHeight: 1,
      padding: 0,
    },
    stackInput: {
      display: 'flex',
      gap: '0.5rem',
    },
    input: {
      flex: 1,
      padding: '0.75rem',
      fontSize: typography.fontSize.base,
      color: theme.text.primary,
      backgroundColor: theme.bg.primary,
      border: `1px solid ${theme.border.default}`,
      borderRadius: borderRadius.md,
      outline: 'none',
    },
    addButton: {
      padding: '0.75rem 1.5rem',
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      backgroundColor: theme.accent.primary,
      color: '#FFFFFF',
      border: 'none',
      borderRadius: borderRadius.md,
      cursor: 'pointer',
      transition: transitions.fast,
    },
    outputsList: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.75rem',
      marginBottom: '0.75rem',
    },
    outputItem: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '0.75rem',
      backgroundColor: theme.bg.secondary,
      borderRadius: borderRadius.md,
    },
    outputInfo: {
      flex: 1,
    },
    outputLabel: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text.primary,
    },
    outputUrl: {
      fontSize: typography.fontSize.sm,
      color: theme.text.secondary,
      marginTop: '0.25rem',
    },
    removeButton: {
      background: 'none',
      border: 'none',
      color: theme.semantic.error.text,
      cursor: 'pointer',
      fontSize: typography.fontSize.xl,
      padding: '0.25rem',
    },
    outputInputs: {
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '0.5rem',
    },
    footer: {
      padding: '1.5rem',
      borderTop: `1px solid ${theme.border.light}`,
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '0.75rem',
      position: 'sticky' as const,
      bottom: 0,
      backgroundColor: theme.bg.elevated,
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
    optionsSection: {
      marginTop: '2rem',
      marginBottom: '2rem',
      padding: '1.5rem',
      backgroundColor: theme.bg.secondary,
      borderRadius: borderRadius.lg,
      border: `1px solid ${theme.border.light}`,
    },
    optionsHeader: {
      marginBottom: '1rem',
    },
    optionsTitle: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.bold,
      color: theme.text.tertiary,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
    },
    checkboxLabel: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.75rem',
      cursor: 'pointer',
    },
    checkbox: {
      marginTop: '0.125rem',
      width: '18px',
      height: '18px',
      cursor: 'pointer',
    },
    checkboxText: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium,
      color: theme.text.primary,
    },
    checkboxDescription: {
      fontSize: typography.fontSize.sm,
      color: theme.text.secondary,
      lineHeight: typography.lineHeight.relaxed,
    },
  };

  if (isLoading) {
    return (
      <div style={styles.overlay}>
        <div style={styles.modal}>
          <div style={styles.content}>
            <p style={{ color: theme.text.secondary, textAlign: 'center' }}>Chargement...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Éditer le projet : {project?.title}</h2>
          <button style={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <div style={styles.content}>
          {/* Section 1: Pitch */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <label style={styles.sectionLabel}>1. Le Pitch</label>
              <button
                style={styles.regenerateButton}
                onClick={() => handleRegenerate('pitch')}
                disabled={regeneratingSection === 'pitch'}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.accent.primary;
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = theme.accent.primary;
                }}
              >
                {regeneratingSection === 'pitch' ? '⏳ Régénération...' : '✨ Régénérer'}
              </button>
            </div>
            <textarea
              style={styles.textarea}
              rows={3}
              value={pitch}
              onChange={(e) => setPitch(e.target.value)}
              placeholder="Une accroche percutante en 1-2 phrases..."
            />
          </div>

          {/* Section 2: Stack */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <label style={styles.sectionLabel}>2. La Stack</label>
              <button
                style={styles.regenerateButton}
                onClick={() => handleRegenerate('stack')}
                disabled={regeneratingSection === 'stack'}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.accent.primary;
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = theme.accent.primary;
                }}
              >
                {regeneratingSection === 'stack' ? '⏳ Régénération...' : '✨ Régénérer'}
              </button>
            </div>
            <div style={styles.stackContainer}>
              {stack.map((tech, index) => (
                <div key={index} style={styles.stackTag}>
                  <span>{tech}</span>
                  <button
                    style={styles.stackRemoveButton}
                    onClick={() => handleRemoveStackItem(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div style={styles.stackInput}>
              <input
                style={styles.input}
                value={stackInput}
                onChange={(e) => setStackInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddStackItem()}
                placeholder="Ajouter une technologie..."
              />
              <button style={styles.addButton} onClick={handleAddStackItem}>
                Ajouter
              </button>
            </div>
          </div>

          {/* Section 3: Challenge */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <label style={styles.sectionLabel}>3. Le Challenge</label>
              <button
                style={styles.regenerateButton}
                onClick={() => handleRegenerate('challenge')}
                disabled={regeneratingSection === 'challenge'}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.accent.primary;
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = theme.accent.primary;
                }}
              >
                {regeneratingSection === 'challenge' ? '⏳ Régénération...' : '✨ Régénérer'}
              </button>
            </div>
            <textarea
              style={styles.textarea}
              rows={4}
              value={challenge}
              onChange={(e) => setChallenge(e.target.value)}
              placeholder="Quel problème technique/métier ce projet résout-il ?"
            />
          </div>

          {/* Section 4: Solution */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <label style={styles.sectionLabel}>4. La Solution</label>
              <button
                style={styles.regenerateButton}
                onClick={() => handleRegenerate('solution')}
                disabled={regeneratingSection === 'solution'}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.accent.primary;
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = theme.accent.primary;
                }}
              >
                {regeneratingSection === 'solution' ? '⏳ Régénération...' : '✨ Régénérer'}
              </button>
            </div>
            <textarea
              style={styles.textarea}
              rows={5}
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              placeholder="Comment avez-vous résolu le challenge ? Méthode, architecture, choix techniques..."
            />
          </div>

          {/* Section 5: Outputs */}
          <div style={styles.section}>
            <div style={styles.sectionHeader}>
              <label style={styles.sectionLabel}>5. Les Outputs</label>
            </div>
            <div style={styles.outputsList}>
              {outputs.map((output, index) => (
                <div key={index} style={styles.outputItem}>
                  <div style={styles.outputInfo}>
                    <div style={styles.outputLabel}>{output.label}</div>
                    <div style={styles.outputUrl}>{output.url}</div>
                  </div>
                  <button
                    style={styles.removeButton}
                    onClick={() => handleRemoveOutput(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <div style={styles.outputInputs}>
              <input
                style={{ ...styles.input, flex: '0 0 30%' }}
                value={newOutputLabel}
                onChange={(e) => setNewOutputLabel(e.target.value)}
                placeholder="Label (ex: Code source)"
              />
              <input
                style={{ ...styles.input, flex: 1 }}
                value={newOutputUrl}
                onChange={(e) => setNewOutputUrl(e.target.value)}
                placeholder="URL (ex: https://github.com/...)"
              />
              <button style={styles.addButton} onClick={handleAddOutput}>
                Ajouter
              </button>
            </div>
          </div>

          {/* OPTIONS */}
          <div style={styles.optionsSection}>
            <div style={styles.optionsHeader}>
              <span style={styles.optionsTitle}>OPTIONS</span>
            </div>

            {/* Toggle Anonymiser pour export */}
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={anonymizeForExport}
                onChange={(e) => setAnonymizeForExport(e.target.checked)}
                style={styles.checkbox}
              />
              <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.25rem' }}>
                <span style={styles.checkboxText}>Anonymiser pour export</span>
                <span style={styles.checkboxDescription}>
                  Les données personnelles seront remplacées par des tokens ([PERSON_1], [COMPANY_1]...)
                </span>
              </div>
            </label>
          </div>

          {/* Preview Tabs */}
          <PortfolioPreviewTabs
            projectId={projectId}
            pitch={pitch}
            challenge={challenge}
            solution={solution}
            anonymizeEnabled={anonymizeForExport}
          />
        </div>

        <div style={styles.footer}>
          <button style={{ ...styles.button, ...styles.buttonSecondary }} onClick={onClose}>
            Annuler
          </button>
          <button
            style={{ ...styles.button, ...styles.buttonPrimary }}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </div>
    </div>
  );
};
