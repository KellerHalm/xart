<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
    <div class="max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-xl border border-white/10 bg-[#1f2123] shadow-xl">
      <div class="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <h2 class="section-title text-xl">Расписание</h2>
        <button class="text-gray-400 hover:text-white" @click="emit('close')">вњ•</button>
      </div>
      <div class="max-h-[75vh] overflow-y-auto px-6 py-4">
        <div v-if="isLoading" class="flex items-center justify-center py-10">
          <Spinner />
        </div>
        <div v-else-if="error" class="text-sm text-[#d21c22]">Ошибка загрузки</div>
        <div v-else class="space-y-6">
          <ReleaseSection v-if="schedule.monday?.length" title="Понедельник" :content="schedule.monday" />
          <ReleaseSection v-if="schedule.tuesday?.length" title="Вторник" :content="schedule.tuesday" />
          <ReleaseSection v-if="schedule.wednesday?.length" title="Среда" :content="schedule.wednesday" />
          <ReleaseSection v-if="schedule.thursday?.length" title="Четверг" :content="schedule.thursday" />
          <ReleaseSection v-if="schedule.friday?.length" title="Пятница" :content="schedule.friday" />
          <ReleaseSection v-if="schedule.saturday?.length" title="Суббота" :content="schedule.saturday" />
          <ReleaseSection v-if="schedule.sunday?.length" title="Воскресенье" :content="schedule.sunday" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { ENDPOINTS } from "@/api/config";
import ReleaseSection from "@/components/ReleaseSection.vue";
import Spinner from "@/components/Spinner.vue";

const props = defineProps<{ isOpen: boolean }>();
const emit = defineEmits<{ (e: "close"): void }>();

const schedule = ref<Record<string, any[]>>({});
const isLoading = ref(false);
const error = ref(false);

async function fetchSchedule() {
  isLoading.value = true;
  error.value = false;
  const res = await fetch(ENDPOINTS.discover.schedule);
  if (!res.ok) {
    error.value = true;
    isLoading.value = false;
    return;
  }
  schedule.value = await res.json();
  isLoading.value = false;
}

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      fetchSchedule();
    }
  }
);

onMounted(() => {
  if (props.isOpen) {
    fetchSchedule();
  }
});
</script>
