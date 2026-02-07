<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
    <div class="w-full max-w-2xl rounded-xl border border-white/10 bg-[#1f2123] p-6 shadow-xl">
      <div class="flex items-center justify-between border-b border-white/10 pb-3">
        <h2 class="section-title text-lg">{{ isReply ? "Ответ на комментарий" : "Оставить комментарий" }}</h2>
        <button class="text-gray-400 hover:text-white" @click="emit('close')">✕</button>
      </div>
      <div class="mt-4 space-y-4">
        <CommentsComment
          v-if="isReply && parentComment && parentProfile"
          :release-id="releaseId"
          :profile="parentProfile"
          :comment="parentComment"
          :token="token"
          :is-replying="true"
        />
        <form class="space-y-4" @submit.prevent="sendComment">
          <textarea
            v-model="message"
            rows="4"
            class="input-dark w-full rounded-lg p-3 text-sm"
            placeholder="Написать комментарий..."
            required
          ></textarea>
          <div class="flex flex-wrap items-center justify-between gap-2">
            <label class="flex items-center gap-2 text-sm">
              <input type="checkbox" v-model="isSpoiler" class="h-4 w-4" />
              Спойлер
            </label>
            <button
              type="submit"
              class="btn-accent rounded-lg px-4 py-2 text-sm"
              :disabled="isSending"
            >
              Отправить
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { ENDPOINTS } from "@/api/config";
import CommentsComment from "@/components/Comments/CommentsComment.vue";

const props = defineProps<{
  isOpen: boolean;
  releaseId: number;
  token: string | null;
  isReply?: boolean;
  parentComment?: any;
  parentProfile?: any;
  type?: "release" | "collection";
}>();

const emit = defineEmits<{ (e: "close"): void; (e: "sent"): void }>();

const message = ref("");
const isSpoiler = ref(false);
const isSending = ref(false);

watch(
  () => props.isOpen,
  () => {
    if (props.isReply && props.parentProfile) {
      message.value = `${props.parentProfile.login}, `;
    } else {
      message.value = "";
    }
    isSpoiler.value = false;
  }
);

async function sendComment() {
  if (!props.token || message.value.trim() === "") return;
  const data = {
    message: message.value.replace(/\n/gi, "\r\n").trim(),
    parentCommentId: props.parentComment?.id ?? null,
    replyToProfileId: props.parentProfile?.id ?? null,
    spoiler: isSpoiler.value,
  };
  let url: string;
  if (props.type === "collection") {
    url = `${ENDPOINTS.collection.base}/comment/add/${props.releaseId}?token=${props.token}`;
  } else {
    url = `${ENDPOINTS.release.info}/comment/add/${props.releaseId}?token=${props.token}`;
  }

  isSending.value = true;
  await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  isSending.value = false;
  emit("sent");
  emit("close");
}
</script>

