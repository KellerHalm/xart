<template>
  <section>
    <div class="flex min-h-screen flex-col items-center justify-center px-6 py-8">
      <div class="w-full rounded-lg border border-white/10 bg-[#222426] shadow-lg sm:max-w-md">
        <div class="space-y-6 p-6">
          <div class="flex items-center gap-3">
            <img src="/images/icons/xart.svg" alt="Xart" class="h-10 w-10" />
            <h1 class="text-xl font-bold text-gray-900 dark:text-white">
              {{ titleByMode[mode] }}
            </h1>
          </div>

          <div class="grid grid-cols-3 gap-2 rounded-lg border border-white/10 bg-[#1f2022] p-1">
            <button
              type="button"
              class="rounded-md px-2 py-2 text-xs font-medium transition sm:px-3 sm:text-sm"
              :class="mode === 'login' ? 'bg-[#e04545] text-white' : 'text-gray-300 hover:bg-white/5'"
              @click="switchMode('login')"
            >
              Войти
            </button>
            <button
              type="button"
              class="rounded-md px-2 py-2 text-xs font-medium transition sm:px-3 sm:text-sm"
              :class="mode === 'signup' ? 'bg-[#e04545] text-white' : 'text-gray-300 hover:bg-white/5'"
              @click="switchMode('signup')"
            >
              Регистрация
            </button>
            <button
              type="button"
              class="rounded-md px-2 py-2 text-xs font-medium transition sm:px-3 sm:text-sm"
              :class="mode === 'restore' ? 'bg-[#e04545] text-white' : 'text-gray-300 hover:bg-white/5'"
              @click="switchMode('restore')"
            >
              Сброс пароля
            </button>
          </div>

          <form v-if="mode === 'login'" class="space-y-4" @submit.prevent="submitLogin">
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                Логин или эл. почта
              </label>
              <input
                v-model.trim="login"
                type="text"
                class="block w-full rounded-lg border border-white/10 bg-[#1f2022] p-2.5 text-gray-900 dark:text-gray-100 focus:border-[#e04545] focus:ring-[#e04545]"
                placeholder="name@company.com"
                required
              />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                Пароль
              </label>
              <input
                v-model="password"
                type="password"
                class="block w-full rounded-lg border border-white/10 bg-[#1f2022] p-2.5 text-gray-900 dark:text-gray-100 focus:border-[#e04545] focus:ring-[#e04545]"
                placeholder="********"
                required
              />
            </div>
            <button
              type="submit"
              class="w-full rounded-lg bg-[#e04545] px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-[#b91c1c]"
              :disabled="isSending"
            >
              Войти
            </button>
            <button
              type="button"
              class="w-full text-center text-sm text-gray-300 underline decoration-dotted underline-offset-2 hover:text-white"
              :disabled="isSending"
              @click="switchMode('restore')"
            >
              Забыли пароль?
            </button>
          </form>

          <form
            v-else-if="mode === 'signup' && signUpStep === 'create'"
            class="space-y-4"
            @submit.prevent="submitSignUp"
          >
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                E-mail
              </label>
              <input
                v-model.trim="signUpEmail"
                type="email"
                class="block w-full rounded-lg border border-white/10 bg-[#1f2022] p-2.5 text-gray-900 dark:text-gray-100 focus:border-[#e04545] focus:ring-[#e04545]"
                placeholder="name@company.com"
                required
              />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                Логин
              </label>
              <input
                v-model.trim="signUpLogin"
                type="text"
                class="block w-full rounded-lg border border-white/10 bg-[#1f2022] p-2.5 text-gray-900 dark:text-gray-100 focus:border-[#e04545] focus:ring-[#e04545]"
                placeholder="your_login"
                required
              />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                Пароль
              </label>
              <input
                v-model="signUpPassword"
                type="password"
                class="block w-full rounded-lg border border-white/10 bg-[#1f2022] p-2.5 text-gray-900 dark:text-gray-100 focus:border-[#e04545] focus:ring-[#e04545]"
                placeholder="********"
                required
              />
            </div>
            <button
              type="submit"
              class="w-full rounded-lg bg-[#e04545] px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-[#b91c1c]"
              :disabled="isSending"
            >
              Получить код
            </button>
          </form>

          <form
            v-else-if="mode === 'signup'"
            class="space-y-4"
            @submit.prevent="submitSignUpVerify"
          >
            <div class="rounded-lg border border-white/10 bg-[#1f2022] p-3 text-sm text-gray-300">
              <div>
                Код отправлен на:
                <span class="font-semibold text-gray-100">{{ signUpEmail }}</span>
              </div>
              <div v-if="signUpCodeExpiresInMinutes !== null" class="mt-1">
                Код действует примерно {{ signUpCodeExpiresInMinutes }} мин.
              </div>
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                Код подтверждения
              </label>
              <input
                v-model.trim="signUpCode"
                type="text"
                class="block w-full rounded-lg border border-white/10 bg-[#1f2022] p-2.5 text-gray-900 dark:text-gray-100 focus:border-[#e04545] focus:ring-[#e04545]"
                placeholder="123456"
                required
              />
            </div>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                class="w-full rounded-lg border border-white/10 bg-transparent px-5 py-2.5 text-center text-sm font-medium text-gray-200 hover:bg-white/5"
                :disabled="isSending"
                @click="signUpStep = 'create'"
              >
                Назад
              </button>
              <button
                type="submit"
                class="w-full rounded-lg bg-[#e04545] px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-[#b91c1c]"
                :disabled="isSending"
              >
                Подтвердить
              </button>
            </div>
          </form>

          <form
            v-else-if="mode === 'restore' && restoreStep === 'create'"
            class="space-y-4"
            @submit.prevent="submitRestore"
          >
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                Логин или эл. почта
              </label>
              <input
                v-model.trim="restoreLogin"
                type="text"
                class="block w-full rounded-lg border border-white/10 bg-[#1f2022] p-2.5 text-gray-900 dark:text-gray-100 focus:border-[#e04545] focus:ring-[#e04545]"
                placeholder="name@company.com"
                required
              />
            </div>
            <button
              type="submit"
              class="w-full rounded-lg bg-[#e04545] px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-[#b91c1c]"
              :disabled="isSending"
            >
              Получить код
            </button>
          </form>

          <form v-else class="space-y-4" @submit.prevent="submitRestoreVerify">
            <div class="rounded-lg border border-white/10 bg-[#1f2022] p-3 text-sm text-gray-300">
              <div>
                Код отправлен для:
                <span class="font-semibold text-gray-100">{{ restoreLogin }}</span>
              </div>
              <div v-if="restoreCodeExpiresInMinutes !== null" class="mt-1">
                Код действует примерно {{ restoreCodeExpiresInMinutes }} мин.
              </div>
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                Новый пароль
              </label>
              <input
                v-model="restorePassword"
                type="password"
                class="block w-full rounded-lg border border-white/10 bg-[#1f2022] p-2.5 text-gray-900 dark:text-gray-100 focus:border-[#e04545] focus:ring-[#e04545]"
                placeholder="********"
                required
              />
            </div>
            <div>
              <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200">
                Код подтверждения
              </label>
              <input
                v-model.trim="restoreCode"
                type="text"
                class="block w-full rounded-lg border border-white/10 bg-[#1f2022] p-2.5 text-gray-900 dark:text-gray-100 focus:border-[#e04545] focus:ring-[#e04545]"
                placeholder="123456"
                required
              />
            </div>
            <div class="grid grid-cols-2 gap-2">
              <button
                type="button"
                class="w-full rounded-lg border border-white/10 bg-transparent px-5 py-2.5 text-center text-sm font-medium text-gray-200 hover:bg-white/5"
                :disabled="isSending"
                @click="restoreStep = 'create'"
              >
                Назад
              </button>
              <button
                type="submit"
                class="w-full rounded-lg bg-[#e04545] px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-[#b91c1c]"
                :disabled="isSending"
              >
                Сбросить пароль
              </button>
            </div>
          </form>

          <div class="flex items-center gap-2">
            <input v-model="remember" type="checkbox" class="h-4 w-4 rounded border-white/10 bg-[#1f2022]" />
            <span class="text-sm text-gray-700 dark:text-gray-300">Запомнить вход</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watchEffect } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "@/store/auth";
