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

    <form class="mx-4 mb-4 mt-6" @submit.prevent>
      <div class="relative">
        <span class="iconify mdi--magnify absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"></span>
        <input
          v-model="searchVal"
          type="search"
          class="input-dark w-full rounded-lg p-4 ps-10 text-sm"
          :placeholder="'\u041F\u043E\u0438\u0441\u043A \u0430\u043D\u0438\u043C\u0435...'"
        />
      </div>
    </form>

    <div class="mx-4 mb-4 flex flex-wrap items-center justify-end gap-2 border-b border-white/10 px-0 py-2">
      <button
        class="btn-outline rounded-lg px-3 py-2 text-sm"
        :disabled="isPickingRandom || !hasRandomSource"
        @click="pickRandomRelease"
      >
        <span v-if="!isPickingRandom">&#1057;&#1083;&#1091;&#1095;&#1072;&#1081;&#1085;&#1099;&#1081; &#1090;&#1072;&#1081;&#1090;&#1083;</span>
        <span v-else>&#1048;&#1097;&#1091;...</span>
      </button>

      <select
        class="input-dark rounded-lg px-3 py-2 text-sm"
        :value="selectedSort"
        @change="onSortChange"
      >
        <option v-for="(item, index) in sort.values" :key="item.id" :value="index">
          {{ item.name }}
        </option>
      </select>
    </div>

    <div v-if="isPrimaryLoading && !displayedContent.length" class="flex min-h-[50vh] items-center justify-center">
      <Spinner />
    </div>

    <div v-else-if="displayedContent.length">
      <div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        <ReleaseCard v-for="item in displayedContent" :key="item.id" :release="item" />
      </div>

      <button
        v-if="showLoadMoreButton"
        class="btn-outline mt-4 w-full rounded-lg px-4 py-2 text-sm"
        :disabled="isLoadMoreBusy"
        @click="loadMore"
      >
        <span v-if="!isLoadMoreBusy">&#1047;&#1072;&#1075;&#1088;&#1091;&#1079;&#1080;&#1090;&#1100; &#1077;&#1097;&#1077;</span>
        <span v-else>&#1047;&#1072;&#1075;&#1088;&#1091;&#1078;&#1072;&#1102;...</span>
      </button>

      <template v-else-if="showObserver">
        <div ref="sentinelRef" class="h-10"></div>
        <div v-if="isLoadingMore" class="flex justify-center pb-4">
          <Spinner size="sm" />
        </div>
      </template>
    </div>

    <div
      v-else-if="isSearchMode"
      class="card-surface mt-6 flex flex-col items-center justify-center gap-4 rounded-xl p-6 text-center"
    >
      <span class="iconify twemoji--magnifying-glass-tilted-left h-12 w-12"></span>
      <p>&#1055;&#1086; &#1079;&#1072;&#1087;&#1088;&#1086;&#1089;&#1091; &#1085;&#1080;&#1095;&#1077;&#1075;&#1086; &#1085;&#1077; &#1085;&#1072;&#1081;&#1076;&#1077;&#1085;&#1086;.</p>
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
import { sort } from "@/constants/sort";
import ReleaseCard from "@/components/ReleaseCard.vue";
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

const content = ref<any[]>([]);
const page = ref(0);
const hasMore = ref(true);
const isLoading = ref(true);
const isLoadingMore = ref(false);

const searchContent = ref<any[]>([]);
const searchPage = ref(0);
const searchHasMore = ref(false);
const isSearchLoading = ref(false);

const sentinelRef = ref<HTMLElement | null>(null);
const selectedSort = ref(0);
const searchVal = ref("");
const counts = ref<Record<BookmarkTab, number>>({
  favorite: 0,
  watching: 0,
  planned: 0,
  watched: 0,
  delayed: 0,
  abandoned: 0,
});

const isPickingRandom = ref(false);

let observer: IntersectionObserver | null = null;
let loadToken = 0;
let searchDebounceTimer: number | undefined;

const myProfileId = computed(() => Number(userStore.user?.id || 0));
const isReadyToLoad = computed(
  () => userStore.state === "finished" && !!userStore.token && !!myProfileId.value
);

const activeTab = computed<BookmarkTab>(() => {
  const slug = route.params.slug;
  if (typeof slug !== "string") return "favorite";
  return tabOrder.includes(slug as BookmarkTab) ? (slug as BookmarkTab) : "favorite";
});

const tabs = computed(() => {
  return tabOrder.map((tab) => ({
    id: tab,
    label: tabLabels[tab],
    count: counts.value[tab],
  }));
});

const isSearchMode = computed(() => searchVal.value.trim().length > 0);
const displayedContent = computed(() => (isSearchMode.value ? searchContent.value : content.value));
const isPrimaryLoading = computed(() => (isSearchMode.value ? isSearchLoading.value : isLoading.value));
const showObserver = computed(
  () => !isSearchMode.value && activeTab.value !== "favorite" && hasMore.value
);
const showLoadMoreButton = computed(
  () => (isSearchMode.value ? searchHasMore.value : activeTab.value === "favorite" && hasMore.value)
);
const isLoadMoreBusy = computed(
  () => (isSearchMode.value ? isSearchLoading.value : activeTab.value === "favorite" ? isLoading.value : isLoadingMore.value)
);
const hasRandomSource = computed(
  () => (counts.value[activeTab.value] || 0) > 0 || displayedContent.value.length > 0
);

function getSlugOrNull(): BookmarkTab | null {
  const slug = route.params.slug;
  if (typeof slug !== "string") return null;
  return tabOrder.includes(slug as BookmarkTab) ? (slug as BookmarkTab) : null;
}

