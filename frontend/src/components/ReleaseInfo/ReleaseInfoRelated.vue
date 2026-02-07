<template>
  <div class="rounded-xl border border-white/5 bg-[#222426] p-4 shadow">
    <div class="flex justify-between border-b border-white/5 py-2">
      <h2 class="section-title text-sm">Связанные релизы</h2>
      <router-link
        v-if="related?.id"
        :to="`/related/${related.id}?title=${encodeURIComponent(related.title || related.title_ru || related.title_original || '')}`"
        class="flex items-center section-link"
      >
        <span class="hidden xl:block">Показать все</span>
        <span class="iconify mdi--arrow-right h-6 w-6"></span>
      </router-link>
    </div>
    <div class="mt-2 flex flex-col gap-4">
      <ReleaseLinkList
        v-for="release in filtered"
        :key="release.id"
        v-bind="release"
        :settings="{ showGenres: false, showDescription: false }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import ReleaseLinkList from "@/components/ReleaseLinkList.vue";

const props = defineProps<{
  releaseId: number;
  related: any;
  relatedReleases: any[];
}>();

const filtered = computed(() =>
  (props.relatedReleases || []).filter((item) => item.id !== props.releaseId)
);
</script>

