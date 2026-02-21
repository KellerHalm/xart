# API

Ниже перечислены эндпоинты, которые предоставляет бэкенд Xart (локальный или Vercel).

## Проверка здоровья

`GET /healthz` — локальный бэкенд и Vercel.

`GET /api/healthz` — только Vercel.

Ответ:
```json
{ "status": "ok" }
```

## Версия приложения

`GET /api/version`

`GET /api/version/{version}` — параметр пока не используется, возвращается тот же ответ.

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
- `User-Agent` устанавливается на значение `DefaultUserAgent`.
- Для API v2 можно указать `API-Version: v2` (заголовок) или `API-Version=v2` (query).

## Прокси изображений

`GET /api/image?url=...`

Ограничения:
- Разрешены только схемы `http` и `https`.
- Разрешены только домены `*.anixmirai.com` и `*.anixsekai.com`.
- Если upstream не вернул `Content-Type: image/*`, запрос будет отклонен.

## CORS

- `Access-Control-Allow-Origin` настраивается через `CORS_ORIGIN`.
- Применяется к `/api/version`, `/api/proxy/*`, `/api/image`.
- Разрешенные методы: `GET, POST, OPTIONS`.
- Разрешенные заголовки: `Content-Type, API-Version, Api-Version, Sign`.
