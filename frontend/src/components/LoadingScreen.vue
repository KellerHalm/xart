<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center overflow-hidden" :style="{ background: screenBackground }">
    <div class="pointer-events-none absolute inset-0" :style="{ background: ambientGlow }"></div>

    <div class="relative z-10 flex flex-col items-center space-y-6">
      <div class="relative">
        <div
          class="flex h-28 w-28 items-center justify-center rounded-full border shadow-2xl"
          :class="isDark ? 'border-white/10 bg-[#222426]' : 'border-[#ff2d2d]/40 bg-white/95'"
        >
          <img src="/images/icons/xart.svg" alt="Xart" class="h-16 w-16" />
        </div>
        <div class="absolute inset-0 animate-spin rounded-full border-2 border-transparent" :style="{ borderTopColor: accentPrimary }"></div>
        <div
          class="absolute inset-2 animate-spin rounded-full border-2 border-transparent"
          :style="{ animationDirection: 'reverse', animationDuration: '1.5s', borderTopColor: accentSecondary }"
        ></div>
      </div>

      <div class="space-y-2 text-center">
        <h1
          class="text-3xl font-bold transition-all duration-700"
          :class="[showText ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0', isDark ? 'text-white' : 'text-gray-900']"
        >
          Xart
        </h1>
        <p
          class="text-sm transition-all duration-700 delay-200"
          :class="[showText ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0', isDark ? 'text-gray-400' : 'text-gray-600']"
        >
          {{ currentPhrase }}
        </p>
      </div>

      <div class="h-2 w-64 overflow-hidden rounded-full" :class="isDark ? 'bg-[#2a2d2f]' : 'border border-[#ff2d2d]/20 bg-[#ffe5e5]'">
        <div
          class="h-full rounded-full transition-all duration-300 ease-out"
          :style="{ width: `${progress}%`, background: progressGradient }"
        ></div>
      </div>

      <div class="font-mono text-xs" :class="isDark ? 'text-gray-500' : 'text-gray-600'">{{ progress }}%</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { usePreferencesStore } from "@/store/preferences";

const emit = defineEmits<{ (e: "complete"): void }>();

const preferencesStore = usePreferencesStore();
const isDark = computed(() => preferencesStore.flags.theme === "dark");

const loadingPhrases = [
  "Призыв силы…",
  "Активация…",
  "Синхронизация…",
  "Инициализация чакры…",
  "Пробуждение…",
  "Вход в мир аниме…",
  "Открытие портала…",
  "Подключение к реальности 2D…",
  "История вот-вот начнётся…",
  "Судьба загружается…",
  "Мир формируется…",
  "Легенда пробуждается…",
  "Сюжет закручивается…",
  "Магия наполняет пространство…",
  "Сбор команды героев…",
  "Подготовка к битве…",
  "Уровень силы растёт…",
  "Энергия достигнута на 80%…",
  "Режим боя активируется…",
  "Техника почти готова…",
  "Загрузка мира…",
  "Кэширование вайфу…",
  "Отрисовка аниме-реальности…",
  "Компиляция сюжета…",
  "Система запущена…",
  "Герой опаздывает…",
  "Сэнпай уже идёт…",
  "Аниме почти здесь, потерпи!",
  "Вайфу в пути…",
  "Злодей ещё не готов…",
  "Начало регресии...",
];

const progress = ref(0);
const showText = ref(false);
const currentPhrase = ref(loadingPhrases[Math.floor(Math.random() * loadingPhrases.length)] || "Загрузка...");

const accentPrimary = computed(() => (isDark.value ? "#d21c22" : "#ff2d2d"));
const accentSecondary = computed(() => (isDark.value ? "#b01218" : "#ff5c5c"));

const screenBackground = computed(() =>
  isDark.value
    ? "radial-gradient(1200px 900px at 18% 16%, rgba(210,28,34,0.18) 0%, transparent 62%), radial-gradient(1000px 760px at 84% 84%, rgba(210,28,34,0.14) 0%, transparent 64%), linear-gradient(180deg, #141a21 0%, #121920 100%)"
    : "radial-gradient(1200px 900px at 18% 16%, rgba(255,45,45,0.26) 0%, transparent 62%), radial-gradient(1000px 760px at 84% 84%, rgba(255,45,45,0.2) 0%, transparent 64%), linear-gradient(180deg, #f8f9fb 0%, #f1f4f8 100%)"
);

const ambientGlow = computed(() =>
  isDark.value
    ? "radial-gradient(600px 420px at 50% 42%, rgba(210,28,34,0.08) 0%, transparent 70%)"
    : "radial-gradient(640px 460px at 50% 42%, rgba(255,45,45,0.12) 0%, transparent 72%)"
);

const progressGradient = computed(() =>
  isDark.value
    ? "linear-gradient(90deg, #d21c22 0%, #c3191f 55%, #b01218 100%)"
    : "linear-gradient(90deg, #ff2d2d 0%, #ff3e3e 55%, #ff6a6a 100%)"
);

let textTimer: number | undefined;
let progressInterval: number | undefined;
let phraseInterval: number | undefined;

function pickRandomPhrase() {
  if (loadingPhrases.length <= 1) return;
  let next = currentPhrase.value;
  while (next === currentPhrase.value) {
    next = loadingPhrases[Math.floor(Math.random() * loadingPhrases.length)] || currentPhrase.value;
  }
  currentPhrase.value = next;
}

onMounted(() => {
  textTimer = window.setTimeout(() => {
    showText.value = true;
  }, 500);

  phraseInterval = window.setInterval(() => {
    pickRandomPhrase();
  }, 1200);

  progressInterval = window.setInterval(() => {
    progress.value = Math.min(progress.value + 2, 100);
    if (progress.value >= 100) {
      if (progressInterval) clearInterval(progressInterval);
      if (phraseInterval) clearInterval(phraseInterval);
      window.setTimeout(() => emit("complete"), 500);
    }
  }, 60);
});

onUnmounted(() => {
  if (textTimer) clearTimeout(textTimer);
  if (progressInterval) clearInterval(progressInterval);
  if (phraseInterval) clearInterval(phraseInterval);
});
</script>
