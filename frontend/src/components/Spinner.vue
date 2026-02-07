<template>
  <div class="flex items-center justify-center gap-2">
    <div :class="sizeClass" class="rounded-full border-4 border-white/15 border-t-[#e04545] animate-spin"></div>
    <p v-if="label" class="text-sm text-gray-500 dark:text-gray-400 animate-pulse">
      {{ label }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  size?: "sm" | "md" | "lg";
  label?: string;
}>();

const sizeClass = computed(() => {
  if (props.size === "sm") return "w-6 h-6";
  if (props.size === "lg") return "w-12 h-12";
  return "w-8 h-8";
});
</script>
