<template>
  <div v-if="platforms.length" class="grid grid-flow-row-dense grid-cols-1 gap-1 2xl:grid-cols-2">
    <a
      v-for="item in platforms"
      :key="item.id"
      :href="item.url"
      target="_blank"
      class="flex items-center gap-2 rounded-lg bg-[#2a2d2f] px-4 py-2 text-sm text-gray-200 transition-colors hover:bg-[#35393c]"
    >
      <img :src="item.icon" alt="" class="h-6 w-6 rounded-full" />
      <span class="line-clamp-2">{{ item.name }}</span>
    </a>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { ENDPOINTS } from "@/api/config";

const props = defineProps<{ releaseId: number }>();

const platforms = ref<any[]>([]);

onMounted(async () => {
  const res = await fetch(`${ENDPOINTS.release.licensed}/${props.releaseId}`);
  if (!res.ok) return;
  const data = await res.json();
  if (data?.content?.length) {
    platforms.value = data.content;
  }
});
</script>
