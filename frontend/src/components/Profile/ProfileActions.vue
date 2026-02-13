<template>
  <div class="card-surface rounded-2xl p-5 sm:p-6">
    <p v-if="isRequestedStatus != null && !isRequestedStatus && friendStatusComputed !== 1" class="mb-2 text-sm">
      {{ ui.incomingRequest }}
    </p>
    <div class="flex flex-wrap gap-2">
      <button
        v-if="isMyProfile"
        class="btn-accent rounded-lg px-4 py-2 text-sm font-semibold"
        @click="toggleEdit"
      >
        {{ ui.edit }}
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
              ? ui.removeFriend
              : isRequestedStatus
              ? ui.requestSent
              : ui.addFriend
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
          {{ !isBlocked ? ui.block : ui.unblock }}
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

const ui = {
  incomingRequest: "\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u043b(-\u0430) \u0432\u0430\u043c \u0437\u0430\u044f\u0432\u043a\u0443 \u0432 \u0434\u0440\u0443\u0437\u044c\u044f",
  edit: "\u0420\u0435\u0434\u0430\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u0442\u044c",
  removeFriend: "\u0423\u0434\u0430\u043b\u0438\u0442\u044c \u0438\u0437 \u0434\u0440\u0443\u0437\u0435\u0439",
  requestSent: "\u0417\u0430\u044f\u0432\u043a\u0430 \u043e\u0442\u043f\u0440\u0430\u0432\u043b\u0435\u043d\u0430",
  addFriend: "\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u0432 \u0434\u0440\u0443\u0437\u044c\u044f",
  block: "\u0417\u0430\u0431\u043b\u043e\u043a\u0438\u0440\u043e\u0432\u0430\u0442\u044c",
  unblock: "\u0420\u0430\u0437\u0431\u043b\u043e\u043a\u0438\u0440\u043e\u0432\u0430\u0442\u044c",
  toast: {
    addFriendLoading: "\u0414\u043e\u0431\u0430\u0432\u043b\u044f\u0435\u043c \u0432 \u0434\u0440\u0443\u0437\u044c\u044f...",
    removeFriendError: "\u041e\u0448\u0438\u0431\u043a\u0430 \u0443\u0434\u0430\u043b\u0435\u043d\u0438\u044f \u0438\u0437 \u0434\u0440\u0443\u0437\u0435\u0439",
    addFriendError: "\u041e\u0448\u0438\u0431\u043a\u0430 \u0434\u043e\u0431\u0430\u0432\u043b\u0435\u043d\u0438\u044f \u0432 \u0434\u0440\u0443\u0437\u044c\u044f",
    removeFriendSuccess: "\u0423\u0434\u0430\u043b\u0435\u043d \u0438\u0437 \u0434\u0440\u0443\u0437\u0435\u0439",
    addFriendSuccess: "\u0414\u043e\u0431\u0430\u0432\u043b\u0435\u043d \u0432 \u0434\u0440\u0443\u0437\u044c\u044f",
    blockLoading: "\u0411\u043b\u043e\u043a\u0438\u0440\u0443\u0435\u043c \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044f...",
    unblockLoading: "\u0420\u0430\u0437\u0431\u043b\u043e\u043a\u0438\u0440\u0443\u0435\u043c \u043f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044f...",
    blockError: "\u041e\u0448\u0438\u0431\u043a\u0430 \u0431\u043b\u043e\u043a\u0438\u0440\u043e\u0432\u043a\u0438",
    unblockError: "\u041e\u0448\u0438\u0431\u043a\u0430 \u0440\u0430\u0437\u0431\u043b\u043e\u043a\u0438\u0440\u043e\u0432\u043a\u0438",
    blockSuccess: "\u041f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044c \u0437\u0430\u0431\u043b\u043e\u043a\u0438\u0440\u043e\u0432\u0430\u043d",
    unblockSuccess: "\u041f\u043e\u043b\u044c\u0437\u043e\u0432\u0430\u0442\u0435\u043b\u044c \u0440\u0430\u0437\u0431\u043b\u043e\u043a\u0438\u0440\u043e\u0432\u0430\u043d",
  },
};

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

  const tid = toast.loading(ui.toast.addFriendLoading);

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
          ? ui.toast.removeFriendError
          : ui.toast.addFriendError,
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
        ? ui.toast.removeFriendSuccess
        : ui.toast.addFriendSuccess,
    type: "success",
    autoClose: 2500,
    isLoading: false,
  });

  actionsDisabled.value = false;
}

async function addToBlocklist() {
  actionsDisabled.value = true;
  const tid = toast.loading(
    !props.isBlocked ? ui.toast.blockLoading : ui.toast.unblockLoading
  );

  let url = `${ENDPOINTS.user.profile}/blocklist`;
  url += !props.isBlocked ? "/add/" : "/remove/";
  url += `${props.profileId}?token=${props.token}`;

  const { error } = await tryCatchAPI(fetch(url));
  if (error) {
    toast.update(tid, {
      render: !props.isBlocked ? ui.toast.blockError : ui.toast.unblockError,
      type: "error",
      autoClose: 2500,
      isLoading: false,
    });
    actionsDisabled.value = false;
    return;
  }

  emit("refresh");

  toast.update(tid, {
    render: !props.isBlocked ? ui.toast.blockSuccess : ui.toast.unblockSuccess,
    type: "success",
    autoClose: 2500,
    isLoading: false,
  });

  actionsDisabled.value = false;
}
</script>


