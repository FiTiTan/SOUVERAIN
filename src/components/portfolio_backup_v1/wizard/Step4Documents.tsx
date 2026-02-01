import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../ThemeContext';
import { typography, borderRadius, transitions } from '../../../design-system';
import type { PortfolioFormData } from './types';
import { FileIcon, DocumentIcon, PresentationIcon, TextIcon, AttachmentIcon, UploadIcon } from './icons';

interface Step4DocumentsProps {
  data: PortfolioFormData;
  onChange: (updates: Partial<PortfolioFormData>) => void;
}

// Helper: Get file icon based on type
const getFileIcon = (file: File, color: string) => {
  const type = file.type.toLowerCase();
  if (type.includes('pdf')) return <FileIcon size={28} color={color} />;
  if (type.includes('word') || type.includes('document')) return <DocumentIcon size={28} color={color} />;
  if (type.includes('powerpoint') || type.includes('presentation')) return <PresentationIcon size={28} color={color} />;
  if (type.includes('text')) return <TextIcon size={28} color={color} />;
  return <AttachmentIcon size={28} color={color} />;
};

// Helper: Format file size
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Document Preview Card
const DocumentPreviewCard: React.FC<{
  file: File;
  onRemove: () => void;
  onClick: () => void;
}> = ({ file, onRemove, onClick }) => {
  const { theme } = useTheme();

  return (
    <div
      onClick={onClick}
      style={{
        background: theme.bg.secondary,
        border: `1px solid ${theme.border.light}`,
        borderRadius: borderRadius.lg,
        padding: '1rem',
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        transition: transitions.normal,
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = theme.bg.tertiary;
        e.currentTarget.style.borderColor = theme.border.default;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = theme.bg.secondary;
        e.currentTarget.style.borderColor = theme.border.light;
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: '50px',
          height: '50px',
          borderRadius: borderRadius.md,
          background: theme.accent.muted,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {getFileIcon(file, theme.accent.primary)}
      </div>

      {/* File Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            color: theme.text.primary,
            marginBottom: '0.25rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {file.name}
        </div>
        <div
          style={{
            fontSize: typography.fontSize.xs,
            color: theme.text.tertiary,
            display: 'flex',
            gap: '0.5rem',
          }}
        >
          <span>{formatFileSize(file.size)}</span>
          <span>•</span>
          <span>{file.type.split('/')[1]?.toUpperCase() || 'FILE'}</span>
        </div>
      </div>

      {/* Remove Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        style={{
          padding: '0.5rem',
          borderRadius: borderRadius.md,
          border: 'none',
          background: 'transparent',
          color: theme.text.tertiary,
          cursor: 'pointer',
          transition: transitions.fast,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = theme.semantic.errorBg;
          e.currentTarget.style.color = theme.semantic.error;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = theme.text.tertiary;
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="3 6 5 6 21 6" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      </button>
    </div>
  );
};

export const Step4Documents: React.FC<Step4DocumentsProps> = ({ data, onChange }) => {
  const { theme, mode } = useTheme();
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      await processAndSaveFiles(newFiles);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files);
      await processAndSaveFiles(newFiles);
    }
  };

  const processAndSaveFiles = async (files: File[]) => {
    const uploadedFiles: any[] = [];

    for (const file of files) {
      try {
        // Sauvegarder le fichier sur disque via IPC
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Array.from(new Uint8Array(arrayBuffer));
        
        // @ts-ignore
        const result = await window.electron.invoke('file-save-temp', {
          fileName: file.name,
          buffer: buffer,
        });

        // Déterminer le type de fichier
        const ext = file.name.split('.').pop()?.toLowerCase();
        let fileType = 'other';
        if (ext === 'pdf') fileType = 'pdf';
        else if (['doc', 'docx'].includes(ext || '')) fileType = 'doc';
        else if (['txt', 'md'].includes(ext || '')) fileType = 'text';
        else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) fileType = 'image';

        uploadedFiles.push({
          path: result.path,
          type: fileType,
          filename: file.name,
        });
      } catch (error) {
        console.error('Error saving file:', error);
      }
    }

    // Ajouter aux fichiers uploadés existants
    onChange({ uploadedFiles: [...data.uploadedFiles, ...uploadedFiles] });
  };

  const handleRemove = (index: number) => {
    onChange({ uploadedFiles: data.uploadedFiles.filter((_, i) => i !== index) });
  };

  const handlePreview = async (uploadedFile: any) => {
    // Pour la preview, on pourrait charger le fichier depuis le disque
    // Pour l'instant, on skip la preview pour les fichiers uploadés
    console.log('Preview not implemented for uploaded files yet');
  };

  const closePreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setPreviewFile(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <h2
          style={{
            fontSize: '2rem',
            fontWeight: 300,
            color: theme.text.primary,
            marginBottom: '0.5rem',
          }}
        >
          Vos documents
        </h2>
        <p style={{ color: theme.text.secondary, fontSize: '0.95rem' }}>
          PDF, Word, PowerPoint, textes, pages Notion (optionnel)
        </p>
      </div>

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        style={{
          border: `2px dashed ${isDragging ? theme.accent.primary : theme.border.default}`,
          borderRadius: borderRadius.xl,
          padding: '3rem',
          textAlign: 'center',
          background: isDragging
            ? mode === 'dark' ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)'
            : mode === 'dark' ? 'rgba(30, 41, 59, 0.3)' : 'rgba(241, 245, 249, 0.5)',
          transition: transitions.normal,
          cursor: 'pointer',
        }}
      >
        <input
          type="file"
          multiple
          onChange={handleFileChange}
          style={{ display: 'none' }}
          id="doc-upload"
          accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
        />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <UploadIcon size={64} color={theme.text.tertiary} />
          </div>
          <div
            style={{
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.bold,
              color: theme.text.primary,
            }}
          >
            Glissez vos documents ici ou cliquez
          </div>
          <div style={{ fontSize: typography.fontSize.sm, color: theme.text.tertiary }}>
            PDF, Word, PowerPoint, textes acceptés
          </div>
          <label
            htmlFor="doc-upload"
            style={{
              padding: '0.75rem 2rem',
              borderRadius: borderRadius.lg,
              border: `2px solid ${theme.border.default}`,
              background: mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
              backdropFilter: 'blur(20px)',
              color: theme.text.primary,
              cursor: 'pointer',
              fontSize: typography.fontSize.base,
              fontWeight: typography.fontWeight.semibold,
              transition: transitions.fast,
              display: 'inline-block',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)';
              e.currentTarget.style.borderColor = theme.accent.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)';
              e.currentTarget.style.borderColor = theme.border.default;
            }}
          >
            Choisir des fichiers
          </label>
        </div>
      </div>

      {/* Notion Section */}
      <div>
        <label
          style={{
            display: 'block',
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.semibold,
            color: theme.text.primary,
            marginBottom: '0.5rem',
          }}
        >
          Lien Notion (optionnel)
        </label>
        <input
          type="text"
          value={data.notionData}
          onChange={(e) => onChange({ notionData: e.target.value })}
          placeholder="https://notion.so/..."
          style={{
            width: '100%',
            padding: '0.875rem 1rem',
            fontSize: typography.fontSize.sm,
            color: theme.text.primary,
            backgroundColor: theme.bg.secondary,
            border: `1px solid ${theme.border.default}`,
            borderRadius: borderRadius.lg,
            outline: 'none',
          }}
        />
      </div>

      {/* Documents List */}
      {data.uploadedFiles.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4
              style={{
                fontSize: typography.fontSize.sm,
                fontWeight: typography.fontWeight.bold,
                color: theme.text.secondary,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Documents ({data.uploadedFiles.length})
            </h4>
            <button
              onClick={() => onChange({ uploadedFiles: [] })}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: borderRadius.md,
                border: `1px solid ${theme.border.light}`,
                background: 'transparent',
                color: theme.text.tertiary,
                fontSize: typography.fontSize.xs,
                cursor: 'pointer',
              }}
            >
              Tout supprimer
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data.uploadedFiles.map((file, index) => (
              <div
                key={`${file.filename}-${index}`}
                style={{
                  background: theme.bg.secondary,
                  border: `1px solid ${theme.border.light}`,
                  borderRadius: borderRadius.lg,
                  padding: '1rem',
                  display: 'flex',
                  gap: '1rem',
                  alignItems: 'center',
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: borderRadius.md,
                    background: theme.accent.muted,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {file.type === 'pdf' && <FileIcon size={28} color={theme.accent.primary} />}
                  {file.type === 'doc' && <DocumentIcon size={28} color={theme.accent.primary} />}
                  {file.type === 'text' && <TextIcon size={28} color={theme.accent.primary} />}
                  {file.type === 'image' && <FileIcon size={28} color={theme.accent.primary} />}
                  {!['pdf', 'doc', 'text', 'image'].includes(file.type) && <AttachmentIcon size={28} color={theme.accent.primary} />}
                </div>

                {/* File Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.medium,
                      color: theme.text.primary,
                      marginBottom: '0.25rem',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {file.filename}
                  </div>
                  <div
                    style={{
                      fontSize: typography.fontSize.xs,
                      color: theme.text.tertiary,
                    }}
                  >
                    Type: {file.type.toUpperCase()}
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemove(index)}
                  style={{
                    padding: '0.5rem',
                    borderRadius: borderRadius.md,
                    border: 'none',
                    background: 'transparent',
                    color: theme.text.tertiary,
                    cursor: 'pointer',
                    transition: transitions.fast,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = theme.semantic.errorBg;
                    e.currentTarget.style.color = theme.semantic.error;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = theme.text.tertiary;
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
