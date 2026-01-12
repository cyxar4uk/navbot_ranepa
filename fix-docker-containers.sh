#!/bin/bash

# Скрипт для безопасной очистки и пересоздания Docker контейнеров
# Использование: ./fix-docker-containers.sh

set -e

echo "🔧 Безопасная очистка и пересоздание Docker контейнеров"
echo "======================================================"
echo ""

PROJECT_DIR="/www/wwwroot/testingsmth.anyway-community.ru/navbot_ranepa"
cd "$PROJECT_DIR" || exit 1

# Цвета
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

error() { echo -e "${RED}❌ $1${NC}"; }
success() { echo -e "${GREEN}✅ $1${NC}"; }
warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
info() { echo "ℹ️  $1"; }

echo "1️⃣ Остановка всех контейнеров проекта..."
echo ""

if docker-compose down 2>&1; then
    success "Все контейнеры остановлены"
else
    warning "Некоторые контейнеры уже были остановлены или не существуют"
fi

echo ""
echo "2️⃣ Удаление старых контейнеров с ошибками..."
echo ""

# Находим все контейнеры navbot
CONTAINERS=$(docker ps -a --filter "name=navbot" -q 2>/dev/null || echo "")

if [ -n "$CONTAINERS" ]; then
    info "Найдено контейнеров: $(echo "$CONTAINERS" | wc -l)"
    echo "$CONTAINERS" | while read -r container; do
        if docker rm -f "$container" 2>/dev/null; then
            success "Удален контейнер: $container"
        else
            warning "Не удалось удалить контейнер: $container"
        fi
    done
else
    info "Старые контейнеры не найдены"
fi

echo ""
echo "3️⃣ Удаление старых образов navbot_ranepa..."
echo ""

# Находим все образы navbot_ranepa
IMAGES=$(docker images --filter "reference=navbot_ranepa*" -q 2>/dev/null || echo "")

if [ -n "$IMAGES" ]; then
    info "Найдено образов: $(echo "$IMAGES" | wc -l)"
    echo "$IMAGES" | while read -r image; do
        if docker rmi -f "$image" 2>/dev/null; then
            success "Удален образ: $image"
        else
            warning "Не удалось удалить образ: $image (возможно используется)"
        fi
    done
else
    info "Старые образы не найдены"
fi

echo ""
echo "4️⃣ Очистка dangling images..."
echo ""

if docker image prune -f 2>&1 | grep -q "deleted"; then
    success "Dangling images очищены"
else
    info "Dangling images не найдены"
fi

echo ""
echo "5️⃣ Пересборка образов с нуля..."
echo ""

info "Начинаем пересборку всех сервисов..."
if docker-compose build --no-cache 2>&1; then
    success "Все образы успешно пересобраны"
else
    error "Ошибка при пересборке образов"
    exit 1
fi

echo ""
echo "6️⃣ Запуск контейнеров в правильном порядке..."
echo ""

info "Запускаем контейнеры..."
if docker-compose up -d 2>&1; then
    success "Все контейнеры запущены"
else
    error "Ошибка при запуске контейнеров"
    exit 1
fi

echo ""
echo "7️⃣ Ожидание готовности сервисов..."
echo ""

info "Ждем 10 секунд для инициализации сервисов..."
sleep 10

echo ""
echo "8️⃣ Проверка статуса контейнеров..."
echo ""

docker-compose ps

echo ""
echo "9️⃣ Проверка логов на ошибки..."
echo ""

# Проверяем логи каждого сервиса
SERVICES=("db" "redis" "backend" "frontend")

for service in "${SERVICES[@]}"; do
    echo ""
    info "Логи сервиса $service (последние 5 строк):"
    docker-compose logs --tail=5 "$service" 2>&1 || warning "Не удалось получить логи для $service"
done

echo ""
success "Очистка и пересоздание контейнеров завершены!"
echo ""
info "Следующие шаги:"
echo "  1. Запустите: ./sync-alembic-version.sh"
echo "  2. Запустите: ./check-backend.sh"
echo "  3. Запустите: ./verify-system.sh"
