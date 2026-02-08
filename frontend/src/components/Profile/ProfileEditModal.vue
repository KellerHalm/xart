<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
    <div class="max-h-[90vh] w-full max-w-5xl overflow-hidden rounded-xl border border-white/10 bg-[#1f2123] shadow-xl">
      <div class="flex items-center justify-between border-b border-white/10 px-6 py-4 dark:border-white/10">
        <h2 class="section-title text-xl">Редактирование профиля</h2>
        <button class="text-gray-400 hover:text-white" @click="emit('close')">
          ✕
        </button>
      </div>
      <div class="max-h-[75vh] overflow-y-auto px-6 py-4">
        <div v-if="prefLoading" class="py-10">
          <Spinner />
        </div>
        <div v-else class="flex flex-col gap-4">
          <div class="flex flex-col gap-2 border-b border-white/10 pb-4">
            <div class="flex items-center gap-2">
              <span class="iconify mdi--user h-6 w-6"></span>
              <p class="section-title text-xl">Профиль</p>
            </div>
            <button
              class="rounded-md p-2 text-left hover:bg-white/10"
              :disabled="prefData?.is_change_avatar_banned"
            >
              <label class="cursor-pointer">
                <input
                  type="file"
                  class="hidden"
                  accept="image/jpg, image/jpeg, image/png"
                  @change="handleAvatarPreview"
                />
                <div>
                  <p class="text-lg">зменить фото профиля</p>
                  <p class="text-base text-gray-400">
                    {{
                      prefData?.is_change_avatar_banned
                        ? `Заблокировано до ${unixToDate(prefData.ban_change_avatar_expires, "full")}`
                        : "Загрузить с устройства"
                    }}
                  </p>
                </div>
              </label>
            </button>
            <button
              class="rounded-md p-2 text-left hover:bg-white/10"
              @click="statusModalOpen = true"
            >
              <p class="text-lg">зменить статус</p>
              <p class="whitespace-pre text-base text-gray-400">{{ status }}</p>
            </button>
            <button
              class="rounded-md p-2 text-left hover:bg-white/10"
              :disabled="prefData?.is_change_login_banned"
              @click="loginModalOpen = true"
            >
              <p class="text-lg">зменить никнейм</p>
              <p class="text-base text-gray-400">
                {{
                  prefData?.is_change_login_banned
                    ? `Заблокировано до ${unixToDate(prefData.ban_change_login_expires, "full")}`
                    : login
                }}
              </p>
            </button>
            <button
              class="rounded-md p-2 text-left hover:bg-white/10"
              @click="socialModalOpen = true"
            >
              <p class="text-lg">Мои социальные сети</p>
              <p class="text-base text-gray-400">
                укажите ссылки на свои страницы в соц. сетях
              </p>
            </button>
          </div>

          <div class="flex flex-col gap-2 border-b border-white/10 pb-4">
            <div class="flex items-center gap-2">
              <span class="iconify mdi--anonymous h-6 w-6"></span>
              <p class="section-title text-xl">Приватность</p>
            </div>
            <button
              class="rounded-md p-2 text-left hover:bg-white/10"
              @click="openPrivacy('privacy_stats')"
            >
              <p class="text-lg">Кто видит мою статистику, оценки и историю просмотра</p>
              <p class="text-base text-gray-400">
                {{ privacyStatActSocialText[privacySettings.privacy_stats] }}
              </p>
            </button>
            <button
              class="rounded-md p-2 text-left hover:bg-white/10"
              @click="openPrivacy('privacy_counts')"
            >
              <p class="text-lg">
                Кто видит в профиле мои комментарии, коллекции, видео и друзей
              </p>
              <p class="text-base text-gray-400">
                {{ privacyStatActSocialText[privacySettings.privacy_counts] }}
              </p>
            </button>
            <button
              class="rounded-md p-2 text-left hover:bg-white/10"
              @click="openPrivacy('privacy_social')"
            >
              <p class="text-lg">Кто видит в профиле мои социальные сети</p>
              <p class="text-base text-gray-400">
                {{ privacyStatActSocialText[privacySettings.privacy_social] }}
              </p>
            </button>
            <button
              class="rounded-md p-2 text-left hover:bg-white/10"
              @click="openPrivacy('privacy_friend_requests')"
            >
              <p class="text-lg">Кто может отправлять мне заявки в друзья</p>
              <p class="text-base text-gray-400">
                {{ privacyFriendReqText[privacySettings.privacy_friend_requests] }}
              </p>
            </button>
            <button
              class="rounded-md p-2 text-left hover:bg-white/10"
              @click="blockedModalOpen = true"
            >
              <p class="text-lg">Блоклист</p>
              <p class="text-base text-gray-400">
                Список пользователей, которым запрещён доступ к вашей странице
              </p>
            </button>
          </div>

          <div>
            <div class="flex items-center gap-2">
              <span class="iconify mdi--link h-6 w-6"></span>
              <p class="section-title text-xl">Привязка к сервисам</p>
            </div>
            <p class="mx-1 text-base text-gray-400">
              Недоступно для изменения в данном клиенте
            </p>
            <div class="mt-2 cursor-not-allowed rounded-md p-2">
              <p class="text-lg">Связанные аккаунты</p>
              <p class="text-base text-gray-400">
                {{
                  socialBounds.vk || socialBounds.google
                    ? "Аккаунт привязан к:"
                    : "не привязан к сервисам"
                }}
                <span v-if="socialBounds.vk">ВК</span>
                <span v-if="socialBounds.vk && socialBounds.google">, </span>
                <span v-if="socialBounds.google">Google</span>
              </p>
            </div>
          </div>
        </div>
      </div>
      <div class="flex items-center justify-end gap-2 border-t border-white/10 px-6 py-4 dark:border-white/10">
        <button
          class="btn-accent rounded-lg px-4 py-2 text-sm font-semibold"
          @click="emit('close')"
        >
          Готово
        </button>
      </div>
    </div>
  </div>

  <ProfileEditPrivacyModal
    v-if="token"
    :is-open="privacyModalOpen"
    :token="token"
    :setting="privacyModalSetting"
    :privacy-settings="privacySettings"
    @close="privacyModalOpen = false"
    @update="updatePrivacySettings"
  />
  <ProfileEditStatusModal
    v-if="token"
    :is-open="statusModalOpen"
    :token="token"
    :status="status"
    :profile-id="profileId"
    @close="statusModalOpen = false"
    @update="status = $event"
    @refresh="emit('refresh')"
  />
  <ProfileEditSocialModal
    v-if="token"
    :is-open="socialModalOpen"
    :token="token"
    :profile-id="profileId"
    @close="socialModalOpen = false"
    @refresh="emit('refresh')"
  />
  <CropModal
    v-if="token"
    :is-open="avatarModalProps.isOpen"
    :is-actions-disabled="avatarModalProps.isActionsDisabled"
    :selected-image="avatarModalProps.selectedImage"
    :cropped-image="avatarModalProps.croppedImage"
    :crop-params="{
      aspectRatio: 1 / 1,
      forceAspect: true,
      guides: true,
      width: 600,
      height: 600,
    }"
    @update="setAvatarModalProps"
  />
  <ProfileEditLoginModal
    v-if="token"
    :is-open="loginModalOpen"
    :token="token"
    :profile-id="profileId"
    @close="loginModalOpen = false"
    @update="login = $event"
    @refresh="emit('refresh')"
  />
  <ProfileBlockedUsersModal
    v-if="token"
    :is-open="blockedModalOpen"
    :token="token"
    :profile-id="profileId"
    @close="blockedModalOpen = false"
  />
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { ENDPOINTS } from "@/api/config";
import { b64toBlob, tryCatchAPI, unixToDate } from "@/api/utils";
import { toast } from "@/store/toast";
import { useUserStore } from "@/store/auth";
import Spinner from "@/components/Spinner.vue";
import CropModal from "@/components/CropModal.vue";
import ProfileEditPrivacyModal from "@/components/Profile/ProfileEditPrivacyModal.vue";
import ProfileEditStatusModal from "@/components/Profile/ProfileEditStatusModal.vue";
import ProfileEditSocialModal from "@/components/Profile/ProfileEditSocialModal.vue";
import ProfileEditLoginModal from "@/components/Profile/ProfileEditLoginModal.vue";
import ProfileBlockedUsersModal from "@/components/Profile/ProfileBlockedUsersModal.vue";

