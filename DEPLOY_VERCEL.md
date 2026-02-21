# Деплой на Vercel

Репозиторий настроен для деплоя из корня проекта с использованием `vercel.json`.

## Что разворачивается

- Frontend собирается Vite и публикуется из `frontend/dist`.
- Serverless API разворачивается как Go‑функция из `api/path.go` (Go 1.22).
- Маршруты `/api/*` и `/healthz` проксируются на serverless‑функцию, чтобы фронтенд мог обращаться к API без изменений.

## Настройки сборки (из `vercel.json`)

- `installCommand`: `npm ci --prefix frontend`
- `buildCommand`: `npm run build --prefix frontend`
- `outputDirectory`: `frontend/dist`
- В serverless‑функцию включаются файлы changelog из `frontend/public/changelog/**`.

## Шаги деплоя

1. Импортируйте репозиторий в Vercel.
2. Root Directory = корень репозитория.
3. Framework Preset = Other.
4. При необходимости задайте переменные окружения (см. ниже).
5. Запустите деплой.

## Переменные окружения

Serverless‑функция:
- `API_URL` — URL внешнего API (по умолчанию `https://api-s.anixsekai.com`).
- `CORS_ORIGIN` — разрешенные источники CORS (по умолчанию `*`).
- `CHANGELOG_DIR` — каталог с changelog‑файлами (по умолчанию `frontend/public/changelog`).

Frontend:
- `VITE_API_URL` — базовый префикс для прокси. Если бэкенд находится на другом домене, укажите полный URL. Если бэкенд в Vercel, оставьте пустым, чтобы использовать `/api/proxy`.

## Локальная проверка перед деплоем

```bash
npm ci --prefix frontend
npm run build --prefix frontend

cd api
go test ./...
```

## Полезно знать

- Запросы `GET /healthz` и `GET /api/healthz` обслуживаются serverless‑функцией.
- Роутинг `/api/version`, `/api/proxy/*`, `/api/image` настроен через `vercel.json`.
- Все остальные маршруты отдаются как SPA (`/index.html`).
- Для preview/production доменов обычно стоит ограничить `CORS_ORIGIN` конкретным доменом.
