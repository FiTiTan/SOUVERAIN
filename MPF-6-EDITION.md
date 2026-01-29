# MPF-6 : Édition du Portfolio

**Module:** Portfolio Maître SOUVERAIN
**Priorité:** 🟠 Important
**Temps estimé:** 4-5h
**Prérequis:** MPF-5 complété (Génération)

---

## OBJECTIF

Permettre la modification d'un portfolio existant :
1. Modifier les sections (titre, contenu)
2. Réordonner les sections par drag & drop
3. Ajouter/supprimer des sections
4. Changer de style
5. Ajouter/retirer des projets
6. Mettre à jour les infos pratiques
7. Republier après modifications

---

## ÉCRAN PRINCIPAL ÉDITION

### Layout

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ← Mes Portfolios        Mon Portfolio Freelance         [Preview] [Publier]│
├────────────────────────────────────────┬────────────────────────────────────┤
│                                        │                                    │
│  SECTIONS                    [+ Ajouter]│         APERÇU LIVE               │
│                                        │                                    │
│  ┌────────────────────────────────┐   │   ┌────────────────────────────┐   │
│  │ ≡  Hero                    [⋮] │   │   │                            │   │
│  │    "Développeur Full Stack"    │   │   │    ┌──────────────────┐   │   │
│  └────────────────────────────────┘   │   │    │                  │   │   │
│                                        │   │    │      HERO        │   │   │
│  ┌────────────────────────────────┐   │   │    │                  │   │   │
│  │ ≡  À propos                [⋮] │   │   │    └──────────────────┘   │   │
│  │    "Passionné par..."          │   │   │                            │   │
│  └────────────────────────────────┘   │   │    ┌──────────────────┐   │   │
│                                        │   │    │    À PROPOS      │   │   │
│  ┌────────────────────────────────┐   │   │    └──────────────────┘   │   │
│  │ ≡  Projets (3)             [⋮] │   │   │                            │   │
│  │    "Découvrez mes..."          │   │   │    ┌──────────────────┐   │   │
│  └────────────────────────────────┘   │   │    │     PROJETS      │   │   │
│                                        │   │    └──────────────────┘   │   │
│  ┌────────────────────────────────┐   │   │                            │   │
│  │ ≡  Contact                 [⋮] │   │   │    ┌──────────────────┐   │   │
│  │    "Prenons contact"           │   │   │    │     CONTACT      │   │   │
│  └────────────────────────────────┘   │   │    └──────────────────┘   │   │
│                                        │   │                            │   │
│  ─────────────────────────────────────│   └────────────────────────────┘   │
│                                        │                                    │
│  PARAMÈTRES                            │                                    │
│                                        │                                    │
│  Style : [Moderne ▼]                   │                                    │
│                                        │                                    │
│  Projets : [Gérer →]                   │                                    │
│                                        │                                    │
│  Infos pratiques : [Modifier →]        │                                    │
│                                        │                                    │
└────────────────────────────────────────┴────────────────────────────────────┘
```

---

## COMPOSANT PRINCIPAL

### Fichier : `src/components/portfolio/editor/PortfolioEditor.tsx`

```tsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  ArrowLeft, Eye, Globe, Plus, GripVertical, 
  MoreVertical, Pencil, Trash2, ChevronDown,
  Settings, Folder, MapPin
} from 'lucide-react';
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Section {
  id: string;
  type: 'hero' | 'about' | 'services' | 'projects' | 'testimonials' | 'practical' | 'contact' | 'custom';
  title: string;
  content: string;
  metadata?: Record<string, any>;
  order: number;
}

interface PortfolioData {
  id: string;
  name: string;
  style: string;
  sections: Section[];
  projects: any[];
  practicalData?: any;
  seo: { title: string; description: string; keywords: string[] };
}

interface PortfolioEditorProps {
  portfolioId: string;
  onBack: () => void;
  onPreview: (html: string) => void;
  onPublish: () => void;
}

