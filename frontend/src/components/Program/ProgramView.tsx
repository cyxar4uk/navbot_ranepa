import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEvent } from '../../context/EventContext'
import api from '../../services/api'
import Loading from '../common/Loading'
import ErrorMessage from '../common/ErrorMessage'
import EmptyState from '../common/EmptyState'
import EventCard from './EventCard'
import Filters from './Filters'
import type { EventItem } from '../../types'
import { Calendar, Search } from 'lucide-react'

export default function ProgramView() {
  const { event } = useEvent()
  const navigate = useNavigate()
  
  const [items, setItems] = useState<EventItem[]>([])
  const [days, setDays] = useState<string[]>([])
  const [types, setTypes] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filters
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    if (event) {
      loadData()
    }
  }, [event])

  useEffect(() => {
    if (event) {
      loadItems()
    }
  }, [selectedDay, selectedType, searchQuery])

  const loadData = async () => {
    if (!event) return
    
    try {
      setLoading(true)
      const [daysData, typesData] = await Promise.all([
        api.getEventDays(event.id),
        api.getEventTypes(event.id),
      ])
      setDays(daysData)
      setTypes(typesData)
      
      // Set first day as default
      if (daysData.length > 0 && !selectedDay) {
        setSelectedDay(daysData[0])
      }
    } catch (err) {
      console.error('Failed to load program data:', err)
      setError('Не удалось загрузить программу')
    } finally {
      setLoading(false)
    }
  }

  const loadItems = async () => {
    if (!event) return
    
    try {
      const itemsData = await api.getEventItems(event.id, {
        day: selectedDay || undefined,
        type: selectedType || undefined,
        search: searchQuery || undefined,
      })
      setItems(itemsData)
    } catch (err) {
      console.error('Failed to load items:', err)
    }
  }

  const formatDay = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      weekday: 'short',
    })
  }

  const groupItemsByTime = (items: EventItem[]) => {
    const groups: { [key: string]: EventItem[] } = {}
    
    items.forEach(item => {
      if (item.date_start) {
        const time = new Date(item.date_start).toLocaleTimeString('ru-RU', {
          hour: '2-digit',
          minute: '2-digit',
        })
        if (!groups[time]) {
          groups[time] = []
        }
        groups[time].push(item)
      }
    })
    
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]))
  }

  if (loading) {
    return <Loading text="Загрузка программы..." fullScreen />
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadData} />
  }

  const groupedItems = groupItemsByTime(items)

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white px-4 pt-6 pb-8">
        <h1 className="text-xl font-bold">Программа</h1>
        <p className="mt-1 text-primary-200 text-sm">
          {event?.title}
        </p>

        {/* Search */}
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
          <input
            type="text"
            placeholder="Поиск по названию..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-white/30"
          />
        </div>
      </div>

      {/* Days tabs */}
      {days.length > 0 && (
        <div className="sticky top-0 z-10 bg-white shadow-sm">
          <div className="flex overflow-x-auto gap-2 p-3 no-scrollbar">
            {days.map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedDay === day
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {formatDay(day)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filters button */}
      <div className="px-4 py-3">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm tg-link"
        >
          <span>Фильтры</span>
          {(selectedType) && (
            <span className="w-2 h-2 rounded-full bg-primary-500" />
          )}
        </button>

        {showFilters && (
          <Filters
            types={types}
            selectedType={selectedType}
            onTypeChange={setSelectedType}
            onReset={() => {
              setSelectedType(null)
            }}
          />
        )}
      </div>

      {/* Content */}
      <div className="px-4">
        {groupedItems.length === 0 ? (
          <EmptyState
            icon={<Calendar className="w-12 h-12" />}
            title="Нет мероприятий"
            description="На выбранную дату нет запланированных мероприятий"
          />
        ) : (
          <div className="space-y-6">
            {groupedItems.map(([time, timeItems]) => (
              <div key={time}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-lg font-semibold tg-text">{time}</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                <div className="space-y-3">
                  {timeItems.map(item => (
                    <EventCard
                      key={item.id}
                      item={item}
                      onClick={() => navigate(`/program/${item.id}`)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
