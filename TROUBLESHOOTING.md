# Решение проблем при деплое

## Проблема: Порты уже заняты

Если видите ошибку `address already in use`:

### Решение 1: Остановить процесс, занимающий порт

```bash
# Проверьте что занимает порт 8000
netstat -tulpn | grep 8000
# или
ss -tulpn | grep 8000

# Узнайте больше о процессе
ps aux | grep <PID>
# или
ps -fp <PID>

# Если это процесс Python (старый backend), остановите его
kill <PID>
# или принудительно
kill -9 <PID>

# Если процесс автоматически перезапускается, проверьте systemd services
systemctl list-units --type=service | grep -i navbot
systemctl list-units --type=service | grep -i python
# Остановите сервис если найден:
# systemctl stop <service-name>
# systemctl disable <service-name>

# Или проверьте supervisor (если установлен)
supervisorctl status
# Остановите процесс если найден:
# supervisorctl stop <process-name>
```

### Решение 2: Остановить конфликтующие контейнеры

```bash
# Проверьте какие контейнеры используют порты
docker ps | grep -E "8000|6379|5432|3000"

# Остановите конфликтующие контейнеры
docker stop <container_id>

# Или остановите все контейнеры проекта
docker-compose down
```

### Решение 2: Изменить порты в docker-compose.yml

Если порты нужны для других проектов, измените порты:

```yaml
backend:
  ports:
    - "8001:8000"  # Внешний:Внутренний

frontend:
  ports:
    - "3001:80"  # Внешний:Внутренний
```

### Решение 3: Использовать только внутренние порты (рекомендуется)

Для Redis и PostgreSQL порты не нужны наружу - они используются только внутри Docker сети. Уже исправлено в docker-compose.yml.

## Проблема: Контейнеры не запускаются

```bash
# Проверьте логи
docker-compose logs backend
docker-compose logs frontend
docker-compose logs db

# Пересоздайте контейнеры
docker-compose down -v  # -v удалит volumes (осторожно!)
docker-compose up -d --build
```

## Проблема: Ошибка "No such image" или "ContainerConfig"

Если видите ошибку типа `No such image: sha256:...` или `KeyError: 'ContainerConfig'`:

```bash
# Полностью остановите и удалите все контейнеры проекта
docker-compose down --remove-orphans

# Удалите старые контейнеры вручную (если нужно)
docker ps -a | grep navbot
docker rm -f <container_id>

# Удалите старые образы проекта
docker images | grep navbot
docker rmi -f $(docker images | grep navbot | awk '{print $3}') 2>/dev/null || true

# Очистите неиспользуемые образы
docker image prune -f

# Пересоздайте все с нуля (без интерактивных вопросов)
docker-compose up -d --build --force-recreate --remove-orphans
```

**Если все еще есть проблемы с интерактивными вопросами:**

```bash
# Полная очистка всех контейнеров проекта
docker-compose down --remove-orphans -v

# Удалите все контейнеры проекта вручную
docker ps -a --filter "name=navbot" -q | xargs -r docker rm -f

# Удалите все образы проекта
docker images --filter "reference=navbot*" -q | xargs -r docker rmi -f

# Пересоздайте все заново
docker-compose build --no-cache
docker-compose up -d
```

## Проблема: База данных не подключается

```bash
# Проверьте что БД запущена
docker-compose ps db

# Проверьте логи БД
docker-compose logs db

# Перезапустите БД
docker-compose restart db

# Подождите 10 секунд и перезапустите backend
sleep 10
docker-compose restart backend
```

## Проблема: Frontend показывает ошибки

```bash
# Проверьте что backend доступен
curl http://localhost:8000/health

# Проверьте переменную VITE_API_URL
# В production она должна указывать на ваш домен или IP
```

## Проблема: Backend не запускается - ошибка "Attribute name 'metadata' is reserved"

Если в логах backend видите ошибку:
```
sqlalchemy.exc.InvalidRequestError: Attribute name 'metadata' is reserved when using the Declarative API.
```

**Решение:** Поле `metadata` было переименовано в `extra_data` в моделях. Нужно применить миграцию:

**Важно:** Сначала проверьте, существуют ли таблицы в базе данных:

```bash
# Подключитесь к базе данных
docker-compose exec db psql -U postgres -d navbot

# Проверьте какие таблицы существуют
\dt

# Если таблиц нет, сначала нужно применить начальную миграцию
\q
```

**Если таблицы не существуют**, создайте их через SQL скрипт (самый простой способ):

```bash
# Выполните SQL скрипт для создания всех таблиц
docker-compose exec -T db psql -U postgres -d navbot < backend/create_tables.sql

# Или если файл находится в корне проекта:
cd /www/wwwroot/testingsmth.anyway-community.ru/navbot_ranepa
docker-compose exec -T db psql -U postgres -d navbot < backend/create_tables.sql
```

