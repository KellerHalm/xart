<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
    <div class="w-full max-w-2xl rounded-xl border border-white/10 bg-[#1f2123] shadow-xl">
      <div class="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <h2 class="section-title text-xl">Исключить из списков</h2>
        <button class="text-gray-400 hover:text-white" @click="emit('close')">вњ•</button>
      </div>

      <div class="p-6 space-y-2">
        <label
          v-for="[key, value] in Object.entries(FilterProfileListIdToString)"
          :key="`filter-list-${key}`"
          class="flex items-center gap-2"
        >
          <input
            type="checkbox"
            class="h-4 w-4"
            :checked="newList.includes(Number(key))"
            @change="toggleList(Number(key))"
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
          {{ newList.length >= totalCount ? "Сбросить все" : "Выбрать все" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { FilterProfileListIdToString } from "@/api/utils";

const props = defineProps<{
  isOpen: boolean;
  lists: number[];
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "save", lists: number[]): void;
}>();

const newList = ref<number[]>([]);
const totalCount = computed(() => Object.keys(FilterProfileListIdToString).length);

function toggleList(id: number) {
  if (newList.value.includes(id)) {
    newList.value = newList.value.filter((item) => item !== id);
  } else {
    newList.value = [...newList.value, id];
  }
}

function resetAll() {
  newList.value = [];
  emit("save", []);
  emit("close");
}

function apply() {
  emit("save", newList.value);
  emit("close");
}

function toggleAll() {
  if (newList.value.length >= totalCount.value) {
    newList.value = [];
    return;
  }
  newList.value = Object.keys(FilterProfileListIdToString).map((key) => Number(key));
}

watch(
  () => props.lists,
  () => {
    newList.value = [...(props.lists || [])];
  },
  { immediate: true }
);
</script>
