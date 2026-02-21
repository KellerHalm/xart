# Архитектура

Xart состоит из фронтенда (Vue 3) и Go‑бэкенда. Бэкенд доступен в двух вариантах:
- локальный HTTP‑сервер в `backend/` для разработки и self‑hosted деплоя;
- serverless‑функция для Vercel в `api/path.go`, маршрутизация через `vercel.json`.

Фронтенд обращается к API через префикс `API_PREFIX` (по умолчанию `/api/proxy`), который можно переопределить переменной окружения `VITE_API_URL`.

## Компоненты

### Frontend
- SPA на Vue 3 (Composition API) и TypeScript.
- Состояние хранится в Pinia, persisted state через `pinia-plugin-persistedstate`.
- Сборка и dev‑сервер — Vite.
- PWA через `vite-plugin-pwa`.

### Backend
- Go HTTP‑сервер и serverless‑функция разделяют одинаковую логику.
- Эндпоинты: `/api/proxy/*`, `/api/version`, `/api/image`.
- `/healthz` доступен локально и в Vercel, `/api/healthz` — только в Vercel.

## Поток данных

### Dev (локально)
1. Браузер загружает фронтенд.
2. Фронтенд вызывает `/api/*`.
3. Vite проксирует `/api` на `http://localhost:8080`.
4. Go‑бэкенд обрабатывает запрос и, если это прокси, пересылает его во внешний API.

### Vercel (production)
1. Статика фронтенда отдается из `frontend/dist`.
2. `vercel.json` маршрутизирует `/api/*` и `/healthz` в serverless‑функцию `api/path.go`.
3. Все остальные маршруты отдаются как SPA (`/index.html`).

## PWA

PWA включена через `vite-plugin-pwa`.
- Service Worker регистрируется автоматически.
- Навигационные запросы имеют fallback на `/index.html`.
- Путь `/api/*` исключен из fallback.

## Границы безопасности

- Прокси изображений принимает только `http/https` URL и домены `*.anixmirai.com` или `*.anixsekai.com`.
- CORS для API‑эндпоинтов настраивается через `CORS_ORIGIN`.
