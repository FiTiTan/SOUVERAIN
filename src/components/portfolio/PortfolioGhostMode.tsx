import React, { useState, useEffect } from 'react';
import { useTheme } from '../../ThemeContext';
import { typography, borderRadius, transitions } from '../../design-system';

interface PortfolioGhostModeProps {
  projectId: string;
  isEnabled: boolean;
  existingMappings: Array<{ original: string; replacement: string }>;
  onSave: (enabled: boolean, mappings: Array<{ original: string; replacement: string }>) => void;
}

export const PortfolioGhostMode: React.FC<PortfolioGhostModeProps> = ({
  projectId,
  isEnabled: initialEnabled,
  existingMappings,
  onSave
}) => {
  const { theme } = useTheme();
  const [enabled, setEnabled] = useState(initialEnabled);
  const [mappings, setMappings] = useState(existingMappings);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDetect = async () => {
    setIsDetecting(true);
    setError(null);

    try {
      const result = await window.electron.portfolio.detectSensitiveEntities(projectId);

      if (result.success) {
        setMappings(result.mappings);
        if (result.mappings.length === 0) {
          setError('Aucune entité sensible détectée');
        }
      } else {
        setError(result.error || 'Erreur lors de la détection');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur inattendue');
    } finally {
      setIsDetecting(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      const result = await window.electron.portfolio.applyGhostMode(projectId, mappings, enabled);

      if (result.success) {
        onSave(enabled, mappings);
      } else {
        setError(result.error || 'Erreur lors de la sauvegarde');
      }
    } catch (err: any) {
      setError(err.message || 'Erreur inattendue');
    } finally {
      setIsSaving(false);
    }
  };

  const handleMappingChange = (index: number, field: 'original' | 'replacement', value: string) => {
    const newMappings = [...mappings];
    newMappings[index][field] = value;
    setMappings(newMappings);
  };

  const handleRemoveMapping = (index: number) => {
    setMappings(mappings.filter((_, i) => i !== index));
  };

  const handleAddMapping = () => {
    setMappings([...mappings, { original: '', replacement: '' }]);
  };

  const styles = {
    container: {
      padding: '1.5rem',
      backgroundColor: theme.bg.elevated,
      borderRadius: borderRadius.lg,
      border: `1px solid ${theme.border.default}`,
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '1.5rem',
    },
    title: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      color: theme.text.primary,
      margin: 0,
    },
    toggle: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    toggleLabel: {
      fontSize: typography.fontSize.base,
      color: theme.text.secondary,
    },
    toggleSwitch: {
      position: 'relative' as const,
      width: '48px',
      height: '24px',
      backgroundColor: enabled ? theme.accent.primary : theme.bg.secondary,
      borderRadius: borderRadius.full,
      cursor: 'pointer',
      transition: transitions.fast,
    },
    toggleKnob: {
      position: 'absolute' as const,
      top: '2px',
      left: enabled ? '26px' : '2px',
      width: '20px',
      height: '20px',
      backgroundColor: '#FFFFFF',
      borderRadius: '50%',
      transition: transitions.fast,
    },
    description: {
      fontSize: typography.fontSize.sm,
      color: theme.text.secondary,
      marginBottom: '1.5rem',
      lineHeight: 1.5,
    },
    detectButton: {
      padding: '0.75rem 1.5rem',
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      backgroundColor: theme.accent.primary,
      color: '#FFFFFF',
      border: 'none',
      borderRadius: borderRadius.lg,
      cursor: 'pointer',
      transition: transitions.normal,
      marginBottom: '1.5rem',
    },
    error: {
      padding: '0.75rem',
      backgroundColor: theme.semantic.error.bg,
      color: theme.semantic.error.text,
      borderRadius: borderRadius.md,
      fontSize: typography.fontSize.sm,
      marginBottom: '1rem',
    },
    mappingsList: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.75rem',
      marginBottom: '1rem',
    },
    mappingItem: {
      display: 'flex',
      gap: '0.75rem',
      alignItems: 'center',
    },
    input: {
      flex: 1,
      padding: '0.75rem',
      fontSize: typography.fontSize.sm,
      color: theme.text.primary,
      backgroundColor: theme.bg.primary,
      border: `1px solid ${theme.border.default}`,
      borderRadius: borderRadius.md,
      outline: 'none',
    },
    arrow: {
      fontSize: typography.fontSize.lg,
      color: theme.text.secondary,
    },
    removeButton: {
      background: 'none',
      border: 'none',
      color: theme.semantic.error.text,
      cursor: 'pointer',
      fontSize: typography.fontSize.xl,
      padding: '0.25rem',
    },
    addButton: {
      padding: '0.5rem 1rem',
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      backgroundColor: 'transparent',
      color: theme.accent.primary,
      border: `1px solid ${theme.accent.primary}`,
      borderRadius: borderRadius.md,
      cursor: 'pointer',
      transition: transitions.fast,
      marginBottom: '1.5rem',
    },
    footer: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '0.75rem',
      paddingTop: '1.5rem',
      borderTop: `1px solid ${theme.border.light}`,
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
    buttonPrimary: {
      backgroundColor: theme.accent.primary,
      color: '#FFFFFF',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>🕶️ Mode Ghost</h3>
        <div style={styles.toggle}>
          <span style={styles.toggleLabel}>
            {enabled ? 'Activé' : 'Désactivé'}
          </span>
          <div
            style={styles.toggleSwitch}
            onClick={() => setEnabled(!enabled)}
          >
            <div style={styles.toggleKnob} />
          </div>
        </div>
      </div>

      <p style={styles.description}>
        Le Mode Ghost remplace automatiquement les informations sensibles (noms d'entreprises, écoles, personnes)
        par des termes génériques pour protéger votre vie privée. L'IA détecte les entités sensibles et vous permet
        de les remplacer manuellement.
      </p>

      <button
        style={styles.detectButton}
        onClick={handleDetect}
        disabled={isDetecting}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = theme.accent.secondary;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = theme.accent.primary;
        }}
      >
        {isDetecting ? '⏳ Détection en cours...' : '🔍 Détecter les entités sensibles'}
      </button>

      {error && <div style={styles.error}>{error}</div>}

      {mappings.length > 0 && (
        <>
          <div style={styles.mappingsList}>
            {mappings.map((mapping, index) => (
              <div key={index} style={styles.mappingItem}>
                <input
                  style={styles.input}
                  value={mapping.original}
                  onChange={(e) => handleMappingChange(index, 'original', e.target.value)}
                  placeholder="Texte original"
                />
                <span style={styles.arrow}>→</span>
                <input
                  style={styles.input}
                  value={mapping.replacement}
                  onChange={(e) => handleMappingChange(index, 'replacement', e.target.value)}
                  placeholder="Remplacement"
                />
                <button
                  style={styles.removeButton}
                  onClick={() => handleRemoveMapping(index)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <button
            style={styles.addButton}
            onClick={handleAddMapping}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.accent.primary;
              e.currentTarget.style.color = '#FFFFFF';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = theme.accent.primary;
            }}
          >
            + Ajouter un remplacement manuel
          </button>
        </>
      )}

      <div style={styles.footer}>
        <button
          style={{ ...styles.button, ...styles.buttonPrimary }}
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
        </button>
      </div>
    </div>
  );
};
