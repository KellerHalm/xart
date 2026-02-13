<template>
  <div class="rounded-xl border border-white/10 bg-[#222426]/90 p-4 shadow">
    <div class="mb-3 flex items-center justify-between">
      <p class="text-xs uppercase tracking-[0.14em] text-gray-400">{{ ui.quickActions }}</p>
      <router-link
        :to="`/release/${releaseId}/collections`"
        class="text-xs font-semibold text-[#f1b9b9] hover:text-[#d21c22]"
      >
        {{ ui.allCollections }}
      </router-link>
    </div>

    <div class="flex flex-wrap gap-2">
      <router-link
        :to="`/release/${releaseId}/collections`"
        class="flex min-h-[72px] flex-1 flex-col items-center justify-center gap-1 rounded-xl bg-[#d21c22] px-3 py-2 text-sm font-semibold text-white hover:bg-[#b01218]"
      >
        {{ ui.showInCollections }}
        <span class="rounded bg-white/20 px-2 py-0.5 text-xs">{{ collectionCount }}</span>
      </router-link>
      <button
        v-if="token"
        class="flex items-center justify-center rounded-xl bg-[#d21c22] px-3 py-2 text-sm font-semibold text-white hover:bg-[#b01218]"
        @click="isCollectionModalOpen = true"
      >
        {{ ui.addToCollection }}
        <span class="iconify mdi--bookmark-add ml-2 h-5 w-5"></span>
      </button>

      <div v-if="token" class="flex flex-1 flex-wrap gap-2">
        <select
          class="flex-1 rounded-xl border border-white/10 bg-[#1f2022] px-3 py-2 text-sm text-gray-200"
          :disabled="listEventDisabled"
          :value="userList"
          @change="onListChange"
        >
          <option v-for="item in lists" :key="item.list" :value="item.list">
            {{ item.name }}
          </option>
        </select>
        <button
          class="rounded-xl border border-[#d21c22] px-3 py-2 text-sm text-[#d21c22] hover:bg-[#d21c22] hover:text-white"
          :disabled="favButtonDisabled"
          @click="toggleFavorite"
        >
          <span
            :class="`iconify h-6 w-6 ${isFavorite ? 'mdi--heart' : 'mdi--heart-outline'}`"
          ></span>
        </button>
      </div>
      <div v-else class="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2a2d2f] px-2 py-2 text-gray-300">
        <span class="iconify material-symbols--info-outline h-5 w-5"></span>
        <p>{{ ui.signInHint }}</p>
      </div>
    </div>
    <AddReleaseToCollectionModal
      v-if="token"
      :is-open="isCollectionModalOpen"
      :release-id="releaseId"
      :token="token"
      :profile-id="profileId"
      @close="isCollectionModalOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { ENDPOINTS } from "@/api/config";
import { tryCatchAPI } from "@/api/utils";
import { toast } from "@/store/toast";
import AddReleaseToCollectionModal from "@/components/ReleaseInfo/ReleaseInfoUserListModal.vue";

const props = defineProps<{
  userList: number;
  isFavorite: boolean;
  releaseId: number;
  token: string | null;
  profileId: number | null;
  collectionCount: number;
}>();

const emit = defineEmits<{
  (e: "update:userList", value: number): void;
  (e: "update:isFavorite", value: boolean): void;
}>();

