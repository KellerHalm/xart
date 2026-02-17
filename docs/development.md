# Разработка

## Требования

- Node.js и npm для фронтенда.
- Go 1.25.1 или выше для бэкенда.

## Быстрый старт (Windows)

Запуск фронтенда и бэкенда в отдельных окнах PowerShell:

```bash
.\run-dev.ps1 -InstallDeps
```

Если используете CMD:

```bash
.\run-dev.cmd -InstallDeps
```

Переопределение портов:

```bash
.\run-dev.ps1 -BackendPort 8081 -FrontendPort 5174
```

## Запуск вручную

Frontend:

```bash
cd frontend
npm install
npm run dev -- --port 5173
```

Backend:

```bash
cd backend
go run .
```

## Переменные окружения фронтенда

- `VITE_API_URL` - позволяет указать другой префикс API вместо `/api/proxy`.
