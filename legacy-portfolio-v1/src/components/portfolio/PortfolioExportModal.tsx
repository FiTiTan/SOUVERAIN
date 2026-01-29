/**
 * SOUVERAIN - PortfolioExportModal
 * Modale de sélection de projets pour l'export global
 */

import React, { useState } from 'react';
import { useTheme } from '../../ThemeContext';
import { typography, borderRadius, spacing } from '../../design-system';
import type { PortfolioProjectV2 } from '../../types/portfolio'; 

interface PortfolioExportModalProps {
  projects: PortfolioProjectV2[];
  portfolioName: string;
  onClose: () => void;
  onExport: (selectedIds: string[], options: { title: string, ghostMode: boolean }) => Promise<void>;
}

export const PortfolioExportModal: React.FC<PortfolioExportModalProps> = ({
  projects,
  portfolioName,
  onClose,
  onExport
}) => {
  const { theme } = useTheme();
  
  // State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [title, setTitle] = useState(`Dossier - ${portfolioName}`);
  const [isGhostMode, setIsGhostMode] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Utils
  const toggleProject = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const selectAll = () => {
    setSelectedIds(new Set(projects.map(p => p.id)));
  };

  const selectNone = () => {
    setSelectedIds(new Set());
  };

  const selectSmart = () => {
    // Select featured projects, or if none, select the first 5
    const featured = projects.filter(p => p.isFeatured).map(p => p.id);
    if (featured.length > 0) {
        setSelectedIds(new Set(featured));
    } else {
        setSelectedIds(new Set(projects.slice(0, 5).map(p => p.id)));
    }
  };

  const handleExport = async () => {
      setIsExporting(true);
      try {
          await onExport(Array.from(selectedIds), { title, ghostMode: isGhostMode });
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
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: spacing[4],
    },
    modal: {
      backgroundColor: theme.bg.primary,
      borderRadius: borderRadius.xl,
      padding: spacing[6],
      maxWidth: '600px',
      width: '100%',
      maxHeight: '90vh',
      display: 'flex',
      flexDirection: 'column' as const,
      boxShadow: theme.shadow.lg,
    },
    header: {
      marginBottom: spacing[5],
    },
    title: {
      fontSize: typography.fontSize['xl'],
      fontWeight: typography.fontWeight.bold,
      color: theme.text.primary,
      marginBottom: spacing[2],
    },
    subtitle: {
        fontSize: typography.fontSize.sm,
        color: theme.text.secondary,
    },
    list: {
        flex: 1,
        overflowY: 'auto' as const,
        border: `1px solid ${theme.border.default}`,
        borderRadius: borderRadius.md,
        padding: spacing[2],
        marginBottom: spacing[4],
    },
    item: {
        display: 'flex',
        alignItems: 'center',
        padding: spacing[3],
        borderBottom: `1px solid ${theme.border.default}`,
        cursor: 'pointer',
    },
    itemLabel: {
        marginLeft: spacing[3],
        flex: 1,
    },
    options: {
        display: 'flex',
        gap: spacing[4],
        marginBottom: spacing[4],
        alignItems: 'center',
    },
    tools: {
        display: 'flex',
        gap: spacing[2],
        marginBottom: spacing[3],
    },
    toolButton: {
        fontSize: typography.fontSize.xs,
        padding: `${spacing[1]} ${spacing[3]}`,
        borderRadius: borderRadius.full,
        border: `1px solid ${theme.border.default}`,
        backgroundColor: theme.bg.secondary,
        cursor: 'pointer',
        color: theme.text.secondary,
    },
    footer: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: spacing[3],
        marginTop: 'auto',
    },
    primaryBtn: {
        backgroundColor: theme.accent.primary,
        color: 'white',
        border: 'none',
        padding: `${spacing[3]} ${spacing[6]}`,
        borderRadius: borderRadius.lg,
        fontWeight: typography.fontWeight.semibold,
        cursor: isExporting ? 'wait' : 'pointer',
        opacity: isExporting || selectedIds.size === 0 ? 0.6 : 1,
    },
    secondaryBtn: {
        backgroundColor: 'transparent',
        border: `1px solid ${theme.border.default}`,
        color: theme.text.primary,
        padding: `${spacing[3]} ${spacing[6]}`,
        borderRadius: borderRadius.lg,
        cursor: 'pointer',
    }
  };

  return (
    <div style={styles.overlay} onClick={(e) => { if(e.target === e.currentTarget) onClose(); }}>
      <div style={styles.modal}>
        <div style={styles.header}>
            <h2 style={styles.title}>Exporter un Dossier Complet</h2>
            <p style={styles.subtitle}>Sélectionnez les projets à inclure dans votre PDF global.</p>
        </div>

        {/* Titre du dossier */}
        <div style={{marginBottom: spacing[4]}}>
            <label style={{display: 'block', fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, marginBottom: spacing[1]}}>Titre du Dossier</label>
            <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                style={{
                    width: '100%', 
                    padding: spacing[3], 
                    borderRadius: borderRadius.md, 
                    border: `1px solid ${theme.border.default}`,
                    backgroundColor: theme.bg.secondary,
                    color: theme.text.primary
                }}
            />
        </div>

        {/* Toolbar */}
        <div style={styles.tools}>
            <button style={styles.toolButton} onClick={selectAll}>Tout cocher</button>
            <button style={styles.toolButton} onClick={selectNone}>Décocher</button>
            <button style={styles.toolButton} onClick={selectSmart}>✨ Sélection Intelligente</button>
        </div>

        {/* Liste projets */}
        <div style={styles.list}>
            {projects.map(project => (
                <div 
                    key={project.id} 
                    style={{...styles.item, backgroundColor: selectedIds.has(project.id) ? theme.accent.muted : 'transparent'}}
                    onClick={() => toggleProject(project.id)}
                >
                    <input 
                        type="checkbox" 
                        checked={selectedIds.has(project.id)} 
                        onChange={() => {}} // Hanlde by div click
                        style={{cursor: 'pointer', width: '18px', height: '18px'}}
                    />
                    <div style={styles.itemLabel}>
                        <div style={{fontWeight: typography.fontWeight.medium, color: theme.text.primary}}>{project.title}</div>
                        {project.isFeatured && <span style={{fontSize: '0.7em', color: theme.semantic.warning}}>⭐ Mis en avant</span>}
                    </div>
                </div>
            ))}
        </div>

        {/* Options */}
        <div style={styles.options}>
            <label style={{display: 'flex', alignItems: 'center', gap: spacing[2], cursor: 'pointer'}}>
                <input 
                    type="checkbox" 
                    checked={isGhostMode} 
                    onChange={(e) => setIsGhostMode(e.target.checked)} 
                />
                <span style={{color: theme.text.primary}}>👻 Mode Fantôme (Anonymiser)</span>
            </label>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
            <button style={styles.secondaryBtn} onClick={onClose} disabled={isExporting}>Annuler</button>
            <button style={styles.primaryBtn} onClick={handleExport} disabled={isExporting || selectedIds.size === 0}>
                {isExporting ? 'Génération...' : `Générer PDF (${selectedIds.size})`}
            </button>
        </div>
      </div>
    </div>
  );
};
