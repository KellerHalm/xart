<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
    <div class="w-full max-w-3xl rounded-xl border border-white/10 bg-[#1f2123] p-6 shadow-xl">
      <div class="flex items-center justify-between border-b border-white/10 pb-4">
        <h2 class="section-title text-xl">Список изменений v{{ version }}</h2>
        <button class="text-gray-400 hover:text-white" @click="emit('close')">
          ✕
        </button>
      </div>

      <div class="mt-4 space-y-6 max-h-[70vh] overflow-y-auto pr-2">
        <div class="markdown" v-html="currentHtml"></div>
        <details
          v-for="ver in previousVersions"
          :key="ver"
          class="rounded-lg border border-white/10"
          @toggle="fetchPrevious(ver)"
        >
          <summary class="cursor-pointer px-4 py-2 font-semibold text-gray-200">
            Список изменений v{{ ver }}
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
import { computed, ref, watch } from "vue";
import MarkdownIt from "markdown-it";
import { tryCatch } from "@/api/utils";

const props = defineProps<{
  isOpen: boolean;
  version: string;
  previousVersions: string[];
}>();

const emit = defineEmits<{ (e: "close"): void }>();

const md = new MarkdownIt();
const currentContent = ref("");
const previousContent = ref<Record<string, string>>({});

const currentHtml = computed(() => md.render(currentContent.value || ""));
const previousHtml = computed(() => {
  const out: Record<string, string> = {};
  Object.entries(previousContent.value).forEach(([key, value]) => {
    out[key] = md.render(value);
  });
  return out;
});

async function fetchVersion(version: string) {
  const { data, error } = await tryCatch(fetch(`/changelog/${version}.md`));
  if (error) {
    return "Нет списка изменений";
  }
  return await data.text();
}

async function fetchPrevious(version: string) {
  if (previousContent.value[version]) return;
  const text = await fetchVersion(version);
  previousContent.value = { ...previousContent.value, [version]: text };
}

watch(
  () => props.version,
  async (value) => {
    if (!value) return;
    currentContent.value = "Загрузка ...";
    currentContent.value = await fetchVersion(value);
  },
  { immediate: true }
);

</script>
