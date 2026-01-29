# MPF-2 : Import Projets & Médias

**Module:** Portfolio Maître SOUVERAIN
**Priorité:** 🟠 Important
**Temps estimé:** 3-4h
**Prérequis:** MPF-1 complété (Sélection + Chat IA)

---

## OBJECTIF

Créer les écrans permettant :
1. Importer des projets existants (depuis la section Projets de SOUVERAIN)
2. Afficher un message si aucun projet disponible
3. Importer manuellement depuis LinkedIn (URL ou copier-coller)
4. Importer manuellement depuis Notion (export MD/PDF ou copier-coller)
5. Importer des médias (images, vidéos, fichiers)

---

## ÉCRAN 4 : IMPORT PROJETS

### Layout — Avec projets disponibles

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Retour                         Étape 3/5 : Vos réalisations  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🤖                                                       │   │
│  │                                                         │   │
│  │ Quels projets souhaitez-vous mettre en avant ?          │   │
│  │                                                         │   │
│  │ Sélectionnez parmi vos réalisations existantes.        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Mes projets SOUVERAIN                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ [✓]          │  │ [ ]          │  │ [✓]          │          │
│  │ 🖼️           │  │ 🖼️           │  │ 🖼️           │          │
│  │ Refonte Site │  │ App Mobile   │  │ Branding     │          │
│  │ Client A     │  │ Startup B    │  │ Restaurant C │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Importer depuis l'extérieur                                    │
│                                                                 │
│  ┌─────────────────────┐  ┌─────────────────────┐              │
│  │ 💼 LinkedIn         │  │ 📝 Notion           │              │
│  │ Importer mon profil │  │ Importer une page   │              │
│  └─────────────────────┘  └─────────────────────┘              │
│                                                                 │
│  2 projets sélectionnés            [Passer] [Continuer →]      │
└─────────────────────────────────────────────────────────────────┘
```

### Layout — Sans projets disponibles

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Retour                         Étape 3/5 : Vos réalisations  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🤖                                                       │   │
│  │                                                         │   │
│  │ Avez-vous des projets à mettre en avant ?               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │  📁                                                     │   │
│  │                                                         │   │
│  │  Aucun projet créé pour l'instant                       │   │
│  │                                                         │   │
│  │  Vous pourrez ajouter des projets plus tard depuis      │   │
│  │  la section "Projets" de SOUVERAIN, puis les            │   │
│  │  intégrer à votre portfolio.                            │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  Importer depuis l'extérieur                                    │
│                                                                 │
│  ┌─────────────────────┐  ┌─────────────────────┐              │
│  │ 💼 LinkedIn         │  │ 📝 Notion           │              │
│  │ Importer mon profil │  │ Importer une page   │              │
│  └─────────────────────┘  └─────────────────────┘              │
│                                                                 │
│                                      [Passer] [Continuer →]     │
└─────────────────────────────────────────────────────────────────┘
```

### Composant : `src/components/portfolio/master/ProjectImport.tsx`

