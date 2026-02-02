import React, { useEffect } from 'react';
import { getTemplateHTML } from '../../../../services/templateService';
import type { Template } from '../../../../services/templateService';

interface TemplatePreviewModalProps {
  isOpen: boolean;
  template: Template | null;
  onClose: () => void;
  onSelect: (template: Template) => void;
}

// Mock data pour preview templates
const MOCK_DATA = {
  heroTitle: 'Jean Dupont',
  heroSubtitle: 'Développeur Full-Stack & Designer UI/UX',
  heroEyebrow: 'Portfolio',
  heroCTA: 'Voir mes projets',
  aboutText: 'Passionné par le développement web et le design, je crée des expériences numériques élégantes et performantes qui transforment vos idées en réalité. Avec plus de 5 ans d\'expérience, j\'accompagne entreprises et startups dans leur transformation digitale.',
  aboutImage: 'https://ui-avatars.com/api/?name=Jean+Dupont&size=200&background=667eea&color=fff',
  valueProp: 'Je crée des expériences numériques élégantes et performantes qui transforment vos idées en réalité.',
  contactEmail: 'jean.dupont@example.com',
  contactPhone: '+33 6 12 34 56 78',
  contactAddress: '42 rue de la Tech, 75001 Paris',
  socialLinkedin: 'https://linkedin.com/in/jeandupont',
  socialGithub: 'https://github.com/jeandupont',
  socialTwitter: 'https://twitter.com/jeandupont',
  services: [
    { icon: '💻', title: 'Développement Web', desc: 'Création de sites et applications modernes avec React, Node.js et TypeScript' }
  ],
  projects: [
    {
      title: 'Plateforme E-commerce',
      desc: 'Solution complète de vente en ligne avec paiement sécurisé et gestion de stock',
      category: 'Web',
      image: 'https://placehold.co/600x400/667eea/ffffff?text=E-commerce+Project',
      link: '#'
    }
  ],
  testimonials: [
    {
      text: 'Un travail exceptionnel ! Jean a su transformer notre vision en une application performante et élégante.',
      author: 'Marie Dubois',
      role: 'CEO, TechStart'
    }
  ]
};

/**
 * Remplace un placeholder simple
 */
function replacePlaceholder(html: string, key: string, value: string): string {
  const placeholder = new RegExp(`{{${key}}}`, 'g');
  return html.replace(placeholder, value || '');
}

/**
 * Parse et remplace une section répétée
 * Note: Les templates HTML ont été nettoyés pour n'avoir qu'1 seul élément entre les markers
 */
function processRepeatedSection(
  html: string,
  sectionName: string,
  items: any[],
  renderItem: (template: string, item: any) => string
): string {
  const startMarker = `<!-- REPEAT: ${sectionName} -->`;
  const endMarker = `<!-- END REPEAT: ${sectionName} -->`;
  
  const startIndex = html.indexOf(startMarker);
  const endIndex = html.indexOf(endMarker);
  
  if (startIndex === -1 || endIndex === -1) {
    return html;
  }
  
  const templateStart = startIndex + startMarker.length;
  const itemTemplate = html.substring(templateStart, endIndex).trim();
  
  const renderedItems = items.map(item => renderItem(itemTemplate, item)).join('\n            ');
  
  const before = html.substring(0, startIndex);
  const after = html.substring(endIndex + endMarker.length);
  
  return before + '\n            ' + renderedItems + '\n            ' + after;
}

/**
 * Traite les conditions IF/ENDIF
 */
function processConditionals(html: string, conditions: Record<string, boolean>): string {
  let result = html;
  
  for (const [condition, value] of Object.entries(conditions)) {
    const ifMarker = `<!-- IF: ${condition} -->`;
    const endifMarker = `<!-- ENDIF: ${condition} -->`;
    
    const startIndex = result.indexOf(ifMarker);
    const endIndex = result.indexOf(endifMarker);
    
    if (startIndex !== -1 && endIndex !== -1) {
      const before = result.substring(0, startIndex);
      const content = result.substring(startIndex + ifMarker.length, endIndex);
      const after = result.substring(endIndex + endifMarker.length);
      
      result = before + (value ? content : '') + after;
    }
  }
  
  return result;
}

