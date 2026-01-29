import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../ThemeContext';
import { LinkedInImportModal } from './LinkedInImportModal';
import { NotionImportModal } from './NotionImportModal';

export interface Project {
  id: string;
  title: string;
  description?: string;
  created_at?: string;
}

export interface ProjectImportData {
  selectedProjects: string[];
  linkedInData?: {
    profileUrl?: string;
    rawContent?: string;
  };
  notionData?: {
    content: string;
    fileName?: string;
  };
}

interface ProjectImportProps {
  onComplete: (data: ProjectImportData) => void;
  onBack: () => void;
  onSkip?: () => void;
}

export const ProjectImport: React.FC<ProjectImportProps> = ({ onComplete, onBack, onSkip }) => {
  const { theme } = useTheme();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [showLinkedInModal, setShowLinkedInModal] = useState(false);
  const [showNotionModal, setShowNotionModal] = useState(false);
  const [linkedInData, setLinkedInData] = useState<{ profileUrl?: string; rawContent?: string }>();
  const [notionData, setNotionData] = useState<{ content: string; fileName?: string }>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      // @ts-ignore
      const result = await window.electron.invoke('db-get-all-projects');
      if (result.success) {
        setProjects(result.projects || []);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleProject = (projectId: string) => {
    setSelectedProjects(prev =>
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleContinue = () => {
    onComplete({
      selectedProjects,
      linkedInData,
      notionData
    });
  };

  const handleLinkedInImport = (data: { profileUrl?: string; rawContent?: string }) => {
    setLinkedInData(data);
    setShowLinkedInModal(false);
  };

  const handleNotionImport = (data: { content: string; fileName?: string }) => {
    setNotionData(data);
    setShowNotionModal(false);
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        color: theme.text.secondary,
        fontSize: '1rem'
      }}>
        Chargement de vos projets...
      </div>
    );
  }

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: theme.bg.primary,
      padding: '2rem'
    }}>
      {/* Header with AI prompt */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{
            width: '40px',
            height: '40px',
            backgroundColor: `${theme.accent.primary}22`,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            🤖
          </div>
          <div style={{
            backgroundColor: theme.bg.secondary,
            borderRadius: '16px',
            borderTopLeftRadius: '4px',
            padding: '1rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
            border: `1px solid ${theme.border.light}`,
            maxWidth: '600px'
          }}>
            <p style={{
              fontWeight: 600,
              color: theme.text.primary,
              marginBottom: '0.25rem',
              fontSize: '1rem'
            }}>
              Souhaitez-vous importer des projets existants ?
            </p>
            <p style={{
              fontSize: '0.9rem',
              color: theme.text.secondary,
              margin: 0
            }}>
              Sélectionnez des projets SOUVERAIN déjà créés, ou importez-en depuis LinkedIn ou Notion.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', marginBottom: '2rem' }}>
        {/* Import buttons */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <button
            onClick={() => setShowLinkedInModal(true)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '1.25rem',
              borderRadius: '12px',
              border: `2px solid ${linkedInData ? theme.accent.primary : theme.border.default}`,
              backgroundColor: linkedInData ? `${theme.accent.primary}11` : theme.bg.secondary,
              cursor: 'pointer',
              transition: 'all 0.2s',
              outline: 'none'
            }}
            onMouseEnter={(e) => {
              if (!linkedInData) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <span style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💼</span>
            <span style={{
              fontWeight: 600,
              color: theme.text.primary,
              fontSize: '0.95rem',
              textAlign: 'center'
            }}>
              {linkedInData ? '✓ LinkedIn importé' : 'Importer LinkedIn'}
            </span>
          </button>

          <button
            onClick={() => setShowNotionModal(true)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              padding: '1.25rem',
              borderRadius: '12px',
              border: `2px solid ${notionData ? theme.accent.primary : theme.border.default}`,
              backgroundColor: notionData ? `${theme.accent.primary}11` : theme.bg.secondary,
              cursor: 'pointer',
              transition: 'all 0.2s',
              outline: 'none'
            }}
            onMouseEnter={(e) => {
              if (!notionData) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <span style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📝</span>
            <span style={{
              fontWeight: 600,
              color: theme.text.primary,
              fontSize: '0.95rem',
              textAlign: 'center'
            }}>
              {notionData ? '✓ Notion importé' : 'Importer Notion'}
            </span>
          </button>
        </div>

        {/* Existing projects section */}
        {projects.length > 0 && (
          <div>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: theme.text.primary,
              marginBottom: '1rem'
            }}>
              Vos projets SOUVERAIN
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '1rem'
            }}>
              {projects.map(project => {
                const isSelected = selectedProjects.includes(project.id);
                return (
                  <button
                    key={project.id}
                    onClick={() => toggleProject(project.id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      padding: '1rem',
                      borderRadius: '12px',
                      border: `2px solid ${isSelected ? theme.accent.primary : theme.border.default}`,
                      backgroundColor: isSelected ? `${theme.accent.primary}11` : theme.bg.secondary,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      outline: 'none',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{
                      width: '100%',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{
                        fontWeight: 600,
                        color: theme.text.primary,
                        fontSize: '0.95rem'
                      }}>
                        {project.title}
                      </span>
                      {isSelected && (
                        <span style={{
                          fontSize: '1.25rem',
                          color: theme.accent.primary
                        }}>
                          ✓
                        </span>
                      )}
                    </div>
                    {project.description && (
                      <p style={{
                        fontSize: '0.85rem',
                        color: theme.text.secondary,
                        margin: 0,
                        lineHeight: 1.4,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {project.description}
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {projects.length === 0 && !linkedInData && !notionData && (
          <div style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            color: theme.text.tertiary
          }}>
            <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>📂</span>
            <p style={{ margin: 0, fontSize: '0.95rem' }}>
              Aucun projet trouvé. Importez depuis LinkedIn ou Notion pour commencer.
            </p>
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        paddingTop: '1rem',
        borderTop: `1px solid ${theme.border.light}`
      }}>
        <button
          onClick={onBack}
          style={{
            padding: '0.875rem 1.75rem',
            borderRadius: '12px',
            border: `1px solid ${theme.border.default}`,
            backgroundColor: theme.bg.secondary,
            color: theme.text.primary,
            fontSize: '0.95rem',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s',
            outline: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.bg.tertiary || theme.bg.secondary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = theme.bg.secondary;
          }}
        >
          ← Retour
        </button>

        <button
          onClick={handleContinue}
          style={{
            padding: '0.875rem 1.75rem',
            borderRadius: '12px',
            border: 'none',
            backgroundColor: theme.accent.primary,
            color: '#FFFFFF',
            fontSize: '0.95rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            outline: 'none'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          Continuer →
        </button>
      </div>

      {/* Modals */}
      {showLinkedInModal && (
        <LinkedInImportModal
          onClose={() => setShowLinkedInModal(false)}
          onImport={handleLinkedInImport}
        />
      )}
      {showNotionModal && (
        <NotionImportModal
          onClose={() => setShowNotionModal(false)}
          onImport={handleNotionImport}
        />
      )}
    </div>
  );
};
