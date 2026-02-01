import React, { useState, useEffect } from 'react';
import { PreviewFrame } from './PreviewFrame';
import { generatePortfolioHTML } from '../../../services/htmlExporter';
import { getStyleById } from '../../../services/styleService';

interface PreviewPortfolioProps {
  portfolio: any;
  projects: any[];
  styleId: string;
  onClose: () => void;
}

export const PreviewPortfolio: React.FC<PreviewPortfolioProps> = ({
  portfolio,
  projects,
  styleId,
  onClose
}) => {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateHTML = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const palette = getStyleById(styleId);
        const templateId = portfolio.template_id || 'bento-grid';
        const html = await generatePortfolioHTML(portfolio, projects, palette, templateId);
        setHtmlContent(html);
      } catch (err) {
        console.error('[PreviewPortfolio] Generation error:', err);
        setError('Erreur lors de la génération de l\'aperçu');
      } finally {
        setIsLoading(false);
      }
    };

    generateHTML();
  }, [portfolio, projects, styleId]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Génération de l'aperçu du portfolio...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  return (
    <PreviewFrame
      htmlContent={htmlContent}
      title={`Aperçu Portfolio - ${portfolio.title || portfolio.authorName}`}
      onClose={onClose}
    />
  );
};
