<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
    <div class="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-xl border border-white/10 bg-[#1f2123] shadow-xl">
      <div class="flex items-center justify-between border-b border-white/10 px-6 py-4 dark:border-white/10">
        <h2 class="section-title text-xl">Оценки</h2>
        <button class="text-gray-400 hover:text-white" @click="emit('close')">
          ✕
        </button>
      </div>
      <div ref="scrollRef" class="max-h-[75vh] overflow-y-auto p-6" @scroll="handleScroll">
        <div v-if="loadingMore" class="py-4">
          <Spinner />
        </div>
        <div v-if="content.length > 0" class="space-y-4">
          <router-link
            v-for="release in content"
            :key="`vote-modal-${release.id}`"
            :to="`/release/${release.id}`"
            class="flex gap-4 xl:mx-20"
          >
            <div class="max-w-32 flex-shrink-0">
              <Poster :image="release.image" />
            </div>
            <div class="flex flex-col gap-1 py-2">
              <h2 class="text-lg">{{ release.title_ru }}</h2>
              <div class="flex items-center gap-1 text-sm text-gray-400">
                <p>{{ release.episodes_total ? release.episodes_total : "?" }} эп.</p>
                <span class="mx-1.5 hidden h-1 w-1 rounded-full bg-gray-500 dark:bg-gray-400 lg:block" />
                <p class="flex items-center gap-1">
                  <span class="iconify mdi--star text-yellow-400"></span>
                  {{ release.grade ? release.grade.toFixed(1) : "?" }} из 5
                </p>
              </div>
              <div class="flex items-center gap-1">
                <span v-for="i in 5" :key="`star-${release.id}-${i}`" class="iconify mdi--star"
                  :class="release.my_vote >= i ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'">
                </span>
              </div>
              <h2 class="text-sm text-gray-400">
                {{ unixToDate(release.voted_at, "full") }}
              </h2>
            </div>
          </router-link>
        </div>
        <h1 v-else class="text-center text-sm text-gray-500">Оценок нет</h1>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { ENDPOINTS } from "@/api/config";
import { tryCatchAPI, unixToDate } from "@/api/utils";
import Spinner from "@/components/Spinner.vue";
import Poster from "@/components/ReleasePoster/Poster.vue";

const props = defineProps<{
  isOpen: boolean;
  profileId: number;
  token: string | null;
}>();

const emit = defineEmits<{ (e: "close"): void }>();

const content = ref<any[]>([]);
const page = ref(0);
const hasMore = ref(true);
const loadingMore = ref(false);
const scrollRef = ref<HTMLElement | null>(null);

async function fetchPage() {
  if (!hasMore.value || loadingMore.value) return;
  loadingMore.value = true;
  let url = `${ENDPOINTS.user.profile}/vote/release/voted/${props.profileId}/${page.value}?sort=1`;
  if (props.token) {
    url += `&token=${props.token}`;
  }
  const { data, error } = await tryCatchAPI(fetch(url));
  if (!error) {
    const items = data?.content || [];
    if (items.length === 0) {
      hasMore.value = false;
    } else {
      content.value = [...content.value, ...items];
      page.value += 1;
    }
  } else {
    hasMore.value = false;
  }
  loadingMore.value = false;
}

function handleScroll() {
  const el = scrollRef.value;
  if (!el || !hasMore.value || loadingMore.value) return;
  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 64) {
    fetchPage();
  }
}

watch(
  () => props.isOpen,
  async (open) => {
    if (!open) return;
    content.value = [];
    page.value = 0;
    hasMore.value = true;
    await fetchPage();
  }
);

onMounted(() => {
  if (props.isOpen) {
    fetchPage();
  }
});
</script>




