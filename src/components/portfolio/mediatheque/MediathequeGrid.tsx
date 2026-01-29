import React from 'react';
import type { MediathequeItem } from '../../../hooks/useMediatheque';
import { MediathequeCard } from './MediathequeCard';

interface MediathequeGridProps {
    items: MediathequeItem[];
    onDelete: (id: string) => void;
    loading: boolean;
    onToggleSelection?: (id: string) => void;
    selectedIds?: string[];
    isSelectionMode?: boolean;
    onSelect?: (item: MediathequeItem) => void;
}

export const MediathequeGrid: React.FC<MediathequeGridProps> = ({ 
    items, 
    onDelete, 
    loading, 
    onToggleSelection, 
    selectedIds = [], 
    isSelectionMode = false,
    onSelect 
}) => {
    
    if (loading && items.length === 0) {
        return <div style={{ padding: '2rem', textAlign: 'center', opacity: 0.7 }}>Chargement...</div>;
    }

    if (items.length === 0) {
        return (
            <div style={{ padding: '4rem', textAlign: 'center', opacity: 0.5, border: '2px dashed #444', borderRadius: '12px' }}>
                <p>La médiathèque est vide.</p>
                <p style={{ fontSize: '0.9rem' }}>Ajoutez des fichiers pour commencer.</p>
            </div>
        );
    }

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '1.5rem',
            padding: '1rem 0'
        }}>
            {items.map(item => (
                <MediathequeCard 
                    key={item.id} 
                    item={item} 
                    onDelete={() => onDelete(item.id)}
                    onClick={() => {
                        if (isSelectionMode && onToggleSelection) {
                            onToggleSelection(item.id);
                        } else if (!isSelectionMode && onSelect) {
                            onSelect(item);
                        }
                    }}
                    isSelected={selectedIds.includes(item.id)}
                    selectionMode={isSelectionMode}
                />
            ))}
        </div>
    );
};
