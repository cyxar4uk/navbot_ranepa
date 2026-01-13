import { useState, useCallback, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useParams, useNavigate } from 'react-router-dom';
import { moduleTemplates, getFieldsByModuleType } from '../../data/moduleTemplates';
import { UIModule, ModuleTemplate } from '../../types';
import { ModuleFieldRenderer } from './ModuleFieldRenderer';
import { apiModulesToUIModules, uiModuleToApiModule, createUIModuleFromTemplate } from '../../utils/moduleAdapter';
import api from '../../services/api';
import { 
  GripVertical, 
  Eye, 
  EyeOff, 
  Settings as SettingsIcon,
  Calendar,
  Users,
  Map,
  MessageCircle,
  Briefcase,
  Info,
  Save,
  Smartphone,
  Plus,
  Trash2,
  Zap,
  X,
  Check,
  Sparkles,
  Crown,
  Library,
  ChevronRight,
  ChevronDown,
  AlertCircle,
  ArrowLeft,
  Loader2
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

interface DraggableModuleProps {
  module: UIModule;
  index: number;
  moveModule: (dragIndex: number, hoverIndex: number) => void;
  toggleModule: (id: string) => void;
  setSelectedModule: (module: UIModule) => void;
  onDelete: (id: string) => void;
}

function DraggableModule({ 
  module, 
  index, 
  moveModule, 
  toggleModule, 
  setSelectedModule,
  onDelete 
}: DraggableModuleProps) {
  const [{ isDragging }, drag] = useDrag({
    type: 'MODULE',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'MODULE',
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        moveModule(item.index, index);
        item.index = index;
      }
    },
  });

  const Icon = iconMap[module.icon as keyof typeof iconMap] || Info;

  return (
    <div
      ref={(node) => drag(drop(node))}
      className={`p-4 flex items-center gap-4 bg-card border border-border rounded-lg mb-3 cursor-move transition-all ${
        !module.enabled ? 'opacity-50' : ''
      } ${isDragging ? 'opacity-50 shadow-lg' : 'hover:border-primary/50'}`}
    >
      {/* Drag Handle */}
      <GripVertical className="w-5 h-5 text-muted-foreground flex-shrink-0" />

      {/* Icon */}
      <div className={`p-3 rounded-xl flex-shrink-0 ${
        module.enabled 
          ? 'bg-gradient-to-br from-primary to-accent' 
          : 'bg-muted'
      }`}>
        <Icon className={`w-5 h-5 ${module.enabled ? 'text-white' : 'text-muted-foreground'}`} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <div className="font-medium text-foreground truncate">{module.name}</div>
          {module.isPremium && <Crown className="w-4 h-4 text-amber-500 flex-shrink-0" />}
        </div>
        <div className="text-sm text-muted-foreground">
          Порядок: {module.order} • {module.category === 'core' ? 'Основной' : module.category === 'engagement' ? 'Вовлечение' : 'Информация'}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => setSelectedModule(module)}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
          title="Настройки"
        >
          <SettingsIcon className="w-5 h-5 text-muted-foreground" />
        </button>
        <button
          onClick={() => toggleModule(module.id)}
          className={`p-2 rounded-lg transition-colors ${
            module.enabled
              ? 'bg-primary/20 text-primary hover:bg-primary/30'
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
          title={module.enabled ? 'Отключить' : 'Включить'}
        >
          {module.enabled ? (
            <Eye className="w-5 h-5" />
          ) : (
            <EyeOff className="w-5 h-5" />
          )}
        </button>
        <button
          onClick={() => onDelete(module.id)}
          className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors"
          title="Удалить"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function EventBuilderContent() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [modules, setModules] = useState<UIModule[]>([]);
  const [selectedModule, setSelectedModule] = useState<UIModule | null>(null);
  const [previewScale, setPreviewScale] = useState(1);
  const [showLibrary, setShowLibrary] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    display: true,
    features: true,
    advanced: false
  });

  useEffect(() => {
    if (!eventId) return;
    api.setTokenFromStorage();
    loadModules();
  }, [eventId]);

  const loadModules = async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      const apiModules = await api.adminGetEventModules(eventId);
      const uiModules = apiModulesToUIModules(apiModules);
      setModules(uiModules);
    } catch (err) {
      console.error('Failed to load modules:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!eventId) return;
    try {
      setSaving(true);
      
      // Update all modules via API
      for (const module of modules) {
        const apiModuleData = uiModuleToApiModule(module, eventId);
        await api.updateModule(module.id, apiModuleData);
      }
      
      // Also update order via reorder API
      const moduleIds = modules.map(m => m.id);
      await api.reorderModules(eventId, moduleIds);
      
      // Navigate back to admin dashboard
      navigate('/admin');
    } catch (err) {
      console.error('Failed to save modules:', err);
      alert('Ошибка при сохранении модулей');
    } finally {
      setSaving(false);
    }
  };

  const moveModule = useCallback((dragIndex: number, hoverIndex: number) => {
    setModules((prevModules) => {
      const newModules = [...prevModules];
      const dragModule = newModules[dragIndex];
      newModules.splice(dragIndex, 1);
      newModules.splice(hoverIndex, 0, dragModule);
      
      // Update order
      newModules.forEach((m, i) => {
        m.order = i + 1;
      });
      
      return newModules;
    });
  }, []);

  const toggleModule = async (id: string) => {
    const module = modules.find(m => m.id === id);
    if (!module || !eventId) return;
    
    try {
      const updated = await api.updateModule(id, {
        enabled: !module.enabled,
      });
      const updatedUIModule = apiModulesToUIModules([updated])[0];
      setModules((prev) =>
        prev.map((m) => (m.id === id ? updatedUIModule : m))
      );
      if (selectedModule?.id === id) {
        setSelectedModule(updatedUIModule);
      }
    } catch (err) {
      console.error('Failed to toggle module:', err);
    }
  };

  const deleteModule = async (id: string) => {
    if (!confirm('Удалить модуль?')) return;
    
    try {
      await api.deleteModule(id);
      setModules((prev) => prev.filter(m => m.id !== id));
      if (selectedModule?.id === id) {
        setSelectedModule(null);
      }
    } catch (err) {
      console.error('Failed to delete module:', err);
    }
  };

  const addModule = async (template: ModuleTemplate) => {
    if (!eventId) return;
    
    try {
      const newUIModule = createUIModuleFromTemplate(template, modules.length + 1, eventId);
      const apiModuleData = uiModuleToApiModule(newUIModule, eventId);
      
      // Create module via API
      const createdModule = await api.createModule({
        event_id: eventId,
        type: apiModuleData.type!,
        title: newUIModule.name,
        config: newUIModule.config || {},
      });
      
      // Convert back to UI format
      const uiModule = apiModulesToUIModules([createdModule])[0];
      setModules((prev) => [...prev, uiModule]);
      setShowLibrary(false);
    } catch (err) {
      console.error('Failed to add module:', err);
    }
  };

  const updateModuleConfig = (moduleId: string, fieldId: string, value: any) => {
    setModules((prev) =>
      prev.map((m) => {
        if (m.id === moduleId) {
          return {
            ...m,
            config: {
              ...m.config,
              [fieldId]: value
            }
          };
        }
        return m;
      })
    );
    
    // Also update selected module
    if (selectedModule?.id === moduleId) {
      setSelectedModule({
        ...selectedModule,
        config: {
          ...selectedModule.config,
          [fieldId]: value
        }
      });
    }
  };

  const updateModuleName = async (id: string, name: string) => {
    try {
      await api.updateModule(id, { title: name });
      setModules((prev) =>
        prev.map((m) => (m.id === id ? { ...m, name } : m))
      );
      if (selectedModule?.id === id) {
        setSelectedModule({ ...selectedModule, name });
      }
    } catch (err) {
      console.error('Failed to update module name:', err);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const enabledModules = modules.filter((m) => m.enabled).sort((a, b) => a.order - b.order);

  // Get fields for selected module
  const selectedModuleFields = selectedModule ? getFieldsByModuleType(selectedModule.type) : [];

  // Group fields by category
  const displayFields = selectedModuleFields.filter(f => 
    ['text', 'textarea', 'select', 'radio', 'slider', 'color'].includes(f.type)
  ).slice(0, 4);
  
  const featureFields = selectedModuleFields.filter(f => f.type === 'toggle');
  
  const advancedFields = selectedModuleFields.filter(f => 
    !displayFields.includes(f) && !featureFields.includes(f)
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/admin')}
          className="p-2 hover:bg-muted rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Конструктор модулей</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Настройте модули вашего мероприятия
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Left Panel - Modules List */}
        <div className="xl:col-span-5 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Модули приложения
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Перетащите модули для изменения порядка
              </p>
            </div>
            <button 
              onClick={() => setShowLibrary(!showLibrary)}
              className="px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-all flex items-center gap-2"
            >
              <Library className="w-4 h-4" />
              Библиотека
            </button>
          </div>

          {/* Module Library Quick Add */}
          {showLibrary && (
            <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl p-4 border border-primary/20">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-foreground">Добавить модуль</h3>
                <button onClick={() => setShowLibrary(false)}>
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                {moduleTemplates.map(template => {
                  const Icon = iconMap[template.icon] || Info;
                  const alreadyAdded = modules.some(m => m.type === template.type);
                  
                  return (
                    <button
                      key={template.id}
                      onClick={() => !alreadyAdded && addModule(template)}
                      disabled={alreadyAdded}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        alreadyAdded
                          ? 'bg-muted/50 border-border opacity-50 cursor-not-allowed'
                          : 'bg-card border-border hover:border-primary/50 hover:bg-card/80'
                      }`}
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-sm">{template.name}</div>
                          {template.isPremium && <Crown className="w-3 h-3 text-amber-500" />}
                        </div>
                        <div className="text-xs text-muted-foreground">{template.description}</div>
                      </div>
                      {alreadyAdded && (
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Drag & Drop Modules */}
          <div className="space-y-3">
            {modules.map((module, index) => (
              <DraggableModule
                key={module.id}
                module={module}
                index={index}
                moveModule={moveModule}
                toggleModule={toggleModule}
                setSelectedModule={setSelectedModule}
                onDelete={deleteModule}
              />
            ))}
          </div>

          {modules.length === 0 && (
            <div className="text-center py-12 bg-muted/30 rounded-lg border-2 border-dashed border-border">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">Нет добавленных модулей</p>
              <button 
                onClick={() => setShowLibrary(true)}
                className="px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:shadow-lg hover:shadow-primary/20 transition-all"
              >
                Добавить первый модуль
              </button>
            </div>
          )}

          {/* Save Button */}
          {modules.length > 0 && (
            <button 
              onClick={handleSave}
              disabled={saving}
              className="w-full px-4 py-3 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Сохранение...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Сохранить конфигурацию
                </>
              )}
            </button>
          )}
        </div>

        {/* Middle Panel - Module Settings */}
        <div className="xl:col-span-4 space-y-6">
          {selectedModule ? (
            <div className="sticky top-24">
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 border-b border-border">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center flex-shrink-0">
                        {(() => {
                          const Icon = iconMap[selectedModule.icon] || Info;
                          return <Icon className="w-6 h-6 text-white" />;
                        })()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-foreground">{selectedModule.name}</h3>
                          {selectedModule.isPremium && <Crown className="w-4 h-4 text-amber-500" />}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{selectedModule.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedModule(null)}
                      className="p-1.5 hover:bg-muted rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Settings Content */}
                <div className="p-4 max-h-[calc(100vh-300px)] overflow-y-auto space-y-4">
                  {/* Basic Settings */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Название модуля
                    </label>
                    <input
                      type="text"
                      value={selectedModule.name}
                      onChange={(e) => updateModuleName(selectedModule.id, e.target.value)}
                      className="w-full px-3 py-2 bg-input-background border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                    />
                  </div>

                  {/* Display Settings */}
                  {displayFields.length > 0 && (
                    <div>
                      <button
                        onClick={() => toggleSection('display')}
                        className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                      >
                        <span className="font-medium text-sm">Отображение</span>
                        {expandedSections.display ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                      {expandedSections.display && (
                        <div className="mt-3 space-y-3">
                          {displayFields.map(field => (
                            <ModuleFieldRenderer
                              key={field.id}
                              field={field}
                              value={(selectedModule.config as any)?.[field.id]}
                              onChange={(value) => updateModuleConfig(selectedModule.id, field.id, value)}
                              allValues={selectedModule.config as any}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Feature Toggles */}
                  {featureFields.length > 0 && (
                    <div>
                      <button
                        onClick={() => toggleSection('features')}
                        className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                      >
                        <span className="font-medium text-sm">Функции ({featureFields.filter(f => (selectedModule.config as any)?.[f.id]).length}/{featureFields.length})</span>
                        {expandedSections.features ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                      {expandedSections.features && (
                        <div className="mt-3 space-y-2">
                          {featureFields.map(field => (
                            <ModuleFieldRenderer
                              key={field.id}
                              field={field}
                              value={(selectedModule.config as any)?.[field.id]}
                              onChange={(value) => updateModuleConfig(selectedModule.id, field.id, value)}
                              allValues={selectedModule.config as any}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Advanced Settings */}
                  {advancedFields.length > 0 && (
                    <div>
                      <button
                        onClick={() => toggleSection('advanced')}
                        className="w-full flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                      >
                        <span className="font-medium text-sm">Дополнительно</span>
                        {expandedSections.advanced ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                      {expandedSections.advanced && (
                        <div className="mt-3 space-y-3">
                          {advancedFields.map(field => (
                            <ModuleFieldRenderer
                              key={field.id}
                              field={field}
                              value={(selectedModule.config as any)?.[field.id]}
                              onChange={(value) => updateModuleConfig(selectedModule.id, field.id, value)}
                              allValues={selectedModule.config as any}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {selectedModuleFields.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      Нет доступных настроек для этого модуля
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="sticky top-24 bg-muted/30 rounded-xl p-8 border-2 border-dashed border-border text-center">
              <SettingsIcon className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                Выберите модуль для настройки
              </p>
            </div>
          )}
        </div>

        {/* Right Panel - Live Preview */}
        <div className="xl:col-span-3">
          <div className="sticky top-24 space-y-4">
            {/* Preview Frame */}
            <div className="bg-card rounded-xl p-6 border border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-primary" />
                  Live Preview
                </h3>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setPreviewScale(Math.max(0.7, previewScale - 0.1))}
                    className="p-1.5 hover:bg-muted rounded text-xs font-bold w-6 h-6 flex items-center justify-center"
                  >
                    -
                  </button>
                  <span className="text-xs text-muted-foreground">{Math.round(previewScale * 100)}%</span>
                  <button 
                    onClick={() => setPreviewScale(Math.min(1.2, previewScale + 0.1))}
                    className="p-1.5 hover:bg-muted rounded text-xs font-bold w-6 h-6 flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Phone Frame */}
              <div 
                className="bg-gradient-to-br from-muted to-card rounded-[2.5rem] p-3 shadow-2xl mx-auto transition-transform"
                style={{ transform: `scale(${previewScale})`, transformOrigin: 'top center' }}
              >
                <div className="bg-background rounded-[2rem] overflow-hidden h-[600px] border-2 border-border">
                  <div className="bg-gradient-to-br from-primary to-accent p-4 text-white">
                    <div className="text-lg font-bold">Мероприятие</div>
                    <div className="text-xs text-white/80">Предпросмотр</div>
                  </div>

                  <div className="p-4 space-y-4 overflow-auto h-[calc(100%-80px)]">
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 text-xs">
                      <div className="font-medium text-foreground">Добро пожаловать! 👋</div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {enabledModules.map((module) => {
                        const Icon = iconMap[module.icon as keyof typeof iconMap] || Info;
                        return (
                          <div
                            key={module.id}
                            className={`bg-card rounded-lg p-3 border transition-all ${
                              selectedModule?.id === module.id 
                                ? 'border-primary ring-2 ring-primary/20' 
                                : 'border-border hover:border-primary/50'
                            } flex flex-col items-center gap-2`}
                          >
                            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center relative">
                              <Icon className="w-4 h-4 text-white" />
                              {module.isPremium && (
                                <Crown className="w-2.5 h-2.5 text-amber-300 absolute -top-1 -right-1" />
                              )}
                            </div>
                            <div className="text-xs font-medium text-center text-foreground leading-tight">
                              {module.name}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 text-xs text-muted-foreground text-center space-y-1">
                <div>{enabledModules.length} из {modules.length} модулей активно</div>
                {selectedModule && (
                  <div className="text-primary">Выбран: {selectedModule.name}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function EventBuilderNew() {
  return (
    <DndProvider backend={HTML5Backend}>
      <EventBuilderContent />
    </DndProvider>
  );
}
