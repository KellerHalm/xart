<template>
  <section class="space-y-4">
    <div class="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
      <h2 class="section-title text-base sm:text-xl">{{ title }}</h2>
      <router-link
        v-if="showAllLink"
        :to="showAllLink"
        class="flex items-center nav-link group section-link"
      >
        <span class="hidden text-xs font-semibold uppercase tracking-widest sm:block">Показать все</span>
        <span class="ml-2 h-6 w-6 iconify mdi--arrow-right icon-rotate"></span>
      </router-link>
    </div>
    <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
      <ReleaseCard v-for="item in content" :key="item.id" :release="item" />
    </div>
  </section>
</template>

<script setup lang="ts">
import ReleaseCard from "@/components/ReleaseCard.vue";

defineProps<{
  title: string;
  showAllLink?: string;
  content: any[];
}>();
</script>
