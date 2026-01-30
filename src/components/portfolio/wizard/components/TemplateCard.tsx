import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Eye, Check, Lock } from 'lucide-react';
import { useTheme } from '../../../../ThemeContext';
import { parseTemplateTags, isTemplateFree, isTemplateOwned, getTemplatePrice, getTemplateThumbnail } from '../../../../services/templateService';
import type { Template } from '../../../../services/templateService';

interface TemplateCardProps {
  template: Template;
  isSelected?: boolean;
  onSelect: (template: Template) => void;
  onPreview: (template: Template) => void;
  isPremiumUser?: boolean;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  isSelected = false,
  onSelect,
  onPreview,
  isPremiumUser = false,
}) => {
  const { theme, mode } = useTheme();
  const [thumbnailSvg, setThumbnailSvg] = useState<string | null>(null);

  const isFree = isTemplateFree(template);
  const isOwned = isTemplateOwned(template);
  const price = getTemplatePrice(template, isPremiumUser);
  const tags = parseTemplateTags(template);

  const canSelect = isFree || isOwned;

  // Load thumbnail SVG
  useEffect(() => {
    const loadThumbnail = async () => {
      const svg = await getTemplateThumbnail(template.id);
      setThumbnailSvg(svg);
    };
    loadThumbnail();
  }, [template.id]);

  const handleClick = () => {
    if (canSelect) {
      onSelect(template);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -8, scale: canSelect ? 1.02 : 1 }}
      whileTap={{ scale: canSelect ? 0.98 : 1 }}
      onClick={handleClick}
      style={{
        position: 'relative',
        background: isSelected
          ? mode === 'dark'
            ? 'rgba(99, 102, 241, 0.2)'
            : 'rgba(99, 102, 241, 0.1)'
          : mode === 'dark'
          ? 'rgba(30, 41, 59, 0.6)'
          : 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(20px)',
        border: `2px solid ${
          isSelected ? theme.accent.primary : theme.border.light
        }`,
        borderRadius: '16px',
        overflow: 'hidden',
        cursor: canSelect ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        transform: 'translate3d(0, 0, 0)',
        opacity: canSelect ? 1 : 0.6,
      }}
    >
      {/* Selected Indicator */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: theme.accent.primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            boxShadow: `0 4px 12px ${theme.accent.primary}60`,
          }}
        >
          <Check size={20} color="#ffffff" />
        </motion.div>
      )}

      {/* Lock Indicator for Premium Templates */}
      {!canSelect && (
        <div
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          <Lock size={18} color="#ffffff" />
        </div>
      )}

      {/* Thumbnail */}
      <div
        style={{
          width: '100%',
          height: '200px',
          background: mode === 'dark'
            ? 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'
            : 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
<<<<<<< HEAD
        {/* Template Thumbnail */}
        {template.thumbnail_path ? (
          <img
            src={template.thumbnail_path}
            alt={template.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: 0.8,
=======
        {/* SVG Thumbnail */}
        {thumbnailSvg ? (
          <div
            dangerouslySetInnerHTML={{ __html: thumbnailSvg }}
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
>>>>>>> 7eb3639 (✨ Fix: Templates thumbnails + File import preview)
            }}
          />
        ) : (
          <div
            style={{
              fontSize: '3rem',
              opacity: 0.3,
              color: theme.text.secondary,
            }}
          >
            🎨
          </div>
        )}

        {/* Preview Button Overlay */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            onPreview(template);
          }}
          style={{
            position: 'absolute',
            bottom: '1rem',
            right: '1rem',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: 'none',
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(10px)',
            color: '#ffffff',
            fontSize: '0.85rem',
            fontWeight: 500,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease',
          }}
        >
          <Eye size={16} />
          Aperçu
        </motion.button>
      </div>

      {/* Content */}
      <div style={{ padding: '1.25rem' }}>
        {/* Name */}
        <h3
          style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: theme.text.primary,
            marginBottom: '0.5rem',
          }}
        >
          {template.name}
        </h3>

        {/* Description */}
        <p
          style={{
            fontSize: '0.85rem',
            color: theme.text.secondary,
            lineHeight: '1.4',
            marginBottom: '1rem',
            minHeight: '2.8rem',
          }}
        >
          {template.description}
        </p>

        {/* Tags */}
        {tags.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.5rem',
              marginBottom: '1rem',
            }}
          >
            {tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                style={{
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  background: mode === 'dark'
                    ? 'rgba(99, 102, 241, 0.2)'
                    : 'rgba(99, 102, 241, 0.1)',
                  color: theme.accent.primary,
                  fontSize: '0.75rem',
                  fontWeight: 500,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '1rem',
            borderTop: `1px solid ${theme.border.light}`,
          }}
        >
          {/* Price */}
          <div>
            {isFree ? (
              <span
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: theme.semantic.success,
                }}
              >
                Gratuit
              </span>
            ) : (
              <div>
                <span
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    color: theme.text.primary,
                  }}
                >
                  {price}
                </span>
                {isPremiumUser && template.price > 0 && (
                  <div
                    style={{
                      fontSize: '0.75rem',
                      color: theme.semantic.success,
                      marginTop: '0.25rem',
                    }}
                  >
                    -30% Premium
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Status */}
          <div>
            {isOwned && (
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '12px',
                  background: mode === 'dark'
                    ? 'rgba(34, 197, 94, 0.2)'
                    : 'rgba(34, 197, 94, 0.1)',
                  color: theme.semantic.success,
                  fontWeight: 500,
                }}
              >
                Possédé
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
