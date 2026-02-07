<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
    <div class="w-full max-w-3xl rounded-xl border border-white/10 bg-[#1f2123] shadow-xl">
      <div class="flex items-center justify-between border-b border-white/10 px-6 py-4 dark:border-white/10">
        <h2 class="section-title text-xl">Изменить никнейм</h2>
        <button class="text-gray-400 hover:text-white" @click="emit('close')">
          &times;</button>
      </div>
      <div class="p-6">
        <div v-if="loading" class="flex items-center justify-center py-8">
          <Spinner />
        </div>
        <div v-else>
                    <div v-if="!loginData.is_change_available" class="space-y-2">
            <p>Вы недавно изменили никнейм</p>
            <p>
              Следующее изменение будет доступно:
              <span class="font-bold">{{ unixToDate(loginData.next_change_available_at, "full") }}</span>
            </p>
          </div>
          <div v-else>
            <textarea
              class="input-dark w-full rounded-lg p-3 text-sm"
              rows="1"
              maxlength="20"
              v-model="draft"
              :disabled="sending"
            ></textarea>
            <p class="mt-2 text-right text-sm text-gray-500 dark:text-gray-300">
              {{ draft.length }}/20
            </p>
          </div>
        </div>
      </div>
      <div class="flex items-center justify-end gap-2 border-t border-white/10 px-6 py-4">
        <button
          v-if="loginData.is_change_available"
          class="btn-accent rounded-lg px-4 py-2 text-sm font-semibold"
          :disabled="sending || loading"
          @click="save"
        >
          Сохранить
        </button>
        <button
          class="btn-outline rounded-lg border-[#d21c22] px-4 py-2 text-sm font-semibold text-[#d21c22] hover:bg-[#d21c22]/10"
          :disabled="sending || loading"
          @click="emit('close')"
        >
          Отмена
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { ENDPOINTS } from "@/api/config";
import { tryCatchAPI, unixToDate } from "@/api/utils";
import { toast } from "@/store/toast";
import Spinner from "@/components/Spinner.vue";
import { useUserStore } from "@/store/auth";

const props = defineProps<{
  isOpen: boolean;
  token: string;
  profileId: number;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "update", value: string): void;
  (e: "refresh"): void;
}>();

const loading = ref(false);
const sending = ref(false);
const draft = ref("");
const loginData = ref({
  code: 0,
  avatar: "",
  login: "",
  is_change_available: false,
  last_change_at: 0,
  next_change_available_at: 0,
});
const userStore = useUserStore();

async function fetchLogin() {
  loading.value = true;
  const { data, error } = await tryCatchAPI(
    fetch(`${ENDPOINTS.user.settings.login.info}?token=${props.token}`)
  );
  if (error) {
    toast.error("Ошибка получения текущего никнейма", { autoClose: 2500 });
    loading.value = false;
    emit("close");
    return;
  }
  loginData.value = data;
  draft.value = data.login;
  loading.value = false;
}

async function save() {
  if (!draft.value) {
    toast.error("Никнейм не может быть пустым", { autoClose: 2500 });
    return;
  }
  sending.value = true;
  const tid = toast.loading("Обновляем никнейм...");
  const { error } = await tryCatchAPI(
    fetch(
      `${ENDPOINTS.user.settings.login.change}?login=${encodeURIComponent(
        draft.value
      )}&token=${props.token}`
    )
  );
  if (error) {
    const errCode = "code" in error ? error.code : undefined;
    let message = `Ошибка обновления никнейма: ${errCode ?? "unknown"}`;
    if (errCode === 3) {
      message = "Данный никнейм уже существует, попробуйте другой";
    }
    toast.update(tid, {
      render: message,
      type: "error",
      autoClose: 2500,
      isLoading: false,
    });
    sending.value = false;
    return;
  }
  toast.update(tid, {
    render: "Никнейм обновлён",
    type: "success",
    autoClose: 2500,
    isLoading: false,
  });
  emit("update", draft.value);
  emit("refresh");
  userStore.checkAuth();
  sending.value = false;
  emit("close");
}

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      fetchLogin();
    }
  }
);

onMounted(() => {
  if (props.isOpen) {
    fetchLogin();
  }
});
</script>




