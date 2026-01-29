import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../../ThemeContext';
import type { Template } from '../../../../services/templateService';
import { TemplateCard } from './TemplateCard';

interface TemplateGridProps {
  templates: Template[];
  selectedTemplateId: string | null;
  onSelectTemplate: (template: Template) => void;
  onPreviewTemplate: (template: Template) => void;
  isPremiumUser?: boolean;
  emptyMessage?: string;
}

export const TemplateGrid: React.FC<TemplateGridProps> = ({
  templates,
  selectedTemplateId,
  onSelectTemplate,
  onPreviewTemplate,
  isPremiumUser = false,
  emptyMessage = 'Aucun template disponible',
}) => {
  const { theme } = useTheme();

  if (templates.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          padding: '3rem',
          textAlign: 'center',
          color: theme.text.secondary,
          fontSize: '0.95rem',
        }}
      >
        {emptyMessage}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1.5rem',
        padding: '1rem 0',
      }}
    >
      <AnimatePresence mode="popLayout">
        {templates.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <TemplateCard
              template={template}
              isSelected={template.id === selectedTemplateId}
              onSelect={onSelectTemplate}
              onPreview={onPreviewTemplate}
              isPremiumUser={isPremiumUser}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
};
