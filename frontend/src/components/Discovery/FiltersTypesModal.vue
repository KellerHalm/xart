<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
    <div class="w-full max-w-2xl rounded-xl border border-white/10 bg-[#1f2123] shadow-xl">
      <div class="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <h2 class="section-title text-xl">Типы релиза</h2>
        <button class="text-gray-400 hover:text-white" @click="emit('close')">вњ•</button>
      </div>

      <div class="p-6 space-y-2">
        <label
          v-for="item in typesData"
          :key="`filter-type-${item.id}`"
          class="flex items-center gap-2"
        >
          <input
            type="checkbox"
            class="h-4 w-4"
            :checked="newTypes.includes(Number(item.id))"
            @change="toggleType(Number(item.id))"
          />
          <span>{{ item.name }}</span>
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
          {{ newTypes.length >= typesData.length ? "Сбросить все" : "Выбрать все" }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps<{
  isOpen: boolean;
  typesData: any[];
  types: number[];
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "save", types: number[]): void;
}>();

const newTypes = ref<number[]>([]);

function toggleType(id: number) {
  if (newTypes.value.includes(id)) {
    newTypes.value = newTypes.value.filter((item) => item !== id);
  } else {
    newTypes.value = [...newTypes.value, id];
  }
}

function resetAll() {
  newTypes.value = [];
  emit("save", []);
  emit("close");
}

function apply() {
  emit("save", newTypes.value);
  emit("close");
}

function toggleAll() {
  if (newTypes.value.length >= props.typesData.length) {
    newTypes.value = [];
    return;
  }
  newTypes.value = props.typesData.map((item) => Number(item.id));
}

watch(
  () => props.types,
  () => {
    newTypes.value = [...(props.types || [])];
  },
  { immediate: true }
);
</script>