**Альтернативный способ - создание через Python (если SQL не работает):**

```bash
# Создайте таблицы напрямую через Python (использует правильный DATABASE_URL из контейнера)
docker-compose exec backend python -c "
import asyncio
from app.database import engine, Base
from app.models import *

async def create_tables():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print('Таблицы созданы успешно!')

asyncio.run(create_tables())
"
```

**Если alembic не может подключиться из-за ошибки пароля**, проверьте DATABASE_URL:

```bash
# Проверьте переменную окружения в контейнере
docker-compose exec backend env | grep DATABASE_URL

# Должно быть: DATABASE_URL=postgresql+asyncpg://postgres:postgres@db:5432/navbot
# Если нет, установите её явно при запуске миграции:
docker-compose exec -e DATABASE_URL=postgresql+asyncpg://postgres:postgres@db:5432/navbot backend alembic upgrade head
```

**Если таблицы существуют**, но миграция не работает из-за ошибки подключения:

```bash
# Переименуйте колонку вручную через SQL
docker-compose exec db psql -U postgres -d navbot

# Проверьте что колонка metadata существует
\d event_items
\d assistant_knowledge

# Если колонка metadata существует, переименуйте её:
ALTER TABLE event_items RENAME COLUMN metadata TO extra_data;
ALTER TABLE assistant_knowledge RENAME COLUMN metadata TO extra_data;

# Проверьте что переименование прошло успешно
\d event_items
\d assistant_knowledge

\q
```

**Альтернативный способ - создание таблиц через SQL (если Python не работает):**

```bash
# Можно скопировать SQL из миграции 001_initial.py и выполнить вручную
# Но проще использовать Python способ выше
```

После этого перезапустите backend:
```bash
# Если видите ошибку "No such image: sha256:...", удалите старый контейнер и пересоздайте
docker-compose rm -f backend
docker-compose up -d backend

# Или используйте флаг --force-recreate
docker-compose up -d --force-recreate backend

# Или просто перезапустите (если контейнер уже работает)
docker-compose restart backend
```

## Проблема: 502 Bad Gateway при запросах к API

Если в консоли браузера видите `502 Bad Gateway` для `/api/events/active` или других API endpoints:

### 1. Проверьте что backend контейнер запущен

```bash
# Проверьте статус контейнеров
docker-compose ps

# Проверьте что backend контейнер работает
docker ps | grep navbot-backend

# Если контейнер не запущен, проверьте логи
docker-compose logs backend
```

### 2. Проверьте что backend слушает на правильном порту

```bash
# Проверьте что порт 8001 (или ваш BACKEND_PORT) используется
netstat -tulpn | grep 8001
# или
ss -tulpn | grep 8001

# Проверьте доступность backend напрямую
curl http://127.0.0.1:8001/api/health
curl http://127.0.0.1:8001/api/events/active

# Если не работает, проверьте логи backend
docker-compose logs backend | tail -50
```

### 3. Проверьте что nginx конфигурация правильная

```bash
# Проверьте nginx конфигурацию
nginx -t

# Убедитесь что в nginx конфигурации правильный порт для backend
# Должно быть: proxy_pass http://127.0.0.1:8001; (или ваш BACKEND_PORT)
# Проверьте в aaPanel → Настройки сайта → Конфигурация
```

### 4. Перезапустите backend и nginx

```bash
# Перезапустите backend
docker-compose restart backend

# Подождите 5 секунд
sleep 5

# Проверьте что backend отвечает
curl http://127.0.0.1:8001/api/health

# Перезагрузите nginx
systemctl reload nginx
# или
nginx -s reload
```

### 5. Если backend не запускается, проверьте базу данных

```bash
# Проверьте что база данных работает
docker-compose ps db
docker-compose logs db | tail -20

# Перезапустите базу данных если нужно
docker-compose restart db

# Подождите 10 секунд и перезапустите backend
sleep 10
docker-compose restart backend
```

### 6. Полная перезагрузка всех сервисов

```bash
# Остановите все
docker-compose down

# Запустите заново
docker-compose up -d

# Проверьте логи
docker-compose logs backend
docker-compose logs frontend
```

## Проблема: GitHub Actions деплой не работает

1. Проверьте что SSH ключ правильно добавлен в GitHub Secrets
2. Проверьте что сервер доступен по SSH
3. Проверьте логи в GitHub Actions вкладке

## Очистка Docker (если ничего не помогает)

```bash
# Остановить все контейнеры проекта
docker-compose down

# Удалить все контейнеры проекта
docker-compose down --remove-orphans

# Удалить volumes (ОСТОРОЖНО - удалит данные БД!)
docker-compose down -v

# Очистить неиспользуемые образы
docker image prune -a

# Полная очистка (только если уверены!)
docker system prune -a --volumes
```
