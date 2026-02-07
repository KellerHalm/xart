<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
    <div class="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-xl border border-white/10 bg-[#1f2123] shadow-xl">
      <div class="flex items-center justify-between border-b border-white/10 px-6 py-4 dark:border-white/10">
        <h2 class="section-title text-xl">Друзья</h2>
        <button class="text-gray-400 hover:text-white" @click="emit('close')">
          &times;</button>
      </div>
      <div ref="scrollRef" class="max-h-[75vh] overflow-y-auto p-6" @scroll="handleScroll">
        <div v-if="isMyProfile" class="space-y-6">
          <div>
            <p class="text-lg font-semibold">Все друзья</p>
            <div v-if="requestInLoading" class="py-4">
              <Spinner />
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="user in requestInUsers"
                :key="`friend_req_in-${user.id}`"
                class="flex items-center justify-between gap-2"
              >
                <router-link :to="`/profile/${user.id}`" class="flex gap-2">
                  <img
                    :src="user.avatar"
                    alt=""
                    class="h-12 w-12 rounded-full border-2 object-cover"
                    :class="user.is_online ? 'border-green-500' : 'border-white/10'"
                  />
                  <div class="flex flex-col gap-1">
                    <p class="text-lg font-semibold">{{ user.login }}</p>
                    <p>Друзей: {{ user.friend_count }}</p>
                  </div>
                </router-link>
                <div class="flex gap-2">
                  <button
                    class="btn-accent rounded-lg px-4 py-2 text-sm font-semibold"
                    :disabled="actionsDisabled"
                    @click="acceptRequestIn(user.id)"
                  >
                    Принять
                  </button>
                  <button
                    class="btn-outline rounded-lg px-4 py-2 text-sm font-semibold"
                    :disabled="actionsDisabled"
                    @click="hideRequestIn(user.id)"
                  >
                    Скрыть
                  </button>
                </div>
              </div>
              <p v-if="requestInUsers.length === 0" class="text-sm">
                Нет входящих заявок
              </p>
            </div>
          </div>
          <div>
            <p class="text-lg font-semibold">Исходящие заявки</p>
            <div v-if="requestOutLoading" class="py-4">
              <Spinner />
            </div>
            <div v-else class="space-y-3">
              <div
                v-for="user in requestOutUsers"
                :key="`friend_req_out-${user.id}`"
                class="flex items-center justify-between gap-2"
              >
                <router-link :to="`/profile/${user.id}`" class="flex gap-2">
                  <img
                    :src="user.avatar"
                    alt=""
                    class="h-12 w-12 rounded-full border-2 object-cover"
                    :class="user.is_online ? 'border-green-500' : 'border-white/10'"
                  />
                  <div class="flex flex-col gap-1">
                    <p class="text-lg font-semibold">{{ user.login }}</p>
                    <p>Друзей: {{ user.friend_count }}</p>
                  </div>
                </router-link>
                <div class="flex gap-2">
                  <button
                    class="btn-outline rounded-lg px-4 py-2 text-sm font-semibold"
                    :disabled="actionsDisabled"
                    @click="cancelRequestOut(user.id)"
                  >
                    Отменить
                  </button>
                </div>
              </div>
              <p v-if="requestOutUsers.length === 0" class="text-sm">
                Нет исходящих заявок
              </p>
            </div>
          </div>
        </div>

        <div class="mt-6">
          <p class="text-lg font-semibold">Все друзья</p>
          <div v-if="friends.length > 0" class="mt-3 space-y-3">
            <router-link
              v-for="user in friends"
              :key="`friend-${user.id}`"
              :to="`/profile/${user.id}`"
              class="flex items-center gap-2"
            >
              <img
                :src="user.avatar"
                alt=""
                class="h-12 w-12 rounded-full border-2 object-cover"
                :class="user.is_online ? 'border-green-500' : 'border-white/10'"
              />
              <div class="flex flex-col gap-1">
                <p class="text-lg font-semibold">{{ user.login }}</p>
                <p>Друзей: {{ user.friend_count }}</p>
              </div>
            </router-link>
          </div>
          <p v-else class="text-sm">Нет друзей</p>
        </div>

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
import { tryCatchAPI } from "@/api/utils";
import { toast } from "@/store/toast";
import Spinner from "@/components/Spinner.vue";

const props = defineProps<{
  isOpen: boolean;
  token: string | null;
  isMyProfile: boolean;
  profileId: number;
}>();

const emit = defineEmits<{ (e: "close"): void }>();

