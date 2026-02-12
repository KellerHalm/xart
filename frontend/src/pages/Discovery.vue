<template>
  <div class="space-y-6">
    <div v-if="interesting.length" class="group relative">
      <button
        type="button"
        class="pointer-events-none absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/60 text-white opacity-0 shadow-lg transition group-hover:pointer-events-auto group-hover:opacity-100"
        aria-label="Прокрутить влево"
        @click="scrollInteresting('left')"
      >
        <span class="iconify mdi--chevron-left h-5 w-5"></span>
      </button>
      <button
        type="button"
        class="pointer-events-none absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/60 text-white opacity-0 shadow-lg transition group-hover:pointer-events-auto group-hover:opacity-100"
        aria-label="Прокрутить вправо"
        @click="scrollInteresting('right')"
      >
        <span class="iconify mdi--chevron-right h-5 w-5"></span>
      </button>
      <div ref="interestingScroller" class="flex gap-4 overflow-x-auto pb-2 hide-scrollbar scroll-smooth">
        <router-link
          v-for="item in interesting"
          :key="item.id"
          :to="`/release/${item.action}`"
          class="relative h-56 min-w-[420px] max-w-[420px] overflow-hidden rounded-xl bg-black text-white shadow"
        >
          <img :src="item.image" alt="" class="h-full w-full object-cover" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
          <div class="absolute bottom-2 left-2 right-2">
            <p class="text-sm font-semibold line-clamp-2">{{ item.title }}</p>
          </div>
        </router-link>
      </div>
    </div>

    <div class="grid grid-cols-2 gap-4 my-4 lg:grid-cols-4">
      <button
        class="flex items-center justify-center gap-2 rounded-lg bg-yellow-400 px-4 py-3 text-sm font-semibold text-black"
        @click="popularModalOpen = true"
      >
        <span class="iconify mdi--fire h-6 w-6"></span>
        Популярное
      </button>
      <button
        class="btn-accent flex items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold"
        @click="scheduleModalOpen = true"
      >
        <span class="iconify mdi--calendar-month h-6 w-6"></span>
        Расписание
      </button>
      <button
        class="flex items-center justify-center gap-2 rounded-lg bg-purple-600 px-4 py-3 text-sm font-semibold text-white"
        @click="router.push('/discovery/collections?sort=recent')"
      >
        <span class="iconify mdi--collections-bookmark h-6 w-6"></span>
        Коллекции
      </button>
      <button
        class="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white"
        @click="filtersModalOpen = true"
      >
        <span class="iconify mdi--mixer-settings h-6 w-6"></span>
        Фильтр
      </button>
    </div>

    <ReleaseSection
      v-if="recommendations.length"
      title="Рекомендации"
      :content="recommendations"
      show-all-link="/discovery/recommendations"
    />
    <ReleaseSection
      v-if="discussing.length"
      title="Обсуждают сегодня"
      :content="discussing"
    />
    <ReleaseSection
      v-if="watching.length"
      title="Смотрят сейчас"
      :content="watching"
      show-all-link="/discovery/watching"
    />
    <div v-if="collections.length" class="pb-6">
      <CollectionSection
        title="Коллекции недели"
        :content="collections"
        show-all-link="/discovery/collections?sort=week_popular"
      />
    </div>
  </div>

  <PopularModal :is-open="popularModalOpen" @close="popularModalOpen = false" />
  <ScheduleModal :is-open="scheduleModalOpen" @close="scheduleModalOpen = false" />
  <FiltersModal :is-open="filtersModalOpen" @close="filtersModalOpen = false" />
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { useRouter } from "vue-router";
import { ENDPOINTS } from "@/api/config";
import { useUserStore } from "@/store/auth";
import ReleaseSection from "@/components/ReleaseSection.vue";
import CollectionSection from "@/components/CollectionSection.vue";
import PopularModal from "@/components/Discovery/PopularModal.vue";
import ScheduleModal from "@/components/Discovery/ScheduleModal.vue";
import FiltersModal from "@/components/Discovery/FiltersModal.vue";

const router = useRouter();
const userStore = useUserStore();

const interesting = ref<any[]>([]);
const recommendations = ref<any[]>([]);
const discussing = ref<any[]>([]);
const watching = ref<any[]>([]);
const collections = ref<any[]>([]);
const interestingScroller = ref<HTMLElement | null>(null);

const popularModalOpen = ref(false);
const scheduleModalOpen = ref(false);
const filtersModalOpen = ref(false);

async function fetchJson(url: string) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function extractList(data: any) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  const list = data.content ?? data.releases ?? data.items ?? data.list ?? [];
  return Array.isArray(list) ? list : [];
}

async function fetchList(url: string) {
  const data = await fetchJson(url);
  return extractList(data);
}

async function fetchListWithFallback(primary: string, fallback?: string) {
  const primaryList = await fetchList(primary);
  if (primaryList.length || !fallback) return primaryList;
  return fetchList(fallback);
}

async function fetchAll() {
  const token = userStore.token;
  const interestingUrl = token
    ? `${ENDPOINTS.discover.interesting}?token=${token}`
    : ENDPOINTS.discover.interesting;
  const discussingPrimary = token
    ? `${ENDPOINTS.discover.discussing}/0?token=${token}`
    : `${ENDPOINTS.discover.discussing}/0`;
  const discussingFallback = token
    ? `${ENDPOINTS.discover.discussing}?token=${token}`
    : ENDPOINTS.discover.discussing;
  const watchingPrimary = token
    ? `${ENDPOINTS.discover.watching}/0?token=${token}`
    : `${ENDPOINTS.discover.watching}/0`;
  const watchingFallback = token
    ? `${ENDPOINTS.discover.watching}?token=${token}`
    : ENDPOINTS.discover.watching;
  const collectionsUrl = `${ENDPOINTS.discover.collections}/0?where=1&sort=4&previous_page=0${token ? `&token=${token}` : ""}`;
  const recommendationsUrl = token
    ? `${ENDPOINTS.discover.recommendations}/-1?previous_page=-1&token=${token}`
    : null;

  const [interestingData, recommendationsData, discussingData, watchingData, collectionsData] =
    await Promise.all([
      fetchList(interestingUrl),
      recommendationsUrl ? fetchList(recommendationsUrl) : Promise.resolve([]),
      fetchListWithFallback(discussingPrimary, discussingFallback),
      fetchListWithFallback(watchingPrimary, watchingFallback),
      fetchList(collectionsUrl),
    ]);

  interesting.value = interestingData;
  recommendations.value = recommendationsData;
  discussing.value = discussingData;
  watching.value = watchingData.slice(0, 35);
  collections.value = collectionsData.slice(0, 32);
}

function scrollInteresting(direction: "left" | "right") {
  const scroller = interestingScroller.value;
  if (!scroller) return;
  const amount = Math.max(320, scroller.clientWidth * 0.8);
  scroller.scrollBy({
    left: direction === "left" ? -amount : amount,
    behavior: "smooth",
  });
}

watch(
  () => userStore.token,
  () => {
    fetchAll();
  },
  { immediate: true }
);
</script>
