<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
    <div class="w-full max-w-3xl rounded-xl border border-white/10 bg-[#1f2123] shadow-xl">
      <div class="flex items-center justify-between border-b border-white/10 px-6 py-4 dark:border-white/10">
        <h2 class="section-title text-xl">{{ settingText }}</h2>
        <button class="text-gray-400 hover:text-white" @click="emit('close')">
          ✕
        </button>
      </div>
      <div class="p-6">
        <div v-if="setting !== 'none'" class="flex flex-col gap-3">
          <label class="flex items-center gap-2">
            <input
              type="radio"
              class="h-4 w-4"
              :name="setting"
              :value="0"
              :checked="privacySettings[setting] === 0"
              :disabled="loading"
              @change="setPrivacySetting"
            />
            <span>Все пользователи</span>
          </label>
          <label v-if="setting === 'privacy_friend_requests'" class="flex items-center gap-2">
            <input
              type="radio"
              class="h-4 w-4"
              :name="setting"
              :value="1"
              :checked="privacySettings[setting] === 1"
              :disabled="loading"
              @change="setPrivacySetting"
            />
            <span>Никто</span>
          </label>
          <template v-else>
            <label class="flex items-center gap-2">
              <input
                type="radio"
                class="h-4 w-4"
                :name="setting"
                :value="1"
                :checked="privacySettings[setting] === 1"
                :disabled="loading"
                @change="setPrivacySetting"
              />
              <span>Только друзья</span>
            </label>
            <label class="flex items-center gap-2">
              <input
                type="radio"
                class="h-4 w-4"
                :name="setting"
                :value="2"
                :checked="privacySettings[setting] === 2"
                :disabled="loading"
                @change="setPrivacySetting"
              />
              <span>Только я</span>
            </label>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { ENDPOINTS } from "@/api/config";
import { tryCatchAPI } from "@/api/utils";
import { toast } from "@/store/toast";

type PrivacySettingKey =
  | "privacy_stats"
  | "privacy_counts"
  | "privacy_social"
  | "privacy_friend_requests"
  | "none";

const props = defineProps<{
  isOpen: boolean;
  token: string;
  setting: PrivacySettingKey;
  privacySettings: Record<string, number> & {
    privacy_stats: number;
    privacy_counts: number;
    privacy_social: number;
    privacy_friend_requests: number;
  };
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "update", value: any): void;
}>();

const loading = ref(false);

const settingTextMap: Record<string, string> = {
  privacy_stats: "Кто видит мою статистику, оценки и историю просмотра",
  privacy_counts:
    "Кто видит в профиле мои комментарии, коллекции, видео и друзей",
  privacy_social: "Кто видит в профиле мои социальные сети",
  privacy_friend_requests: "Кто может отправлять мне заявки в друзья",
  none: "",
};

const settingText = computed(() => settingTextMap[props.setting] || "");

async function setPrivacySetting(event: Event) {
  const target = event.target as HTMLInputElement;
  loading.value = true;
  const tid = toast.loading("Обновление настроек приватности...");

  const endpoints: Record<string, string> = {
    privacy_stats: `${ENDPOINTS.user.settings.privacy.stats}?token=${props.token}`,
    privacy_counts: `${ENDPOINTS.user.settings.privacy.counts}?token=${props.token}`,
    privacy_social: `${ENDPOINTS.user.settings.privacy.socials}?token=${props.token}`,
    privacy_friend_requests: `${ENDPOINTS.user.settings.privacy.friendRequests}?token=${props.token}`,
  };

  const endpoint = endpoints[props.setting];
  if (!endpoint) {
    loading.value = false;
    return;
  }
  const { error } = await tryCatchAPI(
    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ permission: target.value }),
    })
  );

  if (error) {
    toast.update(tid, {
      render: "Ошибка обновления настроек приватности",
      type: "error",
      autoClose: 2500,
      isLoading: false,
    });
    loading.value = false;
    return;
  }

  toast.update(tid, {
    render: "Настройки приватности обновлены",
    type: "success",
    autoClose: 2500,
    isLoading: false,
  });

  const updated = { ...props.privacySettings, [target.name]: Number(target.value) };
  emit("update", updated);
  loading.value = false;
  emit("close");
}
</script>




