import React, { useRef, useState } from 'react';
import { useTheme } from '../../../ThemeContext';
import { useMediatheque } from '../../../hooks/useMediatheque';

interface MediathequeImporterProps {
    activePortfolioId: string | undefined;
    onImportSuccess: () => void;
    children?: React.ReactNode;
}

export const MediathequeImporter: React.FC<MediathequeImporterProps> = ({ activePortfolioId, onImportSuccess, children }) => {
    const { theme } = useTheme();
    const [isDragging, setIsDragging] = useState(false);
    const dropZoneRef = useRef<HTMLDivElement>(null);
    const { importFiles, addDroppedFiles } = useMediatheque(activePortfolioId);

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (dropZoneRef.current && !dropZoneRef.current.contains(e.relatedTarget as Node)) {
             setIsDragging(false);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const files = Array.from(e.dataTransfer.files);
            // @ts-ignore
            await addDroppedFiles(files);
            onImportSuccess();
        }
    };



    return (
        <div 
            ref={dropZoneRef}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{ position: 'relative', height: '100%', width: '100%' }}
        >
             {/* Drag Overlay */}
             {isDragging && (
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    border: `4px dashed ${theme.accent.primary}`,
                    zIndex: 100,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    pointerEvents: 'none', 
                    backdropFilter: 'blur(2px)'
                }}>
                    <h2 style={{ color: theme.accent.primary, fontSize: '2rem' }}>Déposez vos fichiers ici</h2>
                </div>
            )}
            {children}
        </div>
    );
};
