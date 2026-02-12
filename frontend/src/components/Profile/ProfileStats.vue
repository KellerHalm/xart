<template>
  <div class="card-surface rounded-2xl p-5 sm:p-6">
    <div class="flex items-center justify-between">
      <h1 class="section-title text-xl">Статистика</h1>
      <router-link to="/bookmarks" class="flex items-center gap-2 section-link">
        <p class="hidden text-sm font-semibold sm:block">Показать все</p>
        <span class="iconify mdi--arrow-right h-6 w-6"></span>
      </router-link>
    </div>
    <div class="mt-4 flex flex-col gap-6 xl:flex-row xl:items-center">
      <div class="space-y-4">
        <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <button
            v-for="(segment, index) in segments"
            :key="segment.label"
            type="button"
            class="group flex items-center gap-2 text-left text-sm font-medium text-gray-300 transition"
            :class="activeIndex === index ? 'text-white' : ''"
            @mouseenter="activeIndex = index"
            @mouseleave="activeIndex = null"
            @focus="activeIndex = index"
            @blur="activeIndex = null"
          >
            <span
              class="h-3.5 w-3.5 flex-shrink-0 rounded-sm shadow-[0_0_10px_rgba(0,0,0,0.4)]"
              :style="{ backgroundColor: segment.color }"
            ></span>
            <span class="whitespace-nowrap">{{ segment.label }}</span>
            <span class="font-semibold text-white">{{ segment.value }}</span>
          </button>
        </div>

        <div class="space-y-1 text-sm text-gray-300">
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
            Просмотрено серий: <span class="font-semibold text-white">{{ watchedCount }}</span>
          </p>
          <p>
            Время просмотра: <span class="font-semibold text-white">~{{ minutesToTime(watchedTime) }}</span>
          </p>
        </div>
      </div>

      <div class="relative h-48 w-48 flex-shrink-0 sm:h-56 sm:w-56">
        <svg viewBox="0 0 200 200" class="h-full w-full">
          <circle cx="100" cy="100" r="70" stroke="rgba(255,255,255,0.1)" stroke-width="24" fill="none" />
          <g v-if="hasChartData">
            <template v-for="(segment, index) in chartSegments" :key="`segment-${segment.label}`">
              <path
                v-if="segment.path"
                :d="segment.path"
                :stroke="segment.color"
                :stroke-width="activeIndex === index ? 26 : 22"
                stroke-linecap="round"
                fill="none"
                class="cursor-pointer transition-all duration-200"
                :style="{
                  opacity: activeIndex === null || activeIndex === index ? 1 : 0.35,
                  filter: activeIndex === index ? 'drop-shadow(0 0 12px rgba(255,255,255,0.35))' : 'none',
                }"
                @mouseenter="activeIndex = index"
                @mouseleave="activeIndex = null"
                @focus="activeIndex = index"
                @blur="activeIndex = null"
                tabindex="0"
              />
            </template>
          </g>
        </svg>
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="text-center">
            <p class="text-xs uppercase tracking-[0.2em] text-gray-400">
              {{ activeSegment ? activeSegment.label : "Всего" }}
            </p>
            <p class="text-2xl font-semibold text-white">
              {{ activeSegment ? activeSegment.value : total }}
            </p>
            <p v-if="activeSegment" class="text-xs text-gray-400">
              {{ activeSegment.percent }}%
            </p>
            <p v-else-if="!hasChartData" class="text-xs text-gray-500">Нет данных</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
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

const activeIndex = ref<number | null>(null);

const labels = ["Смотрю", "В планах", "Просмотрено", "Отложено", "Брошено"];
const colors = ["#35d07f", "#a855f7", "#4f8dfd", "#f6c453", "#ff5a5f"];

const segments = computed(() =>
  labels.map((label, index) => ({
    label,
    value: props.lists[index] || 0,
    color: colors[index],
  }))
);

const total = computed(() => segments.value.reduce((acc, cur) => acc + cur.value, 0));
const hasChartData = computed(() => total.value > 0);

const chartSegments = computed(() => {
  const totalValue = total.value || 1;
  let currentAngle = 0;
  const gap = 2;

  return segments.value.map((segment) => {
    const angle = (segment.value / totalValue) * 360;
    const safeGap = angle > gap ? gap : 0;
    const startAngle = currentAngle + safeGap / 2;
    const endAngle = currentAngle + angle - safeGap / 2;
    currentAngle += angle;

    return {
      ...segment,
      percent: total.value ? Math.round((segment.value / total.value) * 100) : 0,
      path: angle <= 0 ? "" : describeArc(100, 100, 70, startAngle, endAngle),
    };
  });
});

const activeSegment = computed(() => {
  if (activeIndex.value == null) return null;
  return chartSegments.value[activeIndex.value] || null;
});

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

function describeArc(
  x: number,
  y: number,
  radius: number,
  startAngle: number,
  endAngle: number
) {
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}
</script>
