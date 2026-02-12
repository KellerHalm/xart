<template>
  <div class="card-surface rounded-2xl p-5 sm:p-6">
    <p v-if="isRequestedStatus != null && !isRequestedStatus && friendStatusComputed !== 1" class="mb-2 text-sm">
      РћС‚РїСЂР°РІРёР»(-Р°) РІР°Рј Р·Р°СЏРІРєСѓ РІ РґСЂСѓР·СЊСЏ
    </p>
    <div class="flex flex-wrap gap-2">
      <button
        v-if="isMyProfile"
        class="btn-accent rounded-lg px-4 py-2 text-sm font-semibold"
        @click="toggleEdit"
      >
        Р РµРґР°РєС‚РёСЂРѕРІР°С‚СЊ
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
              ? "РЈРґР°Р»РёС‚СЊ РёР· РґСЂСѓР·РµР№"
              : isRequestedStatus
              ? "Р—Р°СЏРІРєР° РѕС‚РїСЂР°РІР»РµРЅР°"
              : "Р”РѕР±Р°РІРёС‚СЊ РІ РґСЂСѓР·СЊСЏ"
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
          {{ !isBlocked ? "Р—Р°Р±Р»РѕРєРёСЂРѕРІР°С‚СЊ" : "Р Р°Р·Р±Р»РѕРєРёСЂРѕРІР°С‚СЊ" }}
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

  const tid = toast.loading("Р”РѕР±Р°РІР»СЏРµРј РІ РґСЂСѓР·СЊСЏ...");

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
          ? "РћС€РёР±РєР° СѓРґР°Р»РµРЅРёСЏ РёР· РґСЂСѓР·РµР№"
          : "РћС€РёР±РєР° РґРѕР±Р°РІР»РµРЅРёСЏ РІ РґСЂСѓР·СЊСЏ",
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
        ? "РЈРґР°Р»РµРЅ РёР· РґСЂСѓР·РµР№"
        : "Р”РѕР±Р°РІР»РµРЅ РІ РґСЂСѓР·СЊСЏ",
    type: "success",
    autoClose: 2500,
    isLoading: false,
  });

  actionsDisabled.value = false;
}

async function addToBlocklist() {
  actionsDisabled.value = true;
  const tid = toast.loading(
    !props.isBlocked ? "Р‘Р»РѕРєРёСЂСѓРµРј РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ..." : "Р Р°Р·Р±Р»РѕРєРёСЂСѓРµРј РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ..."
  );

  let url = `${ENDPOINTS.user.profile}/blocklist`;
  url += !props.isBlocked ? "/add/" : "/remove/";
  url += `${props.profileId}?token=${props.token}`;

  const { error } = await tryCatchAPI(fetch(url));
  if (error) {
    toast.update(tid, {
      render: !props.isBlocked ? "РћС€РёР±РєР° Р±Р»РѕРєРёСЂРѕРІРєРё" : "РћС€РёР±РєР° СЂР°Р·Р±Р»РѕРєРёСЂРѕРІРєРё",
      type: "error",
      autoClose: 2500,
      isLoading: false,
    });
    actionsDisabled.value = false;
    return;
  }

  emit("refresh");

  toast.update(tid, {
    render: !props.isBlocked ? "РџРѕР»СЊР·РѕРІР°С‚РµР»СЊ Р·Р°Р±Р»РѕРєРёСЂРѕРІР°РЅ" : "РџРѕР»СЊР·РѕРІР°С‚РµР»СЊ СЂР°Р·Р±Р»РѕРєРёСЂРѕРІР°РЅ",
    type: "success",
    autoClose: 2500,
    isLoading: false,
  });

  actionsDisabled.value = false;
}
</script>



