<template>
  <router-link :to="`/collection/${collection.id}`" class="block h-full">
    <div class="card-surface flex h-full flex-col overflow-hidden rounded-xl">
      <div class="relative aspect-[16/9] w-full overflow-hidden">
        <img :src="collection.image || fallbackImage" alt="" class="h-full w-full object-cover" />
      </div>
      <div class="flex flex-1 flex-col gap-2 p-3">
        <h3 class="collection-title text-sm line-clamp-2">
          {{ collection.title }}
        </h3>
        <p v-if="collection.description" class="collection-subtitle line-clamp-2">
          {{ collection.description }}
        </p>
      </div>
    </div>
  </router-link>
</template>

<script setup lang="ts">
defineProps<{ collection: any }>();

const fallbackImage = "/images/icons/xart.svg";
</script>
