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
          <span class="text-sm">{{ userStore.isAuth ? userStore.user?.login : labels.anonymous }}</span>
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
            {{ labels.profile }}
          </button>
          <button
            class="flex w-full items-center gap-2 rounded-md px-2 py-2 hover:bg-white/10"
            @click="emit('open-settings')"
          >
            <span class="iconify mdi--settings h-4 w-4"></span>
            {{ labels.settings }}
          </button>
          <button
            v-if="userStore.isAuth"
            class="flex w-full items-center gap-2 rounded-md px-2 py-2 hover:bg-[#e04545]/15"
            @click="userStore.logout()"
          >
            <span class="iconify mdi--logout h-4 w-4"></span>
            {{ labels.logout }}
          </button>
          <button
            v-else
            class="flex w-full items-center gap-2 rounded-md px-2 py-2 hover:bg-white/10"
            @click="goToLogin"
          >
            <span class="iconify mdi--login h-4 w-4"></span>
            {{ labels.login }}
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

const labels = {
  anonymous: "\u0410\u043D\u043E\u043D\u0438\u043C",
  profile: "\u041F\u0440\u043E\u0444\u0438\u043B\u044C",
  settings: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438",
  logout: "\u0412\u044B\u0439\u0442\u0438",
  login: "\u0412\u043E\u0439\u0442\u0438",
};

const fallbackAvatar = "https://s.anixmirai.com/avatars/no_avatar.jpg";

const baseItems = [
  { title: "\u0414\u043E\u043C\u0430\u0448\u043D\u044F\u044F", icon: "mdi--home", href: "/", auth: false },
  { title: "\u041F\u043E\u0438\u0441\u043A", icon: "mdi--search", href: "/search", auth: false },
  { title: "\u0417\u0430\u043A\u043B\u0430\u0434\u043A\u0438", icon: "mdi--bookmark-multiple", href: "/bookmarks", auth: true },
];

const fifthButtonMap: Record<string, any> = {
  collections: {
    title: "\u041A\u043E\u043B\u043B\u0435\u043A\u0446\u0438\u0438",
    icon: "mdi--collections-bookmark",
    href: "/collections",
    auth: true,
  },
  history: {
    title: "\u0418\u0441\u0442\u043E\u0440\u0438\u044F",
    icon: "mdi--history",
    href: "/history",
    auth: true,
  },
  discovery: {
    title: "\u041E\u0431\u0437\u043E\u0440",
    icon: "mdi--compass",
    href: "/discovery",
    auth: false,
  },
};

const fifthButton = computed(() => {
  const key = preferencesStore.flags.showFifthButton;
  if (!key) return null;
  if (key === "favorites") {
    return fifthButtonMap.collections;
  }
  return fifthButtonMap[key] ?? null;
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
