<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
    <div class="w-full max-w-3xl rounded-xl border border-white/10 bg-[#1f2123] shadow-xl">
      <div class="flex items-center justify-between border-b border-white/10 px-6 py-4 dark:border-white/10">
        <h2 class="section-title text-xl">Соц. сети</h2>
        <button class="text-gray-400 hover:text-white" @click="emit('close')">
          &times;</button>
      </div>
      <div class="p-6">
                <p class="rounded-md border border-white/10 p-3 text-sm text-gray-300">
          Укажите ссылки на свои социальные сети, чтобы другие пользователи могли с вами связаться
        </p>
        <div v-if="loading" class="flex items-center justify-center py-8">
          <Spinner />
        </div>
        <div v-else class="mt-4 flex flex-col gap-4">
          <label class="flex flex-col gap-2">
            <span class="text-sm font-semibold">ВКонтакте</span>
            <input
              class="input-dark rounded-lg px-3 py-2 text-sm"
              name="vkPage"
              :value="addUrl(socials.vkPage, 'vk')"
              placeholder="Ссылка или никнейм"
              @input="handleInput"
            />
          </label>
          <label class="flex flex-col gap-2">
            <span class="text-sm font-semibold">Telegram</span>
            <input
              class="input-dark rounded-lg px-3 py-2 text-sm"
              name="tgPage"
              :value="addUrl(socials.tgPage, 'tg')"
              placeholder="Ссылка или никнейм"
              @input="handleInput"
            />
          </label>
          <label class="flex flex-col gap-2">
            <span class="text-sm font-semibold">Discord</span>
            <input
              class="input-dark rounded-lg px-3 py-2 text-sm"
              name="discordPage"
              :value="socials.discordPage"
              placeholder="Никнейм"
              @input="handleInput"
            />
          </label>
          <label class="flex flex-col gap-2">
            <span class="text-sm font-semibold">Instagram</span>
            <input
              class="input-dark rounded-lg px-3 py-2 text-sm"
              name="instPage"
              :value="addUrl(socials.instPage, 'inst')"
              placeholder="Ссылка или никнейм"
              @input="handleInput"
            />
          </label>
          <label class="flex flex-col gap-2">
            <span class="text-sm font-semibold">TikTok</span>
            <input
              class="input-dark rounded-lg px-3 py-2 text-sm"
              name="ttPage"
              :value="addUrl(socials.ttPage, 'tt')"
              placeholder="Ссылка или никнейм"
              @input="handleInput"
            />
          </label>
        </div>
      </div>
      <div class="flex items-center justify-end gap-2 border-t border-white/10 px-6 py-4">
        <button
          class="btn-accent rounded-lg px-4 py-2 text-sm font-semibold"
          :disabled="updating"
          @click="save"
        >
          Сохранить
        </button>
        <button
          class="btn-outline rounded-lg border-[#d21c22] px-4 py-2 text-sm font-semibold text-[#d21c22] hover:bg-[#d21c22]/10"
          :disabled="updating"
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
import { tryCatchAPI } from "@/api/utils";
import { toast } from "@/store/toast";
import Spinner from "@/components/Spinner.vue";

const props = defineProps<{
  isOpen: boolean;
  token: string;
  profileId: number;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "refresh"): void;
}>();

const loading = ref(false);
const updating = ref(false);
const socials = ref({
  vkPage: "",
  tgPage: "",
  discordPage: "",
  instPage: "",
  ttPage: "",
});

function addUrl(username: string, social: string) {
  if (!username) return "";
  if (username.startsWith("h")) return username;
  switch (social) {
    case "vk":
      return `https://vk.com/${username}`;
    case "tg":
      return `https://t.me/${username}`;
    case "inst":
      return `https://instagram.com/${username}`;
    case "tt":
      return `https://tiktok.com/@${username}`;
    default:
      return username;
  }
}

function removeUrl(link: string) {
  if (link.startsWith("https://")) {
    const split = link.split("/");
    return split[split.length - 1];
  }
  return link;
}

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement;
  socials.value = { ...socials.value, [target.name]: target.value };
}

async function fetchSettings() {
  if (!props.token) return;
  loading.value = true;
  const { data, error } = await tryCatchAPI(
    fetch(`${ENDPOINTS.user.settings.socials.info}?token=${props.token}`)
  );
  if (error) {
    toast.error("Ошибка получения соц. сетей", { autoClose: 2500 });
    loading.value = false;
    emit("close");
    return;
  }
  socials.value = {
    vkPage: data.vk_page,
    tgPage: data.tg_page,
    discordPage: data.discord_page,
    instPage: data.inst_page,
    ttPage: data.tt_page,
  };
  loading.value = false;
}

async function save() {
  updating.value = true;
  const tid = toast.loading("Обновление соц. сетей...");
  const body = {
    vkPage: removeUrl(socials.value.vkPage),
    tgPage: removeUrl(socials.value.tgPage),
    discordPage: removeUrl(socials.value.discordPage),
    instPage: removeUrl(socials.value.instPage),
    ttPage: removeUrl(socials.value.ttPage),
  };

  const { error } = await tryCatchAPI(
    fetch(`${ENDPOINTS.user.settings.socials.edit}?token=${props.token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
  );

  if (error) {
    toast.update(tid, {
      render: "Соц. сети обновлены",
      type: "error",
      autoClose: 2500,
      isLoading: false,
    });
    updating.value = false;
    return;
  }

  toast.update(tid, {
    render: "Соц. сети обновлены",
    type: "success",
    autoClose: 2500,
    isLoading: false,
  });

  emit("refresh");
  updating.value = false;
  emit("close");
}

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      fetchSettings();
    }
  }
);

onMounted(() => {
  if (props.isOpen) {
    fetchSettings();
  }
});
</script>




