<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
    <div class="w-full max-w-2xl rounded-xl border border-white/10 bg-[#1f2123] shadow-xl">
      <div class="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <h2 class="section-title text-xl">Возрастной рейтинг</h2>
        <button class="text-gray-400 hover:text-white" @click="emit('close')">
          вњ•
        </button>
      </div>

      <div class="p-6 space-y-2">
        <label
          v-for="[key, value] in Object.entries(FilterAgeRatingToString)"
          :key="`filter-age-${key}`"
          class="flex items-center gap-2"
        >
          <input
            type="checkbox"
            class="h-4 w-4"
            :checked="newAgeRatings.includes(Number(key))"
            @change="toggleRating(Number(key))"
          />
          <span>{{ value }}</span>
        </label>
      </div>

      <div class="flex flex-wrap items-center gap-2 border-t border-white/10 px-6 py-4">
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
          {{ newAgeRatings.length >= totalCount ? "Сбросить все" : "Выбрать все" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { FilterAgeRatingToString } from "@/api/utils";

const props = defineProps<{
  isOpen: boolean;
  ageRatings: number[];
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "save", ageRatings: number[]): void;
}>();

const newAgeRatings = ref<number[]>([]);
const totalCount = computed(() => Object.keys(FilterAgeRatingToString).length);

function toggleRating(value: number) {
  if (newAgeRatings.value.includes(value)) {
    newAgeRatings.value = newAgeRatings.value.filter((item) => item !== value);
  } else {
    newAgeRatings.value = [...newAgeRatings.value, value];
  }
}

function resetAll() {
  newAgeRatings.value = [];
  emit("save", []);
  emit("close");
}

function apply() {
  emit("save", newAgeRatings.value);
  emit("close");
}

function toggleAll() {
  if (newAgeRatings.value.length >= totalCount.value) {
    newAgeRatings.value = [];
    return;
  }
  newAgeRatings.value = Object.keys(FilterAgeRatingToString).map((key) => Number(key));
}

watch(
  () => props.ageRatings,
  () => {
    newAgeRatings.value = [...(props.ageRatings || [])];
  },
  { immediate: true }
);
</script>
