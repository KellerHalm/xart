<template>
  <div class="space-y-6">
    <div class="sticky top-0 z-30 rounded-lg bg-black/25 px-2 py-2 backdrop-blur-sm">
      <div class="flex flex-col gap-2 lg:flex-row">
        <div class="relative flex-1">
          <div class="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3">
            <span class="iconify mdi--magnify h-4 w-4 text-gray-500 dark:text-gray-400"></span>
          </div>
          <input
            v-model="query"
            type="search"
            class="input-dark block w-full rounded-lg p-4 ps-10 text-sm"
            placeholder="Поиск аниме..."
          />
        </div>
        <div class="flex flex-col gap-2 sm:flex-row">
          <div class="relative">
            <button
              type="button"
              class="btn-outline flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm"
              aria-haspopup="listbox"
              :aria-expanded="whereOpen"
              @click.stop="toggleWhere"
            >
              <span>Искать в: {{ whereLabel }}</span>
              <span class="iconify mdi--chevron-down h-4 w-4"></span>
            </button>
            <div
              v-if="whereOpen"
              class="dropdown-menu absolute z-50 mt-2 w-64 rounded-lg p-2 text-sm shadow-lg"
              @click.stop
            >
              <button
                v-for="item in availableWhereOptions"
                :key="item.id"
                class="dropdown-item w-full rounded-md px-3 py-2 text-left"
                @click="selectWhere(item.id)"
              >
                {{ item.label }}
              </button>
            </div>
          </div>
          <div v-if="searchByList" class="relative">
            <button
              type="button"
              class="btn-outline flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm"
              aria-haspopup="listbox"
              :aria-expanded="searchByOpen"
              @click.stop="toggleSearchBy"
            >
              <span>Искать по: {{ searchByLabel }}</span>
              <span class="iconify mdi--chevron-down h-4 w-4"></span>
            </button>
            <div
              v-if="searchByOpen"
              class="dropdown-menu absolute z-50 mt-2 w-64 rounded-lg p-2 text-sm shadow-lg"
              @click.stop
            >
              <button
                v-for="item in searchByList"
                :key="item.id"
                class="dropdown-item w-full rounded-md px-3 py-2 text-left"
                @click="selectSearchBy(item.id)"
              >
                {{ item.label }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div
      v-if="error"
      class="alert-error rounded-lg p-4 text-sm"
    >
      Произошла ошибка поиска</div>

    <RelatedSection v-if="related && where === 'releases'" v-bind="related" />

    <div v-if="results.length" class="fade-in">
      <UserSection v-if="where === 'profiles'" title="Профили" :content="results" />
      <CollectionsSection
        v-else-if="where === 'collections_all' || where === 'collections_fav'"
        title="Коллекции"
        :content="results"
      />
      <ReleaseSection v-else title="Результаты поиска" :content="results" />
    </div>

    <div
      v-else-if="!isLoading && query"
      class="card-surface flex flex-col items-center justify-center gap-4 rounded-xl p-8 text-center"
    >
      <span class="iconify twemoji--crying-cat h-16 w-16"></span>
      <p>Странно, ничего не найдено. Попробуйте другой запрос.</p>
    </div>

    <div
      v-else-if="!query"
      class="card-surface flex flex-col items-center justify-center gap-4 rounded-xl p-8 text-center"
    >
      <span class="iconify mdi--arrow-up h-12 w-12 animate-bounce"></span>
      <p>Введите запрос, чтобы найти любой тайтл.</p>
    </div>

    <div v-if="isLoading" class="flex items-center justify-center py-6">
      <Spinner size="lg" />
    </div>

    <button
      v-if="hasMore && results.length && !isLoading"
      class="btn-outline w-full rounded-lg px-4 py-2 text-sm"
      @click="loadMore"
    >
      Загрузить ещё</button>
    <div ref="sentinel" class="h-6"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ENDPOINTS } from "@/api/config";
import { tryCatchAPI } from "@/api/utils";
import { useUserStore } from "@/store/auth";
import Spinner from "@/components/Spinner.vue";
import ReleaseSection from "@/components/ReleaseSection.vue";
import UserSection from "@/components/UserSection.vue";
import CollectionsSection from "@/components/CollectionSection.vue";
import RelatedSection from "@/components/RelatedSection.vue";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const query = ref("");
const where = ref("releases");
const searchBy = ref("name");
const whereOpen = ref(false);
const searchByOpen = ref(false);

