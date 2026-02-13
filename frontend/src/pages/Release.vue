<template>
  <div v-if="isLoading" class="flex min-h-screen items-center justify-center">
    <Spinner />
  </div>
  <div v-else-if="error" class="flex min-h-screen items-center justify-center">
    <div class="flex flex-col gap-2">
      <h1 class="text-2xl font-bold">{{ ui.errorTitle }}</h1>
      <p class="text-lg">{{ ui.errorText }}</p>
    </div>
  </div>
  <div v-else-if="release" :key="String(route.params.id)" class="release-page">
    <div class="flex flex-col gap-4 pb-8">
      <section class="rounded-2xl border p-3 lg:p-4" :class="heroSectionClass">
        <div class="grid grid-cols-1 gap-4 xl:grid-cols-[1.55fr_0.85fr]">
          <div class="flex flex-col gap-4">
            <ReleaseInfoBasics
              embedded
              :release-id="release.id"
              :image="release.image"
              :title="{ ru: release.title_ru, original: release.title_original }"
              :description="release.description"
              :note="release.note"
              :episodes-released="release.episodes_released"
              :episodes-total="release.episodes_total"
              :status="release.status ? release.status.name : ui.announce"
              :genres="release.genres"
              :show-player-button="showPlayer"
              @open-player="scrollToPlayer"
            />
            <ReleaseInfoInfo
              embedded
              :country="release.country"
              :aired-on-date="release.aired_on_date"
              :year="release.year ? Number(release.year) : null"
              :episodes="{ total: release.episodes_total, released: release.episodes_released }"
              :season="release.season"
              :status="release.status ? release.status.name : ui.announce"
              :duration="release.duration"
              :category="release.category?.name || ''"
              :broadcast="release.broadcast"
              :studio="release.studio"
              :author="release.author"
              :director="release.director"
              :genres="release.genres"
            />
          </div>

          <aside class="flex flex-col gap-3">
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
          </aside>
        </div>
      </section>

      <div class="grid grid-cols-1 gap-4 xl:grid-cols-[1.55fr_0.85fr]">
        <div class="flex flex-col gap-2">
          <div id="release-player-section" ref="playerSectionRef" class="scroll-mt-24">
            <ReleasePlayer v-if="showPlayer" :id="release.id" />
          </div>
          <div class="hidden lg:block">
            <CommentsMain
              :release-id="release.id"
              :token="userStore.token"
              :comments="release.comments || []"
            />
          </div>
        </div>
        <div class="flex flex-col gap-2">
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
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { ENDPOINTS } from "@/api/config";
import { useUserStore } from "@/store/auth";
import { usePreferencesStore } from "@/store/preferences";
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
const preferencesStore = usePreferencesStore();

const ui = {
  errorTitle: "\u041e\u0448\u0438\u0431\u043a\u0430",
  errorText:
    "\u041f\u0440\u043e\u0438\u0437\u043e\u0448\u043b\u0430 \u043e\u0448\u0438\u0431\u043a\u0430 \u043f\u0440\u0438 \u0437\u0430\u0433\u0440\u0443\u0437\u043a\u0435 \u0442\u0430\u0439\u0442\u043b\u0430. \u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u043e\u0431\u043d\u043e\u0432\u0438\u0442\u044c \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0443.",
  announce: "\u0410\u043d\u043e\u043d\u0441",
  defaultTitle: "\u0420\u0435\u043b\u0438\u0437",
};
const announceRu = "\u0430\u043d\u043e\u043d\u0441";

const release = ref<any | null>(null);
const isLoading = ref(true);
const error = ref(false);
const userList = ref(0);
const userFavorite = ref(false);
const playerSectionRef = ref<HTMLElement | null>(null);

const showPlayer = computed(() => {
  const statusName = String(release.value?.status?.name || "").toLowerCase();
  if (!statusName) return false;
  return !statusName.includes(announceRu) && !statusName.includes("announce");
});
const heroSectionClass = computed(() =>
  preferencesStore.flags.theme === "dark"
    ? "border-white/10 bg-[radial-gradient(900px_380px_at_0%_0%,rgba(224,69,69,0.14),transparent_62%),#1f2123]"
    : "border-black/10 bg-[radial-gradient(900px_380px_at_0%_0%,rgba(224,69,69,0.12),transparent_62%),#ffffff]"
);

function scrollToPlayer() {
  if (!showPlayer.value) return;
  playerSectionRef.value?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

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
  document.title = `Xart | ${data.release.title_ru || data.release.title_original || ui.defaultTitle}`;
  isLoading.value = false;
}

onMounted(() => {
  document.body.classList.add("release-route");
  fetchRelease();
});

onBeforeUnmount(() => {
  document.body.classList.remove("release-route");
});
watch(
  () => [route.params.id, userStore.token],
  () => {
    fetchRelease();
  }
);
</script>
