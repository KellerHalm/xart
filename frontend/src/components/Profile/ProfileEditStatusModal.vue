<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
    <div class="w-full max-w-3xl rounded-xl border border-white/10 bg-[#1f2123] shadow-xl">
      <div class="flex items-center justify-between border-b border-white/10 px-6 py-4 dark:border-white/10">
        <h2 class="section-title text-xl">Изменить статус</h2>
        <button class="text-gray-400 hover:text-white" @click="emit('close')">
          &times;</button>
      </div>
      <div class="p-6">
        <textarea
          class="input-dark w-full rounded-lg p-3 text-sm"
          rows="3"
          maxlength="80"
          :disabled="loading"
          v-model="draft"
        ></textarea>
        <p class="mt-2 text-right text-sm text-gray-500 dark:text-gray-300">
          {{ draft.length }}/80
        </p>
      </div>
      <div class="flex items-center justify-end gap-2 border-t border-white/10 px-6 py-4">
        <button
          class="btn-accent rounded-lg px-4 py-2 text-sm font-semibold"
          :disabled="loading"
          @click="submit"
        >
          Сохранить
        </button>
        <button
          class="btn-outline rounded-lg border-[#d21c22] px-4 py-2 text-sm font-semibold text-[#d21c22] hover:bg-[#d21c22]/10"
          :disabled="loading"
          @click="emit('close')"
        >
          Отмена
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { ENDPOINTS } from "@/api/config";
import { tryCatchAPI } from "@/api/utils";
import { toast } from "@/store/toast";
import { useUserStore } from "@/store/auth";

const props = defineProps<{
  isOpen: boolean;
  token: string;
  status: string;
  profileId: number;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "update", value: string): void;
  (e: "refresh"): void;
}>();

const loading = ref(false);
const draft = ref("");
const userStore = useUserStore();

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      draft.value = props.status || "";
    }
  }
);

async function submit() {
  loading.value = true;
  const tid = toast.loading("Обновление статуса...");

  const { error } = await tryCatchAPI(
    fetch(`${ENDPOINTS.user.settings.status}?token=${props.token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: draft.value }),
    })
  );

  if (error) {
    toast.update(tid, {
      render: "Статус обновлён",
      type: "error",
      autoClose: 2500,
      isLoading: false,
    });
    loading.value = false;
    return;
  }

  toast.update(tid, {
    render: "Статус обновлён",
    type: "success",
    autoClose: 2500,
    isLoading: false,
  });

  emit("update", draft.value);
  emit("refresh");
  userStore.checkAuth();
  loading.value = false;
  emit("close");
}
</script>




