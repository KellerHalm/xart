<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-[#1b1c1d]">
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute -top-1/2 -left-1/2 h-full w-full rounded-full bg-[radial-gradient(circle,rgba(210,28,34,0.25)_0%,transparent_70%)]"></div>
      <div class="absolute -bottom-1/2 -right-1/2 h-full w-full rounded-full bg-[radial-gradient(circle,rgba(210,28,34,0.2)_0%,transparent_70%)]"></div>
    </div>

    <div class="relative z-10 flex flex-col items-center space-y-6">
      <div class="relative">
        <div class="flex h-28 w-28 items-center justify-center rounded-full border border-white/10 bg-[#222426] shadow-2xl">
          <img src="/images/icons/xart.svg" alt="Xart" class="h-16 w-16" />
        </div>
        <div class="absolute inset-0 rounded-full border-2 border-transparent border-t-[#d21c22] animate-spin"></div>
        <div
          class="absolute inset-2 rounded-full border-2 border-transparent border-t-[#b01218] animate-spin"
          :style="{ animationDirection: 'reverse', animationDuration: '1.5s' }"
        ></div>
      </div>

      <div class="text-center space-y-2">
        <h1
          class="text-3xl font-bold text-white transition-all duration-700"
          :class="showText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'"
        >
          Xart
        </h1>
        <p
          class="text-sm text-gray-400 transition-all duration-700 delay-200"
          :class="showText ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'"
        >
          Загрузка...
        </p>
      </div>

      <div class="h-2 w-64 overflow-hidden rounded-full bg-[#2a2d2f]">
        <div
          class="h-full rounded-full bg-gradient-to-r from-[#d21c22] via-[#c3191f] to-[#b01218] transition-all duration-300 ease-out"
          :style="{ width: `${progress}%` }"
        ></div>
      </div>

      <div class="text-xs font-mono text-gray-500">{{ progress }}%</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";

const emit = defineEmits<{ (e: "complete"): void }>();

const progress = ref(0);
const showText = ref(false);

let textTimer: number | undefined;
let progressInterval: number | undefined;

onMounted(() => {
  textTimer = window.setTimeout(() => {
    showText.value = true;
  }, 500);

  progressInterval = window.setInterval(() => {
    progress.value = Math.min(progress.value + 2, 100);
    if (progress.value >= 100) {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
      window.setTimeout(() => emit("complete"), 500);
    }
  }, 60);
});

onUnmounted(() => {
  if (textTimer) clearTimeout(textTimer);
  if (progressInterval) clearInterval(progressInterval);
});
</script>
