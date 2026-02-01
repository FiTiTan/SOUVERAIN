import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../ThemeContext';
import { useProjects, type Project } from '../../../hooks/useProjects';

import { ProjectCreationWizard } from './wizard/ProjectCreationWizard';
import { ProjectEditor } from './ProjectEditor';
import { ProjectCard } from './ProjectCard';
import { ExportModal } from '../ExportModal';
import { PortfolioSettingsModal } from '../PortfolioSettingsModal';
import { generatePortfolioPDF } from '../../../services/pdfExporter';
import { renderPortfolioHTML } from '../../../services/renderService';
import { generateQRCodeDataURL } from '../../../services/qrService';

interface ProjectHubProps {
    onBack?: () => void;
}

export const ProjectHub: React.FC<ProjectHubProps> = ({ onBack }) => {
    const { theme } = useTheme();
    const [activePortfolioId, setActivePortfolioId] = useState<string | undefined>(undefined);
    const [activePortfolio, setActivePortfolio] = useState<any>(null);

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [exportingProject, setExportingProject] = useState<Project | null>(null);
    const [exportScope, setExportScope] = useState<'single' | 'global'>('single');



    // Fetch Portfolios
    const fetchPortfolios = async () => {
        try {
            // @ts-ignore
            const result = await window.electron.portfolio.getAll();
            if (result.success && result.portfolios.length > 0) {
                const primary = result.portfolios.find((p: any) => p.is_primary) || result.portfolios[0];
                setActivePortfolioId(primary.id);
                setActivePortfolio(primary);
            }
        } catch (e) {
            console.error("Failed to fetch portfolios", e);
        }
    };

    useEffect(() => {
        fetchPortfolios();
    }, []);



    const { projects, loading, error, deleteProject, updateProject, linkMediaToProject, unlinkMediaFromProject, fetchProjects } = useProjects(activePortfolioId);

    const handleProjectCreated = (_projectId: string) => {
        setIsCreateModalOpen(false);
        fetchProjects();
    };

    const handleUpdateProject = async (project: Project) => {
        const result = await updateProject(project.id, project);
        if (result && !result.success) {
            alert(`Erreur mise à jour: ${result.error}`);
        } else {
            setIsEditModalOpen(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm("Supprimer ce projet ?")) {
            await deleteProject(id);
        }
    };

    const handleEdit = (project: Project) => {
        setEditingProject(project);
        setIsEditModalOpen(true);
    };

    const handleExportGlobal = () => {
        setExportingProject(null);
        setExportScope('global');
        setIsExportModalOpen(true);
    };

    const handleExportSingle = (project: Project) => {
        setExportingProject(project);
        setExportScope('single');
        setIsExportModalOpen(true);
    };

    const handleExportConfirm = async (options: { ghostMode: boolean; includeMedia: boolean; format: 'pdf' | 'html' }) => {
        // ... (Keep existing export logic)
        try {
             if (exportScope === 'global') {
                if (options.format === 'html') {
                    const qrCode = await generateQRCodeDataURL(`https://souverain.io/p/${activePortfolio.slug || 'demo'}`);
                    const htmlContent = renderPortfolioHTML(activePortfolio, projects, qrCode);
                    // @ts-ignore
                    const result = await window.electron.invoke('export-html-content', { 
                        portfolioId: activePortfolio.id, html: htmlContent, slug: activePortfolio.slug || 'portfolio'
                    });
                     if (result.success) alert("Export Web réussi !");
                     else alert("Erreur Export Web: " + result.error);
                } else if (options.format === 'pdf') {
                    const qrCode = await generateQRCodeDataURL(`https://souverain.io/p/${activePortfolio.slug || 'demo'}`);
                    const htmlContent = renderPortfolioHTML(activePortfolio, projects, qrCode);
                    // @ts-ignore
                    const result = await window.electron.invoke('export-pdf-global', { 
                        html: htmlContent, slug: activePortfolio.slug || 'portfolio'
                    });
                     if (result.success) alert("Export PDF réussi !");
                     else alert("Erreur Export PDF: " + result.error);
                }
            } else if (exportingProject) {
                // @ts-ignore
                const result = await window.electron.portfolioV2.projects.getElements(exportingProject.id);
                let elements: any[] = [];
                if (Array.isArray(result)) elements = result;
                else if (result.success && (result.elements || result.media)) elements = result.elements || result.media;

                const mappedAssets = elements.map(el => ({
                    asset: {
                        localPath: el.file_path || el.localPath,
                        format: el.file_type || el.format || 'unknown',
                        originalFilename: el.original_filename || el.originalFilename
                    }
                }));

                const assetsToExport = options.includeMedia ? mappedAssets : [];
                // @ts-ignore
                await generatePortfolioPDF(exportingProject, assetsToExport, { ghostMode: { enabled: options.ghostMode } });
            }
        } catch (e: any) {
            console.error("Export failed:", e);
            alert(`Erreur lors de l'export: ${e.message}`);
        }
        setIsExportModalOpen(false);
        setExportingProject(null);
    };

    return (
        <div style={{ padding: '2rem', height: '100%', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {onBack && (
                        <button
                            onClick={onBack}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 1rem',
                                backgroundColor: 'transparent',
                                border: `1px solid ${theme.border.default}`,
                                borderRadius: '8px',
                                color: theme.text.secondary,
                                fontSize: '0.95rem',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = theme.accent.primary;
                                e.currentTarget.style.color = theme.accent.primary;
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = theme.border.default;
                                e.currentTarget.style.color = theme.text.secondary;
                            }}
                        >
                            ← Retour
                        </button>
                    )}
                     <h1 style={{ color: theme.text.primary, margin: 0, fontSize: '1.8rem' }}>Mes Projets</h1>
                </div>

                <div className="flex gap-4">
                     <button
                        onClick={() => setIsSettingsOpen(true)}
                        disabled={!activePortfolio}
                        className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium opacity-80 hover:opacity-100"
                    >
                        ⚙️ Paramètres Portfolio
                    </button>

                    <button
                        onClick={handleExportGlobal}
                        disabled={!activePortfolioId}
                        style={{
                            backgroundColor: 'transparent',
                            color: theme.accent.primary,
                            border: `2px solid ${theme.accent.secondary}`,
                            padding: '10px 20px',
                            borderRadius: '8px',
                            cursor: activePortfolioId ? 'pointer' : 'not-allowed',
                            fontWeight: 600
                        }}
                    >
                        📤 Exporter le Site
                    </button>
                    <button
                        onClick={() => {
                            console.log("New Project Clicked. ActivePortfolioId:", activePortfolioId);
                            setIsCreateModalOpen(true);
                        }}
                        disabled={!activePortfolioId}
                        style={{
                            backgroundColor: theme.accent.primary,
                            color: '#fff',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '8px',
                            cursor: activePortfolioId ? 'pointer' : 'not-allowed',
                            fontWeight: 600,
                            opacity: activePortfolioId ? 1 : 0.5
                        }}
                    >
                        + Nouveau Projet
                    </button>
                </div>
            </div>

            {error && <div className="bg-red-100 text-red-800 p-4 rounded mb-4">Error: {error}</div>}

            {/* Content Area - Just Projects List */}
            {loading ? (
                 <div style={{ color: theme.text.secondary }}>Chargement...</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', overflowY: 'auto' }}>
                    {projects.map(project => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            onExport={handleExportSingle}
                        />
                    ))}
                    {!loading && projects.length === 0 && (
                        <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: theme.text.tertiary, border: `2px dashed ${theme.border.light}`, borderRadius: '12px' }}>
                            Aucun projet. Cliquez sur "Nouveau Projet" pour commencer l'expérience IA.
                        </div>
                    )}
                </div>
            )}

            {/* Modals */}
            {activePortfolioId && (
                <ProjectCreationWizard
                    isOpen={isCreateModalOpen}
                    onClose={() => {
                        console.log("Closing Wizard via Parent");
                        setIsCreateModalOpen(false);
                    }}
                    onSuccess={handleProjectCreated}
                    portfolioId={activePortfolioId}
                />
            )}
            
            {editingProject && (
                <ProjectEditor
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    onUpdate={handleUpdateProject}
                    project={editingProject}
                    linkMediaToProject={linkMediaToProject}
                    unlinkMediaFromProject={unlinkMediaFromProject}
                />
            )}

            {activePortfolio && (
                <PortfolioSettingsModal
                    isOpen={isSettingsOpen}
                    onClose={() => setIsSettingsOpen(false)}
                    portfolio={activePortfolio}
                    projects={projects}
                    onUpdate={fetchPortfolios}
                />
            )}

             <ExportModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                onExport={handleExportConfirm}
                scope={exportScope}
            />


        </div>
    );
};
