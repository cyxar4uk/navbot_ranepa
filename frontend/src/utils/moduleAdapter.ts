import { Module, ModuleType } from '../types';
import { UIModule, ModuleConfig, ModuleTemplate } from '../types';
import { getModuleTemplate, moduleTemplates } from '../data/moduleTemplates';

/**
 * Map API module types to UI module types
 */
const apiTypeToUIType = (apiType: ModuleType): UIModule['type'] => {
  const mapping: Record<ModuleType, UIModule['type']> = {
    'program': 'program',
    'event_list': 'program',
    'map': 'map',
    'registration': 'program',
    'external_link': 'custom',
    'custom_page': 'info',
    'assistant': 'assistant',
    'news': 'info',
    'messages': 'networking'
  };
  return mapping[apiType] || 'custom';
};

/**
 * Map UI module types to API module types
 */
const uiTypeToAPIType = (uiType: UIModule['type']): ModuleType => {
  const mapping: Record<UIModule['type'], ModuleType> = {
    'program': 'program',
    'speakers': 'program', // Speakers might be handled differently
    'map': 'map',
    'networking': 'messages',
    'assistant': 'assistant',
    'info': 'custom_page',
    'partners': 'custom_page',
    'custom': 'external_link'
  };
  return mapping[uiType] || 'custom_page';
};

/**
 * Get default icon for module type
 */
const getDefaultIcon = (type: UIModule['type']): string => {
  const template = getModuleTemplate(type);
  return template?.icon || 'Info';
};

/**
 * Get category for module type
 */
const getCategory = (type: UIModule['type']): UIModule['category'] => {
  const template = getModuleTemplate(type);
  return template?.category || 'custom';
};

/**
 * Get default config for module type
 */
export const getDefaultModuleConfig = (type: UIModule['type']): Partial<ModuleConfig> => {
  const template = getModuleTemplate(type);
  return template?.defaultConfig || {};
};

/**
 * Migrate old config format to new config format
 */
export const migrateModuleConfig = (
  oldConfig: Record<string, unknown>,
  type: UIModule['type']
): Partial<ModuleConfig> => {
  const defaultConfig = getDefaultModuleConfig(type);
  // Merge old config with defaults, keeping old values where they exist
  return { ...defaultConfig, ...oldConfig };
};

/**
 * Convert API module format to UI module format
 */
export const apiModuleToUIModule = (apiModule: Module): UIModule => {
  const uiType = apiTypeToUIType(apiModule.type);
  const template = getModuleTemplate(uiType);
  
  // Migrate config
  const migratedConfig = migrateModuleConfig(apiModule.config || {}, uiType);
  
  // Determine icon - use from API if exists, otherwise from template
  const icon = apiModule.icon || getDefaultIcon(uiType);
  
  return {
    id: apiModule.id,
    type: uiType,
    name: apiModule.title,
    icon: icon,
    description: template?.description,
    enabled: apiModule.enabled,
    order: apiModule.order,
    config: migratedConfig,
    fields: template?.fields,
    category: getCategory(uiType),
    isPremium: template?.isPremium || false
  };
};

/**
 * Convert UI module format to API module format
 */
export const uiModuleToApiModule = (
  uiModule: UIModule,
  eventId: string
): Partial<Module> => {
  const apiType = uiTypeToAPIType(uiModule.type);
  
  return {
    id: uiModule.id,
    event_id: eventId,
    type: apiType,
    title: uiModule.name,
    icon: uiModule.icon,
    enabled: uiModule.enabled,
    order: uiModule.order,
    config: uiModule.config || {},
    badge_type: 'none',
    badge_value: null
  };
};

/**
 * Convert array of API modules to UI modules
 */
export const apiModulesToUIModules = (apiModules: Module[]): UIModule[] => {
  return apiModules.map(apiModuleToUIModule);
};

/**
 * Convert array of UI modules to API modules format for API calls
 */
export const uiModulesToApiModules = (
  uiModules: UIModule[],
  eventId: string
): Partial<Module>[] => {
  return uiModules.map(module => uiModuleToApiModule(module, eventId));
};

/**
 * Create a new UI module from template
 */
export const createUIModuleFromTemplate = (
  template: ModuleTemplate,
  order: number,
  eventId: string
): UIModule => {
  return {
    id: `${template.type}-${Date.now()}`,
    type: template.type,
    name: template.name,
    icon: template.icon,
    description: template.description,
    enabled: true,
    order: order,
    config: { ...template.defaultConfig },
    fields: template.fields,
    category: template.category,
    isPremium: template.isPremium
  };
};

/**
 * Find module template by UI module
 */
export const getTemplateForUIModule = (module: UIModule): ModuleTemplate | undefined => {
  return getModuleTemplate(module.type);
};

/**
 * Get all available module templates
 */
export const getAllModuleTemplates = (): ModuleTemplate[] => {
  return moduleTemplates;
};
