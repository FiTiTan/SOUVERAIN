import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { useTheme } from '../../../../ThemeContext';
import { CalmModal } from '../../../ui/CalmModal';
import { getTemplateHTML, parseTemplateIdealFor, isTemplateOwned } from '../../../../services/templateService';
import type { Template } from '../../../../services/templateService';

interface TemplatePreviewModalProps {
  isOpen: boolean;
  template: Template | null;
  onClose: () => void;
  onSelect: (template: Template) => void;
}

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  isOpen,
  template,
  onClose,
  onSelect,
}) => {
  const { theme, mode } = useTheme();
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && template) {
      loadTemplateHTML();
    }
  }, [isOpen, template]);

  const loadTemplateHTML = async () => {
    if (!template) return;

    setIsLoading(true);
    try {
      const html = await getTemplateHTML(template.id);
      if (html) {
        setHtmlContent(html);
      } else {
        setHtmlContent('<div style="padding: 2rem; text-align: center;">Template preview not available</div>');
      }
    } catch (error) {
      console.error('Error loading template HTML:', error);
      setHtmlContent('<div style="padding: 2rem; text-align: center; color: red;">Error loading template</div>');
    } finally {
      setIsLoading(false);
    }
  };

  if (!template) return null;

  const idealFor = parseTemplateIdealFor(template);
  const canSelect = isTemplateOwned(template);

  return (
    <CalmModal isOpen={isOpen} onClose={onClose}>
      <div style={{ width: '90vw', maxWidth: '1200px', height: '90vh', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: '1.5rem',
            paddingBottom: '1rem',
            borderBottom: `1px solid ${theme.border.light}`,
          }}
        >
          <div style={{ flex: 1 }}>
            <h3
              style={{
                fontSize: '1.75rem',
                fontWeight: 600,
                color: theme.text.primary,
                marginBottom: '0.5rem',
              }}
            >
              {template.name}
            </h3>
            <p
              style={{
                fontSize: '0.95rem',
                color: theme.text.secondary,
                marginBottom: '0.75rem',
              }}
            >
              {template.description}
            </p>
            {idealFor.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.85rem', color: theme.text.secondary }}>
                  Idéal pour :
                </span>
                {idealFor.map((profile, index) => (
                  <span
                    key={index}
                    style={{
                      fontSize: '0.8rem',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '12px',
                      background: mode === 'dark'
                        ? 'rgba(99, 102, 241, 0.2)'
                        : 'rgba(99, 102, 241, 0.1)',
                      color: theme.accent.primary,
                      fontWeight: 500,
                    }}
                  >
                    {profile}
                  </span>
                ))}
              </div>
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
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
              flexShrink: 0,
              marginLeft: '1rem',
            }}
          >
            <X size={20} />
          </motion.button>
        </div>

        {/* Preview Area */}
        <div
          style={{
            flex: 1,
            borderRadius: '12px',
            overflow: 'hidden',
            background: mode === 'dark' ? '#1a1a24' : '#f5f5f5',
            border: `1px solid ${theme.border.light}`,
            position: 'relative',
          }}
        >
          {isLoading ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: theme.text.secondary,
              }}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{
                  width: '40px',
                  height: '40px',
                  border: `3px solid ${theme.border.default}`,
                  borderTopColor: theme.accent.primary,
                  borderRadius: '50%',
                }}
              />
            </div>
          ) : (
            <iframe
              srcDoc={htmlContent}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
              }}
              title={`Preview: ${template.name}`}
              sandbox="allow-same-origin"
            />
          )}
        </div>

        {/* Actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '1.5rem',
            paddingTop: '1rem',
            borderTop: `1px solid ${theme.border.light}`,
          }}
        >
          <div style={{ fontSize: '0.85rem', color: theme.text.secondary }}>
            Version {template.version} • {template.author}
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
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
              Fermer
            </motion.button>
            {canSelect && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onSelect(template);
                  onClose();
                }}
                style={{
                  padding: '0.75rem 2rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: `linear-gradient(135deg, ${theme.accent.primary} 0%, ${theme.accent.secondary} 100%)`,
                  color: '#ffffff',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s ease',
                  boxShadow: `0 4px 12px ${theme.accent.primary}40`,
                }}
              >
                <Check size={18} />
                Choisir ce template
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </CalmModal>
  );
};
