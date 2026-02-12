<template>
  <div class="card-surface rounded-2xl p-5 sm:p-6">
    <h1 class="section-title text-xl">Динамика просмотра серий</h1>
    <div class="relative mt-4 h-44 w-full">
      <svg
        v-if="points.length > 1"
        ref="svgRef"
        viewBox="0 0 100 100"
        class="h-full w-full cursor-crosshair"
        @mousemove="handleMove"
        @mouseleave="handleLeave"
        @touchmove.prevent="handleMove"
        @touchend="handleLeave"
      >
        <defs>
          <linearGradient id="watchArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#2f7df6" stop-opacity="0.45" />
            <stop offset="100%" stop-color="#2f7df6" stop-opacity="0" />
          </linearGradient>
        </defs>
        <g stroke="rgba(255,255,255,0.1)" stroke-dasharray="2 4">
          <line x1="0" y1="20" x2="100" y2="20" />
          <line x1="0" y1="40" x2="100" y2="40" />
          <line x1="0" y1="60" x2="100" y2="60" />
          <line x1="0" y1="80" x2="100" y2="80" />
        </g>
        <path v-if="areaPath" :d="areaPath" fill="url(#watchArea)" />
        <path
          v-if="linePath"
          :d="linePath"
          fill="none"
          stroke="#2f7df6"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <template v-if="activePoint">
          <line
            :x1="activePoint.x"
            y1="8"
            :x2="activePoint.x"
            y2="96"
            stroke="rgba(255,255,255,0.2)"
            stroke-width="1"
          />
          <circle :cx="activePoint.x" :cy="activePoint.y" r="3.5" fill="#ffffff" />
          <circle :cx="activePoint.x" :cy="activePoint.y" r="7" fill="rgba(47,125,246,0.35)" />
        </template>
      </svg>
      <div v-else class="flex h-full items-center justify-center text-sm text-gray-500">
        Недостаточно данных
      </div>

      <div
        v-if="activePoint"
        class="pointer-events-none absolute"
        :style="activeTooltipStyle"
      >
        <div
          class="-translate-x-1/2 -translate-y-[120%] rounded-lg border border-white/10 bg-[#14181d] px-3 py-2 text-center shadow-lg"
        >
          <p class="text-xs text-gray-300">{{ activePoint.label }}</p>
          <p class="text-sm font-semibold text-white">{{ activePoint.count }} серий</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

const props = defineProps<{ watchDynamic: any[] }>();

const svgRef = ref<SVGSVGElement | null>(null);
const activeIndex = ref<number | null>(null);

const lastTenDays = computed(() =>
  props.watchDynamic.slice(Math.max(props.watchDynamic.length - 10, 0))
);

const points = computed(() => {
  const data = lastTenDays.value || [];
  if (data.length < 2) return [];
  const values = data.map((item: any) => Number(item?.count ?? item?.value ?? 0));
  const max = Math.max(...values, 1);
  return data.map((item: any, index: number) => {
    const count = Number(item?.count ?? item?.value ?? 0);
    const x = 6 + (index / (data.length - 1)) * 88;
    const y = 90 - (count / max) * 60;
    return {
      x,
      y,
      count,
      label: formatLabel(item, index),
    };
  });
});

const linePath = computed(() => createSmoothPath(points.value));
const areaPath = computed(() => {
  if (!points.value.length || !linePath.value) return "";
  const first = points.value[0]!;
  const last = points.value[points.value.length - 1]!;
  return `${linePath.value} L ${last.x} 100 L ${first.x} 100 Z`;
});

const activePoint = computed(() => {
  if (activeIndex.value == null) return null;
  return points.value[activeIndex.value] || null;
});

const activeTooltipStyle = computed(() => {
  if (!activePoint.value) return {};
  return {
    left: `${activePoint.value.x}%`,
    top: `${activePoint.value.y}%`,
  };
});

function handleMove(event: MouseEvent | TouchEvent) {
  const svg = svgRef.value;
  if (!svg || points.value.length === 0) return;
  const rect = svg.getBoundingClientRect();
  let clientX = 0;
  if ("touches" in event) {
    const touch = event.touches[0] ?? event.changedTouches[0];
    if (!touch) return;
    clientX = touch.clientX;
  } else {
    clientX = event.clientX;
  }
  const x = ((clientX - rect.left) / rect.width) * 100;
  let closestIndex = 0;
  let minDistance = Number.POSITIVE_INFINITY;
  points.value.forEach((point, index) => {
    const distance = Math.abs(point.x - x);
    if (distance < minDistance) {
      minDistance = distance;
      closestIndex = index;
    }
  });
  activeIndex.value = closestIndex;
}

function handleLeave() {
  activeIndex.value = null;
}

function createSmoothPath(data: { x: number; y: number }[]) {
  if (!data.length) return "";
  if (data.length === 1) return `M ${data[0]!.x} ${data[0]!.y}`;
  const d: string[] = [`M ${data[0]!.x} ${data[0]!.y}`];
  for (let i = 0; i < data.length - 1; i += 1) {
    const p0 = data[i - 1] ?? data[i]!;
    const p1 = data[i]!;
    const p2 = data[i + 1]!;
    const p3 = data[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d.push(`C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2.x} ${p2.y}`);
  }
  return d.join(" ");
}

function formatLabel(item: any, index: number) {
  return (
    item?.date ||
    item?.day ||
    item?.label ||
    item?.created_at ||
    item?.updated_at ||
    `День ${index + 1}`
  );
}
</script>
