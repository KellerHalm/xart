<template>
  <div class="rounded-md border" :style="{ borderColor: colorHex }">
    <div class="flex items-center gap-1 px-1.5 py-1" :style="{ color: colorHex }">
      <span class="iconify h-6 w-6" :class="icon" :style="{ color: colorHex }"></span>
      <p class="text-sm">{{ nickname }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  icon: string;
  nickname: string;
  color: string;
}>();

const colorHex = computed(() => `#${props.color}`);
</script>



