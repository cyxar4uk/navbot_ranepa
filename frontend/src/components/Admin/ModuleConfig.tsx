import { useState } from 'react'
import type { Module } from '../../types'
import { X, Save } from 'lucide-react'

interface ModuleConfigProps {
  module: Module
  onSave: (config: Record<string, unknown>) => void
  onClose: () => void
  saving: boolean
}

export default function ModuleConfig({ module, onSave, onClose, saving }: ModuleConfigProps) {
  const [config, setConfig] = useState<Record<string, unknown>>(module.config)
  const [title, setTitle] = useState(module.title)
  const [icon, setIcon] = useState(module.icon || '')

  const handleSave = () => {
    onSave(config)
  }

  const renderConfigField = (key: string, value: unknown) => {
    const type = typeof value

    if (type === 'boolean') {
      return (
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={value as boolean}
            onChange={(e) => setConfig({ ...config, [key]: e.target.checked })}
            className="w-5 h-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
          />
          <span className="text-sm tg-text">{key}</span>
        </label>
      )
    }

    if (type === 'number') {
      return (
        <div>
          <label className="text-sm font-medium tg-text">{key}</label>
          <input
            type="number"
            value={value as number}
            onChange={(e) => setConfig({ ...config, [key]: parseInt(e.target.value) || 0 })}
            className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
          />
        </div>
      )
    }

    if (type === 'string') {
      // Check if it's a select-like field
      const selectOptions: Record<string, string[]> = {
        grouping: ['day', 'track'],
        default_view: ['timeline', 'list'],
        entity_type: ['speaker', 'participant', 'partner', 'startup'],
        card_layout: ['compact', 'full'],
        map_type: ['svg', 'image'],
        open_type: ['external', 'webview'],
        content_type: ['markdown', 'html'],
        scope: ['event', 'module', 'item'],
      }

      if (selectOptions[key]) {
        return (
          <div>
            <label className="text-sm font-medium tg-text">{key}</label>
            <select
              value={value as string}
              onChange={(e) => setConfig({ ...config, [key]: e.target.value })}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            >
              {selectOptions[key].map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        )
      }

      // Text area for long strings
      if ((value as string).length > 50 || key === 'content' || key === 'url') {
        return (
          <div>
            <label className="text-sm font-medium tg-text">{key}</label>
            <textarea
              value={value as string}
              onChange={(e) => setConfig({ ...config, [key]: e.target.value })}
              rows={4}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none"
            />
          </div>
        )
      }

      return (
        <div>
          <label className="text-sm font-medium tg-text">{key}</label>
          <input
            type="text"
            value={value as string}
            onChange={(e) => setConfig({ ...config, [key]: e.target.value })}
            className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
          />
        </div>
      )
    }

    // For arrays and objects, show JSON editor
    return (
      <div>
        <label className="text-sm font-medium tg-text">{key}</label>
        <textarea
          value={JSON.stringify(value, null, 2)}
          onChange={(e) => {
            try {
              setConfig({ ...config, [key]: JSON.parse(e.target.value) })
            } catch {
              // Invalid JSON, ignore
            }
          }}
          rows={4}
          className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50 resize-none font-mono text-sm"
        />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col animate-slideUp safe-area-bottom">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-medium tg-text">Настройки модуля</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Title */}
          <div>
            <label className="text-sm font-medium tg-text">Название</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            />
          </div>

          {/* Icon */}
          <div>
            <label className="text-sm font-medium tg-text">Иконка (emoji)</label>
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              maxLength={2}
              className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
            />
          </div>

          {/* Type info */}
          <div className="p-3 rounded-lg bg-gray-50">
            <span className="text-xs font-medium tg-hint">Тип: {module.type}</span>
          </div>

          {/* Config fields */}
          <div className="border-t pt-4 space-y-4">
            <h4 className="text-sm font-medium tg-text">Конфигурация</h4>
            {Object.entries(config).map(([key, value]) => (
              <div key={key}>
                {renderConfigField(key, value)}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl tg-button font-medium disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  )
}