import { setJWT, tryCatchAPI } from "@/api/utils";
import { API_URL, ENDPOINTS } from "@/api/config";
import { toast } from "@/store/toast";

type AuthMode = "login" | "signup" | "restore";
type SignUpStep = "create" | "verify";
type RestoreStep = "create" | "verify";

const AUTH_HEADERS: HeadersInit = {
  Sign: "9aa5c7af74e8cd70c86f7f9587bde23d",
  "Content-Type": "application/x-www-form-urlencoded",
};

const titleByMode: Record<AuthMode, string> = {
  login: "Вход в аккаунт Xart",
  signup: "Регистрация в Xart",
  restore: "Восстановление пароля",
};

const mode = ref<AuthMode>("login");
const signUpStep = ref<SignUpStep>("create");
const restoreStep = ref<RestoreStep>("create");

const login = ref("");
const password = ref("");

const signUpEmail = ref("");
const signUpLogin = ref("");
const signUpPassword = ref("");
const signUpCode = ref("");
const signUpHash = ref("");
const signUpCodeTimestampExpires = ref<number | null>(null);

const restoreLogin = ref("");
const restorePassword = ref("");
const restoreCode = ref("");
const restoreHash = ref("");
const restoreCodeTimestampExpires = ref<number | null>(null);

const remember = ref(true);
const isSending = ref(false);

