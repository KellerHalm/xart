<template>
  <div v-if="isLoading" class="flex min-h-screen items-center justify-center">
    <Spinner />
  </div>
  <div v-else>
    <ReleaseSection
      v-if="lists.watching.length"
      title="Смотрю"
      :content="lists.watching"
      show-all-link="/bookmarks/watching"
    />
    <ReleaseSection
      v-if="lists.planned.length"
      title="В планах"
      :content="lists.planned"
      show-all-link="/bookmarks/planned"
    />
    <ReleaseSection
      v-if="lists.watched.length"
      title="Просмотрено"
      :content="lists.watched"
      show-all-link="/bookmarks/watched"
    />
    <ReleaseSection
      v-if="lists.delayed.length"
      title="Отложено"
      :content="lists.delayed"
      show-all-link="/bookmarks/delayed"
    />
    <ReleaseSection
      v-if="lists.abandoned.length"
      title="Заброшено"
      :content="lists.abandoned"
      show-all-link="/bookmarks/abandoned"
    />
    <div v-if="!hasAny" class="card-surface flex flex-col items-center justify-center gap-4 rounded-xl p-8 text-center">
      <span class="iconify twemoji--open-book h-16 w-16"></span>
      <p>Закладок пока нет.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { ENDPOINTS } from "@/api/config";
import { BookmarksList } from "@/api/utils";
import { useUserStore } from "@/store/auth";
import { usePreferencesStore } from "@/store/preferences";
import ReleaseSection from "@/components/ReleaseSection.vue";
import Spinner from "@/components/Spinner.vue";

const userStore = useUserStore();
const preferences = usePreferencesStore();
const router = useRouter();

const isLoading = ref(true);
const lists = ref({
  watching: [] as any[],
  planned: [] as any[],
  watched: [] as any[],
  delayed: [] as any[],
  abandoned: [] as any[],
});

const hasAny = computed(() => {
  return (
    lists.value.watching.length ||
    lists.value.planned.length ||
    lists.value.watched.length ||
    lists.value.delayed.length ||
    lists.value.abandoned.length
  );
});

async function fetchList(name: keyof typeof BookmarksList) {
  if (!userStore.token) return [];
  const url = `${ENDPOINTS.user.bookmark}/all/${BookmarksList[name]}/0?sort=1&token=${userStore.token}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return data?.content || [];
}

async function loadLists() {
  if (!userStore.token) return;
  isLoading.value = true;
  const [watching, planned, watched, delayed, abandoned] = await Promise.all([
    fetchList("watching"),
    fetchList("planned"),
    fetchList("watched"),
    fetchList("delayed"),
    fetchList("abandoned"),
  ]);
  lists.value = { watching, planned, watched, delayed, abandoned };
  isLoading.value = false;
}

onMounted(() => {
  if (preferences.params.skipToCategory.enabled) {
    router.push(`/bookmarks/${preferences.params.skipToCategory.bookmarksCategory}`);
    return;
  }
  loadLists();
});

watch(
  () => userStore.state,
  () => {
    if (userStore.state === "finished" && !userStore.token) {
      router.push("/login?redirect=/bookmarks");
    }
  }
);
</script>

