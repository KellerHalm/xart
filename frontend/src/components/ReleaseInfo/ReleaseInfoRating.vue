<template>
  <div class="rounded-xl border border-white/10 bg-[#222426]/90 p-4 shadow">
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center gap-2">
        <span class="iconify mdi--star h-5 w-5 text-yellow-400"></span>
        <p class="text-sm font-bold text-gray-100">{{ grade.toFixed(2) }} из 5</p>
      </div>
      <div v-if="token" class="flex items-center gap-2 text-sm text-gray-400">
        <span v-if="userVote">ваша оценка: {{ userVote }}</span>
        <button
          class="rounded-full border border-white/10 px-2 py-0.5 text-xs text-gray-200 hover:bg-white/10"
          @click="isModalOpen = true"
        >
          {{ userVote ? "изменить" : "оценить" }}
        </button>
      </div>
    </div>
    <p class="text-sm font-medium text-gray-400">
      {{ votes.total }} {{ numberDeclension(votes.total, "голос", "голоса", "голосов") }}
    </p>
    <div class="mt-3 space-y-2">
      <div v-for="score in [5,4,3,2,1]" :key="score" class="flex items-center gap-2">
        <span class="w-4 text-sm">{{ score }}</span>
        <div class="flex-1 rounded bg-[#2a2d2f]">
          <div class="h-3 rounded bg-gradient-to-r from-[#f4c313] to-[#d79a00]" :style="{ width: `${percent(score)}%` }"></div>
        </div>
        <span class="w-10 text-right text-xs text-gray-400">{{ percent(score) }}%</span>
      </div>
    </div>
  </div>

  <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
    <div class="w-full max-w-md rounded-xl border border-white/10 bg-[#1f2022] p-6 shadow">
      <div class="flex items-center justify-between border-b border-white/10 pb-3">
        <h2 class="text-lg font-bold">Оценка</h2>
        <button class="text-gray-400 hover:text-[#d21c22]" @click="isModalOpen = false">✕</button>
      </div>
      <div class="mt-4 flex items-center justify-center gap-2">
        <button
          v-for="score in [1,2,3,4,5]"
          :key="score"
          class="text-yellow-400"
          @mouseover="hoverScore = score"
          @mouseleave="hoverScore = 0"
          @click="selectedVote = score"
        >
          <span
            class="iconify"
            :class="(score <= hoverScore || score <= currentVote) ? 'mdi--star' : 'mdi--star-outline'"
          ></span>
        </button>
      </div>
      <div class="mt-6 flex justify-end gap-2">
        <button
          class="rounded-lg bg-[#2a2d2f] px-4 py-2 text-sm text-gray-200 hover:bg-[#3a3d40]"
          :disabled="isSending"
          @click="removeVote"
        >
          Убрать оценку
        </button>
        <button
          class="rounded-lg bg-[#d21c22] px-4 py-2 text-sm text-white hover:bg-[#b01218]"
          :disabled="isSending || selectedVote === null"
          @click="submitVote"
        >
          Оценить
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { ENDPOINTS } from "@/api/config";
import { numberDeclension } from "@/api/utils";

const props = defineProps<{
  releaseId: number;
  grade: number;
  token: string | null;
  votes: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
    total: number;
    user: number | null;
  };
}>();

const isModalOpen = ref(false);
const hoverScore = ref(0);
const selectedVote = ref<number | null>(props.votes.user ?? null);
const userVote = ref<number | null>(props.votes.user ?? null);
const isSending = ref(false);
const currentVote = computed(() => selectedVote.value ?? 0);

function percent(score: number) {
  if (!props.votes.total) return 0;
  const votesByScore = props.votes as Record<number, number>;
  const count = votesByScore[score] ?? 0;
  return Math.floor((count / props.votes.total) * 100);
}

watch(
  () => props.votes.user,
  (value) => {
    selectedVote.value = value ?? null;
    userVote.value = value ?? null;
  }
);

async function sendVote(action: "delete" | "add", vote: number | null) {
  if (!props.token) return;
  let url = `${ENDPOINTS.release.info}/vote/${action}/${props.releaseId}`;
  if (action === "add" && vote !== null) {
    url += `/${vote}`;
  }
  url += `?token=${props.token}`;
  await fetch(url);
}

async function removeVote() {
  if (!props.token) return;
  isSending.value = true;
  await sendVote("delete", null);
  userVote.value = null;
  selectedVote.value = null;
  isModalOpen.value = false;
  isSending.value = false;
}

async function submitVote() {
  if (!props.token || selectedVote.value === null) return;
  isSending.value = true;
  await sendVote("delete", null);
  setTimeout(async () => {
    await sendVote("add", selectedVote.value);
    userVote.value = selectedVote.value;
    isModalOpen.value = false;
    isSending.value = false;
  }, 500);
}
</script>
