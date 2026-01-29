import React, { useState } from 'react';
import { useTheme } from '../../ThemeContext';
import { typography, borderRadius, spacing, transitions } from '../../design-system';
import { generatePortfolioPDF } from '../../services/pdfExporter';
import type { PortfolioProjectV2, DisplayableAsset } from '../../types/portfolio';

interface ExportModalProps {
  project: PortfolioProjectV2;
  assets: DisplayableAsset[];
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ project, assets, onClose }) => {
  const { theme } = useTheme();
  const [isExporting, setIsExporting] = useState(false);
  const [ghostModeEnabled, setGhostModeEnabled] = useState(false);
  
  // Options d'anonymisation (pourrait être enrichi avec des inputs custom)
  const [anonymizeEmail, setAnonymizeEmail] = useState(true);
  const [anonymizePhone, setAnonymizePhone] = useState(true);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await generatePortfolioPDF(project, assets, {
        ghostMode: {
          enabled: ghostModeEnabled,
          mappings: {} // Pourrait être peuplé avec des mappings custom
        }
      });
      console.log('Export PDF terminé');
      onClose();
    } catch (error) {
      console.error('Erreur export PDF:', error);
      alert('Erreur lors de la génération du PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const styles = {
    overlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },
    modal: {
      backgroundColor: theme.bg.secondary,
      borderRadius: borderRadius.xl,
      width: '500px',
      maxWidth: '90vw',
      border: `1px solid ${theme.border.default}`,
      boxShadow: theme.shadow.xl,
      padding: spacing[6],
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing[6],
    },
    title: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      color: theme.text.primary,
    },
    closeButton: {
      background: 'none',
      border: 'none',
      color: theme.text.secondary,
      cursor: 'pointer',
      fontSize: typography.fontSize.xl,
    },
    section: {
      marginBottom: spacing[6],
    },
    sectionTitle: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text.tertiary,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
      marginBottom: spacing[3],
    },
    optionBg: {
      backgroundColor: theme.bg.tertiary,
      borderRadius: borderRadius.lg,
      padding: spacing[4],
    },
    checkboxRow: {
      display: 'flex',
      alignItems: 'center',
      gap: spacing[3],
      cursor: 'pointer',
      marginBottom: spacing[2],
    },
    checkbox: {
      width: '18px',
      height: '18px',
      cursor: 'pointer',
    },
    label: {
      fontSize: typography.fontSize.base,
      color: theme.text.primary,
      fontWeight: typography.fontWeight.medium,
    },
    description: {
      fontSize: typography.fontSize.sm,
      color: theme.text.secondary,
      marginLeft: '30px',
    },
    ghostModeBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem',
      padding: '0.25rem 0.5rem',
      borderRadius: borderRadius.md,
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      marginLeft: '0.5rem',
      fontSize: typography.fontSize.xs,
    },
    actions: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: spacing[3],
      marginTop: spacing[4],
    },
    button: {
      padding: '0.75rem 1.5rem',
      borderRadius: borderRadius.lg,
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium,
      cursor: 'pointer',
      border: 'none',
      transition: transitions.fast,
    },
    cancelButton: {
        backgroundColor: 'transparent',
        color: theme.text.secondary,
        border: `1px solid ${theme.border.default}`,
    },
    exportButton: {
        backgroundColor: theme.accent.primary,
        color: '#FFFFFF',
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Exporter le projet</h2>
          <button style={styles.closeButton} onClick={onClose}>✕</button>
        </div>

        <div style={styles.section}>
          <div style={styles.optionBg}>
             <label style={styles.checkboxRow}>
                <input 
                  type="checkbox" 
                  checked={ghostModeEnabled} 
                  onChange={(e) => setGhostModeEnabled(e.target.checked)}
                  style={styles.checkbox}
                />
                <span style={styles.label}>
                    Activer le Ghost Mode 👻
                </span>
             </label>
             <p style={styles.description}>
                Anonymise automatiquement les données sensibles (emails, téléphones, noms masqués) pour partager votre portfolio en toute discrétion.
             </p>
          </div>
        </div>

        <div style={styles.actions}>
            <button 
                style={{...styles.button, ...styles.cancelButton}} 
                onClick={onClose}
            >
                Annuler
            </button>
            <button 
                style={{...styles.button, ...styles.exportButton, opacity: isExporting ? 0.7 : 1}} 
                onClick={handleExport}
                disabled={isExporting}
            >
                {isExporting ? 'Génération...' : 'Télécharger PDF'}
            </button>
        </div>
      </div>
    </div>
  );
};
