import { useState, useEffect } from 'react'
import { useEvent } from '../../context/EventContext'
import api from '../../services/api'
import Loading from '../common/Loading'
import ErrorMessage from '../common/ErrorMessage'
import EmptyState from '../common/EmptyState'
import type { News } from '../../types'
import { Newspaper } from 'lucide-react'

export default function NewsView() {
  const { event } = useEvent()
  
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    if (event) {
      loadNews()
    }
  }, [event])

  const loadNews = async () => {
    if (!event) return
    
    try {
      setLoading(true)
      const data = await api.getEventNews(event.id)
      setNews(data)
    } catch (err) {
      console.error('Failed to load news:', err)
      setError('Не удалось загрузить новости')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return <Loading text="Загрузка новостей..." fullScreen />
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={loadNews} />
  }

  return (
    <div className="min-h-screen pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white px-4 pt-6 pb-8">
        <h1 className="text-xl font-bold">Новости</h1>
        <p className="mt-1 text-primary-200 text-sm">
          {news.length} новостей
        </p>
      </div>

      {/* Content */}
      <div className="px-4 py-6 -mt-4">
        {news.length === 0 ? (
          <EmptyState
            icon={<Newspaper className="w-12 h-12" />}
            title="Нет новостей"
            description="Новости пока не добавлены"
          />
        ) : (
          <div className="space-y-4">
            {news.map(item => (
              <article
                key={item.id}
                className="bg-white rounded-xl shadow-sm overflow-hidden"
              >
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h2 className="font-medium tg-text">{item.title}</h2>
                  {item.published_at && (
                    <p className="mt-1 text-sm tg-hint">
                      {formatDate(item.published_at)}
                    </p>
                  )}
                  {item.content && (
                    <div className="mt-3">
                      <p className={`text-sm tg-hint ${expandedId !== item.id ? 'line-clamp-3' : ''}`}>
                        {item.content}
                      </p>
                      {item.content.length > 150 && (
                        <button
                          onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                          className="mt-2 text-sm tg-link"
                        >
                          {expandedId === item.id ? 'Свернуть' : 'Читать далее'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
