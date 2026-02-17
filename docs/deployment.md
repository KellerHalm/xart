# Деплой

## Общая схема

- Frontend собирается Vite и публикуется как статические файлы.
- Backend запускается как отдельный Go-сервис.

## Vercel

Подробные инструкции для Vercel находятся в `DEPLOY_VERCEL.md`.

## Переменные окружения бэкенда

- `PORT`
- `API_URL`
- `CHANGELOG_DIR`
- `CORS_ORIGIN`
