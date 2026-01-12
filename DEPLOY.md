# Инструкция по настройке автоматического деплоя

## Вариант 1: GitHub Actions (Рекомендуется)

### Шаг 1: Настройка SSH ключа на сервере

1. На сервере создайте SSH ключ (если еще нет):
```bash
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions
```

2. Добавьте публичный ключ в `~/.ssh/authorized_keys`:
```bash
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys
```

3. Скопируйте **приватный** ключ (`~/.ssh/github_actions`) - он понадобится для GitHub Secrets

### Шаг 2: Настройка GitHub Secrets

В репозитории GitHub перейдите: **Settings → Secrets and variables → Actions → New repository secret**

Добавьте следующие секреты:

- `SERVER_HOST` - IP адрес или домен сервера (например: `208.92.227.20`)
- `SERVER_USER` - пользователь для SSH (обычно `root`)
- `SSH_PRIVATE_KEY` - содержимое приватного ключа (`~/.ssh/github_actions`)
- `SSH_PORT` - порт SSH (обычно `22`, можно не указывать)

### Шаг 3: Проверка

После настройки при каждом push в `main` или `master` ветку будет автоматически:
1. Подключение к серверу по SSH
2. `git pull` в директории проекта
3. Пересборка и перезапуск Docker контейнеров
4. Применение миграций БД

---

## Вариант 2: Git Hook на сервере (Проще, но требует доступа к серверу)

### Шаг 1: Создайте post-receive hook

На сервере выполните:

```bash
cd /www/wwwroot/testingsmth.anyway-community.ru/navbot_ranepa
mkdir -p .git/hooks
```

### Шаг 2: Создайте файл `.git/hooks/post-receive`

```bash
cat > .git/hooks/post-receive << 'EOF'
#!/bin/bash
cd /www/wwwroot/testingsmth.anyway-community.ru/navbot_ranepa
git pull origin main || git pull origin master
docker-compose down
docker-compose up -d --build
docker-compose exec -T backend alembic upgrade head 2>/dev/null || echo "Migrations skipped"
EOF

chmod +x .git/hooks/post-receive
```

### Шаг 3: Настройте remote на вашем локальном компьютере

```bash
git remote add deploy root@208.92.227.20:/www/wwwroot/testingsmth.anyway-community.ru/navbot_ranepa/.git
```

Теперь можно деплоить командой:
```bash
git push deploy main
```

---

## Вариант 3: Простой скрипт с cron (Для тестирования)

### Создайте скрипт деплоя

```bash
cat > /www/wwwroot/testingsmth.anyway-community.ru/navbot_ranepa/deploy.sh << 'EOF'
#!/bin/bash
cd /www/wwwroot/testingsmth.anyway-community.ru/navbot_ranepa
git pull
docker-compose up -d --build
EOF

chmod +x /www/wwwroot/testingsmth.anyway-community.ru/navbot_ranepa/deploy.sh
```

### Настройте cron (опционально, для автоматической проверки)

```bash
crontab -e
# Добавьте строку (проверка каждые 5 минут):
*/5 * * * * cd /www/wwwroot/testingsmth.anyway-community.ru/navbot_ranepa && git fetch && [ $(git rev-parse HEAD) != $(git rev-parse @{u}) ] && ./deploy.sh
```

---

## Вариант 4: Webhook от GitHub (Через aaPanel)

Если в aaPanel есть поддержка webhooks:

1. В GitHub репозитории: **Settings → Webhooks → Add webhook**
2. Payload URL: `http://your-server/webhook/deploy` (если настроен)
3. Content type: `application/json`
4. Events: `Just the push event`

На сервере создайте простой PHP скрипт для обработки webhook (если нужно).

---

## Рекомендация

**Используйте Вариант 1 (GitHub Actions)** - это самый надежный и современный способ.

После настройки каждый `git push` будет автоматически деплоить изменения на сервер!
