# Деплой

## Общая схема

В проекте два сценария:
- Vercel: фронтенд как статика + Go serverless‑функция (`api/path.go`).
- Self‑hosted: фронтенд как статика + отдельный Go‑сервис в `backend/`.

## Vercel

Подробные инструкции для Vercel находятся в `DEPLOY_VERCEL.md`.

## Переменные окружения

Vercel (serverless‑функция):
- `API_URL`
- `CORS_ORIGIN`
- `CHANGELOG_DIR`

Frontend:
- `VITE_API_URL` — базовый префикс API (по умолчанию `/api/proxy`).

Self‑hosted backend:
- `PORT`
- `API_URL`
- `CHANGELOG_DIR`
- `CORS_ORIGIN`
