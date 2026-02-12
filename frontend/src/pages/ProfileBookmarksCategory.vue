<template>
  <div class="bookmarks-shell">
    <h1 class="bookmarks-title">&#1052;&#1086;&#1080; &#1089;&#1087;&#1080;&#1089;&#1082;&#1080;</h1>

    <div class="bookmarks-filters">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="bookmark-filter"
        :class="activeTab === tab.id ? 'bookmark-filter--active' : ''"
        @click="navigateToTab(tab.id)"
      >
        <span>{{ tab.label }}</span>
        <span>{{ tab.count }}</span>
      </button>
    </div>

    <div v-if="isLoading && !content.length" class="flex min-h-[50vh] items-center justify-center">
      <Spinner />
    </div>

    <div v-else-if="content.length">
      <ReleaseSection :title="title" :content="content" />
      <div ref="sentinelRef" class="h-10"></div>
      <div v-if="isLoadingMore" class="flex justify-center pb-4">
        <Spinner size="sm" />
      </div>
    </div>

    <p v-else class="bookmark-empty-hint">
      &#1042;&#1099; &#1077;&#1097;&#1077; &#1085;&#1080;&#1095;&#1077;&#1075;&#1086; &#1085;&#1077; &#1076;&#1086;&#1073;&#1072;&#1074;&#1080;&#1083;&#1080;
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ENDPOINTS } from "@/api/config";
import { BookmarksList } from "@/api/utils";
import { useUserStore } from "@/store/auth";
import ReleaseSection from "@/components/ReleaseSection.vue";
import Spinner from "@/components/Spinner.vue";

type BookmarkTab = keyof typeof BookmarksList | "favorite";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const tabOrder: BookmarkTab[] = ["favorite", "watching", "planned", "watched", "delayed", "abandoned"];
const tabLabels: Record<BookmarkTab, string> = {
  favorite: "\u0418\u0437\u0431\u0440\u0430\u043D\u043D\u044B\u0435",
  watching: "\u0421\u043C\u043E\u0442\u0440\u044E",
  planned: "\u0417\u0430\u043F\u043B\u0430\u043D\u0438\u0440\u043E\u0432\u0430\u043D\u043E",
  watched: "\u041F\u0440\u043E\u0441\u043C\u043E\u0442\u0440\u0435\u043D\u043E",
  delayed: "\u041E\u0442\u043B\u043E\u0436\u0435\u043D\u043E",
  abandoned: "\u0411\u0440\u043E\u0448\u0435\u043D\u043E",
};

const profileId = computed(() => Number(route.params.id));
const content = ref<any[]>([]);
const page = ref(0);
const hasMore = ref(true);
const isLoading = ref(true);
const isLoadingMore = ref(false);
const sentinelRef = ref<HTMLElement | null>(null);
const counts = ref<Record<BookmarkTab, number>>({
  favorite: 0,
  watching: 0,
  planned: 0,
  watched: 0,
  delayed: 0,
  abandoned: 0,
});

let observer: IntersectionObserver | null = null;
let loadToken = 0;

const activeTab = computed<BookmarkTab>(() => {
  const slug = route.params.slug;
  if (typeof slug !== "string") return "favorite";
  return tabOrder.includes(slug as BookmarkTab) ? (slug as BookmarkTab) : "favorite";
});

const title = computed(() => tabLabels[activeTab.value]);

const tabs = computed(() => {
  return tabOrder.map((tab) => ({
    id: tab,
    label: tabLabels[tab],
    count: counts.value[tab],
  }));
});

function getSlugOrNull(): BookmarkTab | null {
  const slug = route.params.slug;
  if (typeof slug !== "string") return null;
  return tabOrder.includes(slug as BookmarkTab) ? (slug as BookmarkTab) : null;
}

function buildUrl(tab: BookmarkTab, pageValue: number) {
  if (!profileId.value) return null;

  const listKey = tab === "favorite" ? "favorite" : BookmarksList[tab];
  let url = `${ENDPOINTS.user.bookmark}/all/${profileId.value}/${listKey}/${pageValue}?sort=1`;
  if (userStore.token) {
    url += `&token=${userStore.token}`;
  }
  return url;
}

async function requestJson(url: string) {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function fetchTabCount(tab: BookmarkTab) {
  const url = buildUrl(tab, 0);
  if (!url) return 0;
  const data = await requestJson(url);
  return (data?.content || []).length;
}

async function fetchCounts() {
  const entries = await Promise.all(
    tabOrder.map(async (tab) => {
      const count = await fetchTabCount(tab);
      return [tab, count] as const;
    })
  );
  counts.value = Object.fromEntries(entries) as Record<BookmarkTab, number>;
}

async function fetchPage(reset = false) {
  const url = buildUrl(activeTab.value, reset ? 0 : page.value);
  if (!url) {
    isLoading.value = false;
    isLoadingMore.value = false;
    return;
  }

  if (reset) {
    page.value = 0;
    content.value = [];
    hasMore.value = true;
  }
  if (!hasMore.value) return;

  isLoading.value = reset;
  isLoadingMore.value = !reset;

  try {
    const data = await requestJson(url);
    if (!data) {
      hasMore.value = false;
      return;
    }

    const items = data?.content || [];
    if (items.length === 0) {
      hasMore.value = false;
      return;
    }

    content.value = [...content.value, ...items];
    page.value += 1;
  } finally {
    isLoading.value = false;
    isLoadingMore.value = false;
  }
}

function navigateToTab(tab: BookmarkTab) {
  if (tab === activeTab.value || !profileId.value) return;
  router.push(`/profile/${profileId.value}/bookmarks/${tab}`);
}

function setupObserver() {
  if (observer) observer.disconnect();
  observer = new IntersectionObserver((entries) => {
    const entry = entries[0];
    if (!entry?.isIntersecting) return;
    if (isLoading.value || isLoadingMore.value || !hasMore.value) return;
    fetchPage();
  });

  if (sentinelRef.value) {
    observer.observe(sentinelRef.value);
  }
}

async function loadCategoryPage() {
  const currentLoadToken = ++loadToken;
  await Promise.all([fetchCounts(), fetchPage(true)]);
  if (currentLoadToken !== loadToken) return;

  await nextTick();
  setupObserver();
}

watch(
  [
    () => route.params.id,
    () => route.params.slug,
    () => userStore.token,
  ],
  async () => {
    if (!profileId.value) {
      isLoading.value = false;
      return;
    }

    if (!getSlugOrNull()) {
      router.replace(`/profile/${profileId.value}/bookmarks/favorite`);
      return;
    }

    await loadCategoryPage();
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  if (observer) observer.disconnect();
});
</script>
