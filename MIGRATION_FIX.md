# 🔧 Исправление проблем с миграциями Alembic

## Проблема: Multiple head revisions

Если вы видите ошибку:
```
ERROR [alembic.util.messaging] Multiple head revisions are present for given argument 'head'
```

Это означает, что в базе данных есть несколько "головных" миграций, которые не связаны в одну цепочку.

## Быстрое решение

### Вариант 1: Синхронизация версии Alembic (рекомендуется при ошибке "relation already exists")

Если вы видите ошибку `relation "events" already exists`, это означает, что таблицы уже существуют, но версия в `alembic_version` не синхронизирована.

```bash
cd /www/wwwroot/testingsmth.anyway-community.ru/navbot_ranepa

# 1. Получите последние изменения
git pull

# 2. Пересоберите backend (чтобы получить обновленную миграцию)
docker-compose build backend
docker-compose up -d backend

# 3. Сделайте скрипт исполняемым
chmod +x sync-alembic-version.sh

# 4. Запустите синхронизацию версии
./sync-alembic-version.sh
```

Этот скрипт:
- Проверит существование таблиц в базе данных
- Определит правильную версию миграций на основе структуры БД
- Установит правильную версию в `alembic_version`
- Применит оставшиеся миграции до head

### Вариант 2: Исправление множественных head revisions

Если вы видите ошибку "Multiple head revisions":

```bash
cd /www/wwwroot/testingsmth.anyway-community.ru/navbot_ranepa

# 1. Получите последние изменения
git pull

# 2. Сделайте скрипты исполняемыми
chmod +x fix-migration-heads.sh

# 3. Запустите автоматическое исправление
./fix-migration-heads.sh
```

### Вариант 2: Ручное исправление

```bash
cd /www/wwwroot/testingsmth.anyway-community.ru/navbot_ranepa

# 1. Проверьте текущие head revisions
docker-compose exec backend alembic heads

# 2. Если видите несколько head, примените к целевому (004_rename_knowledge_chunks_metadata)
docker-compose exec backend alembic upgrade 004_rename_knowledge_chunks_metadata

# 3. Проверьте, что остался только один head
docker-compose exec backend alembic heads

# 4. Примените все миграции до head
docker-compose exec backend alembic upgrade head
```

### Вариант 3: Полная диагностика

```bash
cd /www/wwwroot/testingsmth.anyway-community.ru/navbot_ranepa

# Запустите комплексную диагностику
chmod +x fix-migrations.sh
./fix-migrations.sh
```

## Ожидаемая цепочка миграций

Правильная цепочка миграций:
```
001_initial
  ↓
002_rename_metadata
  ↓
003_knowledge_chunks
  ↓
004_rename_knowledge_chunks_metadata
```

## Проверка после исправления

```bash
# 1. Проверьте текущую версию миграций
docker-compose exec backend alembic current

# 2. Проверьте, что только один head
docker-compose exec backend alembic heads

# 3. Проверьте доступность backend
curl http://127.0.0.1:8001/api/health

# 4. Проверьте логи
docker-compose logs backend | tail -30
```

## Если проблема не решается

1. **Проверьте логи backend:**
   ```bash
   docker-compose logs backend | tail -50
   ```

2. **Проверьте состояние базы данных:**
   ```bash
   docker-compose exec db psql -U postgres -d navbot -c "SELECT version_num FROM alembic_version;"
   ```

3. **Проверьте структуру таблиц:**
   ```bash
   docker-compose exec db psql -U postgres -d navbot -c "\d knowledge_chunks"
   ```

4. **Если нужно, создайте merge миграцию вручную:**
   ```bash
   # Получите все head revisions
   docker-compose exec backend alembic heads
   
   # Создайте merge миграцию
   docker-compose exec backend alembic merge -m "merge_heads" <revision1> <revision2>
   
   # Примените все миграции
   docker-compose exec backend alembic upgrade head
   ```

## Безопасность миграций

Все миграции теперь проверяют существование колонок перед их изменением:
- ✅ `002_rename_metadata_to_extra_data` - проверяет наличие колонок перед переименованием
- ✅ `004_rename_knowledge_chunks_metadata` - проверяет наличие колонок перед переименованием

Это предотвращает ошибки, если миграции применяются в неправильном порядке или если структура базы данных уже соответствует ожидаемой.
