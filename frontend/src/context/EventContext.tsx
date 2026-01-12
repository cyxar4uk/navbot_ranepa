import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { Event, Module } from '../types'
import api from '../services/api'

interface EventContextType {
  event: Event | null
  modules: Module[]
  loading: boolean
  error: string | null
  refreshEvent: () => Promise<void>
  refreshModules: () => Promise<void>
}

const EventContext = createContext<EventContextType | undefined>(undefined)

export function EventProvider({ children }: { children: ReactNode }) {
  const [event, setEvent] = useState<Event | null>(null)
  const [modules, setModules] = useState<Module[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEvent = async () => {
    try {
      const activeEvent = await api.getActiveEvent()
      setEvent(activeEvent)
      return activeEvent
    } catch (err) {
      console.error('Failed to fetch active event:', err)
      setError('Не удалось загрузить мероприятие')
      return null
    }
  }

  const fetchModules = async (eventId: string) => {
    try {
      const eventModules = await api.getEventModules(eventId)
      setModules(eventModules)
    } catch (err) {
      console.error('Failed to fetch modules:', err)
    }
  }

  const refreshEvent = async () => {
    setLoading(true)
    const activeEvent = await fetchEvent()
    if (activeEvent) {
      await fetchModules(activeEvent.id)
    }
    setLoading(false)
  }

  const refreshModules = async () => {
    if (event) {
      await fetchModules(event.id)
    }
  }

  useEffect(() => {
    refreshEvent()
  }, [])

  return (
    <EventContext.Provider
      value={{
        event,
        modules,
        loading,
        error,
        refreshEvent,
        refreshModules,
      }}
    >
      {children}
    </EventContext.Provider>
  )
}

export function useEvent() {
  const context = useContext(EventContext)
  if (context === undefined) {
    throw new Error('useEvent must be used within an EventProvider')
  }
  return context
}
