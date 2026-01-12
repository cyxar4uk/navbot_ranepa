# Настройка для работы через домен (aaPanel)

## Текущая ситуация

Сейчас приложение работает на:
- Backend: `http://localhost:8000` или `http://your-ip:8000`
- Frontend: `http://localhost:3000` или `http://your-ip:3000`

Но для Telegram WebApp нужен **HTTPS домен**!

## Шаг 1: Настройка домена в aaPanel

1. В aaPanel перейдите в **Веб-сайты** → **Создать сайт**
2. Добавьте домен: `testingsmth.anyway-community.ru`
3. Включите SSL (Let's Encrypt)

## Шаг 2: Настройка Nginx Reverse Proxy

В aaPanel откройте настройки сайта → **Настройки** → **Конфигурация**

Замените содержимое на:

```nginx
server {
    listen 80;
    server_name testingsmth.anyway-community.ru;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name testingsmth.anyway-community.ru;
    
    # SSL сертификаты (aaPanel автоматически настроит)
    ssl_certificate /www/server/panel/vhost/cert/testingsmth.anyway-community.ru/fullchain.pem;
    ssl_certificate_key /www/server/panel/vhost/cert/testingsmth.anyway-community.ru/privkey.pem;
    
    # Frontend (Mini App)
    # Если изменили FRONTEND_PORT в .env, замените 3001 на нужный порт
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Backend API
    # Если изменили BACKEND_PORT в .env, замените 8001 на нужный порт
    location /api {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # CORS headers (если нужно)
        add_header Access-Control-Allow-Origin *;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS";
        add_header Access-Control-Allow-Headers "Authorization, Content-Type";
    }
    
    # Backend docs
    # Если изменили BACKEND_PORT в .env, замените 8001 на нужный порт
    location /docs {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Шаг 3: Настройка переменных окружения

Создайте файл `.env` в корне проекта:

```bash
cd /www/wwwroot/testingsmth.anyway-community.ru/navbot_ranepa
cat > .env << 'EOF'
# Backend
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_WEBAPP_URL=https://testingsmth.anyway-community.ru
OPENAI_API_KEY=your_openai_key
SECRET_KEY=your-secret-key-change-this

# Порты (если нужно изменить)
BACKEND_PORT=8001  # Измените на другой порт, если 8000 занят
FRONTEND_PORT=3001  # Измените на другой порт, если 3000 занят

# Frontend (для сборки)
VITE_API_URL=https://testingsmth.anyway-community.ru/api
EOF
```

**Важно:** Если вы изменили `BACKEND_PORT` или `FRONTEND_PORT` в `.env`, не забудьте обновить nginx конфигурацию:
- Замените `proxy_pass http://127.0.0.1:8000;` на `proxy_pass http://127.0.0.1:8001;` в секциях `/api` и `/docs` (если изменили BACKEND_PORT)
- Замените `proxy_pass http://127.0.0.1:3000;` на `proxy_pass http://127.0.0.1:3001;` в секции `/` и для статических файлов (если изменили FRONTEND_PORT)

## Шаг 4: Пересборка frontend с правильным API URL

```bash
cd /www/wwwroot/testingsmth.anyway-community.ru/navbot_ranepa

# Убедитесь что в .env есть VITE_API_URL
# VITE_API_URL=https://testingsmth.anyway-community.ru/api

# Пересоберите frontend через docker-compose (автоматически использует VITE_API_URL из .env)
docker-compose build frontend
docker-compose up -d
```

**Важно:** Dockerfile уже обновлен для поддержки build args. Переменная `VITE_API_URL` из `.env` автоматически передается при сборке.

## Шаг 6: Проверка

1. Откройте в браузере: `https://testingsmth.anyway-community.ru`
2. Должен открыться frontend
3. Проверьте API: `https://testingsmth.anyway-community.ru/api/health`
4. Проверьте docs: `https://testingsmth.anyway-community.ru/docs`
5. Проверьте активное событие: `https://testingsmth.anyway-community.ru/api/events/active`

## Шаг 7: Решение проблемы "Не удалось загрузить мероприятие"

Если вы видите ошибку "Не удалось загрузить мероприятие", проверьте:

### 1. Правильно ли собран frontend с VITE_API_URL

```bash
# Пересоберите frontend с правильным API URL
docker-compose build frontend
docker-compose up -d frontend
```

### 2. Работает ли backend API (502 Bad Gateway)

Если видите ошибку `502 Bad Gateway` в консоли браузера:

```bash
# Проверьте что backend контейнер запущен
docker-compose ps
docker ps | grep navbot-backend

# Проверьте логи backend (ищите ошибки)
docker-compose logs backend | tail -50

# Проверьте что backend слушает на порту 8001
netstat -tulpn | grep 8001
# или
ss -tulpn | grep 8001

# Проверьте доступность API напрямую (должно работать)
curl http://127.0.0.1:8001/api/health
curl http://127.0.0.1:8001/api/events/active

# Если curl не работает, значит проблема в backend
# Если curl работает, но браузер показывает 502, значит проблема в nginx конфигурации
```

**Если backend не отвечает:**
```bash
# Перезапустите backend
docker-compose restart backend

# Проверьте что база данных работает
docker-compose ps db
docker-compose logs db | tail -20

# Если БД не работает, перезапустите её
docker-compose restart db
sleep 10
docker-compose restart backend
```

**Если backend отвечает на curl, но nginx возвращает 502:**
```bash
# Проверьте nginx конфигурацию
nginx -t

# Убедитесь что в nginx конфигурации правильный порт
# Должно быть: proxy_pass http://127.0.0.1:8001;
# Проверьте в aaPanel → Настройки сайта → Конфигурация

# Перезагрузите nginx
systemctl reload nginx
```

### 3. Есть ли активное событие в базе данных

Если API возвращает 404, значит в базе данных нет активного события. Создайте событие через админ-панель:

1. Откройте `https://testingsmth.anyway-community.ru` в браузере
2. Войдите как администратор (если есть админ-доступ)
3. Создайте новое событие через админ-панель
4. Установите статус события как "active" или установите даты так, чтобы событие было активным

Или создайте событие через API:

```bash
# Получите токен администратора (если есть)
# Затем создайте событие через POST запрос к /api/admin/events
```

## Важно!

- Telegram WebApp **требует HTTPS**
- URL должен быть доступен из интернета (не localhost)
- В Telegram Bot настройте WebApp URL: `https://testingsmth.anyway-community.ru`
- Порты в docker-compose.yml привязаны только к `127.0.0.1` (localhost), чтобы они были доступны только для nginx reverse proxy, а не извне
- По умолчанию используются порты: BACKEND_PORT=8001, FRONTEND_PORT=3001 (можно изменить в .env)
- Если порты заняты другими процессами, проверьте что их использует: `netstat -tulpn | grep 8001` или `ss -tulpn | grep 3001`
- **Важно:** После изменения портов в `.env`, обязательно обновите nginx конфигурацию с соответствующими портами!
