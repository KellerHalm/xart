<template>
  <div>
    <article
      v-for="comment in content"
      :key="`comment-${comment.id}`"
      class="card-surface rounded-lg px-4 py-2 text-sm sm:text-base"
    >
      <footer class="mb-2 flex items-center justify-between">
        <div class="flex items-center gap-1">
          <router-link
            :to="`/profile/${comment.profile.id}`"
            class="mr-3 inline-flex items-center text-sm font-semibold text-gray-100 hover:underline"
          >
            <img :src="comment.profile.avatar" class="mr-2 h-6 w-6 rounded-full" alt="" />
            {{ comment.profile.login }}
          </router-link>
          <p class="text-sm text-gray-400">
            <time :datetime="comment.timestamp?.toString()" :title="unixToDate(comment.timestamp, 'full')">
              {{ sinceUnixDate(comment.timestamp) }}
            </time>
          </p>
          <p
            class="ml-4 min-w-8 rounded-md border px-1 py-0.5 text-center text-sm font-medium"
            :class="likeClass(comment.likes_count)"
          >
            {{ comment.likes_count }}
          </p>
        </div>
      </footer>
      <div class="relative flex flex-col py-2 overflow-hidden" :class="isHidden(comment) ? 'min-h-[4rem]' : ''">
        <router-link
          v-if="comment.release && typeof comment.release !== 'number'"
          :to="`/release/${comment.release.id}`"
        >
          <p class="whitespace-pre-wrap text-gray-300">
            {{
              !comment.isDeleted
                ? `К релизу: ${
                    comment.release.title_ru ||
                    comment.release.title_alt ||
                    comment.release.title_original
                  } (${comment.release.year || "?"}) >>`
                : ""
            }}
          </p>
        </router-link>
        <p class="whitespace-pre-wrap text-gray-200 transition-opacity" :class="isHidden(comment) ? 'opacity-0 select-none pointer-events-none' : 'opacity-100'" :aria-hidden="isHidden(comment)">
          {{ !comment.isDeleted ? comment.message : "Комментарий был удалён." }}
        </p>
        <button
          v-if="isHidden(comment)"
          class="absolute inset-0 z-10 flex h-full w-full p-1"
          @click="toggleHidden(comment.id)"
        >
          <div
            class="flex h-full w-full flex-col items-center justify-center rounded-md bg-black/50 px-3 py-2 text-center text-white backdrop-blur-[8px]"
          >
            <p>
              {{
                comment.likes_count < -5
                  ? "У комментария слишком низкий рейтинг."
                  : "Данный комментарий может содержать спойлер."
              }}
            </p>
            <p class="font-bold">Нажмите, чтобы прочитать</p>
          </div>
        </button>
      </div>
    </article>
    <p v-if="!content || content.length === 0" class="text-lg text-gray-400">
      Пользователь не оставлял комментарии
    </p>
  </div>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { sinceUnixDate, unixToDate } from "@/api/utils";

const props = defineProps<{
  content: any[];
  profileId: number;
}>();

const hiddenMap = reactive<Record<number, boolean>>({});

function isHidden(comment: any) {
  const hidden = comment.isSpoiler || comment.likes_count < -5;
  if (hiddenMap[comment.id] === false) return false;
  return hidden;
}

function toggleHidden(id: number) {
  hiddenMap[id] = false;
}

function likeClass(count: number) {
  if (count > 0) return "text-green-500 border-green-500 dark:text-green-400 dark:border-green-400";
  if (count < 0) return "text-red-500 border-red-500 dark:text-red-400 dark:border-red-400";
  return "text-gray-400 border-white/10";
}
</script>

