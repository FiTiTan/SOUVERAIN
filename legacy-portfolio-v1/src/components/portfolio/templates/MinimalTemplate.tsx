import React from 'react';
import { useTheme } from '../../../ThemeContext';
import { typography, borderRadius } from '../../../design-system';

interface MinimalTemplateProps {
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

export const MinimalTemplate: React.FC<MinimalTemplateProps> = ({ project }) => {
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
      backgroundColor: theme.bg.elevated,
      borderRadius: borderRadius.xl,
      padding: '3rem',
      border: `1px solid ${theme.border.light}`,
      maxWidth: '800px',
      margin: '0 auto',
    },
    header: {
      marginBottom: '3rem',
      textAlign: 'center' as const,
    },
    title: {
      fontSize: typography.fontSize['4xl'],
      fontWeight: typography.fontWeight.bold,
      color: theme.text.primary,
      margin: 0,
      marginBottom: '1rem',
      letterSpacing: '-0.02em',
    },
    subtitle: {
      fontSize: typography.fontSize.sm,
      color: theme.text.secondary,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.1em',
    },
    divider: {
      width: '60px',
      height: '2px',
      backgroundColor: theme.accent.primary,
      margin: '2rem auto',
    },
    section: {
      marginBottom: '2.5rem',
    },
    sectionTitle: {
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.bold,
      color: theme.accent.primary,
      textTransform: 'uppercase' as const,
      marginBottom: '1rem',
      letterSpacing: '0.15em',
    },
    pitch: {
      fontSize: typography.fontSize.xl,
      color: theme.text.primary,
      lineHeight: 1.6,
      textAlign: 'center' as const,
      fontStyle: 'italic',
      fontWeight: typography.fontWeight.light,
    },
    stackList: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '0.5rem',
      justifyContent: 'center',
    },
    stackTag: {
      padding: '0.5rem 1rem',
      fontSize: typography.fontSize.sm,
      backgroundColor: theme.bg.secondary,
      color: theme.text.secondary,
      borderRadius: borderRadius.full,
      border: `1px solid ${theme.border.light}`,
    },
    text: {
      fontSize: typography.fontSize.base,
      color: theme.text.secondary,
      lineHeight: 1.8,
      whiteSpace: 'pre-wrap' as const,
    },
    outputsList: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1rem',
      alignItems: 'center',
    },
    outputLink: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.75rem 1.5rem',
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium,
      color: theme.accent.primary,
      textDecoration: 'none',
      border: `1px solid ${theme.accent.primary}`,
      borderRadius: borderRadius.full,
      transition: 'all 0.2s ease',
      cursor: 'pointer',
    },
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <p style={styles.subtitle}>
          {project.source_type === 'github' ? 'GitHub Project' : 'Local Project'}
        </p>
        <h2 style={styles.title}>{project.title}</h2>
      </div>

      {/* Pitch */}
      {project.pitch && (
        <>
          <p style={styles.pitch}>{project.pitch}</p>
          <div style={styles.divider} />
        </>
      )}

      {/* Stack */}
      {stack.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Stack Technique</div>
          <div style={styles.stackList}>
            {stack.map((tech, index) => (
              <span key={index} style={styles.stackTag}>
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Challenge */}
      {project.challenge && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Le Challenge</div>
          <p style={styles.text}>{project.challenge}</p>
        </div>
      )}

      {/* Solution */}
      {project.solution && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>La Solution</div>
          <p style={styles.text}>{project.solution}</p>
        </div>
      )}

      {/* Outputs */}
      {outputs.length > 0 && (
        <div style={styles.section}>
          <div style={styles.sectionTitle}>Liens</div>
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
                  e.currentTarget.style.backgroundColor = theme.accent.primary;
                  e.currentTarget.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = theme.accent.primary;
                }}
              >
                <span>{output.label}</span>
                <span>→</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
