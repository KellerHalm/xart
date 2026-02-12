<template>
  <div>
    <div class="flex items-center justify-between border-b border-white/10 px-4 py-2">
      <h1 class="section-title text-lg">Рекомендации</h1>
    </div>
    <div v-if="isLoading" class="flex min-h-[50vh] items-center justify-center">
      <Spinner />
    </div>
    <div v-else-if="content.length">
      <ReleaseSection title="Рекомендации" :content="content" />
    </div>
    <div v-else class="card-surface mt-6 flex flex-col items-center justify-center gap-4 rounded-xl p-6 text-center">
      <span class="iconify twemoji--open-book h-16 w-16"></span>
      <p>Рекомендаций пока нет.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { ENDPOINTS } from "@/api/config";
import { useUserStore } from "@/store/auth";
import ReleaseSection from "@/components/ReleaseSection.vue";
import Spinner from "@/components/Spinner.vue";

const userStore = useUserStore();
const content = ref<any[]>([]);
const isLoading = ref(true);

async function fetchRecommendations() {
  if (!userStore.token) {
    isLoading.value = false;
    return;
  }
  let url = `${ENDPOINTS.discover.recommendations}/-1?previous_page=-1&token=${userStore.token}`;
  const res = await fetch(url);
  if (!res.ok) {
    isLoading.value = false;
    return;
  }
  const data = await res.json();
  content.value = data?.content || [];
  isLoading.value = false;
}

onMounted(() => {
  fetchRecommendations();
});
</script>
