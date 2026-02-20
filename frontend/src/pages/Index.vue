<template>
  <div class="space-y-8">
    <ReleaseSection
      v-if="lastReleases"
      title="Последние релизы"
      show-all-link="/home/last"
      :content="lastReleases.content"
    />
    <ReleaseSection
      v-if="finishedReleases"
      title="Завершенные релизы"
      show-all-link="/home/finished"
      :content="finishedReleases.content"
    />
    <ReleaseSection
      v-if="ongoingReleases"
      title="Выходит"
      show-all-link="/home/ongoing"
      :content="ongoingReleases.content"
    />
    <ReleaseSection
      v-if="announceReleases"
      title="Анонсированные релизы"
      show-all-link="/home/announce"
      :content="announceReleases.content"
    />
    <ReleaseSection
      v-if="filmsReleases"
      title="Фильмы"
      show-all-link="/home/films"
      :content="filmsReleases.content"
    />
    <div v-if="isLoading" class="flex items-center justify-center py-10">
      <Spinner size="lg" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, shallowRef, watch } from "vue";
import { useRouter } from "vue-router";
import { FetchFilter } from "@/api/utils";
import { ListAnnounce, ListFilms, ListFinished, ListLast, ListOngoing } from "@/api/index-filters";
import { usePreferencesStore } from "@/store/preferences";
import { useUserStore } from "@/store/auth";
import ReleaseSection from "@/components/ReleaseSection.vue";
import Spinner from "@/components/Spinner.vue";

const router = useRouter();
const preferences = usePreferencesStore();
const userStore = useUserStore();

const isLoading = ref(false);
const lastReleases = shallowRef<any | null>(null);
const ongoingReleases = shallowRef<any | null>(null);
const finishedReleases = shallowRef<any | null>(null);
const announceReleases = shallowRef<any | null>(null);
const filmsReleases = shallowRef<any | null>(null);
let activeLoadId = 0;

function pickFilterData(result: PromiseSettledResult<any[]>) {
  if (result.status !== "fulfilled") return null;
  const [data] = result.value;
  return data || null;
}

async function loadReleases() {
  const loadId = ++activeLoadId;
  isLoading.value = true;
  const token = userStore.token;

  const [last, ongoing, announce, finished, films] = await Promise.allSettled([
    FetchFilter(ListLast.filter, 0, token),
    FetchFilter(ListOngoing.filter, 0, token),
    FetchFilter(ListAnnounce.filter, 0, token),
    FetchFilter(ListFinished.filter, 0, token),
    FetchFilter(ListFilms.filter, 0, token),
  ]);

  if (loadId !== activeLoadId) {
    return;
  }

  lastReleases.value = pickFilterData(last);
  ongoingReleases.value = pickFilterData(ongoing);
  announceReleases.value = pickFilterData(announce);
  finishedReleases.value = pickFilterData(finished);
  filmsReleases.value = pickFilterData(films);
  isLoading.value = false;
}

onMounted(() => {
  if (preferences.params.skipToCategory.enabled) {
    router.push(`/home/${preferences.params.skipToCategory.homeCategory}`);
    return;
  }
  loadReleases();
});

watch(
  () => userStore.token,
  () => {
    if (!preferences.params.skipToCategory.enabled) {
      loadReleases();
    }
  }
);
</script>