const userStore = useUserStore();
const router = useRouter();
const route = useRoute();

function minutesLeft(expireTimestamp: number | null): number | null {
  if (expireTimestamp === null) {
    return null;
  }
  const now = Math.floor(Date.now() / 1000);
  const leftSeconds = expireTimestamp - now;
  if (leftSeconds <= 0) {
    return 0;
  }
  return Math.ceil(leftSeconds / 60);
}

const signUpCodeExpiresInMinutes = computed(() => minutesLeft(signUpCodeTimestampExpires.value));
const restoreCodeExpiresInMinutes = computed(() => minutesLeft(restoreCodeTimestampExpires.value));

type AuthRequestError = {
  message: string;
  code: number;
};

type AuthRequestResult = {
  data: any;
  error: AuthRequestError | null;
};

function getErrorCode(error: unknown): number | undefined {
  if (!error || typeof error !== "object" || !("code" in error)) {
    return undefined;
  }
  const code = (error as { code?: unknown }).code;
  return typeof code === "number" ? code : undefined;
}

async function postAuthJson(url: string): Promise<AuthRequestResult> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: AUTH_HEADERS,
    });

    if (!res.ok) {
      return {
        data: null,
        error: {
          message: res.statusText || "HTTP_ERROR",
          code: res.status,
        },
      };
    }

    const text = await res.text();
    if (!text.trim()) {
      return {
        data: null,
        error: {
          message: "EMPTY_RESPONSE",
          code: 204,
        },
      };
    }

    let data: any;
    try {
      data = JSON.parse(text);
    } catch {
      return {
        data: null,
        error: {
          message: "INVALID_JSON",
          code: 500,
        },
      };
    }

    if (typeof data?.code === "number" && data.code !== 0) {
      return {
        data: null,
        error: {
          message: "API_ERROR",
          code: data.code,
        },
      };
    }

    return { data, error: null };
  } catch (error) {
    return {
      data: null,
      error: {
        message: error instanceof Error ? error.message : "NETWORK_ERROR",
        code: 500,
      },
    };
  }
}

async function postAuthWithFallback(proxyUrl: string, directPath: string): Promise<AuthRequestResult> {
  const primary = await postAuthJson(proxyUrl);
  if (!primary.error || primary.error.code !== 204) {
    return primary;
  }

  // Some auth endpoints may return an empty body through proxy/CDN.
  const fallback = await postAuthJson(`${API_URL}${directPath}`);
  if (!fallback.error) {
    return fallback;
  }

  return primary;
}

function extractAuthPayload(data: any): { profile: any; token: string } | null {
  const profile = data?.profile ?? data?.profileToken?.profile;
  const token = data?.profileToken?.token ?? data?.token;

  if (!profile || typeof token !== "string" || token.length === 0) {
    return null;
  }
  return { profile, token };
}

function resetSignUpState() {
  signUpStep.value = "create";
  signUpCode.value = "";
  signUpHash.value = "";
  signUpCodeTimestampExpires.value = null;
}

function resetRestoreState() {
  restoreStep.value = "create";
  restorePassword.value = "";
  restoreCode.value = "";
  restoreHash.value = "";
  restoreCodeTimestampExpires.value = null;
}

function switchMode(nextMode: AuthMode) {
  mode.value = nextMode;
  isSending.value = false;
  if (nextMode !== "signup") {
    resetSignUpState();
  } else {
    signUpStep.value = "create";
  }
  if (nextMode !== "restore") {
    resetRestoreState();
  } else {
    restoreStep.value = "create";
  }
}

