import { useState } from 'react';
import { moduleTemplates } from '../../data/moduleTemplates';
import { ModuleTemplate } from '../../types';
import { 
  Calendar, 
  Users, 
  Map, 
  MessageCircle, 
  Briefcase, 
  Info,
  Sparkles,
  Plus,
  Crown,
  Search,
  Filter,
  Grid3x3,
  List,
  Check
} from 'lucide-react';

const iconMap: Record<string, any> = {
  Calendar,
  Users,
  Map,
  MessageCircle,
  Briefcase,
  Info,
  Sparkles
};

interface ModuleLibraryProps {
  onAddModule?: (template: ModuleTemplate) => void;
}

export function ModuleLibrary({ onAddModule }: ModuleLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedTemplate, setSelectedTemplate] = useState<ModuleTemplate | null>(null);

  const categories = [
    { value: 'all', label: 'Все модули' },
    { value: 'core', label: 'Основные' },
    { value: 'engagement', label: 'Вовлечение' },
    { value: 'information', label: 'Информация' },
    { value: 'custom', label: 'Пользовательские' }
  ];

  const filteredTemplates = moduleTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAddModule = (template: ModuleTemplate) => {
    if (onAddModule) {
      onAddModule(template);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Библиотека модулей</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Выберите модули для вашего мероприятия
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Поиск модулей..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Category Filter */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="pl-10 pr-8 py-2 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground appearance-none cursor-pointer min-w-[180px]"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 bg-muted rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded transition-all ${
              viewMode === 'grid' 
                ? 'bg-primary text-white' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded transition-all ${
              viewMode === 'list' 
                ? 'bg-primary text-white' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Module Cards */}
      <div className={
        viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
          : 'space-y-3'
      }>
        {filteredTemplates.map(template => {
          const Icon = iconMap[template.icon] || Info;
          
          return (
            <div
              key={template.id}
              className={`bg-card rounded-xl border border-border hover:border-primary/50 transition-all group cursor-pointer ${
                viewMode === 'list' ? 'flex items-center' : ''
              }`}
              onClick={() => setSelectedTemplate(template)}
            >
              <div className={`p-5 ${viewMode === 'list' ? 'flex items-center gap-4 flex-1' : ''}`}>
                {/* Icon */}
                <div className={`${
                  viewMode === 'grid' ? 'mb-4' : ''
                } w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>

                {/* Content */}
                <div className={viewMode === 'list' ? 'flex-1' : ''}>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-foreground">{template.name}</h3>
                    {template.isPremium && (
                      <Crown className="w-4 h-4 text-amber-500" />
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {template.description}
                  </p>

                  {/* Category Badge */}
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      template.category === 'core' 
                        ? 'bg-primary/10 text-primary'
                        : template.category === 'engagement'
                        ? 'bg-accent/10 text-accent'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {categories.find(c => c.value === template.category)?.label}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {template.fields.length} настроек
                    </span>
                  </div>
                </div>

                {/* Add Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddModule(template);
                  }}
                  className="mt-4 w-full py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100"
                >
                  <Plus className="w-4 h-4" />
                  Добавить модуль
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <Info className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Модули не найдены</p>
        </div>
      )}

      {/* Module Detail Modal */}
      {selectedTemplate && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedTemplate(null)}
        >
          <div 
            className="bg-background rounded-2xl border border-border max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center flex-shrink-0">
                  {(() => {
                    const Icon = iconMap[selectedTemplate.icon] || Info;
                    return <Icon className="w-8 h-8 text-white" />;
                  })()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-foreground">{selectedTemplate.name}</h3>
                    {selectedTemplate.isPremium && (
                      <Crown className="w-5 h-5 text-amber-500" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <h4 className="font-semibold text-foreground mb-4">Доступные настройки ({selectedTemplate.fields.length})</h4>
              <div className="space-y-3">
                {selectedTemplate.fields.map(field => (
                  <div key={field.id} className="flex items-start gap-3 p-3 bg-card rounded-lg border border-border">
                    <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-sm text-foreground flex items-center gap-2">
                        {field.label}
                        {field.isPremium && <Crown className="w-3 h-3 text-amber-500" />}
                      </div>
                      {field.description && (
                        <p className="text-xs text-muted-foreground mt-1">{field.description}</p>
                      )}
                      <div className="text-xs text-muted-foreground mt-1">
                        Тип: <span className="font-mono">{field.type}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-border flex gap-3">
              <button
                onClick={() => setSelectedTemplate(null)}
                className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-all text-foreground"
              >
                Закрыть
              </button>
              <button
                onClick={() => {
                  handleAddModule(selectedTemplate);
                  setSelectedTemplate(null);
                }}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Добавить в событие
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
