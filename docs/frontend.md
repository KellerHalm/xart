# Frontend

Frontend реализован на Vue 3 и собирается Vite. Основная точка входа находится в `src/main.ts`.

## Структура каталогов

- `src/api` - конфигурация и утилиты для работы с API.
- `src/assets` - статические ресурсы.
- `src/components` - переиспользуемые компоненты.
- `src/constants` - константы проекта.
- `src/pages` - страницы приложения.
- `src/router` - маршрутизация.
- `src/store` - хранилища Pinia.

## Инициализация приложения

В `src/main.ts` создается приложение, подключаются Pinia, router и persisted state:

```ts
import { createApp } from "vue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import App from "./App.vue";
import router from "./router";

const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

app.use(pinia);
app.use(router);
app.mount("#app");
```

## Конфигурация API

В `src/api/config.ts` определены:
- `API_PREFIX` - базовый префикс API. По умолчанию используется `/api/proxy`.
- `VITE_API_URL` - переменная окружения, которая позволяет указать другой префикс (например, URL внешнего бэкенда).
- Константы `ENDPOINTS` с путями внешнего API.

## Дев-сервер и прокси

В `vite.config.ts` задан прокси, который отправляет запросы `/api` на бэкенд `http://localhost:8080`.

## PWA

PWA настраивается в `vite.config.ts` через `vite-plugin-pwa`.
- Автообновление Service Worker.
- Предустановленный манифест и набор иконок.
- Навигационный fallback на `/index.html`.

## Скрипты

- `npm run dev` - запуск dev-сервера.
- `npm run build` - сборка продакшен-версии.
- `npm run preview` - локальный просмотр собранной версии.
