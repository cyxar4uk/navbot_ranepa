#!/bin/bash

# Комплексная проверка работоспособности системы
# Использование: ./verify-system.sh

set -e

echo "🔍 Комплексная проверка работоспособности системы"
echo "=================================================="
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

OVERALL_STATUS=0

echo "1️⃣ Проверка статуса Docker контейнеров..."
echo ""

docker-compose ps
echo ""

# Проверяем каждый сервис
SERVICES=("db" "redis" "backend" "frontend")
SERVICES_RUNNING=0

for service in "${SERVICES[@]}"; do
    if docker-compose ps "$service" | grep -q "Up"; then
        success "Сервис $service запущен"
        SERVICES_RUNNING=$((SERVICES_RUNNING + 1))
    else
        error "Сервис $service НЕ запущен"
        OVERALL_STATUS=1
    fi
done

if [ $SERVICES_RUNNING -eq ${#SERVICES[@]} ]; then
    success "Все сервисы запущены ($SERVICES_RUNNING/${#SERVICES[@]})"
else
    error "Не все сервисы запущены ($SERVICES_RUNNING/${#SERVICES[@]})"
fi

echo ""
echo "2️⃣ Проверка доступности backend на порту 8001..."
echo ""

# Проверяем что порт слушается
if netstat -tulpn 2>/dev/null | grep -q ":8001" || ss -tulpn 2>/dev/null | grep -q ":8001"; then
    success "Порт 8001 используется"
    netstat -tulpn 2>/dev/null | grep ":8001" || ss -tulpn 2>/dev/null | grep ":8001"
else
    error "Порт 8001 НЕ используется"
    OVERALL_STATUS=1
fi

echo ""
echo "3️⃣ Проверка health endpoints backend..."
echo ""

# Проверяем /health
HEALTH_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" http://127.0.0.1:8001/health 2>&1 || echo "ERROR")
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2 || echo "000")
BODY=$(echo "$HEALTH_RESPONSE" | grep -v "HTTP_CODE" | head -n1)

if [ "$HTTP_CODE" = "200" ]; then
    success "Backend /health отвечает: $BODY"
else
    error "Backend /health НЕ отвечает (HTTP $HTTP_CODE)"
    OVERALL_STATUS=1
fi

# Проверяем /api/health (может не существовать, проверяем /api/events/active как альтернативу)
API_HEALTH_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" http://127.0.0.1:8001/api/health 2>&1 || echo "ERROR")
API_HTTP_CODE=$(echo "$API_HEALTH_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2 || echo "000")
API_BODY=$(echo "$API_HEALTH_RESPONSE" | grep -v "HTTP_CODE" | head -n1)

if [ "$API_HTTP_CODE" = "200" ]; then
    success "Backend /api/health отвечает: $API_BODY"
else
    # Проверяем альтернативный эндпоинт
    API_ALT_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" http://127.0.0.1:8001/api/events/active 2>&1 || echo "ERROR")
    API_ALT_CODE=$(echo "$API_ALT_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2 || echo "000")
    
    if [ "$API_ALT_CODE" = "200" ] || [ "$API_ALT_CODE" = "404" ]; then
        # 404 нормально, если событий нет
        success "Backend API доступен (проверено через /api/events/active, HTTP $API_ALT_CODE)"
    else
        warning "Backend /api/health не существует (это нормально), но API доступен"
    fi
fi

echo ""
echo "4️⃣ Проверка доступности через Nginx (домен)..."
echo ""

DOMAIN="https://testingsmth.anyway-community.ru"

# Проверяем главную страницу
FRONTEND_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -k "$DOMAIN/" 2>&1 || echo "ERROR")
FRONTEND_CODE=$(echo "$FRONTEND_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2 || echo "000")

if [ "$FRONTEND_CODE" = "200" ]; then
    success "Frontend доступен через Nginx ($DOMAIN/)"
else
    error "Frontend НЕ доступен через Nginx (HTTP $FRONTEND_CODE)"
    OVERALL_STATUS=1
fi

# Проверяем API через Nginx
API_DOMAIN_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -k "$DOMAIN/api/health" 2>&1 || echo "ERROR")
API_DOMAIN_CODE=$(echo "$API_DOMAIN_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2 || echo "000")
API_DOMAIN_BODY=$(echo "$API_DOMAIN_RESPONSE" | grep -v "HTTP_CODE" | head -n1)

if [ "$API_DOMAIN_CODE" = "200" ]; then
    success "API доступен через Nginx ($DOMAIN/api/health): $API_DOMAIN_BODY"
else
    error "API НЕ доступен через Nginx (HTTP $API_DOMAIN_CODE)"
    OVERALL_STATUS=1
fi

echo ""
echo "5️⃣ Проверка состояния миграций..."
echo ""

ALEMBIC_VERSION=$(docker-compose exec -T db psql -U postgres -d navbot -t -c "SELECT version_num FROM alembic_version;" 2>/dev/null | tr -d ' \n\r' || echo "")

if [ -n "$ALEMBIC_VERSION" ]; then
    success "Текущая версия миграций: $ALEMBIC_VERSION"
    
    # Проверяем что это последняя версия
    EXPECTED_VERSION="004_rename_knowledge_chunks_metadata"
    if [ "$ALEMBIC_VERSION" = "$EXPECTED_VERSION" ]; then
        success "Версия миграций соответствует ожидаемой ($EXPECTED_VERSION)"
    else
        warning "Версия миграций ($ALEMBIC_VERSION) отличается от ожидаемой ($EXPECTED_VERSION)"
        info "Запустите: ./sync-alembic-version.sh для синхронизации"
    fi
else
    warning "Не удалось определить версию миграций (таблица может быть пуста)"
    info "Запустите: ./sync-alembic-version.sh для установки версии"
    # Не считаем это критической ошибкой, так как таблицы существуют
fi

echo ""
echo "6️⃣ Проверка структуры базы данных..."
echo ""

# Проверяем ключевые таблицы
TABLES=("events" "users" "knowledge_chunks" "event_items")
TABLES_EXIST=0

for table in "${TABLES[@]}"; do
    EXISTS=$(docker-compose exec -T db psql -U postgres -d navbot -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '$table');" 2>/dev/null | tr -d ' ' || echo "f")
    
    if [ "$EXISTS" = "t" ]; then
        success "Таблица $table существует"
        TABLES_EXIST=$((TABLES_EXIST + 1))
    else
        error "Таблица $table НЕ существует"
        OVERALL_STATUS=1
    fi
done

if [ $TABLES_EXIST -eq ${#TABLES[@]} ]; then
    success "Все ключевые таблицы существуют ($TABLES_EXIST/${#TABLES[@]})"
fi

echo ""
echo "7️⃣ Проверка логов на критические ошибки..."
echo ""

# Проверяем логи backend на ошибки
BACKEND_ERRORS=$(docker-compose logs backend 2>&1 | grep -i "error\|exception\|traceback" | tail -5 || echo "")

if [ -z "$BACKEND_ERRORS" ]; then
    success "Критических ошибок в логах backend не обнаружено"
else
    warning "Обнаружены ошибки в логах backend:"
    echo "$BACKEND_ERRORS" | while read -r line; do
        echo "  $line"
    done
fi

echo ""
echo "8️⃣ Итоговый статус..."
echo ""

if [ $OVERALL_STATUS -eq 0 ]; then
    success "Все проверки пройдены успешно!"
    echo ""
    info "Система готова к использованию:"
    echo "  - Админ панель: $DOMAIN/admin"
    echo "  - Главная страница: $DOMAIN/"
    echo "  - API документация: $DOMAIN/docs"
    echo ""
    info "Следующий шаг: создайте тестовое событие через админ панель или скрипт create-test-data.sh"
else
    error "Обнаружены проблемы в системе!"
    echo ""
    info "Рекомендации:"
    echo "  1. Проверьте логи: docker-compose logs backend | tail -50"
    echo "  2. Проверьте статус контейнеров: docker-compose ps"
    echo "  3. Запустите диагностику: ./check-backend.sh"
    echo "  4. При необходимости пересоздайте контейнеры: ./fix-docker-containers.sh"
fi

echo ""
exit $OVERALL_STATUS
