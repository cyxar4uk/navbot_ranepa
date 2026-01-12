#!/bin/bash

# Комплексный скрипт для диагностики и исправления проблем с миграциями Alembic
# Использование: ./fix-migrations.sh

set -e  # Остановка при ошибках

echo "🔍 Комплексная диагностика и исправление миграций Alembic"
echo "=========================================================="
echo ""

PROJECT_DIR="/www/wwwroot/testingsmth.anyway-community.ru/navbot_ranepa"
cd "$PROJECT_DIR" || exit 1

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Функция для вывода ошибок
error() {
    echo -e "${RED}❌ $1${NC}"
}

# Функция для вывода успеха
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Функция для вывода предупреждений
warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Функция для вывода информации
info() {
    echo -e "ℹ️  $1"
}

echo "1️⃣ Проверка структуры миграций в файлах..."
echo ""

# Проверяем все файлы миграций
MIGRATION_FILES=(
    "001_initial.py"
    "002_rename_metadata_to_extra_data.py"
    "002_knowledge_chunks.py"
    "003_rename_knowledge_chunks_metadata.py"
)

declare -A REVISIONS
declare -A DOWN_REVISIONS

for file in "${MIGRATION_FILES[@]}"; do
    if [ -f "backend/alembic/versions/$file" ]; then
        REVISION=$(grep -E "^revision:\s*str\s*=" "backend/alembic/versions/$file" | sed -E "s/.*revision:\s*str\s*=\s*['\"](.*)['\"].*/\1/")
        DOWN_REV=$(grep -E "^down_revision:\s*Union\[str,\s*None\]\s*=" "backend/alembic/versions/$file" | sed -E "s/.*down_revision:\s*Union\[str,\s*None\]\s*=\s*['\"](.*)['\"].*/\1/" | sed "s/None//")
        
        if [ -z "$DOWN_REV" ] || [ "$DOWN_REV" = "None" ]; then
            DOWN_REV="None"
        fi
        
        REVISIONS["$file"]="$REVISION"
        DOWN_REVISIONS["$file"]="$DOWN_REV"
        
        info "  $file: revision=$REVISION, down_revision=$DOWN_REV"
    fi
done

echo ""
echo "2️⃣ Проверка текущего состояния базы данных..."
echo ""

# Проверяем, запущен ли контейнер базы данных
if ! docker-compose ps db | grep -q "Up"; then
    error "Контейнер базы данных не запущен!"
    echo "  Запустите: docker-compose up -d db"
    exit 1
fi

success "Контейнер базы данных запущен"

# Проверяем таблицу alembic_version
ALEMBIC_VERSION=$(docker-compose exec -T db psql -U postgres -d navbot -t -c "SELECT version_num FROM alembic_version;" 2>/dev/null | tr -d ' ' || echo "")

if [ -z "$ALEMBIC_VERSION" ]; then
    warning "Таблица alembic_version не существует или пуста"
    info "  Это означает, что миграции еще не применялись"
    ALEMBIC_VERSION="none"
else
    success "Текущая версия в базе данных: $ALEMBIC_VERSION"
fi

echo ""
echo "3️⃣ Проверка цепочки миграций..."
echo ""

# Ожидаемая цепочка: 001_initial -> 002_rename_metadata -> 003_knowledge_chunks -> 004_rename_knowledge_chunks_metadata
EXPECTED_CHAIN=("001_initial" "002_rename_metadata" "003_knowledge_chunks" "004_rename_knowledge_chunks_metadata")

# Проверяем цепочку
CHAIN_VALID=true
for i in "${!EXPECTED_CHAIN[@]}"; do
    CURRENT_REV="${EXPECTED_CHAIN[$i]}"
    if [ $i -gt 0 ]; then
        PREV_REV="${EXPECTED_CHAIN[$((i-1))]}"
        # Находим файл для текущей ревизии
        FOUND_FILE=""
        for file in "${!REVISIONS[@]}"; do
            if [ "${REVISIONS[$file]}" = "$CURRENT_REV" ]; then
                FOUND_FILE="$file"
                break
            fi
        done
        
        if [ -n "$FOUND_FILE" ]; then
            if [ "${DOWN_REVISIONS[$FOUND_FILE]}" != "$PREV_REV" ]; then
                error "Неверная цепочка: $FOUND_FILE указывает на ${DOWN_REVISIONS[$FOUND_FILE]}, ожидается $PREV_REV"
                CHAIN_VALID=false
            else
                success "  $PREV_REV -> $CURRENT_REV ($FOUND_FILE)"
            fi
        fi
    fi
done

if [ "$CHAIN_VALID" = false ]; then
    error "Обнаружены проблемы в цепочке миграций!"
    echo ""
    echo "4️⃣ Исправление цепочки миграций..."
    echo ""
    warning "Требуется ручное исправление файлов миграций"
    exit 1
fi

success "Цепочка миграций валидна"

echo ""
echo "4️⃣ Проверка множественных head revisions..."
echo ""

# Проверяем наличие множественных head revisions
HEADS=$(docker-compose exec -T backend alembic heads 2>&1 | grep -E "^[0-9a-f_]+" || echo "")