const ui = {
  quickActions: "\u0411\u044b\u0441\u0442\u0440\u044b\u0435 \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u044f",
  allCollections: "\u0412\u0441\u0435 \u043a\u043e\u043b\u043b\u0435\u043a\u0446\u0438\u0438",
  showInCollections: "\u041f\u043e\u043a\u0430\u0437\u0430\u0442\u044c \u0432 \u043a\u043e\u043b\u043b\u0435\u043a\u0446\u0438\u044f\u0445",
  addToCollection: "\u0412 \u043a\u043e\u043b\u043b\u0435\u043a\u0446\u0438\u044e",
  signInHint:
    "\u0412\u043e\u0439\u0434\u0438\u0442\u0435, \u0447\u0442\u043e\u0431\u044b \u0434\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u0432 \u0441\u043f\u0438\u0441\u043e\u043a, \u0438\u0437\u0431\u0440\u0430\u043d\u043d\u043e\u0435 \u0438\u043b\u0438 \u043a\u043e\u043b\u043b\u0435\u043a\u0446\u0438\u044e",
  lists: {
    notWatching: "\u041d\u0435 \u0441\u043c\u043e\u0442\u0440\u044e",
    watching: "\u0421\u043c\u043e\u0442\u0440\u044e",
    planned: "\u0412 \u043f\u043b\u0430\u043d\u0430\u0445",
    completed: "\u041f\u0440\u043e\u0441\u043c\u043e\u0442\u0440\u0435\u043d\u043e",
    onHold: "\u041e\u0442\u043b\u043e\u0436\u0435\u043d\u043e",
    dropped: "\u0411\u0440\u043e\u0448\u0435\u043d\u043e",
  },
  toast: {
    removingFavorite: "\u0423\u0434\u0430\u043b\u044f\u0435\u043c \u0438\u0437 \u0438\u0437\u0431\u0440\u0430\u043d\u043d\u043e\u0433\u043e...",
    addingFavorite: "\u0414\u043e\u0431\u0430\u0432\u043b\u044f\u0435\u043c \u0432 \u0438\u0437\u0431\u0440\u0430\u043d\u043d\u043e\u0435...",
    removeFavoriteFailed:
      "\u041e\u0448\u0438\u0431\u043a\u0430 \u0443\u0434\u0430\u043b\u0435\u043d\u0438\u044f \u0438\u0437 \u0438\u0437\u0431\u0440\u0430\u043d\u043d\u043e\u0433\u043e",
    addFavoriteFailed:
      "\u041e\u0448\u0438\u0431\u043a\u0430 \u0434\u043e\u0431\u0430\u0432\u043b\u0435\u043d\u0438\u044f \u0432 \u0438\u0437\u0431\u0440\u0430\u043d\u043d\u043e\u0435",
    removedFavorite: "\u0423\u0434\u0430\u043b\u0435\u043d\u043e \u0438\u0437 \u0438\u0437\u0431\u0440\u0430\u043d\u043d\u043e\u0433\u043e",
    addedFavorite: "\u0414\u043e\u0431\u0430\u0432\u043b\u0435\u043d\u043e \u0432 \u0438\u0437\u0431\u0440\u0430\u043d\u043d\u043e\u0435",
    updatingList: "\u0414\u043e\u0431\u0430\u0432\u043b\u044f\u0435\u043c \u0432 \u0441\u043f\u0438\u0441\u043e\u043a...",
    listWord: "\u0441\u043f\u0438\u0441\u043e\u043a",
    updateListFailedPrefix:
      "\u041e\u0448\u0438\u0431\u043a\u0430 \u0434\u043e\u0431\u0430\u0432\u043b\u0435\u043d\u0438\u044f \u0432 \u0441\u043f\u0438\u0441\u043e\u043a",
    updateListSuccessPrefix: "\u0414\u043e\u0431\u0430\u0432\u043b\u0435\u043d\u043e \u0432 \u0441\u043f\u0438\u0441\u043e\u043a",
  },
};

const lists = [
  { list: 0, name: ui.lists.notWatching },
  { list: 1, name: ui.lists.watching },
  { list: 2, name: ui.lists.planned },
  { list: 3, name: ui.lists.completed },
  { list: 4, name: ui.lists.onHold },
  { list: 5, name: ui.lists.dropped },
];

const favButtonDisabled = ref(false);
const listEventDisabled = ref(false);
const isCollectionModalOpen = ref(false);

async function toggleFavorite() {
  if (!props.token) return;
  favButtonDisabled.value = true;
  const tid = toast.loading(
    props.isFavorite ? ui.toast.removingFavorite : ui.toast.addingFavorite
  );

  let url = `${ENDPOINTS.user.favorite}/add/${props.releaseId}?token=${props.token}`;
  if (props.isFavorite) {
    url = `${ENDPOINTS.user.favorite}/delete/${props.releaseId}?token=${props.token}`;
  }

  const { error } = await tryCatchAPI(fetch(url));
  if (error) {
    toast.update(tid, {
      render: props.isFavorite
        ? ui.toast.removeFavoriteFailed
        : ui.toast.addFavoriteFailed,
      type: "error",
      autoClose: 2500,
      isLoading: false,
    });
    favButtonDisabled.value = false;
    return;
  }

  toast.update(tid, {
    render: props.isFavorite ? ui.toast.removedFavorite : ui.toast.addedFavorite,
    type: "success",
    autoClose: 2500,
    isLoading: false,
  });
  emit("update:isFavorite", !props.isFavorite);
  favButtonDisabled.value = false;
}

async function onListChange(event: Event) {
  if (!props.token) return;
  const list = Number((event.target as HTMLSelectElement).value);
  listEventDisabled.value = true;
  const tid = toast.loading(ui.toast.updatingList);
  const { error } = await tryCatchAPI(
    fetch(`${ENDPOINTS.user.bookmark}/add/${list}/${props.releaseId}?token=${props.token}`)
  );
  if (error) {
    const label = lists[list]?.name ?? ui.toast.listWord;
    toast.update(tid, {
      render: `${ui.toast.updateListFailedPrefix}: ${label}`,
      type: "error",
      autoClose: 2500,
      isLoading: false,
    });
    listEventDisabled.value = false;
    return;
  }
  const label = lists[list]?.name ?? ui.toast.listWord;
  toast.update(tid, {
    render: `${ui.toast.updateListSuccessPrefix}: ${label}`,
    type: "success",
    autoClose: 2500,
    isLoading: false,
  });
  emit("update:userList", list);
  listEventDisabled.value = false;
}
</script>
