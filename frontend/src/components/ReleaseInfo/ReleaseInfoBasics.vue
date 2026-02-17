<template>
  <div :class="wrapperClass">
    <div class="grid grid-cols-1 gap-4 lg:grid-cols-[220px_minmax(0,1fr)]">
      <aside class="flex flex-col gap-3">
        <div class="relative overflow-hidden rounded-xl border border-white/10 bg-black/25">
          <Poster :image="image" className="h-full w-full object-cover" loading="eager" />
          <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
          <div
            v-if="episodesLabel"
            class="absolute right-2 top-2 rounded-full border border-white/15 bg-black/60 px-2 py-1 text-xs font-semibold text-white"
          >
            {{ episodesLabel }}
          </div>
        </div>

        <button
          v-if="showPlayerButton"
          type="button"
          class="w-full rounded-xl bg-[#d21c22] px-4 py-3 text-sm font-semibold text-white hover:bg-[#b01218]"
          @click="emit('open-player')"
        >
          Смотреть онлайн
        </button>

        <ReleaseInfoStreaming :release-id="releaseId" />
      </aside>

      <div class="min-w-0 space-y-3">
        <div class="space-y-1">
          <h1 class="text-2xl font-extrabold leading-tight md:text-4xl" :class="isDark ? 'text-white' : 'text-gray-900'">
            {{ title.ru || "Без названия" }}
          </h1>
          <p v-if="title.original" class="text-sm uppercase tracking-[0.08em] text-gray-400">
            {{ title.original }}
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2 text-sm">
          <button
            v-if="status"
            type="button"
            class="rounded-full border px-3 py-1"
            :class="[
              isDark ? 'border-white/15 bg-white/5 text-gray-200' : 'border-black/10 bg-black/5 text-gray-700',
              statusFilterId ? 'cursor-pointer hover:border-[#d21c22]/60 hover:text-[#f1b9b9]' : 'cursor-default',
            ]"
            :disabled="!statusFilterId"
            @click="handleStatusClick"
          >
            {{ status }}
          </button>
          <button
            v-for="genre in genresPreview"
            :key="genre"
            type="button"
            class="rounded-full border border-[#d21c22]/50 bg-[#d21c22]/10 px-3 py-1 text-[#f1b9b9] hover:border-[#d21c22]/80 hover:text-white"
            @click="handleGenreClick(genre)"
          >
            {{ genre }}
          </button>
        </div>

        <div
          v-if="note"
          class="rounded-xl border border-[#d21c22]/35 px-3 py-2 text-sm" :class="isDark ? 'bg-[#2a1718] text-gray-100' : 'bg-[rgba(210,28,34,0.08)] text-gray-800'"
        >
          <div v-html="note"></div>
        </div>

        <div class="text-sm leading-7 md:text-base" :class="isDark ? 'text-gray-200' : 'text-gray-700'">
          <p
            class="overflow-hidden transition-[max-height]"
            :style="{ maxHeight: isFullDescription ? '1000px' : '220px' }"
          >
            {{ description || "Описание отсутствует." }}
          </p>
          <button
            v-if="(description || '').length > 360"
            type="button"
            class="mt-2 text-sm font-semibold text-[#d21c22] hover:text-[#f1b9b9]"
            @click="isFullDescription = !isFullDescription"
          >
            {{ isFullDescription ? "Свернуть" : "Показать полностью" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import Poster from "@/components/ReleasePoster/Poster.vue";
import ReleaseInfoStreaming from "@/components/ReleaseInfo/ReleaseInfoStreaming.vue";
import { usePreferencesStore } from "@/store/preferences";
import { FilterDefault, cloneFilter } from "@/api/utils";
import type { Filter } from "@/api/utils";

const props = withDefaults(
  defineProps<{
    releaseId: number;
    image: string;
    title: { ru: string; original: string };
    note: string | null;
    description?: string | null;
    episodesReleased?: number | null;
    episodesTotal?: number | null;
    status?: string;
    genres?: string;
    embedded?: boolean;
    showPlayerButton?: boolean;
  }>(),
  {
    description: "",
    episodesReleased: null,
    episodesTotal: null,
    status: "",
    genres: "",
    embedded: false,
    showPlayerButton: false,
  }
);

const emit = defineEmits<{
  (e: "open-player"): void;
}>();

const isFullDescription = ref(false);
const preferencesStore = usePreferencesStore();
const isDark = computed(() => preferencesStore.flags.theme === "dark");
const router = useRouter();

const wrapperClass = computed(() =>
  props.embedded
    ? (isDark.value
      ? "rounded-xl border border-white/10 bg-[#222426]/60 p-4"
      : "rounded-xl border border-black/10 bg-white/90 p-4")
    : (isDark.value
      ? "h-full rounded-xl border border-white/5 bg-[#222426] p-4 shadow"
      : "h-full rounded-xl border border-black/10 bg-white p-4 shadow")
);

const genresPreview = computed(() =>
  (props.genres || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 4)
);

const statusFilterId = computed(() => {
  const raw = (props.status || "").trim().toLowerCase();
  if (!raw) return null;
  if (raw.includes("выходит") || raw.includes("онгоинг") || raw.includes("ongoing") || raw.includes("онгоин")) return 2;
  if (raw.includes("анонс")) return 3;
  if (raw.includes("заверш") || raw.includes("вышел") || raw.includes("вышла") || raw.includes("вышли")) return 1;
  return null;
});

function pushFilter(partial: Partial<Filter>) {
  const filter = { ...cloneFilter(FilterDefault), ...partial } as Filter;
  const serialized = encodeURIComponent(JSON.stringify(filter));
  router.push(`/discovery/filter?filter=${serialized}`);
}

function handleStatusClick() {
  if (!statusFilterId.value) return;
  pushFilter({ status_id: statusFilterId.value });
}

function handleGenreClick(genre: string) {
  pushFilter({ genres: [genre] });
}

const episodesLabel = computed(() => {
  const released = props.episodesReleased;
  const total = props.episodesTotal;
  if (released === null && total === null) return "";
  if (released !== null && total !== null) return `${released}/${total} эп.`;
  if (released !== null) return `${released} эп.`;
  return `${total} эп.`;
});
</script>
