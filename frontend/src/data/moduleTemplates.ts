import { ModuleTemplate, ModuleField } from '../types';

// Program Module Fields
const programFields: ModuleField[] = [
  {
    id: 'showFilters',
    label: 'Фильтры по категориям',
    type: 'toggle',
    defaultValue: true,
    description: 'Участники смогут фильтровать события по категориям, тегам и другим параметрам. Это поможет быстро найти интересующие их сессии.'
  },
  {
    id: 'showSearch',
    label: 'Поиск по программе',
    type: 'toggle',
    defaultValue: true,
    description: 'Участники смогут искать события по названию, описанию или спикерам. Удобно для быстрого поиска нужных сессий.'
  },
  {
    id: 'defaultView',
    label: 'Как показывать программу',
    type: 'radio',
    defaultValue: 'list',
    options: [
      { label: 'Список событий', value: 'list' },
      { label: 'Сетка с карточками', value: 'grid' },
      { label: 'Временная шкала', value: 'timeline' }
    ],
    description: 'Выберите, как программа будет отображаться при открытии. Список — компактно, сетка — наглядно, таймлайн — по времени.'
  },
  {
    id: 'allowRegistration',
    label: 'Регистрация на события',
    type: 'toggle',
    defaultValue: true,
    description: 'Участники смогут регистрироваться на события прямо в приложении. После регистрации они получат напоминание и смогут добавить событие в календарь.'
  },
  {
    id: 'showSpeakerPhotos',
    label: 'Фотографии спикеров',
    type: 'toggle',
    defaultValue: true,
    description: 'В карточках событий будут отображаться фотографии спикеров. Это помогает визуально запомнить, кто выступает.'
  },
  {
    id: 'showCapacity',
    label: 'Свободные места',
    type: 'toggle',
    defaultValue: true,
    description: 'Участники увидят, сколько мест осталось на каждое событие (например, "45 из 100"). Это поможет понять, нужно ли регистрироваться заранее.'
  },
  {
    id: 'groupByDay',
    label: 'Группировка по дням',
    type: 'toggle',
    defaultValue: true,
    description: 'События будут автоматически сгруппированы по дням мероприятия. Удобно для многодневных конференций.'
  },
  {
    id: 'showTags',
    label: 'Теги событий',
    type: 'toggle',
    defaultValue: true,
    description: 'У каждого события будут отображаться теги (например, "EdTech", "Workshop", "Keynote"). Помогает быстро понять тип события.'
  },
  {
    id: 'enableFavorites',
    label: 'Избранные события',
    type: 'toggle',
    defaultValue: true,
    description: 'Участники смогут добавлять интересные события в избранное. Это поможет составить личную программу и не пропустить важные сессии.'
  },
  {
    id: 'timeFormat',
    label: 'Формат времени',
    type: 'radio',
    defaultValue: '24h',
    options: [
      { label: '24-часовой (14:00)', value: '24h' },
      { label: '12-часовой (2:00 PM)', value: '12h' }
    ],
    description: 'Выберите формат отображения времени. 24-часовой формат более привычен в России.'
  },
  {
    id: 'enableNotifications',
    label: 'Напоминания о событиях',
    type: 'toggle',
    defaultValue: false,
    description: 'Участники будут получать push-уведомления перед началом событий, на которые они зарегистрировались. Помогает не пропустить важные сессии.'
  }
];