const results = ref<any[]>([]);
const related = ref<any | null>(null);
const page = ref(0);
const hasMore = ref(true);
const isLoading = ref(false);
const error = ref(false);
const sentinel = ref<HTMLElement | null>(null);

const whereOptions = [
  { id: "releases", label: "Релизах", auth: false },
  { id: "profiles", label: "Профилях", auth: false },
  { id: "list", label: "Списках", auth: true },
  { id: "history", label: "Истории", auth: true },
  { id: "favorites", label: "Избранном", auth: true },
  { id: "collections_all", label: "Всех коллекциях", auth: false },
  { id: "collections_fav", label: "Своих коллекциях", auth: true },
];

const searchByOptions = {
  releases: [
    { id: "name", label: "Названию", value: 0 },
    { id: "studio", label: "Студии", value: 1 },
    { id: "director", label: "Режиссеру", value: 2 },
    { id: "author", label: "Автору", value: 3 },
    { id: "tag", label: "Тегу", value: 4 },
  ],
  list: [
    { id: "watching", label: "Смотрю", value: 1 },
    { id: "planned", label: "В планах", value: 2 },
    { id: "watched", label: "Просмотрено", value: 3 },
    { id: "delayed", label: "Отложено", value: 4 },
    { id: "abandoned", label: "Заброшено", value: 5 },
  ],
  none: [{ id: "none", label: "Нет", value: 0 }],
};

const availableWhereOptions = computed(() =>
  whereOptions.filter((item) => !item.auth || userStore.isAuth)
);

const searchByList = computed(() => {
  return (searchByOptions as any)[where.value] || null;
});
const whereLabel = computed(() => {
  return whereOptions.find((item) => item.id === where.value)?.label || "Неизвестно";
});
const searchByLabel = computed(() => {
  const list = searchByList.value as any[] | null;
  if (!list) return "Не выбрано";
  return list.find((item) => item.id === searchBy.value)?.label || list[0]?.label || "Не выбрано";
});

let debounceTimer: number | undefined;
let internalRouteUpdate = false;
let scrollTimer: number | undefined;
let observer: IntersectionObserver | null = null;
let keydownHandler: ((event: KeyboardEvent) => void) | null = null;

function isWhereAllowed(id: string) {
  const item = whereOptions.find((entry) => entry.id === id);
  return !!item && (!item.auth || userStore.isAuth);
}

function normalizeSearchBy(whereId: string, value: any) {
  const list = (searchByOptions as any)[whereId] as any[] | undefined;
  if (!list) return "none";
  if (typeof value === "number") {
    const found = list.find((item) => item.value === value);
    return found ? found.id : list[0]?.id ?? "none";
  }
  if (typeof value === "string") {
    const found = list.find((item) => item.id === value);
    return found ? found.id : list[0]?.id ?? "none";
  }
  return list[0]?.id ?? "none";
}

function searchByValue(whereId: string, value: string) {
  const list = (searchByOptions as any)[whereId] as any[] | undefined;
  if (!list) return searchByOptions.none[0]!.value;
  const found = list.find((item) => item.id === value);
  return found ? found.value : list[0]?.value ?? searchByOptions.none[0]!.value;
}

function updateRoute() {
  const params = encodeURIComponent(
    JSON.stringify({ where: where.value, searchBy: searchBy.value })
  );
  internalRouteUpdate = true;
  router.replace({
    path: "/search",
    query: { query: query.value, params },
  }).finally(() => {
    internalRouteUpdate = false;
  });
}

function toggleWhere() {
  whereOpen.value = !whereOpen.value;
  if (whereOpen.value) {
    searchByOpen.value = false;
  }
}

function toggleSearchBy() {
  searchByOpen.value = !searchByOpen.value;
  if (searchByOpen.value) {
    whereOpen.value = false;
  }
}

function selectWhere(id: string) {
  where.value = id;
  whereOpen.value = false;
}

function selectSearchBy(id: string) {
  searchBy.value = id;
  searchByOpen.value = false;
}

function handleOutsideClick() {
  whereOpen.value = false;
  searchByOpen.value = false;
}

function resetSearch() {
  results.value = [];
  related.value = null;
  page.value = 0;
  hasMore.value = true;
  error.value = false;
  if (!query.value) {
    isLoading.value = false;
    return;
  }
  fetchPage();
}

