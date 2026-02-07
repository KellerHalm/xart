<template>
  <div class="card-surface rounded-xl p-4">
    <p v-if="isRequestedStatus != null && !isRequestedStatus && friendStatusComputed !== 1" class="mb-2 text-sm">
      Отправил(-а) вам заявку в друзья
    </p>
    <div class="flex flex-wrap gap-2">
      <button
        v-if="isMyProfile"
        class="btn-accent rounded-lg px-4 py-2 text-sm font-semibold"
        @click="toggleEdit"
      >
        Редактировать
      </button>

      <template v-else>
        <button
          v-if="showFriendButton"
          class="rounded-lg px-4 py-2 text-sm font-semibold"
          :class="
            friendStatusComputed === 1
              ? 'btn-outline text-[#e04545] border-[#e04545] hover:bg-[#e04545]/15'
              : isRequestedStatus
              ? 'btn-outline'
              : 'btn-accent'
          "
          :disabled="actionsDisabled"
          @click="addToFriends"
        >
          {{
            friendStatusComputed === 1
              ? "Удалить из друзей"
              : isRequestedStatus
              ? "Заявка отправлена"
              : "Добавить в друзья"
          }}
        </button>
        <button
          class="rounded-lg px-4 py-2 text-sm font-semibold"
          :class="
            !isBlocked
              ? 'btn-outline text-[#e04545] border-[#e04545] hover:bg-[#e04545]/15'
              : 'btn-accent'
          "
          :disabled="actionsDisabled"
          @click="addToBlocklist"
        >
          {{ !isBlocked ? "Заблокировать" : "Разблокировать" }}
        </button>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { ENDPOINTS } from "@/api/config";
import { tryCatchAPI } from "@/api/utils";
import { toast } from "@/store/toast";

const emit = defineEmits<{
  (e: "refresh"): void;
  (e: "toggle-edit"): void;
}>();

const props = defineProps<{
  isMyProfile: boolean;
  isFriendRequestsDisallowed: boolean;
  profileId: number;
  myProfileId: number;
  friendStatus: number | null;
  token: string;
  isMeBlocked: boolean;
  isBlocked: boolean;
}>();

const actionsDisabled = ref(false);
const profileIdIsSmaller = computed(() => props.myProfileId < props.profileId);

const friendStatusComputed = computed(() => {
  const num = props.friendStatus;
  if (num == null) return null;
  let z = true;
  if (num === 2) return 1;
  const z3 =
    (num === 0 && profileIdIsSmaller.value) ||
    (num === 1 && !profileIdIsSmaller.value);
  if (
    (num !== 1 || profileIdIsSmaller.value) &&
    (num !== 0 || !profileIdIsSmaller.value)
  ) {
    z = false;
  }
  if (z3) return 2;
  if (z) return 3;
  return 0;
});

const isRequestedStatus = computed(() => {
  if (friendStatusComputed.value == null) return null;
  if (profileIdIsSmaller.value) {
    return profileIdIsSmaller.value && friendStatusComputed.value !== 0;
  }
  return !profileIdIsSmaller.value && friendStatusComputed.value === 2;
});

const showFriendButton = computed(() => {
  return (
    (!props.isFriendRequestsDisallowed ||
      friendStatusComputed.value === 1 ||
      isRequestedStatus.value) &&
    !props.isMeBlocked &&
    !props.isBlocked
  );
});

function toggleEdit() {
  emit("toggle-edit");
}

async function addToFriends() {
  actionsDisabled.value = true;

  const tid = toast.loading("Добавляем в друзья...");

  let url = `${ENDPOINTS.user.profile}/friend/request`;
  if (friendStatusComputed.value === 1 || isRequestedStatus.value) {
    url += "/remove/";
  } else {
    url += "/send/";
  }
  url += `${props.profileId}?token=${props.token}`;

  const { error } = await tryCatchAPI(fetch(url));
  if (error) {
    toast.update(tid, {
      render:
        friendStatusComputed.value === 1 || isRequestedStatus.value
          ? "Ошибка удаления из друзей"
          : "Ошибка добавления в друзья",
      type: "error",
      autoClose: 2500,
      isLoading: false,
    });
    actionsDisabled.value = false;
    return;
  }

  emit("refresh");

  toast.update(tid, {
    render:
      friendStatusComputed.value === 1 || isRequestedStatus.value
        ? "Удален из друзей"
        : "Добавлен в друзья",
    type: "success",
    autoClose: 2500,
    isLoading: false,
  });

  actionsDisabled.value = false;
}

async function addToBlocklist() {
  actionsDisabled.value = true;
  const tid = toast.loading(
    !props.isBlocked ? "Блокируем пользователя..." : "Разблокируем пользователя..."
  );

  let url = `${ENDPOINTS.user.profile}/blocklist`;
  url += !props.isBlocked ? "/add/" : "/remove/";
  url += `${props.profileId}?token=${props.token}`;

  const { error } = await tryCatchAPI(fetch(url));
  if (error) {
    toast.update(tid, {
      render: !props.isBlocked ? "Ошибка блокировки" : "Ошибка разблокировки",
      type: "error",
      autoClose: 2500,
      isLoading: false,
    });
    actionsDisabled.value = false;
    return;
  }

  emit("refresh");

  toast.update(tid, {
    render: !props.isBlocked ? "Пользователь заблокирован" : "Пользователь разблокирован",
    type: "success",
    autoClose: 2500,
    isLoading: false,
  });

  actionsDisabled.value = false;
}
</script>


