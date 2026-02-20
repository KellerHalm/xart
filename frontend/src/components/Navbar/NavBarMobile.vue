<template>
  <header :class="headerClass" class="fixed left-0 right-0 top-0 z-50 block w-full lg:hidden">
    <div class="container mx-auto px-3 pb-2 pt-2">
      <div class="flex items-center justify-between gap-2">
        <div class="flex min-w-0 items-center gap-2">
          <button
            type="button"
            :class="menuBtnClass"
            :aria-expanded="megaOpen"
            aria-controls="mobile-mega-panel"
            aria-label="Открыть меню"
            @click="toggleMega"
          >
            <span class="iconify mdi--menu h-5 w-5"></span>
          </button>
          <router-link to="/" class="flex items-center gap-2" :class="isDark ? 'text-white' : 'text-[#252525]'">
            <img src="/images/icons/xart.svg" alt="Xart" class="h-7 w-7" />
            <span class="text-base font-semibold tracking-[0.26em]">
              <span :class="isDark ? 'text-white' : 'text-white drop-shadow-[0_0_1px_rgba(0,0,0,0.85)]'">X</span><span class="text-[#e04545]">ART</span>
            </span>
          </router-link>
        </div>
        <div class="flex shrink-0 items-center gap-2">
          <button type="button" :class="iconBtnClass" aria-label="Сменить тему" @click="toggleTheme">
            <span v-if="isDark" class="iconify mdi--weather-night h-5 w-5"></span>
            <span v-else class="iconify mdi--white-balance-sunny h-5 w-5"></span>
          </button>
          <button type="button" :class="iconBtnClass" aria-label="Настройки" @click="emit('open-settings')">
            <span class="iconify mdi--cog h-5 w-5 text-[#e04545]"></span>
          </button>
          <div class="relative">
            <button type="button" :class="profileBtnClass" :aria-label="userStore.isAuth ? 'Профиль' : 'Войти'" @click="handleProfileButton">
              <img
                :src="userStore.isAuth ? userStore.user?.avatar : fallbackAvatar"
                alt=""
                class="h-full w-full object-cover"
              />
            </button>
            <div
              v-if="menuOpen"
              class="absolute right-0 z-[60] mt-2 w-48 rounded-lg border p-2 text-sm shadow-2xl"
              :class="isDark ? 'border-white/15 bg-[#1f2022] text-gray-100' : 'border-[#e04545]/30 bg-white text-[#1f2937]'"
            >
              <button
                v-if="userStore.isAuth"
                class="flex w-full items-center gap-2 rounded-md px-2 py-2"
                :class="isDark ? 'hover:bg-white/10' : 'hover:bg-[#fff2f2]'"
                @click="goToProfile"
              >
                <span class="iconify mdi--user h-4 w-4"></span>
                Профиль
              </button>
              <button
                class="flex w-full items-center gap-2 rounded-md px-2 py-2"
                :class="isDark ? 'hover:bg-white/10' : 'hover:bg-[#fff2f2]'"
                @click="openSettingsFromMenu"
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
                class="flex w-full items-center gap-2 rounded-md px-2 py-2"
                :class="isDark ? 'hover:bg-white/10' : 'hover:bg-[#fff2f2]'"
                @click="goToLogin"
              >
                <span class="iconify mdi--login h-4 w-4"></span>
                &#1042;&#1086;&#1081;&#1090;&#1080;
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="mt-2">
        <div class="relative w-full">
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
            :class="searchSubmitBtnClass"
            aria-label="Найти"
            @click="submitSearch"
          >
            <span class="iconify mdi--arrow-right h-4 w-4"></span>
          </button>
        </div>
      </div>

      <div class="mt-1.5 flex w-full items-center justify-center gap-1.5 pb-0">
        <router-link
          v-for="item in visibleQuickLinks"
          :key="item.label"
          :to="item.to"
          :class="quickLinkClass(item.to)"
          :aria-label="item.label"
        >
          <span :class="`iconify ${item.icon} h-3.5 w-3.5`"></span>
          <span>{{ item.label }}</span>
        </router-link>
      </div>
    </div>

    <div v-if="menuOpen" class="fixed inset-0 z-40 bg-transparent" @click="closeUserMenu"></div>
    <div v-if="megaOpen" class="fixed inset-0 z-40" :class="isDark ? 'bg-black/25' : 'bg-black/10'" @click="closeMega">
      <div id="mobile-mega-panel" class="absolute inset-x-0 top-[136px]" @click.stop>
        <div class="container mx-auto px-3 pb-4">
          <div
            class="rounded-2xl border p-4 shadow-2xl backdrop-blur-xl"
            :class="isDark ? 'border-white/10 bg-[#1f2022]/95 text-gray-100' : 'border-[#e04545]/25 bg-white text-[#1f2937] shadow-[0_20px_45px_-30px_rgba(185,28,28,0.45)]'"
          >
            <p class="text-xs uppercase tracking-[0.2em] text-gray-400">Меню</p>
            <div class="mt-3 grid grid-cols-2 gap-2 text-sm">
              <button
                v-for="item in visibleMenuItems"
                :key="item.label"
                type="button"
                class="flex items-center justify-between rounded-lg border px-3 py-2 text-left transition"
                :class="[
                  item.disabled ? 'cursor-not-allowed opacity-40' : '',
                  isDark
                    ? 'border-white/10 bg-white/5 text-gray-200 hover:bg-white/10'
                    : 'border-[#e04545]/20 bg-[#fff7f7] text-[#1f2937] hover:bg-[#ffecec]',
                ]"
                @click="handleMenuItem(item)"
              >
                <span>{{ item.label }}</span>
                <span class="iconify mdi--chevron-right h-4 w-4 text-gray-500"></span>
              </button>
            </div>
            <div class="mt-4">
              <p class="text-xs uppercase tracking-[0.2em] text-gray-400">Жанры</p>
              <div class="mt-2 flex flex-wrap gap-2 text-xs">
                <button
                  v-for="genre in genres"
                  :key="genre"
                  type="button"
                  class="rounded-full border px-2.5 py-1"
                  :class="isDark ? 'border-white/15 bg-white/5 hover:bg-white/10' : 'border-[#e04545]/20 bg-[#fff7f7] hover:bg-[#ffecec]'"
                  @click="goToFilter({ genres: [genre] })"
                >
                  {{ genre }}
                </button>
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
import { FilterDefault, cloneFilter } from "@/api/utils";
import type { Filter } from "@/api/utils";

