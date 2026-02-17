<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
    <div class="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-xl border border-white/10 bg-[#1f2123] shadow-xl">
      <div class="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <h2 class="section-title text-xl">Фильтр</h2>
        <button class="text-gray-400 hover:text-white" @click="emit('close')">✕</button>
      </div>
      <div class="max-h-[70vh] overflow-y-auto px-6 py-4 space-y-4">
        <div class="space-y-2">
          <p>Страна</p>
          <select
            class="input-dark w-full rounded-lg px-3 py-2 text-sm"
            :value="newFilter.country || ''"
            @change="(e) => setCountry((e.target as HTMLSelectElement).value)"
          >
            <option value="">Неважно</option>
            <option v-for="item in FilterCountry" :key="`country-${item}`" :value="item">
              {{ item }}
            </option>
          </select>
        </div>

        <div class="space-y-2">
          <p>Категория</p>
          <select
            class="input-dark w-full rounded-lg px-3 py-2 text-sm"
            :value="newFilter.category_id ?? ''"
            @change="(e) => setCategory((e.target as HTMLSelectElement).value)"
          >
            <option value="">Неважно</option>
            <option v-for="[key, value] in Object.entries(FilterCategoryIdToString)" :key="`category-${key}`" :value="key">
              {{ value }}
            </option>
          </select>
        </div>

        <div class="space-y-2">
          <p>Жанры</p>
          <button
            class="w-full rounded-lg btn-accent px-3 py-2 text-sm font-semibold text-white"
            @click="isGenreModalOpen = true"
          >
            {{
              newFilter.genres.length > 0
                ? newFilter.genres.join(", ")
                : "Неважно"
            }}
          </button>
          <p class="text-sm text-gray-500 dark:text-gray-300">
            Будет искать релизы, содержащие каждый из указанных жанров. Рекомендуется выбирать не более 3 жанров.
          </p>
        </div>

        <div v-if="userStore.isAuth" class="space-y-2">
          <p>сключить закладки</p>
          <button
            class="w-full rounded-lg btn-accent px-3 py-2 text-sm font-semibold text-white"
            @click="isListExcludeModalOpen = true"
          >
            {{
              newFilter.profile_list_exclusions.length > 0
                ? newFilter.profile_list_exclusions
                    .map((id) => FilterProfileListIdToString[id])
                    .join(", ")
                : "Неважно"
            }}
          </button>
          <p class="text-sm text-gray-500 dark:text-gray-300">
            сключит из выдачи релизы, входящие в указанные закладки
          </p>
        </div>

        <div class="space-y-2">
          <p>Варианты озвучек</p>
          <button
            class="w-full rounded-lg btn-accent px-3 py-2 text-sm font-semibold text-white"
            @click="isTypeModalOpen = true"
          >
            {{
              typesError
                ? typesError
                : newFilter.types.length > 0
                ? newFilter.types.map((type) => types.find((t) => t.id === type)?.name).join(", ")
                : "Неважно"
            }}
          </button>
        </div>

        <div class="space-y-2">
          <p>Студия</p>
          <select
            class="input-dark w-full rounded-lg px-3 py-2 text-sm"
            :value="newFilter.studio || ''"
            @change="(e) => setStudio((e.target as HTMLSelectElement).value)"
          >
            <option value="">Неважно</option>
            <option v-for="value in FilterStudio" :key="`studio-${value}`" :value="value">
              {{ value }}
            </option>
          </select>
        </div>

        <div class="space-y-2">
          <p>Первоисточник</p>
          <select
            class="input-dark w-full rounded-lg px-3 py-2 text-sm"
            :value="newFilter.source || ''"
            @change="(e) => setSource((e.target as HTMLSelectElement).value)"
          >
            <option value="">Неважно</option>
            <option v-for="value in FilterSource" :key="`source-${value}`" :value="value">
              {{ value }}
            </option>
          </select>
        </div>

        <div class="space-y-2">
          <p>Года</p>
          <div class="flex flex-wrap items-center gap-2">
            <span>С</span>
            <select
              class="input-dark rounded-lg px-3 py-2 text-sm"
              :value="newFilter.start_year ?? ''"
              @change="(e) => setStartYear((e.target as HTMLSelectElement).value)"
            >
              <option value="">Неважно</option>
              <option v-for="value in FilterYear" :key="`year-start-${value}`" :value="value">
                {{ value }}
              </option>
            </select>
            <span>По</span>
            <select
              class="input-dark rounded-lg px-3 py-2 text-sm"
              :value="newFilter.end_year ?? ''"
              @change="(e) => setEndYear((e.target as HTMLSelectElement).value)"
            >
              <option value="">Неважно</option>
              <option v-for="value in FilterYear" :key="`year-end-${value}`" :value="value">
                {{ value }}
              </option>
            </select>
            <span>Сезон</span>
            <select
              class="input-dark rounded-lg px-3 py-2 text-sm"
              :value="newFilter.season ?? ''"
              @change="(e) => setSeason((e.target as HTMLSelectElement).value)"
            >
              <option value="">Неважно</option>
              <option v-for="[key, value] in Object.entries(FilterSeasonIdToString)" :key="`season-${key}`" :value="key">
                {{ value }}
              </option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div class="space-y-2">
            <p>Эпизодов</p>
            <select
              class="input-dark w-full rounded-lg px-3 py-2 text-sm"
              :value="episodeCountValue"
              @change="(e) => setEpisodeCount((e.target as HTMLSelectElement).value)"
            >
              <option v-for="item in FilterEpisodeCount" :key="`episodes-${item.name}`" :value="item.name">
                {{ item.name }}
              </option>
            </select>
          </div>
          <div class="space-y-2">
            <p>Длительность эпизода</p>
            <select
              class="input-dark w-full rounded-lg px-3 py-2 text-sm"
              :value="episodeDurationValue"
              @change="(e) => setEpisodeDuration((e.target as HTMLSelectElement).value)"
            >
              <option v-for="item in FilterEpisodeDuration" :key="`duration-${item.name}`" :value="item.name">
                {{ item.name }}
              </option>
            </select>
          </div>
          <div class="space-y-2">
            <p>Статус</p>
            <select
              class="input-dark w-full rounded-lg px-3 py-2 text-sm"
              :value="newFilter.status_id ?? ''"
              @change="(e) => setStatus((e.target as HTMLSelectElement).value)"
            >
              <option value="">Неважно</option>
              <option v-for="[key, value] in Object.entries(FilterStatusIdToString)" :key="`status-${key}`" :value="key">
                {{ value }}
              </option>
            </select>
          </div>
        </div>

        <div class="space-y-2">
          <p>Возрастное ограничение</p>
          <button
            class="w-full rounded-lg btn-accent px-3 py-2 text-sm font-semibold text-white"
            @click="isAgeRatingModalOpen = true"
          >
            {{
              newFilter.age_ratings.length > 0
                ? newFilter.age_ratings.map((id) => FilterAgeRatingToString[id]).join(", ")
                : "Неважно"
            }}
          </button>
        </div>

        <div class="space-y-2">
          <p>Сортировка</p>
          <select
            class="input-dark w-full rounded-lg px-3 py-2 text-sm"
            :value="newFilter.sort"
            @change="(e) => setSort((e.target as HTMLSelectElement).value)"
          >
            <option v-for="[key, value] in Object.entries(FilterSortToString)" :key="`sort-${key}`" :value="key">
              {{ value }}
            </option>
          </select>
        </div>
      </div>
      <div class="flex items-center justify-end gap-2 border-t border-white/10 px-6 py-4 dark:border-white/10">
        <button class="rounded-lg btn-accent px-4 py-2 text-sm font-semibold text-white" @click="apply">
          Применить
        </button>
      </div>
    </div>
  </div>

  <FiltersGenreModal
    :is-open="isGenreModalOpen"
    :genres="newFilter.genres"
    :exclusion-mode="newFilter.is_genres_exclude_mode_enabled"
    @close="isGenreModalOpen = false"
    @save="saveGenres"
  />
  <FiltersListExcludeModal
    :is-open="isListExcludeModalOpen"
    :lists="newFilter.profile_list_exclusions"
    @close="isListExcludeModalOpen = false"
    @save="(lists) => (newFilter.profile_list_exclusions = lists)"
  />
  <FiltersTypesModal
    :is-open="isTypeModalOpen"
    :types-data="types"
    :types="newFilter.types"
    @close="isTypeModalOpen = false"
    @save="(types) => (newFilter.types = types)"
  />
  <FiltersAgeRatingModal
    :is-open="isAgeRatingModalOpen"
    :age-ratings="newFilter.age_ratings"
    @close="isAgeRatingModalOpen = false"
    @save="(age_ratings) => (newFilter.age_ratings = age_ratings)"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import {
  FilterAgeRatingToString,
  FilterCategoryIdToString,
  FilterCountry,
  FilterDefault,
  FilterEpisodeCount,
  FilterEpisodeDuration,
  FilterProfileListIdToString,
  FilterSeasonIdToString,
  FilterSortToString,
  FilterSource,
  FilterStatusIdToString,
  FilterStudio,
  FilterYear,
  cloneFilter,
  tryCatchAPI,
} from "@/api/utils";
import type { Filter } from "@/api/utils";
import { ENDPOINTS } from "@/api/config";
import { useUserStore } from "@/store/auth";
import FiltersGenreModal from "@/components/Discovery/FiltersGenreModal.vue";
import FiltersListExcludeModal from "@/components/Discovery/FiltersListExcludeModal.vue";
import FiltersTypesModal from "@/components/Discovery/FiltersTypesModal.vue";
import FiltersAgeRatingModal from "@/components/Discovery/FiltersAgeRatingModal.vue";

