import React, { useState, useEffect } from 'react';
import { PreviewFrame } from './PreviewFrame';
import { generateProjectHTML } from '../../../services/htmlExporter';
import { getStyleById } from '../../../services/styleService';

interface PreviewProjectProps {
  project: any;
  styleId: string;
  portfolioId: string;
  onClose: () => void;
}

export const PreviewProject: React.FC<PreviewProjectProps> = ({
  project,
  styleId,
  portfolioId,
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
        const html = await generateProjectHTML(project, palette, portfolioId);
        setHtmlContent(html);
      } catch (err) {
        console.error('[PreviewProject] Generation error:', err);
        setError('Erreur lors de la génération de l\'aperçu');
      } finally {
        setIsLoading(false);
      }
    };

    generateHTML();
  }, [project, styleId, portfolioId]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Génération de l'aperçu...</p>
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
      title={`Aperçu - ${project.title}`}
      onClose={onClose}
    />
  );
};