// Speakers Module Fields
const speakersFields: ModuleField[] = [
  {
    id: 'displayStyle',
    label: 'Как показывать спикеров',
    type: 'radio',
    defaultValue: 'grid',
    options: [
      { label: 'Сетка с фото', value: 'grid' },
      { label: 'Список', value: 'list' },
      { label: 'Карусель', value: 'carousel' }
    ],
    description: 'Выберите способ отображения спикеров. Сетка — наглядно с фото, список — компактно, карусель — для просмотра по одному.'
  },
  {
    id: 'gridColumns',
    label: 'Количество колонок',
    type: 'slider',
    defaultValue: 2,
    min: 2,
    max: 4,
    step: 1,
    description: 'Сколько спикеров показывать в одной строке при отображении сеткой. Больше колонок — компактнее, меньше — крупнее фото.',
    conditional: {
      field: 'displayStyle',
      value: 'grid'
    }
  },
  {
    id: 'showBio',
    label: 'Биография спикеров',
    type: 'toggle',
    defaultValue: true,
    description: 'В профилях спикеров будет отображаться их биография и опыт. Помогает участникам узнать больше о спикере перед выступлением.'
  },
  {
    id: 'showCompany',
    label: 'Компания спикера',
    type: 'toggle',
    defaultValue: true,
    description: 'Будет показана компания или организация, которую представляет спикер. Помогает понять контекст выступления.'
  },
  {
    id: 'showSocials',
    label: 'Социальные сети',
    type: 'toggle',
    defaultValue: false,
    description: 'Участники увидят ссылки на социальные сети спикеров (LinkedIn, Twitter и т.д.). Позволяет связаться со спикером после мероприятия.'
  },
  {
    id: 'allowMessaging',
    label: 'Сообщения спикерам',
    type: 'toggle',
    defaultValue: false,
    description: 'Участники смогут отправлять личные сообщения спикерам прямо в приложении. Полезно для вопросов после выступления или обсуждения тем.'
  },
  {
    id: 'showSessions',
    label: 'Выступления спикера',
    type: 'toggle',
    defaultValue: true,
    description: 'В профиле спикера будет показан список всех его выступлений на мероприятии. Удобно для планирования программы.'
  },
  {
    id: 'enableSearch',
    label: 'Поиск спикеров',
    type: 'toggle',
    defaultValue: true,
    description: 'Участники смогут искать спикеров по имени, компании или темам выступлений. Помогает быстро найти нужного эксперта.'
  },
  {
    id: 'enableFilters',
    label: 'Фильтры спикеров',
    type: 'toggle',
    defaultValue: false,
    description: 'Участники смогут фильтровать спикеров по компании, индустрии или темам. Полезно для поиска экспертов в конкретной области.'
  },
  {
    id: 'sortBy',
    label: 'Сортировка спикеров',
    type: 'select',
    defaultValue: 'name',
    options: [
      { label: 'По имени (А-Я)', value: 'name' },
      { label: 'По компании', value: 'company' },
      { label: 'По количеству выступлений', value: 'sessions' }
    ],
    description: 'Как будут отсортированы спикеры по умолчанию. По имени — алфавитно, по компании — группировка, по выступлениям — самые активные.'
  }
];

// Map Module Fields
const mapFields: ModuleField[] = [
  {
    id: 'showLegend',
    label: 'Легенда карты',
    type: 'toggle',
    defaultValue: true,
    description: 'Участники увидят легенду с объяснением, что означают разные зоны и иконки на карте. Помогает быстро понять структуру площадки.'
  },
  {
    id: 'allowZoom',
    label: 'Увеличение карты',
    type: 'toggle',
    defaultValue: true,
    description: 'Участники смогут увеличивать и уменьшать карту для детального просмотра. Удобно для поиска конкретных аудиторий.'
  },
  {
    id: 'defaultZoom',
    label: 'Начальный масштаб',
    type: 'slider',
    defaultValue: 100,
    min: 50,
    max: 200,
    step: 10,
    description: 'Начальный масштаб карты при открытии. Меньше — видно всю площадку, больше — детали конкретной зоны.'
  },
  {
    id: 'showLabels',
    label: 'Названия зон',
    type: 'toggle',
    defaultValue: true,
    description: 'На карте будут отображаться названия зон, аудиторий и залов. Без этого участникам будет сложнее ориентироваться.'
  },
  {
    id: 'interactiveZones',
    label: 'Кликабельные зоны',
    type: 'toggle',
    defaultValue: true,
    description: 'При клике на зону участники увидят детальную информацию: какие события там проходят, как добраться, контакты. Очень удобно для навигации.'
  },
  {
    id: 'showCurrentLocation',
    label: 'Моё местоположение',
    type: 'toggle',
    defaultValue: false,
    description: 'На карте будет отображаться текущее местоположение участника (если разрешён доступ к геолокации). Помогает понять, где вы находитесь и как добраться до нужной зоны.'
  },
  {
    id: 'show3DView',
    label: '3D карта',
    type: 'toggle',
    defaultValue: false,
    description: 'Карта будет отображаться в трёхмерном виде. Более наглядно показывает структуру площадки, но требует больше ресурсов.',
    isPremium: true
  },
  {
    id: 'enableNavigation',
    label: 'Построение маршрута',
    type: 'toggle',
    defaultValue: false,
    description: 'Участники смогут построить маршрут от своего местоположения до нужной зоны. Карта покажет путь с указаниями, как добраться.'
  },
  {
    id: 'highlightActiveZones',
    label: 'Подсветка активных зон',
    type: 'toggle',
    defaultValue: true,
    description: 'Зоны, где сейчас проходят события, будут подсвечиваться на карте. Помогает быстро найти, где сейчас что-то происходит.'
  }
];

