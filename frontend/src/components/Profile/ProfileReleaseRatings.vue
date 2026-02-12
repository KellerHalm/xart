<template>
  <div class="card-surface rounded-2xl p-5 sm:p-6">
    <div class="flex items-center justify-between">
      <h1 class="section-title text-xl">РћС†РµРЅРєРё</h1>
      <button
        class="btn-outline rounded-lg px-3 py-1 text-xs font-semibold"
        @click="modalOpen = true"
      >
        РџРѕСЃРјРѕС‚СЂРµС‚СЊ РІСЃРµ
      </button>
    </div>
    <div class="mt-4 flex flex-col gap-4">
      <router-link
        v-for="release in ratings"
        :key="`vote-${release.id}`"
        :to="`/release/${release.id}`"
        class="flex gap-2"
      >
        <div class="max-w-32">
          <Poster :image="release.image" />
        </div>
        <div class="flex flex-col gap-1">
          <h2 class="card-title text-base">{{ release.title_ru }}</h2>
          <div class="flex items-center gap-1">
            <span
              v-for="i in 5"
              :key="`vote-star-${release.id}-${i}`"
              class="iconify mdi--star"
              :class="release.my_vote >= i ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'"
            ></span>
          </div>
          <h2 class="card-subtitle">
            {{ unixToDate(release.voted_at, "full") }}
          </h2>
        </div>
      </router-link>
    </div>
    <ProfileReleaseRatingsModal
      :is-open="modalOpen"
      :profile-id="profileId"
      :token="token"
      @close="modalOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { unixToDate } from "@/api/utils";
import Poster from "@/components/ReleasePoster/Poster.vue";
import ProfileReleaseRatingsModal from "@/components/Profile/ProfileReleaseRatingsModal.vue";

defineProps<{
  ratings: any[];
  token: string | null;
  profileId: number;
}>();

const modalOpen = ref(false);
</script>



