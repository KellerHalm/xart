<template>
  <div class="rounded-xl border border-white/5 bg-[#222426] p-4 shadow">
    <Swiper
      v-if="normalizedImages.length"
      :modules="[Navigation, Pagination, Autoplay]"
      :space-between="8"
      :slides-per-view="1"
      :autoplay="autoplayConfig"
      :pagination="{ clickable: true }"
      :navigation="normalizedImages.length > 1"
      :loop="normalizedImages.length > 1"
      class="w-full"
    >
      <SwiperSlide
        v-for="(image, index) in normalizedImages"
        :key="`release-screenshot-${index}`"
      >
        <div class="relative aspect-video overflow-hidden rounded-lg bg-[#2a2d2f]">
          <img
            v-if="!brokenImages.has(index)"
            :src="image"
            alt="Скриншот релиза"
            class="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
            referrerpolicy="no-referrer"
            @error="markBroken(index)"
          />
          <div
            v-else
            class="flex h-full items-center justify-center text-xs uppercase tracking-wide text-gray-400"
          >
            Скриншот недоступен
          </div>
        </div>
      </SwiperSlide>
    </Swiper>
    <div
      v-else
      class="flex aspect-video items-center justify-center rounded-lg bg-[#2a2d2f] text-xs uppercase tracking-wide text-gray-400"
    >
      Скриншоты недоступны
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { API_PREFIX } from "@/api/config";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const props = defineProps<{ images: string[] }>();

const brokenImages = ref(new Set<number>());

const normalizedImages = computed(() =>
  (props.images || [])
    .filter((image): image is string => typeof image === "string")
    .map((image) => image.trim())
    .filter((image) => image.length > 0)
    .map((image) => toImageUrl(image))
);

const autoplayConfig = computed(() =>
  normalizedImages.value.length > 1
    ? { delay: 4000, disableOnInteraction: false }
    : false
);

const imageProxyBase = resolveImageProxyBase();

function markBroken(index: number) {
  brokenImages.value = new Set([...brokenImages.value, index]);
}

function toImageUrl(image: string) {
  if (image.startsWith("data:") || image.startsWith("blob:")) {
    return image;
  }

  if (!imageProxyBase) {
    return image;
  }

  if (image.startsWith("/api/image")) {
    return image;
  }
  if (image.startsWith("http://") || image.startsWith("https://")) {
    return `${imageProxyBase}?url=${encodeURIComponent(image)}`;
  }

  return image;
}

function resolveImageProxyBase() {
  if (API_PREFIX === "/api/proxy") {
    return "/api/image";
  }

  if (API_PREFIX.endsWith("/api/proxy")) {
    return `${API_PREFIX.slice(0, -"/api/proxy".length)}/api/image`;
  }

  return "";
}
</script>
