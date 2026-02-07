<template>
  <div class="card-surface rounded-xl p-4">
    <div class="flex items-center justify-between">
      <h1 class="section-title text-xl">Статистика</h1>
      <router-link :to="`/profile/${profileId}/bookmarks`" class="flex items-center gap-2 section-link">
        <p class="hidden text-sm font-semibold sm:block">Показать все</p>
        <span class="iconify mdi--arrow-right h-6 w-6"></span>
      </router-link>
    </div>
    <div class="mt-4 flex flex-col items-start gap-6 lg:flex-row lg:items-center">
      <div class="space-y-3">
        <div class="grid grid-cols-1 gap-x-4 gap-y-2 xl:grid-cols-2">
          <p class="whitespace-nowrap">
            <span class="mr-2 inline-block h-4 w-4 rounded bg-[#66bb6c]"></span>
            Смотрю <span class="font-bold">{{ lists[0] }}</span>
          </p>
          <p class="whitespace-nowrap">
            <span class="mr-2 inline-block h-4 w-4 rounded bg-[#b566bb]"></span>
            В планах <span class="font-bold">{{ lists[1] }}</span>
          </p>
          <p class="whitespace-nowrap">
            <span class="mr-2 inline-block h-4 w-4 rounded bg-[#5c6cc0]"></span>
            Просмотрено <span class="font-bold">{{ lists[2] }}</span>
          </p>
          <p class="whitespace-nowrap">
            <span class="mr-2 inline-block h-4 w-4 rounded bg-[#ffca28]"></span>
            Отложено <span class="font-bold">{{ lists[3] }}</span>
          </p>
          <p class="whitespace-nowrap">
            <span class="mr-2 inline-block h-4 w-4 rounded bg-[#ef5450]"></span>
            Брошено <span class="font-bold">{{ lists[4] }}</span>
          </p>
        </div>

        <div class="space-y-1 text-sm">
          <p>
            Жанры:
            <span v-if="preferredGenres.length > 0">
              <span v-for="(item, index) in preferredGenres" :key="`preferred-genres-${item.name}`">
                <span v-if="index > 0">, </span>
                <ReleaseInfoSearchLink :title="item.name" searchBy="tag" />
                <span class="text-xs text-gray-400"> {{ item.percentage }}%</span>
              </span>
            </span>
          </p>
          <p>
            Аудитория:
            <span v-if="preferredAudiences.length > 0">
              <span v-for="(item, index) in preferredAudiences" :key="`preferred-audiences-${item.name}`">
                <span v-if="index > 0">, </span>
                <ReleaseInfoSearchLink :title="item.name" searchBy="tag" />
                <span class="text-xs text-gray-400"> {{ item.percentage }}%</span>
              </span>
            </span>
          </p>
          <p>
            Тематика:
            <span v-if="preferredThemes.length > 0">
              <span v-for="(item, index) in preferredThemes" :key="`preferred-themes-${item.name}`">
                <span v-if="index > 0">, </span>
                <ReleaseInfoSearchLink :title="item.name" searchBy="tag" />
                <span class="text-xs text-gray-400"> {{ item.percentage }}%</span>
              </span>
            </span>
          </p>

          <p>
            Просмотрено серий: <span class="font-bold">{{ watchedCount }}</span>
          </p>
          <p>
            Время просмотра: <span class="font-bold">~{{ minutesToTime(watchedTime) }}</span>
          </p>
        </div>
      </div>

      <div class="relative h-44 w-44 flex-shrink-0 sm:h-52 sm:w-52">
        <div class="absolute inset-0 rounded-full" :style="{ background: `conic-gradient(${chartGradient})` }"></div>
        <div class="absolute inset-[18%] rounded-full bg-[#1f2123] border border-white/10"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { minutesToTime } from "@/api/utils";
import ReleaseInfoSearchLink from "@/components/ReleaseInfo/ReleaseInfoSearchLink.vue";

type PreferredItem = { name: string; percentage: number };

const props = defineProps<{
  lists: number[];
  watchedCount: number;
  watchedTime: number;
  profileId: number;
  preferredGenres: PreferredItem[];
  preferredAudiences: PreferredItem[];
  preferredThemes: PreferredItem[];
}>();

const colors = ["#66bb6c", "#b566bb", "#5c6cc0", "#ffca28", "#ef5450"];

const chartGradient = computed(() => {
  const total = props.lists.reduce((acc, cur) => acc + cur, 0) || 1;
  let current = 0;
  return props.lists
    .map((value, index) => {
      const start = current;
      const percent = (value / total) * 100;
      current += percent;
      return `${colors[index]} ${start}% ${current}%`;
    })
    .join(", ");
});
</script>


