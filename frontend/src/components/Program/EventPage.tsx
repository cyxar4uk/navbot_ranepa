import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import telegram from '../../services/telegram'
import Loading from '../common/Loading'
import ErrorMessage from '../common/ErrorMessage'
import type { EventItem } from '../../types'
import { Calendar, Clock, MapPin, Users, MessageCircle } from 'lucide-react'

export default function EventPage() {
  const { itemId } = useParams<{ itemId: string }>()
  const navigate = useNavigate()
  
  const [item, setItem] = useState<EventItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [registering, setRegistering] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)

  useEffect(() => {
    if (itemId) {
      loadItem()
      checkRegistration()
    }
  }, [itemId])

  const loadItem = async () => {
    if (!itemId) return
    
    try {
      setLoading(true)
      const data = await api.getEventItem(itemId)
      setItem(data)
    } catch (err) {
      console.error('Failed to load event item:', err)
      setError('Не удалось загрузить мероприятие')
    } finally {
      setLoading(false)
    }
  }

  const checkRegistration = async () => {
    if (!itemId) return
    
    try {
      const { registered } = await api.checkRegistration(itemId)
      setIsRegistered(registered)
    } catch (err) {
      console.error('Failed to check registration:', err)
    }
  }

  const handleRegister = async () => {
    if (!itemId || !item) return
    
    setRegistering(true)
    try {
      if (isRegistered) {
        await api.cancelRegistration(itemId)
        telegram.hapticNotification('success')
        telegram.showAlert('Регистрация отменена')
        setIsRegistered(false)
      } else {
        await api.registerForItem(itemId)
        telegram.hapticNotification('success')
        telegram.showAlert('Вы успешно записались!')
        setIsRegistered(true)
      }
      loadItem() // Refresh to update count
    } catch (err: any) {
      telegram.hapticNotification('error')
      telegram.showAlert(err.message || 'Произошла ошибка')
    } finally {
      setRegistering(false)
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('ru-RU', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return <Loading text="Загрузка..." fullScreen />
  }

  if (error || !item) {
    return <ErrorMessage message={error || 'Мероприятие не найдено'} onRetry={loadItem} />
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white px-4 pt-6 pb-8">
        {item.type && (
          <span className="inline-block px-3 py-1 rounded-full bg-white/20 text-sm mb-3">
            {item.type}
          </span>
        )}
        <h1 className="text-xl font-bold leading-tight">
          {item.title}
        </h1>
      </div>

      {/* Content */}
      <div className="px-4 py-6 -mt-4 space-y-4">
        {/* Info cards */}
        <div className="bg-white rounded-xl shadow-sm divide-y">
          {/* Date */}
          {item.date_start && (
            <div className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <div className="text-sm tg-hint">Дата</div>
                <div className="font-medium tg-text">{formatDate(item.date_start)}</div>
              </div>
            </div>
          )}

          {/* Time */}
          {item.date_start && (
            <div className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                <Clock className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <div className="text-sm tg-hint">Время</div>
                <div className="font-medium tg-text">
                  {formatTime(item.date_start)}
                  {item.date_end && ` – ${formatTime(item.date_end)}`}
                </div>
              </div>
            </div>
          )}

          {/* Location */}
          {item.location_name && (
            <div className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <div className="text-sm tg-hint">Место проведения</div>
                <div className="font-medium tg-text">{item.location_name}</div>
              </div>
            </div>
          )}

          {/* Capacity */}
          {item.capacity !== null && (
            <div className="flex items-center gap-4 p-4">
              <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
                <Users className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <div className="text-sm tg-hint">Места</div>
                <div className={`font-medium ${item.is_full ? 'text-red-500' : 'tg-text'}`}>
                  {item.available_spots} из {item.capacity} свободно
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        {item.description && (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h2 className="font-medium tg-text mb-2">Описание</h2>
            <p className="text-sm tg-hint leading-relaxed whitespace-pre-wrap">
              {item.description}
            </p>
          </div>
        )}

        {/* Speakers */}
        {item.speakers && item.speakers.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h2 className="font-medium tg-text mb-3">Спикеры</h2>
            <div className="space-y-3">
              {item.speakers.map((speaker, index) => (
                <div key={speaker.id || index} className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-lg font-medium text-primary-600">
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
                  <div>
                    <div className="font-medium tg-text">{speaker.name}</div>
                    {(speaker.position || speaker.company) && (
                      <div className="text-sm tg-hint">
                        {[speaker.position, speaker.company].filter(Boolean).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ask assistant button */}
        <button
          onClick={() => navigate(`/assistant?item=${item.id}`)}
          className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border border-gray-200 tg-text hover:bg-gray-50 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          Задать вопрос ассистенту
        </button>
      </div>

      {/* Register button */}
      {item.capacity !== null && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t safe-area-bottom">
          <button
            onClick={handleRegister}
            disabled={registering || (item.is_full && !isRegistered)}
            className={`w-full py-3 rounded-xl font-medium transition-colors ${
              isRegistered
                ? 'bg-red-500 text-white'
                : item.is_full
                  ? 'bg-gray-200 text-gray-500'
                  : 'tg-button'
            }`}
          >
            {registering
              ? 'Загрузка...'
              : isRegistered
                ? 'Отменить запись'
                : item.is_full
                  ? 'Мест нет'
                  : 'Записаться'
            }
          </button>
        </div>
      )}
    </div>
  )
}
