<template>
  <section class="card-surface rounded-xl p-4">
    <div class="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div class="flex items-center justify-center p-4">
        <div
          v-for="(item, index) in images"
          :key="`related-img-${index}`"
          class="relative aspect-[9/12] w-[100px] overflow-hidden rounded-lg shadow-md lg:w-[300px]"
          :class="[
            index % 2 === 1 ? 'z-20 scale-110 shadow-lg' : 'z-10',
            index === 0 ? 'translate-x-6' : '',
            index === images.length - 1 ? '-translate-x-6' : '',
          ]"
        >
          <img :src="item" alt="" class="h-full w-full object-cover" />
        </div>
      </div>
      <div class="mx-auto flex max-w-[400px] flex-1 flex-col items-center justify-center gap-2 text-center">
        <h2 class="section-title text-2xl">{{ name }}</h2>
        <p>{{ releaseCount }} {{ declension }} в франшизе</p>
        <router-link :to="`/related/${id}`" class="btn-outline inline-flex items-center gap-2 rounded-full px-6 py-2">
          <span class="section-title text-lg">Перейти</span>
          <span class="iconify mdi--arrow-right h-6 w-6"></span>
        </router-link>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { numberDeclension } from "@/api/utils";

const props = defineProps<{
  id: number;
  name_ru?: string;
  name?: string;
  release_count?: number;
  images?: string[];
}>();

const images = computed(() => props.images || []);
const name = computed(() => props.name_ru || props.name || "Франшиза");
const releaseCount = computed(() => props.release_count || 0);
const declension = computed(() =>
  numberDeclension(releaseCount.value, "релиз", "релиза", "релизов")
);
</script>


