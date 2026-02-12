<template>
  <section class="space-y-4">
    <div class="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
      <h2 class="section-title text-base sm:text-xl">{{ title }}</h2>
      <router-link v-if="showAllLink" :to="showAllLink" class="flex items-center nav-link group section-link">
        <span class="hidden text-xs font-semibold uppercase tracking-widest sm:block">Показать все</span>
        <span class="ml-2 h-6 w-6 iconify mdi--arrow-right icon-rotate"></span>
      </router-link>
    </div>
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <AddCollectionLink v-if="isMyCollections" />
      <CollectionCard v-for="item in content" :key="item.id" :collection="item" />
    </div>
  </section>
</template>

<script setup lang="ts">
import CollectionCard from "@/components/CollectionCard.vue";
import AddCollectionLink from "@/components/AddCollectionLink.vue";

defineProps<{
  title: string;
  showAllLink?: string;
  content: any[];
  isMyCollections?: boolean;
}>();
</script>
