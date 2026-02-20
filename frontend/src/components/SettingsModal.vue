<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
    <div class="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-black/10 bg-[color:var(--xart-panel)] p-4 shadow-xl dark:border-white/10 sm:p-6">
      <div class="flex items-center justify-between border-b border-black/10 pb-4 dark:border-white/10">
        <h2 class="section-title text-xl">Настройки</h2>
        <button class="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white" @click="emit('close')">
          ✕
        </button>
      </div>

      <div class="mt-6 space-y-6">
        <div class="flex items-center gap-2">
          <span class="iconify material-symbols--palette-outline h-6 w-6"></span>
          <p class="section-title text-lg">Интерфейс</p>
        </div>
        <div class="settings-row">
          <p>Тема</p>
          <div class="flex items-center gap-2">
            <button
              class="tab-pill rounded-lg px-4 py-2 text-sm"
              :class="preferences.flags.theme === 'light' ? 'tab-pill-active' : ''"
              @click="setTheme('light')"
            >
              Светлая
            </button>
            <button
              class="tab-pill rounded-lg px-4 py-2 text-sm"
              :class="preferences.flags.theme === 'dark' ? 'tab-pill-active' : ''"
              @click="setTheme('dark')"
            >
              Темная
            </button>
          </div>
        </div>
        <div class="settings-row">
          <p class="max-w-96">Пропускать страницу выбора категорий</p>
          <input
            type="checkbox"
            class="h-5 w-5 shrink-0"
            :checked="preferences.params.skipToCategory.enabled"
            @change="toggleSkipCategory"
          />
        </div>
        <div v-if="preferences.params.skipToCategory.enabled" class="space-y-4">
          <div class="settings-row">
            <p>Категория домашней страницы</p>
            <select
              class="input-dark max-w-full rounded-lg px-3 py-2 text-sm sm:min-w-[11rem]"
              :value="preferences.params.skipToCategory.homeCategory"
              @change="setHomeCategory"
            >
              <option v-for="(label, key) in homeCategory" :key="key" :value="key">
                {{ label }}
              </option>
            </select>
          </div>
          <div class="settings-row">
            <p>Категория страницы закладок</p>
            <select
              class="input-dark max-w-full rounded-lg px-3 py-2 text-sm sm:min-w-[11rem]"
              :value="preferences.params.skipToCategory.bookmarksCategory"
              @change="setBookmarksCategory"
            >
              <option v-for="(label, key) in bookmarksCategory" :key="key" :value="key">
                {{ label }}
              </option>
            </select>
          </div>
        </div>

        <div v-if="userStore.isAuth" class="settings-row">
          <p>Пятый пункт в навигации</p>
          <select
            class="input-dark max-w-full rounded-lg px-3 py-2 text-sm sm:min-w-[11rem]"
            :value="preferences.flags.showFifthButton === 'favorites' ? 'none' : (preferences.flags.showFifthButton ?? 'none')"
            @change="setFifthButton"
          >
            <option value="none">Не показывать</option>
            <option v-for="(label, key) in fifthButton" :key="key" :value="key">
              {{ label }}
            </option>
          </select>
        </div>

        <div class="border-t border-black/10 pt-4 dark:border-white/10">
          <div class="flex items-center gap-2">
            <span class="iconify material-symbols--settings-outline h-6 w-6"></span>
            <p class="section-title text-lg">Приложение</p>
          </div>
          <div class="settings-row mt-4">
            <p>Показывать список изменений</p>
            <input
              type="checkbox"
              class="h-5 w-5 shrink-0"
              :checked="preferences.flags.showChangelog"
              @change="toggleChangelog"
            />
          </div>
          <div class="settings-row mt-4">
            <div>
              <p>Сохранять историю просмотра</p>
              <p class="max-w-sm break-words text-sm text-gray-400">
                При отключении история не сохраняется локально и в аккаунте.
              </p>
            </div>
            <input
              type="checkbox"
              class="h-5 w-5 shrink-0"
              :checked="preferences.flags.saveWatchHistory"
              @change="toggleWatchHistory"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePreferencesStore } from "@/store/preferences";
import { useUserStore } from "@/store/auth";

defineProps<{ isOpen: boolean }>();
const emit = defineEmits<{ (e: "close"): void }>();

const preferences = usePreferencesStore();
const userStore = useUserStore();

const homeCategory: Record<string, string> = {
  last: "Последние релизы",
  finished: "Завершенные релизы",
  ongoing: "Выходит",
  announce: "Анонсированные релизы",
  films: "Фильмы",
};

const bookmarksCategory: Record<string, string> = {
  watching: "Смотрю",
  planned: "В планах",
  watched: "Просмотрено",
  delayed: "Отложено",
  abandoned: "Заброшено",
};

const fifthButton: Record<string, string> = {
  collections: "Коллекции",
  history: "История",
  discovery: "Обзор",
};

function setTheme(mode: "light" | "dark") {
  preferences.setFlags({ theme: mode });
}

function toggleSkipCategory() {
  preferences.setParams({
    skipToCategory: {
      ...preferences.params.skipToCategory,
      enabled: !preferences.params.skipToCategory.enabled,
    },
  });
}

function setHomeCategory(event: Event) {
  const value = (event.target as HTMLSelectElement).value;
  preferences.setParams({
    skipToCategory: {
      ...preferences.params.skipToCategory,
      homeCategory: value,
    },
  });
}

function setBookmarksCategory(event: Event) {
  const value = (event.target as HTMLSelectElement).value;
  preferences.setParams({
    skipToCategory: {
      ...preferences.params.skipToCategory,
      bookmarksCategory: value,
    },
  });
}

function setFifthButton(event: Event) {
  const value = (event.target as HTMLSelectElement).value;
  preferences.setFlags({
    showFifthButton: value === "none" ? null : value,
  });
}

function toggleChangelog() {
  preferences.setFlags({ showChangelog: !preferences.flags.showChangelog });
}

function toggleWatchHistory() {
  preferences.setFlags({ saveWatchHistory: !preferences.flags.saveWatchHistory });
}
</script>




<style scoped>
.settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.settings-row p {
  overflow-wrap: anywhere;
}

.settings-row select {
  width: 100%;
}

@media (min-width: 640px) {
  .settings-row select {
    width: auto;
  }
}

@media (max-width: 639px) {
  .settings-row {
    flex-direction: column;
    align-items: stretch;
  }

  .settings-row .tab-pill {
    flex: 1 1 0;
    text-align: center;
  }

  .settings-row input[type="checkbox"] {
    align-self: flex-end;
  }
}
</style>
