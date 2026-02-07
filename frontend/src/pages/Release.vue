<template>
  <div v-if="isLoading" class="flex min-h-screen items-center justify-center">
    <Spinner />
  </div>
  <div v-else-if="error" class="flex min-h-screen items-center justify-center">
    <div class="flex flex-col gap-2">
      <h1 class="text-2xl font-bold">Ошибка</h1>
      <p class="text-lg">Произошла ошибка при загрузке релиза. Попробуйте обновить страницу.</p>
    </div>
  </div>
  <div v-else-if="release">
    <div class="flex flex-col gap-4 pb-8">
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr_0.8fr]">
        <ReleaseInfoBasics
          :release-id="release.id"
          :image="release.image"
          :title="{ ru: release.title_ru, original: release.title_original }"
          :description="release.description"
          :note="release.note"
        />
        <ReleaseInfoInfo
          :country="release.country"
          :aired-on-date="release.aired_on_date"
          :year="release.year"
          :episodes="{ total: release.episodes_total, released: release.episodes_released }"
          :season="release.season"
          :status="release.status ? release.status.name : 'Анонс'"
          :duration="release.duration"
          :category="release.category?.name || ''"
          :broadcast="release.broadcast"
          :studio="release.studio"
          :author="release.author"
          :director="release.director"
          :genres="release.genres"
        />
        <ReleaseInfoUserList
          :user-list="userList"
          :is-favorite="userFavorite"
          :release-id="release.id"
          :token="userStore.token"
          :profile-id="userStore.user ? userStore.user.id : null"
          :collection-count="release.collection_count"
          @update:userList="userList = $event"
          @update:isFavorite="userFavorite = $event"
        />
      </div>
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_0.8fr]">
        <div class="flex flex-col gap-2">
          <ReleasePlayer v-if="showPlayer" :id="release.id" />
          <div class="hidden lg:block">
            <CommentsMain
              :release-id="release.id"
              :token="userStore.token"
              :comments="release.comments || []"
            />
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <ReleaseInfoRating
            v-if="showPlayer"
            :release-id="release.id"
            :grade="release.grade"
            :token="userStore.token"
            :votes="{
              1: release.vote_1_count,
              2: release.vote_2_count,
              3: release.vote_3_count,
              4: release.vote_4_count,
              5: release.vote_5_count,
              total: release.vote_count,
              user: release.your_vote,
            }"
          />
          <InfoLists
            :completed="release.completed_count"
            :planned="release.plan_count"
            :abandoned="release.dropped_count"
            :delayed="release.hold_on_count"
            :watching="release.watching_count"
          />
          <ReleaseInfoScreenshots v-if="release.screenshot_images?.length" :images="release.screenshot_images" />
          <ReleaseInfoRelated
            v-if="release.related_releases?.length"
            :release-id="release.id"
            :related="release.related"
            :related-releases="release.related_releases"
          />
          <ContinueWatching v-if="userStore.token" />
          <div class="block lg:hidden">
            <CommentsMain
              :release-id="release.id"
              :token="userStore.token"
              :comments="release.comments || []"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { ENDPOINTS } from "@/api/config";
import { useUserStore } from "@/store/auth";
import Spinner from "@/components/Spinner.vue";
import ReleaseInfoBasics from "@/components/ReleaseInfo/ReleaseInfoBasics.vue";
import ReleaseInfoInfo from "@/components/ReleaseInfo/ReleaseInfoInfo.vue";
import ReleaseInfoUserList from "@/components/ReleaseInfo/ReleaseInfoUserList.vue";
import ReleaseInfoRating from "@/components/ReleaseInfo/ReleaseInfoRating.vue";
import ReleaseInfoRelated from "@/components/ReleaseInfo/ReleaseInfoRelated.vue";
import ReleaseInfoScreenshots from "@/components/ReleaseInfo/ReleaseInfoScreenshots.vue";
import ReleasePlayer from "@/components/ReleasePlayer.vue";
import InfoLists from "@/components/InfoLists.vue";
import ContinueWatching from "@/components/ContinueWatching.vue";
import CommentsMain from "@/components/Comments/CommentsMain.vue";

const route = useRoute();
const userStore = useUserStore();

const release = ref<any | null>(null);
const isLoading = ref(true);
const error = ref(false);
const userList = ref(0);
const userFavorite = ref(false);

const showPlayer = computed(() => {
  if (!release.value?.status) return false;
  return release.value.status.name.toLowerCase() !== "анонс";
});

async function fetchRelease() {
  const id = route.params.id;
  if (!id) return;
  isLoading.value = true;
  error.value = false;

  let url = `${ENDPOINTS.release.info}/${id}`;
  if (userStore.token) {
    url += `?token=${userStore.token}`;
  }
  const res = await fetch(url);
  if (!res.ok) {
    error.value = true;
    isLoading.value = false;
    return;
  }
  const data = await res.json();
  if (!data?.release) {
    error.value = true;
    isLoading.value = false;
    return;
  }
  release.value = data.release;
  userList.value = data.release.profile_list_status || 0;
  userFavorite.value = data.release.is_favorite || false;
  document.title = `Xart | ${data.release.title_ru || data.release.title_original || "Релиз"}`;
  isLoading.value = false;
}

onMounted(fetchRelease);
watch(
  () => [route.params.id, userStore.token],
  () => {
    fetchRelease();
  }
);
</script>