async function submitLogin() {
  if (isSending.value) return;
  isSending.value = true;
  const tid = toast.loading("Выполняем вход...");

  const { data, error } = await tryCatchAPI(
    fetch(
      `${ENDPOINTS.user.auth}?login=${encodeURIComponent(login.value)}&password=${encodeURIComponent(password.value)}`,
      {
        method: "POST",
        headers: AUTH_HEADERS,
      }
    )
  );

  if (error) {
    const errCode = getErrorCode(error);
    let message = `Ошибка входа, code: ${errCode ?? "unknown"}`;
    if (errCode === 2) message = "Пользователь не найден";
    if (errCode === 3) message = "Неправильный логин или пароль";
    toast.update(tid, {
      render: message,
      type: "error",
      autoClose: 2500,
      isLoading: false,
    });
    isSending.value = false;
    return;
  }

  const authPayload = extractAuthPayload(data);
  if (!authPayload) {
    toast.update(tid, {
      render: "Не удалось получить токен авторизации",
      type: "error",
      autoClose: 2500,
      isLoading: false,
    });
    isSending.value = false;
    return;
  }

  userStore.login(authPayload.profile, authPayload.token);
  if (remember.value) {
    setJWT(authPayload.profile.id, authPayload.token);
  }

  toast.update(tid, {
    render: "Вход успешен",
    type: "success",
    autoClose: 2500,
    isLoading: false,
  });
  isSending.value = false;
}

async function submitSignUp() {
  if (isSending.value) return;
  isSending.value = true;
  const tid = toast.loading("Создаем аккаунт...");

  const { data, error } = await tryCatchAPI(
    fetch(
      `${ENDPOINTS.user.signUp}?email=${encodeURIComponent(signUpEmail.value)}&login=${encodeURIComponent(signUpLogin.value)}&password=${encodeURIComponent(signUpPassword.value)}`,
      {
        method: "POST",
        headers: AUTH_HEADERS,
      }
    )
  );

  if (error) {
    const errCode = getErrorCode(error);
    let message = `Ошибка регистрации, code: ${errCode ?? "unknown"}`;
    if (errCode === 2) message = "Пользователь с таким email или логином уже существует";
    toast.update(tid, {
      render: message,
      type: "error",
      autoClose: 3000,
      isLoading: false,
    });
    isSending.value = false;
    return;
  }

  if (!data?.hash) {
    toast.update(tid, {
      render: "Не удалось получить hash подтверждения",
      type: "error",
      autoClose: 3000,
      isLoading: false,
    });
    isSending.value = false;
    return;
  }

  signUpHash.value = String(data.hash);
  signUpCodeTimestampExpires.value =
    typeof data.codeTimestampExpires === "number" ? data.codeTimestampExpires : null;
  signUpCode.value = "";
  signUpStep.value = "verify";

  toast.update(tid, {
    render: "Код подтверждения отправлен",
    type: "success",
    autoClose: 2500,
    isLoading: false,
  });
  isSending.value = false;
}

async function submitSignUpVerify() {
  if (isSending.value) return;
  if (!signUpHash.value) {
    toast.error("Сначала запросите код подтверждения", { autoClose: 2500 });
    signUpStep.value = "create";
    return;
  }

  isSending.value = true;
  const tid = toast.loading("Подтверждаем регистрацию...");

  const { data, error } = await tryCatchAPI(
    fetch(
      `${ENDPOINTS.user.signUpVerify}?email=${encodeURIComponent(signUpEmail.value)}&login=${encodeURIComponent(signUpLogin.value)}&password=${encodeURIComponent(signUpPassword.value)}&hash=${encodeURIComponent(signUpHash.value)}&code=${encodeURIComponent(signUpCode.value)}`,
      {
        method: "POST",
        headers: AUTH_HEADERS,
      }
    )
  );

  if (error) {
    const errCode = getErrorCode(error);
    let message = `Ошибка подтверждения, code: ${errCode ?? "unknown"}`;
    if (errCode === 2) message = "Неверный код подтверждения";
    if (errCode === 3) message = "Срок действия кода истек";
    toast.update(tid, {
      render: message,
      type: "error",
      autoClose: 3000,
      isLoading: false,
    });
    isSending.value = false;
    return;
  }

  const authPayload = extractAuthPayload(data);
  if (!authPayload) {
    toast.update(tid, {
      render: "Регистрация подтверждена, но токен не получен",
      type: "error",
      autoClose: 3000,
      isLoading: false,
    });
    isSending.value = false;
    return;
  }

  userStore.login(authPayload.profile, authPayload.token);
  if (remember.value) {
    setJWT(authPayload.profile.id, authPayload.token);
  }

  toast.update(tid, {
    render: "Аккаунт успешно создан",
    type: "success",
    autoClose: 2500,
    isLoading: false,
  });
  isSending.value = false;
}

