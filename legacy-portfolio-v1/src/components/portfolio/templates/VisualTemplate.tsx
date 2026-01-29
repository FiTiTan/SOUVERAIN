import React from 'react';
import { useTheme } from '../../../ThemeContext';

interface VisualTemplateProps {
  project: any;
}

export const VisualTemplate: React.FC<VisualTemplateProps> = ({ project }) => {
  const { theme } = useTheme();

  const getStack = () => {
    try {
      if (project.stack) {
        const stack = typeof project.stack === 'string' ? JSON.parse(project.stack) : project.stack;
        return Array.isArray(stack) ? stack : [];
      }
      return [];
    } catch {
      return [];
    }
  };

  const getOutputs = () => {
    try {
      if (project.outputs) {
        const outputs = typeof project.outputs === 'string' ? JSON.parse(project.outputs) : project.outputs;
        return Array.isArray(outputs) ? outputs : [];
      }
      return [];
    } catch {
      return [];
    }
  };

  const getImages = () => {
    try {
      if (project.images) {
        const images = typeof project.images === 'string' ? JSON.parse(project.images) : project.images;
        return Array.isArray(images) ? images : [];
      }
      return [];
    } catch {
      return [];
    }
  };

  const stack = getStack();
  const outputs = getOutputs();
  const images = getImages();

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '4rem 2rem',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      backgroundColor: theme.name === 'dark' ? '#0A0A0A' : '#FFFFFF',
      color: theme.text.primary,
      minHeight: '100vh',
    },
    header: {
      textAlign: 'center' as const,
      marginBottom: '4rem',
      paddingBottom: '2rem',
      borderBottom: `1px solid ${theme.name === 'dark' ? '#222' : '#E5E5E5'}`,
    },
    title: {
      fontSize: '3.5rem',
      fontWeight: 300,
      letterSpacing: '-0.03em',
      marginBottom: '1rem',
      lineHeight: 1.2,
    },
    subtitle: {
      fontSize: '1.125rem',
      color: theme.text.secondary,
      fontWeight: 400,
      letterSpacing: '0.02em',
      marginTop: '1.5rem',
    },
    section: {
      marginBottom: '4rem',
    },
    sectionTitle: {
      fontSize: '0.875rem',
      fontWeight: 600,
      letterSpacing: '0.1em',
      textTransform: 'uppercase' as const,
      color: theme.text.secondary,
      marginBottom: '1.5rem',
    },
    pitch: {
      fontSize: '1.5rem',
      lineHeight: 1.6,
      fontWeight: 300,
      color: theme.text.primary,
      maxWidth: '800px',
      margin: '0 auto',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1rem',
      marginBottom: '3rem',
    },
    imageCard: {
      width: '100%',
      aspectRatio: '16/10',
      backgroundColor: theme.bg.secondary,
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '3rem',
      border: `1px solid ${theme.border.light}`,
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: '100%',
      objectFit: 'cover' as const,
    },
    textBlock: {
      maxWidth: '700px',
      margin: '0 auto',
    },
    label: {
      fontSize: '0.875rem',
      fontWeight: 600,
      letterSpacing: '0.1em',
      textTransform: 'uppercase' as const,
      color: theme.text.secondary,
      marginBottom: '0.75rem',
    },
    text: {
      fontSize: '1.125rem',
      lineHeight: 1.7,
      color: theme.text.primary,
      fontWeight: 300,
    },
    stackGrid: {
      display: 'flex',
      flexWrap: 'wrap' as const,
      gap: '1rem',
      justifyContent: 'center',
      maxWidth: '800px',
      margin: '0 auto',
    },
    stackItem: {
      padding: '0.625rem 1.25rem',
      fontSize: '0.875rem',
      fontWeight: 500,
      backgroundColor: theme.name === 'dark' ? '#1A1A1A' : '#F5F5F5',
      color: theme.text.primary,
      border: `1px solid ${theme.border.light}`,
      borderRadius: '50px',
      letterSpacing: '0.02em',
    },
    outputsGrid: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '1rem',
      maxWidth: '700px',
      margin: '0 auto',
    },
    outputItem: {
      padding: '1.25rem 1.5rem',
      backgroundColor: theme.bg.elevated,
      border: `1px solid ${theme.border.light}`,
      borderRadius: '12px',
      transition: 'all 0.2s ease',
      textDecoration: 'none',
      color: 'inherit',
      display: 'block',
    },
    outputLabel: {
      fontSize: '0.875rem',
      fontWeight: 600,
      color: theme.text.secondary,
      marginBottom: '0.5rem',
      letterSpacing: '0.05em',
    },
    outputUrl: {
      fontSize: '1rem',
      color: theme.accent.primary,
      wordBreak: 'break-all' as const,
      fontWeight: 400,
    },
    divider: {
      width: '60px',
      height: '1px',
      backgroundColor: theme.accent.primary,
      margin: '3rem auto',
    },
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>{project.title}</h1>
        {project.pitch && <p style={styles.subtitle}>{project.pitch}</p>}
      </div>

      {/* Images Gallery */}
      {images.length > 0 && (
        <div style={styles.section}>
          <div style={styles.grid}>
            {images.map((img: string, index: number) => (
              <div key={index} style={styles.imageCard}>
                {img.startsWith('data:') || img.startsWith('http') ? (
                  <img src={img} alt={`${project.title} ${index + 1}`} style={styles.image} />
                ) : (
                  <span>🖼️</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pitch Section */}
      {project.pitch && (
        <div style={styles.section}>
          <div style={styles.divider} />
          <div style={styles.pitch}>{project.pitch}</div>
        </div>
      )}

      {/* Tools/Stack */}
      {stack.length > 0 && (
        <div style={styles.section}>
          <div style={styles.divider} />
          <h2 style={styles.sectionTitle}>Outils & Technologies</h2>
          <div style={styles.stackGrid}>
            {stack.map((tech: string, index: number) => (
              <span key={index} style={styles.stackItem}>
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Challenge */}
      {project.challenge && (
        <div style={styles.section}>
          <div style={styles.divider} />
          <div style={styles.textBlock}>
            <div style={styles.label}>Le Défi</div>
            <p style={styles.text}>{project.challenge}</p>
          </div>
        </div>
      )}

      {/* Solution */}
      {project.solution && (
        <div style={styles.section}>
          <div style={styles.divider} />
          <div style={styles.textBlock}>
            <div style={styles.label}>L'Approche</div>
            <p style={styles.text}>{project.solution}</p>
          </div>
        </div>
      )}

      {/* Outputs */}
      {outputs.length > 0 && (
        <div style={styles.section}>
          <div style={styles.divider} />
          <h2 style={styles.sectionTitle}>Liens & Ressources</h2>
          <div style={styles.outputsGrid}>
            {outputs.map((output: any, index: number) => (
              <a
                key={index}
                href={output.url}
                target="_blank"
                rel="noopener noreferrer"
                style={styles.outputItem}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={styles.outputLabel}>{output.label}</div>
                <div style={styles.outputUrl}>{output.url}</div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
