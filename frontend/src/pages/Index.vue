<template>
  <div class="space-y-6 pt-5 lg:pt-0">
    <div class="-mx-2 px-2 lg:mx-0 lg:px-0">
      <div ref="tabsScroller" class="flex gap-2 overflow-x-auto pb-1 hide-scrollbar lg:justify-center">
      <button
        v-for="tab in tabs"
        :key="`home-tab-${tab.id}`"
        :ref="(el) => setTabRef(tab.id, el)"
        class="tab-pill inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors"
        :class="activeTab === tab.id ? 'tab-pill-active' : ''"
        @click="setActiveTab(tab.id)"
      >
        <span class="iconify h-4 w-4" :class="tab.icon"></span>
        <span>{{ tab.title }}</span>
      </button>
      </div>
    </div>

    <div v-if="activeState.error" class="alert-error rounded-md p-4 text-sm">
      Произошла ошибка загрузки. Повторите попытку позже.
    </div>

    <div
      v-if="activeState.items.length"
      class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
    >
      <ReleaseCard
        v-for="item in activeState.items"
        :key="`${activeTab}-${item.id}`"
        :release="item"
      />
    </div>

    <div v-else-if="!activeState.isLoading && !activeState.hasMore" class="card-surface rounded-xl p-6 text-center">
      <p>В выбранной вкладке пока нет релизов.</p>
    </div>

    <div v-if="activeState.isLoading" class="flex items-center justify-center py-10">
      <Spinner size="lg" />
    </div>

    <div ref="sentinel" class="h-6"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import type { ComponentPublicInstance } from "vue";
import { FetchFilter } from "@/api/utils";
import { ListAnnounce, ListFilms, ListFinished, ListLast, ListOngoing } from "@/api/index-filters";
import { usePreferencesStore } from "@/store/preferences";
import { useUserStore } from "@/store/auth";
import ReleaseCard from "@/components/ReleaseCard.vue";
import Spinner from "@/components/Spinner.vue";

type HomeTabId = "last" | "finished" | "ongoing" | "announce" | "films";

type TabConfig = {
  id: HomeTabId;
  title: string;
  icon: string;
  filter: any;
};

type TabState = {
  items: any[];
  page: number;
  hasMore: boolean;
  isLoading: boolean;
  error: boolean;
  requestId: number;
};

const tabs: TabConfig[] = [
  { id: "last", title: "Последние релизы", icon: "mdi--clock-outline", filter: ListLast.filter },
  { id: "finished", title: "Завершенные релизы", icon: "mdi--check-circle-outline", filter: ListFinished.filter },
  { id: "ongoing", title: "Выходит", icon: "mdi--progress-clock", filter: ListOngoing.filter },
  { id: "announce", title: "Анонсированные релизы", icon: "mdi--bullhorn-outline", filter: ListAnnounce.filter },
  { id: "films", title: "Фильмы", icon: "mdi--movie-open-outline", filter: ListFilms.filter },
];

const tabById = tabs.reduce(
  (acc, tab) => {
    acc[tab.id] = tab;
    return acc;
  },
  {} as Record<HomeTabId, TabConfig>
);

const preferences = usePreferencesStore();
const userStore = useUserStore();

const activeTab = ref<HomeTabId>("last");
const sentinel = ref<HTMLElement | null>(null);
const tabsScroller = ref<HTMLElement | null>(null);
const tabRefs = reactive<Record<HomeTabId, HTMLElement | null>>({
  last: null,
  finished: null,
  ongoing: null,
  announce: null,
  films: null,
});

const createState = (): TabState => ({
  items: [],
  page: 0,
  hasMore: true,
  isLoading: false,
  error: false,
  requestId: 0,
});

const tabStates = reactive<Record<HomeTabId, TabState>>({
  last: createState(),
  finished: createState(),
  ongoing: createState(),
  announce: createState(),
  films: createState(),
});

const activeState = computed(() => tabStates[activeTab.value]);

