<template>
  <footer class="fixed bottom-0 left-0 right-0 z-50 block h-[70px] w-full bg-[#1b1c1d] text-white lg:hidden">
    <div class="flex h-full items-center justify-center gap-4">
      <template v-for="item in baseItems" :key="item.title">
        <router-link
          v-if="!item.auth || userStore.isAuth"
          :to="item.href"
          class="flex flex-col items-center justify-center gap-1"
        >
          <span :class="`iconify ${item.icon} h-6 w-6`"></span>
          <span class="text-sm">{{ item.title }}</span>
        </router-link>
      </template>
      <router-link
        v-if="fifthButton && (!fifthButton.auth || userStore.isAuth)"
        :to="fifthButton.href"
        class="flex flex-col items-center justify-center gap-1"
      >
        <span :class="`iconify ${fifthButton.icon} h-6 w-6`"></span>
        <span class="text-sm">{{ fifthButton.title }}</span>
      </router-link>
      <div class="relative">
        <button class="flex flex-col items-center justify-center gap-1" @click="toggleMenu">
          <img
            :src="userStore.isAuth ? userStore.user?.avatar : fallbackAvatar"
            alt=""
            class="h-6 w-6 rounded-full object-cover"
          />
          <span class="text-sm">{{ userStore.isAuth ? userStore.user?.login : "Аноним" }}</span>
        </button>
        <div
          v-if="menuOpen"
          class="absolute bottom-12 right-0 w-48 rounded-lg border border-white/10 bg-[#1f2022]/95 p-2 text-sm shadow-lg"
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
  </footer>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { usePreferencesStore } from "@/store/preferences";
import { useUserStore } from "@/store/auth";

const emit = defineEmits<{ (e: "open-settings"): void }>();

const userStore = useUserStore();
const preferencesStore = usePreferencesStore();
const router = useRouter();
const route = useRoute();
const menuOpen = ref(false);

const fallbackAvatar = "https://s.anixmirai.com/avatars/no_avatar.jpg";

const baseItems = [
  { title: "Домашняя", icon: "mdi--home", href: "/", auth: false },
  { title: "Поиск", icon: "mdi--search", href: "/search", auth: false },
  { title: "Закладки", icon: "mdi--bookmark-multiple", href: "/bookmarks", auth: true },
];

const fifthButtonMap: Record<string, any> = {
  favorites: {
    title: "Избранное",
    icon: "mdi--favorite",
    href: "/favorites",
    auth: true,
  },
  collections: {
    title: "Коллекции",
    icon: "mdi--collections-bookmark",
    href: "/collections",
    auth: true,
  },
  history: {
    title: "История",
    icon: "mdi--history",
    href: "/history",
    auth: true,
  },
  discovery: {
    title: "Обзор",
    icon: "mdi--compass",
    href: "/discovery",
    auth: false,
  },
};

const fifthButton = computed(() => {
  const key = preferencesStore.flags.showFifthButton;
  if (!key) return null;
  return fifthButtonMap[key];
});

function toggleMenu() {
  menuOpen.value = !menuOpen.value;
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

watch(
  () => route.fullPath,
  () => {
    menuOpen.value = false;
  }
);
</script>
