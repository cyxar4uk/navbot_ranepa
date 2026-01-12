import { useEvent } from '../../context/EventContext'
import { useUser } from '../../context/UserContext'
import Loading from '../common/Loading'
import ErrorMessage from '../common/ErrorMessage'
import ModuleGrid from './ModuleGrid'
import { Settings } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function Dashboard() {
  const { event, modules, loading, error, refreshEvent } = useEvent()
  const { isAdmin } = useUser()
  const navigate = useNavigate()

  if (loading) {
    return <Loading text="Загрузка мероприятия..." fullScreen />
  }

  if (error || !event) {
    return (
      <ErrorMessage 
        message={error || 'Мероприятие не найдено'} 
        onRetry={refreshEvent} 
      />
    )
  }

  const formatDateRange = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const options: Intl.DateTimeFormatOptions = { 
      day: 'numeric', 
      month: 'long' 
    }
    
    if (startDate.getMonth() === endDate.getMonth()) {
      return `${startDate.getDate()}–${endDate.toLocaleDateString('ru-RU', options)}`
    }
    
    return `${startDate.toLocaleDateString('ru-RU', options)} – ${endDate.toLocaleDateString('ru-RU', options)}`
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white px-4 pt-6 pb-8">
        {/* Admin button */}
        {isAdmin && (
          <button
            onClick={() => navigate('/admin')}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        )}

        {/* Event info */}
        <div className="text-center">
          <h1 className="text-2xl font-bold leading-tight">
            {event.title}
          </h1>
          <p className="mt-2 text-primary-200 text-sm">
            {formatDateRange(event.date_start, event.date_end)}
          </p>
          {event.location && (
            <p className="mt-1 text-primary-200 text-sm">
              📍 {event.location}
            </p>
          )}
        </div>

        {/* Status badge */}
        {event.status === 'active' && (
          <div className="mt-4 flex justify-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/20 text-green-300 text-sm">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Идёт сейчас
            </span>
          </div>
        )}
      </div>

      {/* Modules Grid */}
      <div className="px-4 py-6 -mt-4">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <ModuleGrid modules={modules} />
        </div>
      </div>

      {/* Event description */}
      {event.description && (
        <div className="px-4 pb-6">
          <div className="p-4 rounded-xl tg-secondary">
            <p className="text-sm tg-hint leading-relaxed">
              {event.description}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
