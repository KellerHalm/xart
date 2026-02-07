<template>
  <router-link :to="`/release/${release.id}`" class="block h-full">
    <div class="card-surface flex h-full flex-col overflow-hidden rounded-xl">
      <div class="relative aspect-[12/16] w-full overflow-hidden">
        <img
          :src="release.image || fallbackImage"
          :alt="release.title_ru || release.title_original || 'release'"
          class="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      <div class="flex flex-1 flex-col gap-2 p-3">
        <h3 class="card-title text-xs line-clamp-2 sm:text-sm">
          {{ release.title_ru || release.title_original }}
        </h3>
        <p v-if="release.description" class="text-xs text-gray-400 line-clamp-2">
          {{ release.description }}
        </p>
        <div class="mt-auto flex items-center justify-between text-xs text-gray-400">
          <span v-if="release.grade" class="rounded-full border border-[#d21c22]/40 bg-[#2a1718] px-2 py-0.5 text-[#f1a1a5]">в­ђ {{ release.grade }}</span>
          <span v-if="release.episodes_total" class="rounded-full border border-white/10 bg-black/20 px-2 py-0.5 text-gray-300">{{ release.episodes_released || 0 }}/{{ release.episodes_total }}</span>
        </div>
      </div>
    </div>
  </router-link>
</template>

<script setup lang="ts">
defineProps<{
  release: {
    id: number | string;
    image: string;
    title_ru?: string;
    title_original?: string;
    description?: string;
    grade?: number;
    episodes_released?: number;
    episodes_total?: number;
  };
}>();

const fallbackImage = "/images/icons/xart.svg";
</script>

