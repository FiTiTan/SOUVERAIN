import React from 'react';
import type { MediathequeItem } from '../../../hooks/useMediatheque';
import { useTheme } from '../../../ThemeContext';
import { FileIcon, VideoIcon, FolderIcon, XIcon } from '../../icons';

interface MediathequeCardProps {
    item: MediathequeItem;
    onDelete: (id: string) => void;
    onClick?: () => void;
    isSelected?: boolean;
    selectionMode?: boolean;
}

export const MediathequeCard: React.FC<MediathequeCardProps> = ({ 
    item, 
    onDelete, 
    onClick, 
    isSelected = false, 
    selectionMode = false 
}) => {
    const { theme } = useTheme();

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    return (
        <div style={{
            backgroundColor: isSelected ? theme.accent.primary + '20' : theme.bg.secondary,
            borderRadius: '12px',
            overflow: 'hidden',
            border: isSelected ? `2px solid ${theme.accent.primary}` : `1px solid ${theme.border}`,
            display: 'flex',
            flexDirection: 'column',
            transition: 'transform 0.2s',
            cursor: 'pointer',
            position: 'relative'
        }}
        onClick={onClick}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
            {selectionMode && (
                <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '24px',
                    height: '24px',
                    backgroundColor: isSelected ? theme.accent.primary : theme.bg.primary,
                    border: `2px solid ${theme.border}`,
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    zIndex: 10
                }}>
                    {isSelected && '✔'}
                </div>
            )}
            {/* Thumbnail Area */}
            <div style={{
                height: '160px',
                backgroundColor: '#1a1b1e', // Darker placeholder
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
            }}>
                {/* Handle both snake_case (DB) and camelCase (Type) */}
                {(item.file_type === 'image' || item.format === 'image' || item.format === 'jpg' || item.format === 'png' || item.format === 'webp') ? (
                    <img 
                        src={`file://${(item.file_path || item.localPath || '').replace(/\\/g, '/')}`} 
                        alt={item.original_filename || 'Media'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                                parent.innerHTML = '';
                                const errorDiv = document.createElement('div');
                                errorDiv.style.color = '#EF4444';
                                errorDiv.appendChild(document.createTextNode('Error'));
                                parent.appendChild(errorDiv);
                            }
                        }}
                    />
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {(item.file_type === 'pdf' || item.format === 'pdf') ? <FileIcon size={48} color={theme.text.tertiary} /> : (item.file_type === 'video' || item.format === 'video') ? <VideoIcon size={48} color={theme.text.tertiary} /> : <FolderIcon size={48} color={theme.text.tertiary} />}
                    </div>
                )}
            </div>

            {/* Info Area */}
            <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ 
                    margin: '0 0 4px 0', 
                    fontSize: '0.9rem', 
                    color: theme.text.primary,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                }} title={item.original_filename}>
                    {item.original_filename}
                </h4>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: theme.text.secondary }}>
                    <span>{(item.file_type || item.format || 'Fichier').toUpperCase()}</span>
                    <span>{formatSize(item.file_size || 0)}</span>
                </div>

                {/* Actions */}
                {!selectionMode && (
                    <div style={{ marginTop: 'auto', paddingTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#ef4444',
                                cursor: 'pointer',
                                padding: '4px',
                                borderRadius: '4px'
                            }}
                            title="Supprimer"
                        >
                            🗑️
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
