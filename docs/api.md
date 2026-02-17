# API

Ниже перечислены эндпоинты, которые предоставляет бэкенд Xart.

## Проверка здоровья

`GET /healthz`

Ответ:
```json
{ "status": "ok" }
```

## Версия приложения

`GET /api/version`

`GET /api/version/{version}`

Возвращает текущую версию и список предыдущих версий, найденных в `CHANGELOG_DIR`:

```json
{
  "version": "3.9.2",
  "previous": ["3.9.1", "3.9.0"]
}
```

## Прокси к внешнему API

`GET/POST/OPTIONS /api/proxy/*`

Особенности:
- Тело и заголовки запроса пересылаются во внешний API.
- `User-Agent` устанавливается на значение `DefaultUserAgent` из `backend/main.go`.
- Для API v2 можно указать `API-Version=v2` в query-параметрах или передать заголовок `API-Version: v2`.

## Прокси изображений

`GET /api/image?url=...`

Ограничения:
- Разрешены только схемы `http` и `https`.
- Разрешены только домены `*.anixmirai.com` и `*.anixsekai.com`.
- Если upstream не вернул `Content-Type: image/*`, запрос будет отклонен.

## CORS

- `Access-Control-Allow-Origin` настраивается через `CORS_ORIGIN`.
- Разрешенные методы: `GET, POST, OPTIONS`.
- Разрешенные заголовки: `Content-Type, API-Version, Api-Version, Sign`.
