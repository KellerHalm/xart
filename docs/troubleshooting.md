# Troubleshooting

## Frontend не видит API

Проверьте:
- Запущен ли бэкенд на `http://localhost:8080`.
- Правильно ли задан `VITE_API_URL` (если используете другой адрес).
- Прокси `/api` в `vite.config.ts` указывает на нужный адрес.

## Ошибка CORS

- Установите `CORS_ORIGIN` на нужный домен.
- Перезапустите бэкенд после изменения переменных окружения.

## 403 на `/api/image`

- Домен изображения не входит в whitelist `*.anixmirai.com` или `*.anixsekai.com`.
- URL использует схему, отличную от `http/https`.

## `/api/version` возвращает ошибку

- Проверьте наличие каталога `frontend/public/changelog`.
- Убедитесь, что в каталоге есть файлы `*.md`.

## Команды npm не работают

- Выполните `npm install` в `frontend`.
- Для Windows можно использовать `run-dev.ps1 -InstallDeps`.
