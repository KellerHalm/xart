<template>
  <div
    class="rounded-md border px-1.5 py-0.5 text-sm"
    :style="{ borderColor: colorHex, color: colorHex }"
  >
    {{ name }}
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ name: string; color: string }>();

const colorHex = computed(() => `#${props.color}`);
</script>



