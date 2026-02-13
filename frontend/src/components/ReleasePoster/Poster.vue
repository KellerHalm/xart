<template>
  <img
    :src="image || fallbackImage"
    :alt="alt"
    :loading="loading"
    decoding="async"
    class="w-full rounded-lg object-cover"
    :class="className"
  />
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  image: string;
  alt?: string;
  className?: string;
  loading?: "lazy" | "eager";
}>(), {
  loading: "lazy",
});

const fallbackImage = "/images/icons/xart.svg";
</script>
