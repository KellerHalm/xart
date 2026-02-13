<template>
  <div class="rounded-xl border border-white/5 bg-[#222426] p-4 shadow">
    <div v-if="normalizedImages.length" class="space-y-3">
      <div class="relative overflow-hidden rounded-lg bg-[#2a2d2f]">
        <img
          v-if="!brokenImages.has(activeIndex)"
          :src="normalizedImages[activeIndex]"
          alt="Screenshot"
          class="h-[220px] w-full object-cover sm:h-[260px] lg:h-[240px]"
          loading="lazy"
          decoding="async"
          referrerpolicy="no-referrer"
          @error="markBroken(activeIndex)"
        />
        <div
          v-else
          class="flex h-[220px] items-center justify-center text-xs uppercase tracking-wide text-gray-400 sm:h-[260px] lg:h-[240px]"
        >
          Screenshot unavailable
        </div>

        <button
          v-if="normalizedImages.length > 1"
          type="button"
          class="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/45 px-2 py-1 text-white hover:bg-black/60"
          aria-label="Previous screenshot"
          @click="prevImage"
        >
          ‹
        </button>
        <button
          v-if="normalizedImages.length > 1"
          type="button"
          class="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-white/20 bg-black/45 px-2 py-1 text-white hover:bg-black/60"
          aria-label="Next screenshot"
          @click="nextImage"
        >
          ›
        </button>
      </div>

      <div v-if="normalizedImages.length > 1" class="flex flex-wrap gap-2">
        <button
          v-for="(_, index) in normalizedImages"
          :key="`release-screenshot-dot-${index}`"
          type="button"
          class="h-2.5 w-2.5 rounded-full border border-white/30"
          :class="index === activeIndex ? 'bg-[#d21c22] border-[#d21c22]' : 'bg-white/20'"
          :aria-label="`Go to screenshot ${index + 1}`"
          @click="activeIndex = index"
        ></button>
      </div>
    </div>

    <div
      v-else
      class="flex h-[220px] items-center justify-center rounded-lg bg-[#2a2d2f] text-xs uppercase tracking-wide text-gray-400 sm:h-[260px] lg:h-[240px]"
    >
      Screenshots unavailable
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { API_PREFIX } from "@/api/config";

const props = defineProps<{ images: string[] }>();

const brokenImages = ref(new Set<number>());
const activeIndex = ref(0);

const normalizedImages = computed(() =>
  (props.images || [])
    .filter((image): image is string => typeof image === "string")
    .map((image) => image.trim())
    .filter((image) => image.length > 0)
    .map((image) => toImageUrl(image))
);

const imageProxyBase = resolveImageProxyBase();

watch(
  () => normalizedImages.value.length,
  (length) => {
    if (length === 0) {
      activeIndex.value = 0;
      brokenImages.value = new Set<number>();
      return;
    }
    if (activeIndex.value >= length) {
      activeIndex.value = 0;
    }
  },
  { immediate: true }
);

function prevImage() {
  const total = normalizedImages.value.length;
  if (total <= 1) return;
  activeIndex.value = (activeIndex.value - 1 + total) % total;
}

function nextImage() {
  const total = normalizedImages.value.length;
  if (total <= 1) return;
  activeIndex.value = (activeIndex.value + 1) % total;
}

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
