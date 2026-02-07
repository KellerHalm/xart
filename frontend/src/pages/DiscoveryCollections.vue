<template>
  <div>
    <div class="mb-4 overflow-x-auto">
      <div class="flex flex-wrap gap-2">
        <button
          v-for="item in DiscoverCollectionsSort"
          :key="`discover-collections-sort-${item.id}`"
          class="tab-pill rounded-lg px-3 py-2 text-sm font-semibold"
          :class="selectedSort === item.id ? 'tab-pill-active' : ''"
          @click="setSort(item.id)"
        >
          {{ item.name }}
        </button>
      </div>
    </div>

    <div v-if="error" class="flex min-h-[50vh] items-center justify-center">
      <div class="flex flex-col gap-2">
        <h1 class="section-title text-2xl">Ошибка</h1>
        <p class="text-lg">Произошла ошибка при загрузке коллекций.</p>
      </div>
    </div>

    <div v-else-if="isLoading" class="flex min-h-[50vh] items-center justify-center">
      <Spinner />
    </div>

    <div v-else>
      <CollectionSection title="Коллекции" :content="content" />
      <button
        v-if="hasMore"
        class="btn-outline mt-4 w-full rounded-lg px-4 py-2 text-sm"
        @click="loadMore"
      >
        Загрузить ещё
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ENDPOINTS } from "@/api/config";
import { useUserStore } from "@/store/auth";
import CollectionSection from "@/components/CollectionSection.vue";
import Spinner from "@/components/Spinner.vue";

const DiscoverCollectionsSort = [
  {
    id: "all_time_popular",
    name: "Популярные за всё время",
    where: 1,
    sort: 1,
  },
  {
    id: "year_popular",
    name: "Популярные за год",
    where: 1,
    sort: 2,
  },
  {
    id: "season_popular",
    name: "Популярные за сезон",
    where: 1,
    sort: 3,
  },
  {
    id: "week_popular",
    name: "Популярные за неделю",
    where: 1,
    sort: 4,
  },
  {
    id: "recent",
    name: "Недавно добавленные",
    where: 1,
    sort: 5,
  },
  {
    id: "random",
    name: "Случайные",
    where: 1,
    sort: 6,
  },
];

const userStore = useUserStore();
const route = useRoute();
const router = useRouter();

const selectedSort = ref((route.query.sort as string) || "recent");
const content = ref<any[]>([]);
const page = ref(0);
const previousPage = ref(0);
const hasMore = ref(true);
const isLoading = ref(true);
const error = ref(false);

const fallbackSort = DiscoverCollectionsSort[0]!;
const sortConfig = computed(() => {
  return (
    DiscoverCollectionsSort.find((item) => item.id === selectedSort.value) ||
    fallbackSort
  );
});

async function fetchPage(reset = false) {
  if (reset) {
    page.value = 0;
    previousPage.value = 0;
    content.value = [];
    hasMore.value = true;
  }
  if (!hasMore.value) return;

  isLoading.value = page.value === 0;
  error.value = false;

  const config = sortConfig.value ?? fallbackSort;
  let url = `${ENDPOINTS.discover.collections}/${page.value}?where=${config.where}&sort=${config.sort}&previous_page=${previousPage.value}`;
  if (userStore.token) {
    url += `&token=${userStore.token}`;
  }

  const res = await fetch(url);
  if (!res.ok) {
    error.value = true;
    isLoading.value = false;
    return;
  }

  const data = await res.json();
  const items = data?.content || [];
  if (items.length === 0) {
    hasMore.value = false;
  } else {
    content.value = [...content.value, ...items];
    previousPage.value = page.value;
    page.value += 1;
  }
  isLoading.value = false;
}

function loadMore() {
  fetchPage();
}

function setSort(value: string) {
  selectedSort.value = value;
}

watch(
  () => selectedSort.value,
  (value) => {
    router.replace(`/discovery/collections?sort=${value}`);
    fetchPage(true);
  }
);

onMounted(() => {
  fetchPage(true);
});
</script>
