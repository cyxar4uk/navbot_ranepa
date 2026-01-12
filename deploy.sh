#!/bin/bash

# Скрипт для ручного деплоя на сервере
# Использование: ./deploy.sh

set -e  # Остановка при ошибке

echo "🚀 Starting deployment..."

# Переход в директорию проекта
PROJECT_DIR="/www/wwwroot/testingsmth.anyway-community.ru/navbot_ranepa"
cd "$PROJECT_DIR" || { echo "❌ Error: Cannot access project directory"; exit 1; }

# Проверка что мы в правильной директории
if [ ! -f "docker-compose.yml" ]; then
  echo "❌ Error: docker-compose.yml not found. Wrong directory?"
  exit 1
fi

# Обновление кода
echo "📥 Pulling latest changes..."
git pull origin main || git pull origin master

# Остановка контейнеров ТОЛЬКО этого проекта
echo "🛑 Stopping containers..."
docker-compose -f docker-compose.yml down

# Пересборка и запуск ТОЛЬКО этого проекта
echo "🔨 Building and starting containers..."
docker-compose -f docker-compose.yml up -d --build

# Применение миграций
echo "🗄️ Running database migrations..."
docker-compose -f docker-compose.yml exec -T backend alembic upgrade head 2>/dev/null || echo "⚠️ Migrations skipped or already applied"

# Проверка статуса
echo "✅ Checking container status..."
docker-compose ps

echo "🎉 Deployment completed!"
