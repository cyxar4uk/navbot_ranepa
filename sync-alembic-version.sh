#!/bin/bash

# Скрипт для синхронизации версии Alembic с реальным состоянием базы данных
# Использование: ./sync-alembic-version.sh

set -e

echo "🔧 Синхронизация версии Alembic с состоянием базы данных"
echo "========================================================="
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

echo "1️⃣ Проверка текущего состояния базы данных..."
echo ""

# Проверяем существование таблицы alembic_version
ALEMBIC_TABLE_EXISTS=$(docker-compose exec -T db psql -U postgres -d navbot -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'alembic_version');" 2>/dev/null | tr -d ' ' || echo "f")

if [ "$ALEMBIC_TABLE_EXISTS" = "t" ]; then
    success "Таблица alembic_version существует"
    
    # Получаем текущую версию
    CURRENT_VERSION=$(docker-compose exec -T db psql -U postgres -d navbot -t -c "SELECT version_num FROM alembic_version;" 2>/dev/null | tr -d ' ' || echo "")
    
    if [ -n "$CURRENT_VERSION" ]; then
        info "Текущая версия в alembic_version: $CURRENT_VERSION"
    else
        warning "Таблица alembic_version пуста"
    fi
else
    warning "Таблица alembic_version не существует"
    info "Создаем таблицу alembic_version..."
    docker-compose exec -T db psql -U postgres -d navbot -c "CREATE TABLE IF NOT EXISTS alembic_version (version_num VARCHAR(32) NOT NULL, CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num));" 2>/dev/null
    success "Таблица alembic_version создана"
fi

echo ""
echo "2️⃣ Проверка существования таблиц в базе данных..."
echo ""

# Проверяем ключевые таблицы
TABLES=("events" "users" "knowledge_chunks")
TABLES_EXIST=true

for table in "${TABLES[@]}"; do
    EXISTS=$(docker-compose exec -T db psql -U postgres -d navbot -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '$table');" 2>/dev/null | tr -d ' ' || echo "f")
    
    if [ "$EXISTS" = "t" ]; then
        success "Таблица $table существует"
    else
        warning "Таблица $table не существует"
        TABLES_EXIST=false
    fi
done

echo ""
echo "3️⃣ Определение правильной версии миграций..."
echo ""

if [ "$TABLES_EXIST" = true ]; then
    info "Таблицы уже существуют, определяем последнюю примененную миграцию..."
    
    # Проверяем наличие таблицы knowledge_chunks (создается в 003_knowledge_chunks)
    KNOWLEDGE_CHUNKS_EXISTS=$(docker-compose exec -T db psql -U postgres -d navbot -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'knowledge_chunks');" 2>/dev/null | tr -d ' ' || echo "f")
    
    # Проверяем колонку extra_data в knowledge_chunks (переименовывается в 004_rename_knowledge_chunks_metadata)
    if [ "$KNOWLEDGE_CHUNKS_EXISTS" = "t" ]; then
        HAS_EXTRA_DATA=$(docker-compose exec -T db psql -U postgres -d navbot -t -c "SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'knowledge_chunks' AND column_name = 'extra_data');" 2>/dev/null | tr -d ' ' || echo "f")
        HAS_METADATA=$(docker-compose exec -T db psql -U postgres -d navbot -t -c "SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'knowledge_chunks' AND column_name = 'metadata');" 2>/dev/null | tr -d ' ' || echo "f")
        
        if [ "$HAS_EXTRA_DATA" = "t" ] && [ "$HAS_METADATA" = "f" ]; then
            TARGET_VERSION="004_rename_knowledge_chunks_metadata"
            info "Обнаружена колонка extra_data в knowledge_chunks - последняя миграция: $TARGET_VERSION"
        elif [ "$HAS_METADATA" = "t" ]; then
            TARGET_VERSION="003_knowledge_chunks"
            info "Обнаружена колонка metadata в knowledge_chunks - миграция: $TARGET_VERSION"
        else
            TARGET_VERSION="003_knowledge_chunks"
            info "Таблица knowledge_chunks существует - миграция: $TARGET_VERSION"
        fi
    else
        # Проверяем наличие колонки extra_data в event_items (переименовывается в 002_rename_metadata)
        HAS_EXTRA_DATA_EVENTS=$(docker-compose exec -T db psql -U postgres -d navbot -t -c "SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'event_items' AND column_name = 'extra_data');" 2>/dev/null | tr -d ' ' || echo "f")
        
        if [ "$HAS_EXTRA_DATA_EVENTS" = "t" ]; then
            TARGET_VERSION="002_rename_metadata"
            info "Обнаружена колонка extra_data в event_items - миграция: $TARGET_VERSION"
        else
            TARGET_VERSION="001_initial"
            info "Таблицы существуют, но структура базовая - миграция: $TARGET_VERSION"
        fi
    fi
else
    TARGET_VERSION="001_initial"
    info "Таблицы не существуют - начинаем с начальной миграции: $TARGET_VERSION"
fi

echo ""
echo "4️⃣ Установка версии миграций в alembic_version..."
echo ""

# Устанавливаем версию
info "Устанавливаем версию: $TARGET_VERSION"

# Удаляем старую версию если есть
docker-compose exec -T db psql -U postgres -d navbot -c "DELETE FROM alembic_version;" 2>/dev/null || true

# Вставляем новую версию
docker-compose exec -T db psql -U postgres -d navbot -c "INSERT INTO alembic_version (version_num) VALUES ('$TARGET_VERSION');" 2>/dev/null

if [ $? -eq 0 ]; then
    success "Версия $TARGET_VERSION установлена в alembic_version"
else
    error "Не удалось установить версию"
    exit 1
fi

echo ""
echo "5️⃣ Проверка синхронизации..."
echo ""

# Проверяем установленную версию
VERIFIED_VERSION=$(docker-compose exec -T db psql -U postgres -d navbot -t -c "SELECT version_num FROM alembic_version;" 2>/dev/null | tr -d ' ' || echo "")

if [ "$VERIFIED_VERSION" = "$TARGET_VERSION" ]; then
    success "Версия подтверждена: $VERIFIED_VERSION"
else
    error "Несоответствие версий: ожидается $TARGET_VERSION, получено $VERIFIED_VERSION"
    exit 1
fi

echo ""
echo "6️⃣ Применение оставшихся миграций..."
echo ""

# Применяем миграции до head
info "Применяем миграции от $TARGET_VERSION до head..."

if docker-compose exec -T backend alembic upgrade head 2>&1; then
    success "Все миграции применены успешно"
else
    warning "Не удалось применить все миграции автоматически"
    info "Проверьте логи выше для деталей"
    
    # Проверяем текущую версию после попытки
    FINAL_VERSION=$(docker-compose exec -T db psql -U postgres -d navbot -t -c "SELECT version_num FROM alembic_version;" 2>/dev/null | tr -d ' ' || echo "")
    if [ -n "$FINAL_VERSION" ]; then
        info "Текущая версия после попытки: $FINAL_VERSION"
    fi
fi

echo ""
echo "7️⃣ Финальная проверка..."
echo ""

# Проверяем доступность backend
sleep 2
if curl -s -f http://127.0.0.1:8001/api/health > /dev/null 2>&1; then
    success "Backend доступен и отвечает"
else
    warning "Backend не отвечает на /api/health"
    info "Проверьте логи: docker-compose logs backend | tail -50"
fi

echo ""
success "Синхронизация завершена!"
