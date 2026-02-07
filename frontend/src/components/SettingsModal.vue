<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
    <div class="w-full max-w-2xl rounded-xl border border-white/10 bg-[#1f2123] p-6 shadow-xl">
      <div class="flex items-center justify-between border-b border-white/10 pb-4">
        <h2 class="section-title text-xl">Настройки</h2>
        <button class="text-gray-400 hover:text-white" @click="emit('close')">
          ✕
        </button>
      </div>

      <div class="mt-6 space-y-6">
        <div class="flex items-center gap-2">
          <span class="iconify material-symbols--palette-outline h-6 w-6"></span>
          <p class="section-title text-lg">нтерфейс</p>
        </div>
        <div class="flex flex-wrap items-center justify-between gap-4">
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
        <div class="flex items-center justify-between gap-4">
          <p class="max-w-96">Пропускать страницу выбора категорий</p>
          <input
            type="checkbox"
            class="h-5 w-5"
            :checked="preferences.params.skipToCategory.enabled"
            @change="toggleSkipCategory"
          />
        </div>
        <div v-if="preferences.params.skipToCategory.enabled" class="space-y-4">
          <div class="flex items-center justify-between gap-4">
            <p>Категория домашней страницы</p>
            <select
              class="input-dark rounded-lg px-3 py-2 text-sm"
              :value="preferences.params.skipToCategory.homeCategory"
              @change="setHomeCategory"
            >
              <option v-for="(label, key) in homeCategory" :key="key" :value="key">
                {{ label }}
              </option>
            </select>
          </div>
          <div class="flex items-center justify-between gap-4">
            <p>Категория страницы закладок</p>
            <select
              class="input-dark rounded-lg px-3 py-2 text-sm"
              :value="preferences.params.skipToCategory.bookmarksCategory"
              @change="setBookmarksCategory"
            >
              <option v-for="(label, key) in bookmarksCategory" :key="key" :value="key">
                {{ label }}
              </option>
            </select>
          </div>
        </div>

        <div v-if="userStore.isAuth" class="flex items-center justify-between gap-4">
          <p>Пятый пункт в навигации</p>
          <select
            class="input-dark rounded-lg px-3 py-2 text-sm"
            :value="preferences.flags.showFifthButton ?? 'none'"
            @change="setFifthButton"
          >
            <option value="none">Не показывать</option>
            <option v-for="(label, key) in fifthButton" :key="key" :value="key">
              {{ label }}
            </option>
          </select>
        </div>

        <div class="border-t border-white/10 pt-4">
          <div class="flex items-center gap-2">
            <span class="iconify material-symbols--settings-outline h-6 w-6"></span>
            <p class="section-title text-lg">Приложение</p>
          </div>
          <div class="mt-4 flex items-center justify-between gap-4">
            <p>Показывать список изменений</p>
            <input
              type="checkbox"
              class="h-5 w-5"
              :checked="preferences.flags.showChangelog"
              @change="toggleChangelog"
            />
          </div>
          <div class="mt-4 flex items-center justify-between gap-4">
            <div>
              <p>Сохранять историю просмотра</p>
              <p class="max-w-sm text-sm text-gray-400">
                При отключении история не сохраняется локально и в аккаунте.
              </p>
            </div>
            <input
              type="checkbox"
              class="h-5 w-5"
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
  favorites: "збранное",
  collections: "Коллекции",
  history: "стория",
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

