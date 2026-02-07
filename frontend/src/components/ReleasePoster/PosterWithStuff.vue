<template>
  <div class="group relative h-full w-full overflow-hidden rounded-xl shadow-lg">
    <Poster :image="image" className="h-full w-full object-cover" />
    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

    <div class="absolute left-3 right-3 top-3 z-20">
      <ReleaseChips
        :grade="gradeValue"
        :status="status"
        :status-id="statusId"
        :user-list="userList"
        :episodes-released="episodesReleased"
        :episodes-total="episodesTotal"
        :category="category"
        :is-favorite="isFavorite"
        :settings="chipsSettings"
      />
    </div>

    <div
      class="absolute bottom-3 left-3 right-3 z-20 transition-transform duration-500 lg:translate-y-[100%] lg:group-hover:translate-y-0"
    >
      <div class="lg:-translate-y-[calc(100%_+_1rem)] lg:group-hover:translate-y-0 transition-transform duration-500">
        <div v-if="settings.showGenres && genresList.length" class="mb-2 flex flex-wrap gap-1">
          <span
            v-for="(genre, index) in genresList.slice(0, 3)"
            :key="`genre-${id}-${genre}-${index}`"
            class="rounded-full border border-white/20 bg-white/10 px-2 py-1 text-xs text-white"
          >
            {{ genre }}
          </span>
          <span
            v-if="genresList.length > 3"
            class="rounded-full border border-white/20 bg-white/10 px-2 py-1 text-xs text-white"
          >
            +{{ genresList.length - 3 }}
          </span>
        </div>
        <h3 v-if="titleRu" class="card-title text-base line-clamp-2">
          {{ titleRu }}
        </h3>
        <p v-if="titleOriginal" class="card-subtitle line-clamp-1">
          {{ titleOriginal }}
        </p>
      </div>
      <div v-if="settings.showDescription && description" class="mt-3 rounded-lg bg-black/40 p-3">
        <p class="text-sm text-gray-200 line-clamp-3">{{ description }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import Poster from "@/components/ReleasePoster/Poster.vue";
import ReleaseChips from "@/components/ReleasePoster/Chips.vue";

const props = defineProps<{
  image: string;
  title_ru?: string;
  title_original?: string;
  description?: string;
  genres?: string;
  grade?: number;
  id: number;
  settings?: {
    showGenres?: boolean;
    showDescription?: boolean;
  };
  chipsSettings?: {
    enabled?: boolean;
    gradeHidden?: boolean;
    statusHidden?: boolean;
    categoryHidden?: boolean;
    episodesHidden?: boolean;
    listHidden?: boolean;
    favHidden?: boolean;
    lastWatchedHidden?: boolean;
  };
  profile_list_status?: number;
  status?: { name: string };
  category?: { name: string };
  status_id?: number;
  episodes_released?: number;
  episodes_total?: number;
  is_favorite?: boolean;
}>();

const profileLists: Record<number, { name: string; bg_color: string }> = {
  1: { name: "Смотрю", bg_color: "chip-info" },
  2: { name: "В планах", bg_color: "chip-muted" },
  3: { name: "Просмотрено", bg_color: "chip-success" },
  4: { name: "Отложено", bg_color: "chip-warning" },
  5: { name: "Брошено", bg_color: "chip-danger" },
};

const settings = computed(() => ({
  showGenres: true,
  showDescription: true,
  ...props.settings,
}));

const chipsSettings = computed(() => ({
  enabled: true,
  ...props.chipsSettings,
}));

const titleRu = computed(() => props.title_ru || "");
const titleOriginal = computed(() => props.title_original || "");

const gradeValue = computed(() =>
  props.grade ? Number(props.grade.toFixed(1)) : null
);

const userList = computed(() => {
  if (!props.profile_list_status || props.profile_list_status === 0) return null;
  return profileLists[props.profile_list_status] || null;
});

const genresList = computed(() => {
  if (!props.genres) return [];
  return props.genres.split(",").map((genre) => genre.trim());
});

const status = computed(() => props.status);
const statusId = computed(() => props.status_id);
const episodesReleased = computed(() => props.episodes_released);
const episodesTotal = computed(() => props.episodes_total);
const category = computed(() => props.category);
const isFavorite = computed(() => props.is_favorite);
</script>

