<template>
  <header class="sticky top-0 left-0 right-0 z-50 hidden h-16 w-full bg-[#1b1c1d]/90 text-white backdrop-blur-lg lg:block">
    <div class="container mx-auto flex h-full items-center justify-between px-2">
      <nav class="flex h-full items-center gap-3">
        <template v-for="item in navItems" :key="item.title">
          <router-link
            v-if="!item.auth || userStore.isAuth"
            :to="item.href"
            class="flex items-center nav-link rounded-lg px-3 py-2 transition-all duration-300"
            :class="isActive(item.href) ? 'bg-[#2a2d2f] text-[#f1b9b9]' : 'hover:bg-white/10 hover:text-[#f1b9b9]'"
          >
            <span :class="`iconify ${item.icon} h-6 w-6`"></span>
            <span class="ml-1">{{ item.title }}</span>
          </router-link>
        </template>
      </nav>
      <div class="relative">
        <button
          type="button"
          class="flex items-center gap-2 rounded-lg px-3 py-2 btn-primary"
          @click="toggleMenu"
        >
          <img
            :src="userStore.isAuth ? userStore.user?.avatar : fallbackAvatar"
            alt=""
            class="h-6 w-6 rounded-full object-cover"
          />
          <span>{{ userStore.isAuth ? userStore.user?.login : "Аноним" }}</span>
        </button>
        <div
          v-if="menuOpen"
          class="absolute right-0 mt-2 w-48 rounded-lg border border-white/10 bg-[#1f2022]/95 p-2 text-sm shadow-lg"
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
  </header>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "@/store/auth";

const emit = defineEmits<{ (e: "open-settings"): void }>();

const userStore = useUserStore();
const router = useRouter();
const route = useRoute();
const menuOpen = ref(false);

const fallbackAvatar = "https://s.anixmirai.com/avatars/no_avatar.jpg";

const navItems = [
  { title: "Домашняя", icon: "mdi--home", href: "/", auth: false },
  { title: "Обзор", icon: "mdi--compass", href: "/discovery", auth: false },
  { title: "Поиск", icon: "mdi--search", href: "/search", auth: false },
  { title: "Закладки", icon: "mdi--bookmark-multiple", href: "/bookmarks", auth: true },
  { title: "Избранное", icon: "mdi--favorite", href: "/favorites", auth: true },
  { title: "Коллекции", icon: "mdi--collections-bookmark", href: "/collections", auth: true },
  { title: "История", icon: "mdi--history", href: "/history", auth: true },
];

const isActive = (path: string) => route.path === path;

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
