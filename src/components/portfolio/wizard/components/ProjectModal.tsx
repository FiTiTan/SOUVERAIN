import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload } from 'lucide-react';
import { useTheme } from '../../../../ThemeContext';
import { CalmModal } from '../../../ui/CalmModal';
import { GlassInput, GlassTextArea } from '../../../ui/GlassForms';
import type { Project } from '../types';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (project: Project) => void;
  existingProject?: Project;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  existingProject,
}) => {
  const { theme, mode } = useTheme();

  const [title, setTitle] = useState(existingProject?.title || '');
  const [description, setDescription] = useState(existingProject?.description || '');
  const [image, setImage] = useState(existingProject?.image || '');
  const [category, setCategory] = useState(existingProject?.category || '');
  const [link, setLink] = useState(existingProject?.link || '');

  const handleSubmit = () => {
    if (title.trim().length === 0) {
      return;
    }

    const project: Project = {
      id: existingProject?.id || Date.now().toString(),
      title: title.trim(),
      description: description.trim() || undefined,
      image: image || undefined,
      category: category.trim() || undefined,
      link: link.trim() || undefined,
    };

    onAdd(project);
    onClose();
  };

  const handleImageSelect = async () => {
    try {
      const result = await window.electron.invoke('file-open-dialog', {
        filters: [
          { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'webp'] },
        ],
        properties: ['openFile'],
      });

      if (result && !result.canceled && result.filePaths[0]) {
        setImage(result.filePaths[0]);
      }
    } catch (error) {
      console.error('Error selecting image:', error);
    }
  };

  return (
    <CalmModal 
      isOpen={isOpen} 
      onClose={onClose}
      title={existingProject ? 'Modifier le projet' : 'Ajouter un projet'}
    >
      <div style={{ width: '600px', maxWidth: '90vw' }}>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Title */}
          <GlassInput
            label="Titre du projet"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Refonte site e-commerce"
            style={{ width: '100%' }}
          />

          {/* Description */}
          <GlassTextArea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Refonte complète d'une boutique en ligne avec +40% de conversion après 3 mois."
            rows={4}
            style={{ width: '100%' }}
          />

          {/* Image Upload */}
          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '0.5rem',
                color: theme.text.primary,
                fontSize: '0.95rem',
                fontWeight: 500,
              }}
            >
              Image
            </label>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleImageSelect}
              style={{
                width: '100%',
                minHeight: '120px',
                borderRadius: '12px',
                border: `2px dashed ${theme.border.default}`,
                background: mode === 'dark' ? 'rgba(30, 41, 59, 0.4)' : 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(10px)',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
                color: theme.text.secondary,
                transition: 'all 0.2s ease',
              }}
            >
              {image ? (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.9rem', color: theme.text.primary, marginBottom: '0.5rem' }}>
                    Image sélectionnée
                  </div>
                  <div style={{ fontSize: '0.85rem', color: theme.text.secondary, wordBreak: 'break-all', padding: '0 1rem' }}>
                    {image.split(/[\\/]/).pop()}
                  </div>
                </div>
              ) : (
                <>
                  <Upload size={32} />
                  <span style={{ fontSize: '0.9rem' }}>
                    Glisser une image ou cliquer pour parcourir
                  </span>
                </>
              )}
            </motion.button>
          </div>

          {/* Category & Link */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <GlassInput
              label="Catégorie"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Web Design"
              style={{ width: '100%' }}
            />
            <GlassInput
              label="Lien"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://exemple.com"
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '1rem',
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: `1px solid ${theme.border.light}`,
          }}
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: `1px solid ${theme.border.default}`,
              background: 'transparent',
              color: theme.text.primary,
              cursor: 'pointer',
              fontSize: '0.95rem',
              fontWeight: 500,
              transition: 'all 0.2s ease',
            }}
          >
            Annuler
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={title.trim().length === 0}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              background: title.trim().length === 0 ? theme.bg.tertiary : theme.accent.primary,
              color: '#ffffff',
              cursor: title.trim().length === 0 ? 'not-allowed' : 'pointer',
              fontSize: '0.95rem',
              fontWeight: 500,
              transition: 'all 0.2s ease',
              opacity: title.trim().length === 0 ? 0.5 : 1,
            }}
          >
            {existingProject ? 'Modifier' : 'Ajouter'}
          </motion.button>
        </div>
      </div>
    </CalmModal>
  );
};