const emit = defineEmits<{ (e: "open-settings"): void }>();

const userStore = useUserStore();
const preferencesStore = usePreferencesStore();
const router = useRouter();
const route = useRoute();

const isDark = computed(() => preferencesStore.flags.theme === "dark");
const fallbackAvatar = "https://s.anixmirai.com/avatars/no_avatar.jpg";
const headerClass = computed(() =>
  isDark.value
    ? "bg-[#1b1c1d]/90 text-white backdrop-blur-lg"
    : "border-b border-[#e04545]/70 bg-white/95 text-[#252525] backdrop-blur-lg"
);
const menuBtnClass = computed(() =>
  isDark.value
    ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-200 hover:bg-white/10"
    : "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#e04545]/40 bg-white text-[#444] hover:bg-[#fff5f5]"
);
const iconBtnClass = computed(() =>
  isDark.value
    ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-gray-200 hover:bg-white/10"
    : "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#e04545]/40 bg-white text-[#555] hover:bg-[#fff5f5]"
);
const searchSubmitBtnClass = computed(() =>
  isDark.value
    ? "absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-gray-200 hover:bg-white/20"
    : "absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-[#fff0f0] text-[#c23838] hover:bg-[#ffe3e3]"
);
const profileBtnClass = computed(() =>
  isDark.value
    ? "flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5"
    : "flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[#e04545]/40 bg-white"
);
const quickBtnClass = computed(() =>
  isDark.value
    ? "flex items-center justify-center gap-1 whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] text-gray-200 hover:bg-white/10"
    : "flex items-center justify-center gap-1 whitespace-nowrap rounded-full border border-[#e04545]/30 bg-white px-2 py-1 text-[11px] text-[#4b5563] hover:bg-[#fff5f5]"
);

const menuOpen = ref(false);
const megaOpen = ref(false);
const searchQuery = ref("");

const menuItems: Array<{ label: string; to?: string; filter?: Partial<Filter>; auth?: boolean; disabled?: boolean }> = [
  { label: "Поиск", to: "/search" },
  { label: "Закладки", to: "/bookmarks", auth: true },
  { label: "Коллекции", to: "/collections", auth: true },
  { label: "Обзор", to: "/discovery" },
  { label: "История", to: "/history", auth: true },
  { label: "ТОП 100", filter: { sort: 1 } },
  { label: "Аниме 2026", filter: { start_year: 2026, end_year: 2026 } },
  { label: "Расписание", filter: { status_id: 2 } },
];

const baseQuickLinks: Array<{ label: string; to: string; icon: string; auth?: boolean }> = [
  { label: "Домой", to: "/", icon: "mdi--home" },
  { label: "Закладки", to: "/bookmarks", icon: "mdi--bookmark-multiple", auth: true },
];

const fifthQuickLinkMap: Record<string, { label: string; to: string; icon: string; auth?: boolean }> = {
  collections: { label: "Коллекции", to: "/collections", icon: "mdi--collections-bookmark", auth: true },
  history: { label: "История", to: "/history", icon: "mdi--history", auth: true },
  discovery: { label: "Обзор", to: "/discovery", icon: "mdi--compass" },
};

const genres = [
  "Сёнен",
  "Сэйнэн",
  "Романтика",
  "Комедия",
  "Повседневность",
  "Спорт",
  "Драма",
  "Фэнтези",
  "Экшен",
  "Фантастика",
];

const visibleMenuItems = computed(() => menuItems.filter((item) => !item.auth || userStore.isAuth));
const fifthQuickLink = computed(() => {
  const key = preferencesStore.flags.showFifthButton;
  if (!key) return null;
  if (key === "favorites") return fifthQuickLinkMap.collections;
  return fifthQuickLinkMap[key] ?? null;
});
const visibleQuickLinks = computed(() => {
  const links = [...baseQuickLinks];
  if (fifthQuickLink.value) {
    links.push(fifthQuickLink.value);
  }
  return links.filter((item) => !item.auth || userStore.isAuth);
});

function toggleTheme() {
  preferencesStore.setFlags({ theme: isDark.value ? "light" : "dark" });
}

function isActive(path: string) {
  if (path === "/") return route.path === "/";
  return route.path === path || route.path.startsWith(`${path}/`);
}

function quickLinkClass(path: string) {
  const activeClass = isDark.value
    ? "bg-[#2a2d2f] text-[#f1b9b9] border-white/30"
    : "bg-[#ffecec] text-[#be2c2c] border-[#e04545]/60";
  return `${quickBtnClass.value} ${isActive(path) ? activeClass : ""}`;
}

function toggleUserMenu() {
  menuOpen.value = !menuOpen.value;
  if (menuOpen.value) {
    megaOpen.value = false;
  }
}

function handleProfileButton() {
  toggleUserMenu();
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

function closeUserMenu() {
  menuOpen.value = false;
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

function openSettingsFromMenu() {
  menuOpen.value = false;
  emit("open-settings");
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
  const filter = { ...cloneFilter(FilterDefault), ...partial } as Filter;
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
