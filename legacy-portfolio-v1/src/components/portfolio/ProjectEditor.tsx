/**
 * SOUVERAIN - ProjectEditor
 * Vue détaillée d'un projet avec gestion des assets assignés
 * (Restored & Enhanced)
 */

import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../ThemeContext';
import { useToast } from '../ui/NotificationToast';
import { typography, borderRadius, transitions, spacing } from '../../design-system';
import type { Project } from './ProjectCard';
import type { Asset } from '../../services/assetService';
import { getAssetIcon } from '../../services/assetService';
import { AssetPreviewModal } from './AssetPreviewModal';
import { ExportModal } from './ExportModal';
import type { DisplayableAsset } from '../../types/portfolio'; 

interface ProjectEditorProps {
  project: Project;
  onClose: () => void;
  onProjectUpdate: () => void;
}

interface AssignedAsset extends Asset {
  elementId: string; // ID de la liaison project-asset
  displayOrder: number;
  isCover: boolean;
}

import { AssetImporter } from './AssetImporter';

export const ProjectEditor: React.FC<ProjectEditorProps> = ({
  project,
  onClose,
  onProjectUpdate,
}) => {
  const { theme } = useTheme();
  const toast = useToast();
  const [assignedAssets, setAssignedAssets] = useState<AssignedAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [draggedAsset, setDraggedAsset] = useState<AssignedAsset | null>(null);
  const [previewAsset, setPreviewAsset] = useState<AssignedAsset | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // Gérer l'import direct dans le projet
  const handleImportInProject = async (newAssets: Asset[]) => {
      setIsImporting(true);
      try {
          let addedCount = 0;
          for (const asset of newAssets) {
             // 1. Create Element
             const elementId = crypto.randomUUID();
             const elementResult = await window.electron.portfolioV2.elements.create({
                 id: elementId,
                 portfolioId: project.portfolioId,
                 assetId: asset.id,
                 elementType: 'image', // Default
                 userValidated: true
             });

             if (!elementResult.success) {
                 console.error('[ProjectEditor] Failed to create element for asset', asset.id, elementResult.error);
                 continue;
             }

             // 2. Link to Project
             const result = await window.electron.portfolioV2.projects.addElement({
                 id: crypto.randomUUID(), // Generate Link ID
                 projectId: project.id,
                 elementId: elementId, // Use the proper Element ID
                 displayOrder: assignedAssets.length + addedCount,
                 isCover: false 
             });

             if (result.success) addedCount++;
          }
          
          if (addedCount > 0) {
              if (toast) toast.success(`${addedCount} fichiers ajoutés au projet`);
              loadAssignedAssets(); // Recharger la vue
              onProjectUpdate(); // Notifier le parent
          }
      } catch (error) {
          console.error(error);
          if (toast) toast.error('Erreur', 'Impossible de lier les fichiers au projet');
      } finally {
          setIsImporting(false);
      }
  };

  // Charger les assets assignés
  const loadAssignedAssets = async () => {
    setIsLoading(true);
    try {
      // 1. Récupérer les liens (project_elements)
      const elements = await window.electron.portfolioV2.projects.getElements(project.id);
      
      // Fallback: On charge tous les assets du portfolio pour faire le lien
      const allAssets = await window.electron.portfolioV2.assets.getByPortfolio(project.portfolioId);
      
      const enrichedAssets: AssignedAsset[] = elements.map((el: any) => {
        // el contains pe.* (including asset_id) and ppe columns.
        // We match Asset ID with Element's asset_id.
        const asset = allAssets.find((a: any) => a.id === el.asset_id || a.id === el.assetId); 
        if (!asset) return null;
        return {
          ...asset,
          elementId: el.id, // ID de la liaison
          displayOrder: el.display_order || el.displayOrder || 0,
          isCover: !!(el.is_cover || el.isCover),
        };
      }).filter(Boolean);

      // Trier par displayOrder
      enrichedAssets.sort((a, b) => a.displayOrder - b.displayOrder);

      setAssignedAssets(enrichedAssets);
      console.log('[ProjectEditor] Assigned assets:', enrichedAssets);
    } catch (error) {
      console.error('[ProjectEditor] Erreur chargement assets:', error);
      if (toast) toast.error('Erreur', 'Impossible de charger le contenu du projet');
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAssignedAssets();
  }, [project.id]);

  // Actions
  const handleRemoveAsset = async (asset: AssignedAsset) => {
      try {
          const result = await window.electron.portfolioV2.projects.removeElement(project.id, asset.elementId);
          if (result.success) {
              if (toast) toast.success('Asset retiré du projet');
              loadAssignedAssets();
              onProjectUpdate();
          } else {
              if (toast) toast.error('Erreur', result.error);
          }
      } catch (error) {
          console.error(error);
          if (toast) toast.error('Erreur', 'Impossible de retirer l\'asset');
      }
  };

  const handleSetCover = async (asset: AssignedAsset) => {
    try {
        // En V2, on met à jour l'élément pour dire isCover=true
        // Note: Idéalement il faut mettre isCover=false aux autres. Le backend devrait gérer ça ou on le fait ici.
        // Assuming backend handles "only one cover" or strictly setting this one.
        const result = await window.electron.portfolioV2.projects.updateElement(project.id, asset.elementId, { isCover: true });
        if (result.success) {
            if (toast) toast.success('Image de couverture définie');
            loadAssignedAssets();
        }
    } catch (error) {
        if (toast) toast.error('Erreur', 'Impossible de définir la couverture');
    }
  };

  const styles = {
    overlay: {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      backdropFilter: 'blur(8px)', // Effet glass
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
    },
    modal: {
      backgroundColor: theme.bg.primary,
      borderRadius: borderRadius.xl,
      width: '90%',
      maxWidth: '1200px',
      height: '90vh',
      display: 'flex',
      flexDirection: 'column' as const,
      overflow: 'hidden',
      border: `1px solid ${theme.border.default}`,
      boxShadow: theme.shadow.xl,
    },
    header: {
      padding: `${spacing[6]} ${spacing[8]}`,
      borderBottom: `1px solid ${theme.border.default}`,
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.bg.secondary,
      position: 'relative' as const,
    },
    title: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: theme.text.primary,
    },
    closeButton: {
      background: 'none',
      border: 'none',
      color: theme.text.tertiary,
      fontSize: '2rem',
      cursor: 'pointer',
      padding: spacing[2],
      lineHeight: 1,
    },
    content: {
      padding: spacing[8],
      overflowY: 'auto' as const,
      flex: 1,
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: spacing[6],
    },
    card: {
      position: 'relative' as const,
      aspectRatio: '1',
      backgroundColor: theme.bg.secondary,
      borderRadius: borderRadius.lg,
      overflow: 'hidden',
      border: `1px solid ${theme.border.default}`,
      transition: transitions.fast,
      cursor: 'grab',
    },
    image: {
      width: '100%',
      height: '100%',
      objectFit: 'cover' as const,
    },
    cardOverlay: {
      position: 'absolute' as const,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      opacity: 0,
      transition: transitions.fast,
      display: 'flex',
      flexDirection: 'column' as const,
      justifyContent: 'center',
      alignItems: 'center',
      gap: spacing[2],
    },
    assetName: {
        position: 'absolute' as const,
        bottom: 0,
        left: 0,
        right: 0,
        padding: spacing[2],
        background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
        color: 'white',
        fontSize: typography.fontSize.xs,
        whiteSpace: 'nowrap' as const,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    actionButton: {
        padding: '0.5rem 1rem',
        borderRadius: borderRadius.md,
        border: 'none',
        cursor: 'pointer',
        fontWeight: typography.fontWeight.medium,
        fontSize: typography.fontSize.sm,
        backgroundColor: theme.accent.primary,
        color: 'white',
    },
    exportButton: {
        backgroundColor: theme.bg.tertiary,
        color: theme.text.primary,
        border: `1px solid ${theme.border.default}`,
        display: 'flex',
        alignItems: 'center',
        gap: spacing[2],
        padding: `${spacing[2]} ${spacing[4]}`,
    }
  };

  // Mapper pour l'export
  const displayableAssetsForExport: DisplayableAsset[] = assignedAssets.map(asset => ({
    asset: asset, 
    element: {
      id: asset.elementId,
      portfolioId: project.portfolioId,
      assetId: asset.id,
      elementType: 'image', // Par défaut
      userValidated: true,
      createdAt: asset.createdAt || new Date().toISOString()
    } as any
  }));

  return (
    <>
      <div style={styles.overlay} onClick={(e) => { if(e.target === e.currentTarget) onClose(); }}>
        <div style={styles.modal}>
          <div style={styles.header}>
            <div>
                 <h2 style={styles.title}>{project.title}</h2>
                 <p style={{color: theme.text.secondary}}>{project.description || 'Pas de description'}</p>
            </div>
            
            <div style={{display: 'flex', gap: spacing[3], alignItems: 'center'}}>
                <div style={{marginRight: spacing[2]}}>
                    <AssetImporter 
                        portfolioId={project.portfolioId}
                        onAssetsImported={handleImportInProject}
                        buttonStyle={{
                            backgroundColor: theme.accent.primary, 
                            border: `1px solid ${theme.border.default}`,
                            boxShadow: theme.shadow.sm
                        }}
                    />
                </div>

                <button 
                    style={{...styles.actionButton, ...styles.exportButton}}
                    onClick={() => setShowExportModal(true)}
                >
                    <span>📄</span> Export PDF
                </button>
                <button style={styles.closeButton} onClick={onClose}>&times;</button>
            </div>
          </div>

          <div style={styles.content}>
            {isLoading ? (
                <div style={{textAlign: 'center', padding: '4rem', color: theme.text.secondary}}>Chargement...</div>
            ) : assignedAssets.length === 0 ? (
                <div style={{textAlign: 'center', padding: '4rem', color: theme.text.secondary, border: `2px dashed ${theme.border.default}`, borderRadius: borderRadius.xl}}>
                    <div style={{fontSize: '3rem', marginBottom: spacing[4]}}>📂</div>
                    <p>Ce projet est vide.</p>
                    <p style={{fontSize: typography.fontSize.sm}}>Glissez des assets depuis la liste pour les ajouter.</p>
                </div>
            ) : (
                <div style={styles.grid}>
                    {assignedAssets.map((asset, index) => (
                        <div 
                            key={asset.id} 
                            style={{
                                ...styles.card, 
                                border: asset.isCover ? `2px solid ${theme.accent.primary}` : styles.card.border
                            }}
                            onMouseEnter={(e) => {
                                const overlay = e.currentTarget.querySelector('.overlay') as HTMLElement;
                                if(overlay) overlay.style.opacity = '1';
                            }}
                            onMouseLeave={(e) => {
                                const overlay = e.currentTarget.querySelector('.overlay') as HTMLElement;
                                if(overlay) overlay.style.opacity = '0';
                            }}
                        >
                             {['jpg','jpeg','png','webp'].includes(asset.format.toLowerCase()) ? (
                                 <img src={`file:///${asset.localPath}`} style={styles.image} alt="" />
                             ) : (
                                 <div style={{width: '100%', height: '100%', display: 'flex',  alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: theme.text.secondary}}>
                                     {getAssetIcon(asset.format)}
                                 </div>
                             )}
                             
                             {asset.isCover && (
                                 <div style={{position: 'absolute', top: spacing[2], left: spacing[2], background: theme.accent.primary, color: 'white', padding: '2px 8px', borderRadius: borderRadius.sm, fontSize: typography.fontSize.xs, fontWeight: 'bold'}}>
                                     COUVERTURE
                                 </div>
                             )}

                             <div className="overlay" style={styles.cardOverlay}>
                                 <button 
                                    style={{...styles.actionButton, fontSize: '10px'}}
                                    onClick={() => setPreviewAsset(asset)}
                                 >
                                     Agrandir
                                 </button>
                                 {!asset.isCover && (
                                     <button 
                                        style={{...styles.actionButton, fontSize: '10px', background: theme.bg.tertiary, color: theme.text.primary}}
                                        onClick={() => handleSetCover(asset)}
                                    >
                                        Définir Couverture
                                    </button>
                                 )}
                                 <button 
                                    style={{...styles.actionButton, background: theme.semantic.error, color: 'white'}}
                                    onClick={() => handleRemoveAsset(asset)}
                                 >
                                     Retirer
                                 </button>
                             </div>
                             <div style={styles.assetName}>{asset.originalFilename}</div>
                        </div>
                    ))}
                </div>
            )}
          </div>
        </div>
      </div>

      {previewAsset && (
        <AssetPreviewModal 
           asset={previewAsset} 
           onClose={() => setPreviewAsset(null)} 
        />
      )}

      {showExportModal && (
        <ExportModal 
            project={project as any} // Bypass strict V2 check if interfaces marginally differ
            assets={displayableAssetsForExport}
            onClose={() => setShowExportModal(false)}
        />
      )}
    </>
  );
};

export default ProjectEditor;
