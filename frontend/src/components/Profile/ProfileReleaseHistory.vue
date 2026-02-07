<template>
  <div class="card-surface rounded-xl p-4">
    <h1 class="section-title text-xl">Недавно просмотренные</h1>
    <div class="mt-4 flex flex-col gap-4">
      <router-link
        v-for="release in history"
        :key="`history-${release.id}`"
        :to="`/release/${release.id}`"
        class="flex gap-2"
      >
        <div class="w-32 flex-shrink-0">
          <Poster :image="release.image" className="h-auto" />
        </div>
        <div class="flex flex-col gap-1">
          <ReleaseChips
            :grade="release.grade ? Number(release.grade.toFixed(1)) : null"
            :status="release.status"
            :status-id="release.status_id"
            :user-list="userList(release.profile_list_status)"
            :episodes-released="release.episodes_released"
            :episodes-total="release.episodes_total"
            :category="release.category"
            :is-favorite="release.is_favorite"
            :last-view-episode="release.last_view_episode"
            :last-view-timestamp="release.last_view_timestamp"
            :settings="{ lastWatchedHidden: false }"
          />
          <div>
            <span
              v-for="(genre, index) in parseGenres(release.genres)"
              :key="`release_${release.id}_genre_${genre}_${index}`"
              class="text-sm text-gray-400"
            >
              <span v-if="index > 0">, </span>{{ genre }}
            </span>
          </div>
          <p v-if="release.title_ru" class="card-title text-base">
            {{ release.title_ru }}
          </p>
          <p v-if="release.title_original" class="card-subtitle">
            {{ release.title_original }}
          </p>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import Poster from "@/components/ReleasePoster/Poster.vue";
import ReleaseChips from "@/components/ReleasePoster/Chips.vue";

defineProps<{ history: any[] }>();

const profileLists: Record<number, { name: string; bg_color: string }> = {
  1: { name: "Смотрю", bg_color: "chip-info" },
  2: { name: "В планах", bg_color: "chip-muted" },
  3: { name: "Просмотрено", bg_color: "chip-success" },
  4: { name: "Отложено", bg_color: "chip-warning" },
  5: { name: "Брошено", bg_color: "chip-danger" },
};

function userList(status?: number) {
  if (!status || status === 0) return null;
  return profileLists[status] || null;
}

function parseGenres(genres?: string) {
  if (!genres) return [];
  return genres.split(",").map((genre) => genre.trim());
}
</script>