// Networking Module Fields
const networkingFields: ModuleField[] = [
  {
    id: 'enableChat',
    label: 'Личные сообщения',
    type: 'toggle',
    defaultValue: true,
    description: 'Участники смогут отправлять друг другу личные сообщения в чате. Это позволит обмениваться контактами, договариваться о встречах и общаться после мероприятия.'
  },
  {
    id: 'enableMatching',
    label: 'Умный подбор контактов',
    type: 'toggle',
    defaultValue: true,
    description: 'AI будет автоматически предлагать участникам релевантные контакты на основе их интересов, индустрии и целей на мероприятии. Участники увидят список людей, с которыми им будет интересно познакомиться.'
  },
  {
    id: 'matchingAlgorithm',
    label: 'Как подбирать контакты',
    type: 'radio',
    defaultValue: 'interests',
    options: [
      { label: 'По общим интересам и темам', value: 'interests' },
      { label: 'По индустрии и сфере деятельности', value: 'industry' },
      { label: 'Случайный подбор', value: 'random' }
    ],
    description: 'Выберите, как AI будет подбирать контакты для участников. По интересам — для людей с похожими темами, по индустрии — для коллег из одной сферы.',
    conditional: {
      field: 'enableMatching',
      value: true
    }
  },
  {
    id: 'showOnlineStatus',
    label: 'Показывать кто онлайн',
    type: 'toggle',
    defaultValue: true,
    description: 'Участники увидят, кто из других участников сейчас активен в приложении. Это поможет понять, с кем можно связаться прямо сейчас.'
  },
  {
    id: 'allowGroupCreation',
    label: 'Групповые чаты',
    type: 'toggle',
    defaultValue: false,
    description: 'Участники смогут создавать групповые чаты для общения в командах, обсуждения тем или организации встреч. Полезно для нетворкинга в группах.'
  },
  {
    id: 'showInterests',
    label: 'Показывать интересы в профилях',
    type: 'toggle',
    defaultValue: true,
    description: 'В профилях участников будут отображаться их интересы и темы, которыми они занимаются. Это поможет быстрее найти единомышленников и начать разговор.'
  },
  {
    id: 'enableScheduling',
    label: 'Назначение встреч',
    type: 'toggle',
    defaultValue: false,
    description: 'Участники смогут назначать встречи друг с другом прямо в приложении. Можно выбрать время, место и тему встречи. Полезно для планирования нетворкинга.'
  },
  {
    id: 'maxConnectionsPerDay',
    label: 'Лимит новых контактов в день',
    type: 'number',
    defaultValue: 50,
    min: 10,
    max: 200,
    description: 'Максимальное количество новых контактов, которые участник может добавить за день. Ограничение помогает предотвратить спам и мотивирует качественный нетворкинг.'
  }
];

// Assistant Module Fields
const assistantFields: ModuleField[] = [
  {
    id: 'enableAI',
    label: 'Умный AI-ассистент',
    type: 'toggle',
    defaultValue: true,
    description: 'Участники смогут задавать вопросы AI-ассистенту о программе, спикерах, навигации и мероприятии. Ассистент понимает естественный язык и даёт развёрнутые ответы.',
    isPremium: true
  },
  {
    id: 'showQuickActions',
    label: 'Быстрые кнопки',
    type: 'toggle',
    defaultValue: true,
    description: 'В интерфейсе ассистента будут показаны кнопки с частыми вопросами (например, "Где находится главная сцена?", "Какие события сейчас?"). Ускоряет получение информации.'
  },
  {
    id: 'enableVoice',
    label: 'Голосовые вопросы',
    type: 'toggle',
    defaultValue: false,
    description: 'Участники смогут задавать вопросы голосом вместо ввода текста. Удобно, когда руки заняты или нужно быстро получить ответ.'
  },
  {
    id: 'language',
    label: 'Язык ассистента',
    type: 'radio',
    defaultValue: 'ru',
    options: [
      { label: 'Русский', value: 'ru' },
      { label: 'English', value: 'en' }
    ],
    description: 'На каком языке ассистент будет отвечать на вопросы. Полезно для международных мероприятий.'
  },
  {
    id: 'personalizedSuggestions',
    label: 'Персональные рекомендации',
    type: 'toggle',
    defaultValue: true,
    description: 'Ассистент будет предлагать события и спикеров на основе интересов участника и его регистраций. Помогает найти самое интересное для каждого.'
  },
  {
    id: 'contextAware',
    label: 'Учёт местоположения и времени',
    type: 'toggle',
    defaultValue: true,
    description: 'Ассистент учитывает, где находится участник и какое сейчас время. Например, может предложить ближайшие события или напомнить о скором начале сессии.'
  },
  {
    id: 'showFAQ',
    label: 'Частые вопросы (FAQ)',
    type: 'toggle',
    defaultValue: true,
    description: 'В интерфейсе ассистента будет показан список часто задаваемых вопросов. Участники смогут быстро найти ответы на популярные вопросы без ввода текста.'
  }
];