async function submitRestore() {
  if (isSending.value) return;
  isSending.value = true;
  const tid = toast.loading("Запрашиваем код сброса...");

  const encodedLogin = encodeURIComponent(restoreLogin.value);
  const directPath = `/auth/restore?login=${encodedLogin}`;
  const { data, error } = await postAuthWithFallback(
    `${ENDPOINTS.user.restore}?login=${encodedLogin}`,
    directPath
  );

  if (error) {
    const errCode = getErrorCode(error);
    if (errCode === 204) {
      restoreHash.value = "";
      restoreCodeTimestampExpires.value = null;
      restorePassword.value = "";
      restoreCode.value = "";
      restoreStep.value = "verify";
      toast.update(tid, {
        render: "Если аккаунт существует, код отправлен. Введите код и новый пароль.",
        type: "success",
        autoClose: 3000,
        isLoading: false,
      });
      isSending.value = false;
      return;
    }

    let message = `Ошибка сброса пароля, code: ${errCode ?? "unknown"}`;
    if (errCode === 2) message = "Пользователь не найден";
    toast.update(tid, {
      render: message,
      type: "error",
      autoClose: 3000,
      isLoading: false,
    });
    isSending.value = false;
    return;
  }

  if (!data?.hash) {
    toast.update(tid, {
      render: "Не удалось получить hash подтверждения",
      type: "error",
      autoClose: 3000,
      isLoading: false,
    });
    isSending.value = false;
    return;
  }

  restoreHash.value = String(data.hash);
  restoreCodeTimestampExpires.value =
    typeof data.codeTimestampExpires === "number" ? data.codeTimestampExpires : null;
  restorePassword.value = "";
  restoreCode.value = "";
  restoreStep.value = "verify";

  toast.update(tid, {
    render: "Код сброса отправлен",
    type: "success",
    autoClose: 2500,
    isLoading: false,
  });
  isSending.value = false;
}

async function submitRestoreVerify() {
  if (isSending.value) return;

  isSending.value = true;
  const tid = toast.loading("Подтверждаем сброс пароля...");

  const encodedLogin = encodeURIComponent(restoreLogin.value);
  const encodedPassword = encodeURIComponent(restorePassword.value);
  const encodedCode = encodeURIComponent(restoreCode.value);
  const encodedHash = restoreHash.value ? encodeURIComponent(restoreHash.value) : "";
  const hashPart = encodedHash ? `&hash=${encodedHash}` : "";
  const directPath =
    `/auth/restore/verify?login=${encodedLogin}` +
    `&password=${encodedPassword}` +
    `&code=${encodedCode}` +
    hashPart;
  const { data, error } = await postAuthWithFallback(
    `${ENDPOINTS.user.restoreVerify}?login=${encodedLogin}&password=${encodedPassword}&code=${encodedCode}${hashPart}`,
    directPath
  );

  if (error) {
    const errCode = getErrorCode(error);
    if (errCode === 204) {
      toast.update(tid, {
        render: "Пароль обновлен. Выполните вход с новым паролем.",
        type: "success",
        autoClose: 3000,
        isLoading: false,
      });
      switchMode("login");
      login.value = restoreLogin.value;
      password.value = "";
      isSending.value = false;
      return;
    }

    let message = `Ошибка подтверждения, code: ${errCode ?? "unknown"}`;
    if (errCode === 2) message = "Неверный код подтверждения";
    if (errCode === 3) message = "Срок действия кода истек";
    toast.update(tid, {
      render: message,
      type: "error",
      autoClose: 3000,
      isLoading: false,
    });
    isSending.value = false;
    return;
  }

  const authPayload = extractAuthPayload(data);
  if (!authPayload) {
    toast.update(tid, {
      render: "Пароль обновлен. Выполните вход с новым паролем.",
      type: "success",
      autoClose: 3000,
      isLoading: false,
    });
    switchMode("login");
    login.value = restoreLogin.value;
    password.value = "";
    isSending.value = false;
    return;
  }

  userStore.login(authPayload.profile, authPayload.token);
  if (remember.value) {
    setJWT(authPayload.profile.id, authPayload.token);
  }

  toast.update(tid, {
    render: "Пароль успешно обновлен",
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
