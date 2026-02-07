<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
    <div class="max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-xl border border-white/10 bg-[#1f2123] shadow-xl">
      <div class="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <h2 class="section-title text-xl">зменить релизы в коллекции</h2>
        <button class="text-gray-400 hover:text-white" @click="emit('close')">✕</button>
      </div>
      <div class="max-h-[75vh] overflow-y-auto px-6 py-4">
        <form class="mb-4" @submit.prevent="runSearch(true)">
          <div class="relative">
            <span class="iconify mdi--magnify absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"></span>
            <input
              v-model="query"
              type="search"
              class="input-dark w-full rounded-lg p-4 ps-10 text-sm"
              placeholder="Поиск аниме..."
              required
            />
            <button
              type="button"
              class="btn-outline absolute bottom-2.5 right-2.5 rounded-lg border-[#d21c22] px-4 py-2 text-sm text-[#d21c22] hover:bg-[#d21c22]/10"
              @click="clearSearch"
            >
              Очистить
            </button>
          </div>
        </form>

        <div class="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          <button
            v-for="release in results"
            :key="release.id"
            class="text-left"
            @click="addRelease(release)"
          >
            <PosterWithStuff v-bind="release" :settings="{ showDescription: false }" />
          </button>
        </div>

        <div v-if="isLoading" class="flex items-center justify-center py-6">
          <Spinner />
        </div>
        <div v-if="error" class="text-sm text-[#d21c22]">Произошла ошибка</div>

        <button
          v-if="hasMore && !isLoading"
          class="btn-outline mt-4 w-full rounded-lg px-4 py-2 text-sm"
          @click="runSearch(false)"
        >
          Загрузить ещё
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ENDPOINTS } from "@/api/config";
import { tryCatchAPI } from "@/api/utils";
import { toast } from "@/store/toast";
import PosterWithStuff from "@/components/ReleasePoster/PosterWithStuff.vue";
import Spinner from "@/components/Spinner.vue";

const props = defineProps<{
  isOpen: boolean;
  releases: any[];
  releasesIds: number[];
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "update", releases: any[], ids: number[]): void;
}>();

const query = ref("");
const results = ref<any[]>([]);
const page = ref(0);
const hasMore = ref(true);
const isLoading = ref(false);
const error = ref(false);

async function runSearch(reset: boolean) {
  if (!query.value) return;
  if (reset) {
    page.value = 0;
    results.value = [];
    hasMore.value = true;
  }
  if (!hasMore.value) return;
  isLoading.value = true;
  error.value = false;

  const url = `${ENDPOINTS.search.releases}/${page.value}`;
  const { data, error: err } = await tryCatchAPI(
    fetch(url, {
      method: "POST",
      headers: {
        "Api-Version": "v2",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: query.value, searchBy: 0 }),
    })
  );

  if (err) {
    error.value = true;
    isLoading.value = false;
    return;
  }

  const items = data?.releases || [];
  if (items.length === 0) {
    hasMore.value = false;
  } else {
    results.value = [...results.value, ...items];
    page.value += 1;
  }
  isLoading.value = false;
}

function clearSearch() {
  query.value = "";
  results.value = [];
  page.value = 0;
  hasMore.value = true;
}

function addRelease(release: any) {
  if (props.releasesIds.length >= 100) {
    toast.error("Достигнуто максимальное количество релизов в коллекции - 100", {
      autoClose: 2500,
    });
    return;
  }
  if (props.releasesIds.includes(release.id)) {
    toast.error("Релиз уже добавлен в коллекцию", { autoClose: 2500 });
    return;
  }
  const newReleases = [...props.releases, release];
  const newIds = [...props.releasesIds, release.id];
  results.value = results.value.filter((item) => item.id !== release.id);
  emit("update", newReleases, newIds);
}
</script>

