<template>
  <div>
    <div class="flex items-center justify-between border-b border-white/5 px-4 py-2">
      <h1 class="section-title text-lg sm:text-xl md:text-lg xl:text-xl">
        Франшиза {{ franchiseTitle }}
      </h1>
    </div>
    <div class="container mx-auto my-4">
      <div class="grid w-full grid-cols-1 gap-4 sm:grid-cols-2">
        <router-link
          v-for="(release, index) in content"
          :key="`related-release-${release.id}`"
          :to="`/release/${release.id}`"
          class="relative overflow-hidden card-surface rounded-lg pr-2"
        >
          <div class="flex flex-col gap-3 lg:flex-row">
            <img
              :src="release.image"
              alt=""
              class="mx-auto mt-4 aspect-[12/16] w-[216px] rounded-lg object-cover lg:mt-0"
            />
            <div class="px-2 pb-2">
              <div>
                <h1 class="mt-1 card-title line-clamp-2 text-lg lg:text-2xl">
                  {{ index + 1 }}. {{ release.title_ru || release.title_original }}
                </h1>
                <p class="card-subtitle mb-2 lg:mb-1 lg:-mt-1">
                  {{ release.season ? yearSeason[release.season] : "" }}{{ release.season ? ", " : "" }}{{ release.year ? `${release.year}г.` : "" }}
                </p>
                <ReleaseChips
                  :grade="release.grade ? Number(release.grade.toFixed(1)) : null"
                  :status="release.status"
                  :status-id="release.status_id"
                  :user-list="userList(release.profile_list_status)"
                  :episodes-released="release.episodes_released"
                  :episodes-total="release.episodes_total"
                  :category="release.category"
                  :is-favorite="release.is_favorite"
                />
              </div>
              <div>
                <div class="mt-2">
                  <span
                    v-for="(genre, idx) in parseGenres(release.genres)"
                    :key="`release_${release.id}_genre_${genre}_${idx}`"
                    class="text-gray-400 md:text-sm lg:text-base xl:text-lg"
                  >
                    <span v-if="idx > 0">, </span>{{ genre }}
                  </span>
                </div>
                <p v-if="release.description" class="mt-2 line-clamp-3 text-sm text-gray-300 lg:text-base xl:text-lg">
                  {{ release.description }}
                </p>
              </div>
            </div>
          </div>
        </router-link>
        <div v-if="isLoading" class="col-span-full flex min-h-[50vh] items-center justify-center">
          <Spinner />
        </div>
        <div v-if="!isLoading && !content.length" class="card-surface col-span-full flex flex-col items-center justify-center gap-4 rounded-xl p-8 text-xl">
          <span class="iconify-color twemoji--broken-heart h-24 w-24"></span>
          <p>В франшизе пока ничего нет...</p>
        </div>
      </div>
    </div>
    <button
      v-if="hasMore"
      class="mx-auto mb-6 flex w-[calc(100%-10rem)] items-center justify-center gap-2 rounded-lg p-2 btn-outline"
      @click="loadMore"
    >
      <span class="iconify mdi--plus h-10 w-10"></span>
      <span class="text-lg">Загрузить ещё</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { ENDPOINTS } from "@/api/config";
import { useUserStore } from "@/store/auth";
import Spinner from "@/components/Spinner.vue";
import ReleaseChips from "@/components/ReleasePoster/Chips.vue";

const route = useRoute();
const userStore = useUserStore();

const content = ref<any[]>([]);
const page = ref(0);
const hasMore = ref(true);
const isLoading = ref(true);

const yearSeason = ["_", "Зима", "Весна", "Лето", "Осень"];

const franchiseTitle = computed(() => {
  const title = route.query.title as string | undefined;
  return title ? decodeURIComponent(title) : "";
});

const profileLists: Record<number, { name: string; bg_color: string }> = {
  1: { name: "Смотрю", bg_color: "chip-info" },
  2: { name: "В планах", bg_color: "chip-muted" },
  3: { name: "Просмотрено", bg_color: "chip-success" },
  4: { name: "Отложено", bg_color: "chip-warning" },
  5: { name: "Брошено", bg_color: "chip-danger" },
};

function userList(status?: number) {
  if (!status || status === 0) return null;
  return profileLists[status] || null;
}

function parseGenres(genres?: string) {
  if (!genres) return [];
  return genres.split(",").map((genre) => genre.trim());
}

async function fetchPage(reset = false) {
  const id = route.params.id;
  if (!id) return;
  if (reset) {
    page.value = 0;
    content.value = [];
    hasMore.value = true;
  }
  if (!hasMore.value) return;

  isLoading.value = page.value === 0;
  let url = `${ENDPOINTS.release.related}/${id}/${page.value}?API-Version=v2`;
  if (userStore.token) {
    url += `&token=${userStore.token}`;
  }
  const res = await fetch(url);
  if (!res.ok) {
    hasMore.value = false;
    isLoading.value = false;
    return;
  }
  const data = await res.json();
  const items = data?.content || [];
  if (items.length === 0) {
    hasMore.value = false;
  } else {
    content.value = [...content.value, ...items];
    page.value += 1;
  }
  isLoading.value = false;
}

function loadMore() {
  fetchPage();
}

onMounted(() => {
  fetchPage(true);
});

watch(
  () => route.params.id,
  () => fetchPage(true)
);
</script>

