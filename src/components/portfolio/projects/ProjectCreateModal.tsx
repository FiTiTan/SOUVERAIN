import React, { useState } from 'react';
import { useTheme } from '../../../ThemeContext';
import type { Project } from '../../../hooks/useProjects';

interface ProjectCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (data: Partial<Project>) => Promise<void>;
}

export const ProjectCreateModal: React.FC<ProjectCreateModalProps> = ({ isOpen, onClose, onCreate }) => {
    const { theme } = useTheme();
    const [loading, setLoading] = useState(false);
    
    // Form State
    const [title, setTitle] = useState('');
    const [briefText, setBriefText] = useState(''); // Titre et contexte
    const [challengeText, setChallengeText] = useState(''); // Le Défi
    const [solutionText, setSolutionText] = useState(''); // La Solution
    const [resultText, setResultText] = useState(''); // Le Résultat

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        setLoading(true);
        try {
            await onCreate({
                title,
                brief_text: briefText,
                challenge_text: challengeText,
                solution_text: solutionText,
                result_text: resultText
            });
            // Reset
            setTitle('');
            setBriefText('');
            setChallengeText('');
            setSolutionText('');
            setResultText('');
            onClose();
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

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
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0,
            backgroundColor: 'rgba(0,0,0,0.7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
        }}>
            <div style={{
                backgroundColor: theme.bg.secondary,
                borderRadius: '12px',
                width: '100%',
                maxWidth: '700px',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                border: `1px solid ${theme.border.default}`,
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            }}>
                <div style={{ padding: '1.5rem', borderBottom: `1px solid ${theme.border.default}` }}>
                     <h2 style={{ margin: 0, color: theme.text.primary }}>Nouveau Projet (Format Excellence)</h2>
                     <p style={{ margin: '0.5rem 0 0', color: theme.text.tertiary, fontSize: '0.9rem' }}>
                        Définissez les bases de votre future étude de cas.
                     </p>
                </div>
                
                <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
                    <form id="project-form" onSubmit={handleSubmit}>
                        {/* 1. Titre */}
                        <div style={styles.section}>
                            <label style={styles.label}>Titre du Projet <span style={{color: theme.accent.primary}}>*</span></label>
                            <input 
                                autoFocus
                                type="text" 
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="Ex: Refonte Site E-commerce"
                                style={styles.input}
                                required
                            />
                        </div>

                        {/* 2. Contexte */}
                        <div style={styles.section}>
                            <label style={styles.label}>Contexte (Pour qui et dans quel cadre ?)</label>
                            <textarea 
                                value={briefText}
                                onChange={e => setBriefText(e.target.value)}
                                placeholder="Ex: Client grand compte dans le secteur bancaire, projet de 6 mois..."
                                style={styles.textarea}
                            />
                        </div>

                        {/* 3. Défi */}
                        <div style={styles.section}>
                            <label style={styles.label}>Le Défi (Problème ou besoin initial)</label>
                            <textarea 
                                value={challengeText}
                                onChange={e => setChallengeText(e.target.value)}
                                placeholder="Ex: Moderniser une stack legacy, améliorer les performances..."
                                style={styles.textarea}
                            />
                        </div>

                        {/* 4. Solution */}
                        <div style={styles.section}>
                            <label style={styles.label}>La Solution (Étapes et techniques)</label>
                            <textarea 
                                value={solutionText}
                                onChange={e => setSolutionText(e.target.value)}
                                placeholder="Ex: Migration vers React, implémentation de CI/CD, tests..."
                                style={styles.textarea}
                            />
                        </div>

                        {/* 5. Résultat */}
                        <div style={styles.section}>
                            <label style={styles.label}>Le Résultat (Impact et rendu final)</label>
                            <textarea 
                                value={resultText}
                                onChange={e => setResultText(e.target.value)}
                                placeholder="Ex: +50% de performance, réduction de la dette technique..."
                                style={styles.textarea}
                            />
                        </div>
                    </form>
                </div>

                <div style={{ padding: '1.5rem', borderTop: `1px solid ${theme.border.default}`, display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                    <button 
                        type="button" 
                        onClick={onClose}
                        style={{
                            padding: '10px 20px',
                            background: 'transparent',
                            border: `1px solid ${theme.border.default}`,
                            borderRadius: '8px',
                            color: theme.text.primary,
                            cursor: 'pointer'
                        }}
                    >
                        Annuler
                    </button>
                    <button 
                        type="submit" 
                        form="project-form"
                        disabled={!title.trim() || loading}
                        style={{
                            padding: '10px 24px',
                            backgroundColor: theme.accent.primary,
                            border: 'none',
                            borderRadius: '8px',
                            color: '#fff',
                            cursor: loading ? 'wait' : 'pointer',
                            opacity: !title.trim() ? 0.5 : 1,
                            fontWeight: 600
                        }}
                    >
                        {loading ? 'Création...' : 'Créer Projet'}
                    </button>
                </div>
            </div>
        </div>
    );
};
