<template>
  <div v-if="isLoading" class="flex min-h-screen items-center justify-center">
    <Spinner />
  </div>
  <div v-else>
    <ReleaseSection
      v-if="lists.watching.length"
      title="Смотрю"
      :content="lists.watching"
      :show-all-link="`/profile/${profileId}/bookmarks/watching`"
    />
    <ReleaseSection
      v-if="lists.planned.length"
      title="В планах"
      :content="lists.planned"
      :show-all-link="`/profile/${profileId}/bookmarks/planned`"
    />
    <ReleaseSection
      v-if="lists.watched.length"
      title="Просмотрено"
      :content="lists.watched"
      :show-all-link="`/profile/${profileId}/bookmarks/watched`"
    />
    <ReleaseSection
      v-if="lists.delayed.length"
      title="Отложено"
      :content="lists.delayed"
      :show-all-link="`/profile/${profileId}/bookmarks/delayed`"
    />
    <ReleaseSection
      v-if="lists.abandoned.length"
      title="Брошено"
      :content="lists.abandoned"
      :show-all-link="`/profile/${profileId}/bookmarks/abandoned`"
    />
    <div
      v-if="!hasAny"
      class="card-surface flex flex-col items-center justify-center gap-4 rounded-xl p-8 text-center"
    >
      <span class="iconify twemoji--open-book h-16 w-16"></span>
      <p>Закладок пока нет.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ENDPOINTS } from "@/api/config";
import { BookmarksList } from "@/api/utils";
import { useUserStore } from "@/store/auth";
import { usePreferencesStore } from "@/store/preferences";
import ReleaseSection from "@/components/ReleaseSection.vue";
import Spinner from "@/components/Spinner.vue";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const preferences = usePreferencesStore();

const profileId = computed(() => Number(route.params.id));
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
  if (!profileId.value) return [];
  let url = `${ENDPOINTS.user.bookmark}/all/${profileId.value}/${BookmarksList[name]}/0?sort=1`;
  if (userStore.token) {
    url += `&token=${userStore.token}`;
  }
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return data?.content || [];
}

async function loadLists() {
  if (!profileId.value) return;
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
    router.push(
      `/profile/${profileId.value}/bookmarks/${preferences.params.skipToCategory.bookmarksCategory}`
    );
    return;
  }
  loadLists();
});

watch(
  () => route.params.id,
  () => loadLists()
);
</script>

