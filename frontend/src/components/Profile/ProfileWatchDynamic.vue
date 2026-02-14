<template>
  <div class="card-surface rounded-2xl p-5 sm:p-6">
    <h1 class="section-title text-xl">Динамика просмотра серий</h1>
    <div class="relative mt-4 h-56 w-full">
      <svg
        v-if="points.length > 1"
        ref="svgRef"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        class="h-full w-full cursor-crosshair"
        @mousemove="handleMove"
        @mouseleave="handleLeave"
        @touchmove.prevent="handleMove"
        @touchend="handleLeave"
      >
        <defs>
          <linearGradient id="watchArea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#d21c22" stop-opacity="0.42" />
            <stop offset="100%" stop-color="#d21c22" stop-opacity="0" />
          </linearGradient>
        </defs>
        <g stroke="rgba(255,255,255,0.1)" stroke-dasharray="2 4">
          <line
            v-for="tick in yAxisTicks"
            :key="`grid-${tick.value}`"
            x1="4"
            :y1="tick.y"
            x2="96"
            :y2="tick.y"
          />
        </g>
        <g :fill="isDark ? 'rgba(255,255,255,0.62)' : 'rgba(15,23,42,0.62)'" font-size="3.2">
          <text
            v-for="tick in yAxisTicks"
            :key="`label-${tick.value}`"
            x="3"
            :y="tick.y"
            text-anchor="end"
            dominant-baseline="middle"
          >
            {{ tick.label }}
          </text>
        </g>
        <path
          v-if="areaPath"
          :key="pathAnimationKey"
          :d="areaPath"
          fill="url(#watchArea)"
          class="watch-area"
        />
        <path
          v-if="linePath"
          :key="pathAnimationKey"
          ref="linePathRef"
          :d="linePath"
          fill="none"
          stroke="#d21c22"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="watch-line"
          :style="lineStrokeStyle"
        />
        <g :class="['watch-active', activePoint ? 'is-visible' : '']">
          <line
            class="watch-crosshair"
            :x1="activePointSafe.x"
            y1="6"
            :x2="activePointSafe.x"
            y2="92"
            stroke="rgba(255,255,255,0.2)"
            stroke-width="1"
          />
          <circle class="watch-dot" :cx="activePointSafe.x" :cy="activePointSafe.y" r="3.5" fill="#ffffff" />
          <circle class="watch-glow" :cx="activePointSafe.x" :cy="activePointSafe.y" r="7" fill="rgba(210,28,34,0.35)" />
        </g>
      </svg>
      <div v-else class="flex h-full items-center justify-center text-sm text-gray-500">
        Недостаточно данных
      </div>

      <div
        class="watch-tooltip pointer-events-none absolute"
        :class="activePoint ? 'is-visible' : ''"
        :style="activeTooltipStyle"
      >
        <div
          class="-translate-x-1/2 -translate-y-[120%] rounded-lg border border-white/10 bg-[#14181d] px-3 py-2 text-center shadow-lg"
        >
          <p class="text-xs text-gray-300">{{ activePointSafe.label }}</p>
          <p class="text-sm font-semibold" :class="isDark ? 'text-white' : 'text-gray-900'">{{ activePointSafe.count }} серий</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { usePreferencesStore } from "@/store/preferences";

const props = defineProps<{ watchDynamic: any[] }>();
const preferencesStore = usePreferencesStore();
const isDark = computed(() => preferencesStore.flags.theme === "dark");

const svgRef = ref<SVGSVGElement | null>(null);
const linePathRef = ref<SVGPathElement | null>(null);
const activeIndex = ref<number | null>(null);
const pathAnimationKey = ref(0);
const linePathLength = ref(0);

const WINDOW_SIZE = 10;
const X_MIN = 4;
const X_MAX = 96;
const Y_TOP = 18;
const Y_BOTTOM = 82;
const AREA_BASELINE = 92;
const Y_TICK_COUNT = 5;

