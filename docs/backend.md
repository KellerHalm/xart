# Backend

Бэкенд написан на Go и поставляется в двух вариантах:
- локальный HTTP‑сервер в `backend/`;
- serverless‑функция для Vercel в `api/path.go`.

Обе реализации разделяют одну и ту же логику проксирования и эндпоинтов.

## Запуск локального бэкенда

```bash
cd backend
go run .
```

По умолчанию сервер запускается на порту `8080`.

## Запуск serverless‑функции (Vercel)

Функция находится в `api/path.go` и собирается Vercel. Локальный запуск возможен через Vercel CLI, но отдельный скрипт в репозитории не предусмотрен.

## Переменные окружения

Локальный бэкенд (`backend/`):
- `PORT` — порт HTTP‑сервера (по умолчанию `8080`).
- `API_URL` — URL внешнего API (по умолчанию `https://api-s.anixsekai.com`).
- `CHANGELOG_DIR` — каталог с файлами changelog (по умолчанию `../frontend/public/changelog`).
- `CORS_ORIGIN` — разрешенный источник для CORS (по умолчанию `*`).

Serverless‑функция (`api/`):
- `API_URL` — URL внешнего API (по умолчанию `https://api-s.anixsekai.com`).
- `CHANGELOG_DIR` — каталог с файлами changelog (по умолчанию `frontend/public/changelog`).
- `CORS_ORIGIN` — разрешенный источник для CORS (по умолчанию `*`).

## Эндпоинты

Полный список эндпоинтов описан в `docs/api.md`.

## Версии приложения

Текущая версия задается константой `CurrentAppVersion` в `backend/main.go` и `api/path.go`. Список предыдущих версий формируется по файлам `*.md` в каталоге changelog.

## Прокси изображений

Эндпоинт `/api/image` принимает параметр `url` и проксирует изображение только если:
- URL использует `http` или `https`.
- Хост входит в whitelist: `*.anixmirai.com` или `*.anixsekai.com`.

## CORS

CORS включен для `/api/version`, `/api/proxy/*` и `/api/image` и использует значение из `CORS_ORIGIN`.
