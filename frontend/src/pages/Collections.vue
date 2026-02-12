<template>
  <div v-if="isLoading" class="flex min-h-screen items-center justify-center">
    <Spinner />
  </div>
  <div v-else>
    <form class="mx-4 mb-4" @submit.prevent="searchCollections">
      <div class="relative">
        <span class="iconify mdi--magnify absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"></span>
        <input
          v-model="searchVal"
          type="search"
          class="input-dark w-full rounded-lg p-4 ps-10 text-sm"
          placeholder="Поиск коллекций..."
          required
        />
        <button
          type="submit"
          class="btn-accent absolute bottom-2.5 right-2.5 rounded-lg px-4 py-2 text-sm"
        >
          Поиск
        </button>
      </div>
    </form>

    <CollectionSection
      v-if="userCollections.length"
      title="Мои коллекции"
      :content="userCollections"
      :show-all-link="userStore.user ? `/profile/${userStore.user.id}/collections` : undefined"
      :is-my-collections="true"
    />
    <CollectionSection
      v-if="favoriteCollections.length"
      title="Избранные коллекции"
      :content="favoriteCollections"
      show-all-link="/collections/favorites"
    />
    <div v-if="!userCollections.length && !favoriteCollections.length" class="card-surface flex flex-col items-center justify-center gap-4 rounded-xl p-8 text-center">
      <span class="iconify twemoji--open-book h-16 w-16"></span>
      <p>Коллекций пока нет.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { ENDPOINTS } from "@/api/config";
import { useUserStore } from "@/store/auth";
import CollectionSection from "@/components/CollectionSection.vue";
import Spinner from "@/components/Spinner.vue";

const userStore = useUserStore();
const router = useRouter();

const isLoading = ref(true);
const userCollections = ref<any[]>([]);
const favoriteCollections = ref<any[]>([]);
const searchVal = ref("");

async function fetchCollections() {
  if (!userStore.token || !userStore.user) return;
  isLoading.value = true;
  const [userRes, favRes] = await Promise.all([
    fetch(`${ENDPOINTS.collection.userCollections}/${userStore.user.id}/0?token=${userStore.token}`),
    fetch(`${ENDPOINTS.collection.favoriteCollections}/all/0?token=${userStore.token}`),
  ]);
  if (userRes.ok) {
    const data = await userRes.json();
    userCollections.value = data?.content || [];
  }
  if (favRes.ok) {
    const data = await favRes.json();
    favoriteCollections.value = data?.content || [];
  }
  isLoading.value = false;
}

function searchCollections() {
  const params = encodeURIComponent(
    JSON.stringify({ where: "collections_fav", searchBy: 0 })
  );
  router.push(`/search?query=${encodeURIComponent(searchVal.value)}&params=${params}`);
}

onMounted(() => {
  if (userStore.state === "finished" && !userStore.token) {
    router.push("/login?redirect=/collections");
    return;
  }
  fetchCollections();
});

watch(
  () => userStore.state,
  () => {
    if (userStore.state === "finished" && !userStore.token) {
      router.push("/login?redirect=/collections");
    }
  }
);
</script>
