<template>
  <div
    class="flex items-center justify-center rounded-full border border-white/20 px-2 py-1 text-xs font-semibold !text-white shadow backdrop-blur-sm drop-shadow-[0_1px_1px_rgba(0,0,0,0.85)]"
    :class="bgColor"
  >
    <span>{{ name }}</span>
    <span v-if="name2" class="ml-1">{{ devider }}{{ name2 }}</span>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  name: string | number;
  name2?: string | number;
  devider?: string;
  bgColor: string;
}>();
</script>
