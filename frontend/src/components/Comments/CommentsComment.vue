<template>
  <div :class="containerClass" class="card-surface rounded-lg text-sm">
    <div class="flex items-center justify-between">
      <div class="flex flex-col gap-1 sm:flex-row sm:items-center">
        <router-link
          :to="`/profile/${profile.id}`"
          class="inline-flex items-center text-sm font-semibold text-gray-100 hover:underline"
        >
          <img :src="profile.avatar" alt="" class="mr-2 h-6 w-6 rounded-full" />
          {{ profile.login }}
        </router-link>
        <p class="text-sm text-gray-400">
          <time :title="unixToDate(comment.timestamp, 'full')">{{ sinceUnixDate(comment.timestamp) }}</time>
        </p>
      </div>
      <div v-if="user && user.id === profile.id" class="relative">
        <button class="iconify mdi--more-horiz h-6 w-6 text-gray-500" @click="menuOpen = !menuOpen"></button>
        <div
          v-if="menuOpen"
          class="absolute right-0 mt-2 w-40 rounded-lg border border-white/10 bg-slate-900/95 p-2 text-sm text-white shadow-lg"
        >
          <button class="w-full rounded px-2 py-1 text-left hover:bg-white/10" @click="isEditOpen = true">
            Редактировать
          </button>
          <button class="w-full rounded px-2 py-1 text-left hover:bg-white/10" @click="deleteComment">
            Удалить
          </button>
        </div>
      </div>
    </div>

    <div class="relative mt-2">
      <p class="whitespace-pre-wrap text-gray-200">
        {{ comment.isDeleted ? "Комментарий был удалён." : comment.message }}
      </p>
      <button v-if="isHidden" class="absolute inset-0" @click="isHidden = false">
        <div class="flex h-full w-full flex-col items-center justify-center rounded-md bg-black/60 px-2 py-1.5 text-white backdrop-blur">
          <p>{{ comment.likes_count < -5 ? "У комментария слишком низкий рейтинг." : "Данный комментарий может содержать спойлер." }}</p>
          <p class="font-bold">Нажмите, чтобы прочитать</p>
        </div>
      </button>
    </div>

    <div v-if="!isReplying && !comment.isDeleted" class="mt-3 flex items-center justify-between">
      <button
        v-if="token"
        class="flex items-center text-sm font-medium text-gray-400 hover:underline"
        @click="isAddOpen = true"
      >
        Ответить
      </button>
      <span v-else></span>
      <div class="flex items-center gap-2">
        <button
          class="text-gray-400"
          :disabled="!token"
          @click="updateVote('dislike')"
        >
          <span class="iconify mdi--dislike h-6 w-6" :class="vote === 1 ? 'text-red-500' : ''"></span>
        </button>
        <span :class="likesClass">{{ likes }}</span>
        <button
          class="text-gray-400"
          :disabled="!token"
          @click="updateVote('like')"
        >
          <span class="iconify mdi--like h-6 w-6" :class="vote === 2 ? 'text-green-500' : ''"></span>
        </button>
      </div>
    </div>

    <div v-if="replies.length" class="mt-4 space-y-3">
      <CommentsComment
        v-for="reply in replies"
        :key="reply.id"
        :release-id="releaseId"
        :profile="reply.profile"
        :comment="{
          id: reply.id,
          timestamp: reply.timestamp,
          message: reply.message,
          reply_count: reply.reply_count,
          likes_count: reply.likes_count,
          vote: reply.vote,
          isSpoiler: reply.is_spoiler,
          isEdited: reply.is_edited,
          isDeleted: reply.is_deleted,
        }"
        :token="token"
        :is-sub-comment="true"
        :parent-comment="parentComment || comment"
        @refresh="handleRefresh"
      />
    </div>
  </div>

  <CommentsAddModal
    v-if="token"
    :is-open="isAddOpen"
    :release-id="releaseId"
    :token="token"
    :is-reply="true"
    :parent-comment="parentComment || comment"
    :parent-profile="profile"
    :type="type"
    @close="isAddOpen = false"
    @sent="handleRefresh"
  />
  <CommentsEditModal
    v-if="token"
    :is-open="isEditOpen"
    :token="token"
    :parent-comment="comment"
    :type="type"
    @close="isEditOpen = false"
    @sent="handleRefresh"
  />
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { ENDPOINTS } from "@/api/config";
import { sinceUnixDate, unixToDate } from "@/api/utils";
import { useUserStore } from "@/store/auth";
import CommentsAddModal from "@/components/Comments/CommentsAddModal.vue";
import CommentsEditModal from "@/components/Comments/CommentsEditModal.vue";

