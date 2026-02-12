<template>
  <header class="fixed top-0 left-0 right-0 z-50 hidden h-16 w-full bg-[#1b1c1d]/90 text-white backdrop-blur-lg lg:block">
    <div class="container mx-auto flex h-full items-center gap-4 px-3">
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-200 hover:bg-white/10"
          :aria-expanded="megaOpen"
          aria-controls="mega-panel"
          aria-label="Открыть меню"
          @click="toggleMega"
        >
          <span class="iconify mdi--menu h-5 w-5"></span>
        </button>
        <router-link to="/" class="flex items-center gap-2 text-white">
          <img src="/images/icons/xart.svg" alt="Xart" class="h-8 w-8" />
          <span class="text-lg font-semibold tracking-[0.3em]">ANIXART</span>
        </router-link>
      </div>

      <div class="flex flex-1 items-center justify-center px-4">
        <div class="relative w-full max-w-2xl">
          <span class="iconify mdi--magnify absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"></span>
          <input
            v-model="searchQuery"
            type="search"
            class="input-dark w-full rounded-full py-2.5 pl-10 pr-12 text-sm"
            placeholder="Поиск аниме..."
            @keydown.enter.prevent="submitSearch"
          />
          <button
            type="button"
            class="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-gray-200 hover:bg-white/20"
            aria-label="Найти"
            @click="submitSearch"
          >
            <span class="iconify mdi--arrow-right h-4 w-4"></span>
          </button>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button type="button" :class="iconBtnClass" aria-label="Сменить тему" @click="toggleTheme">
          <span v-if="isDark" class="iconify mdi--weather-night h-5 w-5"></span>
          <span v-else class="iconify mdi--white-balance-sunny h-5 w-5"></span>
        </button>
        <button type="button" :class="iconBtnClass" aria-label="Настройки" @click="emit('open-settings')">
          <span class="iconify mdi--cog h-5 w-5 text-[#e04545]"></span>
        </button>
        <router-link
          v-for="item in visibleQuickLinks"
          :key="item.label"
          :to="item.to"
          :class="iconLinkClass(item.to)"
          :aria-label="item.label"
        >
          <span :class="`iconify ${item.icon} h-5 w-5`"></span>
        </router-link>
        <div class="relative">
          <button
            type="button"
            class="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5"
            aria-label="Профиль"
            @click="toggleUserMenu"
          >
            <img
              :src="userStore.isAuth ? userStore.user?.avatar : fallbackAvatar"
              alt=""
              class="h-full w-full object-cover"
            />
          </button>
          <div
            v-if="menuOpen"
            class="absolute right-0 mt-3 w-48 rounded-lg border border-white/10 bg-[#1f2022]/95 p-2 text-sm shadow-lg"
          >
            <button
              v-if="userStore.isAuth"
              class="flex w-full items-center gap-2 rounded-md px-2 py-2 hover:bg-white/10"
              @click="goToProfile"
            >
              <span class="iconify mdi--user h-4 w-4"></span>
              Профиль
            </button>
            <button
              class="flex w-full items-center gap-2 rounded-md px-2 py-2 hover:bg-white/10"
              @click="emit('open-settings')"
            >
              <span class="iconify mdi--settings h-4 w-4"></span>
              Настройки
            </button>
            <button
              v-if="userStore.isAuth"
              class="flex w-full items-center gap-2 rounded-md px-2 py-2 hover:bg-[#e04545]/15"
              @click="userStore.logout()"
            >
              <span class="iconify mdi--logout h-4 w-4"></span>
              Выйти
            </button>
            <button
              v-else
              class="flex w-full items-center gap-2 rounded-md px-2 py-2 hover:bg-white/10"
              @click="goToLogin"
            >
              <span class="iconify mdi--login h-4 w-4"></span>
              Войти
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="megaOpen" class="fixed inset-0 z-40" @click="closeMega">
      <div id="mega-panel" class="absolute inset-x-0 top-16" @click.stop>
        <div class="container mx-auto px-3 pb-6">
          <div class="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
            <div class="rounded-2xl border border-white/10 bg-[#1f2022]/95 p-6 shadow-2xl backdrop-blur-xl">
              <div class="space-y-6">
                <div>
                  <p class="text-xs uppercase tracking-[0.2em] text-gray-400">Меню</p>
                  <div class="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <button
                      v-for="item in visibleMenuItems"
                      :key="item.label"
                      type="button"
                      class="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left text-gray-200 transition hover:bg-white/10"
                      :class="item.disabled ? 'opacity-40 cursor-not-allowed' : ''"
                      @click="handleMenuItem(item)"
                    >
                      <span>{{ item.label }}</span>
                      <span class="iconify mdi--chevron-right h-4 w-4 text-gray-500"></span>
                    </button>
                  </div>
                </div>
                <div>
                  <p class="text-xs uppercase tracking-[0.2em] text-gray-400">Жанры</p>
                  <div class="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-gray-300 md:grid-cols-3 xl:grid-cols-4">
                    <button
                      v-for="genre in genres"
                      :key="genre"
                      type="button"
                      class="text-left hover:text-[#f1b9b9]"
                      @click="goToFilter({ genres: [genre] })"
                    >
                      {{ genre }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="rounded-2xl border border-white/10 bg-[#1f2022]/95 p-6 shadow-2xl backdrop-blur-xl">
              <div class="space-y-6">
                <div>
                  <p class="text-xs uppercase tracking-[0.2em] text-gray-400">Статус</p>
                  <div class="mt-4 grid grid-cols-3 gap-3 text-sm text-gray-300">
                    <button
                      v-for="item in statusItems"
                      :key="item.label"
                      type="button"
                      class="text-left hover:text-[#f1b9b9]"
                      @click="goToFilter(item.filter)"
                    >
                      {{ item.label }}
                    </button>
                  </div>
                </div>
                <div>
                  <p class="text-xs uppercase tracking-[0.2em] text-gray-400">Тип</p>
                  <div class="mt-4 grid grid-cols-4 gap-3 text-sm text-gray-300">
                    <button
                      v-for="item in typeItems"
                      :key="item.label"
                      type="button"
                      class="text-left"
                      :class="item.filter ? 'hover:text-[#f1b9b9]' : 'cursor-not-allowed text-gray-500'"
                      @click="item.filter ? goToFilter(item.filter) : undefined"
                    >
                      {{ item.label }}
                    </button>
                  </div>
                </div>
                <div>
                  <p class="text-xs uppercase tracking-[0.2em] text-gray-400">Год</p>
                  <div class="mt-4 grid grid-cols-4 gap-x-4 gap-y-2 text-sm text-gray-300">
                    <button
                      v-for="year in years"
                      :key="year"
                      type="button"
                      class="text-left hover:text-[#f1b9b9]"
                      @click="goToFilter({ start_year: year, end_year: year })"
                    >
                      {{ year }}
                    </button>
                  </div>
                </div>
                <div>
                  <p class="text-xs uppercase tracking-[0.2em] text-gray-400">Сезон</p>
                  <div class="mt-4 grid grid-cols-4 gap-x-4 gap-y-2 text-sm text-gray-300">
                    <button
                      v-for="item in seasonItems"
                      :key="item.label"
                      type="button"
                      class="text-left hover:text-[#f1b9b9]"
                      @click="goToFilter({ start_year: item.year, end_year: item.year, season: item.season })"
                    >
                      {{ item.label }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "@/store/auth";
import { usePreferencesStore } from "@/store/preferences";
import { FilterDefault } from "@/api/utils";
import type { Filter } from "@/api/utils";

const emit = defineEmits<{ (e: "open-settings"): void }>();

const userStore = useUserStore();
const preferencesStore = usePreferencesStore();
const router = useRouter();
const route = useRoute();

const fallbackAvatar = "https://s.anixmirai.com/avatars/no_avatar.jpg";
const iconBtnClass = "flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-200 hover:bg-white/10";

const menuOpen = ref(false);
const megaOpen = ref(false);
const searchQuery = ref("");

const menuItems: Array<{ label: string; to?: string; filter?: Partial<Filter>; auth?: boolean; disabled?: boolean }> = [
  { label: "Закладки", to: "/bookmarks", auth: true },
  { label: "ТОП 100", filter: { sort: 1 } },
  { label: "Аниме 2026 года", filter: { start_year: 2026, end_year: 2026 } },
  { label: "Расписание", filter: { status_id: 2 } },
];

const quickLinks: Array<{ label: string; to: string; icon: string; auth?: boolean }> = [
  { label: "Закладки", to: "/bookmarks", icon: "mdi--bookmark-multiple", auth: true },
  { label: "Коллекции", to: "/collections", icon: "mdi--collections-bookmark", auth: true },
  { label: "Обзор", to: "/discovery", icon: "mdi--compass" },
  { label: "История", to: "/history", icon: "mdi--history", auth: true },
];

const genres = [
  "Сёнен",
  "Сэйнэн",
  "Сёдзё",
  "Дзёсэй",
  "Комедия",
  "Романтика",
  "Школа",
  "Безумие",
  "Боевые искусства",
  "Вампиры",
  "Военное",
  "Гарем",
  "Гурман",
  "Демоны",
  "Детектив",
  "Детское",
  "Драма",
  "Игры",
  "Исторический",
  "Космос",
  "Машины",
  "Меха",
  "Музыка",
  "Пародия",
  "Повседневность",
  "Полиция",
  "Приключения",
  "Самураи",
  "Сверхъестественное",
  "Спорт",
  "Супер сила",
  "Ужасы",
  "Фантастика",
  "Фэнтези",
  "Экшен",
  "Этти",
  "Триллер",
  "Работа",
  "Психологическое",
];

const statusItems = [
  { label: "Онгоинги", filter: { status_id: 2 } },
  { label: "Завершенные", filter: { status_id: 1 } },
  { label: "Анонсы", filter: { status_id: 3 } },
];

const typeItems = [
  { label: "TV сериал", filter: { category_id: 1 } },
  { label: "OVA", filter: { category_id: 3 } },
  { label: "ONA" },
  { label: "Фильм", filter: { category_id: 2 } },
];

const years = [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012];

const seasonItems = [
  { label: "Зима 2026", year: 2026, season: 1 },
  { label: "Осень 2025", year: 2025, season: 4 },
  { label: "Лето 2025", year: 2025, season: 3 },
  { label: "Весна 2025", year: 2025, season: 2 },
  { label: "Зима 2025", year: 2025, season: 1 },
  { label: "Осень 2024", year: 2024, season: 4 },
  { label: "Лето 2024", year: 2024, season: 3 },
  { label: "Весна 2024", year: 2024, season: 2 },
  { label: "Зима 2024", year: 2024, season: 1 },
  { label: "Осень 2023", year: 2023, season: 4 },
  { label: "Лето 2023", year: 2023, season: 3 },
  { label: "Весна 2023", year: 2023, season: 2 },
  { label: "Зима 2023", year: 2023, season: 1 },
  { label: "Осень 2022", year: 2022, season: 4 },
  { label: "Лето 2022", year: 2022, season: 3 },
  { label: "Весна 2022", year: 2022, season: 2 },
  { label: "Зима 2022", year: 2022, season: 1 },
  { label: "Осень 2021", year: 2021, season: 4 },
  { label: "Лето 2021", year: 2021, season: 3 },
  { label: "Весна 2021", year: 2021, season: 2 },
  { label: "Зима 2021", year: 2021, season: 1 },
  { label: "Осень 2020", year: 2020, season: 4 },
];

const visibleMenuItems = computed(() =>
  menuItems.filter((item) => !item.auth || userStore.isAuth)
);
const visibleQuickLinks = computed(() =>
  quickLinks.filter((item) => !item.auth || userStore.isAuth)
);

const isDark = computed(() => preferencesStore.flags.theme === "dark");

function toggleTheme() {
  preferencesStore.setFlags({ theme: isDark.value ? "light" : "dark" });
}

function isActive(path: string) {
  if (path === "/") return route.path === "/";
  return route.path === path || route.path.startsWith(`${path}/`);
}

function iconLinkClass(path: string) {
  return `${iconBtnClass} ${isActive(path) ? "bg-[#2a2d2f] text-[#f1b9b9] border-white/30" : ""}`;
}

function toggleUserMenu() {
  menuOpen.value = !menuOpen.value;
  if (menuOpen.value) {
    megaOpen.value = false;
  }
}

function toggleMega() {
  megaOpen.value = !megaOpen.value;
  if (megaOpen.value) {
    menuOpen.value = false;
  }
}

function closeMega() {
  megaOpen.value = false;
}

function goToProfile() {
  menuOpen.value = false;
  if (userStore.user?.id) {
    router.push(`/profile/${userStore.user.id}`);
  }
}

function goToLogin() {
  menuOpen.value = false;
  router.push(`/login?redirect=${route.fullPath}`);
}

function handleMenuItem(item: { to?: string; filter?: Partial<Filter>; disabled?: boolean }) {
  if (item.disabled) return;
  if (item.to) {
    router.push(item.to);
    megaOpen.value = false;
    return;
  }
  if (item.filter) {
    goToFilter(item.filter);
  }
}

function goToFilter(partial: Partial<Filter>) {
  const filter = { ...structuredClone(FilterDefault), ...partial } as Filter;
  const serialized = encodeURIComponent(JSON.stringify(filter));
  router.push(`/discovery/filter?filter=${serialized}`);
  megaOpen.value = false;
}

function submitSearch() {
  const value = searchQuery.value.trim();
  if (!value) {
    router.push("/search");
    megaOpen.value = false;
    return;
  }
  const params = typeof route.query.params === "string" ? route.query.params : undefined;
  const query = params ? { query: value, params } : { query: value };
  router.push({ path: "/search", query });
  megaOpen.value = false;
}

watch(
  () => route.fullPath,
  () => {
    menuOpen.value = false;
    megaOpen.value = false;
  }
);

watch(
  () => route.query.query,
  (value) => {
    searchQuery.value = typeof value === "string" ? value : "";
  },
  { immediate: true }
);
</script>
