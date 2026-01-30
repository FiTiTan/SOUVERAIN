import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../../ThemeContext';
import { typography, borderRadius, transitions } from '../../../design-system';
import type { PortfolioFormData } from './types';

interface Step4DocumentsProps {
  data: PortfolioFormData;
  onChange: (updates: Partial<PortfolioFormData>) => void;
}

// Helper: Get file icon based on type
const getFileIcon = (file: File): string => {
  const type = file.type.toLowerCase();
  if (type.includes('pdf')) return '📄';
  if (type.includes('word') || type.includes('document')) return '📝';
  if (type.includes('powerpoint') || type.includes('presentation')) return '📊';
  if (type.includes('text')) return '📃';
  return '📎';
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
          fontSize: '1.5rem',
          flexShrink: 0,
        }}
      >
        {getFileIcon(file)}
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
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      onChange({ documents: [...data.documents, ...newFiles] });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      const newFiles = Array.from(e.dataTransfer.files);
      onChange({ documents: [...data.documents, ...newFiles] });
    }
  };

  const handleRemove = (index: number) => {
    onChange({ documents: data.documents.filter((_, i) => i !== index) });
  };

  const handlePreview = (file: File) => {
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setPreviewFile(file);
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
        <label htmlFor="doc-upload" style={{ cursor: 'pointer', display: 'block' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📄</div>
          <div
            style={{
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.bold,
              color: theme.text.primary,
              marginBottom: '0.5rem',
            }}
          >
            Glissez vos documents ici
          </div>
          <div style={{ fontSize: typography.fontSize.sm, color: theme.text.tertiary }}>
            PDF, Word, PowerPoint, textes acceptés
          </div>
        </label>
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
      {data.documents.length > 0 && (
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
              Documents ({data.documents.length})
            </h4>
            <button
              onClick={() => onChange({ documents: [] })}
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
            {data.documents.map((file, index) => (
              <DocumentPreviewCard
                key={`${file.name}-${index}`}
                file={file}
                onRemove={() => handleRemove(index)}
                onClick={() => handlePreview(file)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewFile && previewUrl && (
        <div
          onClick={closePreview}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(10px)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            padding: '2rem',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1rem',
            }}
          >
            <div style={{ color: '#fff', fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold }}>
              {previewFile.name}
            </div>
            <button
              onClick={closePreview}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: borderRadius.md,
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                fontSize: typography.fontSize.sm,
                cursor: 'pointer',
              }}
            >
              Fermer ✕
            </button>
          </div>

          {/* Preview Content */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              flex: 1,
              background: '#fff',
              borderRadius: borderRadius.xl,
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {previewFile.type === 'application/pdf' ? (
              <iframe
                src={previewUrl}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                }}
                title={previewFile.name}
              />
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{getFileIcon(previewFile)}</div>
                <div style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.semibold, color: theme.text.primary, marginBottom: '1rem' }}>
                  {previewFile.name}
                </div>
                <div style={{ fontSize: typography.fontSize.sm, color: theme.text.secondary, marginBottom: '2rem' }}>
                  Aperçu non disponible pour ce type de fichier
                </div>
                <a
                  href={previewUrl}
                  download={previewFile.name}
                  style={{
                    padding: '0.75rem 1.5rem',
                    borderRadius: borderRadius.lg,
                    background: theme.accent.primary,
                    color: '#fff',
                    fontSize: typography.fontSize.sm,
                    fontWeight: typography.fontWeight.semibold,
                    textDecoration: 'none',
                    display: 'inline-block',
                  }}
                >
                  Télécharger
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
};
