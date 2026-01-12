import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../../services/api'
import Loading from '../common/Loading'
import ErrorMessage from '../common/ErrorMessage'
import type { Module } from '../../types'

export default function CustomPage() {
  const { moduleId } = useParams<{ moduleId: string }>()
  
  const [module, setModule] = useState<Module | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (moduleId) {
      loadModule()
    }
  }, [moduleId])

  const loadModule = async () => {
    if (!moduleId) return
    
    try {
      setLoading(true)
      const data = await api.getModule(moduleId)
      setModule(data)
    } catch (err) {
      console.error('Failed to load module:', err)
      setError('Не удалось загрузить страницу')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loading text="Загрузка..." fullScreen />
  }

  if (error || !module) {
    return <ErrorMessage message={error || 'Страница не найдена'} onRetry={loadModule} />
  }

  const config = module.config as { content?: string; content_type?: string }
  const content = config.content || ''
  const contentType = config.content_type || 'markdown'

  return (
    <div className="min-h-screen pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white px-4 pt-6 pb-8">
        <h1 className="text-xl font-bold">{module.title}</h1>
      </div>

      {/* Content */}
      <div className="px-4 py-6 -mt-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          {contentType === 'html' ? (
            <div 
              className="prose prose-sm max-w-none tg-text"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            <div className="prose prose-sm max-w-none tg-text whitespace-pre-wrap">
              {content}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
