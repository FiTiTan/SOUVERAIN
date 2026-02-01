import React, { useState } from 'react';
import { useTheme } from '../../../../../ThemeContext';
import { typography, borderRadius, transitions } from '../../../../../design-system';

interface Step2Props {
    onNext: (files: File[]) => void;
    existingFiles: File[];
}

// Helper: Get file icon based on type
const getFileIcon = (file: File): string => {
    const type = file.type.toLowerCase();
    if (type.includes('pdf')) return '📄';
    if (type.includes('image')) return '🖼️';
    if (type.includes('video')) return '🎥';
    if (type.includes('word') || type.includes('document')) return '📝';
    return '📎';
};

// Helper: Format file size
const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// File Preview Card Component
const FilePreviewCard: React.FC<{
    file: File;
    onRemove: () => void;
}> = ({ file, onRemove }) => {
    const { theme, mode } = useTheme();
    const [preview, setPreview] = useState<string | null>(null);

    // Generate preview for images
    React.useEffect(() => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }, [file]);

    const isImage = file.type.startsWith('image/');

    return (
        <div
            style={{
                background: theme.bg.secondary,
                border: `1px solid ${theme.border.light}`,
                borderRadius: borderRadius.lg,
                padding: '1rem',
                display: 'flex',
                gap: '1rem',
                alignItems: 'flex-start',
                transition: transitions.normal,
                position: 'relative',
            }}
        >
            {/* Preview / Icon */}
            <div
                style={{
                    width: isImage ? '80px' : '60px',
                    height: isImage ? '80px' : '60px',
                    borderRadius: borderRadius.md,
                    background: isImage
                        ? `url(${preview}) center/cover`
                        : mode === 'dark'
                        ? 'rgba(99, 102, 241, 0.1)'
                        : 'rgba(99, 102, 241, 0.05)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: isImage ? '0' : '2rem',
                    flexShrink: 0,
                }}
            >
                {!isImage && getFileIcon(file)}
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
                onClick={onRemove}
                style={{
                    padding: '0.5rem',
                    borderRadius: borderRadius.md,
                    border: 'none',
                    background: 'transparent',
                    color: theme.text.tertiary,
                    cursor: 'pointer',
                    transition: transitions.fast,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
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
                <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
            </button>
        </div>
    );
};

export const Step2_FileImporter: React.FC<Step2Props> = ({ onNext, existingFiles }) => {
    const { theme, mode } = useTheme();
    const [files, setFiles] = useState<File[]>(existingFiles);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) {
            setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const removeFile = (index: number) => {
        setFiles((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Header */}
            <div style={{ textAlign: 'center' }}>
                <h3
                    style={{
                        fontSize: typography.fontSize.xl,
                        fontWeight: typography.fontWeight.bold,
                        color: theme.text.primary,
                        marginBottom: '0.5rem',
                    }}
                >
                    Importez vos fichiers
                </h3>
                <p
                    style={{
                        fontSize: typography.fontSize.sm,
                        color: theme.text.secondary,
                    }}
                >
                    PDF, Images, Vidéos, Documents
                </p>
            </div>

            {/* Drop Zone */}
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                style={{
                    border: `2px dashed ${
                        isDragging ? theme.accent.primary : theme.border.default
                    }`,
                    borderRadius: borderRadius.xl,
                    padding: '3rem',
                    textAlign: 'center',
                    background: isDragging
                        ? mode === 'dark'
                            ? 'rgba(99, 102, 241, 0.1)'
                            : 'rgba(99, 102, 241, 0.05)'
                        : mode === 'dark'
                        ? 'rgba(30, 41, 59, 0.3)'
                        : 'rgba(241, 245, 249, 0.5)',
                    transition: transitions.normal,
                    cursor: 'pointer',
                }}
            >
                <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                    id="file-upload"
                    accept="application/pdf,image/*,video/*,.doc,.docx,.txt"
                />
                <label htmlFor="file-upload" style={{ cursor: 'pointer', display: 'block' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📂</div>
                    <div
                        style={{
                            fontSize: typography.fontSize.lg,
                            fontWeight: typography.fontWeight.bold,
                            color: theme.text.primary,
                            marginBottom: '0.5rem',
                        }}
                    >
                        Cliquez ou glissez vos fichiers ici
                    </div>
                    <div
                        style={{
                            fontSize: typography.fontSize.sm,
                            color: theme.text.tertiary,
                        }}
                    >
                        PDF, Images, Vidéos, Documents acceptés
                    </div>
                </label>
            </div>

            {/* File List */}
            {files.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        <h4
                            style={{
                                fontSize: typography.fontSize.sm,
                                fontWeight: typography.fontWeight.bold,
                                color: theme.text.secondary,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                            }}
                        >
                            Fichiers sélectionnés ({files.length})
                        </h4>
                        {files.length > 0 && (
                            <button
                                onClick={() => setFiles([])}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: borderRadius.md,
                                    border: `1px solid ${theme.border.light}`,
                                    background: 'transparent',
                                    color: theme.text.tertiary,
                                    fontSize: typography.fontSize.xs,
                                    cursor: 'pointer',
                                    transition: transitions.fast,
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = theme.semantic.errorBg;
                                    e.currentTarget.style.color = theme.semantic.error;
                                    e.currentTarget.style.borderColor = theme.semantic.error;
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.color = theme.text.tertiary;
                                    e.currentTarget.style.borderColor = theme.border.light;
                                }}
                            >
                                Tout supprimer
                            </button>
                        )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {files.map((file, index) => (
                            <FilePreviewCard
                                key={`${file.name}-${index}`}
                                file={file}
                                onRemove={() => removeFile(index)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Continue Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                    onClick={() => onNext(files)}
                    style={{
                        padding: '0.75rem 2rem',
                        borderRadius: borderRadius.lg,
                        border: 'none',
                        background: theme.accent.primary,
                        color: theme.text.inverse,
                        fontSize: typography.fontSize.base,
                        fontWeight: typography.fontWeight.bold,
                        cursor: 'pointer',
                        transition: transitions.fast,
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = theme.accent.secondary;
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = theme.accent.primary;
                    }}
                >
                    Continuer {files.length > 0 ? `avec ${files.length} fichier${files.length > 1 ? 's' : ''}` : '(Sauter cette étape)'}
                </button>
            </div>
        </div>
    );
};