// Info Module Fields
const infoFields: ModuleField[] = [
  {
    id: 'showVenue',
    label: 'Информация о площадке',
    type: 'toggle',
    defaultValue: true,
    description: 'Участники увидят адрес, описание площадки, схему проезда и другую информацию о месте проведения мероприятия.'
  },
  {
    id: 'showSchedule',
    label: 'Общее расписание',
    type: 'toggle',
    defaultValue: true,
    description: 'Будет показано общее расписание мероприятия: время начала и окончания, перерывы, ключевые события. Отличается от детальной программы.'
  },
  {
    id: 'showFAQ',
    label: 'Часто задаваемые вопросы',
    type: 'toggle',
    defaultValue: true,
    description: 'Раздел с ответами на популярные вопросы участников. Помогает быстро найти информацию без обращения к организаторам.'
  },
  {
    id: 'showContacts',
    label: 'Контакты организаторов',
    type: 'toggle',
    defaultValue: true,
    description: 'Участники увидят контакты организаторов, горячей линии и службы поддержки. Полезно при возникновении вопросов или проблем.'
  },
  {
    id: 'showWiFi',
    label: 'WiFi на площадке',
    type: 'toggle',
    defaultValue: true,
    description: 'Будет показана информация о WiFi сети: название сети, пароль, инструкция по подключению. Очень важно для участников.'
  },
  {
    id: 'showTransport',
    label: 'Как добраться',
    type: 'toggle',
    defaultValue: true,
    description: 'Участники увидят информацию о том, как добраться до площадки: общественный транспорт, парковка, такси. Помогает спланировать поездку.'
  },
  {
    id: 'showAccommodation',
    label: 'Гостиницы рядом',
    type: 'toggle',
    defaultValue: false,
    description: 'Будет показана информация о гостиницах рядом с площадкой. Полезно для иногородних участников, которым нужно где-то остановиться.'
  },
  {
    id: 'showEmergency',
    label: 'Экстренные контакты',
    type: 'toggle',
    defaultValue: true,
    description: 'Участники увидят номера службы безопасности, медпункта, экстренных служб. Важно для безопасности на мероприятии.'
  }
];

// Partners Module Fields
const partnersFields: ModuleField[] = [
  {
    id: 'displayStyle',
    label: 'Как показывать партнёров',
    type: 'radio',
    defaultValue: 'grid',
    options: [
      { label: 'Сетка с логотипами', value: 'grid' },
      { label: 'Карусель', value: 'carousel' },
      { label: 'Кирпичная кладка', value: 'masonry' }
    ],
    description: 'Выберите способ отображения партнёров. Сетка — равномерно, карусель — для просмотра по одному, кладка — для разных размеров логотипов.'
  },
  {
    id: 'gridColumns',
    label: 'Количество колонок',
    type: 'slider',
    defaultValue: 3,
    min: 2,
    max: 4,
    step: 1,
    description: 'Сколько партнёров показывать в одной строке при отображении сеткой. Больше колонок — компактнее, меньше — крупнее логотипы.',
    conditional: {
      field: 'displayStyle',
      value: 'grid'
    }
  },
  {
    id: 'showTiers',
    label: 'Уровни партнёрства',
    type: 'toggle',
    defaultValue: true,
    description: 'Будет показано, какой уровень партнёрства у каждой компании (Генеральный партнёр, Золотой, Серебряный и т.д.). Помогает понять важность партнёра.'
  },
  {
    id: 'showDescription',
    label: 'Описание партнёров',
    type: 'toggle',
    defaultValue: true,
    description: 'Участники увидят краткое описание каждого партнёра: чем занимается компания, что предлагает. Помогает понять, с кем можно сотрудничать.'
  },
  {
    id: 'allowClick',
    label: 'Переход на сайт партнёра',
    type: 'toggle',
    defaultValue: true,
    description: 'При клике на карточку партнёра участники смогут перейти на его сайт или увидеть детальную информацию. Полезно для установления контактов.'
  },
  {
    id: 'showLogo',
    label: 'Логотипы партнёров',
    type: 'toggle',
    defaultValue: true,
    description: 'Будут отображаться логотипы партнёров. Визуально узнаваемо и профессионально.'
  },
  {
    id: 'showBooth',
    label: 'Номера стендов',
    type: 'toggle',
    defaultValue: false,
    description: 'Будет показан номер стенда партнёра на выставочной зоне. Помогает участникам найти партнёра на площадке для личного общения.'
  },
  {
    id: 'enableSearch',
    label: 'Поиск партнёров',
    type: 'toggle',
    defaultValue: false,
    description: 'Участники смогут искать партнёров по названию компании или сфере деятельности. Удобно для быстрого поиска нужных контактов.'
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
