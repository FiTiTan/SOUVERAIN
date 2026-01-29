import React from 'react';
import { useTheme } from '../../../ThemeContext';
import { typography, borderRadius } from '../../../design-system';

interface DeveloperTemplateProps {
  project: {
    title: string;
    pitch?: string;
    stack?: string[];
    challenge?: string;
    solution?: string;
    outputs?: Array<{ label: string; url: string }>;
    source_type?: string;
    source_url?: string;
  };
}

export const DeveloperTemplate: React.FC<DeveloperTemplateProps> = ({ project }) => {
  const { theme } = useTheme();

  // Parse stack si JSON string
  let stack: string[] = [];
  if (typeof project.stack === 'string') {
    try {
      stack = JSON.parse(project.stack);
    } catch {
      stack = [];
    }
  } else if (Array.isArray(project.stack)) {
    stack = project.stack;
  }

  // Parse outputs si JSON string
  let outputs: Array<{ label: string; url: string }> = [];
  if (typeof project.outputs === 'string') {
    try {
      outputs = JSON.parse(project.outputs);
    } catch {
      outputs = [];
    }
  } else if (Array.isArray(project.outputs)) {
    outputs = project.outputs;
  }

  const styles = {
    container: {
      backgroundColor: '#1a1a1a',
      borderRadius: borderRadius.xl,
      padding: '2rem',
      border: '1px solid #333',
      fontFamily: "'Fira Code', 'Monaco', 'Courier New', monospace",
    },
    header: {
      marginBottom: '2rem',
      borderBottom: '2px solid #00ff9f',
      paddingBottom: '1rem',
    },
    title: {
      fontSize: typography.fontSize['3xl'],
      fontWeight: typography.fontWeight.bold,
      color: '#00ff9f',
      margin: 0,
      marginBottom: '0.5rem',
    },
    badge: {
      display: 'inline-block',
      padding: '0.25rem 0.75rem',
      fontSize: typography.fontSize.xs,
      backgroundColor: '#00ff9f',
      color: '#1a1a1a',
      borderRadius: borderRadius.full,
      fontWeight: typography.fontWeight.bold,
      textTransform: 'uppercase' as const,
    },
    section: {
      marginBottom: '2rem',
    },
    sectionTitle: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.bold,
      color: '#00ff9f',
      textTransform: 'uppercase' as const,
      marginBottom: '0.75rem',
      letterSpacing: '0.1em',
    },
    pitch: {
      fontSize: typography.fontSize.lg,
      color: '#e0e0e0',
      lineHeight: 1.6,
      fontStyle: 'italic',
    },
    stackGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
      gap: '0.75rem',
    },
    stackItem: {
      padding: '0.75rem',
      backgroundColor: '#2a2a2a',
      border: '1px solid #00ff9f',
      borderRadius: borderRadius.md,
      fontSize: typography.fontSize.sm,
      color: '#00ff9f',
      textAlign: 'center' as const,
      fontWeight: typography.fontWeight.semibold,
    },
    text: {
      fontSize: typography.fontSize.base,
      color: '#c0c0c0',
      lineHeight: 1.8,
      whiteSpace: 'pre-wrap' as const,
    },
    outputsList: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.75rem',
    },
    outputLink: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      padding: '1rem',
      backgroundColor: '#2a2a2a',
      border: '1px solid #444',
      borderRadius: borderRadius.md,
      textDecoration: 'none',
      transition: 'all 0.2s ease',
      cursor: 'pointer',
    },
    outputIcon: {
      fontSize: typography.fontSize.xl,
    },
    outputLabel: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: '#00ff9f',
    },
    outputUrl: {
      fontSize: typography.fontSize.sm,
      color: '#888',
      fontFamily: "'Fira Code', monospace",
    },
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>
          <span style={{ color: '#888' }}>&gt;_</span> {project.title}
        </h2>
        <span style={styles.badge}>
          {project.source_type === 'github' ? '🐙 GitHub' : '📁 Local'}
        </span>
      </div>

      {/* Pitch */}
      {project.pitch && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>// Pitch</div>
          <p style={styles.pitch}>{project.pitch}</p>
        </div>
      )}

      {/* Stack */}
      {stack.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>// Stack</div>
          <div style={styles.stackGrid}>
            {stack.map((tech, index) => (
              <div key={index} style={styles.stackItem}>
                {tech}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Challenge */}
      {project.challenge && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>// Challenge</div>
          <p style={styles.text}>{project.challenge}</p>
        </div>
      )}

      {/* Solution */}
      {project.solution && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>// Solution</div>
          <p style={styles.text}>{project.solution}</p>
        </div>
      )}

      {/* Outputs */}
      {outputs.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>// Outputs</div>
          <div style={styles.outputsList}>
            {outputs.map((output, index) => (
              <a
                key={index}
                href={output.url}
                style={styles.outputLink}
                onClick={(e) => {
                  e.preventDefault();
                  window.electron.openExternal(output.url);
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#333';
                  e.currentTarget.style.borderColor = '#00ff9f';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#2a2a2a';
                  e.currentTarget.style.borderColor = '#444';
                }}
              >
                <span style={styles.outputIcon}>🔗</span>
                <div>
                  <div style={styles.outputLabel}>{output.label}</div>
                  <div style={styles.outputUrl}>{output.url}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
