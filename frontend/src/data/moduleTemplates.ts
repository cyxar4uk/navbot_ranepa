import { ModuleTemplate, ModuleField } from '../types';

// Program Module Fields
const programFields: ModuleField[] = [
  {
    id: 'showFilters',
    label: 'Показывать фильтры',
    type: 'toggle',
    defaultValue: true,
    description: 'Позволяет пользователям фильтровать события по категориям и тегам'
  },
  {
    id: 'showSearch',
    label: 'Показывать поиск',
    type: 'toggle',
    defaultValue: true,
    description: 'Включает строку поиска по названию и описанию событий'
  },
  {
    id: 'defaultView',
    label: 'Вид по умолчанию',
    type: 'radio',
    defaultValue: 'list',
    options: [
      { label: 'Список', value: 'list' },
      { label: 'Сетка', value: 'grid' },
      { label: 'Таймлайн', value: 'timeline' }
    ],
    description: 'Как отображаются события при открытии модуля'
  },
  {
    id: 'allowRegistration',
    label: 'Разрешить регистрацию',
    type: 'toggle',
    defaultValue: true,
    description: 'Пользователи могут регистрироваться на события прямо из приложения'
  },
  {
    id: 'showSpeakerPhotos',
    label: 'Показывать фото спикеров',
    type: 'toggle',
    defaultValue: true
  },
  {
    id: 'showCapacity',
    label: 'Показывать заполненность',
    type: 'toggle',
    defaultValue: true,
    description: 'Отображает количество зарегистрированных / вместимость'
  },
  {
    id: 'groupByDay',
    label: 'Группировать по дням',
    type: 'toggle',
    defaultValue: true
  },
  {
    id: 'showTags',
    label: 'Показывать теги',
    type: 'toggle',
    defaultValue: true
  },
  {
    id: 'enableFavorites',
    label: 'Включить избранное',
    type: 'toggle',
    defaultValue: true,
    description: 'Пользователи могут добавлять события в избранное'
  },
  {
    id: 'timeFormat',
    label: 'Формат времени',
    type: 'radio',
    defaultValue: '24h',
    options: [
      { label: '24-часовой', value: '24h' },
      { label: '12-часовой (AM/PM)', value: '12h' }
    ]
  },
  {
    id: 'enableNotifications',
    label: 'Уведомления о событиях',
    type: 'toggle',
    defaultValue: false,
    description: 'Отправлять push-уведомления перед началом событий'
  }
];

// Speakers Module Fields
const speakersFields: ModuleField[] = [
  {
    id: 'displayStyle',
    label: 'Стиль отображения',
    type: 'radio',
    defaultValue: 'grid',
    options: [
      { label: 'Сетка', value: 'grid' },
      { label: 'Список', value: 'list' },
      { label: 'Карусель', value: 'carousel' }
    ]
  },
  {
    id: 'gridColumns',
    label: 'Количество колонок',
    type: 'slider',
    defaultValue: 2,
    min: 2,
    max: 4,
    step: 1,
    conditional: {
      field: 'displayStyle',
      value: 'grid'
    }
  },
  {
    id: 'showBio',
    label: 'Показывать биографию',
    type: 'toggle',
    defaultValue: true
  },
  {
    id: 'showCompany',
    label: 'Показывать компанию',
    type: 'toggle',
    defaultValue: true
  },
  {
    id: 'showSocials',
    label: 'Показывать соцсети',
    type: 'toggle',
    defaultValue: false,
    description: 'Отображает ссылки на социальные сети спикеров'
  },
  {
    id: 'allowMessaging',
    label: 'Разрешить сообщения',
    type: 'toggle',
    defaultValue: false,
    description: 'Участники могут отправлять сообщения спикерам'
  },
  {
    id: 'showSessions',
    label: 'Показывать сессии',
    type: 'toggle',
    defaultValue: true,
    description: 'Список выступлений спикера на мероприятии'
  },
  {
    id: 'enableSearch',
    label: 'Включить поиск',
    type: 'toggle',
    defaultValue: true
  },
  {
    id: 'enableFilters',
    label: 'Включить фильтры',
    type: 'toggle',
    defaultValue: false,
    description: 'Фильтрация по компании, индустрии, темам'
  },
  {
    id: 'sortBy',
    label: 'Сортировать по',
    type: 'select',
    defaultValue: 'name',
    options: [
      { label: 'Имени', value: 'name' },
      { label: 'Компании', value: 'company' },
      { label: 'Количеству сессий', value: 'sessions' }
    ]
  }
];

