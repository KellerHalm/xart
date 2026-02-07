<template>
  <div class="h-full rounded-xl border border-white/5 bg-[#222426] p-4 shadow">
    <div class="flex h-full flex-col gap-4 lg:grid lg:grid-cols-[1fr_2fr] lg:items-start">
      <div class="flex flex-col gap-2">
        <div class="relative flex items-center justify-center overflow-hidden rounded-lg poster-glow">
          <Poster :image="image" className="z-10 sm:scale-95 lg:scale-100" />
          <Poster
            :image="image"
            className="absolute left-0 top-0 w-full scale-125 opacity-75 blur-xl brightness-75"
          />
        </div>
        <ReleaseInfoStreaming :release-id="releaseId" />
      </div>
      <div class="flex max-w-2xl flex-col gap-2 text-sm md:text-base">
        <div class="flex flex-col gap-1">
          <p class="title-main text-xl md:text-2xl">
            {{ title.ru }}
          </p>
          <p class="title-sub md:text-sm">
            {{ title.original }}
          </p>
        </div>
        <div
          v-if="note"
          class="rounded-br-md rounded-tr-md border-l-4 border-[#e04545] bg-[#2a1b1b] py-2 text-gray-200"
        >
          <div class="ml-2" v-html="note"></div>
        </div>
        <p
          class="overflow-y-hidden transition-[max-height] md:max-h-full"
          :style="{ maxHeight: isFullDescription ? '1000px' : '80px' }"
        >
          {{ description }}
        </p>
        <button
          class="rounded-md border border-white/10 px-3 py-1 text-sm text-gray-200 hover:bg-white/5 md:hidden"
          @click="isFullDescription = !isFullDescription"
        >
          {{ isFullDescription ? "Скрыть" : "Показать полностью" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import Poster from "@/components/ReleasePoster/Poster.vue";
import ReleaseInfoStreaming from "@/components/ReleaseInfo/ReleaseInfoStreaming.vue";

const props = defineProps<{
  releaseId: number;
  image: string;
  title: { ru: string; original: string };
  note: string | null;
  description: string;
}>();

const isFullDescription = ref(false);
</script>
