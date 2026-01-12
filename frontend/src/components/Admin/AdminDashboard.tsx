import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import Loading from '../common/Loading'
import ErrorMessage from '../common/ErrorMessage'
import EmptyState from '../common/EmptyState'
import type { Event } from '../../types'
import { Plus, Calendar, Settings, ChevronRight, Shield } from 'lucide-react'

export default function AdminDashboard() {
  const navigate = useNavigate()
  
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Подхватить токен из localStorage
    api.setTokenFromStorage()
    const token = localStorage.getItem('admin_token')
    if (!token) {
      navigate('/admin/login')
      return
    }
    loadEvents()
  }, [navigate])

  const loadEvents = async () => {
    try {
      setLoading(true)
      const { items } = await api.adminGetEvents()
      setEvents(items)
    } catch (err) {
      console.error('Failed to load events:', err)
      setError('Не удалось загрузить мероприятия')
    } finally {
      setLoading(false)
    }
  }

  // Если токена нет, будет редирект, а пока можно отобразить загрузку
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null
  if (!token) {
    return <Loading text="Проверка доступа..." fullScreen />
  }

  if (loading) {
    return <Loading text="Загрузка..." fullScreen />
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadEvents} />
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      upcoming: 'bg-blue-100 text-blue-700',
      active: 'bg-green-100 text-green-700',
      finished: 'bg-gray-100 text-gray-700',
    }
    const labels: Record<string, string> = {
      upcoming: 'Предстоящее',
      active: 'Активное',
      finished: 'Завершено',
    }
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-medium ${styles[status] || styles.upcoming}`}>
        {labels[status] || status}
      </span>
    )
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-white px-4 pt-6 pb-8">
        <div className="flex items-center gap-2 mb-2">
          <Settings className="w-5 h-5" />
          <span className="text-sm text-gray-400">Админ-панель</span>
        </div>
        <h1 className="text-xl font-bold">Управление мероприятиями</h1>
        <p className="mt-1 text-gray-300 text-sm">
          {events.length} мероприятий
        </p>
      </div>

      {/* Content */}
      <div className="px-4 py-6 -mt-4">
        {events.length === 0 ? (
          <EmptyState
            icon={<Calendar className="w-12 h-12" />}
            title="Нет мероприятий"
            description="Создайте первое мероприятие"
            action={
              <button
                onClick={() => {/* TODO: Open create modal */}}
                className="flex items-center gap-2 px-4 py-2 rounded-lg tg-button"
              >
                <Plus className="w-4 h-4" />
                Создать мероприятие
              </button>
            }
          />
        ) : (
          <div className="space-y-3">
            {events.map(event => (
              <button
                key={event.id}
                onClick={() => navigate(`/admin/events/${event.id}`)}
                className="w-full flex items-center justify-between p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow text-left"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {getStatusBadge(event.status)}
                  </div>
                  <h3 className="font-medium tg-text truncate">{event.title}</h3>
                  <p className="text-sm tg-hint">
                    {formatDate(event.date_start)} – {formatDate(event.date_end)}
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 tg-hint flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => {/* TODO: Open create modal */}}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary-500 text-white shadow-lg flex items-center justify-center hover:bg-primary-600 transition-colors"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  )
}
