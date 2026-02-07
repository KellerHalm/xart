<template>
  <div class="rounded-xl border border-white/5 bg-[#222426] p-4 shadow">
    <table class="w-full text-left text-sm">
      <tbody>
        <tr class="border-b border-white/10">
          <td class="py-2">
            <span v-if="country?.toLowerCase() === 'япония'" class="iconify-color twemoji--flag-for-japan h-8 w-8"></span>
            <span v-else-if="country?.toLowerCase() === 'китай'" class="iconify-color twemoji--flag-for-china h-8 w-8"></span>
            <span v-else class="iconify-color twemoji--flag-for-united-nations h-8 w-8"></span>
          </td>
          <td class="font-medium text-gray-200">
            {{ country }}
            <span v-if="(airedOnDate && airedOnDate !== 0) || year">, </span>
            <span v-if="season && season !== 0">{{ yearSeason[season] }} </span>
            <span v-if="year">{{ year }} г.</span>
          </td>
        </tr>
        <tr class="border-b border-white/10">
          <td class="py-2">
            <span class="iconify-color mdi--animation-play-outline h-8 w-8 dark:invert"></span>
          </td>
          <td class="font-medium text-gray-200">
            {{ episodes.released ?? "?" }}/{{ episodes.total ? `${episodes.total} эп.` : "? эп." }}
            <span v-if="duration && duration !== 0"> по {{ minutesToTime(duration) }}</span>
          </td>
        </tr>
        <tr class="border-b border-white/10">
          <td class="py-2">
            <span class="iconify-color mdi--calendar-outline h-8 w-8 dark:invert"></span>
          </td>
          <td class="font-medium text-gray-200">
            {{ category }}, 
            <span v-if="broadcast === 0">{{ status.toLowerCase() }}</span>
            <span v-else>выходит {{ weekDay[broadcast] }}</span>
          </td>
        </tr>
        <tr class="border-b border-white/10">
          <td class="py-2">
            <span class="iconify-color mdi--people-group-outline h-8 w-8 dark:invert"></span>
          </td>
          <td class="font-medium text-gray-200">
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
          </td>
        </tr>
        <tr class="border-b border-white/10">
          <td class="py-2">
            <span class="iconify-color mdi--tag-outline h-8 w-8 dark:invert"></span>
          </td>
          <td class="font-medium text-gray-200">
            <template v-if="genres">
              <template v-for="(item, index) in genres.split(', ')" :key="item">
                <span v-if="index > 0">, </span>
                <ReleaseInfoSearchLink :title="item" searchBy="tag" />
              </template>
            </template>
          </td>
        </tr>
        <tr v-if="status.toLowerCase() === 'анонс'">
          <td class="py-2">
            <span class="iconify-color mdi--clock-outline h-8 w-8 dark:invert"></span>
          </td>
          <td class="font-medium text-gray-200">
            <span v-if="airedOnDate && airedOnDate !== 0">{{ unixToDate(airedOnDate, 'full') }}</span>
            <span v-else-if="year">
              <span v-if="season && season !== 0">{{ yearSeason[season] }} </span>
              <span>{{ year }} г.</span>
            </span>
            <span v-else>Скоро</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { minutesToTime, unixToDate } from "@/api/utils";
import ReleaseInfoSearchLink from "@/components/ReleaseInfo/ReleaseInfoSearchLink.vue";

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
}>();

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
