<template>
  <LoadingScreen v-if="showLoadingScreen" @complete="showLoadingScreen = false" />
  <div v-else class="min-h-screen overflow-x-hidden bg-[#1b1c1d] text-[color:var(--xart-text)] dark:bg-[#1b1c1d]">
    <div v-if="!preferences._hasHydrated && userStore.state === 'loading'" class="flex h-screen items-center justify-center">
      <Spinner size="lg" />
    </div>
    <div v-else>
      <NavBarPc @open-settings="openSettings" />
      <main class="container mx-auto px-2 pb-24 pt-4 lg:pb-0 lg:pt-20">
        <router-view />
      </main>
      <NavBarMobile @open-settings="openSettings" />
      <ChangelogModal
        :is-open="showChangelog && preferences.flags.showChangelog"
        :version="currentVersion"
        :previous-versions="previousVersions"
        @close="closeChangelog"
      />
      <SettingsModal :is-open="settingsOpen" @close="settingsOpen = false" />
      <ToastContainer />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import LoadingScreen from "@/components/LoadingScreen.vue";
import Spinner from "@/components/Spinner.vue";
import NavBarPc from "@/components/Navbar/NavBarPc.vue";
import NavBarMobile from "@/components/Navbar/NavBarMobile.vue";
import SettingsModal from "@/components/SettingsModal.vue";
import ChangelogModal from "@/components/ChangelogModal.vue";
import ToastContainer from "@/components/ToastContainer.vue";
import { usePreferencesStore } from "@/store/preferences";
import { useUserStore } from "@/store/auth";

const preferences = usePreferencesStore();
const userStore = useUserStore();

const showLoadingScreen = ref(true);
const showChangelog = ref(false);
const currentVersion = ref("");
const previousVersions = ref<string[]>([]);
const settingsOpen = ref(false);

function openSettings() {
  settingsOpen.value = true;
}

function closeChangelog() {
  showChangelog.value = false;
  if (currentVersion.value) {
    preferences.setParams({ version: currentVersion.value });
  }
}

async function checkVersion() {
  const res = await fetch("/api/version");
  if (!res.ok) return;
  const data = await res.json();
  if (data.version && data.version !== preferences.params.version) {
    showChangelog.value = true;
    currentVersion.value = data.version;
    previousVersions.value = data.previous || [];
  }
}

function applyTheme(theme: "light" | "dark") {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
    root.classList.remove("light");
  } else {
    root.classList.remove("dark");
    root.classList.add("light");
  }
}

watch(
  () => preferences.flags.theme,
  (value) => {
    applyTheme(value);
  },
  { immediate: true }
);

watch(
  () => preferences._hasHydrated,
  (hydrated) => {
    if (hydrated) {
      checkVersion();
      userStore.checkAuth();
    }
  }
);

onMounted(() => {
  if (!preferences._hasHydrated) {
    preferences.setHasHydrated(true);
  }
});
</script>
