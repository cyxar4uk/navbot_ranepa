#!/bin/bash

# Скрипт для диагностики проблем с backend (502 Bad Gateway)
# Использование: ./check-backend.sh

echo "🔍 Диагностика backend (502 Bad Gateway)"
echo "=========================================="
echo ""

# 1. Проверка статуса контейнеров
echo "1️⃣ Проверка статуса контейнеров:"
docker-compose ps
echo ""

# 2. Проверка что backend контейнер запущен
echo "2️⃣ Проверка backend контейнера:"
if docker ps | grep -q navbot-backend; then
    echo "✅ Backend контейнер запущен"
    BACKEND_STATUS=$(docker ps --filter "name=navbot-backend" --format "{{.Status}}")
    echo "   Статус: $BACKEND_STATUS"
else
    echo "❌ Backend контейнер НЕ запущен!"
    echo "   Попробуйте: docker-compose up -d backend"
fi
echo ""

# 3. Проверка порта
echo "3️⃣ Проверка порта backend (8001):"
if netstat -tulpn 2>/dev/null | grep -q ":8001" || ss -tulpn 2>/dev/null | grep -q ":8001"; then
    echo "✅ Порт 8001 используется"
    netstat -tulpn 2>/dev/null | grep ":8001" || ss -tulpn 2>/dev/null | grep ":8001"
else
    echo "❌ Порт 8001 НЕ используется!"
    echo "   Backend не слушает на порту 8001"
fi
echo ""

# 4. Проверка доступности API напрямую
echo "4️⃣ Проверка доступности API (http://127.0.0.1:8001/api/health):"
HEALTH_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" http://127.0.0.1:8001/api/health 2>&1)
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$HEALTH_RESPONSE" | grep -v "HTTP_CODE")

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ Backend отвечает на порту 8001"
    echo "   Ответ: $BODY"
else
    echo "❌ Backend НЕ отвечает на порту 8001"
    echo "   HTTP код: ${HTTP_CODE:-N/A}"
    echo "   Ответ: $BODY"
fi
echo ""

# 5. Проверка логов backend (последние 20 строк)
echo "5️⃣ Последние логи backend (последние 20 строк):"
docker-compose logs --tail=20 backend
echo ""

# 6. Проверка переменных окружения
echo "6️⃣ Проверка переменных окружения:"
if [ -f .env ]; then
    echo "✅ Файл .env существует"
    if grep -q "BACKEND_PORT" .env; then
        BACKEND_PORT=$(grep "BACKEND_PORT" .env | cut -d= -f2 | tr -d ' ')
        echo "   BACKEND_PORT из .env: ${BACKEND_PORT:-не установлен}"
    else
        echo "   ⚠️ BACKEND_PORT не найден в .env (используется значение по умолчанию: 8000)"
    fi
else
    echo "⚠️ Файл .env не найден (используются значения по умолчанию)"
fi
echo ""

# 7. Проверка Nginx конфигурации
echo "7️⃣ Проверка Nginx конфигурации:"
if command -v nginx >/dev/null 2>&1; then
    if nginx -t 2>&1 | grep -q "successful"; then
        echo "✅ Nginx конфигурация валидна"
    else
        echo "❌ Ошибки в Nginx конфигурации:"
        nginx -t 2>&1 | grep -i error
    fi
else
    echo "⚠️ Nginx не найден в PATH (возможно управляется через aaPanel)"
fi
echo ""

# 8. Рекомендации
echo "📋 Рекомендации:"
echo ""

if ! docker ps | grep -q navbot-backend; then
    echo "  → Запустите backend: docker-compose up -d backend"
fi

if ! netstat -tulpn 2>/dev/null | grep -q ":8001" && ! ss -tulpn 2>/dev/null | grep -q ":8001"; then
    echo "  → Проверьте логи backend: docker-compose logs backend"
    echo "  → Убедитесь что BACKEND_PORT в .env соответствует порту в nginx конфигурации"
fi

if [ "$HTTP_CODE" != "200" ]; then
    echo "  → Проверьте логи backend на ошибки: docker-compose logs backend | tail -50"
    echo "  → Проверьте что база данных запущена: docker-compose ps db"
    echo "  → Перезапустите backend: docker-compose restart backend"
fi

echo ""
echo "✅ Диагностика завершена"