export const TemplatePreviewModal: React.FC<TemplatePreviewModalProps> = ({
  isOpen,
  template,
  onClose,
  onSelect,
}) => {
  useEffect(() => {
    const openPreviewWindow = async () => {
      if (!template) return;

      try {
        let html = await getTemplateHTML(template.id);
        
        if (!html) {
          html = '<div style="padding: 2rem; text-align: center;">Template preview not available</div>';
        }

        // === REMPLACEMENT PLACEHOLDERS SIMPLES ===
        
        // Hero
        html = replacePlaceholder(html, 'HERO_TITLE', MOCK_DATA.heroTitle);
        html = replacePlaceholder(html, 'HERO_SUBTITLE', MOCK_DATA.heroSubtitle);
        html = replacePlaceholder(html, 'HERO_EYEBROW', MOCK_DATA.heroEyebrow);
        html = replacePlaceholder(html, 'HERO_CTA_TEXT', MOCK_DATA.heroCTA);
        
        // About
        html = replacePlaceholder(html, 'ABOUT_TEXT', MOCK_DATA.aboutText);
        html = replacePlaceholder(html, 'ABOUT_IMAGE', MOCK_DATA.aboutImage);
        html = replacePlaceholder(html, 'VALUE_PROP', MOCK_DATA.valueProp);
        
        // Contact
        html = replacePlaceholder(html, 'CONTACT_EMAIL', MOCK_DATA.contactEmail);
        html = replacePlaceholder(html, 'CONTACT_PHONE', MOCK_DATA.contactPhone);
        html = replacePlaceholder(html, 'CONTACT_ADDRESS', MOCK_DATA.contactAddress);
        
        // Footer
        const currentYear = new Date().getFullYear().toString();
        html = replacePlaceholder(html, 'CURRENT_YEAR', currentYear);
        html = replacePlaceholder(html, 'OPENING_HOURS', 'Lun-Ven : 9h-18h');
        
        // === SECTIONS RÉPÉTÉES ===
        
        // Services
        html = processRepeatedSection(html, 'services', MOCK_DATA.services, (tpl, service) => {
          let item = tpl;
          item = replacePlaceholder(item, 'SERVICE_ICON', service.icon);
          item = replacePlaceholder(item, 'SERVICE_TITLE', service.title);
          item = replacePlaceholder(item, 'SERVICE_DESC', service.desc);
          return item;
        });
        
        // Projects
        html = processRepeatedSection(html, 'projects', MOCK_DATA.projects, (tpl, project) => {
          let item = tpl;
          item = replacePlaceholder(item, 'PROJECT_TITLE', project.title);
          item = replacePlaceholder(item, 'PROJECT_DESC', project.desc);
          item = replacePlaceholder(item, 'PROJECT_CATEGORY', project.category);
          item = replacePlaceholder(item, 'PROJECT_IMAGE', project.image);
          item = replacePlaceholder(item, 'PROJECT_LINK', project.link);
          
          // Condition: afficher lien projet
          item = processConditionals(item, { hasProjectLink: !!project.link });
          
          return item;
        });
        
        // Social Links
        const socialLinks = [
          { platform: 'LinkedIn', url: MOCK_DATA.socialLinkedin, icon: '🔗' },
          { platform: 'GitHub', url: MOCK_DATA.socialGithub, icon: '🔗' },
          { platform: 'Twitter', url: MOCK_DATA.socialTwitter, icon: '🔗' }
        ];
        
        html = processRepeatedSection(html, 'socialLinks', socialLinks, (tpl, link) => {
          let item = tpl;
          item = replacePlaceholder(item, 'SOCIAL_PLATFORM', link.platform);
          item = replacePlaceholder(item, 'SOCIAL_URL', link.url);
          item = replacePlaceholder(item, 'SOCIAL_ICON', link.icon);
          return item;
        });
        
        // Testimonials
        html = processRepeatedSection(html, 'testimonials', MOCK_DATA.testimonials, (tpl, testimonial) => {
          let item = tpl;
          item = replacePlaceholder(item, 'TESTIMONIAL_TEXT', testimonial.text);
          item = replacePlaceholder(item, 'TESTIMONIAL_AUTHOR', testimonial.author);
          item = replacePlaceholder(item, 'TESTIMONIAL_ROLE', testimonial.role);
          return item;
        });
        
        // === CONDITIONS GLOBALES ===
        html = processConditionals(html, {
          showProjects: MOCK_DATA.projects.length > 0,
          showSocialShowcase: socialLinks.length > 0,
          showTestimonials: MOCK_DATA.testimonials.length > 0,
          showPracticalInfo: false,
          hasAboutImage: !!MOCK_DATA.aboutImage,
          hasValueProp: !!MOCK_DATA.valueProp,
          hasAddress: !!MOCK_DATA.contactAddress,
          hasOpeningHours: false
        });

        // Calculer dimensions (ratio A4 ≈ 1.4, mais réduit à 70%)
        const width = 800;
        const height = 1120;
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;

        // Ouvrir nouvelle fenêtre
        const previewWindow = window.open(
          '',
          `template-preview-${template.id}`,
          `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
        );

        if (previewWindow) {
          previewWindow.document.write(html);
          previewWindow.document.close();
          previewWindow.document.title = `Preview: ${template.name}`;
        }
        
        // Fermer la modal
        onClose();
      } catch (error) {
        console.error('Error loading template HTML:', error);
      }
    };

    if (isOpen && template) {
      openPreviewWindow();
    }
  }, [isOpen, template, onClose]);

  return null;
};
