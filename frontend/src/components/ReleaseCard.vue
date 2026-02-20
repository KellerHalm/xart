<template>
  <router-link :to="`/release/${release.id}`" class="group block h-full">
    <div class="card-surface relative h-full overflow-hidden rounded-xl">
      <div class="relative aspect-[12/16] w-full">
        <img
          :src="release.image || fallbackImage"
          :alt="titleRu || titleOriginal || 'release'"
          loading="lazy"
          decoding="async"
          fetchpriority="low"
          class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent"></div>

        <div class="absolute left-3 right-3 top-3 z-20 flex items-start justify-between gap-2">
          <div class="flex flex-wrap gap-1.5">
            <Chip v-if="gradeValue" class="min-w-12" :bg-color="gradeColor" :name="gradeValue" />
            <Chip v-if="statusLabel" :bg-color="statusColor" :name="statusLabel" />
            <Chip
              v-if="episodesLabel"
              :bg-color="'chip-muted'"
              :name="episodesLabel.released"
              :name2="episodesLabel.total"
              devider="/"
            />
            <Chip v-if="categoryLabel" :bg-color="'chip-violet'" :name="categoryLabel" />
          </div>
          <div
            v-if="release.is_favorite"
            class="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 bg-black/45 text-white shadow backdrop-blur-sm"
          >
            <span class="iconify mdi--heart h-4 w-4"></span>
          </div>
        </div>

        <div class="absolute bottom-3 left-3 right-3 z-20 space-y-2">
          <div class="flex flex-wrap items-center gap-1.5">
            <span
              v-if="listLabel"
              class="rounded-full border px-2 py-1 text-xs font-semibold text-white shadow backdrop-blur-sm drop-shadow-[0_1px_1px_rgba(0,0,0,0.85)]"
              :style="listBadgeStyle"
            >
              {{ listLabel.name }}
            </span>
            <span
              v-for="(genre, index) in genresList.slice(0, 3)"
              :key="`release-${release.id}-genre-${genre}-${index}`"
              class="rounded-full border border-white/30 bg-black/45 px-2 py-1 text-xs font-medium text-white shadow backdrop-blur-sm drop-shadow-[0_1px_1px_rgba(0,0,0,0.85)]"
            >
              {{ genre }}
            </span>
            <span
              v-if="genresList.length > 3"
              class="rounded-full border border-white/30 bg-black/45 px-2 py-1 text-xs font-medium text-white shadow backdrop-blur-sm drop-shadow-[0_1px_1px_rgba(0,0,0,0.85)]"
            >
              +{{ genresList.length - 3 }}
            </span>
          </div>
          <h3 class="card-title text-base !text-white line-clamp-2">
            {{ titleRu || titleOriginal }}
          </h3>
          <p v-if="showOriginalSubtitle" class="card-subtitle text-xs !text-gray-200 line-clamp-1">
            {{ titleOriginal }}
          </p>
        </div>
      </div>
    </div>
  </router-link>
</template>

<script setup lang="ts">
import { computed } from "vue";
import Chip from "@/components/Chip.vue";

const props = defineProps<{
  release: {
    id: number | string;
    image: string;
    title_ru?: string;
    title_original?: string;
    description?: string;
    grade?: number;
    episodes_released?: number;
    episodes_total?: number;
    status?: { name?: string } | string | null;
    status_id?: number | null;
    category?: { name?: string } | string | null;
    profile_list_status?: number | null;
    is_favorite?: boolean;
    genres?: string | string[] | null;
  };
}>();

const fallbackImage = "/images/icons/xart.svg";

const titleRu = computed(() => props.release.title_ru || "");
const titleOriginal = computed(() => props.release.title_original || "");
const showOriginalSubtitle = computed(() => Boolean(titleOriginal.value && titleRu.value && titleOriginal.value !== titleRu.value));

const gradeValue = computed(() => {
  if (props.release.grade == null) return null;
  const num = Number(props.release.grade);
  if (Number.isNaN(num)) return null;
  return Number(num.toFixed(1));
});

const gradeColor = computed(() => {
  if (!gradeValue.value) return "hidden";
  if (gradeValue.value < 2) return "chip-danger";
  if (gradeValue.value < 3) return "chip-warning";
  if (gradeValue.value < 4) return "chip-info";
  return "chip-success";
});

const statusLabel = computed(() => {
  const status = props.release.status;
  if (typeof status === "string") return status;
  if (status?.name) return status.name;
  if (props.release.status_id === 1) return "Завершено";
  if (props.release.status_id === 2) return "Онгоинг";
  if (props.release.status_id === 3) return "Анонс";
  return "";
});

const statusColor = computed(() => {
  if (props.release.status) return "chip-info";
  if (props.release.status_id === 1) return "chip-success";
  if (props.release.status_id === 2) return "chip-info";
  return "chip-muted";
});

const episodesLabel = computed(() => {
  const released = props.release.episodes_released;
  const total = props.release.episodes_total;
  if (released == null && total == null) return null;
  return {
    released: released ?? "?",
    total: total ? `${total} эп.` : "? эп.",
  };
});

const categoryLabel = computed(() => {
  const category = props.release.category;
  if (!category) return "";
  if (typeof category === "string") return category;
  return category.name || "";
});

const listLabel = computed(() => {
  const status = props.release.profile_list_status || 0;
  if (status === 1) return { name: "Смотрю", color: "#22c55e" };
  if (status === 2) return { name: "В планах", color: "#c084fc" };
  if (status === 3) return { name: "Просмотрено", color: "#3b82f6" };
  if (status === 4) return { name: "Отложено", color: "#f59e0b" };
  if (status === 5) return { name: "Брошено", color: "#ef4444" };
  return null;
});
const listBadgeStyle = computed(() => {
  const color = listLabel.value?.color;
  if (!color) return {};
  return {
    backgroundColor: hexToRgba(color, 0.38),
    borderColor: hexToRgba(color, 0.7),
  };
});

const genresList = computed(() => {
  const genres = props.release.genres;
  if (!genres) return [];
  if (Array.isArray(genres)) return genres.map((item) => String(item).trim()).filter(Boolean);
  return genres.split(",").map((item) => item.trim()).filter(Boolean);
});
function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  if (normalized.length !== 6) return `rgba(255,255,255,${alpha})`;
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  if ([r, g, b].some((value) => Number.isNaN(value))) return `rgba(255,255,255,${alpha})`;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
</script>
