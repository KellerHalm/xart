<template>
  <img
    :src="image || fallbackImage"
    :alt="alt"
    class="w-full rounded-lg object-cover"
    :class="className"
  />
</template>

<script setup lang="ts">
defineProps<{
  image: string;
  alt?: string;
  className?: string;
}>();

const fallbackImage = "/images/icons/xart.svg";
</script>
