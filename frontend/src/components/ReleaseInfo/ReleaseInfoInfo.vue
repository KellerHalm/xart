<template>
  <div :class="wrapperClass">
    <div class="grid gap-3 text-sm md:text-base">
      <div class="flex items-start gap-3 border-b border-white/10 pb-3">
        <div class="pt-0.5">
          <span v-if="country?.toLowerCase() === 'япония'" class="iconify-color twemoji--flag-for-japan h-6 w-6"></span>
          <span v-else-if="country?.toLowerCase() === 'китай'" class="iconify-color twemoji--flag-for-china h-6 w-6"></span>
          <span v-else class="iconify-color twemoji--flag-for-united-nations h-6 w-6"></span>
        </div>
        <p class="font-medium text-gray-100">
          {{ country?.trim() }}
          <span v-if="(airedOnDate && airedOnDate !== 0) || year">, </span>
          <span v-if="season && season !== 0">{{ yearSeason[season] }}</span>
          <span v-if="season && season !== 0 && year">&nbsp;</span>
          <span v-if="year">{{ year }} г.</span>
        </p>
      </div>

      <div class="flex items-start gap-3 border-b border-white/10 pb-3">
        <span class="iconify mdi--animation-play-outline mt-0.5 h-5 w-5 text-gray-300"></span>
        <p class="font-medium text-gray-100">
          {{ episodes.released ?? "?" }}/{{ episodes.total ? `${episodes.total} эп.` : "? эп." }}
          <span v-if="duration && duration !== 0"> по {{ minutesToTime(duration) }}</span>
        </p>
      </div>

      <div class="flex items-start gap-3 border-b border-white/10 pb-3">
        <span class="iconify mdi--calendar-outline mt-0.5 h-5 w-5 text-gray-300"></span>
        <p class="font-medium text-gray-100">
          {{ category }},
          <span v-if="broadcast === 0">{{ status.toLowerCase() }}</span>
          <span v-else>выходит {{ weekDay[broadcast] }}</span>
        </p>
      </div>

      <div class="flex items-start gap-3 border-b border-white/10 pb-3">
        <span class="iconify mdi--people-group-outline mt-0.5 h-5 w-5 text-gray-300"></span>
        <p class="font-medium text-gray-100">
          <template v-if="studio">
            Студия:
            <template v-for="(item, index) in studio.split(', ')" :key="item">
              <span v-if="index > 0">, </span>
              <ReleaseInfoSearchLink :title="item" searchBy="studio" />
            </template>
            <span v-if="author || director">, </span>
          </template>
          <template v-if="author">
            Автор:
            <ReleaseInfoSearchLink :title="author" searchBy="author" />
            <span v-if="director">, </span>
          </template>
          <template v-if="director">
            Режиссёр:
            <ReleaseInfoSearchLink :title="director" searchBy="director" />
          </template>
        </p>
      </div>

      <div class="flex items-start gap-3 border-b border-white/10 pb-3">
        <span class="iconify mdi--tag-outline mt-0.5 h-5 w-5 text-gray-300"></span>
        <p class="font-medium text-gray-100">
          <template v-if="genres">
            <template v-for="(item, index) in genres.split(', ')" :key="item">
              <span v-if="index > 0">, </span>
              <ReleaseInfoSearchLink :title="item" searchBy="tag" />
            </template>
          </template>
        </p>
      </div>

      <div v-if="status.toLowerCase() === 'анонс'" class="flex items-start gap-3">
        <span class="iconify mdi--clock-outline mt-0.5 h-5 w-5 text-gray-300"></span>
        <p class="font-medium text-gray-100">
          <span v-if="airedOnDate && airedOnDate !== 0">{{ unixToDate(airedOnDate, "full") }}</span>
          <span v-else-if="year">
            <span v-if="season && season !== 0">{{ yearSeason[season] }}</span>
            <span v-if="season && season !== 0">&nbsp;</span>
            <span>{{ year }} г.</span>
          </span>
          <span v-else>Скоро</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { minutesToTime, unixToDate } from "@/api/utils";
import ReleaseInfoSearchLink from "@/components/ReleaseInfo/ReleaseInfoSearchLink.vue";

const props = withDefaults(
  defineProps<{
    country: string | null;
    airedOnDate: number | null;
    year: number | null;
    episodes: { total: number | null; released: number | null };
    season: number;
    status: string;
    duration: number;
    category: string;
    broadcast: number;
    studio: string | null;
    author: string | null;
    director: string | null;
    genres: string;
    embedded?: boolean;
  }>(),
  {
    embedded: false,
  }
);

const wrapperClass = computed(() =>
  props.embedded
    ? "rounded-xl border border-white/10 bg-[#1f2022]/70 p-4"
    : "rounded-xl border border-white/5 bg-[#222426] p-4 shadow"
);

const weekDay = [
  "_",
  "каждый понедельник",
  "каждый вторник",
  "каждую среду",
  "каждый четверг",
  "каждую пятницу",
  "каждую субботу",
  "каждое воскресенье",
];

const yearSeason = ["_", "Зима", "Весна", "Лето", "Осень"];
</script>
