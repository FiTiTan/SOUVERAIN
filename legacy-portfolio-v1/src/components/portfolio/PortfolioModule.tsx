import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '../../ThemeContext';
import { useToast } from '../ui/NotificationToast';
import { typography, borderRadius, transitions, spacing } from '../../design-system';
import { PortfolioWizard } from './PortfolioWizard';
import { AssetImporter } from './AssetImporter';
import { AssetGrid } from './AssetGrid';
import { getAssetsByPortfolioId, deleteAsset, type Asset } from '../../services/assetService';
import { ProjectList } from './ProjectList';
import { ProjectCreateModal, type ProjectFormData } from './ProjectCreateModal';
import { ProjectEditor } from './ProjectEditor';
import { AssetPreviewModal } from './AssetPreviewModal';
import { PortfolioExportModal } from './PortfolioExportModal';
import { generateGlobalPortfolioPDF } from '../../services/pdfExporter';
import type { Project } from './ProjectCard';
import type { PortfolioElement } from '../../types/portfolio';

// Nouveau type pour combiner Asset et Element pour l'affichage
export interface DisplayableAsset {
  asset: Asset;
  element: PortfolioElement;
}

export const PortfolioModule: React.FC = () => {
  const { theme } = useTheme();
  const toast = useToast();
  const [portfoliosV2, setPortfoliosV2] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showWizardV2, setShowWizardV2] = useState(false);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | null>(null);
  
  // Données brutes
  const [assets, setAssets] = useState<Asset[]>([]);
  const [elements, setElements] = useState<PortfolioElement[]>([]);
  
  const [isLoadingAssets, setIsLoadingAssets] = useState(false);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState<'assets' | 'projects'>('assets');
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const [isOllamaAvailable, setIsOllamaAvailable] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);
  const [previewingAssetId, setPreviewingAssetId] = useState<string | null>(null);
  const [showGlobalExport, setShowGlobalExport] = useState(false);

  const handleGlobalExport = async (projectIds: string[], options: { title: string, ghostMode: boolean }) => {
        try {
            // Filter projects
            const projectsToExport = (projects as any[]).filter(p => projectIds.includes(p.id));
            
            // Define fetcher
            const fetchAssets = async (projectId: string) => {
                 // 1. Get elements
                 const elements = await window.electron.portfolioV2.projects.getElements(projectId);
                 // 2. Get assets details (optimize: use local cache 'assets' if possible)
                 // For now, mapping from local 'assets' state which contains ALL assets of portfolio
                 // This assumes 'assets' state is fresh.
                 const projectAssetsWithElements = elements.map((el: any) => {
                     const asset = assets.find(a => a.id === el.assetId || a.id === el.element_id || a.id === el.elementId);
                     if (!asset) return null;
                     return { asset, element: el };
                 }).filter((item: any) => item !== null);
                 
                 return projectAssetsWithElements;
            };

            await generateGlobalPortfolioPDF(projectsToExport, fetchAssets, {
                title: options.title,
                ghostMode: { enabled: options.ghostMode }
            });

            toast.success('Dossier PDF généré avec succès !');
            setShowGlobalExport(false);
        } catch (error) {
            console.error(error);
            toast.error('Erreur', 'Echec de la génération du dossier');
        }
    };

  // Données combinées pour l'affichage
  const displayableAssets = useMemo((): DisplayableAsset[] => {
    // 1. D'abord, on mappe les assets qui ont un élément associé
    const mappedWithElements = elements
      .map(element => {
        const asset = assets.find(a => a.id === element.assetId);
        if (asset) {
          return { asset, element };
        }
        return null;
      })
      .filter((item): item is DisplayableAsset => item !== null);
      
    // 2. Ensuite, on identifie les assets orphelins (sans élément)
    // Cela arrive si l'import n'a pas encore créé d'élément ou si la synchro est en retard
    const assetIdsWithElements = new Set(elements.map(e => e.assetId));
    const orphanAssets = assets.filter(a => !assetIdsWithElements.has(a.id));
    
    // 3. On crée des éléments "fictifs" pour les orphelins afin qu'ils s'affichent
    const mappedOrphans = orphanAssets.map(asset => ({
        asset,
        element: {
            id: `temp_${asset.id}`,
            portfolioId: asset.portfolioId,
            assetId: asset.id,
            type: 'image', // Valeur par défaut
            elementType: 'image', // Correction type
            userValidated: false, // Correction type
            displayOrder: 0,
            isVisible: true,
            aiTags: [],
            aiDescription: '',
            createdAt: asset.createdAt || new Date().toISOString(),
            updatedAt: asset.createdAt || new Date().toISOString()
        } as PortfolioElement
    }));

    return [...mappedWithElements, ...mappedOrphans];
  }, [assets, elements]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await loadPortfoliosV2();
      await checkOllamaStatus();
    } catch (error) {
      console.error('[PortfolioModule] Erreur chargement:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPortfoliosV2 = async () => {
    try {
      console.log('[PortfolioModule] 🔵 Chargement des portfolios V2...');
      const result = await window.electron.portfolioV2.getAll('default');
      console.log('[PortfolioModule] ✅ Portfolios récupérés:', result);
      setPortfoliosV2(result || []);
    } catch (error) {
      console.error('[PortfolioModule] ❌ Erreur chargement portfolios V2:', error);
      setPortfoliosV2([]);
    }
  };

  const loadAssets = async (portfolioId: string) => {
    setIsLoadingAssets(true);
    try {
      console.log('[PortfolioModule] 🔵 Chargement assets pour:', portfolioId);
      const result = await getAssetsByPortfolioId(portfolioId);
      console.log('[PortfolioModule] ✅ Assets récupérés:', result.length);
      setAssets(result);
    } catch (error) {
      console.error('[PortfolioModule] ❌ Erreur chargement assets:', error);
      setAssets([]);
    } finally {
      setIsLoadingAssets(false);
    }
  };

  const loadElements = async (portfolioId: string) => {
    try {
      console.log('[PortfolioModule] 🔵 Chargement elements pour:', portfolioId);
      const result = await window.electron.portfolioV2.elements.getByPortfolio(portfolioId);
      console.log('[PortfolioModule] ✅ Elements récupérés:', result.length);
      setElements(result || []);
    } catch (error) {
      console.error('[PortfolioModule] ❌ Erreur chargement elements:', error);
      setElements([]);
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    try {
      // Note: la suppression d'un asset devrait aussi supprimer les éléments associés en cascade (côté backend)
      const result = await deleteAsset(assetId);
      if (result.success) {
        toast.success('Asset supprimé');
        if (selectedPortfolioId) {
          loadAssets(selectedPortfolioId);
          loadElements(selectedPortfolioId);
        }
      } else {
        toast.error('Erreur suppression', result.error);
      }
    } catch (error) {
      console.error('[PortfolioModule] Erreur suppression asset:', error);
      toast.error('Erreur suppression', 'Une erreur est survenue');
    }
  };

  const handleAssetsImported = () => {
    if (selectedPortfolioId) {
      loadAssets(selectedPortfolioId);
      loadElements(selectedPortfolioId);
    }
  };

  useEffect(() => {
    if (selectedPortfolioId) {
      loadAssets(selectedPortfolioId);
      loadElements(selectedPortfolioId);
      loadProjects(selectedPortfolioId);
    } else {
      setAssets([]);
      setElements([]);
      setProjects([]);
    }
  }, [selectedPortfolioId]);

  const loadProjects = async (portfolioId: string) => {
    setIsLoadingProjects(true);
    try {
      console.log('[PortfolioModule] 🔵 Chargement projets pour:', portfolioId);
      const result = await window.electron.portfolioV2.projects.getByPortfolio(portfolioId);
      console.log('[PortfolioModule] ✅ Projets récupérés:', result.length);
      const mappedProjects = (await Promise.all(
        (result || []).map(async (project: any) => {
          if (!project || !project.id) return null; // Safety check
          let assetCount = 0;
          try {
            const elements = await window.electron.portfolioV2.projects.getElements(project.id);
            assetCount = elements?.length || 0;
          } catch (error) {
            console.error('[PortfolioModule] Erreur comptage assets pour projet:', project.id, error);
          }
          return {
            id: project.id,
            portfolioId: project.portfolio_id || project.portfolioId,
            title: project.title,
            description: project.description,
            displayOrder: project.display_order || project.displayOrder || 0,
            isFeatured: Boolean(project.is_featured || project.isFeatured),
            tags: project.tags_json ? JSON.parse(project.tags_json) : (project.tags || []),
            createdAt: project.created_at || project.createdAt,
            updatedAt: project.updated_at || project.updatedAt,
            _elementCount: assetCount,
          };
        })
      )).filter((p): p is Project => p !== null);
      setProjects(mappedProjects);
    } catch (error) {
      console.error('[PortfolioModule] ❌ Erreur chargement projets:', error);
      setProjects([]);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const handleSaveProject = async (formData: ProjectFormData) => {
    if (!selectedPortfolioId) return;
    try {
      if (editingProject) {
        const result = await window.electron.portfolioV2.projects.update(editingProject.id, formData);
        if (result.success) {
           toast.success('Projet mis à jour');
        } else {
           throw new Error(result.error);
        }
      } else {
        const result = await window.electron.portfolioV2.projects.create({
            id: crypto.randomUUID(), // Generate ID frontend-side
            portfolioId: selectedPortfolioId,
            ...formData,
            displayOrder: projects.length, // Ajouter à la fin
            tags: [], // TODO: Ajouter tags
            techStack: [],
            images: [],
            isFeatured: false
        });
        if (result.success && result.id) { // Check for ID
           toast.success('Projet créé');
           // Auto-open editor to allow immediate import
           setShowProjectModal(false);
           await loadProjects(selectedPortfolioId); // Reload to get the new project object
           // Find the newly created project to open it
           // Note: This relies on loadProjects updating 'projects' state synchronously or we need to find it from result if we want it perfect.
           // Since setState is async, we might need a better way, but for now let's try finding it in the next render or manually constructing it.
           // Simpler: Just reload for now. The user will click. 
           // Better UX: We should manually setViewingProject with the new data.
        } else {
           throw new Error(result.error);
        }
      }
      setShowProjectModal(false);
      loadProjects(selectedPortfolioId);
    } catch (error) {
      console.error('[PortfolioModule] Erreur sauvegarde projet:', error);
      throw error;
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Voulez-vous vraiment supprimer ce projet ?')) return;
    try {
        const result = await window.electron.portfolioV2.projects.delete(projectId);
        if (result.success) {
            toast.success('Projet supprimé');
            loadProjects(selectedPortfolioId!);
        } else {
            toast.error('Erreur', result.error);
        }
    } catch (error) {
        toast.error('Erreur', 'Impossible de supprimer le projet');
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowProjectModal(true);
  };

  const handleCreateProject = () => {
    if (!selectedPortfolioId) {
      toast.error('Erreur', 'Veuillez d\'abord ouvrir un portfolio');
      return;
    }
    setEditingProject(null);
    setShowProjectModal(true);
  };

  const handleViewProject = (project: Project) => {
    setViewingProject(project);
  };

  const handleCloseProjectEditor = () => {
    setViewingProject(null);
    if (selectedPortfolioId) {
      loadProjects(selectedPortfolioId);
      loadElements(selectedPortfolioId); // Recharger au cas où des assets ont été assignés/désassignés
    }
  };

  const handleAssetDrop = async (projectId: string, assetId: string) => {
      // Pour l'instant on ne gère pas le drop direct sur la grille, mais on pourrait
      // Il faudrait ajouter un element de type projet_element
  };

  const handleAssetClick = (asset: Asset) => {
    setPreviewingAssetId(asset.id);
  };
  
  const getPreviewAssetIndex = () => {
    if (!previewingAssetId) return -1;
    return displayableAssets.findIndex(da => da.asset.id === previewingAssetId);
  };

  const handleNextAsset = () => {
    const currentIndex = getPreviewAssetIndex();
    if (currentIndex !== -1 && currentIndex < displayableAssets.length - 1) {
      setPreviewingAssetId(displayableAssets[currentIndex + 1].asset.id);
    }
  };

  const handlePrevAsset = () => {
    const currentIndex = getPreviewAssetIndex();
    if (currentIndex !== -1 && currentIndex > 0) {
      setPreviewingAssetId(displayableAssets[currentIndex - 1].asset.id);
    }
  };

  const checkOllamaStatus = async () => {
    try {
      const status = await window.electron.ollama.checkAvailability();
      setIsOllamaAvailable(status.available);
    } catch (error) {
      console.error('Ollama check failed', error);
      setIsOllamaAvailable(false);
    }
  };

  const handleClassifyAssets = async () => {
     if (!isOllamaAvailable) {
         toast.error('Ollama indisponible', 'Vérifiez que le serveur Ollama tourne.');
         return;
     }

     setIsClassifying(true);
     let updatedCount = 0;
     try {
         // On ne classifie que les images non déjà classifiées ou on force ?
         // Disons on classifie tout ce qui n'a pas de tags.
         const unclassifiedElements = elements.filter(el => !el.aiTags || el.aiTags.length === 0);
         
         if (unclassifiedElements.length === 0) {
             toast.info('Info', 'Tous les assets sont déjà classifiés.');
             setIsClassifying(false);
             return;
         }

         toast.info('Classification en cours', `${unclassifiedElements.length} assets à analyser...`);

         for (const element of unclassifiedElements) {
             const asset = assets.find(a => a.id === element.assetId);
             if (!asset) continue;

             // On n'envoie que les images pour l'instant
             if (['jpg','jpeg','png','webp'].includes(asset.format.toLowerCase())) {
                 const result = await window.electron.ollama.classifyElement({
                     elementId: element.id,
                     imagePath: asset.localPath,
                     model: 'llava' // ou autre
                 });
                 if (result.success) {
                     updatedCount++;
                 }
             }
         }
         
     } catch (error) {
         console.error(error);
         toast.error('Erreur', 'Echec de la classification');
     } finally {
         setIsClassifying(false);
         if (updatedCount > 0) {
            toast.success('Classification terminée', `${updatedCount} assets analysés et classés.`);
            loadElements(selectedPortfolioId!); 
         }
     }
  };

  const handleWizardV2Complete = async (wizardData: any) => {
    try {
      // 1. Créer le portfolio
      const portfolioData = {
        userId: 'default', // TODO: Auth
        title: wizardData.basics.title || 'Mon Portfolio',
        mode: wizardData.mode,
        sector: wizardData.sector,
        anonymizationLevel: wizardData.privacy.anonymizationLevel,
        isPrimary: true
      };
      
      const pResult = await window.electron.portfolioV2.create(portfolioData);
      if (!pResult.success || !pResult.id) throw new Error(pResult.error);
      const portfolioId = pResult.id;

      // 2. Créer le profil associé (Indépendant ou Commerce)
      if (wizardData.mode === 'independant') {
          // Mapping approximatif pour l'instant
          await window.electron.portfolioV2.independant.create({
              portfolioId,
              displayName: wizardData.identity.name,
              // ... autres champs
          });
      }

      toast.success('Portfolio créé !');
      setShowWizardV2(false);
      loadPortfoliosV2();
      setSelectedPortfolioId(portfolioId);

    } catch (error) {
      console.error(error);
      toast.error('Erreur création', 'Impossible de créer le portfolio');
    }
  };

  const styles = {
    container: {
      padding: spacing[8],
      maxWidth: '1200px',
      margin: '0 auto',
      minHeight: '80vh',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing[8],
    },
    title: {
      fontSize: typography.fontSize['3xl'],
      fontWeight: typography.fontWeight.bold,
      color: theme.text.primary,
      background: `linear-gradient(135deg, ${theme.text.primary} 0%, ${theme.text.secondary} 100%)`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    section: {
      marginBottom: spacing[8],
    },
    card: {
      backgroundColor: theme.bg.secondary,
      borderRadius: borderRadius.xl,
      padding: spacing[6],
      border: `1px solid ${theme.border.default}`,
      boxShadow: theme.shadow.sm,
      transition: transitions.normal,
      cursor: 'pointer',
      display: 'flex',
      flexDirection: 'column' as const,
      gap: spacing[2],
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: spacing[6],
    },
    tabs: {
        display: 'flex',
        gap: spacing[4],
        marginBottom: spacing[6],
        borderBottom: `1px solid ${theme.border.default}`,
    },
    tab: (active: boolean) => ({
        padding: `${spacing[3]} ${spacing[6]}`,
        cursor: 'pointer',
        borderBottom: active ? `2px solid ${theme.accent.primary}` : '2px solid transparent',
        color: active ? theme.text.primary : theme.text.tertiary,
        fontWeight: active ? typography.fontWeight.bold : typography.fontWeight.medium,
        transition: transitions.fast,
    }),
    button: {
      padding: `${spacing[3]} ${spacing[6]}`,
      backgroundColor: theme.accent.primary,
      color: '#fff',
      borderRadius: borderRadius.lg,
      border: 'none',
      fontWeight: typography.fontWeight.semibold,
      cursor: 'pointer',
      transition: transitions.fast,
      display: 'flex',
      alignItems: 'center',
      gap: spacing[2],
    },
    backButton: {
        background: 'none',
        border: 'none',
        color: theme.text.secondary,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: spacing[2],
        marginBottom: spacing[4],
        fontSize: typography.fontSize.sm,
    }
  };

  if (isLoading) {
    return <div style={{...styles.container, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Chargement...</div>;
  }

  // --- VIEW: DETAIL PORTFOLIO ---
  if (selectedPortfolioId) {
    const selectedPortfolio = portfoliosV2.find((p) => p.id === selectedPortfolioId);
    return (
      <div style={styles.container}>
        <button style={styles.backButton} onClick={() => setSelectedPortfolioId(null)}>
            ← Retour aux portfolios
        </button>

        <div style={styles.header}>
            <div>
                <h1 style={styles.title}>{selectedPortfolio?.title || 'Portfolio'}</h1>
                <p style={{color: theme.text.quaternary}}>{selectedPortfolio?.mode === 'independant' ? 'Profil Indépendant' : 'Profil Commerce'}</p>
            </div>
            {/* Actions globales */}
            <div style={{display: 'flex', gap: spacing[2]}}>
                 <button 
                    onClick={() => setShowGlobalExport(true)}
                    style={{
                        backgroundColor: theme.bg.tertiary,
                        color: theme.text.primary,
                        border: `1px solid ${theme.border.default}`,
                        borderRadius: borderRadius.lg,
                        padding: `${spacing[2]} ${spacing[4]}`,
                        cursor: 'pointer',
                        fontWeight: typography.fontWeight.medium,
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: spacing[2],
                        fontSize: typography.fontSize.sm
                    }}
                >
                    <span>📚</span> Dossier PDF
                </button>
            </div>
        </div>

        {/* --- TABS --- */}
        <div style={styles.tabs}>
            <div style={styles.tab(activeTab === 'assets')} onClick={() => setActiveTab('assets')}>
                Médiathèque ({assets.length})
            </div>
            <div style={styles.tab(activeTab === 'projects')} onClick={() => setActiveTab('projects')}>
                Projets ({projects.length})
            </div>
        </div>

          <div style={{ marginBottom: '2rem' }}>
            {/* --- ONGLET ASSETS --- */}
            {activeTab === 'assets' && (
              <div>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: spacing[4]}}>
                    <div style={{display: 'flex', gap: spacing[2]}}>
                         <AssetImporter 
                            portfolioId={selectedPortfolioId} 
                            onAssetsImported={handleAssetsImported} 
                         />
                         <button 
                            onClick={handleClassifyAssets}
                            disabled={!isOllamaAvailable || isClassifying}
                            style={{...styles.button, backgroundColor: theme.bg.tertiary, color: theme.text.primary, opacity: (!isOllamaAvailable || isClassifying) ? 0.5 : 1}}
                         >
                            {isClassifying ? 'Analyse en cours...' : '✨ Classifier (IA)'}
                         </button>
                    </div>
                </div>
                
                {isLoadingAssets ? (
                  <div style={{ textAlign: 'center', padding: '2rem', color: theme.text.secondary }}>
                    Chargement des assets...
                  </div>
                ) : (
                  <AssetGrid
                    displayableAssets={displayableAssets}
                    onDeleteAsset={handleDeleteAsset}
                    onClickAsset={handleAssetClick}
                    enableDragToProjects={true}
                    emptyMessage="Aucun fichier importé. Cliquez sur 'Importer des fichiers' pour ajouter des images, PDFs ou vidéos."
                  />
                )}
              </div>
            )}

            {/* --- ONGLET PROJETS --- */}
            {activeTab === 'projects' && (
                <div>
                     <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: spacing[4]}}>
                        <button style={styles.button} onClick={handleCreateProject}>
                            + Nouveau Projet
                        </button>
                    </div>

                    {isLoadingProjects ? (
                        <div>Chargement...</div>
                    ) : (
                        <ProjectList 
                            projects={projects}
                            onProjectEdit={handleEditProject} // Renamed from onEdit
                            onProjectDelete={handleDeleteProject} // Renamed from onDelete
                            onProjectClick={handleViewProject} // Renamed from onView
                            onAssetDrop={handleAssetDrop}
                        />
                    )}
                </div>
            )}
          </div>
        
        {/* MODALE ASSISTANT CREATION */}
        {showWizardV2 && (
             <PortfolioWizard 
                onClose={() => setShowWizardV2(false)} 
                onComplete={handleWizardV2Complete} 
             />
        )}

        {/* MODALE CREATION PROJET */}
        {showProjectModal && (
            <ProjectCreateModal
                isOpen={true} // Prop required by the component
                portfolioId={selectedPortfolioId}
                editProject={editingProject || undefined} // Changed prop name to match component definition
                onClose={() => setShowProjectModal(false)}
                onSave={handleSaveProject}
            />
        )}

        {/* MODALE EDITOR PROJET (VIEW) */}
        {viewingProject && (
            <ProjectEditor
                project={viewingProject}
                onClose={handleCloseProjectEditor}
                onProjectUpdate={() => {
                    loadProjects(selectedPortfolioId);
                    loadElements(selectedPortfolioId);
                }}
            />
        )}

        {/* MODALE PREVIEW ASSET */}
        {previewingAssetId && (
          <AssetPreviewModal
            asset={displayableAssets.find(da => da.asset.id === previewingAssetId)?.asset!}
            onClose={() => setPreviewingAssetId(null)}
            onNext={handleNextAsset}
            onPrev={handlePrevAsset}
            hasNext={getPreviewAssetIndex() < displayableAssets.length - 1}
            hasPrev={getPreviewAssetIndex() > 0}
          />
        )}
        {showGlobalExport && (
            <PortfolioExportModal
                projects={projects as any[]} // Skip strict type check for now
                portfolioName={selectedPortfolio?.title || 'Portfolio'}
                onClose={() => setShowGlobalExport(false)}
                onExport={handleGlobalExport}
            />
        )}
      </div>
    );
  }

  // --- VIEW: LISTE PORTFOLIOS ---
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Mes Portfolios</h1>
        <button style={styles.button} onClick={() => setShowWizardV2(true)}>
          + Créer un Portfolio
        </button>
      </div>

      <div style={styles.grid}>
        {portfoliosV2.map((p) => (
          <div
            key={p.id}
            style={styles.card}
            onClick={() => setSelectedPortfolioId(p.id)}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = theme.shadow.md;
                e.currentTarget.style.borderColor = theme.accent.primary;
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = theme.shadow.sm;
                e.currentTarget.style.borderColor = theme.border.default;
            }}
          >
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                 <h3 style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: theme.text.primary }}>
                    {p.title}
                 </h3>
                 {p.isPrimary && <span style={{fontSize: '0.8rem', background: theme.accent.primary, color: 'white', padding: '2px 6px', borderRadius: '4px'}}>Principal</span>}
            </div>
            <div style={{ color: theme.text.secondary, fontSize: typography.fontSize.sm }}>
               {p.mode === 'independant' ? '👤 Indépendant' : '🏢 Commerce'} • {p.sector}
            </div>
            <div style={{ marginTop: 'auto', paddingTop: spacing[4], borderTop: `1px solid ${theme.border.light}`, color: theme.text.tertiary, fontSize: typography.fontSize.xs }}>
                Mis à jour le {new Date(p.updatedAt).toLocaleDateString()}
            </div>
          </div>
        ))}
        {portfoliosV2.length === 0 && (
             <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '4rem', color: theme.text.tertiary, border: `2px dashed ${theme.border.default}`, borderRadius: borderRadius.xl}}>
                 <div style={{fontSize: '3rem', marginBottom: '1rem'}}>🚀</div>
                 <p>Vous n'avez pas encore de portfolio.</p>
                 <p>Cliquez sur "Créer un Portfolio" pour commencer.</p>
             </div>
        )}
      </div>

      {showWizardV2 && (
        <PortfolioWizard
          onClose={() => setShowWizardV2(false)}
          onComplete={handleWizardV2Complete}
        />
      )}
    </div>
  );
};
