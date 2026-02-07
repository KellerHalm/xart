<template>
  <div class="space-y-6">
    <div v-if="interesting.length" class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <router-link
        v-for="item in interesting"
        :key="item.id"
        :to="`/release/${item.action}`"
        class="relative overflow-hidden rounded-xl bg-black text-white shadow"
      >
        <img :src="item.image" alt="" class="h-full w-full object-cover" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
        <div class="absolute bottom-3 left-3 right-3">
          <p class="text-lg font-bold">{{ item.title }}</p>
          <p class="text-sm text-gray-200 line-clamp-2">{{ item.description }}</p>
        </div>
      </router-link>
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
    <CollectionSection
      v-if="collections.length"
      title="Коллекции недели"
      :content="collections"
      show-all-link="/discovery/collections?sort=week_popular"
    />
  </div>

  <PopularModal :is-open="popularModalOpen" @close="popularModalOpen = false" />
  <ScheduleModal :is-open="scheduleModalOpen" @close="scheduleModalOpen = false" />
  <FiltersModal :is-open="filtersModalOpen" @close="filtersModalOpen = false" />
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { ENDPOINTS } from "@/api/config";
import ReleaseSection from "@/components/ReleaseSection.vue";
import CollectionSection from "@/components/CollectionSection.vue";
import PopularModal from "@/components/Discovery/PopularModal.vue";
import ScheduleModal from "@/components/Discovery/ScheduleModal.vue";
import FiltersModal from "@/components/Discovery/FiltersModal.vue";

const router = useRouter();

const interesting = ref<any[]>([]);
const recommendations = ref<any[]>([]);
const discussing = ref<any[]>([]);
const watching = ref<any[]>([]);
const collections = ref<any[]>([]);

const popularModalOpen = ref(false);
const scheduleModalOpen = ref(false);
const filtersModalOpen = ref(false);

async function fetchSection(url: string) {
  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  return data?.content || [];
}

onMounted(async () => {
  const [interestingData, recommendationsData, discussingData, watchingData, collectionsData] =
    await Promise.all([
      fetchSection(ENDPOINTS.discover.interesting),
      fetchSection(ENDPOINTS.discover.recommendations),
      fetchSection(ENDPOINTS.discover.discussing),
      fetchSection(ENDPOINTS.discover.watching),
      fetchSection(ENDPOINTS.discover.collections),
    ]);
  interesting.value = interestingData;
  recommendations.value = recommendationsData;
  discussing.value = discussingData;
  watching.value = watchingData;
  collections.value = collectionsData;
});
</script>
