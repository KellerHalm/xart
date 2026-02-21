# Xart — неофициальный веб-клиент Anixart

Xart — неофициальный веб-клиент Anixart для просмотра аниме и манги. Проект включает фронтенд на Vue 3 и Go‑бэкенд для проксирования запросов к API.

Документация: [docs/README.md](docs/README.md)

## Состав проекта

- Frontend: Vue 3 (Composition API), TypeScript, Vite, Tailwind CSS, Pinia, Vue Router, Iconify, CropperJS, Markdown-it, Swiper.
- Backend (локально): Go HTTP‑сервер в `backend/`.
- Serverless API (Vercel): Go‑функция в `api/path.go`, маршрутизация через `vercel.json`.
- Changelog: `frontend/public/changelog` (используется эндпоинтом `/api/version`).

## Возможности

- Просмотр аниме и манги
- Поиск контента
- Авторизация пользователей
- Персонализированные рекомендации
- Рейтинг и комментарии
- Адаптивный дизайн
- Темная тема
- Хронология релизов

## Требования

- Node.js + npm
- Go 1.25.1+ для локального бэкенда
- Go 1.22+ для serverless‑функции (Vercel)

## Быстрый старт (Windows)

1. Запуск дев‑режима (скрипт откроет два окна PowerShell):
```bash
.\run-dev.ps1 -InstallDeps
```

2. Если используете CMD:
```bash
.\run-dev.cmd -InstallDeps
```

3. Порты можно переопределить:
```bash
.\run-dev.ps1 -BackendPort 8081 -FrontendPort 5174
```

## Запуск вручную

### Frontend

1. Установите зависимости:
```bash
cd frontend
npm install
```

2. Запустите dev‑сервер:
```bash
npm run dev -- --port 5173
```

3. Для сборки продакшен‑версии:
```bash
npm run build
```

### Backend (локально)

1. Запустите сервер:
```bash
cd backend
go run .
```

2. По умолчанию сервер запускается на порту 8080.

## Конфигурация

Frontend переменные окружения:
- `VITE_API_URL` — базовый префикс для прокси (по умолчанию `/api/proxy`). Укажите полный URL, если бэкенд находится на другом домене.

Backend и serverless‑функция поддерживают:
- `PORT` — порт сервера (только для локального бэкенда, по умолчанию 8080)
- `API_URL` — URL внешнего API (по умолчанию `https://api-s.anixsekai.com`)
- `CHANGELOG_DIR` — каталог changelog‑файлов (по умолчанию `../frontend/public/changelog` для `backend/` и `frontend/public/changelog` для Vercel)
- `CORS_ORIGIN` — разрешенные источники для CORS (по умолчанию `*`)

## Версия приложения

- `backend/main.go`: `CurrentAppVersion`
- `api/path.go`: `CurrentAppVersion`
- `frontend/src/api/config.ts`: `CURRENT_APP_VERSION`

## API

- `GET /healthz` — проверка статуса (локальный бэкенд и Vercel)
- `GET /api/healthz` — проверка статуса (только Vercel)
- `GET /api/version` — текущая версия и список предыдущих (читается из `frontend/public/changelog`)
- `GET/POST/OPTIONS /api/proxy/*` — прокси‑запросы к внешнему API
- `GET /api/image?url=...` — проксирование изображений (разрешены `*.anixmirai.com` и `*.anixsekai.com`)

Для прокси можно указать `API-Version: v2` (заголовок) или `API-Version=v2` (query).

## Развертывание

Подробные инструкции для Vercel находятся в [DEPLOY_VERCEL.md](DEPLOY_VERCEL.md).