const props = defineProps<{
  isOpen: boolean;
  token: string | null;
  profileId: number;
}>();

const emit = defineEmits<{ (e: "close"): void; (e: "refresh"): void }>();

type PrivacySettingKey =
  | "privacy_stats"
  | "privacy_counts"
  | "privacy_social"
  | "privacy_friend_requests"
  | "none";

const privacyModalOpen = ref(false);
const statusModalOpen = ref(false);
const socialModalOpen = ref(false);
const loginModalOpen = ref(false);
const blockedModalOpen = ref(false);
const privacyModalSetting = ref<PrivacySettingKey>("none");
const privacySettings = ref({
  privacy_stats: 9,
  privacy_counts: 9,
  privacy_social: 9,
  privacy_friend_requests: 9,
});
const socialBounds = ref({ vk: false, google: false });
const status = ref("");
const login = ref("");
const prefData = ref<any>(null);
const prefLoading = ref(false);
const userStore = useUserStore();

const avatarModalProps = ref({
  isOpen: false,
  isActionsDisabled: false,
  selectedImage: null as string | null,
  croppedImage: null as string | null,
});

const privacyStatActSocialText: Record<number, string> = {
  0: "Все пользователи",
  1: "Только друзья",
  2: "Только я",
  9: "Неизвестно",
};
const privacyFriendReqText: Record<number, string> = {
  0: "Все пользователи",
  1: "Никто",
  9: "Неизвестно",
};

