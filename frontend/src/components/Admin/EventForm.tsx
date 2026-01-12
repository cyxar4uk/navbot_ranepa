import { useState } from 'react'
import type { Event } from '../../types'
import { X, Save, Calendar } from 'lucide-react'

interface EventFormProps {
  event?: Event | null
  onSave: (data: Partial<Event>) => Promise<void>
  onClose: () => void
  saving: boolean
}

export default function EventForm({ event, onSave, onClose, saving }: EventFormProps) {
  const [title, setTitle] = useState(event?.title || '')
  const [description, setDescription] = useState(event?.description || '')
  const [dateStart, setDateStart] = useState(
    event?.date_start ? new Date(event.date_start).toISOString().slice(0, 16) : ''
  )
  const [dateEnd, setDateEnd] = useState(
    event?.date_end ? new Date(event.date_end).toISOString().slice(0, 16) : ''
  )
  const [location, setLocation] = useState(event?.location || '')
  const [status, setStatus] = useState(event?.status || 'upcoming')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!title || !dateStart || !dateEnd) {
      alert('Заполните обязательные поля')
      return
    }

    await onSave({
      title,
      description: description || undefined,
      date_start: new Date(dateStart).toISOString(),
      date_end: new Date(dateEnd).toISOString(),
      location: location || undefined,
      status,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
      <div className="w-full sm:max-w-2xl bg-white rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            <h3 className="font-medium text-lg">
              {event ? 'Редактировать мероприятие' : 'Создать мероприятие'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Название <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Название мероприятия"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Описание мероприятия"
            />
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Дата начала <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={dateStart}
                onChange={(e) => setDateStart(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Дата окончания <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={dateEnd}
                onChange={(e) => setDateEnd(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Место проведения</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Академия РАНЕПА"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Статус</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'upcoming' | 'active' | 'finished')}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="upcoming">Предстоящее</option>
              <option value="active">Активное</option>
              <option value="finished">Завершено</option>
            </select>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-gray-300 font-medium hover:bg-gray-50"
          >
            Отмена
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  )
}
