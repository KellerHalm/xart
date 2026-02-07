<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
    <div class="max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-xl border border-white/10 bg-[#1f2123] shadow-xl">
      <div class="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <h2 class="section-title text-xl">Популярное</h2>
        <button class="text-gray-400 hover:text-white" @click="emit('close')">✕</button>
      </div>
      <div class="px-6 py-4">
        <div class="flex flex-wrap gap-2">
          <button
            v-for="item in tabs"
            :key="`popular-tab-${item.id}`"
            class="rounded-lg px-3 py-2 text-sm font-semibold tab-pill"
            :class="tab === item.id ? 'tab-pill tab-pill-active' : 'tab-pill'"
            @click="tab = item.id"
          >
            {{ item.name }}
          </button>
        </div>
        <div class="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          <ReleaseCard v-for="release in content" :key="release.id" :release="release" />
          <div v-if="isLoading" class="col-span-full flex items-center justify-center py-8">
            <Spinner />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { FetchFilter } from "@/api/utils";
import { useUserStore } from "@/store/auth";
import { tabs, type PopularTabId } from "@/components/Discovery/PopularFilters";
import ReleaseCard from "@/components/ReleaseCard.vue";
import Spinner from "@/components/Spinner.vue";

const props = defineProps<{ isOpen: boolean }>();
const emit = defineEmits<{ (e: "close"): void }>();

const userStore = useUserStore();
const tab = ref<PopularTabId>("ongoing");
const content = ref<any[]>([]);
const isLoading = ref(false);

async function loadTab() {
  isLoading.value = true;
  const selected = tabs.find((item) => item.id === tab.value) ?? tabs[0];
  const [data, error] = await FetchFilter(selected.filter, 0, userStore.token);
  if (!error) {
    content.value = data?.content || [];
  } else {
    content.value = [];
  }
  isLoading.value = false;
}

watch(tab, () => {
  loadTab();
});

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      loadTab();
    }
  }
);
</script>




