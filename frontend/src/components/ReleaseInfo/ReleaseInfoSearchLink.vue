<template>
  <router-link
    class="section-link transition-colors duration-300"
    :to="searchUrl"
  >
    {{ title }}
  </router-link>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ title: string; searchBy: string }>();

const searchUrl = computed(() => {
  const params = encodeURIComponent(
    JSON.stringify({ where: "releases", searchBy: props.searchBy })
  );
  return `/search?query=${encodeURIComponent(props.title)}&params=${params}`;
});
</script>