// Map Module Fields
const mapFields: ModuleField[] = [
  {
    id: 'showLegend',
    label: 'Показывать легенду',
    type: 'toggle',
    defaultValue: true,
    description: 'Легенда с описанием зон на карте'
  },
  {
    id: 'allowZoom',
    label: 'Разрешить зум',
    type: 'toggle',
    defaultValue: true
  },
  {
    id: 'defaultZoom',
    label: 'Зум по умолчанию',
    type: 'slider',
    defaultValue: 100,
    min: 50,
    max: 200,
    step: 10,
    description: 'Начальный масштаб карты (в процентах)'
  },
  {
    id: 'showLabels',
    label: 'Показывать подписи',
    type: 'toggle',
    defaultValue: true,
    description: 'Названия зон на карте'
  },
  {
    id: 'interactiveZones',
    label: 'Интерактивные зоны',
    type: 'toggle',
    defaultValue: true,
    description: 'Клик по зоне показывает детали и события'
  },
  {
    id: 'showCurrentLocation',
    label: 'Показывать геопозицию',
    type: 'toggle',
    defaultValue: false,
    description: 'Отображение текущего местоположения пользователя'
  },
  {
    id: 'show3DView',
    label: '3D вид',
    type: 'toggle',
    defaultValue: false,
    description: 'Трехмерное отображение площадки',
    isPremium: true
  },
  {
    id: 'enableNavigation',
    label: 'Включить навигацию',
    type: 'toggle',
    defaultValue: false,
    description: 'Построение маршрута до зоны'
  },
  {
    id: 'highlightActiveZones',
    label: 'Подсвечивать активные зоны',
    type: 'toggle',
    defaultValue: true,
    description: 'Зоны с текущими событиями подсвечиваются'
  }
];

// Networking Module Fields
const networkingFields: ModuleField[] = [
  {
    id: 'enableChat',
    label: 'Включить чат',
    type: 'toggle',
    defaultValue: true,
    description: 'Личные сообщения между участниками'
  },
  {
    id: 'enableMatching',
    label: 'Включить подбор',
    type: 'toggle',
    defaultValue: true,
    description: 'AI-подбор релевантных участников для нетворкинга'
  },
  {
    id: 'matchingAlgorithm',
    label: 'Алгоритм подбора',
    type: 'radio',
    defaultValue: 'interests',
    options: [
      { label: 'По интересам', value: 'interests' },
      { label: 'По индустрии', value: 'industry' },
      { label: 'Случайный', value: 'random' }
    ],
    conditional: {
      field: 'enableMatching',
      value: true
    }
  },
  {
    id: 'showOnlineStatus',
    label: 'Показывать онлайн статус',
    type: 'toggle',
    defaultValue: true
  },
  {
    id: 'allowGroupCreation',
    label: 'Разрешить создание групп',
    type: 'toggle',
    defaultValue: false,
    description: 'Участники могут создавать групповые чаты'
  },
  {
    id: 'showInterests',
    label: 'Показывать интересы',
    type: 'toggle',
    defaultValue: true,
    description: 'Отображение интересов и тем в профилях'
  },
  {
    id: 'enableScheduling',
    label: 'Планирование встреч',
    type: 'toggle',
    defaultValue: false,
    description: 'Возможность назначать встречи с участниками'
  },
  {
    id: 'maxConnectionsPerDay',
    label: 'Макс. новых контактов в день',
    type: 'number',
    defaultValue: 50,
    min: 10,
    max: 200,
    description: 'Ограничение для предотвращения спама'
  }
];

