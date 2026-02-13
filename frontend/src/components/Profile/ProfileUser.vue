<template>
  <div class="card-surface rounded-2xl p-5 sm:p-6">
    <div
      v-if="showRoles"
      class="mb-4 flex flex-wrap gap-2"
    >
      <ProfileRole v-if="isMyProfile" :name="ui.roles.myProfile" color="3f83f8" />
      <ProfileRole v-if="isBlocked" :name="ui.roles.blocked" color="f56565" />
      <ProfileRole v-if="isVerified" :name="ui.roles.verified" color="0e9f6e" />
      <ProfileRole v-if="isSponsor" :name="ui.roles.sponsor" color="ecc94b" />
      <ProfileRole
        v-for="role in roles"
        :key="role.id"
        :name="role.name"
        :color="role.color"
      />
    </div>

    <div class="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <div class="relative h-20 w-20 flex-shrink-0">
        <img
          :src="avatar || fallbackAvatar"
          alt=""
          class="h-20 w-20 rounded-full border-2 object-cover"
          :class="isOnline ? 'border-green-500' : 'border-white/10'"
        />
        <span
          v-if="isOnline"
          class="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500 dark:border-slate-800"
        ></span>
      </div>
      <div class="flex flex-col gap-2">
        <p class="flex items-center gap-2 section-title text-xl">
          {{ login }}
          <span
            class="inline-flex h-6 min-w-8 items-center justify-center rounded-full px-2 text-xs font-semibold"
            :class="
              rating > 0
                ? 'chip-success'
                : 'chip-danger'
            "
          >
            {{ rating }}
          </span>
        </p>
        <p class="whitespace-pre-wrap text-sm text-gray-300 sm:text-base">{{ status }}</p>
      </div>
    </div>

    <div
      v-if="!isSocialHidden && hasSocials"
      class="mt-4 flex flex-wrap gap-2"
    >
      <a v-if="socials.vk" :href="`https://vk.com/${socials.vk}`" target="_blank" rel="noreferrer">
        <ProfileSocial :nickname="socials.vk" icon="fa6-brands--vk" color="4a76a8" />
      </a>
      <a v-if="socials.tg" :href="`https://t.me/${socials.tg}`" target="_blank" rel="noreferrer">
        <ProfileSocial :nickname="socials.tg" icon="fa6-brands--telegram" color="2aabee" />
      </a>
      <a v-if="socials.tt" :href="`https://tiktok.com/@${socials.tt}`" target="_blank" rel="noreferrer">
        <ProfileSocial
          :nickname="socials.tt"
          icon="fa6-brands--tiktok"
          :color="isDark ? 'ffffff' : '000000'"
        />
      </a>
      <a v-if="socials.inst" :href="`https://instagram.com/${socials.inst}`" target="_blank" rel="noreferrer">
        <ProfileSocial :nickname="socials.inst" icon="fa6-brands--instagram" color="c32aa3" />
      </a>
      <ProfileSocial
        v-if="socials.discord"
        :nickname="socials.discord"
        icon="fa6-brands--discord"
        color="5865f2"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { usePreferencesStore } from "@/store/preferences";
import ProfileRole from "@/components/Profile/ProfileRole.vue";
import ProfileSocial from "@/components/Profile/ProfileSocial.vue";

const props = defineProps<{
  avatar: string;
  login: string;
  status: string;
  rating: number;
  roles: { id: number; name: string; color: string }[];
  isMyProfile: boolean;
  isSponsor: boolean;
  isBlocked: boolean;
  isVerified: boolean;
  isOnline: boolean;
  socials: {
    vk: string | null;
    tg: string | null;
    tt: string | null;
    inst: string | null;
    discord: string | null;
  };
  isSocialHidden: boolean;
}>();

const ui = {
  roles: {
    myProfile: "\u041c\u043e\u0439 \u043f\u0440\u043e\u0444\u0438\u043b\u044c",
    blocked: "\u0417\u0430\u0431\u043b\u043e\u043a\u0438\u0440\u043e\u0432\u0430\u043d",
    verified: "\u0412\u0435\u0440\u0438\u0444\u0438\u0446\u0438\u0440\u043e\u0432\u0430\u043d",
    sponsor: "\u0421\u043f\u043e\u043d\u0441\u043e\u0440 Xart",
  },
};

const preferences = usePreferencesStore();

const isDark = computed(() => preferences.flags.theme === "dark");
const showRoles = computed(
  () =>
    props.isMyProfile ||
    props.isVerified ||
    props.isSponsor ||
    props.isBlocked ||
    (props.roles && props.roles.length > 0)
);

const hasSocials = computed(
  () =>
    !!props.socials.vk ||
    !!props.socials.tg ||
    !!props.socials.tt ||
    !!props.socials.inst ||
    !!props.socials.discord
);

const fallbackAvatar = "https://s.anixmirai.com/avatars/no_avatar.jpg";
</script>


