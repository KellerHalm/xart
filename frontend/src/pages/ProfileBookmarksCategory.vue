<template>
  <div>
    <div class="flex items-center justify-between border-b border-white/5 px-4 py-2">
      <h1 class="section-title text-lg">{{ title }}</h1>
      <router-link :to="`/profile/${profileId}/bookmarks`" class="section-link text-sm">
        Назад
      </router-link>
    </div>

    <div v-if="isLoading" class="flex min-h-[50vh] items-center justify-center">
      <Spinner />
    </div>

    <div v-else-if="content.length">
      <ReleaseSection :title="title" :content="content" />
      <button
        v-if="hasMore"
        class="btn-outline mt-4 w-full rounded-lg px-4 py-2 text-sm"
        @click="loadMore"
      >
        Загрузить ещё
      </button>
    </div>

    <div v-else class="card-surface mt-6 flex flex-col items-center justify-center gap-4 rounded-xl p-8 text-center">
      <span class="iconify twemoji--open-book h-16 w-16"></span>
      <p>В этой категории пока ничего нет.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { ENDPOINTS } from "@/api/config";
import { BookmarksList } from "@/api/utils";
import { useUserStore } from "@/store/auth";
import ReleaseSection from "@/components/ReleaseSection.vue";
import Spinner from "@/components/Spinner.vue";

const route = useRoute();
const userStore = useUserStore();

const profileId = computed(() => Number(route.params.id));
const content = ref<any[]>([]);
const page = ref(0);
const hasMore = ref(true);
const isLoading = ref(true);

const titleMap: Record<string, string> = {
  watching: "Смотрю",
  planned: "В планах",
  watched: "Просмотрено",
  delayed: "Отложено",
  abandoned: "Брошено",
};

const title = computed(
  () => titleMap[route.params.slug as string] || "Закладки"
);

async function fetchPage(reset = false) {
  const slug = route.params.slug as keyof typeof BookmarksList;
  if (!profileId.value) return;
  if (reset) {
    page.value = 0;
    content.value = [];
    hasMore.value = true;
  }
  if (!hasMore.value) return;

  isLoading.value = page.value === 0;

  let url = `${ENDPOINTS.user.bookmark}/all/${profileId.value}/${BookmarksList[slug]}/${page.value}?sort=1`;
  if (userStore.token) {
    url += `&token=${userStore.token}`;
  }
  const res = await fetch(url);
  if (!res.ok) {
    hasMore.value = false;
    isLoading.value = false;
    return;
  }
  const data = await res.json();
  const items = data?.content || [];
  if (items.length === 0) {
    hasMore.value = false;
  } else {
    content.value = [...content.value, ...items];
    page.value += 1;
  }
  isLoading.value = false;
}

function loadMore() {
  fetchPage();
}

onMounted(() => {
  fetchPage(true);
});

watch(
  () => [route.params.id, route.params.slug],
  () => fetchPage(true)
);
</script>

