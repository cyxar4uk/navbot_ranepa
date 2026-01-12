import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEvent } from '../../context/EventContext'
import api from '../../services/api'
import Loading from '../common/Loading'
import ErrorMessage from '../common/ErrorMessage'
import EmptyState from '../common/EmptyState'
import type { Speaker } from '../../types'
import { Users, Search } from 'lucide-react'

export default function SpeakersView() {
  const { event } = useEvent()
  const navigate = useNavigate()
  
  const [speakers, setSpeakers] = useState<Speaker[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (event) {
      loadSpeakers()
    }
  }, [event])

  const loadSpeakers = async () => {
    if (!event) return
    
    try {
      setLoading(true)
      const data = await api.getEventSpeakers(event.id)
      setSpeakers(data)
    } catch (err) {
      console.error('Failed to load speakers:', err)
      setError('Не удалось загрузить спикеров')
    } finally {
      setLoading(false)
    }
  }

  const filteredSpeakers = speakers.filter(speaker =>
    speaker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    speaker.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    speaker.position?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return <Loading text="Загрузка спикеров..." fullScreen />
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadSpeakers} />
  }

  return (
    <div className="min-h-screen pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white px-4 pt-6 pb-8">
        <h1 className="text-xl font-bold">Спикеры</h1>
        <p className="mt-1 text-primary-200 text-sm">
          {speakers.length} спикеров
        </p>

        {/* Search */}
        <div className="mt-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-primary-400" />
          <input
            type="text"
            placeholder="Поиск спикера..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-white/30"
          />
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 -mt-4">
        {filteredSpeakers.length === 0 ? (
          <EmptyState
            icon={<Users className="w-12 h-12" />}
            title="Спикеры не найдены"
            description={searchQuery ? 'Попробуйте изменить запрос' : 'Спикеры пока не добавлены'}
          />
        ) : (
          <div className="grid gap-3">
            {filteredSpeakers.map(speaker => (
              <button
                key={speaker.id}
                onClick={() => navigate(`/speakers/${speaker.id}`)}
                className="flex items-center gap-4 p-4 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow text-left"
              >
                <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-2xl font-medium text-primary-600 flex-shrink-0">
                  {speaker.photo_url ? (
                    <img 
                      src={speaker.photo_url} 
                      alt={speaker.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    speaker.name[0]
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-medium tg-text truncate">{speaker.name}</div>
                  {speaker.position && (
                    <div className="text-sm tg-hint truncate">{speaker.position}</div>
                  )}
                  {speaker.company && (
                    <div className="text-sm tg-hint truncate">{speaker.company}</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