```tsx
import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Bot, Check, Folder, Linkedin, FileText } from 'lucide-react';

interface Project {
  id: string;
  title: string;
  brief_text?: string;
  cover_image?: string;
  created_at: string;
}

interface LinkedInData {
  profileUrl?: string;
  rawContent?: string;
}

interface NotionData {
  pageContent?: string;
  fileName?: string;
}

interface ProjectImportData {
  selectedProjectIds: string[];
  linkedInData?: LinkedInData;
  notionData?: NotionData;
}

interface ProjectImportProps {
  onComplete: (data: ProjectImportData) => void;
  onBack: () => void;
  onSkip: () => void;
}

export const ProjectImport: React.FC<ProjectImportProps> = ({
  onComplete,
  onBack,
  onSkip,
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modals
  const [showLinkedInModal, setShowLinkedInModal] = useState(false);
  const [showNotionModal, setShowNotionModal] = useState(false);
  
  // Import data
  const [linkedInData, setLinkedInData] = useState<LinkedInData>({});
  const [notionData, setNotionData] = useState<NotionData>({});

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const result = await window.electron.invoke('db-get-all-projects');
      setProjects(result || []);
    } catch (error) {
      console.error('Erreur chargement projets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleProject = (projectId: string) => {
    setSelectedIds(prev =>
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleContinue = () => {
    onComplete({
      selectedProjectIds: selectedIds,
      linkedInData: linkedInData.profileUrl || linkedInData.rawContent ? linkedInData : undefined,
      notionData: notionData.pageContent ? notionData : undefined,
    });
  };

  const hasAnyContent = selectedIds.length > 0 || linkedInData.profileUrl || linkedInData.rawContent || notionData.pageContent;

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          <span className="text-sm text-zinc-500">Étape 3/5 : Vos réalisations</span>
        </div>

        {/* Message IA */}
        <div className="flex gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Bot className="w-5 h-5 text-blue-600" />
          </div>
          <div className="bg-white rounded-2xl rounded-tl-none p-4 shadow-sm border border-zinc-100 max-w-lg">
            <p className="font-medium text-zinc-900 mb-1">
              {projects.length > 0 
                ? 'Quels projets souhaitez-vous mettre en avant ?'
                : 'Avez-vous des projets à mettre en avant ?'
              }
            </p>
            <p className="text-sm text-zinc-500">
              {projects.length > 0
                ? 'Sélectionnez parmi vos réalisations existantes.'
                : 'Vous pouvez importer depuis LinkedIn ou Notion.'
              }
            </p>
          </div>
        </div>

        {/* Section Projets SOUVERAIN */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-zinc-700 mb-3">
            Mes projets SOUVERAIN
          </h3>
          
          {isLoading ? (
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-32 bg-zinc-200 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : projects.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {projects.map(project => (
                <button
                  key={project.id}
                  onClick={() => toggleProject(project.id)}
                  className={`relative text-left p-4 rounded-xl border-2 transition-all ${
                    selectedIds.includes(project.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-zinc-200 bg-white hover:border-zinc-300'
                  }`}
                >
                  {/* Checkbox */}
                  <div className={`absolute top-3 right-3 w-5 h-5 rounded border-2 flex items-center justify-center ${
                    selectedIds.includes(project.id)
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-zinc-300'
                  }`}>
                    {selectedIds.includes(project.id) && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  
                  {/* Thumbnail */}
                  <div className="w-full h-16 bg-zinc-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                    {project.cover_image ? (
                      <img src={project.cover_image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">🖼️</span>
                    )}
                  </div>
                  
                  <h4 className="font-medium text-zinc-900 text-sm truncate">
                    {project.title}
                  </h4>
                  {project.brief_text && (
                    <p className="text-xs text-zinc-500 truncate mt-0.5">
                      {project.brief_text}
                    </p>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border-2 border-dashed border-zinc-200 p-8 text-center">
              <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Folder className="w-6 h-6 text-zinc-400" />
              </div>
              <p className="font-medium text-zinc-700 mb-1">
                Aucun projet créé pour l'instant
              </p>
              <p className="text-sm text-zinc-500 max-w-sm mx-auto">
                Vous pourrez ajouter des projets plus tard depuis la section 
                "Projets" de SOUVERAIN, puis les intégrer à votre portfolio.
              </p>
            </div>
          )}
        </div>

        {/* Section Import externe */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-zinc-700 mb-3">
            Importer depuis l'extérieur
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            {/* LinkedIn */}
            <button
              onClick={() => setShowLinkedInModal(true)}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                linkedInData.profileUrl || linkedInData.rawContent
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-zinc-200 bg-white hover:border-zinc-300'
              }`}
            >
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Linkedin className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-zinc-900">LinkedIn</p>
                <p className="text-xs text-zinc-500">
                  {linkedInData.profileUrl || linkedInData.rawContent
                    ? '✓ Contenu importé'
                    : 'Importer mon profil'
                  }
                </p>
              </div>
            </button>

            {/* Notion */}
            <button
              onClick={() => setShowNotionModal(true)}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
                notionData.pageContent
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-zinc-200 bg-white hover:border-zinc-300'
              }`}
            >
              <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-zinc-900">Notion</p>
                <p className="text-xs text-zinc-500">
                  {notionData.pageContent
                    ? '✓ Contenu importé'
                    : 'Importer une page'
                  }
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <div>
            {selectedIds.length > 0 && (
              <span className="text-sm text-zinc-600">
                {selectedIds.length} projet{selectedIds.length > 1 ? 's' : ''} sélectionné{selectedIds.length > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onSkip}
              className="px-4 py-2 text-zinc-600 hover:text-zinc-900 transition-colors"
            >
              Passer
            </button>
            <button
              onClick={handleContinue}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-500 transition-colors"
            >
              Continuer
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal LinkedIn */}
      {showLinkedInModal && (
        <LinkedInImportModal
          data={linkedInData}
          onSave={(data) => {
            setLinkedInData(data);
            setShowLinkedInModal(false);
          }}
          onClose={() => setShowLinkedInModal(false)}
        />
      )}

      {/* Modal Notion */}
      {showNotionModal && (
        <NotionImportModal
          data={notionData}
          onSave={(data) => {
            setNotionData(data);
            setShowNotionModal(false);
          }}
          onClose={() => setShowNotionModal(false)}
        />
      )}
    </div>
  );
};

export default ProjectImport;
```