function buildListUrl(tab: BookmarkTab, pageValue: number) {
  if (!isReadyToLoad.value || !userStore.token) return null;

  const sortOption = sort.values[selectedSort.value] ?? sort.values[0]!;

  if (tab === "favorite") {
    return `${ENDPOINTS.user.favorite}/all/${pageValue}?token=${userStore.token}&sort=${sortOption.id}`;
  }

  return `${ENDPOINTS.user.bookmark}/all/${myProfileId.value}/${BookmarksList[tab]}/${pageValue}?sort=${sortOption.id}&token=${userStore.token}`;
}

function buildSearchUrl(tab: BookmarkTab, pageValue: number) {
  if (!isReadyToLoad.value || !userStore.token) return null;

  if (tab === "favorite") {
    return `${ENDPOINTS.search.profileFavorites}/${pageValue}?token=${userStore.token}`;
  }

  return `${ENDPOINTS.search.profileList}/${BookmarksList[tab]}/${pageValue}?token=${userStore.token}`;
}

async function requestJson(url: string, options?: RequestInit) {
  try {
    const res = await fetch(url, options);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function fetchTabCount(tab: BookmarkTab) {
  const url = buildListUrl(tab, 0);
  if (!url) return 0;
  const data = await requestJson(url);
  if (typeof data?.total_count === "number") return data.total_count;
  if (typeof data?.count === "number") return data.count;
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
  const url = buildListUrl(activeTab.value, reset ? 0 : page.value);
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

function resetSearchState() {
  searchPage.value = 0;
  searchHasMore.value = false;
  searchContent.value = [];
  isSearchLoading.value = false;
}

async function fetchSearchPage(reset = false) {
  const query = searchVal.value.trim();
  if (!query || !isReadyToLoad.value || !userStore.token) {
    resetSearchState();
    return;
  }

  const url = buildSearchUrl(activeTab.value, reset ? 0 : searchPage.value);
  if (!url) return;

  if (reset) {
    searchPage.value = 0;
    searchContent.value = [];
    searchHasMore.value = true;
  }
  if (!searchHasMore.value) return;

  isSearchLoading.value = true;

  const searchByValue = activeTab.value === "favorite" ? 0 : BookmarksList[activeTab.value];
  const data = await requestJson(url, {
    method: "POST",
    headers: {
      "Api-Version": "v2",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      searchBy: searchByValue,
    }),
  });

  if (!data) {
    searchHasMore.value = false;
    isSearchLoading.value = false;
    return;
  }

  const items = data?.content || [];
  if (items.length === 0) {
    searchHasMore.value = false;
  } else {
    searchContent.value = [...searchContent.value, ...items];
    searchPage.value += 1;
  }

  isSearchLoading.value = false;
}

function navigateToTab(tab: BookmarkTab) {
  if (tab === activeTab.value) return;
  router.push(`/bookmarks/${tab}`);
}

function setupObserver() {
  if (observer) observer.disconnect();
  if (!showObserver.value) return;

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

  if (!isReadyToLoad.value) {
    isLoading.value = userStore.state !== "finished";
    return;
  }

  await Promise.all([fetchCounts(), fetchPage(true)]);
  if (currentLoadToken !== loadToken) return;

  await nextTick();
  setupObserver();
}

async function fetchAllTabItems(tab: BookmarkTab) {
  const allItems: any[] = [];
  const expectedPages = Math.max(1, Math.ceil((counts.value[tab] || 0) / 25));
  const maxPages = Math.min(Math.max(expectedPages + 2, 5), 120);

  for (let pageIndex = 0; pageIndex < maxPages; pageIndex += 1) {
    const url = buildListUrl(tab, pageIndex);
    if (!url) break;
    const data = await requestJson(url);
    const items = data?.content || [];
    if (!items.length) break;
    allItems.push(...items);
  }

  return allItems;
}

async function pickRandomRelease() {
  if (isPickingRandom.value || !isReadyToLoad.value) return;
  isPickingRandom.value = true;

  try {
    const allItems = await fetchAllTabItems(activeTab.value);
    const pool = allItems.length ? allItems : displayedContent.value;
    if (!pool.length) return;

    const randomItem = pool[Math.floor(Math.random() * pool.length)];
    if (randomItem?.id) {
      router.push(`/release/${randomItem.id}`);
    }
  } finally {
    isPickingRandom.value = false;
  }
}

function loadMore() {
  if (isSearchMode.value) {
    fetchSearchPage();
    return;
  }
  fetchPage();
}

function onSortChange(event: Event) {
  selectedSort.value = Number((event.target as HTMLSelectElement).value);
  loadCategoryPage();
}

watch(
  [
    () => route.params.slug,
    () => userStore.state,
    () => userStore.token,
    () => userStore.user?.id,
  ],
  async () => {
    if (userStore.state !== "finished") {
      isLoading.value = true;
      return;
    }

    if (!userStore.token || !myProfileId.value) {
      router.replace("/login?redirect=/bookmarks/favorite");
      return;
    }

    if (!getSlugOrNull()) {
      router.replace("/bookmarks/favorite");
      return;
    }

    await loadCategoryPage();

    if (isSearchMode.value) {
      await fetchSearchPage(true);
    }
  },
  { immediate: true }
);

watch(
  () => searchVal.value,
  () => {
    if (searchDebounceTimer) {
      window.clearTimeout(searchDebounceTimer);
    }

    if (!isSearchMode.value) {
      resetSearchState();
      return;
    }

    searchDebounceTimer = window.setTimeout(() => {
      fetchSearchPage(true);
    }, 350);
  }
);

onBeforeUnmount(() => {
  if (observer) observer.disconnect();
  if (searchDebounceTimer) {
    window.clearTimeout(searchDebounceTimer);
  }
});
</script>
