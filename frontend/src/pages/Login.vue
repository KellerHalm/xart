<template>
  <section>
    <div class="flex min-h-screen flex-col items-center justify-center px-6 py-8">
      <div class="w-full rounded-lg border border-white/10 bg-[#222426] shadow-lg sm:max-w-md">
        <div class="space-y-6 p-6">
          <div class="flex items-center gap-3">
            <img src="/images/icons/xart.svg" alt="Xart" class="h-10 w-10" />
            <h1 class="text-xl font-bold text-white">Вход в аккаунт Xart</h1>
          </div>
          <form class="space-y-4" @submit.prevent="submit">
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-200">
                Логин или эл. почта
              </label>
              <input
                v-model="login"
                type="text"
                class="block w-full rounded-lg border border-white/10 bg-[#1f2022] p-2.5 text-gray-100 focus:border-[#e04545] focus:ring-[#e04545]"
                placeholder="name@company.com"
                required
              />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-200">
                Пароль
              </label>
              <input
                v-model="password"
                type="password"
                class="block w-full rounded-lg border border-white/10 bg-[#1f2022] p-2.5 text-gray-100 focus:border-[#e04545] focus:ring-[#e04545]"
                placeholder="••••••••"
                required
              />
            </div>
            <div class="flex items-center gap-2">
              <input v-model="remember" type="checkbox" class="h-4 w-4 rounded border-white/10 bg-[#1f2022]" />
              <span class="text-sm text-gray-300">Запомнить вход</span>
            </div>
            <button
              type="submit"
              class="w-full rounded-lg bg-[#e04545] px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-[#b91c1c]"
              :disabled="isSending"
            >
              Войти
            </button>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "@/store/auth";
import { setJWT, tryCatchAPI } from "@/api/utils";
import { ENDPOINTS } from "@/api/config";
import { toast } from "@/store/toast";

const login = ref("");
const password = ref("");
const remember = ref(true);
const isSending = ref(false);

const userStore = useUserStore();
const router = useRouter();
const route = useRoute();

async function submit() {
  isSending.value = true;
  const tid = toast.loading("Выполняем вход...");

  const { data, error } = await tryCatchAPI(
    fetch(`${ENDPOINTS.user.auth}?login=${encodeURIComponent(login.value)}&password=${encodeURIComponent(password.value)}`, {
      method: "POST",
      headers: {
        Sign: "9aa5c7af74e8cd70c86f7f9587bde23d",
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
  );

  if (error) {
    const errCode = "code" in error ? error.code : undefined;
    let message = `Ошибка получения пользователя, code: ${errCode ?? "unknown"}`;
    if (errCode == 2) message = "Такого пользователя не существует";
    if (errCode == 3) message = "Неправильно указан логин и/или пароль";
    toast.update(tid, {
      render: message,
      type: "error",
      autoClose: 2500,
      isLoading: false,
    });
    isSending.value = false;
    return;
  }

  if (!data?.profileToken) {
    toast.update(tid, {
      render: "Не удалось войти в аккаунт",
      type: "error",
      autoClose: 2500,
      isLoading: false,
    });
    isSending.value = false;
    return;
  }

  userStore.login(data.profile, data.profileToken.token);
  if (remember.value) {
    setJWT(data.profile.id, data.profileToken.token);
  }

  toast.update(tid, {
    render: "Вход успешен!",
    type: "success",
    autoClose: 2500,
    isLoading: false,
  });
  isSending.value = false;
}

watchEffect(() => {
  if (userStore.user) {
    const redirect = route.query.redirect as string | undefined;
    router.push(redirect || "/");
  }
});
</script>
