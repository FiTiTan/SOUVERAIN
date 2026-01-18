import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../ThemeContext';
import { typography, borderRadius, transitions } from '../../design-system';
import type { Portfolio } from '../../types/portfolio';
import { PortfolioEmptyState } from './PortfolioEmptyState';
import { PortfolioCard } from './PortfolioCard';
import { PortfolioProjectCard } from './PortfolioProjectCard';
import { PortfolioCreateModal } from './PortfolioCreateModal';
import { PortfolioEditor } from './PortfolioEditor';
import { PortfolioImportModal } from './PortfolioImportModal';
import { PortfolioProjectEditor } from './PortfolioProjectEditor';
import { PortfolioProjectViewer } from './PortfolioProjectViewer';

type ViewMode = 'list' | 'editor' | 'projectEditor' | 'projectViewer';
type TabId = 'portfolios' | 'projects';
type ImportSource = 'github' | 'local' | null;

export const PortfolioModule: React.FC = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabId>('projects');
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importSource, setImportSource] = useState<ImportSource>(null);
  const [showImportDropdown, setShowImportDropdown] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [activePortfolioId, setActivePortfolioId] = useState<string | null>(null);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [viewingProject, setViewingProject] = useState<any | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Charger les portfolios et projets au mount
  useEffect(() => {
    loadData();
  }, []);

  // Fermer dropdown au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowImportDropdown(false);
      }
    };

    if (showImportDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showImportDropdown]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([loadPortfolios(), loadProjects()]);
    } catch (error) {
      console.error('[PortfolioModule] Erreur chargement:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadPortfolios = async () => {
    try {
      const result = await window.electron.portfolio.getAll();
      if (result.success) {
        setPortfolios(result.portfolios || []);
      }
    } catch (error) {
      console.error('[PortfolioModule] Erreur chargement portfolios:', error);
    }
  };

  const loadProjects = async () => {
    try {
      // Récupérer tous les projets (tous portfolios confondus pour V2)
      const allPortfolios = await window.electron.portfolio.getAll();
      if (allPortfolios.success && allPortfolios.portfolios) {
        const allProjects: any[] = [];
        for (const portfolio of allPortfolios.portfolios) {
          const result = await window.electron.portfolio.getAllProjects(portfolio.id);
          if (result.success && result.projects) {
            allProjects.push(...result.projects);
          }
        }
        // Filtrer uniquement les projets V2 (ceux avec source_type)
        const v2Projects = allProjects.filter((p) => p.source_type);
        setProjects(v2Projects);
      }
    } catch (error) {
      console.error('[PortfolioModule] Erreur chargement projets:', error);
    }
  };

  const handleCreateSuccess = (portfolioId: string) => {
    setShowCreateModal(false);
    loadPortfolios();
    // Ouvrir l'éditeur pour le nouveau portfolio
    setActivePortfolioId(portfolioId);
    setViewMode('editor');
  };

  const handleEdit = (portfolioId: string) => {
    setActivePortfolioId(portfolioId);
    setViewMode('editor');
  };

  const handleDelete = async (portfolioId: string) => {
    try {
      const result = await window.electron.portfolio.delete(portfolioId);
      if (result.success) {
        loadPortfolios();
      } else {
        alert('Erreur lors de la suppression du portfolio');
      }
    } catch (error) {
      console.error('[PortfolioModule] Erreur suppression:', error);
      alert('Erreur lors de la suppression du portfolio');
    }
  };

  const handleBackToList = () => {
    setViewMode('list');
    setActivePortfolioId(null);
    setActiveProjectId(null);
    setViewingProject(null);
    loadData(); // Rafraîchir toutes les données
  };

  // Gestion projets V2
  const handleImportProject = (source: 'github' | 'local') => {
    setImportSource(source);
    setShowImportModal(true);
    setShowImportDropdown(false);
  };

  const handleImportSuccess = () => {
    setShowImportModal(false);
    setImportSource(null);
    loadProjects();
  };

  const handleViewProject = (project: any) => {
    setViewingProject(project);
    setViewMode('projectViewer');
  };

  const handleEditProject = (projectId: string) => {
    setActiveProjectId(projectId);
    setViewMode('projectEditor');
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      const result = await window.electron.portfolio.deleteProject(projectId);
      if (result.success) {
        loadProjects();
      } else {
        alert('Erreur lors de la suppression du projet');
      }
    } catch (error) {
      console.error('[PortfolioModule] Erreur suppression projet:', error);
      alert('Erreur lors de la suppression du projet');
    }
  };

  const styles = {
    container: {
      padding: '2rem',
      maxWidth: '1400px',
      margin: '0 auto',
      minHeight: '100vh',
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
    },
    title: {
      fontSize: typography.fontSize['3xl'],
      fontWeight: typography.fontWeight.bold,
      color: theme.text.primary,
      margin: 0,
    },
    tabs: {
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '2rem',
      borderBottom: `1px solid ${theme.border.light}`,
    },
    tab: {
      padding: '0.75rem 1.5rem',
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium,
      color: theme.text.secondary,
      backgroundColor: 'transparent',
      border: 'none',
      borderBottom: '2px solid transparent',
      cursor: 'pointer',
      transition: transitions.fast,
    },
    tabActive: {
      color: theme.accent.primary,
      borderBottomColor: theme.accent.primary,
    },
    addButton: {
      padding: '0.75rem 1.5rem',
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: '#FFFFFF',
      backgroundColor: theme.accent.primary,
      border: 'none',
      borderRadius: borderRadius.lg,
      cursor: 'pointer',
      transition: transitions.normal,
      boxShadow: theme.shadow.sm,
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    dropdownContainer: {
      position: 'relative' as const,
    },
    dropdown: {
      position: 'absolute' as const,
      top: '100%',
      right: 0,
      marginTop: '0.5rem',
      backgroundColor: theme.bg.elevated,
      border: `1px solid ${theme.border.default}`,
      borderRadius: borderRadius.lg,
      boxShadow: theme.shadow.lg,
      padding: '0.5rem',
      zIndex: 10,
      minWidth: '220px',
    },
    dropdownItem: {
      width: '100%',
      padding: '0.75rem 1rem',
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: theme.text.primary,
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: borderRadius.md,
      cursor: 'pointer',
      textAlign: 'left' as const,
      transition: transitions.fast,
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    dropdownDivider: {
      height: '1px',
      backgroundColor: theme.border.light,
      margin: '0.5rem 0',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
      gap: '1.5rem',
    },
    loading: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '50vh',
      gap: '1rem',
    },
    loadingSpinner: {
      fontSize: '3rem',
      animation: 'spin 2s linear infinite',
    },
    loadingText: {
      fontSize: typography.fontSize.lg,
      color: theme.text.secondary,
    },
    emptyState: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '50vh',
      textAlign: 'center' as const,
      gap: '1rem',
    },
    emptyIcon: {
      fontSize: '4rem',
    },
    emptyTitle: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text.primary,
    },
    emptyDescription: {
      fontSize: typography.fontSize.base,
      color: theme.text.secondary,
      maxWidth: '400px',
    },
  };

  // Loading state
  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <div style={styles.loadingSpinner}>⏳</div>
          <div style={styles.loadingText}>Chargement des portfolios...</div>
        </div>
      </div>
    );
  }

  // Vue éditeur portfolio legacy
  if (viewMode === 'editor' && activePortfolioId) {
    return <PortfolioEditor portfolioId={activePortfolioId} onBack={handleBackToList} />;
  }

  // Vue éditeur projet V2
  if (viewMode === 'projectEditor' && activeProjectId) {
    return (
      <PortfolioProjectEditor
        projectId={activeProjectId}
        onClose={handleBackToList}
        onSave={handleBackToList}
      />
    );
  }

  // Vue projet V2
  if (viewMode === 'projectViewer' && viewingProject) {
    return (
      <PortfolioProjectViewer
        project={viewingProject}
        onClose={handleBackToList}
        onEdit={() => {
          setActiveProjectId(viewingProject.id);
          setViewMode('projectEditor');
        }}
      />
    );
  }

  // Vue liste
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Portfolio</h1>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'portfolios' ? styles.tabActive : {}),
          }}
          onClick={() => setActiveTab('portfolios')}
        >
          Portfolios
        </button>
        <button
          style={{
            ...styles.tab,
            ...(activeTab === 'projects' ? styles.tabActive : {}),
          }}
          onClick={() => setActiveTab('projects')}
        >
          Projets {projects.length > 0 && `(${projects.length})`}
        </button>
      </div>

      {/* Content Portfolios */}
      {activeTab === 'portfolios' && (
        <>
          {portfolios.length > 0 && (
            <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                style={styles.addButton}
                onClick={() => setShowCreateModal(true)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.accent.secondary;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = theme.shadow.md;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.accent.primary;
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = theme.shadow.sm;
                }}
              >
                <span>+</span>
                <span>Nouveau portfolio</span>
              </button>
            </div>
          )}

          {portfolios.length === 0 ? (
            <PortfolioEmptyState onCreateClick={() => setShowCreateModal(true)} />
          ) : (
            <div style={styles.grid}>
              {portfolios.map((portfolio) => (
                <PortfolioCard
                  key={portfolio.id}
                  portfolio={portfolio}
                  onEdit={() => handleEdit(portfolio.id)}
                  onDelete={() => handleDelete(portfolio.id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Content Projets V2 */}
      {activeTab === 'projects' && (
        <>
          <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
            <div style={styles.dropdownContainer} ref={dropdownRef}>
              <button
                style={styles.addButton}
                onClick={() => setShowImportDropdown(!showImportDropdown)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.accent.secondary;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = theme.shadow.md;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.accent.primary;
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = theme.shadow.sm;
                }}
              >
                <span>+</span>
                <span>Ajouter un projet</span>
                <span style={{ fontSize: '0.75rem' }}>▼</span>
              </button>

              {showImportDropdown && (
                <div style={styles.dropdown}>
                  <button
                    style={styles.dropdownItem}
                    onClick={() => handleImportProject('github')}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme.bg.secondary;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <span style={{ fontSize: '1.25rem' }}>🐙</span>
                    <span>Depuis GitHub</span>
                  </button>
                  <button
                    style={styles.dropdownItem}
                    onClick={() => handleImportProject('local')}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme.bg.secondary;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <span style={{ fontSize: '1.25rem' }}>📁</span>
                    <span>Depuis un dossier local</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {projects.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📦</div>
              <h2 style={styles.emptyTitle}>Aucun projet</h2>
              <p style={styles.emptyDescription}>
                Importez vos projets depuis GitHub ou un dossier local pour générer automatiquement
                des études de cas professionnelles.
              </p>
              <button
                style={styles.addButton}
                onClick={() => setShowImportDropdown(true)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.accent.secondary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.accent.primary;
                }}
              >
                <span>+</span>
                <span>Importer un projet</span>
              </button>
            </div>
          ) : (
            <div style={styles.grid}>
              {projects.map((project) => (
                <PortfolioProjectCard
                  key={project.id}
                  project={project}
                  onView={() => handleViewProject(project)}
                  onEdit={() => handleEditProject(project.id)}
                  onDelete={() => handleDeleteProject(project.id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal création portfolio */}
      {showCreateModal && (
        <PortfolioCreateModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
          existingSlugs={portfolios.map((p) => p.slug)}
        />
      )}

      {/* Modal import projet */}
      {showImportModal && importSource && (
        <PortfolioImportModal
          source={importSource}
          onClose={() => {
            setShowImportModal(false);
            setImportSource(null);
          }}
          onSuccess={handleImportSuccess}
        />
      )}

      {/* Animation CSS */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
