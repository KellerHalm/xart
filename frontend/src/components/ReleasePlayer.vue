<template>
  <div class="rounded-xl border border-white/5 bg-[#222426] p-4 shadow">
    <div v-if="loading" class="flex items-center justify-center aspect-video">
      <Spinner />
    </div>
    <div v-else-if="error" class="flex items-center justify-center aspect-video">
      <p>{{ error }}</p>
    </div>
    <div v-else>
      <div class="flex flex-wrap gap-2">
        <select
          class="rounded-lg border border-white/10 bg-[#1f2022] px-3 py-2 text-sm text-gray-200"
          :value="selectedVoiceover?.id"
          @change="onVoiceoverChange"
        >
          <option v-for="voiceover in voiceoverInfo" :key="voiceover.id" :value="voiceover.id">
            Озвучка: {{ voiceover.name }}
          </option>
        </select>
        <select
          class="rounded-lg border border-white/10 bg-[#1f2022] px-3 py-2 text-sm text-gray-200"
          :value="selectedSource?.id"
          @change="onSourceChange"
        >
          <option v-for="source in sourcesInfo" :key="source.id" :value="source.id">
            Плеер: {{ source.name }}
          </option>
        </select>
      </div>
      <div class="mt-4 aspect-video">
        <iframe
          v-if="selectedEpisode"
          :src="selectedEpisode.url"
          loading="lazy"
          allowfullscreen
          class="h-full w-full rounded-md"
        ></iframe>
        <p v-else>Ошибка загрузки плеера</p>
      </div>
      <div class="mt-4 overflow-x-auto">
        <div class="flex gap-2 pb-2">
          <button
            v-for="episode in episodeInfo"
            :key="`episode_${episode.position}`"
            class="whitespace-nowrap rounded-lg border px-3 py-2 text-sm"
            :class="episode.position === selectedEpisode?.position ? 'bg-[#e04545] text-white border-[#e04545]' : 'border-white/10 text-gray-200'"
            :disabled="episode.position === selectedEpisode?.position"
            @click="selectEpisode(episode)"
          >
            {{ episodeLabel(episode) }}
            <span
              class="iconify material-symbols--check-circle ml-2 h-4 w-4"
              :class="isWatched(episode) ? 'text-green-400' : 'text-gray-400 opacity-30'"
            ></span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { ENDPOINTS } from "@/api/config";
import { useUserStore } from "@/store/auth";
import { useUserPlayerPreferencesStore } from "@/store/player";
import { usePreferencesStore } from "@/store/preferences";
import Spinner from "@/components/Spinner.vue";

const props = defineProps<{ id: number }>();

const userStore = useUserStore();
const playerPrefs = useUserPlayerPreferencesStore();
const preferences = usePreferencesStore();

const voiceoverInfo = ref<any[]>([]);
const sourcesInfo = ref<any[]>([]);
const episodeInfo = ref<any[]>([]);
const selectedVoiceover = ref<any | null>(null);
const selectedSource = ref<any | null>(null);
const selectedEpisode = ref<any | null>(null);
const error = ref<string | null>(null);
const loading = ref(true);

const ANON_WATCHED_STORAGE_KEY = "anonEpisodesWatched";

type AnonWatchedLeaf = Record<string, true>;
type AnonEpisodesWatched = Record<
  string,
  Record<string, Record<string, AnonWatchedLeaf>>
>;

const anonEpisodesWatched = ref<AnonEpisodesWatched>({});

function loadAnonEpisodesWatched() {
  try {
    const raw = localStorage.getItem(ANON_WATCHED_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") {
      return parsed as AnonEpisodesWatched;
    }
  } catch {
    // Ignore malformed local cache and fallback to a clean state.
  }
  return {};
}

function persistAnonEpisodesWatched() {
  localStorage.setItem(
    ANON_WATCHED_STORAGE_KEY,
    JSON.stringify(anonEpisodesWatched.value)
  );
}

function ensureAnonWatchedPath(release: number, source: number, voiceover: number): AnonWatchedLeaf {
  const releaseKey = String(release);
  const sourceKey = String(source);
  const voiceoverKey = String(voiceover);
  if (!anonEpisodesWatched.value[releaseKey]) anonEpisodesWatched.value[releaseKey] = {};
  if (!anonEpisodesWatched.value[releaseKey][sourceKey]) anonEpisodesWatched.value[releaseKey][sourceKey] = {};
  if (!anonEpisodesWatched.value[releaseKey][sourceKey][voiceoverKey]) {
    anonEpisodesWatched.value[releaseKey][sourceKey][voiceoverKey] = {};
  }
  return anonEpisodesWatched.value[releaseKey][sourceKey][voiceoverKey];
}

function getCurrentAnonWatchedMap(): AnonWatchedLeaf {
  if (!selectedSource.value || !selectedVoiceover.value) return {};
  const releaseKey = String(props.id);
  const sourceKey = String(selectedSource.value.id);
  const voiceoverKey = String(selectedVoiceover.value.id);
  return anonEpisodesWatched.value[releaseKey]?.[sourceKey]?.[voiceoverKey] || {};
}

const currentWatchedEpisodes = computed(
  () => new Set(Object.keys(getCurrentAnonWatchedMap()))
);

function saveAnonEpisodeWatched(
  release: number,
  source: number,
  voiceover: number,
  episode: number
) {
  const watchedByVoiceover = ensureAnonWatchedPath(release, source, voiceover);
  watchedByVoiceover[String(episode)] = true;
  persistAnonEpisodesWatched();
}

