import { useState, useEffect, useCallback } from 'react';
import type { PortfolioProjectV2 as Project, ProjectElement } from '../types/portfolio';

export type { Project, ProjectElement };

export const useProjects = (portfolioId: string | undefined) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProjects = useCallback(async () => {
        if (!portfolioId) return;
        setLoading(true);
        setError(null);
        try {
            // @ts-ignore
            const result = await window.electron.portfolio.getAllProjects(portfolioId);
            if (result.success) {
                setProjects(result.projects);
            } else {
                setError(result.error);
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [portfolioId]);

    const addProject = async (data: Partial<Project>) => {
        if (!portfolioId) return { success: false, error: 'No portfolio ID' };
        try {
            const payload = {
                id: crypto.randomUUID(),
                portfolio_id: portfolioId, 
                ...data
            };

            // @ts-ignore
            const result = await window.electron.portfolio.createProject(payload);
            if (result.success) {
                fetchProjects();
                return { success: true, id: result.id };
            } else {
                return { success: false, error: result.error };
            }
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    };

    const updateProject = async (id: string, updates: Partial<Project>) => {
        try {
            // @ts-ignore
            const result = await window.electron.portfolio.updateProject(id, updates);
            if (result.success) {
                setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
                return { success: true };
            } else {
                return { success: false, error: result.error };
            }
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    };

    const deleteProject = async (id: string) => {
        try {
            // @ts-ignore
            const result = await window.electron.portfolio.deleteProject(id);
            if (result.success) {
                setProjects(prev => prev.filter(p => p.id !== id));
                return { success: true };
            } else {
                return { success: false, error: result.error };
            }
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    };

    const linkMediaToProject = async (projectId: string, mediaIds: string[]) => {
        try {
            const project = projects.find(p => p.id === projectId);
            if (!project) return { success: false, error: "Project not found" };

            const existingMedia = project.elements || [];
            let maxOrder = existingMedia.reduce((max, el) => Math.max(max, el.displayOrder), -1);

            for (const mediaId of mediaIds) {
                maxOrder++;
                const payload = {
                    id: crypto.randomUUID(),
                    projectId: projectId,
                    elementId: mediaId,
                    displayOrder: maxOrder,
                    isCover: false,
                };
                // @ts-ignore
                await window.electron.portfolioV2.projects.addElement(payload);
            }
            fetchProjects();
            return { success: true };
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    };

    const unlinkMediaFromProject = async (projectMediaId: string) => {
        try {
            // @ts-ignore
            // Using Portfolio V2 API for removing elements is safer as per preload structure
            // But preload shows: removeElement: (projectId, elementId) => ...
            // Wait, removeElement takes projectId and elementId (which is the asset Id? or relation Id?)
            // Based on preload: 'portfolio-project-element-delete' takes { projectId, elementId }
            // Let's assume projectMediaId IS the elementId in this context if mapped correctly.
            // Actually, `ProjectElement` has `id`.
            // Let's check preload again.
            // preload: removeElement: (projectId, elementId) => ipcRenderer.invoke('portfolio-project-element-delete', { projectId, elementId }),
            // So we need projectId as well.
            
            // Allow caller to pass projectId if needed, or find it.
            // For now, let's look at `ProjectEditModal` usage. It passes `projectMediaId`.
            // We need to find the project this media belongs to.
            
            const project = projects.find(p => p.elements?.some(e => e.id === projectMediaId));
            if (!project) return { success: false, error: "Project not found for media" };
            
            const result = await window.electron.portfolioV2.projects.removeElement(project.id, projectMediaId);
            
            if (result.success) {
                fetchProjects();
                return { success: true };
            } else {
                return { success: false, error: result.error };
            }
        } catch (err: any) {
            return { success: false, error: err.message };
        }
    };

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    return {
        projects,
        loading,
        error,
        fetchProjects,
        addProject,
        updateProject,
        deleteProject,
        linkMediaToProject,
        unlinkMediaFromProject
    };
};


