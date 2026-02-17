# Деплой на Vercel

Репозиторий настроен для деплоя из корня проекта (`xart`) с использованием `vercel.json`.

## Что разворачивается

- Frontend собирается Vite и публикуется из `frontend/dist`.
- Backend разворачивается как serverless‑функция на Go из `api/path.go`.
- Маршруты `/api/*` проксируются на serverless‑функцию, чтобы фронтенд мог обращаться к API без изменений.

## Настройки сборки (из `vercel.json`)

- `installCommand`: `npm ci --prefix frontend`
- `buildCommand`: `npm run build --prefix frontend`
- `outputDirectory`: `frontend/dist`
- В serverless‑функцию включаются файлы changelog из `frontend/public/changelog/**`.

## Шаги деплоя

1. Импортируйте репозиторий в Vercel.
2. Оставьте Root Directory = корень репозитория (`xart`).
3. При необходимости задайте переменные окружения (см. ниже).
4. Запустите деплой.

## Переменные окружения

- `API_URL` — URL внешнего API (по умолчанию `https://api-s.anixsekai.com`).
- `CORS_ORIGIN` — разрешенные источники CORS (по умолчанию `*`).
- `CHANGELOG_DIR` — каталог с changelog-файлами (по умолчанию `frontend/public/changelog`).

## Локальная проверка перед деплоем

```bash
cd frontend
npm ci
npm run build

cd ..\api
go test ./...
```

## Полезно знать

- Запросы `GET /healthz` и `GET /api/healthz` обслуживаются serverless‑функцией.
- Роутинг `/api/version`, `/api/proxy/*`, `/api/image` настроен через `vercel.json`.
- Все остальные маршруты отдаются как SPA (`/index.html`).