function setAvatarModalProps(next: any) {
  avatarModalProps.value = { ...next };
}

function openPrivacy(setting: PrivacySettingKey) {
  privacyModalSetting.value = setting;
  privacyModalOpen.value = true;
}

function updatePrivacySettings(value: any) {
  privacySettings.value = value;
}

async function fetchPrefs() {
  if (!props.token) return;
  prefLoading.value = true;
  const { data, error } = await tryCatchAPI(
    fetch(`${ENDPOINTS.user.settings.my}?token=${props.token}`)
  );
  if (!error) {
    prefData.value = data;
    privacySettings.value = {
      privacy_stats: data.privacy_stats,
      privacy_counts: data.privacy_counts,
      privacy_social: data.privacy_social,
      privacy_friend_requests: data.privacy_friend_requests,
    };
    socialBounds.value = {
      vk: data.is_vk_bound || data.isVkBound || false,
      google: data.is_google_bound || data.isGoogleBound || false,
    };
    status.value = data.status;
  }
  prefLoading.value = false;
}

async function fetchLogin() {
  if (!props.token) return;
  const { data, error } = await tryCatchAPI(
    fetch(`${ENDPOINTS.user.settings.login.info}?token=${props.token}`)
  );
  if (!error) {
    login.value = data.login;
  }
}

function handleAvatarPreview(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;
  const fileReader = new FileReader();
  fileReader.onloadend = () => {
    const content = fileReader.result as string;
    avatarModalProps.value = {
      ...avatarModalProps.value,
      isOpen: true,
      selectedImage: content,
    };
    target.value = "";
  };
  fileReader.readAsDataURL(file);
}

async function uploadAvatar() {
  const image = avatarModalProps.value.croppedImage;
  if (!image || !props.token) return;

  const block = image.split(";");
  const contentType = block[0]?.split(":")[1];
  const rawPayload = block[1]?.split(",")[1];
  if (!contentType || !rawPayload) {
    avatarModalProps.value = {
      ...avatarModalProps.value,
      isActionsDisabled: false,
    };
    return;
  }
  const blob = b64toBlob(rawPayload, contentType);

  const formData = new FormData();
  formData.append("image", blob, "cropped.jpg");
  formData.append("name", "image");

  avatarModalProps.value = {
    ...avatarModalProps.value,
    isActionsDisabled: true,
  };

  const tid = toast.loading("Обновление аватара...");
  const { error } = await tryCatchAPI(
    fetch(`${ENDPOINTS.user.settings.avatar}?token=${props.token}`, {
      method: "POST",
      body: formData,
    })
  );

  if (error) {
    toast.update(tid, {
      render: "Ошибка обновления аватара",
      type: "error",
      autoClose: 2500,
      isLoading: false,
    });
    avatarModalProps.value = {
      ...avatarModalProps.value,
      isActionsDisabled: false,
    };
    return;
  }

  toast.update(tid, {
    render: "Аватар обновлён",
    type: "success",
    autoClose: 2500,
    isLoading: false,
  });
  avatarModalProps.value = {
    isOpen: false,
    isActionsDisabled: false,
    selectedImage: null,
    croppedImage: null,
  };
  emit("refresh");
  userStore.checkAuth();
}

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      fetchPrefs();
      fetchLogin();
    }
  }
);

watch(
  () => avatarModalProps.value.croppedImage,
  (value) => {
    if (value) {
      uploadAvatar();
    }
  }
);

onMounted(() => {
  if (props.isOpen) {
    fetchPrefs();
    fetchLogin();
  }
});
</script>




