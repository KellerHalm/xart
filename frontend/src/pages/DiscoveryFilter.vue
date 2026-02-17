<template>
  <div class="space-y-4">
    <div v-if="error" class="alert-error rounded-md p-4 text-sm">
      Произошла ошибка фильтра
    </div>

    <ReleaseSection v-if="content.length" title="Фильтр" :content="content" />

    <div v-if="isLoading" class="flex items-center justify-center py-6">
      <Spinner />
    </div>
    <button
      v-if="hasMore && !isLoading"
      class="btn-outline w-full rounded-lg px-4 py-2 text-sm"
      @click="fetchPage()"
    >
      Загрузить ещё
    </button>

    <button
      class="fixed bottom-6 right-6 flex h-12 w-12 items-center justify-center rounded-full btn-accent shadow-lg"
      @click="filtersModalOpen = true"
    >
      <span class="iconify mdi--mixer-settings h-6 w-6"></span>
    </button>

    <FiltersModal
      :is-open="filtersModalOpen"
      :filter="filter"
      @close="filtersModalOpen = false"
      @apply="updateFilter"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { FilterDefault, FetchFilter, cloneFilter } from "@/api/utils";
import type { Filter } from "@/api/utils";
import { useUserStore } from "@/store/auth";
import ReleaseSection from "@/components/ReleaseSection.vue";
import Spinner from "@/components/Spinner.vue";
import FiltersModal from "@/components/Discovery/FiltersModal.vue";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const filter = ref<Filter>(cloneFilter(FilterDefault));
const content = ref<any[]>([]);
const page = ref(0);
const hasMore = ref(true);
const isLoading = ref(false);
const error = ref(false);
const filtersModalOpen = ref(false);

function parseFilterParam(value: string | null) {
  if (!value) return cloneFilter(FilterDefault);
  const tryParse = (raw: string) => {
    const parsed = JSON.parse(raw);
    if (Object.keys(parsed).length !== Object.keys(FilterDefault).length) {
      return null;
    }
    return parsed as Filter;
  };

  try {
    const parsed = tryParse(value);
    if (parsed) return { ...cloneFilter(FilterDefault), ...parsed };
  } catch {
    // Fall through to decoding attempt.
  }

  try {
    const decoded = decodeURIComponent(value);
    const parsed = tryParse(decoded);
    if (parsed) return { ...cloneFilter(FilterDefault), ...parsed };
  } catch {
    // Ignore decoding/parsing errors.
  }

  return cloneFilter(FilterDefault);
}

async function fetchPage(reset = false) {
  if (reset) {
    page.value = 0;
    content.value = [];
    hasMore.value = true;
  }
  if (!hasMore.value) return;

  isLoading.value = true;
  error.value = false;
  const [data, err] = await FetchFilter(filter.value, page.value, userStore.token);
  if (err) {
    error.value = true;
    isLoading.value = false;
    return;
  }
  const items = data?.content || [];
  if (items.length === 0) {
    hasMore.value = false;
  } else {
    content.value = [...content.value, ...items];
    page.value += 1;
  }
  isLoading.value = false;
}

function updateFilter(next: Filter) {
  filter.value = next;
}

watch(
  () => route.query.filter,
  (value) => {
    filter.value = parseFilterParam(typeof value === "string" ? value : null);
    fetchPage(true);
  }
);

watch(
  () => filter.value,
  (value) => {
    const serialized = encodeURIComponent(JSON.stringify(value));
    router.replace(`/discovery/filter?filter=${serialized}`);
  },
  { deep: true }
);

onMounted(() => {
  filter.value = parseFilterParam(typeof route.query.filter === "string" ? route.query.filter : null);
  fetchPage(true);
});
</script>
