<template>
  <div class="card-surface rounded-xl p-4">
    <button
      class="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold"
      :class="isFavorite ? 'btn-outline border-[#d21c22] text-[#d21c22] hover:bg-[#d21c22]/10' : 'btn-accent'"
      :disabled="isUpdating"
      @click="toggleFavorite"
    >
      <span class="iconify" :class="isFavorite ? 'mdi--heart' : 'mdi--heart-outline'"></span>
      {{ !isFavorite ? "Добавить в избранное" : "Убрать из избранного" }}
    </button>

    <p v-if="isPrivate" class="mt-3 text-sm text-gray-400">
      Это приватная коллекция, доступ к ней имеете только вы
    </p>

    <div v-if="isAuthor" class="mt-3 flex flex-wrap gap-2">
      <button
        class="btn-outline flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold sm:max-w-64"
        :disabled="isUpdating"
        @click="editCollection"
      >
        <span class="iconify mdi--pencil"></span>
        Редактировать
      </button>
      <button
        class="btn-outline flex w-full items-center justify-center gap-2 rounded-lg border-[#d21c22] px-4 py-2 text-sm font-semibold text-[#d21c22] hover:bg-[#d21c22]/10 sm:max-w-64"
        :disabled="isUpdating"
        @click="deleteCollection"
      >
        <span class="iconify mdi--trash"></span>
        Удалить
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { ENDPOINTS } from "@/api/config";
import { tryCatchAPI } from "@/api/utils";
import { useUserStore } from "@/store/auth";
import { toast } from "@/store/toast";

const props = defineProps<{
  isFavorite: boolean;
  id: number;
  authorId: number;
  isPrivate: boolean;
}>();

const userStore = useUserStore();
const router = useRouter();
const isUpdating = ref(false);
const isFavorite = ref(props.isFavorite);

const isAuthor = computed(() => userStore.user?.id === props.authorId);

async function toggleFavorite() {
  if (!userStore.token) return;
  isUpdating.value = true;
  const tid = toast.loading(
    isFavorite.value
      ? "Удаляем коллекцию из избранного..."
      : "Добавляем коллекцию в избранное..."
  );

  let url = `${ENDPOINTS.collection.favoriteCollections}/add/${props.id}?token=${userStore.token}`;
  if (isFavorite.value) {
    url = `${ENDPOINTS.collection.favoriteCollections}/delete/${props.id}?token=${userStore.token}`;
  }

  const { error } = await tryCatchAPI(fetch(url));
  if (error) {
    toast.update(tid, {
      render: isFavorite.value
        ? "Ошибка удаления коллекции из избранного"
        : "Ошибка добавления коллекции в избранное",
      type: "error",
      autoClose: 2500,
      isLoading: false,
    });
    isUpdating.value = false;
    return;
  }

  toast.update(tid, {
    render: isFavorite.value
      ? "Коллекция удалена из избранного"
      : "Коллекция добавлена в избранное",
    type: "success",
    autoClose: 2500,
    isLoading: false,
  });
  isFavorite.value = !isFavorite.value;
  isUpdating.value = false;
}

async function deleteCollection() {
  if (!userStore.token) return;
  isUpdating.value = true;
  const tid = toast.loading("Удаляем коллекцию...");
  const url = `${ENDPOINTS.collection.delete}/${props.id}?token=${userStore.token}`;
  const { error } = await tryCatchAPI(fetch(url));
  if (error) {
    toast.update(tid, {
      render: "Ошибка удаления коллекции",
      type: "error",
      autoClose: 2500,
      isLoading: false,
    });
    isUpdating.value = false;
    return;
  }

  toast.update(tid, {
    render: "Коллекция удалена",
    type: "success",
    autoClose: 2500,
    isLoading: false,
  });
  isUpdating.value = false;
  router.push("/collections");
}

function editCollection() {
  router.push(`/collections/create?mode=edit&id=${props.id}`);
}
</script>