const requestInUsers = ref<any[]>([]);
const requestOutUsers = ref<any[]>([]);
const requestInLoading = ref(false);
const requestOutLoading = ref(false);
const friends = ref<any[]>([]);
const page = ref(0);
const hasMore = ref(true);
const loadingMore = ref(false);
const actionsDisabled = ref(false);
const scrollRef = ref<HTMLElement | null>(null);

async function fetchRequests() {
  if (!props.isMyProfile || !props.token) return;
  requestInLoading.value = true;
  requestOutLoading.value = true;
  const [inRes, outRes] = await Promise.all([
    tryCatchAPI(fetch(`${ENDPOINTS.user.friend.in}/last?token=${props.token}&count=8`)),
    tryCatchAPI(fetch(`${ENDPOINTS.user.friend.out}/last?token=${props.token}&count=8`)),
  ]);
  if (!inRes.error) {
    requestInUsers.value = inRes.data?.content || [];
  }
  if (!outRes.error) {
    requestOutUsers.value = outRes.data?.content || [];
  }
  requestInLoading.value = false;
  requestOutLoading.value = false;
}

async function fetchFriendsPage() {
  if (!hasMore.value || loadingMore.value) return;
  loadingMore.value = true;
  let url = `${ENDPOINTS.user.friend.list}/${props.profileId}/${page.value}`;
  if (props.token) {
    url += `?token=${props.token}`;
  }
  const { data, error } = await tryCatchAPI(fetch(url));
  if (!error) {
    const content = data?.content || [];
    if (content.length === 0) {
      hasMore.value = false;
    } else {
      friends.value = [...friends.value, ...content];
      page.value += 1;
    }
  } else {
    hasMore.value = false;
  }
  loadingMore.value = false;
}

async function hideRequestIn(profileId: number) {
  if (!props.token) return;
  actionsDisabled.value = true;
  const tid = toast.loading("Отменяем запрос...");
  const { error } = await tryCatchAPI(
    fetch(`${ENDPOINTS.user.friend.hide}/${profileId}?token=${props.token}`)
  );
  if (error) {
    toast.update(tid, {
      render: "Запрос отменён",
      type: "error",
      autoClose: 2500,
      isLoading: false,
    });
    actionsDisabled.value = false;
    return;
  }
  toast.update(tid, {
    render: "Заявка скрыта",
    type: "success",
    autoClose: 2500,
    isLoading: false,
  });
  await fetchRequests();
  actionsDisabled.value = false;
}

async function acceptRequestIn(profileId: number) {
  if (!props.token) return;
  actionsDisabled.value = true;
  const tid = toast.loading("Принимаем запрос...");
  const { error } = await tryCatchAPI(
    fetch(`${ENDPOINTS.user.friend.add}/${profileId}?token=${props.token}`)
  );
  if (error) {
    toast.update(tid, {
      render: "Ошибка принятия запроса",
      type: "error",
      autoClose: 2500,
      isLoading: false,
    });
    actionsDisabled.value = false;
    return;
  }
  toast.update(tid, {
    render: "Запрос принят",
    type: "success",
    autoClose: 2500,
    isLoading: false,
  });
  await fetchRequests();
  actionsDisabled.value = false;
}

async function cancelRequestOut(profileId: number) {
  if (!props.token) return;
  actionsDisabled.value = true;
  const tid = toast.loading("Отменяем запрос...");
  const { error } = await tryCatchAPI(
    fetch(`${ENDPOINTS.user.friend.remove}/${profileId}?token=${props.token}`)
  );
  if (error) {
    toast.update(tid, {
      render: "Ошибка отмены запроса",
      type: "error",
      autoClose: 2500,
      isLoading: false,
    });
    actionsDisabled.value = false;
    return;
  }
  toast.update(tid, {
    render: "Запрос отменён",
    type: "success",
    autoClose: 2500,
    isLoading: false,
  });
  await fetchRequests();
  actionsDisabled.value = false;
}

function handleScroll() {
  const el = scrollRef.value;
  if (!el || !hasMore.value || loadingMore.value) return;
  if (el.scrollTop + el.clientHeight >= el.scrollHeight - 64) {
    fetchFriendsPage();
  }
}

watch(
  () => props.isOpen,
  async (open) => {
    if (!open) return;
    requestInUsers.value = [];
    requestOutUsers.value = [];
    friends.value = [];
    page.value = 0;
    hasMore.value = true;
    await fetchRequests();
    await fetchFriendsPage();
  }
);

onMounted(() => {
  if (props.isOpen) {
    fetchRequests();
    fetchFriendsPage();
  }
});
</script>




