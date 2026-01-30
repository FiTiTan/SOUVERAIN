
import React, { useState } from 'react';
import { useTheme } from '../../../ThemeContext';
import { MediathequeGrid } from './MediathequeGrid';
import { useMediatheque } from '../../../hooks/useMediatheque';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (mediaIds: string[]) => void;
  portfolioId: string;
}

export const MediaPickerModal: React.FC<MediaPickerModalProps> = ({ isOpen, onClose, onSelect, portfolioId }) => {
  const { theme } = useTheme();
  const [selectedMedia, setSelectedMedia] = useState<string[]>([]);
  const { items, loading } = useMediatheque(portfolioId);

  const handleToggleMedia = (mediaId: string) => {
    setSelectedMedia(prev =>
      prev.includes(mediaId) ? prev.filter(id => id !== mediaId) : [...prev, mediaId]
    );
  };

  const handleSelect = () => {
    onSelect(selectedMedia);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div style={{
        position: 'fixed', inset: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1100, // Higher than EditModal
        backdropFilter: 'blur(4px)'
    }}>
      <div style={{
          backgroundColor: theme.bg.secondary,
          borderRadius: '12px',
          width: '80%',
          maxWidth: '1000px',
          height: '80vh',
          display: 'flex',
          flexDirection: 'column',
          border: `1px solid ${theme.border.default}`,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          color: theme.text.primary
      }}>
        <div style={{ padding: '1.5rem', borderBottom: `1px solid ${theme.border.default}` }}>
            <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Sélectionner des Médias</h2>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          <MediathequeGrid
            items={items}
            loading={loading}
            onToggleSelection={handleToggleMedia}
            selectedIds={selectedMedia}
            isSelectionMode={true}
            onDelete={() => {}} // No delete in picker
          />
        </div>

        <div style={{ 
            padding: '1.5rem', 
            borderTop: `1px solid ${theme.border.default}`, 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
        }}>
          <span style={{ color: theme.text.secondary }}>{selectedMedia.length} élément(s) sélectionné(s)</span>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button
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
                onClick={handleSelect}
                style={{
                    padding: '10px 24px',
                    backgroundColor: theme.accent.primary,
                    border: 'none',
                    borderRadius: '8px',
                    color: '#fff',
                    cursor: 'pointer',
                    fontWeight: 600
                }}
            >
                Valider la sélection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
