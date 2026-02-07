<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between border-b border-white/10 px-4 py-2">
      <h1 class="section-title text-xl">{{ sectionTitle }}</h1>
      <router-link to="/" class="section-link text-sm">Назад</router-link>
    </div>
    <div v-if="isLoading" class="flex items-center justify-center py-10">
      <Spinner size="lg" />
    </div>
    <div v-else-if="content?.content?.length">
      <ReleaseSection :title="sectionTitle" :content="content.content" />
    </div>
    <div v-else class="card-surface rounded-xl p-6 text-center">
      <p>Нет данных для выбранной категории.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { slugToFilter } from "@/api/index-filters";
import { FetchFilter } from "@/api/utils";
import { useUserStore } from "@/store/auth";
import ReleaseSection from "@/components/ReleaseSection.vue";
import Spinner from "@/components/Spinner.vue";

const route = useRoute();
const userStore = useUserStore();

const isLoading = ref(false);
const content = ref<any | null>(null);

const sectionTitle = computed(() => {
  const slug = route.params.slug as string;
  return slugToFilter[slug]?.name || "Категория";
});

async function loadCategory() {
  const slug = route.params.slug as string;
  const filter = slugToFilter[slug];
  if (!filter) {
    content.value = null;
    return;
  }
  isLoading.value = true;
  const [data] = await FetchFilter(filter.filter, 0, userStore.token);
  content.value = data;
  isLoading.value = false;
}

onMounted(loadCategory);
watch(
  () => route.params.slug,
  () => loadCategory()
);

watch(
  () => userStore.token,
  () => loadCategory()
);
</script>
