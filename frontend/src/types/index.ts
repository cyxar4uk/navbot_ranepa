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
  actions?: AssistantAction[]
}

export type AssistantAction =
  | {
      type: 'open_map'
      label?: string
      location_id: string
    }
  | {
      type: 'open_admin'
      label?: string
      url?: string
    }

// Module type definitions
export interface ModuleTypeDefinition {
  type: ModuleType
  name: string
  description: string
  default_config: Record<string, unknown>
}

// ============= Design System Module Types =============

// Module field types
export type ModuleFieldType = 
  | 'text' 
  | 'textarea' 
  | 'number' 
  | 'toggle' 
  | 'select' 
  | 'color' 
  | 'image' 
  | 'radio'
  | 'multiselect'
  | 'slider'
  | 'daterange';

export interface ModuleField {
  id: string;
  label: string;
  type: ModuleFieldType;
  defaultValue?: any;
  options?: Array<{ label: string; value: string }>;
  min?: number;
  max?: number;
  step?: number;
  placeholder?: string;
  description?: string;
  required?: boolean;
  isPremium?: boolean;
  conditional?: {
    field: string;
    value: any;
  };
}

// Module-specific configurations
export interface ProgramModuleConfig {
  showFilters: boolean;
  showSearch: boolean;
  defaultView: 'list' | 'grid' | 'timeline';
  allowRegistration: boolean;
  showSpeakerPhotos: boolean;
  showCapacity: boolean;
  groupByDay: boolean;
  showTags: boolean;
  enableFavorites: boolean;
  timeFormat: '12h' | '24h';
  enableNotifications: boolean;
}

export interface SpeakersModuleConfig {
  displayStyle: 'grid' | 'list' | 'carousel';
  showBio: boolean;
  showCompany: boolean;
  showSocials: boolean;
  allowMessaging: boolean;
  showSessions: boolean;
  gridColumns: 2 | 3 | 4;
  enableSearch: boolean;
  enableFilters: boolean;
  sortBy: 'name' | 'company' | 'sessions';
}

export interface MapModuleConfig {
  showLegend: boolean;
  allowZoom: boolean;
  showLabels: boolean;
  interactiveZones: boolean;
  defaultZoom: number;
  showCurrentLocation: boolean;
  show3DView: boolean;
  enableNavigation: boolean;
  highlightActiveZones: boolean;
}

export interface NetworkingModuleConfig {
  enableChat: boolean;
  enableMatching: boolean;
  showOnlineStatus: boolean;
  allowGroupCreation: boolean;
  showInterests: boolean;
  enableScheduling: boolean;
  matchingAlgorithm: 'interests' | 'industry' | 'random';
  maxConnectionsPerDay: number;
}

export interface AssistantModuleConfig {
  enableAI: boolean;
  showQuickActions: boolean;
  enableVoice: boolean;
  language: 'ru' | 'en';
  personalizedSuggestions: boolean;
  contextAware: boolean;
  showFAQ: boolean;
}

export interface InfoModuleConfig {
  showVenue: boolean;
  showSchedule: boolean;
  showFAQ: boolean;
  showContacts: boolean;
  showWiFi: boolean;
  showTransport: boolean;
  showAccommodation: boolean;
  showEmergency: boolean;
  customSections: Array<{
    title: string;
    content: string;
    icon?: string;
  }>;
}

export interface PartnersModuleConfig {
  displayStyle: 'grid' | 'carousel' | 'masonry';
  showTiers: boolean;
  showDescription: boolean;
  allowClick: boolean;
  gridColumns: 2 | 3 | 4;
  showLogo: boolean;
  showBooth: boolean;
  enableSearch: boolean;
}

export type ModuleConfig = 
  | ProgramModuleConfig
  | SpeakersModuleConfig
  | MapModuleConfig
  | NetworkingModuleConfig
  | AssistantModuleConfig
  | InfoModuleConfig
  | PartnersModuleConfig;

// UI Module type (extends existing Module for Design System compatibility)
export interface UIModule {
  id: string;
  type: 'program' | 'speakers' | 'map' | 'networking' | 'assistant' | 'info' | 'partners' | 'custom';
  name: string;
  icon: string;
  description?: string;
  enabled: boolean;
  order: number;
  config?: Partial<ModuleConfig>;
  fields?: ModuleField[];
  category: 'core' | 'engagement' | 'information' | 'custom';
  isPremium?: boolean;
}

export interface ModuleTemplate {
  id: string;
  type: UIModule['type'];
  name: string;
  icon: string;
  description: string;
  category: UIModule['category'];
  defaultConfig: Partial<ModuleConfig>;
  fields: ModuleField[];
  isPremium?: boolean;
  previewImage?: string;
}

export interface EventConfig {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  modules: UIModule[];
  theme: {
    primaryColor: string;
    accentColor: string;
  };
}
