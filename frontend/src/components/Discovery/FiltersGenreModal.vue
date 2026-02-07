<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
    <div class="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-xl border border-white/10 bg-[#1f2123] shadow-xl">
      <div class="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <h2 class="section-title text-xl">Жанры</h2>
        <button class="text-gray-400 hover:text-white" @click="emit('close')">вњ•</button>
      </div>

      <div class="max-h-[70vh] overflow-y-auto px-6 py-4">
        <div v-for="group in genreGroups" :key="group.name" class="mb-6">
          <p class="mb-2 font-semibold">{{ group.name }}</p>
          <label
            v-for="genre in group.genres"
            :key="`filter-genre-${group.name}-${genre}`"
            class="flex items-center gap-2"
          >
            <input
              type="checkbox"
              class="h-4 w-4"
              :checked="newGenres.includes(genre)"
              @change="toggleGenre(genre)"
            />
            <span>{{ genre }}</span>
          </label>
        </div>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 px-6 py-4">
        <div class="flex items-center gap-3">
          <div>
            <p class="font-bold">Режим исключения жанров</p>
            <p class="max-w-xs text-sm text-gray-400">
              Включите, чтобы исключать выбранные жанры из результатов.
            </p>
          </div>
          <input
            type="checkbox"
            class="h-5 w-5"
            :checked="newExclusionMode"
            @change="toggleExclusion"
          />
        </div>
        <div class="flex items-center gap-2">
          <button
            class="btn-outline rounded-lg border-[#d21c22] px-4 py-2 text-sm font-semibold text-[#d21c22] hover:bg-[#d21c22]/10"
            @click="resetAll"
          >
            Сбросить
          </button>
          <button class="btn-accent rounded-lg px-4 py-2 text-sm font-semibold" @click="apply">
            Применить
          </button>
          <button class="btn-outline rounded-lg px-4 py-2 text-sm font-semibold" @click="toggleAll">
            {{ newGenres.length >= genresLength ? "Сбросить все" : "Выбрать все" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { FilterGenre } from "@/api/utils";

const props = defineProps<{
  isOpen: boolean;
  genres: string[];
  exclusionMode: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "save", genres: string[], exclusionMode: boolean): void;
}>();

const newGenres = ref<string[]>([]);
const newExclusionMode = ref(false);
const genreGroups = computed(() => Object.values(FilterGenre));
const genresLength = computed(() =>
  genreGroups.value.reduce((acc, group) => acc + group.genres.length, 0)
);

function toggleGenre(name: string) {
  if (newGenres.value.includes(name)) {
    newGenres.value = newGenres.value.filter((genre) => genre !== name);
  } else {
    newGenres.value = [...newGenres.value, name];
  }
}

function toggleExclusion() {
  newExclusionMode.value = !newExclusionMode.value;
}

function resetAll() {
  newGenres.value = [];
  newExclusionMode.value = false;
  emit("save", [], false);
  emit("close");
}

function apply() {
  emit("save", newGenres.value, newExclusionMode.value);
  emit("close");
}

function toggleAll() {
  if (newGenres.value.length >= genresLength.value) {
    newGenres.value = [];
    return;
  }
  newGenres.value = genreGroups.value.flatMap((group) => group.genres);
}

watch(
  () => [props.genres, props.exclusionMode],
  () => {
    newGenres.value = [...(props.genres || [])];
    newExclusionMode.value = props.exclusionMode;
  },
  { immediate: true }
);
</script>
