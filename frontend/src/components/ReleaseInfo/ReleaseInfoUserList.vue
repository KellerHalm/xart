<template>
  <div class="rounded-xl border border-white/5 bg-[#222426] p-4 shadow">
    <div class="flex flex-wrap gap-2">
      <router-link
        :to="`/release/${releaseId}/collections`"
        class="flex-1 rounded-lg bg-[#e04545] px-3 py-2 text-center text-sm text-white"
      >
        Показать в коллекциях
        <span class="ml-2 rounded bg-white/20 px-2 py-0.5 text-xs">{{ collectionCount }}</span>
      </router-link>
      <button
        v-if="token"
        class="flex items-center justify-center rounded-lg bg-[#e04545] px-3 py-2 text-sm text-white"
        @click="isCollectionModalOpen = true"
      >
        В коллекцию
        <span class="iconify mdi--bookmark-add ml-2 h-5 w-5"></span>
      </button>

      <div v-if="token" class="flex flex-1 flex-wrap gap-2">
        <select
          class="flex-1 rounded-lg border border-white/10 bg-[#1f2022] px-3 py-2 text-sm text-gray-200"
          :disabled="listEventDisabled"
          :value="userList"
          @change="onListChange"
        >
          <option v-for="item in lists" :key="item.list" :value="item.list">
            {{ item.name }}
          </option>
        </select>
        <button
          class="rounded-lg border border-[#e04545] px-3 py-2 text-sm text-[#e04545] hover:bg-[#e04545] hover:text-white"
          :disabled="favButtonDisabled"
          @click="toggleFavorite"
        >
          <span
            :class="`iconify h-6 w-6 ${isFavorite ? 'mdi--heart' : 'mdi--heart-outline'}`"
          ></span>
        </button>
      </div>
      <div v-else class="flex w-full items-center justify-center gap-2 rounded-lg bg-[#2a2d2f] px-2 py-2 text-gray-300">
        <span class="iconify material-symbols--info-outline h-5 w-5"></span>
        <p>Войдите, чтобы добавить в список, избранное или коллекцию</p>
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

const lists = [
  { list: 0, name: "Не смотрю" },
  { list: 1, name: "Смотрю" },
  { list: 2, name: "В планах" },
  { list: 3, name: "Просмотрено" },
  { list: 4, name: "Отложено" },
  { list: 5, name: "Брошено" },
];

const favButtonDisabled = ref(false);
const listEventDisabled = ref(false);
const isCollectionModalOpen = ref(false);

async function toggleFavorite() {
  if (!props.token) return;
  favButtonDisabled.value = true;
  const tid = toast.loading(props.isFavorite ? "Удаляем из избранного..." : "Добавляем в избранное...");

  let url = `${ENDPOINTS.user.favorite}/add/${props.releaseId}?token=${props.token}`;
  if (props.isFavorite) {
    url = `${ENDPOINTS.user.favorite}/delete/${props.releaseId}?token=${props.token}`;
  }

  const { error } = await tryCatchAPI(fetch(url));
  if (error) {
    toast.update(tid, {
      render: props.isFavorite ? "Ошибка удаления из избранного" : "Ошибка добавления в избранное",
      type: "error",
      autoClose: 2500,
      isLoading: false,
    });
    favButtonDisabled.value = false;
    return;
  }

  toast.update(tid, {
    render: props.isFavorite ? "Удалено из избранного" : "Добавлено в избранное",
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
  const tid = toast.loading(`Добавляем в список...`);
  const { error } = await tryCatchAPI(
    fetch(`${ENDPOINTS.user.bookmark}/add/${list}/${props.releaseId}?token=${props.token}`)
  );
  if (error) {
    const label = lists[list]?.name ?? "список";
    toast.update(tid, {
      render: `Ошибка добавления в список: ${label}`,
      type: "error",
      autoClose: 2500,
      isLoading: false,
    });
    listEventDisabled.value = false;
    return;
  }
  const label = lists[list]?.name ?? "список";
  toast.update(tid, {
    render: `Добавлено в список: ${label}`,
    type: "success",
    autoClose: 2500,
    isLoading: false,
  });
  emit("update:userList", list);
  listEventDisabled.value = false;
}
</script>
