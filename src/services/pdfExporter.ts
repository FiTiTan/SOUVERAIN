import { jsPDF } from 'jspdf';
import type { PortfolioProjectV2, DisplayableAsset } from '../types/portfolio';
import { anonymizeContent, type GhostModeOptions } from '../utils/ghostMode';

/**
 * Génère un PDF pour un projet de portfolio (Format Excellence).
 *
 * @param project Le projet à exporter.
 * @param assets Les assets (images) associés au projet.
 * @param options Options d'export (dont Ghost Mode).
 */
export async function generatePortfolioPDF(
  project: PortfolioProjectV2,
  assets: DisplayableAsset[],
  options: { ghostMode?: GhostModeOptions } = {}
): Promise<void> {
  const doc = new jsPDF();
  const ghostOpts = options.ghostMode || { enabled: false };
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  let cursorY = margin;

  // --- HEADER ---
  // Titre
  const safeTitle = anonymizeContent(project.title, ghostOpts);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(33, 33, 33);
  
  const titleSplit = doc.splitTextToSize(safeTitle, contentWidth);
  doc.text(titleSplit, margin, cursorY + 8);
  cursorY += doc.getTextDimensions(titleSplit).h + 15;

  // Metadata Line (Date / Client Placeholder)
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  const dateStr = project.created_at ? new Date(project.created_at).toLocaleDateString('fr-FR') : new Date().toLocaleDateString('fr-FR');
  doc.text(`Projet réalisé le ${dateStr}`, margin, cursorY);
  cursorY += 10;

  doc.setDrawColor(230, 230, 230);
  doc.line(margin, cursorY, pageWidth - margin, cursorY);
  cursorY += 15;

  // --- SECTIONS EXCELLENCE ---
  const sections = [
      { title: 'Contexte', content: project.context_text || project.brief_text },
      { title: 'Le Défi', content: project.challenge_text },
      { title: 'La Solution', content: project.solution_text },
      { title: 'Résultats', content: project.result_text }
  ];

  for (const section of sections) {
      if (!section.content) continue;

      const safeContent = anonymizeContent(section.content, ghostOpts);
      
      // Check page break
      if (cursorY > pageHeight - 50) {
          doc.addPage();
          cursorY = margin;
      }

      // Title
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0); // Black for headers
      doc.text(section.title.toUpperCase(), margin, cursorY);
      cursorY += 7;

      // Content
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      
      const splitContent = doc.splitTextToSize(safeContent, contentWidth);
      doc.text(splitContent, margin, cursorY);
      
      cursorY += doc.getTextDimensions(splitContent).h + 12;
  }

  cursorY += 5;

  // --- GALERIE IMAGES ---
  const imageAssets = assets.filter(
    (da) => da.asset.format.match(/^(jpg|jpeg|png|webp)$/i)
  );

  if (imageAssets.length > 0) {
      // Check page break before images section
      if (cursorY > pageHeight - 60) {
          doc.addPage();
          cursorY = margin;
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(33, 33, 33);
      doc.text('Galerie du Projet', margin, cursorY);
      cursorY += 10;

      const imagesPerRow = 2;
      const gap = 5;
      const imgWidth = (contentWidth - ((imagesPerRow - 1) * gap)) / imagesPerRow;

      let currentX = margin;
      let rowHeight = 0;

      for (let i = 0; i < imageAssets.length; i++) {
        const { asset } = imageAssets[i];
        try {
            if (!window.electron.readFileAsBase64) throw new Error('API missing');
            const buffer = await window.electron.readFileAsBase64(asset.localPath);
            const format = asset.format.toUpperCase();

            // Load to get dimensions
            const img = new Image();
            img.src = `data:image/${format.toLowerCase()};base64,${buffer}`;
            await new Promise(resolve => img.onload = resolve);

            const ratio = img.width / img.height;
            const imgHeight = imgWidth / ratio;

            // Page Break Check for Image
            if (cursorY + imgHeight > pageHeight - margin) {
                doc.addPage();
                cursorY = margin;
                currentX = margin;
                rowHeight = 0;
            }

            doc.addImage(img, format, currentX, cursorY, imgWidth, imgHeight);

            // Caption
            /*
            doc.setFontSize(9);
            doc.setTextColor(120,120,120);
            doc.text(asset.originalFilename, currentX, cursorY + imgHeight + 5);
            */

            rowHeight = Math.max(rowHeight, imgHeight);

            if ((i + 1) % imagesPerRow === 0) {
                currentX = margin;
                cursorY += rowHeight + gap + 5; // +5 for margin bottom
                rowHeight = 0;
            } else {
                currentX += imgWidth + gap;
            }

        } catch (e) {
            console.error('Image export error', e);
        }
      }
  }

  doc.save(`${project.title.replace(/\s+/g, '_')}_Excellence.pdf`);
}

/**
 * Génère un Portfolio Global
 */
export async function generateGlobalPortfolioPDF(
  projects: PortfolioProjectV2[],
  fetchAssetsForProject: (projectId: string) => Promise<DisplayableAsset[]>,
  options: { 
      title?: string;
      ghostMode?: GhostModeOptions 
  } = {}
): Promise<void> {
    const doc = new jsPDF();
    // Simplified stub for now, focusing on Single Project Excellence
    doc.text("Portfolio Global - Coming Soon", 10, 10);
    doc.save("Portfolio_Global.pdf");
}
