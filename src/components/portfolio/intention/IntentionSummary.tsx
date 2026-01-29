import React from 'react';
import { useTheme } from '../../../ThemeContext';
import { type IntentionFormData, INTENTION_OPTIONS } from '../../../services/intentionService';
import { Target, Users, Layers, MessageSquare, Briefcase, Edit2 } from 'lucide-react';

interface IntentionSummaryProps {
  data: IntentionFormData;
  onEdit: () => void;
}

export const IntentionSummary: React.FC<IntentionSummaryProps> = ({ data, onEdit }) => {
  const { mode } = useTheme();

  const getLabel = (category: keyof typeof INTENTION_OPTIONS, id: string) => {
    const option = INTENTION_OPTIONS[category].find(opt => opt.id === id);
    return option ? option.label : id;
  };

  const getContentTypeLabels = () => {
    return data.contentType
      .map(id => {
        const option = INTENTION_OPTIONS.contentTypes.find(opt => opt.id === id);
        return option ? option.label : id;
      })
      .join(', ');
  };

  const items = [
    {
      icon: Target,
      label: 'Objectif',
      value: getLabel('objectives', data.objective)
    },
    {
      icon: Users,
      label: 'Audience',
      value: getLabel('audiences', data.targetAudience)
    },
    {
      icon: Layers,
      label: 'Contenu',
      value: getContentTypeLabels()
    },
    {
      icon: MessageSquare,
      label: 'Ton',
      value: getLabel('tones', data.desiredTone)
    },
    {
      icon: Briefcase,
      label: 'Secteur',
      value: getLabel('sectors', data.sector)
    }
  ];

  return (
    <div className={`p-6 rounded-xl border ${
      mode === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-gray-200'
    }`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Vos intentions</h3>
        <button
          onClick={onEdit}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            mode === 'dark'
              ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white'
              : 'hover:bg-gray-100 text-gray-600 hover:text-gray-900'
          }`}
        >
          <Edit2 className="w-3.5 h-3.5" />
          Modifier
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${
                mode === 'dark' ? 'bg-zinc-800' : 'bg-gray-100'
              }`}>
                <Icon className="w-4 h-4 opacity-60" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium opacity-50 uppercase tracking-wide mb-0.5">
                  {item.label}
                </div>
                <div className="text-sm font-medium truncate">
                  {item.value}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
