<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
    <div class="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-xl border border-white/10 bg-[#1f2123] shadow-xl">
      <div class="flex items-center justify-between border-b border-white/10 px-6 py-4 dark:border-white/10">
        <h2 class="section-title text-xl">Заблокированные пользователи</h2>
        <button class="text-gray-400 hover:text-white" @click="emit('close')">
          ✕
        </button>
      </div>
      <div ref="scrollRef" class="max-h-[75vh] overflow-y-auto p-6" @scroll="handleScroll">
        <div v-if="content.length > 0" class="space-y-3">
          <div
            v-for="user in content"
            :key="`blockeduser-${user.id}`"
            class="flex items-center justify-between gap-2"
          >
            <div class="flex gap-2">
              <img
                :src="user.avatar"
                alt=""
                class="h-12 w-12 rounded-full border-2 object-cover"
                :class="user.is_online ? 'border-green-500' : 'border-white/10'"
              />
              <div class="flex flex-col gap-1">
                <p class="text-lg font-semibold text-gray-100">{{ user.login }}</p>
                <p class="text-sm text-gray-400">Заблокирован: {{ unixToDate(user.added_date, "full") }}</p>
              </div>
            </div>
            <button
              class="h-fit flex-shrink-0 rounded-lg px-4 py-2 text-sm font-semibold"
              :class="
                !unblockedUsers.includes(user.id) ? 'btn-accent' : 'btn-outline border-[#d21c22] text-[#d21c22] hover:bg-[#d21c22]/10'
              "
              :disabled="actionsDisabled"
              @click="toggleBlock(user.id)"
            >
              {{ !unblockedUsers.includes(user.id) ? "Разблокировать" : "Заблокировать" }}
            </button>
          </div>
        </div>
        <p v-else class="text-sm text-gray-400">Нет заблокированных пользователей</p>
        <div v-if="loadingMore" class="py-4">
          <Spinner />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { ENDPOINTS } from "@/api/config";
import { tryCatchAPI, unixToDate } from "@/api/utils";
import { toast } from "@/store/toast";
import Spinner from "@/components/Spinner.vue";

const props = defineProps<{
  isOpen: boolean;
  token: string | null;
  profileId: number;
}>();

const emit = defineEmits<{ (e: "close"): void }>();

const content = ref<any[]>([]);
const unblockedUsers = ref<number[]>([]);
const page = ref(0);
const hasMore = ref(true);
const loadingMore = ref(false);
const actionsDisabled = ref(false);
const scrollRef = ref<HTMLElement | null>(null);

async function fetchPage() {
  if (!props.token || !hasMore.value || loadingMore.value) return;
  loadingMore.value = true;
  const url = `${ENDPOINTS.user.blocklist}/all/${page.value}?token=${props.token}`;
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

async function toggleBlock(profileId: number) {
  if (!props.token) return;
  actionsDisabled.value = true;
  const isUnblocked = unblockedUsers.value.includes(profileId);
  const tid = toast.loading(
    isUnblocked ? "Блокируем пользователя..." : "Разблокируем пользователя..."
  );
  let url = `${ENDPOINTS.user.blocklist}`;
  url += isUnblocked ? "/add/" : "/remove/";
  url += `${profileId}?token=${props.token}`;
  const { error } = await tryCatchAPI(fetch(url));
  if (error) {
    toast.update(tid, {
      render: isUnblocked ? "Ошибка блокировки" : "Ошибка разблокировки",
      type: "error",
      autoClose: 2500,
      isLoading: false,
    });
    actionsDisabled.value = false;
    return;
  }
  toast.update(tid, {
    render: isUnblocked ? "Пользователь заблокирован" : "Пользователь разблокирован",
    type: "success",
    autoClose: 2500,
    isLoading: false,
  });
  if (isUnblocked) {
    unblockedUsers.value = unblockedUsers.value.filter((id) => id !== profileId);
  } else {
    unblockedUsers.value = [...unblockedUsers.value, profileId];
  }
  actionsDisabled.value = false;
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
    unblockedUsers.value = [];
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




