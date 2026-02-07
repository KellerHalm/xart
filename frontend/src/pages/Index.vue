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
import { onMounted, ref, watch } from "vue";
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
const lastReleases = ref<any | null>(null);
const ongoingReleases = ref<any | null>(null);
const finishedReleases = ref<any | null>(null);
const announceReleases = ref<any | null>(null);
const filmsReleases = ref<any | null>(null);

async function loadReleases() {
  isLoading.value = true;
  lastReleases.value = null;
  ongoingReleases.value = null;
  finishedReleases.value = null;
  announceReleases.value = null;
  filmsReleases.value = null;

  const [last] = await FetchFilter(ListLast.filter, 0, userStore.token);
  const [ongoing] = await FetchFilter(ListOngoing.filter, 0, userStore.token);
  const [announce] = await FetchFilter(ListAnnounce.filter, 0, userStore.token);
  const [finished] = await FetchFilter(ListFinished.filter, 0, userStore.token);
  const [films] = await FetchFilter(ListFilms.filter, 0, userStore.token);

  lastReleases.value = last;
  ongoingReleases.value = ongoing;
  finishedReleases.value = finished;
  announceReleases.value = announce;
  filmsReleases.value = films;
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
