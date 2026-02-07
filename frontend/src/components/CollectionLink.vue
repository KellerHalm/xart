<template>
  <router-link :to="`/collection/${collection.id}`" class="block h-full">
    <div class="group relative aspect-video w-full overflow-hidden rounded-lg">
      <img
        :src="collection.image || fallbackImage"
        alt=""
        class="absolute inset-0 -z-[1] h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
      <div class="absolute left-2 top-2 flex flex-wrap items-start gap-1">
        <div class="flex items-center justify-center rounded-sm bg-[#e04545] px-3 py-2 text-white">
          <span class="iconify mdi--heart h-4 w-4"></span>
          <span class="ml-1 text-xs font-semibold">{{ collection.favorites_count }}</span>
        </div>
        <div
          v-if="collection.comment_count"
          class="flex items-center justify-center rounded-sm bg-[#2a2d2f] px-3 py-2 text-white"
        >
          <span class="iconify mdi--comment h-4 w-4"></span>
          <span class="ml-1 text-xs font-semibold">{{ collection.comment_count }}</span>
        </div>
        <div
          v-if="collection.is_private"
          class="flex items-center justify-center rounded-sm bg-[#d97706] px-3 py-2 text-white"
        >
          <span class="iconify mdi--lock h-4 w-4"></span>
        </div>
        <div
          v-if="collection.is_favorite"
          class="flex items-center justify-center rounded-sm bg-[#e04545] px-3 py-2 text-white"
        >
          <span class="iconify mdi--heart h-4 w-4"></span>
        </div>
      </div>
      <div class="absolute bottom-2 left-2 transition-transform lg:translate-y-full lg:group-hover:translate-y-0">
        <p
          class="text-sm font-bold text-white transition-transform md:text-base lg:text-lg xl:text-xl line-clamp-2 lg:-translate-y-full lg:group-hover:translate-y-0"
        >
          {{ collection.title }}
        </p>
        <p class="mt-2 hidden text-sm text-white/80 sm:line-clamp-2">{{ collection.description }}</p>
      </div>
    </div>
  </router-link>
</template>

<script setup lang="ts">
defineProps<{ collection: any }>();

const fallbackImage = "/images/icons/xart.svg";
</script>
