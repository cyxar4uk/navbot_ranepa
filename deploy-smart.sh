#!/bin/bash

# Умный деплой: определяет какие сервисы изменились и пересобирает только их
# Использование: ./deploy-smart.sh

set -e

echo "🧠 Умный деплой: анализ изменений..."

# Получить последний коммит
LAST_DEPLOY_FILE=".last_deploy_commit"
if [ ! -f "$LAST_DEPLOY_FILE" ]; then
    echo "📝 Первый запуск, создаю маркер..."
    git rev-parse HEAD > "$LAST_DEPLOY_FILE"
fi

LAST_COMMIT=$(cat "$LAST_DEPLOY_FILE")
CURRENT_COMMIT=$(git rev-parse HEAD)

if [ "$LAST_COMMIT" = "$CURRENT_COMMIT" ]; then
    echo "ℹ️ Нет новых коммитов, проверяю изменения в файлах..."
    # Проверяем изменения в рабочей директории
    if git diff --quiet HEAD; then
        echo "✅ Нет изменений, перезапускаю контейнеры..."
        docker-compose down --remove-orphans
        docker-compose up -d
        echo "✅ Деплой завершён (только перезапуск)"
        exit 0
    fi
fi

echo "📊 Анализ изменений между $LAST_COMMIT и $CURRENT_COMMIT..."

# Определяем какие сервисы нужно пересобрать
SERVICES_TO_BUILD=()

# Проверяем изменения в backend
if git diff --name-only "$LAST_COMMIT" "$CURRENT_COMMIT" | grep -q "^backend/"; then
    echo "  🔄 Backend изменён"
    SERVICES_TO_BUILD+=("backend")
fi

# Проверяем изменения в frontend
if git diff --name-only "$LAST_COMMIT" "$CURRENT_COMMIT" | grep -q "^frontend/"; then
    echo "  🔄 Frontend изменён"
    SERVICES_TO_BUILD+=("frontend")
fi

# Проверяем изменения в docker-compose.yml или Dockerfile
if git diff --name-only "$LAST_COMMIT" "$CURRENT_COMMIT" | grep -qE "^(docker-compose\.yml|.*/Dockerfile)"; then
    echo "  🔄 Docker конфигурация изменена - пересоберу все сервисы"
    SERVICES_TO_BUILD=("backend" "frontend")
fi

# Если нет изменений в коде, но есть новый коммит - просто перезапуск
if [ ${#SERVICES_TO_BUILD[@]} -eq 0 ]; then
    echo "ℹ️ Нет изменений в коде, перезапускаю контейнеры..."
    docker-compose down --remove-orphans
    docker-compose up -d
    git rev-parse HEAD > "$LAST_DEPLOY_FILE"
    echo "✅ Деплой завершён (только перезапуск)"
    exit 0
fi

echo "🛑 Остановка контейнеров..."
docker-compose down --remove-orphans

# Пересобираем только измененные сервисы
echo "🔨 Пересборка сервисов: ${SERVICES_TO_BUILD[*]}"
for service in "${SERVICES_TO_BUILD[@]}"; do
    echo "  🔨 Сборка $service..."
    docker-compose build "$service"
done

# Очистка dangling images
echo "🧹 Очистка dangling images..."
docker image prune -f

# Запуск
echo "🚀 Запуск контейнеров..."
docker-compose up -d

# Обновляем маркер последнего деплоя
git rev-parse HEAD > "$LAST_DEPLOY_FILE"

# Проверка
echo ""
echo "✅ Проверка статуса контейнеров..."
docker-compose ps

echo ""
echo "🏥 Проверка здоровья backend..."
sleep 3
if curl -f -s http://127.0.0.1:${BACKEND_PORT:-8001}/health >/dev/null 2>&1; then
    echo "✅ Backend здоров"
else
    echo "⚠️ Backend не отвечает (может потребоваться больше времени)"
fi

echo ""
echo "✅ Умный деплой завершён!"
