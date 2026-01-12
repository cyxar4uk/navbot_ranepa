#!/bin/bash

# Скрипт для исправления множественных head revisions в Alembic
# Использование: ./fix-migration-heads.sh

set -e

echo "🔧 Исправление множественных head revisions в Alembic"
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

echo "1️⃣ Проверка текущих head revisions..."
echo ""

# Получаем все head revisions
HEADS_OUTPUT=$(docker-compose exec -T backend alembic heads 2>&1)
echo "$HEADS_OUTPUT"
echo ""

# Извлекаем revision IDs
HEAD_REVISIONS=$(echo "$HEADS_OUTPUT" | grep -E "^[0-9a-f_]+" | awk '{print $1}' || echo "")

if [ -z "$HEAD_REVISIONS" ]; then
    error "Не удалось определить head revisions"
    exit 1
fi

HEAD_COUNT=$(echo "$HEAD_REVISIONS" | wc -l)

if [ "$HEAD_COUNT" -eq 1 ]; then
    success "Только один head revision, проблема решена!"
    CURRENT_HEAD=$(echo "$HEAD_REVISIONS" | head -n1)
    info "Текущий head: $CURRENT_HEAD"
    
    echo ""
    echo "2️⃣ Применение миграций до head..."
    if docker-compose exec -T backend alembic upgrade head 2>&1; then
        success "Все миграции применены успешно"
    else
        error "Не удалось применить миграции"
        exit 1
    fi
    exit 0
fi

warning "Обнаружено $HEAD_COUNT head revisions"
echo ""

echo "2️⃣ Анализ цепочки миграций..."
echo ""

# Ожидаемая финальная ревизия
TARGET_REVISION="004_rename_knowledge_chunks_metadata"

# Проверяем, есть ли целевая ревизия среди head
if echo "$HEAD_REVISIONS" | grep -q "$TARGET_REVISION"; then
    success "Целевая ревизия $TARGET_REVISION найдена среди head"
    info "Применяем миграции до $TARGET_REVISION..."
    
    if docker-compose exec -T backend alembic upgrade "$TARGET_REVISION" 2>&1; then
        success "Миграции применены до $TARGET_REVISION"
        
        # Проверяем, остались ли множественные head
        NEW_HEADS=$(docker-compose exec -T backend alembic heads 2>&1 | grep -E "^[0-9a-f_]+" | wc -l)
        if [ "$NEW_HEADS" -eq 1 ]; then
            success "Проблема с множественными head revisions решена!"
        else
            warning "Все еще есть множественные head revisions"
            info "Требуется создание merge миграции"
        fi
    else
        error "Не удалось применить миграции"
        exit 1
    fi
else
    warning "Целевая ревизия $TARGET_REVISION не найдена среди head"
    info "Доступные head revisions:"
    echo "$HEAD_REVISIONS" | while read -r rev; do
        echo "  - $rev"
    done
    echo ""
    
    # Пытаемся применить к первому head
    FIRST_HEAD=$(echo "$HEAD_REVISIONS" | head -n1)
    info "Попытка применения миграций до $FIRST_HEAD..."
    
    if docker-compose exec -T backend alembic upgrade "$FIRST_HEAD" 2>&1; then
        success "Миграции применены до $FIRST_HEAD"
    else
        error "Не удалось применить миграции"
        echo ""
        echo "3️⃣ Ручное исправление..."
        echo ""
        info "Выполните следующие команды вручную:"
        echo ""
        echo "  # 1. Проверьте текущие head revisions:"
        echo "  docker-compose exec backend alembic heads"
        echo ""
        echo "  # 2. Создайте merge миграцию для объединения head:"
        echo "  docker-compose exec backend alembic merge -m 'merge_heads' <revision1> <revision2>"
        echo ""
        echo "  # 3. Примените все миграции:"
        echo "  docker-compose exec backend alembic upgrade head"
        exit 1
    fi
fi

echo ""
echo "3️⃣ Финальная проверка..."
echo ""

# Проверяем финальное состояние
CURRENT_VERSION=$(docker-compose exec -T db psql -U postgres -d navbot -t -c "SELECT version_num FROM alembic_version;" 2>/dev/null | tr -d ' ' || echo "")

if [ -n "$CURRENT_VERSION" ]; then
    success "Текущая версия миграций: $CURRENT_VERSION"
else
    warning "Не удалось определить версию миграций"
fi

# Проверяем доступность backend
sleep 2
if curl -s -f http://127.0.0.1:8001/api/health > /dev/null 2>&1; then
    success "Backend доступен и отвечает"
else
    warning "Backend не отвечает на /api/health"
    info "Проверьте логи: docker-compose logs backend | tail -50"
fi

echo ""
success "Исправление завершено!"