function setError(message: string) {
  voiceoverInfo.value = [];
  sourcesInfo.value = [];
  episodeInfo.value = [];
  selectedVoiceover.value = null;
  selectedSource.value = null;
  selectedEpisode.value = null;
  error.value = message;
  loading.value = false;
}

async function fetchInfo(url: string, type: "voiceover" | "sources" | "episodes") {
  let data: any = {};
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Error fetching data");
    data = await res.json();
  } catch {
    setError("Ошибка получения ответа от сервера");
    return;
  }

  if (!data || Object.keys(data).length === 0) {
    setError("Ошибка получения данных с сервера");
    return;
  }

  if (type === "voiceover") {
    voiceoverInfo.value = data.types || [];
    const stored = playerPrefs.getPreferredVoiceover(props.id);
    selectedVoiceover.value =
      data.types.find((item: any) => item.name === stored) || data.types[0];
  } else if (type === "sources") {
    sourcesInfo.value = data.sources || [];
    const stored = playerPrefs.getPreferredPlayer(props.id);
    selectedSource.value =
      data.sources.find((item: any) => item.name === stored) || data.sources[0];
  } else if (type === "episodes") {
    if (!data.episodes || data.episodes.length === 0) {
      const remSources = sourcesInfo.value.filter(
        (source) => source.id !== selectedSource.value?.id
      );
      sourcesInfo.value = remSources;
      selectedSource.value = remSources[0] || null;
      return;
    }

    episodeInfo.value = data.episodes;
    selectedEpisode.value = data.episodes[0];

    if (selectedSource.value && selectedVoiceover.value) {
      const watchedEpisodes = Object.keys(
        ensureAnonWatchedPath(
          props.id,
          selectedSource.value.id,
          selectedVoiceover.value.id
        )
      )
        .map((item) => Number(item))
        .filter((item) => !Number.isNaN(item))
        .sort((a, b) => a - b);
      if (watchedEpisodes.length) {
        let lastWatchedEpisode = watchedEpisodes[watchedEpisodes.length - 1] || 0;
        if (
          !["Sibnet", "Sibnet (не работает)"].includes(selectedSource.value.name)
        ) {
          lastWatchedEpisode = Number(lastWatchedEpisode) - 1;
        }
        if (data.episodes[lastWatchedEpisode]) {
          selectedEpisode.value = data.episodes[lastWatchedEpisode];
        }
      }
    }
  } else {
    setError("Неизвестный тип запроса");
  }

  loading.value = false;
}

function onVoiceoverChange(event: Event) {
  const id = Number((event.target as HTMLSelectElement).value);
  const voiceover = voiceoverInfo.value.find((item) => item.id === id);
  if (!voiceover) return;
  selectedVoiceover.value = voiceover;
  playerPrefs.setPreferredVoiceover(props.id, voiceover.name);
}

function onSourceChange(event: Event) {
  const id = Number((event.target as HTMLSelectElement).value);
  const source = sourcesInfo.value.find((item) => item.id === id);
  if (!source) return;
  selectedSource.value = source;
  playerPrefs.setPreferredPlayer(props.id, source.name);
}

function addToHistory(episode: any) {
  if (!selectedSource.value || !selectedVoiceover.value) return;
  const watchedByCurrentSelection = getCurrentAnonWatchedMap();
  const episodeKey = String(episode.position);
  if (
    preferences.flags.saveWatchHistory &&
    !episode.is_watched &&
    !watchedByCurrentSelection[episodeKey]
  ) {
    episode.is_watched = true;
    saveAnonEpisodeWatched(
      props.id,
      selectedSource.value.id,
      selectedVoiceover.value.id,
      episode.position
    );
    if (userStore.token) {
      fetch(
        `${ENDPOINTS.statistic.addHistory}/${props.id}/${selectedSource.value.id}/${episode.position}?token=${userStore.token}`
      );
      fetch(
        `${ENDPOINTS.statistic.markWatched}/${props.id}/${selectedSource.value.id}/${episode.position}?token=${userStore.token}`
      );
    }
  }
}

function selectEpisode(episode: any) {
  selectedEpisode.value = episode;
  addToHistory(episode);
}

function episodeLabel(episode: any) {
  if (episode.name) return episode.name;
  if (!selectedSource.value) return `${episode.position} серия`;
  const isSibnet = ["Sibnet", "Sibnet (не работает)"].includes(
    selectedSource.value.name
  );
  return `${isSibnet ? episode.position + 1 : episode.position} серия`;
}

function isWatched(episode: any) {
  return episode.is_watched || currentWatchedEpisodes.value.has(String(episode.position));
}

onMounted(() => {
  anonEpisodesWatched.value = loadAnonEpisodesWatched();
  loading.value = true;
  fetchInfo(`${ENDPOINTS.release.episode}/${props.id}`, "voiceover");
});

watch(
  () => selectedVoiceover.value,
  (value) => {
    if (value) {
      fetchInfo(`${ENDPOINTS.release.episode}/${props.id}/${value.id}`, "sources");
    }
  }
);

watch(
  () => [selectedSource.value, userStore.token],
  ([source]) => {
    if (source && selectedVoiceover.value) {
      let url = `${ENDPOINTS.release.episode}/${props.id}/${selectedVoiceover.value.id}/${source.id}`;
      if (userStore.token) {
        url += `?token=${userStore.token}`;
      }
      fetchInfo(url, "episodes");
    }
  }
);
</script>