const props = defineProps<{
  isOpen: boolean;
  filter?: Filter | null;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "apply", filter: Filter): void;
}>();

const router = useRouter();
const userStore = useUserStore();

const newFilter = ref<Filter>(cloneFilter(props.filter ?? FilterDefault));
const isGenreModalOpen = ref(false);
const isListExcludeModalOpen = ref(false);
const isTypeModalOpen = ref(false);
const isAgeRatingModalOpen = ref(false);
const types = ref<any[]>([]);
const typesError = ref<string | null>(null);

const episodeCountValue = computed(() => {
  const current = FilterEpisodeCount.find(
    (episode) =>
      episode.episodes_from === newFilter.value.episodes_from &&
      episode.episodes_to === newFilter.value.episodes_to
  );
  return current?.name || FilterEpisodeCount[0]?.name || "Неважно";
});

const episodeDurationValue = computed(() => {
  const current = FilterEpisodeDuration.find(
    (episode) =>
      episode.episode_duration_from ===
        newFilter.value.episode_duration_from &&
      episode.episode_duration_to === newFilter.value.episode_duration_to
  );
  return current?.name || FilterEpisodeDuration[0]?.name || "Неважно";
});

async function fetchTypes() {
  typesError.value = null;
  const { data, error } = await tryCatchAPI(fetch(ENDPOINTS.filterTypes));
  if (error) {
    typesError.value = error.message || "Ошибка";
    return;
  }
  types.value = data.types || [];
}

