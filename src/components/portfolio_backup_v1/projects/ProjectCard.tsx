import React from 'react';
import { useTheme } from '../../../ThemeContext';
import type { Project } from '../../../hooks/useProjects';

interface ProjectCardProps {
    project: Project;
    onEdit: (project: Project) => void;
    onDelete: (id: string) => void;
    onExport: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit, onDelete, onExport }) => {
    const { theme } = useTheme();

    // Determine cover image
    // Note: In list view, elements might not be populated. We rely on what's passed.
    // Ideally backend should provide a 'cover_path' field.
    const coverImage = (project.elements && project.elements.length > 0)
        ? (project.elements.find(e => {
            const el = e as any;
            return (el.fileType === 'image' || el.file_type === 'image' || el.format === 'image');
        }) as any)?.file_path 
           || (project.elements[0] as any).file_path 
           || (project.elements[0] as any).localPath
        : null;

    // Helper to format date
    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    };

    return (
        <div style={{
            backgroundColor: theme.bg.secondary,
            border: `1px solid ${theme.border.light}`,
            borderRadius: '12px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.2s, box-shadow 0.2s',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            height: '100%'
        }}
        onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
        }}
        onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        }}
        >
            {/* Cover Image Area */}
            <div style={{
                height: '160px',
                backgroundColor: theme.bg.tertiary,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderBottom: `1px solid ${theme.border.light}`,
                position: 'relative',
                overflow: 'hidden'
            }}>
                {coverImage ? (
                    <img 
                        src={`file://${(coverImage || '').replace(/\\/g, '/')}`} 
                        alt={project.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                ) : (
                    <div style={{ color: theme.text.tertiary, fontSize: '3rem' }}>
                        🚀
                    </div>
                )}
                
                {(project as any).is_highlight === 1 && (
                    <div style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        backgroundColor: theme.accent.primary,
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}>
                        Highlight
                    </div>
                )}
            </div>

            {/* Content */}
            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: theme.text.primary, fontSize: '1.2rem' }}>
                    {project.title}
                </h3>
                
                <div style={{ fontSize: '0.85rem', color: theme.text.tertiary, marginBottom: '1rem' }}>
                    {formatDate((project as any).created_at || project.createdAt)}
                </div>

                <p style={{ 
                    fontSize: '0.9rem', 
                    color: theme.text.secondary, 
                    display: '-webkit-box', 
                    WebkitLineClamp: 3, 
                    WebkitBoxOrient: 'vertical', 
                    overflow: 'hidden',
                    margin: '0 0 1.5rem 0',
                    lineHeight: '1.5'
                }}>
                    {project.brief_text || "Aucun brief défini pour ce projet."}
                </p>

                {/* Actions */}
                <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                     <button
                        onClick={() => onExport(project)}
                        style={{
                            background: 'transparent',
                            border: `1px solid ${theme.border.default}`,
                            color: theme.text.primary,
                            padding: '6px 10px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                        title="Exporter en PDF"
                    >
                        <span>📄</span> Export
                    </button>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={() => onEdit(project)}
                            style={{
                                backgroundColor: theme.accent.muted,
                                color: theme.accent.primary,
                                border: 'none',
                                padding: '6px 12px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '0.85rem'
                            }}
                        >
                            Éditer
                        </button>
                        <button
                            onClick={() => onDelete(project.id)}
                            style={{
                                background: 'transparent',
                                border: 'none', // Cleaner look
                                color: theme.semantic.error,
                                padding: '6px',
                                borderRadius: '6px',
                                cursor: 'pointer',
                            }}
                            title="Supprimer"
                        >
                            🗑️
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
