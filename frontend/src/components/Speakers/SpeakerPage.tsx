import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import api from '../../services/api'
import telegram from '../../services/telegram'
import Loading from '../common/Loading'
import ErrorMessage from '../common/ErrorMessage'
import type { Speaker } from '../../types'
import { Globe, Send, Linkedin, Twitter } from 'lucide-react'

export default function SpeakerPage() {
  const { speakerId } = useParams<{ speakerId: string }>()
  
  const [speaker, setSpeaker] = useState<Speaker | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (speakerId) {
      loadSpeaker()
    }
  }, [speakerId])

  const loadSpeaker = async () => {
    if (!speakerId) return
    
    try {
      setLoading(true)
      const data = await api.getSpeaker(speakerId)
      setSpeaker(data)
    } catch (err) {
      console.error('Failed to load speaker:', err)
      setError('Не удалось загрузить информацию о спикере')
    } finally {
      setLoading(false)
    }
  }

  const openSocialLink = (url: string) => {
    telegram.openLink(url)
  }

  if (loading) {
    return <Loading text="Загрузка..." fullScreen />
  }

  if (error || !speaker) {
    return <ErrorMessage message={error || 'Спикер не найден'} onRetry={loadSpeaker} />
  }

  const socialIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    telegram: Send,
    linkedin: Linkedin,
    twitter: Twitter,
    website: Globe,
  }

  return (
    <div className="min-h-screen pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white px-4 pt-6 pb-12 text-center">
        <div className="w-24 h-24 mx-auto rounded-full bg-white/20 flex items-center justify-center text-4xl font-medium overflow-hidden">
          {speaker.photo_url ? (
            <img 
              src={speaker.photo_url} 
              alt={speaker.name}
              className="w-full h-full object-cover"
            />
          ) : (
            speaker.name[0]
          )}
        </div>
        <h1 className="mt-4 text-xl font-bold">{speaker.name}</h1>
        {speaker.position && (
          <p className="mt-1 text-primary-200">{speaker.position}</p>
        )}
        {speaker.company && (
          <p className="text-primary-200">{speaker.company}</p>
        )}
      </div>

      {/* Content */}
      <div className="px-4 py-6 -mt-6 space-y-4">
        {/* Bio */}
        {speaker.bio && (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h2 className="font-medium tg-text mb-2">О спикере</h2>
            <p className="text-sm tg-hint leading-relaxed whitespace-pre-wrap">
              {speaker.bio}
            </p>
          </div>
        )}

        {/* Social links */}
        {Object.keys(speaker.social_links).length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-4">
            <h2 className="font-medium tg-text mb-3">Социальные сети</h2>
            <div className="flex flex-wrap gap-3">
              {Object.entries(speaker.social_links).map(([platform, url]) => {
                const Icon = socialIcons[platform] || Globe
                return (
                  <button
                    key={platform}
                    onClick={() => openSocialLink(url)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 tg-text hover:bg-gray-200 transition-colors"
                  >
                    <Icon className="w-4 h-4" />
                    {platform}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
