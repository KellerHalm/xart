<template>
  <div class="flex flex-wrap gap-1.5" v-if="chipSettings.enabled">
    <Chip
      v-if="!chipSettings.gradeHidden && grade"
      class="min-w-12"
      :bg-color="gradeColor"
      :name="grade"
    />
    <Chip
      v-if="!chipSettings.statusHidden && (status || statusId)"
      :bg-color="statusColor"
      :name="statusLabel"
    />
    <Chip
      v-if="!chipSettings.episodesHidden"
      :bg-color="'chip-muted'"
      :name="episodesReleased || '?'"
      :name2="episodesTotal ? `${episodesTotal} эп.` : '? эп.'"
      devider="/"
    />
    <Chip
      v-if="!chipSettings.categoryHidden && category"
      :bg-color="'chip-violet'"
      :name="category.name"
    />
    <Chip
      v-if="!chipSettings.listHidden && userList"
      :bg-color="userList.bg_color"
      :name="userList.name"
    />
    <div
      v-if="!chipSettings.favHidden && isFavorite"
      class="flex items-center justify-center rounded-full border border-white/10 px-2 py-1 text-white shadow backdrop-blur-sm chip-accent"
    >
      <span class="iconify mdi--heart h-3 w-3"></span>
    </div>
    <Chip
      v-if="!chipSettings.lastWatchedHidden && lastViewEpisode"
      :bg-color="'chip-info'"
      :name="lastViewEpisode.name ? lastViewEpisode.name : `${lastViewEpisode.position + 1} серия`"
      :name2="lastViewTimestamp ? sinceUnixDate(lastViewTimestamp) : ''"
      devider=", "
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { sinceUnixDate } from "@/api/utils";
import Chip from "@/components/Chip.vue";

const props = defineProps<{
  settings?: any;
  grade?: number | null;
  status?: any;
  statusId?: number;
  userList?: any;
  episodesReleased?: number | null;
  episodesTotal?: number | null;
  category?: any;
  isFavorite?: boolean;
  lastViewEpisode?: any;
  lastViewTimestamp?: number;
}>();

const chipSettings = computed(() => ({
  enabled: true,
  gradeHidden: false,
  statusHidden: false,
  categoryHidden: false,
  episodesHidden: false,
  listHidden: false,
  favHidden: false,
  lastWatchedHidden: true,
  ...props.settings,
}));

const gradeColor = computed(() => {
  if (!props.grade) return "hidden";
  if (props.grade < 2) return "chip-danger";
  if (props.grade < 3) return "chip-warning";
  if (props.grade < 4) return "chip-info";
  return "chip-success";
});

const statusLabel = computed(() => {
  if (props.status?.name) return props.status.name;
  if (props.statusId === 1) return "Завершено";
  if (props.statusId === 2) return "Онгоинг";
  if (props.statusId === 3) return "Анонс";
  return "";
});

const statusColor = computed(() => {
  if (props.status?.name) return "chip-info";
  if (props.statusId === 1) return "chip-success";
  if (props.statusId === 2) return "chip-info";
  return "chip-muted";
});
</script>