defineOptions({ name: "CommentsComment" });

const props = defineProps<{
  releaseId: number;
  profile: { login: string; avatar: string; id: number };
  comment: {
    id: number;
    timestamp: number;
    message: string;
    reply_count: number;
    likes_count: number;
    vote: number;
    isSpoiler: boolean;
    isEdited: boolean;
    isDeleted: boolean;
  };
  token: string | null;
  isSubComment?: boolean;
  isReplying?: boolean;
  parentComment?: any;
  type?: "release" | "collection";
}>();

const emit = defineEmits<{ (e: "refresh"): void }>();

const userStore = useUserStore();
const user = computed(() => userStore.user);

const replies = ref<any[]>([]);
const likes = ref(props.comment.likes_count);
const vote = ref(props.comment.vote);
const isAddOpen = ref(false);
const isEditOpen = ref(false);
const menuOpen = ref(false);

const isHidden = ref(
  !props.isReplying && (props.comment.isSpoiler || props.comment.likes_count < -5)
);

const shouldRender = ref(true);
const commentSend = ref(false);

const containerClass = computed(() =>
  !props.isSubComment || props.type === "collection" ? "p-6" : "pt-4"
);

const likesClass = computed(() => {
  if (likes.value > 0) return "text-green-500 dark:text-green-400";
  if (likes.value < 0) return "text-red-500 dark:text-red-400";
  return "text-gray-400";
});

async function fetchReplies() {
  const baseId = props.parentComment?.id || props.comment.id;
  let url = "";
  if (props.type === "collection") {
    url = `${ENDPOINTS.collection.base}/comment/replies/${baseId}/0?sort=2`;
  } else {
    url = `${ENDPOINTS.release.info}/comment/replies/${baseId}/0?sort=2`;
  }
  if (props.token) {
    url += `&token=${props.token}`;
  }

  const res = await fetch(url);
  if (!res.ok) return;
  const data = await res.json();
  replies.value = data?.content || [];
}

function handleRefresh() {
  shouldRender.value = true;
  commentSend.value = true;
  emit("refresh");
}

watch(
  () => commentSend.value,
  () => {
    if (
      !props.isSubComment &&
      !props.isReplying &&
      shouldRender.value &&
      (commentSend.value || props.comment.reply_count > 0)
    ) {
      fetchReplies();
      shouldRender.value = false;
      commentSend.value = false;
    }
  }
);

onMounted(() => {
  if (!props.isSubComment && props.comment.reply_count > 0) {
    fetchReplies();
  }
});

async function sendVote(action: number) {
  if (!props.token) return;
  let url = "";
  if (props.type === "collection") {
    url = `${ENDPOINTS.collection.base}/comment/vote/${props.comment.id}/${action}?token=${props.token}`;
  } else {
    url = `${ENDPOINTS.release.info}/comment/vote/${props.comment.id}/${action}?token=${props.token}`;
  }
  fetch(url);
}

function updateVote(action: "like" | "dislike") {
  if (action === "like" && vote.value === 0) {
    vote.value = 2;
    likes.value += 1;
    sendVote(2);
  } else if (action === "dislike" && vote.value === 0) {
    vote.value = 1;
    likes.value -= 1;
    sendVote(1);
  } else if (action === "like" && vote.value === 1) {
    vote.value = 2;
    likes.value += 2;
    sendVote(2);
  } else if (action === "dislike" && vote.value === 2) {
    vote.value = 1;
    likes.value -= 2;
    sendVote(1);
  } else {
    sendVote(vote.value);
    if (action === "dislike" && vote.value === 1) {
      likes.value += 1;
    } else if (action === "like" && vote.value === 2) {
      likes.value -= 1;
    }
    vote.value = 0;
  }
}

async function deleteComment() {
  if (!props.token) return;
  let url = "";
  if (props.type === "collection") {
    url = `${ENDPOINTS.collection.base}/comment/delete/${props.comment.id}?token=${props.token}`;
  } else {
    url = `${ENDPOINTS.release.info}/comment/delete/${props.comment.id}?token=${props.token}`;
  }
  await fetch(url);
  handleRefresh();
}
</script>
