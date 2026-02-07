<template>
  <div class="card-surface rounded-xl p-4">
    <div class="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex flex-col gap-1">
        <h2 class="section-title text-lg">Комментарии</h2>
        <p class="text-sm font-bold text-gray-300">Популярные и актуальные</p>
      </div>
      <div class="flex items-end gap-2">
        <button
          v-if="token"
          class="btn-accent rounded-lg px-3 py-2 text-sm"
          @click="isAddOpen = true"
        >
          Оставить комментарий
        </button>
        <button
          class="btn-outline rounded-lg px-3 py-2 text-sm"
          @click="isAllOpen = true"
        >
          Показать все
        </button>
      </div>
    </div>
    <div class="flex flex-col gap-2">
      <CommentsComment
        v-for="comment in comments"
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
        @refresh="refreshSignal++"
      />
    </div>
  </div>

  <CommentsAllModal
    :is-open="isAllOpen"
    :release-id="releaseId"
    :token="token"
    :type="type"
    :refresh-signal="refreshSignal"
    @close="isAllOpen = false"
  />
  <CommentsAddModal
    v-if="token"
    :is-open="isAddOpen"
    :release-id="releaseId"
    :token="token"
    :type="type"
    @close="isAddOpen = false"
    @sent="refreshSignal++"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import CommentsComment from "@/components/Comments/CommentsComment.vue";
import CommentsAddModal from "@/components/Comments/CommentsAddModal.vue";
import CommentsAllModal from "@/components/Comments/CommentsModalAll.vue";

const props = defineProps<{
  releaseId: number;
  token: string | null;
  comments: any[];
  type?: "release" | "collection";
}>();

const type = props.type || "release";
const isAllOpen = ref(false);
const isAddOpen = ref(false);
const refreshSignal = ref(0);
</script>
