<template>
  <div v-if="isLoading" class="flex min-h-screen items-center justify-center">
    <Spinner />
  </div>
  <div v-else-if="error" class="flex min-h-screen items-center justify-center">
    <div class="flex flex-col gap-2">
      <h1 class="section-title text-2xl">Ошибка</h1>
      <p class="text-lg">Произошла ошибка при загрузке коллекции.</p>
    </div>
  </div>
  <div v-else-if="collection">
    <div class="flex flex-col gap-2 px-2 pb-2 sm:flex-row">
      <CollectionInfoBasics
        :image="collection.image"
        :title="collection.title"
        :description="collection.description"
        :author-avatar="collection.creator.avatar"
        :author-login="collection.creator.login"
        :author-id="collection.creator.id"
        :creation-date="collection.creation_date"
        :update-date="collection.last_update_date"
      />
      <div class="flex w-full flex-col gap-2 lg:max-w-[48%]">
        <CommentsMain
          :release-id="collection.id"
          :token="userStore.token"
          :comments="collectionComments.slice(0, 2)"
          type="collection"
        />
        <InfoLists
          v-if="userStore.token"
          :completed="collectionInfo.completed_count"
          :planned="collectionInfo.plan_count"
          :abandoned="collectionInfo.dropped_count"
          :delayed="collectionInfo.hold_on_count"
          :watching="collectionInfo.watching_count"
          :total="totalCount"
        />
        <CollectionInfoControls
          v-if="userStore.token && collection"
          :is-favorite="collection.is_favorite"
          :id="collection.id"
          :author-id="collection.creator.id"
          :is-private="collection.is_private"
        />
      </div>
    </div>
    <ReleaseSection
      v-if="releases.length"
      :title="`Релизов в коллекции: ${totalCount}`"
      :content="releases"
    />
    <button
      v-if="hasMore"
      class="btn-outline mt-4 w-full rounded-lg px-4 py-2 text-sm"
      @click="loadMore"
    >
      Загрузить ещё
    </button>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { ENDPOINTS } from "@/api/config";
import { useUserStore } from "@/store/auth";
import Spinner from "@/components/Spinner.vue";
import ReleaseSection from "@/components/ReleaseSection.vue";
import CollectionInfoBasics from "@/components/CollectionInfoBasics.vue";
import CollectionInfoControls from "@/components/CollectionInfoControls.vue";
import CommentsMain from "@/components/Comments/CommentsMain.vue";
import InfoLists from "@/components/InfoLists.vue";

const route = useRoute();
const userStore = useUserStore();

const isLoading = ref(true);
const error = ref(false);
const collection = ref<any | null>(null);
const collectionInfo = ref<any | null>(null);
const collectionComments = ref<any[]>([]);
const releases = ref<any[]>([]);
const page = ref(0);
const hasMore = ref(true);
const totalCount = ref(0);

async function fetchCollection() {
  const id = route.params.id;
  if (!id) return;
  isLoading.value = true;
  error.value = false;

  let infoUrl = `${ENDPOINTS.collection.base}/${id}`;
  let commentsUrl = `${ENDPOINTS.collection.base}/comment/all/${id}/0?sort=3`;
  if (userStore.token) {
    infoUrl += `?token=${userStore.token}`;
    commentsUrl += `&token=${userStore.token}`;
  }

  const [infoRes, commentsRes] = await Promise.all([fetch(infoUrl), fetch(commentsUrl)]);
  if (!infoRes.ok) {
    error.value = true;
    isLoading.value = false;
    return;
  }
  const infoData = await infoRes.json();
  collection.value = infoData.collection;
  collectionInfo.value = infoData;
  if (infoData.collection?.title) {
    document.title = `Xart | ${infoData.collection.title}`;
  }

  if (commentsRes.ok) {
    const commentsData = await commentsRes.json();
    collectionComments.value = commentsData?.content || [];
  }

  await fetchReleases(true);
  isLoading.value = false;
}

async function fetchReleases(reset = false) {
  if (reset) {
    page.value = 0;
    releases.value = [];
    hasMore.value = true;
  }
  if (!hasMore.value) return;

  let url = `${ENDPOINTS.collection.base}/${route.params.id}/releases/${page.value}`;
  if (userStore.token) {
    url += `?token=${userStore.token}`;
  }
  const res = await fetch(url);
  if (!res.ok) {
    hasMore.value = false;
    return;
  }
  const data = await res.json();
  const items = data?.content || [];
  totalCount.value = data?.total_count || totalCount.value;
  if (items.length === 0) {
    hasMore.value = false;
  } else {
    releases.value = [...releases.value, ...items];
    page.value += 1;
  }
}

function loadMore() {
  fetchReleases();
}

onMounted(fetchCollection);
watch(
  () => [route.params.id, userStore.token],
  () => {
    fetchCollection();
  }
);
</script>
