# Проверка работоспособности после деплоя

## Автоматические проверки

После каждого деплоя GitHub Actions автоматически проверяет:
- ✅ Статус всех контейнеров
- ✅ Доступность backend API (`/health` endpoint)

## Ручная проверка на сервере

### 1. Проверка статуса контейнеров

```bash
cd /www/wwwroot/testingsmth.anyway-community.ru/navbot_ranepa
docker-compose ps
```

Все контейнеры должны быть в статусе `Up`.

### 2. Проверка логов

```bash
# Backend логи
docker-compose logs backend

# Frontend логи
docker-compose logs frontend

# Все логи
docker-compose logs

# Следить за логами в реальном времени
docker-compose logs -f
```

### 3. Проверка доступности API

```bash
# Health check
curl http://localhost:8000/health

# Должен вернуть: {"status": "healthy"}

# Проверка root endpoint
curl http://localhost:8000/

# Должен вернуть информацию о приложении
```

### 4. Проверка frontend

Откройте в браузере:
- Frontend: `http://your-server-ip:3000`
- Backend API docs: `http://your-server-ip:8000/docs`

### 5. Проверка базы данных

```bash
# Подключение к БД
docker-compose exec db psql -U postgres -d navbot

# Проверка таблиц
\dt

# Выход
\q
```

## Решение проблем

### Контейнеры не запускаются

```bash
# Проверьте логи
docker-compose logs

# Пересоздайте контейнеры
docker-compose down
docker-compose up -d --build
```

### Backend не отвечает

```bash
# Проверьте что БД запущена
docker-compose ps db

# Проверьте переменные окружения
docker-compose exec backend env | grep DATABASE

# Перезапустите backend
docker-compose restart backend
```

### Frontend показывает ошибки

```bash
# Проверьте что backend доступен
curl http://localhost:8000/health

# Проверьте переменную VITE_API_URL в frontend
# Она должна указывать на ваш backend URL
```

## Мониторинг

Для постоянного мониторинга можно использовать:

```bash
# Проверка каждые 5 минут (добавить в cron)
*/5 * * * * cd /www/wwwroot/testingsmth.anyway-community.ru/navbot_ranepa && docker-compose ps | grep -q "Up" || docker-compose restart
```
