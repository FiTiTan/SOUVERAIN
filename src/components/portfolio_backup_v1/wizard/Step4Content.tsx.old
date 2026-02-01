import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, FolderOpen, Upload, Linkedin, FileText, X } from 'lucide-react';
import { useTheme } from '../../../ThemeContext';
import type { PortfolioFormData, Project, Testimonial } from './types';
import { MediaUploader } from './components/MediaUploader';
import { ProjectModal } from './components/ProjectModal';
import { TestimonialModal } from './components/TestimonialModal';

interface Step4ContentProps {
  data: PortfolioFormData;
  onChange: (updates: Partial<PortfolioFormData>) => void;
}

export const Step4Content: React.FC<Step4ContentProps> = ({ data, onChange }) => {
  const { theme, mode } = useTheme();
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isTestimonialModalOpen, setIsTestimonialModalOpen] = useState(false);
  const [linkedInConnected, setLinkedInConnected] = useState(false);
  const [notionConnected, setNotionConnected] = useState(false);

  const handleAddProject = (project: Project) => {
    onChange({ projects: [...data.projects, project] });
  };

  const handleRemoveProject = (index: number) => {
    onChange({ projects: data.projects.filter((_, i) => i !== index) });
  };

  const handleAddTestimonial = (testimonial: Testimonial) => {
    onChange({ testimonials: [...data.testimonials, testimonial] });
  };

  const handleRemoveTestimonial = (index: number) => {
    onChange({ testimonials: data.testimonials.filter((_, i) => i !== index) });
  };

  const handleImportFromSouverain = async () => {
    try {
      // Get projects from SOUVERAIN database
      const projects = await window.electron.invoke('db-get-projects');
      if (projects && projects.length > 0) {
        // Show selection modal or directly import
        onChange({ projects: [...data.projects, ...projects] });
      }
    } catch (error) {
      console.error('Error importing projects:', error);
    }
  };

  const handleLinkedInConnect = () => {
    // TODO: Implement LinkedIn OAuth or manual paste
    setLinkedInConnected(true);
  };

  const handleNotionConnect = () => {
    // TODO: Implement Notion OAuth or manual paste
    setNotionConnected(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '2.5rem',
        maxWidth: '800px',
        margin: '0 auto',
      }}
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
          Ajoutez du contenu à votre portfolio
        </h2>
        <p style={{ color: theme.text.secondary, fontSize: '0.95rem' }}>
          Importez vos projets, images et témoignages
        </p>
      </div>

      {/* Projects & Achievements Section */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem',
            paddingBottom: '0.5rem',
            borderBottom: `1px solid ${theme.border.light}`,
          }}
        >
          <span style={{ color: theme.text.primary, fontSize: '1rem', fontWeight: 500 }}>
            Projets & Réalisations
          </span>
        </div>

        {/* Import Options */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
          {/* From SOUVERAIN */}
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleImportFromSouverain}
            style={{
              background: mode === 'dark' ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${theme.border.light}`,
              borderRadius: '12px',
              padding: '1.5rem',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.2s ease',
              transform: 'translate3d(0, 0, 0)',
            }}
          >
            <FolderOpen size={32} color={theme.accent.primary} style={{ marginBottom: '0.75rem' }} />
            <div style={{ color: theme.text.primary, fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.25rem' }}>
              Depuis mes projets
            </div>
            <div style={{ color: theme.text.secondary, fontSize: '0.8rem' }}>SOUVERAIN</div>
          </motion.div>

          {/* Upload Images */}
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsProjectModalOpen(true)}
            style={{
              background: mode === 'dark' ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${theme.border.light}`,
              borderRadius: '12px',
              padding: '1.5rem',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.2s ease',
              transform: 'translate3d(0, 0, 0)',
            }}
          >
            <Upload size={32} color={theme.accent.primary} style={{ marginBottom: '0.75rem' }} />
            <div style={{ color: theme.text.primary, fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.25rem' }}>
              Uploader
            </div>
            <div style={{ color: theme.text.secondary, fontSize: '0.8rem' }}>des images</div>
          </motion.div>

          {/* Manual Add */}
          <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsProjectModalOpen(true)}
            style={{
              background: mode === 'dark' ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${theme.border.light}`,
              borderRadius: '12px',
              padding: '1.5rem',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.2s ease',
              transform: 'translate3d(0, 0, 0)',
            }}
          >
            <Plus size={32} color={theme.accent.primary} style={{ marginBottom: '0.75rem' }} />
            <div style={{ color: theme.text.primary, fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.25rem' }}>
              Ajouter
            </div>
            <div style={{ color: theme.text.secondary, fontSize: '0.8rem' }}>manuellement</div>
          </motion.div>
        </div>

        {/* Projects List */}
        {data.projects.length > 0 && (
          <div>
            <div style={{ color: theme.text.primary, fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.75rem' }}>
              Projets sélectionnés : {data.projects.length}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {data.projects.map((project, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{
                    background: mode === 'dark' ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${theme.border.light}`,
                    borderRadius: '12px',
                    padding: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ color: theme.text.primary, fontSize: '0.95rem', fontWeight: 500 }}>
                      {project.title}
                    </div>
                    {project.category && (
                      <div style={{ color: theme.text.secondary, fontSize: '0.85rem', marginTop: '0.25rem' }}>
                        {project.category}
                      </div>
                    )}
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleRemoveProject(index)}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      border: 'none',
                      background: 'transparent',
                      color: theme.text.secondary,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <X size={16} />
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Media Section */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem',
            paddingBottom: '0.5rem',
            borderBottom: `1px solid ${theme.border.light}`,
          }}
        >
          <span style={{ color: theme.text.primary, fontSize: '1rem', fontWeight: 500 }}>
            Médias
          </span>
        </div>
        <MediaUploader
          media={data.media}
          onChange={(media) => onChange({ media })}
        />
      </div>

      {/* Enrich Section */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem',
            paddingBottom: '0.5rem',
            borderBottom: `1px solid ${theme.border.light}`,
          }}
        >
          <span style={{ color: theme.text.secondary, fontSize: '0.9rem', fontWeight: 500 }}>
            Enrichir avec vos données (optionnel)
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          {/* LinkedIn */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLinkedInConnect}
            style={{
              background: linkedInConnected
                ? mode === 'dark'
                  ? 'rgba(14, 118, 168, 0.2)'
                  : 'rgba(14, 118, 168, 0.1)'
                : mode === 'dark'
                ? 'rgba(30, 41, 59, 0.6)'
                : 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${linkedInConnected ? '#0E76A8' : theme.border.light}`,
              borderRadius: '12px',
              padding: '1.5rem',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.2s ease',
              transform: 'translate3d(0, 0, 0)',
            }}
          >
            <Linkedin size={32} color={linkedInConnected ? '#0E76A8' : theme.text.secondary} style={{ marginBottom: '0.75rem' }} />
            <div style={{ color: theme.text.primary, fontSize: '0.95rem', fontWeight: 500, marginBottom: '0.5rem' }}>
              LinkedIn
            </div>
            <div style={{ color: linkedInConnected ? '#0E76A8' : theme.text.secondary, fontSize: '0.85rem' }}>
              {linkedInConnected ? 'Connecté ✓' : 'Importer mon profil'}
            </div>
          </motion.div>

          {/* Notion */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNotionConnect}
            style={{
              background: notionConnected
                ? mode === 'dark'
                  ? 'rgba(0, 0, 0, 0.3)'
                  : 'rgba(0, 0, 0, 0.05)'
                : mode === 'dark'
                ? 'rgba(30, 41, 59, 0.6)'
                : 'rgba(255, 255, 255, 0.7)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${notionConnected ? '#000000' : theme.border.light}`,
              borderRadius: '12px',
              padding: '1.5rem',
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.2s ease',
              transform: 'translate3d(0, 0, 0)',
            }}
          >
            <FileText size={32} color={notionConnected ? '#000000' : theme.text.secondary} style={{ marginBottom: '0.75rem' }} />
            <div style={{ color: theme.text.primary, fontSize: '0.95rem', fontWeight: 500, marginBottom: '0.5rem' }}>
              Notion
            </div>
            <div style={{ color: notionConnected ? '#000000' : theme.text.secondary, fontSize: '0.85rem' }}>
              {notionConnected ? 'Connecté ✓' : 'Importer une page'}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1rem',
            paddingBottom: '0.5rem',
            borderBottom: `1px solid ${theme.border.light}`,
          }}
        >
          <span style={{ color: theme.text.secondary, fontSize: '0.9rem', fontWeight: 500 }}>
            Témoignages clients (optionnel)
          </span>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsTestimonialModalOpen(true)}
          style={{
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            border: `1px dashed ${theme.border.default}`,
            background: 'transparent',
            color: theme.accent.primary,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem',
            fontWeight: 500,
            transition: 'all 0.2s ease',
            marginBottom: '1rem',
          }}
        >
          <Plus size={16} />
          Ajouter un témoignage
        </motion.button>

        {/* Testimonials List */}
        {data.testimonials.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {data.testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                style={{
                  background: mode === 'dark' ? 'rgba(30, 41, 59, 0.6)' : 'rgba(255, 255, 255, 0.7)',
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${theme.border.light}`,
                  borderRadius: '12px',
                  padding: '1rem',
                  position: 'relative',
                }}
              >
                <div style={{ color: theme.text.primary, fontSize: '0.9rem', fontStyle: 'italic', marginBottom: '0.5rem' }}>
                  "{testimonial.text}"
                </div>
                <div style={{ color: theme.text.secondary, fontSize: '0.85rem' }}>
                  — {testimonial.author}
                  {testimonial.role && `, ${testimonial.role}`}
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleRemoveTestimonial(index)}
                  style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    border: 'none',
                    background: 'transparent',
                    color: theme.text.secondary,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={16} />
                </motion.button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onAdd={handleAddProject}
      />
      <TestimonialModal
        isOpen={isTestimonialModalOpen}
        onClose={() => setIsTestimonialModalOpen(false)}
        onAdd={handleAddTestimonial}
      />
    </motion.div>
  );
};
