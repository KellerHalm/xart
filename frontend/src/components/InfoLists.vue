<template>
  <div class="rounded-xl border border-white/5 bg-[#222426] p-4 shadow">
    <div class="flex h-8 w-full overflow-hidden rounded-md">
      <div class="bg-green-500" :style="{ width: `${percent.watching}%` }"></div>
      <div class="bg-purple-500" :style="{ width: `${percent.planned}%` }"></div>
      <div class="bg-blue-500" :style="{ width: `${percent.completed}%` }"></div>
      <div class="bg-yellow-300" :style="{ width: `${percent.delayed}%` }"></div>
      <div class="bg-red-500" :style="{ width: `${percent.abandoned}%` }"></div>
      <div class="bg-gray-400" :style="{ width: `${percent.none}%` }"></div>
    </div>
    <div class="mt-3 flex flex-wrap gap-4 text-sm">
      <p><span class="mr-2 inline-block h-3 w-3 rounded-sm bg-green-500"></span>Смотрю <span class="font-bold">{{ watching }}</span></p>
      <p><span class="mr-2 inline-block h-3 w-3 rounded-sm bg-purple-500"></span>В планах <span class="font-bold">{{ planned }}</span></p>
      <p><span class="mr-2 inline-block h-3 w-3 rounded-sm bg-blue-500"></span>Просмотрено <span class="font-bold">{{ completed }}</span></p>
      <p><span class="mr-2 inline-block h-3 w-3 rounded-sm bg-yellow-300"></span>Отложено <span class="font-bold">{{ delayed }}</span></p>
      <p><span class="mr-2 inline-block h-3 w-3 rounded-sm bg-red-500"></span>Брошено <span class="font-bold">{{ abandoned }}</span></p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  completed: number;
  planned: number;
  abandoned: number;
  delayed: number;
  watching: number;
  total?: number;
}>();

const total = computed(() => {
  return (
    props.total ??
    props.watching +
      props.planned +
      props.completed +
      props.delayed +
      props.abandoned
  );
});

const percent = computed(() => {
  const sum = total.value || 1;
  const calc = (value: number) => (value / sum) * 100;
  const used =
    props.watching + props.planned + props.completed + props.delayed + props.abandoned;
  const none = Math.max(sum - used, 0);
  return {
    watching: calc(props.watching),
    planned: calc(props.planned),
    completed: calc(props.completed),
    delayed: calc(props.delayed),
    abandoned: calc(props.abandoned),
    none: calc(none),
  };
});
</script>
