<template>
  <div class="card-surface rounded-xl p-4">
    <h1 class="section-title text-xl">Динамика просмотра серий</h1>
    <div class="mt-4 h-40 w-full">
      <svg v-if="points.length > 1" viewBox="0 0 100 100" class="h-full w-full">
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#d21c22" stop-opacity="0.45" />
            <stop offset="100%" stop-color="#d21c22" stop-opacity="0" />
          </linearGradient>
        </defs>
        <polyline
          :points="points.join(' ')"
          fill="none"
          stroke="#d21c22"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <polygon :points="areaPoints" fill="url(#areaGradient)" />
      </svg>
      <div v-else class="flex h-full items-center justify-center text-sm text-gray-500">
        Недостаточно данных
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{ watchDynamic: any[] }>();

const lastTenDays = computed(() =>
  props.watchDynamic.slice(Math.max(props.watchDynamic.length - 10, 0))
);

const points = computed(() => {
  const data = lastTenDays.value;
  if (!data || data.length < 2) return [];
  const max = Math.max(...data.map((item) => item.count), 1);
  return data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - (item.count / max) * 70 - 10;
    return `${x},${y}`;
  });
});

const areaPoints = computed(() => {
  if (points.value.length === 0) return "";
  return `${points.value.join(" ")} 100,100 0,100`;
});

</script>


