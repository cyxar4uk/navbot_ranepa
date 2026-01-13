import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import Loading from '../common/Loading'
import ErrorMessage from '../common/ErrorMessage'
import EmptyState from '../common/EmptyState'
import EventForm from './EventForm'
import type { Event } from '../../types'
import { 
  Plus, Calendar, Settings, ChevronRight, 
  FileText, Users, Map, BarChart3, Eye, Edit,
  TrendingUp, Activity, Clock, ArrowUpRight, Zap
} from 'lucide-react'

export default function AdminDashboard() {
  const navigate = useNavigate()
  
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showEventForm, setShowEventForm] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
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

  const handleCreateEvent = async (data: Partial<Event>) => {
    try {
      setSaving(true)
      const newEvent = await api.adminCreateEvent(data)
      setEvents(prev => [...prev, newEvent])
      setShowEventForm(false)
    } catch (err) {
      console.error('Failed to create event:', err)
      alert('Не удалось создать мероприятие')
    } finally {
      setSaving(false)
    }
  }

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

  // Calculate progress for event (simplified - based on modules)
  const calculateProgress = (event: Event) => {
    // This would ideally check module completion, but for now return a default
    return 85
  }

  const stats = [
    { 
      label: 'Всего событий', 
      value: events.length.toString(), 
      icon: Calendar, 
      trend: '+12%', 
      color: 'from-primary to-accent' 
    },
    { 
      label: 'Зарегистрировано', 
      value: '997', 
      icon: Users, 
      trend: '+24%', 
      color: 'from-accent to-primary' 
    },
    { 
      label: 'Активных модулей', 
      value: '5', 
      icon: Zap, 
      trend: '+2', 
      color: 'from-primary/80 to-accent/80' 
    },
    { 
      label: 'Просмотров', 
      value: '12.4k', 
      icon: Eye, 
      trend: '+8%', 
      color: 'from-accent/80 to-primary/80' 
    }
  ]

  const quickActions = [
    {
      icon: Settings,
      label: 'Настройки события',
      description: 'Оформление, контакты и информация',
      action: () => {
        if (events.length > 0) {
          navigate(`/admin/events/${events[0].id}`)
        }
      },
      color: 'primary'
    },
    {
      icon: Zap,
      label: 'Конструктор модулей',
      description: 'Drag & drop редактор интерфейса',
      action: () => {
        if (events.length > 0) {
          navigate(`/admin/events/${events[0].id}/builder`)
        }
      },
      color: 'accent'
    },
    {
      icon: FileText,
      label: 'Управление контентом',
      description: 'Программа, спикеры, материалы',
      action: () => {
        if (events.length > 0) {
          navigate(`/admin/events/${events[0].id}`)
        }
      },
      color: 'primary'
    },
    {
      icon: BarChart3,
      label: 'Аналитика',
      description: 'Статистика и отчёты',
      action: () => {
        // Navigate to analytics when implemented
        console.log('Analytics coming soon')
      },
      color: 'accent'
    }
  ]

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 text-white px-4 pt-6 pb-8">
        <div className="flex items-center gap-2 mb-2">
          <Settings className="w-5 h-5" />
          <span className="text-sm text-gray-400">Админ-панель</span>
        </div>
        <h1 className="text-xl font-bold">Панель администратора</h1>
        <p className="mt-1 text-gray-300 text-sm">
          События РАНХиГС
        </p>
      </div>

      {/* Content */}
      <div className="px-4 py-6 -mt-4 space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.label}
                className="bg-card rounded-xl p-6 border border-border hover:border-primary/50 transition-all group"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-primary flex items-center gap-1">
                    <ArrowUpRight className="w-4 h-4" />
                    {stat.trend}
                  </span>
                </div>
                <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Быстрые действия
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon
              return (
                <button
                  key={action.label}
                  onClick={action.action}
                  className="bg-card rounded-xl p-6 border border-border hover:border-primary hover:shadow-lg hover:shadow-primary/10 transition-all text-left group"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 bg-gradient-to-br from-${action.color} to-${action.color === 'primary' ? 'accent' : 'primary'} rounded-xl group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{action.label}</h3>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* Events List */}
        {events.length === 0 ? (
          <EmptyState
            icon={<Calendar className="w-12 h-12" />}
            title="Нет мероприятий"
            description="Создайте первое мероприятие"
            action={
              <button
                onClick={() => setShowEventForm(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg tg-button"
              >
                <Plus className="w-4 h-4" />
                Создать мероприятие
              </button>
            }
          />
        ) : (
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              События
            </h2>
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              {events.map((event) => {
                const progress = calculateProgress(event)
                return (
                  <div
                    key={event.id}
                    className="p-6 hover:bg-muted/20 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-foreground">{event.title}</h3>
                          <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-medium rounded-full flex items-center gap-1">
                            <Activity className="w-3 h-3" />
                            {event.status === 'active' ? 'Активно' : event.status === 'upcoming' ? 'Предстоящее' : 'Завершено'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatDate(event.date_start)} – {formatDate(event.date_end)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            997 участников
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Готовность</span>
                            <span className="text-foreground font-medium">{progress}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-1000"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => navigate(`/program/${event.id}`)}
                        className="px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors flex items-center gap-2 text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        Предпросмотр
                      </button>
                      <button
                        onClick={() => navigate(`/admin/events/${event.id}/builder`)}
                        className="px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg hover:shadow-lg hover:shadow-primary/20 transition-all flex items-center gap-2 text-sm"
                      >
                        <Edit className="w-4 h-4" />
                        Редактировать
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setShowEventForm(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-primary to-accent text-white shadow-lg flex items-center justify-center hover:shadow-xl hover:shadow-primary/20 transition-all"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Event Form Modal */}
      {showEventForm && (
        <EventForm
          onSave={handleCreateEvent}
          onClose={() => setShowEventForm(false)}
          saving={saving}
        />
      )}
    </div>
  )
}
