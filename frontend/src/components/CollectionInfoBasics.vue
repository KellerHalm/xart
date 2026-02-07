<template>
  <div class="card-surface w-full flex-1 rounded-xl p-4">
    <div class="flex flex-col gap-4">
      <div class="flex flex-col items-end justify-between sm:flex-row sm:items-center">
        <div class="text-sm text-gray-400">
          <p>создана: {{ unixToDate(creationDate, "full") }}</p>
          <p>обновлена: {{ unixToDate(updateDate, "full") }}</p>
        </div>
        <router-link :to="`/profile/${authorId}`" class="flex items-center gap-2">
          <img :src="authorAvatar" alt="" class="h-10 w-10 rounded-full" />
          <div>
            <div class="card-title text-lg">{{ authorLogin }}</div>
            <div class="text-right text-xs text-gray-400">Автор</div>
          </div>
        </router-link>
      </div>
      <div class="aspect-video w-full overflow-hidden rounded-lg">
        <img :src="image" alt="" class="h-full w-full object-cover" />
      </div>
      <div class="space-y-2">
        <p class="card-title text-xl">{{ title }}</p>
        <p class="whitespace-pre-wrap text-sm text-gray-300">{{ description }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { unixToDate } from "@/api/utils";

defineProps<{
  image: string;
  title: string;
  description: string;
  authorAvatar: string;
  authorLogin: string;
  authorId: number;
  creationDate: number;
  updateDate: number;
}>();
</script>
