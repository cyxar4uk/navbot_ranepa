# Инструкция по очистке сервера перед деплоем

Если на сервере есть локальные изменения, которые мешают деплою, выполните на сервере:

```bash
cd /www/wwwroot/testingsmth.anyway-community.ru/navbot_ranepa

# Сохраните важные изменения (если есть)
git stash

# Или сделайте hard reset к последнему коммиту из репозитория
git fetch origin
git reset --hard origin/main  # или origin/master

# Удалите неотслеживаемые файлы
git clean -fd

# Проверьте статус
git status
```

После этого деплой должен работать без ошибок.
