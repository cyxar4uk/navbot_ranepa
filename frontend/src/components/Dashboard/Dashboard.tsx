import { useEvent } from '../../context/EventContext'
import { useUser } from '../../context/UserContext'
import Loading from '../common/Loading'
import ErrorMessage from '../common/ErrorMessage'
import { motion } from 'motion/react'
import { Calendar, MapPin, Settings, Bell, ChevronRight, Sparkles, Mic, Send, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import type { Module } from '../../types'

export default function Dashboard() {
  const { event, modules, loading, error, refreshEvent } = useEvent()
  const { isAdmin } = useUser()
  const navigate = useNavigate()
  const [aiInput, setAiInput] = useState('')

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
      month: 'long',
      year: 'numeric'
    }
    
    if (startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear()) {
      return `${startDate.getDate()}–${endDate.toLocaleDateString('ru-RU', options)}`
    }
    
    return `${startDate.toLocaleDateString('ru-RU', options)} – ${endDate.toLocaleDateString('ru-RU', options)}`
  }

  const getModuleRoute = (module: Module) => {
    switch (module.type) {
      case 'program':
      case 'event_list':
        return '/program'
      case 'map':
        return '/map'
      case 'assistant':
        return '/assistant'
      case 'news':
        return '/news'
      case 'custom_page':
        return `/page/${module.id}`
      default:
        return '#'
    }
  }

  const getModuleIcon = (icon: string | null) => {
    // Map icon strings to Lucide icons
    const iconMap: Record<string, any> = {
      Calendar,
      Users,
      Map: MapPin,
      MessageCircle: Sparkles,
      Briefcase: Sparkles,
      Info: Sparkles,
    }
    return iconMap[icon || ''] || Sparkles
  }

  const enabledModules = modules
    .filter((m) => m.enabled)
    .sort((a, b) => a.order - b.order)
    .slice(0, 4) // Show max 4 modules

  const quickQuestions = [
    "Где кофе-брейк?",
    "Расписание спикера?",
    "Как добраться?",
    "Где туалет?"
  ]

  const handleModuleClick = (module: Module) => {
    const route = getModuleRoute(module)
    if (route !== '#') {
      navigate(route)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section with Event Cover */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative h-64 md:h-72 overflow-hidden"
      >
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-background">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800')] bg-cover bg-center opacity-20" />
        </div>
        
        {/* Content */}
        <div className="relative h-full px-4 md:px-6 pt-6 md:pt-8 pb-6 flex flex-col justify-between">
          {/* Top Bar */}
          <div className="flex justify-between items-start">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex gap-2"
            >
              {isAdmin && (
                <button
                  onClick={() => navigate('/admin')}
                  className="p-2.5 rounded-xl bg-card/80 backdrop-blur-sm hover:bg-primary/20 transition-colors"
                >
                  <Settings className="w-5 h-5 text-foreground" />
                </button>
              )}
              <button className="p-2.5 rounded-xl bg-card/80 backdrop-blur-sm hover:bg-primary/20 transition-colors">
                <Bell className="w-5 h-5 text-foreground" />
              </button>
            </motion.div>
          </div>

          {/* Event Title & Date */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2 tracking-tight leading-tight">
              {event.title.toUpperCase()}
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatDateRange(event.date_start, event.date_end).toUpperCase()}
              </span>
              {event.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {event.location.toUpperCase()}
                </span>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Modules Grid */}
      <div className="px-4 md:px-6 mb-6 -mt-6">
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {enabledModules.map((module, idx) => {
            const Icon = getModuleIcon(module.icon)
            const colors = [
              'from-primary to-accent',
              'from-accent to-primary',
              'from-primary to-destructive',
              'from-destructive to-primary'
            ]
            
            return (
              <motion.button
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + idx * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleModuleClick(module)}
                className="group relative"
              >
                <div className="bg-card rounded-2xl p-4 md:p-6 border border-border hover:border-primary/50 transition-all h-full">
                  {/* Gradient Icon Background */}
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br ${colors[idx % colors.length]} mb-3 md:mb-4 flex items-center justify-center shadow-lg`}>
                    <Icon className="w-6 h-6 md:w-7 md:h-7 text-white" strokeWidth={2} />
                  </div>
                  
                  {/* Text */}
                  <div className="text-left">
                    <h3 className="text-sm md:text-base font-semibold text-foreground mb-1 line-clamp-2">
                      {module.title}
                    </h3>
                    {module.badge_value && (
                      <p className="text-xs md:text-sm text-muted-foreground">
                        {module.badge_value}
                      </p>
                    )}
                  </div>

                  {/* Arrow indicator */}
                  <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground absolute top-3 md:top-4 right-3 md:right-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* AI Assistant Panel */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-auto bg-card border-t border-border px-4 md:px-6 py-4 md:py-6"
      >
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg flex-shrink-0">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm md:text-base font-semibold text-foreground">AI-помощник</h3>
              <p className="text-xs text-muted-foreground">Спросите что угодно о мероприятии</p>
            </div>
          </div>

          {/* Quick Questions */}
          <div className="flex flex-wrap gap-2 mb-4">
            {quickQuestions.map((question, idx) => (
              <motion.button
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.7 + idx * 0.05 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/assistant')}
                className="px-3 py-1.5 bg-muted hover:bg-primary/10 rounded-full text-xs text-foreground border border-border hover:border-primary/50 transition-all"
              >
                {question}
              </motion.button>
            ))}
          </div>

          {/* Input Field */}
          <div className="relative">
            <input
              type="text"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              onFocus={() => navigate('/assistant')}
              placeholder="Задайте свой вопрос..."
              className="w-full px-4 py-3 pr-20 md:pr-24 bg-input-background border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
            
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
              <button
                onClick={() => navigate('/assistant')}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
                aria-label="Голосовой ввод"
              >
                <Mic className="w-4 h-4 text-muted-foreground" />
              </button>
              <button
                onClick={() => navigate('/assistant')}
                className="p-2 bg-primary hover:bg-accent rounded-lg transition-colors"
                aria-label="Отправить"
              >
                <Send className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