// Assistant Module Fields
const assistantFields: ModuleField[] = [
  {
    id: 'enableAI',
    label: 'Включить AI',
    type: 'toggle',
    defaultValue: true,
    description: 'Интеллектуальный ассистент на базе AI',
    isPremium: true
  },
  {
    id: 'showQuickActions',
    label: 'Быстрые действия',
    type: 'toggle',
    defaultValue: true,
    description: 'Часто используемые команды одной кнопкой'
  },
  {
    id: 'enableVoice',
    label: 'Голосовой ввод',
    type: 'toggle',
    defaultValue: false,
    description: 'Возможность задавать вопросы голосом'
  },
  {
    id: 'language',
    label: 'Язык',
    type: 'radio',
    defaultValue: 'ru',
    options: [
      { label: 'Русский', value: 'ru' },
      { label: 'English', value: 'en' }
    ]
  },
  {
    id: 'personalizedSuggestions',
    label: 'Персонализированные рекомендации',
    type: 'toggle',
    defaultValue: true,
    description: 'Ассистент предлагает события на основе ваших интересов'
  },
  {
    id: 'contextAware',
    label: 'Контекстная осведомленность',
    type: 'toggle',
    defaultValue: true,
    description: 'Ассистент учитывает текущее местоположение и время'
  },
  {
    id: 'showFAQ',
    label: 'Показывать FAQ',
    type: 'toggle',
    defaultValue: true,
    description: 'Часто задаваемые вопросы в интерфейсе'
  }
];

// Info Module Fields
const infoFields: ModuleField[] = [
  {
    id: 'showVenue',
    label: 'Показывать место проведения',
    type: 'toggle',
    defaultValue: true
  },
  {
    id: 'showSchedule',
    label: 'Показывать расписание',
    type: 'toggle',
    defaultValue: true
  },
  {
    id: 'showFAQ',
    label: 'Показывать FAQ',
    type: 'toggle',
    defaultValue: true
  },
  {
    id: 'showContacts',
    label: 'Показывать контакты',
    type: 'toggle',
    defaultValue: true
  },
  {
    id: 'showWiFi',
    label: 'Показывать WiFi',
    type: 'toggle',
    defaultValue: true,
    description: 'Информация о WiFi сети на площадке'
  },
  {
    id: 'showTransport',
    label: 'Показывать транспорт',
    type: 'toggle',
    defaultValue: true,
    description: 'Как добраться до площадки'
  },
  {
    id: 'showAccommodation',
    label: 'Показывать размещение',
    type: 'toggle',
    defaultValue: false,
    description: 'Информация о гостиницах рядом'
  },
  {
    id: 'showEmergency',
    label: 'Экстренные контакты',
    type: 'toggle',
    defaultValue: true,
    description: 'Номера службы безопасности, медпункта и т.д.'
  }
];

// Partners Module Fields
const partnersFields: ModuleField[] = [
  {
    id: 'displayStyle',
    label: 'Стиль отображения',
    type: 'radio',
    defaultValue: 'grid',
    options: [
      { label: 'Сетка', value: 'grid' },
      { label: 'Карусель', value: 'carousel' },
      { label: 'Masonry', value: 'masonry' }
    ]
  },
  {
    id: 'gridColumns',
    label: 'Количество колонок',
    type: 'slider',
    defaultValue: 3,
    min: 2,
    max: 4,
    step: 1,
    conditional: {
      field: 'displayStyle',
      value: 'grid'
    }
  },
  {
    id: 'showTiers',
    label: 'Показывать уровни',
    type: 'toggle',
    defaultValue: true,
    description: 'Генеральный партнер, золотой, серебряный и т.д.'
  },
  {
    id: 'showDescription',
    label: 'Показывать описание',
    type: 'toggle',
    defaultValue: true
  },
  {
    id: 'allowClick',
    label: 'Разрешить переход',
    type: 'toggle',
    defaultValue: true,
    description: 'Клик открывает детали партнера или сайт'
  },
  {
    id: 'showLogo',
    label: 'Показывать логотип',
    type: 'toggle',
    defaultValue: true
  },
  {
    id: 'showBooth',
    label: 'Показывать стенд',
    type: 'toggle',
    defaultValue: false,
    description: 'Номер стенда на выставочной зоне'
  },
  {
    id: 'enableSearch',
    label: 'Включить поиск',
    type: 'toggle',
    defaultValue: false
  }
];

