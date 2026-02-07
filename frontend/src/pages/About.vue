<template>
  <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
    <div class="md:col-span-2 card-surface rounded-xl p-6">
      <div class="flex flex-col items-center gap-4 md:flex-row">
        <img src="/images/icons/xart.svg" alt="Xart" class="h-32 w-32 rounded-full" />
        <div>
          <h1 class="section-title text-xl">Xart - Неофициальный веб клиент для Anixart</h1>
          <p class="max-w-[900px] text-sm text-gray-300">
            Xart — это неофициальный веб-клиент для Android-приложения Anixart. Он позволяет вам
            получать доступ к своей учетной записи Anixart и управлять ею из веб-браузера компьютера
            или телефона. В клиенте доступна синхронизация с аккаунтом и управление его списками и
            избранным. А самое главное — возможность смотреть все доступные аниме из базы Anixart,
            даже недоступные на территории РФ.
          </p>
        </div>
      </div>
    </div>

    <a
      href="https://t.me/anix_web"
      target="_blank"
      class="card-surface rounded-xl p-6 transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div class="flex items-center gap-4">
        <span class="iconify fa6-brands--telegram h-16 w-16 text-gray-300"></span>
        <div>
          <h2 class="card-title text-lg">Телеграм канал</h2>
          <p class="text-sm text-gray-400">@anix_web</p>
        </div>
      </div>
    </a>

    <a
      href="https://github.com/Radiquum/AniX"
      target="_blank"
      class="card-surface rounded-xl p-6 transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div class="flex items-center gap-4">
        <span class="iconify fa6-brands--github h-16 w-16 text-gray-300"></span>
        <div>
          <h2 class="card-title text-lg">Код на GitHub</h2>
          <p class="text-sm text-gray-400">github.com/Radiquum/AniX</p>
        </div>
      </div>
    </a>

    <div class="md:col-span-2 card-surface rounded-xl p-6">
      <h2 class="section-title text-2xl">Список изменений</h2>
      <div v-if="currentHtml" class="markdown mt-4" v-html="currentHtml"></div>
      <div v-else class="mt-4 text-sm text-gray-500">Загрузка ...</div>

      <div class="mt-6 space-y-2">
        <details v-for="ver in previousVersions" :key="ver" class="rounded-lg border border-white/10">
          <summary class="cursor-pointer px-4 py-2 font-semibold" @click="loadPrevious(ver)">
            v{{ ver }}
          </summary>
          <div class="px-4 pb-4">
            <div v-if="previousHtml[ver]" class="markdown" v-html="previousHtml[ver]"></div>
            <div v-else class="text-sm text-gray-400">Загрузка ...</div>
          </div>
        </details>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import MarkdownIt from "markdown-it";

const md = new MarkdownIt();

const currentHtml = ref("");
const previousVersions = ref<string[]>([]);
const previousHtml = ref<Record<string, string>>({});

async function fetchMarkdown(version: string) {
  const res = await fetch(`/changelog/${version}.md`);
  if (!res.ok) return "Нет списка изменений";
  return await res.text();
}

async function loadPrevious(version: string) {
  if (previousHtml.value[version]) return;
  const text = await fetchMarkdown(version);
  previousHtml.value = { ...previousHtml.value, [version]: md.render(text) };
}

async function loadVersionInfo() {
  const res = await fetch("/api/version");
  if (!res.ok) return;
  const data = await res.json();
  previousVersions.value = data.previous || [];
  if (data.version) {
    const text = await fetchMarkdown(data.version);
    currentHtml.value = md.render(text);
  }
}

onMounted(loadVersionInfo);
</script>
