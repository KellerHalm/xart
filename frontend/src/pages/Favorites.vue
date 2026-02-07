<template>
  <div>
    <form class="mx-4 mb-4" @submit.prevent="searchFavorites">
      <div class="relative">
        <span class="iconify mdi--magnify absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"></span>
        <input
          v-model="searchVal"
          type="search"
          class="input-dark w-full rounded-lg p-4 ps-10 text-sm"
          placeholder="Поиск аниме..."
          required
        />
        <button
          type="submit"
          class="btn-accent absolute bottom-2.5 right-2.5 rounded-lg px-4 py-2 text-sm"
        >
          Поиск
        </button>
      </div>
    </form>

    <div class="flex items-center justify-between border-b border-white/10 px-4 py-2">
      <h1 class="section-title text-lg">збранное</h1>
      <select
        class="input-dark rounded-lg px-3 py-2 text-sm"
        :value="selectedSort"
        @change="onSortChange"
      >
        <option v-for="(item, index) in sort.values" :key="item.id" :value="index">
          {{ item.name }}
        </option>
      </select>
    </div>

    <div v-if="isLoading" class="flex min-h-[50vh] items-center justify-center">
      <Spinner />
    </div>
    <div v-else-if="content.length">
      <ReleaseSection title="збранное" :content="content" />
      <button
        v-if="hasMore"
        class="btn-outline mt-4 w-full rounded-lg px-4 py-2 text-sm"
        @click="loadMore"
      >
        Загрузить ещё
      </button>
    </div>
    <div v-else class="card-surface mt-6 flex flex-col items-center justify-center gap-4 rounded-xl p-6 text-center">
      <span class="iconify twemoji--broken-heart h-16 w-16"></span>
      <p>В избранном пока ничего нет...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { ENDPOINTS } from "@/api/config";
import { useUserStore } from "@/store/auth";
import { sort } from "@/constants/sort";
import ReleaseSection from "@/components/ReleaseSection.vue";
import Spinner from "@/components/Spinner.vue";

const userStore = useUserStore();
const router = useRouter();

const content = ref<any[]>([]);
const page = ref(0);
const hasMore = ref(true);
const isLoading = ref(true);
const selectedSort = ref(0);
const searchVal = ref("");

async function fetchPage(reset = false) {
  if (!userStore.token) return;
  if (reset) {
    page.value = 0;
    content.value = [];
    hasMore.value = true;
  }
  if (!hasMore.value) return;

  isLoading.value = page.value === 0;
  const sortOption = sort.values[selectedSort.value] ?? sort.values[0]!;
  const url = `${ENDPOINTS.user.favorite}/all/${page.value}?token=${userStore.token}&sort=${sortOption.id}`;
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

function onSortChange(event: Event) {
  selectedSort.value = Number((event.target as HTMLSelectElement).value);
  fetchPage(true);
}

function searchFavorites() {
  const params = encodeURIComponent(
    JSON.stringify({ where: "favorites", searchBy: 0 })
  );
  router.push(`/search?query=${encodeURIComponent(searchVal.value)}&params=${params}`);
}

onMounted(() => {
  if (userStore.state === "finished" && !userStore.token) {
    router.push("/login?redirect=/favorites");
    return;
  }
  fetchPage(true);
});

watch(
  () => userStore.state,
  () => {
    if (userStore.state === "finished" && !userStore.token) {
      router.push("/login?redirect=/favorites");
    }
  }
);
</script>

