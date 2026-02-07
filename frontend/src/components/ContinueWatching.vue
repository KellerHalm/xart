<template>
  <div v-if="shouldShow" class="card-surface rounded-xl p-4">
    <div class="flex justify-between border-b border-white/10 py-2">
      <h2 class="section-title text-lg">Продолжить просмотр</h2>
    </div>
    <div class="mt-2 flex flex-col gap-4">
      <ReleaseLinkList
        v-for="release in releaseData"
        :key="release.id"
        v-bind="release"
        :settings="{ showDescription: false }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { ENDPOINTS } from "@/api/config";
import { BookmarksList } from "@/api/utils";
import ReleaseLinkList from "@/components/ReleaseLinkList.vue";
import { useUserStore } from "@/store/auth";

const userStore = useUserStore();
const releaseData = ref<any[]>([]);
const isLoading = ref(true);

function firstN(arr: any[], n = 1) {
  return arr.slice(0, n);
}

function randomize(array: any[], limit: number) {
  const toRand = array.slice();
  let currentIndex = toRand.length;
  while (currentIndex !== 0) {
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    [toRand[currentIndex], toRand[randomIndex]] = [
      toRand[randomIndex],
      toRand[currentIndex],
    ];
  }
  return firstN(toRand, limit);
}

async function fetchList(listName: keyof typeof BookmarksList) {
  if (!userStore.token) return { content: [] };
  const url = `${ENDPOINTS.user.bookmark}/all/${BookmarksList[listName]}/0?sort=1&token=${userStore.token}`;
  const res = await fetch(url);
  if (!res.ok) return { content: [] };
  return await res.json();
}

onMounted(async () => {
  if (!userStore.isAuth) return;
  const [watching, planned, delayed] = await Promise.all([
    fetchList("watching"),
    fetchList("planned"),
    fetchList("delayed"),
  ]);
  const data = [
    ...(watching.content || []),
    ...(planned.content || []),
    ...(delayed.content || []),
  ];
  releaseData.value = randomize(data, 3);
  isLoading.value = false;
});

const shouldShow = computed(
  () => userStore.isAuth && !isLoading.value && releaseData.value.length > 0
);
</script>