let observer: IntersectionObserver | null = null;
let scrollTimer: number | undefined;

function isHomeTabId(value: string): value is HomeTabId {
  return tabs.some((tab) => tab.id === value);
}

function resetState(state: TabState) {
  state.items = [];
  state.page = 0;
  state.hasMore = true;
  state.isLoading = false;
  state.error = false;
  state.requestId += 1;
}

function resetAllTabs() {
  tabs.forEach((tab) => {
    resetState(tabStates[tab.id]);
  });
}

async function loadTabPage(tabId: HomeTabId, reset = false) {
  const state = tabStates[tabId];
  if (state.isLoading) return;

  if (reset) {
    resetState(state);
  }

  if (!state.hasMore) return;

  state.isLoading = true;
  state.error = false;
  const requestId = ++state.requestId;
  const [data, error] = await FetchFilter(tabById[tabId].filter, state.page, userStore.token);

  if (requestId !== state.requestId) {
    return;
  }

  if (error) {
    state.error = true;
    state.isLoading = false;
    return;
  }

  const items = data?.content || [];
  if (items.length === 0) {
    state.hasMore = false;
    state.isLoading = false;
    return;
  }

  state.items = [...state.items, ...items];
  state.page += 1;
  state.isLoading = false;
}

function ensureActiveTabLoaded() {
  const state = activeState.value;
  if (state.items.length || state.isLoading || !state.hasMore) return;
  void loadTabPage(activeTab.value);
}

function loadNextPageIfNeeded() {
  const state = activeState.value;
  if (state.isLoading || !state.hasMore) return;
  void loadTabPage(activeTab.value);
}

function setActiveTab(tabId: HomeTabId) {
  if (activeTab.value === tabId) return;
  activeTab.value = tabId;
}

function setTabRef(tabId: HomeTabId, element: Element | ComponentPublicInstance | null) {
  if (!element) {
    tabRefs[tabId] = null;
    return;
  }
  const node = element instanceof Element ? element : (element.$el as Element | undefined);
  tabRefs[tabId] = node instanceof HTMLElement ? node : null;
}

function scrollActiveTabIntoView(behavior: ScrollBehavior = "smooth") {
  if (!tabsScroller.value) return;
  const element = tabRefs[activeTab.value];
  if (!element) return;
  element.scrollIntoView({ behavior, block: "nearest", inline: "center" });
}

function handleScroll() {
  if (scrollTimer) {
    window.clearTimeout(scrollTimer);
  }

  scrollTimer = window.setTimeout(() => {
    const doc = document.documentElement;
    if (!doc.scrollHeight) return;
    const ratio = (window.scrollY + window.innerHeight) / doc.scrollHeight;
    if (ratio >= 0.9) {
      loadNextPageIfNeeded();
    }
  }, 100);
}

watch(activeTab, () => {
  ensureActiveTabLoaded();
  void nextTick(() => {
    scrollActiveTabIntoView("smooth");
  });
});

watch(
  () => userStore.token,
  () => {
    resetAllTabs();
    ensureActiveTabLoaded();
  }
);

onMounted(() => {
  if (preferences.params.skipToCategory.enabled) {
    const preferredCategory = preferences.params.skipToCategory.homeCategory;
    if (isHomeTabId(preferredCategory)) {
      activeTab.value = preferredCategory;
    }
  }

  ensureActiveTabLoaded();
  void nextTick(() => {
    scrollActiveTabIntoView("auto");
  });

  if (sentinel.value && "IntersectionObserver" in window) {
    observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadNextPageIfNeeded();
        }
      },
      { rootMargin: "300px 0px 300px 0px" }
    );
    observer.observe(sentinel.value);
  }

  window.addEventListener("scroll", handleScroll, { passive: true });
});

onUnmounted(() => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  window.removeEventListener("scroll", handleScroll);
  if (scrollTimer) {
    window.clearTimeout(scrollTimer);
  }
});
</script>
