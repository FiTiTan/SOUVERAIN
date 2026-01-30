import React, { useEffect } from 'react';
import { getTemplateHTML } from '../../../../services/templateService';
import type { Template } from '../../../../services/templateService';

interface TemplatePreviewModalProps {
  isOpen: boolean;
  template: Template | null;
  onClose: () => void;
  onSelect: (template: Template) => void;
}

// Mock data identiques pour toutes les previews
const MOCK_DATA = {
  name: 'Jean Dupont',
  tagline: 'Développeur Full-Stack & Designer UI/UX',
  email: 'jean.dupont@example.com',
  phone: '+33 6 12 34 56 78',
  address: '42 rue de la Tech, 75001 Paris',
  services: ['Développement Web', 'Design UI/UX', 'Conseil Technique'],
  valueProp: 'Je crée des expériences numériques élégantes et performantes qui transforment vos idées en réalité.',
  linkedin: 'linkedin.com/in/jeandupont',
  github: 'github.com/jeandupont',
};

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  isOpen,
  template,
  onClose,
  onSelect,
}) => {
  const { theme, mode } = useTheme();

  useEffect(() => {
    if (isOpen && template) {
      openPreviewWindow();
    }
  }, [isOpen, template]);

  const openPreviewWindow = async () => {
    if (!template) return;

    try {
      let html = await getTemplateHTML(template.id);
      
      if (!html) {
        html = '<div style="padding: 2rem; text-align: center;">Template preview not available</div>';
      }

      // Injecter les données fictives dans le HTML
      const htmlWithData = html
        .replace(/{{name}}/g, MOCK_DATA.name)
        .replace(/{{tagline}}/g, MOCK_DATA.tagline)
        .replace(/{{email}}/g, MOCK_DATA.email)
        .replace(/{{phone}}/g, MOCK_DATA.phone)
        .replace(/{{address}}/g, MOCK_DATA.address)
        .replace(/{{linkedin}}/g, MOCK_DATA.linkedin)
        .replace(/{{github}}/g, MOCK_DATA.github)
        .replace(/{{valueProp}}/g, MOCK_DATA.valueProp)
        .replace(/{{services}}/g, MOCK_DATA.services.join(', '));

      // Calculer dimensions (ratio A4 ≈ 1.4, mais réduit à 70%)
      const width = 800;
      const height = 1120; // ratio ~1.4
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;

      // Ouvrir nouvelle fenêtre
      const previewWindow = window.open(
        '',
        `template-preview-${template.id}`,
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
      );

      if (previewWindow) {
        previewWindow.document.write(htmlWithData);
        previewWindow.document.close();
        previewWindow.document.title = `Preview: ${template.name}`;
      }
      
      // Fermer la modal
      onClose();
    } catch (error) {
      console.error('Error loading template HTML:', error);
    }
  };

  if (!template) return null;

  // Composant simplifié - la preview s'ouvre dans une nouvelle fenêtre
  return null;
};
