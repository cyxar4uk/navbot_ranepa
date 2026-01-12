import type { EventItem } from '../../types'
import { MapPin, Users, ChevronRight } from 'lucide-react'

interface EventCardProps {
  item: EventItem
  onClick: () => void
  compact?: boolean
}

export default function EventCard({ item, onClick, compact = false }: EventCardProps) {
  const formatTime = (dateStr: string | null, endDateStr: string | null) => {
    if (!dateStr) return ''
    
    const start = new Date(dateStr)
    const time = start.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    })
    
    if (endDateStr) {
      const end = new Date(endDateStr)
      const endTime = end.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
      })
      return `${time} – ${endTime}`
    }
    
    return time
  }

  const getTypeColor = (type: string | null) => {
    const colors: Record<string, string> = {
      'lecture': 'bg-blue-100 text-blue-700',
      'workshop': 'bg-purple-100 text-purple-700',
      'networking': 'bg-green-100 text-green-700',
      'culture': 'bg-pink-100 text-pink-700',
      'sport': 'bg-orange-100 text-orange-700',
    }
    return colors[type || ''] || 'bg-gray-100 text-gray-700'
  }

  if (compact) {
    return (
      <button
        onClick={onClick}
        className="w-full text-left p-3 rounded-lg tg-secondary hover:bg-gray-100 transition-colors"
      >
        <div className="font-medium tg-text line-clamp-1">{item.title}</div>
        <div className="mt-1 text-sm tg-hint">
          {formatTime(item.date_start, item.date_end)}
        </div>
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 rounded-xl bg-white shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Type badge */}
          {item.type && (
            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-2 ${getTypeColor(item.type)}`}>
              {item.type}
            </span>
          )}
          
          {/* Title */}
          <h3 className="font-medium tg-text leading-snug">
            {item.title}
          </h3>
          
          {/* Description */}
          {item.description && (
            <p className="mt-1 text-sm tg-hint line-clamp-2">
              {item.description}
            </p>
          )}
          
          {/* Meta info */}
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm tg-hint">
            {/* Time */}
            <span>
              {formatTime(item.date_start, item.date_end)}
            </span>
            
            {/* Location */}
            {item.location_name && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                {item.location_name}
              </span>
            )}
            
            {/* Capacity */}
            {item.capacity !== null && (
              <span className={`flex items-center gap-1 ${item.is_full ? 'text-red-500' : ''}`}>
                <Users className="w-3.5 h-3.5" />
                {item.is_full ? 'Мест нет' : `${item.available_spots} мест`}
              </span>
            )}
          </div>
          
          {/* Speakers */}
          {item.speakers && item.speakers.length > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <div className="flex -space-x-2">
                {item.speakers.slice(0, 3).map((speaker, index) => (
                  <div
                    key={speaker.id || index}
                    className="w-6 h-6 rounded-full bg-primary-100 border-2 border-white flex items-center justify-center text-xs font-medium text-primary-600"
                    title={speaker.name}
                  >
                    {speaker.name[0]}
                  </div>
                ))}
              </div>
              <span className="text-sm tg-hint">
                {item.speakers.map(s => s.name).join(', ')}
              </span>
            </div>
          )}
        </div>
        
        <ChevronRight className="w-5 h-5 tg-hint flex-shrink-0" />
      </div>
    </button>
  )
}