async function fetchPage() {
  if (!query.value || isLoading.value || !hasMore.value) return;
  isLoading.value = true;
  error.value = false;

  let url = "";
  switch (where.value) {
    case "releases":
      url = `${ENDPOINTS.search.releases}/${page.value}`;
      break;
    case "profiles":
      url = `${ENDPOINTS.search.profiles}/${page.value}`;
      break;
    case "list":
      url = `${ENDPOINTS.search.profileList}/${searchByValue(where.value, searchBy.value)}/${page.value}`;
      break;
    case "history":
      url = `${ENDPOINTS.search.profileHistory}/${page.value}`;
      break;
    case "favorites":
      url = `${ENDPOINTS.search.profileFavorites}/${page.value}`;
      break;
    case "collections_all":
      url = `${ENDPOINTS.search.collections}/${page.value}`;
      break;
    case "collections_fav":
      url = `${ENDPOINTS.search.profileFavoriteCollection}/${page.value}`;
      break;
    default:
      url = `${ENDPOINTS.search.releases}/${page.value}`;
  }

  if (userStore.token) {
    url += `?token=${userStore.token}`;
  }

  const { data, error: err } = await tryCatchAPI(
    fetch(url, {
      method: "POST",
      headers: {
        "Api-Version": "v2",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: query.value,
        searchBy: searchByValue(where.value, searchBy.value),
      }),
    })
  );

  if (err) {
    error.value = true;
    isLoading.value = false;
    return;
  }

  if (page.value === 0 && data?.related) {
    related.value = data.related;
  }

  const items =
    where.value === "releases" ? data?.releases || [] : data?.content || [];
  if (items.length === 0) {
    hasMore.value = false;
  } else {
    results.value = [...results.value, ...items];
    page.value += 1;
  }
  isLoading.value = false;
}

function loadMore() {
  fetchPage();
}

function handleScroll() {
  if (scrollTimer) window.clearTimeout(scrollTimer);
  scrollTimer = window.setTimeout(() => {
    const doc = document.documentElement;
    const scrolled = (window.scrollY + window.innerHeight) / doc.scrollHeight;
    if (scrolled > 0.9) {
      fetchPage();
    }
  }, 100);
}

watch(
  () => route.query,
  () => {
    if (internalRouteUpdate) return;

    const q = route.query.query as string | undefined;
    query.value = q ?? "";

    const params = route.query.params as string | undefined;
    if (params) {
      try {
        const parsed = JSON.parse(decodeURIComponent(params));
        const nextWhere = typeof parsed.where === "string" ? parsed.where : "releases";
        where.value = isWhereAllowed(nextWhere) ? nextWhere : "releases";
        searchBy.value = normalizeSearchBy(where.value, parsed.searchBy);
      } catch {
        where.value = "releases";
        searchBy.value = "name";
      }
    } else {
      where.value = "releases";
      searchBy.value = "name";
    }
    resetSearch();
  },
  { immediate: true }
);

watch(
  [where, searchBy],
  ([nextWhere, nextSearchBy]) => {
    const normalized = normalizeSearchBy(nextWhere, nextSearchBy);
    if (normalized !== nextSearchBy) {
      searchBy.value = normalized;
      return;
    }
    updateRoute();
    resetSearch();
  }
);

watch(
  () => query.value,
  () => {
    if (debounceTimer) window.clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(() => {
      updateRoute();
      resetSearch();
    }, 400);
  }
);

watch(
  () => userStore.isAuth,
  (isAuth) => {
    if (!isAuth && !isWhereAllowed(where.value)) {
      where.value = "releases";
      searchBy.value = "name";
    }
  }
);

onMounted(() => {
  document.addEventListener("click", handleOutsideClick);
  keydownHandler = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      whereOpen.value = false;
      searchByOpen.value = false;
    }
  };
  document.addEventListener("keydown", keydownHandler);
  window.addEventListener("scroll", handleScroll, { passive: true });
  if (sentinel.value && "IntersectionObserver" in window) {
    observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        fetchPage();
      }
    });
    observer.observe(sentinel.value);
  }
});

onUnmounted(() => {
  document.removeEventListener("click", handleOutsideClick);
  if (keydownHandler) {
    document.removeEventListener("keydown", keydownHandler);
    keydownHandler = null;
  }
  window.removeEventListener("scroll", handleScroll);
  if (observer) {
    observer.disconnect();
    observer = null;
  }
});
</script>