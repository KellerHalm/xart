<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
    <div class="max-h-[80vh] w-full max-w-3xl overflow-hidden rounded-xl border border-white/10 bg-[#1f2123] shadow-xl">
      <div class="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div>
          <h2 class="section-title text-lg">Все комментарии</h2>
          <p class="text-sm text-gray-400">всего: {{ totalCount || "загрузка..." }}</p>
        </div>
        <button class="text-gray-400 hover:text-white" @click="emit('close')">✕</button>
      </div>
      <div class="max-h-[70vh] overflow-y-auto p-4" ref="scrollRef" @scroll="handleScroll">
        <div v-if="isLoading" class="py-4 text-center">
          <Spinner />
        </div>
        <div v-else-if="content.length">
          <CommentsComment
            v-for="comment in content"
            :key="comment.id"
            :release-id="releaseId"
            :profile="comment.profile"
            :comment="{
              id: comment.id,
              timestamp: comment.timestamp,
              message: comment.message,
              reply_count: comment.reply_count,
              likes_count: comment.likes_count,
              vote: comment.vote,
              isSpoiler: comment.is_spoiler,
              isEdited: comment.is_edited,
              isDeleted: comment.is_deleted,
            }"
            :token="token"
            :type="type"
            @refresh="refresh()"
          />
        </div>
        <p v-else class="text-sm font-bold text-gray-300">
          Комментариев нет
        </p>
        <div v-if="isLoadingMore" class="py-4 text-center text-sm text-gray-400">Загрузка...</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { ENDPOINTS } from "@/api/config";
import Spinner from "@/components/Spinner.vue";
import CommentsComment from "@/components/Comments/CommentsComment.vue";

const props = defineProps<{
  isOpen: boolean;
  releaseId: number;
  token: string | null;
  type?: "release" | "collection";
  refreshSignal?: number;
}>();

const emit = defineEmits<{ (e: "close"): void }>();

const type = props.type || "release";
const content = ref<any[]>([]);
const page = ref(0);
const isLoading = ref(false);
const isLoadingMore = ref(false);
const totalCount = ref<number | null>(null);
const hasMore = ref(true);
const scrollRef = ref<HTMLElement | null>(null);

async function fetchPage(reset = false) {
  if (reset) {
    page.value = 0;
    content.value = [];
    hasMore.value = true;
  }
  if (!hasMore.value) return;

  if (page.value === 0) {
    isLoading.value = true;
  } else {
    isLoadingMore.value = true;
  }

  let url = "";
  if (type === "collection") {
    url = `${ENDPOINTS.collection.base}/comment/all/${props.releaseId}/${page.value}?sort=1`;
  } else {
    url = `${ENDPOINTS.release.info}/comment/all/${props.releaseId}/${page.value}?sort=1`;
  }
  if (props.token) {
    url += `&token=${props.token}`;
  }

  const res = await fetch(url);
  if (res.ok) {
    const data = await res.json();
    totalCount.value = data?.total_count ?? totalCount.value;
    if (data?.content?.length) {
      content.value = [...content.value, ...data.content];
      page.value += 1;
    } else {
      hasMore.value = false;
    }
  }

  isLoading.value = false;
  isLoadingMore.value = false;
}

function handleScroll() {
  if (!scrollRef.value || isLoadingMore.value || !hasMore.value) return;
  const el = scrollRef.value;
  const scrolled = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
  if (scrolled >= 95) {
    fetchPage();
  }
}

function refresh() {
  fetchPage(true);
}

watch(
  () => props.isOpen,
  (value) => {
    if (value) {
      fetchPage(true);
    }
  }
);

watch(
  () => props.refreshSignal,
  () => {
    if (props.isOpen) {
      fetchPage(true);
    }
  }
);

onMounted(() => {
  if (props.isOpen) {
    fetchPage(true);
  }
});
</script>
