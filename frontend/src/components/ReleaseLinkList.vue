<template>
  <router-link :to="`/release/${id}`" class="block">
    <div class="flex gap-3">
      <div class="w-24 flex-shrink-0">
        <img
          :src="image || fallbackImage"
          alt=""
          loading="lazy"
          decoding="async"
          class="w-full rounded-md object-cover"
        />
      </div>
      <div class="flex flex-col gap-1">
        <p v-if="genres && showGenres" class="text-xs text-gray-400">
          {{ genres }}
        </p>
        <p class="card-title text-sm line-clamp-2 sm:text-base">{{ title_ru || title_original }}</p>
        <p v-if="showOrigTitle && title_original" class="card-subtitle line-clamp-2">
          {{ title_original }}
        </p>
        <p v-if="showDescription && description" class="text-sm text-gray-400 line-clamp-3">
          {{ description }}
        </p>
      </div>
    </div>
  </router-link>
</template>

<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
});

const props = defineProps<{
  id: number;
  image: string;
  title_ru?: string;
  title_original?: string;
  description?: string;
  genres?: string;
  settings?: {
    showGenres?: boolean;
    showDescription?: boolean;
    showOrigTitle?: boolean;
  };
}>();

const fallbackImage = "/images/icons/xart.svg";

const showGenres = props.settings?.showGenres ?? true;
const showDescription = props.settings?.showDescription ?? true;
const showOrigTitle = props.settings?.showOrigTitle ?? true;
</script>
