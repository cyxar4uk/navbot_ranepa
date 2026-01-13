# Исправления проблем после интеграции AI помощника

## Обнаруженные проблемы

После интеграции AI помощника были обнаружены следующие критические проблемы:

### 1. Конфликт с SQLAlchemy: колонка `metadata`

**Проблема:** В модели `KnowledgeChunk` была добавлена колонка `metadata`, которая является зарезервированным именем в SQLAlchemy Declarative API.

**Ошибка:**
```
sqlalchemy.exc.InvalidRequestError: Attribute name 'metadata' is reserved when using the Declarative API.
```

**Исправление:**
- Удалена колонка `metadata` из модели `backend/app/models/knowledge_chunk.py`
- Оставлена только колонка `extra_data` (которая уже была переименована ранее)
- Удалено поле `metadata` из схемы `backend/app/schemas/knowledge_chunk.py`
- Исправлено использование `item.metadata` в `knowledge_chunk_service.py` (удалено, используется только `extra_data`)

### 2. Дублирование revision в миграции

**Проблема:** В файле `backend/alembic/versions/002_knowledge_chunks.py` были дублированы revision идентификаторы:
- `revision: str = "002_knowledge_chunks"` и `revision: str = "003_knowledge_chunks"` в одном файле
- `down_revision` также был дублирован

**Ошибка:**
```
ERROR [alembic.util.messaging] Multiple head revisions are present
```

**Исправление:**
- Удален дубликат `002_knowledge_chunks`
- Оставлен только `003_knowledge_chunks` с `down_revision: "002_rename_metadata"`
- Удалена колонка `metadata` из миграции (оставлена только `extra_data`)

### 3. Дублирование параметров в функциях admin.py

**Проблема:** В функциях `admin_refresh_knowledge_chunks` и `admin_get_knowledge_chunks` были дублированы параметры:
```python
async def admin_refresh_knowledge_chunks(
    data: KnowledgeChunkRefreshRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_admin)  # Дубликат
    db: AsyncSession = Depends(get_db)  # Дубликат
):
```

**Ошибка:** Синтаксическая ошибка Python

**Исправление:**
- Удалены дублирующиеся параметры
- Удален неиспользуемый `current_user` (аутентификация уже через `get_current_admin_token` в router dependencies)

### 4. Дублирование импортов в schemas/__init__.py

**Проблема:** Импорты `LocationCreate`, `AssistantChatRequest` и другие были импортированы дважды.

**Исправление:**
- Удалены дублирующиеся импорты
- Оставлены только полные импорты с `MapDataResponse` и `AssistantKnowledgeResponse`

### 5. Дублирование строки в llm_client.py

**Проблема:** В методе `build_system_prompt` была продублирована строка с `return f"""...`

**Исправление:**
- Удалена дублирующаяся строка

### 6. Неиспользуемый импорт в admin.py

**Проблема:** Импорт `get_current_admin` не использовался (используется только `get_current_admin_token`)

**Исправление:**
- Удален неиспользуемый импорт

## Новые функции AI помощника

### AGENT_CONFIG_PATH

Добавлена поддержка конфигурационного файла для AI агента через переменную окружения `AGENT_CONFIG_PATH`.

**Использование:**
```bash
# В .env файле
AGENT_CONFIG_PATH=/path/to/agent_config.json
```

**Формат конфигурационного файла:**
```json
{
  "system_prompt": "Дополнительные инструкции для системы",
  "prompt": "Дополнительные инструкции для промпта",
  "instructions": [
    "Инструкция 1",
    "Инструкция 2"
  ]
}
```

Конфигурация загружается один раз при первом использовании и кэшируется в памяти.

## Инструкция для применения исправлений на сервере

```bash
cd /www/wwwroot/testingsmth.anyway-community.ru/navbot_ranepa

# 1. Получите последние изменения
git pull

# 2. Пересоберите backend
docker-compose build backend
docker-compose up -d backend

# 3. Подождите несколько секунд
sleep 5

# 4. Проверьте что backend запустился
docker-compose logs backend | tail -30

# 5. Проверьте доступность API
curl http://127.0.0.1:8001/api/health
```

## Проверка работоспособности

После применения исправлений проверьте:

1. **Backend запускается без ошибок:**
   ```bash
   docker-compose logs backend | grep -i error
   ```

2. **API доступен:**
   ```bash
   curl http://127.0.0.1:8001/api/health
   curl http://127.0.0.1:8001/api/events/active
   ```

3. **Админ панель работает:**
   - Откройте `https://testingsmth.anyway-community.ru/admin`
   - Войдите с учетными данными админа
   - Проверьте что события загружаются

4. **AI помощник работает:**
   - Откройте модуль "Ассистент" в пользовательском интерфейсе
   - Задайте вопрос
   - Проверьте что ответ генерируется

## Примечания

- Все изменения совместимы с существующей базой данных
- Колонка `metadata` в таблице `knowledge_chunks` не будет создана (используется только `extra_data`)
- Если в базе данных уже есть колонка `metadata`, она будет проигнорирована (миграция создает только `extra_data`)
