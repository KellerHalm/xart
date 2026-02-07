<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
    <div class="max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-xl border border-white/10 bg-[#1f2022] shadow">
      <div class="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <h2 class="text-lg font-bold">Выбор коллекции</h2>
        <button class="text-gray-400 hover:text-white" @click="emit('close')">✕</button>
      </div>
      <div class="max-h-[70vh] overflow-y-auto p-4" @scroll="handleScroll" ref="scrollRef">
        <div v-if="isLoading" class="py-4 text-center text-sm text-gray-400">Загрузка...</div>
        <button
          v-for="collection in collections"
          :key="collection.id"
          class="relative mb-2 h-48 w-full overflow-hidden rounded-md bg-cover bg-center text-left"
          :style="{
            backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.9) 100%), url(${collection.image})`,
          }"
          @click="addToCollection(collection)"
        >
          <div class="absolute bottom-0 left-0 p-3">
            <p class="text-xl font-bold text-white">{{ collection.title }}</p>
            <p class="text-sm text-gray-300 line-clamp-2">{{ collection.description }}</p>
          </div>
        </button>
        <div v-if="!isLoading && collections.length === 0" class="py-4 text-center text-sm text-gray-400">
          Коллекций не найдено
        </div>
        <div v-if="isLoadingMore" class="py-4 text-center text-sm text-gray-400">Загрузка...</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { ENDPOINTS } from "@/api/config";
import { tryCatchAPI } from "@/api/utils";
import { toast } from "@/store/toast";

const props = defineProps<{
  isOpen: boolean;
  releaseId: number;
  token: string;
  profileId: number | null;
}>();

const emit = defineEmits<{ (e: "close"): void }>();

const collections = ref<any[]>([]);
const page = ref(0);
const isLoading = ref(false);
const isLoadingMore = ref(false);
const hasMore = ref(true);
const scrollRef = ref<HTMLElement | null>(null);

async function fetchCollections(reset = false) {
  if (!props.token || !props.profileId) return;
  if (reset) {
    page.value = 0;
    collections.value = [];
    hasMore.value = true;
  }
  if (!hasMore.value) return;

  if (page.value === 0) {
    isLoading.value = true;
  } else {
    isLoadingMore.value = true;
  }

  const res = await fetch(
    `${ENDPOINTS.collection.userCollections}/${props.profileId}/${page.value}?token=${props.token}`
  );
  if (res.ok) {
    const data = await res.json();
    const content = data?.content || [];
    if (content.length === 0) {
      hasMore.value = false;
    } else {
      collections.value = [...collections.value, ...content];
      page.value += 1;
    }
  }

  isLoading.value = false;
  isLoadingMore.value = false;
}

function handleScroll() {
  if (!scrollRef.value || !hasMore.value || isLoadingMore.value) return;
  const el = scrollRef.value;
  const scrolled = (el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100;
  if (scrolled >= 95) {
    fetchCollections();
  }
}

async function addToCollection(collection: any) {
  if (!props.token) return;
  const tid = toast.loading(`Добавление в коллекцию ${collection.title}...`);
  const { error } = await tryCatchAPI(
    fetch(
      `${ENDPOINTS.collection.addRelease}/${collection.id}?release_id=${props.releaseId}&token=${props.token}`
    )
  );
  if (error) {
    const errCode = "code" in error ? error.code : undefined;
    let message = `${error.message}, code: ${errCode ?? "unknown"}`;
    if (errCode === 5) {
      message = "Релиз уже есть в коллекции";
    }
    toast.update(tid, {
      render: message,
      type: "error",
      autoClose: 2500,
      isLoading: false,
    });
    return;
  }

  toast.update(tid, {
    render: "Релиз добавлен в коллекцию",
    type: "success",
    autoClose: 2500,
    isLoading: false,
  });
}

watch(
  () => props.isOpen,
  (value) => {
    if (value) {
      fetchCollections(true);
    }
  }
);

onMounted(() => {
  if (props.isOpen) {
    fetchCollections(true);
  }
});
</script>