export const PortfolioEditor: React.FC<PortfolioEditorProps> = ({
  portfolioId,
  onBack,
  onPreview,
  onPublish,
}) => {
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [previewHTML, setPreviewHTML] = useState<string>('');
  
  // Modals
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [showAddSection, setShowAddSection] = useState(false);
  const [showStylePicker, setShowStylePicker] = useState(false);
  const [showProjectsManager, setShowProjectsManager] = useState(false);
  const [showPracticalEditor, setShowPracticalEditor] = useState(false);

  // Charger le portfolio
  useEffect(() => {
    loadPortfolio();
  }, [portfolioId]);

  // Régénérer la preview quand les données changent
  useEffect(() => {
    if (portfolio) {
      regeneratePreview();
    }
  }, [portfolio]);

  const loadPortfolio = async () => {
    try {
      const data = await window.electron.invoke('db-get-portfolio', portfolioId);
      setPortfolio(data);
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const regeneratePreview = async () => {
    if (!portfolio) return;
    try {
      const html = await window.electron.invoke('render-portfolio-html', {
        sections: portfolio.sections,
        seo: portfolio.seo,
        style: portfolio.style,
        projects: portfolio.projects,
        practicalData: portfolio.practicalData,
      });
      setPreviewHTML(html);
    } catch (error) {
      console.error('Erreur preview:', error);
    }
  };

  const savePortfolio = async () => {
    if (!portfolio) return;
    setIsSaving(true);
    try {
      await window.electron.invoke('db-update-portfolio', portfolio);
      setHasChanges(false);
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save
  useEffect(() => {
    if (hasChanges) {
      const timeout = setTimeout(savePortfolio, 2000);
      return () => clearTimeout(timeout);
    }
  }, [hasChanges, portfolio]);

  const updateSection = (sectionId: string, updates: Partial<Section>) => {
    if (!portfolio) return;
    setPortfolio({
      ...portfolio,
      sections: portfolio.sections.map(s =>
        s.id === sectionId ? { ...s, ...updates } : s
      ),
    });
    setHasChanges(true);
  };

  const deleteSection = (sectionId: string) => {
    if (!portfolio) return;
    if (!confirm('Supprimer cette section ?')) return;
    setPortfolio({
      ...portfolio,
      sections: portfolio.sections.filter(s => s.id !== sectionId),
    });
    setHasChanges(true);
  };

  const addSection = (type: Section['type']) => {
    if (!portfolio) return;
    const newSection: Section = {
      id: `section-${Date.now()}`,
      type,
      title: getSectionDefaultTitle(type),
      content: getSectionDefaultContent(type),
      order: portfolio.sections.length,
    };
    setPortfolio({
      ...portfolio,
      sections: [...portfolio.sections, newSection],
    });
    setHasChanges(true);
    setShowAddSection(false);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !portfolio) return;

    const oldIndex = portfolio.sections.findIndex(s => s.id === active.id);
    const newIndex = portfolio.sections.findIndex(s => s.id === over.id);

    const newSections = [...portfolio.sections];
    const [removed] = newSections.splice(oldIndex, 1);
    newSections.splice(newIndex, 0, removed);

    // Mettre à jour les ordres
    newSections.forEach((s, i) => s.order = i);

    setPortfolio({ ...portfolio, sections: newSections });
    setHasChanges(true);
  };

  const updateStyle = (newStyle: string) => {
    if (!portfolio) return;
    setPortfolio({ ...portfolio, style: newStyle });
    setHasChanges(true);
    setShowStylePicker(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <p className="text-zinc-500">Portfolio non trouvé</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-zinc-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900"
          >
            <ArrowLeft className="w-4 h-4" />
            Mes Portfolios
          </button>
          <div className="h-6 w-px bg-zinc-300" />
          <h1 className="font-semibold text-zinc-900">{portfolio.name}</h1>
          {hasChanges && (
            <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
              Non sauvegardé
            </span>
          )}
          {isSaving && (
            <span className="text-xs text-blue-600">Sauvegarde...</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onPreview(previewHTML)}
            className="flex items-center gap-2 px-4 py-2 text-zinc-700 hover:bg-zinc-100 rounded-lg"
          >
            <Eye className="w-4 h-4" />
            Aperçu
          </button>
          <button
            onClick={onPublish}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500"
          >
            <Globe className="w-4 h-4" />
            Publier
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex">
        {/* Panneau gauche - Sections */}
        <div className="w-96 bg-white border-r border-zinc-200 flex flex-col">
          {/* Sections header */}
          <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
            <h2 className="font-semibold text-zinc-900">Sections</h2>
            <button
              onClick={() => setShowAddSection(true)}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
            >
              <Plus className="w-4 h-4" />
              Ajouter
            </button>
          </div>

          {/* Liste des sections */}
          <div className="flex-1 overflow-y-auto p-4">
            <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={portfolio.sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {portfolio.sections
                    .sort((a, b) => a.order - b.order)
                    .map(section => (
                      <SortableSection
                        key={section.id}
                        section={section}
                        onEdit={() => setEditingSection(section)}
                        onDelete={() => deleteSection(section.id)}
                      />
                    ))}
                </div>
              </SortableContext>
            </DndContext>
          </div>

          {/* Paramètres */}
          <div className="p-4 border-t border-zinc-100 space-y-3">
            <h3 className="text-sm font-medium text-zinc-500 uppercase">Paramètres</h3>
            
            {/* Style */}
            <button
              onClick={() => setShowStylePicker(true)}
              className="w-full flex items-center justify-between p-3 bg-zinc-50 rounded-lg hover:bg-zinc-100"
            >
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4 text-zinc-500" />
                <span className="text-sm">Style</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-500 capitalize">{portfolio.style}</span>
                <ChevronDown className="w-4 h-4 text-zinc-400" />
              </div>
            </button>

            {/* Projets */}
            <button
              onClick={() => setShowProjectsManager(true)}
              className="w-full flex items-center justify-between p-3 bg-zinc-50 rounded-lg hover:bg-zinc-100"
            >
              <div className="flex items-center gap-3">
                <Folder className="w-4 h-4 text-zinc-500" />
                <span className="text-sm">Projets</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-500">{portfolio.projects.length}</span>
                <ChevronDown className="w-4 h-4 text-zinc-400" />
              </div>
            </button>

            {/* Infos pratiques */}
            <button
              onClick={() => setShowPracticalEditor(true)}
              className="w-full flex items-center justify-between p-3 bg-zinc-50 rounded-lg hover:bg-zinc-100"
            >
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-zinc-500" />
                <span className="text-sm">Infos pratiques</span>
              </div>
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            </button>
          </div>
        </div>

        {/* Panneau droit - Preview */}
        <div className="flex-1 p-6 overflow-hidden">
          <div className="h-full bg-white rounded-xl shadow-sm border border-zinc-200 overflow-hidden">
            <div className="bg-zinc-100 px-4 py-2 border-b border-zinc-200 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="ml-4 text-xs text-zinc-500">Aperçu en direct</span>
            </div>
            <iframe
              srcDoc={previewHTML}
              title="Preview"
              className="w-full h-full border-0"
              style={{ height: 'calc(100% - 36px)' }}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      {editingSection && (
        <SectionEditor
          section={editingSection}
          onSave={(updates) => {
            updateSection(editingSection.id, updates);
            setEditingSection(null);
          }}
          onClose={() => setEditingSection(null)}
        />
      )}

      {showAddSection && (
        <AddSectionModal
          onAdd={addSection}
          onClose={() => setShowAddSection(false)}
        />
      )}

      {showStylePicker && (
        <StylePickerModal
          currentStyle={portfolio.style}
          onSelect={updateStyle}
          onClose={() => setShowStylePicker(false)}
        />
      )}

      {showProjectsManager && (
        <ProjectsManagerModal
          selectedProjects={portfolio.projects}
          onUpdate={(projects) => {
            setPortfolio({ ...portfolio, projects });
            setHasChanges(true);
            setShowProjectsManager(false);
          }}
          onClose={() => setShowProjectsManager(false)}
        />
      )}

      {showPracticalEditor && (
        <PracticalInfoEditor
          data={portfolio.practicalData}
          onSave={(data) => {
            setPortfolio({ ...portfolio, practicalData: data });
            setHasChanges(true);
            setShowPracticalEditor(false);
          }}
          onClose={() => setShowPracticalEditor(false)}
        />
      )}
    </div>
  );
};

// Composant Section Sortable
const SortableSection: React.FC<{
  section: Section;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ section, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  const [showMenu, setShowMenu] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-zinc-50 rounded-lg border border-zinc-200 ${isDragging ? 'shadow-lg' : ''}`}
    >
      <div className="flex items-center gap-3 p-3">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-zinc-400 hover:text-zinc-600">
          <GripVertical className="w-4 h-4" />
        </button>
        
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-zinc-900 capitalize">{section.type === 'custom' ? section.title : section.type}</p>
          <p className="text-xs text-zinc-500 truncate">{section.title}</p>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-zinc-400 hover:text-zinc-600"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          
          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-zinc-200 py-1 z-20 w-32">
                <button
                  onClick={() => { onEdit(); setShowMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                >
                  <Pencil className="w-4 h-4" />
                  Modifier
                </button>
                <button
                  onClick={() => { onDelete(); setShowMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Helpers
function getSectionDefaultTitle(type: Section['type']): string {
  const titles: Record<string, string> = {
    hero: 'Bienvenue',
    about: 'À propos',
    services: 'Services',
    projects: 'Réalisations',
    testimonials: 'Témoignages',
    practical: 'Informations pratiques',
    contact: 'Contact',
    custom: 'Nouvelle section',
  };
  return titles[type] || 'Section';
}

function getSectionDefaultContent(type: Section['type']): string {
  const contents: Record<string, string> = {
    hero: 'Votre accroche principale',
    about: 'Présentez-vous en quelques lignes.',
    services: 'Listez vos services ou compétences.',
    projects: 'Découvrez mes réalisations.',
    testimonials: 'Ce que disent mes clients.',
    practical: 'Retrouvez toutes les informations utiles.',
    contact: 'Prenons contact pour discuter de votre projet.',
    custom: 'Contenu de votre section.',
  };
  return contents[type] || '';
}

export default PortfolioEditor;
```

---

## MODAL ÉDITION DE SECTION

### Fichier : `src/components/portfolio/editor/SectionEditor.tsx`

```tsx
import React, { useState } from 'react';
import { X } from 'lucide-react';

interface Section {
  id: string;
  type: string;
  title: string;
  content: string;
  metadata?: Record<string, any>;
}

interface SectionEditorProps {
  section: Section;
  onSave: (updates: Partial<Section>) => void;
  onClose: () => void;
}

export const SectionEditor: React.FC<SectionEditorProps> = ({
  section,
  onSave,
  onClose,
}) => {
  const [title, setTitle] = useState(section.title);
  const [content, setContent] = useState(section.content);
  const [cta, setCta] = useState(section.metadata?.cta || '');

  const handleSave = () => {
    onSave({
      title,
      content,
      metadata: section.type === 'hero' ? { ...section.metadata, cta } : section.metadata,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-zinc-200">
          <h3 className="font-semibold">Modifier la section</h3>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Titre</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Contenu</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={6}
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {section.type === 'hero' && (
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Bouton d'action (CTA)
              </label>
              <input
                type="text"
                value={cta}
                onChange={e => setCta(e.target.value)}
                placeholder="Ex: Me contacter"
                className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-4 border-t border-zinc-200 bg-zinc-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-zinc-600 hover:text-zinc-900"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};
```

---

## MODAL AJOUT DE SECTION

### Fichier : `src/components/portfolio/editor/AddSectionModal.tsx`

```tsx
import React from 'react';
import { X, Sparkles, User, Briefcase, Folder, MessageSquare, MapPin, Phone, Plus } from 'lucide-react';

type SectionType = 'hero' | 'about' | 'services' | 'projects' | 'testimonials' | 'practical' | 'contact' | 'custom';

const SECTION_TYPES: Array<{ type: SectionType; label: string; icon: React.ReactNode; description: string }> = [
  { type: 'hero', label: 'Hero', icon: <Sparkles className="w-5 h-5" />, description: 'Section d\'accroche principale' },
  { type: 'about', label: 'À propos', icon: <User className="w-5 h-5" />, description: 'Présentation personnelle' },
  { type: 'services', label: 'Services', icon: <Briefcase className="w-5 h-5" />, description: 'Liste de vos services' },
  { type: 'projects', label: 'Projets', icon: <Folder className="w-5 h-5" />, description: 'Galerie de réalisations' },
  { type: 'testimonials', label: 'Témoignages', icon: <MessageSquare className="w-5 h-5" />, description: 'Avis de vos clients' },
  { type: 'practical', label: 'Infos pratiques', icon: <MapPin className="w-5 h-5" />, description: 'Horaires, adresse, etc.' },
  { type: 'contact', label: 'Contact', icon: <Phone className="w-5 h-5" />, description: 'Formulaire de contact' },
  { type: 'custom', label: 'Section libre', icon: <Plus className="w-5 h-5" />, description: 'Contenu personnalisé' },
];

interface AddSectionModalProps {
  onAdd: (type: SectionType) => void;
  onClose: () => void;
}

export const AddSectionModal: React.FC<AddSectionModalProps> = ({ onAdd, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-zinc-200">
          <h3 className="font-semibold">Ajouter une section</h3>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 grid grid-cols-2 gap-3">
          {SECTION_TYPES.map(({ type, label, icon, description }) => (
            <button
              key={type}
              onClick={() => onAdd(type)}
              className="flex flex-col items-start p-4 rounded-xl border border-zinc-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
            >
              <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center mb-3 text-zinc-600">
                {icon}
              </div>
              <p className="font-medium text-zinc-900">{label}</p>
              <p className="text-xs text-zinc-500">{description}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
```

---

## MODAL SÉLECTEUR DE STYLE

### Fichier : `src/components/portfolio/editor/StylePickerModal.tsx`

```tsx
import React from 'react';
import { X, Check } from 'lucide-react';

const STYLES = [
  { id: 'moderne', name: 'Moderne', colors: ['#3b82f6', '#8b5cf6'] },
  { id: 'classique', name: 'Classique', colors: ['#1e3a5f', '#d4af37'] },
  { id: 'authentique', name: 'Authentique', colors: ['#b45309', '#059669'] },
  { id: 'artistique', name: 'Artistique', colors: ['#18181b', '#71717a'] },
  { id: 'vitrine', name: 'Vitrine', colors: ['#dc2626', '#16a34a'] },
  { id: 'formel', name: 'Formel', colors: ['#1e3a5f', '#b8860b'] },
];

interface StylePickerModalProps {
  currentStyle: string;
  onSelect: (style: string) => void;
  onClose: () => void;
}

export const StylePickerModal: React.FC<StylePickerModalProps> = ({
  currentStyle,
  onSelect,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-zinc-200">
          <h3 className="font-semibold">Choisir un style</h3>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-2">
          {STYLES.map(style => (
            <button
              key={style.id}
              onClick={() => onSelect(style.id)}
              className={`w-full flex items-center gap-4 p-3 rounded-xl border-2 transition-all ${
                currentStyle === style.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-zinc-200 hover:border-zinc-300'
              }`}
            >
              <div className="flex gap-1">
                {style.colors.map((color, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-md"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <span className="flex-1 text-left font-medium">{style.name}</span>
              {currentStyle === style.id && (
                <Check className="w-5 h-5 text-blue-600" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
```

---

## MODAL INFOS PRATIQUES

### Fichier : `src/components/portfolio/editor/PracticalInfoEditor.tsx`

```tsx
import React, { useState } from 'react';
import { X } from 'lucide-react';

interface PracticalData {
  hours?: string;
  address?: string;
  phone?: string;
  email?: string;
  socials?: string[];
}

interface PracticalInfoEditorProps {
  data?: PracticalData;
  onSave: (data: PracticalData) => void;
  onClose: () => void;
}

export const PracticalInfoEditor: React.FC<PracticalInfoEditorProps> = ({
  data,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState<PracticalData>(data || {});

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-zinc-200">
          <h3 className="font-semibold">Informations pratiques</h3>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Horaires</label>
            <input
              type="text"
              value={formData.hours || ''}
              onChange={e => setFormData({ ...formData, hours: e.target.value })}
              placeholder="Ex: Lun-Ven 9h-18h"
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Adresse</label>
            <input
              type="text"
              value={formData.address || ''}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              placeholder="Ex: 12 rue Example, 75001 Paris"
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Téléphone</label>
            <input
              type="tel"
              value={formData.phone || ''}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Ex: 01 23 45 67 89"
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              placeholder="Ex: contact@example.com"
              className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 p-4 border-t border-zinc-200 bg-zinc-50">
          <button onClick={onClose} className="px-4 py-2 text-zinc-600 hover:text-zinc-900">
            Annuler
          </button>
          <button onClick={handleSave} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500">
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};
```

---

## HANDLERS IPC

Dans `main.cjs` :

```javascript
// Récupérer un portfolio complet
ipcMain.handle('db-get-portfolio', async (event, portfolioId) => {
  return db.portfolios_getById(portfolioId);
});

// Mettre à jour un portfolio
ipcMain.handle('db-update-portfolio', async (event, portfolioData) => {
  return db.portfolios_update(portfolioData);
});
```

---

## DÉPENDANCES À INSTALLER

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

---

## FICHIERS À CRÉER

1. `src/components/portfolio/editor/PortfolioEditor.tsx`
2. `src/components/portfolio/editor/SectionEditor.tsx`
3. `src/components/portfolio/editor/AddSectionModal.tsx`
4. `src/components/portfolio/editor/StylePickerModal.tsx`
5. `src/components/portfolio/editor/PracticalInfoEditor.tsx`
6. `src/components/portfolio/editor/ProjectsManagerModal.tsx` (similaire aux autres modals)

---

## TESTS DE VALIDATION

1. ✅ Charger portfolio existant → Données affichées
2. ✅ Modifier titre section → Preview mise à jour
3. ✅ Drag & drop section → Ordre modifié
4. ✅ Ajouter section → Apparaît dans la liste
5. ✅ Supprimer section → Confirmation + retrait
6. ✅ Changer style → Preview mise à jour instantanément
7. ✅ Modifier infos pratiques → Sauvegardé
8. ✅ Auto-save → Sauvegarde après 2s d'inactivité
9. ✅ Bouton Aperçu → Ouvre preview plein écran
10. ✅ Bouton Publier → Lance le flux de publication

---

**Fin du brief MPF-6**
