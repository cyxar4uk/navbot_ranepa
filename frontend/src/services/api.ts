import type {
  Event,
  Module,
  EventItem,
  Speaker,
  User,
  Registration,
  MapData,
  News,
  AssistantChatRequest,
  AssistantChatResponse,
  ModuleTypeDefinition,
} from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

class ApiClient {
  private token: string | null = null

  setToken(token: string) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/81cb5446-668f-43af-b09f-f0be6da0ac8c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:20',message:'setToken called',data:{hasToken:!!token,tokenLength:token?.length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    this.token = token
  }

  setTokenFromStorage(key = 'admin_token') {
    if (typeof window === 'undefined') return
    const stored = localStorage.getItem(key)
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/81cb5446-668f-43af-b09f-f0be6da0ac8c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:27',message:'setTokenFromStorage',data:{key,hasStored:!!stored,storedLength:stored?.length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    if (stored) {
      this.setToken(stored)
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/81cb5446-668f-43af-b09f-f0be6da0ac8c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:32',message:'request start',data:{endpoint,hasToken:!!this.token,method:options.method||'GET'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B'})}).catch(()=>{});
    // #endregion
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/81cb5446-668f-43af-b09f-f0be6da0ac8c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:42',message:'request headers prepared',data:{hasAuthHeader:!!headers['Authorization'],endpoint},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B'})}).catch(()=>{});
    // #endregion

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    })

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/81cb5446-668f-43af-b09f-f0be6da0ac8c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:50',message:'response received',data:{status:response.status,statusText:response.statusText,ok:response.ok,endpoint},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B'})}).catch(()=>{});
    // #endregion

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }))
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/81cb5446-668f-43af-b09f-f0be6da0ac8c',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'api.ts:53',message:'request error',data:{status:response.status,error:error.detail||'Unknown',endpoint},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,B'})}).catch(()=>{});
      // #endregion
      throw new Error(error.detail || `HTTP error ${response.status}`)
    }

    return response.json()
  }

  // Auth
  async validateAuth(): Promise<{ valid: boolean; user: User }> {
    return this.request('/auth/validate', { method: 'POST' })
  }

  async getMe(): Promise<User> {
    return this.request('/auth/me')
  }

  // Events
  async getEvents(): Promise<{ items: Event[]; total: number }> {
    return this.request('/events')
  }

  async getActiveEvent(): Promise<Event> {
    return this.request('/events/active')
  }

  async getEvent(eventId: string): Promise<Event> {
    return this.request(`/events/${eventId}`)
  }

  async getEventModules(eventId: string): Promise<Module[]> {
    return this.request(`/events/${eventId}/modules`)
  }

  async getEventItems(
    eventId: string,
    params?: {
      day?: string
      type?: string
      location?: string
      search?: string
      available_only?: boolean
    }
  ): Promise<EventItem[]> {
    const searchParams = new URLSearchParams()
    if (params?.day) searchParams.set('day', params.day)
    if (params?.type) searchParams.set('type', params.type)
    if (params?.location) searchParams.set('location', params.location)
    if (params?.search) searchParams.set('search', params.search)
    if (params?.available_only) searchParams.set('available_only', 'true')

    const query = searchParams.toString()
    return this.request(`/events/${eventId}/items${query ? `?${query}` : ''}`)
  }

  async getEventDays(eventId: string): Promise<string[]> {
    return this.request(`/events/${eventId}/days`)
  }

  async getEventTypes(eventId: string): Promise<string[]> {
    return this.request(`/events/${eventId}/types`)
  }

  async getEventSpeakers(eventId: string): Promise<Speaker[]> {
    return this.request(`/events/${eventId}/speakers`)
  }

  // Event Items
  async getEventItem(itemId: string): Promise<EventItem> {
    return this.request(`/event-items/${itemId}`)
  }

  async registerForItem(itemId: string): Promise<{
    success: boolean
    message: string
    registration_id: string
    status: string
  }> {
    return this.request(`/event-items/${itemId}/register`, { method: 'POST' })
  }

  async cancelRegistration(itemId: string): Promise<{
    success: boolean
    message: string
  }> {
    return this.request(`/event-items/${itemId}/register`, { method: 'DELETE' })
  }

  // Modules
  async getModule(moduleId: string): Promise<Module> {
    return this.request(`/modules/${moduleId}`)
  }

  // Speakers
  async getSpeaker(speakerId: string): Promise<Speaker> {
    return this.request(`/speakers/${speakerId}`)
  }

  // Registrations
  async getMyRegistrations(eventId?: string): Promise<Registration[]> {
    const query = eventId ? `?event_id=${eventId}` : ''
    return this.request(`/registrations/my${query}`)
  }

  async checkRegistration(eventItemId: string): Promise<{
    registered: boolean
    status: string | null
  }> {
    return this.request(`/registrations/${eventItemId}/check`)
  }

  // Map
  async getMapData(eventId: string): Promise<MapData> {
    return this.request(`/events/${eventId}/map`)
  }

  async getLocation(locationId: string): Promise<Location> {
    return this.request(`/locations/${locationId}`)
  }

  // News
  async getEventNews(eventId: string): Promise<News[]> {
    return this.request(`/news/events/${eventId}/news`)
  }

  async getNews(newsId: string): Promise<News> {
    return this.request(`/news/${newsId}`)
  }

  // Assistant
  async chat(data: AssistantChatRequest): Promise<AssistantChatResponse> {
    return this.request('/assistant/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  // Admin
  async adminGetEvents(): Promise<{ items: Event[]; total: number }> {
    return this.request('/admin/events')
  }

  async adminCreateEvent(data: Partial<Event>): Promise<Event> {
    return this.request('/admin/events', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async adminUpdateEvent(eventId: string, data: Partial<Event>): Promise<Event> {
    return this.request(`/admin/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async adminDeleteEvent(eventId: string): Promise<{ success: boolean }> {
    return this.request(`/admin/events/${eventId}`, { method: 'DELETE' })
  }

  async adminGetEventModules(eventId: string): Promise<Module[]> {
    return this.request(`/admin/events/${eventId}/modules`)
  }

  async adminGetModuleTypes(): Promise<ModuleTypeDefinition[]> {
    return this.request('/admin/modules/types')
  }

  async createModule(data: Partial<Module>): Promise<Module> {
    return this.request('/modules', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateModule(moduleId: string, data: Partial<Module>): Promise<Module> {
    return this.request(`/modules/${moduleId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteModule(moduleId: string): Promise<{ success: boolean }> {
    return this.request(`/modules/${moduleId}`, { method: 'DELETE' })
  }

  async reorderModules(eventId: string, moduleIds: string[]): Promise<{ success: boolean }> {
    return this.request(`/modules/reorder/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify({ module_ids: moduleIds }),
    })
  }
}

export const api = new ApiClient()
export default api