// Module Templates
export const moduleTemplates: ModuleTemplate[] = [
  {
    id: 'program',
    type: 'program',
    name: 'Программа',
    icon: 'Calendar',
    description: 'Расписание событий, сессий и воркшопов с возможностью регистрации',
    category: 'core',
    defaultConfig: {
      showFilters: true,
      showSearch: true,
      defaultView: 'list',
      allowRegistration: true,
      showSpeakerPhotos: true,
      showCapacity: true,
      groupByDay: true,
      showTags: true,
      enableFavorites: true,
      timeFormat: '24h',
      enableNotifications: false
    },
    fields: programFields,
    isPremium: false
  },
  {
    id: 'speakers',
    type: 'speakers',
    name: 'Спикеры',
    icon: 'Users',
    description: 'Профили спикеров, экспертов и гостей мероприятия',
    category: 'core',
    defaultConfig: {
      displayStyle: 'grid',
      showBio: true,
      showCompany: true,
      showSocials: false,
      allowMessaging: false,
      showSessions: true,
      gridColumns: 2,
      enableSearch: true,
      enableFilters: false,
      sortBy: 'name'
    },
    fields: speakersFields,
    isPremium: false
  },
  {
    id: 'map',
    type: 'map',
    name: 'Карта площадки',
    icon: 'Map',
    description: 'Интерактивная карта с зонами, сценами и навигацией',
    category: 'core',
    defaultConfig: {
      showLegend: true,
      allowZoom: true,
      showLabels: true,
      interactiveZones: true,
      defaultZoom: 100,
      showCurrentLocation: false,
      show3DView: false,
      enableNavigation: false,
      highlightActiveZones: true
    },
    fields: mapFields,
    isPremium: false
  },
  {
    id: 'networking',
    type: 'networking',
    name: 'Нетворкинг',
    icon: 'MessageCircle',
    description: 'Общение с участниками, AI-подбор контактов и чат',
    category: 'engagement',
    defaultConfig: {
      enableChat: true,
      enableMatching: true,
      showOnlineStatus: true,
      allowGroupCreation: false,
      showInterests: true,
      enableScheduling: false,
      matchingAlgorithm: 'interests',
      maxConnectionsPerDay: 50
    },
    fields: networkingFields,
    isPremium: false
  },
  {
    id: 'assistant',
    type: 'assistant',
    name: 'AI Ассистент',
    icon: 'Sparkles',
    description: 'Умный помощник для навигации по мероприятию',
    category: 'engagement',
    defaultConfig: {
      enableAI: true,
      showQuickActions: true,
      enableVoice: false,
      language: 'ru',
      personalizedSuggestions: true,
      contextAware: true,
      showFAQ: true
    },
    fields: assistantFields,
    isPremium: true
  },
  {
    id: 'info',
    type: 'info',
    name: 'Информация',
    icon: 'Info',
    description: 'Полезная информация о площадке, транспорте и контактах',
    category: 'information',
    defaultConfig: {
      showVenue: true,
      showSchedule: true,
      showFAQ: true,
      showContacts: true,
      showWiFi: true,
      showTransport: true,
      showAccommodation: false,
      showEmergency: true,
      customSections: []
    },
    fields: infoFields,
    isPremium: false
  },
  {
    id: 'partners',
    type: 'partners',
    name: 'Партнеры',
    icon: 'Briefcase',
    description: 'Партнеры и спонсоры мероприятия',
    category: 'information',
    defaultConfig: {
      displayStyle: 'grid',
      showTiers: true,
      showDescription: true,
      allowClick: true,
      gridColumns: 3,
      showLogo: true,
      showBooth: false,
      enableSearch: false
    },
    fields: partnersFields,
    isPremium: false
  }
];

export const getModuleTemplate = (type: string): ModuleTemplate | undefined => {
  return moduleTemplates.find(t => t.type === type);
};

export const getFieldsByModuleType = (type: string): ModuleField[] => {
  const template = getModuleTemplate(type);
  return template?.fields || [];
};
