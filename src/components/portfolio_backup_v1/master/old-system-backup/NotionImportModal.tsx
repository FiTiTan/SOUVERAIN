import React, { useState, useRef } from 'react';
import { useTheme } from '../../../ThemeContext';

interface NotionImportModalProps {
  onClose: () => void;
  onImport: (data: { content: string; fileName?: string }) => void;
}

type ImportMode = 'upload' | 'paste';

export const NotionImportModal: React.FC<NotionImportModalProps> = ({ onClose, onImport }) => {
  const { theme } = useTheme();
  const [mode, setMode] = useState<ImportMode>('upload');
  const [pastedContent, setPastedContent] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['.md', '.txt', '.pdf'];
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();

    if (!allowedTypes.includes(fileExt)) {
      setError(`Format non supporté. Formats acceptés: ${allowedTypes.join(', ')}`);
      return;
    }

    setSelectedFile(file);
    setError('');
  };

  const handleImport = async () => {
    setError('');

    if (mode === 'upload') {
      if (!selectedFile) {
        setError('Veuillez sélectionner un fichier');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onImport({ content, fileName: selectedFile.name });
      };
      reader.onerror = () => {
        setError('Erreur lors de la lecture du fichier');
      };
      reader.readAsText(selectedFile);
    } else {
      if (!pastedContent.trim()) {
        setError('Veuillez coller du contenu');
        return;
      }
      onImport({ content: pastedContent });
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: theme.bg.primary,
          borderRadius: '16px',
          width: '100%',
          maxWidth: '600px',
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          border: `1px solid ${theme.border.default}`,
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: `1px solid ${theme.border.light}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{
              margin: 0,
              fontSize: '1.25rem',
              fontWeight: 600,
              color: theme.text.primary
            }}>
              📝 Importer depuis Notion
            </h2>
            <p style={{
              margin: '0.25rem 0 0 0',
              fontSize: '0.875rem',
              color: theme.text.secondary
            }}>
              Récupérez vos projets et expériences
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: 'none',
              backgroundColor: theme.bg.secondary,
              color: theme.text.secondary,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.25rem',
              transition: 'all 0.2s',
              outline: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.bg.tertiary || theme.bg.secondary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.bg.secondary;
            }}
          >
            ×
          </button>
        </div>

        {/* Mode selector */}
        <div style={{
          padding: '1.5rem',
          borderBottom: `1px solid ${theme.border.light}`
        }}>
          <div style={{
            display: 'flex',
            gap: '0.75rem'
          }}>
            <button
              onClick={() => setMode('upload')}
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '12px',
                border: `2px solid ${mode === 'upload' ? theme.accent.primary : theme.border.default}`,
                backgroundColor: mode === 'upload' ? `${theme.accent.primary}11` : theme.bg.secondary,
                color: theme.text.primary,
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                outline: 'none'
              }}
            >
              📁 Upload fichier
            </button>
            <button
              onClick={() => setMode('paste')}
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '12px',
                border: `2px solid ${mode === 'paste' ? theme.accent.primary : theme.border.default}`,
                backgroundColor: mode === 'paste' ? `${theme.accent.primary}11` : theme.bg.secondary,
                color: theme.text.primary,
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                outline: 'none'
              }}
            >
              📋 Copier-coller
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.5rem'
        }}>
          {mode === 'upload' ? (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".md,.txt,.pdf"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: '100%',
                  padding: '2rem',
                  border: `2px dashed ${selectedFile ? theme.accent.primary : theme.border.default}`,
                  borderRadius: '12px',
                  backgroundColor: selectedFile ? `${theme.accent.primary}11` : theme.bg.secondary,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
                onMouseEnter={(e) => {
                  if (!selectedFile) {
                    e.currentTarget.style.borderColor = theme.accent.primary;
                    e.currentTarget.style.backgroundColor = `${theme.accent.primary}05`;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!selectedFile) {
                    e.currentTarget.style.borderColor = theme.border.default!;
                    e.currentTarget.style.backgroundColor = theme.bg.secondary;
                  }
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <span style={{
                    fontSize: '3rem',
                    display: 'block',
                    marginBottom: '0.5rem'
                  }}>
                    {selectedFile ? '✓' : '📤'}
                  </span>
                  <p style={{
                    margin: 0,
                    fontWeight: 600,
                    color: theme.text.primary,
                    marginBottom: '0.25rem'
                  }}>
                    {selectedFile ? selectedFile.name : 'Cliquez pour sélectionner un fichier'}
                  </p>
                  <p style={{
                    margin: 0,
                    fontSize: '0.85rem',
                    color: theme.text.secondary
                  }}>
                    Formats acceptés: .md, .txt, .pdf
                  </p>
                </div>
              </button>
              
              {selectedFile && (
                <div style={{
                  marginTop: '1rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  backgroundColor: theme.bg.secondary,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <p style={{
                      margin: 0,
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: theme.text.primary
                    }}>
                      {selectedFile.name}
                    </p>
                    <p style={{
                      margin: '0.25rem 0 0 0',
                      fontSize: '0.75rem',
                      color: theme.text.tertiary
                    }}>
                      {(selectedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                    style={{
                      padding: '0.25rem 0.5rem',
                      borderRadius: '6px',
                      border: 'none',
                      backgroundColor: 'transparent',
                      color: theme.text.tertiary,
                      cursor: 'pointer',
                      fontSize: '1.25rem',
                      transition: 'all 0.2s',
                      outline: 'none'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#EF4444';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = theme.text.tertiary!;
                    }}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: theme.text.primary,
                marginBottom: '0.5rem'
              }}>
                Contenu de la page Notion
              </label>
              <textarea
                value={pastedContent}
                onChange={(e) => {
                  setPastedContent(e.target.value);
                  setError('');
                }}
                placeholder="Collez ici le contenu copié depuis Notion..."
                rows={10}
                style={{
                  width: '100%',
                  padding: '0.875rem 1rem',
                  border: `1px solid ${error ? '#EF4444' : theme.border.default}`,
                  borderRadius: '12px',
                  fontSize: '0.95rem',
                  outline: 'none',
                  backgroundColor: theme.bg.secondary,
                  color: theme.text.primary,
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => !error && (e.target.style.borderColor = theme.accent.primary)}
                onBlur={(e) => !error && (e.target.style.borderColor = theme.border.default!)}
              />
              <p style={{
                marginTop: '0.5rem',
                fontSize: '0.8rem',
                color: theme.text.tertiary
              }}>
                Visitez votre page Notion, sélectionnez et copiez le contenu
              </p>
            </div>
          )}

          {error && (
            <div style={{
              marginTop: '1rem',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              backgroundColor: '#FEE2E2',
              border: '1px solid #FECACA',
              color: '#991B1B',
              fontSize: '0.875rem'
            }}>
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '1.5rem',
          borderTop: `1px solid ${theme.border.light}`,
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '0.75rem'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '12px',
              border: `1px solid ${theme.border.default}`,
              backgroundColor: theme.bg.secondary,
              color: theme.text.primary,
              fontSize: '0.9rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.2s',
              outline: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.bg.tertiary || theme.bg.secondary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = theme.bg.secondary;
            }}
          >
            Annuler
          </button>
          <button
            onClick={handleImport}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: theme.accent.primary,
              color: '#FFFFFF',
              fontSize: '0.9rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s',
              outline: 'none'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Importer
          </button>
        </div>
      </div>
    </div>
  );
};