function saveGenres(genres: string[], exclusionMode: boolean) {
  newFilter.value = {
    ...newFilter.value,
    genres,
    is_genres_exclude_mode_enabled: exclusionMode,
  };
}

function apply() {
  if (props.filter) {
    emit("apply", newFilter.value);
  } else {
    const serialized = encodeURIComponent(JSON.stringify(newFilter.value));
    router.push(`/discovery/filter?filter=${serialized}`);
  }
  emit("close");
}

function setCountry(value: string) {
  newFilter.value.country = value || null;
}

function setCategory(value: string) {
  newFilter.value.category_id = value ? Number(value) : null;
}

function setStudio(value: string) {
  newFilter.value.studio = value || null;
}

function setSource(value: string) {
  newFilter.value.source = value || null;
}

function setStartYear(value: string) {
  newFilter.value.start_year = value ? Number(value) : null;
}

function setEndYear(value: string) {
  newFilter.value.end_year = value ? Number(value) : null;
}

function setSeason(value: string) {
  newFilter.value.season = value ? Number(value) : null;
}

function setEpisodeCount(name: string) {
  const match = FilterEpisodeCount.find((item) => item.name === name);
  if (!match) return;
  newFilter.value.episodes_from = match.episodes_from;
  newFilter.value.episodes_to = match.episodes_to;
}

function setEpisodeDuration(name: string) {
  const match = FilterEpisodeDuration.find((item) => item.name === name);
  if (!match) return;
  newFilter.value.episode_duration_from = match.episode_duration_from;
  newFilter.value.episode_duration_to = match.episode_duration_to;
}

function setStatus(value: string) {
  newFilter.value.status_id = value ? Number(value) : null;
}

function setSort(value: string) {
  newFilter.value.sort = Number(value);
}

watch(
  () => props.filter,
  () => {
    newFilter.value = cloneFilter(props.filter ?? FilterDefault);
  },
  { deep: true }
);

onMounted(fetchTypes);
</script>