---

## MODAL LINKEDIN IMPORT

### Composant : `src/components/portfolio/master/LinkedInImportModal.tsx`

```tsx
import React, { useState } from 'react';
import { X, Linkedin, Link, FileText } from 'lucide-react';

interface LinkedInData {
  profileUrl?: string;
  rawContent?: string;
}

interface LinkedInImportModalProps {
  data: LinkedInData;
  onSave: (data: LinkedInData) => void;
  onClose: () => void;
}

export const LinkedInImportModal: React.FC<LinkedInImportModalProps> = ({
  data,
  onSave,
  onClose,
}) => {
  const [mode, setMode] = useState<'url' | 'paste'>('url');
  const [profileUrl, setProfileUrl] = useState(data.profileUrl || '');
  const [rawContent, setRawContent] = useState(data.rawContent || '');

  const handleSave = () => {
    onSave({
      profileUrl: mode === 'url' ? profileUrl : undefined,
      rawContent: mode === 'paste' ? rawContent : undefined,
    });
  };

  const isValid = mode === 'url' 
    ? profileUrl.includes('linkedin.com/in/')
    : rawContent.length > 50;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Linkedin className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-zinc-900">Importer depuis LinkedIn</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          
          {/* Mode switcher */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setMode('url')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border-2 transition-all ${
                mode === 'url'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-zinc-200 text-zinc-600 hover:border-zinc-300'
              }`}
            >
              <Link className="w-4 h-4" />
              URL du profil
            </button>
            <button
              onClick={() => setMode('paste')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border-2 transition-all ${
                mode === 'paste'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-zinc-200 text-zinc-600 hover:border-zinc-300'
              }`}
            >
              <FileText className="w-4 h-4" />
              Copier-coller
            </button>
          </div>

          {mode === 'url' ? (
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                URL de votre profil LinkedIn
              </label>
              <input
                type="url"
                value={profileUrl}
                onChange={e => setProfileUrl(e.target.value)}
                placeholder="https://linkedin.com/in/votre-nom"
                className="w-full px-4 py-3 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-zinc-500 mt-2">
                L'IA extraira les informations visibles publiquement : 
                titre, résumé, expériences, compétences.
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Collez votre bio / expériences
              </label>
              <textarea
                value={rawContent}
                onChange={e => setRawContent(e.target.value)}
                placeholder="Copiez et collez ici le contenu de votre profil LinkedIn : votre titre, résumé, expériences, compétences..."
                rows={8}
                className="w-full px-4 py-3 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <p className="text-xs text-zinc-500 mt-2">
                Astuce : Sur LinkedIn, sélectionnez tout le texte de votre 
                profil et collez-le ici.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-zinc-200 bg-zinc-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid}
            className={`px-6 py-2 rounded-xl font-medium transition-all ${
              isValid
                ? 'bg-blue-600 text-white hover:bg-blue-500'
                : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
            }`}
          >
            Importer
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinkedInImportModal;
```

---

## MODAL NOTION IMPORT

### Composant : `src/components/portfolio/master/NotionImportModal.tsx`

```tsx
import React, { useState, useRef } from 'react';
import { X, FileText, Upload, Copy } from 'lucide-react';

interface NotionData {
  pageContent?: string;
  fileName?: string;
}

interface NotionImportModalProps {
  data: NotionData;
  onSave: (data: NotionData) => void;
  onClose: () => void;
}

export const NotionImportModal: React.FC<NotionImportModalProps> = ({
  data,
  onSave,
  onClose,
}) => {
  const [mode, setMode] = useState<'file' | 'paste'>('paste');
  const [pageContent, setPageContent] = useState(data.pageContent || '');
  const [fileName, setFileName] = useState(data.fileName || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setPageContent(content);
    };

    if (file.name.endsWith('.md') || file.name.endsWith('.txt')) {
      reader.readAsText(file);
    } else if (file.name.endsWith('.pdf')) {
      // Pour le PDF, on stocke juste le nom et on traitera côté main process
      setPageContent(`[PDF: ${file.name}]`);
    }
  };

  const handleSave = () => {
    onSave({
      pageContent,
      fileName: fileName || undefined,
    });
  };

  const isValid = pageContent.length > 20;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-zinc-900">Importer depuis Notion</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          
          {/* Mode switcher */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setMode('paste')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border-2 transition-all ${
                mode === 'paste'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-zinc-200 text-zinc-600 hover:border-zinc-300'
              }`}
            >
              <Copy className="w-4 h-4" />
              Copier-coller
            </button>
            <button
              onClick={() => setMode('file')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border-2 transition-all ${
                mode === 'file'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-zinc-200 text-zinc-600 hover:border-zinc-300'
              }`}
            >
              <Upload className="w-4 h-4" />
              Fichier exporté
            </button>
          </div>

          {mode === 'paste' ? (
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Collez le contenu de votre page Notion
              </label>
              <textarea
                value={pageContent}
                onChange={e => setPageContent(e.target.value)}
                placeholder="Copiez le contenu de votre page Notion et collez-le ici..."
                rows={10}
                className="w-full px-4 py-3 border border-zinc-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none font-mono text-sm"
              />
              <p className="text-xs text-zinc-500 mt-2">
                Dans Notion : Sélectionnez tout (Ctrl+A) puis copiez (Ctrl+C)
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-2">
                Importez un fichier exporté de Notion
              </label>
              
              <input
                ref={fileInputRef}
                type="file"
                accept=".md,.txt,.pdf"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-8 border-2 border-dashed border-zinc-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all"
              >
                {fileName ? (
                  <div className="text-center">
                    <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="font-medium text-zinc-900">{fileName}</p>
                    <p className="text-xs text-zinc-500 mt-1">Cliquez pour changer</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Upload className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                    <p className="font-medium text-zinc-700">
                      Cliquez pour sélectionner
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      Formats acceptés : .md, .txt, .pdf
                    </p>
                  </div>
                )}
              </button>
              
              <p className="text-xs text-zinc-500 mt-2">
                Dans Notion : Menu ••• → Export → Markdown & CSV
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-4 border-t border-zinc-200 bg-zinc-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid}
            className={`px-6 py-2 rounded-xl font-medium transition-all ${
              isValid
                ? 'bg-blue-600 text-white hover:bg-blue-500'
                : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
            }`}
          >
            Importer
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotionImportModal;
```

---

## ÉCRAN 5 : IMPORT MÉDIAS

### Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Retour                              Étape 4/5 : Vos médias   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ 🤖                                                       │   │
│  │                                                         │   │
│  │ Ajoutez vos visuels et documents                        │   │
│  │                                                         │   │
│  │ Ces fichiers enrichiront votre portfolio.               │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │               📁                                        │   │
│  │                                                         │   │
│  │    Glissez vos fichiers ici                            │   │
│  │    ou cliquez pour sélectionner                        │   │
│  │                                                         │   │
│  │    Images • Vidéos • PDF • Documents                   │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Fichiers importés (3)                                          │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐                           │
│  │ 🖼️      │ │ 🖼️      │ │ 📄      │                           │
│  │photo1.jpg│ │photo2.png│ │brief.pdf│                          │
│  │  [×]    │ │  [×]    │ │  [×]    │                           │
│  └─────────┘ └─────────┘ └─────────┘                           │
│                                                                 │
│                                      [Passer] [Continuer →]     │
└─────────────────────────────────────────────────────────────────┘
```

### Composant : `src/components/portfolio/master/MediaImport.tsx`

```tsx
import React, { useState, useRef, useCallback } from 'react';
import { ArrowLeft, ArrowRight, Bot, Upload, X, Image, Video, FileText, File } from 'lucide-react';

interface MediaFile {
  id: string;
  name: string;
  type: string;
  size: number;
  path: string;
  preview?: string;
}

interface MediaImportProps {
  onComplete: (files: MediaFile[]) => void;
  onBack: () => void;
  onSkip: () => void;
}

export const MediaImport: React.FC<MediaImportProps> = ({
  onComplete,
  onBack,
  onSkip,
}) => {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFiles = async (fileList: FileList) => {
    const newFiles: MediaFile[] = [];
    
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const id = `file-${Date.now()}-${i}`;
      
      let preview: string | undefined;
      if (file.type.startsWith('image/')) {
        preview = URL.createObjectURL(file);
      }

      // Copier le fichier dans le dossier temp de l'app
      const path = await window.electron.invoke('save-temp-file', {
        name: file.name,
        buffer: await file.arrayBuffer(),
      });

      newFiles.push({
        id,
        name: file.name,
        type: file.type,
        size: file.size,
        path,
        preview,
      });
    }

    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files.length > 0) {
      await processFiles(e.dataTransfer.files);
    }
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFiles(e.target.files);
    }
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="w-6 h-6 text-blue-500" />;
    if (type.startsWith('video/')) return <Video className="w-6 h-6 text-purple-500" />;
    if (type.includes('pdf')) return <FileText className="w-6 h-6 text-red-500" />;
    return <File className="w-6 h-6 text-zinc-500" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-zinc-50 p-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          <span className="text-sm text-zinc-500">Étape 4/5 : Vos médias</span>
        </div>

        {/* Message IA */}
        <div className="flex gap-3 mb-8">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <Bot className="w-5 h-5 text-blue-600" />
          </div>
          <div className="bg-white rounded-2xl rounded-tl-none p-4 shadow-sm border border-zinc-100 max-w-lg">
            <p className="font-medium text-zinc-900 mb-1">
              Ajoutez vos visuels et documents
            </p>
            <p className="text-sm text-zinc-500">
              Ces fichiers enrichiront votre portfolio : photos, vidéos, PDF, présentations...
            </p>
          </div>
        </div>

        {/* Zone de drop */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`mb-6 p-12 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-zinc-300 bg-white hover:border-zinc-400'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx,.ppt,.pptx"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          <div className="text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              isDragging ? 'bg-blue-100' : 'bg-zinc-100'
            }`}>
              <Upload className={`w-8 h-8 ${isDragging ? 'text-blue-600' : 'text-zinc-400'}`} />
            </div>
            <p className="font-medium text-zinc-700 mb-1">
              {isDragging ? 'Déposez vos fichiers' : 'Glissez vos fichiers ici'}
            </p>
            <p className="text-sm text-zinc-500">
              ou cliquez pour sélectionner
            </p>
            <p className="text-xs text-zinc-400 mt-2">
              Images • Vidéos • PDF • Documents
            </p>
          </div>
        </div>

        {/* Liste des fichiers */}
        {files.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-medium text-zinc-700 mb-3">
              Fichiers importés ({files.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {files.map(file => (
                <div
                  key={file.id}
                  className="relative bg-white rounded-xl border border-zinc-200 p-3 group"
                >
                  {/* Bouton supprimer */}
                  <button
                    onClick={() => removeFile(file.id)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                  
                  {/* Preview ou icône */}
                  <div className="w-full h-16 bg-zinc-50 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                    {file.preview ? (
                      <img src={file.preview} alt="" className="w-full h-full object-cover" />
                    ) : (
                      getFileIcon(file.type)
                    )}
                  </div>
                  
                  <p className="text-xs font-medium text-zinc-900 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {formatSize(file.size)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onSkip}
            className="px-4 py-2 text-zinc-600 hover:text-zinc-900 transition-colors"
          >
            Passer
          </button>
          <button
            onClick={() => onComplete(files)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-500 transition-colors"
          >
            Continuer
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MediaImport;
```

---

## HANDLERS IPC À AJOUTER

Dans `main.cjs` :

```javascript
// Récupérer tous les projets
ipcMain.handle('db-get-all-projects', async () => {
  return db.projects_getAll();
});

// Sauvegarder un fichier temporaire
ipcMain.handle('save-temp-file', async (event, { name, buffer }) => {
  const tempDir = path.join(app.getPath('userData'), 'temp-imports');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }
  
  const filePath = path.join(tempDir, `${Date.now()}-${name}`);
  fs.writeFileSync(filePath, Buffer.from(buffer));
  return filePath;
});

// Sauvegarder les imports du portfolio
ipcMain.handle('db-save-portfolio-imports', async (event, { portfolioId, imports }) => {
  return db.portfolios_updateImports(portfolioId, JSON.stringify(imports));
});
```

---

## FICHIERS À CRÉER

1. `src/components/portfolio/master/ProjectImport.tsx`
2. `src/components/portfolio/master/LinkedInImportModal.tsx`
3. `src/components/portfolio/master/NotionImportModal.tsx`
4. `src/components/portfolio/master/MediaImport.tsx`

## FICHIERS À MODIFIER

1. `main.cjs` — Ajouter handlers IPC
2. `database.cjs` — Ajouter fonctions DB

---

## TESTS DE VALIDATION

1. ✅ Écran projets avec projets → Liste affichée, sélection fonctionne
2. ✅ Écran projets sans projets → Message "Aucun projet" affiché
3. ✅ Clic LinkedIn → Modal s'ouvre
4. ✅ Import LinkedIn URL → Validation URL fonctionne
5. ✅ Import LinkedIn copier-coller → Texte accepté
6. ✅ Clic Notion → Modal s'ouvre
7. ✅ Import Notion fichier → Upload fonctionne
8. ✅ Import Notion copier-coller → Texte accepté
9. ✅ Écran médias → Drag & drop fonctionne
10. ✅ Écran médias → Sélection fichier fonctionne
11. ✅ Preview images → Affiché correctement
12. ✅ Suppression fichier → Retiré de la liste
13. ✅ Bouton "Passer" → Skip vers étape suivante

---

**Fin du brief MPF-2**
