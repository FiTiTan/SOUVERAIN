// SOUVERAIN - Extraction Service V3
// Extraction de contenu des documents (PDF, images, texte)
// Utilisation côté renderer via IPC

export interface ExtractedDocument {
  type: 'pdf' | 'image' | 'text';
  filename: string;
  content?: string;        // Texte extrait (pour PDF)
  path: string;            // Chemin fichier
  metadata?: {
    width?: number;
    height?: number;
    pages?: number;
    size?: number;
  };
}

export interface ExtractedData {
  formData: any;                      // Données formulaire
  documents: ExtractedDocument[];     // Documents extraits
  linkedInData?: string;              // Profil LinkedIn (texte)
  notionData?: string;                // Pages Notion (markdown)
  projectContexts: ProjectContext[];  // Contexte par projet
}

export interface ProjectContext {
  projectTitle: string;
  documentContent?: string;  // Texte extrait du PDF/BPL associé
  images: string[];          // Chemins des images associées
}

/**
 * Demande l'extraction d'un PDF via IPC
 */
export async function extractPdfText(filePath: string): Promise<string> {
  try {
    // @ts-ignore
    const result = await window.electron.invoke('extract-pdf-text', filePath);
    if (result.success) {
      return result.text || '';
    }
    console.error('[Extraction] PDF extraction failed:', result.error);
    return '';
  } catch (error) {
    console.error(`[Extraction] Erreur PDF ${filePath}:`, error);
    return '';
  }
}

/**
 * Demande les métadonnées d'une image via IPC
 */
export async function extractImageMetadata(filePath: string): Promise<ExtractedDocument> {
  try {
    // @ts-ignore
    const result = await window.electron.invoke('extract-image-metadata', filePath);
    if (result.success) {
      return {
        type: 'image',
        filename: result.filename,
        path: filePath,
        metadata: result.metadata,
      };
    }
  } catch (error) {
    console.error(`[Extraction] Erreur image ${filePath}:`, error);
  }
  
  return {
    type: 'image',
    filename: filePath.split('/').pop() || filePath.split('\\').pop() || '',
    path: filePath,
  };
}

/**
 * Extrait tout le contenu des documents importés
 */
export async function extractAllDocuments(
  files: Array<{ path: string; type: string; associatedProject?: string }>
): Promise<ExtractedDocument[]> {
  const documents: ExtractedDocument[] = [];

  for (const file of files) {
    const ext = file.path.split('.').pop()?.toLowerCase();

    if (ext === 'pdf') {
      const content = await extractPdfText(file.path);
      documents.push({
        type: 'pdf',
        filename: file.path.split('/').pop() || file.path.split('\\').pop() || '',
        path: file.path,
        content,
        metadata: { pages: content.split('\f').length },
      });
    } else if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext || '')) {
      const doc = await extractImageMetadata(file.path);
      documents.push(doc);
    } else if (['txt', 'md'].includes(ext || '')) {
      // @ts-ignore
      const result = await window.electron.invoke('read-text-file', file.path);
      if (result.success) {
        documents.push({
          type: 'text',
          filename: file.path.split('/').pop() || file.path.split('\\').pop() || '',
          path: file.path,
          content: result.content,
        });
      }
    }
  }

  return documents;
}

/**
 * Agrège toutes les données pour Groq
 */
export async function aggregateAllData(
  formData: any,
  uploadedFiles: Array<{ path: string; type: string; associatedProject?: string }>,
  linkedInData?: string,
  notionData?: string
): Promise<ExtractedData> {
  console.log('[Extraction] Aggregating all data...');
  console.log('[Extraction] Files:', uploadedFiles?.length || 0);
  
  // Extraire tous les documents
  const documents = await extractAllDocuments(uploadedFiles);
  console.log('[Extraction] Documents extracted:', documents.length);

  // Associer les documents aux projets
  const projectContexts: ProjectContext[] = (formData.projects || []).map((project: any) => {
    // Trouver les documents associés à ce projet
    const associatedDocs = documents.filter(
      (doc) => doc.filename.toLowerCase().includes(project.title.toLowerCase())
    );
    
    const pdfContent = associatedDocs
      .filter((d) => d.type === 'pdf')
      .map((d) => d.content)
      .join('\n\n');

    const images = associatedDocs
      .filter((d) => d.type === 'image')
      .map((d) => d.path);

    // Si pas d'images trouvées dans les docs, utiliser l'image du projet
    const projectImages = images.length > 0 ? images : (project.image ? [project.image] : []);

    return {
      projectTitle: project.title,
      documentContent: pdfContent || undefined,
      images: projectImages.filter(Boolean),
    };
  });

  console.log('[Extraction] Project contexts created:', projectContexts.length);

  return {
    formData,
    documents,
    linkedInData,
    notionData,
    projectContexts,
  };
}