const series = computed(() => buildSeries(props.watchDynamic || []));
const yScale = computed(() => createYAxisScale(series.value.map((item) => item.count)));
const yAxisTicks = computed(() =>
  yScale.value.ticks.map((value) => ({
    value,
    label: formatTickLabel(value),
    y: mapValueToY(value, yScale.value.min, yScale.value.max),
  }))
);

const points = computed(() => {
  const data = series.value || [];
  if (data.length < 2) return [];
  return data.map((item, index) => {
    const count = item.count;
    const x = X_MIN + (index / (data.length - 1)) * (X_MAX - X_MIN);
    const y = mapValueToY(count, yScale.value.min, yScale.value.max);
    return {
      x,
      y,
      count,
      label: item.label,
    };
  });
});

const linePath = computed(() => createSmoothPath(points.value));
const areaPath = computed(() => {
  if (!points.value.length || !linePath.value) return "";
  const first = points.value[0]!;
  const last = points.value[points.value.length - 1]!;
  return `${linePath.value} L ${last.x} ${AREA_BASELINE} L ${first.x} ${AREA_BASELINE} Z`;
});

const activePoint = computed(() => {
  if (activeIndex.value == null) return null;
  return points.value[activeIndex.value] || null;
});

const activePointSafe = computed(() => {
  return (
    activePoint.value ||
    points.value[0] || {
      x: 4,
      y: 78,
      count: 0,
      label: "",
    }
  );
});

const activeTooltipStyle = computed(() => {
  return {
    left: `${activePointSafe.value.x}%`,
    top: `${activePointSafe.value.y}%`,
  };
});

