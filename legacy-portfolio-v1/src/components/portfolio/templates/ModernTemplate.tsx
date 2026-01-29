import React from 'react';
import { useTheme } from '../../../ThemeContext';
import { typography, borderRadius } from '../../../design-system';
import type {
  HeroContent,
  AboutContent,
  ExperienceContent,
  SkillsContent,
  ProjectsContent,
  EducationContent,
  ContactContent,
} from '../../../types/portfolio';

interface ModernTemplateProps {
  sections: {
    hero?: HeroContent;
    about?: AboutContent;
    experience?: ExperienceContent;
    skills?: SkillsContent;
    projects?: ProjectsContent;
    education?: EducationContent;
    contact?: ContactContent;
  };
}

export const ModernTemplate: React.FC<ModernTemplateProps> = ({ sections }) => {
  const { theme } = useTheme();

  const styles = {
    container: {
      maxWidth: '900px',
      margin: '0 auto',
      backgroundColor: theme.bg.primary,
      minHeight: '100vh',
    },
    section: {
      padding: '3rem 2rem',
      borderBottom: `1px solid ${theme.border.light}`,
    },
    heroSection: {
      padding: '4rem 2rem',
      textAlign: 'center' as const,
      background: `linear-gradient(135deg, ${theme.accent.muted} 0%, ${theme.bg.secondary} 100%)`,
    },
    photo: {
      width: '150px',
      height: '150px',
      borderRadius: '50%',
      backgroundColor: theme.bg.elevated,
      border: `4px solid ${theme.accent.primary}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '4rem',
      margin: '0 auto 2rem',
    },
    name: {
      fontSize: typography.fontSize['4xl'],
      fontWeight: typography.fontWeight.bold,
      color: theme.text.primary,
      marginBottom: '0.5rem',
    },
    title: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.semibold,
      color: theme.accent.primary,
      marginBottom: '1rem',
    },
    tagline: {
      fontSize: typography.fontSize.lg,
      color: theme.text.secondary,
      lineHeight: typography.lineHeight.relaxed,
      maxWidth: '600px',
      margin: '0 auto 1rem',
    },
    meta: {
      display: 'flex',
      justifyContent: 'center',
      gap: '2rem',
      fontSize: typography.fontSize.sm,
      color: theme.text.secondary,
      marginTop: '1.5rem',
    },
    sectionTitle: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: theme.text.primary,
      marginBottom: '1.5rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    headline: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.semibold,
      color: theme.accent.primary,
      marginBottom: '1rem',
    },
    bio: {
      fontSize: typography.fontSize.base,
      color: theme.text.primary,
      lineHeight: typography.lineHeight.relaxed,
      marginBottom: '1.5rem',
      whiteSpace: 'pre-wrap' as const,
    },
    highlightsList: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1rem',
    },
    highlightItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '0.75rem',
      padding: '1rem',
      backgroundColor: theme.bg.secondary,
      borderRadius: borderRadius.lg,
      border: `1px solid ${theme.border.light}`,
    },
    highlightText: {
      fontSize: typography.fontSize.sm,
      color: theme.text.primary,
      lineHeight: typography.lineHeight.normal,
    },
    contactGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '1.5rem',
    },
    contactItem: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '0.5rem',
    },
    contactLabel: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: theme.text.secondary,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.05em',
    },
    contactValue: {
      fontSize: typography.fontSize.base,
      color: theme.accent.primary,
      textDecoration: 'none',
    },
    socialLinks: {
      display: 'flex',
      gap: '1rem',
      flexWrap: 'wrap' as const,
      marginTop: '1.5rem',
    },
    socialLink: {
      padding: '0.75rem 1.5rem',
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: theme.text.primary,
      backgroundColor: theme.bg.secondary,
      border: `1px solid ${theme.border.default}`,
      borderRadius: borderRadius.md,
      textDecoration: 'none',
      transition: 'all 0.2s',
    },
    emptySection: {
      padding: '2rem',
      textAlign: 'center' as const,
      color: theme.text.secondary,
      fontStyle: 'italic',
    },
  };

  return (
    <div style={styles.container}>
      {/* Hero */}
      {sections.hero && (
        <div style={styles.heroSection}>
          <div style={styles.photo}>
            {sections.hero.photo ? '🖼️' : '👤'}
          </div>
          {sections.hero.name && <h1 style={styles.name}>{sections.hero.name}</h1>}
          {sections.hero.title && <div style={styles.title}>{sections.hero.title}</div>}
          {sections.hero.tagline && <p style={styles.tagline}>{sections.hero.tagline}</p>}
          <div style={styles.meta}>
            {sections.hero.location && <span>📍 {sections.hero.location}</span>}
            {sections.hero.availability && <span>🟢 {sections.hero.availability}</span>}
          </div>
        </div>
      )}

      {/* About */}
      {sections.about && (sections.about.headline || sections.about.bio || sections.about.highlights.length > 0) && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <span>📝</span>
            <span>À propos</span>
          </h2>
          {sections.about.headline && <div style={styles.headline}>{sections.about.headline}</div>}
          {sections.about.bio && <p style={styles.bio}>{sections.about.bio}</p>}
          {sections.about.highlights.length > 0 && (
            <div style={styles.highlightsList}>
              {sections.about.highlights.map((highlight, index) => (
                <div key={index} style={styles.highlightItem}>
                  <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>✓</span>
                  <span style={styles.highlightText}>{highlight}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Experience */}
      {sections.experience && sections.experience.entries.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <span>💼</span>
            <span>Expériences</span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '2rem' }}>
            {sections.experience.entries.map((entry) => (
              <div key={entry.id} style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <h3 style={{
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.semibold,
                    color: theme.text.primary,
                    margin: 0,
                  }}>
                    {entry.position}
                  </h3>
                  <span style={{
                    fontSize: typography.fontSize.sm,
                    color: theme.text.secondary,
                  }}>
                    {entry.startDate} - {entry.isCurrent ? 'Présent' : entry.endDate}
                  </span>
                </div>
                <div style={{
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.medium,
                  color: theme.accent.primary,
                }}>
                  {entry.company} {entry.location && `• ${entry.location}`}
                </div>
                {entry.description && (
                  <p style={{
                    fontSize: typography.fontSize.sm,
                    color: theme.text.primary,
                    lineHeight: typography.lineHeight.relaxed,
                    margin: '0.5rem 0 0 0',
                  }}>
                    {entry.description}
                  </p>
                )}
                {entry.achievements.length > 0 && (
                  <ul style={{
                    margin: '0.5rem 0 0 0',
                    paddingLeft: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column' as const,
                    gap: '0.25rem',
                  }}>
                    {entry.achievements.map((achievement, idx) => (
                      <li key={idx} style={{
                        fontSize: typography.fontSize.sm,
                        color: theme.text.primary,
                        lineHeight: typography.lineHeight.normal,
                      }}>
                        {achievement}
                      </li>
                    ))}
                  </ul>
                )}
                {entry.tags.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap' as const, gap: '0.5rem', marginTop: '0.5rem' }}>
                    {entry.tags.map((tag, idx) => (
                      <span key={idx} style={{
                        padding: '0.25rem 0.75rem',
                        fontSize: typography.fontSize.xs,
                        color: theme.accent.primary,
                        backgroundColor: theme.accent.muted,
                        borderRadius: borderRadius.md,
                      }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {sections.skills && sections.skills.categories.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <span>🎯</span>
            <span>Compétences</span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '2rem' }}>
            {sections.skills.categories.map((category) => (
              <div key={category.id}>
                <h3 style={{
                  fontSize: typography.fontSize.lg,
                  fontWeight: typography.fontWeight.semibold,
                  color: theme.text.primary,
                  marginBottom: '1rem',
                }}>
                  {category.name}
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '0.75rem',
                }}>
                  {category.skills.map((skill, idx) => {
                    const levelColors = {
                      beginner: '#94a3b8',
                      intermediate: '#60a5fa',
                      advanced: '#34d399',
                      expert: '#a78bfa',
                    };
                    const levelLabels = {
                      beginner: 'Débutant',
                      intermediate: 'Intermédiaire',
                      advanced: 'Avancé',
                      expert: 'Expert',
                    };
                    return (
                      <div key={idx} style={{
                        padding: '0.75rem',
                        backgroundColor: theme.bg.secondary,
                        border: `1px solid ${levelColors[skill.level]}`,
                        borderRadius: borderRadius.md,
                        display: 'flex',
                        flexDirection: 'column' as const,
                        gap: '0.25rem',
                      }}>
                        <div style={{
                          fontSize: typography.fontSize.sm,
                          fontWeight: typography.fontWeight.medium,
                          color: theme.text.primary,
                        }}>
                          {skill.name}
                        </div>
                        <div style={{
                          fontSize: typography.fontSize.xs,
                          color: levelColors[skill.level],
                        }}>
                          {levelLabels[skill.level]}
                          {skill.yearsOfExperience && ` • ${skill.yearsOfExperience} an${skill.yearsOfExperience > 1 ? 's' : ''}`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {sections.education && sections.education.entries.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <span>🎓</span>
            <span>Formation</span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column' as const, gap: '2rem' }}>
            {sections.education.entries.map((entry) => (
              <div key={entry.id} style={{ display: 'flex', flexDirection: 'column' as const, gap: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <h3 style={{
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.semibold,
                    color: theme.text.primary,
                    margin: 0,
                  }}>
                    {entry.degree}{entry.field && ` - ${entry.field}`}
                  </h3>
                  <span style={{
                    fontSize: typography.fontSize.sm,
                    color: theme.text.secondary,
                  }}>
                    {entry.startDate} - {entry.isCurrent ? 'Présent' : entry.endDate}
                  </span>
                </div>
                <div style={{
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.medium,
                  color: theme.accent.primary,
                }}>
                  {entry.school} {entry.location && `• ${entry.location}`}
                </div>
                {entry.description && (
                  <p style={{
                    fontSize: typography.fontSize.sm,
                    color: theme.text.primary,
                    lineHeight: typography.lineHeight.relaxed,
                    margin: '0.5rem 0 0 0',
                  }}>
                    {entry.description}
                  </p>
                )}
                {entry.achievements.length > 0 && (
                  <ul style={{
                    margin: '0.5rem 0 0 0',
                    paddingLeft: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column' as const,
                    gap: '0.25rem',
                  }}>
                    {entry.achievements.map((achievement, idx) => (
                      <li key={idx} style={{
                        fontSize: typography.fontSize.sm,
                        color: theme.text.primary,
                        lineHeight: typography.lineHeight.normal,
                      }}>
                        {achievement}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contact */}
      {sections.contact && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <span>📧</span>
            <span>Contact</span>
          </h2>
          <div style={styles.contactGrid}>
            {sections.contact.email && (
              <div style={styles.contactItem}>
                <div style={styles.contactLabel}>Email</div>
                <a href={`mailto:${sections.contact.email}`} style={styles.contactValue}>
                  {sections.contact.email}
                </a>
              </div>
            )}
            {sections.contact.phone && (
              <div style={styles.contactItem}>
                <div style={styles.contactLabel}>Téléphone</div>
                <a href={`tel:${sections.contact.phone}`} style={styles.contactValue}>
                  {sections.contact.phone}
                </a>
              </div>
            )}
          </div>

          {/* Social Links */}
          {(sections.contact.linkedin || sections.contact.github || sections.contact.twitter || sections.contact.website || sections.contact.customLinks.length > 0) && (
            <div style={styles.socialLinks}>
              {sections.contact.linkedin && (
                <a href={sections.contact.linkedin} target="_blank" rel="noopener noreferrer" style={styles.socialLink}>
                  💼 LinkedIn
                </a>
              )}
              {sections.contact.github && (
                <a href={sections.contact.github} target="_blank" rel="noopener noreferrer" style={styles.socialLink}>
                  🐙 GitHub
                </a>
              )}
              {sections.contact.twitter && (
                <a href={sections.contact.twitter} target="_blank" rel="noopener noreferrer" style={styles.socialLink}>
                  🐦 Twitter
                </a>
              )}
              {sections.contact.website && (
                <a href={sections.contact.website} target="_blank" rel="noopener noreferrer" style={styles.socialLink}>
                  🌐 Site web
                </a>
              )}
              {sections.contact.customLinks.map((link, index) => (
                <a key={index} href={link.url} target="_blank" rel="noopener noreferrer" style={styles.socialLink}>
                  🔗 {link.label}
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
