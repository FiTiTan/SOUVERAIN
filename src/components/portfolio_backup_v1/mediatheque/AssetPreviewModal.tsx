import React, { useEffect } from 'react';
import { useTheme } from '../../../ThemeContext';
import type { MediathequeItem } from '../../../hooks/useMediatheque';
import { FileIcon } from '../../icons';

interface AssetPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    asset: MediathequeItem | null;
    onNext: () => void;
    onPrev: () => void;
    hasNext: boolean;
    hasPrev: boolean;
}

export const AssetPreviewModal: React.FC<AssetPreviewModalProps> = ({ 
    isOpen, onClose, asset, onNext, onPrev, hasNext, hasPrev 
}) => {
    const { theme } = useTheme();

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowRight' && hasNext) onNext();
            if (e.key === 'ArrowLeft' && hasPrev) onPrev();
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, hasNext, hasPrev, onNext, onPrev, onClose]);

    if (!isOpen || !asset) return null;

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.9)',
            zIndex: 2000,
            display: 'flex',
            flexDirection: 'row',
            color: '#fff'
        }} onClick={onClose}>
            
            {/* Main Content (Image/Video) */}
            <div style={{ 
                flex: 1, 
                position: 'relative', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                padding: '20px'
            }} onClick={e => e.stopPropagation()}>
                
                {/* Navigation Arrows (Left) */}
                {hasPrev && (
                    <button onClick={onPrev} style={{
                        position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)',
                        background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', borderRadius: '50%',
                        width: 50, height: 50, fontSize: '24px', cursor: 'pointer', zIndex: 10
                    }}>
                        &#8592;
                    </button>
                )}

                {/* Asset Display */}
                {(asset.file_type === 'image' || asset.format === 'image' || asset.format === 'jpg' || asset.format === 'png' || asset.format === 'webp') && (
                    <img 
                        src={`file://${(asset.file_path || asset.localPath || '').replace(/\\/g, '/')}`} 
                        alt={asset.original_filename || asset.originalFilename} 
                        style={{
                            maxWidth: '90%', maxHeight: '90%', objectFit: 'contain', boxShadow: '0 0 20px rgba(0,0,0,0.5)'
                        }} 
                    />
                )}
                {(asset.file_type === 'video' || asset.format === 'video') && (
                    <video controls src={`file://${(asset.file_path || asset.localPath || '').replace(/\\/g, '/')}`} style={{
                        maxWidth: '90%', maxHeight: '90%', boxShadow: '0 0 20px rgba(0,0,0,0.5)'
                    }} />
                )}
                {(asset.file_type === 'pdf' || asset.format === 'pdf') && (
                    <div style={{ textAlign: 'center' }}>
                         <FileIcon size={80} color={theme.text.tertiary} />
                         <p>Prévisualisation PDF non disponible en plein écran pour le moment.</p>
                         <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>{asset.file_path || asset.localPath}</p>
                    </div>
                )}

                 {/* Navigation Arrows (Right) */}
                 {hasNext && (
                    <button onClick={onNext} style={{
                        position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)',
                        background: 'rgba(0,0,0,0.5)', border: 'none', color: 'white', borderRadius: '50%',
                        width: 50, height: 50, fontSize: '24px', cursor: 'pointer', zIndex: 10
                    }}>
                        &#8594;
                    </button>
                )}

            </div>

            {/* Sidebar Metadata */}
            <div style={{
                width: '300px',
                backgroundColor: theme.bg.secondary,
                borderLeft: `1px solid ${theme.border.default}`,
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                color: theme.text.primary
            }} onClick={e => e.stopPropagation()}>
                
                <div>
                    <h3 style={{ margin: '0 0 0.5rem 0', wordBreak: 'break-all' }}>{asset.original_filename || asset.originalFilename}</h3>
                    <div style={{ 
                        display: 'inline-block', 
                        padding: '4px 8px', 
                        borderRadius: '4px', 
                        backgroundColor: theme.accent.primary, 
                        color: 'white', 
                        fontSize: '0.8rem',
                        textTransform: 'uppercase',
                        fontWeight: 'bold'
                    }}>
                        {asset.file_type || asset.format || 'Fichier'}
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', fontSize: '0.9rem' }}>
                    <div>
                        <span style={{ display: 'block', color: theme.text.secondary, marginBottom: '4px' }}>Date d'ajout</span>
                        <span>{formatDate((asset as any).created_at || asset.createdAt)}</span>
                    </div>
                    <div>
                        <span style={{ display: 'block', color: theme.text.secondary, marginBottom: '4px' }}>Poids</span>
                        <span>{formatSize(asset.file_size || asset.fileSize || 0)}</span>
                    </div>
                    {/* Add Dimensions/Duration if available in metadata */}
                    {asset.metadata && asset.metadata.width && (
                         <div>
                            <span style={{ display: 'block', color: theme.text.secondary, marginBottom: '4px' }}>Dimensions</span>
                            <span>{asset.metadata.width} x {asset.metadata.height} px</span>
                        </div>
                    )}
                </div>

                <div style={{ marginTop: 'auto' }}>
                    <button onClick={onClose} style={{
                        width: '100%',
                        padding: '10px',
                        backgroundColor: 'transparent',
                        border: `1px solid ${theme.border.default}`,
                        color: theme.text.primary,
                        borderRadius: '6px',
                        cursor: 'pointer'
                    }}>
                        Fermer (Echap)
                    </button>
                </div>

            </div>
        </div>
    );
};