const lineStrokeStyle = computed(() => {
  if (!linePathLength.value) return {};
  return {
    "--dash": `${linePathLength.value}px`,
    strokeDasharray: `${linePathLength.value}`,
    strokeDashoffset: `${linePathLength.value}`,
  } as Record<string, string>;
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

async function updatePathLength() {
  await nextTick();
  if (!linePathRef.value) return;
  const length = linePathRef.value.getTotalLength();
  if (Number.isFinite(length) && length > 0) {
    linePathLength.value = length;
    pathAnimationKey.value += 1;
  }
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

function buildSeries(raw: any[]) {
  if (!Array.isArray(raw) || raw.length === 0) return [];
  const normalized = raw.map((item, index) => ({
    item,
    index,
    count: toNumber(item?.count ?? item?.value ?? 0),
    date: parseDate(
      item?.date || item?.day || item?.label || item?.created_at || item?.updated_at
    ),
  }));
  const dated = normalized.filter((entry) => entry.date);
  if (dated.length > 0) {
    const byKey = new Map<string, { date: Date; count: number }>();
    dated.forEach((entry) => {
      const day = startOfDay(entry.date!);
      const key = toDateKey(day);
      const prev = byKey.get(key);
      byKey.set(key, { date: day, count: (prev?.count ?? 0) + entry.count });
    });
    const end = startOfDay(new Date());
    const result: { count: number; label: string; date: Date }[] = [];
    for (let i = WINDOW_SIZE - 1; i >= 0; i -= 1) {
      const day = startOfDay(addDays(end, -i));
      const key = toDateKey(day);
      const count = byKey.get(key)?.count ?? 0;
      result.push({ count, label: formatDateLabel(day), date: day });
    }
    return result;
  }
  const slice = normalized.slice(Math.max(normalized.length - WINDOW_SIZE, 0));
  return slice.map((entry, index) => ({
    count: entry.count,
    label: formatLabel(entry.item, index),
  }));
}

function mapValueToY(value: number, min: number, max: number) {
  if (max === min) return (Y_TOP + Y_BOTTOM) / 2;
  const ratio = (value - min) / (max - min);
  return Y_BOTTOM - ratio * (Y_BOTTOM - Y_TOP);
}

function createYAxisScale(values: number[]) {
  const rawMin = values.length ? Math.min(...values) : 0;
  const rawMax = values.length ? Math.max(...values) : 1;
  let min = rawMin;
  let max = rawMax;
  if (min === max) {
    const pad = max === 0 ? 1 : Math.max(1, Math.round(Math.abs(max) * 0.2));
    min -= pad;
    max += pad;
  }
  if (min > 0) min = 0;
  const approxStep = (max - min) / (Y_TICK_COUNT - 1);
  const step = niceStep(approxStep);
  const niceMin = Math.floor(min / step) * step;
  const niceMax = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let i = 0; i < Y_TICK_COUNT; i += 1) {
    const value = niceMin + step * i;
    ticks.push(roundFloat(value));
  }
  const lastExpected = roundFloat(niceMax);
  ticks[Y_TICK_COUNT - 1] = Math.max(ticks[Y_TICK_COUNT - 1]!, lastExpected);
  return {
    min: ticks[0]!,
    max: ticks[ticks.length - 1]!,
    ticks,
  };
}

function niceStep(value: number) {
  if (!Number.isFinite(value) || value <= 0) return 1;
  const power = 10 ** Math.floor(Math.log10(value));
  const fraction = value / power;
  if (fraction <= 1) return 1 * power;
  if (fraction <= 2) return 2 * power;
  if (fraction <= 5) return 5 * power;
  return 10 * power;
}

function roundFloat(value: number) {
  return Number(value.toFixed(4));
}

function formatTickLabel(value: number) {
  if (Math.abs(value) >= 1000) {
    const compact = value / 1000;
    const precision = Number.isInteger(compact) ? 0 : 1;
    return `${compact.toFixed(precision)}k`;
  }
  if (Number.isInteger(value)) return `${value}`;
  return value.toFixed(1).replace(/\.0$/, "");
}

function toNumber(value: unknown) {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function parseDate(value: unknown) {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === "number") {
    const fromNumber = new Date(value);
    return Number.isNaN(fromNumber.getTime()) ? null : fromNumber;
  }
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (!/[^\d]/.test(trimmed)) return null;
  const match = trimmed.match(/^(\d{2})[./-](\d{2})[./-](\d{4})$/);
  if (match) {
    const day = Number(match[1]);
    const month = Number(match[2]) - 1;
    const year = Number(match[3]);
    const fromParts = new Date(year, month, day);
    return Number.isNaN(fromParts.getTime()) ? null : fromParts;
  }
  const parsed = Date.parse(trimmed);
  if (!Number.isNaN(parsed)) return new Date(parsed);
  return null;
}

function startOfDay(date: Date) {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

function addDays(date: Date, offset: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + offset);
  return copy;
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateLabel(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
  }).format(date);
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

onMounted(updatePathLength);
watch(linePath, () => {
  updatePathLength();
});
</script>

<style scoped>
.watch-line {
  animation: watch-draw 1.2s ease forwards;
  stroke-dasharray: var(--dash);
  stroke-dashoffset: var(--dash);
}

.watch-area {
  animation: watch-fill 1.2s ease forwards;
  transform-origin: 50% 100%;
  opacity: 0;
}

.watch-active {
  opacity: 0;
  transition: opacity 150ms ease;
}

.watch-active.is-visible {
  opacity: 1;
}

.watch-crosshair,
.watch-dot,
.watch-glow {
  transition: transform 180ms ease, opacity 180ms ease;
}

.watch-tooltip {
  opacity: 0;
  transform: translateY(6px);
  transition: left 140ms ease, top 140ms ease, opacity 140ms ease, transform 140ms ease;
}

.watch-tooltip.is-visible {
  opacity: 1;
  transform: translateY(0);
}

@keyframes watch-draw {
  from {
    stroke-dashoffset: var(--dash);
  }
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes watch-fill {
  from {
    opacity: 0;
    transform: scaleY(0.85);
  }
  to {
    opacity: 1;
    transform: scaleY(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .watch-line,
  .watch-area {
    animation: none;
  }

  .watch-active,
  .watch-tooltip,
  .watch-crosshair,
  .watch-dot,
  .watch-glow {
    transition: none;
  }
}
</style>
