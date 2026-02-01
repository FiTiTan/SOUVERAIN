import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useTheme } from '../../../../ThemeContext';
import { CalmModal } from '../../../ui/CalmModal';
import { GlassInput, GlassTextArea } from '../../../ui/GlassForms';
import type { Testimonial } from '../types';

interface TestimonialModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (testimonial: Testimonial) => void;
  existingTestimonial?: Testimonial;
}

export const TestimonialModal: React.FC<TestimonialModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  existingTestimonial,
}) => {
  const { theme } = useTheme();

  const [text, setText] = useState(existingTestimonial?.text || '');
  const [author, setAuthor] = useState(existingTestimonial?.author || '');
  const [role, setRole] = useState(existingTestimonial?.role || '');

  const handleSubmit = () => {
    if (text.trim().length === 0 || author.trim().length === 0) {
      return;
    }

    const testimonial: Testimonial = {
      text: text.trim(),
      author: author.trim(),
      role: role.trim() || undefined,
    };

    onAdd(testimonial);
    onClose();
  };

  return (
    <CalmModal 
      isOpen={isOpen} 
      onClose={onClose}
      title={existingTestimonial ? 'Modifier le témoignage' : 'Ajouter un témoignage'}
    >
      <div style={{ width: '600px', maxWidth: '90vw' }}>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Testimonial Text */}
          <GlassTextArea
            label="Témoignage"
            required
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Jean a été d'une grande aide pour notre projet. Son expertise et sa réactivité ont fait la différence."
            rows={5}
            style={{ width: '100%' }}
          />

          {/* Author */}
          <GlassInput
            label="Nom de la personne"
            required
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Marie Dupont"
            style={{ width: '100%' }}
          />

          {/* Role */}
          <GlassInput
            label="Rôle / Entreprise"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="CEO, StartupXYZ"
            style={{ width: '100%' }}
          />
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
            disabled={text.trim().length === 0 || author.trim().length === 0}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              background:
                text.trim().length === 0 || author.trim().length === 0
                  ? theme.bg.tertiary
                  : theme.accent.primary,
              color: '#ffffff',
              cursor:
                text.trim().length === 0 || author.trim().length === 0
                  ? 'not-allowed'
                  : 'pointer',
              fontSize: '0.95rem',
              fontWeight: 500,
              transition: 'all 0.2s ease',
              opacity: text.trim().length === 0 || author.trim().length === 0 ? 0.5 : 1,
            }}
          >
            {existingTestimonial ? 'Modifier' : 'Ajouter'}
          </motion.button>
        </div>
      </div>
    </CalmModal>
  );
};
