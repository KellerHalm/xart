<template>
  <div v-if="isLoading" class="flex min-h-screen items-center justify-center">
    <Spinner />
  </div>
  <div v-else-if="error" class="flex min-h-screen items-center justify-center">
    <div class="flex flex-col gap-4">
      <h1 class="text-2xl font-bold">{{ ui.errorTitle }}</h1>
      <p class="text-lg">
        {{ ui.errorText }}
      </p>
    </div>
  </div>
  <div v-else-if="user" class="space-y-4">
    <div class="flex flex-col gap-4">
      <ProfileBannedBanner
        :is-banned="user.is_banned"
        :is-perm-banned="user.is_perm_banned"
        :ban-reason="user.ban_reason"
        :ban-expires="user.ban_expires"
      />
      <ProfilePrivacyBanner
        :is-privacy="user.is_stats_hidden || user.is_counts_hidden || user.is_social_hidden"
        :is-me-blocked="user.is_me_blocked"
      />
    </div>

    <div
      class="grid grid-cols-1 gap-4 lg:grid-cols-2"
      :class="
        user.is_banned ||
        user.is_perm_banned ||
        user.is_stats_hidden ||
        user.is_counts_hidden ||
        user.is_social_hidden
          ? 'mt-4'
          : ''
      "
    >
      <div class="flex flex-col gap-4">
        <ProfileUser
          :avatar="user.avatar || ''"
          :login="user.login || ''"
          :status="user.status || ''"
          :roles="user.roles || []"
          :rating="user.rating_score || 0"
          :is-my-profile="isMyProfile"
          :is-verified="user.is_verified || false"
          :is-online="user.is_online || false"
          :is-sponsor="user.is_sponsor || false"
          :is-blocked="user.is_blocked || false"
          :socials="{
            vk: user.vk_page || null,
            tg: user.tg_page || null,
            tt: user.tt_page || null,
            inst: user.inst_page || null,
            discord: user.discord_page || null,
          }"
          :is-social-hidden="user.is_social_hidden"
        />

        <ProfileActions
          v-if="userStore.token"
          :is-my-profile="isMyProfile"
          :profile-id="user.id"
          :is-friend-requests-disallowed="user.is_friend_requests_disallowed"
          :friend-status="user.friend_status"
          :my-profile-id="userStore.user?.id || 0"
          :token="userStore.token"
          :is-me-blocked="user.is_me_blocked"
          :is-blocked="user.is_blocked"
          @toggle-edit="isEditOpen = !isEditOpen"
          @refresh="fetchProfile"
        />

        <ProfileActivity
          v-if="!user.is_counts_hidden"
          :profile-id="user.id"
          :comment-count="user.comment_count"
          :comment-preview="user.release_comments_preview || []"
          :collection-count="user.collection_count"
          :collection-preview="user.collections_preview || []"
          :friends-count="user.friend_count"
          :friends-preview="user.friends_preview || []"
          :token="userStore.token"
          :is-my-profile="isMyProfile"
        />

        <div v-if="!user.is_stats_hidden" class="hidden flex-col gap-4 lg:flex">
          <ProfileReleaseRatings
            v-if="user.votes && user.votes.length > 0"
            :ratings="user.votes"
            :token="userStore.token"
            :profile-id="user.id"
          />
        </div>
      </div>

      <div class="flex flex-col gap-4">
        <template v-if="!user.is_stats_hidden">
          <ProfileStats
            :lists="[
              user.watching_count,
              user.plan_count,
              user.completed_count,
              user.hold_on_count,
              user.dropped_count,
            ]"
            :watched-count="user.watched_episode_count"
            :watched-time="user.watched_time"
            :profile-id="user.id"
            :preferred-genres="user.preferred_genres || []"
            :preferred-audiences="user.preferred_audiences || []"
            :preferred-themes="user.preferred_themes || []"
          />
          <ProfileWatchDynamic :watch-dynamic="user.watch_dynamics || []" />
          <div class="flex flex-col gap-4 lg:hidden">
            <ProfileReleaseRatings
              v-if="user.votes && user.votes.length > 0"
              :ratings="user.votes"
              :token="userStore.token"
              :profile-id="user.id"
            />
          </div>
          <ProfileReleaseHistory v-if="user.history && user.history.length > 0" :history="user.history" />
        </template>
      </div>
    </div>

    <ProfileEditModal
      v-if="userStore.token"
      :is-open="isEditOpen && isMyProfile"
      :token="userStore.token"
      :profile-id="user.id"
      @close="isEditOpen = false"
      @refresh="fetchProfile"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { ENDPOINTS } from "@/api/config";
import { useUserStore } from "@/store/auth";
import Spinner from "@/components/Spinner.vue";
import ProfileUser from "@/components/Profile/ProfileUser.vue";
import ProfileBannedBanner from "@/components/Profile/ProfileBannedBanner.vue";
import ProfilePrivacyBanner from "@/components/Profile/ProfilePrivacyBanner.vue";
import ProfileActivity from "@/components/Profile/ProfileActivity.vue";
import ProfileStats from "@/components/Profile/ProfileStats.vue";
import ProfileWatchDynamic from "@/components/Profile/ProfileWatchDynamic.vue";
import ProfileActions from "@/components/Profile/ProfileActions.vue";
import ProfileReleaseRatings from "@/components/Profile/ProfileReleaseRatings.vue";
import ProfileReleaseHistory from "@/components/Profile/ProfileReleaseHistory.vue";
import ProfileEditModal from "@/components/Profile/ProfileEditModal.vue";

const route = useRoute();
const userStore = useUserStore();
const ui = {
  errorTitle: "\u041e\u0448\u0438\u0431\u043a\u0430",
  errorText:
    "\u041f\u0440\u043e\u0438\u0437\u043e\u0448\u043b\u0430 \u043e\u0448\u0438\u0431\u043a\u0430 \u043f\u0440\u0438 \u0437\u0430\u0433\u0440\u0443\u0437\u043a\u0435 \u043f\u0440\u043e\u0444\u0438\u043b\u044f. \u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u043e\u0431\u043d\u043e\u0432\u0438\u0442\u044c \u0441\u0442\u0440\u0430\u043d\u0438\u0446\u0443 \u0438\u043b\u0438 \u0437\u0430\u0439\u0434\u0438\u0442\u0435 \u043f\u043e\u0437\u0436\u0435.",
};

const user = ref<any | null>(null);
const isMyProfile = ref(false);
const isLoading = ref(true);
const error = ref(false);
const isEditOpen = ref(false);

async function fetchProfile() {
  const id = route.params.id;
  if (!id) return;
  isLoading.value = true;
  error.value = false;
  let url = `${ENDPOINTS.user.profile}/${id}`;
  if (userStore.token) {
    url += `?token=${userStore.token}`;
  }
  const res = await fetch(url);
  if (!res.ok) {
    error.value = true;
    isLoading.value = false;
    return;
  }
  const data = await res.json();
  user.value = data?.profile || null;
  isMyProfile.value = data?.is_my_profile || false;
  if (user.value?.login) {
    document.title = `Xart | ${user.value.login}`;
  }
  isLoading.value = false;
}

onMounted(fetchProfile);
watch(
  () => [route.params.id, userStore.token],
  () => fetchProfile()
);
</script>
