#!/bin/bash

# Скрипт для создания тестового события через API
# Использование: ./create-test-data.sh

set -e

echo "📝 Создание тестового события"
echo "============================="
echo ""

PROJECT_DIR="/www/wwwroot/testingsmth.anyway-community.ru/navbot_ranepa"
cd "$PROJECT_DIR" || exit 1

# Цвета
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

error() { echo -e "${RED}❌ $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

# Параметры API
API_URL="http://127.0.0.1:8001/api"
DOMAIN_API_URL="https://testingsmth.anyway-community.ru/api"

# Получаем учетные данные админа из .env или используем значения по умолчанию
if [ -f .env ]; then
    ADMIN_USERNAME=$(grep "ADMIN_USERNAME" .env | cut -d= -f2 | tr -d ' ' || echo "admin")
    ADMIN_PASSWORD=$(grep "ADMIN_PASSWORD" .env | cut -d= -f2 | tr -d ' ' || echo "admin")
else
    ADMIN_USERNAME="admin"
    ADMIN_PASSWORD="admin"
    warning "Файл .env не найден, используем значения по умолчанию"
fi

info "Используем учетные данные: username=$ADMIN_USERNAME"

echo ""
echo "1️⃣ Получение JWT токена для админа..."
echo ""

# Логин админа (используем правильный формат JSON)
LOGIN_JSON=$(cat <<JSON
{"username": "$ADMIN_USERNAME", "password": "$ADMIN_PASSWORD"}
JSON
)

LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/admin/login" \
    -H "Content-Type: application/json" \
    -d "$LOGIN_JSON" 2>&1 || echo "ERROR")

if echo "$LOGIN_RESPONSE" | grep -q "access_token"; then
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
    if [ -n "$TOKEN" ]; then
        success "JWT токен получен успешно"
    else
        error "Не удалось извлечь токен из ответа"
        echo "Ответ: $LOGIN_RESPONSE"
        exit 1
    fi
else
    error "Не удалось получить JWT токен"
    echo "Ответ: $LOGIN_RESPONSE"
    exit 1
fi

echo ""
echo "2️⃣ Проверка существующих событий..."
echo ""

# Получаем список событий
EVENTS_RESPONSE=$(curl -s -X GET "$API_URL/admin/events" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" 2>&1 || echo "ERROR")

if echo "$EVENTS_RESPONSE" | grep -q "items"; then
    EVENT_COUNT=$(echo "$EVENTS_RESPONSE" | grep -o '"total":[0-9]*' | cut -d: -f2 || echo "0")
    info "Найдено существующих событий: $EVENT_COUNT"
    
    if [ "$EVENT_COUNT" != "0" ]; then
        warning "События уже существуют. Пропускаем создание тестового события."
        info "Вы можете создать новое событие через админ панель: https://testingsmth.anyway-community.ru/admin"
        exit 0
    fi
else
    warning "Не удалось получить список событий (возможно API недоступен)"
fi

echo ""
echo "3️⃣ Создание тестового события..."
echo ""

# Вычисляем даты (событие на завтра, длительностью 1 день)
START_DATE=$(date -d "+1 day 10:00" -u +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date -v+1d -v10H -u +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || echo "")
END_DATE=$(date -d "+1 day 18:00" -u +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date -v+1d -v18H -u +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || echo "")

# Если не удалось вычислить даты, используем фиксированные
if [ -z "$START_DATE" ] || [ -z "$END_DATE" ]; then
    START_DATE="2026-01-15T10:00:00Z"
    END_DATE="2026-01-15T18:00:00Z"
    warning "Используем фиксированные даты (может потребоваться корректировка)"
fi

# JSON для создания события (используем правильный формат)
EVENT_JSON=$(cat <<JSON
{
    "title": "Тестовое мероприятие RANEPA",
    "description": "Это тестовое мероприятие, созданное автоматически для проверки функционала системы. Вы можете редактировать или удалить его через админ панель.",
    "date_start": "$START_DATE",
    "date_end": "$END_DATE",
    "location": "Главный корпус РАНХиГС",
    "status": "upcoming"
}
JSON
)

info "Создаем событие с данными:"
echo "$EVENT_JSON" | python3 -m json.tool 2>/dev/null || echo "$EVENT_JSON"

# Создаем событие
CREATE_RESPONSE=$(curl -s -X POST "$API_URL/admin/events" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "$EVENT_JSON" 2>&1 || echo "ERROR")

if echo "$CREATE_RESPONSE" | grep -q '"id"'; then
    EVENT_ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
    EVENT_TITLE=$(echo "$CREATE_RESPONSE" | grep -o '"title":"[^"]*' | cut -d'"' -f4)
    
    if [ -n "$EVENT_ID" ]; then
        success "Событие создано успешно!"
        info "ID события: $EVENT_ID"
        info "Название: $EVENT_TITLE"
    else
        error "Событие создано, но не удалось извлечь ID"
        echo "Ответ: $CREATE_RESPONSE"
    fi
else
    error "Не удалось создать событие"
    echo "Ответ: $CREATE_RESPONSE"
    exit 1
fi

echo ""
echo "4️⃣ Проверка доступности события через публичный API..."
echo ""

# Проверяем что событие доступно через публичный API
PUBLIC_EVENTS_RESPONSE=$(curl -s -X GET "$API_URL/events/active" 2>&1 || echo "ERROR")

if echo "$PUBLIC_EVENTS_RESPONSE" | grep -q "$EVENT_TITLE" || echo "$PUBLIC_EVENTS_RESPONSE" | grep -q '"id"'; then
    success "Событие доступно через публичный API"
else
    warning "Событие может быть недоступно через публичный API (возможно статус не 'active')"
fi

echo ""
echo "5️⃣ Итоговая информация..."
echo ""

success "Тестовое событие успешно создано!"
echo ""
info "Доступные действия:"
echo "  - Просмотр в админ панели: https://testingsmth.anyway-community.ru/admin"
echo "  - Редактирование события: откройте админ панель и выберите созданное событие"
echo "  - Просмотр на главной странице: https://testingsmth.anyway-community.ru/"
echo ""
info "Для создания дополнительных событий используйте админ панель или повторите этот скрипт"