if echo "$HEADS" | grep -q "," || [ $(echo "$HEADS" | wc -l) -gt 1 ]; then
    error "Обнаружены множественные head revisions:"
    echo "$HEADS"
    echo ""
    echo "5️⃣ Исправление множественных head revisions..."
    echo ""
    
    # Пытаемся объединить head revisions
    info "Попытка объединения head revisions..."
    
    # Получаем все head revisions
    ALL_HEADS=$(docker-compose exec -T backend alembic heads 2>&1 | grep -E "^[0-9a-f_]+" | tr '\n' ' ')
    
    if [ -n "$ALL_HEADS" ]; then
        warning "Требуется ручное объединение head revisions"
        info "Выполните на сервере:"
        echo ""
        echo "  docker-compose exec backend alembic merge -m 'merge_heads' $ALL_HEADS"
        echo ""
        echo "Или примените миграции к конкретному head:"
        echo "  docker-compose exec backend alembic upgrade <revision>"
        echo ""
    fi
else
    success "Множественных head revisions не обнаружено"
    CURRENT_HEAD=$(echo "$HEADS" | head -n1)
    info "Текущий head: $CURRENT_HEAD"
fi

echo ""
echo "6️⃣ Проверка состояния таблиц в базе данных..."
echo ""

# Проверяем существование ключевых таблиц
TABLES=("events" "users" "knowledge_chunks")

for table in "${TABLES[@]}"; do
    EXISTS=$(docker-compose exec -T db psql -U postgres -d navbot -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '$table');" 2>/dev/null | tr -d ' ' || echo "f")
    
    if [ "$EXISTS" = "t" ]; then
        success "Таблица $table существует"
        
        # Для knowledge_chunks проверяем структуру колонок
        if [ "$table" = "knowledge_chunks" ]; then
            HAS_METADATA=$(docker-compose exec -T db psql -U postgres -d navbot -t -c "SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'knowledge_chunks' AND column_name = 'metadata');" 2>/dev/null | tr -d ' ' || echo "f")
            HAS_EXTRA_DATA=$(docker-compose exec -T db psql -U postgres -d navbot -t -c "SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'knowledge_chunks' AND column_name = 'extra_data');" 2>/dev/null | tr -d ' ' || echo "f")
            
            if [ "$HAS_METADATA" = "t" ] && [ "$HAS_EXTRA_DATA" = "f" ]; then
                warning "Таблица knowledge_chunks имеет колонку 'metadata' вместо 'extra_data'"
                info "  Требуется применение миграции 004_rename_knowledge_chunks_metadata"
            elif [ "$HAS_METADATA" = "f" ] && [ "$HAS_EXTRA_DATA" = "t" ]; then
                success "  Колонка 'extra_data' присутствует (правильно)"
            fi
        fi
    else
        warning "Таблица $table не существует"
    fi
done

echo ""
echo "7️⃣ Применение исправлений..."
echo ""

# Если есть множественные head revisions, пытаемся их исправить
if echo "$HEADS" | grep -q "," || [ $(echo "$HEADS" | wc -l) -gt 1 ]; then
    info "Попытка применения миграций к последнему head..."
    
    # Получаем последний head (004_rename_knowledge_chunks_metadata)
    TARGET_REVISION="004_rename_knowledge_chunks_metadata"
    
    info "Применение миграций до $TARGET_REVISION..."
    if docker-compose exec -T backend alembic upgrade "$TARGET_REVISION" 2>&1; then
        success "Миграции применены до $TARGET_REVISION"
    else
        error "Не удалось применить миграции"
        echo ""
        echo "8️⃣ Ручное исправление..."
        echo ""
        info "Выполните следующие команды вручную:"
        echo ""
        echo "  # 1. Проверьте текущие head revisions:"
        echo "  docker-compose exec backend alembic heads"
        echo ""
        echo "  # 2. Если есть несколько head, объедините их:"
        echo "  docker-compose exec backend alembic merge -m 'merge_heads' <revision1> <revision2>"
        echo ""
        echo "  # 3. Или примените к конкретному head:"
        echo "  docker-compose exec backend alembic upgrade <revision>"
        echo ""
        echo "  # 4. Затем примените все миграции:"
        echo "  docker-compose exec backend alembic upgrade head"
        exit 1
    fi
else
    info "Применение всех миграций до head..."
    if docker-compose exec -T backend alembic upgrade head 2>&1; then
        success "Все миграции применены успешно"
    else
        error "Не удалось применить миграции"
        exit 1
    fi
fi

echo ""
echo "8️⃣ Финальная проверка..."
echo ""

# Проверяем финальное состояние
FINAL_VERSION=$(docker-compose exec -T db psql -U postgres -d navbot -t -c "SELECT version_num FROM alembic_version;" 2>/dev/null | tr -d ' ' || echo "")

if [ -n "$FINAL_VERSION" ]; then
    success "Текущая версия миграций: $FINAL_VERSION"
else
    warning "Не удалось определить версию миграций"
fi

# Проверяем доступность backend
sleep 2
if curl -s -f http://127.0.0.1:8001/api/health > /dev/null 2>&1; then
    success "Backend доступен и отвечает"
else
    warning "Backend не отвечает на /api/health"
    info "Проверьте логи: docker-compose logs backend"
fi

echo ""
success "Диагностика и исправление завершены!"
echo ""
info "Если проблемы остались, проверьте логи:"
echo "  docker-compose logs backend | tail -50"
echo "  docker-compose exec backend alembic current"
echo "  docker-compose exec backend alembic heads"
