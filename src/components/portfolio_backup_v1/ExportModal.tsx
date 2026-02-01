
import React, { useState } from 'react';
import { useTheme } from '../../ThemeContext';
import { FileIcon, GlobeIcon } from '../icons';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (options: { ghostMode: boolean; includeMedia: boolean; format: 'pdf' | 'html' }) => void;
  scope?: 'single' | 'global';
}

export const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, onExport, scope = 'single' }) => {
  const { theme } = useTheme();
  const [ghostMode, setGhostMode] = useState(false);
  const [includeMedia, setIncludeMedia] = useState(true);
  const [format, setFormat] = useState<'pdf' | 'html'>('pdf');

  if (!isOpen) return null;

  const handleExport = () => {
    onExport({ ghostMode, includeMedia, format });
    onClose();
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
          maxWidth: '500px',
          border: `1px solid ${theme.border.default}`,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <div style={{ padding: '1.5rem', borderBottom: `1px solid ${theme.border.default}` }}>
            <h2 style={{ margin: 0, color: theme.text.primary }}>Exporter {scope === 'global' ? 'le Portfolio' : 'le Projet'}</h2>
        </div>

        <div style={{ padding: '1.5rem' }}>
          
          <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: theme.text.secondary, fontSize: '0.9rem', fontWeight: 600 }}>Format</label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                      onClick={() => setFormat('pdf')}
                      style={{
                          flex: 1,
                          padding: '0.75rem',
                          borderRadius: '8px',
                          border: `2px solid ${format === 'pdf' ? theme.accent.primary : theme.border.default}`,
                          backgroundColor: format === 'pdf' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                          color: theme.text.primary,
                          cursor: 'pointer',
                          fontWeight: 600
                      }}
                  >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                        <FileIcon size={18} />
                        <span>PDF {scope === 'single' ? 'Excellence' : 'Global'}</span>
                      </div>
                  </button>
                  {scope === 'global' && (
                      <button
                          onClick={() => setFormat('html')}
                          style={{
                              flex: 1,
                              padding: '0.75rem',
                              borderRadius: '8px',
                              border: `2px solid ${format === 'html' ? theme.accent.primary : theme.border.default}`,
                              backgroundColor: format === 'html' ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                              color: theme.text.primary,
                              cursor: 'pointer',
                              fontWeight: 600
                          }}
                      >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                            <GlobeIcon size={18} />
                            <span>Site Web</span>
                          </div>
                      </button>
                  )}
              </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={ghostMode}
                onChange={() => setGhostMode(!ghostMode)}
              />
              <span style={{ marginLeft: '0.5rem', color: theme.text.primary }}>Ghost Mode (Anonymisation)</span>
            </label>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={includeMedia}
                onChange={() => setIncludeMedia(!includeMedia)}
              />
              <span style={{ marginLeft: '0.5rem', color: theme.text.primary }}>Inclure les médias</span>
            </label>
          </div>
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
                onClick={handleExport}
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
                Exporter
            </button>
        </div>
      </div>
    </div>
  );
};
