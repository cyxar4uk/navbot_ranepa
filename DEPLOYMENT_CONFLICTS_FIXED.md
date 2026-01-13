# Исправленные конфликты для деплоя

## Обнаруженные проблемы

### 1. ❌ КРИТИЧЕСКАЯ: Неправильный импорт в `admin.py`
**Проблема:**
- Строка 16: Использовался `get_current_admin_token`, но импортирован был `get_current_admin` из `deps`
- Это вызвало бы `NameError: name 'get_current_admin_token' is not defined` при запуске

**Исправление:**
```python
# Было:
from app.api.deps import get_current_admin

# Стало:
from app.api.admin_auth import get_current_admin_token
```

### 2. ❌ КРИТИЧЕСКАЯ: Конфликт аутентификации
**Проблема:**
- Router использует JWT-based аутентификацию (`get_current_admin_token`)
- Но новые эндпоинты `/knowledge-chunks/*` использовали Telegram-based (`get_current_admin`)
- Это создавало конфликт: router требует JWT токен, но эндпоинты ожидали Telegram user

**Исправление:**
- Удалены параметры `current_user: User = Depends(get_current_admin)` из новых эндпоинтов
- Теперь все эндпоинты используют JWT токен через router dependency

### 3. ❌ КРИТИЧЕСКАЯ: Отсутствующие импорты в `schemas/__init__.py`
**Проблема:**
- `MapDataResponse` и `AssistantKnowledgeResponse` были в `__all__`, но не импортированы
- Это вызвало бы `NameError` при импорте схем

**Исправление:**
```python
# Добавлены импорты:
from app.schemas.location import ..., MapDataResponse
from app.schemas.assistant import ..., AssistantKnowledgeResponse
```

### 4. ⚠️ Некритично: Отсутствие в `__all__`
**Проблема:**
- `KnowledgeChunkService` импортирован, но не в `__all__`
- `KnowledgeChunkResponse` и `KnowledgeChunkRefreshRequest` не в `__all__`

**Исправление:**
- Добавлены в соответствующие `__all__` списки

## Изменения в коде

### `backend/app/api/admin.py`
- ✅ Исправлен импорт `get_current_admin_token`
- ✅ Удален неиспользуемый импорт `User` из models
- ✅ Удалены параметры `current_user` из knowledge-chunks эндпоинтов

### `backend/app/schemas/__init__.py`
- ✅ Добавлены импорты `MapDataResponse` и `AssistantKnowledgeResponse`
- ✅ Добавлены `KnowledgeChunkResponse` и `KnowledgeChunkRefreshRequest` в `__all__`

### `backend/app/services/__init__.py`
- ✅ Добавлен `KnowledgeChunkService` в `__all__`

## Проверка перед деплоем

Убедитесь, что:
1. ✅ Все файлы knowledge_chunk существуют:
   - `backend/app/models/knowledge_chunk.py`
   - `backend/app/schemas/knowledge_chunk.py`
   - `backend/app/services/knowledge_chunk_service.py`

2. ✅ Миграции БД включают таблицу `knowledge_chunks` (если это новая функциональность)

3. ✅ Все зависимости установлены в `requirements.txt`

## Результат

После исправлений код должен:
- ✅ Успешно запускаться без ошибок импорта
- ✅ Корректно использовать JWT аутентификацию для всех admin эндпоинтов
- ✅ Правильно экспортировать все схемы и сервисы
