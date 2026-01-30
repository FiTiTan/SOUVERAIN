
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../ThemeContext';
import type { Project, ProjectElement } from '../../../hooks/useProjects';
import { MediaPickerModal } from '../mediatheque/MediaPickerModal';
import { AIButton } from './AIButton';
import { AnonymizationNotice } from '../anonymization/AnonymizationNotice';

interface ProjectEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (project: Project) => Promise<void>;
  project: Project | null;
  linkMediaToProject: (projectId: string, mediaIds: string[]) => Promise<any>;
  unlinkMediaFromProject: (projectMediaId: string) => Promise<any>;
}

export const ProjectEditor: React.FC<ProjectEditorProps> = ({ isOpen, onClose, onUpdate, project, linkMediaToProject, unlinkMediaFromProject }) => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [isMediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [generatingField, setGeneratingField] = useState<string | null>(null);

  // Anonymization Flow
  const [showAnonymizationNotice, setShowAnonymizationNotice] = useState(false);
  const [pendingGeneration, setPendingGeneration] = useState<{field: string, text: string, setter: (s:string)=>void} | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [briefText, setBriefText] = useState('');
  const [challengeText, setChallengeText] = useState('');
  const [solutionText, setSolutionText] = useState('');
  const [resultText, setResultText] = useState('');
  
  // Extended interface for joined media data
  interface JoinedProjectMedia extends ProjectElement {
      localPath?: string;
      thumbnailPath?: string;
      originalFilename?: string;
      fileType?: string;
      file_path?: string; // DB field
  }

  const [linkedMedia, setLinkedMedia] = useState<JoinedProjectMedia[]>([]);

  // Fetch real media details when project loads or updates
  const fetchLinkedMedia = async () => {
      if (!project) return;
      try {
          // @ts-ignore
          const result = await window.electron.portfolioV2.projects.getElements(project.id);
          if (Array.isArray(result)) {
              setLinkedMedia(result);
          } else if (result.success && (result.elements || result.media)) {
               setLinkedMedia(result.elements || result.media);
          }
      } catch (e) {
          console.error("Error fetching linked media:", e);
      }
  };

  useEffect(() => {
    if (project) {
      setTitle(project.title || '');
      setBriefText(project.brief_text || '');
      setChallengeText(project.challenge_text || '');
      setSolutionText(project.solution_text || '');
      setResultText(project.result_text || '');
      // Initial load from props if available, but fetch is better for details
      if (project.elements) {
          setLinkedMedia(project.elements); 
      }
      fetchLinkedMedia();
    }
  }, [project]);

  // Refresh media after linking/unlinking
  const handleMediaSelect = async (mediaIds: string[]) => {
    await linkMediaToProject(project!.id, mediaIds);
    fetchLinkedMedia();
  };

  const handleDetachMedia = async (projectMediaId: string) => {
    await unlinkMediaFromProject(projectMediaId);
    fetchLinkedMedia();
  };

  const executeGeneration = async (field: string, currentText: string, setter: (s: string) => void) => {
    setGeneratingField(field);
    try {
        // Build context from other fields to verify consistency
        const context = `
Titres: ${title}
Brief: ${briefText}
Challenge: ${challengeText}
Solution: ${solutionText}
Résultat: ${resultText}
        `.trim();

        // @ts-ignore
        const result = await window.electron.invoke('ollama-generate-project-field', {
            field,
            context,
            currentText
        });

        if (result.success && result.text) {
            setter(result.text);
        } else {
            console.error("AI Gen Error:", result.error);
            alert("Erreur génération IA: " + result.error);
        }
    } catch (e) {
        console.error(e);
    } finally {
        setGeneratingField(null);
        setPendingGeneration(null);
    }
  };

  const handleGenerateClick = (field: string, currentText: string, setter: (s: string) => void) => {
      // Check if user has consented to anonymization (mock logic: check sessionStorage)
      const hasConsented = sessionStorage.getItem('anonymization_consented');
      if (hasConsented) {
          executeGeneration(field, currentText, setter);
      } else {
          setPendingGeneration({ field, text: currentText, setter });
          setShowAnonymizationNotice(true);
      }
  };

  const handleAnonymizationConfirm = () => {
      sessionStorage.setItem('anonymization_consented', 'true');
      setShowAnonymizationNotice(false);
      if (pendingGeneration) {
          executeGeneration(pendingGeneration.field, pendingGeneration.text, pendingGeneration.setter);
      }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !project) return;
    // ... submit logic ...
    setLoading(true);
    try {
      await onUpdate({
        ...project,
        title,
        brief_text: briefText,
        challenge_text: challengeText,
        solution_text: solutionText,
        result_text: resultText,
        elements: linkedMedia,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ... styles ...
  const styles = {
    label: {
        display: 'block',
        marginBottom: '0.5rem',
        color: theme.text.secondary,
        fontSize: '0.9rem',
        fontWeight: 600
    },
    input: {
        width: '100%',
        padding: '10px',
        borderRadius: '6px',
        border: `1px solid ${theme.border.default}`,
        backgroundColor: theme.bg.primary,
        color: theme.text.primary,
        outline: 'none',
        fontFamily: 'inherit'
    },
    textarea: {
        width: '100%',
        padding: '10px',
        borderRadius: '6px',
        border: `1px solid ${theme.border.default}`,
        backgroundColor: theme.bg.primary,
        color: theme.text.primary,
        outline: 'none',
        fontFamily: 'inherit',
        minHeight: '80px',
        resize: 'vertical' as const
    },
    section: {
        marginBottom: '1.25rem'
    },
    headerContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.5rem'
    },
    labelClean: {
        color: theme.text.secondary,
        fontSize: '0.9rem',
        fontWeight: 600,
        margin: 0
    }
  };

  if (!isOpen || !project) return null;

  if (showAnonymizationNotice) {
      return (
        <div style={{
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1100, // Higher than modal
            backdropFilter: 'blur(5px)'
        }}>
           <div style={{ backgroundColor: theme.bg.primary, borderRadius: '12px', overflow: 'hidden' }}>
               <AnonymizationNotice onContinue={handleAnonymizationConfirm} />
               <div style={{ padding: '1rem', textAlign: 'center' }}>
                   <button onClick={() => setShowAnonymizationNotice(false)} style={{ background: 'transparent', border: 'none', color: theme.text.secondary, cursor: 'pointer' }}>Annuler</button>
               </div>
           </div>
        </div>
      );
  }

  return (
    <>
      <div style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
      }}>
        <div 
            onClick={(e) => e.stopPropagation()}
            style={{
            backgroundColor: theme.bg.secondary,
            borderRadius: '12px',
            width: '100%',
            maxWidth: '1000px', // Wider Layout
            height: '90vh',
            display: 'flex',
            flexDirection: 'column',
            border: `1px solid ${theme.border.default}`,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{ padding: '1.5rem', borderBottom: `1px solid ${theme.border.default}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <input
                      type="text"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      placeholder="Titre du projet"
                      style={{ 
                          fontSize: '1.5rem', 
                          fontWeight: 'bold', 
                          background: 'transparent', 
                          border: 'none', 
                          color: theme.text.primary,
                          outline: 'none',
                          width: '100%'
                      }}
                  />
                  <div style={{ fontSize: '0.8rem', color: theme.text.secondary, marginTop: '0.2rem' }}>
                       {project.projectType || 'Projet'} • {project.status || 'En cours'}
                  </div>
              </div>
              <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: theme.text.secondary, fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
          </div>

          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
              {/* Main Content (Left) */}
              <div style={{ flex: 2, padding: '2rem', overflowY: 'auto', borderRight: `1px solid ${theme.border.default}` }}>
                <form id="project-edit-form" onSubmit={handleSubmit}>
                  <div style={styles.section}>
                      <div style={styles.headerContainer}>
                          <label style={styles.labelClean}>Contexte / Brief</label>
                          <AIButton 
                              label="Rédiger" 
                              loading={generatingField === 'brief'}
                              onClick={() => handleGenerateClick('brief', briefText, setBriefText)}
                          />
                      </div>
                      <textarea
                          value={briefText}
                          onChange={e => setBriefText(e.target.value)}
                          placeholder="Quel était le besoin initial ? Pour quel client ?"
                          style={{ ...styles.textarea, minHeight: '120px' }}
                      />
                  </div>
                  <div style={styles.section}>
                      <div style={styles.headerContainer}>
                          <label style={styles.labelClean}>Le Défi</label>
                          <AIButton 
                              label="Améliorer" 
                              loading={generatingField === 'challenge'}
                              onClick={() => handleGenerateClick('challenge', challengeText, setChallengeText)}
                          />
                      </div>
                      <textarea
                          value={challengeText}
                          onChange={e => setChallengeText(e.target.value)}
                          placeholder="Quelles étaient les contraintes techniques ou créatives ?"
                          style={styles.textarea}
                      />
                  </div>
                  <div style={styles.section}>
                      <div style={styles.headerContainer}>
                          <label style={styles.labelClean}>La Solution</label>
                          <AIButton 
                              label="Expliquer" 
                              loading={generatingField === 'solution'}
                              onClick={() => handleGenerateClick('solution', solutionText, setSolutionText)}
                          />
                      </div>
                      <textarea
                          value={solutionText}
                          onChange={e => setSolutionText(e.target.value)}
                          placeholder="Quelle approche avez-vous choisie ? Pourquoi ?"
                          style={styles.textarea}
                      />
                  </div>
                  <div style={styles.section}>
                      <div style={styles.headerContainer}>
                          <label style={styles.labelClean}>Le Résultat</label>
                          <AIButton 
                              label="Valoriser" 
                              loading={generatingField === 'result'}
                              onClick={() => handleGenerateClick('result', resultText, setResultText)}
                          />
                      </div>
                      <textarea
                          value={resultText}
                          onChange={e => setResultText(e.target.value)}
                          placeholder="Quels ont été les impacts ? (Chiffres, satisfaction client...)"
                          style={styles.textarea}
                      />
                  </div>
                </form>
              </div>

              {/* Sidebar (Right) - Media & Meta */}
              <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', backgroundColor: theme.bg.tertiary }}>
                <div style={styles.section}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <label style={styles.labelClean}>Galerie Média ({linkedMedia.length})</label>
                      <button
                          type="button"
                          onClick={() => setMediaPickerOpen(true)}
                          style={{
                              backgroundColor: 'transparent',
                              color: theme.accent.primary,
                              border: `1px dashed ${theme.accent.secondary}`,
                              borderRadius: '6px',
                              padding: '4px 8px',
                              cursor: 'pointer',
                              fontSize: '0.8rem'
                          }}
                      >
                          + Ajouter
                      </button>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {linkedMedia.map(media => (
                      <div key={media.id} style={{ display: 'flex', gap: '10px', borderRadius: '8px', padding: '8px', backgroundColor: theme.bg.primary, border: `1px solid ${theme.border.default}` }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0 }}>
                            {(media.localPath || media.file_path) ? (
                                <img 
                                    src={`file://${(media.localPath || media.file_path || '').replace(/\\/g, '/')}`} 
                                    alt="Thumb"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                /> 
                            ) : <div style={{width:'100%', height:'100%', background: '#eee'}}></div>}
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{media.originalFilename}</div>
                            <div style={{ fontSize: '0.75rem', color: theme.text.secondary }}>{media.fileType || 'Fichier'}</div>
                            <button onClick={() => handleDetachMedia(media.id)} style={{ color: 'red', background:'none', border:'none', cursor:'pointer', fontSize:'0.7rem', padding: 0, marginTop: '4px' }}>Détacher</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: '2rem' }}>
                    <button
                        type="submit"
                        form="project-edit-form"
                        disabled={!title.trim() || loading}
                        style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: theme.accent.primary,
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fff',
                            cursor: loading ? 'wait' : 'pointer',
                            opacity: !title.trim() ? 0.5 : 1,
                            fontWeight: 600
                        }}
                    >
                        {loading ? 'Sauvegarde...' : 'Sauvegarder les changements'}
                    </button>
                </div>
              </div>
          </div>
        </div>
      </div>
      <MediaPickerModal
        isOpen={isMediaPickerOpen}
        onClose={() => setMediaPickerOpen(false)}
        onSelect={handleMediaSelect}
        portfolioId={project.portfolioId}
      />
    </>
  );
};
