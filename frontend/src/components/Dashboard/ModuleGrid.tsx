import { useNavigate } from 'react-router-dom'
import type { Module, ModuleType } from '../../types'
import telegram from '../../services/telegram'
import {
  Calendar,
  Map,
  Users,
  MessageCircle,
  FileText,
  Newspaper,
  Mail,
  ExternalLink,
  HelpCircle,
  Clipboard,
} from 'lucide-react'

interface ModuleGridProps {
  modules: Module[]
}

const moduleIcons: Record<ModuleType, React.ComponentType<{ className?: string }>> = {
  program: Calendar,
  map: Map,
  event_list: Users,
  assistant: MessageCircle,
  custom_page: FileText,
  news: Newspaper,
  messages: Mail,
  external_link: ExternalLink,
  registration: Clipboard,
}

const moduleRoutes: Record<ModuleType, string | ((module: Module) => string)> = {
  program: '/program',
  map: '/map',
  event_list: '/speakers',
  assistant: '/assistant',
  custom_page: (module) => `/page/${module.id}`,
  news: '/news',
  messages: '/messages',
  external_link: '', // handled separately
  registration: '/registrations',
}

export default function ModuleGrid({ modules }: ModuleGridProps) {
  const navigate = useNavigate()

  const handleModuleClick = (module: Module) => {
    telegram.hapticImpact('light')

    // Handle external links
    if (module.type === 'external_link' && module.config?.url) {
      telegram.openLink(module.config.url as string)
      return
    }

    // Get route
    const route = moduleRoutes[module.type]
    if (typeof route === 'function') {
      navigate(route(module))
    } else if (route) {
      navigate(route)
    }
  }

  if (modules.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="tg-hint">Модули не настроены</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-3 gap-px bg-gray-100">
      {modules.map((module) => {
        const Icon = moduleIcons[module.type] || HelpCircle
        
        return (
          <button
            key={module.id}
            onClick={() => handleModuleClick(module)}
            className="relative flex flex-col items-center justify-center p-4 bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors min-h-[100px]"
          >
            {/* Badge */}
            {module.badge_type !== 'none' && module.badge_value && (
              <span className="absolute top-2 right-2 flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-xs font-medium">
                {module.badge_type === 'dot' ? '' : module.badge_value}
              </span>
            )}
            
            {/* Icon */}
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary-50 text-primary-600 mb-2">
              {module.icon ? (
                <span className="text-xl">{module.icon}</span>
              ) : (
                <Icon className="w-5 h-5" />
              )}
            </div>
            
            {/* Title */}
            <span className="text-xs text-center tg-text leading-tight line-clamp-2">
              {module.title}
            </span>
          </button>
        )
      })}
    </div>
  )
}
