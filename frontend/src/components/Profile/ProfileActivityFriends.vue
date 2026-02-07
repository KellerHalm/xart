<template>
  <div class="max-w-full">
    <Swiper
      :modules="[Navigation, Mousewheel, Scrollbar]"
      :space-between="8"
      :slides-per-view="'auto'"
      direction="horizontal"
      :mousewheel="{ enabled: true, sensitivity: 4 }"
      :scrollbar="{ enabled: true, draggable: true }"
      :style="{ '--swiper-scrollbar-bottom': '0' }"
    >
      <SwiperSlide
        v-for="profile in content"
        :key="`friend-prev-${profile.id}`"
        class="w-fit px-2 py-4"
      >
        <router-link :to="`/profile/${profile.id}`">
          <div class="flex items-center gap-2">
            <img
              :src="profile.avatar"
              alt=""
              class="h-10 w-10 rounded-full border-2 object-cover"
              :class="profile.is_online ? 'border-green-500' : 'border-white/10'"
            />
            <p class="text-lg text-gray-200">{{ profile.login }}</p>
          </div>
        </router-link>
      </SwiperSlide>

      <SwiperSlide
        v-if="(content && content.length > 0) || isMyProfile"
        class="w-fit px-2 py-4"
      >
        <button
          class="btn-outline flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold"
          @click="isFriendModalOpen = true"
        >
          <p class="text-lg text-gray-200">Все друзья {{ isMyProfile ? "и заявки" : "" }}</p>
          <span class="iconify mdi--arrow-right h-6 w-6"></span>
        </button>
      </SwiperSlide>
    </Swiper>
    <p v-if="!content || content.length === 0" class="text-lg text-gray-400">
      У пользователя нет друзей
    </p>
  </div>

  <ProfileFriendsModal
    :is-open="isFriendModalOpen"
    :token="token"
    :is-my-profile="isMyProfile"
    :profile-id="profileId"
    @close="isFriendModalOpen = false"
  />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation, Mousewheel, Scrollbar } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/mousewheel";
import "swiper/css/scrollbar";
import ProfileFriendsModal from "@/components/Profile/ProfileFriendsModal.vue";

defineProps<{
  content: any[];
  token: string | null;
  isMyProfile: boolean;
  profileId: number;
}>();

const isFriendModalOpen = ref(false);
</script>



