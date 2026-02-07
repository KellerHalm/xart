<template>
  <div class="card-surface flex flex-col items-center justify-center gap-4 rounded-xl p-8 text-center">
    <h1 class="section-title text-2xl">{{ title }}</h1>
    <p class="max-w-xl text-sm text-gray-300">
      Эта страница сейчас переносится в Vue-версию. Если нужен приоритет именно этой секции — скажите, и я перенесу её следующей.
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const title = computed(() => (route.meta?.title as string) || "В разработке");
</script>
