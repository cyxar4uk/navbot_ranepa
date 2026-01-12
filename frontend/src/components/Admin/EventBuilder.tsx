import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useUser } from '../../context/UserContext'
import api from '../../services/api'
import Loading from '../common/Loading'
import ErrorMessage from '../common/ErrorMessage'
import ModuleConfig from './ModuleConfig'
import type { Event, Module, ModuleTypeDefinition } from '../../types'
import { 
  Save, Plus, GripVertical, ToggleLeft, ToggleRight, 
  Trash2, Settings, ChevronDown, ChevronUp 
} from 'lucide-react'

export default function EventBuilder() {
  const { eventId } = useParams<{ eventId: string }>()
  const { isAdmin } = useUser()
  const navigate = useNavigate()
  
  const [event, setEvent] = useState<Event | null>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [moduleTypes, setModuleTypes] = useState<ModuleTypeDefinition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [selectedModule, setSelectedModule] = useState<Module | null>(null)
  const [showAddModule, setShowAddModule] = useState(false)

  useEffect(() => {
    if (eventId && isAdmin) {
      loadData()
    }
  }, [eventId, isAdmin])

  const loadData = async () => {
    if (!eventId) return
    
    try {
      setLoading(true)
      const [eventData, modulesData, typesData] = await Promise.all([
        api.getEvent(eventId),
        api.adminGetEventModules(eventId),
        api.adminGetModuleTypes(),
      ])
      setEvent(eventData)
      setModules(modulesData)
      setModuleTypes(typesData)
    } catch (err) {
      console.error('Failed to load data:', err)
      setError('Не удалось загрузить данные')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleModule = async (module: Module) => {
    try {
      const updated = await api.updateModule(module.id, {
        enabled: !module.enabled,
      })
      setModules(prev =>
        prev.map(m => (m.id === module.id ? updated : m))
      )
    } catch (err) {
      console.error('Failed to toggle module:', err)
    }
  }

  const handleDeleteModule = async (moduleId: string) => {
    if (!confirm('Удалить модуль?')) return
    
    try {
      await api.deleteModule(moduleId)
      setModules(prev => prev.filter(m => m.id !== moduleId))
    } catch (err) {
      console.error('Failed to delete module:', err)
    }
  }

  const handleAddModule = async (type: string) => {
    if (!eventId) return
    
    const typeInfo = moduleTypes.find(t => t.type === type)
    if (!typeInfo) return
    
    try {
      const module = await api.createModule({
        event_id: eventId,
        type: type,
        title: typeInfo.name,
        config: typeInfo.default_config,
      })
      setModules(prev => [...prev, module])
      setShowAddModule(false)
    } catch (err) {
      console.error('Failed to add module:', err)
    }
  }

  const handleMoveModule = async (index: number, direction: 'up' | 'down') => {
    if (!eventId) return
    
    const newIndex = direction === 'up' ? index - 1 : index + 1
    if (newIndex < 0 || newIndex >= modules.length) return
    
    const newModules = [...modules]
    const [removed] = newModules.splice(index, 1)
    newModules.splice(newIndex, 0, removed)
    
    setModules(newModules)
    
    try {
      await api.reorderModules(eventId, newModules.map(m => m.id))
    } catch (err) {
      console.error('Failed to reorder modules:', err)
      loadData() // Reload on error
    }
  }

  const handleSaveConfig = async (moduleId: string, config: Record<string, unknown>) => {
    try {
      setSaving(true)
      const updated = await api.updateModule(moduleId, { config })
      setModules(prev =>
        prev.map(m => (m.id === moduleId ? updated : m))
      )
      setSelectedModule(null)
    } catch (err) {
      console.error('Failed to save config:', err)
    } finally {
      setSaving(false)
    }
  }

  if (!isAdmin) {
    return <ErrorMessage message="Доступ запрещён" />
  }

  if (loading) {
    return <Loading text="Загрузка..." fullScreen />
  }

  if (error || !event) {
    return <ErrorMessage message={error || 'Мероприятие не найдено'} onRetry={loadData} />
  }

  return (
    <div className="min-h-screen pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-white px-4 pt-6 pb-8">
        <div className="flex items-center gap-2 mb-2">
          <Settings className="w-5 h-5" />
          <span className="text-sm text-gray-400">Event Builder</span>
        </div>
        <h1 className="text-xl font-bold">{event.title}</h1>
      </div>

      {/* Modules */}
      <div className="px-4 py-6 -mt-4">
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-medium tg-text">Модули ({modules.length})</h2>
            <button
              onClick={() => setShowAddModule(!showAddModule)}
              className="flex items-center gap-1 text-sm tg-link"
            >
              <Plus className="w-4 h-4" />
              Добавить
            </button>
          </div>

          {/* Add module dropdown */}
          {showAddModule && (
            <div className="p-4 bg-gray-50 border-b">
              <p className="text-sm tg-hint mb-3">Выберите тип модуля:</p>
              <div className="grid grid-cols-2 gap-2">
                {moduleTypes.map(type => (
                  <button
                    key={type.type}
                    onClick={() => handleAddModule(type.type)}
                    className="p-3 rounded-lg bg-white text-left hover:bg-gray-100 transition-colors"
                  >
                    <div className="font-medium text-sm tg-text">{type.name}</div>
                    <div className="text-xs tg-hint mt-0.5">{type.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Modules list */}
          {modules.length === 0 ? (
            <div className="p-8 text-center">
              <p className="tg-hint">Нет модулей</p>
            </div>
          ) : (
            <div className="divide-y">
              {modules.map((module, index) => (
                <div
                  key={module.id}
                  className={`p-4 flex items-center gap-3 ${!module.enabled ? 'opacity-50' : ''}`}
                >
                  {/* Drag handle */}
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleMoveModule(index, 'up')}
                      disabled={index === 0}
                      className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleMoveModule(index, 'down')}
                      disabled={index === modules.length - 1}
                      className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Module info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {module.icon && <span>{module.icon}</span>}
                      <span className="font-medium tg-text truncate">{module.title}</span>
                    </div>
                    <span className="text-xs tg-hint">{module.type}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedModule(module)}
                      className="p-2 rounded-lg hover:bg-gray-100"
                      title="Настройки"
                    >
                      <Settings className="w-4 h-4 tg-hint" />
                    </button>
                    <button
                      onClick={() => handleToggleModule(module)}
                      className="p-2 rounded-lg hover:bg-gray-100"
                      title={module.enabled ? 'Выключить' : 'Включить'}
                    >
                      {module.enabled ? (
                        <ToggleRight className="w-5 h-5 text-green-500" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 tg-hint" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeleteModule(module.id)}
                      className="p-2 rounded-lg hover:bg-red-50"
                      title="Удалить"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Module config modal */}
      {selectedModule && (
        <ModuleConfig
          module={selectedModule}
          onSave={(config) => handleSaveConfig(selectedModule.id, config)}
          onClose={() => setSelectedModule(null)}
          saving={saving}
        />
      )}
    </div>
  )
}
