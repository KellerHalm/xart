# Xart - неофициальный веб-клиент Anixart

Xart - это неофициальный веб-клиент Anixart для просмотра аниме и манги. Проект состоит из фронтенда на Vue 3 и бэкенда на Go. Приложение предоставляет интерфейс для поиска, просмотра и отслеживания контента с авторизацией и персонализацией.

Документация: `docs/README.md`

## Архитектура

### Frontend
- Фреймворк: Vue 3 (Composition API)
- Язык: TypeScript
- Стили: Tailwind CSS
- Маршрутизация: Vue Router
- Состояние: Pinia
- Сборка: Vite
- Иконки: Iconify
- Дополнительно: CropperJS, Markdown-it, Swiper

### Backend
- Язык: Go 1.25.1
- Тип: HTTP-сервер
- Версия приложения: 3.9.2
- Назначение: проксирование запросов к API anixart и выдача версии приложения

## Функциональность

### Frontend
- Просмотр аниме и манги
- Поиск контента
- Авторизация пользователей
- Персонализированные рекомендации
- Рейтинг и комментарии
- Адаптивный дизайн
- Темная тема
- Хронология релизов

### Backend
- Проксирование запросов к API anixart.com
- Управление версиями приложения
- Обработка CORS
- Логирование запросов
- Проксирование изображений (whitelist доменов)

## Технологии

### Frontend
- Vue 3
- TypeScript
- Tailwind CSS
- Pinia
- Vue Router
- Vite
- CropperJS
- Markdown-it
- Swiper

### Backend
- Go
- HTTP-сервер
- JSON API

## Быстрый старт (Windows)

1. Запуск дев-режима в двух окнах PowerShell:
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

## Установка и запуск вручную

### Frontend

1. Установите зависимости:
```bash
cd frontend
npm install
```

2. Запустите dev-сервер:
```bash
npm run dev -- --port 5173
```

3. Для сборки продакшен-версии:
```bash
npm run build
```

### Backend

1. Убедитесь, что у вас установлена Go 1.25.1 или выше.

2. Запустите сервер:
```bash
cd backend
go run .
```

3. По умолчанию сервер запускается на порту 8080.

## Переменные окружения

Backend поддерживает следующие переменные окружения:

- `PORT` - порт, на котором будет запущен сервер (по умолчанию 8080)
- `API_URL` - URL внешнего API (по умолчанию https://api-s.anixsekai.com)
- `CHANGELOG_DIR` - директория с файлами изменений (по умолчанию ../frontend/public/changelog)
- `CORS_ORIGIN` - разрешенные источники для CORS (по умолчанию *)

## Структура проекта

```
xart/
|- backend/              # Go-сервер
|  |- go.mod             # Зависимости Go
|  `- main.go            # Основной файл сервера
|- frontend/             # Vue.js приложение
|  |- public/            # Публичные ресурсы
|  |- src/               # Исходный код
|  |  |- assets/         # Статические ресурсы
|  |  |- components/     # Компоненты Vue
|  |  |- views/          # Страницы приложения
|  |  |- router/         # Маршруты
|  |  `- stores/         # Хранилища Pinia
|  |- index.html         # Главная HTML-страница
|  `- package.json       # Зависимости и скрипты
|- run-dev.cmd           # Скрипт запуска для Windows (CMD)
`- run-dev.ps1           # Скрипт запуска для Windows (PowerShell)
```

## API

Backend предоставляет следующие эндпоинты:

- `GET /healthz` - проверка статуса сервера
- `GET /api/version` - информация о текущей версии приложения
- `GET /api/version/{version}` - информация о конкретной версии
- `GET/POST/OPTIONS /api/proxy/*` - прокси-запросы к внешнему API
- `GET /api/image?url=...` - проксирование изображений, разрешены домены *.anixmirai.com и *.anixsekai.com

## Развертывание

Подробные инструкции для Vercel находятся в `DEPLOY_VERCEL.md`.
