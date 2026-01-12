// Event types
export interface Event {
  id: string
  title: string
  description: string | null
  date_start: string
  date_end: string
  location: string | null
  status: 'upcoming' | 'active' | 'finished'
  created_at: string
  updated_at: string
}

// Module types
export type ModuleType = 
  | 'program' 
  | 'event_list' 
  | 'map' 
  | 'registration' 
  | 'external_link' 
  | 'custom_page' 
  | 'assistant' 
  | 'news' 
  | 'messages'

export interface Module {
  id: string
  event_id: string
  type: ModuleType
  title: string
  icon: string | null
  enabled: boolean
  order: number
  badge_type: 'none' | 'count' | 'dot'
  badge_value: string | null
  config: Record<string, unknown>
  created_at: string
  updated_at: string
}

// Event Item types
export interface EventItem {
  id: string
  event_id: string
  module_id: string | null
  title: string
  description: string | null
  date_start: string | null
  date_end: string | null
  location_id: string | null
  location_name: string | null
  capacity: number | null
  registered_count: number
  available_spots: number | null
  is_full: boolean
  type: string | null
  status: 'active' | 'cancelled' | 'finished'
  metadata: Record<string, unknown>
  speakers: Speaker[]
  created_at: string
  updated_at: string
}

// Speaker types
export interface Speaker {
  id: string
  event_id: string
  name: string
  bio: string | null
  photo_url: string | null
  position: string | null
  company: string | null
  social_links: Record<string, string>
  created_at: string
  updated_at: string
}

// User types
export interface User {
  id: string
  telegram_id: number
  username: string | null
  first_name: string | null
  last_name: string | null
  role: 'user' | 'admin'
  created_at: string
  updated_at: string
}

// Registration types
export interface Registration {
  id: string
  event_item_id: string
  user_id: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'waitlist'
  registered_at: string
  approved_at: string | null
  event_item_title: string | null
}

// Location types
export interface Location {
  id: string
  event_id: string
  name: string
  description: string | null
  floor: number | null
  zone_id: string | null
  zone_name: string | null
  coordinates: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface Zone {
  id: string
  event_id: string
  name: string
  floor: number | null
  coordinates: Record<string, unknown>
  map_data: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface MapData {
  zones: Zone[]
  locations: Location[]
}

// News types
export interface News {
  id: string
  event_id: string
  title: string
  content: string | null
  image_url: string | null
  published_at: string | null
  created_at: string
  updated_at: string
}

// Assistant types
export interface AssistantMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface AssistantChatRequest {
  event_id: string
  message: string
  context?: {
    module_id?: string
    item_id?: string
  }
}

export interface AssistantChatResponse {
  response: string
  sources: string[]
}

// Module type definitions
export interface ModuleTypeDefinition {
  type: ModuleType
  name: string
  description: string
  default_config: Record<string, unknown>
}
